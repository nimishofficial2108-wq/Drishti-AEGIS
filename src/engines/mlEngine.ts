import { MLTrainingRow, MLFittedModel, MLCrossValidation, MLState } from '../types/aegis';
import { createRNG, sampleNormal, solveLinearSystem } from './mathUtils';

export const ML_REQUIRED_COLUMNS: (keyof MLTrainingRow)[] = [
  'fill_pp',
  'inventory_days_reduced',
  'recovery_rate',
  'unit_contribution_cr',
  'scheduling_yield_cr',
  'avoided_cost_cr',
  'running_cost_cr',
  'risk_rpn',
  'observed_ebitda_cr'
];

export const ML_FEATURE_NAMES = [
  'Service contribution proxy',
  'Inventory days reduced',
  'Scheduling benefit',
  'Avoided costs',
  'Running costs',
  'Residual FMEA RPN',
  'Fill-rate uplift'
];

/** Extract 7 engineered features from a training/inference row */
export function extractFeatures(r: {
  fill_pp: number;
  inventory_days_reduced: number;
  recovery_rate: number;
  unit_contribution_cr: number;
  scheduling_yield_cr: number;
  avoided_cost_cr: number;
  running_cost_cr: number;
  risk_rpn: number;
}): number[] {
  return [
    (r.fill_pp * r.unit_contribution_cr * r.recovery_rate) / 0.5,
    r.inventory_days_reduced,
    r.scheduling_yield_cr,
    r.avoided_cost_cr,
    r.running_cost_cr,
    r.risk_rpn,
    r.fill_pp
  ];
}

/** Fits multivariate Ridge Regression with standardization on features (not intercept) */
export function fitRidgeRegression(rows: MLTrainingRow[], lambda = 0.75): Omit<MLFittedModel, 'cv' | 'trainedAt' | 'source'> | null {
  if (rows.length < 15) return null;

  const X = rows.map(extractFeatures);
  const y = rows.map(r => r.observed_ebitda_cr);
  const p = X[0].length;
  const N = rows.length;

  // Means and standard deviations
  const means: number[] = Array(p).fill(0).map((_, j) => X.reduce((acc, row) => acc + row[j], 0) / N);
  const scales: number[] = means.map((mean, j) => {
    const variance = X.reduce((acc, row) => acc + (row[j] - mean) ** 2, 0) / Math.max(1, N - 1);
    const sd = Math.sqrt(variance);
    return sd > 1e-8 ? sd : 1;
  });

  // Standardize X, prepend 1 for intercept
  const Z = X.map(row => [1, ...row.map((val, j) => (val - means[j]) / scales[j])]);

  // Construct normal equations: (Z^T * Z + Lambda_diag) * beta = Z^T * y
  const A: number[][] = Array.from({ length: p + 1 }, () => Array(p + 1).fill(0));
  const b: number[] = Array(p + 1).fill(0);

  for (let i = 0; i < N; i++) {
    for (let j = 0; j <= p; j++) {
      b[j] += Z[i][j] * y[i];
      for (let k = 0; k <= p; k++) {
        A[j][k] += Z[i][j] * Z[i][k];
      }
    }
  }

  // Regularize feature coefficients (j >= 1), intercept (j = 0) is unpenalized
  for (let j = 1; j <= p; j++) {
    A[j][j] += lambda;
  }

  const betas = solveLinearSystem(A, b);
  if (!betas) return null;

  return {
    means,
    scales,
    betas,
    lambda
  };
}

/** Predict EBITDA given a fitted model and row inputs */
export function predictWithRidge(
  model: Pick<MLFittedModel, 'means' | 'scales' | 'betas'> | null,
  row: {
    fill_pp: number;
    inventory_days_reduced: number;
    recovery_rate: number;
    unit_contribution_cr: number;
    scheduling_yield_cr: number;
    avoided_cost_cr: number;
    running_cost_cr: number;
    risk_rpn: number;
  }
): number | null {
  if (!model || !model.betas) return null;
  const features = extractFeatures(row);
  let pred = model.betas[0];
  for (let i = 0; i < features.length; i++) {
    const stdX = (features[i] - model.means[i]) / model.scales[i];
    pred += model.betas[i + 1] * stdX;
  }
  return pred;
}

/** 5-fold cross-validation to assess true out-of-sample generalization */
export function crossValidateRidge(rows: MLTrainingRow[], lambda = 0.75, folds = 5): MLCrossValidation | null {
  if (rows.length < folds * 4) return null;

  const actuals: number[] = [];
  const predictions: number[] = [];

  for (let f = 0; f < folds; f++) {
    const train = rows.filter((_, idx) => idx % folds !== f);
    const test = rows.filter((_, idx) => idx % folds === f);

    const fit = fitRidgeRegression(train, lambda);
    if (!fit) return null;

    for (const testRow of test) {
      actuals.push(testRow.observed_ebitda_cr);
      const p = predictWithRidge(fit, testRow);
      if (p === null) return null;
      predictions.push(p);
    }
  }

  const n = actuals.length;
  if (n === 0) return null;

  const meanActual = actuals.reduce((acc, y) => acc + y, 0) / n;
  let absSum = 0;
  let sqSum = 0;
  let totSum = 0;

  for (let i = 0; i < n; i++) {
    const err = actuals[i] - predictions[i];
    absSum += Math.abs(err);
    sqSum += err * err;
    totSum += (actuals[i] - meanActual) ** 2;
  }

  return {
    mae: absSum / n,
    rmse: Math.sqrt(sqSum / n),
    r2: totSum > 1e-6 ? 1 - sqSum / totSum : null
  };
}

