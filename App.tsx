
import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Menu, X, Beaker, ShieldCheck, AlertOctagon, ArrowLeft, Activity, WifiOff } from 'lucide-react';
import { ViewState } from './types';
import Navigation from './components/Navigation';
import SettingsPanel from './components/SettingsPanel';
import HomePage from './components/Home';
import SafetyTraining from './components/SafetyTraining';
import EmergencyModal from './components/EmergencyModal';
import ErrorBoundary from './components/ErrorBoundary';
import { audioService } from './services/audioService';
import { analytics } from './services/analyticsService';
import { errorReporter } from './services/errorReporting';

// Lazy Load Heavy Components
const RealLabMode = lazy(() => import('./components/RealLabMode'));
const VirtualLabMode = lazy(() => import('./components/VirtualLabMode'));
const ReferenceHub = lazy(() => import('./components/ReferenceHub'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-full w-full bg-lab-darker text-lab-accent">
        <Activity className="w-12 h-12 animate-spin mb-4" />
        <p className="text-sm font-bold animate-pulse">Initializing Lab Module...</p>
    </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Initialize Services
  useEffect(() => {
      errorReporter.init();
      analytics.logEvent('app_session_start', { offline: isOffline });
      
      const savedHC = localStorage.getItem('lab_a11y_hc') === 'true';
      if(savedHC) document.body.classList.add('high-contrast');
      
      // Network Listeners
      const handleOnline = () => { setIsOffline(false); analytics.logEvent('network_status_change', { status: 'online' }); };
      const handleOffline = () => { setIsOffline(true); analytics.logEvent('network_status_change', { status: 'offline' }); };
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, []);

  const handleViewChange = (view: ViewState) => {
      setCurrentView(view);
      analytics.logEvent('view_change', { view });
  };

  const handleEmergency = () => {
      setIsEmergency(true);
      analytics.logEvent('emergency_mode_triggered');
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.HOME:
        return <HomePage onViewChange={handleViewChange} />;
      case ViewState.REAL_LAB:
        return <RealLabMode />;
      case ViewState.VIRTUAL_LAB:
        return <VirtualLabMode />;
      case ViewState.DATA:
        return <ReferenceHub />;
      case ViewState.SETTINGS:
        return <SettingsPanel onNavigate={handleViewChange} />;
      case ViewState.SAFETY_TRAINING:
        return <SafetyTraining onComplete={() => handleViewChange(ViewState.HOME)} />;
      case ViewState.TEACHER_DASHBOARD:
        return <TeacherDashboard />;
      default:
        return <HomePage onViewChange={handleViewChange} />;
    }
  };

  // Teacher Dashboard Full Screen Route
  if (currentView === ViewState.TEACHER_DASHBOARD) {
      return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
                <div className="bg-lab-darker h-screen w-full relative overflow-hidden">
                    <div className="absolute top-4 right-4 z-50">
                        <button 
                            onClick={() => handleViewChange(ViewState.HOME)}
                            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-bold text-sm border border-slate-700 shadow-lg min-h-[44px]"
                        >
                            <ArrowLeft size={16} /> Exit Teacher Mode
                        </button>
                    </div>
                    <TeacherDashboard />
                </div>
            </Suspense>
          </ErrorBoundary>
      );
  }

  return (
    <ErrorBoundary>
        <div className="flex flex-col h-screen w-full bg-lab-darker relative overflow-hidden">
        
        {/* Skip Link for A11y */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute z-[100] top-2 left-2 bg-lab-accent text-black font-bold p-3 rounded">
            Skip to Main Content
        </a>

        {isEmergency && <EmergencyModal onClose={() => setIsEmergency(false)} />}

        {/* Offline Banner */}
        {isOffline && (
            <div className="bg-slate-700 text-white text-xs font-bold py-1 px-4 text-center z-[100] flex items-center justify-center gap-2">
                <WifiOff size={12} /> OFFLINE MODE - Local Storage Active
            </div>
        )}

        {/* Header */}
        <header className="flex-none h-16 bg-lab-dark border-b border-slate-800 flex items-center justify-between px-4 z-50 pt-safe">
            <div className="flex items-center gap-2">
            <Beaker className="w-6 h-6 text-lab-accent" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                AI Lab Partner
            </span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleEmergency}
                    aria-label="Emergency Mode"
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg font-bold text-xs flex items-center gap-1 animate-pulse min-h-[44px] min-w-[44px] justify-center"
                >
                    <AlertOctagon size={20} />
                </button>
                <button 
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open Menu"
                className="p-2 hover:bg-slate-800 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                <Menu className="w-6 h-6 text-slate-200" />
                </button>
            </div>
        </header>

        {/* Side Menu Overlay */}
        {isMenuOpen && (
            <div className="absolute inset-0 z-[60] flex">
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsMenuOpen(false)}
            />
            <div className="relative w-64 bg-lab-dark h-full shadow-2xl flex flex-col p-6 animate-slide-in">
                <button 
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full"
                aria-label="Close Menu"
                >
                <X className="w-6 h-6" />
                </button>
                <div className="mt-8 space-y-6">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-lab-accent flex items-center justify-center font-bold text-black">
                    JS
                    </div>
                    <div>
                    <div className="font-semibold">Jane Scientist</div>
                    <div className="text-xs text-slate-400">Level 5 Researcher</div>
                    </div>
                </div>
                
                <nav className="space-y-2">
                    <button 
                        className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white flex items-center gap-2 min-h-[48px]"
                        onClick={() => {
                            handleViewChange(ViewState.SAFETY_TRAINING);
                            setIsMenuOpen(false);
                        }}
                    >
                        <ShieldCheck size={18} className="text-green-500" /> Safety Training
                    </button>

                    {['Profile', 'Progress', 'Settings', 'Help', 'Exit'].map((item) => (
                    <button 
                        key={item}
                        className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white min-h-[48px]"
                        onClick={() => {
                            if(item === 'Settings') handleViewChange(ViewState.SETTINGS);
                            setIsMenuOpen(false);
                        }}
                    >
                        {item}
                    </button>
                    ))}
                </nav>
                </div>
            </div>
            </div>
        )}

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 overflow-y-auto relative scroll-smooth focus:outline-none" tabIndex={-1}>
            <Suspense fallback={<LoadingSpinner />}>
                {renderContent()}
            </Suspense>
        </main>

        {/* Bottom Navigation */}
        <Navigation currentView={currentView} onNavigate={handleViewChange} />
        </div>
    </ErrorBoundary>
  );
};

export default App;
