import React, { useMemo } from 'react';
import { useAegis } from '../../context/AegisContext';
import { formatNum, formatCr, formatPct } from '../../engines/mathUtils';
import { CashFlowChart } from '../charts/CashFlowChart';
import { TornadoChart } from '../charts/TornadoChart';
import { calculateEbitdaWaterfall, calculateTornadoSensitivities } from '../../engines/financialEngine';
import { Coins, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export const FinancialIntelligence: React.FC = () => {
  const { state, financialReturns, setState } = useAegis();

  const waterfall = useMemo(() => calculateEbitdaWaterfall(state), [state]);
  const sensitivities = useMemo(() => calculateTornadoSensitivities(state), [state]);

  const handleSliderChange = (field: 'cashRecognizedAtM22' | 'cashRecognizedAtM36', value: number) => {
    setState(prev => {
      const next = structuredClone(prev);
      next.model[field] = value;
      return next;
    });
  };

  const irrPassed = financialReturns.irr !== null && financialReturns.irr >= state.case.irrHurdle;
  const paybackPassed = financialReturns.pay !== null && financialReturns.pay <= state.case.maxPayback;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            CFO Decision Suite · Monthly Cash Flow Engine (M0–M60)
          </div>
          <h2 className="text-xl font-extrabold text-[#082E5F]">
            Five-Year Capital Returns & Valuation
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
              irrPassed
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {irrPassed ? 'IRR ≥ 18% HURDLE MET' : 'IRR HURDLE MISSED'}
          </span>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pre-Tax 5Y IRR</div>
          <div className={`text-2xl font-black font-mono mt-1 ${irrPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
            {financialReturns.irr !== null ? formatPct(financialReturns.irr, 1) : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Target Hurdle: ≥ {formatPct(state.case.irrHurdle, 0)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NPV @ 18% Hurdle</div>
          <div className="text-2xl font-black text-[#0B376A] font-mono mt-1">
            {formatCr(financialReturns.npv, 1)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Discounted Net Present Value</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sustained Payback</div>
          <div className={`text-2xl font-black font-mono mt-1 ${paybackPassed ? 'text-emerald-700' : 'text-amber-700'}`}>
            {financialReturns.pay !== null ? `M${financialReturns.pay}` : '> M60'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Maximum Policy: ≤ {state.case.maxPayback} months
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ACPL Cash Realized M36</div>
          <div className="text-2xl font-black text-[#082E5F] font-mono mt-1">
            {formatCr(financialReturns.owned36, 1)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            M22: {formatCr(financialReturns.owned22, 1)}
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: 60-Month Cash Flow & Working Capital Realization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Projected 60-Month Cash Flow Trajectory</h3>
              <p className="text-xs text-slate-500">
                Net Monthly Cash = Operating EBITDA − Tranche Outflow − Programme Costs + Δ(Owned WC Cash).
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Monthly Root IRR Engine</span>
          </div>

          <CashFlowChart
            cashFlows={financialReturns.c}
            cumulative={financialReturns.cum}
            paybackMonth={financialReturns.pay}
            height={260}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* M22 WC Slider */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>ACPL-Owned WC Cash Realization at M22</span>
                <span className="font-mono text-[#0B376A]">
                  {Math.round(state.model.cashRecognizedAtM22 * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={state.model.cashRecognizedAtM22}
                onChange={e => handleSliderChange('cashRecognizedAtM22', Number(e.target.value))}
                className="w-full accent-[#0B376A] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">
                Proportion of ₹18.8 Cr/day owned inventory physically realized as cash
              </span>
            </div>

            {/* M36 WC Slider */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>ACPL-Owned WC Cash Realization at M36</span>
                <span className="font-mono text-[#0B376A]">
                  {Math.round(state.model.cashRecognizedAtM36 * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={state.model.cashRecognizedAtM36}
                onChange={e => handleSliderChange('cashRecognizedAtM36', Number(e.target.value))}
                className="w-full accent-[#0B376A] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">
                Terminal owned inventory cash release factor
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Tornado Sensitivity Analysis */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Tornado Sensitivity on 5Y NPV</h3>
            <span className="text-xs text-slate-400">Swing Ranking</span>
          </div>

          <TornadoChart sensitivities={sensitivities} baseNPV={financialReturns.npv} />
        </div>
      </div>

      {/* EBITDA Contribution Waterfall */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Annualized EBITDA Benefit Waterfall (Steady-State M22+)
            </h3>
            <p className="text-xs text-slate-500">
              Decomposition of operating benefits into demand recovery, manufacturing efficiency, avoided waste, and ongoing costs.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#0B376A]">
            Net: {formatCr(waterfall[waterfall.length - 1].value, 1)} / year
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {waterfall.map(step => {
            const isSubtotal = step.type === 'subtotal';
            const isCost = step.type === 'cost';

            return (
              <div
                key={step.label}
                className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                  isSubtotal
                    ? 'bg-gradient-to-br from-[#072345] to-[#0B376A] text-white border-transparent'
                    : isCost
                    ? 'bg-rose-50/70 border-rose-200 text-slate-800'
                    : 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase ${isSubtotal ? 'text-[#F3BC22]' : 'text-slate-500'}`}>
                  {step.label}
                </div>
                <div className={`text-xl font-black font-mono ${isSubtotal ? 'text-white' : isCost ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {step.value >= 0 ? `+${formatCr(step.value, 1)}` : formatCr(step.value, 1)}
                </div>
                <div className={`text-[10px] ${isSubtotal ? 'text-slate-300' : 'text-slate-500'}`}>
                  {isSubtotal ? 'Annualized run-rate' : isCost ? 'Annual ongoing expense' : 'Attributable gain'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
