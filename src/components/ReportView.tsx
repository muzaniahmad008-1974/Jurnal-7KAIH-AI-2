// ============================================================================
// SI-7KAIH AI - Printable Monthly Report Component
// Official print layout, clear numerator/denominator ratios, signature spaces,
// AI disclaimer label
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DailyJournal,
  Badge,
  StudentMonthlyReflection,
  ParentMonthlyReflection,
} from '../../packages/types/src/index';
import { HABIT_LIST } from '../lib/constants';
import { calculateHabitualThreshold } from '../../packages/analytics/src/index';
import { Printer, X, ShieldCheck, Sliders, RefreshCw, CheckCircle2, Calendar } from 'lucide-react';
import { getStoredRombels, isSameClass, isSameSchool, Rombel } from '../lib/studentData';

export const formatAcademicYearDisplay = (raw?: string): string => {
  if (!raw || !raw.trim()) return '2026/2027 - Semester Ganjil';
  const trimmed = raw.trim();
  if (trimmed.toLowerCase().includes('semester')) {
    return trimmed;
  }
  if (/ganjil/i.test(trimmed)) {
    const yearPart = trimmed.replace(/ganjil/i, '').trim();
    return `${yearPart} - Semester Ganjil`;
  }
  if (/genap/i.test(trimmed)) {
    const yearPart = trimmed.replace(/genap/i, '').trim();
    return `${yearPart} - Semester Genap`;
  }
  return `${trimmed} - Semester Ganjil`;
};

interface ReportViewProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  className: string;
  schoolName: string;
  nisn: string;
  monthName: string;
  year: number;
  journals: DailyJournal[];
  studentReflection: StudentMonthlyReflection;
  parentReflection: ParentMonthlyReflection;
  badges: Badge[];
  academicYear?: string;
}

