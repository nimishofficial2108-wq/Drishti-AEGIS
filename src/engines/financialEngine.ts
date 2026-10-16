import { AegisState, CashReturnResult, SimulationSummary } from '../types/aegis';
import { calculateBudgetTotals } from './gateArbiter';
import { clamp } from './mathUtils';

/**
 * Robust numerical root-finder for monthly IRR: sum(CF[m] / (1 + r)^m) = 0.
 * Converted to annualized pre-tax IRR: (1 + r_monthly)^12 - 1.
 */
export function calculateAnnualizedIRR(cashFlows: number[]): number | null {
  const npvAtMonthlyRate = (rate: number): number => {
    return cashFlows.reduce((acc, cf, m) => acc + cf / Math.pow(1 + rate, m), 0);
  };

  let lo = -0.80;
  let hi = 1.0;

  // Verify opposite signs or expand hi
  let fLo = npvAtMonthlyRate(lo);
  let fHi = npvAtMonthlyRate(hi);

  while (fLo * fHi > 0 && hi < 20) {
    hi *= 2;
    fHi = npvAtMonthlyRate(hi);
  }

  if (!Number.isFinite(fLo) || !Number.isFinite(fHi) || fLo * fHi > 0) {
    return null;
  }

  // Bisection algorithm for guaranteed convergence
  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    const fMid = npvAtMonthlyRate(mid);

    if (Math.abs(fMid) < 1e-8) {
      lo = mid;
      hi = mid;
      break;
    }

    if (fLo * fMid < 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }

  const monthlyRate = (lo + hi) / 2;
  const annualIRR = Math.pow(1 + monthlyRate, 12) - 1;

  return Number.isFinite(annualIRR) ? annualIRR : null;
}

/**
 * Calculates monthly net cash flows, cumulative cash flows, NPV @ 18%, annualized IRR,
 * and sustained payback across Months 0 to 60.
 */
export function calculateFinancialReturns(
  state: AegisState,
  summary: SimulationSummary | null
): CashReturnResult {
  const cv22 = clamp(state.model.cashRecognizedAtM22);
  const cv36 = clamp(state.model.cashRecognizedAtM36);
  const factor = clamp(summary?.riskFactor ?? 1, 0.35, 1.30);
  const wcFactor = clamp(summary?.ownedFactor ?? 1, 0.10, 1.20);
  const extraCost = summary?.avgCost ?? 0;
  const days = state.model.daysReduction;

  const owned: number[] = Array(61).fill(0);
  const c: number[] = [];

  for (let m = 22; m <= 60; m++) {
    const r = m === 22 ? cv22 : m <= 36 ? cv22 + ((cv36 - cv22) * (m - 23)) / 13 : cv36;
    owned[m] = days[m] * state.case.ownedDayRs * r * wcFactor;
  }

  const b = calculateBudgetTotals(state.alloc);

  for (let m = 0; m <= 60; m++) {
    const trancheOutflow = m === 0 ? b[1] : m === 10 ? b[2] : m === 22 ? b[3] : 0;
    const grossEbitda = (state.model.netEbitdaMonthly[m] || 0) * factor;
    const runningCost = m <= 36 ? state.model.monthlyProgrammeRunning[m] || 0 : 0;
    const costSurcharge = m === 10 ? extraCost * 0.40 : m === 22 ? extraCost * 0.60 : 0;
    const deltaOwnedWc = owned[m] - (m > 0 ? owned[m - 1] : 0);

    const netMonthly = -trancheOutflow + grossEbitda + runningCost + deltaOwnedWc - costSurcharge;
    c.push(netMonthly);
  }

  let total = 0;
  const cum = c.map(val => (total += val));

  // Sustained payback: first month where cum >= 0 and remains >= 0 through M60
  let pay: number | null = null;
  for (let i = 0; i < cum.length; i++) {
    if (cum.slice(i).every(x => x >= -1e-8)) {
      pay = i;
      break;
    }
  }

  // Pre-tax IRR
  const irr = calculateAnnualizedIRR(c);

  // NPV @ 18% annual discount hurdle
  const monthlyHurdle = Math.pow(1 + state.case.irrHurdle, 1 / 12) - 1;
  const npv = c.reduce((acc, cf, m) => acc + cf / Math.pow(1 + monthlyHurdle, m), 0);

  return {
    c,
    cum,
    irr,
    pay,
    npv,
    owned22: owned[22],
    owned36: owned[36],
    factor,
    wcFactor
  };
}

