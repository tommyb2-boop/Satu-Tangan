import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  ArrowRight, 
  Github, 
  KeyRound, 
  ShieldCheck, 
  X,
  School
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginPageProps {
  onOpenArchitecture?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenArchitecture }) => {
  const { loginWithEmail, loginWithGitHub } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('operator@satutangan.sch.id');
  const [password, setPassword] = useState('operator2026');
  const [name, setName] = useState('Budi Raharjo, S.Kom');
  const [schoolName, setSchoolName] = useState('SMP Negeri 1 Cendekia Mandiri');
  
  const [githubUsername, setGithubUsername] = useState('operator-sekolah-id');
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Mohon lengkapi email dan kata sandi.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      loginWithEmail(email, password);
      setLoading(false);
      try {
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.8 } });
      } catch {
        // ignore
      }
    }, 300);
  };

  const handleGitHubAuth = () => {
    setLoading(true);
    setTimeout(() => {
      loginWithGitHub(githubUsername || 'operator-cendekia');
      setLoading(false);
      setShowGithubModal(false);
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      } catch {
        // ignore
      }
    }, 350);
  };

  return (
    <div className="h-screen h-dvh max-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-3 sm:p-5 relative overflow-hidden select-none selection:bg-indigo-500 selection:text-white">
      {/* 3D Ambient Background Glows */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />

      {/* Top Header (Compact single row) */}
      <header className="w-full max-w-sm flex items-center justify-between shrink-0 pt-1 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-sky-400 p-[1.5px] shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              Satu Tangan
              <span className="text-[9px] uppercase font-semibold tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-1.5 py-0.2 rounded">
                v2.5
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Aplikasi Operator Pendidikan</p>
          </div>
        </div>

        {onOpenArchitecture && (
          <button
            onClick={onOpenArchitecture}
            className="text-[10px] text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
          >
            Skema DB
          </button>
        )}
      </header>

      {/* Center 3D Glassmorphic Login Card (Fits 1 Android Screen Perfectly) */}
      <main className="w-full max-w-sm flex-1 flex flex-col justify-center my-auto py-1">
        <div className="relative">
          {/* Subtle 3D colored glow frame */}
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-indigo-500/40 via-purple-600/30 to-emerald-500/20 opacity-30 blur-md pointer-events-none" />

          <div className="relative rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 p-4 sm:p-5 shadow-2xl">
            {/* Tab: Masuk vs Daftar */}
            <div className="flex items-center p-0.5 bg-slate-950/90 rounded-xl mb-3 border border-slate-800">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Masuk Operator
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'register'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daftar Akun
              </button>
            </div>

            {errorMsg && (
              <div className="mb-2.5 p-2 rounded-lg bg-rose-950/70 border border-rose-800/80 text-rose-300 text-[11px] leading-tight">
                {errorMsg}
              </div>
            )}

            {/* Compact Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {activeTab === 'register' && (
                <>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-300 mb-0.5">
                      Nama Lengkap Operator
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Budi Raharjo, S.Kom"
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1.5 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-300 mb-0.5">
                      Nama Sekolah
                    </label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="SMP Negeri 1 Cendekia Mandiri"
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1.5 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-medium text-slate-300 mb-0.5">
                  Email Operator
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@satutangan.sch.id"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1.5 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-300 mb-0.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1.5 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <span>Memproses Masuk...</span>
                ) : (
                  <>
                    <span>{activeTab === 'login' ? 'Masuk ke Dashboard' : 'Buat Akun & Masuk'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Actions Strip */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
              <button
                type="button"
                onClick={() => setShowGithubModal(true)}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Masuk dengan GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('operator@satutangan.sch.id');
                  setPassword('operator2026');
                  loginWithEmail('operator@satutangan.sch.id', 'operator2026');
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/50 text-[10px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <KeyRound className="w-3 h-3 text-indigo-400" />
                <span>Gunakan Akun Demo Otomatis</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* GitHub Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-2xl relative text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-white" />
                <h3 className="text-xs font-bold text-white">GitHub OAuth</h3>
              </div>
              <button onClick={() => setShowGithubModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
              Masuk instan menggunakan akun GitHub Anda untuk operator.
            </p>

            <div className="mb-3">
              <label className="block text-[10px] text-slate-400 mb-1">Username GitHub</label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="budi-operator"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGithubModal(false)}
                className="flex-1 py-1.5 rounded-lg text-[11px] text-slate-300 bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleGitHubAuth}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Otorisasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer (Single compact line) */}
      <footer className="w-full text-center text-[10px] text-slate-500 shrink-0 pb-1">
        &copy; {new Date().getFullYear()} Satu Tangan &bull; Aplikasi Operator Pendidikan
      </footer>
    </div>
  );
};
