import { GateDefinition, ObservationRecord, WhatIfGateInputs, CaseData, InitiativeAllocation, ScoredRisk, GateTestResult } from '../types/aegis';
import { clamp, formatCr } from './mathUtils';

/**
 * Validates budget allocation against the mandatory ₹150 Cr total and ₹34 / ₹58 / ₹58 tranche envelopes.
 */
export function calculateBudgetTotals(allocations: InitiativeAllocation[]): [number, number, number, number] {
  return allocations.reduce<[number, number, number, number]>(
    (acc, a) => {
      acc[0] += Number(a.total) || 0;
      acc[1] += Number(a.phase[0]) || 0;
      acc[2] += Number(a.phase[1]) || 0;
      acc[3] += Number(a.phase[2]) || 0;
      return acc;
    },
    [0, 0, 0, 0]
  );
}

export function validateBudgetEnvelopes(
  allocations: InitiativeAllocation[],
  mandatoryTotal = 150
): string[] {
  const totals = calculateBudgetTotals(allocations);
  const required = [mandatoryTotal, 34, 58, 58];
  const labels = ['Total Budget', 'Tranche 1 (M0–9)', 'Tranche 2 (M10–21)', 'Tranche 3 (M22–36)'];
  const errors: string[] = [];

  totals.forEach((sum, idx) => {
    if (Math.abs(sum - required[idx]) > 1e-4) {
      errors.push(`${labels[idx]}: ${formatCr(sum, 1)} ≠ mandatory ${formatCr(required[idx], 1)}`);
    }
  });

  for (const item of allocations) {
    const phaseSum = (item.phase[0] || 0) + (item.phase[1] || 0) + (item.phase[2] || 0);
    if (Math.abs(item.total - phaseSum) > 1e-4) {
      errors.push(`"${item.name}" phase sum (${formatCr(phaseSum, 1)}) differs from total (${formatCr(item.total, 1)})`);
    }
  }

  return errors;
}

/**
 * Strict Boolean AND logic gate evaluation.
 */
export function testGateCondition(
  gate: GateDefinition,
  obs: ObservationRecord | WhatIfGateInputs | null,
  requireAuditEvidence = true
): GateTestResult {
  if (!obs) {
    return {
      status: 'UNVERIFIED',
      klass: 'none',
      reasons: [`No observation recorded for Month ${gate.month}`]
    };
  }

  const checks: [string, number | null | undefined, number, 'gte' | 'lte'][] = [
    ['Fill-rate', obs.fillRate, gate.fill, 'gte'],
    ['Inventory days', obs.inventoryDays, gate.inventory, 'lte'],
    ['EBITDA run-rate', obs.ebitdaRunRate, gate.ebitda, 'gte']
  ];

  if (gate.wc !== null) {
    checks.push(['Network WC release', obs.networkWcRelease, gate.wc, 'gte']);
  }

  const fails: string[] = [];
  const missing: string[] = [];

  for (const [name, val, threshold, op] of checks) {
    if (val === null || val === undefined || val === ('' as unknown as number) || !Number.isFinite(Number(val))) {
      missing.push(`${name} missing`);
    } else {
      const numVal = Number(val);
      if (op === 'gte' ? numVal < threshold : numVal > threshold) {
        fails.push(`${name} ${numVal} vs required ${threshold}`);
      }
    }
  }

  if (fails.length > 0) {
    return {
      status: 'FAIL',
      klass: 'bad',
      reasons: fails
    };
  }

  if (requireAuditEvidence) {
    const obsRecord = obs as ObservationRecord;
    const evidenceChecks: [string, boolean][] = [
      ['Independent audit certification', Boolean(obsRecord.audited)],
      ['Finance certification', Boolean(obsRecord.financeCertified)],
      ['Physical stock reconciliation', Boolean(obsRecord.physicalCountVerified)],
      ['Benefit de-duplication confirmation', Boolean(obsRecord.benefitDedupVerified)]
    ];

    for (const [name, passed] of evidenceChecks) {
      if (!passed) {
        missing.push(name);
      }
    }
  }

  if (missing.length > 0) {
    return {
      status: requireAuditEvidence ? 'UNVERIFIED' : 'INCOMPLETE',
      klass: 'none',
      reasons: missing
    };
  }

  return {
    status: requireAuditEvidence ? 'ENTERED PASS' : 'NUMERIC PASS',
    klass: 'good',
    reasons: [
      requireAuditEvidence
        ? 'All numeric thresholds and declared verification criteria satisfied. External governance required for release.'
        : 'All numeric what-if thresholds met. Scenario only; not an audited release.'
    ]
  };
}

