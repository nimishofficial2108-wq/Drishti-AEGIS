import React from 'react';
import { SensitivityDriver } from '../../types/monteCarlo';

interface SensitivityTornadoChartProps {
  drivers: SensitivityDriver[];
}

export const SensitivityTornadoChart: React.FC<SensitivityTornadoChartProps> = ({ drivers }) => {
  const maxAbs = Math.max(...drivers.map(d => Math.abs(d.spearmanRho)), 0.75);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
        <span className="font-semibold text-slate-700">Driver Variable (Spearman Rank Correlation against EBITDA)</span>
        <span className="font-mono">Reference Subset: Phase-II Funded</span>
      </div>

      <div className="space-y-2.5">
        {drivers.map(driver => {
          const rho = driver.spearmanRho;
          const isPos = rho >= 0;
          const barPct = (Math.abs(rho) / maxAbs) * 45; // scale to max 45% of width each side

          return (
            <div key={driver.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 text-[11px] truncate pr-2">
                  {driver.label}
                </span>
                <span className="font-mono font-bold text-xs shrink-0" style={{ color: isPos ? '#1465C7' : '#C9474F' }}>
                  {rho >= 0 ? `+${rho.toFixed(2)}` : rho.toFixed(2)}
                </span>
              </div>

              {/* Centered Diverging Bar */}
              <div className="relative h-5 bg-slate-100 rounded flex items-center overflow-hidden">
                {/* Center 0 Axis */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 z-10" />

                {/* Bar */}
                {isPos ? (
                  <div
                    className="absolute left-1/2 h-full bg-[#1465C7] rounded-r transition-all duration-300 flex items-center pl-2"
                    style={{ width: `${barPct}%` }}
                  >
                    <span className="text-[9px] font-mono text-white font-bold opacity-90">
                      {rho.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div
                    className="absolute right-1/2 h-full bg-[#C9474F] rounded-l transition-all duration-300 flex items-center justify-end pr-2"
                    style={{ width: `${barPct}%` }}
                  >
                    <span className="text-[9px] font-mono text-white font-bold opacity-90">
                      {rho.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 pl-1">{driver.description}</div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Negative Correlation (Cost/Delay)</span>
        <span className="text-slate-400">Statistical Association (Not Proof of Causality)</span>
        <span>Positive Correlation (Upside)</span>
      </div>
    </div>
  );
};
