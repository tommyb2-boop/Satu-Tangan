import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Teacher } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Check, 
  X, 
  GraduationCap, 
  Briefcase,
  AlertCircle,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { generateTeacherTemplate, parseTeacherExcel } from '../../utils/excelUtils';
import confetti from 'canvas-confetti';

export const TeacherDatabaseModule: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, bulkAddTeachers, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Excel Import States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importPreviewData, setImportPreviewData] = useState<Omit<Teacher, 'id'>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    nip: '',
    name: '',
    subject: '',
    email: '',
    phone: '',
    employmentStatus: 'PNS',
    gender: 'Laki-laki',
    assignedClass: ''
  });
  const [formError, setFormError] = useState('');

  // Metrics
  const pnsCount = teachers.filter(t => t.employmentStatus === 'PNS').length;
  const pppkCount = teachers.filter(t => t.employmentStatus === 'PPPK').length;
  const honorerCount = teachers.filter(t => t.employmentStatus === 'Honorer' || t.employmentStatus === 'Yayasan').length;

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterStatus !== 'ALL' && t.employmentStatus !== filterStatus) return false;

    return true;
  });

  const handleOpenAddModal = () => {
    setEditingTeacherId(null);
    setFormData({
      nip: '',
      name: '',
      subject: '',
      email: '',
      phone: '',
      employmentStatus: 'PNS',
      gender: 'Laki-laki',
      assignedClass: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacherId(teacher.id);
    setFormData({
      nip: teacher.nip,
      name: teacher.name,
      subject: teacher.subject,
      email: teacher.email,
      phone: teacher.phone,
      employmentStatus: teacher.employmentStatus,
      gender: teacher.gender,
      assignedClass: teacher.assignedClass || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data pendidik "${name}" dari database?`)) {
      deleteTeacher(id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nip.trim() || !formData.subject.trim()) {
      setFormError('Nama lengkap, NIP, dan Mata Pelajaran wajib diisi.');
      return;
    }

    if (editingTeacherId) {
      updateTeacher(editingTeacherId, formData);
    } else {
      addTeacher(formData);
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

    const result = await parseTeacherExcel(file);
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

    const count = bulkAddTeachers(importPreviewData, importMode);
    setImportSuccessMsg(`Berhasil mengimpor ${count} data guru ke database!`);

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
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Database Guru & Pendidik</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Buku induk master data tenaga pendidik dan status kepegawaian
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
            onClick={generateTeacherTemplate}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download Form Template Excel untuk Pengisian Data Guru"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Download Form Excel</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Import Data Guru dari File Excel"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Import Excel</span>
          </button>

          {/* Add Teacher */}
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Total Guru</p>
          <p className="text-2xl font-bold text-white mt-1">{teachers.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Aktif Mengajar</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
          <p className="text-[11px] font-medium text-emerald-400">Status PNS</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1">{pnsCount}</p>
          <p className="text-[10px] text-emerald-500/80 mt-0.5">Pegawai Negeri Sipil</p>
        </div>

        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40">
          <p className="text-[11px] font-medium text-blue-400">Status PPPK</p>
          <p className="text-2xl font-bold text-blue-300 mt-1">{pppkCount}</p>
          <p className="text-[10px] text-blue-500/80 mt-0.5">Perjanjian Kerja</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40">
          <p className="text-[11px] font-medium text-amber-400">Honorer / Yayasan</p>
          <p className="text-2xl font-bold text-amber-300 mt-1">{honorerCount}</p>
          <p className="text-[10px] text-amber-500/80 mt-0.5">Tenaga Kontrak</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-white font-medium text-xs py-1 focus:outline-none"
          >
            <option value="ALL" className="bg-slate-900">Semua Status Kepegawaian</option>
            <option value="PNS" className="bg-slate-900">PNS</option>
            <option value="PPPK" className="bg-slate-900">PPPK</option>
            <option value="Honorer" className="bg-slate-900">Honorer</option>
            <option value="Yayasan" className="bg-slate-900">Yayasan</option>
          </select>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama guru, NIP, atau mata pelajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nama Lengkap & NIP</th>
                <th className="py-3 px-4">Mata Pelajaran & Tugas</th>
                <th className="py-3 px-4">Status & Gender</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data guru yang sesuai dengan kriteria.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{teacher.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">NIP: {teacher.nip}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-white">{teacher.subject}</p>
                      {teacher.assignedClass ? (
                        <span className="inline-block mt-0.5 text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.5 rounded">
                          Wali Kelas {teacher.assignedClass}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Guru Bidang Studi</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          teacher.employmentStatus === 'PNS' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' :
                          teacher.employmentStatus === 'PPPK' ? 'bg-blue-950/60 text-blue-300 border-blue-500/40' :
                          'bg-amber-950/60 text-amber-300 border-amber-500/40'
                        }`}>
                          {teacher.employmentStatus}
                        </span>
                        <p className="text-[11px] text-slate-400">{teacher.gender}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1 text-[11px] text-slate-300">
                        {teacher.email && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[140px]">{teacher.email}</span>
                          </div>
                        )}
                        {teacher.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{teacher.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(teacher)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                          title="Edit Biodata Guru"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(teacher.id, teacher.name)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700 hover:border-rose-800"
                          title="Hapus Data Guru"
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

      {/* Add / Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  {editingTeacherId ? 'Ubah Data Guru' : 'Tambah Tenaga Pendidik Baru'}
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
                  <label className="text-slate-400 font-medium">NIP / NUPTK *</label>
                  <input
                    type="text"
                    required
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="198203152006041005"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dra. Siti Rahmah, M.Pd"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Mata Pelajaran Utama *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Matematika"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Wali Kelas (Opsional)</label>
                  <input
                    type="text"
                    value={formData.assignedClass || ''}
                    onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                    placeholder="Contoh: 7A, 8B"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Status Kepegawaian</label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Honorer">Honorer</option>
                    <option value="Yayasan">Yayasan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Email Pendidik</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="guru@sekolah.sch.id"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Nomor WhatsApp / Telp</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTeacherId ? 'Simpan Perubahan' : 'Tambahkan Guru'}</span>
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
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Import Data Guru dari Excel</h3>
                  <p className="text-xs text-slate-400">
                    File: <span className="font-mono text-indigo-300">{importFileName}</span> &bull; Terdeteksi: <strong className="text-white">{importPreviewData.length} Guru</strong>
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
                        importMode === 'append' ? 'bg-indigo-950/60 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="importMode"
                          value="append"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="mt-0.5 text-indigo-600"
                        />
                        <div>
                          <strong className="block text-slate-200">Tambahkan ke Data Ada (Append)</strong>
                          <span className="text-[11px] text-slate-400">Data saat ini tetap dipertahankan, data baru akan ditambahkan.</span>
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
                          <span className="text-[11px] text-slate-400">Database guru saat ini akan diganti seluruhnya dengan data Excel ini.</span>
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
                        Pratinjau Data Guru ({importPreviewData.length} baris):
                      </span>
                      <span className="text-[11px] text-slate-500">Menampilkan hingga 5 baris pertama</span>
                    </div>

                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                          <tr>
                            <th className="py-2 px-3">No</th>
                            <th className="py-2 px-3">Nama Lengkap</th>
                            <th className="py-2 px-3">NIP</th>
                            <th className="py-2 px-3">Mata Pelajaran</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3">JK</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {importPreviewData.slice(0, 5).map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30">
                              <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                              <td className="py-2 px-3 font-semibold text-white">{item.name}</td>
                              <td className="py-2 px-3 font-mono text-slate-400">{item.nip}</td>
                              <td className="py-2 px-3 text-slate-300">{item.subject}</td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.employmentStatus === 'PNS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                                  item.employmentStatus === 'PPPK' ? 'bg-blue-950 text-blue-400 border border-blue-800/60' :
                                  'bg-amber-950 text-amber-400 border border-amber-800/60'
                                }`}>
                                  {item.employmentStatus}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-400">{item.gender}</td>
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Konfirmasi Simpan ({importPreviewData.length} Guru)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
