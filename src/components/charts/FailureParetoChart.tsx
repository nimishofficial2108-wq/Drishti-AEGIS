import React from 'react';
import { FailureRootCauseBucket } from '../../types/monteCarlo';
import { formatPct } from '../../engines/mathUtils';
import { AlertOctagon, ArrowRight, ShieldCheck } from 'lucide-react';

interface FailureParetoChartProps {
  failures: FailureRootCauseBucket[];
}

export const FailureParetoChart: React.FC<FailureParetoChartProps> = ({ failures }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
        <span className="font-semibold text-slate-700">Root-Cause Failure Classification</span>
        <span className="font-mono text-slate-500">Mutually Exclusive Buckets</span>
      </div>

      <div className="space-y-3">
        {failures.map(item => (
          <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <strong className="text-slate-800 font-bold">{item.name}</strong>
              </div>
              <div className="text-right font-mono font-bold text-slate-900">
                {formatPct(item.pct, 1)}{' '}
                <span className="text-[10px] text-slate-500 font-normal">({item.count.toLocaleString()} runs)</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${item.pct * 100}%`, backgroundColor: item.color }}
              />
            </div>

            {/* Actionable guidance */}
            <div className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-800 shrink-0">Management Action:</span>
              <span>{item.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
