export type Role = 'OPERATOR_UTAMA' | 'OPERATOR_SEKOLAH' | 'GURU_WALI';

export interface SchoolProfile {
  schoolName: string;
  npsn: string;
  nss: string;
  accreditation: string;
  educationLevel: string;
  status: 'Negeri' | 'Swasta';
  address: string;
  subdistrict: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  headmasterName: string;
  headmasterNip: string;
  letterheadProvince: string;
  letterheadAgency: string;
}

export interface OperatorUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  schoolName: string;
  npsn: string;
  authProvider: 'local' | 'github';
  githubUsername?: string;
}

export type AttendanceStatus = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  subject: string;
  email: string;
  phone: string;
  employmentStatus: 'PNS' | 'PPPK' | 'Honorer' | 'Yayasan';
  gender: 'Laki-laki' | 'Perempuan';
  assignedClass?: string;
}

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  teacherName: string;
  nip: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string;
  verificationMethod?: 'MANUAL' | 'FINGERPRINT';
  deviceId?: string;
  notes?: string;
}

export interface Student {
  id: string;
  nisn: string;
  nik?: string;
  name: string;
  className: string; // e.g. "7A", "7B", "8A", "9A"
  gender: 'Laki-laki' | 'Perempuan';
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD
  parentName: string;
  parentPhone: string;
  address: string;
  activeStatus: 'Aktif' | 'Lulus' | 'Pindah';
}

export interface StudentAttendance {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  className: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string;
  verificationMethod?: 'MANUAL' | 'FINGERPRINT';
  deviceId?: string;
  notes?: string;
}

export interface SubjectScore {
  subjectId: string;
  subjectName: string;
  kkm: number;
  nilaiTugas: number;
  nilaiUts: number;
  nilaiUas: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  deskripsi: string;
}

export interface ReportCard {
  id: string;
  studentId: string;
  academicYear: string; // e.g. "2025/2026"
  semester: 'Ganjil' | 'Genap';
  scores: SubjectScore[];
  sikapSpiritual: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  sikapSosial: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  extracurriculars: { name: string; score: string; notes: string }[];
  attendanceSummary: {
    sakit: number;
    izin: number;
    alpa: number;
  };
  teacherNotes: string;
  headmasterName: string;
  headmasterNip: string;
  homeroomTeacherName: string;
  homeroomTeacherNip: string;
  issueDate: string;
}

export type EntityFieldType = 'currency' | 'text' | 'badge' | 'date';

export interface DynamicEntity {
  id: string;
  title: string;
  description: string;
  category: 'Keuangan' | 'Ekstrakurikuler' | 'Prestasi' | 'Kedisiplinan' | 'Lainnya';
  iconType: 'wallet' | 'trophy' | 'compass' | 'book' | 'shield' | 'star';
  colorTheme: 'amber' | 'emerald' | 'indigo' | 'rose' | 'cyan' | 'purple';
  primaryValueLabel: string; // e.g. "Nominal Setor (Rp)" or "Jabatan/Peran"
  primaryValueType: EntityFieldType;
  secondaryValueLabel?: string; // e.g. "Catatan Kegiatan" or "Keterangan"
  createdAt: string;
}

export interface DynamicRecord {
  id: string;
  entityId: string;
  studentId: string; // RELATIONAL FOREIGN KEY to Student.id
  // Synchronized snapshot attributes for performance & denormalized view:
  studentName: string;
  studentNisn: string;
  studentClass: string;
  date: string;
  primaryValue: string | number;
  secondaryValue?: string;
  status: 'Aktif' | 'Selesai' | 'Tertunda' | 'Lunas';
  operatorNote?: string;
  createdAt: string;
}
