
import { DataPoint } from '../types';

class TrackerService {
  private isTracking = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private prevFrameData: Uint8ClampedArray | null = null;
  
  private startTime = 0;
  private lastActivityTime = 0;
  private listeners: ((data: DataPoint) => void)[] = [];
  
  // Settings
  private width = 320; // Internal processing resolution (lower for performance)
  private height = 240;
  private frameInterval = 200; // ms between frames
  private lowPower = false;

  public setLowPowerMode(enabled: boolean) {
      this.lowPower = enabled;
      this.frameInterval = enabled ? 1000 : 200; // 1 FPS vs 5 FPS
  }

  public start(videoElement: HTMLVideoElement, stream: MediaStream) {
    if (this.isTracking) return;
    this.isTracking = true;
    this.startTime = Date.now();
    this.lastActivityTime = Date.now();
    
    // Setup Canvas
    if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    // Setup Audio
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext) {
          this.audioContext = new AudioCtx();
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 256;
      }
      if (this.audioContext.state === 'suspended') this.audioContext.resume();
      
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser!);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }

    this.processLoop(videoElement);
  }

  public stop() {
    this.isTracking = false;
    this.prevFrameData = null;
    if (this.microphone) {
        this.microphone.disconnect();
        this.microphone = null;
    }
    // Note: We don't close AudioContext repeatedly to avoid browser limits, just disconnect source
  }

  public addListener(callback: (data: DataPoint) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private processLoop = (video: HTMLVideoElement) => {
    if (!this.isTracking || !this.ctx) return;

    // Draw video frame to canvas
    this.ctx.drawImage(video, 0, 0, this.width, this.height);
    const frame = this.ctx.getImageData(0, 0, this.width, this.height);
    const data = frame.data;

    // --- ANALYZE PIXELS ---
    let rSum = 0, gSum = 0, bSum = 0;
    let motionScore = 0;
    let brightnessChanges = 0;
    let highestMotionY = this.height; // For foam height (starts at bottom)

    const pixelCount = data.length / 4;
    const skip = 4; // Sample every 4th pixel for performance

    for (let i = 0; i < data.length; i += 4 * skip) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // 1. Color Average
      rSum += r;
      gSum += g;
      bSum += b;

      // 2. Motion Detection (Compare with prev frame)
      if (this.prevFrameData) {
        const pr = this.prevFrameData[i];
        const pg = this.prevFrameData[i + 1];
        const pb = this.prevFrameData[i + 2];
        
        const diff = Math.abs(r - pr) + Math.abs(g - pg) + Math.abs(b - pb);
        if (diff > 30) { // Threshold for significant motion
          motionScore++;
          
          // 3. Approximate Foam Height by finding highest Y with motion
          const y = Math.floor((i / 4) / this.width);
          if (y < highestMotionY) highestMotionY = y;
          
          // 4. Bubble proxy (high contrast change)
          if (diff > 100) brightnessChanges++;
        }
      }
    }

    // Save current frame for next loop
    this.prevFrameData = new Uint8ClampedArray(data);

    // --- CALCULATE METRICS ---
    const samples = pixelCount / skip;
    const avgR = Math.round(rSum / samples);
    const avgG = Math.round(gSum / samples);
    const avgB = Math.round(bSum / samples);

    // Normalize Motion (0-100)
    // Arbitrary scaling: assume 20% of pixels moving is "100% intensity"
    const intensity = Math.min(100, Math.round((motionScore / (samples * 0.2)) * 100));

    // Update Activity Timer
    const now = Date.now();
    if (intensity > 5) {
        this.lastActivityTime = now;
    }

    // Auto-Sleep Logic: If no activity for 10s, slow down to 2 FPS (500ms)
    // If lowPower is already on, stay on 1 FPS (1000ms)
    let dynamicInterval = this.frameInterval;
    if (!this.lowPower && (now - this.lastActivityTime > 10000)) {
        dynamicInterval = 500; 
    }

    // Foam Height (cm estimate)
    const pixelsFromBottom = this.height - highestMotionY;
    const estimatedHeight = Math.round((pixelsFromBottom / this.height) * 20 * 10) / 10; 
    
    // Bubble Count Proxy
    const bubbleRate = Math.round(brightnessChanges / 10);

    // --- AUDIO ANALYSIS ---
    let audioLevel = 0;
    if (this.analyser) {
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((a, b) => a + b, 0);
      audioLevel = Math.round(sum / dataArray.length);
    }

    // --- EMIT DATA ---
    const elapsed = Date.now() - this.startTime;
    const dataPoint: DataPoint = {
      timestamp: elapsed,
      timeStr: new Date(elapsed).toISOString().substr(14, 5),
      intensity,
      foamHeight: intensity > 5 ? estimatedHeight : 0, // Only register height if there is reaction
      bubbleCount: bubbleRate,
      colorR: avgR,
      colorG: avgG,
      colorB: avgB,
      audioLevel
    };

    this.listeners.forEach(cb => cb(dataPoint));

    // Loop
    setTimeout(() => {
        if (this.isTracking) requestAnimationFrame(() => this.processLoop(video));
    }, dynamicInterval);
  };
  
  // Simulation for Virtual Mode
  public generateSimulatedData(elapsedMs: number): DataPoint {
     const t = elapsedMs / 1000;
     // Bell curve reaction profile
     const intensity = Math.max(0, 100 * Math.exp(-Math.pow(t - 15, 2) / 50)); 
     
     return {
         timestamp: elapsedMs,
         timeStr: new Date(elapsedMs).toISOString().substr(14, 5),
         intensity: Math.round(intensity),
         foamHeight: Math.min(15, t * 0.5),
         bubbleCount: Math.round(intensity * 0.8),
         colorR: 100 + Math.sin(t) * 50,
         colorG: 100 + Math.cos(t) * 50,
         colorB: 200,
         audioLevel: Math.round(intensity * 0.5)
     };
  }
}

export const trackerService = new TrackerService();
