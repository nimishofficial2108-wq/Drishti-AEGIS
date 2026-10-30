import React, { useState, useMemo } from 'react';
import { useAegis } from '../../context/AegisContext';
import { formatNum, formatCr, formatPct } from '../../engines/mathUtils';
import {
  ML_FEATURE_NAMES,
  parseMLCSV,
  computePartialDependence,
  predictWithRidge,
  generateSyntheticDemoDataset
} from '../../engines/mlEngine';
import { PartialDependenceChart } from '../charts/PartialDependenceChart';
import { Cpu, Upload, Download, RotateCcw, AlertTriangle, CheckCircle2, Dices } from 'lucide-react';

export const PredictiveMlStudio: React.FC = () => {
  const { state, setMLBlend, retrainML, setActiveSection } = useAegis();
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvSuccess, setCsvSuccess] = useState<string | null>(null);

  const model = state.ml.model;

  // Active current scenario row for inference
  const currentResidualRpn = state.risks.reduce((acc, r) => {
    const raw = r.likelihood * r.impact * r.undetectability;
    return acc + raw * (1 - 0.75 * r.mitigation);
  }, 0) / Math.max(1, state.risks.length);

  const currentScenarioRow = useMemo(() => {
    return {
      fill_pp: state.distribution.fill22[1],
      inventory_days_reduced: state.distribution.days22[1],
      recovery_rate: state.distribution.recovery[1],
      unit_contribution_cr: state.distribution.unitContribution[1],
      scheduling_yield_cr: state.distribution.separateYield[1],
      avoided_cost_cr: state.distribution.avoided[1],
      running_cost_cr: state.distribution.running[1],
      risk_rpn: currentResidualRpn
    };
  }, [state.distribution, state.risks, currentResidualRpn]);

  // Model prediction
  const mlPrediction = useMemo(() => {
    if (!model) return null;
    return predictWithRidge(model, currentScenarioRow);
  }, [model, currentScenarioRow]);

  // Structural model calculation for comparison
  const structuralEbitda = useMemo(() => {
    const r = currentScenarioRow;
    return (
      r.fill_pp * r.unit_contribution_cr * (r.recovery_rate / 0.5) +
      r.scheduling_yield_cr +
      r.avoided_cost_cr -
      r.running_cost_cr
    );
  }, [currentScenarioRow]);

  // Partial dependence data
  const partialPoints = useMemo(() => {
    return computePartialDependence(model, currentScenarioRow);
  }, [model, currentScenarioRow]);

  // CSV Template download
  const handleDownloadTemplate = () => {
    const headers =
      'fill_pp,inventory_days_reduced,recovery_rate,unit_contribution_cr,scheduling_yield_cr,avoided_cost_cr,running_cost_cr,risk_rpn,observed_ebitda_cr\n';
    const sample = '6.0,8.0,0.45,10.2,9.8,27.2,8.0,42.5,71.84\n';
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DRISHTI_AEGIS_ML_Training_Template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError(null);
    setCsvSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedRows = parseMLCSV(text);
      const success = retrainML(parsedRows, 'IMPORTED USER CSV');
      if (success) {
        setCsvSuccess(`Successfully trained on ${parsedRows.length} uploaded records with 5-fold cross validation.`);
      } else {
        setCsvError('Model fitting failed: Singular matrix or insufficient data variation.');
      }
    } catch (err: unknown) {
      setCsvError((err as Error).message || 'Failed to parse CSV file.');
    }
  };

  const handleResetDemo = () => {
    const demo = generateSyntheticDemoDataset();
    retrainML(demo, 'SYNTHETIC DEMO');
    setCsvSuccess('Reset to 240 synthetic demonstration records.');
    setCsvError(null);
  };

  const coefMagnitudes = model ? model.betas.slice(1).map(Math.abs) : [];
  const maxCoef = coefMagnitudes.length ? Math.max(...coefMagnitudes, 0.01) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Predictive ML Studio · Multivariate Ridge Regression (λ = 0.75)
          </div>
          <h2 className="text-xl font-extrabold text-[#082E5F]">
            Trainable Machine Learning Intelligence
          </h2>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
              state.ml.origin === 'IMPORTED USER CSV'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {state.ml.origin === 'IMPORTED USER CSV' ? 'USER-TRAINED MODEL' : 'SYNTHETIC DEMONSTRATION'}
          </span>
          <button
            onClick={() => setActiveSection('scenario')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1465C7] text-white hover:bg-[#083E84] active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5 text-[#F0C11E]" />
            <span>Test scheduling efficiency in Monte Carlo Lab</span>
          </button>
        </div>
      </div>

      {/* Model Performance Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dataset Records</div>
          <div className="text-2xl font-black text-[#0B376A] font-mono mt-1">
            {state.ml.rows.length}
            <span className="text-xs font-normal text-slate-400 ml-1">rows</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
            {state.ml.origin === 'IMPORTED USER CSV' ? 'User-supplied CSV' : 'Synthetic demonstration'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">5-Fold CV MAE</div>
          <div className="text-2xl font-black text-[#0B376A] font-mono mt-1">
            {model?.cv ? `₹${formatNum(model.cv.mae, 2)} Cr` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Out-of-sample error</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">5-Fold CV R²</div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {model?.cv?.r2 !== null && model?.cv?.r2 !== undefined ? formatNum(model.cv.r2, 3) : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Hold-out goodness of fit</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ML EBITDA Estimate</div>
          <div className="text-2xl font-black text-[#082E5F] font-mono mt-1">
            {mlPrediction !== null ? formatCr(mlPrediction, 1) : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
            Diff: {mlPrediction !== null ? formatCr(mlPrediction - structuralEbitda, 1) : '—'}
          </div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Interactive Inference & ML Blend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Inference Comparison & Stochastic Blend</h3>
            <span className="text-xs font-mono text-slate-500">λ = 0.75 L2 Penalty</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="font-semibold text-slate-700">Structural Analytical EBITDA:</span>
              <span className="font-mono font-bold text-[#0B376A]">{formatCr(structuralEbitda, 1)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="font-semibold text-slate-700">ML Supervised Ridge Estimate:</span>
              <span className="font-mono font-bold text-[#082E5F]">{formatCr(mlPrediction, 1)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-slate-700">Analytical vs ML Divergence:</span>
              <span className="font-mono font-bold text-slate-600">
                {mlPrediction !== null ? `${formatCr(Math.abs(mlPrediction - structuralEbitda), 2)} (${formatPct(Math.abs(mlPrediction - structuralEbitda) / Math.max(1, structuralEbitda), 1)})` : '—'}
              </span>
            </div>
          </div>

          {/* ML Blend Slider */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Monte Carlo ML Blending Ratio (α)</span>
              <span className="font-mono text-[#0B376A]">{Math.round(state.ml.blend * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={state.ml.blend}
              onChange={e => setMLBlend(Number(e.target.value))}
              className="w-full accent-[#0B376A] cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-normal">
              0% = 100% structural formula; 100% = ML regression predictions. Default is 0% to ensure transparent structural integrity.
            </p>
          </div>

          {/* Dataset Upload & Management Controls */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="px-3 py-1.5 bg-[#0B376A] hover:bg-[#082E5F] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Historical CSV</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV Template</span>
              </button>

              <button
                onClick={handleResetDemo}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Demo (240 rows)</span>
              </button>
            </div>

            {csvSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{csvSuccess}</span>
              </div>
            )}

            {csvError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{csvError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Partial Dependence & Feature Weights */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Partial Dependence Curve</h3>
              <p className="text-xs text-slate-500">Predicted EBITDA vs Fill-Rate Uplift (0 to 12 pp)</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Ceteris Paribus</span>
          </div>

          <PartialDependenceChart
            points={partialPoints}
            currentX={currentScenarioRow.fill_pp}
            currentY={mlPrediction}
            height={220}
          />

          {/* Standardized Ridge Beta Weights */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Standardized Feature Weights (βⱼ)
            </h4>
            <div className="space-y-1.5">
              {model?.betas.slice(1).map((beta, idx) => {
                const name = ML_FEATURE_NAMES[idx];
                const widthPct = Math.min(100, (Math.abs(beta) / maxCoef) * 100);

                return (
                  <div key={name} className="text-[11px]">
                    <div className="flex justify-between text-slate-700 mb-0.5">
                      <span>{name}</span>
                      <span className="font-mono font-semibold">{beta >= 0 ? `+${beta.toFixed(2)}` : beta.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${beta >= 0 ? 'bg-[#2677CA]' : 'bg-rose-500'}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
