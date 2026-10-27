import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  OperatorUser,
  Teacher,
  Student,
  TeacherAttendance,
  StudentAttendance,
  AttendanceStatus,
  DynamicEntity,
  DynamicRecord,
  ReportCard,
  SchoolProfile
} from '../types';
import {
  INITIAL_OPERATOR,
  INITIAL_SCHOOL_PROFILE,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_TEACHER_ATTENDANCE,
  INITIAL_STUDENT_ATTENDANCE,
  INITIAL_DYNAMIC_ENTITIES,
  INITIAL_DYNAMIC_RECORDS,
  INITIAL_REPORT_CARD,
  INITIAL_REPORT_CARDS,
  TODAY_STR
} from '../data/initialData';
import { syncService } from '../services/syncService';
import { offlineDb, OfflineDbStats } from '../services/offlineDb';

export type ActiveModule =
  | 'dashboard'
  | 'absen-sidik-jari'
  | 'absensi-guru'
  | 'absensi-siswa'
  | 'db-guru'
  | 'db-siswa'
  | 'cetak-raport'
  | 'modul-dinamis';

interface AppContextType {
  // Auth
  operator: OperatorUser | null;
  loginWithEmail: (email: string, pass: string) => boolean;
  loginWithGitHub: (username?: string) => void;
  logout: () => void;

  // Navigation
  activeTab: ActiveModule;
  setActiveTab: (tab: ActiveModule) => void;

  // Teachers CRUD
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  bulkAddTeachers: (newTeachers: Omit<Teacher, 'id'>[], mode?: 'append' | 'replace') => number;

  // Students CRUD
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  bulkAddStudents: (newStudents: Omit<Student, 'id'>[], mode?: 'append' | 'replace') => number;

  // Teacher Attendance
  teacherAttendance: TeacherAttendance[];
  markTeacherAttendance: (teacherId: string, date: string, status: AttendanceStatus, notes?: string) => void;
  bulkMarkTeachers(date: string, status: AttendanceStatus): void;

  // Student Attendance
  studentAttendance: StudentAttendance[];
  markStudentAttendance: (studentId: string, date: string, status: AttendanceStatus, notes?: string) => void;
  bulkMarkStudents(className: string, date: string, status: AttendanceStatus): void;

  // Biometric Fingerprint Attendance Handler (Teacher & Student)
  recordFingerprintAttendance: (params: {
    targetType: 'guru' | 'siswa';
    targetId: string;
    date?: string;
    time?: string;
    deviceId?: string;
  }) => {
    success: boolean;
    message: string;
    personName: string;
    identifier: string;
    checkInTime: string;
    className?: string;
  };

  // Report Cards
  reportCards: Record<string, ReportCard>;
  saveReportCard: (report: ReportCard) => void;
  deleteReportCard: (reportId: string) => void;
  bulkSaveReportCards: (reports: Record<string, ReportCard>) => number;

  // Dynamic Entities & Records
  dynamicEntities: DynamicEntity[];
  dynamicRecords: DynamicRecord[];
  createDynamicEntity: (entity: Omit<DynamicEntity, 'id' | 'createdAt'>) => void;
  deleteDynamicEntity: (entityId: string) => void;
  addDynamicRecord: (record: {
    entityId: string;
    studentId: string;
    date: string;
    primaryValue: string | number;
    secondaryValue?: string;
    status: DynamicRecord['status'];
    operatorNote?: string;
  }) => void;
  deleteDynamicRecord: (recordId: string) => void;

  // Reset to initial demo data
  resetDemoData: () => void;

  // School Profile & Settings (Used globally in reports & headers)
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;

  // Password Management
  operatorPassword: string;
  updateOperatorPassword: (oldPass: string, newPass: string) => { success: boolean; message: string };

  // Settings Modal State
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  settingsActiveTab: 'profil-sekolah' | 'password-login' | 'backup-restore' | 'reset-database';
  setSettingsActiveTab: (tab: 'profil-sekolah' | 'password-login' | 'backup-restore' | 'reset-database') => void;
  resetAllDatabase: (mode?: 'demo' | 'empty') => void;
  exportBackupData: () => string;
  restoreBackupData: (backupJsonString: string) => { success: boolean; message: string; stats?: { students: number; teachers: number; attendance: number; records: number } };
  getOfflineDbStats: () => Promise<OfflineDbStats>;
}

