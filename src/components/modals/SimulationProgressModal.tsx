import React, { useEffect, useState } from 'react';
import { formatCr, formatPct } from '../../engines/mathUtils';
import { RefreshCw, CheckCircle2, ShieldCheck, Cpu, Database, Activity } from 'lucide-react';

interface SimulationProgressModalProps {
  isOpen: boolean;
  targetDraws: number;
  currentDraws: number;
  progressPct: number;
  elapsedMs: number;
  provisionalEbitda: number;
  provisionalG1: number;
  provisionalG2: number;
  isComplete: boolean;
  onClose: () => void;
}

export const SimulationProgressModal: React.FC<SimulationProgressModalProps> = ({
  isOpen,
  targetDraws,
  currentDraws,
  progressPct,
  elapsedMs,
  provisionalEbitda,
  provisionalG1,
  provisionalG2,
  isComplete,
  onClose
}) => {
  const [activePhase, setActivePhase] = useState<number>(1);

  useEffect(() => {
    if (progressPct < 20) setActivePhase(1);
    else if (progressPct < 45) setActivePhase(2);
    else if (progressPct < 70) setActivePhase(3);
    else if (progressPct < 90) setActivePhase(4);
    else setActivePhase(5);
  }, [progressPct]);

  if (!isOpen) return null;

  const phases = [
    { num: '01', title: 'Sampling Uncertain Stochastic Inputs', desc: 'Demand recovery, fill-rates, cost avoidance, and scheduling yield' },
    { num: '02', title: 'Evaluating Operational Execution', desc: 'Applying Gaussian copula correlations (ρ) across data & adoption' },
    { num: '03', title: 'Testing Investment Funding Gates', desc: 'Gate 1 (M9) hurdle, conditional remediation (M16), and Gate 2 (M22)' },
    { num: '04', title: 'Modeling 60-Month Cash Flows', desc: 'Discounted cash flows, owned working capital, and sustained payback' },
    { num: '05', title: 'Aggregating Risk Distributions & Spearman Drivers', desc: 'Computing P10/P50/P90 quantiles and failure root causes' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#082344]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#083E84] p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#F0C11E] uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>STOCHASTIC COMPUTATION PIPELINE</span>
            </span>
            <span className="text-xs font-mono text-slate-300">
              {(elapsedMs / 1000).toFixed(1)}s elapsed
            </span>
          </div>

          <h3 className="text-lg font-extrabold text-white mt-1">
            {isComplete
              ? `${targetDraws.toLocaleString()} SCENARIOS ANALYZED`
              : `Simulating ${targetDraws.toLocaleString()} Possible Futures`}
          </h3>
          <p className="text-xs text-blue-100 mt-0.5">
            Full 60-month financial cash flow engine & multi-gate decision tree
          </p>
        </div>

        {/* Progress Bar & Counter */}
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-slate-700">ITERATIONS PROCESSED:</span>
              <strong className="text-[#083E84] text-sm">
                {currentDraws.toLocaleString()} / {targetDraws.toLocaleString()} ({progressPct}%)
              </strong>
            </div>

            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-[#1465C7] to-[#F0C11E] transition-all duration-150"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Real-time Provisional Telemetry Strip */}
          <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] text-slate-500 block uppercase">Provisional EBITDA</span>
              <strong className="text-sm text-[#083E84] font-extrabold">
                {formatCr(provisionalEbitda, 1)}
              </strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] text-slate-500 block uppercase">Gate 1 Pass Rate</span>
              <strong className="text-sm text-blue-600 font-extrabold">
                {formatPct(provisionalG1, 1)}
              </strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] text-slate-500 block uppercase">Gate 2 Pass Rate</span>
              <strong className="text-sm text-amber-600 font-extrabold">
                {formatPct(provisionalG2, 1)}
              </strong>
            </div>
          </div>

          {/* Phase List */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            {phases.map((ph, idx) => {
              const phaseNum = idx + 1;
              const isDone = activePhase > phaseNum || isComplete;
              const isCurrent = activePhase === phaseNum && !isComplete;

              return (
                <div
                  key={ph.num}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                    isDone
                      ? 'bg-blue-50/50 border-blue-200 text-slate-800'
                      : isCurrent
                      ? 'bg-amber-50/80 border-amber-300 text-slate-900 shadow-xs'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <span className="font-mono font-bold text-[11px] text-slate-400">{ph.num}</span>
                    <div className="truncate">
                      <div className="font-bold text-[11px] truncate">{ph.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{ph.desc}</div>
                    </div>
                  </div>

                  <div className="shrink-0 font-mono text-xs">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                    ) : (
                      <span className="text-[10px] text-slate-400">Queued</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Button */}
          {isComplete && (
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#083E84] hover:bg-[#062c5e] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#F0C11E]" />
                <span>View Complete Simulation Dashboard</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
