import * as XLSX from 'xlsx';
import { Teacher, Student, ReportCard, SubjectScore } from '../types';

// ============================================================================
// HELPER: Download Workbook Helper
// ============================================================================
export const downloadWorkbook = (workbook: XLSX.WorkBook, filename: string) => {
  XLSX.writeFile(workbook, filename, { compression: true });
};

// ============================================================================
// 1. TEACHER DATABASE EXCEL TEMPLATE & EXPORT
// ============================================================================
export const generateTeacherTemplate = () => {
  const headers = [
    'No',
    'NIP',
    'Nama Lengkap',
    'Mata Pelajaran',
    'Status Kepegawaian',
    'Jenis Kelamin',
    'Kelas Yang Diampu',
    'Email',
    'No Telepon'
  ];

  const sampleData = [
    {
      'No': 1,
      'NIP': '19780512 200212 1 002',
      'Nama Lengkap': 'Drs. H. Ahmad Fauzi, M.Pd.',
      'Mata Pelajaran': 'Pendidikan Kewarganegaraan / Kepala Sekolah',
      'Status Kepegawaian': 'PNS',
      'Jenis Kelamin': 'Laki-laki',
      'Kelas Yang Diampu': '7A, 8A',
      'Email': 'ahmad.fauzi@satutangan.sch.id',
      'No Telepon': '081234567890'
    },
    {
      'No': 2,
      'NIP': '19850315 200902 2 004',
      'Nama Lengkap': 'Siti Aminah, S.Pd., M.Si.',
      'Mata Pelajaran': 'Matematika',
      'Status Kepegawaian': 'PNS',
      'Jenis Kelamin': 'Perempuan',
      'Kelas Yang Diampu': '7A',
      'Email': 'siti.aminah@satutangan.sch.id',
      'No Telepon': '081398765432'
    },
    {
      'No': 3,
      'NIP': '19900820 201503 1 005',
      'Nama Lengkap': 'Rizki Pratama, S.Pd.',
      'Mata Pelajaran': 'Bahasa Indonesia',
      'Status Kepegawaian': 'PPPK',
      'Jenis Kelamin': 'Laki-laki',
      'Kelas Yang Diampu': '7B, 8B',
      'Email': 'rizki.pratama@satutangan.sch.id',
      'No Telepon': '081287654321'
    },
    {
      'No': 4,
      'NIP': '-',
      'Nama Lengkap': 'Dewi Sartika, S.Si.',
      'Mata Pelajaran': 'Ilmu Pengetahuan Alam (IPA)',
      'Status Kepegawaian': 'Honorer',
      'Jenis Kelamin': 'Perempuan',
      'Kelas Yang Diampu': '8A, 8B',
      'Email': 'dewi.sartika@satutangan.sch.id',
      'No Telepon': '085712345678'
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });

  // Column Widths
  ws['!cols'] = [
    { wch: 6 },   // No
    { wch: 24 },  // NIP
    { wch: 32 },  // Nama
    { wch: 30 },  // Mapel
    { wch: 20 },  // Status
    { wch: 16 },  // JK
    { wch: 18 },  // Kelas
    { wch: 30 },  // Email
    { wch: 18 }   // Phone
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Form_Data_Guru');

  // Petunjuk Sheet
  const guideData = [
    { 'Panduan Pengisian': '1. Jangan mengubah nama kolom pada baris pertama (Header).' },
    { 'Panduan Pengisian': '2. Kolom NIP: Isikan NIP resmi, atau tanda strip (-) jika guru honorer/belum ber-NIP.' },
    { 'Panduan Pengisian': '3. Kolom Nama Lengkap: Wajib diisi beserta gelar bila ada.' },
    { 'Panduan Pengisian': '4. Kolom Status Kepegawaian: Pilih salah satu dari PNS, PPPK, Honorer, atau Yayasan.' },
    { 'Panduan Pengisian': '5. Kolom Jenis Kelamin: Isikan Laki-laki atau Perempuan.' },
    { 'Panduan Pengisian': '6. Kolom Kelas Yang Diampu: Contoh: 7A atau 7A, 8B.' },
    { 'Panduan Pengisian': '7. Setelah diisi, simpan file ini lalu klik tombol "Import Excel" di menu Database Guru.' }
  ];
  const wsGuide = XLSX.utils.json_to_sheet(guideData);
  wsGuide['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk_Pengisian');

  downloadWorkbook(wb, 'Format_Data_Guru_SatuTangan.xlsx');
};

export const parseTeacherExcel = async (file: File): Promise<{
  success: boolean;
  data: Omit<Teacher, 'id'>[];
  errors: string[];
  totalRows: number;
}> => {
  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return { success: false, data: [], errors: ['File Excel kosong atau tidak memiliki data baris.'], totalRows: 0 };
    }

    const parsedTeachers: Omit<Teacher, 'id'>[] = [];
    const errors: string[] = [];

    rawRows.forEach((row, idx) => {
      // Normalize header access
      const rowKeys = Object.keys(row);
      const findVal = (keywords: string[]) => {
        for (const k of rowKeys) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          for (const kw of keywords) {
            if (cleanK.includes(kw)) {
              return String(row[k]).trim();
            }
          }
        }
        return '';
      };

      const name = findVal(['nama', 'name', 'lengkap']);
      const nip = findVal(['nip', 'nomorindukpegawai']) || '-';
      const subject = findVal(['mapel', 'matapelajaran', 'subject']) || 'Mata Pelajaran Umum';
      const statusRaw = findVal(['status', 'kepegawaian']).toUpperCase();
      const genderRaw = findVal(['jeniskelamin', 'gender', 'jk']).toLowerCase();
      const assignedClass = findVal(['kelas', 'rombel', 'ampu']);
      const email = findVal(['email', 'surel']);
      const phone = findVal(['telepon', 'phone', 'wa', 'hp', 'nohp']);

      if (!name) {
        errors.push(`Baris ${idx + 2}: Kolom Nama Guru kosong, baris dilewati.`);
        return;
      }

      let employmentStatus: Teacher['employmentStatus'] = 'PNS';
      if (statusRaw.includes('PPPK')) employmentStatus = 'PPPK';
      else if (statusRaw.includes('HONOR')) employmentStatus = 'Honorer';
      else if (statusRaw.includes('YAYASAN')) employmentStatus = 'Yayasan';
      else employmentStatus = 'PNS';

      let gender: Teacher['gender'] = 'Laki-laki';
      if (genderRaw.includes('p') || genderRaw.includes('wanita') || genderRaw.includes('female')) {
        gender = 'Perempuan';
      }

      parsedTeachers.push({
        name,
        nip,
        subject,
        employmentStatus,
        gender,
        assignedClass: assignedClass || undefined,
        email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@sekolah.sch.id`,
        phone: phone || '-'
      });
    });

    return {
      success: parsedTeachers.length > 0,
      data: parsedTeachers,
      errors,
      totalRows: rawRows.length
    };
  } catch (err: any) {
    return {
      success: false,
      data: [],
      errors: ['Gagal membaca file Excel: ' + (err?.message || 'Format tidak valid')],
      totalRows: 0
    };
  }
};

// ============================================================================
// 2. STUDENT DATABASE EXCEL TEMPLATE & EXPORT
// ============================================================================
export const generateStudentTemplate = () => {
  const headers = [
    'No',
    'NISN',
    'Nama Lengkap',
    'Kelas / Rombel',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir (YYYY-MM-DD)',
    'Nama Orang Tua / Wali',
    'No Telepon Orang Tua',
    'Alamat Lengkap',
    'Status Siswa'
  ];

  const sampleData = [
    {
      'No': 1,
      'NISN': '0081234567',
      'Nama Lengkap': 'Ahmad Rizky Pratama',
      'Kelas / Rombel': '7A',
      'Jenis Kelamin': 'Laki-laki',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir (YYYY-MM-DD)': '2012-05-14',
      'Nama Orang Tua / Wali': 'Hadi Pratama',
      'No Telepon Orang Tua': '081234567890',
      'Alamat Lengkap': 'Jl. Merdeka No. 45, Coblong, Bandung',
      'Status Siswa': 'Aktif'
    },
    {
      'No': 2,
      'NISN': '0082345678',
      'Nama Lengkap': 'Annisa Putri Maharani',
      'Kelas / Rombel': '7A',
      'Jenis Kelamin': 'Perempuan',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir (YYYY-MM-DD)': '2012-08-22',
      'Nama Orang Tua / Wali': 'Bambang Maharani',
      'No Telepon Orang Tua': '081398765432',
      'Alamat Lengkap': 'Jl. Cendekia No. 12, Bandung',
      'Status Siswa': 'Aktif'
    },
    {
      'No': 3,
      'NISN': '0083456789',
      'Nama Lengkap': 'Bagas Arya Wicaksono',
      'Kelas / Rombel': '7B',
      'Jenis Kelamin': 'Laki-laki',
      'Tempat Lahir': 'Jakarta',
      'Tanggal Lahir (YYYY-MM-DD)': '2011-12-03',
      'Nama Orang Tua / Wali': 'Arya Wicaksono',
      'No Telepon Orang Tua': '085712345678',
      'Alamat Lengkap': 'Jl. Diponegoro No. 8, Bandung',
      'Status Siswa': 'Aktif'
    },
    {
      'No': 4,
      'NISN': '0084567890',
      'Nama Lengkap': 'Cantika Dewi Lestari',
      'Kelas / Rombel': '7B',
      'Jenis Kelamin': 'Perempuan',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir (YYYY-MM-DD)': '2012-03-19',
      'Nama Orang Tua / Wali': 'Agus Lestari',
      'No Telepon Orang Tua': '081987654321',
      'Alamat Lengkap': 'Jl. Pahlawan No. 20, Bandung',
      'Status Siswa': 'Aktif'
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });

  ws['!cols'] = [
    { wch: 6 },   // No
    { wch: 16 },  // NISN
    { wch: 30 },  // Nama
    { wch: 16 },  // Kelas
    { wch: 15 },  // JK
    { wch: 18 },  // Tempat Lahir
    { wch: 26 },  // Tgl Lahir
    { wch: 28 },  // Ortu
    { wch: 22 },  // Telp Ortu
    { wch: 36 },  // Alamat
    { wch: 15 }   // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Form_Data_Siswa');

  // Petunjuk Sheet
  const guideData = [
    { 'Panduan Pengisian': '1. Jangan mengubah nama kolom pada baris pertama (Header).' },
    { 'Panduan Pengisian': '2. Kolom NISN: Wajib diisi angka 10 digit (atau nomor induk resmi siswa).' },
    { 'Panduan Pengisian': '3. Kolom Nama Lengkap: Wajib diisi huruf kapital pada awal kata.' },
    { 'Panduan Pengisian': '4. Kolom Kelas / Rombel: Contoh: 7A, 7B, 8A, TK-A, TK-B.' },
    { 'Panduan Pengisian': '5. Kolom Jenis Kelamin: Isikan Laki-laki atau Perempuan.' },
    { 'Panduan Pengisian': '6. Kolom Tanggal Lahir: Format YYYY-MM-DD (Contoh: 2012-05-14).' },
    { 'Panduan Pengisian': '7. Kolom Status Siswa: Pilih Aktif, Lulus, Pindah, atau Keluar.' },
    { 'Panduan Pengisian': '8. Setelah diisi, simpan file ini lalu klik tombol "Import Excel" di menu Database Siswa.' }
  ];
  const wsGuide = XLSX.utils.json_to_sheet(guideData);
  wsGuide['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk_Pengisian');

  downloadWorkbook(wb, 'Format_Data_Siswa_SatuTangan.xlsx');
};

export const parseStudentExcel = async (file: File): Promise<{
  success: boolean;
  data: Omit<Student, 'id'>[];
  errors: string[];
  totalRows: number;
}> => {
  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return { success: false, data: [], errors: ['File Excel kosong atau tidak memiliki data baris.'], totalRows: 0 };
    }

    const parsedStudents: Omit<Student, 'id'>[] = [];
    const errors: string[] = [];

    rawRows.forEach((row, idx) => {
      const rowKeys = Object.keys(row);
      const findVal = (keywords: string[]) => {
        for (const k of rowKeys) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          for (const kw of keywords) {
            if (cleanK.includes(kw)) {
              return String(row[k]).trim();
            }
          }
        }
        return '';
      };

      const name = findVal(['nama', 'name', 'lengkap']);
      const nisn = findVal(['nisn', 'nis', 'nomorinduk']) || `00${Date.now().toString().slice(-8)}`;
      const className = findVal(['kelas', 'rombel', 'class']) || '7A';
      const genderRaw = findVal(['jeniskelamin', 'gender', 'jk']).toLowerCase();
      const birthPlace = findVal(['tempat', 'tempatlahir', 'kota']) || 'Kota Bandung';
      let birthDate = findVal(['tanggal', 'tanggallahir', 'tgl', 'dob']) || '2012-01-01';
      const parentName = findVal(['orangtua', 'wali', 'parent', 'ayah', 'ibu']) || 'Orang Tua Siswa';
      const parentPhone = findVal(['telepon', 'phone', 'wa', 'hp', 'notelp']) || '081234567890';
      const address = findVal(['alamat', 'address', 'domisili']) || 'Alamat Siswa';
      const statusRaw = findVal(['status', 'keaktifan']).toLowerCase();

      if (!name) {
        errors.push(`Baris ${idx + 2}: Kolom Nama Siswa kosong, baris dilewati.`);
        return;
      }

      // Convert excel serial dates if numeric
      if (/^\d{5}$/.test(birthDate)) {
        const dateObj = new Date((Number(birthDate) - (25567 + 2)) * 86400 * 1000);
        if (!isNaN(dateObj.getTime())) {
          birthDate = dateObj.toISOString().slice(0, 10);
        }
      }

      let gender: Student['gender'] = 'Laki-laki';
      if (genderRaw.includes('p') || genderRaw.includes('wanita') || genderRaw.includes('female')) {
        gender = 'Perempuan';
      }

      let activeStatus: Student['activeStatus'] = 'Aktif';
      if (statusRaw.includes('lulus')) activeStatus = 'Lulus';
      else if (statusRaw.includes('pindah') || statusRaw.includes('keluar')) activeStatus = 'Pindah';

      parsedStudents.push({
        name,
        nisn,
        className,
        gender,
        birthPlace,
        birthDate,
        parentName,
        parentPhone,
        address,
        activeStatus
      });
    });

    return {
      success: parsedStudents.length > 0,
      data: parsedStudents,
      errors,
      totalRows: rawRows.length
    };
  } catch (err: any) {
    return {
      success: false,
      data: [],
      errors: ['Gagal membaca file Excel: ' + (err?.message || 'Format tidak valid')],
      totalRows: 0
    };
  }
};

// ============================================================================
// 3. REPORT CARD (RAPORT) EXCEL TEMPLATE & IMPORT
// ============================================================================
export const generateReportCardTemplate = (
  students: Student[],
  subjects: { name: string; kkm: number; deskripsi?: string }[],
  academicYear: string,
  semester: string
) => {
  const wb = XLSX.utils.book_new();

  // If students are provided, prefill with student rows x subjects
  const sampleRows: any[] = [];
  const targetStudents = students.length > 0 ? students : [
    {
      id: 's-demo-1',
      name: 'Ahmad Rizky Pratama',
      nisn: '0081234567',
      className: '7A'
    },
    {
      id: 's-demo-2',
      name: 'Annisa Putri Maharani',
      nisn: '0082345678',
      className: '7A'
    }
  ];

  targetStudents.forEach((student, sIdx) => {
    subjects.forEach((subj, subIdx) => {
      // Default sample scores
      const sampleTugas = 80 + ((sIdx + subIdx) % 15);
      const sampleUts = 78 + ((sIdx + subIdx) % 14);
      const sampleUas = 82 + ((sIdx + subIdx) % 12);
      const nilaiAkhir = Math.round(sampleTugas * 0.3 + sampleUts * 0.3 + sampleUas * 0.4);
      const predikat = nilaiAkhir >= 85 ? 'A' : nilaiAkhir >= subj.kkm ? 'B' : 'C';

      sampleRows.push({
        'NISN': student.nisn,
        'Nama Siswa': student.name,
        'Kelas': student.className,
        'Mata Pelajaran': subj.name,
        'KKM': subj.kkm,
        'Nilai Tugas (30%)': sampleTugas,
        'Nilai UTS (30%)': sampleUts,
        'Nilai UAS (40%)': sampleUas,
        'Nilai Akhir (Auto)': nilaiAkhir,
        'Predikat (Auto)': predikat,
        'Deskripsi Capaian Kompetensi': subj.deskripsi || 'Sangat menguasai pemahaman materi dengan baik.',
        'Sikap Spiritual': 'Sangat Baik',
        'Sikap Sosial': 'Baik',
        'Catatan Wali Kelas': 'Pertahankan semangat belajar dan prestasinya.',
        'Sakit (Hari)': 0,
        'Izin (Hari)': 0,
        'Alpa (Hari)': 0
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(sampleRows);

  ws['!cols'] = [
    { wch: 15 }, // NISN
    { wch: 28 }, // Nama Siswa
    { wch: 10 }, // Kelas
    { wch: 32 }, // Mata Pelajaran
    { wch: 8 },  // KKM
    { wch: 16 }, // Tugas
    { wch: 16 }, // UTS
    { wch: 16 }, // UAS
    { wch: 16 }, // Nilai Akhir
    { wch: 14 }, // Predikat
    { wch: 45 }, // Deskripsi
    { wch: 18 }, // Sikap Spiritual
    { wch: 16 }, // Sikap Sosial
    { wch: 38 }, // Catatan
    { wch: 12 }, // Sakit
    { wch: 12 }, // Izin
    { wch: 12 }  // Alpa
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Form_Nilai_Raport');

  // Petunjuk Sheet
  const guideData = [
    { 'Informasi & Petunjuk Pengisian Raport': `Tahun Ajaran: ${academicYear} | Semester: ${semester}` },
    { 'Informasi & Petunjuk Pengisian Raport': '1. Kolom NISN dan Mata Pelajaran digunakan untuk mencocokkan data nilai ke siswa yang tepat.' },
    { 'Informasi & Petunjuk Pengisian Raport': '2. Isikan Nilai Tugas (30%), UTS (30%), dan UAS (40%) dalam rentang angka 0 - 100.' },
    { 'Informasi & Petunjuk Pengisian Raport': '3. Nilai Akhir dan Predikat akan dikalkulasi otomatis oleh sistem saat di-import.' },
    { 'Informasi & Petunjuk Pengisian Raport': '4. Kolom Sikap Spiritual & Sikap Sosial: Isikan Sangat Baik, Baik, Cukup, atau Kurang.' },
    { 'Informasi & Petunjuk Pengisian Raport': '5. Kolom Sakit, Izin, Alpa: Isikan jumlah hari dalam bentuk angka (0, 1, 2, dst).' },
    { 'Informasi & Petunjuk Pengisian Raport': '6. Setelah selesai, simpan file lalu klik tombol "Import Excel" di halaman Raport.' }
  ];
  const wsGuide = XLSX.utils.json_to_sheet(guideData);
  wsGuide['!cols'] = [{ wch: 85 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk_Kalkulasi');

  downloadWorkbook(wb, `Format_Input_Nilai_Raport_${academicYear.replace(/[^a-zA-Z0-9]/g, '_')}_${semester}.xlsx`);
};

export interface ParsedRaportEntry {
  studentNisn: string;
  studentName: string;
  className: string;
  scores: SubjectScore[];
  spiritualAttitude?: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  socialAttitude?: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  teacherNotes?: string;
  attendanceSummary?: { sakit: number; izin: number; alpa: number };
}

export const parseReportCardExcel = async (
  file: File,
  registeredStudents: Student[]
): Promise<{
  success: boolean;
  studentsReportMap: Record<string, ParsedRaportEntry>;
  errors: string[];
  totalRows: number;
}> => {
  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return { success: false, studentsReportMap: {}, errors: ['File Excel kosong.'], totalRows: 0 };
    }

    const studentsReportMap: Record<string, ParsedRaportEntry> = {};
    const errors: string[] = [];

    rawRows.forEach((row, idx) => {
      const rowKeys = Object.keys(row);
      const findVal = (keywords: string[]) => {
        for (const k of rowKeys) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          for (const kw of keywords) {
            if (cleanK.includes(kw)) {
              return String(row[k]).trim();
            }
          }
        }
        return '';
      };

      const nisn = findVal(['nisn', 'nis', 'nomorinduk']);
      const studentName = findVal(['namasiswa', 'nama', 'pesertadidik']);
      const className = findVal(['kelas', 'rombel']);
      const subjectName = findVal(['matapelajaran', 'mapel', 'lingkup', 'subject']);
      
      if (!subjectName) {
        errors.push(`Baris ${idx + 2}: Kolom Mata Pelajaran kosong, dilewati.`);
        return;
      }

      // Find matching student
      let matchedStudent = registeredStudents.find(s => nisn && s.nisn === nisn);
      if (!matchedStudent && studentName) {
        matchedStudent = registeredStudents.find(
          s => s.name.toLowerCase().trim() === studentName.toLowerCase().trim()
        );
      }

      const targetStudentKey = matchedStudent ? matchedStudent.id : (nisn || studentName || `row-${idx}`);
      const displayName = matchedStudent?.name || studentName || 'Peserta Didik';
      const displayNisn = matchedStudent?.nisn || nisn || '-';
      const displayClass = matchedStudent?.className || className || '-';

      const kkm = Number(findVal(['kkm', 'kriteriaketuntasan'])) || 75;
      const tugas = Math.min(100, Math.max(0, Number(findVal(['tugas', 'nilaitugas'])) || 0));
      const uts = Math.min(100, Math.max(0, Number(findVal(['uts', 'nilaiuts', 'mid'])) || 0));
      const uas = Math.min(100, Math.max(0, Number(findVal(['uas', 'nilaiuas', 'pas'])) || 0));
      const deskripsi = findVal(['deskripsi', 'capaian', 'kompetensi']) || 'Memahami materi pembelajaran dengan baik.';

      // Calculate final score: Tugas 30% + UTS 30% + UAS 40%
      const nilaiAkhir = Math.round(tugas * 0.3 + uts * 0.3 + uas * 0.4);
      let predikat: 'A' | 'B' | 'C' | 'D' = 'B';
      if (nilaiAkhir >= kkm + 15 || nilaiAkhir >= 90) predikat = 'A';
      else if (nilaiAkhir >= kkm) predikat = 'B';
      else if (nilaiAkhir >= kkm - 15) predikat = 'C';
      else predikat = 'D';

      const scoreEntry: SubjectScore = {
        subjectId: 'sub-' + subjectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        subjectName,
        kkm,
        nilaiTugas: tugas,
        nilaiUts: uts,
        nilaiUas: uas,
        nilaiAkhir,
        predikat,
        deskripsi
      };

      const spiritual = findVal(['spiritual', 'sikapspiritual']);
      const social = findVal(['sosial', 'sikapsosial']);
      const notes = findVal(['catatan', 'catatanwalikelas', 'pesan']);
      const sakit = Number(findVal(['sakit'])) || 0;
      const izin = Number(findVal(['izin'])) || 0;
      const alpa = Number(findVal(['alpa', 'tanpaketerangan'])) || 0;

      if (!studentsReportMap[targetStudentKey]) {
        studentsReportMap[targetStudentKey] = {
          studentNisn: displayNisn,
          studentName: displayName,
          className: displayClass,
          scores: [scoreEntry],
          spiritualAttitude: spiritual ? (spiritual as any) : 'Baik',
          socialAttitude: social ? (social as any) : 'Baik',
          teacherNotes: notes || '',
          attendanceSummary: { sakit, izin, alpa }
        };
      } else {
        // Prevent duplicate subject for the same student
        const existingSubjIndex = studentsReportMap[targetStudentKey].scores.findIndex(
          s => s.subjectName.toLowerCase() === subjectName.toLowerCase()
        );
        if (existingSubjIndex >= 0) {
          studentsReportMap[targetStudentKey].scores[existingSubjIndex] = scoreEntry;
        } else {
          studentsReportMap[targetStudentKey].scores.push(scoreEntry);
        }
        if (spiritual) studentsReportMap[targetStudentKey].spiritualAttitude = spiritual as any;
        if (social) studentsReportMap[targetStudentKey].socialAttitude = social as any;
        if (notes) studentsReportMap[targetStudentKey].teacherNotes = notes;
        if (sakit || izin || alpa) {
          studentsReportMap[targetStudentKey].attendanceSummary = { sakit, izin, alpa };
        }
      }
    });

    return {
      success: Object.keys(studentsReportMap).length > 0,
      studentsReportMap,
      errors,
      totalRows: rawRows.length
    };
  } catch (err: any) {
    return {
      success: false,
      studentsReportMap: {},
      errors: ['Gagal membaca file Excel Raport: ' + (err?.message || 'Format tidak valid')],
      totalRows: 0
    };
  }
};
