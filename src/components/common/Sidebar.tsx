import React from 'react';
import { useAegis } from '../../context/AegisContext';
import {
  LayoutDashboard,
  GitBranch,
  ShieldAlert,
  Dices,
  Cpu,
  Coins,
  Milestone,
  FileText,
  HelpCircle,
  Database
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeSection, setActiveSection, arbiterVerdict, state } = useAegis();

  const menuItems = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'arbiter', label: 'Gate Arbiter & Workbench', icon: GitBranch },
    { id: 'radar', label: 'AEGIS Risk Radar', icon: ShieldAlert },
    { id: 'scenario', label: 'Monte Carlo Stress Lab', icon: Dices },
    { id: 'learning', label: 'Predictive ML Studio', icon: Cpu },
    { id: 'capital', label: 'Capital & Cash Returns', icon: Coins },
    { id: 'roadmap', label: '36-Month Roadmap', icon: Milestone },
    { id: 'audit', label: 'Evidence & Audit Centre', icon: FileText },
    { id: 'algorithms', label: 'Algorithm Audit Trail', icon: HelpCircle }
  ];

  return (
    <aside className="w-64 bg-[#082344] text-slate-200 shrink-0 min-h-screen flex flex-col border-r border-slate-800 shadow-xl hidden md:flex">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F3BC22] text-[#082E5F] font-black flex items-center justify-center text-lg shadow-sm">
            A
          </div>
          <div>
            <div className="font-extrabold text-white text-base tracking-wider leading-tight">AEGIS 4.0</div>
            <div className="text-[10px] text-[#AEC5DF] tracking-widest font-semibold uppercase">DRISHTI INTELLIGENCE</div>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-[#AFC9E6] leading-relaxed">
          Risk Foresight & Capital Governance Suite
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-[#1E4977] text-white shadow-sm border-l-3 border-[#F3BC22]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F3BC22]' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Foot Card: Model Governance Notice */}
      <div className="p-4 border-t border-white/10 text-[11px] text-slate-400 space-y-3">
        <div className="bg-[#143B69]/70 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#F3BC22]">
            <Database className="w-3.5 h-3.5" />
            <span>OFFLINE MODEL</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-300 leading-normal">
            Case FY26 baseline + verified user what-if scenarios. Real ACPL connector disabled.
          </p>
        </div>

        <div className="text-[10px] leading-relaxed text-slate-400">
          <div className="font-medium text-slate-300">Project Drishti · CEO Office</div>
          <div>Gate Status: <span className="text-white font-bold">{arbiterVerdict.status.split('·')[0]}</span></div>
          <div>Baseline: {state.case.fillRate}% fill · {state.case.inventoryDays}d network</div>
        </div>
      </div>
    </aside>
  );
};
