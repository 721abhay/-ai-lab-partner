
import React, { useState } from 'react';
import { Calculator, Scale, FlaskConical, Atom, RefreshCw } from 'lucide-react';
import { geminiService } from '../services/geminiService';

const ChemistryCalculators: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BALANCER' | 'MOLAR' | 'PH' | 'MOLARITY'>('BALANCER');

  const renderContent = () => {
    switch(activeTab) {
        case 'BALANCER': return <EquationBalancer />;
        case 'MOLAR': return <MolarMassCalc />;
        case 'PH': return <PHCalc />;
        case 'MOLARITY': return <MolarityCalc />;
        default: return <EquationBalancer />;
    }
  };

  return (
    <div className="h-full bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex overflow-x-auto gap-2">
            {[
                { id: 'BALANCER', icon: RefreshCw, label: 'Balancer' },
                { id: 'MOLAR', icon: Scale, label: 'Moles' },
                { id: 'PH', icon: FlaskConical, label: 'pH' },
                { id: 'MOLARITY', icon: Atom, label: 'Molarity' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        activeTab === tab.id 
                        ? 'bg-lab-accent text-black' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                >
                    <tab.icon size={16} /> {tab.label}
                </button>
            ))}
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
            {renderContent()}
        </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const EquationBalancer = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleBalance = async () => {
        if (!input) return;
        setLoading(true);
        const res = await geminiService.balanceEquation(input);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-bold text-white mb-2">Equation Balancer</h3>
            <p className="text-sm text-slate-400">Enter a chemical equation (e.g., H2 + O2 = H2O) and AI will balance it.</p>
            
            <div className="space-y-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Fe + O2 -> Fe2O3"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-white font-mono focus:border-lab-accent outline-none"
                />
                <button 
                    onClick={handleBalance}
                    disabled={loading}
                    className="w-full bg-lab-accent text-black font-bold py-3 rounded-lg hover:bg-cyan-400 disabled:opacity-50"
                >
                    {loading ? 'Balancing...' : 'Balance Equation'}
                </button>
            </div>

            {result && (
                <div className="bg-slate-800 p-6 rounded-xl border border-green-500/30 mt-6">
                    <div className="text-xs text-green-400 font-bold uppercase mb-2">Balanced Result</div>
                    <div className="text-2xl text-white font-mono break-all">{result}</div>
                </div>
            )}
        </div>
    );
};

const MolarMassCalc = () => {
    const [mass, setMass] = useState('');
    const [molarMass, setMolarMass] = useState('');
    const [moles, setMoles] = useState<number | null>(null);

    const calc = () => {
        const m = parseFloat(mass);
        const mm = parseFloat(molarMass);
        if (m && mm) setMoles(m / mm);
    };

    return (
        <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-bold text-white">Mole Calculator</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Mass (g)</label>
                    <input type="number" value={mass} onChange={e => setMass(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Molar Mass (g/mol)</label>
                    <input type="number" value={molarMass} onChange={e => setMolarMass(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" />
                </div>
            </div>
            <button onClick={calc} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded">Calculate Moles</button>
            {moles !== null && (
                <div className="bg-slate-800 p-4 rounded text-center">
                    <div className="text-3xl font-mono text-lab-accent">{moles.toFixed(4)} mol</div>
                </div>
            )}
        </div>
    );
};

const PHCalc = () => {
    const [conc, setConc] = useState('');
    const [ph, setPh] = useState<number | null>(null);

    const calc = () => {
        const c = parseFloat(conc);
        if (c) setPh(-Math.log10(c));
    };

    return (
        <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-bold text-white">pH Calculator</h3>
            <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">H+ Concentration (mol/L)</label>
                <input type="number" step="0.00001" value={conc} onChange={e => setConc(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" />
            </div>
            <button onClick={calc} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded">Calculate pH</button>
            {ph !== null && (
                <div className={`p-4 rounded text-center transition-colors ${ph < 7 ? 'bg-red-900/30 text-red-400' : ph > 7 ? 'bg-blue-900/30 text-blue-400' : 'bg-green-900/30 text-green-400'}`}>
                    <div className="text-4xl font-mono font-bold">{ph.toFixed(2)}</div>
                    <div className="text-xs uppercase font-bold mt-1">{ph < 7 ? 'Acidic' : ph > 7 ? 'Basic' : 'Neutral'}</div>
                </div>
            )}
        </div>
    );
};

const MolarityCalc = () => {
    const [moles, setMoles] = useState('');
    const [vol, setVol] = useState('');
    const [res, setRes] = useState<number | null>(null);

    const calc = () => {
        const m = parseFloat(moles);
        const v = parseFloat(vol);
        if (m && v) setRes(m / v);
    };

    return (
        <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-bold text-white">Molarity Calculator</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Moles (mol)</label>
                    <input type="number" value={moles} onChange={e => setMoles(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" />
                </div>
                <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Volume (L)</label>
                    <input type="number" value={vol} onChange={e => setVol(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" />
                </div>
            </div>
            <button onClick={calc} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded">Calculate Molarity</button>
            {res !== null && (
                <div className="bg-slate-800 p-4 rounded text-center">
                    <div className="text-3xl font-mono text-purple-400">{res.toFixed(3)} M</div>
                </div>
            )}
        </div>
    );
};

export default ChemistryCalculators;
