
import { analytics } from './analyticsService';

class ErrorReportingService {
    public init() {
        window.addEventListener('error', (event) => {
            this.captureException(event.error || new Error(event.message), { source: 'window.onerror' });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.captureException(event.reason, { source: 'unhandledrejection' });
        });
    }

    public captureException(error: Error, context: Record<string, any> = {}) {
        console.error('[ErrorTracker] Caught:', error);
        
        // Log to analytics as a distinct event
        analytics.logEvent('app_error', {
            message: error.message,
            stack: error.stack,
            type: error.name,
            ...context
        });

        // In production, send to Sentry/Datadog here
        // Sentry.captureException(error, { extra: context });
    }
}

export const errorReporter = new ErrorReportingService();
