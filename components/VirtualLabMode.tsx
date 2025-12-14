
import React, { useState, useEffect } from 'react';
import { FlaskConical, Microscope, Atom, ArrowLeft, RotateCcw, Activity, Play, CheckCircle, ShieldAlert, X, Award, AlertTriangle, FileText, MousePointer2, Move, Info, BookOpen } from 'lucide-react';
import { LabType, LabItem, SafetyLevel, ReactionResult, Experiment } from '../types';
import { SHELF_ITEMS } from '../data/virtualLabData';
import { experiments } from '../data/experiments';
import VirtualLabScene from './VirtualLabScene';
import { safetyService } from '../services/safetyService';
import DataLogger from './DataLogger';

interface SessionLog {
    time: string;
    action: string;
    type: 'INFO' | 'REACTION' | 'DANGER';
}

const VirtualLabMode: React.FC = () => {
  const [selectedLab, setSelectedLab] = useState<LabType>(LabType.NONE);
  const [activeExperiment, setActiveExperiment] = useState<Experiment | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [droppedItem, setDroppedItem] = useState<LabItem | null>(null);
  const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null);
  const [showDataLogger, setShowDataLogger] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showExpPicker, setShowExpPicker] = useState(false);
  const [score, setScore] = useState(100);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Auto-start logging when lab opens
  useEffect(() => {
      if (selectedLab !== LabType.NONE) {
          addLog(`Started ${selectedLab} Virtual Lab session.`, 'INFO');
          setScore(100);
          setSessionLogs([]);
          setShowAssessment(false);
          setActiveExperiment(null);
          setCurrentStepIndex(0);
      }
  }, [selectedLab]);

  const addLog = (action: string, type: 'INFO' | 'REACTION' | 'DANGER') => {
      const log = {
          time: new Date().toLocaleTimeString(),
          action,
          type
      };
      setSessionLogs(prev => [...prev, log]);
  };

  const handleDrop = (item: LabItem) => {
      setDroppedItem(item);
      addLog(`Added ${item.name} to workbench`, 'INFO');
  };

  const handleContentsChange = (contents: string[]) => {
      if (activeExperiment) {
          const neededMaterial = activeExperiment.materials[Math.min(currentStepIndex, activeExperiment.materials.length - 1)];
          const hasNeeded = contents.some(c => c.toLowerCase().includes(neededMaterial.toLowerCase().replace(' ', '_')));
          
          if (hasNeeded && currentStepIndex < activeExperiment.steps.length - 1) {
             // Logic tracked in onReaction mostly
          }
      }
  };

  const handleReaction = (result: ReactionResult) => {
      setReactionResult(result);
      
      if (activeExperiment) {
          const isExpected = activeExperiment.expectedOutput.toLowerCase().includes(result.visualEffect?.toLowerCase() || 'xyz');
          const isSafe = result.severity === SafetyLevel.SAFE || result.severity === SafetyLevel.CAUTION;
          
          if (isExpected || isSafe) {
              if (currentStepIndex < activeExperiment.steps.length) {
                  setCurrentStepIndex(activeExperiment.steps.length); // Mark done
                  setScore(prev => Math.min(100, prev + 10));
              }
          }
      }

      if (result.severity === SafetyLevel.DANGER || result.severity === SafetyLevel.EXTREME) {
          safetyService.speak(`Warning: ${result.alertTitle}`);
          addLog(`SAFETY INCIDENT: ${result.alertTitle}`, 'DANGER');
          setScore(prev => Math.max(0, prev - 20)); // Penalty
      } else if (result.severity === SafetyLevel.CAUTION) {
          safetyService.speak("Caution observed.");
          addLog(`Reaction: ${result.alertTitle}`, 'REACTION');
          setScore(prev => Math.max(0, prev - 5));
      } else if (result.safe && result.visualEffect === 'NONE') {
          addLog(`Mixed: ${result.alertTitle}`, 'INFO');
      } else {
          safetyService.speak("Reaction observed.");
          addLog(`Reaction: ${result.alertTitle}`, 'REACTION');
      }
  };

  const finishSession = () => {
      setShowAssessment(true);
  };

  const getGrade = (s: number) => {
      if (s >= 90) return 'A';
      if (s >= 80) return 'B';
      if (s >= 70) return 'C';
      if (s >= 60) return 'D';
      return 'F';
  };

  const resetLab = () => {
      setReactionResult(null);
      const currentLab = selectedLab;
      setSelectedLab(LabType.NONE);
      setTimeout(() => setSelectedLab(currentLab), 10);
  };

  const startExperiment = (exp: Experiment) => {
      setActiveExperiment(exp);
      setCurrentStepIndex(0);
      setShowExpPicker(false);
      resetLab();
      addLog(`Started Guided Experiment: ${exp.title}`, 'INFO');
  };

  const isItemNeeded = (item: LabItem) => {
      if (!activeExperiment) return false;
      return activeExperiment.materials.some(m => 
          item.name.toLowerCase().includes(m.toLowerCase()) || 
          m.toLowerCase().includes(item.name.toLowerCase())
      );
  };

  const renderLabSelection = () => (
    <div className="p-6 h-full flex flex-col justify-center gap-6 animate-in fade-in">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-white mb-2">Virtual Laboratory</h2>
        <p className="text-slate-400">Select a discipline to enter the simulation environment.</p>
      </div>

      <button
        onClick={() => setSelectedLab(LabType.CHEMISTRY)}
        className="relative group p-8 rounded-3xl bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-700/30 hover:border-cyan-500 transition-all text-left shadow-2xl hover:scale-[1.02]"
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity text-cyan-400">
            <FlaskConical size={80} />
        </div>
        <h3 className="text-2xl font-bold text-cyan-400 mb-2">Chemistry Lab</h3>
        <ul className="text-sm text-slate-300 space-y-1 list-disc pl-4 opacity-80">
            <li>Acid-Base Reactions</li>
            <li>Titration Simulation</li>
            <li>Safety Training</li>
        </ul>
      </button>

      <button
        onClick={() => setSelectedLab(LabType.BIOLOGY)}
        className="relative group p-8 rounded-3xl bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-700/30 hover:border-green-500 transition-all text-left shadow-2xl hover:scale-[1.02]"
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity text-green-400">
            <Microscope size={80} />
        </div>
        <h3 className="text-2xl font-bold text-green-400 mb-2">Biology Lab</h3>
        <ul className="text-sm text-slate-300 space-y-1 list-disc pl-4 opacity-80">
            <li>Microscopy</li>
            <li>Cell Structure</li>
            <li>Growth Tracking</li>
        </ul>
      </button>

      <button
        onClick={() => setSelectedLab(LabType.PHYSICS)}
        className="relative group p-8 rounded-3xl bg-gradient-to-r from-orange-900/40 to-amber-900/40 border border-orange-700/30 hover:border-orange-500 transition-all text-left shadow-2xl hover:scale-[1.02]"
      >
         <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity text-orange-400">
            <Atom size={80} />
        </div>
        <h3 className="text-2xl font-bold text-orange-400 mb-2">Physics Lab</h3>
        <ul className="text-sm text-slate-300 space-y-1 list-disc pl-4 opacity-80">
            <li>Kinematics & Gravity</li>
            <li>Simple Machines</li>
            <li>Electricity</li>
        </ul>
      </button>
    </div>
  );

  const renderWorkbench = () => {
    const shelf = SHELF_ITEMS[selectedLab];
    let themeColor = 'text-cyan-500';
    let borderColor = 'border-cyan-500/30';
    let shelfBg = 'bg-slate-900';
    
    if (selectedLab === LabType.BIOLOGY) {
        themeColor = 'text-green-500';
        borderColor = 'border-green-500/30';
        shelfBg = 'bg-[#0f291e]'; // Dark green shelf
    }
    if (selectedLab === LabType.PHYSICS) {
        themeColor = 'text-orange-500';
        borderColor = 'border-orange-500/30';
        shelfBg = 'bg-[#1c1917]'; // Dark stone shelf
    }

    return (
      <div className="flex h-full relative bg-black">
        {/* Left Shelf (Chemicals) */}
        <div className={`w-24 ${shelfBg} border-r border-white/10 flex flex-col items-center py-4 gap-4 z-10 overflow-y-auto scrollbar-hide shadow-xl`}>
            <div className={`text-[10px] font-bold ${themeColor} uppercase rotate-180 writing-vertical tracking-widest`}>Inventory</div>
            {shelf.chemicals.map(item => {
                const isHighlighted = isItemNeeded(item);
                return (
                    <button
                        key={item.id}
                        onClick={() => handleDrop(item)}
                        className={`w-16 h-16 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 group relative ${
                            isHighlighted 
                            ? 'bg-yellow-900/20 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)] animate-pulse' 
                            : 'bg-white/5 border-white/10 hover:border-white/50 hover:bg-white/10'
                        }`}
                    >
                        <div className="text-2xl group-hover:scale-110 transition-transform drop-shadow-md">{item.icon}</div>
                        <span className="text-[8px] text-slate-400 group-hover:text-white text-center leading-tight px-1 transition-colors">{item.name}</span>
                        {isHighlighted && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-slate-900" />}
                    </button>
                );
            })}
        </div>

        {/* Center 3D Viewport */}
        <div className="flex-1 relative flex flex-col">
            {/* Header Overlay */}
            <div className="absolute top-4 left-4 z-10 flex gap-4">
                <button onClick={() => setSelectedLab(LabType.NONE)} className="bg-black/60 backdrop-blur p-2 rounded-lg text-white border border-white/10 hover:bg-white/20 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className={`bg-black/60 backdrop-blur px-4 py-2 rounded-lg border ${borderColor} flex items-center gap-3 shadow-lg`}>
                    <div>
                        <div className={`text-xs font-bold ${themeColor} tracking-wider`}>{selectedLab} LAB</div>
                        <div className="text-sm font-bold text-white">{activeExperiment ? activeExperiment.title : 'Free Play'}</div>
                    </div>
                    <button onClick={() => setShowExpPicker(true)} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/5 transition-all">
                        <BookOpen size={14}/> {activeExperiment ? 'Change' : 'Select Experiment'}
                    </button>
                </div>
            </div>

            {/* Guided Mode Overlay */}
            {activeExperiment && (
                <div className="absolute top-20 right-4 z-10 w-64 bg-black/80 backdrop-blur p-4 rounded-xl border border-white/10 shadow-2xl animate-in slide-in-from-right">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-white text-sm">Experiment Guide</h4>
                        <span className="text-xs text-slate-400">{Math.min(currentStepIndex + 1, activeExperiment.steps.length)} / {activeExperiment.steps.length}</span>
                    </div>
                    <div className="space-y-4">
                        {currentStepIndex >= activeExperiment.steps.length ? (
                            <div className="text-green-400 text-sm font-bold flex items-center gap-2">
                                <CheckCircle size={16} /> Experiment Complete!
                            </div>
                        ) : (
                            <div className="text-sm text-white">
                                <span className="text-slate-400 font-bold mr-2">Step {currentStepIndex + 1}:</span>
                                {activeExperiment.steps[currentStepIndex]}
                            </div>
                        )}
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ${selectedLab === LabType.BIOLOGY ? 'bg-green-500' : selectedLab === LabType.PHYSICS ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                style={{ width: `${(Math.min(currentStepIndex + 1, activeExperiment.steps.length) / activeExperiment.steps.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Reaction Analysis Modal */}
            {reactionResult && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className={`bg-slate-900 border-2 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 ${
                        reactionResult.severity === SafetyLevel.DANGER || reactionResult.severity === SafetyLevel.EXTREME 
                        ? 'border-red-500 shadow-red-900/20' 
                        : 'border-green-500 shadow-green-900/20'
                    }`}>
                        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${
                             reactionResult.severity === SafetyLevel.SAFE ? 'bg-green-500' : 'bg-red-500'
                        }`} />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                                    reactionResult.severity === SafetyLevel.SAFE 
                                    ? 'bg-green-900/50 border-green-500 text-green-400' 
                                    : 'bg-red-900/50 border-red-500 text-red-400'
                                }`}>
                                    {reactionResult.severity === SafetyLevel.SAFE ? <FlaskConical size={32} /> : <ShieldAlert size={32} />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white leading-none mb-1">Reaction Result</h2>
                                    <div className={`text-xs font-bold uppercase tracking-wider ${
                                         reactionResult.severity === SafetyLevel.SAFE ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {reactionResult.alertTitle}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                                <h3 className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                    <Microscope size={14}/> Scientific Observation
                                </h3>
                                <p className="text-white text-sm leading-relaxed">
                                    {reactionResult.alertMessage}
                                </p>
                                {reactionResult.productName && (
                                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                                        <span className="text-slate-400 text-xs">Product Formed:</span>
                                        <span className={`font-mono text-sm font-bold ${themeColor}`}>{reactionResult.productName}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setReactionResult(null)} 
                                    className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Continue Experiment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hover Tooltip */}
            {hoveredItem && !reactionResult && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className={`px-4 py-2 bg-black/70 backdrop-blur-md border ${borderColor} rounded-full flex items-center gap-2 text-white shadow-xl`}>
                        <MousePointer2 size={14} className={themeColor} />
                        <span className="font-bold text-sm">{hoveredItem}</span>
                    </div>
                </div>
            )}

            {/* Interaction Hint */}
            {!hoveredItem && !reactionResult && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-50 flex items-center gap-2 text-xs text-white bg-black/30 px-3 py-1 rounded-full border border-white/5">
                    <Move size={12} /> {selectedLab === LabType.PHYSICS ? 'Drag items to build experiment' : 'Drag items to mix'}
                </div>
            )}

            {/* 3D Scene */}
            <div className="flex-1 relative cursor-default">
                <VirtualLabScene 
                    labType={selectedLab} 
                    droppedItem={droppedItem} 
                    onItemProcessed={() => setDroppedItem(null)}
                    onReaction={handleReaction}
                    onContentsChange={handleContentsChange}
                    onHover={(name) => setHoveredItem(name)}
                />
            </div>

            {/* Data Logger Panel */}
            {showDataLogger && (
                <div className="h-64 border-t border-white/10 animate-in slide-in-from-bottom relative z-20 shadow-2xl">
                    <DataLogger isVirtual={true} />
                </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <button 
                    onClick={() => setShowDataLogger(!showDataLogger)} 
                    className={`p-3 rounded-full shadow-lg transition-colors border border-white/10 ${showDataLogger ? 'bg-white text-black' : 'bg-black/60 text-white hover:bg-black/80'}`}
                    title="Toggle Data Logger"
                >
                    <Activity size={20} />
                </button>
                <button onClick={resetLab} className="bg-black/60 text-white p-3 rounded-full shadow-lg hover:bg-black/80 border border-white/10 transition-colors" title="Reset Lab">
                    <RotateCcw size={20} />
                </button>
                <button onClick={finishSession} className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-500 font-bold flex items-center gap-2 border border-green-400/30">
                    <CheckCircle size={20} /> Finish
                </button>
            </div>
        </div>

        {/* Right Shelf (Equipment) */}
        <div className={`w-24 ${shelfBg} border-l border-white/10 flex flex-col items-center py-4 gap-4 z-10 overflow-y-auto scrollbar-hide shadow-xl`}>
            <div className={`text-[10px] font-bold ${themeColor} uppercase rotate-180 writing-vertical tracking-widest`}>Equipment</div>
            {shelf.equipment.map(item => (
                <button
                    key={item.id}
                    onClick={() => handleDrop(item)}
                    className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 hover:border-white/50 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-1 group"
                >
                    <div className="text-2xl group-hover:scale-110 transition-transform drop-shadow-md">{item.icon}</div>
                    <span className="text-[8px] text-slate-400 group-hover:text-white text-center leading-tight px-1 transition-colors">{item.name}</span>
                </button>
            ))}
        </div>

        {/* Experiment Picker Modal */}
        {showExpPicker && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-8 shadow-2xl relative max-h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><BookOpen/> Select Experiment</h2>
                        <button onClick={() => setShowExpPicker(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {experiments.filter(e => e.subject === selectedLab).map(exp => (
                            <button
                                key={exp.id}
                                onClick={() => startExperiment(exp)}
                                className="text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold text-white group-hover:${themeColor}`}>{exp.title}</h3>
                                    <span className="text-[10px] px-2 py-1 bg-slate-900 rounded text-slate-400">{exp.difficulty}</span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2">{exp.scientificPrinciple}</p>
                                <div className="mt-3 flex gap-2">
                                    {exp.materials.slice(0, 3).map((m, i) => (
                                        <span key={i} className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-500">{m}</span>
                                    ))}
                                    {exp.materials.length > 3 && <span className="text-[10px] text-slate-500">+{exp.materials.length - 3}</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Assessment Modal (Same as before) */}
        {showAssessment && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative">
                    <button onClick={() => setShowAssessment(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X/></button>
                    
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 rounded-full bg-slate-800 border-4 border-slate-700 mb-4">
                            <span className={`text-6xl font-black ${score >= 70 ? 'text-green-400' : 'text-red-400'}`}>{getGrade(score)}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Lab Report Card</h2>
                        <p className="text-slate-400">Session Score: {score}/100</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-800 p-4 rounded-xl">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2"><Activity size={16} /> Activity Log</h3>
                            <div className="h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {sessionLogs.map((log, i) => (
                                    <div key={i} className="text-xs flex gap-2">
                                        <span className="text-slate-500 font-mono">{log.time}</span>
                                        <span className={log.type === 'DANGER' ? 'text-red-400 font-bold' : 'text-slate-300'}>{log.action}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-slate-800 p-4 rounded-xl">
                                <h3 className="font-bold text-white mb-2 flex items-center gap-2"><ShieldAlert size={16} /> Safety Analysis</h3>
                                {score === 100 ? (
                                    <div className="text-green-400 text-sm flex items-center gap-2"><CheckCircle size={14}/> Perfect Safety Record</div>
                                ) : (
                                    <div className="text-red-400 text-sm flex items-center gap-2"><AlertTriangle size={14}/> Safety Violations Detected</div>
                                )}
                            </div>
                            <button className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                                <FileText size={18}/> Export PDF Report
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button onClick={() => { setShowAssessment(false); setSelectedLab(LabType.NONE); }} className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-full">
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-lab-darker">
      {selectedLab === LabType.NONE ? renderLabSelection() : renderWorkbench()}
    </div>
  );
};

export default VirtualLabMode;