export const ReportView: React.FC<ReportViewProps> = ({
  isOpen,
  onClose,
  studentName,
  className,
  schoolName,
  nisn,
  monthName,
  year,
  journals,
  studentReflection,
  parentReflection,
  badges,
  academicYear: propAcademicYear,
}) => {
  if (!isOpen) return null;

  // Sinkronisasi data Tahun Pelajaran dari Master Rombel & Satuan Pendidikan
  const syncAcademicYearFromData = useCallback(() => {
    const rombels = getStoredRombels();

    // 1. Prioritaskan pencocokan dengan rombel siswa aktif
    let matchedRombel: Rombel | undefined;
    if (className) {
      matchedRombel = rombels.find(
        (r) =>
          (!schoolName || !r.schoolName || isSameSchool(r.schoolName, schoolName)) &&
          isSameClass(r.name, className)
      );
      if (!matchedRombel) {
        matchedRombel = rombels.find((r) => isSameClass(r.name, className));
      }
    }

    // 2. Jika tidak ada kelas spesifik, cari rombel aktif di sekolah yang sama
    if (!matchedRombel && schoolName) {
      matchedRombel = rombels.find(
        (r) => isSameSchool(r.schoolName, schoolName) && r.academicYear
      );
    }

    // 3. Fallback ke rombel aktif pertama yang memiliki data tahun ajaran
    if (!matchedRombel) {
      matchedRombel = rombels.find((r) => r.academicYear);
    }

    if (matchedRombel && matchedRombel.academicYear) {
      const formatted = formatAcademicYearDisplay(matchedRombel.academicYear);
      return {
        year: formatted,
        source: `Rombel ${matchedRombel.name} (${matchedRombel.academicYear})`,
      };
    }

    // 4. Periksa apakah tersimpan preferensi tahun ajaran di localStorage
    const savedCustom =
      localStorage.getItem('si7kaih_print_academic_year') ||
      localStorage.getItem('si7kaih_academic_year');
    if (savedCustom) {
      return {
        year: formatAcademicYearDisplay(savedCustom),
        source: 'Pengaturan Cetak Tersimpan',
      };
    }

    return {
      year: '2026/2027 - Semester Ganjil',
      source: 'Data Bawaan Tahun Berjalan',
    };
  }, [className, schoolName]);

  const [selectedYear, setSelectedYear] = useState<string>(() => {
    if (propAcademicYear) return formatAcademicYearDisplay(propAcademicYear);
    const initialSync = syncAcademicYearFromData();
    return initialSync.year;
  });
  const [syncSource, setSyncSource] = useState<string>(() => {
    if (propAcademicYear) return 'Properti Dokumen';
    const initialSync = syncAcademicYearFromData();
    return initialSync.source;
  });
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customYearInput, setCustomYearInput] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Daftar opsi Tahun Pelajaran yang diambil secara dinamis dari update data rombels
  const academicYearOptions = useMemo(() => {
    const rombels = getStoredRombels();
    const yearsSet = new Set<string>();

    // Tambahkan tahun dari data rombel terupdate
    rombels.forEach((r) => {
      if (r.academicYear && r.academicYear.trim()) {
        yearsSet.add(formatAcademicYearDisplay(r.academicYear));
      }
    });

    // Tambahkan opsi standar kurikulum & tahun pelajaran berjalan
    yearsSet.add('2026/2027 - Semester Ganjil');
    yearsSet.add('2026/2027 - Semester Genap');
    yearsSet.add('2025/2026 - Semester Genap');
    yearsSet.add('2025/2026 - Semester Ganjil');

    return Array.from(yearsSet);
  }, [isOpen, isSyncing]);

  // Sinkronisasi otomatis saat modal dibuka atau kelas/sekolah berubah
  useEffect(() => {
    if (!isOpen) return;
    if (propAcademicYear) {
      setSelectedYear(formatAcademicYearDisplay(propAcademicYear));
      setSyncSource('Properti Dokumen');
      return;
    }
    const synced = syncAcademicYearFromData();
    setSelectedYear(synced.year);
    setSyncSource(synced.source);
    setIsCustomMode(false);
  }, [isOpen, syncAcademicYearFromData, propAcademicYear]);

  // Listener event pembaruan data master rombel secara real-time
  useEffect(() => {
    const handleRombelUpdate = () => {
      if (isCustomMode) return;
      const synced = syncAcademicYearFromData();
      setSelectedYear(synced.year);
      setSyncSource(synced.source);
    };

    window.addEventListener('si7kaih_rombels_updated', handleRombelUpdate);
    window.addEventListener('si7kaih_academic_year_updated', handleRombelUpdate);
    window.addEventListener('storage', handleRombelUpdate);

    return () => {
      window.removeEventListener('si7kaih_rombels_updated', handleRombelUpdate);
      window.removeEventListener('si7kaih_academic_year_updated', handleRombelUpdate);
      window.removeEventListener('storage', handleRombelUpdate);
    };
  }, [syncAcademicYearFromData, isCustomMode]);

  const handleManualSync = () => {
    setIsSyncing(true);
    const synced = syncAcademicYearFromData();
    setSelectedYear(synced.year);
    setSyncSource(synced.source);
    setIsCustomMode(false);
    try {
      localStorage.setItem('si7kaih_print_academic_year', synced.year);
    } catch (_e) {}
    setTimeout(() => setIsSyncing(false), 450);
  };

  const handleSelectYearChange = (val: string) => {
    if (val === 'CUSTOM') {
      setIsCustomMode(true);
      setCustomYearInput(selectedYear);
      return;
    }
    setIsCustomMode(false);
    setSelectedYear(val);
    setSyncSource('Pilihan Pengaturan Cetak');
    try {
      localStorage.setItem('si7kaih_print_academic_year', val);
      window.dispatchEvent(new CustomEvent('si7kaih_academic_year_updated', { detail: val }));
    } catch (_e) {}
  };

  const handleCustomYearChange = (val: string) => {
    setCustomYearInput(val);
    setSelectedYear(val);
    setSyncSource('Kustom Manual');
    try {
      localStorage.setItem('si7kaih_print_academic_year', val);
    } catch (_e) {}
  };

  const displayAcademicYear = selectedYear || '2026/2027 - Semester Ganjil';

  const daysInMonth = 31;
  const targetThreshold = calculateHabitualThreshold(daysInMonth); // 21
  const recordedDays = journals.length;
  const completenessRate = Math.round((recordedDays / daysInMonth) * 100);

  const habitReportData = HABIT_LIST.map((h) => {
    const completedDays = journals.filter((j) => j.entries[h.code]?.completed).length;
    const isHabitual = completedDays >= targetThreshold;
    const consistencyRate = recordedDays > 0 ? Math.round((completedDays / recordedDays) * 100) : 0;
    return {
      code: h.code,
      name: h.name,
      completedDays,
      consistencyRate,
      isHabitual,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[96vh] flex flex-col">
        {/* Modal Toolbar (hidden on print) */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Dokumen Resmi Portofolio Bulanan 7KAIH
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                ● Status: Sah & Terverifikasi
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Format cetak resmi Portofolio Karakter berstandar Disdikbud Kabupaten Tanah Laut untuk orang tua & dewan guru.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF Resmi</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pengaturan Cetak Dokumen Resmi (hidden on print) */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Sliders className="w-4 h-4 text-[#0753A5]" />
              <span>Pengaturan Cetak Dokumen Resmi:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-600 font-medium text-xs">
                Tahun Pelajaran:
              </span>
              <select
                value={isCustomMode ? 'CUSTOM' : selectedYear}
                onChange={(e) => handleSelectYearChange(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-blue-200 bg-white font-bold text-slate-800 text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/30 cursor-pointer"
                title="Pilih Tahun Pelajaran yang disinkronkan dengan update data rombel"
              >
                {academicYearOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                <option value="CUSTOM">Input Manual / Kustom...</option>
              </select>

              {isCustomMode && (
                <input
                  type="text"
                  value={customYearInput}
                  onChange={(e) => handleCustomYearChange(e.target.value)}
                  placeholder="Contoh: 2026/2027 - Semester Ganjil"
                  className="px-2.5 py-1.5 rounded-xl border border-blue-200 bg-white text-xs font-semibold text-slate-800 w-52 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/30"
                />
              )}

              <button
                type="button"
                onClick={handleManualSync}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#0753A5] font-bold border border-blue-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Singkronkan ulang info Tahun Pelajaran dari pembaruan data master rombel dan sekolah"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#0753A5] ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sinkronkan Data Rombel</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Disinkronkan: <strong>{syncSource}</strong></span>
            </span>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-6 text-slate-900 print:p-0 print:space-y-4">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-800">
              PEMERINTAH KABUPATEN TANAH LAUT
            </h2>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
              DISDIKBUD KABUPATEN TANAH LAUT
            </h3>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 pt-0.5">
              {schoolName ? schoolName.toUpperCase() : 'SATUAN PENDIDIKAN'}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              {schoolName ? 'Portofolio Resmi 7 Kebiasaan Anak Indonesia Hebat' : 'Laporan Resmi Pembiasaan Mandiri'}
            </p>
            <div className="pt-2 text-sm font-extrabold uppercase tracking-wide text-[#0753A5]">
              DOKUMEN RESMI PORTOFOLIO BULANAN 7 KEBIASAAN ANAK INDONESIA HEBAT (SI-7KAIH AI)
            </div>
            <div className="text-xs text-slate-600">
              Periode: <strong>{monthName} {year}</strong>
            </div>
          </div>

          {/* Student & Class Identity Table */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500">Nama Siswa:</span>
              <strong className="block text-slate-900 text-sm mt-0.5">{studentName || '-'}</strong>
              <span className="text-slate-500 mt-2 block">Nomor Induk Siswa Nasional (NISN):</span>
              <strong className="block text-slate-900 font-mono mt-0.5">{nisn || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-500">Rombel / Fase:</span>
              <strong className="block text-slate-900 text-sm mt-0.5">{className ? (className.includes('Fase') ? className : `${className} (Fase D)`) : '-'}</strong>
              <span className="text-slate-500 mt-2 block">Tahun Pelajaran:</span>
              <strong className="block text-slate-900 mt-0.5">{displayAcademicYear}</strong>
            </div>
          </div>

          {/* Data Completeness & Overall Metric Header */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500">Kelengkapan Jurnal:</span>
              <div className="text-base font-black text-[#0753A5] mt-1">
                {completenessRate}% ({recordedDays}/{daysInMonth} Hari)
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500">Kriteria Pembiasaan:</span>
              <div className="text-base font-black text-slate-900 mt-1">
                Minimal {targetThreshold} Hari (2/3 × {daysInMonth})
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-slate-500">Lencana Diraih:</span>
              <div className="text-base font-black text-amber-600 mt-1">
                {badges.filter((b) => b.earnedAt).length > 0
                  ? `${badges.filter((b) => b.earnedAt).length} Lencana Karakter`
                  : '0 Lencana (Default Terkunci)'}
              </div>
            </div>
          </div>

          {/* Table of 7 Habits */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              I. Ringkasan Capaian 7 Kebiasaan Anak
            </h4>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Dimensi 7 Kebiasaan</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">Hari Terlaksana</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">Konsistensi</th>
                  <th className="py-2.5 px-3 text-center">Status Pembiasaan*</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {habitReportData.map((h, i) => (
                  <tr key={h.code}>
                    <td className="py-2 px-3 border-r border-slate-300 text-center">{i + 1}</td>
                    <td className="py-2 px-3 border-r border-slate-300 font-semibold">{h.name}</td>
                    <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">
                      {h.completedDays} / {targetThreshold} hari target
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">
                      {h.consistencyRate}%
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          h.isHabitual
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {h.isHabitual ? 'Sudah Terbiasa' : 'Sedang Berproses'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-slate-500 italic">
              *Status &quot;Sudah Terbiasa&quot; dicapai bila terlaksana minimal {targetThreshold} hari dari {daysInMonth} hari bulan berjalan.
            </p>
          </div>

          {/* Student & Parent Reflections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                II. Refleksi Mandiri Siswa
              </h4>
              <p>
                <strong>Kebiasaan Paling Menantang:</strong> {studentReflection?.hardestHabit ? (HABIT_LIST.find((h) => h.code === studentReflection.hardestHabit)?.name || studentReflection.hardestHabit) : '-'}
              </p>
              <p>
                <strong>Akar Penyebab:</strong> {studentReflection?.rootCause || '-'}
              </p>
              <p>
                <strong>Rencana Tindak Lanjut:</strong> {studentReflection?.actionPlan || '-'}
              </p>
              <p>
                <strong>Target Bulan Depan:</strong> {studentReflection?.nextMonthTarget || '-'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                III. Pengamatan & Refleksi Orang Tua
              </h4>
              <p>
                <strong>Perubahan Tampak di Rumah:</strong> {parentReflection?.observedChange || '-'}
              </p>
              <p>
                <strong>Tantangan di Rumah:</strong> {parentReflection?.difficulty || '-'}
              </p>
              <p>
                <strong>Dukungan Keluarga:</strong> {parentReflection?.familySupport || '-'}
              </p>
              <p>
                <strong>Rencana Bulan Depan:</strong> {parentReflection?.nextMonthSupport || '-'}
              </p>
            </div>
          </div>

          {/* AI Pedagogical Insight Note with Clear Disclaimer */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
              <span>💡 Catatan Saran Pendampingan Berbasis AI (Bahan Diskusi Kolaboratif):</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              &quot;Ananda menunjukkan konsistensi luar biasa pada kebiasaan bangun pagi, ibadah, dan sarapan bergizi. Untuk kebiasaan istirahat malam, disarankan menyepakati batasan gawai 30 menit sebelum tidur dan merutinkan kegiatan membaca santai di kamar.&quot;
            </p>
            <p className="text-[10px] text-slate-400 italic">
              Disclaimer: Analisis AI ini bersifat deskriptif edukatif sebagai pemantik diskusi pendampingan, bukan vonis moral atau penentu kelulusan siswa.
            </p>
          </div>

          {/* Formal Signatures Section */}
          <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs">
            <div className="space-y-16">
              <p>Mengetahui,<br /><strong>Orang Tua / Wali Siswa</strong></p>
              <p className="font-bold underline decoration-dotted">( ........................................ )</p>
            </div>
            <div className="space-y-16">
              <p>Tanggal: .........................<br /><strong>Guru Wali Kelas</strong></p>
              <p className="font-bold underline decoration-dotted">( ........................................ )<br /><span className="font-normal text-[10px]">NIP. ........................................</span></p>
            </div>
            <div className="space-y-16">
              <p>Menyetujui,<br /><strong>Kepala {schoolName || 'Satuan Pendidikan'}</strong></p>
              <p className="font-bold underline decoration-dotted">( ........................................ )<br /><span className="font-normal text-[10px]">NIP. ........................................</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
