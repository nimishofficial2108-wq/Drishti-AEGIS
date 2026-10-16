import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  AegisState,
  ScoredRisk,
  GateTestResult,
  SimulationSummary,
  CashReturnResult,
  ObservationRecord,
  DistributionParams,
  MLTrainingRow
} from '../types/aegis';
import { INITIAL_AEGIS_STATE } from '../data/initialState';
import { calculateRiskScores } from '../engines/riskEngine';
import { testGateCondition, calculateGateReadiness, validateBudgetEnvelopes, evaluateGateArbiter, GateArbiterVerdict } from '../engines/gateArbiter';
import { runMonteCarloSimulation } from '../engines/monteCarloEngine';
import { calculateFinancialReturns } from '../engines/financialEngine';
import { generateSyntheticDemoDataset, trainMLModel } from '../engines/mlEngine';

const STORAGE_KEY = 'drishti_aegis_4_state_v1';
const SAVED_SCENARIOS_KEY = 'drishti_aegis_4_saved_scenarios';

export interface SavedScenario {
  id: string;
  name: string;
  timestamp: string;
  description: string;
  state: AegisState;
}

interface AegisContextType {
  state: AegisState;
  setState: React.Dispatch<React.SetStateAction<AegisState>>;
  scoredRisks: ScoredRisk[];
  g1Result: GateTestResult;
  g2Result: GateTestResult;
  g1WhatIfResult: GateTestResult;
  g2WhatIfResult: GateTestResult;
  g1ReadinessObs: number;
  g2ReadinessObs: number;
  g1ReadinessWhatIf: number;
  g2ReadinessWhatIf: number;
  budgetErrors: string[];
  arbiterVerdict: GateArbiterVerdict;
  simulationSummary: SimulationSummary | null;
  financialReturns: CashReturnResult;
  isSimulating: boolean;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  // Actions
  updateBaselineCase: (fillRate: number, inventoryDays: number) => void;
  restoreCaseBaseline: () => void;
  updateRisk: (index: number, field: string, value: number) => void;
  updateDistributionTriplet: (key: keyof DistributionParams, index: number, value: number) => void;
  updateAllocation: (itemIdx: number, partIdx: number, value: number) => void;
  updateWhatIfInput: (month: '9' | '22', key: string, value: number | null) => void;
  saveObservation: (obs: ObservationRecord) => void;
  deleteObservation: (month: number) => void;
  updateSimulationControls: (patch: Partial<AegisState['controls']>) => void;
  setMLBlend: (blend: number) => void;
  retrainML: (rows?: MLTrainingRow[], origin?: 'SYNTHETIC DEMO' | 'IMPORTED USER CSV') => boolean;
  resetToCaseDefaults: () => void;
  runSimulationNow: () => void;
  // Scenario Snapshot Manager
  savedScenarios: SavedScenario[];
  saveCurrentScenario: (name: string, description: string) => void;
  loadSavedScenario: (id: string) => void;
  deleteSavedScenario: (id: string) => void;
  exportStateJSON: () => string;
  importStateJSON: (jsonString: string) => void;
}

const AegisContext = createContext<AegisContextType | null>(null);

