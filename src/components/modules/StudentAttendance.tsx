import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { 
  CheckCircle2, 
  Calendar, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  ArrowLeft, 
  Fingerprint, 
  Sparkles, 
  CheckCheck,
  Filter,
  GraduationCap
} from 'lucide-react';
import { TODAY_STR } from '../../data/initialData';

export const StudentAttendanceModule: React.FC = () => {
  const { 
    students, 
    studentAttendance, 
    markStudentAttendance, 
    bulkMarkStudents, 
    setActiveTab 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(TODAY_STR);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const availableClasses = Array.from(new Set(students.map(s => s.className))).sort();

  // Attendance lookup for selected date
  const attMap = new Map(
    studentAttendance.filter(a => a.date === selectedDate).map(a => [a.studentId, a])
  );

  // Filtered by class first for statistics
  const classStudents = selectedClass === 'ALL'
    ? students
    : students.filter(s => s.className === selectedClass);

  // Statistics for the filtered scope
  const scopedAttRecords = studentAttendance.filter(a => 
    a.date === selectedDate && (selectedClass === 'ALL' || a.className === selectedClass)
  );

  const hadirCount = scopedAttRecords.filter(a => a.status === 'HADIR').length;
  const izinCount = scopedAttRecords.filter(a => a.status === 'IZIN').length;
  const sakitCount = scopedAttRecords.filter(a => a.status === 'SAKIT').length;
  const alpaCount = scopedAttRecords.filter(a => a.status === 'ALPA').length;
  const percentage = classStudents.length > 0 ? Math.round((hadirCount / classStudents.length) * 100) : 0;

  // Filtered list for the table
  const displayedStudents = classStudents.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterStatus !== 'ALL') {
      const att = attMap.get(s.id);
      if (filterStatus === 'UNRECORDED') return !att;
      return att?.status === filterStatus;
    }

    return true;
  });

  const handleMark = (studentId: string, status: AttendanceStatus) => {
    markStudentAttendance(studentId, selectedDate, status);
  };

  const handleBulkClassPresent = () => {
    const targetClass = selectedClass === 'ALL' ? 'Semua Kelas' : `Kelas ${selectedClass}`;
    if (window.confirm(`Tandai semua siswa (${classStudents.length} siswa di ${targetClass}) sebagai HADIR pada tanggal ${selectedDate}?`)) {
      if (selectedClass === 'ALL') {
        availableClasses.forEach(cls => bulkMarkStudents(cls, selectedDate, 'HADIR'));
      } else {
        bulkMarkStudents(selectedClass, selectedDate, 'HADIR');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Presensi Siswa</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Pencatatan dan rekapitulasi presensi harian siswa per rombel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('absen-sidik-jari')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors flex items-center gap-2"
          >
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            <span>Mode Biometrik Sidik Jari</span>
          </button>

          <button
            onClick={handleBulkClassPresent}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30 transition-all flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Tandai Hadir ({selectedClass === 'ALL' ? 'Semua' : selectedClass})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Total Siswa ({selectedClass})</p>
          <p className="text-xl font-bold text-white mt-1">{classStudents.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Siswa Terdaftar</p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
          <p className="text-[11px] font-medium text-emerald-400">Hadir</p>
          <p className="text-xl font-bold text-emerald-300 mt-1">{hadirCount}</p>
          <p className="text-[10px] text-emerald-500/80 mt-0.5">{percentage}% Kehadiran</p>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40">
          <p className="text-[11px] font-medium text-blue-400">Izin</p>
          <p className="text-xl font-bold text-blue-300 mt-1">{izinCount}</p>
          <p className="text-[10px] text-blue-500/80 mt-0.5">Surat Izin Orang Tua</p>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40">
          <p className="text-[11px] font-medium text-amber-400">Sakit</p>
          <p className="text-xl font-bold text-amber-300 mt-1">{sakitCount}</p>
          <p className="text-[10px] text-amber-500/80 mt-0.5">Keterangan Sakit</p>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40">
          <p className="text-[11px] font-medium text-rose-400">Alpa</p>
          <p className="text-xl font-bold text-rose-300 mt-1">{alpaCount}</p>
          <p className="text-[10px] text-rose-500/80 mt-0.5">Tanpa Keterangan</p>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40">
          <p className="text-[11px] font-medium text-indigo-400">Belum Presensi</p>
          <p className="text-xl font-bold text-indigo-300 mt-1">
            {Math.max(0, classStudents.length - (hadirCount + izinCount + sakitCount + alpaCount))}
          </p>
          <p className="text-[10px] text-indigo-500/80 mt-0.5">Menunggu Konfirmasi</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-white font-medium text-xs py-1 focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">Semua Rombel</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls} className="bg-slate-900">Kelas {cls}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-slate-300 text-xs py-1 focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">Semua Status</option>
              <option value="HADIR" className="bg-slate-900">Hadir</option>
              <option value="IZIN" className="bg-slate-900">Izin</option>
              <option value="SAKIT" className="bg-slate-900">Sakit</option>
              <option value="ALPA" className="bg-slate-900">Alpa</option>
              <option value="UNRECORDED" className="bg-slate-900">Belum Presensi</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama siswa, NISN, atau kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* Students Attendance Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nama Siswa / NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Status & Waktu Presensi</th>
                <th className="py-3 px-4 text-center">Aksi Cepat Presensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data siswa yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                displayedStudents.map((student) => {
                  const att = attMap.get(student.id);
                  const currentStatus = att?.status;

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{student.name}</p>
                            <p className="text-[11px] text-slate-500">
                              NISN: {student.nisn} &bull; <span className="text-slate-400">{student.gender}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md font-semibold text-xs bg-slate-800 text-teal-300 border border-slate-700">
                          Kelas {student.className}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {currentStatus ? (
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              currentStatus === 'HADIR' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' :
                              currentStatus === 'IZIN' ? 'bg-blue-950/60 text-blue-300 border-blue-500/40' :
                              currentStatus === 'SAKIT' ? 'bg-amber-950/60 text-amber-300 border-amber-500/40' :
                              'bg-rose-950/60 text-rose-300 border-rose-500/40'
                            }`}>
                              {currentStatus === 'HADIR' && <CheckCircle className="w-3 h-3" />}
                              {currentStatus === 'IZIN' && <Clock className="w-3 h-3" />}
                              {currentStatus === 'SAKIT' && <AlertCircle className="w-3 h-3" />}
                              {currentStatus === 'ALPA' && <XCircle className="w-3 h-3" />}
                              <span>{currentStatus}</span>
                            </span>

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              {att.verificationMethod === 'FINGERPRINT' ? (
                                <span className="text-emerald-400 flex items-center gap-0.5">
                                  <Fingerprint className="w-3 h-3 inline" /> Sidik Jari ({att.checkInTime || '06:45'})
                                </span>
                              ) : (
                                <span>Manual {att.checkInTime ? `(${att.checkInTime})` : ''}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Belum Dicatat</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMark(student.id, 'HADIR')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              currentStatus === 'HADIR'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-800 text-emerald-400 hover:bg-emerald-950/50 hover:text-emerald-300 border border-slate-700'
                            }`}
                          >
                            Hadir
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMark(student.id, 'IZIN')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              currentStatus === 'IZIN'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-800 text-blue-400 hover:bg-blue-950/50 hover:text-blue-300 border border-slate-700'
                            }`}
                          >
                            Izin
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMark(student.id, 'SAKIT')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              currentStatus === 'SAKIT'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-slate-800 text-amber-400 hover:bg-amber-950/50 hover:text-amber-300 border border-slate-700'
                            }`}
                          >
                            Sakit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMark(student.id, 'ALPA')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              currentStatus === 'ALPA'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-800 text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 border border-slate-700'
                            }`}
                          >
                            Alpa
                          </button>
                        </div>
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
