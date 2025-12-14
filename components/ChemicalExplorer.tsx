
import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, Beaker, Atom, Microscope, Info, X, ExternalLink, Droplets, Thermometer, Box, Book, Calculator, Grid, ShieldAlert, Trash2, FileText } from 'lucide-react';
import { Chemical, LabType, SafetyLevel } from '../types';
import { searchChemicals } from '../data/chemicalDatabase';
import PeriodicTable from './PeriodicTable';
import ChemistryCalculators from './ChemistryCalculators';

type HubTab = 'DATABASE' | 'PERIODIC' | 'CALC' | 'SAFETY';

const ChemicalExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HubTab>('DATABASE');
  
  // Database State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<LabType | 'ALL'>('ALL');
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);

  const results = searchChemicals(searchQuery).filter(c => 
    selectedSubject === 'ALL' || c.subject === selectedSubject
  );

  const getSafetyColor = (level: SafetyLevel) => {
    switch(level) {
      case SafetyLevel.SAFE: return 'border-green-500 text-green-400 bg-green-500/10';
      case SafetyLevel.CAUTION: return 'border-yellow-500 text-yellow-400 bg-yellow-500/10';
      case SafetyLevel.DANGER: return 'border-red-500 text-red-400 bg-red-500/10';
      case SafetyLevel.EXTREME: return 'border-red-700 text-red-600 bg-red-900/20';
      default: return 'border-slate-500 text-slate-400';
    }
  };

  const getSubjectIcon = (type: LabType) => {
    switch(type) {
        case LabType.CHEMISTRY: return <Beaker size={14} />;
        case LabType.BIOLOGY: return <Microscope size={14} />;
        case LabType.PHYSICS: return <Atom size={14} />;
        default: return <Info size={14} />;
    }
  };

  const renderDatabase = () => (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 bg-lab-dark border-b border-slate-800">
             <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search chemicals, formulas..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-lab-accent outline-none"
                    />
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['ALL', LabType.CHEMISTRY, LabType.BIOLOGY, LabType.PHYSICS].map((sub) => (
                    <button
                        key={sub}
                        onClick={() => setSelectedSubject(sub as any)}
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${
                            selectedSubject === sub 
                            ? 'bg-lab-accent/20 border-lab-accent text-lab-accent' 
                            : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                        }`}
                    >
                        {sub}
                    </button>
                ))}
            </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {results.length === 0 ? (
                <div className="text-center text-slate-500 mt-10">
                    <p>No chemicals found.</p>
                </div>
            ) : (
                results.map((chem) => (
                    <button 
                        key={chem.id}
                        onClick={() => setSelectedChemical(chem)}
                        className={`w-full text-left p-4 rounded-xl border bg-slate-800/50 hover:bg-slate-800 transition-all group ${getSafetyColor(chem.safetyLevel).replace('bg-', 'hover:bg-').split(' ')[0]}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{chem.emoji}</span>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-lab-accent transition-colors">{chem.commonName}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                        <span className="bg-slate-900 px-1 rounded">{chem.formula}</span>
                                        <span className="flex items-center gap-1 uppercase tracking-tighter opacity-70">
                                            {getSubjectIcon(chem.subject)} {chem.subject}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getSafetyColor(chem.safetyLevel)}`}>
                                {chem.safetyLevel}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{chem.description}</p>
                    </button>
                ))
            )}
        </div>
    </div>
  );

  const renderSafetyGuide = () => (
      <div className="p-6 overflow-y-auto h-full space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Safety Reference Guide</h2>
          
          <div className="grid gap-4">
              <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl">
                  <h3 className="text-red-400 font-bold flex items-center gap-2 mb-4"><AlertTriangle/> Incompatibility Matrix</h3>
                  <p className="text-sm text-slate-300 mb-4">Common dangerous combinations to avoid in the lab.</p>
                  
                  <div className="space-y-2 text-xs">
                      {[
                          { a: 'Bleach', b: 'Ammonia', r: 'Toxic Chloramine Gas' },
                          { a: 'Bleach', b: 'Acids (Vinegar)', r: 'Chlorine Gas' },
                          { a: 'Flammables', b: 'Oxidizers', r: 'Fire/Explosion' },
                          { a: 'Water', b: 'Strong Acid', r: 'Heat/Splash Hazard' },
                      ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/40 p-2 rounded">
                              <span className="font-bold text-red-200">{item.a} + {item.b}</span>
                              <span className="text-red-400">→ {item.r}</span>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-white font-bold flex items-center gap-2 mb-4"><Trash2 size={18} className="text-slate-400"/> Waste Disposal</h3>
                  <ul className="list-disc pl-4 space-y-2 text-sm text-slate-300">
                      <li><strong className="text-white">Organic Solvents:</strong> Segregated container. Do not pour down drain.</li>
                      <li><strong className="text-white">Acids/Bases:</strong> Neutralize before disposal if permitted, otherwise hazardous waste bin.</li>
                      <li><strong className="text-white">Sharps/Glass:</strong> Dedicated sharps container.</li>
                      <li><strong className="text-white">Biologicals:</strong> Autoclave or bleach before disposal.</li>
                  </ul>
              </div>

               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-white font-bold flex items-center gap-2 mb-4"><FileText size={18} className="text-slate-400"/> Safety Data Sheets (SDS)</h3>
                  <p className="text-sm text-slate-300 mb-4">Always review the SDS before using a new chemical.</p>
                  <a href="https://chemicalsafety.com/sds-search/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-lab-accent hover:underline text-sm">
                      Search Global SDS Database <ExternalLink size={12}/>
                  </a>
              </div>
          </div>
      </div>
  );

  return (
    <div className="h-full flex flex-col bg-lab-darker relative">
      {/* Tab Navigation */}
      <div className="bg-lab-dark border-b border-slate-800 flex overflow-x-auto">
          {[
              { id: 'DATABASE', label: 'Database', icon: Box },
              { id: 'PERIODIC', label: 'Periodic Table', icon: Grid },
              { id: 'CALC', label: 'Calculators', icon: Calculator },
              { id: 'SAFETY', label: 'Safety', icon: ShieldAlert },
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as HubTab)}
                className={`flex-1 min-w-[100px] py-4 flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all border-b-2 ${
                    activeTab === tab.id 
                    ? 'border-lab-accent text-white bg-slate-800' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-lab-accent' : 'text-slate-500'} />
                  {tab.label}
              </button>
          ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
          {activeTab === 'DATABASE' && renderDatabase()}
          {activeTab === 'PERIODIC' && <PeriodicTable />}
          {activeTab === 'CALC' && <ChemistryCalculators />}
          {activeTab === 'SAFETY' && renderSafetyGuide()}
      </div>

      {/* Chemical Details Modal (Reused from previous version) */}
      {selectedChemical && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedChemical(null)}
            />
            <div className="relative w-full max-w-lg h-[90%] sm:h-auto bg-lab-dark border border-slate-700 sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
                <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex flex-col justify-end">
                    <button 
                        onClick={() => setSelectedChemical(null)}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute top-4 left-4 text-4xl">{selectedChemical.emoji}</div>
                    <h2 className="text-2xl font-bold text-white">{selectedChemical.commonName}</h2>
                    <p className="text-lab-accent font-mono">{selectedChemical.name} • {selectedChemical.formula}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-2">
                         <div className="bg-slate-800/50 p-2 rounded-lg text-center border border-slate-700">
                            <div className="text-xs text-slate-500 uppercase mb-1">State</div>
                            <div className="font-bold text-white text-sm">{selectedChemical.state}</div>
                        </div>
                         <div className="bg-slate-800/50 p-2 rounded-lg text-center border border-slate-700">
                            <div className="text-xs text-slate-500 uppercase mb-1">pH</div>
                            <div className="font-bold text-white text-sm">{selectedChemical.pH || 'N/A'}</div>
                        </div>
                         <div className="bg-slate-800/50 p-2 rounded-lg text-center border border-slate-700">
                            <div className="text-xs text-slate-500 uppercase mb-1">Boiling</div>
                            <div className="font-bold text-white text-sm">{selectedChemical.boilingPoint}</div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-300 mb-2">About</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">{selectedChemical.description}</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${getSafetyColor(selectedChemical.safetyLevel)}`}>
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                            <AlertTriangle size={16} /> Safety & Hazards
                        </h4>
                        <ul className="list-disc pl-4 space-y-1 mb-3">
                            {selectedChemical.healthHazards.map((h, i) => (
                                <li key={i} className="text-xs">{h}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-3">
                         <div className="flex gap-3 text-sm">
                            <Droplets className="w-4 h-4 text-slate-500 mt-0.5" />
                            <div>
                                <span className="text-slate-300 font-medium">Solubility: </span>
                                <span className="text-slate-400">{selectedChemical.solubility}</span>
                            </div>
                        </div>
                        <div className="flex gap-3 text-sm">
                            <Beaker className="w-4 h-4 text-slate-500 mt-0.5" />
                            <div>
                                <span className="text-slate-300 font-medium">Incompatible With: </span>
                                <span className="text-slate-400">
                                    {selectedChemical.incompatibleWith.length > 0 ? selectedChemical.incompatibleWith.join(', ') : 'None listed'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ChemicalExplorer;
