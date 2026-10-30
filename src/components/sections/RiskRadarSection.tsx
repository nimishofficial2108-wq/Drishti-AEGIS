import React, { useState } from 'react';
import { useAegis } from '../../context/AegisContext';
import { formatNum } from '../../engines/mathUtils';
import { getRiskLevel, getRiskLevelColor, getRankedRisks } from '../../engines/riskEngine';
import { RiskHeatmap } from '../charts/RiskHeatmap';
import { ScoredRisk } from '../../types/aegis';
import { ShieldAlert, AlertTriangle, CheckCircle2, Sliders, ChevronDown, ChevronUp, Dices } from 'lucide-react';

export const RiskRadarSection: React.FC = () => {
  const { scoredRisks, updateRisk, setActiveSection } = useAegis();
  const [selectedRisk, setSelectedRisk] = useState<ScoredRisk | null>(null);
  const [expandedRiskId, setExpandedRiskId] = useState<string | null>(null);

  const ranked = getRankedRisks(scoredRisks);
  const criticalCount = scoredRisks.filter(r => r.residual >= 60).length;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Enterprise Risk Shield · FMEA Framework
          </div>
          <h2 className="text-xl font-extrabold text-[#082E5F]">
            AEGIS Risk Radar (R1–R8)
          </h2>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            {criticalCount} Critical Exposures (RPN ≥ 60)
          </span>
          <button
            onClick={() => setActiveSection('scenario')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1465C7] text-white hover:bg-[#083E84] active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5 text-[#F0C11E]" />
            <span>Open Monte Carlo risk assessment</span>
          </button>
        </div>
      </div>

      {/* Top 2-Column Split: FMEA Heatmap & Ranked Residuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <RiskHeatmap risks={scoredRisks} onSelectRisk={r => setSelectedRisk(r)} />
        </div>

        {/* Priority Ranking & Top Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Ranked Residual Risk Priority</h3>
              <span className="text-xs text-slate-400">Max Score: 125</span>
            </div>

            <div className="space-y-2">
              {ranked.map(r => {
                const colors = getRiskLevelColor(r.residual);
                const pctOfMax = Math.min(100, (r.residual / 125) * 100);

                return (
                  <div key={r.id} className="text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-semibold text-slate-800">
                        {r.id} · {r.name}
                      </span>
                      <span className={`font-mono font-bold ${colors.text}`}>
                        {formatNum(r.residual, 1)} / 125
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          r.residual >= 60
                            ? 'bg-rose-600'
                            : r.residual >= 35
                            ? 'bg-amber-500'
                            : 'bg-[#2677CA]'
                        }`}
                        style={{ width: `${pctOfMax}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Remediation Highlights */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Priority Remediation Actions
            </div>
            <div className="space-y-1.5">
              {ranked.slice(0, 3).map(r => (
                <div key={r.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0B376A] text-white shrink-0">
                    {r.id}
                  </span>
                  <div className="leading-snug">
                    <strong className="text-slate-900">{r.name}:</strong>{' '}
                    <span className="text-slate-600">{r.response}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* R1–R8 Interactive Assessment Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Interactive FMEA Scoring & Operational Controls
          </h3>
          <span className="text-xs text-slate-500">
            Raw RPN = O × S × D · Residual = Raw × (1 - 0.75 × Mitigation)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scoredRisks.map((r, idx) => {
            const isHigh = r.residual >= 60;
            const colors = getRiskLevelColor(r.residual);
            const isExpanded = expandedRiskId === r.id;

            return (
              <div
                key={r.id}
                className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${
                  isHigh ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0B376A] text-white">
                        {r.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{r.name}</h4>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Lead Owner: <strong className="text-slate-600">{r.lead}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono ${colors.badge}`}>
                      Residual: {formatNum(r.residual, 1)}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Raw: {r.raw}
                    </div>
                  </div>
                </div>

                {/* 4 Interactive Parameter Sliders */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                  {/* Occurrence */}
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-0.5">
                      <span>Occurrence</span>
                      <span className="font-mono font-bold text-[#0B376A]">{r.likelihood}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={r.likelihood}
                      onChange={e => updateRisk(idx, 'likelihood', Number(e.target.value))}
                      className="w-full accent-[#0B376A] cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-400 block text-right">1 (rare) – 5 (frequent)</span>
                  </div>

                  {/* Severity */}
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-0.5">
                      <span>Severity</span>
                      <span className="font-mono font-bold text-[#0B376A]">{r.impact}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={r.impact}
                      onChange={e => updateRisk(idx, 'impact', Number(e.target.value))}
                      className="w-full accent-[#0B376A] cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-400 block text-right">1 (low) – 5 (critical)</span>
                  </div>

                  {/* Undetectability */}
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-0.5">
                      <span>Detection Gap</span>
                      <span className="font-mono font-bold text-[#0B376A]">{r.undetectability}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={r.undetectability}
                      onChange={e => updateRisk(idx, 'undetectability', Number(e.target.value))}
                      className="w-full accent-[#0B376A] cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-400 block text-right">1 (obvious) – 5 (hidden)</span>
                  </div>

                  {/* Mitigation */}
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-0.5">
                      <span>Mitigation %</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {Math.round(r.mitigation * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={r.mitigation}
                      onChange={e => updateRisk(idx, 'mitigation', Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-400 block text-right">0% – 100% control</span>
                  </div>
                </div>

                {/* Details toggle */}
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedRiskId(isExpanded ? null : r.id)}
                    className="text-[11px] text-slate-500 hover:text-[#0B376A] font-semibold flex items-center justify-between w-full cursor-pointer"
                  >
                    <span>Trigger & Response Protocol</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 text-xs space-y-1.5 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <strong className="text-slate-800">Operational Trigger:</strong> {r.trigger}
                      </div>
                      <div>
                        <strong className="text-slate-800">Mitigation Strategy:</strong> {r.response}
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 font-mono">
                        Model Impact Effects:{' '}
                        {Object.entries(r.effects || {})
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ') || 'Standard variance'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
