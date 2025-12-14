
import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, CheckCircle, ChevronRight, Clock, FlaskConical, Play, ArrowLeft, ShieldAlert, Award, RotateCcw, BrainCircuit, Search, Filter, Sparkles, Zap, GraduationCap, Globe, Cuboid, Atom, Dna, Volume2, VolumeX } from 'lucide-react';
import { Experiment, LabType, DifficultyLevel, SafetyLevel, NarrationMode } from '../types';
import { experiments } from '../data/experiments';
import { getReactionModel } from '../data/molecularModels';
import { getPhysicsModel } from '../data/physicsModels';
import { getBiologyModel } from '../data/biologyModels';
import MolecularViewer from './MolecularViewer';
import PhysicsViewer from './PhysicsViewer';
import BiologyViewer from './BiologyViewer';
import { audioService } from '../services/audioService';
import { analytics } from '../services/analyticsService';
import { generateDefaultScript, NARRATION_SCRIPTS } from '../data/narrationData';

const ExperimentGuide: React.FC = () => {
  const [selectedExp, setSelectedExp] = useState<Experiment | null>(null);
  const [filterSubject, setFilterSubject] = useState<LabType | 'ALL'>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [captions, setCaptions] = useState('');
  const [isMuted, setIsMuted] = useState(!audioService.isEnabled);

  // Setup Audio Listener for Captions
  useEffect(() => {
      audioService.setCaptionCallback((text) => setCaptions(text));
      return () => audioService.stop();
  }, []);

  // Filter Logic
  const filteredExperiments = experiments.filter(e => {
    const matchesSubject = filterSubject === 'ALL' || e.subject === filterSubject;
    const matchesDiff = filterDifficulty === 'ALL' || e.difficulty === filterDifficulty;
    const matchesSearch = searchQuery === '' || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.scientificPrinciple.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesDiff && matchesSearch;
  });

  const getScript = (exp: Experiment) => {
      const mode = audioService.mode;
      if (NARRATION_SCRIPTS[exp.id] && NARRATION_SCRIPTS[exp.id][mode]) {
          return NARRATION_SCRIPTS[exp.id][mode];
      }
      return generateDefaultScript(exp.title, exp.steps, exp.scientificPrinciple, mode);
  };

  const startExperiment = () => {
    setIsStarted(true);
    setCurrentStep(0);
    analytics.logEvent('experiment_started', { experimentId: selectedExp?.id, title: selectedExp?.title });
    
    if (selectedExp && !isMuted) {
        const script = getScript(selectedExp);
        const safety = audioService.getSafetyWarning(selectedExp.safetyLevel);
        audioService.speak(script.intro + " " + safety);
        audioService.playSound('DING');
    }
  };

  const nextStep = () => {
    if (selectedExp) {
        if (currentStep < selectedExp.steps.length) {
            // Check if finishing
            if (currentStep === selectedExp.steps.length - 1) {
                // Moving to finish screen
                setCurrentStep(currentStep + 1);
                analytics.logEvent('experiment_completed', { experimentId: selectedExp.id });
                if (!isMuted) {
                    const script = getScript(selectedExp);
                    audioService.playSound('SUCCESS');
                    audioService.speak(script.conclusion);
                }
            } else {
                // Next Step
                const nextIdx = currentStep + 1;
                setCurrentStep(nextIdx);
                analytics.logEvent('experiment_step_completed', { experimentId: selectedExp.id, step: nextIdx });
                if (!isMuted) {
                    const script = getScript(selectedExp);
                    const stepText = script.steps[nextIdx] || selectedExp.steps[nextIdx];
                    audioService.playSound('DING');
                    audioService.speak(stepText);
                }
            }
        }
    }
  };

  const reset = () => {
    audioService.stop();
    setIsStarted(false);
    setCurrentStep(0);
  };

  const exit = () => {
    audioService.stop();
    setSelectedExp(null);
    reset();
  };

  const toggleMute = () => {
      const newState = !isMuted;
      setIsMuted(newState);
      audioService.updateSettings({ isEnabled: !newState });
      if (newState) audioService.stop();
  };

  const getDifficultyColor = (level: DifficultyLevel) => {
    switch(level) {
      case DifficultyLevel.BEGINNER: return 'text-green-400 bg-green-500/10 border-green-500/20';
      case DifficultyLevel.INTERMEDIATE: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case DifficultyLevel.ADVANCED: return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400';
    }
  };

  const getSubjectColor = (subject: LabType) => {
    switch(subject) {
        case LabType.CHEMISTRY: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
        case LabType.BIOLOGY: return 'text-green-400 bg-green-500/10 border-green-500/20';
        case LabType.PHYSICS: return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
        default: return 'text-slate-400';
    }
  };

  // --- 3D VIEWER LOGIC ---
  if (show3D && selectedExp) {
      const physModel = getPhysicsModel(selectedExp.id);
      if (physModel) return <PhysicsViewer model={physModel} onClose={() => setShow3D(false)} />;
      const bioModel = getBiologyModel(selectedExp.id);
      if (bioModel) return <BiologyViewer model={bioModel} onClose={() => setShow3D(false)} />;
      const molModel = getReactionModel(selectedExp.id);
      if (molModel) return <MolecularViewer model={molModel} onClose={() => setShow3D(false)} />;
      setShow3D(false);
  }

  // --- WIZARD VIEW ---
  if (selectedExp && isStarted) {
    const isFinished = currentStep >= selectedExp.steps.length;

    return (
      <div className="absolute inset-0 bg-lab-darker z-20 flex flex-col animate-in slide-in-from-right">
        {/* Wizard Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <button onClick={reset} className="text-slate-400 hover:text-white flex items-center gap-2">
                <ArrowLeft size={20} /> Exit
            </button>
            <h3 className="font-bold text-white truncate max-w-[150px] sm:max-w-md">{selectedExp.title}</h3>
            <button onClick={toggleMute} className={`p-2 rounded-full ${isMuted ? 'text-slate-500' : 'text-lab-accent bg-lab-accent/10'}`}>
                {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
            </button>
        </div>

        {/* Wizard Content */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {isFinished ? (
                <div className="animate-in zoom-in duration-500 w-full max-w-2xl">
                    <Award className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
                    <h2 className="text-3xl font-bold text-white mb-2">Experiment Complete!</h2>
                    
                    <div className="space-y-4 max-w-md mx-auto mt-8">
                        <div className="bg-slate-800 p-6 rounded-xl text-left border border-slate-700">
                            <h4 className="font-bold text-lab-accent mb-2 flex items-center gap-2">
                                <BrainCircuit size={18} /> What just happened?
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                {audioService.generateExplanation(selectedExp.scientificPrinciple, selectedExp.advancedPrinciple || '', selectedExp.realWorldApplication || '')}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-lg w-full animate-in fade-in slide-in-from-right duration-300 relative z-10" key={currentStep}>
                     <div className="text-[120px] font-black text-slate-800/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none">
                        {currentStep + 1}
                    </div>
                    
                    {/* Step Text */}
                    <h2 className="text-2xl font-bold text-white mb-8 leading-snug">
                        {getScript(selectedExp).steps[currentStep] || selectedExp.steps[currentStep]}
                    </h2>
                    
                    {currentStep === 0 && (
                        <div className={`p-4 rounded-xl mb-8 text-left border ${selectedExp.safetyLevel === SafetyLevel.DANGER ? 'bg-red-900/20 border-red-500' : 'bg-yellow-500/10 border-yellow-500/50'}`}>
                            <h4 className={`${selectedExp.safetyLevel === SafetyLevel.DANGER ? 'text-red-400' : 'text-yellow-400'} text-sm font-bold flex items-center gap-2 mb-2`}>
                                <ShieldAlert size={16} /> Safety Check
                            </h4>
                            <ul className="list-disc pl-4 space-y-1">
                                {selectedExp.safetyPrecautions.map((warning, i) => (
                                    <li key={i} className={`text-xs ${selectedExp.safetyLevel === SafetyLevel.DANGER ? 'text-red-200' : 'text-yellow-200'}`}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
            
            {/* Caption Overlay */}
            {captions && !isMuted && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-xl text-center text-sm font-medium backdrop-blur-md border border-slate-700 shadow-2xl animate-in slide-in-from-bottom-5">
                    "{captions}"
                </div>
            )}
        </div>

        {/* Wizard Footer */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 z-20">
            {isFinished ? (
                <button onClick={exit} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl">
                    Back to Library
                </button>
            ) : (
                <button 
                    onClick={nextStep}
                    className="w-full bg-lab-accent hover:bg-cyan-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg shadow-lg active:scale-95 transition-transform"
                >
                    {currentStep === selectedExp.steps.length - 1 ? 'Finish Experiment' : 'Next Step'} <ChevronRight />
                </button>
            )}
        </div>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (selectedExp) {
    const has3DModel = getReactionModel(selectedExp.id) !== null || getPhysicsModel(selectedExp.id) !== null || getBiologyModel(selectedExp.id) !== null;
    let ViewIcon = Cuboid;
    let viewColor = 'bg-purple-600 hover:bg-purple-700';
    if (selectedExp.subject === LabType.PHYSICS) { ViewIcon = Atom; viewColor = 'bg-orange-600 hover:bg-orange-700'; } 
    else if (selectedExp.subject === LabType.BIOLOGY) { ViewIcon = Dna; viewColor = 'bg-green-600 hover:bg-green-700'; }

    return (
      <div className="absolute inset-0 bg-lab-darker z-10 flex flex-col animate-in slide-in-from-right">
         <div className="relative h-56 bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex flex-col justify-end border-b border-slate-700">
            <button 
                onClick={() => setSelectedExp(null)}
                className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm transition-colors"
            >
                <ArrowLeft size={24} />
            </button>
            
            <div className="flex gap-2 mb-2">
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSubjectColor(selectedExp.subject)}`}>
                    {selectedExp.subject}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyColor(selectedExp.difficulty)}`}>
                    {selectedExp.difficulty}
                </span>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{selectedExp.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Clock size={14}/> {selectedExp.duration}</span>
                <span className="flex items-center gap-1"><FlaskConical size={14}/> {selectedExp.materials.length} Materials</span>
            </div>

            {has3DModel && (
                <button 
                    onClick={() => {
                        setShow3D(true);
                        analytics.logEvent('simulation_viewed', { experimentId: selectedExp.id });
                    }}
                    className={`absolute top-4 right-4 ${viewColor} text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105`}
                >
                    <ViewIcon size={16} /> 
                    View Simulation
                </button>
            )}
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Fun Fact */}
            {selectedExp.funFact && (
                <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl flex gap-3">
                    <Sparkles className="text-purple-400 flex-shrink-0" size={20} />
                    <div>
                        <h4 className="font-bold text-purple-400 text-sm">Did you know?</h4>
                        <p className="text-xs text-purple-200/80">{selectedExp.funFact}</p>
                    </div>
                </div>
            )}

            {/* Materials */}
            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Required Materials</h3>
                <div className="grid grid-cols-2 gap-2">
                    {selectedExp.materials.map((m, i) => (
                        <div key={i} className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-2 border border-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-lab-accent"></div>
                            <span className="text-sm text-slate-200">{m}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Safety */}
            <div className={`border p-4 rounded-xl ${selectedExp.safetyLevel === SafetyLevel.DANGER ? 'bg-red-900/20 border-red-500/50' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                <h3 className={`${selectedExp.safetyLevel === SafetyLevel.DANGER ? 'text-red-400' : 'text-yellow-400'} font-bold text-sm mb-2 flex items-center gap-2`}>
                    <ShieldAlert size={16} /> Safety Precautions
                </h3>
                <ul className="list-disc pl-4 space-y-1">
                     {selectedExp.safetyPrecautions.map((s, i) => (
                         <li key={i} className="text-xs text-slate-300">{s}</li>
                     ))}
                </ul>
            </div>
         </div>

         <div className="p-4 bg-lab-dark border-t border-slate-800">
             <button 
                onClick={startExperiment}
                className="w-full bg-lab-accent hover:bg-cyan-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
             >
                 <Play className="fill-current" /> Start Experiment
             </button>
         </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="h-full flex flex-col bg-lab-darker">
      <div className="p-4 border-b border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="text-lab-accent" /> Experiment Library
            </h2>
             <div className="text-xs text-slate-500 font-mono">
                {filteredExperiments.length} Found
            </div>
        </div>

        {/* Search */}
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
                type="text" 
                placeholder="Search experiments..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-lab-accent outline-none"
            />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['ALL', LabType.CHEMISTRY, LabType.BIOLOGY, LabType.PHYSICS].map((sub) => (
                    <button
                        key={sub}
                        onClick={() => setFilterSubject(sub as any)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border transition-colors ${
                            filterSubject === sub 
                            ? 'bg-lab-accent/20 border-lab-accent text-lab-accent' 
                            : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                        }`}
                    >
                        {sub}
                    </button>
                ))}
            </div>
             <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['ALL', DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED].map((diff) => (
                    <button
                        key={diff}
                        onClick={() => setFilterDifficulty(diff as any)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border transition-colors ${
                            filterDifficulty === diff 
                            ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                            : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                        }`}
                    >
                        {diff}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
         {filteredExperiments.map((exp) => (
             <button 
                key={exp.id}
                onClick={() => setSelectedExp(exp)}
                className="w-full text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl p-4 transition-all group relative overflow-hidden"
             >
                <div className={`absolute top-0 right-0 w-24 h-24 opacity-5 rotate-12 -translate-y-8 translate-x-8 transition-transform group-hover:scale-110 ${exp.subject === LabType.CHEMISTRY ? 'bg-cyan-500' : exp.subject === LabType.BIOLOGY ? 'bg-green-500' : 'bg-orange-500'} rounded-full blur-2xl`}></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-1">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSubjectColor(exp.subject)}`}>
                            {exp.subject}
                        </span>
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyColor(exp.difficulty)}`}>
                            {exp.difficulty}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-lab-accent transition-colors">{exp.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                        <span className="flex items-center gap-1"><Clock size={12}/> {exp.duration}</span>
                        <span>•</span>
                        <span>{exp.materials.length} Materials</span>
                    </div>
                    {exp.safetyLevel === SafetyLevel.DANGER && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-red-400 font-bold bg-red-900/30 px-2 py-0.5 rounded border border-red-500/30">
                            <ShieldAlert size={10} /> DANGER
                        </div>
                    )}
                </div>
             </button>
         ))}
      </div>
    </div>
  );
};

export default ExperimentGuide;