// Safe storage helper resilient to Android private browsing & storage quota errors
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`Gagal menyimpan ${key} ke localStorage:`, e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`Gagal menghapus ${key} dari localStorage:`, e);
    }
  }
};

// Helper functions for fail-safe localStorage parsing
const safeLoadOperator = (): OperatorUser | null => {
  try {
    const saved = safeStorage.getItem('satutangan_operator');
    if (!saved || saved === 'undefined' || saved === 'null') return INITIAL_OPERATOR;
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return INITIAL_OPERATOR;
    return { ...INITIAL_OPERATOR, ...parsed };
  } catch (err) {
    console.warn('Gagal memuat operator dari localStorage, menggunakan data awal:', err);
    return INITIAL_OPERATOR;
  }
};

const safeLoadTeachers = (): Teacher[] => {
  try {
    const saved = safeStorage.getItem('satutangan_teachers');
    if (!saved || saved === 'undefined' || saved === 'null') return INITIAL_TEACHERS;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TEACHERS;
  } catch (err) {
    console.warn('Gagal memuat guru dari localStorage:', err);
    return INITIAL_TEACHERS;
  }
};

const safeLoadStudents = (): Student[] => {
  try {
    const saved = safeStorage.getItem('satutangan_students');
    if (!saved || saved === 'undefined' || saved === 'null') return INITIAL_STUDENTS;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_STUDENTS;
    // Merge any missing initial students (e.g. alumni std-10, std-11, std-12) so all years exist
    const existingIds = new Set(parsed.map((s: Student) => s.id));
    const missing = INITIAL_STUDENTS.filter(s => !existingIds.has(s.id));
    return missing.length > 0 ? [...parsed, ...missing] : parsed;
  } catch (err) {
    console.warn('Gagal memuat siswa dari localStorage:', err);
    return INITIAL_STUDENTS;
  }
};

const safeLoadTeacherAttendance = (): TeacherAttendance[] => {
  try {
    const saved = safeStorage.getItem('satutangan_teacher_attendance');
    if (!saved || saved === 'undefined' || saved === 'null') return INITIAL_TEACHER_ATTENDANCE;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : INITIAL_TEACHER_ATTENDANCE;
  } catch (err) {
    console.warn('Gagal memuat presensi guru dari localStorage:', err);
    return INITIAL_TEACHER_ATTENDANCE;
  }
};

const safeLoadStudentAttendance = (): StudentAttendance[] => {
  try {
    const saved = safeStorage.getItem('satutangan_student_attendance');
    if (!saved || saved === 'undefined' || saved === 'null') return INITIAL_STUDENT_ATTENDANCE;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : INITIAL_STUDENT_ATTENDANCE;
  } catch (err) {
    console.warn('Gagal memuat presensi siswa dari localStorage:', err);
    return INITIAL_STUDENT_ATTENDANCE;
  }
};

const safeLoadReportCards = (): Record<string, ReportCard> => {
  try {
    const saved = safeStorage.getItem('satutangan_report_cards');
    if (!saved || saved === 'undefined' || saved === 'null') {
      return INITIAL_REPORT_CARDS;
    }
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') {
      return INITIAL_REPORT_CARDS;
    }
    const normalized: Record<string, ReportCard> = { ...INITIAL_REPORT_CARDS };
    for (const key of Object.keys(parsed)) {
      const card = parsed[key];
      if (card && typeof card === 'object') {
        normalized[key] = {
          ...INITIAL_REPORT_CARD,
          ...card,
          scores: Array.isArray(card.scores) ? card.scores : INITIAL_REPORT_CARD.scores,
          extracurriculars: Array.isArray(card.extracurriculars) ? card.extracurriculars : INITIAL_REPORT_CARD.extracurriculars,
          attendanceSummary: card.attendanceSummary || INITIAL_REPORT_CARD.attendanceSummary
        };
      }
    }
    return Object.keys(normalized).length > 0 ? normalized : INITIAL_REPORT_CARDS;
  } catch (err) {
    console.warn('Gagal memuat raport dari localStorage:', err);
    return INITIAL_REPORT_CARDS;
  }
};

