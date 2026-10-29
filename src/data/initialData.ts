import { Teacher, Student, TeacherAttendance, StudentAttendance, DynamicEntity, DynamicRecord, ReportCard, OperatorUser, SchoolProfile } from '../types';

export const APP_LOGO_URL = '/assets/aistudio/logo_cropped.png';

export const OFFICIAL_KEMENDIKBUD_LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="scGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs><circle cx="80" cy="80" r="76" fill="url(#scGrad)" stroke="#f59e0b" stroke-width="5"/><circle cx="80" cy="80" r="67" fill="#0f172a" stroke="#ffffff" stroke-width="2" stroke-dasharray="5,3"/><polygon points="80,24 88,38 104,40 92,52 95,68 80,60 65,68 68,52 56,40 72,38" fill="#fbbf24"/><path d="M50 78 C62 72 74 74 80 82 C86 74 98 72 110 78 L110 106 C98 100 86 102 80 110 C74 102 62 100 50 106 Z" fill="#ffffff" stroke="#f59e0b" stroke-width="2.5"/><path d="M80 62 C76 68 76 72 80 77 C84 72 84 68 80 62 Z" fill="#ef4444"/><path d="M78 77 L82 77 L81 85 L79 85 Z" fill="#f59e0b"/><path d="M46 116 C60 128 100 128 114 116" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/><text x="80" y="138" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#facc15" text-anchor="middle" letter-spacing="1.5">TUT WURI HANDAYANI</text></svg>`);

export const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'SMP Negeri 1 Cendekia Mandiri',
  npsn: '20109823',
  nss: '201026001001',
  accreditation: 'A (Amat Baik)',
  educationLevel: 'Sekolah Menengah Pertama (SMP)',
  status: 'Negeri',
  address: 'Jl. Raya Pendidikan No. 101',
  subdistrict: 'Coblong',
  city: 'Kota Bandung',
  province: 'Jawa Barat',
  postalCode: '40132',
  phone: '(022) 7201889',
  email: 'info@cendekia.sch.id',
  website: 'www.cendekia.sch.id',
  headmasterName: 'Drs. H. Ahmad Fauzi, M.Pd.',
  headmasterNip: '19780512 200212 1 002',
  letterheadProvince: 'PEMERINTAH DAERAH PROVINSI JAWA BARAT',
  letterheadAgency: 'DINAS PENDIDIKAN & KEBUDAYAAN',
  logoUrl: OFFICIAL_KEMENDIKBUD_LOGO,
  showInactiveData: false
};

