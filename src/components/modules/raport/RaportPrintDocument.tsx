import React, { useState } from 'react';
import { ReportCard, Student, SchoolProfile } from '../../../types';
import { Printer, Download, ArrowLeft, School, Award, QrCode, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import { getLogoDataUrlForPdf } from '../../../utils/pdfLogoHelper';

interface RaportPrintDocumentProps {
  report: ReportCard;
  student?: Student;
  schoolProfile: SchoolProfile;
  onBackToDatabase: () => void;
}

export const RaportPrintDocument: React.FC<RaportPrintDocumentProps> = ({
  report,
  student,
  schoolProfile,
  onBackToDatabase
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const studentName = report.studentName || student?.name || 'Peserta Didik';
  const studentNisn = report.studentNisn || student?.nisn || '-';
  const className = report.className || student?.className || '7A';
  const studentStatus = report.statusSiswa || student?.activeStatus || 'Aktif';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Gambar Logo Sekolah pada Kop Surat PDF
      const logoDataUrl = await getLogoDataUrlForPdf(schoolProfile.logoUrl);
      if (logoDataUrl) {
        try {
          doc.addImage(logoDataUrl, 'PNG', 16, 13, 23, 23, undefined, 'FAST');
        } catch (err) {
          console.warn('[PDF Logo] Gagal render logo ke PDF:', err);
        }
      }

      // Header Kop Surat
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
    doc.text((schoolProfile.letterheadProvince || 'PEMERINTAH DAERAH PROVINSI').toUpperCase(), 105, 16, { align: 'center' });
    doc.text((schoolProfile.letterheadAgency || 'DINAS PENDIDIKAN & KEBUDAYAAN').toUpperCase(), 105, 21, { align: 'center' });
    doc.setFontSize(13);
    doc.text((schoolProfile.schoolName || 'SMP NEGERI 1 CENDEKIA MANDIRI').toUpperCase(), 105, 27.5, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const fullAddress = `${schoolProfile.address || ''}, ${schoolProfile.city || ''}, ${schoolProfile.province || ''} | Telp: ${schoolProfile.phone || ''}`;
    doc.text(fullAddress, 105, 32.5, { align: 'center' });
    doc.setFontSize(7);
    doc.text(`NPSN: ${schoolProfile.npsn || '-'} | NSS: ${schoolProfile.nss || '-'} | Akreditasi: ${schoolProfile.accreditation || '-'}`, 105, 36, { align: 'center' });

    // Double line
    doc.setLineWidth(0.7);
    doc.line(15, 38.5, 195, 38.5);
    doc.setLineWidth(0.2);
    doc.line(15, 39.8, 195, 39.8);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPORT)', 105, 47, { align: 'center' });

    // Metadata
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nama Peserta Didik : ${studentName}`, 15, 54);
    doc.text(`NISN / NIK         : ${studentNisn}`, 15, 59);
    doc.text(`Kelas / Rombel     : ${className} (${studentStatus === 'Lulus' ? 'Alumni' : 'Aktif'})`, 15, 64);

    doc.text(`Tahun Pelajaran   : ${report.academicYear}`, 125, 54);
    doc.text(`Semester          : ${report.semester}`, 125, 59);
    doc.text(`Fase Kurikulum    : Fase D (Kurikulum Merdeka)`, 125, 64);

    // Scores summary
    let y = 72;
    doc.setFont('helvetica', 'bold');
    doc.text('Nilai Capaian Pembelajaran:', 15, y);
    y += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    (report.scores || []).slice(0, 10).forEach((s, idx) => {
      doc.text(`${idx + 1}. ${s.subjectName}`, 18, y);
      doc.text(`Nilai: ${s.nilaiAkhir} (${s.predikat})`, 160, y);
      y += 5;
    });

    y += 4;
    doc.text(`Sikap Spiritual: ${report.sikapSpiritual} | Sikap Sosial: ${report.sikapSosial}`, 15, y);
    y += 5;
    doc.text(`Kehadiran: Sakit: ${report.attendanceSummary?.sakit || 0} hari | Izin: ${report.attendanceSummary?.izin || 0} hari | Alpa: ${report.attendanceSummary?.alpa || 0} hari`, 15, y);

    // Signature
    y += 18;
    doc.text(`Mengetahui Orang Tua/Wali`, 20, y);
    doc.text(`Kota Bandung, ${report.issueDate}`, 135, y);
    doc.text(`Wali Kelas,`, 135, y + 5);

    y += 24;
    doc.text(`(........................................)`, 20, y);
    doc.text(report.homeroomTeacherName, 135, y);
    doc.setFontSize(7.5);
    doc.text(`NIP. ${report.homeroomTeacherNip}`, 135, y + 4);

    // Headmaster center
    y += 10;
    doc.text(`Kepala Sekolah,`, 105, y, { align: 'center' });
    y += 20;
    doc.text(report.headmasterName, 105, y, { align: 'center' });
    doc.text(`NIP. ${report.headmasterNip}`, 105, y + 4, { align: 'center' });

    doc.save(`Raport_${studentName.replace(/\s+/g, '_')}_${report.academicYear.replace('/', '-')}_${report.semester}.pdf`);
    } catch (err) {
      console.error('[PDF Export] Gagal menyimpan PDF:', err);
      alert('Terjadi kendala saat menghasilkan dokumen PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          onClick={onBackToDatabase}
          type="button"
          className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Database Raport</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            type="button"
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Cetak Dokumen (Ctrl+P)</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            type="button"
            className="py-2.5 px-4 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            {isDownloadingPdf ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Membuat PDF & Logo...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh PDF Resmi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Official A4 White Paper Container (Matches Print Layout) */}
      <div className="w-full max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 border border-slate-300 font-sans print:p-0 print:border-none print:shadow-none print:rounded-none">
        {/* Kop Surat Sekolah */}
        <div className="relative pb-4 border-b-2 border-black text-center select-none">
          {schoolProfile.logoUrl && (
            <div className="absolute left-0 top-0 w-20 h-20 flex items-center justify-center">
              <img
                src={schoolProfile.logoUrl}
                alt="Logo Sekolah"
                className="w-18 h-18 object-contain"
              />
            </div>
          )}

          <div className="px-16 sm:px-24 space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
              {schoolProfile.letterheadProvince || 'PEMERINTAH DAERAH PROVINSI JAWA BARAT'}
            </h4>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
              {schoolProfile.letterheadAgency || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
            </h3>
            <h2 className="text-base sm:text-xl font-black uppercase text-slate-950 tracking-tight">
              {schoolProfile.schoolName || 'SMP NEGERI 1 CENDEKIA MANDIRI'}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-700">
              {schoolProfile.address}, {schoolProfile.city}, {schoolProfile.province} {schoolProfile.postalCode} | Telp: {schoolProfile.phone}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-600">
              NPSN: {schoolProfile.npsn} | NSS: {schoolProfile.nss} | Akreditasi: {schoolProfile.accreditation} | Website: {schoolProfile.website}
            </p>
          </div>

          <div className="w-full h-0.5 bg-black mt-3" />
          <div className="w-full h-[1px] bg-black mt-0.5" />
        </div>

        {/* Judul Dokumen */}
        <div className="text-center my-5">
          <h1 className="text-sm sm:text-base font-black tracking-wider uppercase underline underline-offset-4">
            LAPORAN HASIL BELAJAR PESERTA DIDIK
          </h1>
          <p className="text-[11px] text-slate-600 mt-1 font-medium">
            Kurikulum Merdeka — Tahun Pelajaran {report.academicYear} (Semester {report.semester})
          </p>
        </div>

        {/* Identitas Peserta Didik */}
        <div className="grid grid-cols-2 gap-4 text-xs p-3.5 bg-slate-50 border border-slate-300 rounded-xl mb-5">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-32 text-slate-600">Nama Peserta Didik</span>
              <span className="font-bold text-slate-950">: {studentName}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-600">NISN / NIK</span>
              <span className="font-mono font-semibold text-slate-900">: {studentNisn}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-600">Kelas / Rombel</span>
              <span className="font-semibold text-slate-900">: {className}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-600">Status Siswa</span>
              <span className="font-bold text-slate-900">
                : {studentStatus === 'Lulus' ? 'LULUS (ALUMNI)' : 'AKTIF BERJALAN'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex">
              <span className="w-32 text-slate-600">Sekolah</span>
              <span className="font-semibold text-slate-900">: {schoolProfile.schoolName}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-600">Tahun Pelajaran</span>
              <span className="font-semibold text-slate-900">: {report.academicYear}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-600">Semester</span>
              <span className="font-semibold text-slate-900">: {report.semester}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-600">Fase Capaian</span>
              <span className="font-semibold text-slate-900">: Fase D (SMP)</span>
            </div>
          </div>
        </div>

        {/* Tabel Nilai Capaian Pembelajaran */}
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-900">
            A. Capaian Kompetensi Akademik (Mata Pelajaran)
          </div>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 text-[11px] font-bold text-slate-800 border-b border-slate-300">
              <tr>
                <th className="py-2 px-2.5 w-10 text-center border-r border-slate-300">No</th>
                <th className="py-2 px-3 border-r border-slate-300">Mata Pelajaran</th>
                <th className="py-2 px-2 w-14 text-center border-r border-slate-300">KKM</th>
                <th className="py-2 px-2 w-16 text-center border-r border-slate-300">Nilai Akhir</th>
                <th className="py-2 px-2 w-14 text-center border-r border-slate-300">Predikat</th>
                <th className="py-2 px-3">Capaian Kompetensi / Catatan Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(report.scores || []).map((score, idx) => (
                <tr key={score.subjectId || idx} className="text-[11px]">
                  <td className="py-2 px-2.5 text-center font-mono border-r border-slate-200">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">
                    {score.subjectName}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-slate-700 border-r border-slate-200">
                    {score.kkm}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-slate-950 border-r border-slate-200">
                    {score.nilaiAkhir}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-slate-900 border-r border-slate-200">
                    {score.predikat}
                  </td>
                  <td className="py-2 px-3 text-[10px] text-slate-700 leading-snug">
                    {score.deskripsi}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sikap & Ekstrakurikuler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-xs">
          {/* Sikap */}
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
            <div className="font-bold text-slate-900 uppercase text-[11px]">
              B. Penilaian Karakter & Budi Pekerti
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-600">Sikap Spiritual:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {report.sikapSpiritual}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">Sikap Sosial:</span>
              <span className="font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                {report.sikapSosial}
              </span>
            </div>
          </div>

          {/* Kehadiran */}
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
            <div className="font-bold text-slate-900 uppercase text-[11px]">
              C. Rekapitulasi Ketidakhadiran
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-600">Sakit:</span>
              <span className="font-bold text-slate-900">{report.attendanceSummary?.sakit || 0} Hari</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-600">Izin:</span>
              <span className="font-bold text-slate-900">{report.attendanceSummary?.izin || 0} Hari</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">Tanpa Keterangan (Alpa):</span>
              <span className="font-bold text-slate-900">{report.attendanceSummary?.alpa || 0} Hari</span>
            </div>
          </div>
        </div>

        {/* Ekstrakurikuler */}
        {report.extracurriculars && report.extracurriculars.length > 0 && (
          <div className="mb-5">
            <div className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-900">
              D. Kegiatan Ekstrakurikuler
            </div>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-[11px] font-bold text-slate-800 border-b border-slate-300">
                <tr>
                  <th className="py-1.5 px-2.5 w-10 text-center border-r border-slate-300">No</th>
                  <th className="py-1.5 px-3 border-r border-slate-300">Nama Kegiatan</th>
                  <th className="py-1.5 px-2 w-20 text-center border-r border-slate-300">Predikat</th>
                  <th className="py-1.5 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {report.extracurriculars.map((ekskul, idx) => (
                  <tr key={idx} className="text-[11px]">
                    <td className="py-1.5 px-2.5 text-center font-mono border-r border-slate-200">{idx + 1}</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900 border-r border-slate-200">{ekskul.name}</td>
                    <td className="py-1.5 px-2 text-center font-bold text-slate-900 border-r border-slate-200">{ekskul.score}</td>
                    <td className="py-1.5 px-3 text-[10px] text-slate-700">{ekskul.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Catatan Wali Kelas */}
        <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl mb-8 text-xs">
          <div className="font-bold text-slate-900 uppercase text-[11px] mb-1">
            E. Catatan Wali Kelas
          </div>
          <p className="italic text-slate-800 leading-relaxed font-serif">
            &ldquo;{report.teacherNotes}&rdquo;
          </p>
        </div>

        {/* Tanda Tangan Resmi (Kiri: Wali Murid, Kanan: Wali Kelas, Bawah: Kepala Sekolah) */}
        <div className="mt-8 text-xs">
          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-semibold text-slate-900">Orang Tua / Wali Murid</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 italic">(Tanda Tangan)</span>
              </div>
              <p className="font-bold text-slate-950 underline underline-offset-4">
                ( .................................................. )
              </p>
            </div>

            <div>
              <p className="text-slate-600">{report.issueCity || 'Kota Bandung'}, {report.issueDate}</p>
              <p className="font-semibold text-slate-900">Guru Wali Kelas,</p>
              <div className="h-16 flex items-center justify-center">
                <div className="border border-emerald-600/50 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-800">
                  TERVERIFIKASI DIGITAL
                </div>
              </div>
              <p className="font-bold text-slate-950 underline underline-offset-4">
                {report.homeroomTeacherName}
              </p>
              <p className="text-[10px] text-slate-600 font-mono">NIP. {report.homeroomTeacherNip}</p>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-slate-600">Mengetahui & Mengesahkan,</p>
            <p className="font-bold text-slate-950">Kepala {schoolProfile.schoolName}</p>
            <div className="h-16 flex items-center justify-center">
              <div className="w-12 h-12 border border-slate-300 rounded-lg p-1 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-700" />
              </div>
            </div>
            <p className="font-bold text-slate-950 underline underline-offset-4">
              {report.headmasterName}
            </p>
            <p className="text-[10px] text-slate-600 font-mono">NIP. {report.headmasterNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
