import React from 'react';
import { formatCr } from '../../engines/mathUtils';

interface TornadoItem {
  parameter: string;
  lowNPV: number;
  highNPV: number;
  swing: number;
}

interface TornadoChartProps {
  sensitivities: TornadoItem[];
  baseNPV: number;
}

export const TornadoChart: React.FC<TornadoChartProps> = ({ sensitivities, baseNPV }) => {
  if (!sensitivities.length) return null;

  const maxSwing = Math.max(...sensitivities.map(s => s.swing), 1);

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span>Operational & Market Parameter</span>
        <span className="font-mono">Base 5Y NPV: <strong className="text-[#0B376A]">{formatCr(baseNPV, 1)}</strong></span>
      </div>

      <div className="space-y-2.5">
        {sensitivities.map(item => {
          const leftWidth = Math.max(2, ((baseNPV - item.lowNPV) / maxSwing) * 45);
          const rightWidth = Math.max(2, ((item.highNPV - baseNPV) / maxSwing) * 45);

          return (
            <div key={item.parameter} className="text-xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                <span>{item.parameter}</span>
                <span className="font-mono text-slate-500 font-normal">
                  Swing: {formatCr(item.swing, 1)}
                </span>
              </div>

              <div className="flex items-center h-5 bg-slate-100 rounded-md overflow-hidden relative">
                {/* Center marker */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-400 z-10" />

                {/* Downside bar (left of center) */}
                <div className="w-1/2 flex justify-end">
                  <div
                    className="h-full bg-rose-400/80 rounded-l transition-all duration-300"
                    style={{ width: `${Math.min(100, leftWidth * 2)}%` }}
                    title={`Low: ${formatCr(item.lowNPV, 1)}`}
                  />
                </div>

                {/* Upside bar (right of center) */}
                <div className="w-1/2 flex justify-start">
                  <div
                    className="h-full bg-emerald-500/80 rounded-r transition-all duration-300"
                    style={{ width: `${Math.min(100, rightWidth * 2)}%` }}
                    title={`High: ${formatCr(item.highNPV, 1)}`}
                  />
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-0.5">
                <span>Low: {formatCr(item.lowNPV, 1)}</span>
                <span>High: {formatCr(item.highNPV, 1)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
