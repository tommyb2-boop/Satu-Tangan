import React from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  X, 
  MoreVertical, 
  PlusSquare, 
  Zap, 
  WifiOff, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNativeInstall?: () => void;
  isInstallable?: boolean;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  onNativeInstall,
  isInstallable,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1.5px] shadow-lg shadow-indigo-500/25 shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                <img
                  src="/pwa-192x192.png"
                  alt="Logo Satu Tangan"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Pasang Aplikasi di Android</h3>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 px-2 py-0.5 rounded-full font-semibold">
                  PWA / WebAPK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Satu Tangan &bull; Operator Pendidikan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-300 text-xs leading-relaxed">
          {/* Keuntungan Instalasi */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col items-center text-center">
              <Zap className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Buka Instan</span>
              <span className="text-[10px] text-slate-400">Tanpa jeda URL bar</span>
            </div>
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col items-center text-center">
              <WifiOff className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Siap Offline</span>
              <span className="text-[10px] text-slate-400">Data tersimpan di HP</span>
            </div>
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col items-center text-center">
              <Smartphone className="w-4 h-4 text-sky-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Full Screen</span>
              <span className="text-[10px] text-slate-400">Mirip aplikasi APK</span>
            </div>
          </div>

          {/* Tombol Pasang Otomatis jika prompt browser aktif */}
          {isInstallable && onNativeInstall && (
            <button
              onClick={() => {
                onNativeInstall();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Pasang Otomatis Sekarang (1-Klik)</span>
            </button>
          )}

          {/* Panduan Manual untuk Google Chrome di Android */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs border-b border-slate-800/80 pb-2">
              <span className="w-5 h-5 rounded-full bg-indigo-900/80 border border-indigo-700/60 flex items-center justify-center text-[10px] text-indigo-300">
                1
              </span>
              <span>Langkah Pasang di Google Chrome Android:</span>
            </div>

            <ol className="space-y-2.5 pl-1">
              <li className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                  <MoreVertical className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    1. Tekan tombol menu titik tiga ( <span className="font-mono text-indigo-300">⋮</span> )
                  </p>
                  <p className="text-[11px] text-slate-400">Terletak di pojok kanan atas browser Chrome Android Anda.</p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    2. Pilih menu <span className="text-emerald-300 font-semibold">&ldquo;Instal aplikasi&rdquo;</span> atau <span className="text-emerald-300 font-semibold">&ldquo;Tambahkan ke Layar Utama&rdquo;</span>
                  </p>
                  <p className="text-[11px] text-slate-400">Chrome akan otomatis menyiapkan ikon dan nama resmi Satu Tangan.</p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    3. Konfirmasi tombol <span className="text-teal-300 font-semibold">&ldquo;Instal&rdquo;</span>
                  </p>
                  <p className="text-[11px] text-slate-400">Aplikasi akan terpasang di menu daftar aplikasi Android (App Drawer) Anda!</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Untuk Browser Samsung Internet / Xiaomi Browser */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5">
            <p className="font-semibold text-slate-300 text-[11px] flex items-center gap-1.5">
              <PlusSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Untuk Browser Samsung Internet / Lainnya:</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Tekan ikon menu <span className="text-slate-200">☰</span> di kanan bawah &rarr; pilih <span className="text-slate-200">&ldquo;Tambahkan halaman ke&rdquo;</span> &rarr; ketuk <span className="text-sky-300 font-medium">&ldquo;Layar Depan&rdquo;</span>.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Aman, bebas iklan & ringan (&lt;1MB)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
