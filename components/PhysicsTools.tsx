
import React, { useState } from 'react';
import { Calculator, ArrowRightLeft, Book, Activity, Scale, Zap, Timer, Ruler } from 'lucide-react';
import { PhysicsConstant } from '../types';

const CONSTANTS: PhysicsConstant[] = [
    { name: 'Gravity (Earth)', symbol: 'g', value: '9.807', unit: 'm/s²', description: 'Acceleration due to gravity at sea level.' },
    { name: 'Speed of Light', symbol: 'c', value: '2.998 × 10⁸', unit: 'm/s', description: 'Speed of electromagnetic radiation in vacuum.' },
    { name: 'Planck Constant', symbol: 'h', value: '6.626 × 10⁻³⁴', unit: 'J⋅s', description: 'Fundamental constant quantum mechanics.' },
    { name: 'Speed of Sound', symbol: 'v', value: '343', unit: 'm/s', description: 'Speed of sound in dry air at 20°C.' },
    { name: 'Avogadro Constant', symbol: 'Nₐ', value: '6.022 × 10²³', unit: 'mol⁻¹', description: 'Number of particles in one mole.' },
];

const PhysicsTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CALC' | 'CONVERT' | 'CONSTANTS'>('CALC');

  return (
    <div className="h-full bg-slate-900 flex flex-col">
       <div className="p-4 border-b border-slate-800 flex gap-2">
            {[
                { id: 'CALC', icon: Calculator, label: 'Calculators' },
                { id: 'CONVERT', icon: ArrowRightLeft, label: 'Converter' },
                { id: 'CONSTANTS', icon: Book, label: 'Constants' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        activeTab === tab.id 
                        ? 'bg-orange-500 text-black' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                >
                    <tab.icon size={16} /> {tab.label}
                </button>
            ))}
       </div>

       <div className="flex-1 overflow-y-auto p-6">
           {activeTab === 'CALC' && <Calculators />}
           {activeTab === 'CONVERT' && <UnitConverter />}
           {activeTab === 'CONSTANTS' && <ConstantsList />}
       </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const Calculators = () => {
    const [mode, setMode] = useState<'KINEMATICS' | 'FORCE' | 'ENERGY'>('KINEMATICS');
    const [inputs, setInputs] = useState<any>({});
    const [result, setResult] = useState<string | null>(null);

    const calcKinematics = () => {
        // v = u + at
        const u = parseFloat(inputs.u || '0');
        const a = parseFloat(inputs.a || '0');
        const t = parseFloat(inputs.t || '0');
        setResult(`Final Velocity (v) = ${(u + a * t).toFixed(2)} m/s`);
    };

    const calcForce = () => {
        // F = ma
        const m = parseFloat(inputs.m || '0');
        const a = parseFloat(inputs.a || '0');
        setResult(`Force (F) = ${(m * a).toFixed(2)} N`);
    };

    const calcEnergy = () => {
        // KE = 0.5 * m * v^2
        const m = parseFloat(inputs.m || '0');
        const v = parseFloat(inputs.v || '0');
        setResult(`Kinetic Energy (KE) = ${(0.5 * m * v * v).toFixed(2)} J`);
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
            <div className="grid grid-cols-3 gap-2">
                <button onClick={() => {setMode('KINEMATICS'); setInputs({}); setResult(null);}} className={`p-2 rounded border text-xs font-bold ${mode === 'KINEMATICS' ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>Kinematics</button>
                <button onClick={() => {setMode('FORCE'); setInputs({}); setResult(null);}} className={`p-2 rounded border text-xs font-bold ${mode === 'FORCE' ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>Force</button>
                <button onClick={() => {setMode('ENERGY'); setInputs({}); setResult(null);}} className={`p-2 rounded border text-xs font-bold ${mode === 'ENERGY' ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>Energy</button>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                {mode === 'KINEMATICS' && (
                    <>
                        <h3 className="text-white font-bold flex items-center gap-2"><Timer size={18}/> Velocity Calc (v = u + at)</h3>
                        <input type="number" placeholder="Initial Velocity (u) m/s" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" onChange={e => setInputs({...inputs, u: e.target.value})} />
                        <input type="number" placeholder="Acceleration (a) m/s²" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" onChange={e => setInputs({...inputs, a: e.target.value})} />
                        <input type="number" placeholder="Time (t) s" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" onChange={e => setInputs({...inputs, t: e.target.value})} />
                        <button onClick={calcKinematics} className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 rounded">Calculate</button>
                    </>
                )}
                {mode === 'FORCE' && (
                    <>
                        <h3 className="text-white font-bold flex items-center gap-2"><Scale size={18}/> Force Calc (F = ma)</h3>
                        <input type="number" placeholder="Mass (m) kg" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" onChange={e => setInputs({...inputs, m: e.target.value})} />
                        <input type="number" placeholder="Acceleration (a) m/s²" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" onChange={e => setInputs({...inputs, a: e.target.value})} />
                        <button onClick={calcForce} className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 rounded">Calculate</button>
                    </>
                )}
                {mode === 'ENERGY' && (
                    <>
                        <h3 className="text-white font-bold flex items-center gap-2"><Zap size={18}/> Kinetic Energy (KE = ½mv²)</h3>
                        <input type="number" placeholder="Mass (m) kg" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" onChange={e => setInputs({...inputs, m: e.target.value})} />
                        <input type="number" placeholder="Velocity (v) m/s" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" onChange={e => setInputs({...inputs, v: e.target.value})} />
                        <button onClick={calcEnergy} className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 rounded">Calculate</button>
                    </>
                )}

                {result && (
                    <div className="p-4 bg-black/40 rounded-lg text-center">
                        <span className="text-orange-400 font-mono text-xl font-bold">{result}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const UnitConverter = () => {
    const [val, setVal] = useState('');
    const [type, setType] = useState('TEMP');
    const [res, setRes] = useState<string>('');

    const convert = () => {
        const v = parseFloat(val);
        if (isNaN(v)) return;
        
        if (type === 'TEMP') setRes(`${v}°C = ${(v * 9/5 + 32).toFixed(1)}°F`);
        if (type === 'DIST') setRes(`${v}m = ${(v * 3.28084).toFixed(2)}ft`);
        if (type === 'MASS') setRes(`${v}kg = ${(v * 2.20462).toFixed(2)}lbs`);
    };

    return (
        <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2"><Ruler size={18}/> Unit Converter</h3>
            <div className="flex gap-2">
                {['TEMP', 'DIST', 'MASS'].map(t => (
                    <button key={t} onClick={() => {setType(t); setRes('');}} className={`flex-1 text-xs py-1 rounded ${type === t ? 'bg-slate-600 text-white' : 'bg-slate-900 text-slate-500'}`}>{t}</button>
                ))}
            </div>
            <div className="flex gap-2 items-center">
                <input type="number" value={val} onChange={e => setVal(e.target.value)} className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="Value" />
                <span className="text-slate-400 text-xs font-bold">
                    {type === 'TEMP' ? '°C' : type === 'DIST' ? 'm' : 'kg'}
                </span>
            </div>
            <button onClick={convert} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded">Convert</button>
            {res && <div className="text-center font-mono text-orange-400 text-lg font-bold">{res}</div>}
        </div>
    );
};

const ConstantsList = () => (
    <div className="space-y-2">
        {CONSTANTS.map((c, i) => (
            <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                    <div className="font-bold text-white">{c.name} <span className="text-slate-500 font-serif italic">({c.symbol})</span></div>
                    <div className="text-xs text-slate-400">{c.description}</div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-orange-400 font-bold">{c.value}</div>
                    <div className="text-xs text-slate-500">{c.unit}</div>
                </div>
            </div>
        ))}
    </div>
);

export default PhysicsTools;
