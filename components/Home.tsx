
import React from 'react';
import { Camera, Cuboid, FlaskConical, Atom, Microscope, ArrowRight } from 'lucide-react';
import { ViewState } from '../types';

interface HomeProps {
  onViewChange: (view: ViewState) => void;
}

const HomePage: React.FC<HomeProps> = ({ onViewChange }) => {
  return (
    <div className="p-6 space-y-8 max-w-lg mx-auto pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Welcome back, Scientist.</h1>
        <p className="text-slate-400">Ready to discover something new today?</p>
      </div>

      <div className="grid gap-6">
        {/* Real Lab Card */}
        <button
          onClick={() => onViewChange(ViewState.REAL_LAB)}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 to-slate-900 border border-blue-500/30 p-8 text-left transition-all hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] active:scale-95"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Camera className="w-32 h-32 -rotate-12 translate-x-8 -translate-y-8 text-blue-400" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                Real Lab Mode <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </h3>
            <p className="text-sm text-blue-200/70 font-medium leading-relaxed max-w-[80%]">
                Use AI vision to analyze real-world experiments, identify chemicals, and ensure safety compliance.
            </p>
          </div>
        </button>

        {/* Virtual Lab Card */}
        <button
          onClick={() => onViewChange(ViewState.VIRTUAL_LAB)}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 to-slate-900 border border-emerald-500/30 p-8 text-left transition-all hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cuboid className="w-32 h-32 rotate-12 translate-x-8 -translate-y-8 text-emerald-400" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Cuboid className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                Virtual Lab Mode <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </h3>
            <p className="text-sm text-emerald-200/70 font-medium leading-relaxed max-w-[80%]">
                Simulate experiments in a safe 3D environment. Explore Chemistry, Biology, and Physics.
            </p>
          </div>
        </button>
      </div>

      <div className="pt-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-500 rounded-full" /> Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            { icon: FlaskConical, title: 'Titration Analysis', time: '2h ago', color: 'text-cyan-400', bg: 'bg-cyan-950/30', border: 'border-cyan-500/20' },
            { icon: Microscope, title: 'Cell Structure', time: 'Yesterday', color: 'text-green-400', bg: 'bg-green-950/30', border: 'border-green-500/20' },
            { icon: Atom, title: 'Force Vectors', time: '2 days ago', color: 'text-orange-400', bg: 'bg-orange-950/30', border: 'border-orange-500/20' }
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${item.bg} border ${item.border} hover:bg-slate-800 cursor-pointer transition-colors group`}>
              <div className={`p-2 rounded-lg bg-black/20 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-200 group-hover:text-white">{item.title}</div>
                <div className="text-xs text-slate-500 font-mono">{item.time}</div>
              </div>
              <ArrowRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
