import React from 'react';
import { AegisProvider, useAegis } from './context/AegisContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ExecutiveCommandCentre } from './components/sections/ExecutiveCommandCentre';
import { GateArbiterSection } from './components/sections/GateArbiterSection';
import { RiskRadarSection } from './components/sections/RiskRadarSection';
import { MonteCarloLab } from './components/sections/MonteCarloLab';
import { PredictiveMlStudio } from './components/sections/PredictiveMlStudio';
import { FinancialIntelligence } from './components/sections/FinancialIntelligence';
import { CapitalRoadmapSection } from './components/sections/CapitalRoadmapSection';
import { DataAuditCenter } from './components/sections/DataAuditCenter';
import { AlgorithmAuditTrail } from './components/sections/AlgorithmAuditTrail';

const MainContent: React.FC = () => {
  const { activeSection } = useAegis();

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <ExecutiveCommandCentre />;
      case 'arbiter':
        return <GateArbiterSection />;
      case 'radar':
        return <RiskRadarSection />;
      case 'scenario':
        return <MonteCarloLab />;
      case 'learning':
        return <PredictiveMlStudio />;
      case 'capital':
        return <FinancialIntelligence />;
      case 'roadmap':
        return <CapitalRoadmapSection />;
      case 'audit':
        return <DataAuditCenter />;
      case 'algorithms':
        return <AlgorithmAuditTrail />;
      default:
        return <ExecutiveCommandCentre />;
    }
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
        {renderSection()}
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>DRISHTI AEGIS 4.0</strong> · Project Drishti CEO Transformation Office
          </div>
          <div className="text-[11px] text-slate-400">
            Source: ACPL Case Brief Appendices 1–6 · Seeded Stochastic Simulation · Local Supervised Ridge Fit
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AegisProvider>
      <div className="min-h-screen flex bg-[#F0F4F9] text-[#122B4C] font-sans antialiased">
        <Sidebar />
        <MainContent />
      </div>
    </AegisProvider>
  );
}
