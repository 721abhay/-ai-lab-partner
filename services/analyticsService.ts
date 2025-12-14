
import { AnalyticsEvent, UserTraits } from '../types';

class AnalyticsService {
  private queue: AnalyticsEvent[] = [];
  private isProcessing = false;
  private sessionId: string;
  private userId: string | null = null;
  private batchSize = 10;
  private flushInterval = 30000; // 30s

  constructor() {
    this.sessionId = this.generateId();
    // Try to recover queue from local storage on boot
    const savedQueue = localStorage.getItem('lab_analytics_queue');
    if (savedQueue) {
        try {
            this.queue = JSON.parse(savedQueue);
        } catch(e) {}
    }
    
    // Auto flush loop
    setInterval(() => this.flush(), this.flushInterval);
    
    // Flush on close
    window.addEventListener('beforeunload', () => this.flush(true));
  }

  public identify(traits: UserTraits) {
      this.userId = traits.id;
      this.logEvent('user_identified', { ...traits });
  }

  public logEvent(eventName: string, properties: Record<string, any> = {}) {
      const event: AnalyticsEvent = {
          eventName,
          properties,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          userId: this.userId || undefined
      };

      this.queue.push(event);
      this.persistQueue();

      if (process.env.NODE_ENV === 'development') {
          console.debug(`[Analytics] ${eventName}`, properties);
      }

      if (this.queue.length >= this.batchSize) {
          this.flush();
      }
  }

  public async flush(isUrgent = false) {
      if (this.queue.length === 0 || this.isProcessing) return;
      
      this.isProcessing = true;
      const batch = [...this.queue];
      
      try {
          // Simulate API call to analytics provider (e.g., Mixpanel, Google Analytics)
          // await fetch('https://api.analytics.com/batch', { body: JSON.stringify(batch) ... });
          await new Promise(resolve => setTimeout(resolve, 500)); 
          
          // Clear sent items
          this.queue = this.queue.filter(e => !batch.includes(e));
          this.persistQueue();
          if(process.env.NODE_ENV === 'development') console.debug(`[Analytics] Flushed ${batch.length} events`);
          
      } catch (e) {
          console.warn('[Analytics] Flush failed, retrying later');
          // Keep in queue for next try
      } finally {
          this.isProcessing = false;
      }
  }

  private persistQueue() {
      localStorage.setItem('lab_analytics_queue', JSON.stringify(this.queue));
  }

  private generateId(): string {
      return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

export const analytics = new AnalyticsService();
