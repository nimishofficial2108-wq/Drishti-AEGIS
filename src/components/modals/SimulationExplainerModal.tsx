import React from 'react';
import { ExternalLink, X, BookOpen, Layers, CheckCircle2, ShieldAlert, Cpu, BarChart3, HelpCircle } from 'lucide-react';

interface SimulationExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulationExplainerModal: React.FC<SimulationExplainerModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#082344]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#083E84] p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] font-bold text-[#F0C11E] uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>EXECUTIVE METHODOLOGY & AUDIT GUIDE</span>
            </div>
            <h3 className="text-lg font-extrabold text-white mt-1">
              How the Monte Carlo Intelligence Engine Works
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Mathematical modeling, financial logic, and strategic governance architecture
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Executive Summary */}
          <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1.5">
            <h4 className="font-bold text-[#083E84] text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#1465C7]" />
              <span>Core Concept: "20,000 Future Scenarios. One Better Investment Decision."</span>
            </h4>
            <p className="text-slate-600">
              Rather than relying on a single static forecast, the Monte Carlo Intelligence Engine tests ACPL’s ₹150 Cr capital investment program across 20,000 statistically possible operating outcomes. By modeling joint probability distributions, execution frictions, and multi-stage funding gate rules, the simulation provides management and the Board with a transparent view of downside risk, capital protection, and expected financial returns.
            </p>
          </div>

          {/* Canonical Benchmark Truth */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Canonical Reference Model & Benchmark Truth
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">P(Gate 1 On Time)</span>
                <strong className="text-slate-900 font-extrabold text-xs">48.37%</strong>
                <span className="text-[10px] text-slate-400 block font-sans">Month 9 hurdle</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">P(Gate 2 Pass)</span>
                <strong className="text-slate-900 font-extrabold text-xs">30.70%</strong>
                <span className="text-[10px] text-slate-400 block font-sans">Month 22 hurdle</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">P(Both On Time)</span>
                <strong className="text-slate-900 font-extrabold text-xs">28.43%</strong>
                <span className="text-[10px] text-slate-400 block font-sans">Unconditional sequential</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Payback ≤ M30 (Funded)</span>
                <strong className="text-emerald-700 font-extrabold text-xs">87.28%</strong>
                <span className="text-[10px] text-slate-400 block font-sans">Among fully funded</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Payback ≤ M30 (All)</span>
                <strong className="text-blue-700 font-extrabold text-xs">66.37%</strong>
                <span className="text-[10px] text-slate-400 block font-sans">All 20,000 scenarios</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">M22 EBITDA (P10/50/90)</span>
                <strong className="text-slate-900 font-extrabold text-xs">₹64.9 / 88.5 / 115.5 Cr</strong>
                <span className="text-[10px] text-slate-400 block font-sans">Phase-II funded</span>
              </div>
            </div>
          </div>

          {/* Mathematical Modeling Logic */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Core Model Equations & Probability Distributions
            </h4>

            <div className="space-y-2 font-mono text-[11px] bg-slate-900 text-slate-200 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[#F0C11E] font-bold font-sans text-xs mb-1">
                Annualized EBITDA Formula:
              </div>
              <div className="text-slate-100">
                EBITDA = Service Contribution + Scheduling Yield + Avoided Operating Costs - Running Costs
              </div>
              <div className="text-slate-400 text-[10px]">
                where Service Contribution = Fill Uplift (pp) × Contribution/point (₹Cr) × (Demand Recovery / 45%) × Adoption Factor
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-800 font-bold block">1. Operational Distributions</strong>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                  <li>Demand Recovery: Triangular [35%, 45%, 60%]</li>
                  <li>Contribution / point: Uniform ₹8.6–11.8 Cr</li>
                  <li>Month 22 Fill Uplift: Triangular [4.0, 6.4, 9.0] pp</li>
                  <li>Inventory Reduction: Triangular [5.0, 8.5, 12.0] days</li>
                  <li>Scheduling Yield: Triangular [₹0, ₹9.8, ₹18] Cr</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-800 font-bold block">2. Risk & Capital Guardrails</strong>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                  <li>Gate 1 (M9): Fill ≥89%, Days ≤43d, EBITDA ≥₹22Cr</li>
                  <li>Gate 1 Remediation: 52% probability, released M16</li>
                  <li>Gate 2 (M22): Fill ≥92%, Days ≤38d, EBITDA ≥₹70Cr, WC ≥₹170Cr</li>
                  <li>Cost Guardrail: Avoided costs ≤40% of recurring EBITDA</li>
                  <li>Tranche Limits: T1 ₹34Cr, T2 ₹58Cr, T3 ₹58Cr (Total ₹150Cr)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Working Capital Treatment */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Working Capital Separation (Network vs Owned)
            </h4>
            <p className="text-slate-600">
              The model rigorously separates network working capital from ACPL-owned working capital:
            </p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-800 font-bold block">Network Working Capital (₹26.7 Cr / day)</strong>
                <span className="text-slate-500">
                  Used exclusively for Gate 2 operational certification (≥₹170 Cr target). Represents total supply chain stock.
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-800 font-bold block">ACPL-Owned Working Capital (₹18.8 Cr / day)</strong>
                <span className="text-slate-500">
                  Only realized owned inventory multiplied by cash conversion enters the 60-month free cash flow and IRR solver.
                </span>
              </div>
            </div>
          </div>

          {/* External Reference Link */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
            <div>
              <strong className="text-amber-900 block text-xs">Original Case Excel Workbook Reference</strong>
              <span className="text-[11px] text-amber-800">
                View the original 20,000-scenario financial model and audit ledger in Google Sheets.
              </span>
            </div>
            <a
              href="https://docs.google.com/spreadsheets/d/1zuo2YjVJzCL_hUBUVow3TcjVzOvFuSVt/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#083E84] hover:bg-[#062c5e] text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors"
            >
              <span>Open Workbook</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            Model: 20,000 Seeded Scenarios · Seed 20261030 · 60-Month Horizon
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#083E84] text-white text-xs font-bold rounded-lg hover:bg-[#062c5e] transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
