import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportCard, Student } from '../../types';
import { 
  Database, 
  PlusCircle, 
  Printer, 
  ArrowLeft, 
  FileSpreadsheet, 
  Upload, 
  X, 
  Check, 
  AlertTriangle,
  School,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { RaportDatabaseTab } from './raport/RaportDatabaseTab';
import { RaportCreateNewTab } from './raport/RaportCreateNewTab';
import { RaportPrintDocument } from './raport/RaportPrintDocument';
import { RaportBulkPrintTab } from './raport/RaportBulkPrintTab';
import { parseReportCardExcel, ParsedRaportEntry } from '../../utils/excelUtils';
import confetti from 'canvas-confetti';

export const ReportCardModule: React.FC = () => {
  const { 
    students, 
    teachers, 
    reportCards, 
    saveReportCard, 
    deleteReportCard, 
    bulkSaveReportCards, 
    schoolProfile, 
    setActiveTab 
  } = useApp();

  // Primary Sub-menu Tab State: 'database' | 'buat-baru' | 'cetak-massal' | 'cetak-dokumen'
  const [activeSubTab, setActiveSubTab] = useState<'database' | 'buat-baru' | 'cetak-massal' | 'cetak-dokumen'>('database');

  // Currently Active Report Card for Printing or Editing
  const [activeReportForPrint, setActiveReportForPrint] = useState<ReportCard | null>(null);
  const [reportToEdit, setReportToEdit] = useState<ReportCard | null>(null);

  // Excel Raport Import State
  const excelFileInputRef = useRef<HTMLInputElement>(null);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);
  const [excelImportFileName, setExcelImportFileName] = useState('');
  const [excelImportMap, setExcelImportMap] = useState<Record<string, ParsedRaportEntry>>({});
  const [excelImportErrors, setExcelImportErrors] = useState<string[]>([]);
  const [isExcelParsing, setIsExcelParsing] = useState(false);

  // Handler: User clicks [Cetak PDF] on the LEFT side of any student in the database
  const handleSelectReportToPrint = (report: ReportCard) => {
    setActiveReportForPrint(report);
    setActiveSubTab('cetak-dokumen');
  };

  // Handler: User clicks Edit from database table
  const handleSelectReportToEdit = (report: ReportCard) => {
    setReportToEdit(report);
    setActiveSubTab('buat-baru');
  };

  // Handler: Delete report
  const handleDeleteReport = (reportId: string) => {
    deleteReportCard(reportId);
  };

  // Handler: Save from Create New Tab
  const handleSaveReportFromNewTab = (report: ReportCard, shouldPrintAfter?: boolean) => {
    saveReportCard(report);
    if (shouldPrintAfter) {
      setActiveReportForPrint(report);
      setActiveSubTab('cetak-dokumen');
    }
  };

  // Handler: Bulk Initialize Class with Empty Scores
  const handleBulkInitializeClass = (className: string, academicYear: string, semester: 'Ganjil' | 'Genap') => {
    const classStudents = students.filter(s => s.className === className);
    if (classStudents.length === 0) {
      alert(`Tidak ada siswa di kelas ${className}.`);
      return;
    }

    const cleanYear = academicYear.replace(/[^a-zA-Z0-9]/g, '');
    const newReportsMap: Record<string, ReportCard> = {};

    classStudents.forEach(student => {
      const reportId = `rep-${student.id}-${cleanYear}-${semester.toLowerCase()}`;
      newReportsMap[reportId] = {
        id: reportId,
        studentId: student.id,
        studentName: student.name,
        studentNisn: student.nisn,
        className: student.className,
        statusSiswa: student.activeStatus,
        academicYear,
        semester,
        scores: [
          { subjectId: 'sub-01', subjectName: 'Pendidikan Agama & Budi Pekerti', kkm: 75, nilaiTugas: 0, nilaiUts: 0, nilaiUas: 0, nilaiAkhir: 0, predikat: 'D', deskripsi: 'Belum diinput.' },
          { subjectId: 'sub-02', subjectName: 'Pendidikan Pancasila & Kewarganegaraan', kkm: 75, nilaiTugas: 0, nilaiUts: 0, nilaiUas: 0, nilaiAkhir: 0, predikat: 'D', deskripsi: 'Belum diinput.' },
          { subjectId: 'sub-03', subjectName: 'Bahasa Indonesia', kkm: 75, nilaiTugas: 0, nilaiUts: 0, nilaiUas: 0, nilaiAkhir: 0, predikat: 'D', deskripsi: 'Belum diinput.' },
          { subjectId: 'sub-04', subjectName: 'Matematika', kkm: 72, nilaiTugas: 0, nilaiUts: 0, nilaiUas: 0, nilaiAkhir: 0, predikat: 'D', deskripsi: 'Belum diinput.' },
          { subjectId: 'sub-05', subjectName: 'Ilmu Pengetahuan Alam (IPA)', kkm: 75, nilaiTugas: 0, nilaiUts: 0, nilaiUas: 0, nilaiAkhir: 0, predikat: 'D', deskripsi: 'Belum diinput.' },
          { subjectId: 'sub-06', subjectName: 'Ilmu Pengetahuan Sosial (IPS)', kkm: 75, nilaiTugas: 0, nilaiUts: 0, nilaiUas: 0, nilaiAkhir: 0, predikat: 'D', deskripsi: 'Belum diinput.' },
          { subjectId: 'sub-07', subjectName: 'Bahasa Inggris', kkm: 75, nilaiTugas: 0, nilaiUts: 0, nilaiUas: 0, nilaiAkhir: 0, predikat: 'D', deskripsi: 'Belum diinput.' },
          { subjectId: 'sub-08', subjectName: 'Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)', kkm: 75, nilaiTugas: 0, nilaiUts: 0, nilaiUas: 0, nilaiAkhir: 0, predikat: 'D', deskripsi: 'Belum diinput.' },
          { subjectId: 'sub-09', subjectName: 'Seni Budaya & Prakarya', kkm: 75, nilaiTugas: 0, nilaiUts: 0, nilaiUas: 0, nilaiAkhir: 0, predikat: 'D', deskripsi: 'Belum diinput.' }
        ],
        sikapSpiritual: 'Baik',
        sikapSosial: 'Baik',
        extracurriculars: [{ name: 'Pramuka (Wajib)', score: 'B', notes: 'Aktif mengikuti kegiatan' }],
        attendanceSummary: { sakit: 0, izin: 0, alpa: 0 },
        teacherNotes: 'Format raport baru disiapkan, nilai siap diinput oleh wali kelas.',
        headmasterName: schoolProfile.headmasterName || 'Drs. H. Ahmad Fauzi, M.Pd.',
        headmasterNip: schoolProfile.headmasterNip || '19780512 200212 1 002',
        homeroomTeacherName: 'Siti Aminah, S.Pd., M.Si.',
        homeroomTeacherNip: '19850315 200902 2 004',
        issueDate: new Date().toISOString().split('T')[0],
        issueCity: schoolProfile.city || 'Kota Bandung'
      };
    });

    bulkSaveReportCards(newReportsMap);
    alert(`Berhasil menginisialisasi ${classStudents.length} template raport kosong untuk kelas ${className} (TA ${academicYear} ${semester})!`);
    setActiveSubTab('database');
  };

  // Excel file upload handler
  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelImportFileName(file.name);
    setIsExcelParsing(true);
    const result = await parseReportCardExcel(file, students);
    setIsExcelParsing(false);

    if (result.success && Object.keys(result.studentsReportMap).length > 0) {
      setExcelImportMap(result.studentsReportMap);
      setExcelImportErrors(result.errors);
      setIsExcelImportModalOpen(true);
    } else {
      alert(result.errors.join('\n') || 'Gagal membaca data nilai dari file Excel.');
    }
    e.target.value = '';
  };

  const handleConfirmExcelImport = () => {
    const entries = Object.entries(excelImportMap);
    if (entries.length === 0) return;

    const updatedReports: Record<string, ReportCard> = {};
    entries.forEach(([key, entry]) => {
      let targetStudentId = key;
      const matched = students.find(s => 
        s.id === key || 
        s.nisn === entry.studentNisn || 
        s.name.toLowerCase().trim() === entry.studentName.toLowerCase().trim()
      );
      if (matched) {
        targetStudentId = matched.id;
      }

      const reportId = `rep-${targetStudentId}-${Date.now().toString(36)}`;
      updatedReports[reportId] = {
        id: reportId,
        studentId: targetStudentId,
        studentName: entry.studentName,
        studentNisn: entry.studentNisn,
        className: matched?.className || '7A',
        statusSiswa: matched?.activeStatus || 'Aktif',
        academicYear: '2026/2027',
        semester: 'Ganjil',
        scores: entry.scores,
        sikapSpiritual: entry.spiritualAttitude || 'Baik',
        sikapSosial: entry.socialAttitude || 'Baik',
        extracurriculars: [{ name: 'Pramuka (Wajib)', score: 'A', notes: 'Aktif' }],
        attendanceSummary: entry.attendanceSummary || { sakit: 0, izin: 0, alpa: 0 },
        teacherNotes: entry.teacherNotes || 'Hasil import nilai Excel terverifikasi.',
        headmasterName: schoolProfile.headmasterName || 'Drs. H. Ahmad Fauzi, M.Pd.',
        headmasterNip: schoolProfile.headmasterNip || '19780512 200212 1 002',
        homeroomTeacherName: 'Siti Aminah, S.Pd., M.Si.',
        homeroomTeacherNip: '19850315 200902 2 004',
        issueDate: new Date().toISOString().split('T')[0],
        issueCity: schoolProfile.city || 'Kota Bandung'
      };
    });

    bulkSaveReportCards(updatedReports);
    setIsExcelImportModalOpen(false);
    alert(`Berhasil mengimpor ${entries.length} raport siswa ke database!`);
    setActiveSubTab('database');
  };

  // Find student associated with active report for print
  const studentForPrint = useMemo(() => {
    if (!activeReportForPrint) return undefined;
    return students.find(s => s.id === activeReportForPrint.studentId);
  }, [students, activeReportForPrint]);

  return (
    <div className="space-y-6 pb-20 print:p-0 print:space-y-0">
      {/* Hidden File Input for Excel Import */}
      <input
        type="file"
        ref={excelFileInputRef}
        onChange={handleExcelFileChange}
        accept=".xlsx,.xls"
        className="hidden"
      />

      {/* Main Module Header (Hidden in Print) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Kembali ke Dashboard Utama"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
              <span>Menu Raport: Database & Penilaian Siswa</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-300 bg-rose-950/80 border border-rose-800/60 px-2.5 py-0.5 rounded-full">
                Multi-Tahun & Alumni
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Arsip lengkap raport seluruh tahun pelajaran (siswa aktif & alumni lulus) dengan tombol cetak di sisi kiri siswa, serta sub-menu pembuatan raport baru dengan nilai kosong.
          </p>
        </div>

        {/* Sub-menu Tabs Switcher */}
        <div className="flex flex-wrap items-center p-1.5 bg-slate-900/95 border-2 border-indigo-500/30 rounded-2xl shadow-xl gap-1.5">
          <button
            onClick={() => setActiveSubTab('database')}
            type="button"
            className={`flex items-center gap-2 py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'database'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-400/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-300" />
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider text-indigo-300 font-extrabold">Sub Menu 1</span>
              <span className="text-xs">Database Raport Siswa</span>
            </div>
          </button>

          <button
            onClick={() => {
              setReportToEdit(null);
              setActiveSubTab('buat-baru');
            }}
            type="button"
            className={`flex items-center gap-2 py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'buat-baru'
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-600/40 ring-1 ring-rose-400/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-rose-300" />
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider text-rose-300 font-extrabold">Sub Menu 2</span>
              <span className="text-xs">Pembuatan Raport Baru (Tahun Berjalan)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('cetak-massal')}
            type="button"
            className={`flex items-center gap-2 py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'cetak-massal'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/40 ring-1 ring-emerald-400/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Printer className="w-4 h-4 text-emerald-300" />
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider text-emerald-300 font-extrabold">Sub Menu 3</span>
              <span className="text-xs">Cetak Semua Raport</span>
            </div>
          </button>

          {activeReportForPrint && (
            <button
              onClick={() => setActiveSubTab('cetak-dokumen')}
              type="button"
              className={`flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'cetak-dokumen'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-600/40 ring-1 ring-cyan-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
              <div className="text-left">
                <span className="block text-[9px] uppercase tracking-wider text-cyan-300 font-extrabold">Pratinjau</span>
                <span className="text-xs">Cetak Per Siswa</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* SUB-MENU 1: DATABASE RAPORT SISWA */}
      {activeSubTab === 'database' && (
        <RaportDatabaseTab
          reportCards={reportCards}
          students={students}
          onSelectReportToPrint={handleSelectReportToPrint}
          onSelectReportToEdit={handleSelectReportToEdit}
          onDeleteReport={handleDeleteReport}
          onNavigateToCreateNew={() => {
            setReportToEdit(null);
            setActiveSubTab('buat-baru');
          }}
          onNavigateToBulkPrint={() => setActiveSubTab('cetak-massal')}
          onOpenExcelImport={() => excelFileInputRef.current?.click()}
        />
      )}

      {/* SUB-MENU 2: PEMBUATAN RAPORT BARU (TAHUN BERJALAN) */}
      {activeSubTab === 'buat-baru' && (
        <RaportCreateNewTab
          students={students}
          teachers={teachers}
          schoolProfile={schoolProfile}
          onSaveReport={handleSaveReportFromNewTab}
          onBulkInitializeClass={handleBulkInitializeClass}
          onCancelToDatabase={() => setActiveSubTab('database')}
          initialEditReport={reportToEdit}
        />
      )}

      {/* SUB-MENU 3: CETAK SEMUA RAPORT (SEMUA KELAS / ANAK TERTENTU) */}
      {activeSubTab === 'cetak-massal' && (
        <RaportBulkPrintTab
          reportCards={reportCards}
          students={students}
          schoolProfile={schoolProfile}
          onBackToDatabase={() => setActiveSubTab('database')}
        />
      )}

      {/* SUB-VIEW 3: PRATINJAU DOKUMEN CETAK RESMI */}
      {activeSubTab === 'cetak-dokumen' && activeReportForPrint && (
        <RaportPrintDocument
          report={activeReportForPrint}
          student={studentForPrint}
          schoolProfile={schoolProfile}
          onBackToDatabase={() => setActiveSubTab('database')}
        />
      )}

      {/* Modal Konfirmasi Import Excel */}
      {isExcelImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Konfirmasi Import Nilai Raport Excel</span>
              </h4>
              <button
                onClick={() => setIsExcelImportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400">File terbaca:</div>
                <div className="font-semibold text-white mt-0.5">{excelImportFileName}</div>
                <div className="text-emerald-400 font-bold mt-1">
                  {Object.keys(excelImportMap).length} Siswa siap diimpor ke database
                </div>
              </div>

              {excelImportErrors.length > 0 && (
                <div className="p-3 bg-amber-950/60 border border-amber-600/50 rounded-xl text-amber-200">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Catatan Import:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {excelImportErrors.slice(0, 4).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsExcelImportModalOpen(false)}
                className="py-2 px-3 text-slate-400 hover:text-white text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmExcelImport}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Terapkan & Simpan ke Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
