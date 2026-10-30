export type TriangularTriplet = [number, number, number]; // [min, most-likely, max]
export type UniformRange = [number, number]; // [min, max]

export interface MonteCarloAssumptions {
  // Group A — Commercial Recovery
  demandRecovery: TriangularTriplet; // default: [0.35, 0.45, 0.60]
  unitContribution: UniformRange; // default: [8.6, 11.8] ₹Cr
  fillUpliftM9: TriangularTriplet; // default: [1.4, 3.4, 5.5] pp
  fillUpliftM22: TriangularTriplet; // default: [4.0, 6.4, 9.0] pp

  // Group B — Inventory
  inventoryReductionM9: TriangularTriplet; // default: [1.5, 3.4, 5.5] days
  inventoryReductionM22: TriangularTriplet; // default: [5.0, 8.5, 12.0] days
  networkValuePerDay: number; // default: 26.7 ₹Cr / day
  ownedValuePerDay: number; // default: 18.8 ₹Cr / day

  // Group C — Manufacturing
  schedulingContribution: TriangularTriplet; // default: [0, 9.8, 18.0] ₹Cr

  // Group D — Operating Economics
  avoidedFreightCost: TriangularTriplet; // default: [10.0, 27.2, 35.0] ₹Cr
  runningCosts: TriangularTriplet; // default: [4.0, 8.0, 15.0] ₹Cr
  cashConversion: TriangularTriplet; // default: [0.45, 0.66, 0.86]

  // Group E — Implementation Risk
  dataReadiness: TriangularTriplet; // default: [0.52, 0.79, 0.98]
  adoptionRate: TriangularTriplet; // default: [0.50, 0.76, 0.96]
  remediationProbability: number; // default: 0.52 (52%)
  correlationRho: number; // default: 0.35

  // Group F — Simulation Controls
  draws: number; // default: 20000
  seed: number; // default: 20261030
}

export type ScenarioPresetKey =
  | 'baseline'
  | 'conservative'
  | 'operational_recovery'
  | 'high_adoption'
  | 'delayed_deployment'
  | 'custom';

export interface ScenarioPreset {
  id: ScenarioPresetKey;
  name: string;
  tagline: string;
  description: string;
  assumptions: Partial<MonteCarloAssumptions>;
}

export interface ScenarioSamplePoint {
  id: number;
  fillUplift22: number;
  inventoryDays22: number;
  ebitdaUplift: number;
  networkWcRelease: number;
  ownedCashRelease: number;
  g1Passed: boolean;
  g1Remediated: boolean;
  g2Passed: boolean;
  fullyFunded: boolean;
  paybackMonth: number | null;
  npv5Y: number;
  irr: number | null;
  status: 'passed' | 'remediated' | 'stopped_g1' | 'stopped_g2';
}

export interface CashFlowFanData {
  months: number[];
  median: number[];
  p10: number[];
  p90: number[];
  p25: number[];
  p75: number[];
  sampleTrajectories: number[][]; // 25 individual scenario paths
  fullyFundedMedian?: number[];
  failedGatesMedian?: number[];
}

export interface GateFunnelMetrics {
  total: number;
  g1OnTimeCount: number;
  g1OnTimePct: number;
  g1RemediatedCount: number;
  g1RemediatedPct: number;
  g1FailedFinalCount: number;
  g1FailedFinalPct: number;
  g2PassCount: number;
  g2PassPct: number;
  g2FailCount: number;
  g2FailPct: number;
  full150CrDeployedCount: number;
  full150CrDeployedPct: number;
  stoppedAt34CrCount: number;
  stoppedAt34CrPct: number;
  stoppedAt92CrCount: number;
  stoppedAt92CrPct: number;
  // Exclusive donut breakdown (strictly sums to 100%)
  exclusiveDonut: {
    label: string;
    count: number;
    pct: number;
    color: string;
    capital: string;
  }[];
}

export interface SensitivityDriver {
  key: string;
  label: string;
  spearmanRho: number;
  impactScore: number;
  direction: 'positive' | 'negative';
  description: string;
}

export interface FailureRootCauseBucket {
  id: string;
  name: string;
  count: number;
  pct: number;
  action: string;
  color: string;
}

export interface PaybackDistributionData {
  months: number[]; // 12 to 60+
  countsAll: number[];
  cumPctAll: number[];
  countsFunded: number[];
  cumPctFunded: number[];
  medianAll: number | null;
  medianFunded: number | null;
  p10Funded: number | null;
  p90Funded: number | null;
}

export interface HeatmapCell {
  recovery: number; // e.g. 0.35 to 0.60
  scheduling: number; // e.g. 0 to 18 Cr
  ebitda: number;
  passesHurdle: boolean;
}

export interface EarlyWarningMetrics {
  triggerPct: number; // % of runs triggering early alerts
  modelRecall: number; // baseline ~78.8%
  modelPrecision: number; // ~74.2%
  leadIndicators: {
    indicator: string;
    correlation: number;
    leadTimeWeeks: number;
  }[];
}

export interface MonteCarloRunResult {
  runId: string;
  timestamp: string;
  seed: number;
  draws: number;
  isLivePreview: boolean;
  isBaseline: boolean;
  assumptions: MonteCarloAssumptions;

  // Primary Executive KPIs
  pGate1OnTime: number; // 0.4837
  pGate2Pass: number; // 0.3070
  pBothGatesOnTime: number; // 0.2843
  pGate1Remediated: number; // 0.2685
  pPayback30FullyFunded: number; // 0.8728
  pPayback30AllScenarios: number; // 0.6637

  // Financial Percentiles (Phase-II Funded)
  ebitdaP10: number; // 64.85
  ebitdaP50: number; // 88.47 (Median)
  ebitdaP90: number; // 115.46
  ebitdaMean: number;

  // 5-Year Investment Returns
  npvP10: number;
  npvP50: number; // 138.4
  npvP90: number;
  irrP50: number | null; // ~31.2%
  paybackMedianMonths: number | null; // ~26.4
  capitalDeployedMedian: number; // ₹150 Cr or ₹92 Cr

  // Detailed Analysis Datasets for Charts
  ebitdaAllSamples: number[];
  ebitdaFundedSamples: number[];
  cashFlowFan: CashFlowFanData;
  gateFunnel: GateFunnelMetrics;
  sensitivityDrivers: SensitivityDriver[];
  failureRootCauses: FailureRootCauseBucket[];
  paybackData: PaybackDistributionData;
  scatterPoints: ScenarioSamplePoint[];
  heatmapGrid: {
    recoveryLabels: number[];
    schedulingLabels: number[];
    grid: HeatmapCell[][];
  };
  earlyWarning: EarlyWarningMetrics;
}
