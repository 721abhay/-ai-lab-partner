
import React, { useState, useEffect } from 'react';
import { Settings, Bell, Eye, Volume2, Shield, ToggleLeft, ToggleRight, Sun, Moon, Mic, Globe, Zap, GraduationCap, Battery, HardDrive, Trash2, Accessibility, Download, WifiOff, Check } from 'lucide-react';
import { DifficultyLevel, NarrationMode, LanguageCode, ViewState, ContentPack } from '../types';
import { audioService } from '../services/audioService';
import { trackerService } from '../services/trackerService';
import { offlineStorage } from '../services/offlineStorage';

interface SectionProps {
  title: string;
  icon: any;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SectionProps> = ({ title, icon: Icon, children }) => (
    <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-800">
      <div className="flex items-center gap-2 mb-4 text-lab-accent">
        <Icon size={20} />
        <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
);

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-slate-300 font-medium">{label}</span>
      <button 
        onClick={() => onChange(!value)} 
        className="text-lab-accent transition-colors focus:outline-none focus:ring-2 focus:ring-lab-accent rounded-full"
        aria-label={`Toggle ${label}`}
        aria-pressed={value}
      >
        {value ? <ToggleRight size={32} className="fill-current" /> : <ToggleLeft size={32} className="text-slate-600" />}
      </button>
    </div>
  );

interface SettingsProps {
    onNavigate?: (view: ViewState) => void; 
}

