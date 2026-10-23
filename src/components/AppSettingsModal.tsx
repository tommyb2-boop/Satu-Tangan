import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolProfile } from '../types';
import { 
  X, 
  School, 
  KeyRound, 
  RotateCcw, 
  Cloud, 
  Check, 
  AlertTriangle, 
  Download, 
  Upload, 
  FileCheck2, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AppSettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    settingsActiveTab, 
    setSettingsActiveTab,
    schoolProfile,
    updateSchoolProfile,
    updateOperatorPassword,
    resetAllDatabase,
    exportBackupData,
    restoreBackupData,
    students,
    teachers,
    studentAttendance,
    dynamicEntities
  } = useApp();

  // Local form state for School Profile
  const [profileForm, setProfileForm] = useState<SchoolProfile>(schoolProfile);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Local form state for Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Local state for Reset Database
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Local state for Backup & Restore
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreStats, setRestoreStats] = useState<{
    studentsCount?: number;
    teachersCount?: number;
    schoolName?: string;
    exportedAt?: string;
  } | null>(null);
  const [restoreRawJson, setRestoreRawJson] = useState<string>('');
  const [restoreError, setRestoreError] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isSettingsOpen) return null;

  // Handle Save School Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(profileForm);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 2500);
    try {
      confetti({ particleCount: 25, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  // Handle Update Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok');
      return;
    }

    const result = updateOperatorPassword(oldPassword, newPassword);
    if (!result.success) {
      setPasswordError(result.message);
      return;
    }

    setPasswordSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  // Handle Database Reset
  const handlePerformReset = (mode: 'demo' | 'empty') => {
    if (resetConfirmation.trim().toUpperCase() !== 'RESET') {
      alert('Ketik kata "RESET" dengan huruf kapital untuk mengonfirmasi!');
      return;
    }
    resetAllDatabase(mode);
    setResetSuccess(true);
    setResetConfirmation('');
    setTimeout(() => setResetSuccess(false), 3000);
  };

  // Handle Backup Download
  const handleDownloadBackup = () => {
    const jsonString = exportBackupData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `SatuTangan_Backup_${schoolProfile.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Open Google Drive in new tab
  const handleOpenGoogleDrive = () => {
    // First trigger download so user has the file
    handleDownloadBackup();
    // Then open Google Drive
    window.open('https://drive.google.com/drive/my-drive', '_blank');
  };

  // Handle File Upload for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setRestoreError('');
    setRestoreStats(null);
    if (!file) return;

    setRestoreFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.app || parsed.app !== 'Satu Tangan') {
          setRestoreError('File ini bukan format cadangan Satu Tangan yang valid.');
          return;
        }
        const data = parsed.data || parsed;
        const targetSchool = data.schoolProfile || parsed.schoolProfile;
        const targetTeachers = data.teachers || parsed.teachers;
        const targetStudents = data.students || parsed.students;

        setRestoreRawJson(text);
        setRestoreStats({
          studentsCount: targetStudents?.length || 0,
          teachersCount: targetTeachers?.length || 0,
          schoolName: targetSchool?.schoolName || 'Tidak Diketahui',
          exportedAt: parsed.exportedAt || parsed.exportTimestamp || new Date().toLocaleDateString('id-ID'),
        });
      } catch {
        setRestoreError('Gagal membaca file JSON. Pastikan file tidak rusak.');
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleConfirmRestore = () => {
    if (!restoreRawJson) return;
    const res = restoreBackupData(restoreRawJson);
    if (res.success) {
      setRestoreSuccess(true);
      setRestoreFile(null);
      setRestoreStats(null);
      setRestoreRawJson('');
      setTimeout(() => {
        setRestoreSuccess(false);
        setIsSettingsOpen(false);
      }, 2000);
    } else {
      setRestoreError(res.message || 'Gagal memulihkan database. Cek kembali struktur file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-indigo-500/10 overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-[1px] shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[15px] flex items-center justify-center">
                <School className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Pengaturan & Profil Aplikasi
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Satu Tangan
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pusat konfigurasi profil sekolah, kredensial login, dan cadangan data
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Tutup Pengaturan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-1 border-b border-slate-800 bg-slate-950/50 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setSettingsActiveTab('profil-sekolah')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              settingsActiveTab === 'profil-sekolah'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <School className="w-4 h-4 text-indigo-300" />
            <span>Profil Sekolah</span>
          </button>

          <button
            onClick={() => setSettingsActiveTab('password-login')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              settingsActiveTab === 'password-login'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>Password Login</span>
          </button>

          <button
            onClick={() => setSettingsActiveTab('backup-restore')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              settingsActiveTab === 'backup-restore'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-300" />
            <span>Backup & Restore (Google Drive)</span>
          </button>

          <button
            onClick={() => setSettingsActiveTab('reset-database')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              settingsActiveTab === 'reset-database'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                : 'text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-rose-300" />
            <span>Reset Database</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-200">
          
          {/* ================================================================ */}
          {/* TAB 1: PROFIL SEKOLAH */}
          {/* ================================================================ */}
          {settingsActiveTab === 'profil-sekolah' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 text-xs text-indigo-200">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Sinkronisasi Otomatis Seluruh Dokumen & Raport:</span>
                  Data profil sekolah di bawah ini secara otomatis digunakan pada Kop Surat resmi, judul raport PDF, alamat institusi, dan tanda tangan Kepala Sekolah di seluruh modul.
                </div>
              </div>

              {/* Section 1: Identitas Inti */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-2">
                  <span>1. Identitas Pokok Sekolah</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nama Lengkap Sekolah / Lembaga *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.schoolName}
                      onChange={(e) => setProfileForm({ ...profileForm, schoolName: e.target.value })}
                      placeholder="Contoh: SMP Negeri 1 Cendekia Mandiri"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      NPSN (Nomor Pokok Sekolah Nasional) *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.npsn}
                      onChange={(e) => setProfileForm({ ...profileForm, npsn: e.target.value })}
                      placeholder="8 digit angka, contoh: 20109823"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      NSS (Nomor Statistik Sekolah)
                    </label>
                    <input
                      type="text"
                      value={profileForm.nss}
                      onChange={(e) => setProfileForm({ ...profileForm, nss: e.target.value })}
                      placeholder="Contoh: 201026001001"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Status Akreditasi
                    </label>
                    <select
                      value={profileForm.accreditation}
                      onChange={(e) => setProfileForm({ ...profileForm, accreditation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="A (Amat Baik)">A (Amat Baik)</option>
                      <option value="B (Baik)">B (Baik)</option>
                      <option value="C (Cukup)">C (Cukup)</option>
                      <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Jenjang
                      </label>
                      <select
                        value={profileForm.educationLevel}
                        onChange={(e) => setProfileForm({ ...profileForm, educationLevel: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="SD/MI">SD / MI</option>
                        <option value="SMP/MTs">SMP / MTs</option>
                        <option value="SMA/MA">SMA / MA</option>
                        <option value="SMK">SMK</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Status
                      </label>
                      <select
                        value={profileForm.status}
                        onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value as 'Negeri' | 'Swasta' })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Negeri">Negeri</option>
                        <option value="Swasta">Swasta</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Kontak & Alamat */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  2. Alamat & Kontak Resmi
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alamat Jalan Lengkap
                    </label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="Contoh: Jl. Raya Pendidikan No. 101"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kabupaten / Kota
                    </label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="Contoh: Kota Bandung"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      value={profileForm.province}
                      onChange={(e) => setProfileForm({ ...profileForm, province: e.target.value })}
                      placeholder="Contoh: Jawa Barat"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={profileForm.postalCode}
                      onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                      placeholder="Contoh: 40132"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="Contoh: (022) 7201889"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Resmi Sekolah
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="Contoh: info@smpn1cendekia.sch.id"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Pimpinan & Format Kop Surat Raport */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  3. Pimpinan & Format Kop Surat Raport
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nama Kepala Sekolah (dengan Gelar) *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.headmasterName}
                      onChange={(e) => setProfileForm({ ...profileForm, headmasterName: e.target.value })}
                      placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      NIP Kepala Sekolah *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.headmasterNip}
                      onChange={(e) => setProfileForm({ ...profileForm, headmasterNip: e.target.value })}
                      placeholder="Contoh: 197405121998021001"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kop Surat Baris 1 (Pemerintah Daerah / Yayasan)
                    </label>
                    <input
                      type="text"
                      value={profileForm.letterheadProvince}
                      onChange={(e) => setProfileForm({ ...profileForm, letterheadProvince: e.target.value })}
                      placeholder="Contoh: PEMERINTAH DAERAH PROVINSI JAWA BARAT"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kop Surat Baris 2 (Dinas Terkait)
                    </label>
                    <input
                      type="text"
                      value={profileForm.letterheadAgency}
                      onChange={(e) => setProfileForm({ ...profileForm, letterheadAgency: e.target.value })}
                      placeholder="Contoh: DINAS PENDIDIKAN & KEBUDAYAAN"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                >
                  {profileSaveSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  <span>{profileSaveSuccess ? 'Tersimpan & Disinkronkan!' : 'Simpan Profil Sekolah'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ================================================================ */}
          {/* TAB 2: SETTING PASSWORD LOGIN */}
          {/* ================================================================ */}
          {settingsActiveTab === 'password-login' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Keamanan Akun Operator:</span>
                  Password ini digunakan saat Anda masuk ke aplikasi Satu Tangan melalui form login email/password. Default password awal: <code className="bg-amber-900/50 px-1 py-0.5 rounded font-mono text-amber-200">operator2026</code>.
                </div>
              </div>

              {passwordSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Kata sandi login berhasil diperbarui! Gunakan kata sandi baru untuk sesi masuk berikutnya.</span>
                </div>
              )}

              {passwordError && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleSavePassword} className="space-y-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password Saat Ini *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Masukkan password saat ini (default: operator123)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white pr-10 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password Baru *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Konfirmasi Password Baru *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru persis sama"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 flex items-center gap-2 transition-all"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Perbarui Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: BACKUP & RESTORE VIA GOOGLE DRIVE */}
          {/* ================================================================ */}
          {settingsActiveTab === 'backup-restore' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-800/50 text-xs text-sky-200 flex items-start gap-3">
                <Cloud className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Cadangkan & Pulihkan Database Aman:</span>
                  Ekspor seluruh data siswa, guru, rekap presensi, entitas modul dinamis, nilai raport, dan profil sekolah dalam format snapshot terenkripsi JSON. Anda dapat menyimpannya langsung ke Google Drive atau memulihkannya kapan saja saat berganti perangkat.
                </div>
              </div>

              {/* Current Database Summary Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Siswa</span>
                  <span className="text-lg font-black text-white">{students.length} Siswa</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Guru</span>
                  <span className="text-lg font-black text-white">{teachers.length} Guru</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Presensi Tersimpan</span>
                  <span className="text-lg font-black text-white">{studentAttendance.length} Log</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Modul Dinamis</span>
                  <span className="text-lg font-black text-white">{dynamicEntities.length} Entitas</span>
                </div>
              </div>

              {/* Action Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Column 1: Backup / Export */}
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-3">
                      <Download className="w-5 h-5 text-sky-400" />
                    </div>
                    <h3 className="text-base font-bold text-white">Cadangkan (Backup)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Unduh arsip komprehensif seluruh sistem Satu Tangan atau simpan langsung ke Google Drive Anda.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleOpenGoogleDrive}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all"
                    >
                      <Cloud className="w-4 h-4 text-sky-200" />
                      <span>Cadangkan & Buka Google Drive</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadBackup}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh File Snapshot (.json)</span>
                    </button>
                  </div>
                </div>

                {/* Column 2: Restore / Import */}
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-base font-bold text-white">Pulihkan (Restore)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Unggah file backup (.json) yang sebelumnya disimpan dari Google Drive atau komputer untuk mengembalikan seluruh basis data.
                    </p>
                  </div>

                  {restoreSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Basis data berhasil dipulihkan dari cadangan!</span>
                    </div>
                  )}

                  {restoreError && (
                    <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{restoreError}</span>
                    </div>
                  )}

                  {restoreStats && (
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                        <FileCheck2 className="w-4 h-4" />
                        <span>File Cadangan Terverifikasi:</span>
                      </div>
                      <div className="text-slate-300">Sekolah: <strong className="text-white">{restoreStats.schoolName}</strong></div>
                      <div className="text-slate-400 text-[11px]">
                        Isi: {restoreStats.studentsCount} Siswa &bull; {restoreStats.teachersCount} Guru
                      </div>
                      <button
                        type="button"
                        onClick={handleConfirmRestore}
                        className="w-full mt-2 py-2 px-3 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Terapkan Pemulihan Sekarang</span>
                      </button>
                    </div>
                  )}

                  {!restoreStats && (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".json"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white border border-dashed border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-indigo-400" />
                        <span>Pilih File Cadangan dari Google Drive / Komputer</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: RESET SEMUA DATABASE */}
          {/* ================================================================ */}
          {settingsActiveTab === 'reset-database' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-sm">PERINGATAN ZONA BERBAHAYA:</span>
                  Tindakan ini akan menghapus data yang tersimpan pada aplikasi. Pastikan Anda telah membuat cadangan (backup) via tab Google Drive sebelum melanjutkan!
                </div>
              </div>

              {resetSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Database berhasil direset! Halaman telah disegarkan dengan kondisi yang dipilih.</span>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Konfirmasi Keamanan (Ketik kata <span className="font-mono text-rose-400 font-bold">RESET</span>):
                  </label>
                  <input
                    type="text"
                    value={resetConfirmation}
                    onChange={(e) => setResetConfirmation(e.target.value)}
                    placeholder="Ketik RESET disini..."
                    className="w-full bg-slate-900 border border-rose-800/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tracking-wider focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={resetConfirmation.trim().toUpperCase() !== 'RESET'}
                    onClick={() => handlePerformReset('demo')}
                    className="py-3 px-4 rounded-xl text-xs font-bold text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>Kembalikan Data Demo Awal</span>
                  </button>

                  <button
                    type="button"
                    disabled={resetConfirmation.trim().toUpperCase() !== 'RESET'}
                    onClick={() => handlePerformReset('empty')}
                    className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  >
                    <AlertTriangle className="w-4 h-4 text-white" />
                    <span>Kosongkan Seluruh Database</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
