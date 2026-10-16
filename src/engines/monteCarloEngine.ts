import { AegisState, SimulationSummary } from '../types/aegis';
import { clamp, createRNG, normalCDF, sampleNormal, sampleTriangular } from './mathUtils';
import { predictWithRidge } from './mlEngine';

const OCCURRENCE_PROBABILITIES = [0, 0.05, 0.12, 0.23, 0.40, 0.60];

/**
 * Runs full stochastic Monte Carlo stress test with Gaussian copula risk dependence.
 */
export function runMonteCarloSimulation(state: AegisState): SimulationSummary {
  const n = Math.round(clamp(state.controls.draws, 1000, 100000));
  const rand = createRNG(state.controls.seed || 1);
  const rho = clamp(state.controls.correlation, 0, 0.85);
  const gain = state.controls.valueRealization;
  const risks = state.risks;
  const dist = state.distribution;

  // Validate distributions: low <= mode <= high
  for (const [key, triplet] of Object.entries(dist)) {
    if (!triplet.every(Number.isFinite) || triplet[0] > triplet[1] || triplet[1] > triplet[2]) {
      throw new Error(`Distribution "${key}" has invalid triplet [${triplet.join(', ')}]. Must satisfy low <= mode <= high.`);
    }
  }

  let pass1 = 0;
  let pass2 = 0;
  let both = 0;
  const ebArr: number[] = [];
  let unriskEB = 0;
  let daySum = 0;
  let unriskDays = 0;
  let ownedSurv = 0;
  let costExtra = 0;
  const events = Array(risks.length).fill(0);
  const losses = Array(risks.length).fill(0);

  const sampleDist = (key: keyof typeof dist): number => {
    const t = dist[key];
    if (key === 'unitContribution') {
      return t[0] + rand() * (t[2] - t[0]);
    }
    return sampleTriangular(t[0], t[1], t[2], rand);
  };

  const currentResidualRpn = risks.reduce((acc, r) => {
    const raw = r.likelihood * r.impact * r.undetectability;
    return acc + raw * (1 - 0.75 * r.mitigation);
  }, 0) / Math.max(1, risks.length);

  // What-if overrides if touched by user
  const v9 = state.whatIf['9'];
  const v22 = state.whatIf['22'];
  const t9 = state.controls.touched?.['9'] || {};
  const t22 = state.controls.touched?.['22'] || {};

  for (let i = 0; i < n; i++) {
    let fill = sampleDist('fill22');
    let days = sampleDist('days22');
    const rec = sampleDist('recovery');
    const cp = sampleDist('unitContribution');
    const yieldV = sampleDist('separateYield');
    const avoided = sampleDist('avoided');
    const running = sampleDist('running');

    // Structural model
    let rawEb =
      (fill * cp * (rec / state.assumptions.midpointCalibrationRecovery) +
        yieldV +
        avoided -
        running) *
      gain;

    // Optional ML blend
    if (state.ml.blend > 0 && state.ml.model) {
      const mlPred = predictWithRidge(state.ml.model, {
        fill_pp: fill,
        inventory_days_reduced: days,
        recovery_rate: rec,
        unit_contribution_cr: cp,
        scheduling_yield_cr: yieldV,
        avoided_cost_cr: avoided,
        running_cost_cr: running,
        risk_rpn: currentResidualRpn
      });

      if (mlPred !== null) {
        rawEb = rawEb * (1 - state.ml.blend) + mlPred * state.ml.blend;
      }
    }

    // Month 9 intermediate fractional realizations
    let f9 = fill * sampleDist('fillM9Fraction');
    let d9 = days * sampleDist('daysM9Fraction');
    let e9 = rawEb * sampleDist('ebitdaM9Fraction');

    const unRisk = rawEb;
    const unDays = days;
    let netWcLoss = 0;
    let ownedLoss = 0;
    let addCost = 0;
    let wcOverride = 0;
    let delay = 0;
    const avoidedAdj = avoided * gain;

    // Gaussian Copula for Correlated Risk Shocks
    const common = sampleNormal(rand);
    for (let k = 0; k < risks.length; k++) {
      const r = risks[k];
      const eff = r.effects || {};
      const occIndex = Math.min(5, Math.max(1, Math.round(r.likelihood)));
      const baseProb = OCCURRENCE_PROBABILITIES[occIndex];
      const p = baseProb * (1 - 0.72 * r.mitigation);

      // Correlated standard normal variate
      const z = rho * common + Math.sqrt(1 - rho * rho) * sampleNormal(rand);
      if (normalCDF(z) < p) {
        events[k]++;
        const sev =
          sampleTriangular(0.60, 1.0, 1.40, rand) *
          (r.impact / 4) *
          (0.85 + 0.05 * r.undetectability) *
          (1 - 0.70 * r.mitigation);

        const ebLoss = (eff.eb || 0) * sev;
        const eb9Loss = (eff.eb9 || 0) * sev;
        const fillLoss = (eff.fill || 0) * sev;
        const daysLoss = (eff.days || 0) * sev;

        rawEb -= ebLoss;
        e9 -= eb9Loss;
        fill -= fillLoss;
        days -= daysLoss;
        f9 -= (eff.fill9 || 0) * sev;
        netWcLoss += (eff.wcLoss || 0) * sev;
        ownedLoss += (eff.ownedLoss || 0) * sev;
        addCost += (eff.cost || 0) * sev;
        delay += (eff.delay || 0) * sev;

        losses[k] += ebLoss + eb9Loss;
      }
    }

    // User touched conditionings
    if (t9.fillRate && v9.fillRate !== null) f9 += Number(v9.fillRate) - 89;
    if (t9.inventoryDays && v9.inventoryDays !== null) d9 += 46 - Number(v9.inventoryDays) - 3;
    if (t9.ebitdaRunRate && v9.ebitdaRunRate !== null) e9 += Number(v9.ebitdaRunRate) - 22.6;

    if (t22.fillRate && v22.fillRate !== null) {
      const delta = Number(v22.fillRate) - 92;
      fill += delta;
      if (!t22.ebitdaRunRate) {
        rawEb += delta * cp * (rec / state.assumptions.midpointCalibrationRecovery) * gain;
      }
    }
    if (t22.inventoryDays && v22.inventoryDays !== null) {
      days += 46 - Number(v22.inventoryDays) - 8;
    }
    if (t22.ebitdaRunRate && v22.ebitdaRunRate !== null) {
      rawEb += Number(v22.ebitdaRunRate) - 71.84;
    }
    if (t22.networkWcRelease && v22.networkWcRelease !== null) {
      wcOverride = Number(v22.networkWcRelease) - 213.6;
    }

    const d0 = clamp(days, 0, 60);
    const f0 = clamp(fill, 0, 20);
    const g1fill = clamp(f9, 0, 20);
    const g1days = clamp(d9 - (unDays - d0) * 0.25, 0, 20);
    const g1e = e9 - Math.max(0, delay - 1) * 0.5;

    // Strict Gate 1 evaluation: fill uplift, days reduction, and EBITDA run-rate
    const G1 =
      g1fill >= state.gates[0].fill - state.case.fillRate &&
      g1days >= state.case.inventoryDays - state.gates[0].inventory &&
      g1e >= state.gates[0].ebitda;

    // Strict Gate 2 evaluation: fill uplift, days reduction, working capital, EBITDA, avoided cost cap
    const wc = Math.max(0, d0 * state.case.networkDayRs * clamp(1 - netWcLoss) + wcOverride);
    const ownedFactor = clamp(1 - ownedLoss);
    const G2 =
      f0 >= state.gates[1].fill - state.case.fillRate &&
      d0 >= state.case.inventoryDays - state.gates[1].inventory &&
      wc >= (state.gates[1].wc || 0) &&
      rawEb >= state.gates[1].ebitda &&
      avoidedAdj <= state.case.maxCostAvoidShare * rawEb;

    if (G1) pass1++;
    if (G2) pass2++;
    if (G1 && G2) both++;

    ebArr.push(rawEb);
    unriskEB += unRisk;
    daySum += d0;
    unriskDays += unDays;
    ownedSurv += d0 * ownedFactor;
    costExtra += addCost;
  }

  ebArr.sort((a, b) => a - b);
  const q = (p: number) => ebArr[Math.min(n - 1, Math.max(0, Math.floor((n - 1) * p)))];

  return {
    n,
    p1: pass1 / n,
    p2: pass2 / n,
    both: both / n,
    cond: pass1 > 0 ? both / pass1 : null,
    q10: q(0.10),
    q50: q(0.50),
    q90: q(0.90),
    samples: ebArr,
    riskFactor: unriskEB > 0 ? ebArr.reduce((a, b) => a + b, 0) / unriskEB : 1,
    ownedFactor: unriskDays > 0 ? ownedSurv / unriskDays : 1,
    avgCost: costExtra / n,
    eventFrequency: events.map(x => x / n),
    riskLoss: losses.map(x => x / n),
    avgDays: daySum / n
  };
}
