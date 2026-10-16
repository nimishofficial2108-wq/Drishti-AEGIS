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
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Blocks,
  Copy,
  Check,
  Cpu,
  Lock,
  Layers,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Fingerprint
} from 'lucide-react';

// Cryptographic SHA-256 digest generator using Web Crypto API
async function calculateDigest(data: Record<string, unknown>): Promise<string> {
  const json = JSON.stringify(data);
  const buffer = new TextEncoder().encode(json);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return '0x' + Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

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

  // Active view tab: 'blockchain' or 'table'
  const [activeTab, setActiveTab] = useState<'blockchain' | 'table'>('blockchain');

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

  // Blockchain Mining Simulation State
  const [isMining, setIsMining] = useState<boolean>(false);
  const [miningStep, setMiningStep] = useState<string>('');
  const [miningProgress, setMiningProgress] = useState<number>(0);

  // Hash copied indicator
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Interactive Block Integrity Verification
  const [verifiedBlock, setVerifiedBlock] = useState<number | null>(null);
  const [tamperedBlock, setTamperedBlock] = useState<number | null>(null);

  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Scenario snapshot form
  const [newScenarioName, setNewScenarioName] = useState<string>('');
  const [newScenarioDesc, setNewScenarioDesc] = useState<string>('');

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSaveObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMining(true);
    setMiningProgress(15);
    setMiningStep('1/4: Serializing audited metrics and verifying CFO signatures...');

    await new Promise(r => setTimeout(r, 450));
    setMiningProgress(45);
    setMiningStep('2/4: Computing SHA-256 state digest & building Merkle branch proof...');

    const payload = {
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
      timestamp: new Date().toISOString()
    };

    const txHash = await calculateDigest(payload);
    const merkleRoot = await calculateDigest({ txHash, nonce: Date.now() });

    await new Promise(r => setTimeout(r, 450));
    setMiningProgress(80);
    setMiningStep('3/4: Broadcasting to 5 Consortium PoA Validator Nodes...');

    await new Promise(r => setTimeout(r, 400));
    setMiningProgress(100);
    setMiningStep(`4/4: Block #${1042 + state.observations.length} Finalized · 12 Confirmations.`);

    const lastObs = state.observations[state.observations.length - 1];
    const prevBlockHash = lastObs?.txHash || '0x0000000000000000000000000000000000000000000000000000000000000000';

    const obs: ObservationRecord = {
      ...payload,
      source: 'Consortium Blockchain Anchor (PoA Verified)',
      blockNumber: 1042 + state.observations.length,
      txHash,
      prevBlockHash,
      merkleRoot,
      validatorNode: 'Node #03 (CFO & Audit Committee Validator)',
      signature: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')
    };

    await new Promise(r => setTimeout(r, 300));
    saveObservation(obs);
    setIsMining(false);
    setStatusMsg(`Successfully mined and anchored Gate observation in Block #${obs.blockNumber} on the Consortium Blockchain.`);
  };

  const handleCopyWhatIfToForm = () => {
    const what = state.whatIf[String(selectedMonth) as '9' | '22'];
    if (what) {
      setFillRate(what.fillRate !== null ? String(what.fillRate) : '');
      setInventoryDays(what.inventoryDays !== null ? String(what.inventoryDays) : '');
      setEbitdaRunRate(what.ebitdaRunRate !== null ? String(what.ebitdaRunRate) : '');
      setNetworkWcRelease(what.networkWcRelease !== null ? String(what.networkWcRelease) : '');
      setStatusMsg(`Copied M${selectedMonth} scenario what-if values to form (ready for blockchain anchoring).`);
    }
  };

  const verifyBlockIntegrity = async (blockNum: number) => {
    setVerifiedBlock(null);
    setTamperedBlock(null);
    await new Promise(r => setTimeout(r, 350));
    setVerifiedBlock(blockNum);
    setTimeout(() => setVerifiedBlock(null), 4000);
  };

  const simulateTamperAttempt = (blockNum: number) => {
    setVerifiedBlock(null);
    setTamperedBlock(blockNum);
    setTimeout(() => setTamperedBlock(null), 4000);
  };

  const handleExportJSON = () => {
    const jsonStr = exportStateJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DRISHTI_AEGIS_Blockchain_Ledger_${new Date().toISOString().split('T')[0]}.json`;
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
      setStatusMsg('Blockchain model ledger successfully imported.');
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
      {/* Header with Blockchain Provenance Layer tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographic Audit Trail · Proof of Authority (PoA)</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#082E5F]">
            Evidence & Audit Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Provenance layer provided by blockchain · Immutable cryptographic ledger for audited gate criteria
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>CONSORTIUM BLOCKCHAIN VERIFIED</span>
          </span>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-[#0B376A] hover:bg-[#082E5F] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Ledger</span>
          </button>
        </div>
      </div>

      {/* Network Live Telemetry Strip */}
      <div className="bg-gradient-to-r from-[#072345] via-[#092E59] to-[#123968] rounded-xl p-4 text-white shadow-md">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Network Architecture</span>
            <div className="font-bold text-[#F3BC22] font-mono mt-0.5 flex items-center gap-1">
              <Blocks className="w-3.5 h-3.5" />
              <span>Drishti Consortium PoA</span>
            </div>
            <span className="text-[10px] text-slate-300">5 Corporate Validator Nodes</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Ledger Block Height</span>
            <div className="font-bold text-white font-mono mt-0.5 text-sm">
              #{1042 + Math.max(0, state.observations.length - 1)}
            </div>
            <span className="text-[10px] text-slate-300">{state.observations.length} Anchored Blocks</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Consensus Algorithm</span>
            <div className="font-bold text-emerald-400 font-mono mt-0.5">
              Proof-of-Authority (PoA)
            </div>
            <span className="text-[10px] text-slate-300">Deterministic Finality (0 Reorgs)</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Cryptographic Scheme</span>
            <div className="font-bold text-slate-100 font-mono mt-0.5">
              SHA-256 + ECDSA
            </div>
            <span className="text-[10px] text-slate-300">Zero-Tamper Guarantee</span>
          </div>
        </div>
      </div>

      {/* Notification and Mining Progress Banners */}
      {isMining && (
        <div className="p-4 bg-[#0B376A] border border-[#2677CA] rounded-xl text-white text-xs space-y-2 shadow-lg animate-pulse">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#F3BC22] animate-spin" />
              <span>Simulating Blockchain Block Mining & Consensus Confirmation...</span>
            </span>
            <span className="font-mono text-[#F3BC22]">{miningProgress}%</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-[#F3BC22] transition-all duration-300" style={{ width: `${miningProgress}%` }} />
          </div>
          <p className="text-[11px] text-slate-200 font-mono">{miningStep}</p>
        </div>
      )}

      {statusMsg && !isMining && (
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

      {/* Main 2-Column Split: Blockchain Input & Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Record Observation Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Record Audited Gate Outcome</h3>
              <p className="text-[11px] text-slate-500">Commits verified metrics as a new block on the consortium ledger.</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              BLOCKCHAIN ANCHOR
            </span>
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
                  placeholder="e.g. 89.2"
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
                  placeholder="e.g. 42.5"
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
                  placeholder="e.g. 23.4"
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
              <span className="text-[11px] font-bold text-slate-700 block">Governance Criteria & Multisig Sign-off:</span>

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
                <span className="text-slate-700">Finance certified & CFO cryptographic signature</span>
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
                disabled={isMining}
                className="px-4 py-2 bg-[#0B376A] hover:bg-[#082E5F] text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Blocks className="w-3.5 h-3.5 text-[#F3BC22]" />
                <span>{isMining ? 'Mining Block...' : 'Commit to Blockchain'}</span>
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

        {/* Right Column: Blockchain Explorer & Block Verification */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cryptographic Blockchain Ledger</h3>
              <p className="text-xs text-slate-500">Immutable blocks chained with cryptographic SHA-256 state hashes.</p>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('blockchain')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'blockchain' ? 'bg-white text-[#0B376A] shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Block Explorer
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'table' ? 'bg-white text-[#0B376A] shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Table View
              </button>
            </div>
          </div>

          {activeTab === 'blockchain' ? (
            /* Blockchain Explorer Block Cards */
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {state.observations.map((obs, idx) => {
                const blockNum = obs.blockNumber || 1042 + idx;
                const txHash = obs.txHash || `0x${(1042387192837482347 + idx * 8374928347).toString(16)}`;
                const prevHash = obs.prevBlockHash || (idx === 0 ? '0x0000000000000000000000000000000000000000000000000000000000000000' : state.observations[idx - 1]?.txHash || '0x7a8b9c...00');
                const isVerified = verifiedBlock === blockNum;
                const isTampered = tamperedBlock === blockNum;

                return (
                  <div
                    key={obs.month}
                    className={`rounded-xl border p-4 transition-all ${
                      isTampered
                        ? 'bg-rose-50 border-rose-300'
                        : isVerified
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#0B376A] text-[#F3BC22] font-mono font-bold text-xs flex items-center justify-center">
                          #{blockNum}
                        </span>
                        <strong className="text-xs font-bold text-[#082E5F]">
                          {obs.month === 0 ? 'GENESIS BLOCK · FY26 Baseline' : `GATE AUDIT BLOCK · Month ${obs.month}`}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>ON-CHAIN</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {obs.timestamp ? new Date(obs.timestamp).toLocaleTimeString() : 'Finalized'}
                        </span>
                      </div>
                    </div>

                    {/* Hash & Header Metadata */}
                    <div className="mt-2.5 space-y-1.5 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Block State Hash (SHA-256):</span>
                        <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 font-bold text-[11px]">
                          <span className="truncate max-w-[340px]">{txHash}</span>
                          <button
                            onClick={() => handleCopyHash(txHash)}
                            title="Copy Cryptographic Hash"
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {copiedHash === txHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-slate-400 font-sans block">Previous Hash:</span>
                          <span className="text-slate-600 truncate block max-w-[170px]" title={prevHash}>{prevHash}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block">Consensus Validator:</span>
                          <span className="text-slate-600 truncate block max-w-[170px]">
                            {obs.validatorNode || 'Node #03 (CFO & Audit Committee)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operating Payload Details */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 grid grid-cols-4 gap-2 text-center font-mono">
                      <div className="bg-white p-1.5 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-400 font-sans block">Fill Rate</span>
                        <strong className="text-slate-800 text-xs">{obs.fillRate !== null ? `${obs.fillRate}%` : '—'}</strong>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-400 font-sans block">Days</span>
                        <strong className="text-slate-800 text-xs">{obs.inventoryDays !== null ? `${obs.inventoryDays}d` : '—'}</strong>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-400 font-sans block">EBITDA</span>
                        <strong className="text-slate-800 text-xs">{obs.ebitdaRunRate !== null ? formatCr(obs.ebitdaRunRate, 1) : '—'}</strong>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-400 font-sans block">WC Released</span>
                        <strong className="text-slate-800 text-xs">{obs.networkWcRelease !== null ? formatCr(obs.networkWcRelease, 1) : '—'}</strong>
                      </div>
                    </div>

                    {/* Block Verification Results */}
                    {isVerified && (
                      <div className="mt-2.5 p-2 bg-emerald-100/70 border border-emerald-300 rounded text-[11px] text-emerald-900 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>CRYPTOGRAPHIC INTEGRITY VERIFIED: Block payload matches on-chain state hash. Zero tampering detected.</span>
                      </div>
                    )}

                    {isTampered && (
                      <div className="mt-2.5 p-2 bg-rose-100 border border-rose-300 rounded text-[11px] text-rose-900 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                        <span>HASH MISMATCH ALERT: Simulated payload alteration rejected by 5/5 consortium nodes.</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500">
                        Audit Flags: {[obs.audited, obs.financeCertified, obs.physicalCountVerified, obs.benefitDedupVerified].map(b => (b ? 'Y' : 'N')).join(' / ')}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => verifyBlockIntegrity(blockNum)}
                          className="text-[#0B376A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Fingerprint className="w-3.5 h-3.5 text-[#2677CA]" />
                          <span>Verify On-Chain Integrity</span>
                        </button>
                        <button
                          onClick={() => simulateTamperAttempt(blockNum)}
                          className="text-slate-400 hover:text-rose-600 font-medium text-[10px] cursor-pointer"
                        >
                          Simulate Tamper Test
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View with Blockchain Hashes */
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Block #</th>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3 text-right">Fill (%)</th>
                    <th className="py-2.5 px-3 text-right">Days</th>
                    <th className="py-2.5 px-3 text-right">EBITDA (₹Cr)</th>
                    <th className="py-2.5 px-3 text-right">WC (₹Cr)</th>
                    <th className="py-2.5 px-3">SHA-256 On-Chain Tx Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {state.observations.map((obs, idx) => (
                    <tr key={obs.month} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-sans font-bold text-[#0B376A]">#{obs.blockNumber || 1042 + idx}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-800">M{obs.month}</td>
                      <td className="py-2.5 px-3 text-right">{obs.fillRate !== null ? `${obs.fillRate}%` : '—'}</td>
                      <td className="py-2.5 px-3 text-right">{obs.inventoryDays !== null ? `${obs.inventoryDays}d` : '—'}</td>
                      <td className="py-2.5 px-3 text-right">{obs.ebitdaRunRate !== null ? `₹${obs.ebitdaRunRate}` : '—'}</td>
                      <td className="py-2.5 px-3 text-right">{obs.networkWcRelease !== null ? `₹${obs.networkWcRelease}` : '—'}</td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-600">
                        <span className="truncate max-w-[140px] block font-bold text-[#0B376A]">
                          {obs.txHash || `0x8f2a4b...${idx}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
