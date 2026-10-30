import React from 'react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AndroidInstallModal } from './AndroidInstallModal';
import { SyncStatusBadge } from './SyncStatusBadge';
import { 
  LogOut, 
  FileCode2, 
  Github, 
  School, 
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { APP_LOGO_URL } from '../data/initialData';

interface HeaderProps {
  onOpenArchitecture: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenArchitecture }) => {
  const { operator, logout, activeTab, setActiveTab, setIsSettingsOpen, setIsNewDeviceModalOpen } = useApp();
  const { 
    isInstallable, 
    isInstalled, 
    showGuideModal, 
    setShowGuideModal, 
    promptInstall 
  } = usePWAInstall();

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-slate-900 border-b border-slate-800 shadow-md no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Wordmark & Brand with Application Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none touch-manipulation"
              title="Satu Tangan Guru - Beranda Utama"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 group-hover:scale-105 transition-transform duration-200">
                <img 
                  src={APP_LOGO_URL} 
                  alt="Logo Aplikasi Satu Tangan Guru" 
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(99,102,241,0.45)]"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans group-hover:text-indigo-200 transition-colors">
                    Satu Tangan
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-semibold tracking-wider text-indigo-400 bg-indigo-950/70 border border-indigo-800/50 px-1.5 sm:px-2 py-0.5 rounded">
                    v2.5
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block truncate max-w-[200px] lg:max-w-xs">
                  Kemudahan Tugas Pendidik
                </p>
              </div>
            </div>
          </div>

          {/* Zone 1.5: Desktop Direct Module Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/90 shadow-inner">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => setActiveTab('absen-sidik-jari')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'absen-sidik-jari'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Sidik Jari
            </button>
            <button
              onClick={() => setActiveTab('absensi-guru')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'absensi-guru'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Presensi Guru
            </button>
            <button
              onClick={() => setActiveTab('absensi-siswa')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'absensi-siswa'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Presensi Siswa
            </button>
            <button
              onClick={() => setActiveTab('db-guru')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'db-guru'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Database Guru
            </button>
            <button
              onClick={() => setActiveTab('db-siswa')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'db-siswa'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Database Siswa
            </button>
            <button
              onClick={() => setActiveTab('cetak-raport')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'cetak-raport'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400/50'
                  : 'text-rose-300 hover:text-white hover:bg-rose-950/50 border border-rose-800/40 bg-rose-950/20'
              }`}
              title="Database Raport Siswa (Semua Tahun & Buat Raport Baru)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-rose-300" />
              <span>Database Raport</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            </button>
          </nav>

          {/* Zone 2: Architecture Inspector, School Profile & Operator Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Sync Status Badge (Firebase / Cloud Real-time) */}
            <SyncStatusBadge />

            {/* PWA Install Button for Mobile / Android / Desktop (hidden if already installed) */}
            {!isInstalled && (
              <button
                onClick={() => setIsNewDeviceModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/60 rounded-xl transition-all shadow-md shadow-emerald-950/50 active:scale-95 cursor-pointer"
                title="Pasang Aplikasi Satu Tangan di Android"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-bounce" />
                <span className="text-[11px] font-medium hidden sm:inline">Pasang di Android</span>
                <span className="text-[10px] font-bold sm:hidden">Pasang</span>
              </button>
            )}

            {/* Tombol Profil Sekolah (Pengaturan Kop Surat & Info Lembaga) */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-semibold text-indigo-200 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 rounded-xl transition-all shadow-sm group cursor-pointer"
              title="Pengaturan Profil Sekolah, Logo Kop Surat, Password & Backup"
            >
              <School className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Profil Sekolah</span>
            </button>

            <button
              onClick={onOpenArchitecture}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
              title="Lihat Struktur Folder, Skema Routing & Skema Database"
            >
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              <span>Arsitektur</span>
            </button>

            {operator && (
              <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 sm:pl-2 border-l border-slate-800">
                {operator.avatarUrl ? (
                  <img
                    src={operator.avatarUrl}
                    alt={operator.name || 'Operator'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-indigo-400/40 object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-inner">
                    {(operator.name || 'OP').slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="hidden 2xl:block text-left">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 truncate max-w-[140px]">
                    <span>{operator.name}</span>
                    {operator.authProvider === 'github' && (
                      <Github className="w-3 h-3 text-slate-400 inline" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {operator.schoolName}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                  title="Keluar dari Akun Operator"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Android Installation Modal Guide */}
      <AndroidInstallModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onNativeInstall={promptInstall}
        isInstallable={isInstallable}
      />
    </>
  );
};
