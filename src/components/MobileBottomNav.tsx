import React, { useState } from 'react';
import { useApp, ActiveModule } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AndroidInstallModal } from './AndroidInstallModal';
import { 
  Boxes, 
  Fingerprint, 
  CalendarCheck2, 
  Users, 
  FileSpreadsheet, 
  Menu, 
  X, 
  School, 
  FileCode2, 
  Download,
  RotateCcw,
  CheckCircle2,
  Database,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenArchitecture: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenArchitecture }) => {
  const { activeTab, setActiveTab, setIsSettingsOpen, resetDemoData, operator } = useApp();
  const { 
    isInstallable, 
    isInstalled, 
    showGuideModal, 
    setShowGuideModal, 
    promptInstall 
  } = usePWAInstall();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const primaryTabs: { id: ActiveModule; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Beranda', icon: <Boxes className="w-5 h-5" /> },
    { id: 'absen-sidik-jari', label: 'Sidik Jari', icon: <Fingerprint className="w-5 h-5 text-emerald-400" /> },
    { id: 'absensi-guru', label: 'Guru', icon: <CalendarCheck2 className="w-5 h-5" /> },
    { id: 'absensi-siswa', label: 'Siswa', icon: <Users className="w-5 h-5" /> },
    { id: 'cetak-raport', label: 'Database Raport', icon: <FileSpreadsheet className="w-5 h-5 text-rose-400" /> },
  ];

  const allModules: { id: ActiveModule; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard Utama', desc: 'Ringkasan statistik & metrik', icon: <Boxes className="w-5 h-5 text-indigo-400" /> },
    { id: 'absen-sidik-jari', label: 'Presensi Sidik Jari (Biometrik)', desc: 'Simulator presensi instan', icon: <Fingerprint className="w-5 h-5 text-emerald-400" /> },
    { id: 'absensi-guru', label: 'Presensi Harian Guru', desc: 'Status hadir, izin, sakit', icon: <CalendarCheck2 className="w-5 h-5 text-sky-400" /> },
    { id: 'absensi-siswa', label: 'Presensi Harian Siswa', desc: 'Rekap kehadiran per kelas', icon: <CalendarCheck2 className="w-5 h-5 text-teal-400" /> },
    { id: 'db-guru', label: 'Master Data Guru & Staf', desc: 'NIP, mapel, impor/ekspor Excel', icon: <Users className="w-5 h-5 text-amber-400" /> },
    { id: 'db-siswa', label: 'Master Data Siswa', desc: 'NISN, kelas, riwayat siswa', icon: <Database className="w-5 h-5 text-blue-400" /> },
    { id: 'cetak-raport', label: 'Database Raport Siswa', desc: 'Semua tahun pelajaran, alumni, & buat raport baru', icon: <FileSpreadsheet className="w-5 h-5 text-rose-400" /> },
    { id: 'modul-dinamis', label: 'Modul Dinamis / Lain-lain', desc: 'Ekstrakurikuler, inventaris', icon: <Sparkles className="w-5 h-5 text-pink-400" /> },
  ];

  return (
    <>
      {/* Android Mobile Bottom Navigation Bar (Visible on mobile/tablet screens < xl) */}
      <nav 
        aria-label="Navigasi Seluler" 
        className="fixed bottom-0 inset-x-0 z-40 bg-slate-900 border-t border-slate-800/80 px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] xl:hidden shadow-2xl no-print"
      >
        <div className="grid grid-cols-6 gap-1 items-center max-w-md mx-auto">
          {primaryTabs.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsDrawerOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
                  isActive
                    ? 'text-indigo-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-400' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Menu Drawer Toggle Button */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 touch-manipulation relative ${
              isDrawerOpen
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors relative ${isDrawerOpen ? 'bg-indigo-500/20 text-indigo-400' : ''}`}>
              <Menu className="w-5 h-5" />
              {!isInstalled && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Semua</span>
          </button>
        </div>
      </nav>

      {/* Android Quick Drawer Modal for all modules and extra settings */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 no-print">
          <div 
            className="flex-1" 
            onClick={() => setIsDrawerOpen(false)} 
          />
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/pwa-192x192.png" 
                  alt="Logo" 
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-indigo-500/30" 
                />
                <div>
                  <h3 className="text-sm font-bold text-white">Semua Modul & Alat</h3>
                  <p className="text-xs text-slate-400">{operator?.schoolName || 'Satu Tangan Operator'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PWA Install Banner inside Drawer for Android users (shown if not yet installed) */}
            {!isInstalled && (
              <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-600/60 rounded-2xl flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">Pasang Aplikasi di Android</p>
                    <p className="text-slate-300 text-[11px]">Buka instan di HP Anda tanpa buka browser</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const ok = await promptInstall();
                    if (ok) {
                      setIsDrawerOpen(false);
                    }
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shrink-0 active:scale-95 transition-all"
                >
                  Pasang
                </button>
              </div>
            )}

            {/* Module Grid List */}
            <div className="p-4 overflow-y-auto space-y-1.5 divide-y divide-slate-800/50">
              <div className="grid grid-cols-1 gap-1.5">
                {allModules.map((mod) => {
                  const isActive = activeTab === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setActiveTab(mod.id);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all active:scale-[0.98] ${
                        isActive
                          ? 'bg-indigo-600/20 border border-indigo-500/50 text-white'
                          : 'bg-slate-800/40 hover:bg-slate-800 border border-transparent text-slate-300'
                      }`}
                    >
                      <div className="p-2 bg-slate-900/80 rounded-lg shrink-0">
                        {mod.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-semibold ${isActive ? 'text-indigo-300' : 'text-slate-200'}`}>
                            {mod.label}
                          </p>
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{mod.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Settings & Utility Actions */}
              <div className="pt-3 mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-indigo-300 font-medium active:scale-95"
                >
                  <School className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">Profil & Kop Sekolah</span>
                </button>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenArchitecture();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-emerald-300 font-medium active:scale-95"
                >
                  <FileCode2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Skema Arsitektur</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Reset semua data ke kondisi demo awal?')) {
                      resetDemoData();
                      setIsDrawerOpen(false);
                    }
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-amber-400 font-medium active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Data Demo ke Semula</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal for Android install steps */}
      <AndroidInstallModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onNativeInstall={promptInstall}
        isInstallable={isInstallable}
      />
    </>
  );
};
