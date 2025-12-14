
import { NarrationMode, LanguageCode, SafetyLevel } from '../types';

class AudioService {
  private synth: SpeechSynthesis;
  private audioCtx: AudioContext | null = null;
  
  // Settings
  public mode: NarrationMode = NarrationMode.STUDENT;
  public language: LanguageCode = 'en-US';
  public rate: number = 1.0;
  public volume: number = 1.0;
  public isEnabled: boolean = true;

  // State
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onCaptionUpdate: ((text: string) => void) | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    // Try to load settings from local storage
    try {
        const stored = localStorage.getItem('lab_ai_audio_settings');
        if (stored) {
            const parsed = JSON.parse(stored);
            this.mode = parsed.mode || NarrationMode.STUDENT;
            this.language = parsed.language || 'en-US';
            this.rate = parsed.rate || 1.0;
            this.volume = parsed.volume ?? 1.0;
            this.isEnabled = parsed.isEnabled ?? true;
        }
    } catch (e) {
        console.warn('Failed to load audio settings');
    }
  }

  // --- SETTINGS MANAGEMENT ---
  public updateSettings(settings: { mode?: NarrationMode, language?: LanguageCode, rate?: number, volume?: number, isEnabled?: boolean }) {
      if (settings.mode) this.mode = settings.mode;
      if (settings.language) this.language = settings.language;
      if (settings.rate) this.rate = settings.rate;
      if (settings.volume !== undefined) this.volume = settings.volume;
      if (settings.isEnabled !== undefined) this.isEnabled = settings.isEnabled;

      this.saveSettings();
  }

  private saveSettings() {
      localStorage.setItem('lab_ai_audio_settings', JSON.stringify({
          mode: this.mode,
          language: this.language,
          rate: this.rate,
          volume: this.volume,
          isEnabled: this.isEnabled
      }));
  }

  public setCaptionCallback(cb: (text: string) => void) {
      this.onCaptionUpdate = cb;
  }

  // --- TTS CORE ---
  public speak(text: string, force: boolean = false) {
      if (!this.isEnabled || this.mode === NarrationMode.SILENT) {
          if (this.onCaptionUpdate) this.onCaptionUpdate(text); // Still show captions
          return;
      }

      if (this.synth.speaking && !force) return;
      if (force) this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.language;
      utterance.volume = this.volume;
      
      // Adjust voice based on persona
      this.applyPersona(utterance);

      utterance.onstart = () => {
          if (this.onCaptionUpdate) this.onCaptionUpdate(text);
      };

      utterance.onend = () => {
          // Optional: clear caption after delay? 
          // Keeping it persistent usually better for reading
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
  }

  public stop() {
      this.synth.cancel();
      if (this.onCaptionUpdate) this.onCaptionUpdate('');
  }

  private applyPersona(u: SpeechSynthesisUtterance) {
      u.rate = this.rate;
      u.pitch = 1.0;

      // Select voice if available (basic heuristic)
      const voices = this.synth.getVoices().filter(v => v.lang.startsWith(this.language.split('-')[0]));
      
      if (this.mode === NarrationMode.KID) {
          u.rate = this.rate * 1.1; // Faster, energetic
          u.pitch = 1.2; // Higher pitch
          // Try to find a female voice often sounds friendlier/younger in standard TTS engines
          const kidVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English'));
          if (kidVoice) u.voice = kidVoice;
      } else if (this.mode === NarrationMode.TEACHER) {
          u.rate = this.rate * 0.9; // Slower, authoritative
          u.pitch = 0.9;
          const teachVoice = voices.find(v => v.name.includes('Male') || v.name.includes('Daniel'));
          if (teachVoice) u.voice = teachVoice;
      } else {
          // Student / Default
          if (voices.length > 0) u.voice = voices[0];
      }
  }

  // --- DYNAMIC EXPLANATIONS ---
  public generateExplanation(principle: string, advanced: string, realWorld: string): string {
      switch (this.mode) {
          case NarrationMode.KID:
              return `Wow! Did you see that? ${principle} It's just like magic, but it's science! This is used in ${realWorld}. Cool right?`;
          case NarrationMode.STUDENT:
              return `Observation complete. ${principle} In the real world, you see this in ${realWorld}.`;
          case NarrationMode.TEACHER:
              return `Excellent work. Let's analyze this. ${advanced} This principle is fundamental to applications like ${realWorld}.`;
          default:
              return principle;
      }
  }

  public getSafetyWarning(level: SafetyLevel): string {
      if (level === SafetyLevel.DANGER || level === SafetyLevel.EXTREME) {
          return this.mode === NarrationMode.KID 
            ? "Uh oh! Danger! Please be super careful and ask a grown-up for help!" 
            : "Critical Safety Warning. High hazard potential detected. Proceed with extreme caution.";
      }
      return "";
  }

  // --- SOUND EFFECTS ---
  private initAudioCtx() {
      if (!this.audioCtx) {
          const Ctx = window.AudioContext || (window as any).webkitAudioContext;
          this.audioCtx = new Ctx();
      }
      if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
      }
  }

  public playSound(type: 'SUCCESS' | 'ERROR' | 'BUBBLE' | 'DING') {
      if (!this.isEnabled || this.mode === NarrationMode.SILENT) return;
      this.initAudioCtx();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      switch (type) {
          case 'SUCCESS':
              osc.type = 'sine';
              osc.frequency.setValueAtTime(523.25, now); // C5
              osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
              osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
              gain.gain.setValueAtTime(0.1, now);
              gain.gain.linearRampToValueAtTime(0, now + 0.4);
              osc.start(now);
              osc.stop(now + 0.4);
              break;
          case 'ERROR':
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(150, now);
              osc.frequency.linearRampToValueAtTime(100, now + 0.3);
              gain.gain.setValueAtTime(0.2, now);
              gain.gain.linearRampToValueAtTime(0, now + 0.3);
              osc.start(now);
              osc.stop(now + 0.3);
              break;
          case 'DING':
              osc.type = 'sine';
              osc.frequency.setValueAtTime(1000, now);
              gain.gain.setValueAtTime(0.05, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
              osc.start(now);
              osc.stop(now + 0.5);
              break;
          case 'BUBBLE':
              osc.type = 'sine';
              osc.frequency.setValueAtTime(400, now);
              osc.frequency.linearRampToValueAtTime(800, now + 0.1);
              gain.gain.setValueAtTime(0.1, now);
              gain.gain.linearRampToValueAtTime(0, now + 0.1);
              osc.start(now);
              osc.stop(now + 0.1);
              break;
      }
  }
}

export const audioService = new AudioService();
