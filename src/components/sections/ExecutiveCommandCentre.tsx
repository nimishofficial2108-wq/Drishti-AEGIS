import React from 'react';
import { useAegis } from '../../context/AegisContext';
import { formatNum, formatCr, formatPct } from '../../engines/mathUtils';
import { getAverageResidualRisk } from '../../engines/riskEngine';
import {
  TrendingUp,
  Boxes,
  ShieldAlert,
  Coins,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const ExecutiveCommandCentre: React.FC = () => {
  const {
    state,
    scoredRisks,
    arbiterVerdict,
    simulationSummary,
    financialReturns,
    updateBaselineCase,
    restoreCaseBaseline,
    setActiveSection
  } = useAegis();

  const avgResidual = getAverageResidualRisk(scoredRisks);
  const isBaselineModified =
    state.case.fillRate !== 86 || state.case.inventoryDays !== 46;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#072345] via-[#092E59] to-[#143B69] text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#F3BC22] tracking-wider uppercase mb-2">
            <span>Project Drishti · CEO Transformation Office</span>
            <span>·</span>
            <span>FY26–FY31</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            DRISHTI AEGIS <span className="text-[#F3BC22]">4.0</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
            Integrated Risk Foresight · Capital Gate Arbiter · Monte Carlo Financial Stress Lab · Trainable Predictive Intelligence.
            Anticipate operational failure modes, enforce strict funding gates, and protect ACPL enterprise capital.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveSection('arbiter')}
              className="px-4 py-2 bg-[#F3BC22] hover:bg-[#e2ad1b] text-[#082E5F] font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Review Gate Arbiter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveSection('scenario')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-all border border-white/15 cursor-pointer"
            >
              <span>Run Monte Carlo Lab</span>
            </button>
          </div>
        </div>

        {/* Process Flow Badge */}
        <div className="hidden lg:flex absolute right-6 top-6 bottom-6 items-center">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] space-y-2 backdrop-blur-xs">
            <div className="font-bold text-[#F3BC22] uppercase tracking-wider text-[10px]">Governance Architecture</div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span>
              <span>Capture Audited Signals</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">2</span>
              <span>Model Residual Risks (FMEA)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">3</span>
              <span>Stochastic Stress Test</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">4</span>
              <span>Certify Hard Gates</span>
            </div>
            <div className="flex items-center gap-2 text-[#F3BC22] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#F3BC22] text-[#082E5F] flex items-center justify-center text-[10px]">5</span>
              <span>Authorize Tranche Release</span>
            </div>
          </div>
        </div>
      </div>

      {/* Case Integrity Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold text-amber-950">Case Baseline Integrity:</strong> The only observed official case figures are FY26 baseline (86% fill-rate, 46 network inventory days, 10.8% EBITDA margin on ₹8,420 Cr revenue). Editable Month-9/Month-22 workbench fields are <strong>what-if scenarios, not actuals</strong>. Release of Tranche 2 (₹58 Cr) and Tranche 3 (₹58 Cr) requires independent audit certification.
        </div>
      </div>

      {/* Editable Analysis Baseline Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Editable Analysis Baseline</h3>
            <p className="text-xs text-slate-500">
              Adjust what-if starting conditions without altering the official FY26 case record.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isBaselineModified ? (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Active What-If Baseline
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Official Case FY26
              </span>
            )}
            <button
              onClick={restoreCaseBaseline}
              disabled={!isBaselineModified}
              className="text-xs font-semibold text-[#0B376A] hover:underline disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore FY26 (86% / 46d)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fill-Rate Reference (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={state.case.fillRate}
              onChange={e => updateBaselineCase(Number(e.target.value), state.case.inventoryDays)}
              className="w-full px-3 py-1.5 text-xs font-mono font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2677CA] focus:bg-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Case benchmark: 86.0%</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Network Inventory Days
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={state.case.inventoryDays}
              onChange={e => updateBaselineCase(state.case.fillRate, Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs font-mono font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2677CA] focus:bg-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Case benchmark: 46.0 days</span>
          </div>

          <div className="flex flex-col justify-center text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-800">Network Inventory Valuations</div>
            <div className="text-[11px] font-mono mt-0.5">
              1 Network Day = ₹{state.case.networkDayRs} Cr | 1 Owned Day = ₹{state.case.ownedDayRs} Cr
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Total Stock: ₹{state.case.networkInventory} Cr (Owned: ₹{state.case.ownedInventory} Cr)
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Zero-Pill Discipline, Tabular Figures) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="h-1 bg-[#082E5F] absolute top-0 left-0 right-0" />
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fill-Rate Reference</div>
          <div className="text-2xl font-black text-[#082E5F] font-mono mt-1">
            {formatNum(state.case.fillRate, 1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Target G1: 89% · G2: 92%
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="h-1 bg-[#2677CA] absolute top-0 left-0 right-0" />
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Network Inventory</div>
          <div className="text-2xl font-black text-[#0B376A] font-mono mt-1">
            {formatNum(state.case.inventoryDays, 1)} d
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Target G1: 43d · G2: 38d
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="h-1 bg-[#F3BC22] absolute top-0 left-0 right-0" />
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Programme Capital</div>
          <div className="text-2xl font-black text-[#0B376A] font-mono mt-1">
            ₹{state.case.budget} Cr
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Tranches: ₹34 / ₹58 / ₹58 Cr
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="h-1 bg-rose-500 absolute top-0 left-0 right-0" />
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mean Residual RPN</div>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">
            {formatNum(avgResidual, 1)}
            <span className="text-xs font-normal text-slate-400 ml-1">/125</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            R1–R8 FMEA Exposure
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden col-span-2 md:col-span-1">
          <div className="h-1 bg-emerald-500 absolute top-0 left-0 right-0" />
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joint G1 ∩ G2 Pass</div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {simulationSummary ? formatPct(simulationSummary.both, 1) : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Simulated Path Probability
          </div>
        </div>
      </div>

      {/* 2-Column Split: Active Gate Arbiter Verdict & Regional Baseline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arbiter Verdict Box */}
        <div className="bg-gradient-to-br from-[#072345] to-[#123968] rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#F3BC22] tracking-wider uppercase">
                Gate Arbiter · Pre-Release Ruling
              </span>
              <span className="text-xs font-mono text-slate-300">
                Independent Audit Authority
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-2">
              {arbiterVerdict.status}
            </h2>
            <p className="text-xs text-slate-200 leading-relaxed">
              {arbiterVerdict.summary}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
            <div className="text-[11px] text-slate-300">
              <strong className="text-white">Active Risk Priority:</strong> {arbiterVerdict.topRiskAdvice}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[10px] text-slate-400 font-mono">
                Projected 5Y Pre-Tax IRR: <strong className="text-white">{financialReturns.irr ? formatPct(financialReturns.irr, 1) : '—'}</strong> (Hurdle ≥18%)
              </div>
              <button
                onClick={() => setActiveSection('arbiter')}
                className="text-xs font-bold text-[#F3BC22] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Arbiter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Regional Baseline Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">FY26 Regional Operating Snapshot</h2>
              <span className="text-xs text-slate-400 font-medium">5 Operating Zones</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Severe regional skew: North & West suffer low service despite heavy inventory; Central & South demonstrate higher efficiency.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-2">Region</th>
                    <th className="pb-2 text-right">Fill-Rate</th>
                    <th className="pb-2 text-right">Days</th>
                    <th className="pb-2 text-right">Excess (₹Cr)</th>
                    <th className="pb-2 text-right">Shortage (₹Cr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {state.case.regions.map(r => (
                    <tr key={r.name} className="hover:bg-slate-50/70">
                      <td className="py-2 font-sans font-medium text-slate-800">{r.name}</td>
                      <td className={`py-2 text-right ${r.fill < 85 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        {r.fill}%
                      </td>
                      <td className={`py-2 text-right ${r.days > 45 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        {r.days}d
                      </td>
                      <td className="py-2 text-right text-slate-600">₹{r.excess}</td>
                      <td className="py-2 text-right text-slate-600">₹{r.shortage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>North & West comprise 64% of total inventory excess</span>
            <button
              onClick={() => setActiveSection('roadmap')}
              className="text-[#0B376A] font-semibold hover:underline cursor-pointer"
            >
              View Pilot Phasing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
