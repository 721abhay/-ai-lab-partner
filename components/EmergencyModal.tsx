import React from 'react';
import { Phone, AlertTriangle, X } from 'lucide-react';

interface EmergencyProps {
  onClose: () => void;
}

const EmergencyModal: React.FC<EmergencyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center p-6 animate-pulse-slow">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full">
            <X className="text-slate-900" />
        </button>
        
        <AlertTriangle className="w-20 h-20 text-red-600 mx-auto mb-4" />
        <h1 className="text-3xl font-black text-slate-900 mb-2">EMERGENCY MODE</h1>
        <p className="text-slate-600 mb-8 font-bold">Lab Partner SOS triggered.</p>
        
        <div className="space-y-4">
            <a href="tel:911" className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-3">
                <Phone className="fill-current" /> CALL 911
            </a>
            
            <a href="tel:18002221222" className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-lg shadow-lg transform active:scale-95 transition-all">
                Poison Control (1-800-222-1222)
            </a>
        </div>

        <div className="mt-8 text-left bg-red-50 p-4 rounded-xl border border-red-200">
            <h3 className="font-bold text-red-800 mb-2">Immediate First Aid:</h3>
            <ul className="list-disc pl-4 space-y-1 text-sm text-red-700">
                <li>Flush eyes/skin with water for 15 minutes.</li>
                <li>Move to fresh air immediately.</li>
                <li>Do NOT induce vomiting unless instructed.</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;