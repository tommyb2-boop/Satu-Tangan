import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Smartphone, 
  ShieldCheck, 
  WifiOff, 
  Zap, 
  CheckCircle2, 
  X, 
  Sparkles, 
  HardDrive, 
  Lock,
  ArrowRight,
  Share2,
  PlusSquare,
  Check
} from 'lucide-react';
import { APP_LOGO_URL } from '../data/initialData';

interface NewDeviceWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isAndroid: boolean;
  isIOS: boolean;
}

export const NewDeviceWelcomeModal: React.FC<NewDeviceWelcomeModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isInstallable,
  isInstalled,
  isAndroid,
  isIOS,
}) => {
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'ready' | 'fallback'>('checking');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      setDbStatus('ready');
    } else {
      setDbStatus('fallback');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200 select-none no-print">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 border-b border-slate-800 relative overflow-hidden">
          {/* Subtle glow orb */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1.5px] shadow-lg shadow-indigo-500/25 shrink-0">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden p-0.5">
                  <img
                    src={APP_LOGO_URL}
                    alt="Logo Satu Tangan"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Satu Tangan Pendidikan
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    Perangkat Baru
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Aplikasi Sistem Manajemen Sekolah &bull; Offline-First
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors shrink-0"
              title="Tutup & Masuk ke Aplikasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
          
          {/* Main Notice Box: Local Database Architecture */}
          <div className="p-4 bg-gradient-to-br from-indigo-950/60 to-slate-950 border border-indigo-500/40 rounded-2xl shadow-inner space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Dirancang Khusus untuk Database Lokal</span>
            </div>
            <p className="text-xs text-slate-200 leading-normal">
              Aplikasi ini beroperasi menggunakan <strong>Database Lokal Mandiri (IndexedDB)</strong> langsung di dalam perangkat ini. Data sekolah Anda tidak disimpan di server pihak ketiga sehingga 100% aman, rahasia, dan dapat diakses secepat kilat tanpa jeda internet.
            </p>
          </div>

          {/* Key Advantages Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center text-center space-y-1">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <WifiOff className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">100% Siap Offline</span>
              <span className="text-[11px] text-slate-400">
                Presensi, input nilai & cetak raport tanpa kuota internet
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center text-center space-y-1">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Privasi Terjamin</span>
              <span className="text-[11px] text-slate-400">
                Data siswa & guru tetap aman di penyimpanan HP/laptop Anda
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center text-center space-y-1">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Responsif (0 ms)</span>
              <span className="text-[11px] text-slate-400">
                Pencarian & pengolahan data instan secepat memori lokal
              </span>
            </div>
          </div>

          {/* Installation Suggestion Banner */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-start gap-3">
            <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-bold shrink-0 mt-0.5">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-300">
                Rekomendasi: Pasang Aplikasi Sekarang
              </p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Untuk pengalaman terbaik, pasang aplikasi ini ke Layar Utama (Home Screen). Aplikasi akan berjalan seperti aplikasi mandiri dengan layar penuh, ikon resmi sekolah, dan performa database lokal yang maksimal.
              </p>
            </div>
          </div>

          {/* Device & Database Technical Status */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>Status Database Perangkat:</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-mono text-[11px]">
                {dbStatus === 'ready' ? 'IndexedDB Siap & Aktif' : 'Penyimpanan Lokal Aktif'}
              </span>
            </div>
          </div>

          {/* Manual Installation Guide if requested or on iOS */}
          {showManualGuide && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-700 space-y-3 text-xs animate-in fade-in">
              <p className="font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>Langkah Manual Pemasangan ({isIOS ? 'iOS Safari' : 'Chrome Android'}):</span>
              </p>
              
              {isIOS ? (
                <ol className="list-decimal list-inside space-y-2 text-slate-300 text-[11px]">
                  <li>
                    Ketuk tombol <strong>Bagikan / Share</strong> (
                    <Share2 className="w-3.5 h-3.5 inline text-sky-400" />
                    ) di bilah bawah browser Safari.
                  </li>
                  <li>
                    Gulir ke bawah dan pilih opsi <strong>Tambahkan ke Layar Utama</strong> (
                    <PlusSquare className="w-3.5 h-3.5 inline text-sky-400" />
                    ).
                  </li>
                  <li>
                    Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas.
                  </li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-2 text-slate-300 text-[11px]">
                  <li>
                    Ketuk tombol menu <strong>tiga titik (⋮)</strong> di pojok kanan atas browser Google Chrome.
                  </li>
                  <li>
                    Pilih menu <strong>Pasang Aplikasi</strong> atau <strong>Tambahkan ke Layar Utama</strong>.
                  </li>
                  <li>
                    Konfirmasi dengan mengetuk <strong>Instal</strong>.
                  </li>
                </ol>
              )}
            </div>
          )}

        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
          {/* Main Action: Install Button */}
          {!isInstalled ? (
            <button
              onClick={() => {
                if (isInstallable) {
                  onInstall();
                } else {
                  setShowManualGuide(true);
                }
              }}
              className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Instal Sekarang untuk Menggunakan</span>
            </button>
          ) : (
            <div className="w-full sm:flex-1 py-3 px-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Aplikasi Sudah Terpasang di Perangkat Ini</span>
            </div>
          )}

          {/* Secondary Action: Continue directly to app */}
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold rounded-2xl transition border border-slate-700 flex items-center justify-center gap-1.5"
          >
            <span>Buka Langsung</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
