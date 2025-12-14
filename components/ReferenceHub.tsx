
import React, { useState } from 'react';
import { Box, Book, Calculator, Grid, ShieldAlert, Beaker, Atom, Microscope, Search, Filter, Trash2, FileText, ExternalLink, Droplets } from 'lucide-react';
import { LabType, SafetyLevel, Chemical } from '../types';
import { searchChemicals } from '../data/chemicalDatabase';
import PeriodicTable from './PeriodicTable';
import ChemistryCalculators from './ChemistryCalculators';
import PhysicsTools from './PhysicsTools';
import BiologyTools from './BiologyTools';

type HubTab = 'DATABASE' | 'TOOLS' | 'REF' | 'SAFETY';

const ReferenceHub: React.FC = () => {
  const [subject, setSubject] = useState<LabType>(LabType.CHEMISTRY);
  const [activeTab, setActiveTab] = useState<HubTab>('DATABASE');

  // Chemistry specific state
  const [chemSearch, setChemSearch] = useState('');
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);

  const getThemeColor = () => {
      switch(subject) {
          case LabType.CHEMISTRY: return 'text-cyan-400 border-cyan-500';
          case LabType.BIOLOGY: return 'text-green-400 border-green-500';
          case LabType.PHYSICS: return 'text-orange-400 border-orange-500';
          default: return 'text-slate-400';
      }
  };

  // --- CONTENT RENDERERS ---

  const renderChemicalDatabase = () => {
      const results = searchChemicals(chemSearch).filter(c => c.subject === LabType.CHEMISTRY);
      return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-4 bg-lab-dark border-b border-slate-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search chemicals..." 
                        value={chemSearch}
                        onChange={(e) => setChemSearch(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-lab-accent outline-none"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {results.map((chem) => (
                    <button 
                        key={chem.id}
                        onClick={() => setSelectedChemical(chem)}
                        className="w-full text-left p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-all flex justify-between items-center"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{chem.emoji}</span>
                            <div>
                                <h3 className="font-bold text-white">{chem.commonName}</h3>
                                <p className="text-xs text-slate-400 font-mono">{chem.formula}</p>
                            </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${chem.safetyLevel === SafetyLevel.SAFE ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
                            {chem.safetyLevel}
                        </span>
                    </button>
                ))}
            </div>
        </div>
      );
  };

  const renderContent = () => {
      // CHEMISTRY
      if (subject === LabType.CHEMISTRY) {
          if (activeTab === 'DATABASE') return renderChemicalDatabase();
          if (activeTab === 'TOOLS') return <ChemistryCalculators />;
          if (activeTab === 'REF') return <PeriodicTable />;
          if (activeTab === 'SAFETY') return <SafetyGuide type={LabType.CHEMISTRY} />;
      }
      // BIOLOGY
      if (subject === LabType.BIOLOGY) {
          if (activeTab === 'DATABASE') return <div className="p-8 text-center text-slate-500">Organism Database Coming Soon</div>;
          if (activeTab === 'TOOLS') return <BiologyTools />;
          if (activeTab === 'REF') return <div className="p-8 text-center text-slate-500">Cell Atlas Coming Soon</div>;
          if (activeTab === 'SAFETY') return <SafetyGuide type={LabType.BIOLOGY} />;
      }
      // PHYSICS
      if (subject === LabType.PHYSICS) {
          if (activeTab === 'DATABASE') return <div className="p-8 text-center text-slate-500">Concept Database Coming Soon</div>;
          if (activeTab === 'TOOLS') return <PhysicsTools />; // Includes Constants which is sorta Ref
          if (activeTab === 'REF') return <PhysicsTools />; // Reuse for now as it has Constants
          if (activeTab === 'SAFETY') return <SafetyGuide type={LabType.PHYSICS} />;
      }
      return null;
  };

  return (
    <div className="h-full flex flex-col bg-lab-darker relative">
      
      {/* Subject Switcher */}
      <div className="flex bg-slate-900 border-b border-slate-800">
          {[
              { id: LabType.CHEMISTRY, icon: Beaker, label: 'Chemistry' },
              { id: LabType.BIOLOGY, icon: Microscope, label: 'Biology' },
              { id: LabType.PHYSICS, icon: Atom, label: 'Physics' }
          ].map(s => (
              <button
                key={s.id}
                onClick={() => { setSubject(s.id); setActiveTab('DATABASE'); }}
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-colors ${subject === s.id ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  <s.icon size={16} className={subject === s.id ? getThemeColor().split(' ')[0] : ''} />
                  {s.label}
              </button>
          ))}
      </div>

      {/* Tab Navigation */}
      <div className="bg-lab-dark border-b border-slate-800 flex overflow-x-auto">
          {[
              { id: 'DATABASE', label: 'Database', icon: Box },
              { id: 'TOOLS', label: 'Tools', icon: Calculator },
              { id: 'REF', label: 'Reference', icon: Grid },
              { id: 'SAFETY', label: 'Safety', icon: ShieldAlert },
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as HubTab)}
                className={`flex-1 min-w-[80px] py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all border-b-2 ${
                    activeTab === tab.id 
                    ? `border-white text-white bg-slate-800/50` 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                  <tab.icon size={16} />
                  {tab.label}
              </button>
          ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
          {renderContent()}
      </div>

      {/* Chemical Detail Modal (Reused) */}
      {selectedChemical && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                  <button onClick={() => setSelectedChemical(null)} className="absolute top-4 right-4 text-slate-400"><Trash2/></button>
                  <div className="text-4xl mb-4">{selectedChemical.emoji}</div>
                  <h2 className="text-2xl font-bold text-white">{selectedChemical.commonName}</h2>
                  <p className="text-cyan-400 font-mono mb-4">{selectedChemical.formula}</p>
                  <p className="text-slate-300 text-sm mb-4">{selectedChemical.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-slate-800 p-2 rounded text-center">
                          <div className="text-xs text-slate-500 uppercase">State</div>
                          <div className="font-bold text-white">{selectedChemical.state}</div>
                      </div>
                      <div className="bg-slate-800 p-2 rounded text-center">
                          <div className="text-xs text-slate-500 uppercase">pH</div>
                          <div className="font-bold text-white">{selectedChemical.pH || 'N/A'}</div>
                      </div>
                  </div>

                  <div className="border border-red-500/30 bg-red-500/10 p-4 rounded-xl">
                      <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2"><ShieldAlert size={14}/> Hazards</h4>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-red-200">
                          {selectedChemical.healthHazards.map((h,i) => <li key={i}>{h}</li>)}
                      </ul>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const SafetyGuide = ({ type }: { type: LabType }) => (
    <div className="p-6 overflow-y-auto h-full space-y-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <ShieldAlert className="text-lab-safe"/> Safety Protocols
        </h2>
        <p className="text-slate-400 text-sm mb-6">Standard operating procedures for {type.toLowerCase()} labs.</p>

        <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <h3 className="font-bold text-white mb-2">General Rules</h3>
                <ul className="list-disc pl-4 space-y-2 text-sm text-slate-300">
                    <li>Always wear appropriate PPE (Goggles, Gloves).</li>
                    <li>Never eat or drink in the laboratory.</li>
                    <li>Know the location of the eye wash station and fire extinguisher.</li>
                </ul>
            </div>

            {type === LabType.CHEMISTRY && (
                <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30">
                    <h3 className="font-bold text-red-400 mb-2">Chemical Safety</h3>
                    <ul className="list-disc pl-4 space-y-2 text-sm text-red-200">
                        <li>Always add Acid to Water (AAA), never reverse.</li>
                        <li>Check Safety Data Sheets (SDS) before use.</li>
                        <li>Dispose of chemical waste in designated containers.</li>
                    </ul>
                </div>
            )}

            {type === LabType.BIOLOGY && (
                <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/30">
                    <h3 className="font-bold text-green-400 mb-2">Biohazard Safety</h3>
                    <ul className="list-disc pl-4 space-y-2 text-sm text-green-200">
                        <li>Wash hands before and after handling specimens.</li>
                        <li>Treat all unknown microorganisms as pathogens.</li>
                        <li>Sterilize loops and spreaders with flame/alcohol.</li>
                    </ul>
                </div>
            )}

            {type === LabType.PHYSICS && (
                <div className="bg-orange-900/20 p-4 rounded-xl border border-orange-500/30">
                    <h3 className="font-bold text-orange-400 mb-2">Equipment Safety</h3>
                    <ul className="list-disc pl-4 space-y-2 text-sm text-orange-200">
                        <li>Check electrical cords for fraying.</li>
                        <li>Be aware of moving parts and pinch points.</li>
                        <li>Use caution with lasers and high-intensity light sources.</li>
                    </ul>
                </div>
            )}
        </div>
    </div>
);

export default ReferenceHub;
