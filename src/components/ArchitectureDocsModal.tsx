import React, { useState } from 'react';
import { 
  FileCode2, 
  Database, 
  FolderTree, 
  Route, 
  Boxes, 
  X, 
  Check, 
  Copy, 
  Layers,
  Sparkles,
  Link2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'folder' | 'routing' | 'database' | 'component'>('database');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const folderStructureText = `satu-tangan/
├── index.html                   # Entry point HTML dengan font Plus Jakarta Sans & print rules
├── package.json                 # Dependencies (React 19, Vite, Tailwind v4, jsPDF, Lucide)
├── tsconfig.json                # Strict TypeScript configuration
├── metadata.json                # Informasi aplikasi & kapabilitas
├── src/
│   ├── main.tsx                 # React DOM Root
│   ├── App.tsx                  # Root Container & Route Guard (Login vs Dashboard)
│   ├── index.css                # Tailwind CSS + 3D Glassmorphism/Neumorphic & Print CSS
│   ├── types/
│   │   └── index.ts             # Type definitions (Teacher, Student, Attendance, Raport, DynamicEntity)
│   ├── data/
│   │   └── initialData.ts       # Realistic Indonesian school seed dataset
│   ├── context/
│   │   └── AppContext.tsx       # Central state management, local persistence & relational sync
│   ├── components/
│   │   ├── Header.tsx           # Top navigation bar (3-Zone Contract)
│   │   ├── Dashboard3D.tsx      # Flagship 3D Colorful Dashboard with 6 interactive module cards
│   │   ├── ArchitectureDocsModal.tsx # Technical architecture and relational schema viewer
│   │   └── modules/
│   │       ├── FingerprintAttendanceModule.tsx # Modul Presensi Sidik Jari Biometrik (Guru & Siswa)
│   │       ├── TeacherAttendance.tsx      # Modul Presensi Guru Harian
│   │       ├── StudentAttendance.tsx      # Modul Presensi Siswa per Rombel/Kelas
│   │       ├── TeacherDatabase.tsx        # CRUD Master Data Guru & NIP
│   │       ├── StudentDatabase.tsx        # CRUD Master Data Siswa & NISN
│   │       ├── ReportCardModule.tsx       # Input Nilai & Cetak Raport PDF Standar Diknas
│   │       └── DynamicEntitiesModule.tsx  # Pembuat Entitas Khusus Relasional (Pramuka, Tabungan, dll.)
│   └── pages/
│       └── LoginPage.tsx        # 3D Glassmorphic Auth Portal dengan GitHub OAuth & Route Guard`;

  const routingSchemaText = `SKEMA ROUTING & PROTEKSI RUTE (ROUTE GUARD):

1. Public Authentication Route:
   └── /login (Halaman Login Operator & GitHub OAuth)
       ├── Email + Password form login
       ├── GitHub OAuth Authentication simulation (Daftar / Masuk Akun Operator)
       ├── Demo credential 1-click bypass
       └── Guard Check: Jika operator sudah login -> Redirect otomatis ke /dashboard

2. Protected Operator Routes (Hanya untuk operator berstatus terotentikasi):
   ├── /dashboard                -> Dashboard Utama 3D (Desain HP: 1 Baris = 2 Ikon Elegan)
   ├── /absen-sidik-jari         -> Presensi Sidik Jari Biometrik Otomatis (Guru & Siswa)
   ├── /absensi-guru             -> Pencatatan Presensi Guru Harian, Izin, Sakit, Alpa & Filter Tanggal
   ├── /absensi-siswa            -> Presensi Siswa per Kelas (7A, 7B, 8A, 9A) & Bulk Mark All
   ├── /db-guru                  -> Master CRUD Guru, NIP, Mapel, Status Kepegawaian (PNS/PPPK/Honorer)
   ├── /db-siswa                 -> Master CRUD Siswa, NISN, Rombel, Alamat, Kontak Orang Tua
   ├── /cetak-raport             -> Input Nilai Mapel, Sikap, Ekstrakurikuler & Cetak PDF Raport Resmi
   └── /modul-dinamis            -> Pembuat Entitas Khusus Relasional (Pramuka, Tabungan Siswa, dll.)

Catatan Proteksi Rute:
Jika state 'operator === null', komponen Root (App.tsx) akan secara mutlak mengunci antarmuka
dan hanya menampilkan halaman LoginPage. Data operasional sekolah tidak dapat diakses tanpa otentikasi.`;

  const relationalDbSchemaText = `-- ==============================================================================
-- RANCANGAN SKEMA DATABASE RELASIONAL: FITUR SINKRONISASI "LAIN-LAIN" (DYNAMIC ENTITIES)
-- Sistem Sinkronisasi Otomatis Antara Entitas Dinamis Khusus dengan Database Siswa
-- ==============================================================================

-- 1. Tabel Utama: Siswa (Master Peserta Didik)
CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    nisn VARCHAR(10) UNIQUE NOT NULL,
    nik VARCHAR(16),
    name VARCHAR(150) NOT NULL,
    class_name VARCHAR(10) NOT NULL, -- e.g. '7A', '7B', '8A', '9A'
    gender VARCHAR(15) NOT NULL,     -- 'Laki-laki' / 'Perempuan'
    birth_place VARCHAR(50),
    birth_date DATE,
    parent_name VARCHAR(150),
    parent_phone VARCHAR(20),
    address TEXT,
    active_status VARCHAR(20) DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel Master: Dynamic Entities (Kategori Modul yang Dibuat Operator)
-- Contoh: 'Ekstrakurikuler Pramuka', 'Tabungan Siswa Sejahtera', 'Iuran Kas', dll.
CREATE TABLE dynamic_entities (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category ENUM('Keuangan', 'Ekstrakurikuler', 'Prestasi', 'Kedisiplinan', 'Lainnya') NOT NULL,
    icon_type VARCHAR(50) NOT NULL DEFAULT 'compass',
    color_theme VARCHAR(30) NOT NULL DEFAULT 'indigo',
    primary_value_label VARCHAR(100) NOT NULL, -- e.g. 'Nominal Setoran (Rp)' atau 'Tingkatan/Regu'
    primary_value_type ENUM('currency', 'text', 'date', 'badge') NOT NULL DEFAULT 'text',
    secondary_value_label VARCHAR(100),       -- e.g. 'Catatan/Keterangan'
    created_at DATE NOT NULL
);

-- 3. Tabel Transaksi Relasional: Dynamic Entity Records (Pencatatan Berelasi)
-- MENGHUBUNGKAN LANGSUNG SETIAP CATATAN DENGAN SISWA DARI DATABASE SISWA (FK)
CREATE TABLE dynamic_records (
    id VARCHAR(36) PRIMARY KEY,
    entity_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,         -- RELASI FOREIGN KEY KE DATABASE SISWA
    
    -- Snapshot fields untuk performa & denormalized view instan:
    student_name_snapshot VARCHAR(150) NOT NULL,
    student_nisn_snapshot VARCHAR(10) NOT NULL,
    student_class_snapshot VARCHAR(10) NOT NULL,
    
    date DATE NOT NULL,
    primary_value VARCHAR(255) NOT NULL,     -- Menyimpan nominal Rp atau teks peran/jabatan
    secondary_value VARCHAR(255),
    status ENUM('Aktif', 'Lunas', 'Selesai', 'Tertunda') DEFAULT 'Aktif',
    operator_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- KUNCI RELASIONAL & INTEGRITAS DATA (CASCADE UPDATE / RESTRICT DELETE):
    CONSTRAINT fk_record_entity FOREIGN KEY (entity_id) 
        REFERENCES dynamic_entities(id) ON DELETE CASCADE,
    CONSTRAINT fk_record_student FOREIGN KEY (student_id) 
        REFERENCES students(id) ON DELETE CASCADE
);

-- Indeks Relasional untuk Query Cepat per Siswa & per Kegiatan:
CREATE INDEX idx_records_student_id ON dynamic_records(student_id);
CREATE INDEX idx_records_entity_id ON dynamic_records(entity_id);
CREATE INDEX idx_records_date ON dynamic_records(date);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-2 flex items-center justify-center text-white shadow-md">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Rancangan Arsitektur & Skema Database Relasional
                <span className="text-[10px] text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
                  Satu Tangan
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Struktur direktori, proteksi rute, relasi foreign key, dan sinkronisasi otomatis.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/90 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Skema Database Relasional (Lain-lain)</span>
          </button>

          <button
            onClick={() => setActiveTab('folder')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'folder'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Struktur Folder Proyek</span>
          </button>

          <button
            onClick={() => setActiveTab('routing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'routing'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Route className="w-4 h-4" />
            <span>Skema Routing & Route Guard</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs text-slate-300 relative">
          
          {/* Quick Copy Button */}
          <div className="absolute top-6 right-6">
            <button
              onClick={() => {
                if (activeTab === 'database') copyToClipboard(relationalDbSchemaText);
                else if (activeTab === 'folder') copyToClipboard(folderStructureText);
                else copyToClipboard(routingSchemaText);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 text-[11px] font-sans font-medium transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Skema'}</span>
            </button>
          </div>

          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 font-sans text-xs text-cyan-200">
                <strong>Prinsip Sinkronisasi:</strong> Relasi dibuat melalui foreign key <code>student_id</code> pada tabel <code>dynamic_records</code> yang mereferensikan <code>students(id)</code>. Ketika operator memilih nama siswa pada formulir pencatatan kegiatan/tabungan, sistem otomatis membaca NISN dan Kelas secara relasional tanpa resiko duplikasi atau inkonsistensi data.
              </div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed text-cyan-300">
                {relationalDbSchemaText}
              </pre>
            </div>
          )}

          {activeTab === 'folder' && (
            <pre className="overflow-x-auto text-[11px] leading-relaxed text-indigo-300">
              {folderStructureText}
            </pre>
          )}

          {activeTab === 'routing' && (
            <pre className="overflow-x-auto text-[11px] leading-relaxed text-purple-300">
              {routingSchemaText}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Dokumentasi Arsitektur Sistem Terintegrasi Satu Tangan</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
