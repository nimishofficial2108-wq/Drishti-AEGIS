import React, { useState } from 'react';
import { useAegis } from '../../context/AegisContext';
import { ObservationRecord } from '../../types/aegis';
import { formatNum, formatCr } from '../../engines/mathUtils';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  BookmarkPlus,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const DataAuditCenter: React.FC = () => {
  const {
    state,
    saveObservation,
    deleteObservation,
    exportStateJSON,
    importStateJSON,
    savedScenarios,
    saveCurrentScenario,
    loadSavedScenario,
    deleteSavedScenario
  } = useAegis();

  // Form State for Recording Observations
  const [selectedMonth, setSelectedMonth] = useState<number>(9);
  const [fillRate, setFillRate] = useState<string>('89.2');
  const [inventoryDays, setInventoryDays] = useState<string>('42.5');
  const [ebitdaRunRate, setEbitdaRunRate] = useState<string>('23.4');
  const [networkWcRelease, setNetworkWcRelease] = useState<string>('');
  const [ownedCashRelease, setOwnedCashRelease] = useState<string>('');

  const [audited, setAudited] = useState<boolean>(true);
  const [financeCertified, setFinanceCertified] = useState<boolean>(true);
  const [physicalCountVerified, setPhysicalCountVerified] = useState<boolean>(true);
  const [benefitDedupVerified, setBenefitDedupVerified] = useState<boolean>(true);

  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Scenario snapshot form
  const [newScenarioName, setNewScenarioName] = useState<string>('');
  const [newScenarioDesc, setNewScenarioDesc] = useState<string>('');

  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    const obs: ObservationRecord = {
      month: selectedMonth,
      fillRate: fillRate === '' ? null : Number(fillRate),
      inventoryDays: inventoryDays === '' ? null : Number(inventoryDays),
      ebitdaRunRate: ebitdaRunRate === '' ? null : Number(ebitdaRunRate),
      networkWcRelease: networkWcRelease === '' ? null : Number(networkWcRelease),
      ownedCashRelease: ownedCashRelease === '' ? null : Number(ownedCashRelease),
      audited,
      financeCertified,
      physicalCountVerified,
      benefitDedupVerified,
      source: 'User-entered audit record via Data & Audit Centre',
      timestamp: new Date().toISOString()
    };

    saveObservation(obs);
    setStatusMsg(`Recorded observation for Month ${selectedMonth}. Gate Arbiter updated.`);
  };

  const handleCopyWhatIfToForm = () => {
    const what = state.whatIf[String(selectedMonth) as '9' | '22'];
    if (what) {
      setFillRate(what.fillRate !== null ? String(what.fillRate) : '');
      setInventoryDays(what.inventoryDays !== null ? String(what.inventoryDays) : '');
      setEbitdaRunRate(what.ebitdaRunRate !== null ? String(what.ebitdaRunRate) : '');
      setNetworkWcRelease(what.networkWcRelease !== null ? String(what.networkWcRelease) : '');
      setStatusMsg(`Copied M${selectedMonth} scenario what-if values to form (remain unverified).`);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = exportStateJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DRISHTI_AEGIS_4_Scenario_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setJsonError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      importStateJSON(text);
      setStatusMsg('Model JSON successfully imported.');
    } catch (err: unknown) {
      setJsonError((err as Error).message || 'Failed to import JSON model.');
    }
  };

  const handleSaveScenarioSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;
    saveCurrentScenario(newScenarioName.trim(), newScenarioDesc.trim());
    setNewScenarioName('');
    setNewScenarioDesc('');
    setStatusMsg('Saved what-if scenario snapshot to browser storage.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Evidence Intake · Provenance & Snapshots
          </div>
          <h2 className="text-xl font-extrabold text-[#082E5F]">
            Data, Evidence & Audit Records
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-[#0B376A] hover:bg-[#082E5F] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Scenario JSON</span>
          </button>
          <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept=".json,application/json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {jsonError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{jsonError}</span>
        </div>
      )}

      {/* 2-Column Split: Record Observation Form & Evidence Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Record Observation Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Record Audited Gate Outcome</h3>
            <span className="text-xs text-slate-400">Formal Verification</span>
          </div>

          <form onSubmit={handleSaveObservation} className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gate Milestone</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-[#0B376A]"
              >
                <option value={9}>Gate 1 · Month 9 Milestone (₹58 Cr Tranche 2)</option>
                <option value={22}>Gate 2 · Month 22 Milestone (₹58 Cr Tranche 3)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Actual Fill-Rate (%)</label>
                <input
                  type="number"
                  step={0.1}
                  value={fillRate}
                  onChange={e => setFillRate(e.target.value)}
                  placeholder="e.g. 89.5"
                  className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Network Days</label>
                <input
                  type="number"
                  step={0.1}
                  value={inventoryDays}
                  onChange={e => setInventoryDays(e.target.value)}
                  placeholder="e.g. 42.0"
                  className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">EBITDA Benefit (₹Cr)</label>
                <input
                  type="number"
                  step={0.5}
                  value={ebitdaRunRate}
                  onChange={e => setEbitdaRunRate(e.target.value)}
                  placeholder="e.g. 23.5"
                  className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Network WC Release (₹Cr)</label>
                <input
                  type="number"
                  step={1}
                  value={networkWcRelease}
                  onChange={e => setNetworkWcRelease(e.target.value)}
                  placeholder="e.g. 175"
                  className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded-md"
                />
              </div>
            </div>

            {/* Verification Checkboxes */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">Governance Criteria:</span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={audited}
                  onChange={e => setAudited(e.target.checked)}
                  className="rounded text-[#0B376A] accent-[#0B376A]"
                />
                <span className="text-slate-700">Independently audited by external firm</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={financeCertified}
                  onChange={e => setFinanceCertified(e.target.checked)}
                  className="rounded text-[#0B376A] accent-[#0B376A]"
                />
                <span className="text-slate-700">Finance certified & CFO signed</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={physicalCountVerified}
                  onChange={e => setPhysicalCountVerified(e.target.checked)}
                  className="rounded text-[#0B376A] accent-[#0B376A]"
                />
                <span className="text-slate-700">Physical stock count reconciled</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={benefitDedupVerified}
                  onChange={e => setBenefitDedupVerified(e.target.checked)}
                  className="rounded text-[#0B376A] accent-[#0B376A]"
                />
                <span className="text-slate-700">Benefit de-duplication confirmed</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#0B376A] hover:bg-[#082E5F] text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                Save Recorded Observation
              </button>

              <button
                type="button"
                onClick={handleCopyWhatIfToForm}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Copy Scenario Values
              </button>

              <button
                type="button"
                onClick={() => deleteObservation(selectedMonth)}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Clear M{selectedMonth}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Evidence Register & Provenance */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Evidence Register & Audit Provenance</h3>
              <p className="text-xs text-slate-500">History of verified observations utilized by Gate Arbiter.</p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {state.observations.length} Registered Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3 text-right">Fill (%)</th>
                  <th className="py-2.5 px-3 text-right">Days</th>
                  <th className="py-2.5 px-3 text-right">EBITDA (₹Cr)</th>
                  <th className="py-2.5 px-3 text-right">WC (₹Cr)</th>
                  <th className="py-2.5 px-3 text-center">Aud / Fin / Stk / Dup</th>
                  <th className="py-2.5 px-3">Origin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {state.observations.map(obs => (
                  <tr key={obs.month} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-sans font-bold text-[#0B376A]">M{obs.month}</td>
                    <td className="py-2.5 px-3 text-right">{obs.fillRate !== null ? `${obs.fillRate}%` : '—'}</td>
                    <td className="py-2.5 px-3 text-right">{obs.inventoryDays !== null ? `${obs.inventoryDays}d` : '—'}</td>
                    <td className="py-2.5 px-3 text-right">{obs.ebitdaRunRate !== null ? `₹${obs.ebitdaRunRate}` : '—'}</td>
                    <td className="py-2.5 px-3 text-right">{obs.networkWcRelease !== null ? `₹${obs.networkWcRelease}` : '—'}</td>
                    <td className="py-2.5 px-3 text-center text-slate-700">
                      {[obs.audited, obs.financeCertified, obs.physicalCountVerified, obs.benefitDedupVerified]
                        .map(b => (b ? 'Y' : 'N'))
                        .join(' / ')}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-500 text-[11px] truncate max-w-xs" title={obs.source}>
                      {obs.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Saved Scenario Snapshots Manager */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <BookmarkPlus className="w-4 h-4 text-[#0B376A]" />
              <span>Saved Scenario Snapshots (Browser LocalStorage)</span>
            </h4>

            <form onSubmit={handleSaveScenarioSnapshot} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Scenario Name (e.g. Aggressive North Recovery)"
                value={newScenarioName}
                onChange={e => setNewScenarioName(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg flex-1 min-w-[200px]"
              />
              <input
                type="text"
                placeholder="Optional notes / hypothesis"
                value={newScenarioDesc}
                onChange={e => setNewScenarioDesc(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg flex-1 min-w-[200px]"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#0B376A] hover:bg-[#082E5F] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Save Snapshot
              </button>
            </form>

            {savedScenarios.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {savedScenarios.map(s => (
                  <div key={s.id} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-800">{s.name}</strong>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">
                        {new Date(s.timestamp).toLocaleDateString()}
                      </span>
                      {s.description && <div className="text-[11px] text-slate-500">{s.description}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadSavedScenario(s.id)}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-[11px] font-semibold text-[#0B376A] cursor-pointer"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteSavedScenario(s.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
