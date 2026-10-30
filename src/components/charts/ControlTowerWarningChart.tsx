import React from 'react';
import { EarlyWarningMetrics } from '../../types/monteCarlo';
import { formatPct } from '../../engines/mathUtils';
import { BellRing, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

interface ControlTowerWarningChartProps {
  metrics: EarlyWarningMetrics;
}

export const ControlTowerWarningChart: React.FC<ControlTowerWarningChartProps> = ({ metrics }) => {
  return (
    <div className="space-y-4">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            Early Warning Trigger
          </div>
          <div className="text-xl font-extrabold text-[#083E84] font-mono mt-1">
            {formatPct(metrics.triggerPct, 1)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Scenarios Alerted</div>
        </div>

        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
          <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
            Model Warning Recall
          </div>
          <div className="text-xl font-extrabold text-[#1465C7] font-mono mt-1">
            {formatPct(metrics.modelRecall, 1)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Unsuccessful Gate Capture</div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
            Alert Precision
          </div>
          <div className="text-xl font-extrabold text-slate-800 font-mono mt-1">
            {formatPct(metrics.modelPrecision, 1)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">True Positive Signal</div>
        </div>
      </div>

      {/* Leading Risk Indicators list */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Top Leading Operational Risk Signals (M4–M6)
        </div>

        {metrics.leadIndicators.map(item => (
          <div
            key={item.indicator}
            className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <BellRing className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold text-slate-800 truncate">{item.indicator}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
              <span className="text-blue-700 font-bold">ρ = {item.correlation.toFixed(2)}</span>
              <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-sans">
                {item.leadTimeWeeks}w lead
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Governance Caveat:</strong> Early warning signals identify emerging operational stress in advance. Alerts do not themselves eliminate risk unless accompanied by an actionable, verified management intervention.
        </div>
      </div>
    </div>
  );
};
