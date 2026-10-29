import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { 
  Database, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  GraduationCap, 
  Phone, 
  MapPin, 
  Check, 
  X, 
  User, 
  Calendar,
  AlertCircle,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { generateStudentTemplate, parseStudentExcel } from '../../utils/excelUtils';
import confetti from 'canvas-confetti';

export const StudentDatabaseModule: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, bulkAddStudents, setActiveTab, schoolProfile, setIsSettingsOpen } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Excel Import States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importPreviewData, setImportPreviewData] = useState<Omit<Student, 'id'>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    nisn: '',
    nik: '',
    name: '',
    className: '7A',
    gender: 'Laki-laki',
    birthPlace: '',
    birthDate: '2012-01-01',
    parentName: '',
    parentPhone: '',
    address: '',
    activeStatus: 'Aktif'
  });
  const [formError, setFormError] = useState('');

  const availableClasses = Array.from(new Set(students.map(s => s.className))).sort();

  // Metrics
  const maleCount = students.filter(s => s.gender === 'Laki-laki').length;
  const femaleCount = students.filter(s => s.gender === 'Perempuan').length;
  const activeCount = students.filter(s => s.activeStatus === 'Aktif').length;

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nik && s.nik.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterClass !== 'ALL' && s.className !== filterClass) return false;

    // Filter inactive data based on Profile Setting
    if (!schoolProfile?.showInactiveData) {
      if (s.activeStatus && s.activeStatus !== 'Aktif') return false;
    } else {
      if (filterStatus !== 'ALL' && s.activeStatus !== filterStatus) return false;
    }

    return true;
  });

  const handleOpenAddModal = () => {
    setEditingStudentId(null);
    setFormData({
      nisn: '',
      nik: '',
      name: '',
      className: availableClasses[0] || '7A',
      gender: 'Laki-laki',
      birthPlace: 'Jakarta',
      birthDate: '2012-05-10',
      parentName: '',
      parentPhone: '',
      address: '',
      activeStatus: 'Aktif'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudentId(student.id);
    setFormData({
      nisn: student.nisn,
      nik: student.nik || '',
      name: student.name,
      className: student.className,
      gender: student.gender,
      birthPlace: student.birthPlace,
      birthDate: student.birthDate,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      address: student.address,
      activeStatus: student.activeStatus
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data siswa "${name}" dari buku induk?`)) {
      deleteStudent(id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nisn.trim() || !formData.className.trim()) {
      setFormError('Nama lengkap, NISN, dan Rombel Kelas wajib diisi.');
      return;
    }

    if (editingStudentId) {
      updateStudent(editingStudentId, formData);
    } else {
      addStudent(formData);
    }

    setIsModalOpen(false);
  };

  // Handle Excel File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportSuccessMsg('');
    setIsImporting(true);

    const result = await parseStudentExcel(file);
    setIsImporting(false);

    if (result.success && result.data.length > 0) {
      setImportPreviewData(result.data);
      setImportErrors(result.errors);
      setIsImportModalOpen(true);
    } else {
      alert(result.errors.join('\n') || 'Gagal membaca data dari file Excel.');
    }

    // Reset input
    e.target.value = '';
  };

  // Execute Import
  const handleConfirmImport = () => {
    if (importPreviewData.length === 0) return;

    const count = bulkAddStudents(importPreviewData, importMode);
    setImportSuccessMsg(`Berhasil mengimpor ${count} data siswa ke database!`);

    try {
      confetti({ particleCount: 40, spread: 65, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportPreviewData([]);
      setImportSuccessMsg('');
    }, 1500);
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
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Database className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Database Siswa</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Buku induk peserta didik, NISN, penempatan rombel kelas, dan data orang tua
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Download Form Excel */}
          <button
            onClick={generateStudentTemplate}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download Form Template Excel untuk Pengisian Data Siswa"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Download Form Excel</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Import Data Siswa dari File Excel"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Import Excel</span>
          </button>

          {/* Add Student */}
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Total Siswa Terdaftar</p>
          <p className="text-2xl font-bold text-white mt-1">{students.length}</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">{activeCount} Siswa Aktif</p>
        </div>

        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40">
          <p className="text-[11px] font-medium text-blue-400">Laki-laki</p>
          <p className="text-2xl font-bold text-blue-300 mt-1">{maleCount}</p>
          <p className="text-[10px] text-blue-500/80 mt-0.5">Peserta Didik</p>
        </div>

        <div className="p-4 rounded-xl bg-pink-950/30 border border-pink-800/40">
          <p className="text-[11px] font-medium text-pink-400">Perempuan</p>
          <p className="text-2xl font-bold text-pink-300 mt-1">{femaleCount}</p>
          <p className="text-[10px] text-pink-500/80 mt-0.5">Peserta Didik</p>
        </div>

        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40">
          <p className="text-[11px] font-medium text-indigo-400">Total Rombel Kelas</p>
          <p className="text-2xl font-bold text-indigo-300 mt-1">{availableClasses.length}</p>
          <p className="text-[10px] text-indigo-500/80 mt-0.5">{availableClasses.join(', ')}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-transparent text-white font-medium text-xs py-1 focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">Semua Rombel</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls} className="bg-slate-900">Kelas {cls}</option>
              ))}
            </select>
          </div>

          {schoolProfile?.showInactiveData ? (
            <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-600/40 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-[10px] text-amber-300 font-semibold">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-amber-200 text-xs py-1 focus:outline-none"
              >
                <option value="ALL" className="bg-slate-900 text-white">Semua (Termasuk Lulus)</option>
                <option value="Aktif" className="bg-slate-900 text-white">Aktif Saja</option>
                <option value="Lulus" className="bg-slate-900 text-white">Lulus (Alumni)</option>
                <option value="Pindah" className="bg-slate-900 text-white">Pindah</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-600/40 rounded-xl px-2.5 py-1 text-xs text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-[11px]">Hanya Siswa Aktif</span>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline ml-0.5"
                title="Buka Pengaturan Profil untuk menampilkan semua data termasuk alumni"
              >
                (Ubah)
              </button>
            </div>
          )}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NISN, NIK, atau rombel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nama Lengkap & NISN</th>
                <th className="py-3 px-4">Kelas & Gender</th>
                <th className="py-3 px-4">Tempat, Tanggal Lahir</th>
                <th className="py-3 px-4">Orang Tua & Kontak</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data siswa yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{student.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            NISN: {student.nisn} {student.nik ? `• NIK: ${student.nik}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded font-bold text-[11px] bg-slate-800 text-purple-300 border border-slate-700">
                          Kelas {student.className}
                        </span>
                        <p className="text-[11px] text-slate-400">{student.gender}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <p className="font-medium text-white">{student.birthPlace}</p>
                      <p className="text-[11px] text-slate-400">{student.birthDate}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        <p className="font-medium text-slate-200">{student.parentName}</p>
                        <p className="text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{student.parentPhone}</span>
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        student.activeStatus === 'Aktif' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' :
                        student.activeStatus === 'Lulus' ? 'bg-blue-950/60 text-blue-300 border-blue-500/40' :
                        'bg-rose-950/60 text-rose-300 border-rose-500/40'
                      }`}>
                        {student.activeStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                          title="Edit Biodata Siswa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(student.id, student.name)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700 hover:border-rose-800"
                          title="Hapus Data Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">
                  {editingStudentId ? 'Ubah Biodata Siswa' : 'Tambah Siswa Baru ke Buku Induk'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">NISN *</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="0081234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">NIK Siswa (Opsional)</label>
                  <input
                    type="text"
                    value={formData.nik || ''}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="3201123456780001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ahmad Fauzan Pratama"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Rombel Kelas *</label>
                  <input
                    type="text"
                    required
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    placeholder="Contoh: TK-A, TK-B, 7A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex flex-wrap items-center gap-1 mt-1 text-[10px]">
                    <span className="text-slate-500">Pilihan cepat:</span>
                    {['TK-A', 'TK-B', 'KB', '7A', '7B', '8A', '9A'].map(cls => (
                      <button
                        type="button"
                        key={cls}
                        onClick={() => setFormData({ ...formData, className: cls })}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px]"
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Status Keaktifan</label>
                  <select
                    value={formData.activeStatus}
                    onChange={(e) => setFormData({ ...formData, activeStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Pindah">Pindah</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="Jakarta"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Bambang Susanto"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">No. WhatsApp Orang Tua</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Alamat Tempat Tinggal</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Merdeka No. 12, Kelurahan Cendekia"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingStudentId ? 'Simpan Perubahan' : 'Tambahkan Siswa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Import Excel Preview */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Import Data Siswa dari Excel</h3>
                  <p className="text-xs text-slate-400">
                    File: <span className="font-mono text-purple-300">{importFileName}</span> &bull; Terdeteksi: <strong className="text-white">{importPreviewData.length} Siswa</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {importSuccessMsg ? (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-300">Import Berhasil!</h4>
                    <p className="text-xs">{importSuccessMsg}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mode Selection */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Metode Penyimpanan Data:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        importMode === 'append' ? 'bg-purple-950/60 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="importMode"
                          value="append"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="mt-0.5 text-purple-600"
                        />
                        <div>
                          <strong className="block text-slate-200">Tambahkan ke Data Ada (Append)</strong>
                          <span className="text-[11px] text-slate-400">Data siswa saat ini tetap dipertahankan, data baru akan ditambahkan.</span>
                        </div>
                      </label>

                      <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        importMode === 'replace' ? 'bg-rose-950/60 border-rose-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="mt-0.5 text-rose-600"
                        />
                        <div>
                          <strong className="block text-slate-200">Ganti Seluruh Data (Replace)</strong>
                          <span className="text-[11px] text-slate-400">Database siswa saat ini akan diganti seluruhnya dengan data Excel ini.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Errors / Warnings */}
                  {importErrors.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Catatan Validasi ({importErrors.length}):</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-400/90 max-h-24 overflow-y-auto">
                        {importErrors.slice(0, 5).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preview Table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Pratinjau Data Siswa ({importPreviewData.length} baris):
                      </span>
                      <span className="text-[11px] text-slate-500">Menampilkan hingga 5 baris pertama</span>
                    </div>

                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                          <tr>
                            <th className="py-2 px-3">No</th>
                            <th className="py-2 px-3">Nama Siswa</th>
                            <th className="py-2 px-3">NISN</th>
                            <th className="py-2 px-3">Kelas</th>
                            <th className="py-2 px-3">JK</th>
                            <th className="py-2 px-3">Orang Tua / Wali</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {importPreviewData.slice(0, 5).map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30">
                              <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                              <td className="py-2 px-3 font-semibold text-white">{item.name}</td>
                              <td className="py-2 px-3 font-mono text-slate-400">{item.nisn}</td>
                              <td className="py-2 px-3 font-medium text-purple-300">Kelas {item.className}</td>
                              <td className="py-2 px-3 text-slate-400">{item.gender}</td>
                              <td className="py-2 px-3 text-slate-300">{item.parentName}</td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.activeStatus === 'Aktif' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  {item.activeStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              {!importSuccessMsg && (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importPreviewData.length === 0}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Konfirmasi Simpan ({importPreviewData.length} Siswa)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
