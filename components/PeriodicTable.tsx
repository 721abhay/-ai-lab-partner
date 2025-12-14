
import React, { useState } from 'react';
import { periodicTableData } from '../data/periodicTableData';
import { ElementData } from '../types';
import { X, Info } from 'lucide-react';

const PeriodicTable: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);

  // Helper to determine color based on category
  const getCategoryColor = (cat: string) => {
    if (cat.includes('alkali metal')) return 'bg-red-500/80 border-red-400';
    if (cat.includes('alkaline earth')) return 'bg-orange-500/80 border-orange-400';
    if (cat.includes('transition metal')) return 'bg-yellow-500/80 border-yellow-400';
    if (cat.includes('post-transition')) return 'bg-green-500/80 border-green-400';
    if (cat.includes('metalloid')) return 'bg-teal-500/80 border-teal-400';
    if (cat.includes('noble gas')) return 'bg-purple-500/80 border-purple-400';
    if (cat.includes('nonmetal')) return 'bg-blue-500/80 border-blue-400';
    return 'bg-slate-600 border-slate-500';
  };

  // 18 columns, 7 rows (plus lanthanides/actinides usually below, simplified here)
  const renderGrid = () => {
    // Create an 18x7 grid
    const grid: React.ReactNode[] = [];
    
    // We only have specific elements in our mock data, so we map them to their coords
    periodicTableData.forEach((el) => {
        const style = {
            gridColumn: el.xpos,
            gridRow: el.ypos,
        };

        grid.push(
            <button
                key={el.number}
                style={style}
                onClick={() => setSelectedElement(el)}
                className={`w-full aspect-square p-1 rounded border flex flex-col items-center justify-center transition-transform hover:scale-110 hover:z-10 ${getCategoryColor(el.category)}`}
            >
                <span className="text-[8px] font-mono opacity-80 self-start leading-none">{el.number}</span>
                <span className="text-xs sm:text-base font-bold text-white shadow-black drop-shadow-md">{el.symbol}</span>
                <span className="text-[6px] truncate max-w-full opacity-0 sm:opacity-100">{el.name}</span>
            </button>
        );
    });

    return grid;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 p-4 relative overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            Periodic Table of Elements
        </h2>

        <div className="flex-1 overflow-auto bg-slate-950 rounded-xl border border-slate-800 p-4">
             <div className="grid grid-cols-[repeat(18,minmax(30px,1fr))] gap-1 min-w-[800px]">
                 {renderGrid()}
             </div>
        </div>

        {/* Categories Legend */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center text-[10px] text-white">
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Alkali Metal</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div> Alkaline Earth</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded-sm"></div> Transition Metal</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Nonmetal</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500 rounded-sm"></div> Noble Gas</span>
        </div>

        {/* Element Detail Modal */}
        {selectedElement && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                    <button onClick={() => setSelectedElement(null)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>

                    <div className="flex gap-6 mb-6">
                        <div className={`w-24 h-24 flex items-center justify-center rounded-xl border-4 text-4xl font-bold text-white shadow-xl ${getCategoryColor(selectedElement.category)}`}>
                            {selectedElement.symbol}
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-white">{selectedElement.name}</h3>
                            <div className="text-lab-accent font-mono text-lg">{selectedElement.category}</div>
                            <div className="text-slate-400 text-sm mt-1">{selectedElement.summary}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 p-3 rounded-lg">
                            <div className="text-xs text-slate-500 uppercase font-bold">Atomic Mass</div>
                            <div className="text-white font-mono">{selectedElement.mass} u</div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg">
                            <div className="text-xs text-slate-500 uppercase font-bold">Atomic Number</div>
                            <div className="text-white font-mono">{selectedElement.number}</div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg">
                            <div className="text-xs text-slate-500 uppercase font-bold">Config</div>
                            <div className="text-white font-mono text-xs">{selectedElement.electron_configuration}</div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg">
                            <div className="text-xs text-slate-500 uppercase font-bold">Electronegativity</div>
                            <div className="text-white font-mono">{selectedElement.electronegativity_pauling || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default PeriodicTable;
