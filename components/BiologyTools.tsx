
import React, { useState, useRef } from 'react';
import { Microscope, Scan, Fingerprint, Eye, ZoomIn, ZoomOut, Droplets } from 'lucide-react';

const BiologyTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SCOPE' | 'ID'>('SCOPE');

  return (
    <div className="h-full bg-slate-900 flex flex-col">
       <div className="p-4 border-b border-slate-800 flex gap-2">
            <button onClick={() => setActiveTab('SCOPE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'SCOPE' ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                <Microscope size={16} /> Microscope
            </button>
            <button onClick={() => setActiveTab('ID')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'ID' ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                <Scan size={16} /> Organism ID
            </button>
       </div>

       <div className="flex-1 overflow-hidden p-6">
           {activeTab === 'SCOPE' && <MicroscopeSimulator />}
           {activeTab === 'ID' && <OrganismIdentifier />}
       </div>
    </div>
  );
};

const MicroscopeSimulator = () => {
    const [zoom, setZoom] = useState(1);
    const [focus, setFocus] = useState(50);
    const [slide, setSlide] = useState<'ONION' | 'BLOOD' | 'BACTERIA'>('ONION');

    // Patterns to simulate slides
    const getPattern = () => {
        if (slide === 'ONION') return 'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.1) 2px, transparent 0), linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)';
        if (slide === 'BLOOD') return 'radial-gradient(circle, rgba(255,0,0,0.4) 5px, transparent 6px)';
        return 'radial-gradient(ellipse at center, rgba(0,255,0,0.3) 0%, transparent 70%)';
    };

    const blurAmount = Math.abs(focus - 50) / 5;

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex justify-between items-center bg-slate-800 p-2 rounded-lg">
                <div className="flex gap-2">
                    {['ONION', 'BLOOD', 'BACTERIA'].map(s => (
                        <button key={s} onClick={() => setSlide(s as any)} className={`px-3 py-1 rounded text-xs font-bold ${slide === s ? 'bg-green-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <div className="text-green-400 font-mono text-sm">{zoom * 40}x</div>
            </div>

            <div className="flex-1 bg-black rounded-full overflow-hidden border-4 border-slate-700 relative shadow-2xl mx-auto aspect-square max-w-[400px]">
                <div 
                    className="absolute inset-0 transition-transform duration-200"
                    style={{ 
                        transform: `scale(${zoom})`,
                        background: '#1a1a1a',
                        backgroundImage: getPattern(),
                        backgroundSize: slide === 'ONION' ? '40px 20px' : '20px 20px',
                        filter: `blur(${blurAmount}px) brightness(${1.2 - (blurAmount/10)})`
                    }}
                />
                
                {/* Viewport Overlay */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                    <div className="w-px h-10 bg-slate-500/50"/>
                    <div className="h-px w-10 bg-slate-500/50 absolute"/>
                </div>
            </div>

            <div className="space-y-4 max-w-sm mx-auto w-full">
                <div className="flex items-center gap-4">
                    <ZoomOut size={16} className="text-slate-500"/>
                    <input type="range" min="1" max="10" step="0.1" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="flex-1 accent-green-500"/>
                    <ZoomIn size={16} className="text-slate-500"/>
                </div>
                <div className="flex items-center gap-4">
                    <Eye size={16} className="text-slate-500"/>
                    <input type="range" min="0" max="100" value={focus} onChange={e => setFocus(Number(e.target.value))} className="flex-1 accent-blue-500"/>
                    <span className="text-xs text-slate-500 w-8">FOC</span>
                </div>
            </div>
        </div>
    );
};

const OrganismIdentifier = () => (
    <div className="grid grid-cols-1 gap-4">
        {[
            { name: 'Amoeba Proteus', type: 'Protozoa', desc: 'Single-celled organism that moves by extending pseudopods.' },
            { name: 'Paramecium', type: 'Protozoa', desc: 'Ciliated microbe found in pond water.' },
            { name: 'Spirogyra', type: 'Algae', desc: 'Filamentous green algae with spiral chloroplasts.' },
            { name: 'E. Coli', type: 'Bacteria', desc: 'Rod-shaped bacteria found in the gut.' },
        ].map((org, i) => (
            <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center text-green-500">
                    <Fingerprint size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-white">{org.name}</h4>
                    <div className="text-xs text-green-400 font-bold mb-1">{org.type}</div>
                    <p className="text-xs text-slate-400">{org.desc}</p>
                </div>
            </div>
        ))}
    </div>
);

export default BiologyTools;
