import React from 'react';
import { Calculator } from './components/Calculator';
import { CalculatorIcon } from './components/Icons';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-red-400 mb-2">Něco se pokazilo</h2>
            <p className="text-sm text-slate-300 mb-4">Aplikace narazila na chybu a nemohla být zobrazena.</p>
            <pre className="bg-slate-950 p-4 rounded-lg overflow-auto text-xs font-mono text-red-300">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
            >
              Obnovit stránku
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* Abstract Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="absolute top-6 left-0 w-full flex items-center justify-center p-4">
         <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-sm px-6 py-2 rounded-full border border-slate-800/50 shadow-lg">
            <div className="bg-indigo-500 p-1.5 rounded-lg">
                <CalculatorIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Chytrá Kalkulačka
            </h1>
         </div>
      </header>

      {/* Main Content */}
      <main className="z-10 w-full flex items-center justify-center px-4 pt-20 pb-10">
        <ErrorBoundary>
          <Calculator />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 text-slate-600 text-xs text-center w-full">
        <p>Používá Gemini 3 Flash • Designováno s Tailwind CSS</p>
      </footer>
    </div>
  );
};

export default App;