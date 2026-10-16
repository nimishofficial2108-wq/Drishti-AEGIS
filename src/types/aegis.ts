export interface RegionFact {
  name: string;
  fill: number;
  days: number;
  excess: number;
  shortage: number;
}

export interface CaseData {
  revenue: number;
  fillRate: number;
  inventoryDays: number;
  ebitdaMargin: number;
  networkInventory: number;
  ownedInventory: number;
  networkDayRs: number;
  ownedDayRs: number;
  boardFill: number;
  boardInventory: number;
  budget: number;
  maxCostAvoidShare: number;
  irrHurdle: number;
  maxPayback: number;
  pilotCNoVerifiedValueBeforeMonth: number;
  regions: RegionFact[];
}

export interface GateDefinition {
  month: number;
  name: string;
  fill: number;
  inventory: number;
  ebitda: number;
  wc: number | null;
  tranche: number;
  failure: string;
}

export interface InitiativeAllocation {
  name: string;
  total: number;
  phase: [number, number, number]; // M0-9, M10-21, M22-36
  proof: string;
  scores: [number, number, number, number, number]; // Gate Impact, Risk-Adj Value, Evidence, Speed, Dependency Unlocking
}

export interface ObservationRecord {
  month: number;
  fillRate: number | null;
  inventoryDays: number | null;
  ebitdaRunRate: number | null;
  networkWcRelease: number | null;
  ownedCashRelease: number | null;
  audited: boolean;
  financeCertified: boolean;
  physicalCountVerified: boolean;
  benefitDedupVerified: boolean;
  source: string;
  timestamp?: string;
}

export interface RiskEffects {
  eb?: number;
  eb9?: number;
  fill?: number;
  fill9?: number;
  days?: number;
  wcLoss?: number;
  ownedLoss?: number;
  cost?: number;
  delay?: number;
}

export interface RiskDefinition {
  id: string;
  name: string;
  likelihood: number; // 1-5
  impact: number;     // 1-5
  undetectability: number; // 1-5
  lead: string;
  trigger: string;
  response: string;
  mitigation: number; // 0-1
  effects: RiskEffects;
}

export interface ScoredRisk extends RiskDefinition {
  raw: number;
  residual: number;
}

export interface TimelineMilestone {
  range: string;
  title: string;
  proof: string;
  leads: string;
  flag: string;
}

export interface FinancialModelParameters {
  netEbitdaMonthly: number[];
  monthlyProgrammeRunning: number[];
  daysReduction: number[];
  cashRecognizedAtM22: number;
  cashRecognizedAtM36: number;
}

export type DistributionTriplet = [number, number, number]; // [low, mode, high]

export interface DistributionParams {
  fill22: DistributionTriplet;
  days22: DistributionTriplet;
  recovery: DistributionTriplet;
  unitContribution: DistributionTriplet;
  separateYield: DistributionTriplet;
  avoided: DistributionTriplet;
  running: DistributionTriplet;
  fillM9Fraction: DistributionTriplet;
  daysM9Fraction: DistributionTriplet;
  ebitdaM9Fraction: DistributionTriplet;
}

export interface WhatIfGateInputs {
  fillRate: number | null;
  inventoryDays: number | null;
  ebitdaRunRate: number | null;
  networkWcRelease: number | null;
}

export interface SimulationControls {
  correlation: number;
  draws: number;
  seed: number;
  valueRealization: number;
  auditMode: boolean;
  touched: {
    '9': Record<string, boolean>;
    '22': Record<string, boolean>;
  };
}

export interface MLTrainingRow {
  fill_pp: number;
  inventory_days_reduced: number;
  recovery_rate: number;
  unit_contribution_cr: number;
  scheduling_yield_cr: number;
  avoided_cost_cr: number;
  running_cost_cr: number;
  risk_rpn: number;
  observed_ebitda_cr: number;
}

export interface MLCrossValidation {
  mae: number;
  rmse: number;
  r2: number | null;
}

export interface MLFittedModel {
  means: number[];
  scales: number[];
  betas: number[]; // intercept at index 0
  lambda: number;
  cv: MLCrossValidation;
  trainedAt: string;
  source: string;
}

export interface MLState {
  blend: number;
  rows: MLTrainingRow[];
  origin: 'SYNTHETIC DEMO' | 'IMPORTED USER CSV';
  lambda: number;
  model: MLFittedModel | null;
}

export interface AegisState {
  meta: {
    title: string;
    source: string;
    dataVersion: string;
    liveConnected: boolean;
    version: string;
  };
  case: CaseData;
  gates: GateDefinition[];
  alloc: InitiativeAllocation[];
  scoreWeights: [number, number, number, number, number];
  observations: ObservationRecord[];
  risks: RiskDefinition[];
  timeline: TimelineMilestone[];
  model: FinancialModelParameters;
  distribution: DistributionParams;
  assumptions: {
    midpointCalibrationRecovery: number;
    simulationDraws: number;
    simulationSeed: number;
    effortBenefitM9: string;
    noPilotCValueBeforeM10: boolean;
  };
  whatIf: {
    '9': WhatIfGateInputs;
    '22': WhatIfGateInputs;
  };
  controls: SimulationControls;
  ml: MLState;
}

export interface SimulationSummary {
  n: number;
  p1: number;
  p2: number;
  both: number;
  cond: number | null;
  q10: number;
  q50: number;
  q90: number;
  samples: number[];
  riskFactor: number;
  ownedFactor: number;
  avgCost: number;
  eventFrequency: number[];
  riskLoss: number[];
  avgDays: number;
}

export interface CashReturnResult {
  c: number[];
  cum: number[];
  irr: number | null;
  pay: number | null;
  npv: number;
  owned22: number;
  owned36: number;
  factor: number;
  wcFactor: number;
}

export interface GateTestResult {
  status: 'ENTERED PASS' | 'NUMERIC PASS' | 'FAIL' | 'UNVERIFIED' | 'INCOMPLETE';
  klass: 'good' | 'bad' | 'hold' | 'none';
  reasons: string[];
}
