import React, { useState } from 'react';
import { ScoredRisk } from '../../types/aegis';
import { formatNum } from '../../engines/mathUtils';

interface RiskHeatmapProps {
  risks: ScoredRisk[];
  onSelectRisk?: (risk: ScoredRisk) => void;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ risks, onSelectRisk }) => {
  const [hoveredRisk, setHoveredRisk] = useState<ScoredRisk | null>(null);

  // 5x5 grid cells: likelihood (Y: 5 down to 1), impact (X: 1 to 5)
  // Background severity color function
  const getCellColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 16) return 'bg-rose-100/70 border-rose-200';
    if (score >= 10) return 'bg-amber-100/60 border-amber-200';
    if (score >= 6) return 'bg-sky-50 border-sky-200';
    return 'bg-emerald-50/50 border-emerald-100';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-slate-700">FMEA 5×5 Probability-Impact Matrix</span>
        <span className="text-[11px]">Residual RPN = O × S × D × (1 - 0.75M)</span>
      </div>

      <div className="relative border border-slate-200 rounded-lg p-3 bg-white">
        {/* Y Axis Label */}
        <div className="absolute -left-7 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-400 tracking-wider">
          OCCURRENCE (1–5)
        </div>

        <div className="grid grid-rows-5 gap-1.5 ml-2">
          {[5, 4, 3, 2, 1].map(l => (
            <div key={`row-${l}`} className="grid grid-cols-5 gap-1.5 h-10">
              {[1, 2, 3, 4, 5].map(imp => {
                const matchingRisks = risks.filter(
                  r => Math.round(r.likelihood) === l && Math.round(r.impact) === imp
                );
                const cellBg = getCellColor(l, imp);

                return (
                  <div
                    key={`cell-${l}-${imp}`}
                    className={`rounded border flex items-center justify-center gap-1 p-1 relative transition-colors ${cellBg}`}
                  >
                    {matchingRisks.map(r => (
                      <button
                        key={r.id}
                        onClick={() => onSelectRisk?.(r)}
                        onMouseEnter={() => setHoveredRisk(r)}
                        onMouseLeave={() => setHoveredRisk(null)}
                        className={`w-6 h-6 rounded text-[10px] font-extrabold flex items-center justify-center shadow-xs cursor-pointer transition-transform hover:scale-115 ${
                          r.residual >= 60
                            ? 'bg-rose-700 text-white'
                            : r.residual >= 35
                            ? 'bg-amber-600 text-white'
                            : 'bg-[#0B376A] text-white'
                        }`}
                        title={`${r.id}: ${r.name} (Residual RPN: ${r.residual.toFixed(1)})`}
                      >
                        {r.id}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* X Axis Label */}
        <div className="mt-2 text-center text-[10px] font-bold text-slate-400 tracking-wider">
          SEVERITY / IMPACT (1–5)
        </div>
      </div>

      {/* Tooltip / Details card */}
      {hoveredRisk && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#0B376A]">
              {hoveredRisk.id} · {hoveredRisk.name}
            </span>
            <span className="font-mono font-bold text-slate-700">
              Residual RPN: {formatNum(hoveredRisk.residual, 1)} / 125
            </span>
          </div>
          <div className="text-[11px] text-slate-600 leading-normal">
            <strong className="text-slate-700">Trigger:</strong> {hoveredRisk.trigger}
          </div>
          <div className="text-[11px] text-slate-600 leading-normal">
            <strong className="text-slate-700">Mitigation:</strong> {hoveredRisk.response}
          </div>
        </div>
      )}
    </div>
  );
};