export const AegisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AegisState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AegisState;
        if (parsed.case && parsed.gates && parsed.risks && parsed.distribution) {
          // Ensure ML demo data exists if empty
          if (!parsed.ml || !parsed.ml.rows?.length) {
            const demoRows = generateSyntheticDemoDataset();
            parsed.ml = {
              blend: 0,
              rows: demoRows,
              origin: 'SYNTHETIC DEMO',
              lambda: 0.75,
              model: null
            };
            parsed.ml.model = trainMLModel(parsed.ml);
          }
          return parsed;
        }
      }
    } catch {
      // Fallback to default
    }

    const initial = structuredClone(INITIAL_AEGIS_STATE);
    initial.ml.rows = generateSyntheticDemoDataset();
    initial.ml.model = trainMLModel(initial.ml);
    return initial;
  });

  const [activeSection, setActiveSection] = useState<string>('overview');
  const [simulationSummary, setSimulationSummary] = useState<SimulationSummary | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_SCENARIOS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage error ignored
    }
  }, [state]);

  // Derived: Scored Risks
  const scoredRisks = useMemo(() => calculateRiskScores(state.risks), [state.risks]);

  // Derived: Observation records
  const obs9 = useMemo(() => state.observations.find(o => Number(o.month) === 9) || null, [state.observations]);
  const obs22 = useMemo(() => state.observations.find(o => Number(o.month) === 22) || null, [state.observations]);

  // Derived: Gate Tests
  const g1Result = useMemo(() => testGateCondition(state.gates[0], obs9, true), [state.gates, obs9]);
  const g2Result = useMemo(() => testGateCondition(state.gates[1], obs22, true), [state.gates, obs22]);

  const g1WhatIfResult = useMemo(() => testGateCondition(state.gates[0], state.whatIf['9'], false), [state.gates, state.whatIf]);
  const g2WhatIfResult = useMemo(() => testGateCondition(state.gates[1], state.whatIf['22'], false), [state.gates, state.whatIf]);

  // Derived: Readiness
  const g1ReadinessObs = useMemo(() => calculateGateReadiness(state.gates[0], obs9, state.case), [state.gates, obs9, state.case]);
  const g2ReadinessObs = useMemo(() => calculateGateReadiness(state.gates[1], obs22, state.case), [state.gates, obs22, state.case]);
  const g1ReadinessWhatIf = useMemo(() => calculateGateReadiness(state.gates[0], state.whatIf['9'], state.case), [state.gates, state.whatIf, state.case]);
  const g2ReadinessWhatIf = useMemo(() => calculateGateReadiness(state.gates[1], state.whatIf['22'], state.case), [state.gates, state.whatIf, state.case]);

  // Derived: Budget Errors
  const budgetErrors = useMemo(() => validateBudgetEnvelopes(state.alloc, state.case.budget), [state.alloc, state.case.budget]);

  // Derived: Arbiter Verdict
  const arbiterVerdict = useMemo(() => evaluateGateArbiter(g1Result, g2Result, budgetErrors, scoredRisks), [g1Result, g2Result, budgetErrors, scoredRisks]);

  // Trigger Monte Carlo simulation
  const runSimulationNow = useCallback(() => {
    setIsSimulating(true);
    // Microtask / small delay to allow UI to show loading state if needed
    setTimeout(() => {
      try {
        const result = runMonteCarloSimulation(state);
        setSimulationSummary(result);
      } catch (err) {
        console.error('Simulation error:', err);
      } finally {
        setIsSimulating(false);
      }
    }, 10);
  }, [state]);

  // Debounced auto-simulation on parameter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulationNow();
    }, 150);
    return () => clearTimeout(timer);
  }, [
    state.controls.correlation,
    state.controls.valueRealization,
    state.controls.draws,
    state.controls.seed,
    state.distribution,
    state.risks,
    state.ml.blend,
    state.ml.model,
    state.whatIf,
    runSimulationNow
  ]);

  // Derived: Financial Returns
  const financialReturns = useMemo(() => calculateFinancialReturns(state, simulationSummary), [state, simulationSummary]);

  // Action: Update baseline case
  const updateBaselineCase = (fillRate: number, inventoryDays: number) => {
    setState(prev => {
      const next = structuredClone(prev);
      const oldFill = next.case.fillRate;
      const oldDays = next.case.inventoryDays;
      next.case.fillRate = fillRate;
      next.case.inventoryDays = inventoryDays;

      // Update whatIf defaults if not touched
      for (const m of ['9', '22'] as const) {
        if (!next.controls.touched?.[m]?.fillRate || next.whatIf[m].fillRate === oldFill) {
          next.whatIf[m].fillRate = fillRate;
        }
        if (!next.controls.touched?.[m]?.inventoryDays || next.whatIf[m].inventoryDays === oldDays) {
          next.whatIf[m].inventoryDays = inventoryDays;
        }
      }
      return next;
    });
  };

  const restoreCaseBaseline = () => {
    setState(prev => {
      const next = structuredClone(prev);
      next.case.fillRate = INITIAL_AEGIS_STATE.case.fillRate;
      next.case.inventoryDays = INITIAL_AEGIS_STATE.case.inventoryDays;
      for (const m of ['9', '22'] as const) {
        if (!next.controls.touched?.[m]?.fillRate) next.whatIf[m].fillRate = INITIAL_AEGIS_STATE.case.fillRate;
        if (!next.controls.touched?.[m]?.inventoryDays) next.whatIf[m].inventoryDays = INITIAL_AEGIS_STATE.case.inventoryDays;
      }
      return next;
    });
  };

  const updateRisk = (index: number, field: string, value: number) => {
    setState(prev => {
      const next = structuredClone(prev);
      (next.risks[index] as unknown as Record<string, number>)[field] = value;
      return next;
    });
  };

  const updateDistributionTriplet = (key: keyof DistributionParams, index: number, value: number) => {
    setState(prev => {
      const next = structuredClone(prev);
      next.distribution[key][index] = value;
      return next;
    });
  };

  const updateAllocation = (itemIdx: number, partIdx: number, value: number) => {
    setState(prev => {
      const next = structuredClone(prev);
      if (partIdx === 0) {
        next.alloc[itemIdx].total = value;
      } else {
        next.alloc[itemIdx].phase[partIdx - 1] = value;
      }
      return next;
    });
  };

  const updateWhatIfInput = (month: '9' | '22', key: string, value: number | null) => {
    setState(prev => {
      const next = structuredClone(prev);
      (next.whatIf[month] as unknown as Record<string, number | null>)[key] = value;
      if (!next.controls.touched) next.controls.touched = { '9': {}, '22': {} };
      if (!next.controls.touched[month]) next.controls.touched[month] = {};
      next.controls.touched[month][key] = true;
      return next;
    });
  };

  const saveObservation = (obs: ObservationRecord) => {
    setState(prev => {
      const next = structuredClone(prev);
      next.observations = next.observations.filter(o => Number(o.month) !== Number(obs.month));
      next.observations.push(obs);
      return next;
    });
  };

  const deleteObservation = (month: number) => {
    setState(prev => {
      const next = structuredClone(prev);
      next.observations = next.observations.filter(o => Number(o.month) !== month);
      return next;
    });
  };

  const updateSimulationControls = (patch: Partial<AegisState['controls']>) => {
    setState(prev => ({
      ...prev,
      controls: { ...prev.controls, ...patch }
    }));
  };

  const setMLBlend = (blend: number) => {
    setState(prev => {
      const next = structuredClone(prev);
      next.ml.blend = blend;
      return next;
    });
  };

  const retrainML = (rows?: MLTrainingRow[], origin?: 'SYNTHETIC DEMO' | 'IMPORTED USER CSV'): boolean => {
    let success = false;
    setState(prev => {
      const next = structuredClone(prev);
      if (rows) {
        next.ml.rows = rows;
      }
      if (origin) {
        next.ml.origin = origin;
      }
      const model = trainMLModel(next.ml);
      if (model) {
        next.ml.model = model;
        success = true;
      }
      return next;
    });
    return success;
  };

  const resetToCaseDefaults = () => {
    const initial = structuredClone(INITIAL_AEGIS_STATE);
    initial.ml.rows = generateSyntheticDemoDataset();
    initial.ml.model = trainMLModel(initial.ml);
    setState(initial);
  };

  // Scenario Snapshot Manager
  const saveCurrentScenario = (name: string, description: string) => {
    const newScenario: SavedScenario = {
      id: 'scen_' + Date.now(),
      name,
      description,
      timestamp: new Date().toISOString(),
      state: structuredClone(state)
    };
    const updated = [newScenario, ...savedScenarios];
    setSavedScenarios(updated);
    localStorage.setItem(SAVED_SCENARIOS_KEY, JSON.stringify(updated));
  };

  const loadSavedScenario = (id: string) => {
    const scen = savedScenarios.find(s => s.id === id);
    if (scen) {
      setState(structuredClone(scen.state));
    }
  };

  const deleteSavedScenario = (id: string) => {
    const updated = savedScenarios.filter(s => s.id !== id);
    setSavedScenarios(updated);
    localStorage.setItem(SAVED_SCENARIOS_KEY, JSON.stringify(updated));
  };

  const exportStateJSON = () => {
    return JSON.stringify(state, null, 2);
  };

  const importStateJSON = (jsonString: string) => {
    const parsed = JSON.parse(jsonString) as AegisState;
    if (!parsed.case || !Array.isArray(parsed.gates) || !Array.isArray(parsed.risks) || !parsed.distribution) {
      throw new Error('Invalid JSON format: Missing mandatory case, gates, risks, or distribution structures.');
    }
    if (!parsed.ml?.rows?.length) {
      parsed.ml = {
        blend: 0,
        rows: generateSyntheticDemoDataset(),
        origin: 'SYNTHETIC DEMO',
        lambda: 0.75,
        model: null
      };
      parsed.ml.model = trainMLModel(parsed.ml);
    }
    setState(parsed);
  };

  return (
    <AegisContext.Provider
      value={{
        state,
        setState,
        scoredRisks,
        g1Result,
        g2Result,
        g1WhatIfResult,
        g2WhatIfResult,
        g1ReadinessObs,
        g2ReadinessObs,
        g1ReadinessWhatIf,
        g2ReadinessWhatIf,
        budgetErrors,
        arbiterVerdict,
        simulationSummary,
        financialReturns,
        isSimulating,
        activeSection,
        setActiveSection,
        updateBaselineCase,
        restoreCaseBaseline,
        updateRisk,
        updateDistributionTriplet,
        updateAllocation,
        updateWhatIfInput,
        saveObservation,
        deleteObservation,
        updateSimulationControls,
        setMLBlend,
        retrainML,
        resetToCaseDefaults,
        runSimulationNow,
        savedScenarios,
        saveCurrentScenario,
        loadSavedScenario,
        deleteSavedScenario,
        exportStateJSON,
        importStateJSON
      }}
    >
      {children}
    </AegisContext.Provider>
  );
};

export const useAegis = (): AegisContextType => {
  const ctx = useContext(AegisContext);
  if (!ctx) {
    throw new Error('useAegis must be used within an AegisProvider');
  }
  return ctx;
};
