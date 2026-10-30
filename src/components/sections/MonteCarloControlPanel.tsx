import React, { useState } from 'react';
import {
  MonteCarloAssumptions,
  ScenarioPresetKey,
  TriangularTriplet,
  UniformRange
} from '../../types/monteCarlo';
import { DEFAULT_MONTE_CARLO_ASSUMPTIONS, SCENARIO_PRESETS } from '../../engines/canonicalMonteCarlo';
import { RotateCcw, Sliders, Info, Zap, Settings, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface MonteCarloControlPanelProps {
  assumptions: MonteCarloAssumptions;
  activePreset: ScenarioPresetKey;
  onApplyPreset: (presetKey: ScenarioPresetKey) => void;
  onUpdateAssumption: <K extends keyof MonteCarloAssumptions>(key: K, value: MonteCarloAssumptions[K]) => void;
  onResetSingle: (key: keyof MonteCarloAssumptions) => void;
  onResetAll: () => void;
  onTriggerFullRun: () => void;
  isSimulating: boolean;
  isLivePreview: boolean;
}

export const MonteCarloControlPanel: React.FC<MonteCarloControlPanelProps> = ({
  assumptions,
  activePreset,
  onApplyPreset,
  onUpdateAssumption,
  onResetSingle,
  onResetAll,
  onTriggerFullRun,
  isSimulating,
  isLivePreview
}) => {
  // Collapsible accordion sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    commercial: true,
    inventory: true,
    manufacturing: true,
    economics: true,
    risk: true,
    controls: true
  });

  const toggleSection = (sec: string) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const isChangedFromDefault = (key: keyof MonteCarloAssumptions): boolean => {
    const curr = JSON.stringify(assumptions[key]);
    const def = JSON.stringify(DEFAULT_MONTE_CARLO_ASSUMPTIONS[key]);
    return curr !== def;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
      {/* Panel Title & Reset All */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#083E84]" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Assumption Control Panel
          </h3>
        </div>

        <button
          onClick={onResetAll}
          title="Reset all assumptions to canonical baseline"
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Preset Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Scenario Presets:</span>
          {activePreset !== 'baseline' && (
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              CUSTOMIZED
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {SCENARIO_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset.id)}
              className={`p-2 rounded-lg text-left text-xs transition-all cursor-pointer border ${
                activePreset === preset.id
                  ? 'bg-[#083E84] text-white border-[#083E84] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold truncate text-[11px]">{preset.name}</div>
              <div className={`text-[9px] truncate ${activePreset === preset.id ? 'text-blue-100' : 'text-slate-500'}`}>
                {preset.tagline}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onTriggerFullRun}
        disabled={isSimulating}
        className="w-full py-2.5 bg-[#083E84] hover:bg-[#062c5e] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Zap className={`w-3.5 h-3.5 text-[#F0C11E] ${isSimulating ? 'animate-bounce' : ''}`} />
        <span>{isSimulating ? 'Simulating 20,000 Runs...' : `RUN ${assumptions.draws.toLocaleString()} ITERATIONS`}</span>
      </button>

      {/* Scrollable Groups */}
      <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
        {/* GROUP A: COMMERCIAL RECOVERY */}
        <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
          <button
            onClick={() => toggleSection('commercial')}
            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span>Group A — Commercial Recovery</span>
              {isChangedFromDefault('demandRecovery') || isChangedFromDefault('fillUpliftM22') ? (
                <span className="w-2 h-2 rounded-full bg-[#F0C11E]" />
              ) : null}
            </div>
            {openSections.commercial ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSections.commercial && (
            <div className="p-3 space-y-3 bg-white">
              {/* Demand Recoverability */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <span>Demand Recovery (Mode)</span>
                    <span className="text-[9px] text-blue-700 bg-blue-50 px-1 rounded">Team assumption</span>
                  </span>
                  <span className="font-mono font-bold text-[#083E84]">
                    {(assumptions.demandRecovery[1] * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={0.75}
                  step={0.01}
                  value={assumptions.demandRecovery[1]}
                  onChange={e => {
                    const mode = Number(e.target.value);
                    const min = Math.max(0.15, mode - 0.10);
                    const max = Math.min(0.85, mode + 0.15);
                    onUpdateAssumption('demandRecovery', [min, mode, max]);
                  }}
                  className="w-full accent-[#083E84] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>Min: {(assumptions.demandRecovery[0] * 100).toFixed(0)}%</span>
                  <span>Max: {(assumptions.demandRecovery[2] * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Month 22 Fill-Rate Uplift */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <span>M22 Fill Uplift (Mode)</span>
                    <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 rounded">Case fact</span>
                  </span>
                  <span className="font-mono font-bold text-[#083E84]">
                    +{assumptions.fillUpliftM22[1].toFixed(1)} pp
                  </span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={12.0}
                  step={0.1}
                  value={assumptions.fillUpliftM22[1]}
                  onChange={e => {
                    const mode = Number(e.target.value);
                    const min = Math.max(1.0, mode - 2.4);
                    const max = Math.min(16.0, mode + 2.6);
                    onUpdateAssumption('fillUpliftM22', [min, mode, max]);
                  }}
                  className="w-full accent-[#083E84] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>Target: +6.0pp (92%)</span>
                  <span>Max: +{assumptions.fillUpliftM22[2].toFixed(1)}pp</span>
                </div>
              </div>

              {/* Month 9 Fill Uplift */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">M9 Fill Uplift (Gate 1)</span>
                  <span className="font-mono font-bold text-[#083E84]">
                    +{assumptions.fillUpliftM9[1].toFixed(1)} pp
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={6.0}
                  step={0.1}
                  value={assumptions.fillUpliftM9[1]}
                  onChange={e => {
                    const mode = Number(e.target.value);
                    onUpdateAssumption('fillUpliftM9', [Math.max(0.5, mode - 2.0), mode, mode + 2.1]);
                  }}
                  className="w-full accent-[#083E84] cursor-pointer"
                />
              </div>

              {/* Contribution per point */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">Contribution / Fill Point</span>
                  <span className="font-mono font-bold text-[#083E84]">
                    ₹{assumptions.unitContribution[0].toFixed(1)}–{assumptions.unitContribution[1].toFixed(1)} Cr
                  </span>
                </div>
                <input
                  type="range"
                  min={7.0}
                  max={14.0}
                  step={0.2}
                  value={assumptions.unitContribution[1]}
                  onChange={e => {
                    const max = Number(e.target.value);
                    onUpdateAssumption('unitContribution', [Math.max(5.0, max - 3.2), max]);
                  }}
                  className="w-full accent-[#083E84] cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* GROUP B: INVENTORY & WORKING CAPITAL */}
        <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
          <button
            onClick={() => toggleSection('inventory')}
            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span>Group B — Inventory & Working Capital</span>
              {isChangedFromDefault('inventoryReductionM22') ? (
                <span className="w-2 h-2 rounded-full bg-[#F0C11E]" />
              ) : null}
            </div>
            {openSections.inventory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSections.inventory && (
            <div className="p-3 space-y-3 bg-white">
              {/* Month 22 Inventory Reduction */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">M22 Days Reduced (Mode)</span>
                  <span className="font-mono font-bold text-[#083E84]">
                    -{assumptions.inventoryReductionM22[1].toFixed(1)} days
                  </span>
                </div>
                <input
                  type="range"
                  min={3.0}
                  max={15.0}
                  step={0.5}
                  value={assumptions.inventoryReductionM22[1]}
                  onChange={e => {
                    const mode = Number(e.target.value);
                    onUpdateAssumption('inventoryReductionM22', [Math.max(1.0, mode - 3.5), mode, mode + 3.5]);
                  }}
                  className="w-full accent-[#083E84] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>Hurdle: -8.0d (≤38d)</span>
                  <span>Est. WC: ₹{(assumptions.inventoryReductionM22[1] * assumptions.networkValuePerDay).toFixed(0)} Cr</span>
                </div>
              </div>

              {/* Month 9 Inventory Reduction */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">M9 Days Reduced (Gate 1)</span>
                  <span className="font-mono font-bold text-[#083E84]">
                    -{assumptions.inventoryReductionM9[1].toFixed(1)} days
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={6.0}
                  step={0.1}
                  value={assumptions.inventoryReductionM9[1]}
                  onChange={e => {
                    const mode = Number(e.target.value);
                    onUpdateAssumption('inventoryReductionM9', [Math.max(0.5, mode - 1.9), mode, mode + 2.1]);
                  }}
                  className="w-full accent-[#083E84] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div>Network Value: <strong>₹26.7 Cr/day</strong></div>
                <div>Owned Value: <strong>₹18.8 Cr/day</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* GROUP C: MANUFACTURING */}
        <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
          <button
            onClick={() => toggleSection('manufacturing')}
            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span>Group C — Manufacturing & Scheduling</span>
              {isChangedFromDefault('schedulingContribution') ? (
                <span className="w-2 h-2 rounded-full bg-[#F0C11E]" />
              ) : null}
            </div>
            {openSections.manufacturing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSections.manufacturing && (
            <div className="p-3 space-y-3 bg-white">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">Scheduling Yield (Mode)</span>
                  <span className="font-mono font-bold text-[#083E84]">
                    ₹{assumptions.schedulingContribution[1].toFixed(1)} Cr
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={25.0}
                  step={0.5}
                  value={assumptions.schedulingContribution[1]}
                  onChange={e => {
                    const mode = Number(e.target.value);
                    onUpdateAssumption('schedulingContribution', [Math.max(0, mode - 9.8), mode, mode + 8.2]);
                  }}
                  className="w-full accent-[#083E84] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>Snacks line changeover efficiency</span>
                  <span>Max: ₹{assumptions.schedulingContribution[2].toFixed(1)} Cr</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GROUP D: OPERATING ECONOMICS */}
        <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
          <button
            onClick={() => toggleSection('economics')}
            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span>Group D — Operating Economics</span>
              {isChangedFromDefault('avoidedFreightCost') || isChangedFromDefault('runningCosts') ? (
                <span className="w-2 h-2 rounded-full bg-[#F0C11E]" />
              ) : null}
            </div>
            {openSections.economics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSections.economics && (
            <div className="p-3 space-y-3 bg-white">
              {/* Avoided freight and expiry */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">Avoided Freight & Expiry</span>
                  <span className="font-mono font-bold text-[#083E84]">
                    ₹{assumptions.avoidedFreightCost[1].toFixed(1)} Cr
                  </span>
                </div>
                <input
                  type="range"
                  min={5.0}
                  max={45.0}
                  step={0.5}
                  value={assumptions.avoidedFreightCost[1]}
                  onChange={e => {
                    const mode = Number(e.target.value);
                    onUpdateAssumption('avoidedFreightCost', [Math.max(2.0, mode - 17.2), mode, mode + 7.8]);
                  }}
                  className="w-full accent-[#083E84] cursor-pointer"
                />
                <span className="text-[9px] text-slate-400 block">Guardrail: Must not exceed 40% of EBITDA</span>
              </div>

              {/* Running costs */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">Annual Running Costs</span>
                  <span className="font-mono font-bold text-rose-700">
                    -₹{assumptions.runningCosts[1].toFixed(1)} Cr
                  </span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={25.0}
                  step={0.5}
                  value={assumptions.runningCosts[1]}
                  onChange={e => {
                    const mode = Number(e.target.value);
                    onUpdateAssumption('runningCosts', [Math.max(1.0, mode - 4.0), mode, mode + 7.0]);
                  }}
                  className="w-full accent-[#083E84] cursor-pointer"
                />
              </div>

              {/* Cash conversion */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">Cash Conversion Rate</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {(assumptions.cashConversion[1] * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.30}
                  max={0.95}
                  step={0.01}
                  value={assumptions.cashConversion[1]}
                  onChange={e => {
                    const mode = Number(e.target.value);
                    onUpdateAssumption('cashConversion', [Math.max(0.20, mode - 0.21), mode, Math.min(0.99, mode + 0.20)]);
                  }}
                  className="w-full accent-[#083E84] cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* GROUP E: IMPLEMENTATION RISK */}
        <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
          <button
            onClick={() => toggleSection('risk')}
            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span>Group E — Implementation Risk</span>
              {isChangedFromDefault('remediationProbability') || isChangedFromDefault('correlationRho') ? (
                <span className="w-2 h-2 rounded-full bg-[#F0C11E]" />
              ) : null}
            </div>
            {openSections.risk ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSections.risk && (
            <div className="p-3 space-y-3 bg-white">
              {/* Remediation Probability */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">G1 Remediation Probability</span>
                  <span className="font-mono font-bold text-[#083E84]">
                    {(assumptions.remediationProbability * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.10}
                  max={0.90}
                  step={0.02}
                  value={assumptions.remediationProbability}
                  onChange={e => onUpdateAssumption('remediationProbability', Number(e.target.value))}
                  className="w-full accent-[#083E84] cursor-pointer"
                />
                <span className="text-[9px] text-slate-400 block">Baseline assumption: 52% retest success</span>
              </div>

              {/* Risk Correlation Rho */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">Copula Correlation (ρ)</span>
                  <span className="font-mono font-bold text-slate-800">
                    {assumptions.correlationRho.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={0.80}
                  step={0.05}
                  value={assumptions.correlationRho}
                  onChange={e => onUpdateAssumption('correlationRho', Number(e.target.value))}
                  className="w-full accent-[#083E84] cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* GROUP F: SIMULATION CONTROLS */}
        <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
          <button
            onClick={() => toggleSection('controls')}
            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 cursor-pointer"
          >
            <span>Group F — Simulation Engine Setup</span>
            {openSections.controls ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSections.controls && (
            <div className="p-3 space-y-3 bg-white">
              {/* Iteration Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-700">Iteration Draws:</span>
                  <span className="font-mono font-bold text-[#083E84]">
                    {assumptions.draws.toLocaleString()} runs
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 font-mono text-[10px]">
                  {[1000, 5000, 10000, 20000, 50000].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => onUpdateAssumption('draws', cnt)}
                      className={`py-1 rounded cursor-pointer border ${
                        assumptions.draws === cnt
                          ? 'bg-[#083E84] text-white font-bold border-[#083E84]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cnt >= 1000 ? `${cnt / 1000}k` : cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seed */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">Random Seed:</span>
                <input
                  type="number"
                  value={assumptions.seed}
                  onChange={e => onUpdateAssumption('seed', Number(e.target.value))}
                  className="w-28 px-2 py-1 font-mono text-xs border border-slate-300 rounded text-right"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
