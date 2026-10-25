import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, Trash2 } from 'lucide-react';
import { APP_LOGO_URL } from '../data/initialData';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            {/* Logo & Icon */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-[1.5px] shadow-lg overflow-hidden shrink-0">
                <img
                  src={APP_LOGO_URL}
                  alt="Satu Tangan"
                  className="w-full h-full object-cover rounded-[14px]"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Terjadi Kendala Tampilan</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Aplikasi mendeteksi error pada memori lokal atau komponen antarmuka. Anda dapat memuat ulang atau mereset data cache untuk kembali normal.
              </p>
            </div>

            {/* Error Message Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-left">
              <p className="text-[11px] font-mono text-rose-400 break-words font-semibold">
                {this.state.error?.message || 'Unknown runtime exception'}
              </p>
              {this.state.error?.stack && (
                <details className="mt-2">
                  <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-400">
                    Lihat Stack Trace Lengkap
                  </summary>
                  <pre className="text-[9px] text-slate-500 font-mono mt-1 overflow-x-auto max-h-32 p-2 bg-slate-900 rounded">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Menghapus cache lokal dan mengembalikan data demo awal"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Reset Cache & Data</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
