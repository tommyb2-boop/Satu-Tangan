import React, { useState, useMemo } from 'react';
import { ReportCard, Student } from '../../../types';
import { 
  Printer, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Eye, 
  Award,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface RaportDatabaseTabProps {
  reportCards: Record<string, ReportCard>;
  students: Student[];
  onSelectReportToPrint: (report: ReportCard) => void;
  onSelectReportToEdit: (report: ReportCard) => void;
  onDeleteReport: (reportId: string) => void;
  onNavigateToCreateNew: () => void;
  onNavigateToBulkPrint?: () => void;
  onOpenExcelImport: () => void;
}

export const RaportDatabaseTab: React.FC<RaportDatabaseTabProps> = ({
  reportCards,
  students,
  onSelectReportToPrint,
  onSelectReportToEdit,
  onDeleteReport,
  onNavigateToCreateNew,
  onNavigateToBulkPrint,
  onOpenExcelImport
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL'); // 'ALL' | 'Aktif' | 'Lulus' | 'Pindah'
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  // Convert dictionary to list of report cards and enrich with Student metadata
  const allReportsList = useMemo(() => {
    const list: Array<{
      report: ReportCard;
      student: Student | undefined;
      studentName: string;
      studentNisn: string;
      className: string;
      studentStatus: 'Aktif' | 'Lulus' | 'Pindah';
      averageScore: number;
      overallPredicate: string;
      totalSubjects: number;
    }> = [];

    const seenIds = new Set<string>();

    Object.values(reportCards).forEach(report => {
      if (!report || !report.id || seenIds.has(report.id)) return;
      seenIds.add(report.id);

      const student = students.find(s => s.id === report.studentId);
      const studentName = report.studentName || student?.name || 'Siswa Tanpa Nama';
      const studentNisn = report.studentNisn || student?.nisn || '-';
      const className = report.className || student?.className || 'Umum';
      const studentStatus = report.statusSiswa || student?.activeStatus || 'Aktif';

      // Compute average score & overall predicate
      const validScores = (report.scores || []).map(s => Number(s.nilaiAkhir) || 0);
      const averageScore = validScores.length > 0 
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length * 10) / 10 
        : 0;

      let overallPredicate = 'C';
      if (averageScore >= 88) overallPredicate = 'A';
      else if (averageScore >= 78) overallPredicate = 'B';
      else if (averageScore >= 65) overallPredicate = 'C';
      else if (averageScore > 0) overallPredicate = 'D';

      list.push({
        report,
        student,
        studentName,
        studentNisn,
        className,
        studentStatus,
        averageScore,
        overallPredicate,
        totalSubjects: validScores.length
      });
    });

    // Sort newest academic year first
    return list.sort((a, b) => {
      const yearComp = b.report.academicYear.localeCompare(a.report.academicYear);
      if (yearComp !== 0) return yearComp;
      return a.studentName.localeCompare(b.studentName);
    });
  }, [reportCards, students]);

  // Distinct values for filter options
  const academicYears = useMemo(() => {
    const set = new Set<string>();
    allReportsList.forEach(item => {
      if (item.report.academicYear) set.add(item.report.academicYear);
    });
    // Add current & recent years if not present
    ['2026/2027', '2025/2026', '2024/2025', '2023/2024'].forEach(y => set.add(y));
    return Array.from(set).sort().reverse();
  }, [allReportsList]);

  const classesList = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => set.add(s.className));
    allReportsList.forEach(item => set.add(item.className));
    return Array.from(set).sort();
  }, [students, allReportsList]);

  // Filtered List
  const filteredReports = useMemo(() => {
    return allReportsList.filter(item => {
      const matchesSearch = 
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentNisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.className.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesYear = selectedYear === 'ALL' || item.report.academicYear === selectedYear;
      const matchesSemester = selectedSemester === 'ALL' || item.report.semester === selectedSemester;
      const matchesStatus = selectedStatus === 'ALL' || item.studentStatus === selectedStatus;
      const matchesClass = selectedClass === 'ALL' || item.className === selectedClass;

      return matchesSearch && matchesYear && matchesSemester && matchesStatus && matchesClass;
    });
  }, [allReportsList, searchQuery, selectedYear, selectedSemester, selectedStatus, selectedClass]);

  // Stats Counters
  const stats = useMemo(() => {
    const total = allReportsList.length;
    const aktif = allReportsList.filter(i => i.studentStatus === 'Aktif').length;
    const lulus = allReportsList.filter(i => i.studentStatus === 'Lulus').length;
    const avgSum = allReportsList.reduce((acc, i) => acc + i.averageScore, 0);
    const overallAvg = total > 0 ? (avgSum / total).toFixed(1) : '0';
    return { total, aktif, lulus, overallAvg };
  }, [allReportsList]);

  // Export Filtered Table to Excel
  const handleExportExcel = () => {
    const rows = filteredReports.map((item, idx) => ({
      'No': idx + 1,
      'Tahun Pelajaran': item.report.academicYear,
      'Semester': item.report.semester,
      'Nama Siswa': item.studentName,
      'NISN': item.studentNisn,
      'Kelas': item.className,
      'Status Siswa': item.studentStatus,
      'Rata-rata Nilai': item.averageScore,
      'Predikat Umum': item.overallPredicate,
      'Jumlah Mapel': item.totalSubjects,
      'Sakit (Hari)': item.report.attendanceSummary?.sakit || 0,
      'Izin (Hari)': item.report.attendanceSummary?.izin || 0,
      'Alpa (Hari)': item.report.attendanceSummary?.alpa || 0,
      'Wali Kelas': item.report.homeroomTeacherName || '-',
      'Tanggal Terbit': item.report.issueDate || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Database Raport Siswa');
    XLSX.writeFile(workbook, `Database_Raport_SatuTangan_${selectedYear}_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Total Raport Tersimpan</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{stats.total}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Semua Tahun Pelajaran</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-400">Raport Siswa Aktif</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">{stats.aktif}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Siswa Berjalan</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-amber-400">Raport Siswa Lulus (Alumni)</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">{stats.lulus}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Arsip Riwayat Nilai</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-rose-400">Rata-rata Nilai Sekolah</div>
            <div className="text-xl sm:text-2xl font-black text-rose-300 mt-0.5">{stats.overallAvg}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Skala Standar 0 - 100</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Actions Bar */}
      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, NISN, atau kelas..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={onNavigateToCreateNew}
              type="button"
              className="py-2 px-3.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Input Raport Baru</span>
            </button>

            {onNavigateToBulkPrint && (
              <button
                onClick={onNavigateToBulkPrint}
                type="button"
                className="py-2 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/25 flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 border border-emerald-400/40"
                title="Cetak sekaligus seluruh raport berdasarkan kelas atau centang beberapa anak"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Semua Raport</span>
              </button>
            )}

            <button
              onClick={handleExportExcel}
              type="button"
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Unduh seluruh data raport yang terfilter dalam format Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            <button
              onClick={onOpenExcelImport}
              type="button"
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Upload file template Excel nilai raport"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Import Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Selectors Row */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Filter Tahun Pelajaran */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Tahun Pelajaran:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Tahun Pelajaran</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Filter Semester */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Semester:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Semester</option>
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </div>

          {/* Filter Status Siswa (Aktif vs Lulus) */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Status Siswa:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Status Siswa</option>
              <option value="Aktif">Siswa Aktif</option>
              <option value="Lulus">Siswa Lulus (Alumni)</option>
              <option value="Pindah">Pindah</option>
            </select>
          </div>

          {/* Filter Kelas */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Kelas / Rombel:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kelas</option>
              {classesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Database Raport Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">Daftar Arsip Raport Siswa</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {filteredReports.length} Raport
            </span>
          </div>
          <div className="text-[11px] text-slate-400 hidden sm:block">
            Tombol cetak langsung tersedia di <span className="text-emerald-400 font-semibold">kolom sebelah kiri</span> setiap siswa
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                {/* User's Exact Requirement: Tombol cetak di sebelah kiri siswa */}
                <th scope="col" className="py-3.5 px-4 w-32 bg-emerald-950/30 text-emerald-300 font-bold border-r border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Raport</span>
                  </div>
                </th>
                <th scope="col" className="py-3.5 px-4">Nama Siswa & NISN</th>
                <th scope="col" className="py-3.5 px-4">Tahun & Semester</th>
                <th scope="col" className="py-3.5 px-4">Kelas & Wali Kelas</th>
                <th scope="col" className="py-3.5 px-4">Rata-rata Nilai</th>
                <th scope="col" className="py-3.5 px-4">Kehadiran</th>
                <th scope="col" className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    Tidak ditemukan data raport dengan filter yang dipilih.
                    <div className="mt-3">
                      <button
                        onClick={onNavigateToCreateNew}
                        type="button"
                        className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Buat Raport Baru Sekarang</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((item) => (
                  <tr 
                    key={item.report.id} 
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* KOLOM 1: TOMBOL CETAK DI SEBELAH KIRI SISWA (Persis Sesuai Permintaan) */}
                    <td className="py-3.5 px-4 bg-emerald-950/15 border-r border-slate-800/60 align-middle">
                      <button
                        onClick={() => onSelectReportToPrint(item.report)}
                        type="button"
                        title={`Cetak Raport Resmi: ${item.studentName} (${item.report.academicYear} ${item.report.semester})`}
                        className="w-full py-2 px-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-900/40 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer border border-emerald-400/30"
                      >
                        <Printer className="w-3.5 h-3.5 shrink-0" />
                        <span className="tracking-wide">Cetak PDF</span>
                      </button>
                    </td>

                    {/* KOLOM 2: IDENTITAS SISWA & STATUS (AKTIF / LULUS) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm group-hover:text-indigo-200 transition-colors">
                          {item.studentName}
                        </span>
                        {item.studentStatus === 'Lulus' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-950 text-amber-300 border border-amber-600/50 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-amber-400" />
                            Lulus (Alumni)
                          </span>
                        ) : item.studentStatus === 'Aktif' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-600/50">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                            Pindah
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        NISN: {item.studentNisn}
                      </div>
                    </td>

                    {/* KOLOM 3: TAHUN PELAJARAN & SEMESTER */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{item.report.academicYear}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Semester {item.report.semester}
                      </div>
                    </td>

                    {/* KOLOM 4: KELAS & WALI KELAS */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{item.className}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                        Wali: {item.report.homeroomTeacherName || 'Belum diisi'}
                      </div>
                    </td>

                    {/* KOLOM 5: RATA-RATA NILAI & PREDIKAT */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black font-mono ${
                          item.averageScore >= 85 ? 'text-emerald-400' : item.averageScore >= 75 ? 'text-sky-300' : 'text-amber-300'
                        }`}>
                          {item.averageScore}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                          item.overallPredicate === 'A' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          item.overallPredicate === 'B' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          Predikat {item.overallPredicate}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.totalSubjects} Mata Pelajaran
                      </div>
                    </td>

                    {/* KOLOM 6: KEHADIRAN */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="text-amber-400" title="Sakit">S: {item.report.attendanceSummary?.sakit || 0}</span>
                        <span className="text-sky-400" title="Izin">I: {item.report.attendanceSummary?.izin || 0}</span>
                        <span className="text-rose-400" title="Alpa / Tanpa Keterangan">A: {item.report.attendanceSummary?.alpa || 0}</span>
                      </div>
                    </td>

                    {/* KOLOM 7: AKSI TAMBAHAN */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectReportToEdit(item.report)}
                          type="button"
                          title="Edit Nilai & Catatan Raport"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus arsip raport ${item.studentName} (${item.report.academicYear} ${item.report.semester})?`)) {
                              onDeleteReport(item.report.id);
                            }
                          }}
                          type="button"
                          title="Hapus Raport dari Database"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
