import { RiskDefinition, ScoredRisk } from '../types/aegis';

/**
 * FMEA Risk Engine
 * Computes Raw RPN = Likelihood * Impact * Undetectability
 * Residual RPN = Raw RPN * (1 - 0.75 * Mitigation)
 */
export function calculateRiskScores(risks: RiskDefinition[]): ScoredRisk[] {
  return risks.map(r => {
    const raw = r.likelihood * r.impact * r.undetectability;
    const residual = raw * (1 - 0.75 * r.mitigation);
    return {
      ...r,
      raw,
      residual
    };
  });
}

export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low';

export function getRiskLevel(residual: number): RiskLevel {
  if (residual >= 60) return 'critical';
  if (residual >= 35) return 'high';
  if (residual >= 18) return 'moderate';
  return 'low';
}

export function getRiskLevelColor(residual: number): { text: string; bg: string; border: string; badge: string } {
  if (residual >= 60) {
    return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-800' };
  }
  if (residual >= 35) {
    return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800' };
  }
  if (residual >= 18) {
    return { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-800' };
  }
  return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' };
}

export function getAverageResidualRisk(scored: ScoredRisk[]): number {
  if (!scored.length) return 0;
  return scored.reduce((acc, r) => acc + r.residual, 0) / scored.length;
}

export function getRankedRisks(scored: ScoredRisk[]): ScoredRisk[] {
  return [...scored].sort((a, b) => b.residual - a.residual);
}
