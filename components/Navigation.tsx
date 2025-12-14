import React from 'react';
import { Home, Camera, Cuboid, Database, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: ViewState.HOME, icon: Home, label: 'Home' },
    { id: ViewState.REAL_LAB, icon: Camera, label: 'Real Lab' },
    { id: ViewState.VIRTUAL_LAB, icon: Cuboid, label: 'Virtual' },
    { id: ViewState.DATA, icon: Database, label: 'Data' },
    { id: ViewState.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="flex-none h-20 bg-lab-dark border-t border-slate-800 pb-safe">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive ? 'text-lab-accent' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`p-1 rounded-full transition-all ${isActive ? 'bg-lab-accent/10 -translate-y-1' : ''}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;