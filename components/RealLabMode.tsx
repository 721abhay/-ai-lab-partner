
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, ShieldAlert, FileText, Activity, AlertTriangle, CheckCircle, BrainCircuit, ScanSearch, ExternalLink, Plus, RefreshCw, Beaker, Zap, SwitchCamera, Video, Square, Download } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { identifyChemical } from '../data/chemicalDatabase';
import { analyzeReaction } from '../data/safetyRules';
import { safetyService } from '../services/safetyService';
import { audioService } from '../services/audioService';
import { offlineStorage } from '../services/offlineStorage';
import { analytics } from '../services/analyticsService';
import { Chemical, ReactionResult, SafetyLevel } from '../types';
import ExperimentGuide from './ExperimentGuide';
import DataLogger from './DataLogger';

type Tab = 'CAMERA' | 'IDENTIFY' | 'EXPERIMENTS' | 'SAFETY' | 'LOGGER';

const RealLabMode: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('CAMERA');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  
  // Camera Controls
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashOn, setFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [lastVideoUrl, setLastVideoUrl] = useState<string | null>(null);

  // Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Identification & Comparison State
  const [slot1, setSlot1] = useState<Chemical | null>(null);
  const [slot2, setSlot2] = useState<Chemical | null>(null);
  const [scanTarget, setScanTarget] = useState<1 | 2>(1);
  const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null);

  const startCamera = useCallback(async () => {
    if (stream) stream.getTracks().forEach(t => t.stop());

    try {
      const constraints: MediaStreamConstraints = {
        video: { 
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      if ('torch' in capabilities) setHasFlash(true);
      else setHasFlash(false);

      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setError('');
    } catch (err) {
      console.error("Camera access denied:", err);
      try {
          const videoOnly = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
          setStream(videoOnly);
          if (videoRef.current) videoRef.current.srcObject = videoOnly;
      } catch (e) {
          setError("Camera access required. Please check permissions.");
      }
    }
  }, [facingMode]);

  const toggleCamera = () => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const toggleFlash = async () => {
      if (stream && hasFlash) {
          const track = stream.getVideoTracks()[0];
          try {
              await track.applyConstraints({ advanced: [{ torch: !flashOn } as any] });
              setFlashOn(!flashOn);
          } catch (e) {
              console.error("Flash error", e);
          }
      }
  };

  // Helper to capture current video frame
  const captureFrame = (): string | null => {
      if (!videoRef.current) return null;
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(videoRef.current, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.8);
  };

  const startRecording = () => {
      if (!stream) return;
      const options = { mimeType: 'video/webm;codecs=vp9,opus', bitsPerSecond: 2500000 }; 
      try {
          const recorder = new MediaRecorder(stream, options);
          recordedChunksRef.current = [];
          recorder.ondataavailable = (event) => {
              if (event.data.size > 0) recordedChunksRef.current.push(event.data);
          };
          recorder.onstop = async () => {
              const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
              const url = URL.createObjectURL(blob);
              setLastVideoUrl(url);
              const videoId = await offlineStorage.saveVideo(blob, `Experiment_${new Date().toISOString()}`);
              analytics.logEvent('video_recorded', { durationSeconds: 'unknown', sizeBytes: blob.size, videoId });
          };
          recorder.start();
          setIsRecording(true);
          analytics.logEvent('video_recording_start');
          mediaRecorderRef.current = recorder;
      } catch (e) { console.error("Recorder error", e); }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          analytics.logEvent('video_recording_stop');
      }
  };

  const downloadVideo = () => {
      if (lastVideoUrl) {
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = lastVideoUrl;
          a.download = `experiment_${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(lastVideoUrl);
          setLastVideoUrl(null);
          analytics.logEvent('video_downloaded');
      }
  };

  useEffect(() => {
    startCamera();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, [startCamera]);

  useEffect(() => {
    if (slot1 && slot2) {
        const result = analyzeReaction(slot1, slot2);
        setReactionResult(result);
        safetyService.playAlertSound(result.severity);
        analytics.logEvent('reaction_analyzed', { chem1: slot1.name, chem2: slot2.name, severity: result.severity });

        if (result.severity === SafetyLevel.DANGER || result.severity === SafetyLevel.EXTREME) {
             safetyService.speak(`Warning! ${result.alertTitle}. ${result.alertMessage}`);
             safetyService.logIncident(slot1.name, slot2.name, result.alertTitle);
        } else if (result.severity === SafetyLevel.SAFE) {
             safetyService.speak("Safe to mix.");
        }
    } else {
        setReactionResult(null);
    }
  }, [slot1, slot2]);

  const handleAnalyze = async () => {
    if (!stream || !videoRef.current) return;
    setIsAnalyzing(true);
    setAiAnalysis('');
    
    const frame = captureFrame();
    analytics.logEvent('ai_analysis_request', { context: 'real_lab' });
    
    // Pass image frame to Gemini if available
    const analysis = await geminiService.analyzeExperiment(
        "I am looking at this experiment. Identify potential hazards and what is happening.",
        frame || undefined
    );
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const handleIdentify = async () => {
    if (!stream || !videoRef.current) return;
    setIsAnalyzing(true);

    const frame = captureFrame();
    if (frame) {
        // Real AI Identification
        const chem = await geminiService.identifyChemicalFromImage(frame);
        
        if (chem) {
            analytics.logEvent('chemical_identified', { name: chem.name, id: chem.id });
            if (scanTarget === 1) setSlot1(chem);
            else setSlot2(chem);
            if (scanTarget === 1 && !slot2) setScanTarget(2);
            audioService.playSound('SUCCESS');
        } else {
            safetyService.speak("Could not identify chemical. Please try again.");
            // Fallback for demo if offline or no match
            const mocks = ["Vinegar", "Bleach", "Ammonia", "Baking Soda", "Water"];
            const rand = mocks[Math.floor(Math.random() * mocks.length)];
            const match = identifyChemical(rand);
            if(match) {
                 if (scanTarget === 1) setSlot1(match);
                 else setSlot2(match);
            }
        }
    }
    setIsAnalyzing(false);
  };

  const resetScanner = () => {
      setSlot1(null);
      setSlot2(null);
      setScanTarget(1);
      setReactionResult(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'IDENTIFY':
         return (
             <div className="absolute inset-x-0 bottom-20 z-20 px-4 flex flex-col gap-4">
                 <div className="flex gap-2 mb-2">
                    <button 
                        onClick={() => setScanTarget(1)}
                        className={`flex-1 h-20 rounded-xl border-2 flex items-center justify-center relative overflow-hidden backdrop-blur-md transition-all ${scanTarget === 1 ? 'border-lab-accent bg-slate-800/80' : 'border-slate-600 bg-black/40'}`}
                    >
                        {slot1 ? (
                            <div className="text-center">
                                <div className="text-2xl">{slot1.emoji}</div>
                                <div className="text-[10px] font-bold text-white truncate px-1">{slot1.commonName}</div>
                            </div>
                        ) : (
                            <span className="text-slate-500 text-xs">Slot 1</span>
                        )}
                        {scanTarget === 1 && <div className="absolute top-1 right-1 w-2 h-2 bg-lab-accent rounded-full animate-pulse" />}
                    </button>

                     <div className="flex items-center justify-center text-slate-400 font-bold">+</div>

                    <button 
                        onClick={() => setScanTarget(2)}
                        className={`flex-1 h-20 rounded-xl border-2 flex items-center justify-center relative overflow-hidden backdrop-blur-md transition-all ${scanTarget === 2 ? 'border-lab-accent bg-slate-800/80' : 'border-slate-600 bg-black/40'}`}
                    >
                        {slot2 ? (
                            <div className="text-center">
                                <div className="text-2xl">{slot2.emoji}</div>
                                <div className="text-[10px] font-bold text-white truncate px-1">{slot2.commonName}</div>
                            </div>
                        ) : (
                            <span className="text-slate-500 text-xs">Slot 2</span>
                        )}
                         {scanTarget === 2 && <div className="absolute top-1 right-1 w-2 h-2 bg-lab-accent rounded-full animate-pulse" />}
                    </button>
                 </div>

                 {reactionResult && (
                     <div className={`p-4 rounded-xl border animate-slide-up shadow-2xl backdrop-blur-xl ${
                         reactionResult.severity === SafetyLevel.SAFE ? 'bg-green-900/80 border-green-500' :
                         reactionResult.severity === SafetyLevel.CAUTION ? 'bg-yellow-900/80 border-yellow-500' :
                         'bg-red-900/90 border-red-500 animate-pulse'
                     }`}>
                         <div className="flex items-start gap-3">
                             {reactionResult.severity === SafetyLevel.SAFE ? <CheckCircle className="text-green-400 w-8 h-8" /> : <AlertTriangle className="text-white w-8 h-8" />}
                             <div>
                                 <h3 className="font-black text-white uppercase">{reactionResult.alertTitle}</h3>
                                 <p className="text-xs text-white/90 font-medium leading-relaxed">{reactionResult.alertMessage}</p>
                             </div>
                         </div>
                     </div>
                 )}

                 <div className="flex gap-2">
                     <button onClick={resetScanner} className="bg-slate-800 text-white p-4 rounded-full shadow-lg" aria-label="Reset Scanner">
                         <RefreshCw size={20} />
                     </button>
                    <button 
                        onClick={handleIdentify}
                        disabled={isAnalyzing}
                        className="flex-1 bg-white text-black font-bold py-3 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        {isAnalyzing ? <Activity className="animate-spin" /> : <ScanSearch />}
                        {isAnalyzing ? 'Identifying...' : `Scan to ${scanTarget === 1 ? 'Slot 1' : 'Slot 2'}`}
                    </button>
                 </div>
             </div>
         );
      case 'EXPERIMENTS':
        return <div className="h-full"><ExperimentGuide /></div>;
      case 'SAFETY':
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-lg text-lab-danger flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Safety Protocol
            </h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 p-3 rounded-lg text-center">
                    <div className="w-8 h-8 rounded-full bg-lab-safe/20 text-lab-safe mx-auto flex items-center justify-center mb-2"><CheckCircle size={16} /></div>
                    <span className="text-xs font-bold text-slate-300">Goggles On</span>
                </div>
                 <div className="bg-slate-800 p-3 rounded-lg text-center">
                    <div className="w-8 h-8 rounded-full bg-lab-caution/20 text-lab-caution mx-auto flex items-center justify-center mb-2"><AlertTriangle size={16} /></div>
                    <span className="text-xs font-bold text-slate-300">Ventilation</span>
                </div>
            </div>
            <div className="bg-slate-900 border border-red-900/50 p-4 rounded-lg">
                <h4 className="text-red-400 font-bold mb-1 text-sm">EMERGENCY PROTOCOL</h4>
                <p className="text-xs text-slate-400">In case of chemical spill, neutralize acid with baking soda. For eyes, flush with water for 15 mins.</p>
            </div>
          </div>
        );
      case 'LOGGER':
        return <DataLogger videoRef={videoRef} />;
      default: // CAMERA
        return (
             <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-3">
                {aiAnalysis && (
                  <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-lab-accent/30 animate-slide-up max-h-32 overflow-y-auto">
                    <div className="flex items-start gap-3">
                      <BrainCircuit className="w-6 h-6 text-lab-accent flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-lab-accent font-bold text-sm mb-1">AI Analysis</h4>
                        <p className="text-xs text-slate-200 leading-relaxed">{aiAnalysis}</p>
                      </div>
                      <button onClick={() => setAiAnalysis('')} className="text-slate-500"><ShieldAlert size={16} /></button>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                    <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-4 rounded-xl shadow-lg transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-white'}`}
                        aria-label="Toggle Recording"
                    >
                        {isRecording ? <Square size={20} fill="currentColor"/> : <Video size={20} />}
                    </button>
                    
                    <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`flex-1 ${isAnalyzing ? 'bg-slate-600' : 'bg-lab-accent'} text-black font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95`}
                    >
                    {isAnalyzing ? (
                        <>
                        <Activity className="w-5 h-5 animate-spin" /> Analyzing...
                        </>
                    ) : (
                        <>
                        <Camera className="w-5 h-5" /> Analyze Experiment
                        </>
                    )}
                    </button>
                </div>
                
                {lastVideoUrl && (
                    <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-lg flex items-center justify-between animate-slide-up">
                        <span className="text-xs text-slate-300">Video Saved</span>
                        <button onClick={downloadVideo} className="text-lab-accent text-xs font-bold flex items-center gap-1 hover:underline">
                            <Download size={14}/> Download
                        </button>
                    </div>
                )}
             </div>
        );
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex-1 relative bg-black overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <ShieldAlert className="w-12 h-12 text-lab-danger mb-4" />
            <p className="text-slate-300">{error}</p>
            <button onClick={() => startCamera()} className="mt-4 text-lab-accent underline">Retry</button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
            <button 
                onClick={toggleCamera} 
                className="bg-black/50 text-white p-3 rounded-full backdrop-blur-md border border-white/20 active:scale-90 transition-all"
                aria-label="Switch Camera"
            >
                <SwitchCamera size={20} />
            </button>
            {hasFlash && (
                <button 
                    onClick={toggleFlash} 
                    className={`p-3 rounded-full backdrop-blur-md border border-white/20 active:scale-90 transition-all ${flashOn ? 'bg-yellow-500 text-black' : 'bg-black/50 text-white'}`}
                    aria-label="Toggle Flash"
                >
                    <Zap size={20} fill={flashOn ? "currentColor" : "none"} />
                </button>
            )}
        </div>
        
        {isRecording && (
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-red-600/80 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" /> REC
            </div>
        )}
        
        {(activeTab === 'CAMERA' || activeTab === 'IDENTIFY') && renderTabContent()}
      </div>

      <div className="h-16 bg-lab-dark flex border-t border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'CAMERA', label: 'Monitor', icon: Camera },
          { id: 'IDENTIFY', label: 'Identify', icon: ScanSearch },
          { id: 'EXPERIMENTS', label: 'Guide', icon: FileText },
          { id: 'SAFETY', label: 'Safety', icon: ShieldAlert },
          { id: 'LOGGER', label: 'Data', icon: Activity },
        ].map((tab) => {
           const Icon = tab.icon;
           const isActive = activeTab === tab.id;
           return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 min-w-[70px] flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'bg-slate-800 text-lab-accent' : 'text-slate-500'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
           );
        })}
      </div>

      {activeTab !== 'CAMERA' && activeTab !== 'IDENTIFY' && (
        <div className="bg-lab-darker border-t border-slate-800 flex-1 absolute top-0 left-0 w-full h-[calc(100%-4rem)] z-30 overflow-y-auto">
            {activeTab !== 'EXPERIMENTS' && activeTab !== 'LOGGER' && (
              <div className="sticky top-0 bg-lab-darker/90 backdrop-blur-md p-4 border-b border-slate-800 flex justify-between items-center z-10">
                  <h2 className="font-bold text-white capitalize">{activeTab.toLowerCase()}</h2>
                  <button onClick={() => setActiveTab('CAMERA')} className="text-sm text-lab-accent">Close</button>
              </div>
            )}
            {renderTabContent()}
        </div>
      )}
    </div>
  );
};

export default RealLabMode;
