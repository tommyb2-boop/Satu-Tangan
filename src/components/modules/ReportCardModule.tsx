import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportCard, SubjectScore, Student } from '../../types';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Search, 
  Save, 
  Check, 
  Award, 
  FileText, 
  ArrowLeft, 
  Sparkles, 
  School, 
  QrCode,
  Settings,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  UserCheck,
  BookOpen,
  X,
  Palette,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { INITIAL_REPORT_CARD } from '../../data/initialData';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

// Presets for Curriculum and Educational Levels
export const TK_SUBJECTS = [
  { name: 'Nilai Agama dan Moral', kkm: 75, deskripsi: 'Mengenal ciptaan Tuhan, berdoa sebelum dan sesudah kegiatan, serta bersikap santun.' },
  { name: 'Fisik Motorik (Kasar & Halus)', kkm: 75, deskripsi: 'Terampil melakukan gerakan koordinasi tubuh, melipat kertas, memegang pensil, dan mewarnai rapi.' },
  { name: 'Kognitif & Berpikir Simbolis', kkm: 75, deskripsi: 'Mampu mengenal angka, pola warna, bentuk geometri, serta mengelompokkan benda.' },
  { name: 'Bahasa & Literasi Awal', kkm: 75, deskripsi: 'Dapat mengungkapkan keinginan, mendengarkan cerita guru, dan menyanyikan lagu anak.' },
  { name: 'Sosial Emosional & Kemandirian', kkm: 75, deskripsi: 'Mandiri memakai sepatu sendiri, sabar mengantre giliran, dan mau berbagi mainan dengan teman.' },
  { name: 'Seni & Kreativitas', kkm: 75, deskripsi: 'Antusias membuat kreasi kolase, bernyanyi bersama, dan mengekspresikan imajinasi seni.' }
];

