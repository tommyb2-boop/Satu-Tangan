import React from 'react';
import { useApp, ActiveModule } from '../context/AppContext';
import { 
  Users, 
  CalendarCheck2, 
  GraduationCap, 
  FileSpreadsheet, 
  Boxes, 
  Database,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  School,
  CheckCircle2,
  Fingerprint,
  FileCode2,
  Zap
} from 'lucide-react';
import { TODAY_STR } from '../data/initialData';

interface Dashboard3DProps {
  onOpenArchitecture?: () => void;
}

export const Dashboard3D: React.FC<Dashboard3DProps> = ({ onOpenArchitecture }) => {
  const { 
    teachers, 
    students, 
    teacherAttendance, 
    studentAttendance, 
    dynamicEntities, 
    dynamicRecords,
    setActiveTab,
    operator,
    schoolProfile,
    setIsSettingsOpen
  } = useApp();

  // Metrics calculations
  const todayTeachersAtt = teacherAttendance.filter(a => a.date === TODAY_STR);
  const teacherPresent = todayTeachersAtt.filter(a => a.status === 'HADIR').length;
  const teacherPercent = teachers.length > 0 ? Math.round((teacherPresent / teachers.length) * 100) : 0;

  const todayStudentsAtt = studentAttendance.filter(a => a.date === TODAY_STR);
  const studentPresent = todayStudentsAtt.filter(a => a.status === 'HADIR').length;
  const studentPercent = students.length > 0 ? Math.round((studentPresent / students.length) * 100) : 0;

  // The 8 Cards: Arranged for 2 icons per row on mobile phones (grid-cols-2)!
  const menuCards: {
    id: ActiveModule | 'arsitektur';
    title: string;
    subtitle: string;
    description: string;
    statValue: string;
    statLabel: string;
    bgGradient: string;
    cardBorder: string;
    glowColor: string;
    iconBg: string;
    icon: React.ReactNode;
    tag: string;
    isHighlighted?: boolean;
  }[] = [
    {
      id: 'absen-sidik-jari',
      title: 'Absen Sidik Jari',
      subtitle: 'Presensi Biometrik',
      description: 'Presensi otomatis sidik jari guru dan siswa dari database dengan sensor optik digital realtime.',
      statValue: 'Sensor Aktif',
      statLabel: 'Validasi SHA-256 Biometrik',
      bgGradient: 'from-emerald-600/30 via-teal-900/40 to-slate-900/95',
      cardBorder: 'border-emerald-500/40 hover:border-emerald-400',
      glowColor: 'group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.35)]',
      iconBg: 'bg-gradient-to-tr from-emerald-500 to-green-400 text-slate-950 shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-300/40',
      icon: <Fingerprint className="w-6 h-6 sm:w-7 sm:h-7 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />,
      tag: 'Biometrik Baru',
      isHighlighted: true
    },
    {
      id: 'absensi-guru',
      title: 'Absensi Guru',
      subtitle: 'Presensi Pendidik',
      description: 'Pencatatan presensi guru harian (Hadir, Izin, Sakit, Alpa) dengan filter tanggal kalender.',
      statValue: `${teacherPresent}/${teachers.length} Guru`,
      statLabel: 'Hadir hari ini (' + teacherPercent + '%)',
      bgGradient: 'from-blue-600/25 via-indigo-900/40 to-slate-900/95',
      cardBorder: 'border-blue-500/30 hover:border-blue-400',
      glowColor: 'group-hover:shadow-[0_20px_50px_rgba(59,130,246,0.3)]',
      iconBg: 'bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/40',
      icon: <CalendarCheck2 className="w-6 h-6 sm:w-7 sm:h-7 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />,
      tag: 'Presensi Guru'
    },
    {
      id: 'absensi-siswa',
      title: 'Absensi Siswa',
      subtitle: 'Presensi Kelas',
      description: 'Rekapitulasi kehadiran siswa per rombel/kelas, aksi cepat tandai hadir, dan persentase kehadiran.',
      statValue: `${studentPresent}/${students.length} Siswa`,
      statLabel: 'Tercatat hari ini',
      bgGradient: 'from-teal-600/25 via-teal-900/40 to-slate-900/95',
      cardBorder: 'border-teal-500/30 hover:border-teal-400',
      glowColor: 'group-hover:shadow-[0_20px_50px_rgba(20,184,166,0.3)]',
      iconBg: 'bg-gradient-to-tr from-teal-500 to-emerald-300 text-slate-950 shadow-lg shadow-teal-500/40',
      icon: <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300" />,
      tag: 'Presensi Kelas'
    },
    {
      id: 'db-guru',
      title: 'Database Guru',
      subtitle: 'Master Pendidik',
      description: 'CRUD lengkap biodata pendidik, NIP, mata pelajaran yang diampu, dan status kepegawaian.',
      statValue: `${teachers.length} Pendidik`,
      statLabel: 'Aktif mengajar',
      bgGradient: 'from-amber-600/25 via-orange-900/40 to-slate-900/95',
      cardBorder: 'border-amber-500/30 hover:border-amber-400',
      glowColor: 'group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.3)]',
      iconBg: 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/40',
      icon: <Users className="w-6 h-6 sm:w-7 sm:h-7 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />,
      tag: 'Master Guru'
    },
    {
      id: 'db-siswa',
      title: 'Database Siswa',
      subtitle: 'Buku Induk Siswa',
      description: 'CRUD master data peserta didik, NISN, NIK, penempatan rombel kelas, dan kontak orang tua.',
      statValue: `${students.length} Siswa`,
      statLabel: 'Terdaftar aktif',
      bgGradient: 'from-purple-600/25 via-fuchsia-900/40 to-slate-900/95',
      cardBorder: 'border-purple-500/30 hover:border-purple-400',
      glowColor: 'group-hover:shadow-[0_20px_50px_rgba(168,85,247,0.3)]',
      iconBg: 'bg-gradient-to-tr from-purple-500 to-pink-400 text-white shadow-lg shadow-purple-500/40',
      icon: <Database className="w-6 h-6 sm:w-7 sm:h-7 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300" />,
      tag: 'Master Siswa'
    },
    {
      id: 'cetak-raport',
      title: 'Cetak Raport',
      subtitle: 'Penilaian & PDF',
      description: 'Input nilai mata pelajaran, KKM, penilaian sikap, dan cetak dokumen Raport resmi format PDF.',
      statValue: 'Siap Cetak',
      statLabel: 'Format PDF & Print',
      bgGradient: 'from-rose-600/25 via-red-900/40 to-slate-900/95',
      cardBorder: 'border-rose-500/30 hover:border-rose-400',
      glowColor: 'group-hover:shadow-[0_20px_50px_rgba(244,63,94,0.3)]',
      iconBg: 'bg-gradient-to-tr from-rose-500 to-red-400 text-white shadow-lg shadow-rose-500/40',
      icon: <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />,
      tag: 'Raport PDF'
    },
    {
      id: 'modul-dinamis',
      title: 'Modul Dinamis',
      subtitle: 'Entitas Khusus',
      description: 'Pembuat kegiatan khusus (Pramuka, Tabungan Siswa) yang tersinkronisasi otomatis dengan Database Siswa.',
      statValue: `${dynamicEntities.length} Entitas`,
      statLabel: `${dynamicRecords.length} transaksi siswa`,
      bgGradient: 'from-cyan-600/25 via-sky-900/40 to-slate-900/95',
      cardBorder: 'border-cyan-500/30 hover:border-cyan-400',
      glowColor: 'group-hover:shadow-[0_20px_50px_rgba(6,182,212,0.3)]',
      iconBg: 'bg-gradient-to-tr from-cyan-500 to-sky-300 text-slate-950 shadow-lg shadow-cyan-500/40',
      icon: <Boxes className="w-6 h-6 sm:w-7 sm:h-7 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300" />,
      tag: 'Relasi Siswa'
    },
    {
      id: 'arsitektur',
      title: 'Skema Arsitektur',
      subtitle: 'Relasi Database',
      description: 'Dokumentasi teknis struktur direktori proyek, routing guard, serta skema DDL relasional foreign key.',
      statValue: 'Spesifikasi DB',
      statLabel: 'Normalisasi Relasi',
      bgGradient: 'from-indigo-600/25 via-violet-900/40 to-slate-900/95',
      cardBorder: 'border-indigo-500/30 hover:border-indigo-400',
      glowColor: 'group-hover:shadow-[0_20px_50px_rgba(99,102,241,0.3)]',
      iconBg: 'bg-gradient-to-tr from-indigo-500 to-violet-400 text-white shadow-lg shadow-indigo-500/40',
      icon: <FileCode2 className="w-6 h-6 sm:w-7 sm:h-7 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />,
      tag: 'Arsitektur'
    }
  ];

  const handleCardClick = (id: ActiveModule | 'arsitektur') => {
    if (id === 'arsitektur') {
      if (onOpenArchitecture) onOpenArchitecture();
    } else {
      setActiveTab(id);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner with 3D Depth Glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-slate-700/60 shadow-xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4 max-w-2xl">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="hidden sm:flex items-center justify-center shrink-0 w-16 h-16 rounded-2xl bg-slate-900/90 border border-indigo-500/30 p-1.5 shadow-lg shadow-indigo-950/60 overflow-hidden group hover:scale-105 transition-transform cursor-pointer"
              title="Klik untuk mengubah Logo & Profil Sekolah"
            >
              {schoolProfile?.logoUrl ? (
                <img 
                  src={schoolProfile.logoUrl} 
                  alt="Logo Sekolah" 
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <School className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300" />
              )}
            </button>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-indigo-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer group"
                title="Klik untuk mengubah Profil Sekolah & Pengaturan"
              >
                <School className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>{schoolProfile?.schoolName || operator?.schoolName || 'SMP Negeri 1 Cendekia Mandiri'}</span>
                <span className="text-[9px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded font-normal">Pengaturan Profil</span>
              </button>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Selamat Bertugas, {operator?.name || 'Operator Pendidikan'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Semua kebutuhan pengajar dalam mengolah data siswa, absensi sidik jari, cetak raport, dan entitas kegiatan terpadu dalam satu aplikasi.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('absen-sidik-jari')}
              className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-300 hover:to-green-300 shadow-md shadow-emerald-500/25 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Buka Absen Sidik Jari</span>
            </button>

            <button
              onClick={() => setActiveTab('cetak-raport')}
              className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-rose-400" />
              <span>Cetak Raport</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-6 pt-5 border-t border-slate-800/80 text-left">
          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">Total Tenaga Guru</p>
            <p className="text-base sm:text-xl font-bold text-white tabular-data mt-0.5">{teachers.length} Guru</p>
            <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 inline" /> Aktif
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">Total Peserta Didik</p>
            <p className="text-base sm:text-xl font-bold text-white tabular-data mt-0.5">{students.length} Siswa</p>
            <p className="text-[10px] text-indigo-400 mt-0.5">Semua Rombel</p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">Kehadiran Guru</p>
            <p className="text-base sm:text-xl font-bold text-white tabular-data mt-0.5">{teacherPercent}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{teacherPresent} hadir</p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">Biometrik & Dinamis</p>
            <p className="text-base sm:text-xl font-bold text-emerald-400 tabular-data mt-0.5">Aktif</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Sensor Terhubung</p>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Menu Utama Operator (1 Baris = 2 Ikon di HP)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Tanggal: <strong className="text-white">{TODAY_STR}</strong>
          </span>
        </div>

        {/* 
          CRITICAL REQUIREMENT: 
          "tampilan agar lebih simple dengan icon-icon 1 baris di layar hp hanya ada 2 icon, pasti kelihatan lebih elegan menarik dan mudah."
          -> grid-cols-2 on mobile! 
          -> md:grid-cols-3 lg:grid-cols-4 on larger viewports!
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {menuCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`group relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 cursor-pointer bg-gradient-to-br ${card.bgGradient} border ${card.cardBorder} shadow-lg transition-all duration-300 card-3d ${card.glowColor} flex flex-col justify-between text-left ${
                card.isHighlighted ? 'ring-1 ring-emerald-400/50' : ''
              }`}
            >
              <div>
                {/* 3D Isometric Icon & Tag in 1 compact row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl ${card.iconBg} p-2.5 flex items-center justify-center transform group-hover:-translate-y-1 transition-transform duration-300`}>
                    {card.icon}
                  </div>

                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 bg-slate-950/80 border border-slate-700/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {card.tag}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-white flex items-center justify-between">
                  <span className="truncate">{card.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1" />
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-emerald-300/90 mt-0.5 truncate">
                  {card.subtitle}
                </p>

                {/* Description (visible on larger screens or compact 1-line on mobile) */}
                <p className="text-[11px] text-slate-300/80 mt-2 line-clamp-2 hidden sm:block leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Bottom Quick Indicator Strip */}
              <div className="mt-3.5 sm:mt-5 pt-2.5 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="truncate pr-1">
                  <div className="text-[11px] sm:text-xs font-bold text-white tabular-data truncate">
                    {card.statValue}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">
                    {card.statLabel}
                  </div>
                </div>

                <span className="text-[10px] sm:text-xs font-semibold text-emerald-400 group-hover:underline shrink-0 flex items-center gap-0.5">
                  Buka
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Biometric Integration Highlight */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Presensi Sidik Jari Terhubung Otomatis</h4>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Presensi sidik jari langsung menyinkronkan data kehadiran guru dan siswa tanpa input ganda.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('absen-sidik-jari')}
          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors whitespace-nowrap text-center font-bold"
        >
          Mulai Presensi Biometrik
        </button>
      </div>
    </div>
  );
};