/** Generates reproducible synthetic demonstration dataset (240 rows) */
export function generateSyntheticDemoDataset(seed = 2026101703): MLTrainingRow[] {
  const rand = createRNG(seed);
  const rows: MLTrainingRow[] = [];

  for (let i = 0; i < 240; i++) {
    const fill_pp = 3 + rand() * 7;
    const inventory_days_reduced = 3 + rand() * 10;
    const recovery_rate = 0.30 + rand() * 0.36;
    const unit_contribution_cr = 8 + rand() * 5;
    const scheduling_yield_cr = rand() * 18;
    const avoided_cost_cr = 8 + rand() * 27;
    const running_cost_cr = 4 + rand() * 12;
    const risk_rpn = 18 + rand() * 75;

    // Structural relationship + noise
    const serviceEbitda = fill_pp * unit_contribution_cr * (recovery_rate / 0.5);
    const noise = sampleNormal(rand) * 2.8;
    const observed_ebitda_cr =
      serviceEbitda +
      scheduling_yield_cr +
      avoided_cost_cr -
      running_cost_cr -
      0.04 * risk_rpn +
      noise;

    rows.push({
      fill_pp,
      inventory_days_reduced,
      recovery_rate,
      unit_contribution_cr,
      scheduling_yield_cr,
      avoided_cost_cr,
      running_cost_cr,
      risk_rpn,
      observed_ebitda_cr
    });
  }

  return rows;
}

/** Train and evaluate ML model */
export function trainMLModel(mlState: MLState): MLFittedModel | null {
  if (mlState.rows.length < 30) return null;

  const cv = crossValidateRidge(mlState.rows, mlState.lambda);
  const fit = fitRidgeRegression(mlState.rows, mlState.lambda);

  if (!fit || !cv) return null;

  return {
    ...fit,
    cv,
    trainedAt: new Date().toISOString(),
    source: mlState.origin
  };
}

/** Parse and strictly validate uploaded CSV files for ML training */
export function parseMLCSV(rawText: string): MLTrainingRow[] {
  const lines = rawText.replace(/\r/g, '').split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file is empty or missing data rows.');
  }

  const headerLine = lines.shift()!;
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase());

  for (const col of ML_REQUIRED_COLUMNS) {
    if (!headers.includes(col.toLowerCase())) {
      throw new Error(`Missing required column: "${col}". Required headers: ${ML_REQUIRED_COLUMNS.join(', ')}`);
    }
  }

  const colIndices = ML_REQUIRED_COLUMNS.map(col => headers.indexOf(col.toLowerCase()));
  const parsedRows: MLTrainingRow[] = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const parts = lines[lineIdx].split(',').map(p => p.trim());
    if (parts.length < headers.length) continue;

    const rowObj: Partial<MLTrainingRow> = {};
    let hasInvalidNumber = false;

    for (let c = 0; c < ML_REQUIRED_COLUMNS.length; c++) {
      const colName = ML_REQUIRED_COLUMNS[c];
      const valStr = parts[colIndices[c]];
      const valNum = Number(valStr);

      if (!Number.isFinite(valNum)) {
        hasInvalidNumber = true;
        break;
      }
      rowObj[colName] = valNum;
    }

    if (!hasInvalidNumber && rowObj.fill_pp !== undefined) {
      if (
        rowObj.fill_pp >= 0 &&
        rowObj.fill_pp <= 100 &&
        rowObj.recovery_rate! >= 0 &&
        rowObj.recovery_rate! <= 1 &&
        rowObj.inventory_days_reduced! >= 0
      ) {
        parsedRows.push(rowObj as MLTrainingRow);
      }
    }
  }

  if (parsedRows.length < 30) {
    throw new Error(`At least 30 complete numeric records are required to train the model. Successfully parsed ${parsedRows.length} valid rows.`);
  }

  return parsedRows;
}

/** Compute Partial Dependence curve for fill-rate uplift (0 to 12 pp) */
export function computePartialDependence(
  model: MLFittedModel | null,
  baseRow: {
    fill_pp: number;
    inventory_days_reduced: number;
    recovery_rate: number;
    unit_contribution_cr: number;
    scheduling_yield_cr: number;
    avoided_cost_cr: number;
    running_cost_cr: number;
    risk_rpn: number;
  }
): { x: number; y: number }[] {
  if (!model) return [];
  const points: { x: number; y: number }[] = [];
  for (let x = 0; x <= 12.01; x += 0.5) {
    const pred = predictWithRidge(model, {
      ...baseRow,
      fill_pp: x
    });
    if (pred !== null) {
      points.push({ x, y: pred });
    }
  }
  return points;
}
