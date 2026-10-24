import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DynamicEntity, DynamicRecord } from '../../types';
import { 
  Boxes, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Wallet, 
  Trophy, 
  Compass, 
  Book, 
  Shield, 
  Star,
  Search,
  Check,
  X,
  User,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Coins
} from 'lucide-react';
import { TODAY_STR } from '../../data/initialData';

export const DynamicEntitiesModule: React.FC = () => {
  const { 
    dynamicEntities, 
    dynamicRecords, 
    students,
    createDynamicEntity, 
    deleteDynamicEntity, 
    addDynamicRecord, 
    deleteDynamicRecord, 
    setActiveTab 
  } = useApp();

  const [selectedEntityId, setSelectedEntityId] = useState<string>(
    dynamicEntities[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewEntityModalOpen, setIsNewEntityModalOpen] = useState(false);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);

  // New Entity Form State
  const [newEntity, setNewEntity] = useState<Omit<DynamicEntity, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    category: 'Keuangan',
    iconType: 'wallet',
    colorTheme: 'amber',
    primaryValueLabel: 'Nominal Setoran (Rp)',
    primaryValueType: 'currency',
    secondaryValueLabel: 'Keterangan Transaksi'
  });

  // New Record Form State
  const [newRecord, setNewRecord] = useState({
    studentId: students[0]?.id || '',
    date: TODAY_STR,
    primaryValue: '',
    secondaryValue: '',
    status: 'Lunas' as DynamicRecord['status'],
    operatorNote: ''
  });

  const activeEntity = dynamicEntities.find(e => e.id === selectedEntityId) || dynamicEntities[0];

  const currentRecords = dynamicRecords.filter(r => r.entityId === (activeEntity?.id || ''));

  const filteredRecords = currentRecords.filter(r => 
    r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.studentNisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.studentClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.secondaryValue && r.secondaryValue.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getEntityIcon = (iconType: string, className = "w-5 h-5") => {
    switch (iconType) {
      case 'trophy': return <Trophy className={className} />;
      case 'compass': return <Compass className={className} />;
      case 'book': return <Book className={className} />;
      case 'shield': return <Shield className={className} />;
      case 'star': return <Star className={className} />;
      default: return <Wallet className={className} />;
    }
  };

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntity.title.trim()) return;
    createDynamicEntity(newEntity);
    setIsNewEntityModalOpen(false);
    setNewEntity({
      title: '',
      description: '',
      category: 'Keuangan',
      iconType: 'wallet',
      colorTheme: 'amber',
      primaryValueLabel: 'Nominal (Rp)',
      primaryValueType: 'currency',
      secondaryValueLabel: 'Keterangan'
    });
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEntity || !newRecord.studentId || !newRecord.primaryValue) return;

    addDynamicRecord({
      entityId: activeEntity.id,
      studentId: newRecord.studentId,
      date: newRecord.date,
      primaryValue: activeEntity.primaryValueType === 'currency' 
        ? Number(newRecord.primaryValue) || 0 
        : newRecord.primaryValue,
      secondaryValue: newRecord.secondaryValue,
      status: newRecord.status,
      operatorNote: newRecord.operatorNote
    });

    setIsNewRecordModalOpen(false);
    setNewRecord({
      studentId: students[0]?.id || '',
      date: TODAY_STR,
      primaryValue: '',
      secondaryValue: '',
      status: 'Lunas',
      operatorNote: ''
    });
  };

  const handleDeleteEntity = (id: string, title: string) => {
    if (window.confirm(`Hapus modul entitas "${title}" beserta semua catatan siswanya?`)) {
      deleteDynamicEntity(id);
      if (selectedEntityId === id) {
        const remaining = dynamicEntities.filter(e => e.id !== id);
        if (remaining.length > 0) setSelectedEntityId(remaining[0].id);
      }
    }
  };

  // Compute total for currency
  const totalAmount = activeEntity?.primaryValueType === 'currency'
    ? currentRecords.reduce((acc, curr) => acc + (Number(curr.primaryValue) || 0), 0)
    : null;

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
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Boxes className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Modul Dinamis & Entitas Khusus</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Kegiatan khusus sekolah (Tabungan, Pramuka, Prestasi) dengan relasi langsung ke Database Siswa
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewEntityModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25 active:translate-y-0.5 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Entitas Baru</span>
        </button>
      </div>

      {/* Entity Selector Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
        {dynamicEntities.map(entity => {
          const isSelected = (activeEntity?.id === entity.id);
          return (
            <button
              key={entity.id}
              onClick={() => setSelectedEntityId(entity.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {getEntityIcon(entity.iconType, "w-3.5 h-3.5")}
              </div>
              <span>{entity.title}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-950/60 text-slate-400 border border-slate-800">
                {dynamicRecords.filter(r => r.entityId === entity.id).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Entity Detail Card */}
      {activeEntity && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
              {getEntityIcon(activeEntity.iconType, "w-6 h-6")}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">{activeEntity.title}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                  {activeEntity.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">{activeEntity.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
            {totalAmount !== null && (
              <div className="text-left md:text-right px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Saldo Terhimpun</p>
                <p className="text-base font-bold text-emerald-400">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNewRecordModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Input Data Siswa</span>
              </button>

              <button
                onClick={() => handleDeleteEntity(activeEntity.id, activeEntity.title)}
                className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 transition-colors"
                title="Hapus Entitas Ini"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <p className="text-xs font-semibold text-slate-300">
          Daftar Rekam Data Peserta Didik ({filteredRecords.length} Catatan)
        </p>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari siswa, NISN, rombel, catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nama Siswa / Rombel</th>
                <th className="py-3 px-4">Tanggal Transaksi</th>
                <th className="py-3 px-4">{activeEntity?.primaryValueLabel || 'Nilai Utama'}</th>
                {activeEntity?.secondaryValueLabel && (
                  <th className="py-3 px-4">{activeEntity.secondaryValueLabel}</th>
                )}
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Belum ada data rekaman siswa untuk entitas ini. Klik &quot;Input Data Siswa&quot; untuk menambahkan.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {record.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{record.studentName}</p>
                          <p className="text-[11px] text-slate-400">
                            Kelas {record.studentClass} &bull; NISN: {record.studentNisn}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {record.date}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white">
                        {activeEntity?.primaryValueType === 'currency'
                          ? `Rp ${Number(record.primaryValue).toLocaleString('id-ID')}`
                          : record.primaryValue}
                      </span>
                    </td>

                    {activeEntity?.secondaryValueLabel && (
                      <td className="py-3.5 px-4 text-slate-300">
                        {record.secondaryValue || '-'}
                      </td>
                    )}

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        record.status === 'Lunas' || record.status === 'Selesai'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                          : record.status === 'Aktif'
                          ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                          : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                      }`}>
                        {record.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => deleteDynamicRecord(record.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700 hover:border-rose-800"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Dynamic Entity */}
      {isNewEntityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Buat Modul Entitas Dinamis</h2>
              </div>
              <button
                onClick={() => setIsNewEntityModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntity} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Judul Modul / Nama Kegiatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tabungan Kurban, Kas Pramuka, Sertifikat"
                  value={newEntity.title}
                  onChange={(e) => setNewEntity({ ...newEntity, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="Keterangan singkat fungsi entitas..."
                  value={newEntity.description}
                  onChange={(e) => setNewEntity({ ...newEntity, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Kategori</label>
                  <select
                    value={newEntity.category}
                    onChange={(e) => setNewEntity({ ...newEntity, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Keuangan">Keuangan</option>
                    <option value="Ekstrakurikuler">Ekstrakurikuler</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Kedisiplinan">Kedisiplinan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Ikon</label>
                  <select
                    value={newEntity.iconType}
                    onChange={(e) => setNewEntity({ ...newEntity, iconType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="wallet">Dompet / Uang</option>
                    <option value="trophy">Piala / Prestasi</option>
                    <option value="compass">Kompas / Pramuka</option>
                    <option value="book">Buku</option>
                    <option value="shield">Perisai / Disiplin</option>
                    <option value="star">Bintang</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Label Nilai Utama *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Nominal (Rp) / Peran"
                    value={newEntity.primaryValueLabel}
                    onChange={(e) => setNewEntity({ ...newEntity, primaryValueLabel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Tipe Nilai Utama</label>
                  <select
                    value={newEntity.primaryValueType}
                    onChange={(e) => setNewEntity({ ...newEntity, primaryValueType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="currency">Mata Uang (Rupiah)</option>
                    <option value="text">Teks Bebas</option>
                    <option value="badge">Lencana / Status</option>
                    <option value="date">Tanggal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Label Kolom Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Catatan, Keterangan, No Bukti"
                  value={newEntity.secondaryValueLabel || ''}
                  onChange={(e) => setNewEntity({ ...newEntity, secondaryValueLabel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewEntityModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Entitas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Record Linked to Student */}
      {isNewRecordModalOpen && activeEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">
                  Input Catatan Baru: {activeEntity.title}
                </h2>
              </div>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Pilih Siswa Terdaftar *</label>
                <select
                  required
                  value={newRecord.studentId}
                  onChange={(e) => setNewRecord({ ...newRecord, studentId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900">
                      {s.name} - Kelas {s.className} (NISN: {s.nisn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">{activeEntity.primaryValueLabel} *</label>
                  <input
                    type={activeEntity.primaryValueType === 'currency' ? 'number' : 'text'}
                    required
                    placeholder={activeEntity.primaryValueType === 'currency' ? '50000' : 'Isikan nilai...'}
                    value={newRecord.primaryValue}
                    onChange={(e) => setNewRecord({ ...newRecord, primaryValue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {activeEntity.secondaryValueLabel && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">{activeEntity.secondaryValueLabel}</label>
                  <input
                    type="text"
                    placeholder="Keterangan..."
                    value={newRecord.secondaryValue}
                    onChange={(e) => setNewRecord({ ...newRecord, secondaryValue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Status Catatan</label>
                  <select
                    value={newRecord.status}
                    onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Lunas">Lunas</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Tertunda">Tertunda</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Catatan Operator (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Verifikasi manual..."
                    value={newRecord.operatorNote}
                    onChange={(e) => setNewRecord({ ...newRecord, operatorNote: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Tambahkan ke Siswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
