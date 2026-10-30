import React from 'react';
import { useAegis } from '../../context/AegisContext';
import { formatNum, formatCr } from '../../engines/mathUtils';
import { CheckCircle2, AlertOctagon, AlertTriangle, Shield, ArrowRight, HelpCircle, Dices } from 'lucide-react';

export const GateArbiterSection: React.FC = () => {
  const {
    state,
    g1Result,
    g2Result,
    g1WhatIfResult,
    g2WhatIfResult,
    g1ReadinessObs,
    g2ReadinessObs,
    g1ReadinessWhatIf,
    g2ReadinessWhatIf,
    arbiterVerdict,
    budgetErrors,
    updateWhatIfInput,
    setActiveSection
  } = useAegis();

  const getStatusBadge = (status: string, klass: string) => {
    switch (klass) {
      case 'good':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
      case 'bad':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
      case 'hold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const obs9 = state.observations.find(o => Number(o.month) === 9);
  const obs22 = state.observations.find(o => Number(o.month) === 22);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Decision Rules Engine · Strict Boolean AND
          </div>
          <h2 className="text-xl font-extrabold text-[#082E5F]">
            AEGIS Capital Gate Arbiter & What-If Workbench
          </h2>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setActiveSection('scenario')}
            className="text-xs font-bold text-white bg-[#1465C7] hover:bg-[#083E84] px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5 text-[#F0C11E]" />
            <span>Simulate gate failure in Monte Carlo Lab</span>
          </button>
          <button
            onClick={() => setActiveSection('audit')}
            className="text-xs font-bold text-[#0B376A] bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Record Audited Observations</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Pre-Release Ruling Decision Card */}
      <div className="bg-gradient-to-r from-[#072345] via-[#0B376A] to-[#143B69] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-[#F3BC22] tracking-wider uppercase">
              Pre-Release Advisory Ruling
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">
              {arbiterVerdict.status}
            </h3>
            <p className="text-xs text-slate-200 max-w-3xl leading-relaxed">
              {arbiterVerdict.summary}
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 border border-white/15 min-w-[240px] shrink-0 text-xs">
            <div className="font-bold text-white mb-2 flex items-center justify-between">
              <span>Gate Readiness</span>
              <span className="text-[10px] text-slate-300">Progress to Target</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Gate 1 (M9)</span>
                  <span className="font-mono font-bold">{g1ReadinessWhatIf}% scenario / {obs9 ? `${g1ReadinessObs}% audit` : '—'}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F3BC22] transition-all duration-300" style={{ width: `${g1ReadinessWhatIf}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Gate 2 (M22)</span>
                  <span className="font-mono font-bold">{g2ReadinessWhatIf}% scenario / {obs22 ? `${g2ReadinessObs}% audit` : '—'}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${g2ReadinessWhatIf}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {budgetErrors.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/20 border border-rose-400/40 text-xs text-rose-100 flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
            <div>
              <strong>Budget Reconciliation Hold:</strong> {budgetErrors.join(' · ')}
            </div>
          </div>
        )}
      </div>

      {/* Gate 1 & Gate 2 Hard Gate Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gate 1 Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Month 9 Milestone</div>
              <h3 className="text-base font-bold text-slate-900">Gate 1 · Proof & Initial Release</h3>
            </div>
            {getStatusBadge(g1Result.status, g1Result.klass)}
          </div>

          <div className="text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium">Distributor Fill-Rate</span>
              <div className="text-right font-mono">
                <span className="font-bold text-slate-900">
                  {obs9?.fillRate !== null && obs9?.fillRate !== undefined ? `${obs9.fillRate}%` : '—'}
                </span>
                <span className="text-slate-400 text-[10px] ml-1.5">≥ {state.gates[0].fill}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium">Network Inventory Days</span>
              <div className="text-right font-mono">
                <span className="font-bold text-slate-900">
                  {obs9?.inventoryDays !== null && obs9?.inventoryDays !== undefined ? `${obs9.inventoryDays} d` : '—'}
                </span>
                <span className="text-slate-400 text-[10px] ml-1.5">≤ {state.gates[0].inventory} d</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium">Certified Annual EBITDA</span>
              <div className="text-right font-mono">
                <span className="font-bold text-slate-900">
                  {obs9?.ebitdaRunRate !== null && obs9?.ebitdaRunRate !== undefined ? formatCr(obs9.ebitdaRunRate, 1) : '—'}
                </span>
                <span className="text-slate-400 text-[10px] ml-1.5">≥ {formatCr(state.gates[0].ebitda, 0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="font-medium">Conditional Tranche 2</span>
              <span className="font-bold text-[#0B376A] font-mono">₹{state.gates[0].tranche} Cr</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 leading-normal border border-slate-200">
            <strong className="text-slate-800">Mandatory Rule:</strong> If Gate 1 fails, the second ₹58 Cr tranche is deferred by 2 quarters and operational programme revised.
          </div>
        </div>

        {/* Gate 2 Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Month 22 Milestone</div>
              <h3 className="text-base font-bold text-slate-900">Gate 2 · National Scale & Working Capital</h3>
            </div>
            {getStatusBadge(g2Result.status, g2Result.klass)}
          </div>

          <div className="text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium">Distributor Fill-Rate</span>
              <div className="text-right font-mono">
                <span className="font-bold text-slate-900">
                  {obs22?.fillRate !== null && obs22?.fillRate !== undefined ? `${obs22.fillRate}%` : '—'}
                </span>
                <span className="text-slate-400 text-[10px] ml-1.5">≥ {state.gates[1].fill}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium">Network Inventory Days</span>
              <div className="text-right font-mono">
                <span className="font-bold text-slate-900">
                  {obs22?.inventoryDays !== null && obs22?.inventoryDays !== undefined ? `${obs22.inventoryDays} d` : '—'}
                </span>
                <span className="text-slate-400 text-[10px] ml-1.5">≤ {state.gates[1].inventory} d</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium">Certified Annual EBITDA</span>
              <div className="text-right font-mono">
                <span className="font-bold text-slate-900">
                  {obs22?.ebitdaRunRate !== null && obs22?.ebitdaRunRate !== undefined ? formatCr(obs22.ebitdaRunRate, 1) : '—'}
                </span>
                <span className="text-slate-400 text-[10px] ml-1.5">≥ {formatCr(state.gates[1].ebitda, 0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium">Network WC Cash Release</span>
              <div className="text-right font-mono">
                <span className="font-bold text-slate-900">
                  {obs22?.networkWcRelease !== null && obs22?.networkWcRelease !== undefined ? formatCr(obs22.networkWcRelease, 1) : '—'}
                </span>
                <span className="text-slate-400 text-[10px] ml-1.5">≥ {formatCr(state.gates[1].wc, 0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="font-medium">Conditional Tranche 3</span>
              <span className="font-bold text-[#0B376A] font-mono">₹{state.gates[1].tranche} Cr</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 leading-normal border border-slate-200">
            <strong className="text-slate-800">Mandatory Rule:</strong> If Gate 2 fails, the final ₹58 Cr tranche lapses; project reforecasts with funded scope only.
          </div>
        </div>
      </div>

      {/* Section: What-If Gate Workbench */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">What-If Gate Workbench</h3>
            <p className="text-xs text-slate-500">
              Simulate operational targets before recording official audit evidence. Values entered here condition the stochastic Monte Carlo model.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0B376A] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Scenario Modeling Mode
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* M9 What-If Inputs */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#0B376A]">Month 9 Scenario Inputs</span>
              {getStatusBadge(g1WhatIfResult.status, g1WhatIfResult.klass)}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Fill-Rate (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={state.whatIf['9'].fillRate ?? ''}
                  onChange={e => updateWhatIfInput('9', 'fillRate', e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-md"
                />
                <span className="text-[10px] text-slate-400">Target: ≥89%</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Days
                </label>
                <input
                  type="number"
                  min={0}
                  max={80}
                  step={0.1}
                  value={state.whatIf['9'].inventoryDays ?? ''}
                  onChange={e => updateWhatIfInput('9', 'inventoryDays', e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-md"
                />
                <span className="text-[10px] text-slate-400">Target: ≤43d</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  EBITDA (₹Cr)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={state.whatIf['9'].ebitdaRunRate ?? ''}
                  onChange={e => updateWhatIfInput('9', 'ebitdaRunRate', e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-md"
                />
                <span className="text-[10px] text-slate-400">Target: ≥₹22 Cr</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1">
              Readiness: <strong className="text-slate-800">{g1ReadinessWhatIf}/100</strong> · {g1WhatIfResult.reasons.join(' · ')}
            </div>
          </div>

          {/* M22 What-If Inputs */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#0B376A]">Month 22 Scenario Inputs</span>
              {getStatusBadge(g2WhatIfResult.status, g2WhatIfResult.klass)}
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Fill (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={state.whatIf['22'].fillRate ?? ''}
                  onChange={e => updateWhatIfInput('22', 'fillRate', e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-md"
                />
                <span className="text-[9px] text-slate-400">≥92%</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Days
                </label>
                <input
                  type="number"
                  min={0}
                  max={80}
                  step={0.1}
                  value={state.whatIf['22'].inventoryDays ?? ''}
                  onChange={e => updateWhatIfInput('22', 'inventoryDays', e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-md"
                />
                <span className="text-[9px] text-slate-400">≤38d</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  EBITDA (₹Cr)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  step={0.5}
                  value={state.whatIf['22'].ebitdaRunRate ?? ''}
                  onChange={e => updateWhatIfInput('22', 'ebitdaRunRate', e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-md"
                />
                <span className="text-[9px] text-slate-400">≥₹70 Cr</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  WC Rel (₹Cr)
                </label>
                <input
                  type="number"
                  min={0}
                  max={300}
                  step={1}
                  value={state.whatIf['22'].networkWcRelease ?? ''}
                  onChange={e => updateWhatIfInput('22', 'networkWcRelease', e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-md"
                />
                <span className="text-[9px] text-slate-400">≥₹170 Cr</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1">
              Readiness: <strong className="text-slate-800">{g2ReadinessWhatIf}/100</strong> · {g2WhatIfResult.reasons.join(' · ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
