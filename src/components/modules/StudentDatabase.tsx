import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';

export const StudentDatabaseModule: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

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
    if (filterStatus !== 'ALL' && s.activeStatus !== filterStatus) return false;

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

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 active:translate-y-0.5 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Siswa Baru</span>
        </button>
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

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-slate-300 text-xs py-1 focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">Semua Status</option>
              <option value="Aktif" className="bg-slate-900">Aktif</option>
              <option value="Lulus" className="bg-slate-900">Lulus</option>
              <option value="Pindah" className="bg-slate-900">Pindah</option>
            </select>
          </div>
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
                    placeholder="7A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
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
    </div>
  );
};
