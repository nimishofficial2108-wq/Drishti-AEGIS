import React from 'react';
import { MonteCarloRunResult } from '../../types/monteCarlo';
import { formatCr, formatPct, formatNum } from '../../engines/mathUtils';
import { HistogramChart } from '../charts/HistogramChart';
import { CashFlowFanChart } from '../charts/CashFlowFanChart';
import { GateFunnelChart } from '../charts/GateFunnelChart';
import { X, Printer, Download, ShieldCheck, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';

interface BoardPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MonteCarloRunResult;
}

export const BoardPresentationModal: React.FC<BoardPresentationModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#082344]/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full border border-slate-300 shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 print:max-h-none print:shadow-none print:border-none">
        {/* Board Slide Header */}
        <div className="bg-[#083E84] px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest bg-[#F0C11E] text-[#083E84]">
                BOARD EXECUTIVE SUMMARY
              </span>
              <span className="text-xs text-blue-200 font-mono">
                AAROHAN CONSUMER PRODUCTS LIMITED (ACPL)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Project Drishti: ₹150 Cr Transformation Risk & Capital Allocation
            </h2>
            <p className="text-xs text-blue-100">
              Evaluated across {result.draws.toLocaleString()} stochastic scenarios · Seed {result.seed} · 60-Month Analytical Horizon
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Board Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Flagship 5-KPI Executive Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Gate 1 On-Time Pass
              </span>
              <strong className="text-2xl font-black text-[#083E84] font-mono block mt-1">
                {formatPct(result.pGate1OnTime, 1)}
              </strong>
              <span className="text-[10px] text-slate-500">M9 criteria verified</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Gate 2 Pass Rate
              </span>
              <strong className="text-2xl font-black text-[#1465C7] font-mono block mt-1">
                {formatPct(result.pGate2Pass, 1)}
              </strong>
              <span className="text-[10px] text-slate-500">Full ₹150 Cr release</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Payback ≤ M30 (Funded)
              </span>
              <strong className="text-2xl font-black text-emerald-700 font-mono block mt-1">
                {formatPct(result.pPayback30FullyFunded, 1)}
              </strong>
              <span className="text-[10px] text-slate-500">M30 investment target</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Median EBITDA (P50)
              </span>
              <strong className="text-2xl font-black text-slate-900 font-mono block mt-1">
                {formatCr(result.ebitdaP50, 1)}
              </strong>
              <span className="text-[10px] text-slate-500">P10: ₹{formatNum(result.ebitdaP10, 1)} Cr</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Median 5Y NPV @ 18%
              </span>
              <strong className="text-2xl font-black text-emerald-800 font-mono block mt-1">
                {formatCr(result.npvP50, 1)}
              </strong>
              <span className="text-[10px] text-slate-500">Hurdle rate: 18% p.a.</span>
            </div>
          </div>

          {/* 2 Flagship Charts Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <strong className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Annualized EBITDA Risk Distribution (₹ Cr)
                </strong>
                <span className="text-[10px] font-mono text-slate-500">
                  Target: ≥₹70 Cr
                </span>
              </div>
              <HistogramChart
                samples={result.ebitdaFundedSamples}
                gateHurdle={70}
                q10={result.ebitdaP10}
                q50={result.ebitdaP50}
                q90={result.ebitdaP90}
                height={200}
              />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <strong className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. 60-Month Cumulative Cash Flow Fan
                </strong>
                <span className="text-[10px] font-mono text-slate-500">
                  Breakeven vs Tranches
                </span>
              </div>
              <CashFlowFanChart data={result.cashFlowFan} height={200} />
            </div>
          </div>

          {/* Strategic Decision & Pre-Mortem Playbook */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Executive Transformation Recommendation</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Approve initial <strong>₹34 Cr Tranche 1</strong> at Month 0. Enforce strict governance: do not commit Tranche 2 (₹58 Cr) until Month 9 customer-service order contribution and stock-count reconciliations are signed off. If Gate 1 fails, execute the planned 6-month remediation loop before allowing any further capital drawdown.
              </p>
              <div className="text-[11px] text-slate-600 space-y-1 pt-1 font-mono">
                <div>• Total Capital at Risk in Phase I: <strong>₹34.0 Cr (22.7% of envelope)</strong></div>
                <div>• Tranche 2 Checkpoint: <strong>Month 9 (₹22 Cr EBITDA / 89% fill / 43d)</strong></div>
                <div>• Full Capital Deployment Probability: <strong>{formatPct(result.pGate2Pass, 1)}</strong></div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Key Risk Pre-Mortem & Guardrails</span>
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <strong>1. Supply Chain Control Tower & S&OP:</strong> Over 64% of early failures trace to SKU-location data misalignment. S&OP bias incentives must be frozen by Month 6.
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <strong>2. Working Capital Monetization:</strong> Require Finance-certified physical counts at distributor nodes to ensure stock reductions reflect genuine cash conversion, not mere transit shifts.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 shrink-0 font-mono">
          <div>
            CONFIDENTIAL · PREPARED FOR ACPL BOARD OF DIRECTORS · PROJECT DRISHTI
          </div>
          <div>
            Model: 20,000 Seeded Monte Carlo Scenarios · Assumption-driven estimates; not Finance-certified
          </div>
        </div>
      </div>
    </div>
  );
};