export const INITIAL_OPERATOR: OperatorUser = {
  id: 'op-01',
  name: 'Budi Raharjo, S.Kom',
  email: 'operator@satutangan.sch.id',
  role: 'OPERATOR_UTAMA',
  schoolName: 'SMP Negeri 1 Cendekia Mandiri',
  npsn: '20109823',
  authProvider: 'local'
};

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-01',
    nip: '19780512 200212 1 002',
    name: 'Drs. H. Ahmad Fauzi, M.Pd.',
    subject: 'Pendidikan Kewarganegaraan / Kepala Sekolah',
    email: 'ahmad.fauzi@satutangan.sch.id',
    phone: '0812-3456-7890',
    employmentStatus: 'PNS',
    gender: 'Laki-laki'
  },
  {
    id: 'tch-02',
    nip: '19850315 200902 2 004',
    name: 'Siti Aminah, S.Pd., M.Si.',
    subject: 'Matematika',
    email: 'siti.aminah@satutangan.sch.id',
    phone: '0813-9876-5432',
    employmentStatus: 'PNS',
    gender: 'Perempuan',
    assignedClass: '7A'
  },
  {
    id: 'tch-03',
    nip: '19900820 201503 1 005',
    name: 'Rizki Pratama, S.Pd.',
    subject: 'Ilmu Pengetahuan Alam (IPA)',
    email: 'rizki.pratama@satutangan.sch.id',
    phone: '0857-1122-3344',
    employmentStatus: 'PPPK',
    gender: 'Laki-laki',
    assignedClass: '7B'
  },
  {
    id: 'tch-04',
    nip: '19881104 201210 2 003',
    name: 'Dewi Lestari, M.Hum.',
    subject: 'Bahasa Indonesia',
    email: 'dewi.lestari@satutangan.sch.id',
    phone: '0821-4455-6677',
    employmentStatus: 'PNS',
    gender: 'Perempuan',
    assignedClass: '8A'
  },
  {
    id: 'tch-05',
    nip: '19940112 202012 1 008',
    name: 'Fajar Nugroho, S.Pd.',
    subject: 'Bahasa Inggris',
    email: 'fajar.nugroho@satutangan.sch.id',
    phone: '0878-9900-1122',
    employmentStatus: 'PPPK',
    gender: 'Laki-laki'
  },
  {
    id: 'tch-06',
    nip: '19830718 200801 1 001',
    name: 'Ust. Mansyur Hidayat, S.Ag.',
    subject: 'Pendidikan Agama & Budi Pekerti',
    email: 'mansyur.h@satutangan.sch.id',
    phone: '0812-7788-9900',
    employmentStatus: 'PNS',
    gender: 'Laki-laki'
  },
  {
    id: 'tch-07',
    nip: '19960205 202203 1 009',
    name: 'Bayu Wicaksono, S.Pd.',
    subject: 'Pendidikan Jasmani (PJOK)',
    email: 'bayu.w@satutangan.sch.id',
    phone: '0852-3344-5566',
    employmentStatus: 'Honorer',
    gender: 'Laki-laki',
    activeStatus: 'Aktif'
  },
  {
    id: 'tch-08',
    nip: '19610410 198603 1 003',
    name: 'Drs. H. Mulyadi, M.Pd.',
    subject: 'Ilmu Pengetahuan Sosial (Purna Tugas)',
    email: 'mulyadi.purna@satutangan.sch.id',
    phone: '0811-2233-4455',
    employmentStatus: 'PNS',
    gender: 'Laki-laki',
    activeStatus: 'Pensiun'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-01',
    nisn: '0089234120',
    nik: '3201122304080001',
    name: 'Aditya Pratama Putra',
    className: '7A',
    gender: 'Laki-laki',
    birthPlace: 'Bandung',
    birthDate: '2011-04-12',
    parentName: 'Hendra Gunawan',
    parentPhone: '0812-9988-1122',
    address: 'Jl. Melati No. 14, Sukajadi, Bandung',
    activeStatus: 'Aktif'
  },
  {
    id: 'std-02',
    nisn: '0089234121',
    nik: '3201126507080002',
    name: 'Annisa Fitriani Zahra',
    className: '7A',
    gender: 'Perempuan',
    birthPlace: 'Bandung',
    birthDate: '2011-07-25',
    parentName: 'Bambang Sudibyo',
    parentPhone: '0813-2233-4455',
    address: 'Komplek Permata Hijau Blok C-5, Bandung',
    activeStatus: 'Aktif'
  },
  {
    id: 'std-03',
    nisn: '0089234122',
    nik: '3201121011080003',
    name: 'Bintang Ramadhan',
    className: '7A',
    gender: 'Laki-laki',
    birthPlace: 'Cimahi',
    birthDate: '2011-09-10',
    parentName: 'Rahmat Hidayat',
    parentPhone: '0857-3344-5566',
    address: 'Jl. Cihanjuang No. 88, Cimahi',
    activeStatus: 'Aktif'
  },
  {
    id: 'std-04',
    nisn: '0089234123',
    nik: '3201124401080004',
    name: 'Cantika Dewi Maharani',
    className: '7A',
    gender: 'Perempuan',
    birthPlace: 'Bandung',
    birthDate: '2011-01-14',
    parentName: 'Agus Setiawan',
    parentPhone: '0818-7766-5544',
    address: 'Jl. Gandawijaya No. 12, Bandung',
    activeStatus: 'Aktif'
  },
  {
    id: 'std-05',
    nisn: '0089234124',
    nik: '3201121203080005',
    name: 'Dimas Satria Wibowo',
    className: '7B',
    gender: 'Laki-laki',
    birthPlace: 'Jakarta',
    birthDate: '2011-03-12',
    parentName: 'Wibowo Santoso',
    parentPhone: '0812-4455-6677',
    address: 'Jl. Riau No. 45, Bandung',
    activeStatus: 'Aktif'
  },
  {
    id: 'std-06',
    nisn: '0089234125',
    nik: '3201125508080006',
    name: 'Elsa Putri Wardani',
    className: '7B',
    gender: 'Perempuan',
    birthPlace: 'Bandung',
    birthDate: '2011-08-15',
    parentName: 'Ir. Wardani',
    parentPhone: '0877-8899-0011',
    address: 'Jl. Setiabudi Atas No. 201, Bandung',
    activeStatus: 'Aktif'
  },
  {
    id: 'std-07',
    nisn: '0078129033',
    nik: '3201121809070007',
    name: 'Farhan Maulana Hakim',
    className: '8A',
    gender: 'Laki-laki',
    birthPlace: 'Bandung',
    birthDate: '2010-09-18',
    parentName: 'Lukman Hakim, S.E.',
    parentPhone: '0812-1122-8899',
    address: 'Jl. Antapani Raya No. 34, Bandung',
    activeStatus: 'Aktif'
  },
  {
    id: 'std-08',
    nisn: '0078129034',
    nik: '3201126012070008',
    name: 'Gita Nurul Aulia',
    className: '8A',
    gender: 'Perempuan',
    birthPlace: 'Tasikmalaya',
    birthDate: '2010-12-20',
    parentName: 'Maman Surahman',
    parentPhone: '0853-2211-9988',
    address: 'Jl. Cicaheum No. 19, Bandung',
    activeStatus: 'Aktif'
  },
  {
    id: 'std-09',
    nisn: '0067341289',
    nik: '3201120202060009',
    name: 'Hafiz Al-Fikri',
    className: '9A',
    gender: 'Laki-laki',
    birthPlace: 'Bandung',
    birthDate: '2009-02-02',
    parentName: 'Dr. Fikri Ardiansyah',
    parentPhone: '0811-9900-1122',
    address: 'Jl. Dago Asri No. 17, Bandung',
    activeStatus: 'Aktif'
  },
  {
    id: 'std-10',
    nisn: '0055198271',
    nik: '3201121005050010',
    name: 'Bagas Nugraha Pratama',
    className: 'Alumni 9A',
    gender: 'Laki-laki',
    birthPlace: 'Bandung',
    birthDate: '2008-05-10',
    parentName: 'Rahmat Nugraha',
    parentPhone: '0813-8899-7766',
    address: 'Jl. Riau No. 45, Bandung',
    activeStatus: 'Lulus'
  },
  {
    id: 'std-11',
    nisn: '0055198272',
    nik: '3201124409050011',
    name: 'Citra Kirana Anindita',
    className: 'Alumni 9B',
    gender: 'Perempuan',
    birthPlace: 'Cimahi',
    birthDate: '2008-09-14',
    parentName: 'Agus Suryana, S.T.',
    parentPhone: '0812-7766-5544',
    address: 'Jl. Cihanjuang No. 88, Cimahi',
    activeStatus: 'Lulus'
  },
  {
    id: 'std-12',
    nisn: '0044187160',
    nik: '3201120301040012',
    name: 'Dimas Arya Kusuma',
    className: 'Alumni 9A',
    gender: 'Laki-laki',
    birthPlace: 'Bandung',
    birthDate: '2007-01-03',
    parentName: 'Kusuma Wardhana',
    parentPhone: '0852-1144-7788',
    address: 'Jl. Buah Batu No. 120, Bandung',
    activeStatus: 'Lulus'
  }
];