const safeLoadSchoolProfile = (): SchoolProfile => {
  try {
    const saved = safeStorage.getItem('satutangan_school_profile');
    if (!saved || saved === 'undefined' || saved === 'null') return INITIAL_SCHOOL_PROFILE;
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return INITIAL_SCHOOL_PROFILE;
    return {
      ...INITIAL_SCHOOL_PROFILE,
      ...parsed,
      accreditation: parsed.accreditation || INITIAL_SCHOOL_PROFILE.accreditation,
      letterheadProvince: parsed.letterheadProvince || INITIAL_SCHOOL_PROFILE.letterheadProvince,
      letterheadAgency: parsed.letterheadAgency || INITIAL_SCHOOL_PROFILE.letterheadAgency,
      logoUrl: parsed.logoUrl !== undefined ? parsed.logoUrl : INITIAL_SCHOOL_PROFILE.logoUrl,
      schoolName: parsed.schoolName || INITIAL_SCHOOL_PROFILE.schoolName,
      npsn: parsed.npsn || INITIAL_SCHOOL_PROFILE.npsn,
      address: parsed.address || INITIAL_SCHOOL_PROFILE.address,
      city: parsed.city || INITIAL_SCHOOL_PROFILE.city,
      province: parsed.province || INITIAL_SCHOOL_PROFILE.province,
      headmasterName: parsed.headmasterName || INITIAL_SCHOOL_PROFILE.headmasterName,
      headmasterNip: parsed.headmasterNip || INITIAL_SCHOOL_PROFILE.headmasterNip
    };
  } catch (err) {
    console.warn('Gagal memuat profil sekolah dari localStorage:', err);
    return INITIAL_SCHOOL_PROFILE;
  }
};

const safeLoadDynamicEntities = (): DynamicEntity[] => {
  try {
    const saved = safeStorage.getItem('satutangan_dynamic_entities');
    if (!saved || saved === 'undefined' || saved === 'null') return INITIAL_DYNAMIC_ENTITIES;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : INITIAL_DYNAMIC_ENTITIES;
  } catch (err) {
    return INITIAL_DYNAMIC_ENTITIES;
  }
};

const safeLoadDynamicRecords = (): DynamicRecord[] => {
  try {
    const saved = safeStorage.getItem('satutangan_dynamic_records');
    if (!saved || saved === 'undefined' || saved === 'null') return INITIAL_DYNAMIC_RECORDS;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : INITIAL_DYNAMIC_RECORDS;
  } catch (err) {
    return INITIAL_DYNAMIC_RECORDS;
  }
};

