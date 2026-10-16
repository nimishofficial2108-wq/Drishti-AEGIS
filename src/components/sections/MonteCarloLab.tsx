import React from 'react';
import { useAegis } from '../../context/AegisContext';
import { formatNum, formatPct } from '../../engines/mathUtils';
import { HistogramChart } from '../charts/HistogramChart';
import { DistributionParams } from '../../types/aegis';
import { Play, Sliders, Dices, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';

export const MonteCarloLab: React.FC = () => {
  const {
    state,
    simulationSummary,
    runSimulationNow,
    isSimulating,
    updateSimulationControls,
    updateDistributionTriplet
  } = useAegis();

  const distLabels: Record<keyof DistributionParams, { label: string; unit: string; step: number }> = {
    fill22: { label: 'M22 Fill Uplift', unit: 'pp', step: 0.1 },
    days22: { label: 'Inventory Improvement', unit: 'days', step: 0.1 },
    recovery: { label: 'Stock-out Recovery', unit: 'ratio', step: 0.01 },
    unitContribution: { label: 'Contribution / Point', unit: '₹Cr', step: 0.1 },
    separateYield: { label: 'Scheduling Yield', unit: '₹Cr', step: 0.2 },
    avoided: { label: 'Avoided Costs', unit: '₹Cr', step: 0.5 },
    running: { label: 'Annual Running Costs', unit: '₹Cr', step: 0.5 },
    fillM9Fraction: { label: 'M9 Fill Realization', unit: 'ratio', step: 0.01 },
    daysM9Fraction: { label: 'M9 Days Realization', unit: 'ratio', step: 0.01 },
    ebitdaM9Fraction: { label: 'M9 EBITDA Realization', unit: 'ratio', step: 0.01 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Stochastic Stress Lab · Gaussian Copula & Correlated Shocks
          </div>
          <h2 className="text-xl font-extrabold text-[#082E5F]">
            Monte Carlo Financial Simulation Engine
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runSimulationNow}
            disabled={isSimulating}
            className="px-4 py-2 bg-[#0B376A] hover:bg-[#082E5F] text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#F3BC22] ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Run Seeded Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Primary Simulation Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gate 1 Passing Rate</div>
          <div className="text-2xl font-black text-[#0B376A] font-mono mt-1">
            {simulationSummary ? formatPct(simulationSummary.p1, 1) : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">P(G1) Standalone</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gate 2 Passing Rate</div>
          <div className="text-2xl font-black text-[#0B376A] font-mono mt-1">
            {simulationSummary ? formatPct(simulationSummary.p2, 1) : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">P(G2) Standalone</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joint G1 ∩ G2 Pass</div>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">
            {simulationSummary ? formatPct(simulationSummary.both, 1) : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sequential Tranche Eligibility</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conditional P(G2 | G1)</div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {simulationSummary && simulationSummary.cond !== null ? formatPct(simulationSummary.cond, 1) : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Given G1 Succeeded</div>
        </div>
      </div>

      {/* Main 2-Column Split: Histogram & Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Histogram & Quantile Band */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Annualized EBITDA Benefit Distribution</h3>
              <p className="text-xs text-slate-500">
                Generated from {state.controls.draws.toLocaleString()} seeded trials under Gaussian copula correlation (ρ = {state.controls.correlation}).
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Seed: {state.controls.seed}</span>
          </div>

          {simulationSummary?.samples ? (
            <HistogramChart
              samples={simulationSummary.samples}
              gateHurdle={state.gates[1].ebitda}
              q10={simulationSummary.q10}
              q50={simulationSummary.q50}
              q90={simulationSummary.q90}
              height={260}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
              Simulation data pending...
            </div>
          )}

          {/* Quantile Summary Strip */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 font-mono">
            <div>
              <span className="text-slate-500">P10 (Downside):</span>{' '}
              <strong className="text-rose-700">₹{formatNum(simulationSummary?.q10, 1)} Cr</strong>
            </div>
            <div>
              <span className="text-slate-500">P50 (Median):</span>{' '}
              <strong className="text-[#0B376A]">₹{formatNum(simulationSummary?.q50, 1)} Cr</strong>
            </div>
            <div>
              <span className="text-slate-500">P90 (Upside):</span>{' '}
              <strong className="text-emerald-700">₹{formatNum(simulationSummary?.q90, 1)} Cr</strong>
            </div>
            <div>
              <span className="text-slate-500">Mean Risk Haircut:</span>{' '}
              <strong className="text-slate-800">{formatNum(simulationSummary?.riskFactor, 2)}×</strong>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 leading-normal">
            <strong>Governance Note:</strong> Conditional gate funding enforces strict sequential dependence: Gate 1 must pass before Gate 2 can release Tranche 3. Outcomes reflect stochastic driver sampling and should be treated as sensitivity guidance rather than certainty.
          </div>
        </div>

        {/* Right: Simulation Controls & Sliders */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Stochastic Engine Parameters</h3>
            <span className="text-xs text-slate-400">Interactive Controls</span>
          </div>

          <div className="space-y-3.5">
            {/* Correlation Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Shared-Risk Correlation (ρ)</span>
                <span className="font-mono text-[#0B376A]">{state.controls.correlation.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.85}
                step={0.05}
                value={state.controls.correlation}
                onChange={e => updateSimulationControls({ correlation: Number(e.target.value) })}
                className="w-full accent-[#0B376A] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">
                0 = independent risk shocks; 0.85 = high systemic vulnerability
              </span>
            </div>

            {/* Realization Multiplier */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Value Realization Multiplier</span>
                <span className="font-mono text-[#0B376A]">{state.controls.valueRealization.toFixed(2)}×</span>
              </div>
              <input
                type="range"
                min={0.65}
                max={1.30}
                step={0.05}
                value={state.controls.valueRealization}
                onChange={e => updateSimulationControls({ valueRealization: Number(e.target.value) })}
                className="w-full accent-[#0B376A] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">
                Management execution haircut / capability premium
              </span>
            </div>

            {/* Draws & Seed Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Draws</label>
                <input
                  type="number"
                  min={1000}
                  max={100000}
                  step={5000}
                  value={state.controls.draws}
                  onChange={e => updateSimulationControls({ draws: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deterministic Seed</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={state.controls.seed}
                  onChange={e => updateSimulationControls({ seed: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stochastic Input Distributions (Triangular Low / Mode / High) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Underlying Driver Distributions · Triangular (Low / Mode / High)
            </h3>
            <p className="text-xs text-slate-500">
              Every driver is sampled independently per trial, subject to correlation copula and FMEA risk event impacts.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">10 Stochastic Drivers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {(Object.keys(distLabels) as (keyof DistributionParams)[]).map(key => {
            const meta = distLabels[key];
            const triplet = state.distribution[key];

            return (
              <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800 text-[11px] truncate" title={meta.label}>
                  {meta.label} <span className="text-slate-400 font-normal">({meta.unit})</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Low</span>
                    <input
                      type="number"
                      step={meta.step}
                      value={triplet[0]}
                      onChange={e => updateDistributionTriplet(key, 0, Number(e.target.value))}
                      className="w-full px-1.5 py-1 text-[11px] bg-white border border-slate-300 rounded text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#0B376A] font-bold block">Mode</span>
                    <input
                      type="number"
                      step={meta.step}
                      value={triplet[1]}
                      onChange={e => updateDistributionTriplet(key, 1, Number(e.target.value))}
                      className="w-full px-1.5 py-1 text-[11px] bg-white border border-[#0B376A] rounded text-center font-bold text-[#0B376A]"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">High</span>
                    <input
                      type="number"
                      step={meta.step}
                      value={triplet[2]}
                      onChange={e => updateDistributionTriplet(key, 2, Number(e.target.value))}
                      className="w-full px-1.5 py-1 text-[11px] bg-white border border-slate-300 rounded text-center"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
