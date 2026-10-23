import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { 
  Fingerprint, 
  Calendar, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Check, 
  Sparkles, 
  ArrowLeft,
  Users,
  GraduationCap,
  Cpu,
  ShieldCheck,
  RefreshCw,
  Radio,
  Zap
} from 'lucide-react';
import { TODAY_STR } from '../../data/initialData';
import confetti from 'canvas-confetti';

export const FingerprintAttendanceModule: React.FC = () => {
  const { 
    teachers, 
    students, 
    teacherAttendance, 
    studentAttendance, 
    markTeacherAttendance, 
    markStudentAttendance,
    recordFingerprintAttendance,
    setActiveTab 
  } = useApp();

  const [activeRole, setActiveRole] = useState<'guru' | 'siswa'>('guru');
  const [selectedDate, setSelectedDate] = useState(TODAY_STR);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Biometric Terminal Scanner Simulator State
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanCandidateId, setActiveScanCandidateId] = useState<string>('');
  const [verificationFeedback, setVerificationFeedback] = useState<{
    name: string;
    identifier: string;
    time: string;
    role: string;
  } | null>(null);

  // Audio synthesizer for pleasant scanner chime
  const playBeep = (success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (success) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch {
      // AudioContext may be restricted before interaction
    }
  };

  const availableClasses = Array.from(new Set(students.map(s => s.className))).sort();

  // Teacher Attendance Map for selected Date
  const teacherAttMap = new Map(
    teacherAttendance.filter(a => a.date === selectedDate).map(a => [a.teacherId, a])
  );

  // Student Attendance Map for selected Date
  const studentAttMap = new Map(
    studentAttendance.filter(a => a.date === selectedDate).map(a => [a.studentId, a])
  );

  // Filtered lists
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students
    .filter(s => (selectedClass === 'ALL' ? true : s.className === selectedClass))
    .filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Calculate stats matching the exact checkpoint 1 detail
  const currentTeachers = teachers;
  const teacherStats = {
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpa: 0,
    belum: 0
  };
  currentTeachers.forEach(t => {
    const att = teacherAttMap.get(t.id);
    if (!att) teacherStats.belum++;
    else if (att.status === 'HADIR') teacherStats.hadir++;
    else if (att.status === 'IZIN') teacherStats.izin++;
    else if (att.status === 'SAKIT') teacherStats.sakit++;
    else if (att.status === 'ALPA') teacherStats.alpa++;
  });

  const currentClassStudents = selectedClass === 'ALL' ? students : students.filter(s => s.className === selectedClass);
  const studentStats = {
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpa: 0,
    belum: 0
  };
  currentClassStudents.forEach(s => {
    const att = studentAttMap.get(s.id);
    if (!att) studentStats.belum++;
    else if (att.status === 'HADIR') studentStats.hadir++;
    else if (att.status === 'IZIN') studentStats.izin++;
    else if (att.status === 'SAKIT') studentStats.sakit++;
    else if (att.status === 'ALPA') studentStats.alpa++;
  });

  const activeStats = activeRole === 'guru' ? teacherStats : studentStats;
  const activeTotal = activeRole === 'guru' ? teachers.length : currentClassStudents.length;

  // Trigger Biometric Scan for a target
  const triggerFingerprintScan = (type: 'guru' | 'siswa', id: string) => {
    setIsScanning(true);
    setActiveScanCandidateId(id);

    setTimeout(() => {
      const res = recordFingerprintAttendance({
        targetType: type,
        targetId: id,
        date: selectedDate,
        deviceId: 'BIO-SCANNER-01'
      });

      setIsScanning(false);
      playBeep(true);
      setVerificationFeedback({
        name: res.personName,
        identifier: res.identifier + (res.className ? ` • ${res.className}` : ''),
        time: res.checkInTime,
        role: type === 'guru' ? 'Tenaga Pendidik / Guru' : 'Peserta Didik / Siswa'
      });

      try {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.75 } });
      } catch {
        // ignore
      }

      setTimeout(() => {
        setVerificationFeedback(null);
      }, 4000);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Fingerprint className="w-6 h-6 text-emerald-400" />
              <span>Aplikasi Presensi Sidik Jari (Biometrik)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Presensi otomatis guru dan siswa terintegrasi langsung dengan sensor pemindai sidik jari & database sekolah.
            </p>
          </div>
        </div>

        {/* Date Filter & Terminal Status */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setSelectedDate(TODAY_STR)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors whitespace-nowrap"
          >
            Hari Ini
          </button>
        </div>
      </div>

      {/* Terminal Hardware Simulator Box (3D Neumorphic Pad) */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 border border-emerald-500/30 shadow-2xl backdrop-blur-xl">
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            {/* 3D Fingerprint Scanner Touch Sensor Pad */}
            <div 
              onClick={() => {
                const target = activeRole === 'guru' ? filteredTeachers[0] : filteredStudents[0];
                if (target) {
                  triggerFingerprintScan(activeRole, target.id);
                }
              }}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-0.5 cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 group ${
                isScanning 
                  ? 'bg-gradient-to-b from-emerald-400 via-teal-300 to-green-500 shadow-[0_0_35px_rgba(16,185,129,0.7)] ring-2 ring-emerald-300'
                  : 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 shadow-lg shadow-black/50 hover:shadow-emerald-500/20'
              }`}
            >
              <div className="w-full h-full rounded-[14px] bg-slate-950/90 flex flex-col items-center justify-center p-2 relative overflow-hidden">
                {/* Laser scan line animation */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-[1px] animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_12px_#10b981]" />
                )}

                <Fingerprint className={`w-10 h-10 transition-colors duration-300 ${
                  isScanning ? 'text-emerald-300 scale-110 animate-pulse' : 'text-emerald-400 group-hover:text-emerald-300'
                }`} />

                <span className="text-[9px] font-bold tracking-wider uppercase text-emerald-400/90 mt-1">
                  {isScanning ? 'Scanning...' : 'Sentuh Scan'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Mesin Bio-Scanner Terhubung</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">ID: BIO-SCANNER-01</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                Sensor Sidik Jari Optik Digital Terintegrasi
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-lg leading-relaxed">
                Ketuk tombol <strong>&ldquo;Scan Sidik Jari&rdquo;</strong> pada baris nama guru atau siswa di tabel bawah untuk melakukan identifikasi biometrik instan.
              </p>
            </div>
          </div>

          {/* Real-time Verification Feedback Card */}
          {verificationFeedback ? (
            <div className="w-full md:w-auto p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400/80 shadow-xl animate-fadeIn flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold shrink-0">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Presensi Terverifikasi Biometrik
                </div>
                <div className="text-sm font-extrabold text-white">{verificationFeedback.name}</div>
                <div className="text-[11px] text-emerald-200 font-mono mt-0.5 flex items-center gap-2">
                  <span>{verificationFeedback.identifier}</span>
                  <span>&bull;</span>
                  <span className="font-bold">{verificationFeedback.time} WIB</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-end text-right text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Validasi SHA-256 Biometrik</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">Sinkronisasi Realtime dengan Database</div>
            </div>
          )}
        </div>
      </div>

      {/* Role Switcher: Guru vs Siswa */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
          <button
            onClick={() => setActiveRole('guru')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeRole === 'guru'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Presensi Sidik Jari Guru ({teachers.length})</span>
          </button>

          <button
            onClick={() => setActiveRole('siswa')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeRole === 'siswa'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Presensi Sidik Jari Siswa ({students.length})</span>
          </button>
        </div>

        {/* If Siswa mode: Class Selector */}
        {activeRole === 'siswa' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedClass('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedClass === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Semua Kelas
            </button>
            {availableClasses.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  selectedClass === cls
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Kelas {cls}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPI Counters Bar identical to previous checkpoint */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">
            Total {activeRole === 'guru' ? 'Tenaga Guru' : 'Siswa'}
          </span>
          <p className="text-xl font-bold text-white tabular-data mt-0.5">{activeTotal}</p>
          <span className="text-[10px] text-slate-500">
            {activeRole === 'guru' ? 'Pendidik Terdaftar' : (selectedClass === 'ALL' ? 'Semua Kelas' : `Kelas ${selectedClass}`)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40">
          <span className="text-[11px] font-medium text-emerald-300">Hadir Sidik Jari</span>
          <p className="text-xl font-bold text-emerald-400 tabular-data mt-0.5">{activeStats.hadir}</p>
          <span className="text-[10px] text-emerald-500">
            {activeTotal > 0 ? Math.round((activeStats.hadir / activeTotal) * 100) : 0}% Tingkat Kehadiran
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/40">
          <span className="text-[11px] font-medium text-amber-300">Izin</span>
          <p className="text-xl font-bold text-amber-400 tabular-data mt-0.5">{activeStats.izin}</p>
          <span className="text-[10px] text-amber-500">Surat Izin Resmi</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40">
          <span className="text-[11px] font-medium text-purple-300">Sakit</span>
          <p className="text-xl font-bold text-purple-400 tabular-data mt-0.5">{activeStats.sakit}</p>
          <span className="text-[10px] text-purple-400">Keterangan Dokter</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/40">
          <span className="text-[11px] font-medium text-rose-300">Alpa / Belum Scan</span>
          <p className="text-xl font-bold text-rose-400 tabular-data mt-0.5">{activeStats.alpa + activeStats.belum}</p>
          <span className="text-[10px] text-rose-400">{activeStats.alpa} Tanpa Berita</span>
        </div>
      </div>

      {/* Search Bar & Fast Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={activeRole === 'guru' ? 'Cari guru berdasarkan Nama, NIP, atau Mapel...' : 'Cari siswa berdasarkan Nama atau NISN...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeRole === 'guru') {
                teachers.forEach(t => triggerFingerprintScan('guru', t.id));
              } else {
                const targetStudents = selectedClass === 'ALL' ? students : students.filter(s => s.className === selectedClass);
                targetStudents.forEach(s => triggerFingerprintScan('siswa', s.id));
              }
            }}
            className="py-2 px-3.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 whitespace-nowrap active:translate-y-0.5"
          >
            <Zap className="w-4 h-4" />
            <span>Scan Massal Semua {activeRole === 'guru' ? 'Guru' : 'Siswa'}</span>
          </button>
        </div>
      </div>

      {/* Detailed Biometric Attendance Table (Exact Structure of Checkpoint 1) */}
      <div className="overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama & Identitas Resmi</th>
                <th className="py-3 px-4">{activeRole === 'guru' ? 'Mapel & Status' : 'NISN & Rombel'}</th>
                <th className="py-3 px-4 text-center">Status Kehadiran ({selectedDate})</th>
                <th className="py-3 px-4">Waktu Presensi & Sensor</th>
                <th className="py-3 px-4 text-right">Aksi Sidik Jari</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeRole === 'guru' ? (
                filteredTeachers.map((teacher) => {
                  const att = teacherAttMap.get(teacher.id);
                  const isPresent = att?.status === 'HADIR';
                  const isThisScanning = isScanning && activeScanCandidateId === teacher.id;

                  return (
                    <tr key={teacher.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & NIP */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{teacher.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          NIP: {teacher.nip}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{teacher.subject}</div>
                        <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                          Status: {teacher.employmentStatus}
                        </div>
                      </td>

                      {/* 3D Segmented Attendance Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-950/90 rounded-xl border border-slate-800/80 w-fit mx-auto shadow-inner">
                          <button
                            type="button"
                            onClick={() => markTeacherAttendance(teacher.id, selectedDate, 'HADIR')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                              att?.status === 'HADIR'
                                ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>Hadir</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => markTeacherAttendance(teacher.id, selectedDate, 'IZIN')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                              att?.status === 'IZIN'
                                ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 ring-1 ring-amber-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>Izin</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => markTeacherAttendance(teacher.id, selectedDate, 'SAKIT')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                              att?.status === 'SAKIT'
                                ? 'bg-gradient-to-b from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/30 ring-1 ring-purple-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>Sakit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => markTeacherAttendance(teacher.id, selectedDate, 'ALPA')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                              att?.status === 'ALPA'
                                ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/30 ring-1 ring-rose-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Alpa</span>
                          </button>
                        </div>
                      </td>

                      {/* Time & Biometric Device Info */}
                      <td className="py-3.5 px-4">
                        {att?.checkInTime ? (
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                              <Clock className="w-3 h-3" /> {att.checkInTime} WIB
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Fingerprint className="w-3 h-3 text-emerald-400 inline" />
                              <span>Bio-Scanner #1</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Belum Presensi</span>
                        )}
                        <div className="text-[11px] text-slate-400 italic mt-0.5 truncate max-w-xs">
                          {att?.notes || '-'}
                        </div>
                      </td>

                      {/* Fingerprint Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isThisScanning}
                          onClick={() => triggerFingerprintScan('guru', teacher.id)}
                          className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ml-auto ${
                            isPresent
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 active:scale-95'
                          }`}
                        >
                          <Fingerprint className={`w-4 h-4 ${isThisScanning ? 'animate-spin' : ''}`} />
                          <span>{isPresent ? 'Scan Ulang' : 'Scan Sidik Jari'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                filteredStudents.map((student) => {
                  const att = studentAttMap.get(student.id);
                  const isPresent = att?.status === 'HADIR';
                  const isThisScanning = isScanning && activeScanCandidateId === student.id;

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{student.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {student.gender} &bull; Wali: {student.parentName}
                        </div>
                      </td>

                      {/* NISN & Class */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-emerald-300 font-semibold">{student.nisn}</div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 mt-1">
                          Kelas {student.className}
                        </span>
                      </td>

                      {/* 3D Segmented Attendance Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-950/90 rounded-xl border border-slate-800/80 w-fit mx-auto shadow-inner">
                          <button
                            type="button"
                            onClick={() => markStudentAttendance(student.id, selectedDate, 'HADIR')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                              att?.status === 'HADIR'
                                ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>Hadir</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => markStudentAttendance(student.id, selectedDate, 'IZIN')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                              att?.status === 'IZIN'
                                ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 ring-1 ring-amber-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>Izin</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => markStudentAttendance(student.id, selectedDate, 'SAKIT')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                              att?.status === 'SAKIT'
                                ? 'bg-gradient-to-b from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/30 ring-1 ring-purple-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>Sakit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => markStudentAttendance(student.id, selectedDate, 'ALPA')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                              att?.status === 'ALPA'
                                ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/30 ring-1 ring-rose-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Alpa</span>
                          </button>
                        </div>
                      </td>

                      {/* Time & Biometric Device Info */}
                      <td className="py-3.5 px-4">
                        {att?.checkInTime ? (
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                              <Clock className="w-3 h-3" /> {att.checkInTime} WIB
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Fingerprint className="w-3 h-3 text-emerald-400 inline" />
                              <span>Bio-Scanner #1</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Belum Presensi</span>
                        )}
                        <div className="text-[11px] text-slate-400 italic mt-0.5 truncate max-w-xs">
                          {att?.notes || '-'}
                        </div>
                      </td>

                      {/* Fingerprint Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isThisScanning}
                          onClick={() => triggerFingerprintScan('siswa', student.id)}
                          className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ml-auto ${
                            isPresent
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 active:scale-95'
                          }`}
                        >
                          <Fingerprint className={`w-4 h-4 ${isThisScanning ? 'animate-spin' : ''}`} />
                          <span>{isPresent ? 'Scan Ulang' : 'Scan Sidik Jari'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
