import React, { useState } from 'react';
import { GateFunnelMetrics } from '../../types/monteCarlo';
import { formatNum, formatPct } from '../../engines/mathUtils';
import { ArrowDown, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

interface GateFunnelChartProps {
  metrics: GateFunnelMetrics;
}

export const GateFunnelChart: React.FC<GateFunnelChartProps> = ({ metrics }) => {
  const [hoveredDonutIdx, setHoveredDonutIdx] = useState<number | null>(null);

  // Donut SVG parameters
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      {/* Left: Sequential Funding Funnel (7 cols) */}
      <div className="md:col-span-7 space-y-3">
        {/* Stage 1: All Scenarios */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#083E84] text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <strong className="text-xs text-slate-900 font-bold">Total Evaluated Scenarios</strong>
            </div>
            <div className="text-right font-mono">
              <div className="text-sm font-extrabold text-[#083E84]">
                {metrics.total.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">100.0% Base Population</div>
            </div>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Initial ₹34 Cr Tranche 1 committed at Month 0
          </div>
        </div>

        <div className="flex justify-center -my-1">
          <ArrowDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Stage 2: Gate 1 Outcome */}
        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1465C7] text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <div>
                <strong className="text-xs text-[#083E84] font-bold">Gate 1 Milestone (Month 9)</strong>
                <div className="text-[10px] text-slate-500">Criteria: Fill ≥89% · Days ≤43 · EBITDA ≥₹22Cr</div>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-sm font-extrabold text-[#1465C7]">
                {formatPct(metrics.g1OnTimePct, 1)}
              </div>
              <div className="text-[10px] text-slate-600">
                {metrics.g1OnTimeCount.toLocaleString()} On-Time Passes
              </div>
            </div>
          </div>

          {/* Remediation sub-bar */}
          <div className="p-2 bg-white rounded-lg border border-blue-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Remediated at M16 (52% assumption):</span>
            </span>
            <span className="font-mono font-bold text-amber-700">
              +{formatPct(metrics.g1RemediatedPct, 1)} ({metrics.g1RemediatedCount.toLocaleString()})
            </span>
          </div>
        </div>

        <div className="flex justify-center -my-1">
          <ArrowDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Stage 3: Gate 2 & Full ₹150 Cr */}
        <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#F0C11E] text-[#083E84] font-black text-xs flex items-center justify-center">
                3
              </span>
              <div>
                <strong className="text-xs text-slate-900 font-bold">Gate 2 & Full ₹150 Cr Deployment</strong>
                <div className="text-[10px] text-slate-500">Month 22: Fill ≥92% · Days ≤38 · EBITDA ≥₹70Cr · WC ≥₹170Cr</div>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-sm font-extrabold text-[#083E84]">
                {formatPct(metrics.g2PassPct, 1)}
              </div>
              <div className="text-[10px] text-slate-600">
                {metrics.g2PassCount.toLocaleString()} Fully Funded
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: 100% Exclusive Outcomes Donut (5 cols) */}
      <div className="md:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Mutually Exclusive Outcomes (100%)
        </h4>

        <div className="relative flex items-center justify-center my-2">
          <svg width={size} height={size} className="transform -rotate-90">
            {metrics.exclusiveDonut.map((segment, idx) => {
              const dashLength = segment.pct * circumference;
              const dashOffset = -accumulatedPercent * circumference;
              accumulatedPercent += segment.pct;
              const isHovered = hoveredDonutIdx === idx;

              return (
                <circle
                  key={segment.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  onMouseEnter={() => setHoveredDonutIdx(idx)}
                  onMouseLeave={() => setHoveredDonutIdx(null)}
                  className="transition-all duration-200 cursor-pointer"
                />
              );
            })}
          </svg>

          {/* Donut Center text */}
          <div className="absolute text-center pointer-events-none">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">
              {hoveredDonutIdx !== null ? 'Selected Segment' : 'Pass Rate'}
            </span>
            <span className="text-xl font-black text-[#083E84] font-mono leading-tight">
              {hoveredDonutIdx !== null
                ? formatPct(metrics.exclusiveDonut[hoveredDonutIdx].pct, 1)
                : formatPct(metrics.g2PassPct, 1)}
            </span>
            <span className="text-[9px] text-slate-500 block">
              {hoveredDonutIdx !== null ? `${metrics.exclusiveDonut[hoveredDonutIdx].count.toLocaleString()} runs` : 'Full Funding'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-1.5 mt-2 text-xs">
          {metrics.exclusiveDonut.map((segment, idx) => (
            <div
              key={segment.label}
              onMouseEnter={() => setHoveredDonutIdx(idx)}
              onMouseLeave={() => setHoveredDonutIdx(null)}
              className={`p-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                hoveredDonutIdx === idx ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-[11px] text-slate-700 truncate">{segment.label}</span>
              </div>
              <div className="font-mono text-[11px] text-slate-800 shrink-0 font-bold">
                {formatPct(segment.pct, 1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