export const TODAY_STR = new Date().toISOString().split('T')[0];

export const INITIAL_TEACHER_ATTENDANCE: TeacherAttendance[] = [
  { id: 'ta-01', teacherId: 'tch-01', teacherName: 'Drs. H. Ahmad Fauzi, M.Pd.', nip: '19780512 200212 1 002', date: TODAY_STR, status: 'HADIR', checkInTime: '06:45', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01', notes: 'Piket Pagi' },
  { id: 'ta-02', teacherId: 'tch-02', teacherName: 'Siti Aminah, S.Pd., M.Si.', nip: '19850315 200902 2 004', date: TODAY_STR, status: 'HADIR', checkInTime: '06:50', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01' },
  { id: 'ta-03', teacherId: 'tch-03', teacherName: 'Rizki Pratama, S.Pd.', nip: '19900820 201503 1 005', date: TODAY_STR, status: 'HADIR', checkInTime: '06:58', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01' },
  { id: 'ta-04', teacherId: 'tch-04', teacherName: 'Dewi Lestari, M.Hum.', nip: '19881104 201210 2 003', date: TODAY_STR, status: 'IZIN', notes: 'Pelatihan Kurikulum Merdeka di Dinas' },
  { id: 'ta-05', teacherId: 'tch-05', teacherName: 'Fajar Nugroho, S.Pd.', nip: '19940112 202012 1 008', date: TODAY_STR, status: 'HADIR', checkInTime: '07:05', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01' },
  { id: 'ta-06', teacherId: 'tch-06', teacherName: 'Ust. Mansyur Hidayat, S.Ag.', nip: '19830718 200801 1 001', date: TODAY_STR, status: 'HADIR', checkInTime: '06:40', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01' },
  { id: 'ta-07', teacherId: 'tch-07', teacherName: 'Bayu Wicaksono, S.Pd.', nip: '19960205 202203 1 009', date: TODAY_STR, status: 'HADIR', checkInTime: '06:55', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01' },
];

export const INITIAL_STUDENT_ATTENDANCE: StudentAttendance[] = [
  { id: 'sa-01', studentId: 'std-01', studentName: 'Aditya Pratama Putra', nisn: '0089234120', className: '7A', date: TODAY_STR, status: 'HADIR', checkInTime: '06:58', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01' },
  { id: 'sa-02', studentId: 'std-02', studentName: 'Annisa Fitriani Zahra', nisn: '0089234121', className: '7A', date: TODAY_STR, status: 'HADIR', checkInTime: '07:02', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01' },
  { id: 'sa-03', studentId: 'std-03', studentName: 'Bintang Ramadhan', nisn: '0089234122', className: '7A', date: TODAY_STR, status: 'SAKIT', notes: 'Surat dokter terlampir' },
  { id: 'sa-04', studentId: 'std-04', studentName: 'Cantika Dewi Maharani', nisn: '0089234123', className: '7A', date: TODAY_STR, status: 'HADIR', checkInTime: '07:05', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01' },
  { id: 'sa-05', studentId: 'std-05', studentName: 'Dimas Satria Wibowo', nisn: '0089234124', className: '7B', date: TODAY_STR, status: 'HADIR', checkInTime: '07:01', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01' },
  { id: 'sa-06', studentId: 'std-06', studentName: 'Elsa Putri Wardani', nisn: '0089234125', className: '7B', date: TODAY_STR, status: 'HADIR', checkInTime: '06:55', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01' },
  { id: 'sa-07', studentId: 'std-07', studentName: 'Farhan Maulana Hakim', nisn: '0078129033', className: '8A', date: TODAY_STR, status: 'HADIR', checkInTime: '07:08', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01' },
  { id: 'sa-08', studentId: 'std-08', studentName: 'Gita Nurul Aulia', nisn: '0078129034', className: '8A', date: TODAY_STR, status: 'IZIN', notes: 'Ada acara keluarga' },
  { id: 'sa-09', studentId: 'std-09', studentName: 'Hafiz Al-Fikri', nisn: '0067341289', className: '9A', date: TODAY_STR, status: 'HADIR', checkInTime: '07:11', verificationMethod: 'FINGERPRINT', deviceId: 'BIO-SCANNER-01' },
];

export const INITIAL_DYNAMIC_ENTITIES: DynamicEntity[] = [
  {
    id: 'ent-01',
    title: 'Ekstrakurikuler Pramuka',
    description: 'Kegiatan kepramukaan wajib & dewan penggalang tingkat pangkalan.',
    category: 'Ekstrakurikuler',
    iconType: 'compass',
    colorTheme: 'amber',
    primaryValueLabel: 'Tingkatan / Regu',
    primaryValueType: 'text',
    secondaryValueLabel: 'Jabatan / Peran Khusus',
    createdAt: '2026-01-10'
  },
  {
    id: 'ent-02',
    title: 'Tabungan Siswa Gemilang',
    description: 'Program menabung harian & mingguan siswa untuk edukasi literasi finansial.',
    category: 'Keuangan',
    iconType: 'wallet',
    colorTheme: 'emerald',
    primaryValueLabel: 'Nominal Setoran (Rp)',
    primaryValueType: 'currency',
    secondaryValueLabel: 'Tujuan Tabungan / Keterangan',
    createdAt: '2026-01-15'
  },
  {
    id: 'ent-03',
    title: 'Prestasi & Lomba Olimpiade',
    description: 'Pencatatan medali, sertifikat, dan kontingen kejuaraan akademik & seni.',
    category: 'Prestasi',
    iconType: 'trophy',
    colorTheme: 'purple',
    primaryValueLabel: 'Nama Lomba & Tingkat',
    primaryValueType: 'text',
    secondaryValueLabel: 'Pencapaian (Juara 1/2/3/Finalis)',
    createdAt: '2026-02-01'
  }
];

export const INITIAL_DYNAMIC_RECORDS: DynamicRecord[] = [
  {
    id: 'dr-01',
    entityId: 'ent-01',
    studentId: 'std-01',
    studentName: 'Aditya Pratama Putra',
    studentNisn: '0089234120',
    studentClass: '7A',
    date: '2026-10-18',
    primaryValue: 'Penggalang Ramu / Regu Rajawali',
    secondaryValue: 'Pratama (Ketua Regu)',
    status: 'Aktif',
    operatorNote: 'Lolos uji SKU Penggalang Ramu',
    createdAt: '2026-10-18'
  },
  {
    id: 'dr-02',
    entityId: 'ent-01',
    studentId: 'std-02',
    studentName: 'Annisa Fitriani Zahra',
    studentNisn: '0089234121',
    studentClass: '7A',
    date: '2026-10-18',
    primaryValue: 'Penggalang Ramu / Regu Mawar',
    secondaryValue: 'Sekretaris Regu',
    status: 'Aktif',
    operatorNote: 'Aktif di latihan tali-temali',
    createdAt: '2026-10-18'
  },
  {
    id: 'dr-03',
    entityId: 'ent-02',
    studentId: 'std-01',
    studentName: 'Aditya Pratama Putra',
    studentNisn: '0089234120',
    studentClass: '7A',
    date: '2026-10-20',
    primaryValue: 50000,
    secondaryValue: 'Tabungan Kunjungan Edukasi Museum',
    status: 'Lunas',
    operatorNote: 'Penyetoran tunai minggu ke-3',
    createdAt: '2026-10-20'
  },
  {
    id: 'dr-04',
    entityId: 'ent-02',
    studentId: 'std-04',
    studentName: 'Cantika Dewi Maharani',
    studentNisn: '0089234123',
    studentClass: '7A',
    date: '2026-10-21',
    primaryValue: 100000,
    secondaryValue: 'Tabungan Akhir Tahun',
    status: 'Lunas',
    operatorNote: 'Penyetoran via wali kelas',
    createdAt: '2026-10-21'
  },
  {
    id: 'dr-05',
    entityId: 'ent-03',
    studentId: 'std-07',
    studentName: 'Farhan Maulana Hakim',
    studentNisn: '0078129033',
    studentClass: '8A',
    date: '2026-09-15',
    primaryValue: 'Olimpiade Sains Nasional (OSN) IPA',
    secondaryValue: 'Medali Emas Tingkat Kota',
    status: 'Selesai',
    operatorNote: 'Lolos seleksi provinsi tahap 1',
    createdAt: '2026-09-15'
  }
];

export const INITIAL_REPORT_CARDS: Record<string, ReportCard> = {
  'rep-std01-2025-ganjil': {
    id: 'rep-std01-2025-ganjil',
    studentId: 'std-01',
    studentName: 'Aditya Pratama Putra',
    studentNisn: '0089234120',
    className: '7A',
    statusSiswa: 'Aktif',
    academicYear: '2025/2026',
    semester: 'Ganjil',
    scores: [
      { subjectId: 'sub-01', subjectName: 'Pendidikan Agama & Budi Pekerti', kkm: 75, nilaiTugas: 88, nilaiUts: 85, nilaiUas: 90, nilaiAkhir: 88, predikat: 'A', deskripsi: 'Sangat menguasai pemahaman adab dan pengamalan ibadah harian secara konsisten.' },
      { subjectId: 'sub-02', subjectName: 'Pendidikan Pancasila & Kewarganegaraan', kkm: 75, nilaiTugas: 85, nilaiUts: 82, nilaiUas: 86, nilaiAkhir: 84, predikat: 'B', deskripsi: 'Memahami nilai-nilai musyawarah dan penegakan tata tertib sekolah dengan baik.' },
      { subjectId: 'sub-03', subjectName: 'Bahasa Indonesia', kkm: 75, nilaiTugas: 86, nilaiUts: 88, nilaiUas: 87, nilaiAkhir: 87, predikat: 'A', deskripsi: 'Sangat terampil dalam menyusun teks deskripsi dan presentasi lisan yang runtut.' },
      { subjectId: 'sub-04', subjectName: 'Matematika', kkm: 72, nilaiTugas: 84, nilaiUts: 80, nilaiUas: 85, nilaiAkhir: 83, predikat: 'B', deskripsi: 'Mampu menyelesaikan persoalan aljabar dasar dan perbandingan dengan penalaran logis.' },
      { subjectId: 'sub-05', subjectName: 'Ilmu Pengetahuan Alam (IPA)', kkm: 75, nilaiTugas: 90, nilaiUts: 88, nilaiUas: 92, nilaiAkhir: 90, predikat: 'A', deskripsi: 'Sangat mahir dalam praktikum mikroskop dan konsep klasifikasi makhluk hidup.' },
      { subjectId: 'sub-06', subjectName: 'Ilmu Pengetahuan Sosial (IPS)', kkm: 75, nilaiTugas: 82, nilaiUts: 80, nilaiUas: 83, nilaiAkhir: 82, predikat: 'B', deskripsi: 'Memahami dinamika interaksi antarruang di wilayah Indonesia dengan baik.' },
      { subjectId: 'sub-07', subjectName: 'Bahasa Inggris', kkm: 75, nilaiTugas: 87, nilaiUts: 85, nilaiUas: 88, nilaiAkhir: 87, predikat: 'A', deskripsi: 'Aktif berkomunikasi dalam daily conversation dan reading comprehension.' },
      { subjectId: 'sub-08', subjectName: 'Pendidikan Jasmani, Olahraga & Kesehatan', kkm: 75, nilaiTugas: 85, nilaiUts: 88, nilaiUas: 85, nilaiAkhir: 86, predikat: 'B', deskripsi: 'Memiliki kebugaran jasmani yang baik dan menguasai teknik bola basket dasar.' },
      { subjectId: 'sub-09', subjectName: 'Seni Budaya & Prakarya', kkm: 75, nilaiTugas: 88, nilaiUts: 84, nilaiUas: 88, nilaiAkhir: 87, predikat: 'A', deskripsi: 'Kreatif dalam memproduksi karya ragam hias dan kerajinan bahan lunak.' }
    ],
    sikapSpiritual: 'Sangat Baik',
    sikapSosial: 'Sangat Baik',
    extracurriculars: [
      { name: 'Pramuka (Wajib)', score: 'A', notes: 'Menjabat sebagai Pratama Regu Rajawali, berdisiplin tinggi' },
      { name: 'Klub Robotika & Coding', score: 'A', notes: 'Mengikuti proyek perakitan sensor Arduino dan logika dasar' }
    ],
    attendanceSummary: { sakit: 1, izin: 0, alpa: 0 },
    teacherNotes: 'Aditya menunjukkan integritas akademik yang sangat membanggakan dan jiwa kepemimpinan positif di kelas 7A.',
    headmasterName: 'Drs. H. Ahmad Fauzi, M.Pd.',
    headmasterNip: '19780512 200212 1 002',
    homeroomTeacherName: 'Siti Aminah, S.Pd., M.Si.',
    homeroomTeacherNip: '19850315 200902 2 004',
    issueDate: '2026-12-19',
    issueCity: 'Kota Bandung'
  },
  'rep-std01-2024-genap': {
    id: 'rep-std01-2024-genap',
    studentId: 'std-01',
    studentName: 'Aditya Pratama Putra',
    studentNisn: '0089234120',
    className: '7A',
    statusSiswa: 'Aktif',
    academicYear: '2024/2025',
    semester: 'Genap',
    scores: [
      { subjectId: 'sub-01', subjectName: 'Pendidikan Agama & Budi Pekerti', kkm: 75, nilaiTugas: 85, nilaiUts: 84, nilaiUas: 88, nilaiAkhir: 86, predikat: 'A', deskripsi: 'Menunjukkan pemahaman akidah yang sangat baik.' },
      { subjectId: 'sub-02', subjectName: 'Pendidikan Pancasila & Kewarganegaraan', kkm: 75, nilaiTugas: 80, nilaiUts: 82, nilaiUas: 84, nilaiAkhir: 82, predikat: 'B', deskripsi: 'Mematuhi tata tertib dan toleran terhadap sesama.' },
      { subjectId: 'sub-03', subjectName: 'Bahasa Indonesia', kkm: 75, nilaiTugas: 85, nilaiUts: 86, nilaiUas: 84, nilaiAkhir: 85, predikat: 'A', deskripsi: 'Terampil menulis teks ulasan cerpen dan karya sastra.' },
      { subjectId: 'sub-04', subjectName: 'Matematika', kkm: 72, nilaiTugas: 80, nilaiUts: 78, nilaiUas: 82, nilaiAkhir: 80, predikat: 'B', deskripsi: 'Mampu menghitung keliling dan luas bidang datar.' },
      { subjectId: 'sub-05', subjectName: 'Ilmu Pengetahuan Alam (IPA)', kkm: 75, nilaiTugas: 88, nilaiUts: 85, nilaiUas: 89, nilaiAkhir: 87, predikat: 'A', deskripsi: 'Menguasai materi ekosistem dan rantai makanan.' }
    ],
    sikapSpiritual: 'Sangat Baik',
    sikapSosial: 'Baik',
    extracurriculars: [{ name: 'Pramuka (Wajib)', score: 'A', notes: 'Aktif dalam kemah kenaikan tingkat' }],
    attendanceSummary: { sakit: 0, izin: 1, alpa: 0 },
    teacherNotes: 'Tingkatkan lagi ketelitian dalam materi hitungan matematika.',
    headmasterName: 'Drs. H. Ahmad Fauzi, M.Pd.',
    headmasterNip: '19780512 200212 1 002',
    homeroomTeacherName: 'Siti Aminah, S.Pd., M.Si.',
    homeroomTeacherNip: '19850315 200902 2 004',
    issueDate: '2025-06-20',
    issueCity: 'Kota Bandung'
  },
  'rep-std02-2025-ganjil': {
    id: 'rep-std02-2025-ganjil',
    studentId: 'std-02',
    studentName: 'Annisa Fitriani Zahra',
    studentNisn: '0089234121',
    className: '7A',
    statusSiswa: 'Aktif',
    academicYear: '2025/2026',
    semester: 'Ganjil',
    scores: [
      { subjectId: 'sub-01', subjectName: 'Pendidikan Agama & Budi Pekerti', kkm: 75, nilaiTugas: 92, nilaiUts: 90, nilaiUas: 95, nilaiAkhir: 93, predikat: 'A', deskripsi: 'Sangat istimewa dalam hafalan juz amma dan adab islami.' },
      { subjectId: 'sub-03', subjectName: 'Bahasa Indonesia', kkm: 75, nilaiTugas: 90, nilaiUts: 88, nilaiUas: 92, nilaiAkhir: 90, predikat: 'A', deskripsi: 'Juara penulisan puisi tingkat sekolah.' },
      { subjectId: 'sub-04', subjectName: 'Matematika', kkm: 72, nilaiTugas: 88, nilaiUts: 85, nilaiUas: 89, nilaiAkhir: 87, predikat: 'A', deskripsi: 'Sangat teliti dalam pengerjaan aljabar.' }
    ],
    sikapSpiritual: 'Sangat Baik',
    sikapSosial: 'Sangat Baik',
    extracurriculars: [{ name: 'PMR (Palang Merah Remaja)', score: 'A', notes: 'Petugas pertolongan pertama teladan' }],
    attendanceSummary: { sakit: 0, izin: 0, alpa: 0 },
    teacherNotes: 'Prestasi gemilang dan kehadiran sempurna (100%). Pertahankan!',
    headmasterName: 'Drs. H. Ahmad Fauzi, M.Pd.',
    headmasterNip: '19780512 200212 1 002',
    homeroomTeacherName: 'Siti Aminah, S.Pd., M.Si.',
    homeroomTeacherNip: '19850315 200902 2 004',
    issueDate: '2026-12-19',
    issueCity: 'Kota Bandung'
  },
  'rep-std07-2025-ganjil': {
    id: 'rep-std07-2025-ganjil',
    studentId: 'std-07',
    studentName: 'Farhan Maulana Hakim',
    studentNisn: '0078129033',
    className: '8A',
    statusSiswa: 'Aktif',
    academicYear: '2025/2026',
    semester: 'Ganjil',
    scores: [
      { subjectId: 'sub-05', subjectName: 'Ilmu Pengetahuan Alam (IPA)', kkm: 75, nilaiTugas: 96, nilaiUts: 94, nilaiUas: 98, nilaiAkhir: 96, predikat: 'A', deskripsi: 'Peraih Medali Emas OSN IPA Tingkat Kota.' },
      { subjectId: 'sub-04', subjectName: 'Matematika', kkm: 72, nilaiTugas: 90, nilaiUts: 88, nilaiUas: 92, nilaiAkhir: 90, predikat: 'A', deskripsi: 'Kemampuan analisis statistik dan geometri tinggi.' }
    ],
    sikapSpiritual: 'Sangat Baik',
    sikapSosial: 'Sangat Baik',
    extracurriculars: [{ name: 'Klub Sains Terpadu', score: 'A', notes: 'Ketua Tim Olimpiade Sains' }],
    attendanceSummary: { sakit: 0, izin: 2, alpa: 0 },
    teacherNotes: 'Kebanggaan sekolah atas torehan prestasi sains tingkat kota.',
    headmasterName: 'Drs. H. Ahmad Fauzi, M.Pd.',
    headmasterNip: '19780512 200212 1 002',
    homeroomTeacherName: 'Dewi Lestari, M.Hum.',
    homeroomTeacherNip: '19881104 201210 2 003',
    issueDate: '2026-12-19',
    issueCity: 'Kota Bandung'
  },
  'rep-std10-2024-genap': {
    id: 'rep-std10-2024-genap',
    studentId: 'std-10',
    studentName: 'Bagas Nugraha Pratama',
    studentNisn: '0055198271',
    className: '9A (Alumni)',
    statusSiswa: 'Lulus',
    academicYear: '2024/2025',
    semester: 'Genap',
    scores: [
      { subjectId: 'sub-01', subjectName: 'Pendidikan Agama & Budi Pekerti', kkm: 75, nilaiTugas: 88, nilaiUts: 86, nilaiUas: 90, nilaiAkhir: 88, predikat: 'A', deskripsi: 'Telah menuntaskan seluruh kompetensi keagamaan dan budi pekerti jenjang SMP.' },
      { subjectId: 'sub-02', subjectName: 'Pendidikan Pancasila & Kewarganegaraan', kkm: 75, nilaiTugas: 85, nilaiUts: 85, nilaiUas: 88, nilaiAkhir: 86, predikat: 'B', deskripsi: 'Memiliki komitmen kebangsaan dan keteladanan organisasi OSIS.' },
      { subjectId: 'sub-03', subjectName: 'Bahasa Indonesia', kkm: 75, nilaiTugas: 88, nilaiUts: 87, nilaiUas: 89, nilaiAkhir: 88, predikat: 'A', deskripsi: 'Tuntas uji literasi dan penulisan karya ilmiah sederhana kelulusan.' },
      { subjectId: 'sub-04', subjectName: 'Matematika', kkm: 72, nilaiTugas: 85, nilaiUts: 82, nilaiUas: 87, nilaiAkhir: 85, predikat: 'B', deskripsi: 'Menguasai persamaan kuadrat dan peluang dengan baik.' },
      { subjectId: 'sub-05', subjectName: 'Ilmu Pengetahuan Alam (IPA)', kkm: 75, nilaiTugas: 89, nilaiUts: 88, nilaiUas: 90, nilaiAkhir: 89, predikat: 'A', deskripsi: 'Sangat baik dalam pengujian listrik statis dan kemagnetan.' },
      { subjectId: 'sub-07', subjectName: 'Bahasa Inggris', kkm: 75, nilaiTugas: 86, nilaiUts: 85, nilaiUas: 87, nilaiAkhir: 86, predikat: 'B', deskripsi: 'Mampu berpidato bahasa Inggris dalam perpisahan kelulusan.' }
    ],
    sikapSpiritual: 'Sangat Baik',
    sikapSosial: 'Sangat Baik',
    extracurriculars: [
      { name: 'OSIS', score: 'A', notes: 'Ketua Umum OSIS Periode 2024/2025, sukses menyelenggarakan Pensi' },
      { name: 'Futsal', score: 'A', notes: 'Kapten Tim Futsal Sekolah' }
    ],
    attendanceSummary: { sakit: 1, izin: 1, alpa: 0 },
    teacherNotes: 'Dinyatakan LULUS dari jenjang SMP dengan predikat AMAT BAIK. Selamat melanjutkan ke jenjang SMA/SMK impian!',
    headmasterName: 'Drs. H. Ahmad Fauzi, M.Pd.',
    headmasterNip: '19780512 200212 1 002',
    homeroomTeacherName: 'Dewi Lestari, M.Hum.',
    homeroomTeacherNip: '19881104 201210 2 003',
    issueDate: '2025-06-15',
    issueCity: 'Kota Bandung'
  },
  'rep-std10-2024-ganjil': {
    id: 'rep-std10-2024-ganjil',
    studentId: 'std-10',
    studentName: 'Bagas Nugraha Pratama',
    studentNisn: '0055198271',
    className: '9A (Alumni)',
    statusSiswa: 'Lulus',
    academicYear: '2024/2025',
    semester: 'Ganjil',
    scores: [
      { subjectId: 'sub-01', subjectName: 'Pendidikan Agama & Budi Pekerti', kkm: 75, nilaiTugas: 86, nilaiUts: 84, nilaiUas: 88, nilaiAkhir: 86, predikat: 'A', deskripsi: 'Konsisten beribadah dan bertutur kata sopan.' },
      { subjectId: 'sub-04', subjectName: 'Matematika', kkm: 72, nilaiTugas: 82, nilaiUts: 80, nilaiUas: 84, nilaiAkhir: 82, predikat: 'B', deskripsi: 'Paham fungsi kuadrat dan transformasi geometri.' }
    ],
    sikapSpiritual: 'Sangat Baik',
    sikapSosial: 'Sangat Baik',
    extracurriculars: [{ name: 'OSIS', score: 'A', notes: 'Terpilih sebagai formatur pengurus OSIS' }],
    attendanceSummary: { sakit: 0, izin: 1, alpa: 0 },
    teacherNotes: 'Memasuki semester akhir kelas 9, pertahankan konsistensi belajarmu.',
    headmasterName: 'Drs. H. Ahmad Fauzi, M.Pd.',
    headmasterNip: '19780512 200212 1 002',
    homeroomTeacherName: 'Dewi Lestari, M.Hum.',
    homeroomTeacherNip: '19881104 201210 2 003',
    issueDate: '2024-12-20',
    issueCity: 'Kota Bandung'
  },
  'rep-std11-2024-genap': {
    id: 'rep-std11-2024-genap',
    studentId: 'std-11',
    studentName: 'Citra Kirana Anindita',
    studentNisn: '0055198272',
    className: '9B (Alumni)',
    statusSiswa: 'Lulus',
    academicYear: '2024/2025',
    semester: 'Genap',
    scores: [
      { subjectId: 'sub-03', subjectName: 'Bahasa Indonesia', kkm: 75, nilaiTugas: 92, nilaiUts: 90, nilaiUas: 94, nilaiAkhir: 92, predikat: 'A', deskripsi: 'Sangat terampil dalam debat bahasa dan retorika sastra.' },
      { subjectId: 'sub-07', subjectName: 'Bahasa Inggris', kkm: 75, nilaiTugas: 95, nilaiUts: 94, nilaiUas: 96, nilaiAkhir: 95, predikat: 'A', deskripsi: 'Skor TOEFL Junior tertinggi se-angkatan.' }
    ],
    sikapSpiritual: 'Sangat Baik',
    sikapSosial: 'Sangat Baik',
    extracurriculars: [{ name: 'English Club', score: 'A', notes: 'Best Speaker English Debate Contest' }],
    attendanceSummary: { sakit: 0, izin: 0, alpa: 0 },
    teacherNotes: 'Dinyatakan LULUS dengan predikat Bintang Prestasi Bahasa. Sukses selalu Citra!',
    headmasterName: 'Drs. H. Ahmad Fauzi, M.Pd.',
    headmasterNip: '19780512 200212 1 002',
    homeroomTeacherName: 'Bambang Pamungkas, S.Pd.',
    homeroomTeacherNip: '19810410 200801 1 015',
    issueDate: '2025-06-15',
    issueCity: 'Kota Bandung'
  },
  'rep-std12-2023-genap': {
    id: 'rep-std12-2023-genap',
    studentId: 'std-12',
    studentName: 'Dimas Arya Kusuma',
    studentNisn: '0044187160',
    className: '9A (Alumni)',
    statusSiswa: 'Lulus',
    academicYear: '2023/2024',
    semester: 'Genap',
    scores: [
      { subjectId: 'sub-08', subjectName: 'Pendidikan Jasmani, Olahraga & Kesehatan', kkm: 75, nilaiTugas: 96, nilaiUts: 95, nilaiUas: 98, nilaiAkhir: 96, predikat: 'A', deskripsi: 'Atlet bulutangkis andalan sekolah, fisik luar biasa.' },
      { subjectId: 'sub-04', subjectName: 'Matematika', kkm: 72, nilaiTugas: 82, nilaiUts: 80, nilaiUas: 84, nilaiAkhir: 82, predikat: 'B', deskripsi: 'Menyelesaikan ujian akhir matematika dengan baik.' }
    ],
    sikapSpiritual: 'Baik',
    sikapSosial: 'Sangat Baik',
    extracurriculars: [{ name: 'Badminton Club', score: 'A', notes: 'Juara 1 O2SN Badminton Tingkat Kota 2024' }],
    attendanceSummary: { sakit: 2, izin: 2, alpa: 0 },
    teacherNotes: 'Dinyatakan LULUS. Diterima di SMA Negeri 3 Bandung melalui jalur prestasi olahraga.',
    headmasterName: 'Drs. H. Ahmad Fauzi, M.Pd.',
    headmasterNip: '19780512 200212 1 002',
    homeroomTeacherName: 'Bayu Wicaksono, S.Pd.',
    homeroomTeacherNip: '19960205 202203 1 009',
    issueDate: '2024-06-15',
    issueCity: 'Kota Bandung'
  }
};

export const INITIAL_REPORT_CARD: ReportCard = INITIAL_REPORT_CARDS['rep-std01-2025-ganjil'];

