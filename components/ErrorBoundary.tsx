import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lab Partner AI Error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-red-500/50 p-8 rounded-3xl max-w-md w-full shadow-2xl">
            <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Lab Accident!</h1>
            <p className="text-slate-400 mb-6 text-sm">
              The application encountered an unexpected reaction. 
              <br/>
              <span className="font-mono text-xs text-red-400 mt-2 block bg-black/30 p-2 rounded">
                  {this.state.error?.message || 'Unknown Error'}
              </span>
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-lab-accent hover:bg-cyan-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <RefreshCw size={18} /> Restart Experiment
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Home size={18} /> Return Home
              </button>
            </div>
          </div>
          <p className="text-slate-600 text-xs mt-8">Error Code: 500_REACT_BOUNDARY</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;