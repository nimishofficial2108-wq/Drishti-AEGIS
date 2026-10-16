import React from 'react';
import { useAegis } from '../../context/AegisContext';
import { formatNum, formatCr } from '../../engines/mathUtils';
import { calculateBudgetTotals } from '../../engines/gateArbiter';
import { Coins, Milestone, CheckCircle2, AlertOctagon, HelpCircle, ShieldX } from 'lucide-react';

export const CapitalRoadmapSection: React.FC = () => {
  const { state, updateAllocation, budgetErrors } = useAegis();

  const totals = calculateBudgetTotals(state.alloc);
  const weights = state.scoreWeights;

  const calculateWeightedScore = (scores: [number, number, number, number, number]): number => {
    return scores.reduce((acc, score, idx) => acc + score * weights[idx], 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Capital Governance & Strategic Roadmap · ₹150 Cr Envelope
          </div>
          <h2 className="text-xl font-extrabold text-[#082E5F]">
            Initiative Allocation & 36-Month Milestone Roadmap
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {budgetErrors.length === 0 ? (
            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              ₹150 Cr ENVELOPE RECONCILED (34 / 58 / 58)
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-50 text-rose-800 border border-rose-200">
              ALLOCATION RECONCILIATION ERROR
            </span>
          )}
        </div>
      </div>

      {/* Tranche Envelope Visual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Programme</div>
          <div className="text-2xl font-black text-[#082E5F] font-mono mt-1">
            {formatCr(totals[0], 1)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Mandatory: ₹150.0 Cr</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tranche 1 (M0–9)</div>
          <div className="text-2xl font-black text-[#0B376A] font-mono mt-1">
            {formatCr(totals[1], 1)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Mandatory: ₹34.0 Cr (Prove)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tranche 2 (M10–21)</div>
          <div className="text-2xl font-black text-[#0B376A] font-mono mt-1">
            {formatCr(totals[2], 1)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Conditional Gate 1: ₹58.0 Cr</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tranche 3 (M22–36)</div>
          <div className="text-2xl font-black text-[#0B376A] font-mono mt-1">
            {formatCr(totals[3], 1)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Conditional Gate 2: ₹58.0 Cr</div>
        </div>
      </div>

      {budgetErrors.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>Budget Discrepancies Detected:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            {budgetErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Editable Initiative Allocation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Initiative Investment Allocation & Prioritization</h3>
            <p className="text-xs text-slate-500">
              Weights: Gate Impact (35%), Risk-Adjusted Value (25%), Evidence (15%), Speed (15%), Unlocking (10%).
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">8 Strategic Initiatives</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Initiative</th>
                <th className="py-2.5 px-3 text-right">Total (₹Cr)</th>
                <th className="py-2.5 px-3 text-right">M0–9</th>
                <th className="py-2.5 px-3 text-right">M10–21</th>
                <th className="py-2.5 px-3 text-right">M22–36</th>
                <th className="py-2.5 px-3 text-right">Priority Score</th>
                <th className="py-2.5 px-3">Primary Evidence Deliverable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.alloc.map((item, idx) => {
                const priority = calculateWeightedScore(item.scores);
                return (
                  <tr key={item.name} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step={0.5}
                        min={0}
                        value={item.total}
                        onChange={e => updateAllocation(idx, 0, Number(e.target.value))}
                        className="w-16 px-1.5 py-1 text-right font-mono font-bold bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step={0.5}
                        min={0}
                        value={item.phase[0]}
                        onChange={e => updateAllocation(idx, 1, Number(e.target.value))}
                        className="w-14 px-1.5 py-1 text-right font-mono bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step={0.5}
                        min={0}
                        value={item.phase[1]}
                        onChange={e => updateAllocation(idx, 2, Number(e.target.value))}
                        className="w-14 px-1.5 py-1 text-right font-mono bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step={0.5}
                        min={0}
                        value={item.phase[2]}
                        onChange={e => updateAllocation(idx, 3, Number(e.target.value))}
                        className="w-14 px-1.5 py-1 text-right font-mono bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0B376A]">
                      {priority.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate" title={item.proof}>
                      {item.proof}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-amber-50/70 border-t-2 border-slate-300 font-mono font-bold text-xs text-slate-900">
                <td className="py-2.5 px-3 font-sans">TOTALS</td>
                <td className="py-2.5 px-3 text-right text-[#082E5F]">{formatCr(totals[0], 1)}</td>
                <td className="py-2.5 px-3 text-right">{formatCr(totals[1], 1)}</td>
                <td className="py-2.5 px-3 text-right">{formatCr(totals[2], 1)}</td>
                <td className="py-2.5 px-3 text-right">{formatCr(totals[3], 1)}</td>
                <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                <td className="py-2.5 px-3 text-slate-500 font-sans font-normal text-[11px]">
                  Target: ₹150 Cr total (₹34 / ₹58 / ₹58)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Disclosures: Deliberately Unfunded Scope Alternatives */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
          <ShieldX className="w-4 h-4 text-rose-600" />
          <span>Strategic Exclusions & Deliberately Unfunded Alternatives</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          To maintain strict capital discipline and prevent dilution of management focus, the following vendor and internal proposals have been explicitly excluded from the ₹150 Cr baseline:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <strong className="text-slate-900 block font-semibold">Plant C Capacity Expansion</strong>
            <span className="text-rose-600 font-mono font-bold text-[11px]">₹46 Cr Excluded</span>
            <p className="text-[10px] text-slate-500 mt-1">
              Premature until changeover sequencing, SMED, and existing capacity yields are certified.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <strong className="text-slate-900 block font-semibold">Full National Replenishment</strong>
            <span className="text-rose-600 font-mono font-bold text-[11px]">₹106 Cr Excluded</span>
            <p className="text-[10px] text-slate-500 mt-1">
              Phased instead: focus ₹52 Cr on distressed North & West zones before expanding nationally.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <strong className="text-slate-900 block font-semibold">Standalone Forecasting AI</strong>
            <span className="text-rose-600 font-mono font-bold text-[11px]">₹22 Cr Excluded</span>
            <p className="text-[10px] text-slate-500 mt-1">
              Replaced by clean POS feeds, commercial fast-response, and S&OP bias discipline.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <strong className="text-slate-900 block font-semibold">Full Digital Twin Suite</strong>
            <span className="text-rose-600 font-mono font-bold text-[11px]">₹55 Cr Excluded</span>
            <p className="text-[10px] text-slate-500 mt-1">
              Replaced by actionable supply-chain control tower with explicit exception closure rights.
            </p>
          </div>
        </div>
      </div>

      {/* 36-Month Milestone Execution Roadmap */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">36-Month Implementation & Governance Timeline</h3>
            <p className="text-xs text-slate-500">
              Three Distinct Execution Phases: Prove (M0–9) → Scale (M10–22) → Institutionalize (M23–36).
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">8 Stage Milestones</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.timeline.map((step, idx) => {
            const phaseTag = idx < 4 ? 'PROVE' : idx < 7 ? 'SCALE' : 'INSTITUTIONALIZE';
            const phaseColors =
              idx < 4
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : idx < 7
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200';

            return (
              <div key={step.range} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="font-bold text-xs text-[#0B376A]">
                    {step.range} · {step.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${phaseColors}`}>
                    {phaseTag}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-normal">{step.proof}</p>

                <div className="pt-1 flex flex-col gap-0.5 text-[11px] text-slate-500">
                  <div>
                    <strong className="text-slate-700">Accountable Leads:</strong> {step.leads}
                  </div>
                  <div className="text-amber-800">
                    <strong className="text-amber-900">Governance Trigger:</strong> {step.flag}
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
