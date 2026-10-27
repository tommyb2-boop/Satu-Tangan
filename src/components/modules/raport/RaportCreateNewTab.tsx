import React, { useState, useEffect, useMemo } from 'react';
import { ReportCard, Student, Teacher, SubjectScore, SchoolProfile } from '../../../types';
import { 
  Plus, 
  Save, 
  Printer, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Users, 
  Calendar, 
  BookOpen, 
  Award, 
  Trash2, 
  Layers, 
  Info,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EditableScoreItem {
  subjectId: string;
  subjectName: string;
  kkm: number;
  nilaiTugas: string | number; // String allows completely blank '' state
  nilaiUts: string | number;
  nilaiUas: string | number;
  nilaiAkhir: number | string;
  predikat: 'A' | 'B' | 'C' | 'D' | '-';
  deskripsi: string;
}

const DEFAULT_SUBJECTS_LIST = [
  { id: 'sub-01', name: 'Pendidikan Agama & Budi Pekerti', kkm: 75 },
  { id: 'sub-02', name: 'Pendidikan Pancasila & Kewarganegaraan', kkm: 75 },
  { id: 'sub-03', name: 'Bahasa Indonesia', kkm: 75 },
  { id: 'sub-04', name: 'Matematika', kkm: 72 },
  { id: 'sub-05', name: 'Ilmu Pengetahuan Alam (IPA)', kkm: 75 },
  { id: 'sub-06', name: 'Ilmu Pengetahuan Sosial (IPS)', kkm: 75 },
  { id: 'sub-07', name: 'Bahasa Inggris', kkm: 75 },
  { id: 'sub-08', name: 'Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)', kkm: 75 },
  { id: 'sub-09', name: 'Seni Budaya & Prakarya', kkm: 75 },
  { id: 'sub-10', name: 'Informatika & Keterampilan Digital', kkm: 75 }
];

interface RaportCreateNewTabProps {
  students: Student[];
  teachers: Teacher[];
  schoolProfile: SchoolProfile;
  onSaveReport: (report: ReportCard, shouldPrintAfter?: boolean) => void;
  onBulkInitializeClass: (className: string, academicYear: string, semester: 'Ganjil' | 'Genap') => void;
  onCancelToDatabase: () => void;
  initialEditReport?: ReportCard | null;
}

export const RaportCreateNewTab: React.FC<RaportCreateNewTabProps> = ({
  students,
  teachers,
  schoolProfile,
  onSaveReport,
  onBulkInitializeClass,
  onCancelToDatabase,
  initialEditReport
}) => {
  // Available active students
  const activeStudents = useMemo(() => {
    return students.filter(s => s.activeStatus === 'Aktif');
  }, [students]);

  // Selected Student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialEditReport?.studentId || activeStudents[0]?.id || students[0]?.id || ''
  );

  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Academic Configuration
  const [academicYear, setAcademicYear] = useState<string>(
    initialEditReport?.academicYear || '2026/2027'
  );
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(
    initialEditReport?.semester || 'Ganjil'
  );
  const [issueDate, setIssueDate] = useState<string>(
    initialEditReport?.issueDate || new Date().toISOString().split('T')[0]
  );
  const [issueCity, setIssueCity] = useState<string>(
    initialEditReport?.issueCity || schoolProfile.city || 'Kota Bandung'
  );

  // Homeroom Teacher
  const [homeroomTeacherName, setHomeroomTeacherName] = useState<string>(
    initialEditReport?.homeroomTeacherName || 'Siti Aminah, S.Pd., M.Si.'
  );
  const [homeroomTeacherNip, setHomeroomTeacherNip] = useState<string>(
    initialEditReport?.homeroomTeacherNip || '19850315 200902 2 004'
  );

  // EMPTY SCORES by default (Nilai Masih Kosong)
  const initializeEmptyScores = (): EditableScoreItem[] => {
    return DEFAULT_SUBJECTS_LIST.map(sub => ({
      subjectId: sub.id,
      subjectName: sub.name,
      kkm: sub.kkm,
      nilaiTugas: '',
      nilaiUts: '',
      nilaiUas: '',
      nilaiAkhir: '-',
      predikat: '-',
      deskripsi: ''
    }));
  };

  const [scores, setScores] = useState<EditableScoreItem[]>(() => {
    if (initialEditReport && initialEditReport.scores && initialEditReport.scores.length > 0) {
      return initialEditReport.scores.map(s => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        kkm: s.kkm,
        nilaiTugas: s.nilaiTugas || '',
        nilaiUts: s.nilaiUts || '',
        nilaiUas: s.nilaiUas || '',
        nilaiAkhir: s.nilaiAkhir || '-',
        predikat: s.predikat || '-',
        deskripsi: s.deskripsi || ''
      }));
    }
    return initializeEmptyScores();
  });

  // Attitudes
  const [spiritualAttitude, setSpiritualAttitude] = useState<ReportCard['sikapSpiritual']>(
    initialEditReport?.sikapSpiritual || 'Baik'
  );
  const [socialAttitude, setSocialAttitude] = useState<ReportCard['sikapSosial']>(
    initialEditReport?.sikapSosial || 'Baik'
  );

  // Extracurriculars
  const [extracurriculars, setExtracurriculars] = useState<Array<{ name: string; score: string; notes: string }>>(
    initialEditReport?.extracurriculars || [
      { name: 'Pramuka (Wajib)', score: 'A', notes: 'Disiplin dan aktif dalam kegiatan kepramukaan' }
    ]
  );

  // Attendance
  const [attendance, setAttendance] = useState({
    sakit: initialEditReport?.attendanceSummary?.sakit ?? 0,
    izin: initialEditReport?.attendanceSummary?.izin ?? 0,
    alpa: initialEditReport?.attendanceSummary?.alpa ?? 0
  });

  // Homeroom Notes
  const [teacherNotes, setTeacherNotes] = useState<string>(
    initialEditReport?.teacherNotes || 'Tingkatkan terus semangat belajar dan pertahankan prestasi di semester berikutnya.'
  );

  // Bulk Class Init Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkClassName, setBulkClassName] = useState('7A');
  const [saveAlertMsg, setSaveAlertMsg] = useState('');

  // Handle Score Input Change and calculate Nilai Akhir & Predikat
  const handleScoreChange = (index: number, field: 'nilaiTugas' | 'nilaiUts' | 'nilaiUas' | 'kkm' | 'deskripsi', value: string) => {
    setScores(prev => {
      const next = [...prev];
      const item = { ...next[index] };

      if (field === 'deskripsi') {
        item.deskripsi = value;
      } else if (field === 'kkm') {
        item.kkm = Number(value) || 75;
      } else {
        // Numeric inputs for tugas, uts, uas
        const sanitized = value === '' ? '' : Math.min(100, Math.max(0, Number(value) || 0));
        item[field] = sanitized;

        // Auto calculate Nilai Akhir if any score entered
        const t = item.nilaiTugas === '' ? null : Number(item.nilaiTugas);
        const u = item.nilaiUts === '' ? null : Number(item.nilaiUts);
        const a = item.nilaiUas === '' ? null : Number(item.nilaiUas);

        if (t !== null || u !== null || a !== null) {
          // Standard weighted formula: (Tugas + UTS + 2*UAS) / 4
          const sum = (t ?? 0) + (u ?? 0) + 2 * (a ?? 0);
          const weight = (t !== null ? 1 : 0) + (u !== null ? 1 : 0) + (a !== null ? 2 : 0);
          const finalScore = weight > 0 ? Math.round(sum / weight) : 0;
          item.nilaiAkhir = finalScore;

          // Compute Predikat based on KKM
          if (finalScore >= 88) {
            item.predikat = 'A';
            if (!item.deskripsi) item.deskripsi = `Sangat istimewa dalam menguasai seluruh kompetensi dasar ${item.subjectName}.`;
          } else if (finalScore >= 78) {
            item.predikat = 'B';
            if (!item.deskripsi) item.deskripsi = `Menguasai materi ${item.subjectName} dengan baik dan aktif berdiskusi.`;
          } else if (finalScore >= item.kkm) {
            item.predikat = 'C';
            if (!item.deskripsi) item.deskripsi = `Cukup menguasai capaian pembelajaran dasar ${item.subjectName}. Perlu latihan mandiri.`;
          } else {
            item.predikat = 'D';
            if (!item.deskripsi) item.deskripsi = `Perlu pendampingan dan remedial intensif pada materi pokok ${item.subjectName}.`;
          }
        } else {
          item.nilaiAkhir = '-';
          item.predikat = '-';
        }
      }

      next[index] = item;
      return next;
    });
  };

  // Add Custom Extracurricular
  const handleAddExtracurricular = () => {
    setExtracurriculars(prev => [
      ...prev,
      { name: 'Klub Baru', score: 'B', notes: 'Aktif mengikuti kegiatan' }
    ]);
  };

  const handleRemoveExtracurricular = (index: number) => {
    setExtracurriculars(prev => prev.filter((_, idx) => idx !== index));
  };

  // Reset form to empty
  const handleResetForm = () => {
    if (confirm('Kosongkan semua nilai inputan kembali ke format awal kosong?')) {
      setScores(initializeEmptyScores());
      setAttendance({ sakit: 0, izin: 0, alpa: 0 });
      setTeacherNotes('');
    }
  };

  // Save Report Card
  const handleSave = (shouldPrintAfter: boolean = false) => {
    if (!selectedStudent) {
      alert('Pilih siswa terlebih dahulu!');
      return;
    }

    // Convert editable scores to SubjectScore format
    const formattedScores: SubjectScore[] = scores.map((s, idx) => ({
      subjectId: s.subjectId || `sub-${idx + 1}`,
      subjectName: s.subjectName,
      kkm: s.kkm,
      nilaiTugas: Number(s.nilaiTugas) || 0,
      nilaiUts: Number(s.nilaiUts) || 0,
      nilaiUas: Number(s.nilaiUas) || 0,
      nilaiAkhir: typeof s.nilaiAkhir === 'number' ? s.nilaiAkhir : Number(s.nilaiAkhir) || 0,
      predikat: s.predikat === '-' ? 'C' : s.predikat,
      deskripsi: s.deskripsi || `Capaian kompetensi pada mata pelajaran ${s.subjectName}.`
    }));

    const cleanYear = academicYear.replace(/[^a-zA-Z0-9]/g, '');
    const reportId = initialEditReport?.id || `rep-${selectedStudent.id}-${cleanYear}-${semester.toLowerCase()}`;

    const reportCardPayload: ReportCard = {
      id: reportId,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentNisn: selectedStudent.nisn,
      className: selectedStudent.className,
      statusSiswa: selectedStudent.activeStatus,
      academicYear,
      semester,
      scores: formattedScores,
      sikapSpiritual: spiritualAttitude,
      sikapSosial: socialAttitude,
      extracurriculars,
      attendanceSummary: attendance,
      teacherNotes: teacherNotes || 'Pertahankan ketekunan dan budi pekerti luhur.',
      headmasterName: schoolProfile.headmasterName || 'Drs. H. Ahmad Fauzi, M.Pd.',
      headmasterNip: schoolProfile.headmasterNip || '19780512 200212 1 002',
      homeroomTeacherName,
      homeroomTeacherNip,
      issueDate,
      issueCity
    };

    onSaveReport(reportCardPayload, shouldPrintAfter);

    setSaveAlertMsg(`Raport untuk ${selectedStudent.name} (${academicYear} ${semester}) berhasil disimpan ke database!`);
    setTimeout(() => setSaveAlertMsg(''), 3500);

    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner & Information */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/60 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5 sm:mt-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Pembuatan Raport Baru (Tahun Berjalan)</span>
              <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-700/60">
                Nilai Awal Kosong
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Seluruh kolom nilai dibuka dalam kondisi kosong siap diinput oleh pendidik. Nilai akhir dan predikat akan dihitung secara otomatis secara real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            type="button"
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Inisialisasi template raport kosong untuk seluruh siswa dalam satu kelas sekaligus"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Inisialisasi 1 Kelas Sekaligus</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveAlertMsg && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/80 rounded-xl text-emerald-200 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveAlertMsg}</span>
          </div>
          <button
            onClick={() => onCancelToDatabase()}
            className="underline hover:text-white font-bold ml-4"
          >
            Buka Database Raport
          </button>
        </div>
      )}

      {/* Section 1: Target Siswa & Konfigurasi Akademik */}
      <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>1. Pilih Siswa & Konfigurasi Tahun Pelajaran</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          {/* Pilih Siswa */}
          <div className="sm:col-span-2">
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
              Pilih Siswa (Peserta Didik):
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <optgroup label="Siswa Aktif">
                {activeStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (NISN: {s.nisn} - Kelas {s.className})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Siswa Lulus / Lainnya">
                {students.filter(s => s.activeStatus !== 'Aktif').map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Alumni - Kelas {s.className})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Tahun Pelajaran */}
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
              Tahun Pelajaran (Tahun Berjalan):
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="2026/2027">2026/2027 (Tahun Berjalan)</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2024/2025">2024/2025</option>
              <option value="2023/2024">2023/2024</option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
              Semester:
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>

          {/* Wali Kelas */}
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
              Nama Guru Wali Kelas:
            </label>
            <input
              type="text"
              value={homeroomTeacherName}
              onChange={(e) => setHomeroomTeacherName(e.target.value)}
              placeholder="Nama Guru Wali..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* NIP Wali Kelas */}
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
              NIP Wali Kelas:
            </label>
            <input
              type="text"
              value={homeroomTeacherNip}
              onChange={(e) => setHomeroomTeacherNip(e.target.value)}
              placeholder="1985..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Tanggal Raport */}
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
              Tanggal Pembagian Raport:
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Kota Terbit */}
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
              Kota Penerbitan:
            </label>
            <input
              type="text"
              value={issueCity}
              onChange={(e) => setIssueCity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Input Nilai Mata Pelajaran (NILAI AWAL KOSONG) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-950/50">
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>2. Input Nilai Mata Pelajaran (Kondisi Awal Kosong)</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ketik angka 0-100 pada Tugas, UTS, atau UAS. Nilai akhir dihitung secara proporsional.
            </p>
          </div>
          <button
            onClick={handleResetForm}
            type="button"
            className="text-[11px] text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
            title="Kosongkan seluruh nilai"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Kosong</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th scope="col" className="py-3 px-3 w-10 text-center">No</th>
                <th scope="col" className="py-3 px-3">Mata Pelajaran</th>
                <th scope="col" className="py-3 px-2 w-20 text-center">KKM</th>
                <th scope="col" className="py-3 px-2 w-24 text-center">Nilai Tugas</th>
                <th scope="col" className="py-3 px-2 w-24 text-center">Nilai UTS</th>
                <th scope="col" className="py-3 px-2 w-24 text-center">Nilai UAS</th>
                <th scope="col" className="py-3 px-2 w-24 text-center bg-indigo-950/40 text-indigo-300 font-bold">
                  Nilai Akhir
                </th>
                <th scope="col" className="py-3 px-2 w-20 text-center">Predikat</th>
                <th scope="col" className="py-3 px-3">Deskripsi Capaian Kompetensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scores.map((item, idx) => (
                <tr key={item.subjectId || idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-white">{item.subjectName}</div>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={item.kkm}
                      onChange={(e) => handleScoreChange(idx, 'kkm', e.target.value)}
                      className="w-16 px-1.5 py-1 text-center bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  {/* Nilai Tugas (Kosong Awalnya) */}
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilaiTugas}
                      placeholder="Kosong"
                      onChange={(e) => handleScoreChange(idx, 'nilaiTugas', e.target.value)}
                      className="w-20 px-2 py-1 text-center bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </td>
                  {/* Nilai UTS */}
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilaiUts}
                      placeholder="Kosong"
                      onChange={(e) => handleScoreChange(idx, 'nilaiUts', e.target.value)}
                      className="w-20 px-2 py-1 text-center bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </td>
                  {/* Nilai UAS */}
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilaiUas}
                      placeholder="Kosong"
                      onChange={(e) => handleScoreChange(idx, 'nilaiUas', e.target.value)}
                      className="w-20 px-2 py-1 text-center bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </td>
                  {/* Nilai Akhir Otomatis */}
                  <td className="py-2.5 px-2 text-center bg-indigo-950/20">
                    <span className={`font-mono font-bold text-sm ${
                      typeof item.nilaiAkhir === 'number'
                        ? item.nilaiAkhir >= item.kkm ? 'text-emerald-400' : 'text-amber-400'
                        : 'text-slate-500'
                    }`}>
                      {item.nilaiAkhir}
                    </span>
                  </td>
                  {/* Predikat Otomatis */}
                  <td className="py-2.5 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                      item.predikat === 'A' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      item.predikat === 'B' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                      item.predikat === 'C' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      item.predikat === 'D' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      'text-slate-600'
                    }`}>
                      {item.predikat}
                    </span>
                  </td>
                  {/* Deskripsi Capaian */}
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.deskripsi}
                      placeholder="Deskripsi pencapaian kompetensi siswa..."
                      onChange={(e) => handleScoreChange(idx, 'deskripsi', e.target.value)}
                      className="w-full px-2.5 py-1 bg-slate-950/90 border border-slate-800 rounded-lg text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Sikap, Ekstrakurikuler & Kehadiran */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sikap Spiritual & Sosial */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>3. Penilaian Karakter & Sikap</span>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Sikap Spiritual:</label>
            <select
              value={spiritualAttitude}
              onChange={(e) => setSpiritualAttitude(e.target.value as ReportCard['sikapSpiritual'])}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Sangat Baik">Sangat Baik</option>
              <option value="Baik">Baik</option>
              <option value="Cukup">Cukup</option>
              <option value="Kurang">Kurang</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Sikap Sosial:</label>
            <select
              value={socialAttitude}
              onChange={(e) => setSocialAttitude(e.target.value as ReportCard['sikapSosial'])}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Sangat Baik">Sangat Baik</option>
              <option value="Baik">Baik</option>
              <option value="Cukup">Cukup</option>
              <option value="Kurang">Kurang</option>
            </select>
          </div>
        </div>

        {/* Ekstrakurikuler */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">4. Ekstrakurikuler</span>
            <button
              onClick={handleAddExtracurricular}
              type="button"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {extracurriculars.map((ekskul, idx) => (
              <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={ekskul.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExtracurriculars(prev => prev.map((item, i) => i === idx ? { ...item, name: val } : item));
                    }}
                    placeholder="Nama Ekstrakurikuler"
                    className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                  <select
                    value={ekskul.score}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExtracurriculars(prev => prev.map((item, i) => i === idx ? { ...item, score: val } : item));
                    }}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                  <button
                    onClick={() => handleRemoveExtracurricular(idx)}
                    type="button"
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={ekskul.notes}
                  onChange={(e) => {
                    const val = e.target.value;
                    setExtracurriculars(prev => prev.map((item, i) => i === idx ? { ...item, notes: val } : item));
                  }}
                  placeholder="Keterangan capaian kegiatan..."
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Kehadiran */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
            5. Rekapitulasi Presensi
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-amber-400 block mb-1 font-semibold">Sakit (Hari):</label>
              <input
                type="number"
                min={0}
                value={attendance.sakit}
                onChange={(e) => setAttendance(prev => ({ ...prev, sakit: Number(e.target.value) || 0 }))}
                className="w-full px-2.5 py-1.5 text-center bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-sky-400 block mb-1 font-semibold">Izin (Hari):</label>
              <input
                type="number"
                min={0}
                value={attendance.izin}
                onChange={(e) => setAttendance(prev => ({ ...prev, izin: Number(e.target.value) || 0 }))}
                className="w-full px-2.5 py-1.5 text-center bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-rose-400 block mb-1 font-semibold">Alpa (Hari):</label>
              <input
                type="number"
                min={0}
                value={attendance.alpa}
                onChange={(e) => setAttendance(prev => ({ ...prev, alpa: Number(e.target.value) || 0 }))}
                className="w-full px-2.5 py-1.5 text-center bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Catatan Motivasi Wali Kelas:</label>
            <textarea
              rows={2}
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Catatan perkembangan belajar siswa..."
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <button
          onClick={onCancelToDatabase}
          type="button"
          className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          Kembali ke Database Raport
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleSave(false)}
            type="button"
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-md"
          >
            <Save className="w-4 h-4 text-indigo-400" />
            <span>Simpan Raport Baru</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            type="button"
            className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-emerald-900/40 border border-emerald-400/30"
          >
            <Printer className="w-4 h-4" />
            <span>Simpan & Buka Cetak</span>
          </button>
        </div>
      </div>

      {/* Modal Inisialisasi 1 Kelas Sekaligus */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Inisialisasi Raport Kosong 1 Kelas</span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Membuat template raport dengan nilai kosong untuk seluruh siswa pada rombel kelas tertentu di tahun berjalan. Guru tinggal membuka dan memasukkan nilainya nanti.
            </p>

            <div className="my-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Pilih Kelas:</label>
                <select
                  value={bulkClassName}
                  onChange={(e) => setBulkClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  {Array.from(new Set(students.map(s => s.className))).sort().map(c => (
                    <option key={c} value={c}>Kelas {c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tahun Pelajaran & Semester:</label>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px]">
                  {academicYear} — Semester {semester}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="py-2 px-3 text-slate-400 hover:text-white text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onBulkInitializeClass(bulkClassName, academicYear, semester);
                  setIsBulkModalOpen(false);
                }}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Inisialisasi Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