const safeLoadPassword = (): string => {
  try {
    const saved = safeStorage.getItem('satutangan_operator_password');
    return saved && typeof saved === 'string' && saved.length >= 4 ? saved : 'operator2026';
  } catch {
    return 'operator2026';
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication
  const [operator, setOperator] = useState<OperatorUser | null>(safeLoadOperator);

  const [activeTab, setActiveTab] = useState<ActiveModule>('dashboard');

  // Teachers
  const [teachers, setTeachers] = useState<Teacher[]>(safeLoadTeachers);

  // Students
  const [students, setStudents] = useState<Student[]>(safeLoadStudents);

  // Teacher Attendance
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendance[]>(safeLoadTeacherAttendance);

  // Student Attendance
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>(safeLoadStudentAttendance);

  // Report Cards (keyed by studentId)
  const [reportCards, setReportCards] = useState<Record<string, ReportCard>>(safeLoadReportCards);

  // School Profile state (Used in all reports & headers)
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(safeLoadSchoolProfile);

  // Operator Password state
  const [operatorPassword, setOperatorPassword] = useState<string>(safeLoadPassword);

  // Settings Modal State (Triggered by Logo Satu Tangan -> Profil)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<'profil-sekolah' | 'password-login' | 'backup-restore' | 'reset-database'>('profil-sekolah');

  // Dynamic Entities & Records
  const [dynamicEntities, setDynamicEntities] = useState<DynamicEntity[]>(safeLoadDynamicEntities);

  const [dynamicRecords, setDynamicRecords] = useState<DynamicRecord[]>(safeLoadDynamicRecords);

  // Offline-First Database Persistence side-effects (Dual-Store: localStorage for 0ms reads + IndexedDB for durability)
  useEffect(() => {
    safeStorage.setItem('satutangan_school_profile', JSON.stringify(schoolProfile));
    offlineDb.saveItem('schoolProfile', schoolProfile);
  }, [schoolProfile]);

  useEffect(() => {
    if (operator) {
      safeStorage.setItem('satutangan_operator', JSON.stringify(operator));
    } else {
      safeStorage.removeItem('satutangan_operator');
    }
  }, [operator]);

  useEffect(() => {
    safeStorage.setItem('satutangan_teachers', JSON.stringify(teachers));
    offlineDb.saveCollection('teachers', teachers);
  }, [teachers]);

  useEffect(() => {
    safeStorage.setItem('satutangan_students', JSON.stringify(students));
    offlineDb.saveCollection('students', students);
  }, [students]);

  useEffect(() => {
    safeStorage.setItem('satutangan_teacher_attendance', JSON.stringify(teacherAttendance));
    offlineDb.saveCollection('teacherAttendance', teacherAttendance);
  }, [teacherAttendance]);

  useEffect(() => {
    safeStorage.setItem('satutangan_student_attendance', JSON.stringify(studentAttendance));
    offlineDb.saveCollection('studentAttendance', studentAttendance);
  }, [studentAttendance]);

  useEffect(() => {
    safeStorage.setItem('satutangan_report_cards', JSON.stringify(reportCards));
    const cardArray = Object.keys(reportCards).map(k => ({ ...reportCards[k], id: k }));
    offlineDb.saveCollection('reportCards', cardArray);
  }, [reportCards]);

  useEffect(() => {
    safeStorage.setItem('satutangan_dynamic_entities', JSON.stringify(dynamicEntities));
    offlineDb.saveCollection('dynamicEntities', dynamicEntities);
  }, [dynamicEntities]);

  useEffect(() => {
    safeStorage.setItem('satutangan_dynamic_records', JSON.stringify(dynamicRecords));
    offlineDb.saveCollection('dynamicRecords', dynamicRecords);
  }, [dynamicRecords]);

  // Initial mount: ensure IndexedDB offline stores are seeded
  useEffect(() => {
    offlineDb.init().then(async (db) => {
      if (!db) return;
      try {
        const storedStudents = await offlineDb.getAll<Student>('students');
        if (storedStudents.length === 0 && students.length > 0) {
          await offlineDb.saveCollection('students', students);
          await offlineDb.saveCollection('teachers', teachers);
          await offlineDb.saveCollection('teacherAttendance', teacherAttendance);
          await offlineDb.saveCollection('studentAttendance', studentAttendance);
          await offlineDb.saveItem('schoolProfile', schoolProfile);
        }
      } catch (err) {
        console.warn('[OfflineDB] Seeding info:', err);
      }
    });
  }, []);

  // Auth Handlers
  const loginWithEmail = (email: string, pass: string): boolean => {
    if (email && pass) {
      const user: OperatorUser = {
        id: 'op-' + Date.now().toString(36),
        name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        email,
        role: 'OPERATOR_SEKOLAH',
        schoolName: schoolProfile.schoolName || 'SMP Negeri 1 Cendekia Mandiri',
        npsn: schoolProfile.npsn || '20109823',
        authProvider: 'local'
      };
      setOperator(user);
      return true;
    }
    return false;
  };

  const loginWithGitHub = (username = 'operator-cendekia') => {
    const user: OperatorUser = {
      id: 'gh-' + Date.now().toString(36),
      name: 'Operator GitHub (' + username + ')',
      email: `${username.toLowerCase()}@users.noreply.github.com`,
      avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 8000000 + 1000000)}?v=4`,
      role: 'OPERATOR_UTAMA',
      schoolName: 'SMP Negeri 1 Cendekia Mandiri',
      npsn: '20109823',
      authProvider: 'github',
      githubUsername: username
    };
    setOperator(user);
  };

  const logout = () => {
    setOperator(null);
    setActiveTab('dashboard');
  };

  // Teachers Handlers
  const addTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      id: 'tch-' + Date.now().toString(36),
      ...teacherData
    };
    setTeachers(prev => [newTeacher, ...prev]);
    syncService.enqueue('teachers', 'create', newTeacher.id, newTeacher);
  };

  const updateTeacher = (id: string, updated: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
    syncService.enqueue('teachers', 'update', id, updated);
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    syncService.enqueue('teachers', 'delete', id, null);
  };

  const bulkAddTeachers = (newTeachers: Omit<Teacher, 'id'>[], mode: 'append' | 'replace' = 'append') => {
    let count = 0;
    setTeachers(prev => {
      const generated: Teacher[] = newTeachers.map((t, idx) => ({
        id: 'tch-' + Date.now().toString(36) + '-' + idx,
        ...t
      }));
      count = generated.length;
      if (mode === 'replace') {
        return generated;
      }
      return [...generated, ...prev];
    });
    syncService.enqueue('teachers', 'update', 'bulk-teachers', { count, mode });
    return count;
  };

  // Students Handlers with relational cascading sync to Dynamic Records!
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      id: 'std-' + Date.now().toString(36),
      ...studentData
    };
    setStudents(prev => [newStudent, ...prev]);
    syncService.enqueue('students', 'create', newStudent.id, newStudent);
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents(prev => {
      const next = prev.map(s => (s.id === id ? { ...s, ...updated } : s));
      const target = next.find(s => s.id === id);
      if (target) {
        // Cascading sync: Update student snapshot values in dynamic records automatically!
        setDynamicRecords(records =>
          records.map(r =>
            r.studentId === id
              ? {
                  ...r,
                  studentName: target.name,
                  studentNisn: target.nisn,
                  studentClass: target.className
                }
              : r
          )
        );
      }
      return next;
    });
    syncService.enqueue('students', 'update', id, updated);
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    // Remove orphaned records or keep history
    setDynamicRecords(prev => prev.filter(r => r.studentId !== id));
    syncService.enqueue('students', 'delete', id, null);
  };

  const bulkAddStudents = (newStudents: Omit<Student, 'id'>[], mode: 'append' | 'replace' = 'append') => {
    let count = 0;
    setStudents(prev => {
      const generated: Student[] = newStudents.map((s, idx) => ({
        id: 'std-' + Date.now().toString(36) + '-' + idx,
        ...s
      }));
      count = generated.length;
      if (mode === 'replace') {
        return generated;
      }
      return [...generated, ...prev];
    });
    syncService.enqueue('students', 'update', 'bulk-students', { count, mode });
    return count;
  };

  // Attendance Handlers
  const markTeacherAttendance = (teacherId: string, date: string, status: AttendanceStatus, notes?: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    setTeacherAttendance(prev => {
      const existingIndex = prev.findIndex(a => a.teacherId === teacherId && a.date === date);
      const entry: TeacherAttendance = {
        id: existingIndex >= 0 ? prev[existingIndex].id : 'ta-' + Date.now().toString(36),
        teacherId,
        teacherName: teacher.name,
        nip: teacher.nip,
        date,
        status,
        checkInTime: status === 'HADIR' ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : undefined,
        notes: notes !== undefined ? notes : (existingIndex >= 0 ? prev[existingIndex].notes : '')
      };

      syncService.enqueue('teacherAttendance', 'update', entry.id, entry);

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = entry;
        return next;
      }
      return [entry, ...prev];
    });
  };

  const bulkMarkTeachers = (date: string, status: AttendanceStatus) => {
    teachers.forEach(teacher => {
      markTeacherAttendance(teacher.id, date, status);
    });
  };

  const markStudentAttendance = (studentId: string, date: string, status: AttendanceStatus, notes?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setStudentAttendance(prev => {
      const existingIndex = prev.findIndex(a => a.studentId === studentId && a.date === date);
      const entry: StudentAttendance = {
        id: existingIndex >= 0 ? prev[existingIndex].id : 'sa-' + Date.now().toString(36),
        studentId,
        studentName: student.name,
        nisn: student.nisn,
        className: student.className,
        date,
        status,
        notes: notes !== undefined ? notes : (existingIndex >= 0 ? prev[existingIndex].notes : '')
      };

      syncService.enqueue('studentAttendance', 'update', entry.id, entry);

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = entry;
        return next;
      }
      return [entry, ...prev];
    });
  };

  const bulkMarkStudents = (className: string, date: string, status: AttendanceStatus) => {
    const targetStudents = className === 'ALL' ? students : students.filter(s => s.className === className);
    targetStudents.forEach(s => {
      markStudentAttendance(s.id, date, status);
    });
  };

  // Biometric Fingerprint Recognition Processor
  const recordFingerprintAttendance = (params: {
    targetType: 'guru' | 'siswa';
    targetId: string;
    date?: string;
    time?: string;
    deviceId?: string;
  }) => {
    const targetDate = params.date || TODAY_STR;
    const nowTime = params.time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const deviceId = params.deviceId || 'BIO-SCANNER-01';

    if (params.targetType === 'guru') {
      const teacher = teachers.find(t => t.id === params.targetId);
      if (!teacher) {
        return { success: false, message: 'Data guru tidak ditemukan di database', personName: '', identifier: '', checkInTime: nowTime };
      }

      setTeacherAttendance(prev => {
        const existingIndex = prev.findIndex(a => a.teacherId === teacher.id && a.date === targetDate);
        const entry: TeacherAttendance = {
          id: existingIndex >= 0 ? prev[existingIndex].id : 'ta-' + Date.now().toString(36),
          teacherId: teacher.id,
          teacherName: teacher.name,
          nip: teacher.nip,
          date: targetDate,
          status: 'HADIR',
          checkInTime: nowTime,
          verificationMethod: 'FINGERPRINT',
          deviceId,
          notes: 'Terverifikasi Biometrik Sidik Jari (Mesin ' + deviceId + ')'
        };

        syncService.enqueue('teacherAttendance', 'update', entry.id, entry);

        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = entry;
          return next;
        }
        return [entry, ...prev];
      });

      return {
        success: true,
        message: 'Presensi Sidik Jari Guru Berhasil',
        personName: teacher.name,
        identifier: 'NIP: ' + teacher.nip,
        checkInTime: nowTime
      };
    } else {
      const student = students.find(s => s.id === params.targetId);
      if (!student) {
        return { success: false, message: 'Data siswa tidak ditemukan di database', personName: '', identifier: '', checkInTime: nowTime };
      }

      setStudentAttendance(prev => {
        const existingIndex = prev.findIndex(a => a.studentId === student.id && a.date === targetDate);
        const entry: StudentAttendance = {
          id: existingIndex >= 0 ? prev[existingIndex].id : 'sa-' + Date.now().toString(36),
          studentId: student.id,
          studentName: student.name,
          nisn: student.nisn,
          className: student.className,
          date: targetDate,
          status: 'HADIR',
          checkInTime: nowTime,
          verificationMethod: 'FINGERPRINT',
          deviceId,
          notes: 'Terverifikasi Biometrik Sidik Jari (Mesin ' + deviceId + ')'
        };

        syncService.enqueue('studentAttendance', 'update', entry.id, entry);

        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = entry;
          return next;
        }
        return [entry, ...prev];
      });

      return {
        success: true,
        message: 'Presensi Sidik Jari Siswa Berhasil',
        personName: student.name,
        identifier: 'NISN: ' + student.nisn,
        className: 'Kelas ' + student.className,
        checkInTime: nowTime
      };
    }
  };

  // Report Cards (Database Raport Lintas Tahun Pelajaran)
  const saveReportCard = (report: ReportCard) => {
    const key = report.id || `rep-${report.studentId}-${report.academicYear.replace(/[^a-zA-Z0-9]/g, '')}-${report.semester.toLowerCase()}`;
    const preparedReport: ReportCard = {
      ...report,
      id: key
    };
    setReportCards(prev => ({
      ...prev,
      [key]: preparedReport,
      [report.studentId]: preparedReport
    }));
    syncService.enqueue('reportCards', 'update', key, preparedReport);
  };

  const deleteReportCard = (reportId: string) => {
    setReportCards(prev => {
      const next = { ...prev };
      delete next[reportId];
      return next;
    });
    syncService.enqueue('reportCards', 'delete', reportId, null);
  };

  const bulkSaveReportCards = (reports: Record<string, ReportCard>) => {
    const count = Object.keys(reports).length;
    setReportCards(prev => ({
      ...prev,
      ...reports
    }));
    syncService.enqueue('reportCards', 'update', 'bulk-reports', { count });
    return count;
  };

  // Dynamic Entities & Synchronized Records
  const createDynamicEntity = (entityData: Omit<DynamicEntity, 'id' | 'createdAt'>) => {
    const newEntity: DynamicEntity = {
      id: 'ent-' + Date.now().toString(36),
      ...entityData,
      createdAt: TODAY_STR
    };
    setDynamicEntities(prev => [...prev, newEntity]);
    syncService.enqueue('dynamicEntities', 'create', newEntity.id, newEntity);
  };

  const deleteDynamicEntity = (entityId: string) => {
    setDynamicEntities(prev => prev.filter(e => e.id !== entityId));
    setDynamicRecords(prev => prev.filter(r => r.entityId !== entityId));
    syncService.enqueue('dynamicEntities', 'delete', entityId, null);
  };

  // Adding record with AUTO-SYNCHRONIZATION to Student Database
  const addDynamicRecord = (record: {
    entityId: string;
    studentId: string;
    date: string;
    primaryValue: string | number;
    secondaryValue?: string;
    status: DynamicRecord['status'];
    operatorNote?: string;
  }) => {
    const student = students.find(s => s.id === record.studentId);
    if (!student) return;

    const newRecord: DynamicRecord = {
      id: 'dr-' + Date.now().toString(36),
      entityId: record.entityId,
      studentId: record.studentId,
      studentName: student.name,
      studentNisn: student.nisn,
      studentClass: student.className,
      date: record.date || TODAY_STR,
      primaryValue: record.primaryValue,
      secondaryValue: record.secondaryValue,
      status: record.status,
      operatorNote: record.operatorNote,
      createdAt: TODAY_STR
    };

    setDynamicRecords(prev => [newRecord, ...prev]);
    syncService.enqueue('dynamicRecords', 'create', newRecord.id, newRecord);
  };

  const deleteDynamicRecord = (recordId: string) => {
    setDynamicRecords(prev => prev.filter(r => r.id !== recordId));
    syncService.enqueue('dynamicRecords', 'delete', recordId, null);
  };

  const resetDemoData = () => {
    setTeachers(INITIAL_TEACHERS);
    setStudents(INITIAL_STUDENTS);
    setTeacherAttendance(INITIAL_TEACHER_ATTENDANCE);
    setStudentAttendance(INITIAL_STUDENT_ATTENDANCE);
    setDynamicEntities(INITIAL_DYNAMIC_ENTITIES);
    setDynamicRecords(INITIAL_DYNAMIC_RECORDS);
    setReportCards({ 'std-01': INITIAL_REPORT_CARD });
    setSchoolProfile(INITIAL_SCHOOL_PROFILE);
    setOperatorPassword('operator2026');
    offlineDb.clearAll();
  };

  // 1. Update School Profile (Synchronizes to operator header and all reports)
  const updateSchoolProfile = (updated: Partial<SchoolProfile>) => {
    setSchoolProfile(prev => {
      const next = { ...prev, ...updated };
      setOperator(curr => curr ? { ...curr, schoolName: next.schoolName, npsn: next.npsn } : curr);
      syncService.enqueue('schoolProfile', 'update', 'current', next);
      return next;
    });
  };

  // 2. Update Operator Password
  const updateOperatorPassword = (oldPass: string, newPass: string) => {
    if (oldPass !== operatorPassword) {
      return { success: false, message: 'Kata sandi lama yang Anda masukkan salah.' };
    }
    if (newPass.length < 5) {
      return { success: false, message: 'Kata sandi baru minimal 5 karakter.' };
    }
    setOperatorPassword(newPass);
    safeStorage.setItem('satutangan_operator_password', newPass);
    return { success: true, message: 'Kata sandi login operator berhasil diperbarui!' };
  };

  // 3. Reset All Database (Safety Reset)
  const resetAllDatabase = (mode: 'demo' | 'empty' = 'demo') => {
    if (mode === 'empty') {
      setTeachers([]);
      setStudents([]);
      setTeacherAttendance([]);
      setStudentAttendance([]);
      setDynamicEntities([]);
      setDynamicRecords([]);
      setReportCards({});
    } else {
      resetDemoData();
    }
  };

  // 4. Export Backup Data (Google Drive / JSON snapshot format)
  const exportBackupData = (): string => {
    const backupSnapshot = {
      app: 'Satu Tangan',
      title: 'Aplikasi Operator Pendidikan',
      version: '2.5',
      exportedAt: new Date().toISOString(),
      schoolProfile,
      teachers,
      students,
      teacherAttendance,
      studentAttendance,
      dynamicEntities,
      dynamicRecords,
      reportCards
    };
    return JSON.stringify(backupSnapshot, null, 2);
  };

  // 4. Restore Backup Data (Import from Google Drive / JSON file)
  const restoreBackupData = (backupJsonString: string) => {
    try {
      const parsed = JSON.parse(backupJsonString);
      const data = parsed.data || parsed;
      const targetSchool = data.schoolProfile || parsed.schoolProfile;
      const targetTeachers = data.teachers || parsed.teachers;
      const targetStudents = data.students || parsed.students;

      if (!targetStudents && !targetTeachers && !targetSchool) {
        return { success: false, message: 'Format berkas cadangan tidak valid atau rusak.' };
      }
      if (targetSchool) updateSchoolProfile(targetSchool);
      if (Array.isArray(targetTeachers)) setTeachers(targetTeachers);
      if (Array.isArray(targetStudents)) setStudents(targetStudents);
      if (Array.isArray(data.teacherAttendance || parsed.teacherAttendance)) {
        setTeacherAttendance(data.teacherAttendance || parsed.teacherAttendance);
      }
      if (Array.isArray(data.studentAttendance || parsed.studentAttendance)) {
        setStudentAttendance(data.studentAttendance || parsed.studentAttendance);
      }
      if (Array.isArray(data.dynamicEntities || parsed.dynamicEntities)) {
        setDynamicEntities(data.dynamicEntities || parsed.dynamicEntities);
      }
      if (Array.isArray(data.dynamicRecords || parsed.dynamicRecords)) {
        setDynamicRecords(data.dynamicRecords || parsed.dynamicRecords);
      }
      if (data.reportCards || parsed.reportCards) {
        setReportCards(data.reportCards || parsed.reportCards);
      }

      return {
        success: true,
        message: 'Database berhasil dipulihkan dari berkas cadangan!',
        stats: {
          students: targetStudents?.length || 0,
          teachers: targetTeachers?.length || 0,
          attendance: (parsed.studentAttendance?.length || 0) + (parsed.teacherAttendance?.length || 0),
          records: (data.dynamicRecords || parsed.dynamicRecords)?.length || 0
        }
      };
    } catch {
      return { success: false, message: 'Gagal memproses berkas JSON cadangan. Pastikan format berkas valid.' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        operator,
        loginWithEmail,
        loginWithGitHub,
        logout,
        activeTab,
        setActiveTab,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        bulkAddTeachers,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        bulkAddStudents,
        teacherAttendance,
        markTeacherAttendance,
        bulkMarkTeachers,
        studentAttendance,
        markStudentAttendance,
        bulkMarkStudents,
        recordFingerprintAttendance,
        reportCards,
        saveReportCard,
        deleteReportCard,
        bulkSaveReportCards,
        dynamicEntities,
        dynamicRecords,
        createDynamicEntity,
        deleteDynamicEntity,
        addDynamicRecord,
        deleteDynamicRecord,
        resetDemoData,
        schoolProfile,
        updateSchoolProfile,
        operatorPassword,
        updateOperatorPassword,
        resetAllDatabase,
        exportBackupData,
        restoreBackupData,
        isSettingsOpen,
        setIsSettingsOpen,
        settingsActiveTab,
        setSettingsActiveTab,
        getOfflineDbStats: () => offlineDb.getStats()
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
