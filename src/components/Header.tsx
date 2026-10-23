import React from 'react';
import { useApp, ActiveModule } from '../context/AppContext';
import { 
  GraduationCap, 
  LogOut, 
  FileCode2, 
  Database,
  CalendarCheck2,
  Users,
  FileSpreadsheet,
  Boxes,
  Github,
  Fingerprint
} from 'lucide-react';

interface HeaderProps {
  onOpenArchitecture: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenArchitecture }) => {
  const { operator, logout, activeTab, setActiveTab, setIsSettingsOpen } = useApp();

  const navItems: { id: ActiveModule; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Boxes className="w-4 h-4" /> },
    { id: 'absen-sidik-jari', label: 'Sidik Jari', icon: <Fingerprint className="w-4 h-4 text-emerald-400" /> },
    { id: 'absensi-guru', label: 'Presensi Guru', icon: <CalendarCheck2 className="w-4 h-4" /> },
    { id: 'absensi-siswa', label: 'Presensi Siswa', icon: <CalendarCheck2 className="w-4 h-4" /> },
    { id: 'db-guru', label: 'Data Guru', icon: <Users className="w-4 h-4" /> },
    { id: 'db-siswa', label: 'Data Siswa', icon: <Database className="w-4 h-4" /> },
    { id: 'cetak-raport', label: 'Raport PDF', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'modul-dinamis', label: 'Lain-lain', icon: <Boxes className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark & Brand & Settings Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo with "Profil" underneath as requested by user */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center group cursor-pointer text-left focus:outline-none"
            title="Klik Logo untuk Pengaturan Aplikasi & Profil Sekolah"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1px] shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-200">
              <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center relative">
                <GraduationCap className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform duration-200" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
              </div>
            </div>
            {/* Word "Profil" written right under the logo */}
            <span className="text-[10px] font-bold tracking-wider text-indigo-300 uppercase mt-0.5 group-hover:text-amber-300 transition-colors">
              Profil
            </span>
          </button>

          <div 
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer group select-none"
            title="Kembali ke Dashboard Utama"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans group-hover:text-indigo-200 transition-colors">
                Satu Tangan
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 bg-indigo-950/70 border border-indigo-800/50 px-2 py-0.5 rounded">
                v2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-[200px] lg:max-w-xs">
              Aplikasi Operator Pendidikan
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single Line) */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Architecture Inspector & Operator Profile Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenArchitecture}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            title="Lihat Struktur Folder, Skema Routing & Skema Database"
          >
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            <span>Skema Arsitektur</span>
          </button>

          {operator && (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              {operator.avatarUrl ? (
                <img
                  src={operator.avatarUrl}
                  alt={operator.name}
                  className="w-8 h-8 rounded-full border border-indigo-400/40 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                  {operator.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="hidden lg:block text-left">
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
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                title="Keluar dari Akun Operator"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