/**
 * Gate readiness score (0-100) relative to progress from case FY26 baseline toward target.
 */
export function calculateGateReadiness(
  gate: GateDefinition,
  obs: ObservationRecord | WhatIfGateInputs | null,
  baselineCase: CaseData
): number {
  if (!obs) return 0;
  const numOrZero = (v: number | null | undefined) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  const fillProg = (numOrZero(obs.fillRate) - baselineCase.fillRate) / (gate.fill - baselineCase.fillRate);
  const invProg = (baselineCase.inventoryDays - numOrZero(obs.inventoryDays)) / (baselineCase.inventoryDays - gate.inventory);
  const ebProg = numOrZero(obs.ebitdaRunRate) / gate.ebitda;

  const weights = gate.month === 9
    ? { fill: 0.35, inv: 0.30, eb: 0.35, wc: 0 }
    : { fill: 0.25, inv: 0.20, eb: 0.35, wc: 0.20 };

  let total = weights.fill * clamp(fillProg) + weights.inv * clamp(invProg) + weights.eb * clamp(ebProg);

  if (gate.wc !== null) {
    const wcProg = numOrZero(obs.networkWcRelease) / gate.wc;
    total += weights.wc * clamp(wcProg);
  }

  return Math.round(clamp(total) * 100);
}

export interface GateArbiterVerdict {
  status: string;
  summary: string;
  badgeClass: 'green' | 'gold' | 'red';
  topRiskAdvice: string;
  budgetErrors: string[];
}

export function evaluateGateArbiter(
  g1Result: GateTestResult,
  g2Result: GateTestResult,
  budgetErrors: string[],
  scoredRisks: ScoredRisk[]
): GateArbiterVerdict {
  const worstRisk = [...scoredRisks].sort((a, b) => b.residual - a.residual)[0];
  const topRiskAdvice = worstRisk
    ? `${worstRisk.id} (${worstRisk.name}) is the highest residual exposure (Residual RPN: ${worstRisk.residual.toFixed(1)}/125). Recommended action: ${worstRisk.response}`
    : 'No active risk alerts.';

  if (budgetErrors.length > 0) {
    return {
      status: 'CAPITAL ALLOCATION HOLD',
      summary: 'Investment ledger violates the mandatory ₹150 Cr total or ₹34 / ₹58 / ₹58 tranche envelopes. Rebalance allocations before requesting funding arbitration.',
      badgeClass: 'red',
      topRiskAdvice,
      budgetErrors
    };
  }

  if (g1Result.status === 'FAIL') {
    return {
      status: 'GATE 1 FAILED · TRANCHE 2 DEFERRED',
      summary: 'Gate 1 mandatory operating thresholds were not achieved. Second tranche of ₹58 Cr is deferred by two quarters, and operational recovery plan is required.',
      badgeClass: 'red',
      topRiskAdvice,
      budgetErrors
    };
  }

  if (g1Result.status !== 'ENTERED PASS') {
    return {
      status: 'GATE 1 PENDING · M10 TRANCHE HOLD',
      summary: 'Gate 1 evidence or metrics remain unverified. Tranche 2 release of ₹58 Cr cannot be recommended without completed Finance certification and independent audit.',
      badgeClass: 'gold',
      topRiskAdvice,
      budgetErrors
    };
  }

  if (g2Result.status === 'FAIL') {
    return {
      status: 'GATE 2 FAILED · TRANCHE 3 LAPSED',
      summary: 'Gate 2 mandatory thresholds missed. In accordance with governance rules, the final ₹58 Cr tranche lapses; project must be re-scoped with funded capabilities only.',
      badgeClass: 'red',
      topRiskAdvice,
      budgetErrors
    };
  }

  if (g2Result.status !== 'ENTERED PASS') {
    return {
      status: 'GATE 1 CERTIFIED · GATE 2 PENDING',
      summary: 'Gate 1 has verified certification. Gate 2 remains unverified; Tranche 3 (₹58 Cr) remains conditionally reserved pending Month 22 audit performance.',
      badgeClass: 'gold',
      topRiskAdvice,
      budgetErrors
    };
  }

  return {
    status: 'ELIGIBLE FOR GOVERNANCE REVIEW',
    summary: 'Both Gate 1 and Gate 2 have satisfied all numerical thresholds and declared audit certifications. Formal release requires external board / funding authority authorization.',
    badgeClass: 'green',
    topRiskAdvice,
    budgetErrors
  };
}