const SettingsPanel: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(audioService.isEnabled);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.BEGINNER);
  const [narrationMode, setNarrationMode] = useState<NarrationMode>(audioService.mode);
  const [language, setLanguage] = useState<LanguageCode>(audioService.language);
  const [voiceSpeed, setVoiceSpeed] = useState(audioService.rate);
  const [brightness, setBrightness] = useState(80);
  const [lowPower, setLowPower] = useState(false);
  const [storageUsage, setStorageUsage] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [colorblindMode, setColorblindMode] = useState<string>('NONE');
  
  // Offline State
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [localVideoSize, setLocalVideoSize] = useState(0);

  useEffect(() => {
    // Initial Load
    const usage = JSON.stringify(localStorage).length / 1024 / 1024;
    setStorageUsage(parseFloat(usage.toFixed(2)));
    
    // Load local settings for A11y
    const savedHC = localStorage.getItem('lab_a11y_hc') === 'true';
    setHighContrast(savedHC);

    refreshStorage();
  }, []);

  const refreshStorage = async () => {
      const p = await offlineStorage.getContentPacks();
      setPacks(p);
      const videoStats = await offlineStorage.getStorageUsage();
      setLocalVideoSize(videoStats.usedBytes / 1024 / 1024);
  };

  // Sync Audio
  useEffect(() => {
    audioService.updateSettings({
        isEnabled: audioEnabled,
        mode: narrationMode,
        language: language,
        rate: voiceSpeed
    });
  }, [audioEnabled, narrationMode, language, voiceSpeed]);

  // Sync Tracker
  useEffect(() => {
      trackerService.setLowPowerMode(lowPower);
  }, [lowPower]);

  // Sync High Contrast
  useEffect(() => {
      if (highContrast) {
          document.body.classList.add('high-contrast');
      } else {
          document.body.classList.remove('high-contrast');
      }
      localStorage.setItem('lab_a11y_hc', String(highContrast));
  }, [highContrast]);

  const clearCache = () => {
      if (confirm('Clear all downloaded data and cache?')) {
          localStorage.clear();
          setStorageUsage(0);
          offlineStorage.clearVideos().then(() => refreshStorage());
          alert('Cache cleared.');
      }
  };

  const handleDownload = async (id: any) => {
      setDownloading(id);
      await offlineStorage.downloadPack(id);
      await refreshStorage();
      setDownloading(null);
  };

  const handleDelete = async (id: any) => {
      if(confirm('Remove this content pack?')) {
          await offlineStorage.deletePack(id);
          await refreshStorage();
      }
  };

  return (
    <div className="p-6 pb-24 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Settings className="w-8 h-8" /> Settings
      </h2>

      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-4 rounded-xl border border-purple-500/30 mb-6 flex justify-between items-center">
          <div>
              <h3 className="font-bold text-white flex items-center gap-2"><GraduationCap size={18}/> Teacher Access</h3>
              <p className="text-xs text-slate-400">Switch to classroom management mode.</p>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate(ViewState.TEACHER_DASHBOARD)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors min-h-[44px] focus:ring-2 focus:ring-purple-300"
          >
              Open Dashboard
          </button>
      </div>

      <SettingsSection title="Storage & Downloads" icon={HardDrive}>
          <div className="flex justify-between items-center mb-4">
              <span className="text-slate-300 font-medium text-xs">Local Database</span>
              <span className="text-white font-mono text-xs">{storageUsage} MB</span>
          </div>
          <div className="flex justify-between items-center mb-4">
              <span className="text-slate-300 font-medium text-xs">Recorded Videos</span>
              <span className="text-white font-mono text-xs">{localVideoSize.toFixed(2)} MB</span>
          </div>

          <div className="space-y-3 mt-4">
              {packs.map(pack => (
                  <div key={pack.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <div>
                          <div className="text-sm font-bold text-white">{pack.name}</div>
                          <div className="text-xs text-slate-500">{pack.sizeMB} MB • {pack.downloaded ? 'Downloaded' : 'Online Only'}</div>
                      </div>
                      {pack.id === 'CORE' ? (
                          <span className="text-xs text-slate-500 font-bold bg-slate-800 px-2 py-1 rounded">CORE</span>
                      ) : (
                          pack.downloaded ? (
                              <button onClick={() => handleDelete(pack.id)} className="p-2 text-red-400 hover:bg-slate-800 rounded">
                                  <Trash2 size={16} />
                              </button>
                          ) : (
                              <button 
                                onClick={() => handleDownload(pack.id)} 
                                disabled={downloading !== null}
                                className="p-2 text-lab-accent hover:bg-slate-800 rounded disabled:opacity-50"
                              >
                                  {downloading === pack.id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/> : <Download size={16} />}
                              </button>
                          )
                      )}
                  </div>
              ))}
          </div>

          <button 
            onClick={clearCache}
            className="w-full mt-4 py-3 flex items-center justify-center gap-2 bg-slate-700 hover:bg-red-900/50 text-white rounded-lg transition-colors border border-slate-600 hover:border-red-500 min-h-[44px]"
          >
              <Trash2 size={18} /> Clear App Cache
          </button>
      </SettingsSection>

      <SettingsSection title="Accessibility" icon={Accessibility}>
          <ToggleRow label="High Contrast Mode" value={highContrast} onChange={setHighContrast} />
          <div className="mt-4">
              <label className="text-slate-300 text-sm block mb-2 font-medium">Colorblind Mode</label>
              <select 
                value={colorblindMode}
                onChange={(e) => setColorblindMode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-3 outline-none focus:border-lab-accent min-h-[44px]"
              >
                  <option value="NONE">None</option>
                  <option value="PROTANOPIA">Protanopia (Red-Blind)</option>
                  <option value="DEUTERANOPIA">Deuteranopia (Green-Blind)</option>
                  <option value="TRITANOPIA">Tritanopia (Blue-Blind)</option>
                  <option value="ACHROMATOPSIA">Achromatopsia (Monochrome)</option>
              </select>
          </div>
      </SettingsSection>

      <SettingsSection title="Performance & Battery" icon={Battery}>
          <ToggleRow label="Battery Saver (Low FPS)" value={lowPower} onChange={setLowPower} />
          <p className="text-xs text-slate-500 mt-2">Reduces camera tracking frame rate to save battery during long experiments.</p>
      </SettingsSection>

      <SettingsSection title="Audio & Narration" icon={Mic}>
         <ToggleRow label="Enable Audio" value={audioEnabled} onChange={setAudioEnabled} />
         
         <div className="space-y-4 mt-2">
             <div>
                <label className="text-slate-400 text-xs uppercase font-bold mb-2 block">Narration Persona</label>
                <div className="grid grid-cols-4 gap-2">
                    {[NarrationMode.KID, NarrationMode.STUDENT, NarrationMode.TEACHER, NarrationMode.SILENT].map((m) => (
                        <button
                            key={m}
                            onClick={() => setNarrationMode(m)}
                            className={`py-3 px-1 rounded-lg text-[10px] font-bold border transition-all min-h-[44px] ${
                                narrationMode === m 
                                ? 'bg-lab-accent/20 border-lab-accent text-lab-accent' 
                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
             </div>

             <div>
                <label className="text-slate-400 text-xs uppercase font-bold mb-2 block flex items-center gap-2"><Globe size={12}/> Language</label>
                <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-3 outline-none focus:border-lab-accent min-h-[44px]"
                >
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                    <option value="fr-FR">Français</option>
                    <option value="de-DE">Deutsch</option>
                    <option value="zh-CN">Mandarin (Chinese)</option>
                    <option value="hi-IN">Hindi</option>
                    <option value="ar-SA">Arabic</option>
                </select>
             </div>

             <div>
                 <label className="text-slate-400 text-xs uppercase font-bold mb-2 block flex items-center gap-2"><Zap size={12}/> Speech Speed ({voiceSpeed}x)</label>
                 <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lab-accent"
                />
             </div>
         </div>
      </SettingsSection>

      <SettingsSection title="Education Mode" icon={Settings}>
         <div className="space-y-2">
            <label className="text-slate-300 text-sm block mb-2">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-2">
                {Object.values(DifficultyLevel).map((level) => (
                    <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`py-3 px-1 rounded-lg text-xs font-bold border min-h-[44px] ${
                            difficulty === level 
                            ? 'bg-lab-accent/20 border-lab-accent text-lab-accent' 
                            : 'bg-slate-900 border-transparent text-slate-500 hover:border-slate-600'
                        }`}
                    >
                        {level}
                    </button>
                ))}
            </div>
         </div>
      </SettingsSection>

      <SettingsSection title="Visuals" icon={Eye}>
        <div className="mb-4">
            <div className="flex justify-between text-slate-300 text-sm mb-2">
                <span className="flex items-center gap-2"><Moon size={14}/> Brightness</span>
                <span className="flex items-center gap-2"><Sun size={14}/></span>
            </div>
            <input 
                type="range" 
                min="0" 
                max="100" 
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lab-accent"
            />
        </div>
      </SettingsSection>
      
      <div className="text-center mt-8 pb-8">
        <p className="text-xs text-slate-600">Lab Partner AI v1.4.0 (Offline Capable)</p>
      </div>
    </div>
  );
};

export default SettingsPanel;
