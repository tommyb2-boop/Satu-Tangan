import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { 
  Fingerprint, 
  Calendar, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Check, 
  Sparkles, 
  ArrowLeft,
  Users,
  GraduationCap,
  Cpu,
  ShieldCheck,
  RefreshCw,
  Usb,
  Smartphone,
  Info,
  Code2,
  Copy,
  CheckCheck,
  X,
  Database,
  CloudCheck
} from 'lucide-react';
import { TODAY_STR } from '../../data/initialData';
import { 
  authenticateWithNativeFingerprint, 
  authenticateWithUsbScanner, 
  checkUsbScannerStatus,
  UsbScannerDeviceInfo,
  BiometricVerificationResult
} from '../../services/biometricService';
import { syncService } from '../../services/syncService';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';

export const FingerprintAttendanceModule: React.FC = () => {
  const { 
    teachers, 
    students, 
    teacherAttendance, 
    studentAttendance, 
    markTeacherAttendance, 
    markStudentAttendance,
    recordFingerprintAttendance,
    setActiveTab 
  } = useApp();

  const [activeRole, setActiveRole] = useState<'guru' | 'siswa'>('guru');
  const [selectedDate, setSelectedDate] = useState(TODAY_STR);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dual Method Selector: 'native-phone' vs 'usb-otg'
  const [biometricMethod, setBiometricMethod] = useState<'native-phone' | 'usb-otg'>('native-phone');
  
  // USB OTG Scanner hardware state
  const [usbStatus, setUsbStatus] = useState<UsbScannerDeviceInfo>({
    isSupported: false,
    isConnected: false,
    bridgeType: 'emulated',
    deviceName: 'Memeriksa perangkat...'
  });

  // Biometric Terminal Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanCandidateId, setActiveScanCandidateId] = useState<string>('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    name: string;
    identifier: string;
    time: string;
    role: string;
    method: string;
    sha256Hash: string;
    deviceId: string;
  } | null>(null);

  // Modal for Android Studio / Native OTG Wrapper Guide
  const [isNativeGuideOpen, setIsNativeGuideOpen] = useState(false);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);

  // Check USB hardware status on mount
  useEffect(() => {
    checkUsbScannerStatus().then((status: UsbScannerDeviceInfo) => {
      setUsbStatus(status);
    });
  }, []);

  const availableClasses = Array.from(new Set(students.map(s => s.className))).sort();

  // Teacher Attendance Map for selected Date
  const teacherAttMap = new Map(
    teacherAttendance.filter(a => a.date === selectedDate).map(a => [a.teacherId, a])
  );

  // Student Attendance Map for selected Date
  const studentAttMap = new Map(
    studentAttendance.filter(a => a.date === selectedDate).map(a => [a.studentId, a])
  );

  // Filtered lists
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students
    .filter(s => (selectedClass === 'ALL' ? true : s.className === selectedClass))
    .filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Stats calculation
  const currentTeachers = teachers;
  const teacherStats = {
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpa: 0,
    belum: 0
  };
  currentTeachers.forEach(t => {
    const att = teacherAttMap.get(t.id);
    if (!att) teacherStats.belum++;
    else if (att.status === 'HADIR') teacherStats.hadir++;
    else if (att.status === 'IZIN') teacherStats.izin++;
    else if (att.status === 'SAKIT') teacherStats.sakit++;
    else if (att.status === 'ALPA') teacherStats.alpa++;
  });

  const currentClassStudents = selectedClass === 'ALL' ? students : students.filter(s => s.className === selectedClass);
  const studentStats = {
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpa: 0,
    belum: 0
  };
  currentClassStudents.forEach(s => {
    const att = studentAttMap.get(s.id);
    if (!att) studentStats.belum++;
    else if (att.status === 'HADIR') studentStats.hadir++;
    else if (att.status === 'IZIN') studentStats.izin++;
    else if (att.status === 'SAKIT') studentStats.sakit++;
    else if (att.status === 'ALPA') studentStats.alpa++;
  });

  const activeStats = activeRole === 'guru' ? teacherStats : studentStats;
  const activeTotal = activeRole === 'guru' ? teachers.length : currentClassStudents.length;

  /**
   * Execute real Biometric Scan (WebAuthn Native Phone OR USB OTG Scanner)
   */
  const triggerBiometricScan = async (type: 'guru' | 'siswa', id: string) => {
    setIsScanning(true);
    setActiveScanCandidateId(id);
    setScanError(null);
    soundFx.playScanBeep();

    const candidateName = type === 'guru' 
      ? (teachers.find(t => t.id === id)?.name || 'Guru')
      : (students.find(s => s.id === id)?.name || 'Siswa');

    const candidateIdentifier = type === 'guru'
      ? (teachers.find(t => t.id === id)?.nip || id)
      : (students.find(s => s.id === id)?.nisn || id);

    try {
      let result: BiometricVerificationResult;

      if (biometricMethod === 'native-phone') {
        // Method 1: Built-in phone fingerprint via WebAuthn API / Android BiometricPrompt
        result = await authenticateWithNativeFingerprint(candidateName, candidateIdentifier);
      } else {
        // Method 2: External USB OTG scanner / WebUSB / Android Bridge
        result = await authenticateWithUsbScanner(candidateName, candidateIdentifier);
      }

      if (result.success) {
        // Record into application database
        const res = recordFingerprintAttendance({
          targetType: type,
          targetId: id,
          date: selectedDate,
          deviceId: result.deviceId
        });

        // Enqueue to cloud sync service
        syncService.enqueue(
          type === 'guru' ? 'teacherAttendance' : 'studentAttendance',
          'update',
          id,
          {
            targetType: type,
            targetId: id,
            status: 'HADIR',
            verificationMethod: 'FINGERPRINT',
            sha256Hash: result.sha256Hash,
            deviceId: result.deviceId,
            timestamp: result.timestamp
          }
        );

        soundFx.playSuccessChime();

        setVerificationFeedback({
          name: res.personName || candidateName,
          identifier: res.identifier + (res.className ? ` • ${res.className}` : ''),
          time: res.checkInTime,
          role: type === 'guru' ? 'Tenaga Pendidik / Guru' : 'Peserta Didik / Siswa',
          method: result.method === 'native-phone' ? 'Sensor Bawaan HP (WebAuthn)' : 'Scanner Eksternal USB OTG',
          sha256Hash: result.sha256Hash,
          deviceId: result.deviceId
        });

        try {
          confetti({ particleCount: 35, spread: 55, origin: { y: 0.75 } });
        } catch {
          // ignore
        }

        setTimeout(() => {
          setVerificationFeedback(null);
        }, 5000);
      }
    } catch (err: unknown) {
      const e = err as Error;
      soundFx.playErrorBuzz();
      setScanError(e.message || 'Pemindaian biometrik sidik jari gagal.');
      setTimeout(() => setScanError(null), 4500);
    } finally {
      setIsScanning(false);
      setActiveScanCandidateId('');
    }
  };

  const copyAndroidBridgeCode = () => {
    const code = `// 1. Android Java WebView Native Bridge Implementation:
// Add to MainActivity.java:
public class FingerprintBridge {
    Context mContext;
    FingerprintBridge(Context c) { mContext = c; }

    @JavascriptInterface
    public boolean isUsbScannerConnected() {
        UsbManager manager = (UsbManager) mContext.getSystemService(Context.USB_SERVICE);
        HashMap<String, UsbDevice> deviceList = manager.getDeviceList();
        return !deviceList.isEmpty();
    }

    @JavascriptInterface
    public String scanFingerprint() {
        // Connect to DigitalPersona or SecuGen SDK via USB OTG
        // Returns SHA-256 hash of extracted ISO biometric minutiae template
        return "sha256_verified_sample_minutiae_token";
    }
}

// In onCreate:
webView.getSettings().setJavaScriptEnabled(true);
webView.addJavascriptInterface(new FingerprintBridge(this), "AndroidFingerprintBridge");`;

    navigator.clipboard.writeText(code);
    setCopiedCodeSnippet(true);
    setTimeout(() => setCopiedCodeSnippet(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Fingerprint className="w-6 h-6 text-emerald-400" />
              <span>Aplikasi Presensi Sidik Jari (Biometrik)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Presensi otomatis guru dan siswa terintegrasi sensor biometrik bawaan HP & scanner USB OTG eksternal.
            </p>
          </div>
        </div>

        {/* Date Filter & Terminal Actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setSelectedDate(TODAY_STR)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            Hari Ini
          </button>

          <button
            onClick={() => setIsNativeGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 transition-colors cursor-pointer"
            title="Panduan Teknis Scanner USB OTG & Native Android Bridge"
          >
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Panduan USB & APK</span>
          </button>
        </div>
      </div>

      {/* Biometric Terminal Hardware Hub (Dual-Method Selector) */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/40 shadow-2xl">
        {/* Method Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400 mr-2">Metode Pemindai:</span>

          <button
            type="button"
            onClick={() => setBiometricMethod('native-phone')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              biometricMethod === 'native-phone'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-300" />
            <span>1. Sidik Jari Bawaan HP (WebAuthn / BiometricPrompt)</span>
          </button>

          <button
            type="button"
            onClick={() => setBiometricMethod('usb-otg')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              biometricMethod === 'usb-otg'
                ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Usb className="w-4 h-4 text-sky-300" />
            <span>2. Scanner Eksternal USB OTG (Digital Persona / SecuGen)</span>
          </button>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            {/* 3D Fingerprint Scanner Touch Sensor Pad */}
            <div 
              onClick={() => {
                const target = activeRole === 'guru' ? filteredTeachers[0] : filteredStudents[0];
                if (target) {
                  triggerBiometricScan(activeRole, target.id);
                }
              }}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-0.5 cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 group shrink-0 ${
                isScanning 
                  ? 'bg-gradient-to-b from-emerald-400 via-teal-300 to-green-500 shadow-[0_0_35px_rgba(16,185,129,0.7)] ring-2 ring-emerald-300'
                  : biometricMethod === 'native-phone'
                  ? 'bg-gradient-to-b from-emerald-600 via-teal-700 to-slate-900 shadow-lg shadow-emerald-500/20'
                  : 'bg-gradient-to-b from-indigo-600 via-sky-700 to-slate-900 shadow-lg shadow-indigo-500/20'
              }`}
              title="Ketuk untuk memindai kandidat pertama"
            >
              <div className="w-full h-full rounded-[14px] bg-slate-950/95 flex flex-col items-center justify-center p-2 relative overflow-hidden">
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-[1px] animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_12px_#10b981]" />
                )}

                <Fingerprint className={`w-10 h-10 transition-colors duration-300 ${
                  isScanning 
                    ? 'text-emerald-300 scale-110 animate-pulse' 
                    : biometricMethod === 'native-phone' ? 'text-emerald-400' : 'text-sky-400'
                }`} />

                <span className="text-[9px] font-bold tracking-wider uppercase mt-1 text-slate-300">
                  {isScanning ? 'Memindai...' : 'Sentuh Scan'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    {biometricMethod === 'native-phone' 
                      ? 'Sensor Biometrik HP Aktif (WebAuthn API)' 
                      : usbStatus.isConnected 
                      ? `USB OTG Terhubung (${usbStatus.deviceName})` 
                      : 'Scanner Eksternal USB OTG Siap (WebUSB)'}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  {biometricMethod === 'native-phone' ? 'ID: ANDROID_BIOMETRIC' : 'ID: USB_SCANNER_01'}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                {biometricMethod === 'native-phone'
                  ? 'Pemindai Sidik Jari / Biometrik Bawaan HP Android'
                  : 'Pemindai Sidik Jari Hardware Eksternal (Port USB OTG)'}
              </h3>

              <p className="text-xs text-slate-300 mt-0.5 max-w-xl leading-relaxed">
                {biometricMethod === 'native-phone'
                  ? 'Klik tombol "Scan Sidik Jari" pada nama guru atau siswa di bawah. Android akan otomatis memunculkan dialog sidik jari bawaan HP (BiometricPrompt / WebAuthn).'
                  : 'Hubungkan scanner USB OTG (Digital Persona / SecuGen / ZKTeco) ke port HP Android. Aplikasi mendeteksi device via WebUSB atau Java Native Bridge.'}
              </p>

              {scanError && (
                <div className="mt-2 text-xs font-semibold text-rose-400 bg-rose-950/80 border border-rose-600/60 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Verification Feedback Card */}
          {verificationFeedback ? (
            <div className="w-full md:w-auto p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-400/80 shadow-2xl animate-fadeIn flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold shrink-0">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Presensi Berhasil Diverifikasi ({verificationFeedback.method})</span>
                </div>
                <div className="text-sm font-extrabold text-white truncate max-w-xs">{verificationFeedback.name}</div>
                <div className="text-[11px] text-emerald-200 font-mono mt-0.5 flex items-center gap-2">
                  <span>{verificationFeedback.identifier}</span>
                  <span>&bull;</span>
                  <span className="font-bold">{verificationFeedback.time} WIB</span>
                </div>
                <div className="text-[9px] text-emerald-300/80 font-mono mt-1 truncate max-w-xs">
                  SHA-256: {verificationFeedback.sha256Hash.slice(0, 24)}...
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-end text-right text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Validasi Kriptografi SHA-256</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <CloudCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Otomatis Sinkronisasi Firebase Firestore</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Switcher: Guru vs Siswa */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
          <button
            onClick={() => setActiveRole('guru')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeRole === 'guru'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Presensi Sidik Jari Guru ({teachers.length})</span>
          </button>

          <button
            onClick={() => setActiveRole('siswa')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeRole === 'siswa'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Presensi Sidik Jari Siswa ({students.length})</span>
          </button>
        </div>

        {/* If Siswa mode: Class Selector */}
        {activeRole === 'siswa' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedClass('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedClass === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Semua Kelas
            </button>
            {availableClasses.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Kelas {cls}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPI Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">
            Total {activeRole === 'guru' ? 'Tenaga Guru' : 'Siswa'}
          </span>
          <p className="text-xl font-bold text-white tabular-data mt-0.5">{activeTotal}</p>
          <span className="text-[10px] text-slate-500">
            {activeRole === 'guru' ? 'Pendidik Terdaftar' : (selectedClass === 'ALL' ? 'Semua Kelas' : `Kelas ${selectedClass}`)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40">
          <span className="text-[11px] font-medium text-emerald-300">Hadir Sidik Jari</span>
          <p className="text-xl font-bold text-emerald-400 tabular-data mt-0.5">{activeStats.hadir}</p>
          <span className="text-[10px] text-emerald-500">
            {activeTotal > 0 ? Math.round((activeStats.hadir / activeTotal) * 100) : 0}% Tingkat Kehadiran
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/40">
          <span className="text-[11px] font-medium text-amber-300">Izin</span>
          <p className="text-xl font-bold text-amber-400 tabular-data mt-0.5">{activeStats.izin}</p>
          <span className="text-[10px] text-amber-500">Surat Izin Resmi</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40">
          <span className="text-[11px] font-medium text-purple-300">Sakit</span>
          <p className="text-xl font-bold text-purple-400 tabular-data mt-0.5">{activeStats.sakit}</p>
          <span className="text-[10px] text-purple-400">Keterangan Dokter</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/40">
          <span className="text-[11px] font-medium text-rose-300">Alpa / Belum Scan</span>
          <p className="text-xl font-bold text-rose-400 tabular-data mt-0.5">{activeStats.alpa + activeStats.belum}</p>
          <span className="text-[10px] text-rose-400">Belum Melakukan Scan</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={activeRole === 'guru' ? 'Cari nama guru, NIP, atau mata pelajaran...' : 'Cari nama siswa, NISN, atau kelas...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-colors"
          />
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">{activeRole === 'guru' ? 'NIP & Mata Pelajaran' : 'NISN & Rombel'}</th>
                <th className="py-3 px-4 text-center">Status Presensi</th>
                <th className="py-3 px-4 text-center">Waktu Scan</th>
                <th className="py-3 px-4 text-right">Aksi Biometrik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeRole === 'guru' ? (
                filteredTeachers.map((teacher) => {
                  const att = teacherAttMap.get(teacher.id);
                  const isPresent = att?.status === 'HADIR';
                  const isThisScanning = isScanning && activeScanCandidateId === teacher.id;

                  return (
                    <tr key={teacher.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{teacher.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Status: {teacher.employmentStatus}</div>
                      </td>

                      {/* NIP & Subject */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-emerald-300 font-semibold">{teacher.nip}</div>
                        <div className="text-slate-400 mt-0.5">{teacher.subject}</div>
                      </td>

                      {/* 3D Segmented Attendance Status Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-950/90 rounded-xl border border-slate-800/80 w-fit mx-auto shadow-inner">
                          <button
                            type="button"
                            onClick={() => markTeacherAttendance(teacher.id, selectedDate, 'HADIR')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              att?.status === 'HADIR'
                                ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>Hadir</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => markTeacherAttendance(teacher.id, selectedDate, 'IZIN')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              att?.status === 'IZIN'
                                ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 ring-1 ring-amber-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>Izin</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => markTeacherAttendance(teacher.id, selectedDate, 'SAKIT')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              att?.status === 'SAKIT'
                                ? 'bg-gradient-to-b from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/30 ring-1 ring-purple-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>Sakit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => markTeacherAttendance(teacher.id, selectedDate, 'ALPA')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              att?.status === 'ALPA'
                                ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/30 ring-1 ring-rose-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Alpa</span>
                          </button>
                        </div>
                      </td>

                      {/* Check-in Time & Biometric Token */}
                      <td className="py-3.5 px-4 text-center">
                        {att?.checkInTime ? (
                          <div>
                            <span className="font-mono font-bold text-white text-xs">{att.checkInTime}</span>
                            <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{att.verificationMethod === 'FINGERPRINT' ? 'Sidik Jari' : 'Manual'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">-</span>
                        )}
                      </td>

                      {/* Fingerprint Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isThisScanning}
                          onClick={() => triggerBiometricScan('guru', teacher.id)}
                          className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer ${
                            isPresent
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60'
                              : biometricMethod === 'native-phone'
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 active:scale-95'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 active:scale-95'
                          }`}
                          title={biometricMethod === 'native-phone' ? 'Pindai dengan sensor bawaan HP' : 'Pindai dengan scanner USB OTG'}
                        >
                          <Fingerprint className={`w-4 h-4 ${isThisScanning ? 'animate-spin' : ''}`} />
                          <span>{isPresent ? 'Scan Ulang' : 'Scan Sidik Jari'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                filteredStudents.map((student) => {
                  const att = studentAttMap.get(student.id);
                  const isPresent = att?.status === 'HADIR';
                  const isThisScanning = isScanning && activeScanCandidateId === student.id;

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{student.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {student.gender} &bull; Wali: {student.parentName}
                        </div>
                      </td>

                      {/* NISN & Class */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-emerald-300 font-semibold">{student.nisn}</div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 mt-1">
                          Kelas {student.className}
                        </span>
                      </td>

                      {/* 3D Segmented Attendance Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-950/90 rounded-xl border border-slate-800/80 w-fit mx-auto shadow-inner">
                          <button
                            type="button"
                            onClick={() => markStudentAttendance(student.id, selectedDate, 'HADIR')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              att?.status === 'HADIR'
                                ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>Hadir</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => markStudentAttendance(student.id, selectedDate, 'IZIN')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              att?.status === 'IZIN'
                                ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 ring-1 ring-amber-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>Izin</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => markStudentAttendance(student.id, selectedDate, 'SAKIT')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              att?.status === 'SAKIT'
                                ? 'bg-gradient-to-b from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/30 ring-1 ring-purple-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>Sakit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => markStudentAttendance(student.id, selectedDate, 'ALPA')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              att?.status === 'ALPA'
                                ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/30 ring-1 ring-rose-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Alpa</span>
                          </button>
                        </div>
                      </td>

                      {/* Check-in Time */}
                      <td className="py-3.5 px-4 text-center">
                        {att?.checkInTime ? (
                          <div>
                            <span className="font-mono font-bold text-white text-xs">{att.checkInTime}</span>
                            <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{att.verificationMethod === 'FINGERPRINT' ? 'Sidik Jari' : 'Manual'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">-</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isThisScanning}
                          onClick={() => triggerBiometricScan('siswa', student.id)}
                          className={`py-1.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer ${
                            isPresent
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60'
                              : biometricMethod === 'native-phone'
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 active:scale-95'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 active:scale-95'
                          }`}
                        >
                          <Fingerprint className={`w-4 h-4 ${isThisScanning ? 'animate-spin' : ''}`} />
                          <span>{isPresent ? 'Scan Ulang' : 'Scan Sidik Jari'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Modal: Android Studio / Capacitor APK with External USB OTG Scanner */}
      {isNativeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Usb className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Panduan Integrasi Scanner Sidik Jari USB OTG</h3>
                  <p className="text-xs text-slate-400">WebUSB API & Native Android WebView Bridge (Capacitor)</p>
                </div>
              </div>
              <button
                onClick={() => setIsNativeGuideOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Aplikasi <strong>Satu Tangan</strong> dirancang siap mendukung pemindaian sidik jari melalui 2 cara utama:
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>1. Langsung Lewat Browser HP / PWA (WebAuthn API):</span>
                </h4>
                <p className="text-slate-400">
                  Memanfaatkan sensor biometrik bawaan HP (fingerprint di layar atau samping tombol power). Menggunakan <code className="text-emerald-300 font-mono">navigator.credentials.create()</code> dengan parameter <code className="text-emerald-300 font-mono">userVerification: "required"</code> sehingga dialog bawaan OS Android otomatis muncul tanpa perlu install APK tambahan.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-sky-300 flex items-center gap-2">
                  <Usb className="w-4 h-4" />
                  <span>2. Scanner Fisik Eksternal (Digital Persona / SecuGen USB OTG):</span>
                </h4>
                <p className="text-slate-400">
                  Untuk scanner USB eksternal yang dicolokkan ke port HP lewat adapter OTG:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                  <li><strong>WebUSB Mode:</strong> Browser Chrome Android dapat membaca endpoint USB secara langsung jika device memiliki vendor ID terdaftar.</li>
                  <li><strong>Native Android Bridge (Disarankan untuk Produksi Sekolah):</strong> Bungkus aplikasi ke Android APK menggunakan Capacitor atau Android Studio WebView dengan kode bridge di bawah:</li>
                </ul>
              </div>

              {/* Code Snippet Box */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] overflow-x-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                  <span>MainActivity.java (Android Native Bridge)</span>
                  <button
                    onClick={copyAndroidBridgeCode}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedCodeSnippet ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodeSnippet ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                </div>
                <pre className="text-emerald-400">
{`// Android Java Native Bridge untuk Scanner USB OTG:
public class FingerprintBridge {
    Context context;
    public FingerprintBridge(Context c) { this.context = c; }

    @JavascriptInterface
    public boolean isUsbScannerConnected() {
        UsbManager manager = (UsbManager) context.getSystemService(Context.USB_SERVICE);
        return !manager.getDeviceList().isEmpty();
    }

    @JavascriptInterface
    public String scanFingerprint() {
        // Panggil SDK Digital Persona U.are.U / SecuGen via USB OTG
        return "sha256_biometric_hash_token_verified";
    }
}

// Pasang bridge ke WebView:
webView.addJavascriptInterface(new FingerprintBridge(this), "AndroidFingerprintBridge");`}
                </pre>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-700/40 rounded-xl text-indigo-200">
                Data presensi biometrik yang tervalidasi secara otomatis dikirimkan ke <strong>Firebase Cloud Firestore</strong> dan tersinkronisasi realtime dengan seluruh perangkat operator sekolah.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsNativeGuideOpen(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
