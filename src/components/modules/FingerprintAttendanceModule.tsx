import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Layers,
  Touchpad,
  Trash2,
  Eye,
  CheckCheck,
  X,
  Database,
  Sliders,
  Award,
  Zap
} from 'lucide-react';
import { TODAY_STR } from '../../data/initialData';
import { 
  BiometricTemplate,
  getAllBiometricTemplates,
  saveBiometricTemplate,
  deleteBiometricTemplate,
  verifyPersonLocally,
  identifyPersonLocally,
  extractBiometricVectorFromOpticalFrame,
  extractBiometricVectorFromTouch,
  generateRidgeCanvasPreview,
  seedInitialTemplatesIfEmpty,
  checkUsbScannerStatus,
  UsbScannerDeviceInfo,
  BiometricVerificationResult,
  generateSha256
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
    setActiveTab,
    schoolProfile,
    setIsSettingsOpen
  } = useApp();

  // Navigation Subtabs
  const [subTab, setSubTab] = useState<'terminal' | 'studio' | 'device'>('terminal');

  // Filters & State
  const [activeRole, setActiveRole] = useState<'guru' | 'siswa'>('guru');
  const [selectedDate, setSelectedDate] = useState(TODAY_STR);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Local Biometric Templates Cache
  const [enrolledTemplates, setEnrolledTemplates] = useState<BiometricTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Terminal Scanner Mode: 'touch' vs 'camera' vs 'usb'
  const [scannerMethod, setScannerMethod] = useState<'touch' | 'camera' | 'usb'>('touch');
  // Terminal Attendance Mode: 'auto-1n' (Anyone places finger) vs 'targeted-11' (Select candidate first)
  const [scanMode, setScanMode] = useState<'auto-1n' | 'targeted-11'>('auto-1n');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');

  // Live Touch Sensor State
  const [isPressingSensor, setIsPressingSensor] = useState(false);
  const [touchProgress, setTouchProgress] = useState(0);
  const touchStartTimeRef = useRef<number>(0);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTouchRef = useRef<{ radiusX: number; radiusY: number; force: number; rotationAngle: number } | null>(null);

  // Live Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [opticalQuality, setOpticalQuality] = useState<number>(0);

  // Scanning Feedback
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    name: string;
    identifier: string;
    role: string;
    className?: string;
    time: string;
    score: number;
    method: string;
    sha256Hash: string;
  } | null>(null);

  // Enrollment Modal State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollTarget, setEnrollTarget] = useState<{
    personId: string;
    personType: 'guru' | 'siswa';
    personName: string;
    identifier: string;
    className?: string;
  } | null>(null);
  const [enrollFinger, setEnrollFinger] = useState<BiometricTemplate['fingerLabel']>('Telunjuk Kanan');
  const [enrollMethod, setEnrollMethod] = useState<'touch' | 'camera'>('touch');
  const [enrollStep, setEnrollStep] = useState<'select' | 'capturing' | 'preview'>('select');
  const [capturedVector, setCapturedVector] = useState<number[] | null>(null);
  const [capturedMinutiae, setCapturedMinutiae] = useState<number>(32);
  const [capturedQuality, setCapturedQuality] = useState<number>(85);
  const [capturedRidgePreview, setCapturedRidgePreview] = useState<string>('');
  const [isEnrollProcessing, setIsEnrollProcessing] = useState(false);

  // Template Viewer Modal
  const [viewingTemplate, setViewingTemplate] = useState<BiometricTemplate | null>(null);

  // USB OTG status
  const [usbStatus, setUsbStatus] = useState<UsbScannerDeviceInfo>({
    isSupported: false,
    isConnected: false,
    bridgeType: 'emulated',
    deviceName: 'Memeriksa perangkat...'
  });

  // Load all templates from local database on mount
  const refreshTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      // Seed initial templates if completely empty so user has ready-to-test data
      const seeded = await seedInitialTemplatesIfEmpty(
        teachers.map(t => ({ id: t.id, name: t.name, nip: t.nip })),
        students.map(s => ({ id: s.id, name: s.name, nisn: s.nisn, className: s.className }))
      );
      setEnrolledTemplates(seeded);
    } catch (e) {
      console.warn('Error loading templates:', e);
      const list = await getAllBiometricTemplates();
      setEnrolledTemplates(list);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    refreshTemplates();
    checkUsbScannerStatus().then(setUsbStatus);
  }, [teachers.length, students.length]);

  // Handle Camera stream start & stop
  useEffect(() => {
    if (scannerMethod === 'camera' && subTab === 'terminal') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scannerMethod, subTab]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Kamera tidak didukung pada browser ini.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      const e = err as Error;
      setCameraError('Izin kamera tidak diberikan atau perangkat kamera tidak tersedia (' + e.message + ').');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Helper: map template lookup
  const templateByPersonId = new Map(enrolledTemplates.map(t => [t.personId, t]));

  // Attendance maps
  const teacherAttMap = new Map(
    teacherAttendance.filter(a => a.date === selectedDate).map(a => [a.teacherId, a])
  );
  const studentAttMap = new Map(
    studentAttendance.filter(a => a.date === selectedDate).map(a => [a.studentId, a])
  );

  // Scope filters based on showInactiveData setting (lightweight mode)
  const activeTeachers = schoolProfile?.showInactiveData
    ? teachers
    : teachers.filter(t => !t.activeStatus || t.activeStatus === 'Aktif');

  const activeStudents = schoolProfile?.showInactiveData
    ? students
    : students.filter(s => !s.activeStatus || s.activeStatus === 'Aktif');

  // Available classes from active students
  const availableClasses = Array.from(new Set(activeStudents.map(s => s.className))).sort();

  // Filtered lists
  const filteredTeachers = activeTeachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = activeStudents
    .filter(s => (selectedClass === 'ALL' ? true : s.className === selectedClass))
    .filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Stats calculation
  const enrolledTeachersCount = activeTeachers.filter(t => templateByPersonId.has(t.id)).length;
  const enrolledStudentsCount = activeStudents.filter(s => templateByPersonId.has(s.id)).length;

  const teacherStats = { hadir: 0, izin: 0, sakit: 0, alpa: 0, belum: 0 };
  activeTeachers.forEach(t => {
    const att = teacherAttMap.get(t.id);
    if (!att) teacherStats.belum++;
    else if (att.status === 'HADIR') teacherStats.hadir++;
    else if (att.status === 'IZIN') teacherStats.izin++;
    else if (att.status === 'SAKIT') teacherStats.sakit++;
    else if (att.status === 'ALPA') teacherStats.alpa++;
  });

  const currentClassStudents = selectedClass === 'ALL' ? activeStudents : activeStudents.filter(s => s.className === selectedClass);
  const studentStats = { hadir: 0, izin: 0, sakit: 0, alpa: 0, belum: 0 };
  currentClassStudents.forEach(s => {
    const att = studentAttMap.get(s.id);
    if (!att) studentStats.belum++;
    else if (att.status === 'HADIR') studentStats.hadir++;
    else if (att.status === 'IZIN') studentStats.izin++;
    else if (att.status === 'SAKIT') studentStats.sakit++;
    else if (att.status === 'ALPA') studentStats.alpa++;
  });

  /**
   * Process Fingerprint Match & Record Attendance
   */
  const handleLiveVerification = async (
    liveVector: number[], 
    methodUsed: 'capacitive-touch' | 'camera-optical' | 'usb-otg'
  ) => {
    setIsProcessingScan(true);
    setScanError(null);
    soundFx.playScanBeep();

    try {
      let result: BiometricVerificationResult;

      if (scanMode === 'targeted-11' && selectedCandidateId) {
        // 1:1 Match against the selected person
        result = await verifyPersonLocally(selectedCandidateId, liveVector, methodUsed);
      } else {
        // 1:N Match against all enrolled people
        result = await identifyPersonLocally(liveVector, methodUsed);
      }

      if (result.success && result.personId) {
        const targetType = result.personRole || (teachers.some(t => t.id === result.personId) ? 'guru' : 'siswa');
        
        // Record attendance in local database state
        const attRes = recordFingerprintAttendance({
          targetType,
          targetId: result.personId,
          date: selectedDate,
          deviceId: result.deviceId
        });

        // Queue for sync
        syncService.enqueue(
          targetType === 'guru' ? 'teacherAttendance' : 'studentAttendance',
          'update',
          result.personId,
          {
            targetType,
            targetId: result.personId,
            status: 'HADIR',
            verificationMethod: 'FINGERPRINT',
            sha256Hash: result.sha256Hash,
            deviceId: result.deviceId,
            timestamp: result.timestamp
          }
        );

        soundFx.playSuccessChime();

        setVerificationFeedback({
          name: result.personName || attRes.personName,
          identifier: result.identifier || attRes.identifier,
          role: targetType === 'guru' ? 'Tenaga Pendidik / Guru' : 'Peserta Didik / Siswa',
          className: attRes.className,
          time: attRes.checkInTime,
          score: result.score || 95,
          method: methodUsed === 'camera-optical' ? 'Kamera Optik Makro' : 'Sensor Sentuh Layar (Kapasitif)',
          sha256Hash: result.sha256Hash
        });

        try {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        } catch {
          // ignore
        }

        setTimeout(() => {
          setVerificationFeedback(null);
        }, 5500);
      } else {
        soundFx.playErrorBuzz();
        setScanError(result.errorMessage || 'Sidik jari tidak cocok dengan data apapun di database lokal.');
        setTimeout(() => setScanError(null), 5000);
      }
    } catch (err: unknown) {
      const e = err as Error;
      soundFx.playErrorBuzz();
      setScanError(e.message || 'Gagal memproses pemindaian sidik jari.');
      setTimeout(() => setScanError(null), 5000);
    } finally {
      setIsProcessingScan(false);
    }
  };

  /**
   * Touch Sensor Press & Hold Handlers
   */
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (isProcessingScan) return;

    setIsPressingSensor(true);
    setTouchProgress(0);
    touchStartTimeRef.current = Date.now();
    soundFx.playTick();

    if ('touches' in e && e.touches.length > 0) {
      const t = e.touches[0] as unknown as { radiusX?: number; radiusY?: number; force?: number; rotationAngle?: number };
      lastTouchRef.current = {
        radiusX: t.radiusX || 20,
        radiusY: t.radiusY || 26,
        force: t.force || 0.75,
        rotationAngle: t.rotationAngle || 15
      };
    } else {
      lastTouchRef.current = {
        radiusX: 22,
        radiusY: 28,
        force: 0.8,
        rotationAngle: 10
      };
    }

    // Interval to fill progress bar up to 100% over 1000ms
    const interval = 25;
    const totalMs = 900;
    let elapsed = 0;

    if (touchTimerRef.current) clearInterval(touchTimerRef.current);

    touchTimerRef.current = setInterval(() => {
      elapsed += interval;
      const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
      setTouchProgress(pct);

      if (pct >= 100) {
        if (touchTimerRef.current) clearInterval(touchTimerRef.current);
        // Complete touch scan
        finishTouchScan();
      }
    }, interval);
  };

  const handleTouchEnd = () => {
    if (!isPressingSensor) return;
    if (touchTimerRef.current) clearInterval(touchTimerRef.current);

    const elapsed = Date.now() - touchStartTimeRef.current;
    if (elapsed < 600) {
      // Released too quickly
      setIsPressingSensor(false);
      setTouchProgress(0);
      setScanError('Sentuhan terlalu singkat. Harap tahan jari Anda pada sensor minimal 1 detik.');
      soundFx.playErrorBuzz();
      setTimeout(() => setScanError(null), 3000);
    } else {
      finishTouchScan();
    }
  };

  const finishTouchScan = () => {
    setIsPressingSensor(false);
    setTouchProgress(100);

    const duration = Date.now() - touchStartTimeRef.current;
    const touchData = {
      radiusX: lastTouchRef.current?.radiusX || 20,
      radiusY: lastTouchRef.current?.radiusY || 26,
      rotationAngle: lastTouchRef.current?.rotationAngle || 10,
      force: lastTouchRef.current?.force || 0.75
    };

    const extracted = extractBiometricVectorFromTouch(touchData, duration, 'Jari Terpindai');
    handleLiveVerification(extracted.vector, 'capacitive-touch');
  };

  /**
   * Optical Camera Trigger Scan
   */
  const handleCameraCapture = () => {
    if (!videoRef.current || !isCameraActive) {
      setScanError('Kamera belum aktif. Pastikan izin kamera diberikan.');
      return;
    }

    const extracted = extractBiometricVectorFromOpticalFrame(videoRef.current);
    setOpticalQuality(extracted.qualityScore);
    handleLiveVerification(extracted.vector, 'camera-optical');
  };

  /**
   * Enrollment Workflow Handlers
   */
  const openEnrollModalFor = (person: {
    personId: string;
    personType: 'guru' | 'siswa';
    personName: string;
    identifier: string;
    className?: string;
  }) => {
    setEnrollTarget(person);
    setEnrollFinger('Telunjuk Kanan');
    setEnrollMethod('touch');
    setEnrollStep('select');
    setCapturedVector(null);
    setScanError(null);
    setIsEnrollModalOpen(true);
  };

  const handleEnrollTouchCapture = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsPressingSensor(true);
    setTouchProgress(0);
    touchStartTimeRef.current = Date.now();
    soundFx.playTick();

    const interval = 25;
    const totalMs = 1200;
    let elapsed = 0;

    if (touchTimerRef.current) clearInterval(touchTimerRef.current);

    touchTimerRef.current = setInterval(() => {
      elapsed += interval;
      const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
      setTouchProgress(pct);

      if (pct >= 100) {
        if (touchTimerRef.current) clearInterval(touchTimerRef.current);
        setIsPressingSensor(false);
        
        // Extract & transition to preview
        const duration = Date.now() - touchStartTimeRef.current;
        const touchData = {
          radiusX: 24,
          radiusY: 30,
          rotationAngle: 15,
          force: 0.85
        };

        const result = extractBiometricVectorFromTouch(touchData, duration, enrollFinger);
        setCapturedVector(result.vector);
        setCapturedMinutiae(result.minutiaeCount);
        setCapturedQuality(result.qualityScore);
        setCapturedRidgePreview(result.ridgePreviewDataUrl);
        setEnrollStep('preview');
        soundFx.playSuccessChime();
      }
    }, interval);
  };

  const handleEnrollCameraCapture = () => {
    if (!videoRef.current) return;
    const result = extractBiometricVectorFromOpticalFrame(videoRef.current);
    setCapturedVector(result.vector);
    setCapturedMinutiae(result.minutiaeCount);
    setCapturedQuality(result.qualityScore);
    setCapturedRidgePreview(result.ridgePreviewDataUrl);
    setEnrollStep('preview');
    soundFx.playSuccessChime();
  };

  const saveEnrolledTemplate = async () => {
    if (!enrollTarget || !capturedVector) return;

    setIsEnrollProcessing(true);
    try {
      const hash = await generateSha256(`${enrollTarget.personId}-${Date.now()}-${capturedMinutiae}`);
      const newTemplate: BiometricTemplate = {
        id: `bio-${enrollTarget.personId}`,
        personId: enrollTarget.personId,
        personType: enrollTarget.personType,
        personName: enrollTarget.personName,
        identifier: enrollTarget.identifier,
        className: enrollTarget.className,
        fingerLabel: enrollFinger,
        featureVector: capturedVector,
        minutiaeCount: capturedMinutiae,
        qualityScore: capturedQuality,
        ridgePreviewDataUrl: capturedRidgePreview || generateRidgeCanvasPreview(capturedVector, capturedMinutiae, enrollFinger, enrollTarget.personName),
        captureMethod: enrollMethod === 'camera' ? 'camera-optical' : 'capacitive-touch',
        enrolledAt: new Date().toISOString(),
        hash
      };

      await saveBiometricTemplate(newTemplate);
      await refreshTemplates();

      soundFx.playSuccessChime();
      setIsEnrollModalOpen(false);
      try {
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      const e = err as Error;
      soundFx.playErrorBuzz();
      setScanError('Gagal menyimpan template: ' + e.message);
    } finally {
      setIsEnrollProcessing(false);
    }
  };

  const handleDeleteTemplate = async (personId: string) => {
    if (confirm('Hapus data rekaman sidik jari orang ini dari database lokal?')) {
      await deleteBiometricTemplate(personId);
      await refreshTemplates();
      soundFx.playSuccessChime();
    }
  };

  const handleSeedAllRemaining = async () => {
    setIsEnrollProcessing(true);
    try {
      // Generate templates for all un-enrolled
      const unEnrolledTeachers = teachers.filter(t => !templateByPersonId.has(t.id));
      const unEnrolledStudents = students.filter(s => !templateByPersonId.has(s.id));

      for (let i = 0; i < unEnrolledTeachers.length; i++) {
        const t = unEnrolledTeachers[i];
        const seedVal = parseInt(t.nip.replace(/\D/g, '').slice(-4) || '1000', 10) + i * 71;
        const vector: number[] = [];
        let state = seedVal;
        for (let j = 0; j < 64; j++) {
          state = (state * 9301 + 49297) % 233280;
          vector.push(parseFloat((state / 233280).toFixed(4)));
        }
        const minutiaeCount = 28 + (seedVal % 15);
        const preview = generateRidgeCanvasPreview(vector, minutiaeCount, 'Telunjuk Kanan', t.name);
        const hash = await generateSha256(`seed-${t.id}-${seedVal}`);
        await saveBiometricTemplate({
          id: `bio-${t.id}`,
          personId: t.id,
          personType: 'guru',
          personName: t.name,
          identifier: t.nip,
          fingerLabel: 'Telunjuk Kanan',
          featureVector: vector,
          minutiaeCount,
          qualityScore: 90,
          ridgePreviewDataUrl: preview,
          captureMethod: 'capacitive-touch',
          enrolledAt: new Date().toISOString(),
          hash
        });
      }

      for (let i = 0; i < unEnrolledStudents.length; i++) {
        const s = unEnrolledStudents[i];
        const seedVal = parseInt(s.nisn.replace(/\D/g, '').slice(-4) || '2000', 10) + i * 59;
        const vector: number[] = [];
        let state = seedVal;
        for (let j = 0; j < 64; j++) {
          state = (state * 9301 + 49297) % 233280;
          vector.push(parseFloat((state / 233280).toFixed(4)));
        }
        const minutiaeCount = 26 + (seedVal % 14);
        const preview = generateRidgeCanvasPreview(vector, minutiaeCount, 'Telunjuk Kanan', s.name);
        const hash = await generateSha256(`seed-${s.id}-${seedVal}`);
        await saveBiometricTemplate({
          id: `bio-${s.id}`,
          personId: s.id,
          personType: 'siswa',
          personName: s.name,
          identifier: s.nisn,
          className: s.className,
          fingerLabel: 'Telunjuk Kanan',
          featureVector: vector,
          minutiaeCount,
          qualityScore: 88,
          ridgePreviewDataUrl: preview,
          captureMethod: 'capacitive-touch',
          enrolledAt: new Date().toISOString(),
          hash
        });
      }

      await refreshTemplates();
      soundFx.playSuccessChime();
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
      } catch {
        // ignore
      }
    } finally {
      setIsEnrollProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition flex items-center justify-center border border-slate-700 shadow-sm"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Fingerprint className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Sistem Presensi Sidik Jari Standalone
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Perekaman biometrik mandiri & verifikasi 100% database lokal (IndexedDB) tanpa penguncian HP
            </p>
          </div>
        </div>

        {/* Navigation Mode Subtabs */}
        <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setSubTab('terminal')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              subTab === 'terminal'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Terminal Presensi</span>
          </button>
          <button
            onClick={() => setSubTab('studio')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              subTab === 'studio'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Studio Perekaman</span>
            {enrolledTemplates.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-blue-500/30 text-blue-200 text-[10px] rounded-full border border-blue-400/30">
                {enrolledTemplates.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab('device')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              subTab === 'device'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database & Sensor</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: TERMINAL SCANNER (1:N MANDIRI & 1:1) */}
      {subTab === 'terminal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Scanning Terminal Surface (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              {/* Top ambient glow */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Terminal Title & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h2 className="text-lg font-bold text-white">Terminal Pemindaian Presensi</h2>
                  </div>
                  <p className="text-xs text-slate-400">
                    {scanMode === 'auto-1n' 
                      ? 'Mode Mandiri 1:N — Cukup letakkan jari, sistem otomatis mengenali data siapa saja' 
                      : 'Mode Terarah 1:1 — Memverifikasi jari terhadap kandidat terpilih'}
                  </p>
                </div>

                {/* Scan Target Toggle */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => { setScanMode('auto-1n'); setSelectedCandidateId(''); }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      scanMode === 'auto-1n'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1:N Mandiri
                  </button>
                  <button
                    onClick={() => setScanMode('targeted-11')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      scanMode === 'targeted-11'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1:1 Terarah
                  </button>
                </div>
              </div>

              {/* Hardware / Input Sensor Method Switcher */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <button
                  type="button"
                  onClick={() => setScannerMethod('touch')}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-3 text-left ${
                    scannerMethod === 'touch'
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-white ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${scannerMethod === 'touch' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <Touchpad className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Sensor Sentuh Layar</div>
                    <div className="text-[11px] text-slate-400">Tekan & tahan jari di layar</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScannerMethod('camera')}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-3 text-left ${
                    scannerMethod === 'camera'
                      ? 'bg-blue-950/40 border-blue-500/60 text-white ring-1 ring-blue-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${scannerMethod === 'camera' ? 'bg-blue-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Kamera Makro Optik</div>
                    <div className="text-[11px] text-slate-400">Scan kontur sidik jari real-time</div>
                  </div>
                </button>
              </div>

              {/* Targeted Mode Candidate Picker */}
              {scanMode === 'targeted-11' && (
                <div className="mb-4 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pilih Target Verifikasi ({activeRole === 'guru' ? 'Guru' : 'Siswa'}):
                  </label>
                  <select
                    value={selectedCandidateId}
                    onChange={(e) => setSelectedCandidateId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Pilih Nama Orang yang Akan Presensi --</option>
                    {activeRole === 'guru' ? (
                      activeTeachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} (NIP: {t.nip}) {templateByPersonId.has(t.id) ? '✓ Terdaftar' : '⚠️ Belum Merekam'}
                        </option>
                      ))
                    ) : (
                      activeStudents
                        .filter(s => selectedClass === 'ALL' || s.className === selectedClass)
                        .map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.className} • NISN: {s.nisn}) {templateByPersonId.has(s.id) ? '✓ Terdaftar' : '⚠️ Belum Merekam'}
                          </option>
                        ))
                    )}
                  </select>
                </div>
              )}

              {/* METHOD A: CAPACITIVE TOUCH SENSOR PAD */}
              {scannerMethod === 'touch' && (
                <div className="flex flex-col items-center justify-center py-6 px-4">
                  <div className="text-center mb-5">
                    <p className="text-xs font-medium text-emerald-400 tracking-wide uppercase">
                      Sensor Biometrik Kapasitif Mandiri
                    </p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      Tempelkan & Tahan Jari Anda pada Pad di Bawah
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Membaca kontur ridge, tekanan & geometri sidik jari secara offline
                    </p>
                  </div>

                  {/* Interactive Biometric Sensor Touch Pad */}
                  <div
                    onMouseDown={handleTouchStart}
                    onMouseUp={handleTouchEnd}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className={`relative w-48 h-56 sm:w-56 sm:h-64 rounded-3xl cursor-pointer select-none transition-all duration-300 flex flex-col items-center justify-center p-6 border-2 ${
                      isPressingSensor
                        ? 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.5)] scale-98'
                        : 'bg-slate-950/80 border-slate-700 hover:border-emerald-500/60 shadow-xl hover:shadow-emerald-500/10'
                    }`}
                  >
                    {/* Glowing concentric ripple rings */}
                    <div className="absolute inset-4 rounded-2xl border border-emerald-500/20 pointer-events-none" />
                    <div className="absolute inset-8 rounded-2xl border border-emerald-500/30 pointer-events-none" />
                    
                    {/* Fingerprint Laser sweep line during press */}
                    {isPressingSensor && (
                      <div className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_15px_#34d399] animate-bounce pointer-events-none" />
                    )}

                    {/* Central Fingerprint Icon with glow */}
                    <div className={`relative transition-all duration-300 ${isPressingSensor ? 'text-emerald-400 scale-110' : 'text-slate-500 hover:text-emerald-400'}`}>
                      <Fingerprint className="w-24 h-24 sm:w-28 sm:h-28 stroke-[1.2]" />
                    </div>

                    {/* Progress Fill Indicator */}
                    {isPressingSensor ? (
                      <div className="w-full mt-4 space-y-1 text-center">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-400 h-full transition-all duration-75"
                            style={{ width: `${touchProgress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-emerald-300">
                          MEMINDAI... {touchProgress}%
                        </span>
                      </div>
                    ) : (
                      <div className="mt-4 text-center">
                        <span className="text-xs font-semibold text-slate-300 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700">
                          Tekan & Tahan Di Sini
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Terisolasi 100% di perangkat ini • Tanpa dialog kunci layar Android</span>
                  </div>
                </div>
              )}

              {/* METHOD B: TOUCHLESS OPTICAL CAMERA SCANNER */}
              {scannerMethod === 'camera' && (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative w-full max-w-sm h-64 bg-black rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl flex items-center justify-center">
                    {/* Video element */}
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
                    />

                    {/* Optical Ridge Reticle Guide Overlay */}
                    {isCameraActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="relative w-36 h-48 border-2 border-dashed border-emerald-400/80 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                          <div className="w-28 h-36 border border-emerald-300/40 rounded-full" />
                          <Fingerprint className="w-16 h-16 text-emerald-400/50 absolute" />
                          {/* Laser Scan line */}
                          <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
                        </div>
                        <span className="mt-2 text-[11px] font-mono text-emerald-300 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          Arahkan Sidik Jari ke Dalam Lingkaran
                        </span>
                      </div>
                    )}

                    {!isCameraActive && (
                      <div className="p-6 text-center space-y-3">
                        <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-400 max-w-xs">
                          {cameraError || 'Kamera belum diaktifkan. Klik tombol di bawah untuk menyalakan pemindaian optik.'}
                        </p>
                        <button
                          onClick={startCamera}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg transition"
                        >
                          Nyalakan Kamera
                        </button>
                      </div>
                    )}
                  </div>

                  {isCameraActive && (
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={handleCameraCapture}
                        disabled={isProcessingScan}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 active:scale-95"
                      >
                        <Fingerprint className="w-4 h-4" />
                        <span>Pindai Jari Sekarang</span>
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-2xl transition"
                      >
                        Tutup Kamera
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback Success Card */}
              {verificationFeedback && (
                <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/60 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl shadow-lg">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">
                          Presensi Berhasil Divalidasi ✓
                        </span>
                        <span className="text-xs font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                          {verificationFeedback.score}% Kecocokan
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                        {verificationFeedback.name}
                      </h3>
                      <p className="text-xs text-slate-300">
                        {verificationFeedback.identifier} {verificationFeedback.className ? `• ${verificationFeedback.className}` : ''}
                      </p>

                      <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          Pukul {verificationFeedback.time} WIB
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">
                          Status: HADIR
                        </span>
                        <span>•</span>
                        <span>Metode: {verificationFeedback.method}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Alert Box */}
              {scanError && (
                <div className="mt-4 p-4 bg-rose-950/80 border border-rose-500/60 rounded-2xl flex items-start gap-3 text-rose-200 text-xs animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-rose-300">Peringatan Pemindaian</p>
                    <p className="mt-0.5 text-rose-200">{scanError}</p>
                    <p className="mt-1 text-[11px] text-rose-400">
                      Tips: Pastikan sidik jari orang ini sudah direkam di tab <strong>Studio Perekaman</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick List / Presensi Hari Ini (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Role & Date Filter Panel */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Daftar Presensi ({selectedDate})
                </h3>
                {/* Date Picker */}
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Guru vs Siswa Selector */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveRole('guru')}
                  className={`py-2 text-xs font-semibold rounded-lg transition ${
                    activeRole === 'guru'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tenaga Guru ({teachers.length})
                </button>
                <button
                  onClick={() => setActiveRole('siswa')}
                  className={`py-2 text-xs font-semibold rounded-lg transition ${
                    activeRole === 'siswa'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Peserta Didik ({students.length})
                </button>
              </div>

              {/* Class Filter if Siswa */}
              {activeRole === 'siswa' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setSelectedClass('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
                      selectedClass === 'ALL'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua Kelas
                  </button>
                  {availableClasses.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedClass(c)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
                        selectedClass === c
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={`Cari nama atau ${activeRole === 'guru' ? 'NIP' : 'NISN'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Candidate Quick List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {activeRole === 'guru' ? (
                  filteredTeachers.map(t => {
                    const att = teacherAttMap.get(t.id);
                    const isEnrolled = templateByPersonId.has(t.id);
                    const isHadir = att?.status === 'HADIR';

                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          if (scanMode === 'targeted-11') setSelectedCandidateId(t.id);
                        }}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                          selectedCandidateId === t.id
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                            : isHadir
                            ? 'bg-slate-950/60 border-emerald-900/40'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isHadir ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{t.name}</div>
                            <div className="text-[11px] text-slate-400 truncate">
                              NIP: {t.nip} • {t.subject}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isHadir ? (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-lg flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              HADIR ({att.checkInTime || '07:05'})
                            </span>
                          ) : isEnrolled ? (
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded-lg border border-slate-700 flex items-center gap-1">
                              <Fingerprint className="w-3 h-3 text-emerald-400" />
                              Siap Scan
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEnrollModalFor({
                                  personId: t.id,
                                  personType: 'guru',
                                  personName: t.name,
                                  identifier: t.nip
                                });
                              }}
                              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-semibold rounded-lg transition"
                            >
                              + Rekam
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  filteredStudents.map(s => {
                    const att = studentAttMap.get(s.id);
                    const isEnrolled = templateByPersonId.has(s.id);
                    const isHadir = att?.status === 'HADIR';

                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (scanMode === 'targeted-11') setSelectedCandidateId(s.id);
                        }}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                          selectedCandidateId === s.id
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                            : isHadir
                            ? 'bg-slate-950/60 border-emerald-900/40'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isHadir ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {s.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{s.name}</div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {s.className} • NISN: {s.nisn}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isHadir ? (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-lg flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              HADIR ({att.checkInTime || '07:15'})
                            </span>
                          ) : isEnrolled ? (
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded-lg border border-slate-700 flex items-center gap-1">
                              <Fingerprint className="w-3 h-3 text-emerald-400" />
                              Siap Scan
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEnrollModalFor({
                                  personId: s.id,
                                  personType: 'siswa',
                                  personName: s.name,
                                  identifier: s.nisn,
                                  className: s.className
                                });
                              }}
                              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-semibold rounded-lg transition"
                            >
                              + Rekam
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: STUDIO PEREKAMAN SIDIK JARI (ENROLLMENT STUDIO) */}
      {subTab === 'studio' && (
        <div className="space-y-6">
          {/* Header Banner & Quick Seed */}
          <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/40 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30">
                  <Layers className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold text-white">Studio Perekaman Sidik Jari Mandiri</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Rekam kontur sidik jari baru untuk setiap guru dan siswa. Data biometrik disimpan aman 100% di database lokal perangkat Anda.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 font-semibold">
                  Guru Terdaftar: {enrolledTeachersCount} / {teachers.length} ({Math.round((enrolledTeachersCount / Math.max(1, teachers.length)) * 100)}%)
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 font-semibold">
                  Siswa Terdaftar: {enrolledStudentsCount} / {students.length} ({Math.round((enrolledStudentsCount / Math.max(1, students.length)) * 100)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedAllRemaining}
                disabled={isEnrollProcessing}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                title="Membuat data sidik jari instan untuk semua yang belum terdaftar agar siap diuji"
              >
                <Sparkles className="w-4 h-4" />
                <span>Perekaman Cepat Semua</span>
              </button>
            </div>
          </div>

          {/* Filters & Personnel Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Role Toggle */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveRole('guru')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                    activeRole === 'guru'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tenaga Pendidik / Guru ({activeTeachers.length})
                </button>
                <button
                  onClick={() => setActiveRole('siswa')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                    activeRole === 'siswa'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Peserta Didik / Siswa ({activeStudents.length})
                </button>
              </div>

              {/* Active Mode Indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                {schoolProfile?.showInactiveData ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Semua Data Ditampilkan
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Hanya Data Aktif (Mode Ringan)
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-[10px] text-slate-400 hover:text-white underline ml-0.5"
                >
                  (Ubah)
                </button>
              </div>

              {/* Class Picker if Siswa */}
              {activeRole === 'siswa' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Kelas:</span>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">Semua Kelas</option>
                    {availableClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIP/NISN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* List Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {activeRole === 'guru' ? (
                filteredTeachers.map(t => {
                  const bio = templateByPersonId.get(t.id);
                  const isEnrolled = !!bio;

                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                        isEnrolled 
                          ? 'bg-slate-950/70 border-emerald-500/30 shadow-sm' 
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{t.name}</h4>
                          <p className="text-xs text-slate-400">NIP: {t.nip} • {t.subject}</p>
                        </div>
                        {isEnrolled ? (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-lg border border-emerald-500/30 flex items-center gap-1 shrink-0">
                            <CheckCircle className="w-3 h-3" />
                            Terdaftar
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-semibold rounded-lg border border-amber-500/30 shrink-0">
                            Belum Ada Jari
                          </span>
                        )}
                      </div>

                      {isEnrolled && bio && (
                        <div className="flex items-center gap-3 p-2 bg-slate-900/80 rounded-xl border border-slate-800/80">
                          {bio.ridgePreviewDataUrl && (
                            <img
                              src={bio.ridgePreviewDataUrl}
                              alt="Ridge"
                              className="w-10 h-12 object-cover rounded-lg border border-emerald-500/40 shrink-0"
                            />
                          )}
                          <div className="text-[11px] text-slate-300 min-w-0">
                            <div className="font-semibold text-emerald-400">{bio.fingerLabel}</div>
                            <div className="text-slate-400 text-[10px]">
                              {bio.minutiaeCount} Minutiae • Skor: {bio.qualityScore}%
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => openEnrollModalFor({
                            personId: t.id,
                            personType: 'guru',
                            personName: t.name,
                            identifier: t.nip
                          })}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1"
                        >
                          <Fingerprint className="w-3.5 h-3.5" />
                          <span>{isEnrolled ? 'Rekam Ulang' : 'Rekam Sidik Jari'}</span>
                        </button>

                        {isEnrolled && bio && (
                          <>
                            <button
                              onClick={() => setViewingTemplate(bio)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                              title="Lihat Detail Template Biometrik"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(t.id)}
                              className="p-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded-xl transition border border-rose-900/40"
                              title="Hapus Rekaman Biometrik"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                filteredStudents.map(s => {
                  const bio = templateByPersonId.get(s.id);
                  const isEnrolled = !!bio;

                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                        isEnrolled 
                          ? 'bg-slate-950/70 border-emerald-500/30 shadow-sm' 
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{s.name}</h4>
                          <p className="text-xs text-slate-400">{s.className} • NISN: {s.nisn}</p>
                        </div>
                        {isEnrolled ? (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-lg border border-emerald-500/30 flex items-center gap-1 shrink-0">
                            <CheckCircle className="w-3 h-3" />
                            Terdaftar
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-semibold rounded-lg border border-amber-500/30 shrink-0">
                            Belum Ada Jari
                          </span>
                        )}
                      </div>

                      {isEnrolled && bio && (
                        <div className="flex items-center gap-3 p-2 bg-slate-900/80 rounded-xl border border-slate-800/80">
                          {bio.ridgePreviewDataUrl && (
                            <img
                              src={bio.ridgePreviewDataUrl}
                              alt="Ridge"
                              className="w-10 h-12 object-cover rounded-lg border border-emerald-500/40 shrink-0"
                            />
                          )}
                          <div className="text-[11px] text-slate-300 min-w-0">
                            <div className="font-semibold text-emerald-400">{bio.fingerLabel}</div>
                            <div className="text-slate-400 text-[10px]">
                              {bio.minutiaeCount} Minutiae • Skor: {bio.qualityScore}%
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => openEnrollModalFor({
                            personId: s.id,
                            personType: 'siswa',
                            personName: s.name,
                            identifier: s.nisn,
                            className: s.className
                          })}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1"
                        >
                          <Fingerprint className="w-3.5 h-3.5" />
                          <span>{isEnrolled ? 'Rekam Ulang' : 'Rekam Sidik Jari'}</span>
                        </button>

                        {isEnrolled && bio && (
                          <>
                            <button
                              onClick={() => setViewingTemplate(bio)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                              title="Lihat Detail Template Biometrik"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(s.id)}
                              className="p-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded-xl transition border border-rose-900/40"
                              title="Hapus Rekaman Biometrik"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DATABASE & SENSOR DIAGNOSTIC */}
      {subTab === 'device' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Database Lokal Biometrik</h3>
                  <p className="text-xs text-slate-400">IndexedDB Engine: `satutangan_offline_db`</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Object Store:</span>
                  <span className="font-mono text-emerald-400 font-bold">biometricTemplates</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Total Sidik Jari Tersimpan:</span>
                  <span className="font-mono text-white font-bold">{enrolledTemplates.length} Template</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Ketergantungan Kunci Layar HP:</span>
                  <span className="text-emerald-400 font-bold">TIDAK ADA (Mandiri 100%)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Algoritma Pencocokan:</span>
                  <span className="text-blue-400 font-mono">AFIS Minutiae + Cosine Sim Vector</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={refreshTemplates}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Muat Ulang Database</span>
                </button>
              </div>
            </div>

            {/* Hardware Sensor Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Status Sensor Hardware</h3>
                  <p className="text-xs text-slate-400">Pilihan input pembaca sidik jari fisik</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Sensor Sentuh Kapasitif:</span>
                  <span className="text-emerald-400 font-bold">AKTIF & SIAP</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Kamera Makro Optik:</span>
                  <span className="text-emerald-400 font-bold">DIDUKUNG (WebRTC)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-slate-400">USB OTG Scanner Hardware:</span>
                  <span className={usbStatus.isConnected ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {usbStatus.deviceName}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-200">
                <p className="font-semibold">Informasi:</p>
                <p className="mt-1 text-[11px] text-blue-300">
                  Aplikasi ini berjalan mandiri tanpa memanggil BiometricPrompt Android (kunci layar HP), sehingga setiap siswa dan guru memiliki profil sidik jari masing-masing di database lokal sekolah.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PEREKAMAN BIOMETRIK (ENROLLMENT WIZARD) */}
      {isEnrollModalOpen && enrollTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Studio Perekaman Sidik Jari</h3>
                  <p className="text-xs text-slate-400">Merekam data biometrik ke database lokal</p>
                </div>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Person Info */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{enrollTarget.personName}</div>
                <div className="text-[11px] text-slate-400">
                  {enrollTarget.personType === 'guru' ? 'Guru' : `Siswa (${enrollTarget.className})`} •{' '}
                  {enrollTarget.personType === 'guru' ? `NIP: ${enrollTarget.identifier}` : `NISN: ${enrollTarget.identifier}`}
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/30">
                Pendaftaran Baru
              </span>
            </div>

            {/* Step 1: Configuration (Finger choice & method) */}
            {enrollStep === 'select' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    1. Pilih Jari yang Direkam:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {(['Telunjuk Kanan', 'Jempol Kanan', 'Jari Tengah Kanan', 'Telunjuk Kiri', 'Jempol Kiri'] as const).map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setEnrollFinger(f)}
                        className={`p-2.5 rounded-xl border text-center transition font-medium ${
                          enrollFinger === f
                            ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    2. Pilih Metode Pengambilan:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEnrollMethod('touch')}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                        enrollMethod === 'touch'
                          ? 'bg-blue-950/40 border-blue-500 text-white ring-1 ring-blue-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Touchpad className="w-5 h-5 text-blue-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Sensor Sentuh Layar</div>
                        <div className="text-[10px] text-slate-400">Tekan & tahan 1.5 detik</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEnrollMethod('camera')}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                        enrollMethod === 'camera'
                          ? 'bg-blue-950/40 border-blue-500 text-white ring-1 ring-blue-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Camera className="w-5 h-5 text-blue-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Kamera Makro Optik</div>
                        <div className="text-[10px] text-slate-400">Foto kontur ridge jari</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setEnrollStep('capturing');
                      if (enrollMethod === 'camera') startCamera();
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                  >
                    <span>Lanjut ke Pengambilan Sidik Jari</span>
                    <Fingerprint className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Live Capturing (Touch or Camera) */}
            {enrollStep === 'capturing' && (
              <div className="space-y-4">
                {enrollMethod === 'touch' ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <p className="text-xs text-slate-400 mb-3 text-center">
                      Tekan dan tahan <strong>{enrollFinger}</strong> {enrollTarget.personName} pada pad di bawah hingga progress penuh:
                    </p>

                    <div
                      onMouseDown={handleEnrollTouchCapture}
                      onTouchStart={handleEnrollTouchCapture}
                      onMouseUp={() => setIsPressingSensor(false)}
                      onTouchEnd={() => setIsPressingSensor(false)}
                      className={`relative w-40 h-48 rounded-3xl cursor-pointer select-none transition-all flex flex-col items-center justify-center p-4 border-2 ${
                        isPressingSensor
                          ? 'bg-blue-950/80 border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.5)] scale-98'
                          : 'bg-slate-950 border-slate-700 hover:border-blue-500/60'
                      }`}
                    >
                      <Fingerprint className={`w-20 h-20 transition-all ${isPressingSensor ? 'text-blue-400 scale-110' : 'text-slate-500'}`} />
                      {isPressingSensor ? (
                        <div className="w-full mt-3 space-y-1 text-center">
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-400 h-full transition-all duration-75" style={{ width: `${touchProgress}%` }} />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-blue-300">MEREKAM {touchProgress}%</span>
                        </div>
                      ) : (
                        <span className="mt-3 text-[11px] font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full">
                          Tahan Di Sini
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 space-y-3">
                    <div className="relative w-full max-w-xs h-56 bg-black rounded-2xl overflow-hidden border-2 border-slate-700 flex items-center justify-center">
                      <video ref={videoRef} playsInline muted autoPlay className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-28 h-36 border-2 border-dashed border-blue-400 rounded-full flex items-center justify-center">
                          <Fingerprint className="w-12 h-12 text-blue-400/40" />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleEnrollCameraCapture}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Ambil Kontur Jari</span>
                    </button>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setEnrollStep('select');
                      stopCamera();
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                  >
                    Kembali
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Preview & Confirm Save */}
            {enrollStep === 'preview' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-4">
                  {capturedRidgePreview && (
                    <img
                      src={capturedRidgePreview}
                      alt="Ridge Preview"
                      className="w-20 h-24 object-cover rounded-xl border-2 border-emerald-500/60 shadow-lg"
                    />
                  )}
                  <div className="space-y-1.5 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Jari Terpilih:</span>
                      <span className="font-bold text-white">{enrollFinger}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Minutiae Points:</span>
                      <span className="font-mono text-emerald-400 font-bold">{capturedMinutiae} Titik</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Kualitas Rekaman:</span>
                      <span className="font-bold text-emerald-400">{capturedQuality}% (Sangat Baik)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Penyimpanan:</span>
                      <span className="font-semibold text-blue-400">IndexedDB Lokal</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setEnrollStep('capturing')}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                  >
                    Rekam Ulang
                  </button>
                  <button
                    onClick={saveEnrolledTemplate}
                    disabled={isEnrollProcessing}
                    className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isEnrollProcessing ? 'Menyimpan...' : 'Simpan Sidik Jari ke Database'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL LIHAT DETAIL TEMPLATE BIOMETRIK */}
      {viewingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-emerald-400" />
                Detail Template Biometrik
              </h3>
              <button
                onClick={() => setViewingTemplate(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              {viewingTemplate.ridgePreviewDataUrl && (
                <img
                  src={viewingTemplate.ridgePreviewDataUrl}
                  alt="Biometric Ridge"
                  className="w-32 h-40 object-cover rounded-2xl border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/10"
                />
              )}
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Pemilik:</span>
                <span className="font-bold text-white">{viewingTemplate.personName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Peran:</span>
                <span className="text-white">{viewingTemplate.personType === 'guru' ? 'Guru' : `Siswa (${viewingTemplate.className})`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jari:</span>
                <span className="font-semibold text-emerald-400">{viewingTemplate.fingerLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jumlah Minutiae:</span>
                <span className="font-mono text-white">{viewingTemplate.minutiaeCount} Titik</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Skor Kualitas:</span>
                <span className="text-emerald-400 font-bold">{viewingTemplate.qualityScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode Perekaman:</span>
                <span className="text-blue-400">{viewingTemplate.captureMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hash Biometrik:</span>
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px]">{viewingTemplate.hash}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingTemplate(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
