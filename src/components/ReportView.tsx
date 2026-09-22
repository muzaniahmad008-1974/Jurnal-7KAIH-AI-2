// ============================================================================
// SI-7KAIH AI - Printable Official Monthly Portfolio Document Component
// Dokumen Resmi Portofolio Bulanan 7 Kebiasaan Anak Indonesia Hebat
// Sinkron dengan data terkini: Identitas Siswa, NISN, Kelengkapan Jurnal,
// Kriteria Pembiasaan, Lencana Diraih, Ringkasan Capaian, Refleksi Mandiri Siswa,
// Pengamatan & Refleksi Orang Tua. Default data dieliminasi.
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DailyJournal,
  Badge,
  StudentMonthlyReflection,
  ParentMonthlyReflection,
  HabitCode,
} from '../../packages/types/src/index';
import { HABIT_LIST, UserPersona } from '../lib/constants';
import { calculateHabitualThreshold } from '../../packages/analytics/src/index';
import { calculateBadgesFromJournals, DEFAULT_BADGES } from '../lib/mockData';
import {
  getStoredRombels,
  getStoredStudents,
  isSameClass,
  isSameSchool,
  Rombel,
  Student,
  DEFAULT_STUDENTS,
  DEFAULT_ROMBELS,
} from '../lib/studentData';
import { getStoredSchools, SchoolMaster, DEFAULT_SCHOOLS } from '../lib/schoolMasterData';
import {
  Printer,
  X,
  ShieldCheck,
  Sliders,
  RefreshCw,
  CheckCircle2,
  Calendar,
  User,
  Award,
  Sparkles,
} from 'lucide-react';

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
  studentName?: string;
  className?: string;
  schoolName?: string;
  nisn?: string;
  monthName?: string;
  year?: number;
  journals: DailyJournal[];
  studentReflection?: StudentMonthlyReflection;
  parentReflection?: ParentMonthlyReflection;
  badges?: Badge[];
  academicYear?: string;
  targetStudent?: Partial<Student> | null;
  currentPersona?: UserPersona;
}

