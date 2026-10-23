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
  TODAY_STR
} from '../data/initialData';

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

  // Students CRUD
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication
  const [operator, setOperator] = useState<OperatorUser | null>(() => {
    const saved = localStorage.getItem('satutangan_operator');
    return saved ? JSON.parse(saved) : INITIAL_OPERATOR;
  });

  const [activeTab, setActiveTab] = useState<ActiveModule>('dashboard');

  // Teachers
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('satutangan_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  // Students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('satutangan_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  // Teacher Attendance
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendance[]>(() => {
    const saved = localStorage.getItem('satutangan_teacher_attendance');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_ATTENDANCE;
  });

  // Student Attendance
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>(() => {
    const saved = localStorage.getItem('satutangan_student_attendance');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_ATTENDANCE;
  });

  // Report Cards (keyed by studentId)
  const [reportCards, setReportCards] = useState<Record<string, ReportCard>>(() => {
    const saved = localStorage.getItem('satutangan_report_cards');
    return saved ? JSON.parse(saved) : { 'std-01': INITIAL_REPORT_CARD };
  });

  // School Profile state (Used in all reports & headers)
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem('satutangan_school_profile');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL_PROFILE;
  });

  // Operator Password state
  const [operatorPassword, setOperatorPassword] = useState<string>(() => {
    const saved = localStorage.getItem('satutangan_operator_password');
    return saved || 'operator2026';
  });

  // Settings Modal State (Triggered by Logo Satu Tangan -> Profil)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<'profil-sekolah' | 'password-login' | 'backup-restore' | 'reset-database'>('profil-sekolah');

  // Dynamic Entities & Records
  const [dynamicEntities, setDynamicEntities] = useState<DynamicEntity[]>(() => {
    const saved = localStorage.getItem('satutangan_dynamic_entities');
    return saved ? JSON.parse(saved) : INITIAL_DYNAMIC_ENTITIES;
  });

  const [dynamicRecords, setDynamicRecords] = useState<DynamicRecord[]>(() => {
    const saved = localStorage.getItem('satutangan_dynamic_records');
    return saved ? JSON.parse(saved) : INITIAL_DYNAMIC_RECORDS;
  });

  // Persistence side-effects
  useEffect(() => {
    localStorage.setItem('satutangan_school_profile', JSON.stringify(schoolProfile));
  }, [schoolProfile]);
  useEffect(() => {
    if (operator) {
      localStorage.setItem('satutangan_operator', JSON.stringify(operator));
    } else {
      localStorage.removeItem('satutangan_operator');
    }
  }, [operator]);

  useEffect(() => {
    localStorage.setItem('satutangan_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('satutangan_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('satutangan_teacher_attendance', JSON.stringify(teacherAttendance));
  }, [teacherAttendance]);

  useEffect(() => {
    localStorage.setItem('satutangan_student_attendance', JSON.stringify(studentAttendance));
  }, [studentAttendance]);

  useEffect(() => {
    localStorage.setItem('satutangan_report_cards', JSON.stringify(reportCards));
  }, [reportCards]);

  useEffect(() => {
    localStorage.setItem('satutangan_dynamic_entities', JSON.stringify(dynamicEntities));
  }, [dynamicEntities]);

  useEffect(() => {
    localStorage.setItem('satutangan_dynamic_records', JSON.stringify(dynamicRecords));
  }, [dynamicRecords]);

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
  };

  const updateTeacher = (id: string, updated: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  // Students Handlers with relational cascading sync to Dynamic Records!
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      id: 'std-' + Date.now().toString(36),
      ...studentData
    };
    setStudents(prev => [newStudent, ...prev]);
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
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    // Remove orphaned records or keep history
    setDynamicRecords(prev => prev.filter(r => r.studentId !== id));
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

  // Report Cards
  const saveReportCard = (report: ReportCard) => {
    setReportCards(prev => ({
      ...prev,
      [report.studentId]: report
    }));
  };

  // Dynamic Entities & Synchronized Records
  const createDynamicEntity = (entityData: Omit<DynamicEntity, 'id' | 'createdAt'>) => {
    const newEntity: DynamicEntity = {
      id: 'ent-' + Date.now().toString(36),
      ...entityData,
      createdAt: TODAY_STR
    };
    setDynamicEntities(prev => [...prev, newEntity]);
  };

  const deleteDynamicEntity = (entityId: string) => {
    setDynamicEntities(prev => prev.filter(e => e.id !== entityId));
    setDynamicRecords(prev => prev.filter(r => r.entityId !== entityId));
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
  };

  const deleteDynamicRecord = (recordId: string) => {
    setDynamicRecords(prev => prev.filter(r => r.id !== recordId));
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
  };

  // 1. Update School Profile (Synchronizes to operator header and all reports)
  const updateSchoolProfile = (updated: Partial<SchoolProfile>) => {
    setSchoolProfile(prev => {
      const next = { ...prev, ...updated };
      setOperator(curr => curr ? { ...curr, schoolName: next.schoolName, npsn: next.npsn } : curr);
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
    localStorage.setItem('satutangan_operator_password', newPass);
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
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        teacherAttendance,
        markTeacherAttendance,
        bulkMarkTeachers,
        studentAttendance,
        markStudentAttendance,
        bulkMarkStudents,
        recordFingerprintAttendance,
        reportCards,
        saveReportCard,
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
        setSettingsActiveTab
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
