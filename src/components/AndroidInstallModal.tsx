import React, { useState } from 'react';
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
  ExternalLink,
  Monitor,
  Sparkles,
  MousePointerClick
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
  // Detect if user is on Windows / Desktop
  const isDesktop = typeof window !== 'undefined' && 
    (navigator.userAgent.includes('Windows') || navigator.userAgent.includes('Macintosh') || !navigator.userAgent.includes('Android'));

  const [activeDeviceTab, setActiveDeviceTab] = useState<'windows' | 'android'>(isDesktop ? 'windows' : 'android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 shrink-0">
              <img
                src="/pwa-transparent-192x192.png?v=3"
                alt="Logo Satu Tangan"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(99,102,241,0.4)]"
              />
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

        {/* Device Switcher Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveDeviceTab('windows')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeDeviceTab === 'windows'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Laptop / Komputer (Windows)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveDeviceTab('android')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeDeviceTab === 'android'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Ponsel Android (WebAPK)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-300 text-xs leading-relaxed max-h-[60vh]">
          {activeDeviceTab === 'windows' ? (
            /* TAB 1: WINDOWS LAPTOP / DESKTOP */
            <div className="space-y-4">
              {/* Info Box: Mengapa Chrome membuat kotak putih */}
              <div className="p-3.5 bg-gradient-to-br from-indigo-950/70 to-slate-950 border border-indigo-500/40 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Solusi Ikon Transparan di Desktop Windows</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Google Chrome di Windows secara otomatis membungkus shortcut PWA dengan kotak putih. Anda dapat membuat ikon shortcut desktop Anda <strong>100% transparan tanpa kotak putih</strong> selamanya hanya dalam 3 langkah mudah:
                </p>
              </div>

              {/* Download Buttons for Windows */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <p className="text-[11px] font-bold text-white">Langkah 1: Unduh File Ikon Transparan Asli</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="/satutangan.ico"
                    download="satutangan.ico"
                    className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh satutangan.ico (Disarankan)</span>
                  </a>
                  <a
                    href="/satutangan_transparan.png"
                    download="satutangan_transparan.png"
                    className="py-2.5 px-3 rounded-xl font-medium text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG Transparan</span>
                  </a>
                </div>
              </div>

              {/* Step by Step Guide */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs border-b border-slate-800/80 pb-2">
                  <MousePointerClick className="w-4 h-4 text-amber-400" />
                  <span>Langkah 2: Pasang ke Shortcut di Layar Desktop:</span>
                </div>

                <ol className="space-y-3 pl-1 text-[11px]">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-slate-200">Klik kanan shortcut &ldquo;Satu Tangan&rdquo; di Desktop laptop Anda</p>
                      <p className="text-slate-400">Pilih menu paling bawah: <strong className="text-white">Properties</strong> (atau <em>Properti</em>).</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-slate-200">Klik tombol &ldquo;Change Icon...&rdquo; (Ganti Ikon)</p>
                      <p className="text-slate-400">Terletak di tab <em>Shortcut</em> atau <em>Web Document</em> pada jendela yang terbuka.</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <p className="font-semibold text-slate-200">Klik &ldquo;Browse...&rdquo; lalu pilih file <span className="text-emerald-300 font-mono">satutangan.ico</span></p>
                      <p className="text-slate-400">Pilih file yang baru saja Anda unduh dari folder <em>Downloads</em>, lalu klik <strong>OK</strong> dan <strong>Apply</strong>.</p>
                    </div>
                  </li>
                </ol>

                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-[11px] text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Seketika kotak putih hilang dan ikon mengambang transparan sempurna di wallpaper laptop Anda!</span>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: ANDROID */
            <div className="space-y-4">
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
          )}
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
