import React from 'react';
import { HeatmapCell } from '../../types/monteCarlo';
import { formatCr } from '../../engines/mathUtils';

interface TwoFactorHeatmapProps {
  heatmapData: {
    recoveryLabels: number[];
    schedulingLabels: number[];
    grid: HeatmapCell[][];
  };
}

export const TwoFactorHeatmap: React.FC<TwoFactorHeatmapProps> = ({ heatmapData }) => {
  const { recoveryLabels, schedulingLabels, grid } = heatmapData;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
        <span className="font-semibold text-slate-700">Two-Factor Sensitivity: Demand Recovery vs Scheduling Benefit</span>
        <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          ₹70 Cr Gate 2 Hurdle Boundary
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-500 font-medium">Recovery \ Scheduling</th>
              {schedulingLabels.map(s => (
                <th key={s} className="p-2 font-mono font-bold text-slate-700">
                  ₹{s} Cr
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, rIdx) => {
              const rVal = recoveryLabels[rIdx];
              return (
                <tr key={rVal}>
                  <td className="p-2 text-left font-mono font-bold text-slate-700 bg-slate-50 border-r border-slate-200">
                    {(rVal * 100).toFixed(0)}%
                  </td>
                  {row.map(cell => {
                    const passes = cell.ebitda >= 70;
                    return (
                      <td
                        key={`${cell.recovery}-${cell.scheduling}`}
                        className={`p-2.5 font-mono text-xs border border-slate-200/80 transition-colors ${
                          passes
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                        title={`Demand Recovery: ${(cell.recovery * 100).toFixed(0)}%, Scheduling: ₹${cell.scheduling}Cr -> Annualized EBITDA: ₹${cell.ebitda}Cr`}
                      >
                        ₹{cell.ebitda}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600" />
            <span>Passes ₹70 Cr Hurdle</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
            <span>Fails Gate 2 Hurdle</span>
          </span>
        </div>
        <span className="font-mono text-slate-400">Values represent conditional annualized EBITDA</span>
      </div>
    </div>
  );
};
