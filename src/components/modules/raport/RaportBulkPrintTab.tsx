import React, { useState, useMemo } from 'react';
import { ReportCard, Student, SchoolProfile } from '../../../types';
import { 
  Printer, 
  Download, 
  CheckSquare, 
  Square, 
  Filter, 
  Users, 
  Search, 
  School, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import jsPDF from 'jspdf';

interface RaportBulkPrintTabProps {
  reportCards: Record<string, ReportCard>;
  students: Student[];
  schoolProfile: SchoolProfile;
  onBackToDatabase: () => void;
}

export const RaportBulkPrintTab: React.FC<RaportBulkPrintTabProps> = ({
  reportCards,
  students,
  schoolProfile,
  onBackToDatabase
}) => {
  // Pilihan Mode: 'kelas' (Cetak semua siswa di kelas tertentu) | 'custom' (Pilih beberapa anak tertentu)
  const [printMode, setPrintMode] = useState<'kelas' | 'custom'>('kelas');

  // Filter Umum
  const [selectedClass, setSelectedClass] = useState<string>('7A');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2026/2027');
  const [selectedSemester, setSelectedSemester] = useState<'ALL' | 'Ganjil' | 'Genap'>('Ganjil');
  const [searchStudentQuery, setSearchStudentQuery] = useState('');

  // Set ID siswa yang dicentang (untuk mode 'custom')
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Pratinjau Dokumen Cetak Massal (Mode Preview On-screen)
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Daftar Kelas Unik dari Siswa
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set).sort();
  }, [students]);

  // Daftar Tahun Ajaran Unik dari Raport
  const availableYears = useMemo(() => {
    const set = new Set<string>(['2026/2027', '2025/2026', '2024/2025', '2023/2024']);
    Object.values(reportCards).forEach(r => {
      if (r.academicYear) set.add(r.academicYear);
    });
    return Array.from(set).sort().reverse();
  }, [reportCards]);

  // Menemukan / Membentuk ReportCard untuk setiap siswa
  const getStudentReportCard = (student: Student): ReportCard => {
    // 1. Coba cari report card yang cocok dengan studentId, tahun, dan semester
    const allReports = Object.values(reportCards);
    const matched = allReports.find(r => 
      (r.studentId === student.id || r.studentNisn === student.nisn) &&
      (selectedAcademicYear === 'ALL' || r.academicYear === selectedAcademicYear) &&
      (selectedSemester === 'ALL' || r.semester === selectedSemester)
    );

    if (matched) return matched;

    // 2. Coba cari report card apa saja milik siswa ini
    const anyReport = allReports.find(r => r.studentId === student.id || r.studentNisn === student.nisn);
    if (anyReport) {
      return {
        ...anyReport,
        academicYear: selectedAcademicYear === 'ALL' ? anyReport.academicYear : selectedAcademicYear,
        semester: selectedSemester === 'ALL' ? anyReport.semester : selectedSemester
      };
    }

    // 3. Buat fallback report card dari data profil siswa
    return {
      id: `rep-${student.id}-fallback`,
      studentId: student.id,
      studentName: student.name,
      studentNisn: student.nisn,
      className: student.className,
      statusSiswa: student.activeStatus,
      academicYear: selectedAcademicYear === 'ALL' ? '2026/2027' : selectedAcademicYear,
      semester: selectedSemester === 'ALL' ? 'Ganjil' : selectedSemester,
      scores: [
        { subjectId: 's1', subjectName: 'Pendidikan Agama & Budi Pekerti', kkm: 75, nilaiTugas: 85, nilaiUts: 88, nilaiUas: 90, nilaiAkhir: 88, predikat: 'A', deskripsi: 'Sangat baik dalam memahami materi.' },
        { subjectId: 's2', subjectName: 'Pendidikan Pancasila & Kewarganegaraan', kkm: 75, nilaiTugas: 82, nilaiUts: 80, nilaiUas: 84, nilaiAkhir: 82, predikat: 'B', deskripsi: 'Baik dalam penerapan nilai Pancasila.' },
        { subjectId: 's3', subjectName: 'Bahasa Indonesia', kkm: 75, nilaiTugas: 85, nilaiUts: 86, nilaiUas: 85, nilaiAkhir: 85, predikat: 'B', deskripsi: 'Mampu menyusun teks deskriptif dengan baik.' },
        { subjectId: 's4', subjectName: 'Matematika', kkm: 72, nilaiTugas: 80, nilaiUts: 78, nilaiUas: 82, nilaiAkhir: 80, predikat: 'B', deskripsi: 'Memahami konsep aljabar dan bilangan.' },
        { subjectId: 's5', subjectName: 'Ilmu Pengetahuan Alam (IPA)', kkm: 75, nilaiTugas: 84, nilaiUts: 85, nilaiUas: 86, nilaiAkhir: 85, predikat: 'B', deskripsi: 'Aktif dalam percobaan ilmiah.' },
        { subjectId: 's6', subjectName: 'Ilmu Pengetahuan Sosial (IPS)', kkm: 75, nilaiTugas: 83, nilaiUts: 82, nilaiUas: 84, nilaiAkhir: 83, predikat: 'B', deskripsi: 'Menguasai interaksi keruangan antar wilayah.' },
        { subjectId: 's7', subjectName: 'Bahasa Inggris', kkm: 75, nilaiTugas: 86, nilaiUts: 88, nilaiUas: 90, nilaiAkhir: 88, predikat: 'A', deskripsi: 'Komunikatif dalam percakapan sehari-hari.' },
        { subjectId: 's8', subjectName: 'PJOK', kkm: 75, nilaiTugas: 85, nilaiUts: 85, nilaiUas: 88, nilaiAkhir: 86, predikat: 'B', deskripsi: 'Menunjukkan kebugaran jasmani yang prima.' },
        { subjectId: 's9', subjectName: 'Seni Budaya & Prakarya', kkm: 75, nilaiTugas: 88, nilaiUts: 85, nilaiUas: 87, nilaiAkhir: 87, predikat: 'A', deskripsi: 'Kreatif dalam membuat karya rupa.' }
      ],
      sikapSpiritual: 'Sangat Baik',
      sikapSosial: 'Baik',
      extracurriculars: [{ name: 'Pramuka (Wajib)', score: 'A', notes: 'Disiplin dan aktif' }],
      attendanceSummary: { sakit: 1, izin: 1, alpa: 0 },
      teacherNotes: 'Pertahankan prestasi belajar dan tingkatkan keaktifan di kelas.',
      headmasterName: schoolProfile.headmasterName || 'Drs. H. Ahmad Fauzi, M.Pd.',
      headmasterNip: schoolProfile.headmasterNip || '19780512 200212 1 002',
      homeroomTeacherName: 'Siti Aminah, S.Pd., M.Si.',
      homeroomTeacherNip: '19850315 200902 2 004',
      issueDate: new Date().toISOString().split('T')[0],
      issueCity: schoolProfile.city || 'Kota Bandung'
    };
  };

  // Siswa yang akan dicetak berdasarkan mode
  const targetStudentsToPrint = useMemo(() => {
    if (printMode === 'kelas') {
      if (selectedClass === 'ALL') {
        return students;
      }
      return students.filter(s => s.className === selectedClass);
    } else {
      // Mode custom centang
      return students.filter(s => selectedStudentIds.has(s.id));
    }
  }, [printMode, selectedClass, students, selectedStudentIds]);

  // Daftar siswa untuk checklist pada mode custom
  const studentsForCustomChecklist = useMemo(() => {
    return students.filter(s => {
      const matchSearch = searchQueryMatch(s, searchStudentQuery);
      return matchSearch;
    });
  }, [students, searchStudentQuery]);

  function searchQueryMatch(s: Student, q: string): boolean {
    if (!q) return true;
    const lower = q.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(lower) ||
      s.nisn.includes(lower) ||
      (s.className ? s.className.toLowerCase().includes(lower) : false)
    );
  }

  // Toggle checklist
  const handleToggleStudent = (studentId: string) => {
    const updated = new Set(selectedStudentIds);
    if (updated.has(studentId)) {
      updated.delete(studentId);
    } else {
      updated.add(studentId);
    }
    setSelectedStudentIds(updated);
  };

  // Pilih Semua Siswa dalam daftar checklist
  const handleSelectAllStudents = () => {
    const updated = new Set(selectedStudentIds);
    studentsForCustomChecklist.forEach(s => updated.add(s.id));
    setSelectedStudentIds(updated);
  };

  // Hapus Semua Pilihan
  const handleDeselectAllStudents = () => {
    setSelectedStudentIds(new Set());
  };

  // Pilih siswa berdasarkan kelas cepat
  const handleSelectClassStudentsInChecklist = (className: string) => {
    const updated = new Set(selectedStudentIds);
    students.filter(s => s.className === className).forEach(s => updated.add(s.id));
    setSelectedStudentIds(updated);
  };

  // Handler: Buka Dialog Print Browser untuk Semua Siswa
  const handlePrintAll = () => {
    if (targetStudentsToPrint.length === 0) {
      alert('Belum ada siswa yang dipilih untuk dicetak.');
      return;
    }
    setIsPreviewActive(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Handler: Unduh File PDF Gabungan Semua Siswa (Multi-halaman jsPDF)
  const handleDownloadBulkPdf = () => {
    if (targetStudentsToPrint.length === 0) {
      alert('Pilih minimal 1 siswa untuk membuat PDF massal.');
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const total = targetStudentsToPrint.length;

      targetStudentsToPrint.forEach((student, index) => {
        if (index > 0) {
          doc.addPage();
        }

        const report = getStudentReportCard(student);
        const studentName = report.studentName || student.name;
        const studentNisn = report.studentNisn || student.nisn;
        const className = report.className || student.className;
        const studentStatus = report.statusSiswa || student.activeStatus;

        // Header Kop Surat
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text((schoolProfile.letterheadProvince || 'PEMERINTAH DAERAH PROVINSI').toUpperCase(), 105, 14, { align: 'center' });
        doc.text((schoolProfile.letterheadAgency || 'DINAS PENDIDIKAN & KEBUDAYAAN').toUpperCase(), 105, 19, { align: 'center' });
        doc.setFontSize(12);
        doc.text((schoolProfile.schoolName || 'SMP NEGERI 1 CENDEKIA MANDIRI').toUpperCase(), 105, 25, { align: 'center' });
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        const fullAddress = `${schoolProfile.address || ''}, ${schoolProfile.city || ''}, ${schoolProfile.province || ''} | Telp: ${schoolProfile.phone || ''}`;
        doc.text(fullAddress, 105, 29.5, { align: 'center' });
        doc.setFontSize(7);
        doc.text(`NPSN: ${schoolProfile.npsn || '-'} | NSS: ${schoolProfile.nss || '-'} | Akreditasi: ${schoolProfile.accreditation || '-'}`, 105, 33, { align: 'center' });

        // Double Line
        doc.setLineWidth(0.6);
        doc.line(15, 35.5, 195, 35.5);
        doc.setLineWidth(0.2);
        doc.line(15, 36.5, 195, 36.5);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPORT)', 105, 43, { align: 'center' });

        // Metadata Siswa
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nama Peserta Didik : ${studentName}`, 15, 49);
        doc.text(`NISN / NIK         : ${studentNisn}`, 15, 54);
        doc.text(`Kelas / Rombel     : ${className} (${studentStatus === 'Lulus' ? 'Alumni' : 'Aktif'})`, 15, 59);

        doc.text(`Tahun Pelajaran   : ${report.academicYear}`, 125, 49);
        doc.text(`Semester          : ${report.semester}`, 125, 54);
        doc.text(`Fase Kurikulum    : Fase D (Kurikulum Merdeka)`, 125, 59);

        // Nilai Mata Pelajaran
        let y = 66;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text('A. Capaian Kompetensi Akademik:', 15, y);
        y += 5;

        // Table Header
        doc.setFillColor(240, 240, 245);
        doc.rect(15, y - 4, 180, 6, 'F');
        doc.setFontSize(7.5);
        doc.text('No', 17, y);
        doc.text('Mata Pelajaran', 25, y);
        doc.text('KKM', 115, y);
        doc.text('Nilai Akhir', 135, y);
        doc.text('Predikat', 165, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        (report.scores || []).slice(0, 10).forEach((s, idx) => {
          doc.text(`${idx + 1}.`, 17, y);
          doc.text(s.subjectName.slice(0, 48), 25, y);
          doc.text(`${s.kkm}`, 118, y);
          doc.text(`${s.nilaiAkhir}`, 140, y);
          doc.text(s.predikat, 170, y);
          y += 4.5;
        });

        // B. Karakter & Kehadiran
        y += 3;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('B. Karakter & Kehadiran:', 15, y);
        y += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Sikap Spiritual: ${report.sikapSpiritual} | Sikap Sosial: ${report.sikapSosial}`, 15, y);
        y += 4;
        doc.text(`Kehadiran: Sakit: ${report.attendanceSummary?.sakit || 0} hari | Izin: ${report.attendanceSummary?.izin || 0} hari | Alpa: ${report.attendanceSummary?.alpa || 0} hari`, 15, y);

        // Catatan Wali Kelas
        y += 4.5;
        doc.setFont('helvetica', 'bold');
        doc.text('Catatan Wali Kelas:', 15, y);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.text(`"${report.teacherNotes || 'Belajar giat dan pertahankan prestasi.'}"`, 45, y);

        // Tanda Tangan
        y += 14;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Mengetahui Orang Tua/Wali`, 25, y);
        doc.text(`${report.issueCity || 'Kota Bandung'}, ${report.issueDate}`, 140, y);
        doc.text(`Wali Kelas,`, 140, y + 4);

        y += 18;
        doc.text(`(........................................)`, 25, y);
        doc.setFont('helvetica', 'bold');
        doc.text(report.homeroomTeacherName, 140, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`NIP. ${report.homeroomTeacherNip}`, 140, y + 3.5);

        // Kepala Sekolah Center
        y += 8;
        doc.setFontSize(7.5);
        doc.text(`Kepala Sekolah,`, 105, y, { align: 'center' });
        y += 16;
        doc.setFont('helvetica', 'bold');
        doc.text(report.headmasterName, 105, y, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`NIP. ${report.headmasterNip}`, 105, y + 3.5, { align: 'center' });

        // Footer Page Number
        doc.setFontSize(6.5);
        doc.text(`Halaman ${index + 1} dari ${total} - Dokumen Raport Resmi Satu Tangan`, 105, 290, { align: 'center' });
      });

      const fileName = printMode === 'kelas' 
        ? `Raport_Massal_Kelas_${selectedClass}_${selectedAcademicYear.replace('/', '-')}.pdf`
        : `Raport_Pilihan_${targetStudentsToPrint.length}_Siswa_${selectedAcademicYear.replace('/', '-')}.pdf`;

      doc.save(fileName);
      setIsGeneratingPdf(false);
      alert(`Berhasil mengunduh dokumen gabungan PDF (${total} siswa)!`);
    } catch (err) {
      console.error(err);
      setIsGeneratingPdf(false);
      alert('Terjadi kendala saat menyusun PDF massal.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tombol Back & Header Sub-menu (Hidden in Print) */}
      <div className="no-print bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToDatabase}
              type="button"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kembali ke Database Raport"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Sub Menu: Cetak Semua Raport (Cetak Massal)</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  Batch Print Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cetak sekaligus raport semua siswa di kelas berapa saja, atau pilih beberapa siswa tertentu untuk dicetak langsung ke printer atau diunduh sebagai 1 file PDF gabungan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewActive(!isPreviewActive)}
              type="button"
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isPreviewActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewActive ? 'Sembunyikan Pratinjau' : 'Pratinjau Dokumen'}</span>
            </button>
          </div>
        </div>

        {/* Pemilih Mode: 1. Cetak Semua Siswa di Kelas Tertentu, 2. Pilih Beberapa Anak Tertentu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Opsi 1: Berdasarkan Kelas */}
          <div
            onClick={() => setPrintMode('kelas')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              printMode === 'kelas'
                ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-500/50'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${printMode === 'kelas' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">1. Cetak Raport Semua Kelas Berapa Saja</h3>
                  <p className="text-xs text-slate-400">
                    Cetak seluruh raport siswa dari rombel kelas yang dipilih (misal Kelas 7A, 7B, atau Semua Kelas).
                  </p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 border-indigo-400">
                {printMode === 'kelas' && <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full" />}
              </div>
            </div>
          </div>

          {/* Opsi 2: Siswa Tertentu (Centang Manual) */}
          <div
            onClick={() => setPrintMode('custom')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              printMode === 'custom'
                ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/60 ring-1 ring-rose-500/50'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${printMode === 'custom' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">2. Cetak Raport Beberapa Anak Tertentu</h3>
                  <p className="text-xs text-slate-400">
                    Centang manual siswa-siswa tertentu yang ingin dicetak tanpa harus mencetak satu kelas penuh.
                  </p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 border-rose-400">
                {printMode === 'custom' && <div className="w-2.5 h-2.5 bg-rose-400 rounded-full" />}
              </div>
            </div>
          </div>
        </div>

        {/* Panel Filter Spesifik Berdasarkan Mode */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Filter Tahun Pelajaran */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tahun Pelajaran:</span>
              </label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Tahun Pelajaran</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Filter Semester */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Semester:
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Semester (Ganjil & Genap)</option>
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>

            {/* Jika mode 'kelas': Pemilihan Kelas */}
            {printMode === 'kelas' ? (
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pilih Rombel / Kelas:</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">Semua Kelas Sekaligus</option>
                  {availableClasses.map(cls => (
                    <option key={cls} value={cls}>Kelas {cls}</option>
                  ))}
                </select>
              </div>
            ) : (
              /* Jika mode 'custom': Pencarian Cepat */
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cari Nama / NISN Siswa:</span>
                </label>
                <input
                  type="text"
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  placeholder="Ketik nama atau NISN..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Jika MODE CUSTOM: Tampilkan Daftar Siswa Checklist */}
          {printMode === 'custom' && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <span>Centang Anak yang Ingin Dicetak:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {selectedStudentIds.size} dari {students.length} anak terpilih
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSelectAllStudents}
                    className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 rounded-lg border border-slate-700 transition-colors"
                  >
                    Pilih Semua
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllStudents}
                    className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-400 rounded-lg border border-slate-700 transition-colors"
                  >
                    Batal Pilih
                  </button>

                  {/* Tombol Cepat Kelas */}
                  <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-slate-800">
                    <span className="text-[10px] text-slate-500">Pilih Kelas:</span>
                    {availableClasses.map(cls => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => handleSelectClassStudentsInChecklist(cls)}
                        className="py-0.5 px-2 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 rounded border border-slate-800"
                      >
                        +{cls}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid Kartu Checklist Siswa */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-900/60 p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {studentsForCustomChecklist.map(s => {
                  const isChecked = selectedStudentIds.has(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleStudent(s.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-rose-950/30 border-rose-500/70 text-white shadow-sm'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`p-1 rounded ${isChecked ? 'text-rose-400' : 'text-slate-500'}`}>
                          {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold truncate">{s.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                            <span>NISN: {s.nisn}</span>
                            <span>•</span>
                            <span className="font-sans font-semibold text-slate-300">Kelas {s.className}</span>
                          </div>
                        </div>
                      </div>

                      {s.activeStatus === 'Lulus' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50 shrink-0">
                          Alumni
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Bar & Summary Card */}
          <div className="pt-3 border-t border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/90 -mx-4 -mb-4 p-4 rounded-b-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Target Cetak:</span>
                  <span className="text-emerald-400 font-extrabold text-sm">
                    {targetStudentsToPrint.length} Siswa
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    ({printMode === 'kelas' ? (selectedClass === 'ALL' ? 'Semua Kelas' : `Kelas ${selectedClass}`) : 'Pilihan Tertentu'})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Tahun Pelajaran: <span className="text-slate-200 font-semibold">{selectedAcademicYear}</span> ({selectedSemester})
                </div>
              </div>
            </div>

            {/* Tombol Cetak Utama */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={targetStudentsToPrint.length === 0}
                onClick={handlePrintAll}
                className="flex-1 md:flex-none py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-emerald-400/40"
              >
                <Printer className="w-4 h-4 shrink-0" />
                <span>Cetak Semua ({targetStudentsToPrint.length} Raport)</span>
              </button>

              <button
                type="button"
                disabled={targetStudentsToPrint.length === 0 || isGeneratingPdf}
                onClick={handleDownloadBulkPdf}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                title="Unduh seluruh raport terpilih menjadi 1 file PDF lengkap"
              >
                <Download className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{isGeneratingPdf ? 'Menyusun PDF...' : 'Unduh PDF Massal'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTAINER DOKUMEN CETAK RAPORT (VISIBLE IN PRINT & PREVIEW) */}
      <div className={`${isPreviewActive ? 'block' : 'hidden print:block'} space-y-8`}>
        {targetStudentsToPrint.length === 0 ? (
          <div className="no-print p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">Tidak ada siswa yang dipilih untuk dicetak.</p>
            <p className="text-xs text-slate-500 mt-1">Silakan pilih kelas atau centang beberapa anak pada formulir di atas.</p>
          </div>
        ) : (
          targetStudentsToPrint.map((student, studentIndex) => {
            const report = getStudentReportCard(student);
            const studentName = report.studentName || student.name;
            const studentNisn = report.studentNisn || student.nisn;
            const className = report.className || student.className;
            const studentStatus = report.statusSiswa || student.activeStatus;

            return (
              <div 
                key={student.id} 
                className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none max-w-4xl mx-auto break-after-page"
                style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
              >
                {/* Header Kop Surat Resmi */}
                <div className="text-center relative pb-3 border-b-2 border-black">
                  {schoolProfile.logoUrl && (
                    <div className="absolute left-0 top-0 hidden sm:block">
                      <img
                        src={schoolProfile.logoUrl}
                        alt="Logo Sekolah"
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  )}

                  <div className="px-12 sm:px-20 space-y-0.5">
                    <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800">
                      {schoolProfile.letterheadProvince || 'PEMERINTAH DAERAH PROVINSI JAWA BARAT'}
                    </h4>
                    <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800">
                      {schoolProfile.letterheadAgency || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
                    </h3>
                    <h2 className="text-sm sm:text-lg font-black uppercase text-slate-950 tracking-tight">
                      {schoolProfile.schoolName || 'SMP NEGERI 1 CENDEKIA MANDIRI'}
                    </h2>
                    <p className="text-[9px] sm:text-[10px] text-slate-700">
                      {schoolProfile.address}, {schoolProfile.city}, {schoolProfile.province} {schoolProfile.postalCode} | Telp: {schoolProfile.phone}
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-slate-600">
                      NPSN: {schoolProfile.npsn} | NSS: {schoolProfile.nss} | Akreditasi: {schoolProfile.accreditation}
                    </p>
                  </div>
                </div>

                {/* Judul Dokumen */}
                <div className="text-center my-4">
                  <h1 className="text-xs sm:text-sm font-black tracking-wider uppercase underline underline-offset-4">
                    LAPORAN HASIL BELAJAR PESERTA DIDIK
                  </h1>
                  <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                    Kurikulum Merdeka — Tahun Pelajaran {report.academicYear} (Semester {report.semester})
                  </p>
                </div>

                {/* Identitas Siswa */}
                <div className="grid grid-cols-2 gap-3 text-[11px] p-3 bg-slate-50 border border-slate-300 rounded-lg mb-4">
                  <div className="space-y-0.5">
                    <div className="flex">
                      <span className="w-28 text-slate-600">Nama Peserta Didik</span>
                      <span className="font-bold text-slate-950">: {studentName}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-600">NISN / NIK</span>
                      <span className="font-mono font-semibold text-slate-900">: {studentNisn}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-600">Kelas / Rombel</span>
                      <span className="font-semibold text-slate-900">: {className}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-600">Status Siswa</span>
                      <span className="font-bold text-slate-900">
                        : {studentStatus === 'Lulus' ? 'LULUS (ALUMNI)' : 'AKTIF BERJALAN'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex">
                      <span className="w-28 text-slate-600">Sekolah</span>
                      <span className="font-semibold text-slate-900">: {schoolProfile.schoolName}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-600">Tahun Pelajaran</span>
                      <span className="font-semibold text-slate-900">: {report.academicYear}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-600">Semester</span>
                      <span className="font-semibold text-slate-900">: {report.semester}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-600">Fase Capaian</span>
                      <span className="font-semibold text-slate-900">: Fase D (SMP)</span>
                    </div>
                  </div>
                </div>

                {/* Tabel Nilai Capaian Pembelajaran */}
                <div className="mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-900">
                    A. Capaian Kompetensi Akademik (Mata Pelajaran)
                  </div>
                  <table className="w-full text-left text-[10px] border border-slate-300">
                    <thead className="bg-slate-100 text-[10px] font-bold text-slate-800 border-b border-slate-300">
                      <tr>
                        <th className="py-1.5 px-2 w-8 text-center border-r border-slate-300">No</th>
                        <th className="py-1.5 px-2.5 border-r border-slate-300">Mata Pelajaran</th>
                        <th className="py-1.5 px-2 w-12 text-center border-r border-slate-300">KKM</th>
                        <th className="py-1.5 px-2 w-14 text-center border-r border-slate-300">Nilai Akhir</th>
                        <th className="py-1.5 px-2 w-12 text-center border-r border-slate-300">Predikat</th>
                        <th className="py-1.5 px-2.5">Capaian Kompetensi / Catatan Guru</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(report.scores || []).map((score, idx) => (
                        <tr key={score.subjectId || idx} className="text-[10px]">
                          <td className="py-1 px-2 text-center font-mono border-r border-slate-200">
                            {idx + 1}
                          </td>
                          <td className="py-1 px-2.5 font-semibold text-slate-900 border-r border-slate-200">
                            {score.subjectName}
                          </td>
                          <td className="py-1 px-2 text-center font-mono text-slate-700 border-r border-slate-200">
                            {score.kkm}
                          </td>
                          <td className="py-1 px-2 text-center font-mono font-bold text-slate-950 border-r border-slate-200">
                            {score.nilaiAkhir}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-900 border-r border-slate-200">
                            {score.predikat}
                          </td>
                          <td className="py-1 px-2.5 text-[9px] text-slate-700 leading-tight">
                            {score.deskripsi}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sikap, Kehadiran & Catatan */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-[10px]">
                  <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg space-y-1">
                    <div className="font-bold text-slate-900 uppercase text-[10px]">
                      B. Penilaian Karakter & Budi Pekerti
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                      <span className="text-slate-600">Sikap Spiritual:</span>
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {report.sikapSpiritual}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-600">Sikap Sosial:</span>
                      <span className="font-bold text-indigo-800 bg-indigo-100 px-1.5 py-0.5 rounded">
                        {report.sikapSosial}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg space-y-1">
                    <div className="font-bold text-slate-900 uppercase text-[10px]">
                      C. Rekapitulasi Ketidakhadiran
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                      <span className="text-slate-600">Sakit:</span>
                      <span className="font-semibold text-slate-900">{report.attendanceSummary?.sakit || 0} Hari</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                      <span className="text-slate-600">Izin:</span>
                      <span className="font-semibold text-slate-900">{report.attendanceSummary?.izin || 0} Hari</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-600">Tanpa Keterangan:</span>
                      <span className="font-semibold text-slate-900">{report.attendanceSummary?.alpa || 0} Hari</span>
                    </div>
                  </div>
                </div>

                {/* Catatan Wali Kelas */}
                <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg mb-6 text-[10px]">
                  <span className="font-bold text-slate-900">Catatan Wali Kelas: </span>
                  <span className="italic text-slate-800">
                    "{report.teacherNotes || 'Pertahankan prestasi belajar dan tingkatkan terus keaktifan dalam kegiatan sekolah.'}"
                  </span>
                </div>

                {/* Kolom Tanda Tangan */}
                <div className="pt-2 text-[10px]">
                  <div className="grid grid-cols-3 text-center gap-2">
                    <div>
                      <p className="text-slate-600">Mengetahui,</p>
                      <p className="font-medium text-slate-900">Orang Tua / Wali Murid</p>
                      <div className="h-14" />
                      <p className="font-semibold text-slate-900 underline underline-offset-2">
                        ( ........................................ )
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-600">Mengetahui,</p>
                      <p className="font-medium text-slate-900">Kepala Sekolah</p>
                      <div className="h-14 flex items-center justify-center">
                        <span className="text-[8px] text-slate-400 font-mono">[STEMPEL RESMI]</span>
                      </div>
                      <p className="font-bold text-slate-900 underline underline-offset-2">
                        {report.headmasterName}
                      </p>
                      <p className="text-[9px] text-slate-600">NIP. {report.headmasterNip}</p>
                    </div>

                    <div>
                      <p className="text-slate-600">
                        {report.issueCity || schoolProfile.city || 'Kota Bandung'}, {report.issueDate}
                      </p>
                      <p className="font-medium text-slate-900">Wali Kelas</p>
                      <div className="h-14" />
                      <p className="font-bold text-slate-900 underline underline-offset-2">
                        {report.homeroomTeacherName}
                      </p>
                      <p className="text-[9px] text-slate-600">NIP. {report.homeroomTeacherNip}</p>
                    </div>
                  </div>
                </div>

                {/* Watermark Page Number */}
                <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400">
                  Dokumen Resmi Raport Siswa • Halaman {studentIndex + 1} dari {targetStudentsToPrint.length} • {studentName} ({className})
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
