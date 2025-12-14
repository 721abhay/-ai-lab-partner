import { SafetyLevel, IncidentLog } from '../types';

class SafetyService {
  private incidentLog: IncidentLog[] = [];
  private speechSynth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;

  public playAlertSound(level: SafetyLevel) {
    // Simple oscillator based beep
    if (typeof window === 'undefined') return;
    
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (level === SafetyLevel.EXTREME || level === SafetyLevel.DANGER) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.5); // Drop to A4
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    } else if (level === SafetyLevel.CAUTION) {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      if (navigator.vibrate) navigator.vibrate(200);
    } else {
        // Safe chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  }

  public speak(text: string) {
    if (!this.speechSynth) return;
    this.speechSynth.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    this.speechSynth.speak(utterance);
  }

  public logIncident(chem1: string, chem2: string, outcome: string) {
    const log: IncidentLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      chem1,
      chem2,
      outcome
    };
    this.incidentLog.push(log);
    console.warn("SAFETY INCIDENT LOGGED:", log);
    // In a real app, save to local storage or backend
  }

  public getLogs(): IncidentLog[] {
    return this.incidentLog;
  }
}

export const safetyService = new SafetyService();