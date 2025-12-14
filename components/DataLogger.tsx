
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Play, Square, Download, Share2, Activity, Droplets, Volume2, Thermometer, Clock, RefreshCw } from 'lucide-react';
import { DataPoint } from '../types';
import { trackerService } from '../services/trackerService';

interface Props {
  videoRef?: React.RefObject<HTMLVideoElement>;
  isVirtual?: boolean;
}

const DataLogger: React.FC<Props> = ({ videoRef, isVirtual = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);
  const [activeGraph, setActiveGraph] = useState<'INTENSITY' | 'HEIGHT' | 'BUBBLES' | 'COLOR'>('INTENSITY');
  
  // Refs for virtual simulation loop
  const simInterval = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const rawDataRef = useRef<DataPoint[]>([]); // Store full resolution data here

  // Optimize chart rendering by only showing a downsampled version
  const chartData = useMemo(() => {
      // Downsample to max 50 points for display smoothness
      if (data.length <= 50) return data;
      
      const factor = Math.ceil(data.length / 50);
      return data.filter((_, i) => i % factor === 0);
  }, [data]);

  useEffect(() => {
    let unsubscribe: () => void;

    if (isRecording) {
      if (isVirtual) {
        // Virtual Simulation Loop
        startTime.current = Date.now();
        simInterval.current = window.setInterval(() => {
           const elapsed = Date.now() - startTime.current;
           const point = trackerService.generateSimulatedData(elapsed);
           rawDataRef.current.push(point);
           // Update state less frequently or with slice
           setData([...rawDataRef.current]);
        }, 500);
      } else if (videoRef?.current && videoRef.current.srcObject) {
        // Real Tracker
        const stream = videoRef.current.srcObject as MediaStream;
        trackerService.start(videoRef.current, stream);
        unsubscribe = trackerService.addListener((point) => {
          rawDataRef.current.push(point);
          // Throttle updates: only update state if recording
          setData([...rawDataRef.current]); 
        });
      }
    } else {
       if (isVirtual && simInterval.current) clearInterval(simInterval.current);
       if (!isVirtual) trackerService.stop();
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (simInterval.current) clearInterval(simInterval.current);
      if (!isVirtual) trackerService.stop();
    };
  }, [isRecording, isVirtual, videoRef]);

  const handleExport = () => {
    const csv = "Time,Intensity,Height,Bubbles,Audio\n" + 
        rawDataRef.current.map(d => `${d.timeStr},${d.intensity},${d.foamHeight},${d.bubbleCount},${d.audioLevel}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_data_${Date.now()}.csv`;
    a.click();
  };

  const handleClear = () => {
      setData([]);
      rawDataRef.current = [];
  };

  const current = data[data.length - 1] || { 
      intensity: 0, foamHeight: 0, bubbleCount: 0, audioLevel: 0, colorR: 0, colorG: 0, colorB: 0 
  };

  return (
    <div className="h-full flex flex-col bg-lab-darker">
      {/* Control Bar */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
             <button 
                onClick={() => {
                    if(!isRecording) handleClear(); // Clear on start
                    setIsRecording(!isRecording);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all ${
                    isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
             >
                {isRecording ? <><Square size={18} fill="currentColor" /> STOP REC</> : <><Play size={18} fill="currentColor" /> START REC</>}
             </button>
             {isRecording && (
                 <div className="flex items-center gap-2 text-red-400 font-mono text-sm">
                     <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"/> LIVE
                 </div>
             )}
        </div>
        
        <div className="flex gap-2">
            <button onClick={handleClear} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                <RefreshCw size={20} />
            </button>
            <button onClick={handleExport} disabled={data.length === 0} className="p-2 text-lab-accent hover:bg-slate-800 rounded-lg border border-slate-700 disabled:opacity-50">
                <Download size={20} />
            </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
          <MetricCard 
            label="Reaction Intensity" 
            value={`${current.intensity}%`} 
            icon={Activity} 
            color="text-orange-400" 
            trend={current.intensity > 50 ? 'high' : 'normal'}
          />
          <MetricCard 
            label="Foam Height" 
            value={`${current.foamHeight} cm`} 
            icon={Thermometer} 
            color="text-cyan-400" 
          />
          <MetricCard 
            label="Bubble Rate" 
            value={`${current.bubbleCount} /s`} 
            icon={Droplets} 
            color="text-blue-400" 
          />
          <MetricCard 
            label="Audio Level" 
            value={`${current.audioLevel} dB`} 
            icon={Volume2} 
            color="text-purple-400" 
          />
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 p-4 min-h-0 flex flex-col">
         {/* Graph Tabs */}
         <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
             {['INTENSITY', 'HEIGHT', 'BUBBLES', 'COLOR'].map((type) => (
                 <button
                    key={type}
                    onClick={() => setActiveGraph(type as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                        activeGraph === type 
                        ? 'bg-slate-700 text-white border-b-2 border-lab-accent' 
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                    }`}
                 >
                     {type} OVER TIME
                 </button>
             ))}
         </div>

         <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 p-2 relative">
             <ResponsiveContainer width="100%" height="100%">
                 {activeGraph === 'INTENSITY' ? (
                     <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="timeStr" stroke="#94a3b8" fontSize={10} tickCount={5} />
                        <YAxis stroke="#94a3b8" domain={[0, 100]} fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Area type="monotone" dataKey="intensity" stroke="#f97316" fillOpacity={1} fill="url(#colorInt)" isAnimationActive={false} />
                     </AreaChart>
                 ) : activeGraph === 'HEIGHT' ? (
                     <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="timeStr" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" domain={[0, 'auto']} fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Line type="stepAfter" dataKey="foamHeight" stroke="#06b6d4" strokeWidth={3} dot={false} isAnimationActive={false} />
                     </LineChart>
                 ) : activeGraph === 'BUBBLES' ? (
                     <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="timeStr" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Bar dataKey="bubbleCount" fill="#3b82f6" isAnimationActive={false} />
                     </BarChart>
                 ) : (
                     <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="timeStr" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" domain={[0, 255]} fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Line type="monotone" dataKey="colorR" stroke="#ef4444" dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="colorG" stroke="#22c55e" dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="colorB" stroke="#3b82f6" dot={false} isAnimationActive={false} />
                     </LineChart>
                 )}
             </ResponsiveContainer>
             
             {data.length === 0 && (
                 <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                     <p>Start recording to see live data</p>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, trend }: any) => (
    <div className={`bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between ${trend === 'high' ? 'ring-1 ring-orange-500' : ''}`}>
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</span>
            <Icon size={16} className={color} />
        </div>
        <div className="text-2xl font-black text-white font-mono">{value}</div>
    </div>
);

export default DataLogger;