export const SD_SUBJECTS = [
  { name: 'Pendidikan Agama & Budi Pekerti', kkm: 70, deskripsi: 'Mengamalkan nilai-nilai keagamaan dan toleransi dalam kehidupan sehari-hari.' },
  { name: 'Pendidikan Pancasila', kkm: 70, deskripsi: 'Memahami simbol-simbol Pancasila dan penerapan aturan di lingkungan keluarga serta sekolah.' },
  { name: 'Bahasa Indonesia', kkm: 70, deskripsi: 'Mampu membaca nyaring dengan lancar dan menulis kalimat sederhana secara runtut.' },
  { name: 'Matematika', kkm: 70, deskripsi: 'Menguasai operasi hitung penjumlahan, pengurangan, dan pengukuran satuan panjang.' },
  { name: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', kkm: 70, deskripsi: 'Memahami bagian-bagian tubuh makhluk hidup dan interaksi di lingkungan sekitar.' },
  { name: 'Pendidikan Jasmani, Olahraga & Kesehatan', kkm: 70, deskripsi: 'Melakukan gerak lokomotor dan non-lokomotor dengan bugar dan ceria.' },
  { name: 'Seni Budaya & Prakarya', kkm: 70, deskripsi: 'Kreatif dalam memadukan warna pada gambar dan membuat karya seni rupa dua dimensi.' }
];

export const SMP_SUBJECTS = [
  { name: 'Pendidikan Agama & Budi Pekerti', kkm: 75, deskripsi: 'Sangat menguasai pemahaman adab dan pengamalan ibadah harian secara konsisten.' },
  { name: 'Pendidikan Pancasila & Kewarganegaraan', kkm: 75, deskripsi: 'Memahami nilai-nilai musyawarah dan penegakan tata tertib sekolah dengan baik.' },
  { name: 'Bahasa Indonesia', kkm: 75, deskripsi: 'Sangat terampil dalam menyusun teks deskripsi dan presentasi lisan yang runtut.' },
  { name: 'Matematika', kkm: 72, deskripsi: 'Mampu menyelesaikan persoalan aljabar dasar dan perbandingan dengan penalaran logis.' },
  { name: 'Ilmu Pengetahuan Alam (IPA)', kkm: 75, deskripsi: 'Sangat mahir dalam praktikum mikroskop dan konsep klasifikasi makhluk hidup.' },
  { name: 'Ilmu Pengetahuan Sosial (IPS)', kkm: 75, deskripsi: 'Memahami dinamika interaksi antarruang di wilayah Indonesia dengan baik.' },
  { name: 'Bahasa Inggris', kkm: 75, deskripsi: 'Aktif berkomunikasi dalam daily conversation dan reading comprehension.' },
  { name: 'Pendidikan Jasmani, Olahraga & Kesehatan', kkm: 75, deskripsi: 'Memiliki kebugaran jasmani yang baik dan menguasai teknik bola basket dasar.' },
  { name: 'Seni Budaya & Prakarya', kkm: 75, deskripsi: 'Kreatif dalam memproduksi karya ragam hias dan kerajinan bahan lunak.' }
];

interface SettingSubjectItem {
  id: string;
  name: string;
  kkm: number;
  deskripsi?: string;
}

const DEFAULT_FALLBACK_STUDENT: Student = {
  id: 'std-empty',
  name: 'Peserta Didik',
  nisn: '0000000000',
  className: '7A',
  gender: 'Laki-laki',
  birthPlace: 'Kota',
  birthDate: '2012-01-01',
  parentName: 'Orang Tua / Wali',
  parentPhone: '081234567890',
  address: 'Alamat Sekolah',
  activeStatus: 'Aktif'
};

export const ReportCardModule: React.FC = () => {
  const { students, teachers, reportCards, saveReportCard, setActiveTab, schoolProfile } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'std-01');
  const [activeView, setActiveView] = useState<'preview' | 'input'>('preview');

  const selectedStudent: Student = 
    students.find(s => s.id === selectedStudentId) || 
    students[0] || 
    DEFAULT_FALLBACK_STUDENT;

  // Load existing report card or create default draft
  const currentReport: ReportCard = reportCards[selectedStudent?.id || selectedStudentId] || {
    ...INITIAL_REPORT_CARD,
    id: 'rep-' + (selectedStudent?.id || selectedStudentId),
    studentId: selectedStudent?.id || selectedStudentId,
  };

  const [formScores, setFormScores] = useState<SubjectScore[]>(currentReport.scores);
  const [academicYear, setAcademicYear] = useState(currentReport.academicYear || '2025/2026');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(currentReport.semester || 'Ganjil');
  const [spiritualAttitude, setSpiritualAttitude] = useState(currentReport.sikapSpiritual);
  const [socialAttitude, setSocialAttitude] = useState(currentReport.sikapSosial);
  const [teacherNotes, setTeacherNotes] = useState(currentReport.teacherNotes);
  const [attendanceRecap, setAttendanceRecap] = useState(currentReport.attendanceSummary);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [cfgAcademicYear, setCfgAcademicYear] = useState(academicYear);
  const [cfgSemester, setCfgSemester] = useState<'Ganjil' | 'Genap'>(semester);
  const [cfgHomeroomTeacherName, setCfgHomeroomTeacherName] = useState(currentReport.homeroomTeacherName || '');
  const [cfgHomeroomTeacherNip, setCfgHomeroomTeacherNip] = useState(currentReport.homeroomTeacherNip || '');
  const [cfgIssueCity, setCfgIssueCity] = useState(currentReport.issueCity || schoolProfile.city || 'Kota Bandung');
  const [cfgIssueDate, setCfgIssueDate] = useState(currentReport.issueDate || '2026-12-19');
  const [cfgSubjects, setCfgSubjects] = useState<SettingSubjectItem[]>([]);
  const [newSubName, setNewSubName] = useState('');
  const [newSubKkm, setNewSubKkm] = useState(75);
  const [applyToAllStudents, setApplyToAllStudents] = useState(true);

  // When changing student, sync state
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const existing = reportCards[id] || {
      ...INITIAL_REPORT_CARD,
      id: 'rep-' + id,
      studentId: id
    };
    setFormScores(existing.scores);
    setAcademicYear(existing.academicYear || '2025/2026');
    setSemester(existing.semester || 'Ganjil');
    setSpiritualAttitude(existing.sikapSpiritual);
    setSocialAttitude(existing.sikapSosial);
    setTeacherNotes(existing.teacherNotes);
    setAttendanceRecap(existing.attendanceSummary);
    setSaveSuccess(false);
  };

  // Open Settings Modal
  const handleOpenConfigModal = () => {
    setCfgAcademicYear(academicYear);
    setCfgSemester(semester);
    setCfgHomeroomTeacherName(currentReport.homeroomTeacherName || '');
    setCfgHomeroomTeacherNip(currentReport.homeroomTeacherNip || '');
    setCfgIssueCity(currentReport.issueCity || schoolProfile.city || 'Kota Bandung');
    setCfgIssueDate(currentReport.issueDate || '2026-12-19');
    setCfgSubjects(
      formScores.map((s, idx) => ({
        id: s.subjectId || `sub-${idx}`,
        name: s.subjectName,
        kkm: s.kkm,
        deskripsi: s.deskripsi
      }))
    );
    setApplyToAllStudents(true);
    setIsConfigModalOpen(true);
  };

  // Handle Preset Curriculum loading in Settings Modal
  const handleLoadPresetSubjects = (type: 'TK' | 'SD' | 'SMP') => {
    let sourceList: { name: string; kkm: number; deskripsi?: string }[] = [];
    if (type === 'TK') {
      sourceList = TK_SUBJECTS;
    } else if (type === 'SD') {
      sourceList = SD_SUBJECTS;
    } else {
      sourceList = SMP_SUBJECTS;
    }

    setCfgSubjects(
      sourceList.map((item, idx) => ({
        id: `sub-preset-${type.toLowerCase()}-${idx}-${Date.now().toString(36)}`,
        name: item.name,
        kkm: item.kkm,
        deskripsi: item.deskripsi
      }))
    );
  };

  // Add new subject in Settings
  const handleAddNewSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const newItem: SettingSubjectItem = {
      id: `sub-custom-${Date.now().toString(36)}`,
      name: newSubName.trim(),
      kkm: Number(newSubKkm) || 75,
      deskripsi: 'Menunjukkan pemahaman materi dengan baik sesuai capaian kompetensi.'
    };
    setCfgSubjects(prev => [...prev, newItem]);
    setNewSubName('');
    setNewSubKkm(75);
  };

  // Remove subject in Settings
  const handleRemoveSubject = (indexToRemove: number) => {
    setCfgSubjects(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Quick select homeroom teacher from teachers database
  const handleSelectTeacherFromDb = (teacherId: string) => {
    const t = teachers.find(item => item.id === teacherId);
    if (t) {
      setCfgHomeroomTeacherName(t.name);
      setCfgHomeroomTeacherNip(t.nip);
    }
  };

  // Save Settings Modal
  const handleSaveConfig = () => {
    if (cfgSubjects.length === 0) {
      alert('Minimal harus ada 1 mata pelajaran / lingkup perkembangan dalam raport.');
      return;
    }

    // Map new subjects to formScores preserving existing grades if match
    const updatedScores: SubjectScore[] = cfgSubjects.map((sub, idx) => {
      const existing = formScores.find(s => s.subjectName.toLowerCase() === sub.name.toLowerCase() || s.subjectId === sub.id);
      if (existing) {
        return {
          ...existing,
          subjectId: sub.id,
          subjectName: sub.name,
          kkm: sub.kkm
        };
      }
      return {
        subjectId: sub.id,
        subjectName: sub.name,
        kkm: sub.kkm,
        nilaiTugas: 85,
        nilaiUts: 85,
        nilaiUas: 85,
        nilaiAkhir: 85,
        predikat: 'B',
        deskripsi: sub.deskripsi || 'Menunjukkan capaian kompetensi yang baik dan aktif dalam kegiatan belajar.'
      };
    });

    setFormScores(updatedScores);
    setAcademicYear(cfgAcademicYear);
    setSemester(cfgSemester);

    const updatedSingle: ReportCard = {
      ...currentReport,
      studentId: selectedStudentId,
      academicYear: cfgAcademicYear,
      semester: cfgSemester,
      scores: updatedScores,
      homeroomTeacherName: cfgHomeroomTeacherName,
      homeroomTeacherNip: cfgHomeroomTeacherNip,
      issueCity: cfgIssueCity,
      issueDate: cfgIssueDate
    };

    saveReportCard(updatedSingle);

    // If apply to all students, cascade changes
    if (applyToAllStudents) {
      students.forEach(std => {
        const existingRep = reportCards[std.id] || {
          ...INITIAL_REPORT_CARD,
          id: 'rep-' + std.id,
          studentId: std.id
        };

        const stdScores: SubjectScore[] = cfgSubjects.map((sub, idx) => {
          const match = existingRep.scores?.find(s => s.subjectName.toLowerCase() === sub.name.toLowerCase() || s.subjectId === sub.id);
          if (match) {
            return {
              ...match,
              subjectId: sub.id,
              subjectName: sub.name,
              kkm: sub.kkm
            };
          }
          return {
            subjectId: sub.id,
            subjectName: sub.name,
            kkm: sub.kkm,
            nilaiTugas: 85,
            nilaiUts: 85,
            nilaiUas: 85,
            nilaiAkhir: 85,
            predikat: 'B',
            deskripsi: sub.deskripsi || 'Menunjukkan capaian kompetensi yang memuaskan.'
          };
        });

        saveReportCard({
          ...existingRep,
          studentId: std.id,
          academicYear: cfgAcademicYear,
          semester: cfgSemester,
          scores: stdScores,
          homeroomTeacherName: cfgHomeroomTeacherName,
          homeroomTeacherNip: cfgHomeroomTeacherNip,
          issueCity: cfgIssueCity,
          issueDate: cfgIssueDate
        });
      });
    }

    setIsConfigModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  // Score row change in input view
  const handleScoreChange = (index: number, field: 'nilaiTugas' | 'nilaiUts' | 'nilaiUas', val: number) => {
    setFormScores(prev => {
      const next = [...prev];
      const row = { ...next[index], [field]: val };
      // Weighted final score: 30% Tugas + 30% UTS + 40% UAS
      const finalScore = Math.round((row.nilaiTugas * 0.3) + (row.nilaiUts * 0.3) + (row.nilaiUas * 0.4));
      row.nilaiAkhir = finalScore;
      
      if (finalScore >= 88) row.predikat = 'A';
      else if (finalScore >= 78) row.predikat = 'B';
      else if (finalScore >= 68) row.predikat = 'C';
      else row.predikat = 'D';

      next[index] = row;
      return next;
    });
  };

  const handleSaveGradesOnly = () => {
    const updated: ReportCard = {
      ...currentReport,
      studentId: selectedStudentId,
      academicYear,
      semester,
      scores: formScores,
      sikapSpiritual: spiritualAttitude,
      sikapSosial: socialAttitude,
      attendanceSummary: attendanceRecap,
      teacherNotes,
      issueCity: currentReport.issueCity || schoolProfile.city,
      issueDate: currentReport.issueDate || new Date().toISOString().split('T')[0]
    };
    saveReportCard(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  // Determine whether this is TK (Taman Kanak-kanak) level
  const isTKLevel = 
    Boolean(schoolProfile.educationLevel && schoolProfile.educationLevel.toLowerCase().includes('tk')) ||
    Boolean(selectedStudent?.className && selectedStudent.className.toLowerCase().includes('tk')) ||
    formScores.some(s => s.subjectName.toLowerCase().includes('moral') || s.subjectName.toLowerCase().includes('motorik'));

  const kurikulumFaseText = isTKLevel ? 'Fase Fondasi (PAUD / TK)' : 'Fase D (Kurikulum Merdeka)';

  const handleDownloadPdf = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header from School Profile
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text((schoolProfile.letterheadProvince || 'DINAS PENDIDIKAN').toUpperCase(), 105, 17, { align: 'center' });
    doc.setFontSize(11);
    doc.text((schoolProfile.letterheadAgency || 'KANTOR WILAYAH PENDIDIKAN').toUpperCase(), 105, 23, { align: 'center' });
    doc.setFontSize(14);
    doc.text((schoolProfile.schoolName || 'SEKOLAH').toUpperCase(), 105, 30, { align: 'center' });
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${schoolProfile.address}, ${schoolProfile.city} | NPSN: ${schoolProfile.npsn} | Akreditasi: ${schoolProfile.accreditation}`, 105, 35, { align: 'center' });
    
    doc.setLineWidth(0.6);
    doc.line(15, 38, 195, 38);
    doc.setLineWidth(0.2);
    doc.line(15, 39.5, 195, 39.5);

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const titleText = isTKLevel 
      ? 'LAPORAN PERKEMBANGAN PESERTA DIDIK (RAPORT TK / PAUD)' 
      : 'LAPORAN HASIL CAPAIAN BELAJAR SISWA (RAPORT)';
    doc.text(titleText, 105, 46, { align: 'center' });

    // Student Info
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nama Peserta Didik : ${selectedStudent?.name || '-'}`, 15, 53);
    doc.text(`NISN / NIK          : ${selectedStudent?.nisn || '-'}`, 15, 58);
    doc.text(`Kelas / Rombel      : Kelas ${selectedStudent?.className || '-'}`, 130, 53);
    doc.text(`Semester / T.A.     : ${semester} / ${academicYear}`, 130, 58);

    // Table Header
    let y = 64;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, 180, 7, 'F');
    doc.rect(15, y, 180, 7, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('No', 18, y + 4.8);
    doc.text(isTKLevel ? 'Lingkup Perkembangan / Pembelajaran' : 'Mata Pelajaran', 30, y + 4.8);
    doc.text('KKM', 115, y + 4.8);
    doc.text('Nilai Akhir', 133, y + 4.8);
    doc.text('Predikat', 165, y + 4.8);

    // Table Rows
    doc.setFont('helvetica', 'normal');
    y += 7;
    formScores.forEach((score, idx) => {
      doc.rect(15, y, 180, 6.5, 'S');
      doc.text(`${idx + 1}`, 18, y + 4.5);
      doc.text(score.subjectName, 30, y + 4.5);
      doc.text(`${score.kkm}`, 118, y + 4.5);
      doc.text(`${score.nilaiAkhir}`, 140, y + 4.5);
      doc.text(score.predikat, 172, y + 4.5);
      y += 6.5;
    });

    // Sikap & Kehadiran
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Catatan Perkembangan Karakter & Kehadiran:', 15, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`- Sikap Spiritual : ${spiritualAttitude} | Sikap Sosial : ${socialAttitude}`, 15, y);
    y += 5;
    doc.text(`- Kehadiran Siswa : Sakit: ${attendanceRecap.sakit} hari, Izin: ${attendanceRecap.izin} hari, Alpa: ${attendanceRecap.alpa} hari`, 15, y);
    y += 5;
    doc.text(`- Catatan Wali    : "${teacherNotes}"`, 15, y);

    // Signatures
    y += 18;
    const documentCity = currentReport.issueCity || schoolProfile.city || 'Kota Bandung';
    const documentDate = currentReport.issueDate || '2026-12-19';

    doc.text(`Mengetahui,`, 20, y);
    doc.text(`${documentCity}, ${documentDate}`, 135, y);
    y += 4;
    doc.text(`Kepala Sekolah`, 20, y);
    doc.text(`Wali Kelas ${selectedStudent?.className || ''}`, 135, y);

    y += 19;
    doc.setFont('helvetica', 'bold');
    doc.text(schoolProfile.headmasterName, 20, y);
    doc.text(currentReport.homeroomTeacherName || 'Wali Kelas', 135, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`NIP: ${schoolProfile.headmasterNip}`, 20, y);
    doc.text(`NIP: ${currentReport.homeroomTeacherNip || '-'}`, 135, y);

    const safeName = (selectedStudent?.name || 'Siswa').replace(/\s+/g, '_');
    const safeClass = selectedStudent?.className || 'Kelas';
    doc.save(`Raport_${safeName}_Kelas_${safeClass}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-rose-400" />
                <span>Modul Cetak Raport Siswa</span>
              </h1>
              {isTKLevel && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Jenjang TK / PAUD
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cetak raport resmi format PDF, input nilai berkala, dan konfigurasi komponen raport terpadu.
            </p>
          </div>
        </div>

        {/* Action Buttons: Switch view, SETTINGS, and Print / PDF */}
        <div className="flex items-center gap-2.5 flex-wrap self-stretch sm:self-auto">
          {/* Tombol Seting Raport (Request Spesifik User) */}
          <button
            type="button"
            onClick={handleOpenConfigModal}
            className="py-2 px-3.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-amber-400/40"
            title="Pengaturan Bagian Penting Raport: Tahun Ajaran, Semester, Mapel/KKM, Wali Kelas, dan Kota/Tanggal"
          >
            <Settings className="w-4 h-4 text-slate-950 animate-spin-slow" />
            <span>Pengaturan Raport</span>
          </button>

          {/* Toggle View */}
          <div className="flex items-center p-1 bg-slate-800 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeView === 'preview'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dokumen Raport
            </button>
            <button
              onClick={() => setActiveView('input')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeView === 'input'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Edit Nilai & Catatan
            </button>
          </div>

          <button
            onClick={handleNativePrint}
            className="py-2 px-3 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5"
            title="Cetak langsung ke printer atau Save as PDF"
          >
            <Printer className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Cetak Dokumen</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="py-2 px-3.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 active:translate-y-0.5"
            title="Download file PDF langsung"
          >
            <Download className="w-4 h-4" />
            <span>Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Student Picker Selector Bar (Hidden in Print) */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 no-print shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <School className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pilih Siswa Penerima Raport:
            </label>
            {students.length === 0 ? (
              <div className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/60 rounded-xl px-3 py-1.5 mt-1 font-semibold">
                Belum ada data siswa di database.
              </div>
            ) : (
              <select
                value={selectedStudent?.id || selectedStudentId}
                onChange={(e) => handleSelectStudent(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-sm font-bold text-white rounded-xl px-3 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} &bull; Kelas {s.className} (NISN: {s.nisn})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Quick summary chips of active settings */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px]">Tahun Pelajaran:</span>
            <span className="text-white font-semibold">{academicYear}</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-slate-400 block text-[10px]">Semester:</span>
            <span className="text-rose-400 font-semibold">{semester}</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-slate-400 block text-[10px]">Mata Pelajaran:</span>
            <span className="text-emerald-400 font-semibold">{formScores.length} Mapel</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-slate-400 block text-[10px]">Wali Kelas:</span>
            <span className="text-white font-semibold">{currentReport.homeroomTeacherName || 'Belum diatur'}</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-slate-400 block text-[10px]">Penerbitan:</span>
            <span className="text-indigo-300 font-semibold">
              {currentReport.issueCity || schoolProfile.city}, {currentReport.issueDate}
            </span>
          </div>
        </div>
      </div>

      {/* VIEW 1: Input / Edit Nilai & Catatan */}
      {activeView === 'input' && (
        <div className="space-y-6 no-print">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Input Nilai Peserta Didik</h3>
                <p className="text-xs text-slate-400">
                  Bobot kalkulasi otomatis: Tugas (30%), UTS (30%), UAS (40%) &bull; Predikat otomatis dihitung dari KKM
                </p>
              </div>
              <button
                onClick={handleSaveGradesOnly}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
              >
                {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? 'Berhasil Disimpan!' : 'Simpan Nilai Raport'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Mata Pelajaran / Lingkup</th>
                    <th className="py-2.5 px-3 text-center">KKM</th>
                    <th className="py-2.5 px-3 text-center">Nilai Tugas (30%)</th>
                    <th className="py-2.5 px-3 text-center">Nilai UTS (30%)</th>
                    <th className="py-2.5 px-3 text-center">Nilai UAS (40%)</th>
                    <th className="py-2.5 px-3 text-center">Nilai Akhir</th>
                    <th className="py-2.5 px-3 text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {formScores.map((score, index) => (
                    <tr key={score.subjectId || index} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-medium text-white">{score.subjectName}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">{score.kkm}</td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={score.nilaiTugas}
                          onChange={(e) => handleScoreChange(index, 'nilaiTugas', Number(e.target.value))}
                          className="w-16 text-center bg-slate-950 border border-slate-700 rounded-lg py-1 text-xs text-white font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={score.nilaiUts}
                          onChange={(e) => handleScoreChange(index, 'nilaiUts', Number(e.target.value))}
                          className="w-16 text-center bg-slate-950 border border-slate-700 rounded-lg py-1 text-xs text-white font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={score.nilaiUas}
                          onChange={(e) => handleScoreChange(index, 'nilaiUas', Number(e.target.value))}
                          className="w-16 text-center bg-slate-950 border border-slate-700 rounded-lg py-1 text-xs text-white font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-sm text-emerald-400 font-mono">
                        {score.nilaiAkhir}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          score.predikat === 'A' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          score.predikat === 'B' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {score.predikat}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sikap & Catatan Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Penilaian Sikap Spiritual
                </label>
                <select
                  value={spiritualAttitude}
                  onChange={(e) => setSpiritualAttitude(e.target.value as ReportCard['sikapSpiritual'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Sangat Baik">Sangat Baik</option>
                  <option value="Baik">Baik</option>
                  <option value="Cukup">Cukup</option>
                  <option value="Kurang">Kurang</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Penilaian Sikap Sosial
                </label>
                <select
                  value={socialAttitude}
                  onChange={(e) => setSocialAttitude(e.target.value as ReportCard['sikapSosial'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Sangat Baik">Sangat Baik</option>
                  <option value="Baik">Baik</option>
                  <option value="Cukup">Cukup</option>
                  <option value="Kurang">Kurang</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Wali Kelas untuk Perkembangan Siswa
                </label>
                <textarea
                  rows={2}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Official Printable Raport Document */}
      <div className="printable-raport max-w-4xl mx-auto bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-200">
        
        {/* Official Kop Surat Sekolah */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center relative">
          <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl absolute left-2 top-0 hidden sm:flex">
            ST
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {schoolProfile.letterheadProvince} &bull; {schoolProfile.letterheadAgency}
          </h3>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase mt-0.5">
            {schoolProfile.schoolName}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {schoolProfile.address}, {schoolProfile.city}, {schoolProfile.province} {schoolProfile.postalCode} &bull; Telp: {schoolProfile.phone}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            NPSN: {schoolProfile.npsn} &bull; NSS: {schoolProfile.nss} &bull; Akreditasi: {schoolProfile.accreditation}
          </p>
        </div>

        {/* Title */}
        <div className="text-center my-4">
          <h4 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
            {isTKLevel 
              ? 'Laporan Hasil Perkembangan Anak Usia Dini (Raport TK)' 
              : 'Laporan Hasil Capaian Kompetensi Peserta Didik'}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Tahun Ajaran {academicYear} &bull; Semester {semester}
          </p>
        </div>

        {/* Student Biodata Strip */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-6 text-xs text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
          <div className="flex">
            <span className="w-36 font-semibold text-slate-600">Nama Peserta Didik</span>
            <span className="font-bold text-slate-950">: {selectedStudent?.name || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-semibold text-slate-600">Kelas / Rombel</span>
            <span className="font-bold text-slate-950">: Kelas {selectedStudent?.className || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-semibold text-slate-600">Nomor Induk Siswa (NISN)</span>
            <span className="font-mono text-slate-900">: {selectedStudent?.nisn || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-semibold text-slate-600">Fase / Kurikulum</span>
            <span className="text-slate-900 font-semibold">: {kurikulumFaseText}</span>
          </div>
        </div>

        {/* Subject Scores Table */}
        <div className="overflow-hidden border border-slate-300 rounded-lg mb-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-300 w-10 text-center">No</th>
                <th className="py-2.5 px-3 border-r border-slate-300">
                  {isTKLevel ? 'Lingkup Perkembangan / Pembelajaran' : 'Mata Pelajaran'}
                </th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">KKM</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-20">Nilai Akhir</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Predikat</th>
                <th className="py-2.5 px-3">Capaian Kompetensi / Deskripsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {formScores.map((score, idx) => (
                <tr key={score.subjectId || idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                  <td className="py-2 px-3 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-medium text-slate-950">{score.subjectName}</td>
                  <td className="py-2 px-3 border-r border-slate-300 text-center font-mono">{score.kkm}</td>
                  <td className="py-2 px-3 border-r border-slate-300 text-center font-bold font-mono text-slate-950">
                    {score.nilaiAkhir}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">
                    {score.predikat}
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-700 leading-tight">
                    {score.deskripsi}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Section: Sikap, Ekstrakurikuler, & Kehadiran */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-8">
          {/* Sikap & Ekstrakurikuler */}
          <div className="border border-slate-300 rounded-lg p-3.5 space-y-2">
            <h5 className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              A. Sikap & Ekstrakurikuler
            </h5>
            <div className="text-[11px] space-y-1">
              <div>Sikap Spiritual: <strong>{spiritualAttitude}</strong></div>
              <div>Sikap Sosial: <strong>{socialAttitude}</strong></div>
            </div>
            <div className="pt-2 text-[11px]">
              <div className="font-semibold text-slate-800">Kegiatan Ekstrakurikuler / Minat Bakat:</div>
              <ul className="list-disc list-inside text-slate-600 mt-0.5 space-y-0.5">
                {currentReport.extracurriculars.map((ekskul, i) => (
                  <li key={i}>
                    {ekskul.name} (Predikat {ekskul.score}): {ekskul.notes}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Kehadiran & Catatan */}
          <div className="border border-slate-300 rounded-lg p-3.5 space-y-2">
            <h5 className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              B. Ketidakhadiran & Catatan Pendidik
            </h5>
            <div className="grid grid-cols-3 gap-2 text-center py-1 bg-slate-50 rounded">
              <div>Sakit: <strong>{attendanceRecap.sakit} hari</strong></div>
              <div>Izin: <strong>{attendanceRecap.izin} hari</strong></div>
              <div>Alpa: <strong>{attendanceRecap.alpa} hari</strong></div>
            </div>
            <div className="pt-1 text-[11px] text-slate-700">
              <span className="font-semibold block text-slate-900">Catatan Wali Kelas:</span>
              <p className="italic bg-slate-50 p-2 rounded mt-1 border border-slate-200">
                &ldquo;{teacherNotes}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Signatures & Verification Stamp */}
        <div className="pt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-xs text-center items-end">
          <div>
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-bold text-slate-950 mt-1">Kepala Sekolah</p>
            <div className="h-16 flex items-center justify-center">
              <div className="w-16 h-16 border border-dashed border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400">
                [Stempel]
              </div>
            </div>
            <p className="font-bold text-slate-950 underline">{schoolProfile.headmasterName}</p>
            <p className="text-[10px] text-slate-600 font-mono">NIP. {schoolProfile.headmasterNip}</p>
          </div>

          {/* Center QR Digital Validation */}
          <div className="flex flex-col items-center justify-center">
            <div className="p-2 border border-slate-300 rounded-xl bg-slate-50">
              <QrCode className="w-12 h-12 text-slate-900" />
            </div>
            <p className="text-[9px] text-slate-500 font-mono mt-1">
              Verifikasi Dokumen Resmi
            </p>
            <p className="text-[8px] text-slate-400">
              ID: {currentReport.id}
            </p>
          </div>

          <div>
            <p className="text-slate-600">
              {currentReport.issueCity || schoolProfile.city || 'Kota Bandung'}, {currentReport.issueDate || '2026-12-19'}
            </p>
            <p className="font-bold text-slate-950 mt-1">Wali Kelas {selectedStudent?.className || ''}</p>
            <div className="h-16 flex items-center justify-center">
              <div className="text-[11px] text-slate-400 italic">
                (Tanda Tangan)
              </div>
            </div>
            <p className="font-bold text-slate-950 underline">{currentReport.homeroomTeacherName || 'Wali Kelas'}</p>
            <p className="text-[10px] text-slate-600 font-mono">NIP. {currentReport.homeroomTeacherNip || '-'}</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL PENGATURAN RAPORT (USER REQUEST) */}
      {/* ========================================================================= */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-[1px] shadow-md shadow-amber-500/20">
                  <div className="w-full h-full bg-slate-900 rounded-[15px] flex items-center justify-center">
                    <Sliders className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Pengaturan Format & Komponen Raport
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ubah tahun ajaran, semester, mata pelajaran & KKM, wali kelas, serta kota dan tanggal dokumen
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-200">
              
              {/* SECTION 1: TAHUN AJARAN & SEMESTER */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>1. Tahun Ajaran & Semester</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Tahun Ajaran</label>
                    <input
                      type="text"
                      value={cfgAcademicYear}
                      onChange={(e) => setCfgAcademicYear(e.target.value)}
                      placeholder="Contoh: 2025/2026"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500">Pilihan cepat:</span>
                      {['2025/2026', '2026/2027', '2024/2025'].map(yr => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setCfgAcademicYear(yr)}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Semester</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCfgSemester('Ganjil')}
                        className={`py-2 px-3 rounded-xl font-bold transition-all ${
                          cfgSemester === 'Ganjil'
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Ganjil (Semester 1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgSemester('Genap')}
                        className={`py-2 px-3 rounded-xl font-bold transition-all ${
                          cfgSemester === 'Genap'
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Genap (Semester 2)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: KELOLA MATA PELAJARAN & KKM */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>2. Kelola Mata Pelajaran & Nilai KKM ({cfgSubjects.length} Mapel)</span>
                  </h3>

                  {/* Template Presets Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Muat Template:</span>
                    <button
                      type="button"
                      onClick={() => handleLoadPresetSubjects('TK')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-colors"
                      title="Terapkan 6 Lingkup Perkembangan Resmi Jenjang TK / PAUD"
                    >
                      🎨 Format TK / PAUD
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadPresetSubjects('SD')}
                      className="px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[10px] font-semibold transition-colors"
                    >
                      Format SD
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadPresetSubjects('SMP')}
                      className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[10px] font-semibold transition-colors"
                    >
                      Format SMP
                    </button>
                  </div>
                </div>

                {/* Subject List Table with Delete & Edit */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3 w-8 text-center">No</th>
                        <th className="py-2 px-3">Nama Mata Pelajaran / Lingkup Belajar</th>
                        <th className="py-2 px-3 w-28 text-center">Nilai KKM</th>
                        <th className="py-2 px-3 w-16 text-center">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {cfgSubjects.map((sub, idx) => (
                        <tr key={sub.id || idx} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={sub.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCfgSubjects(prev => prev.map((item, i) => i === idx ? { ...item, name: val } : item));
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-emerald-400"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={sub.kkm}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                setCfgSubjects(prev => prev.map((item, i) => i === idx ? { ...item, kkm: val } : item));
                              }}
                              className="w-16 text-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(idx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                              title="Hapus mata pelajaran ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Form to Add New Subject */}
                <form onSubmit={handleAddNewSubject} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Ketik nama mata pelajaran baru..."
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-slate-400">KKM:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={newSubKkm}
                        onChange={(e) => setNewSubKkm(Number(e.target.value))}
                        className="w-16 text-center bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Mapel</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 3: WALI KELAS BESERTA NIP */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <span>3. Nama Wali Kelas Beserta NIP</span>
                  </h3>
                  
                  {/* Select from Teachers DB */}
                  {teachers.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Pilih dari Database:</span>
                      <select
                        onChange={(e) => handleSelectTeacherFromDb(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded-lg px-2 py-1 focus:outline-none"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Pilih Guru --</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} {t.assignedClass ? `(Wali ${t.assignedClass})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Nama Lengkap & Gelar Wali Kelas</label>
                    <input
                      type="text"
                      value={cfgHomeroomTeacherName}
                      onChange={(e) => setCfgHomeroomTeacherName(e.target.value)}
                      placeholder="Contoh: Dra. Siti Aminah, M.Pd"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">NIP Wali Kelas</label>
                    <input
                      type="text"
                      value={cfgHomeroomTeacherNip}
                      onChange={(e) => setCfgHomeroomTeacherNip(e.target.value)}
                      placeholder="Contoh: 19850315 200902 2 004 (atau - jika non PNS)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: NAMA KOTA DOKUMEN DIBUAT BESERTA TANGGALNYA */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>4. Nama Kota Dokumen Dibuat Beserta Tanggalnya</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Nama Kota Penerbitan</label>
                    <input
                      type="text"
                      value={cfgIssueCity}
                      onChange={(e) => setCfgIssueCity(e.target.value)}
                      placeholder="Contoh: Kota Bandung, Jakarta, Surabaya"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Akan tercantum pada bagian tanda tangan: &ldquo;{cfgIssueCity || 'Kota'}, {cfgIssueDate}&rdquo;
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Tanggal Dokumen Raport</label>
                    <input
                      type="date"
                      value={cfgIssueDate}
                      onChange={(e) => setCfgIssueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: PILIHAN TERAPKAN KE SEMUA SISWA */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="applyAll"
                  checked={applyToAllStudents}
                  onChange={(e) => setApplyToAllStudents(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
                <label htmlFor="applyAll" className="cursor-pointer">
                  <span className="font-bold text-white block text-xs">
                    Terapkan pengaturan ini ke semua siswa ({students.length} peserta didik)
                  </span>
                  <span className="text-[11px] text-indigo-300">
                    Sangat dianjurkan agar format mata pelajaran, KKM, tahun ajaran, dan tanggal raport seragam untuk satu angkatan / rombel.
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-500/20 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan & Terapkan Pengaturan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