/**
 * Computes Waterfall breakdown of annualized steady-state EBITDA benefit at M22+
 */
export function calculateEbitdaWaterfall(state: AegisState): { label: string; value: number; type: 'gain' | 'cost' | 'subtotal' }[] {
  const fillUplift = state.distribution.fill22[1];
  const unitContrib = state.distribution.unitContribution[1];
  const recovery = state.distribution.recovery[1];
  const serviceGross = fillUplift * unitContrib * (recovery / state.assumptions.midpointCalibrationRecovery);

  const sched = state.distribution.separateYield[1];
  const avoided = state.distribution.avoided[1];
  const running = state.distribution.running[1];
  const steadyEbitda = serviceGross + sched + avoided - running;

  return [
    { label: 'Fill-rate service recovery', value: serviceGross, type: 'gain' },
    { label: 'Plant C scheduling yield', value: sched, type: 'gain' },
    { label: 'Avoided operating costs', value: avoided, type: 'gain' },
    { label: 'Programme running costs', value: -running, type: 'cost' },
    { label: 'Net Annualised Benefit', value: steadyEbitda, type: 'subtotal' }
  ];
}

/**
 * Tornado Sensitivity Analysis on 5-Year NPV
 */
export function calculateTornadoSensitivities(state: AegisState): { parameter: string; lowNPV: number; highNPV: number; swing: number }[] {
  const baseResult = calculateFinancialReturns(state, null);
  const baseNPV = baseResult.npv;

  const drivers: { name: string; key: keyof AegisState['distribution']; lowVal: number; highVal: number }[] = [
    { name: 'M22 Fill Uplift (pp)', key: 'fill22', lowVal: state.distribution.fill22[0], highVal: state.distribution.fill22[2] },
    { name: 'Inventory Days Reduced', key: 'days22', lowVal: state.distribution.days22[0], highVal: state.distribution.days22[2] },
    { name: 'Stock-out Recovery Rate', key: 'recovery', lowVal: state.distribution.recovery[0], highVal: state.distribution.recovery[2] },
    { name: 'Contribution per Point (₹Cr)', key: 'unitContribution', lowVal: state.distribution.unitContribution[0], highVal: state.distribution.unitContribution[2] },
    { name: 'Scheduling Yield (₹Cr)', key: 'separateYield', lowVal: state.distribution.separateYield[0], highVal: state.distribution.separateYield[2] },
    { name: 'Avoided Costs (₹Cr)', key: 'avoided', lowVal: state.distribution.avoided[0], highVal: state.distribution.avoided[2] },
    { name: 'Annual Running Cost (₹Cr)', key: 'running', lowVal: state.distribution.running[0], highVal: state.distribution.running[2] }
  ];

  return drivers
    .map(d => {
      // Sensitivity proxy: scale net EBITDA proportionally
      const mid = state.distribution[d.key][1];
      const lowScale = d.key === 'running' ? mid / Math.max(0.1, d.lowVal) : d.lowVal / Math.max(0.1, mid);
      const highScale = d.key === 'running' ? mid / Math.max(0.1, d.highVal) : d.highVal / Math.max(0.1, mid);

      const lowNPV = baseNPV * (0.6 + 0.4 * lowScale);
      const highNPV = baseNPV * (0.6 + 0.4 * highScale);

      return {
        parameter: d.name,
        lowNPV: Math.min(lowNPV, highNPV),
        highNPV: Math.max(lowNPV, highNPV),
        swing: Math.abs(highNPV - lowNPV)
      };
    })
    .sort((a, b) => b.swing - a.swing);
}
