import React from 'react';
import { HelpCircle, Code, ShieldCheck, Scale, Cpu, Dices } from 'lucide-react';

export const AlgorithmAuditTrail: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Governance & Explainability · Zero Black Box Policy
        </div>
        <h2 className="text-xl font-extrabold text-[#082E5F]">
          Mathematical Model Architecture & Audit Trail
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete mathematical transparency: exact formulas, loss functions, optimization routines, and governance rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monte Carlo Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Dices className="w-4 h-4 text-[#0B376A]" />
            <h3 className="text-sm font-bold text-slate-900">01. Monte Carlo Stochastic Engine</h3>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 space-y-1">
            <div className="text-slate-500 font-sans text-[11px] font-semibold">Correlated Risk Draw:</div>
            <div>Z_k = ρ · Z_common + √(1 − ρ²) · Z_k_idiosyncratic</div>
            <div>Event Occurs if: Φ(Z_k) &lt; p_base · (1 − 0.72 · Mitigation)</div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              <strong>Driver Sampling:</strong> 10 uncertain operational parameters are sampled via triangular distributions (Low / Mode / High) using seeded Mulberry32 PRNG.
            </p>
            <p>
              <strong>EBITDA Formulation:</strong> Service Contribution = Fill Uplift × Unit Contribution × (Recovery / 0.50) + Plant C Yield + Avoided Costs − Running Costs − Event Losses.
            </p>
            <p>
              <strong>Working Capital:</strong> ΔDays × ₹26.7 Cr/day adjusted for leakage and inventory transfers.
            </p>
          </div>
        </div>

        {/* Machine Learning Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Cpu className="w-4 h-4 text-[#0B376A]" />
            <h3 className="text-sm font-bold text-slate-900">02. Predictive Machine Learning (Ridge Regression)</h3>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 space-y-1">
            <div className="text-slate-500 font-sans text-[11px] font-semibold">Objective Function:</div>
            <div>min Σ(y_i − β_0 − X_i β)² + λ Σ(β_j)² &nbsp; (λ = 0.75)</div>
            <div>Normal Equation: (Z^T Z + λ I_diag) β = Z^T y</div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              <strong>Standardization:</strong> Features are standardized (mean=0, variance=1) prior to inversion via Gaussian elimination with partial pivoting. Intercept β₀ is not penalized.
            </p>
            <p>
              <strong>Validation:</strong> 5-fold out-of-sample cross-validation strictly evaluates test folds unseen during partial training.
            </p>
            <p>
              <strong>Governance Constraint:</strong> Predictive ML models provide decision support and optional stochastic blending (α); they can never override certified gate rules.
            </p>
          </div>
        </div>

        {/* Gate Arbiter Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Scale className="w-4 h-4 text-[#0B376A]" />
            <h3 className="text-sm font-bold text-slate-900">03. Gate Arbiter Boolean Logic</h3>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 space-y-1">
            <div className="text-slate-500 font-sans text-[11px] font-semibold">Funding Release Rule:</div>
            <div>Pass = (Fill ≥ Target) ∧ (Days ≤ Target) ∧ (EBITDA ≥ Target)</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;∧ (WC ≥ Target) ∧ (Avoided Cost Share ≤ 40%) ∧ Evidence</div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              <strong>Non-Compensatory Logic:</strong> Outstanding performance in fill-rate cannot offset missed inventory days. All metrics must pass simultaneously.
            </p>
            <p>
              <strong>Failure Consequences:</strong> Gate 1 missed → Tranche 2 (₹58 Cr) deferred by 2 quarters. Gate 2 missed → Tranche 3 (₹58 Cr) lapses permanently.
            </p>
          </div>
        </div>

        {/* Financial Valuation Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Code className="w-4 h-4 text-[#0B376A]" />
            <h3 className="text-sm font-bold text-slate-900">04. Financial Cash Flow & Valuation Engine</h3>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 space-y-1">
            <div className="text-slate-500 font-sans text-[11px] font-semibold">Valuation Metrics:</div>
            <div>NPV = Σ [ CF_m / (1 + 0.18)^(m / 12) ] for m ∈ [0, 60]</div>
            <div>Annual IRR = (1 + r_monthly)^12 − 1 &nbsp; s.t. NPV(r_monthly) = 0</div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              <strong>Sustained Payback:</strong> First month m where cumulative cash flow ≥ 0 and remains non-negative through Month 60.
            </p>
            <p>
              <strong>Double Counting Prevention:</strong> Programme running costs are isolated from capital tranches; distributor stock transfers are excluded from network cash release.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