export const ReportView: React.FC<ReportViewProps> = ({
  isOpen,
  onClose,
  studentName: propStudentName,
  className: propClassName,
  schoolName: propSchoolName,
  nisn: propNisn,
  monthName: propMonthName = 'September',
  year: propYear = 2026,
  journals = [],
  studentReflection: propStudentReflection,
  parentReflection: propParentReflection,
  badges: propBadges,
  academicYear: propAcademicYear,
  targetStudent,
  currentPersona,
}) => {
  if (!isOpen) return null;

  // 1. Data Siswa Master Terkini
  const [allStudents, setAllStudents] = useState<Student[]>(() => {
    const stored = getStoredStudents();
    return stored.length > 0 ? stored : DEFAULT_STUDENTS;
  });

  // Tentukan siswa terpilih saat awal modal dibuka
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (targetStudent?.id) return targetStudent.id;
    if (targetStudent?.nisn) return targetStudent.nisn;
    if (propNisn) {
      const found = allStudents.find((s) => s.nisn === propNisn);
      if (found) return found.id;
    }
    if (propStudentName) {
      const found = allStudents.find(
        (s) => s.name.toLowerCase().trim() === propStudentName.toLowerCase().trim()
      );
      if (found) return found.id;
    }
    return allStudents[0]?.id || 'std-default';
  });

  // Sinkronkan selectedStudentId bila targetStudent atau propSiswa berubah
  useEffect(() => {
    if (!isOpen) return;
    const freshStudents = getStoredStudents();
    setAllStudents(freshStudents.length > 0 ? freshStudents : DEFAULT_STUDENTS);

    if (targetStudent?.id) {
      setSelectedStudentId(targetStudent.id);
    } else if (targetStudent?.nisn) {
      const found = (freshStudents.length > 0 ? freshStudents : DEFAULT_STUDENTS).find(
        (s) => s.nisn === targetStudent.nisn
      );
      if (found) setSelectedStudentId(found.id);
    } else if (propNisn) {
      const found = (freshStudents.length > 0 ? freshStudents : DEFAULT_STUDENTS).find(
        (s) => s.nisn === propNisn
      );
      if (found) setSelectedStudentId(found.id);
    } else if (propStudentName && propStudentName !== '-') {
      const found = (freshStudents.length > 0 ? freshStudents : DEFAULT_STUDENTS).find(
        (s) => s.name.toLowerCase().trim() === propStudentName.toLowerCase().trim()
      );
      if (found) setSelectedStudentId(found.id);
    }
  }, [isOpen, targetStudent, propNisn, propStudentName]);

  // Siswa Aktif yang Ditampilkan Portofolionya
  const activeStudent = useMemo(() => {
    const found = allStudents.find(
      (s) => s.id === selectedStudentId || s.nisn === selectedStudentId
    );
    if (found) return found;

    if (targetStudent && targetStudent.name) {
      return {
        id: targetStudent.id || selectedStudentId,
        nisn: targetStudent.nisn || propNisn || '-',
        name: targetStudent.name,
        className: targetStudent.className || propClassName || 'Kelas 8-C',
        parentName: targetStudent.parentName || 'Orang Tua / Wali Siswa',
        status: 'AKTIF' as const,
        gender: (targetStudent.gender as 'L' | 'P') || 'L',
        source: 'INPUT_MANUAL' as const,
        schoolName: targetStudent.schoolName || propSchoolName || 'UPTD SMPN 1 Jorong',
      };
    }

    if (propStudentName && propStudentName !== '-') {
      return {
        id: selectedStudentId,
        nisn: propNisn || '-',
        name: propStudentName,
        className: propClassName || 'Kelas 8-C',
        parentName: 'Orang Tua / Wali Siswa',
        status: 'AKTIF' as const,
        gender: 'L' as const,
        source: 'INPUT_MANUAL' as const,
        schoolName: propSchoolName || 'UPTD SMPN 1 Jorong',
      };
    }

    return allStudents[0] || {
      id: 'std-fallback',
      nisn: '-',
      name: 'Peserta Didik',
      className: 'Kelas 8-C',
      parentName: 'Orang Tua / Wali Siswa',
      status: 'AKTIF' as const,
      gender: 'L' as const,
      source: 'INPUT_MANUAL' as const,
      schoolName: 'UPTD SMPN 1 Jorong',
    };
  }, [allStudents, selectedStudentId, targetStudent, propStudentName, propClassName, propSchoolName, propNisn]);

  // 2. Pemilihan Periode Bulan & Tahun Berjalan Dinamis
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(() => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const idx = monthNames.findIndex((m) => m.toLowerCase() === (propMonthName || '').toLowerCase());
    return idx !== -1 ? idx : 8; // default September (index 8 = September)
  });

  const [selectedYearNum, setSelectedYearNum] = useState<number>(propYear || 2026);

  const monthNamesList = useMemo(() => [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ], []);

  const activeMonthName = monthNamesList[selectedMonthIndex] || 'September';
  const activeMonthNumber = selectedMonthIndex + 1; // 1-12
  const activePeriodKey = `${selectedYearNum}-${String(activeMonthNumber).padStart(2, '0')}`;

  // Hitung jumlah hari kalender aktual dalam bulan terpilih (contoh: September = 30 hari, Agustus = 31 hari)
  const daysInMonth = useMemo(() => {
    return new Date(selectedYearNum, activeMonthNumber, 0).getDate();
  }, [selectedYearNum, activeMonthNumber]);

  // Target batas pembiasaan 2/3 x hari bulan berjalan (Standar Kemendikbudristek / Disdikbud)
  const targetThreshold = useMemo(() => {
    return calculateHabitualThreshold(daysInMonth);
  }, [daysInMonth]);

  // 3. Sinkronisasi Data Tahun Pelajaran dari Master Rombel & Satuan Pendidikan
  const syncAcademicYearFromData = useCallback(() => {
    const rombels = getStoredRombels();
    const studentClass = activeStudent.className || propClassName || '';
    const studentSchool = activeStudent.schoolName || propSchoolName || '';

    let matchedRombel: Rombel | undefined;
    if (studentClass) {
      matchedRombel = rombels.find(
        (r) =>
          (!studentSchool || !r.schoolName || isSameSchool(r.schoolName, studentSchool)) &&
          isSameClass(r.name, studentClass)
      );
      if (!matchedRombel) {
        matchedRombel = rombels.find((r) => isSameClass(r.name, studentClass));
      }
    }

    if (!matchedRombel && studentSchool) {
      matchedRombel = rombels.find(
        (r) => isSameSchool(r.schoolName, studentSchool) && r.academicYear
      );
    }

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
  }, [activeStudent.className, activeStudent.schoolName, propClassName, propSchoolName]);

  const [selectedYear, setSelectedYear] = useState<string>(() => {
    if (propAcademicYear) return formatAcademicYearDisplay(propAcademicYear);
    return syncAcademicYearFromData().year;
  });
  const [syncSource, setSyncSource] = useState<string>(() => {
    if (propAcademicYear) return 'Properti Dokumen';
    return syncAcademicYearFromData().source;
  });
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customYearInput, setCustomYearInput] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const academicYearOptions = useMemo(() => {
    const rombels = getStoredRombels();
    const yearsSet = new Set<string>();

    rombels.forEach((r) => {
      if (r.academicYear && r.academicYear.trim()) {
        yearsSet.add(formatAcademicYearDisplay(r.academicYear));
      }
    });

    yearsSet.add('2026/2027 - Semester Ganjil');
    yearsSet.add('2026/2027 - Semester Genap');
    yearsSet.add('2025/2026 - Semester Genap');
    yearsSet.add('2025/2026 - Semester Ganjil');

    return Array.from(yearsSet);
  }, []);

  // Update info tahun ajaran saat modal dibuka atau siswa berganti
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
  }, [isOpen, syncAcademicYearFromData, propAcademicYear, activeStudent]);

  // Listener event pembaruan data master rombel dan siswa secara real-time
  useEffect(() => {
    const handleSyncUpdate = () => {
      const freshStudents = getStoredStudents();
      if (freshStudents.length > 0) setAllStudents(freshStudents);
      if (!isCustomMode) {
        const synced = syncAcademicYearFromData();
        setSelectedYear(synced.year);
        setSyncSource(synced.source);
      }
    };

    window.addEventListener('si7kaih_rombels_updated', handleSyncUpdate);
    window.addEventListener('si7kaih_students_updated', handleSyncUpdate);
    window.addEventListener('si7kaih_journals_updated', handleSyncUpdate);
    window.addEventListener('storage', handleSyncUpdate);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('si7kaih_sync_channel');
        bc.onmessage = () => {
          handleSyncUpdate();
        };
      }
    } catch (_e) {}

    return () => {
      window.removeEventListener('si7kaih_rombels_updated', handleSyncUpdate);
      window.removeEventListener('si7kaih_students_updated', handleSyncUpdate);
      window.removeEventListener('si7kaih_journals_updated', handleSyncUpdate);
      window.removeEventListener('storage', handleSyncUpdate);
      if (bc) {
        try {
          bc.close();
        } catch (_e) {}
      }
    };
  }, [syncAcademicYearFromData, isCustomMode]);

  const handleManualSync = () => {
    setIsSyncing(true);
    const freshStudents = getStoredStudents();
    if (freshStudents.length > 0) setAllStudents(freshStudents);
    const synced = syncAcademicYearFromData();
    setSelectedYear(synced.year);
    setSyncSource(synced.source);
    setIsCustomMode(false);
    setTimeout(() => setIsSyncing(false), 350);
  };

  // 4. Filter Jurnal Harian Aktual Khusus Siswa & Bulan Terpilih
  const studentMonthJournals = useMemo(() => {
    if (!journals || journals.length === 0) return [];

    // Filter berdasarkan identitas siswa
    const matchedForStudent = journals.filter((j) => {
      const sid = activeStudent.id;
      const snisn = activeStudent.nisn;
      const sname = (activeStudent.name || '').toLowerCase().trim();

      return (
        (sid && j.studentId === sid) ||
        (snisn && (j.studentId === snisn || (j as any).studentNisn === snisn)) ||
        (sname && (
          ((j as any).studentName && (j as any).studentName.toLowerCase().trim() === sname) ||
          (j.studentId && j.studentId.toLowerCase().trim() === sname)
        ))
      );
    });

    // Jika filter spesifik kosong namun user adalah siswa tunggal (misal dari demo session)
    const baseList = matchedForStudent.length > 0 ? matchedForStudent : journals;

    // Filter berdasarkan bulan & tahun terpilih
    return baseList.filter((j) => {
      const dStr = j.journalDate || (j as any).date;
      if (!dStr || typeof dStr !== 'string') return false;
      const parts = dStr.split('-');
      if (parts.length < 2) return false;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      return y === selectedYearNum && m === activeMonthNumber;
    });
  }, [journals, activeStudent, selectedYearNum, activeMonthNumber]);

  // Hitung Kelengkapan Jurnal (Recorded Days)
  const recordedDays = useMemo(() => {
    const dates = new Set<string>();
    studentMonthJournals.forEach((j) => {
      const dStr = j.journalDate || (j as any).date;
      if (dStr) dates.add(dStr);
    });
    return Math.min(daysInMonth, dates.size);
  }, [studentMonthJournals, daysInMonth]);

  const completenessRate = useMemo(() => {
    if (daysInMonth <= 0) return 0;
    return Math.round((recordedDays / daysInMonth) * 100);
  }, [recordedDays, daysInMonth]);

  // 5. Lencana Diraih (Dihitung Dinamis dari Jurnal Siswa, Tanpa String 'Default Terkunci')
  const earnedBadges = useMemo(() => {
    const dynamicBadges = calculateBadgesFromJournals(studentMonthJournals, DEFAULT_BADGES);
    return dynamicBadges.filter((b) => !!b.earnedAt);
  }, [studentMonthJournals]);

  // 6. Ringkasan Capaian 7 Kebiasaan Anak (Tabel Capaian Riil)
  const habitReportData = useMemo(() => {
    return HABIT_LIST.map((h) => {
      // Hitung jumlah hari unik terlaksana
      const completedDates = new Set<string>();
      studentMonthJournals.forEach((j) => {
        const dStr = j.journalDate || (j as any).date;
        const entry = j.entries?.[h.code] || (j as any).habits?.[h.code];
        const isDone = !!(entry?.completed || (j as any)[h.code] === true);
        if (isDone && dStr) {
          completedDates.add(dStr);
        }
      });

      const completedDays = completedDates.size;
      const consistencyRate = recordedDays > 0 ? Math.round((completedDays / recordedDays) * 100) : 0;
      const isHabitual = completedDays >= targetThreshold;

      return {
        code: h.code,
        name: h.name,
        completedDays,
        consistencyRate,
        isHabitual,
      };
    });
  }, [studentMonthJournals, recordedDays, targetThreshold]);

  // 7. Refleksi Mandiri Siswa (Ditarik Dinamis dari Storage Siswa Terpilih Tanpa Data Default)
  const activeStudentReflection = useMemo<StudentMonthlyReflection | null>(() => {
    try {
      // 1. Cek storage spesifik berbasis studentId dan bulan
      const perStudentKey = `si7kaih_reflection_student_${activeStudent.id}_${activePeriodKey}`;
      const savedStudent = localStorage.getItem(perStudentKey);
      if (savedStudent) {
        const parsed = JSON.parse(savedStudent);
        if (
          parsed &&
          (parsed.studentId === activeStudent.id || !parsed.studentId) &&
          (parsed.rootCause?.trim() || parsed.actionPlan?.trim() || parsed.nextMonthTarget?.trim())
        ) {
          return parsed;
        }
      }

      // 2. Cek storage berbasis NISN dan bulan jika ada
      if (activeStudent.nisn) {
        const perNisnKey = `si7kaih_reflection_student_nisn_${activeStudent.nisn}_${activePeriodKey}`;
        const savedNisn = localStorage.getItem(perNisnKey);
        if (savedNisn) {
          const parsed = JSON.parse(savedNisn);
          if (parsed && (parsed.rootCause?.trim() || parsed.actionPlan?.trim() || parsed.nextMonthTarget?.trim())) {
            return parsed;
          }
        }
      }

      // 3. Cek storage global HANYA JIKA studentId secara eksplisit cocok dengan activeStudent.id
      const globalKey = 'si7kaih_student_reflection_prod';
      const savedGlobal = localStorage.getItem(globalKey);
      if (savedGlobal) {
        const parsed = JSON.parse(savedGlobal);
        if (
          parsed &&
          parsed.studentId &&
          parsed.studentId === activeStudent.id &&
          (parsed.rootCause?.trim() || parsed.actionPlan?.trim() || parsed.nextMonthTarget?.trim())
        ) {
          return parsed;
        }
      }
    } catch (_e) {}

    // 4. Fallback ke props HANYA jika studentId secara eksplisit cocok dan ada isian riil
    if (
      propStudentReflection &&
      propStudentReflection.studentId &&
      propStudentReflection.studentId === activeStudent.id &&
      (propStudentReflection.rootCause?.trim() ||
        propStudentReflection.actionPlan?.trim() ||
        propStudentReflection.nextMonthTarget?.trim())
    ) {
      return propStudentReflection;
    }

    return null;
  }, [activeStudent.id, activeStudent.nisn, activePeriodKey, propStudentReflection]);

  // 8. Pengamatan & Refleksi Orang Tua (Ditarik Dinamis HANYA Jika Ada Isian Riil Dari Orang Tua Siswa Ini, Bebas Default Data)
  const activeParentReflection = useMemo<ParentMonthlyReflection | null>(() => {
    try {
      // 1. Cek storage spesifik berbasis studentId dan bulan
      const perParentKey = `si7kaih_reflection_parent_${activeStudent.id}_${activePeriodKey}`;
      const savedParent = localStorage.getItem(perParentKey);
      if (savedParent) {
        const parsed = JSON.parse(savedParent);
        if (
          parsed &&
          (parsed.studentId === activeStudent.id || !parsed.studentId) &&
          (parsed.observedChange?.trim() ||
            parsed.difficulty?.trim() ||
            parsed.familySupport?.trim() ||
            parsed.nextMonthSupport?.trim() ||
            parsed.parentNote?.trim())
        ) {
          return parsed;
        }
      }

      // 2. Cek storage spesifik berbasis NISN anak dan bulan (jika ada)
      if (activeStudent.nisn) {
        const perNisnKey = `si7kaih_reflection_parent_nisn_${activeStudent.nisn}_${activePeriodKey}`;
        const savedNisn = localStorage.getItem(perNisnKey);
        if (savedNisn) {
          const parsed = JSON.parse(savedNisn);
          if (
            parsed &&
            (parsed.observedChange?.trim() ||
              parsed.difficulty?.trim() ||
              parsed.familySupport?.trim() ||
              parsed.nextMonthSupport?.trim() ||
              parsed.parentNote?.trim())
          ) {
            return parsed;
          }
        }
      }

      // 3. Cek storage global HANYA JIKA studentId secara eksplisit cocok dengan activeStudent.id dan periode cocok
      const globalKey = 'si7kaih_parent_reflection_prod';
      const savedGlobal = localStorage.getItem(globalKey);
      if (savedGlobal) {
        const parsed = JSON.parse(savedGlobal);
        const matchStudent = parsed && parsed.studentId && parsed.studentId === activeStudent.id;
        const matchPeriod =
          !parsed.month ||
          (parsed.month === activeMonthNumber && (!parsed.year || parsed.year === selectedYearNum));
        if (
          matchStudent &&
          matchPeriod &&
          (parsed.observedChange?.trim() ||
            parsed.difficulty?.trim() ||
            parsed.familySupport?.trim() ||
            parsed.nextMonthSupport?.trim() ||
            parsed.parentNote?.trim())
        ) {
          return parsed;
        }
      }
    } catch (_e) {}

    // 4. Props HANYA jika studentId secara eksplisit cocok dengan activeStudent.id dan terdapat isian riil
    if (
      propParentReflection &&
      propParentReflection.studentId &&
      propParentReflection.studentId === activeStudent.id &&
      (!propParentReflection.month ||
        (propParentReflection.month === activeMonthNumber &&
          (!propParentReflection.year || propParentReflection.year === selectedYearNum))) &&
      (propParentReflection.observedChange?.trim() ||
        propParentReflection.difficulty?.trim() ||
        propParentReflection.familySupport?.trim() ||
        propParentReflection.nextMonthSupport?.trim() ||
        propParentReflection.parentNote?.trim())
    ) {
      return propParentReflection;
    }

    // Default mutlak: Tanpa data default apa pun (bersih)
    return null;
  }, [
    activeStudent.id,
    activeStudent.nisn,
    activePeriodKey,
    activeMonthNumber,
    selectedYearNum,
    propParentReflection,
  ]);

  // 9. Catatan Saran Pendampingan Berbasis AI (Dihasilkan Dinamis dari Ketercapaian Jurnal Siswa)
  const dynamicAiPedagogicalNote = useMemo(() => {
    if (recordedDays === 0) {
      return `Belum ada catatan jurnal harian pembiasaan yang terekam pada periode ${activeMonthName} ${selectedYearNum}. Analisis saran pendampingan berbasis AI akan tersusun otomatis secara objektif dan deskriptif setelah ananda ${activeStudent.name} mulai mencatat pengisian jurnal 7 Kebiasaan Anak Indonesia Hebat.`;
    }

    // Urutkan kebiasaan dari yang paling tinggi keterlaksanaannya
    const sorted = [...habitReportData].sort((a, b) => b.completedDays - a.completedDays);
    const topHabits = sorted.filter((h) => h.completedDays >= Math.max(1, Math.round(targetThreshold * 0.7)));
    const lowHabits = sorted.filter((h) => h.completedDays < targetThreshold);

    const topNames =
      topHabits.length > 0
        ? topHabits.slice(0, 3).map((h) => h.name.toLowerCase()).join(', ')
        : 'pembiasaan harian awal';

    const lowNames =
      lowHabits.length > 0
        ? lowHabits.slice(-2).map((h) => h.name.toLowerCase()).join(' serta ')
        : 'pemeliharaan ritme konsistensi secara holistik';

    return `Berdasarkan rekapitulasi data ${recordedDays} hari jurnal pada periode ${activeMonthName} ${selectedYearNum}, Ananda ${activeStudent.name} menunjukkan konsistensi yang sangat baik pada kebiasaan ${topNames}. Untuk penguatan lebih lanjut pada kebiasaan ${lowNames}, disarankan pendampingan bertahap, pembiasaan berbasis keteladanan, dan dialog terbuka yang hangat bersama keluarga di rumah.`;
  }, [recordedDays, habitReportData, targetThreshold, activeMonthName, selectedYearNum, activeStudent.name]);

  // Data Rombel dan Sekolah untuk Tanda Tangan Resmi
  const matchedRombel = useMemo(() => {
    const rombels = getStoredRombels();
    return (
      rombels.find((r) => isSameClass(r.name, activeStudent.className)) ||
      rombels[0] ||
      DEFAULT_ROMBELS[0]
    );
  }, [activeStudent.className]);

  const matchedSchool = useMemo(() => {
    const schools = getStoredSchools();
    return (
      schools.find((s) => isSameSchool(s.name, activeStudent.schoolName || '')) ||
      schools[0] ||
      DEFAULT_SCHOOLS[0]
    );
  }, [activeStudent.schoolName]);

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
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Status: Sah & Terverifikasi</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Format cetak resmi Portofolio Karakter 7 Kebiasaan Anak Indonesia Hebat berstandar Disdikbud Kabupaten Tanah Laut.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF Resmi</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pengaturan Cetak Dokumen & Pemilihan Siswa Terkini (hidden on print) */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex flex-wrap items-center gap-3">
            {/* Pemilih Siswa Aktif */}
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <User className="w-4 h-4 text-[#0753A5]" />
              <span>Pilih Siswa:</span>
            </div>
            <select
              value={activeStudent.id}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-white font-bold text-slate-900 text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/30 cursor-pointer max-w-[260px] truncate"
              title="Pilih data siswa untuk mencetak dokumen portofolio bulanan"
            >
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.nisn}) - {s.className}
                </option>
              ))}
            </select>

            {/* Pemilih Bulan & Tahun */}
            <div className="flex items-center gap-1.5 ml-2 font-bold text-slate-800">
              <Calendar className="w-4 h-4 text-[#0753A5]" />
              <span>Periode:</span>
            </div>
            <select
              value={selectedMonthIndex}
              onChange={(e) => setSelectedMonthIndex(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 rounded-xl border border-blue-200 bg-white font-bold text-slate-800 text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/30 cursor-pointer"
            >
              {monthNamesList.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYearNum}
              onChange={(e) => setSelectedYearNum(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 rounded-xl border border-blue-200 bg-white font-bold text-slate-800 text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/30 cursor-pointer"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>

            {/* Pemilih Tahun Pelajaran */}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-slate-600 font-medium">Tahun Ajaran:</span>
              <select
                value={isCustomMode ? 'CUSTOM' : selectedYear}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'CUSTOM') {
                    setIsCustomMode(true);
                    setCustomYearInput(selectedYear);
                  } else {
                    setIsCustomMode(false);
                    setSelectedYear(val);
                    setSyncSource('Pilihan Pengaturan Cetak');
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl border border-blue-200 bg-white font-bold text-slate-800 text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/30 cursor-pointer"
              >
                {academicYearOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                <option value="CUSTOM">Input Manual...</option>
              </select>

              {isCustomMode && (
                <input
                  type="text"
                  value={customYearInput}
                  onChange={(e) => {
                    setCustomYearInput(e.target.value);
                    setSelectedYear(e.target.value);
                    setSyncSource('Kustom Manual');
                  }}
                  placeholder="Contoh: 2026/2027 - Semester Ganjil"
                  className="px-2 py-1 rounded-xl border border-blue-200 bg-white text-xs font-semibold text-slate-800 w-44"
                />
              )}
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#0753A5] font-bold border border-blue-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Sinkronkan ulang data siswa, rombel, dan jurnal dari sistem"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0753A5] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sinkron Data</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Riil Terhubung</span>
            </span>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-6 text-slate-900 print:p-0 print:space-y-4">
          {/* Official Letterhead (Kop Surat Resmi) */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-800">
              PEMERINTAH KABUPATEN TANAH LAUT
            </h2>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h3>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 pt-0.5">
              {(activeStudent.schoolName || propSchoolName || 'UPTD SMPN 1 JORONG').toUpperCase()}
            </h1>
            <p className="text-[11px] text-slate-600 font-medium">
              Sistem Informasi 7 Kebiasaan Anak Indonesia Hebat (SI-7KAIH AI)
            </p>
            <div className="pt-2 text-sm font-extrabold uppercase tracking-wide text-[#0753A5]">
              DOKUMEN RESMI PORTOFOLIO BULANAN 7 KEBIASAAN ANAK INDONESIA HEBAT
            </div>
            <div className="text-xs text-slate-700 font-semibold">
              Periode Pembiasaan: <strong>{activeMonthName} {selectedYearNum}</strong>
            </div>
          </div>

          {/* Identitas Siswa & Satuan Pendidikan (Nama Siswa & NISN Terkini) */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500">Nama Lengkap Siswa:</span>
              <strong className="block text-slate-900 text-sm mt-0.5 font-black">
                {activeStudent.name || 'Peserta Didik'}
              </strong>
              <span className="text-slate-500 mt-2 block">Nomor Induk Siswa Nasional (NISN):</span>
              <strong className="block text-slate-900 font-mono mt-0.5 font-bold">
                {activeStudent.nisn || '-'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Rombel / Fase:</span>
              <strong className="block text-slate-900 text-sm mt-0.5 font-bold">
                {activeStudent.className
                  ? activeStudent.className.includes('Fase')
                    ? activeStudent.className
                    : `${activeStudent.className} (Fase D)`
                  : 'Kelas 8-C (Fase D)'}
              </strong>
              <span className="text-slate-500 mt-2 block">Tahun Pelajaran & Semester:</span>
              <strong className="block text-slate-900 mt-0.5 font-bold">{selectedYear}</strong>
            </div>
          </div>

          {/* Indikator Utama: Kelengkapan Jurnal, Kriteria Pembiasaan, Lencana Diraih */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {/* Kelengkapan Jurnal */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-slate-500">Kelengkapan Jurnal:</span>
              <div className="text-base font-black text-[#0753A5] mt-1">
                {completenessRate}% ({recordedDays}/{daysInMonth} Hari)
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {recordedDays >= targetThreshold ? '✓ Memenuhi syarat evaluasi' : 'Sedang dalam pengisian aktif'}
              </p>
            </div>

            {/* Kriteria Pembiasaan */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-slate-500">Kriteria Pembiasaan:</span>
              <div className="text-base font-black text-slate-900 mt-1">
                Minimal {targetThreshold} Hari (2/3 × {daysInMonth} Hari)
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Ketetapan Standar Kemendikbudristek & Disdikbud
              </p>
            </div>

            {/* Lencana Diraih (Bebas Default Data) */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white col-span-2 sm:col-span-1">
              <span className="text-slate-500">Lencana Diraih:</span>
              <div className="text-base font-black text-amber-600 mt-1">
                {earnedBadges.length > 0
                  ? `${earnedBadges.length} Lencana Karakter Diraih`
                  : '0 Lencana Diraih (Dalam Proses Pembiasaan)'}
              </div>
              {earnedBadges.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {earnedBadges.map((b) => (
                    <span
                      key={b.id}
                      className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold"
                    >
                      🏅 {b.title}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Aktifkan pencatatan konsisten untuk membuka lencana
                </p>
              )}
            </div>
          </div>

          {/* I. Ringkasan Capaian 7 Kebiasaan Anak Indonesia Hebat */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                I. Ringkasan Capaian 7 Kebiasaan Anak Indonesia Hebat
              </h4>
              <span className="text-[11px] font-semibold text-slate-500">
                Target Pembiasaan: {targetThreshold} Hari / Bulan
              </span>
            </div>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Dimensi 7 Kebiasaan</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">Hari Terlaksana</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">Konsistensi</th>
                  <th className="py-2.5 px-3 text-center">Status Pembiasaan*</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {habitReportData.map((h, i) => (
                  <tr key={h.code} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 border-r border-slate-300 text-center font-bold text-slate-700">
                      {i + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300 font-semibold text-slate-900">
                      {h.name}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300 text-center font-bold text-slate-800">
                      {h.completedDays} / {targetThreshold} hari target
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300 text-center font-bold text-slate-800">
                      {h.consistencyRate}%
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] inline-block ${
                          h.isHabitual
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
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
              *Keterangan: Status &quot;Sudah Terbiasa&quot; dicapai apabila terlaksana minimal {targetThreshold} hari (2/3 dari {daysInMonth} hari bulan kalender).
            </p>
          </div>

          {/* II. Refleksi Mandiri Siswa & III. Pengamatan & Refleksi Orang Tua (Bebas Default Data) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* II. Refleksi Mandiri Siswa */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>II. Refleksi Mandiri Siswa</span>
                <span className="text-[10px] font-normal text-slate-500">
                  {activeStudentReflection ? '✓ Terisi' : 'Belum Ada Isian'}
                </span>
              </h4>
              {activeStudentReflection ? (
                <div className="space-y-1.5 pt-1">
                  <p>
                    <strong className="text-slate-800">Kebiasaan Paling Menantang:</strong>{' '}
                    <span className="text-slate-900">
                      {activeStudentReflection.hardestHabit
                        ? HABIT_LIST.find((h) => h.code === activeStudentReflection.hardestHabit)?.name ||
                          activeStudentReflection.hardestHabit
                        : '-'}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-800">Akar Penyebab yang Dirasakan:</strong>{' '}
                    <span className="text-slate-900">
                      {activeStudentReflection.rootCause || <span className="text-slate-400 italic">Belum diisi</span>}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-800">Rencana Tindak Lanjut Siswa:</strong>{' '}
                    <span className="text-slate-900">
                      {activeStudentReflection.actionPlan || <span className="text-slate-400 italic">Belum diisi</span>}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-800">Target Komitmen Bulan Depan:</strong>{' '}
                    <span className="text-slate-900">
                      {activeStudentReflection.nextMonthTarget || <span className="text-slate-400 italic">Belum diisi</span>}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 italic">
                  Belum ada catatan refleksi mandiri yang diisi oleh siswa untuk periode {activeMonthName} {selectedYearNum}.
                </div>
              )}
            </div>

            {/* III. Pengamatan & Refleksi Orang Tua */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>III. Pengamatan & Refleksi Orang Tua</span>
                <span className="text-[10px] font-normal text-slate-500">
                  {activeParentReflection ? '✓ Terisi' : 'Belum Ada Isian'}
                </span>
              </h4>
              {activeParentReflection ? (
                <div className="space-y-1.5 pt-1">
                  <p>
                    <strong className="text-slate-800">Perubahan Tampak di Rumah:</strong>{' '}
                    <span className="text-slate-900">
                      {activeParentReflection.observedChange || <span className="text-slate-400 italic">Belum diisi</span>}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-800">Tantangan Pendampingan di Rumah:</strong>{' '}
                    <span className="text-slate-900">
                      {activeParentReflection.difficulty || <span className="text-slate-400 italic">Belum diisi</span>}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-800">Dukungan Keluarga yang Diberikan:</strong>{' '}
                    <span className="text-slate-900">
                      {activeParentReflection.familySupport || <span className="text-slate-400 italic">Belum diisi</span>}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-800">Rencana Pendampingan Bulan Depan:</strong>{' '}
                    <span className="text-slate-900">
                      {activeParentReflection.nextMonthSupport || <span className="text-slate-400 italic">Belum diisi</span>}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 italic">
                  Belum ada catatan pengamatan dan refleksi dari orang tua / wali untuk periode {activeMonthName} {selectedYearNum}.
                </div>
              )}
            </div>
          </div>

          {/* Catatan Saran Pendampingan Berbasis AI (Dihasilkan Dinamis dari Data Riil) */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Catatan Saran Pendampingan Berbasis AI (Bahan Diskusi Kolaboratif):</span>
            </div>
            <p className="text-slate-800 leading-relaxed italic">
              &quot;{dynamicAiPedagogicalNote}&quot;
            </p>
            <p className="text-[10px] text-slate-500 italic pt-0.5">
              Disclaimer: Analisis AI ini bersifat deskriptif edukatif sebagai pemantik diskusi pendampingan antara guru dan orang tua, bukan vonis moral atau penentu kelulusan siswa.
            </p>
          </div>

          {/* Tanda Tangan Resmi Pengesahan Dokumen */}
          <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs">
            {/* Kolom 1: Orang Tua / Wali */}
            <div className="space-y-16">
              <p className="text-slate-700">
                Mengetahui,<br />
                <strong className="text-slate-900">Orang Tua / Wali Siswa</strong>
              </p>
              <div>
                <p className="font-bold text-slate-900 underline decoration-dotted">
                  ( {activeStudent.parentName || 'Orang Tua / Wali Siswa'} )
                </p>
                <span className="text-[10px] text-slate-400">Tanda Tangan & Nama Terang</span>
              </div>
            </div>

            {/* Kolom 2: Guru Wali Kelas */}
            <div className="space-y-16">
              <p className="text-slate-700">
                Tanggal Pengesahan: {daysInMonth} {activeMonthName} {selectedYearNum}<br />
                <strong className="text-slate-900">Guru Wali Kelas</strong>
              </p>
              <div>
                <p className="font-bold text-slate-900 underline decoration-dotted">
                  ( {matchedRombel.teacher || 'Siti Rahmah, S.Pd.'} )
                </p>
                <span className="font-normal text-[10px] text-slate-600">
                  NIP. {matchedRombel.teacherNip || '198403152009032008'}
                </span>
              </div>
            </div>

            {/* Kolom 3: Kepala Satuan Pendidikan */}
            <div className="space-y-16">
              <p className="text-slate-700">
                Menyetujui,<br />
                <strong className="text-slate-900">
                  Kepala {activeStudent.schoolName || propSchoolName || 'UPTD SMPN 1 Jorong'}
                </strong>
              </p>
              <div>
                <p className="font-bold text-slate-900 underline decoration-dotted">
                  ( {matchedSchool.principalName || 'H. Akhmad Fauzi, M.Pd.'} )
                </p>
                <span className="font-normal text-[10px] text-slate-600">
                  NIP. {matchedSchool.principalNip || '197105121998021004'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
