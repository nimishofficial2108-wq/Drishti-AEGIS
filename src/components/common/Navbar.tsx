import React from 'react';
import { useAegis } from '../../context/AegisContext';
import { Play, RotateCcw, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { arbiterVerdict, runSimulationNow, isSimulating, activeSection, setActiveSection, resetToCaseDefaults } = useAegis();

  const navLinks = [
    { id: 'overview', label: 'Command Centre' },
    { id: 'arbiter', label: 'Gate Arbiter' },
    { id: 'radar', label: 'Risk Radar' },
    { id: 'scenario', label: 'Monte Carlo' },
    { id: 'learning', label: 'ML Studio' },
    { id: 'capital', label: 'Financials' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'audit', label: 'Audit Records' }
  ];

  const statusIcons = {
    green: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
    gold: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
    red: <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
  };

  const statusClasses = {
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    gold: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-rose-50 text-rose-800 border-rose-200'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#overview"
          onClick={e => {
            e.preventDefault();
            setActiveSection('overview');
          }}
          className="text-lg font-extrabold tracking-tight text-[#082E5F] whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-lg bg-[#F3BC22] text-[#082E5F] font-black flex items-center justify-center text-sm shadow-sm">
            A
          </span>
          <span>DRISHTI AEGIS</span>
        </a>
        <span className="text-xs text-slate-400 font-medium hidden lg:inline">
          / Capital Intelligence Suite
        </span>
      </div>

      {/* Zone 2: Concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 overflow-x-auto">
        {navLinks.map(link => (
          <button
            key={link.id}
            onClick={() => setActiveSection(link.id)}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              activeSection === link.id
                ? 'border-[#0B376A] text-[#0B376A] font-bold'
                : 'border-transparent hover:text-[#0B376A] hover:border-slate-300'
            }`}
          >
            {link.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: Governance Status & Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md border ${
            statusClasses[arbiterVerdict.badgeClass]
          }`}
          title={arbiterVerdict.summary}
        >
          {statusIcons[arbiterVerdict.badgeClass]}
          <span className="truncate max-w-[150px]">{arbiterVerdict.status}</span>
        </div>

        <button
          onClick={runSimulationNow}
          disabled={isSimulating}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0B376A] hover:bg-[#082E5F] active:scale-95 transition-all rounded-lg shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 text-[#F3BC22] ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Running...' : 'Stress Test'}</span>
        </button>

        <button
          onClick={() => {
            if (window.confirm('Reset all parameters to official FY26 case baseline and default distributions?')) {
              resetToCaseDefaults();
            }
          }}
          title="Reset to Case Baseline"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
