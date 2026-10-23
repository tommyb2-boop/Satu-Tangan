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
  QrCode
} from 'lucide-react';
import { INITIAL_REPORT_CARD } from '../../data/initialData';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

const DEFAULT_SUBJECTS = [
  'Pendidikan Agama & Budi Pekerti',
  'Pendidikan Pancasila & Kewarganegaraan',
  'Bahasa Indonesia',
  'Matematika',
  'Ilmu Pengetahuan Alam (IPA)',
  'Ilmu Pengetahuan Sosial (IPS)',
  'Bahasa Inggris',
  'Pendidikan Jasmani, Olahraga & Kesehatan',
  'Seni Budaya & Prakarya'
];

export const ReportCardModule: React.FC = () => {
  const { students, reportCards, saveReportCard, setActiveTab, schoolProfile } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'std-01');
  const [activeView, setActiveView] = useState<'input' | 'preview'>('preview');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Load existing report card or create default draft
  const currentReport: ReportCard = reportCards[selectedStudentId] || {
    ...INITIAL_REPORT_CARD,
    id: 'rep-' + selectedStudentId,
    studentId: selectedStudentId,
  };

  const [formScores, setFormScores] = useState<SubjectScore[]>(currentReport.scores);
  const [academicYear, setAcademicYear] = useState(currentReport.academicYear);
  const [semester, setSemester] = useState(currentReport.semester);
  const [spiritualAttitude, setSpiritualAttitude] = useState(currentReport.sikapSpiritual);
  const [socialAttitude, setSocialAttitude] = useState(currentReport.sikapSosial);
  const [teacherNotes, setTeacherNotes] = useState(currentReport.teacherNotes);
  const [attendanceRecap, setAttendanceRecap] = useState(currentReport.attendanceSummary);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // When changing student, sync state
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const existing = reportCards[id] || {
      ...INITIAL_REPORT_CARD,
      id: 'rep-' + id,
      studentId: id
    };
    setFormScores(existing.scores);
    setAcademicYear(existing.academicYear);
    setSemester(existing.semester);
    setSpiritualAttitude(existing.sikapSpiritual);
    setSocialAttitude(existing.sikapSosial);
    setTeacherNotes(existing.teacherNotes);
    setAttendanceRecap(existing.attendanceSummary);
    setSaveSuccess(false);
  };

  // Score row change
  const handleScoreChange = (index: number, field: 'nilaiTugas' | 'nilaiUts' | 'nilaiUas', val: number) => {
    setFormScores(prev => {
      const next = [...prev];
      const row = { ...next[index], [field]: val };
      // Calculate weighted final score (30% Tugas + 30% UTS + 40% UAS)
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

  const handleSave = () => {
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
      issueDate: new Date().toISOString().split('T')[0]
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

  const handleDownloadPdf = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header from School Profile
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(schoolProfile.letterheadProvince.toUpperCase(), 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text(schoolProfile.letterheadAgency.toUpperCase(), 105, 24, { align: 'center' });
    doc.setFontSize(15);
    doc.text(schoolProfile.schoolName.toUpperCase(), 105, 31, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${schoolProfile.address}, ${schoolProfile.city} | NPSN: ${schoolProfile.npsn} | Akreditasi: ${schoolProfile.accreditation}`, 105, 36, { align: 'center' });
    
    doc.setLineWidth(0.6);
    doc.line(15, 39, 195, 39);
    doc.setLineWidth(0.2);
    doc.line(15, 40.5, 195, 40.5);

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('LAPORAN HASIL BELAJAR SISWA (RAPORT)', 105, 47, { align: 'center' });

    // Student Info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nama Peserta Didik : ${selectedStudent.name}`, 15, 54);
    doc.text(`NISN / NIK          : ${selectedStudent.nisn}`, 15, 60);
    doc.text(`Kelas / Rombel      : Kelas ${selectedStudent.className}`, 130, 54);
    doc.text(`Semester / T.A.     : ${semester} / ${academicYear}`, 130, 60);

    // Table Header
    let y = 67;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, 180, 7, 'F');
    doc.rect(15, y, 180, 7, 'S');
    doc.setFont('helvetica', 'bold');
    doc.text('No', 18, y + 5);
    doc.text('Mata Pelajaran', 30, y + 5);
    doc.text('KKM', 115, y + 5);
    doc.text('Nilai Akhir', 135, y + 5);
    doc.text('Predikat', 165, y + 5);

    // Table Rows
    doc.setFont('helvetica', 'normal');
    y += 7;
    formScores.forEach((score, idx) => {
      doc.rect(15, y, 180, 6.5, 'S');
      doc.text(`${idx + 1}`, 18, y + 4.5);
      doc.text(score.subjectName, 30, y + 4.5);
      doc.text(`${score.kkm}`, 118, y + 4.5);
      doc.text(`${score.nilaiAkhir}`, 142, y + 4.5);
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
    doc.text(`Mengetahui,`, 20, y);
    doc.text(`${schoolProfile.city}, ${currentReport.issueDate}`, 140, y);
    y += 4;
    doc.text(`Kepala Sekolah`, 20, y);
    doc.text(`Wali Kelas ${selectedStudent.className}`, 140, y);

    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.text(schoolProfile.headmasterName, 20, y);
    doc.text(currentReport.homeroomTeacherName, 140, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`NIP: ${schoolProfile.headmasterNip}`, 20, y);
    doc.text(`NIP: ${currentReport.homeroomTeacherNip}`, 140, y);

    doc.save(`Raport_${selectedStudent.name.replace(/\s+/g, '_')}_${selectedStudent.className}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Breadcrumb (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
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
              <FileSpreadsheet className="w-6 h-6 text-rose-400" />
              <span>Modul Cetak Raport Siswa</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Input nilai akademik, rekapitulasi capaian kompetensi, dan cetak dokumen resmi format PDF.
            </p>
          </div>
        </div>

        {/* Action Buttons: Switch view & Print / PDF */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
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
            className="py-2 px-3.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5"
            title="Cetak langsung ke printer atau Save as PDF melalui browser"
          >
            <Printer className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Cetak Dokumen</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="py-2 px-3.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 active:translate-y-0.5"
            title="Download file PDF langsung"
          >
            <Download className="w-4 h-4" />
            <span>Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Student Picker Selector Bar (Hidden in Print) */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <School className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pilih Siswa Penerima Raport:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleSelectStudent(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-sm font-bold text-white rounded-xl px-3 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} &bull; Kelas {s.className} (NISN: {s.nisn})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Tahun Pelajaran:</span>
            <span className="text-white font-semibold">{academicYear}</span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-400 block text-[11px]">Semester:</span>
            <span className="text-rose-400 font-semibold">{semester}</span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-400 block text-[11px]">Wali Kelas:</span>
            <span className="text-white font-semibold">{currentReport.homeroomTeacherName}</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: Input / Edit Nilai & Catatan */}
      {activeView === 'input' && (
        <div className="space-y-6 no-print">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Input Nilai Mata Pelajaran</h3>
                <p className="text-xs text-slate-400">Bobot otomatis: Tugas (30%), UTS (30%), UAS (40%)</p>
              </div>
              <button
                onClick={handleSave}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 flex items-center gap-2"
              >
                {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? 'Berhasil Disimpan!' : 'Simpan Nilai Raport'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Mata Pelajaran</th>
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
                    <tr key={score.subjectId} className="hover:bg-slate-800/30">
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
        
        {/* Official Kop Surat Sekolah - Synchronized with School Profile */}
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
            Laporan Hasil Capaian Kompetensi Peserta Didik
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Tahun Ajaran {academicYear} &bull; Semester {semester}
          </p>
        </div>

        {/* Student Biodata Strip */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-6 text-xs text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
          <div className="flex">
            <span className="w-36 font-semibold text-slate-600">Nama Peserta Didik</span>
            <span className="font-bold text-slate-950">: {selectedStudent.name}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-semibold text-slate-600">Kelas / Rombel</span>
            <span className="font-bold text-slate-950">: Kelas {selectedStudent.className}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-semibold text-slate-600">Nomor Induk Siswa (NISN)</span>
            <span className="font-mono text-slate-900">: {selectedStudent.nisn}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-semibold text-slate-600">Fase / Kurikulum</span>
            <span className="text-slate-900">: Fase D (Kurikulum Merdeka)</span>
          </div>
        </div>

        {/* Subject Scores Table */}
        <div className="overflow-hidden border border-slate-300 rounded-lg mb-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-300 w-10 text-center">No</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Mata Pelajaran</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">KKM</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-20">Nilai Akhir</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Predikat</th>
                <th className="py-2.5 px-3">Capaian Kompetensi / Deskripsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {formScores.map((score, idx) => (
                <tr key={score.subjectId} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
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
              <div className="font-semibold text-slate-800">Kegiatan Ekstrakurikuler:</div>
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
            <p className="text-slate-600">{schoolProfile.city}, {currentReport.issueDate}</p>
            <p className="font-bold text-slate-950 mt-1">Wali Kelas {selectedStudent.className}</p>
            <div className="h-16 flex items-center justify-center">
              <div className="text-[11px] text-slate-400 italic">
                (Tanda Tangan)
              </div>
            </div>
            <p className="font-bold text-slate-950 underline">{currentReport.homeroomTeacherName}</p>
            <p className="text-[10px] text-slate-600 font-mono">NIP. {currentReport.homeroomTeacherNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
