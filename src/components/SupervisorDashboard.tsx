// ============================================================================
// SI-7KAIH AI - Supervisor Regional Dashboard Component
// Multi-school comparison, regional portfolio, supervisory recommendations
// Disinkronkan 100% dengan Data Terupdate dari Super Admin & Admin Sekolah
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Building2,
  Sparkles,
  TrendingUp,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Download,
  Eye,
  X,
  Send,
  Award,
  Users,
  RefreshCw,
  Search,
  Filter,
  School,
  GraduationCap,
  ChevronRight,
  BookOpen,
  Printer,
  Calendar,
  CalendarDays,
  Clock,
  Check,
  Table,
  LayoutGrid,
  AlertTriangle,
  Layers,
  Info,
  Settings,
} from 'lucide-react';
import { SchoolMaster, getStoredSchools } from '../lib/schoolMasterData';
import { Rombel, Student, getStoredRombels, getStoredStudents } from '../lib/studentData';
import { UserPersona, getStoredUsers, isDeprecatedOrDummyJournal } from '../lib/constants';
import { DailyJournal, FollowUpPlan } from '../../packages/types/src/index';
import { formatIndonesianFullDate, formatIndonesianShortDate, getLocalDateString } from '../lib/dateUtils';
import { SupervisorHabitTrendsChart } from './SupervisorHabitTrendsChart';

interface SupervisorDashboardProps {
  onOpenReportModal: () => void;
  activeNavTab?: string;
  currentPersona?: UserPersona;
  journals?: DailyJournal[];
  followUps?: FollowUpPlan[];
  onSelectTab?: (tab: string) => void;
}

const getStoredSupervisorFollowUps = (): FollowUpPlan[] => {
  try {
    const rawTeacher = localStorage.getItem('si7kaih_teacher_followups_prod');
    const teacherPlans: FollowUpPlan[] = rawTeacher ? JSON.parse(rawTeacher) : [];
    const rawSchool = localStorage.getItem('si7kaih_followups_prod');
    const schoolPlans: FollowUpPlan[] = rawSchool ? JSON.parse(rawSchool) : [];
    return [...teacherPlans, ...schoolPlans];
  } catch (_e) {
    return [];
  }
};

const getStoredSupervisionNotes = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem('si7kaih_supervision_notes_prod');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const defaultDummySchoolKeys = ['sch-smpn1-jorong'];
        const sanitized: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (!defaultDummySchoolKeys.includes(k) && typeof v === 'string') {
            sanitized[k] = v;
          }
        }
        return sanitized;
      }
    }
  } catch (_e) {}
  return {};
};

const saveStoredSupervisionNotes = (notes: Record<string, string>) => {
  try {
    localStorage.setItem('si7kaih_supervision_notes_prod', JSON.stringify(notes));
  } catch (_e) {}
};

const getStoredTeacherValidations = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem('si7kaih_teacher_validations_prod');
    return raw ? JSON.parse(raw) : {};
  } catch (_e) {
    return {};
  }
};

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  onOpenReportModal,
  activeNavTab,
  currentPersona,
  journals = [],
  followUps = [],
  onSelectTab,
}) => {
  const [activeTab, setActiveTab] = useState<
    'REGIONAL_OVERVIEW' | 'COMPARISON' | 'MONITORING' | 'TRENDS' | 'RTL' | 'AI_REGIONAL'
  >('REGIONAL_OVERVIEW');
  const [aiSupervisorResult, setAiSupervisorResult] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [supervisionNotes, setSupervisionNotes] = useState<Record<string, string>>(() => getStoredSupervisionNotes());
  const [currentNoteInput, setCurrentNoteInput] = useState('');
  const [teacherValidations, setTeacherValidations] = useState<Record<string, boolean>>(() => getStoredTeacherValidations());
  const [aggregateConditionFilter, setAggregateConditionFilter] = useState<'ALL' | 'GREEN' | 'YELLOW' | 'RED'>('ALL');
  const [sidebarConditionFilter, setSidebarConditionFilter] = useState<'ALL' | 'GREEN' | 'YELLOW' | 'RED'>('ALL');
  const [showConditionLegend, setShowConditionLegend] = useState(false);
  const [showRegionalStatsModal, setShowRegionalStatsModal] = useState(false);
  const [aggregateViewMode, setAggregateViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');

  // Synchronized Master & Mandiri Data States
  const [schools, setSchools] = useState<SchoolMaster[]>(() => getStoredSchools());
  const [rombels, setRombels] = useState<Rombel[]>(() => getStoredRombels());
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [userAccounts, setUserAccounts] = useState<UserPersona[]>(() => getStoredUsers());
  const [localFollowUps, setLocalFollowUps] = useState<FollowUpPlan[]>(() => {
    const stored = getStoredSupervisorFollowUps();
    return stored.length > 0 ? stored : followUps;
  });
  // Synchronized journals state reflecting live student journal submissions
  const [syncedJournals, setSyncedJournals] = useState<DailyJournal[]>(() => {
    try {
      const raw = localStorage.getItem('si7kaih_journals_prod');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j));
        }
      }
    } catch (_e) {}
    return (journals || []).filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j));
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenjang, setFilterJenjang] = useState<'ALL' | 'SD' | 'SMP' | 'SMA'>('ALL');
  const [selectedMonitoringSchoolId, setSelectedMonitoringSchoolId] = useState<string>('');
  const [printPdfMode, setPrintPdfMode] = useState<'REGIONAL' | 'PER_SCHOOL' | null>(null);

  // Date Range Filter States for Regional Portfolio & PDF Reports
  const [dateRangePreset, setDateRangePreset] = useState<
    'ALL' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'LAST_MONTH' | 'LAST_30_DAYS' | 'THIS_SEMESTER' | 'CUSTOM'
  >('ALL');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const applyDatePreset = (
    preset: 'ALL' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'LAST_MONTH' | 'LAST_30_DAYS' | 'THIS_SEMESTER' | 'CUSTOM'
  ) => {
    setDateRangePreset(preset);
    const today = new Date();
    const todayStr = getLocalDateString(today);

    if (preset === 'ALL') {
      setFilterStartDate('');
      setFilterEndDate('');
    } else if (preset === 'THIS_MONTH') {
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      setFilterStartDate(`${y}-${m}-01`);
      setFilterEndDate(todayStr);
    } else if (preset === 'LAST_MONTH') {
      const prevMonthFirst = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const prevMonthLast = new Date(today.getFullYear(), today.getMonth(), 0);
      setFilterStartDate(getLocalDateString(prevMonthFirst));
      setFilterEndDate(getLocalDateString(prevMonthLast));
    } else if (preset === 'LAST_7_DAYS') {
      const d7 = new Date(today);
      d7.setDate(d7.getDate() - 6);
      setFilterStartDate(getLocalDateString(d7));
      setFilterEndDate(todayStr);
    } else if (preset === 'LAST_30_DAYS') {
      const d30 = new Date(today);
      d30.setDate(d30.getDate() - 29);
      setFilterStartDate(getLocalDateString(d30));
      setFilterEndDate(todayStr);
    } else if (preset === 'THIS_SEMESTER') {
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      if (month >= 7 && month <= 12) {
        setFilterStartDate(`${year}-07-01`);
        setFilterEndDate(`${year}-12-31`);
      } else {
        setFilterStartDate(`${year}-01-01`);
        setFilterEndDate(`${year}-06-30`);
      }
    } else if (preset === 'CUSTOM') {
      if (!filterStartDate) setFilterStartDate(todayStr);
      if (!filterEndDate) setFilterEndDate(todayStr);
    }
  };

  const periodDaysCount = useMemo(() => {
    if (!filterStartDate || !filterEndDate) return 30;
    try {
      const start = new Date(filterStartDate + 'T00:00:00');
      const end = new Date(filterEndDate + 'T00:00:00');
      const diffTime = Math.max(0, end.getTime() - start.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, diffDays);
    } catch (_e) {
      return 30;
    }
  }, [filterStartDate, filterEndDate]);

  const activePeriodLabel = useMemo(() => {
    if (dateRangePreset === 'ALL' || (!filterStartDate && !filterEndDate)) {
      return 'Semua Periode (Akumulatif)';
    }
    const presetNames: Record<string, string> = {
      ALL: 'Semua Periode',
      THIS_MONTH: 'Bulan Ini',
      LAST_MONTH: 'Bulan Lalu',
      LAST_7_DAYS: '7 Hari Terakhir',
      LAST_30_DAYS: '30 Hari Terakhir',
      THIS_SEMESTER: 'Semester Berjalan',
      CUSTOM: 'Rentang Kustom',
    };
    const tag = presetNames[dateRangePreset] || 'Kustom';
    if (filterStartDate === filterEndDate) {
      return `${formatIndonesianShortDate(filterStartDate)} (${tag})`;
    }
    return `${formatIndonesianShortDate(filterStartDate)} s.d. ${formatIndonesianShortDate(filterEndDate)} (${periodDaysCount} hari • ${tag})`;
  }, [dateRangePreset, filterStartDate, filterEndDate, periodDaysCount]);

  const formalReportPeriodText = useMemo(() => {
    if (dateRangePreset === 'ALL' || (!filterStartDate && !filterEndDate)) {
      return 'Seluruh Periode Pembiasaan (Akumulatif Semester Berjalan Tahun Pelajaran 2026/2027)';
    }
    const presetNames: Record<string, string> = {
      ALL: 'Semua Periode',
      THIS_MONTH: 'Periode Bulanan (Bulan Ini)',
      LAST_MONTH: 'Periode Bulanan (Bulan Lalu)',
      LAST_7_DAYS: 'Periode Mingguan (7 Hari Terakhir)',
      LAST_30_DAYS: 'Periode 30 Hari Terakhir',
      THIS_SEMESTER: 'Periode Semester Ganjil 2026/2027',
      CUSTOM: 'Periode Rentang Khusus',
    };
    const tag = presetNames[dateRangePreset] || 'Periode Spesifik';
    if (filterStartDate === filterEndDate) {
      return `Tanggal: ${formatIndonesianFullDate(filterStartDate)} (${tag})`;
    }
    return `${formatIndonesianFullDate(filterStartDate)} s.d. ${formatIndonesianFullDate(filterEndDate)} (${periodDaysCount} Hari Pemantauan • ${tag})`;
  }, [dateRangePreset, filterStartDate, filterEndDate, periodDaysCount]);

  // Re-sync all data from authoritative storage
  const syncAllData = () => {
    setIsSyncing(true);
    const freshSchools = getStoredSchools();
    const freshRombels = getStoredRombels();
    const freshStudents = getStoredStudents();
    const freshUsers = getStoredUsers();
    setSchools(freshSchools);
    setRombels(freshRombels);
    setStudents(freshStudents);
    setUserAccounts(freshUsers);
    setLocalFollowUps(getStoredSupervisorFollowUps());
    setSupervisionNotes(getStoredSupervisionNotes());
    setTeacherValidations(getStoredTeacherValidations());

    let freshJournals: DailyJournal[] = [];
    try {
      const rawJournals = localStorage.getItem('si7kaih_journals_prod');
      if (rawJournals) {
        const parsed = JSON.parse(rawJournals);
        if (Array.isArray(parsed)) {
          freshJournals = parsed.filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j));
        }
      }
    } catch (_e) {}
    if (freshJournals.length > 0) {
      setSyncedJournals(freshJournals);
    } else if (journals) {
      setSyncedJournals(journals.filter((j) => !isDeprecatedOrDummyJournal(j)));
    }

    setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setTimeout(() => setIsSyncing(false), 500);
  };

  // Listen to cross-tab storage and application events
  useEffect(() => {
    const handleSync = () => syncAllData();

    window.addEventListener('storage', handleSync);
    window.addEventListener('si7kaih_schools_updated', handleSync);
    window.addEventListener('si7kaih_students_updated', handleSync);
    window.addEventListener('si7kaih_rombels_updated', handleSync);
    window.addEventListener('si7kaih_users_updated', handleSync);
    window.addEventListener('si7kaih_followups_updated', handleSync);
    window.addEventListener('si7kaih_journals_updated', handleSync);
    window.addEventListener('si7kaih_programs_updated', handleSync);
    window.addEventListener('si7kaih_validations_updated', handleSync);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('si7kaih_sync_channel');
        bc.onmessage = () => {
          handleSync();
        };
      } catch (_e) {}
    }

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('si7kaih_schools_updated', handleSync);
      window.removeEventListener('si7kaih_students_updated', handleSync);
      window.removeEventListener('si7kaih_rombels_updated', handleSync);
      window.removeEventListener('si7kaih_users_updated', handleSync);
      window.removeEventListener('si7kaih_followups_updated', handleSync);
      window.removeEventListener('si7kaih_journals_updated', handleSync);
      window.removeEventListener('si7kaih_programs_updated', handleSync);
      window.removeEventListener('si7kaih_validations_updated', handleSync);
      if (bc) bc.close();
    };
  }, []);

  // Sync with Header navigation tabs
  useEffect(() => {
    if (!activeNavTab) return;
    if (activeNavTab === 'schools-comparison') {
      setActiveTab('COMPARISON');
    } else if (activeNavTab === 'monitoring') {
      setActiveTab('MONITORING');
    } else if (activeNavTab === 'trends' || activeNavTab === 'habit-trends') {
      setActiveTab('TRENDS');
    } else if (activeNavTab === 'rtl') {
      setActiveTab('RTL');
    } else if (activeNavTab === 'ai-supervisor') {
      setActiveTab('AI_REGIONAL');
    } else if (activeNavTab === 'dashboard') {
      setActiveTab('REGIONAL_OVERVIEW');
    }
  }, [activeNavTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenSchoolModal = (school: any) => {
    setSelectedSchool(school);
    setCurrentNoteInput(supervisionNotes[school.id] || '');
  };

  const handleSaveSupervisionNote = () => {
    if (!selectedSchool) return;
    const updated = {
      ...supervisionNotes,
      [selectedSchool.id]: currentNoteInput,
    };
    setSupervisionNotes(updated);
    saveStoredSupervisionNotes(updated);
    showToast(`Catatan supervisi untuk ${selectedSchool.name} berhasil disimpan.`);
    setSelectedSchool(null);
  };

  // Dynamically map all schools from Master Super Admin with live metrics from School Admin
  const fosterSchools = useMemo(() => {
    return schools.map((s) => {
      // 1. Peserta Didik: Ambil dari data siswa mandiri aktual atau totalStudents yang diisi admin, default 0
      const schoolStudents = students.filter(
        (st) =>
          (st.schoolId && st.schoolId === s.id) ||
          (st.schoolName && st.schoolName.trim().toLowerCase() === s.name.trim().toLowerCase())
      );
      const studentCount = schoolStudents.length > 0 ? schoolStudents.length : (s.totalStudents || 0);

      // 2. Tenaga Pendidik: Ambil dari akun guru aktif untuk sekolah ini atau totalTeachers yang diisi admin, default 0
      const schoolTeachers = userAccounts.filter(
        (u) =>
          u.role === 'TEACHER' &&
          ((u.schoolId && u.schoolId === s.id) ||
            (u.schoolName && u.schoolName.trim().toLowerCase() === s.name.trim().toLowerCase()))
      );
      const teacherCount = schoolTeachers.length > 0 ? schoolTeachers.length : (s.totalTeachers || 0);

      // 3. Rombongan Belajar: Ambil dari rombel mandiri aktual atau totalClasses yang diisi admin, default 0
      const schoolRombels = rombels.filter(
        (r) =>
          (r.schoolId && r.schoolId === s.id) ||
          (r.schoolName && r.schoolName.trim().toLowerCase() === s.name.trim().toLowerCase())
      );
      const classCount = schoolRombels.length > 0 ? schoolRombels.length : (s.totalClasses || 0);

      // 4. Jurnal Harian & Metrik 7 Kebiasaan
      const schoolStudentIds = new Set(schoolStudents.map((st) => st.id));
      const schoolJournals = syncedJournals.filter((j) => {
        if (!j) return false;
        if (isDeprecatedOrDummyJournal(j)) return false;
        const belongs =
          (j.schoolId && j.schoolId === s.id) ||
          (j.studentId && schoolStudentIds.has(j.studentId)) ||
          (s.name && j.schoolName && j.schoolName.trim().toLowerCase() === s.name.trim().toLowerCase()) ||
          (!j.schoolId && !j.schoolName && schools.length <= 1);
        if (!belongs) return false;

        // Terapkan filter rentang tanggal (mingguan / bulanan / kustom)
        if (filterStartDate || filterEndDate) {
          const jDate = j.journalDate || (j as any).date;
          if (!jDate) return false;
          const from = filterStartDate && filterEndDate && filterStartDate > filterEndDate ? filterEndDate : filterStartDate;
          const to = filterStartDate && filterEndDate && filterStartDate > filterEndDate ? filterStartDate : filterEndDate;
          if (from && jDate < from) return false;
          if (to && jDate > to) return false;
        }

        return true;
      });

      const habitCounts: Record<string, { total: number; completed: number }> = {
        WAKE_EARLY: { total: 0, completed: 0 },
        WORSHIP: { total: 0, completed: 0 },
        EXERCISE: { total: 0, completed: 0 },
        HEALTHY_EATING: { total: 0, completed: 0 },
        LEARNING: { total: 0, completed: 0 },
        SOCIAL: { total: 0, completed: 0 },
        SLEEP_EARLY: { total: 0, completed: 0 },
      };

      let completeness = 0;
      let consistency = 0;
      let totalCompletedHabits = 0;

      if (schoolJournals.length > 0) {
        let totalEntries = 0;
        schoolJournals.forEach((j) => {
          if (j.entries) {
            Object.entries(j.entries).forEach(([code, entry]) => {
              if (habitCounts[code]) {
                habitCounts[code].total += 1;
                if (entry && (entry as any).completed) {
                  habitCounts[code].completed += 1;
                  totalCompletedHabits += 1;
                }
                totalEntries += 1;
              }
            });
          }
        });

        const activeDays = (filterStartDate && filterEndDate) ? periodDaysCount : 30;
        const denominator = studentCount > 0 ? studentCount * activeDays : activeDays;
        completeness = Math.min(100, Math.round((schoolJournals.length / denominator) * 100));
        consistency = totalEntries > 0 ? Math.min(100, Math.round((totalCompletedHabits / totalEntries) * 100)) : 0;
      } else {
        // Jika belum ada entri jurnal atau di luar rentang filter, murni 0 (tanpa fallback default palsu)
        completeness = 0;
        consistency = 0;
      }

      // Setiap kebiasaan reset ke default 0 jika belum ada data/jurnal
      const habits = {
        wakeEarly: habitCounts.WAKE_EARLY.total > 0
          ? Math.round((habitCounts.WAKE_EARLY.completed / habitCounts.WAKE_EARLY.total) * 100)
          : 0,
        worship: habitCounts.WORSHIP.total > 0
          ? Math.round((habitCounts.WORSHIP.completed / habitCounts.WORSHIP.total) * 100)
          : 0,
        exercise: habitCounts.EXERCISE.total > 0
          ? Math.round((habitCounts.EXERCISE.completed / habitCounts.EXERCISE.total) * 100)
          : 0,
        healthyEat: habitCounts.HEALTHY_EATING.total > 0
          ? Math.round((habitCounts.HEALTHY_EATING.completed / habitCounts.HEALTHY_EATING.total) * 100)
          : 0,
        learning: habitCounts.LEARNING.total > 0
          ? Math.round((habitCounts.LEARNING.completed / habitCounts.LEARNING.total) * 100)
          : 0,
        social: habitCounts.SOCIAL.total > 0
          ? Math.round((habitCounts.SOCIAL.completed / habitCounts.SOCIAL.total) * 100)
          : 0,
        sleepEarly: habitCounts.SLEEP_EARLY.total > 0
          ? Math.round((habitCounts.SLEEP_EARLY.completed / habitCounts.SLEEP_EARLY.total) * 100)
          : 0,
      };

      // RTL aktif: Ambil dari data rencana tindak lanjut sekolah aktual, reset ke default 0 bila belum ada data
      const schoolFollowUps = localFollowUps.filter(
        (f) =>
          (f.schoolId && f.schoolId === s.id) ||
          (s.name && f.finding && f.finding.toLowerCase().includes(s.name.toLowerCase()))
      );
      const activeRtl = schoolFollowUps.filter((f) => f.status !== 'COMPLETED').length;
      const totalFollowUps = schoolFollowUps.length;
      const completedFollowUps = schoolFollowUps.filter((f) => f.status === 'COMPLETED' || (f.progressPercent || 0) >= 100).length;
      const inProgressFollowUps = schoolFollowUps.filter((f) => f.status === 'IN_PROGRESS' || ((f.progressPercent || 0) > 0 && (f.progressPercent || 0) < 100)).length;
      const followUpExecutionRate = totalFollowUps > 0
        ? Math.round(
            schoolFollowUps.reduce((acc, f) => acc + (f.status === 'COMPLETED' ? 100 : (f.progressPercent || 0)), 0) /
              totalFollowUps
          )
        : 0;

      // 1. Murid Aktif
      const activeStudentIds = new Set<string>();
      const activeStudentKeys = new Set<string>();
      schoolJournals.forEach((j) => {
        if (j.studentId) activeStudentIds.add(j.studentId);
        const key = (j.studentId || j.studentNisn || j.studentName || '').toLowerCase().trim();
        if (key) activeStudentKeys.add(key);
      });

      const activeStudentsCount = schoolStudents.length > 0
        ? schoolStudents.filter(
            (st) =>
              activeStudentIds.has(st.id) ||
              (st.nisn && schoolJournals.some((j) => j.studentNisn === st.nisn)) ||
              (st.name && schoolJournals.some((j) => j.studentName && j.studentName.toLowerCase() === st.name.toLowerCase()))
          ).length
        : activeStudentKeys.size;
      const finalActiveStudents = Math.max(activeStudentsCount, activeStudentKeys.size);
      const activeStudentsPercent = studentCount > 0 ? Math.min(100, Math.round((finalActiveStudents / studentCount) * 100)) : 0;

      // 2. Validasi oleh Guru dan Orang Tua
      const totalJournalsCount = schoolJournals.length;
      let teacherValidatedCount = 0;
      let parentValidatedCount = 0;

      schoolJournals.forEach((j) => {
        const date = j.journalDate || (j as any).date;
        const isTeacherValid =
          Boolean(j.teacherValidated) ||
          Boolean(j.studentId && teacherValidations[j.studentId]) ||
          Boolean(j.studentId && date && teacherValidations[`${j.studentId}_${date}`]) ||
          Boolean(j.studentNisn && teacherValidations[j.studentNisn]);
        if (isTeacherValid) teacherValidatedCount += 1;

        const isParentValid =
          Boolean(j.parentValidated) ||
          Boolean(j.parentSignature) ||
          Boolean(j.parentValidatorName) ||
          Boolean(j.entries && Object.values(j.entries).some((e: any) => e?.parentValidated));
        if (isParentValid) parentValidatedCount += 1;
      });

      const teacherValidationRate = totalJournalsCount > 0
        ? Math.min(100, Math.round((teacherValidatedCount / totalJournalsCount) * 100))
        : 0;
      const parentValidationRate = totalJournalsCount > 0
        ? Math.min(100, Math.round((parentValidatedCount / totalJournalsCount) * 100))
        : 0;
      const avgValidationRate = totalJournalsCount > 0
        ? Math.round((teacherValidationRate + parentValidationRate) / 2)
        : 0;

      // 3. Persentase Murid Mencapai Ambang Pembiasaan pada Setiap Kebiasaan (Ambang Konsistensi >= 75%)
      const studentJournalsMap = new Map<string, DailyJournal[]>();
      schoolJournals.forEach((j) => {
        const key = (j.studentId || j.studentNisn || j.studentName || 'unknown').toLowerCase().trim();
        if (!studentJournalsMap.has(key)) {
          studentJournalsMap.set(key, []);
        }
        studentJournalsMap.get(key)!.push(j);
      });

      const studentsWithJournalsCount = studentJournalsMap.size;
      const habitThresholdHits: Record<string, number> = {
        WAKE_EARLY: 0,
        WORSHIP: 0,
        EXERCISE: 0,
        HEALTHY_EATING: 0,
        LEARNING: 0,
        SOCIAL: 0,
        SLEEP_EARLY: 0,
      };

      studentJournalsMap.forEach((sJournals) => {
        const jCount = sJournals.length;
        if (jCount === 0) return;
        const codes = ['WAKE_EARLY', 'WORSHIP', 'EXERCISE', 'HEALTHY_EATING', 'LEARNING', 'SOCIAL', 'SLEEP_EARLY'] as const;
        codes.forEach((code) => {
          const hit = sJournals.filter((j) => (j.entries as any)?.[code]?.completed).length;
          const consistencyPct = (hit / jCount) * 100;
          if (consistencyPct >= 75) {
            habitThresholdHits[code] += 1;
          }
        });
      });

      const habitThresholdRates = {
        wakeEarly: studentsWithJournalsCount > 0 ? Math.round((habitThresholdHits.WAKE_EARLY / studentsWithJournalsCount) * 100) : 0,
        worship: studentsWithJournalsCount > 0 ? Math.round((habitThresholdHits.WORSHIP / studentsWithJournalsCount) * 100) : 0,
        exercise: studentsWithJournalsCount > 0 ? Math.round((habitThresholdHits.EXERCISE / studentsWithJournalsCount) * 100) : 0,
        healthyEat: studentsWithJournalsCount > 0 ? Math.round((habitThresholdHits.HEALTHY_EATING / studentsWithJournalsCount) * 100) : 0,
        learning: studentsWithJournalsCount > 0 ? Math.round((habitThresholdHits.LEARNING / studentsWithJournalsCount) * 100) : 0,
        social: studentsWithJournalsCount > 0 ? Math.round((habitThresholdHits.SOCIAL / studentsWithJournalsCount) * 100) : 0,
        sleepEarly: studentsWithJournalsCount > 0 ? Math.round((habitThresholdHits.SLEEP_EARLY / studentsWithJournalsCount) * 100) : 0,
      };

      const avgHabitThresholdPct = studentsWithJournalsCount > 0
        ? Math.round(
            (habitThresholdRates.wakeEarly +
              habitThresholdRates.worship +
              habitThresholdRates.exercise +
              habitThresholdRates.healthyEat +
              habitThresholdRates.learning +
              habitThresholdRates.social +
              habitThresholdRates.sleepEarly) / 7
          )
        : 0;

      // 4. Penanda Hijau, Kuning, atau Merah Kondisi Implementasi Program
      let conditionColor: 'GREEN' | 'YELLOW' | 'RED' = 'RED';
      let conditionLabel = 'Kritis / Intervensi';
      let conditionBadgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
      let conditionDot = 'bg-rose-500';
      let conditionSummary = '';

      const hasMinimalActivity = studentCount > 0 && totalJournalsCount > 0;

      if (!hasMinimalActivity) {
        conditionColor = 'RED';
        conditionLabel = 'Kritis (Belum Ada Data)';
        conditionBadgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
        conditionDot = 'bg-rose-500';
        conditionSummary = 'Belum ada data jurnal atau aktivitas pembiasaan murid yang terisi.';
      } else {
        const meetsCompleteness = completeness >= 75;
        const meetsValidation = avgValidationRate >= 70;
        const meetsHabits = avgHabitThresholdPct >= 70;
        const meetsFollowUp = totalFollowUps === 0 || followUpExecutionRate >= 60;

        if (meetsCompleteness && meetsValidation && meetsHabits && meetsFollowUp) {
          conditionColor = 'GREEN';
          conditionLabel = 'Optimal (Memenuhi Ambang)';
          conditionBadgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          conditionDot = 'bg-emerald-500';
          conditionSummary = 'Implementasi program berjalan prima. Kelengkapan, validasi ganda, dan ambang 7 kebiasaan tercapai optimal.';
        } else if (
          completeness >= 45 ||
          avgValidationRate >= 40 ||
          avgHabitThresholdPct >= 40
        ) {
          conditionColor = 'YELLOW';
          conditionLabel = 'Cukup (Perlu Pendampingan)';
          conditionBadgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
          conditionDot = 'bg-amber-500';
          conditionSummary = 'Program telah berjalan di sekolah namun membutuhkan penguatan pendampingan pada validasi atau konsistensi pembiasaan.';
        } else {
          conditionColor = 'RED';
          conditionLabel = 'Kritis (Perlu Intervensi)';
          conditionBadgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
          conditionDot = 'bg-rose-500';
          conditionSummary = 'Tingkat kelengkapan atau validasi rendah (<45%). Diperlukan intervensi langsung pengawas pembina.';
        }
      }

      const hasActivity =
        studentCount > 0 ||
        teacherCount > 0 ||
        classCount > 0 ||
        completeness > 0 ||
        consistency > 0 ||
        schoolJournals.length > 0;

      const status: 'TERPANTAU_BAIK' | 'PERLU_PENGUATAN' | 'BELUM_ADA_DATA' = !hasActivity
        ? 'BELUM_ADA_DATA'
        : completeness >= 80 && consistency >= 70
        ? 'TERPANTAU_BAIK'
        : 'PERLU_PENGUATAN';

      let priorityHabit = 'Belum Ada Data (0%)';
      if (schoolJournals.length > 0 || (completeness > 0 && consistency > 0)) {
        const habitList = [
          { name: 'Bangun Pagi', val: habits.wakeEarly },
          { name: 'Beribadah', val: habits.worship },
          { name: 'Berolahraga', val: habits.exercise },
          { name: 'Makan Sehat', val: habits.healthyEat },
          { name: 'Gemar Belajar', val: habits.learning },
          { name: 'Bermasyarakat', val: habits.social },
          { name: 'Tidur Cepat', val: habits.sleepEarly },
        ].sort((a, b) => a.val - b.val);
        priorityHabit = `${habitList[0].name} (${habitList[0].val}%)`;
      }

      return {
        id: s.id,
        name: s.name,
        npsn: s.npsn,
        jenjang: s.jenjang || 'SMP',
        schoolStatus: s.status || 'NEGERI',
        akreditasi: s.akreditasi || 'A',
        district: s.district || 'Kecamatan Binaan',
        city: s.city || 'Kota Administrasi',
        address: s.address || '',
        students: studentCount,
        activeStudents: finalActiveStudents,
        activeStudentsPercent,
        totalJournals: totalJournalsCount,
        teachers: teacherCount,
        classes: classCount,
        completeness,
        consistency,
        teacherValidationRate,
        teacherValidatedCount,
        parentValidationRate,
        parentValidatedCount,
        avgValidationRate,
        habitThresholdRates,
        avgHabitThresholdPct,
        totalFollowUps,
        completedFollowUps,
        inProgressFollowUps,
        followUpExecutionRate,
        condition: {
          color: conditionColor,
          label: conditionLabel,
          badgeBg: conditionBadgeBg,
          dot: conditionDot,
          summary: conditionSummary,
        },
        status,
        activeRtl,
        schoolFollowUps,
        headmaster: s.principalName || 'Belum Ditentukan',
        headmasterNip: s.principalNip || '-',
        admin: s.adminName || 'Belum Ada Admin',
        priorityHabit,
        habits,
        supervisionNote: supervisionNotes[s.id] || '',
      };
    });
  }, [
    schools,
    students,
    rombels,
    userAccounts,
    supervisionNotes,
    teacherValidations,
    journals,
    localFollowUps,
    filterStartDate,
    filterEndDate,
    dateRangePreset,
    periodDaysCount,
  ]);

  // Total entri jurnal yang cocok dengan filter tanggal aktif
  const totalFilteredJournalsCount = useMemo(() => {
    return journals.filter((j) => {
      if (filterStartDate || filterEndDate) {
        const jDate = j.journalDate || (j as any).date;
        if (!jDate) return false;
        const from = filterStartDate && filterEndDate && filterStartDate > filterEndDate ? filterEndDate : filterStartDate;
        const to = filterStartDate && filterEndDate && filterStartDate > filterEndDate ? filterStartDate : filterEndDate;
        if (from && jDate < from) return false;
        if (to && jDate > to) return false;
      }
      return true;
    }).length;
  }, [journals, filterStartDate, filterEndDate]);

  // Filtered schools for search / filter views
  const filteredSchools = useMemo(() => {
    return fosterSchools.filter((s) => {
      const matchQuery =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.npsn.includes(searchQuery) ||
        s.headmaster.toLowerCase().includes(searchQuery.toLowerCase());
      const matchJenjang = filterJenjang === 'ALL' || s.jenjang === filterJenjang;
      return matchQuery && matchJenjang;
    });
  }, [fosterSchools, searchQuery, filterJenjang]);

  // Filtered schools for aggregate indicator summary (by green/yellow/red condition)
  const aggregateSchools = useMemo(() => {
    if (aggregateConditionFilter === 'ALL') return fosterSchools;
    return fosterSchools.filter((s) => s.condition.color === aggregateConditionFilter);
  }, [fosterSchools, aggregateConditionFilter]);

  // Regional Aggregate Metrics
  const totalSchoolsCount = fosterSchools.length;
  const totalStudentsCount = useMemo(
    () => fosterSchools.reduce((acc, s) => acc + s.students, 0),
    [fosterSchools]
  );
  const totalTeachersCount = useMemo(
    () => fosterSchools.reduce((acc, s) => acc + s.teachers, 0),
    [fosterSchools]
  );

  const schoolsWithMetrics = useMemo(
    () => fosterSchools.filter((s) => s.status !== 'BELUM_ADA_DATA'),
    [fosterSchools]
  );

  const avgCompleteness = useMemo(() => {
    if (schoolsWithMetrics.length === 0) return 0;
    const sum = schoolsWithMetrics.reduce((acc, s) => acc + s.completeness, 0);
    return +(sum / schoolsWithMetrics.length).toFixed(1);
  }, [schoolsWithMetrics]);

  const avgConsistency = useMemo(() => {
    if (schoolsWithMetrics.length === 0) return 0;
    const sum = schoolsWithMetrics.reduce((acc, s) => acc + s.consistency, 0);
    return +(sum / schoolsWithMetrics.length).toFixed(1);
  }, [schoolsWithMetrics]);

  const totalActiveRtl = useMemo(
    () => fosterSchools.reduce((acc, s) => acc + s.activeRtl, 0),
    [fosterSchools]
  );

  const goodStatusCount = useMemo(
    () => fosterSchools.filter((s) => s.status === 'TERPANTAU_BAIK').length,
    [fosterSchools]
  );
  const unupdatedStatusCount = useMemo(
    () => fosterSchools.filter((s) => s.status === 'BELUM_ADA_DATA').length,
    [fosterSchools]
  );
  const warningStatusCount = totalSchoolsCount - goodStatusCount - unupdatedStatusCount;

  // Kondisi Implementasi Program Penanda Hijau, Kuning, Merah
  const greenStatusCount = useMemo(
    () => fosterSchools.filter((s) => s.condition.color === 'GREEN').length,
    [fosterSchools]
  );
  const yellowStatusCount = useMemo(
    () => fosterSchools.filter((s) => s.condition.color === 'YELLOW').length,
    [fosterSchools]
  );
  const redStatusCount = useMemo(
    () => fosterSchools.filter((s) => s.condition.color === 'RED').length,
    [fosterSchools]
  );

  const totalActiveStudentsRegional = useMemo(
    () => fosterSchools.reduce((acc, s) => acc + s.activeStudents, 0),
    [fosterSchools]
  );

  const avgRegionalTeacherValidation = useMemo(() => {
    if (fosterSchools.length === 0) return 0;
    const sum = fosterSchools.reduce((acc, s) => acc + s.teacherValidationRate, 0);
    return Math.round(sum / fosterSchools.length);
  }, [fosterSchools]);

  const avgRegionalParentValidation = useMemo(() => {
    if (fosterSchools.length === 0) return 0;
    const sum = fosterSchools.reduce((acc, s) => acc + s.parentValidationRate, 0);
    return Math.round(sum / fosterSchools.length);
  }, [fosterSchools]);

  const avgRegionalHabitThreshold = useMemo(() => {
    if (fosterSchools.length === 0) return 0;
    const sum = fosterSchools.reduce((acc, s) => acc + s.avgHabitThresholdPct, 0);
    return Math.round(sum / fosterSchools.length);
  }, [fosterSchools]);

  const totalFosterCount = fosterSchools.length;
  const greenPct = totalFosterCount > 0 ? Math.round((greenStatusCount / totalFosterCount) * 100) : 0;
  const yellowPct = totalFosterCount > 0 ? Math.round((yellowStatusCount / totalFosterCount) * 100) : 0;
  const redPct = totalFosterCount > 0 ? Math.max(0, 100 - greenPct - yellowPct) : 0;

  const sidebarFilteredSchools = useMemo(() => {
    if (sidebarConditionFilter === 'ALL') return fosterSchools;
    return fosterSchools.filter((s) => s.condition.color === sidebarConditionFilter);
  }, [fosterSchools, sidebarConditionFilter]);

  // Habit Averages across schools for tab MONITORING
  const habitAverages = useMemo(() => {
    if (schoolsWithMetrics.length === 0) {
      return {
        wakeEarly: 0,
        worship: 0,
        exercise: 0,
        healthyEat: 0,
        learning: 0,
        social: 0,
        sleepEarly: 0,
      };
    }
    const count = schoolsWithMetrics.length;
    return {
      wakeEarly: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.wakeEarly, 0) / count).toFixed(1),
      worship: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.worship, 0) / count).toFixed(1),
      exercise: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.exercise, 0) / count).toFixed(1),
      healthyEat: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.healthyEat, 0) / count).toFixed(1),
      learning: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.learning, 0) / count).toFixed(1),
      social: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.social, 0) / count).toFixed(1),
      sleepEarly: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.sleepEarly, 0) / count).toFixed(1),
    };
  }, [schoolsWithMetrics]);

  // Selected School for Monitoring Portfolio
  const activeMonitoringSchool = useMemo(() => {
    if (selectedMonitoringSchoolId) {
      const found = fosterSchools.find((s) => s.id === selectedMonitoringSchoolId);
      if (found) return found;
    }
    return fosterSchools[0] || null;
  }, [fosterSchools, selectedMonitoringSchoolId]);

  const handleExportRegionalCsv = () => {
    if (fosterSchools.length === 0) {
      showToast('Belum ada data satuan pendidikan binaan untuk diekspor (default 0).');
      return;
    }
    const headers = [
      'NPSN',
      'Nama Satuan Pendidikan',
      'Jenjang',
      'Status Sekolah',
      'Akreditasi',
      'Kepala Sekolah',
      'NIP Kepala Sekolah',
      'Penanda Kondisi',
      'Kondisi Implementasi',
      'Total Murid Terdaftar',
      'Murid Aktif Terdata',
      'Persentase Murid Aktif (%)',
      'Total Jurnal Terisi',
      'Kelengkapan Jurnal (%)',
      'Validasi Guru (%)',
      'Validasi Orang Tua (%)',
      'Rerata Validasi Guru-Ortu (%)',
      'Ambang Bangun Pagi (≥75%) (%)',
      'Ambang Beribadah (≥75%) (%)',
      'Ambang Berolahraga (≥75%) (%)',
      'Ambang Makan Sehat (≥75%) (%)',
      'Ambang Gemar Belajar (≥75%) (%)',
      'Ambang Bermasyarakat (≥75%) (%)',
      'Ambang Tidur Cepat (≥75%) (%)',
      'Rerata Ambang 7 Kebiasaan (%)',
      'Keterlaksanaan Tindak Lanjut (%)',
      'RTL Selesai',
      'Total RTL',
      'RTL Aktif',
      'Tenaga Pendidik',
      'Rombel',
      'Fokus Prioritas',
      'Catatan Supervisi Pengawas',
    ];
    const rows = fosterSchools.map((s) => [
      `"${s.npsn}"`,
      `"${s.name}"`,
      s.jenjang,
      s.schoolStatus,
      s.akreditasi,
      `"${s.headmaster}"`,
      `"${s.headmasterNip}"`,
      `"${s.condition.color}"`,
      `"${s.condition.label}: ${s.condition.summary.replace(/"/g, '""')}"`,
      s.students,
      s.activeStudents,
      `${s.activeStudentsPercent}%`,
      s.totalJournals,
      `${s.completeness}%`,
      `${s.teacherValidationRate}%`,
      `${s.parentValidationRate}%`,
      `${s.avgValidationRate}%`,
      `${s.habitThresholdRates.wakeEarly}%`,
      `${s.habitThresholdRates.worship}%`,
      `${s.habitThresholdRates.exercise}%`,
      `${s.habitThresholdRates.healthyEat}%`,
      `${s.habitThresholdRates.learning}%`,
      `${s.habitThresholdRates.social}%`,
      `${s.habitThresholdRates.sleepEarly}%`,
      `${s.avgHabitThresholdPct}%`,
      `${s.followUpExecutionRate}%`,
      s.completedFollowUps,
      s.totalFollowUps,
      s.activeRtl,
      s.teachers,
      s.classes,
      `"${s.priorityHabit}"`,
      `"${s.supervisionNote.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      '\uFEFF' +
      [
        `"Matriks Komparasi Supervisi Satuan Pendidikan Binaan SI-7KAIH"`,
        `"Pengawas: ${currentPersona?.name || 'Pengawas Pembina'} - Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}"`,
        '',
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Matriks_Supervisi_Wilayah_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Matriks supervisi komparasi wilayah binaan berhasil diekspor (CSV).');
  };

  const handleGenerateSupervisorAi = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'SUPERVISOR_REGIONAL_ANALYSIS',
          payload: {
            supervisorName: currentPersona?.name || 'Pengawas Pembina',
            jurisdiction: 'Wilayah Binaan Satuan Pendidikan',
            totalSchools: totalSchoolsCount,
            totalStudents: totalStudentsCount,
            avgCompleteness,
            avgConsistency,
            schools: fosterSchools.map((s) => ({
              name: s.name,
              completeness: s.completeness,
              consistency: s.consistency,
              status: s.status,
              priority: s.priorityHabit,
            })),
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiSupervisorResult(json.data);
      } else {
        if (totalSchoolsCount === 0 || schoolsWithMetrics.length === 0) {
          setAiSupervisorResult({
            recordedFacts: [
              `Satuan pendidikan binaan terdata: ${totalSchoolsCount} sekolah dengan total ${totalStudentsCount} peserta didik dan ${totalTeachersCount} pendidik terdata.`,
              `Status entri data: Belum ada data jurnal atau aktivitas pembiasaan yang diperbarui oleh Admin Sekolah (kelengkapan rata-rata: ${avgCompleteness}%).`,
              `Konsistensi pembiasaan 7KAIH saat ini berada pada angka default 0% (menunggu pengisian mandiri).`,
            ],
            habitPatterns: [
              'Pola pembiasaan 7KAIH wilayah belum terbentuk karena belum ada aktivitas jurnal berkala yang diinput oleh satuan pendidikan.',
            ],
            dataLimitations: [
              'Seluruh metrik dan indikator saat ini berada pada kondisi default 0 karena belum ada sinkronisasi/entri data dari Super Admin dan Admin Sekolah.',
            ],
            hypothesesToVerify: [
              'Verifikasi kesiapan akun pengguna (guru, siswa, orang tua) dan perangkat pada satuan pendidikan binaan.',
            ],
            actionableRecommendations: [
              'Lakukan koordinasi dengan Dinas Pendidikan dan Admin Sekolah untuk pemutakhiran master siswa dan rombel.',
              'Sosialisasikan panduan pengisian jurnal harian 7KAIH kepada wali kelas dan paguyuban orang tua.',
              'Jadwalkan pendampingan awal aktivasi sistem untuk satuan pendidikan binaan.',
            ],
          });
        } else {
          setAiSupervisorResult({
            recordedFacts: [
              `Membina ${totalSchoolsCount} satuan pendidikan dengan total ${totalStudentsCount} peserta didik dan ${totalTeachersCount} pendidik terdata.`,
              `Rata-rata kelengkapan pengisian jurnal wilayah mencapai ${avgCompleteness}%.`,
              `Rata-rata konsistensi pembiasaan 7KAIH berada di angka ${avgConsistency}%.`,
            ],
            habitPatterns: [
              'Capaian dimensi kebiasaan terdistribusi sesuai dengan data entri mandiri satuan pendidikan.',
              'Perlu perhatian pada dimensi dengan persentase terendah untuk penguatan berkelanjutan.',
            ],
            dataLimitations: [
              'Akurasi analisis bergantung pada keteraturan input jurnal harian oleh siswa dan validasi guru/orang tua.',
            ],
            hypothesesToVerify: [
              'Keterlibatan orang tua dalam validasi berkorelasi positif dengan konsistensi pembiasaan siswa.',
            ],
            actionableRecommendations: [
              'Fasilitasi forum peer sharing antar-kepala sekolah (MKKS) untuk replikasi praktik baik.',
              'Jadwalkan pendampingan supervisi klinis ke satuan pendidikan dengan kategori perlu penguatan.',
              'Tingkatkan keterlibatan paguyuban orang tua dalam pemantauan jurnal anak di rumah.',
            ],
          });
        }
      }
    } catch {
      setAiSupervisorResult({
        recordedFacts: [
          `Satuan pendidikan binaan: ${totalSchoolsCount} sekolah, ${totalStudentsCount} peserta didik, rata-rata kelengkapan ${avgCompleteness}%.`,
        ],
        habitPatterns: [
          totalSchoolsCount === 0 || schoolsWithMetrics.length === 0
            ? 'Pola pembiasaan belum terbentuk (menunggu entri data satuan pendidikan).'
            : 'Konsistensi pembiasaan terpantau berbasis data sinkronisasi sekolah.',
        ],
        dataLimitations: ['Ketergantungan pada kelengkapan sinkronisasi data Dapodik/lokal.'],
        hypothesesToVerify: ['Kesiapan sarana pendukung digital di satuan pendidikan binaan.'],
        actionableRecommendations: ['Lakukan kunjungan supervisi dan koordinasi aktivasi akun satuan pendidikan.'],
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <div className={printPdfMode ? 'no-print' : 'space-y-6'}>
      {/* Supervisor Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-800 text-white flex items-center justify-center text-2xl shadow-sm">
            🧭
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                Dashboard Pengawas Pembina • Wilayah Binaan
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
                {totalSchoolsCount} Satuan Pendidikan
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                IAM Mandiri Terverifikasi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pengawas: <strong>{currentPersona?.name || 'Pengawas Pembina'}</strong> (NIP: {currentPersona?.identifierValue || '-'}) • Wilayah Pembinaan Satuan Pendidikan
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => {
                  syncAllData();
                  showToast('Data sekolah binaan berhasil diperbarui!');
                }}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                title="Perbarui data sekolah binaan"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Perbarui Data'}</span>
              </button>
              <span className="text-[11px] text-slate-400">
                Pembaruan terakhir: {lastSyncTime}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPrintPdfMode('REGIONAL')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Cetak & Unduh Dokumen PDF Rekapitulasi Portofolio 7KAIH Wilayah Binaan"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Dokumen Cetak / PDF</span>
          </button>
          <button
            type="button"
            onClick={handleExportRegionalCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Ekspor Seluruh Matriks Wilayah Binaan ke File CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Tata Letak 2-Kolom: Seluruh Tab/Tombol Dashboard Pengawas Diletakkan Disamping Kiri Memanjang ke Bawah */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Navigasi Bilah Sisi Kiri (Sidebar) Memanjang ke Bawah */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-4 lg:sticky lg:top-6">
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="px-2 py-1 border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Menu Pengawas Pembina
              </span>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">
                Navigasi Wilayah Binaan
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pilih modul supervisi & evaluasi
              </p>
            </div>

            <nav className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('REGIONAL_OVERVIEW')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === 'REGIONAL_OVERVIEW'
                    ? 'bg-[#0753A5] text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className={`w-4 h-4 shrink-0 ${activeTab === 'REGIONAL_OVERVIEW' ? 'text-white' : 'text-[#0753A5]'}`} />
                  <span className="leading-tight">Ringkasan Wilayah</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    activeTab === 'REGIONAL_OVERVIEW' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#0753A5]'
                  }`}
                >
                  Utama
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('COMPARISON')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === 'COMPARISON'
                    ? 'bg-[#0753A5] text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <School className={`w-4 h-4 shrink-0 ${activeTab === 'COMPARISON' ? 'text-white' : 'text-[#0753A5]'}`} />
                  <span className="leading-tight">Komparasi Sekolah</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    activeTab === 'COMPARISON' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {totalSchoolsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('MONITORING')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === 'MONITORING'
                    ? 'bg-[#0753A5] text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'MONITORING' ? 'text-white' : 'text-[#0753A5]'}`} />
                  <span className="leading-tight">Portofolio 7KAIH</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    activeTab === 'MONITORING' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  PDF
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TRENDS')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === 'TRENDS'
                    ? 'bg-[#0753A5] text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className={`w-4 h-4 shrink-0 ${activeTab === 'TRENDS' ? 'text-white' : 'text-[#0753A5]'}`} />
                  <span className="leading-tight">Tren Bulanan</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    activeTab === 'TRENDS' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Chart
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('RTL')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === 'RTL'
                    ? 'bg-[#0753A5] text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'RTL' ? 'text-white' : 'text-[#0753A5]'}`} />
                  <span className="leading-tight">RTL Pengawasan</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    activeTab === 'RTL' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {totalActiveRtl}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('AI_REGIONAL');
                  if (!aiSupervisorResult) handleGenerateSupervisorAi();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === 'AI_REGIONAL'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
                  <span className="leading-tight">AI Analisis Wilayah</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    activeTab === 'AI_REGIONAL' ? 'bg-white/20 text-white' : 'bg-indigo-200 text-indigo-900'
                  }`}
                >
                  AI
                </span>
              </button>

              {onSelectTab && (
                <button
                  type="button"
                  onClick={() => onSelectTab('account-settings')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border-t border-slate-100 mt-1 pt-3"
                  title="Buka Pengaturan Akun & Preferensi Pengawas"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 shrink-0 text-slate-500" />
                    <span className="leading-tight">Pengaturan Akun</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Akun
                  </span>
                </button>
              )}
            </nav>

            {/* Widget Grafik & Tabel Kondisi Sekolah Binaan */}
            <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3 text-xs shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                    Kondisi Sekolah Binaan
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {totalFosterCount} Sekolah
                </span>
              </div>

              {/* Grafik Distribusi Kondisi (Hijau, Kuning, Merah) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                  <span>Grafik Sebaran Kondisi</span>
                  <span className="font-bold text-emerald-700">{greenPct}% Optimal</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                  {greenStatusCount > 0 && (
                    <div
                      style={{ width: `${greenPct}%` }}
                      className="bg-emerald-500 h-full transition-all duration-300 hover:brightness-110"
                      title={`Optimal (Hijau): ${greenStatusCount} sekolah (${greenPct}%)`}
                    />
                  )}
                  {yellowStatusCount > 0 && (
                    <div
                      style={{ width: `${yellowPct}%` }}
                      className="bg-amber-500 h-full transition-all duration-300 hover:brightness-110"
                      title={`Pendampingan (Kuning): ${yellowStatusCount} sekolah (${yellowPct}%)`}
                    />
                  )}
                  {redStatusCount > 0 && (
                    <div
                      style={{ width: `${redPct}%` }}
                      className="bg-rose-500 h-full transition-all duration-300 hover:brightness-110"
                      title={`Kritis (Merah): ${redStatusCount} sekolah (${redPct}%)`}
                    />
                  )}
                </div>

                {/* Filter Penanda & Quick Counts */}
                <div className="grid grid-cols-4 gap-1 pt-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSidebarConditionFilter('ALL')}
                    className={`py-1 px-0.5 rounded-md text-center font-bold transition-all cursor-pointer truncate ${
                      sidebarConditionFilter === 'ALL'
                        ? 'bg-slate-800 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Semua ({totalFosterCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarConditionFilter('GREEN')}
                    className={`py-1 px-0.5 rounded-md text-center font-bold transition-all cursor-pointer truncate ${
                      sidebarConditionFilter === 'GREEN'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    }`}
                    title="Optimal (Hijau)"
                  >
                    🟢 {greenStatusCount}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarConditionFilter('YELLOW')}
                    className={`py-1 px-0.5 rounded-md text-center font-bold transition-all cursor-pointer truncate ${
                      sidebarConditionFilter === 'YELLOW'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                    }`}
                    title="Pendampingan (Kuning)"
                  >
                    🟡 {yellowStatusCount}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarConditionFilter('RED')}
                    className={`py-1 px-0.5 rounded-md text-center font-bold transition-all cursor-pointer truncate ${
                      sidebarConditionFilter === 'RED'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'
                    }`}
                    title="Kritis (Merah)"
                  >
                    🔴 {redStatusCount}
                  </button>
                </div>
              </div>

              {/* Tabel Ringkas Kondisi Implementasi Sekolah Binaan */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>Tabel Sekolah</span>
                  <span>Penanda</span>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                  {sidebarFilteredSchools.length === 0 ? (
                    <div className="p-3 text-center text-[11px] text-slate-400">
                      Tidak ada sekolah pada kategori ini.
                    </div>
                  ) : (
                    sidebarFilteredSchools.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSchool(s)}
                        className="p-2 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                        title="Klik untuk melihat catatan supervisi & detail sekolah"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-800 truncate group-hover:text-[#0753A5]">
                            {s.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                            <span>{s.jenjang || 'Satuan'}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-600">
                              {s.completeness}% jurnal
                            </span>
                          </div>
                        </div>

                        {s.condition.color === 'GREEN' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Hijau
                          </span>
                        )}
                        {s.condition.color === 'YELLOW' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Kuning
                          </span>
                        )}
                        {s.condition.color === 'RED' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Merah
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Button: Buka Tabel Matriks Lengkap */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('REGIONAL_OVERVIEW');
                  setAggregateViewMode('TABLE');
                }}
                className="w-full py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold text-center transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Table className="w-3 h-3 text-slate-500" />
                <span>Lihat Tabel Matriks Lengkap</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Area Konten Utama Dashboard Pengawas (Di Samping Kanan Sidebar) */}
        <main className="flex-1 min-w-0 w-full space-y-6">

      {activeTab === 'REGIONAL_OVERVIEW' && (
        <div className="space-y-6">
          {/* Bar Tombol Info Ringkasan Satuan Pendidikan Binaan */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0753A5] flex items-center justify-center font-bold shadow-2xs shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Ringkasan Wilayah Satuan Pendidikan Binaan
                </h3>
                <p className="text-xs text-slate-500">
                  Monitoring implementasi & evaluasi mutu pembiasaan 7KAIH
                </p>
              </div>
            </div>

            {/* Satu Tombol Info Tersendiri */}
            <button
              type="button"
              onClick={() => setShowRegionalStatsModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#0753A5] border border-blue-200 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
              title="Buka info jumlah satuan pendidikan binaan, total siswa, kelengkapan, dan konsistensi"
            >
              <Info className="w-4 h-4 text-[#0753A5] shrink-0" />
              <span>Info Statistik Satuan Pendidikan Binaan</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#0753A5] border border-blue-200 font-bold shadow-2xs">
                {totalSchoolsCount} Sekolah • {totalStudentsCount} Siswa
              </span>
            </button>
          </div>

          {/* ========================================================================== */}
          {/* GRAFIK & TABEL KONDISI IMPLEMENTASI SEKOLAH BINAAN (PENANDA HIJAU, KUNING, MERAH) */}
          {/* Murid Aktif, Kelengkapan Jurnal, Validasi Guru-Ortu, Ambang 7 Kebiasaan,   */}
          {/* Keterlaksanaan Tindak Lanjut Sekolah, & Penanda Hijau/Kuning/Merah        */}
          {/* ========================================================================== */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-sky-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Grafik & Tabel Kondisi Implementasi Sekolah Binaan
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Penanda Hijau, Kuning, Merah
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Evaluasi komprehensif kondisi implementasi program 7KAIH sekolah binaan mencakup keaktifan murid, kelengkapan jurnal, validasi, dan keterlaksanaan tindak lanjut.
                  </p>
                </div>
              </div>

              {/* View Switcher: Tabel Matriks vs Kartu Detail & Ekspor CSV */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportRegionalCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Ekspor Seluruh Indikator Agregat Satuan Pendidikan ke File CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ekspor CSV</span>
                </button>

                <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setAggregateViewMode('TABLE')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      aggregateViewMode === 'TABLE'
                        ? 'bg-white text-[#0753A5] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Tabel Matriks</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAggregateViewMode('CARDS')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      aggregateViewMode === 'CARDS'
                        ? 'bg-white text-[#0753A5] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Kartu Detail</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Graphic: Grafik Proporsi Kondisi Implementasi Sekolah Binaan */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-900">
                    Grafik Distribusi Kondisi Implementasi Sekolah Binaan
                  </span>
                </div>
                <span className="text-slate-500 text-[11px] font-semibold">
                  Total {totalFosterCount} Satuan Pendidikan Binaan
                </span>
              </div>
              <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                {greenStatusCount > 0 && (
                  <div
                    style={{ width: `${greenPct}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500 hover:brightness-110 flex items-center justify-center text-[10px] text-white font-bold"
                    title={`Optimal (Hijau): ${greenStatusCount} sekolah (${greenPct}%)`}
                  >
                    {greenPct > 12 ? `${greenPct}%` : ''}
                  </div>
                )}
                {yellowStatusCount > 0 && (
                  <div
                    style={{ width: `${yellowPct}%` }}
                    className="bg-amber-500 h-full transition-all duration-500 hover:brightness-110 flex items-center justify-center text-[10px] text-white font-bold"
                    title={`Pendampingan (Kuning): ${yellowStatusCount} sekolah (${yellowPct}%)`}
                  >
                    {yellowPct > 12 ? `${yellowPct}%` : ''}
                  </div>
                )}
                {redStatusCount > 0 && (
                  <div
                    style={{ width: `${redPct}%` }}
                    className="bg-rose-500 h-full transition-all duration-500 hover:brightness-110 flex items-center justify-center text-[10px] text-white font-bold"
                    title={`Kritis (Merah): ${redStatusCount} sekolah (${redPct}%)`}
                  >
                    {redPct > 12 ? `${redPct}%` : ''}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Optimal (Hijau): <strong>{greenStatusCount}</strong> sekolah ({greenPct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Pendampingan (Kuning): <strong>{yellowStatusCount}</strong> sekolah ({yellowPct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-800 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span>Kritis (Merah): <strong>{redStatusCount}</strong> sekolah ({redPct}%)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowConditionLegend((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-all cursor-pointer"
                  title="Tampilkan atau sembunyikan keterangan kriteria penanda hijau, kuning, merah"
                >
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>{showConditionLegend ? 'Sembunyikan Keterangan Penanda' : 'Lihat Keterangan Penanda'}</span>
                </button>
              </div>
            </div>

            {/* Banner Penanda Kondisi Implementasi Program di Sekolah (Disembunyikan secara default) */}
            {showConditionLegend && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs transition-all">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                      <strong className="text-emerald-950 font-black text-xs uppercase tracking-wider">
                        Penanda Hijau (Optimal)
                      </strong>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {greenStatusCount} Sekolah
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                    Kelengkapan jurnal ≥75%, validasi guru & orang tua ≥70%, persentase murid mencapai ambang 7 kebiasaan ≥70%, serta RTL berjalan baik.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                      <strong className="text-amber-950 font-black text-xs uppercase tracking-wider">
                        Penanda Kuning (Pendampingan)
                      </strong>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {yellowStatusCount} Sekolah
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    Program telah berjalan (kelengkapan 45%–74%), memerlukan penguatan pendampingan pengawas pada validasi rutin atau konsistensi pembiasaan siswa.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                      <strong className="text-rose-950 font-black text-xs uppercase tracking-wider">
                        Penanda Merah (Kritis)
                      </strong>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {redStatusCount} Sekolah
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-900/90 leading-relaxed">
                    Tingkat partisipasi atau kelengkapan &lt;45%, minim validasi, atau belum ada entri aktif. Membutuhkan intervensi dan supervisi klinis pengawas pembina.
                  </p>
                </div>
              </div>
            )}

            {/* Filter Pills berdasarkan Kondisi Implementasi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Filter Penanda:
                </span>
                <button
                  type="button"
                  onClick={() => setAggregateConditionFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aggregateConditionFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({fosterSchools.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAggregateConditionFilter('GREEN')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aggregateConditionFilter === 'GREEN'
                      ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-300'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Optimal ({greenStatusCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAggregateConditionFilter('YELLOW')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aggregateConditionFilter === 'YELLOW'
                      ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Pendampingan ({yellowStatusCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAggregateConditionFilter('RED')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aggregateConditionFilter === 'RED'
                      ? 'bg-rose-700 text-white shadow-xs ring-2 ring-rose-300'
                      : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Kritis ({redStatusCount})</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Menampilkan <strong>{aggregateSchools.length}</strong> dari {fosterSchools.length} satuan pendidikan
              </div>
            </div>

            {/* Konten Indikator Agregat: Tabel Matriks atau Kartu Detail */}
            {aggregateSchools.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">
                  Tidak Ada Satuan Pendidikan pada Kategori Ini
                </h4>
                <p className="text-xs text-slate-500">
                  Silakan pilih filter kondisi penanda lain atau reset ke &quot;Semua&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => setAggregateConditionFilter('ALL')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
                >
                  Reset Filter Penanda
                </button>
              </div>
            ) : aggregateViewMode === 'TABLE' ? (
              /* ======================================================== */
              /* TAMPILAN 1: TABEL MATRIKS INDIKATOR AGREGAT LENGKAP     */
              /* ======================================================== */
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-3.5 w-10 text-center">No</th>
                      <th className="py-3.5 px-4 min-w-[200px]">Satuan Pendidikan & Status</th>
                      <th className="py-3.5 px-3 min-w-[130px] text-center">Penanda Kondisi</th>
                      <th className="py-3.5 px-3 min-w-[130px] text-center">Murid Aktif</th>
                      <th className="py-3.5 px-3 min-w-[120px] text-center">Kelengkapan Jurnal</th>
                      <th className="py-3.5 px-3 min-w-[140px] text-center">Validasi Guru & Ortu</th>
                      <th className="py-3.5 px-3 min-w-[220px] text-center">Ambang 7 Kebiasaan (≥75%)</th>
                      <th className="py-3.5 px-3 min-w-[130px] text-center">Keterlaksanaan RTL</th>
                      <th className="py-3.5 px-3.5 text-center w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {aggregateSchools.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Nama Sekolah & Identitas */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleOpenSchoolModal(s)}
                            className="text-left font-black text-slate-900 hover:text-[#0753A5] transition-colors cursor-pointer block leading-snug"
                          >
                            {s.name}
                          </button>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className="font-mono">{s.npsn}</span>
                            <span>•</span>
                            <span>{s.jenjang}</span>
                            <span>•</span>
                            <span>Akreditasi {s.akreditasi}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            KS: {s.headmaster}
                          </div>
                        </td>

                        {/* Penanda Hijau, Kuning, atau Merah Kondisi Implementasi */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-2xs ${s.condition.badgeBg}`}
                              title={s.condition.summary}
                            >
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${s.condition.dot} ${
                                  s.condition.color === 'GREEN' ? 'animate-pulse' : ''
                                }`}
                              ></span>
                              <span>{s.condition.label}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 max-w-[120px] truncate block" title={s.condition.summary}>
                              {s.condition.color === 'GREEN'
                                ? 'Optimal Memenuhi Ambang'
                                : s.condition.color === 'YELLOW'
                                ? 'Perlu Pendampingan'
                                : 'Intervensi Pengawas'}
                            </span>
                          </div>
                        </td>

                        {/* Murid Aktif */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="space-y-1">
                            <div className="font-black text-slate-900 text-xs">
                              {s.activeStudents} / {s.students}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-500">
                              ({s.activeStudentsPercent}% Aktif)
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden max-w-[100px] mx-auto">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                  s.activeStudentsPercent >= 80
                                    ? 'bg-emerald-600'
                                    : s.activeStudentsPercent >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${s.activeStudentsPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Kelengkapan Jurnal */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="space-y-1">
                            <div className={`font-black text-sm ${s.completeness >= 75 ? 'text-[#0753A5]' : s.completeness >= 45 ? 'text-amber-700' : 'text-rose-600'}`}>
                              {s.completeness}%
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {s.totalJournals} Jurnal
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden max-w-[90px] mx-auto">
                              <div
                                className={`h-1.5 rounded-full ${
                                  s.completeness >= 75
                                    ? 'bg-blue-600'
                                    : s.completeness >= 45
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${s.completeness}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Tingkat Validasi Guru & Orang Tua */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1 text-[11px] max-w-[130px] mx-auto">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-slate-500 text-[10px]">Guru:</span>
                              <span className="font-bold text-slate-800">{s.teacherValidationRate}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-slate-500 text-[10px]">Orang Tua:</span>
                              <span className="font-bold text-slate-800">{s.parentValidationRate}%</span>
                            </div>
                            <div className="pt-0.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-indigo-700">
                              <span>Rerata:</span>
                              <span>{s.avgValidationRate}%</span>
                            </div>
                          </div>
                        </td>

                        {/* Persentase Murid Mencapai Ambang Pembiasaan pada Setiap Kebiasaan */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1.5 max-w-[230px] mx-auto">
                            <div className="grid grid-cols-4 gap-1 text-[10px] font-semibold text-center">
                              <span
                                className={`p-1 rounded-md border ${
                                  s.habitThresholdRates.wakeEarly >= 75
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                    : s.habitThresholdRates.wakeEarly >= 50
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                                title="Bangun Pagi (Persentase murid capai ambang ≥75%)"
                              >
                                🌅 {s.habitThresholdRates.wakeEarly}%
                              </span>
                              <span
                                className={`p-1 rounded-md border ${
                                  s.habitThresholdRates.worship >= 75
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                    : s.habitThresholdRates.worship >= 50
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                                title="Beribadah (Persentase murid capai ambang ≥75%)"
                              >
                                🤲 {s.habitThresholdRates.worship}%
                              </span>
                              <span
                                className={`p-1 rounded-md border ${
                                  s.habitThresholdRates.exercise >= 75
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                    : s.habitThresholdRates.exercise >= 50
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                                title="Berolahraga (Persentase murid capai ambang ≥75%)"
                              >
                                🏃 {s.habitThresholdRates.exercise}%
                              </span>
                              <span
                                className={`p-1 rounded-md border ${
                                  s.habitThresholdRates.healthyEat >= 75
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                    : s.habitThresholdRates.healthyEat >= 50
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                                title="Makan Sehat (Persentase murid capai ambang ≥75%)"
                              >
                                🥗 {s.habitThresholdRates.healthyEat}%
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-[10px] font-semibold text-center">
                              <span
                                className={`p-1 rounded-md border ${
                                  s.habitThresholdRates.learning >= 75
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                    : s.habitThresholdRates.learning >= 50
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                                title="Gemar Belajar / Membaca (Persentase murid capai ambang ≥75%)"
                              >
                                📖 {s.habitThresholdRates.learning}%
                              </span>
                              <span
                                className={`p-1 rounded-md border ${
                                  s.habitThresholdRates.social >= 75
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                    : s.habitThresholdRates.social >= 50
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                                title="Bermasyarakat / Gotong Royong (Persentase murid capai ambang ≥75%)"
                              >
                                🤝 {s.habitThresholdRates.social}%
                              </span>
                              <span
                                className={`p-1 rounded-md border ${
                                  s.habitThresholdRates.sleepEarly >= 75
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                    : s.habitThresholdRates.sleepEarly >= 50
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                                title="Tidur Cepat (Persentase murid capai ambang ≥75%)"
                              >
                                🌙 {s.habitThresholdRates.sleepEarly}%
                              </span>
                            </div>
                            <div className="text-[10px] text-center text-slate-500 font-bold flex items-center justify-between px-1">
                              <span>Rerata Ambang:</span>
                              <span className={`font-black ${s.avgHabitThresholdPct >= 70 ? 'text-emerald-700' : 'text-slate-700'}`}>
                                {s.avgHabitThresholdPct}%
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Keterlaksanaan Tindak Lanjut Sekolah */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="space-y-1">
                            <div className="font-black text-slate-900 text-xs">
                              {s.followUpExecutionRate}%
                            </div>
                            <div className="text-[10px] font-semibold text-slate-500">
                              {s.completedFollowUps} / {s.totalFollowUps} RTL Selesai
                            </div>
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                s.totalFollowUps === 0
                                  ? 'bg-slate-100 text-slate-500'
                                  : s.completedFollowUps === s.totalFollowUps
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {s.totalFollowUps === 0
                                ? 'Belum Ada RTL'
                                : s.completedFollowUps === s.totalFollowUps
                                ? 'Terlaksana Penuh'
                                : `${s.inProgressFollowUps} Berjalan`}
                            </span>
                          </div>
                        </td>

                        {/* Aksi Supervisi */}
                        <td className="py-3.5 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenSchoolModal(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0753A5] text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                            title="Beri Catatan Supervisi Klinis Pengawas"
                          >
                            <span>Catatan</span>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ======================================================== */
              /* TAMPILAN 2: KARTU INDIKATOR DETAIL TIAP SEKOLAH         */
              /* ======================================================== */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aggregateSchools.map((s) => (
                  <div
                    key={s.id}
                    className="p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs space-y-4 hover:border-blue-300 transition-all"
                  >
                    {/* Header Kartu Sekolah & Penanda */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
                          🏫
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">
                            {s.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            NPSN: <span className="font-mono font-semibold">{s.npsn}</span> • {s.schoolStatus} • Akreditasi {s.akreditasi}
                          </p>
                        </div>
                      </div>

                      {/* Penanda Hijau / Kuning / Merah */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-2xs shrink-0 ${s.condition.badgeBg}`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${s.condition.dot} ${
                            s.condition.color === 'GREEN' ? 'animate-pulse' : ''
                          }`}
                        ></span>
                        <span>{s.condition.label}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {s.condition.summary}
                    </p>

                    {/* 4 Quick Metrics Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Murid Aktif</span>
                        <span className="font-black text-slate-900 text-sm">{s.activeStudents}</span>
                        <span className="text-[10px] text-slate-400 block">/ {s.students} ({s.activeStudentsPercent}%)</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Kelengkapan</span>
                        <span className="font-black text-indigo-700 text-sm">{s.completeness}%</span>
                        <span className="text-[10px] text-slate-400 block">{s.totalJournals} Jurnal</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Validasi Ortu/Guru</span>
                        <span className="font-black text-emerald-800 text-sm">{s.avgValidationRate}%</span>
                        <span className="text-[10px] text-slate-400 block">G: {s.teacherValidationRate}% • O: {s.parentValidationRate}%</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Tindak Lanjut</span>
                        <span className="font-black text-purple-800 text-sm">{s.followUpExecutionRate}%</span>
                        <span className="text-[10px] text-slate-400 block">{s.completedFollowUps}/{s.totalFollowUps} Selesai</span>
                      </div>
                    </div>

                    {/* 7 Kebiasaan Breakdown Bar (% Murid Capai Ambang >=75%) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">Persentase Murid Capai Ambang (≥75%):</span>
                        <span className="font-black text-slate-900">Rerata {s.avgHabitThresholdPct}%</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-600">
                            <span>🌅 Bangun Pagi</span>
                            <span className="font-bold">{s.habitThresholdRates.wakeEarly}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-500 h-1.5 rounded-full"
                              style={{ width: `${s.habitThresholdRates.wakeEarly}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-600">
                            <span>🤲 Beribadah</span>
                            <span className="font-bold">{s.habitThresholdRates.worship}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-rose-500 h-1.5 rounded-full"
                              style={{ width: `${s.habitThresholdRates.worship}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-600">
                            <span>🏃 Berolahraga</span>
                            <span className="font-bold">{s.habitThresholdRates.exercise}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-1.5 rounded-full"
                              style={{ width: `${s.habitThresholdRates.exercise}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-600">
                            <span>🥗 Makan Sehat</span>
                            <span className="font-bold">{s.habitThresholdRates.healthyEat}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-lime-600 h-1.5 rounded-full"
                              style={{ width: `${s.habitThresholdRates.healthyEat}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-600">
                            <span>📖 Gemar Belajar</span>
                            <span className="font-bold">{s.habitThresholdRates.learning}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${s.habitThresholdRates.learning}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-600">
                            <span>🤝 Bermasyarakat</span>
                            <span className="font-bold">{s.habitThresholdRates.social}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${s.habitThresholdRates.social}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <div className="flex justify-between text-[10px] text-slate-600">
                            <span>🌙 Istirahat Cepat / Tepat Waktu</span>
                            <span className="font-bold">{s.habitThresholdRates.sleepEarly}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-purple-600 h-1.5 rounded-full"
                              style={{ width: `${s.habitThresholdRates.sleepEarly}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Catatan & Aksi */}
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        KS: <strong>{s.headmaster}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenSchoolModal(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0753A5] font-bold text-xs cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Beri Catatan Supervisi</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari sekolah binaan, NPSN, atau nama kepala sekolah..."
                className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Jenjang:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                {(['ALL', 'SD', 'SMP', 'SMA'] as const).map((j) => (
                  <button
                    key={j}
                    onClick={() => setFilterJenjang(j)}
                    className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filterJenjang === j ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {j === 'ALL' ? 'Semua' : j}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* School List Cards synchronized with live Master */}
          {filteredSchools.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto text-2xl">
                🏫
              </div>
              <h3 className="text-base font-black text-slate-900">
                {searchQuery || filterJenjang !== 'ALL'
                  ? 'Sekolah Tidak Ditemukan'
                  : 'Belum Ada Satuan Pendidikan Binaan Terdata'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {searchQuery || filterJenjang !== 'ALL'
                  ? 'Tidak ada satuan pendidikan binaan yang sesuai dengan filter pencarian atau jenjang.'
                  : 'Belum ada data sekolah yang didaftarkan oleh Super Admin atau diperbarui oleh Admin Sekolah. Semua indikator diset ke default 0.'}
              </p>
              {searchQuery || filterJenjang !== 'ALL' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterJenjang('ALL');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Reset Filter</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    syncAllData();
                    showToast('Data diperbarui dari sistem.');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0753A5] text-xs font-bold transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Periksa Pembaruan Data</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSchools.map((s) => (
                <div
                  key={s.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base">
                        🏫
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{s.name}</h3>
                        <p className="text-[11px] text-slate-500">
                          NPSN: <strong>{s.npsn}</strong> • {s.schoolStatus} • Akreditasi {s.akreditasi}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        s.status === 'TERPANTAU_BAIK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'BELUM_ADA_DATA'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.status === 'TERPANTAU_BAIK'
                        ? 'Terpantau Baik'
                        : s.status === 'BELUM_ADA_DATA'
                        ? 'Belum Ada Data (0)'
                        : 'Perlu Penguatan'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-2xl">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Kelengkapan</span>
                      <p className="font-bold text-[#0753A5] text-sm mt-0.5">{s.completeness}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Konsistensi</span>
                      <p className="font-bold text-emerald-700 text-sm mt-0.5">{s.consistency}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">RTL Aktif</span>
                      <p className="font-bold text-indigo-700 text-sm mt-0.5">{s.activeRtl} Rencana</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>Kepala Sekolah: <strong>{s.headmaster}</strong></div>
                    <div className="text-[11px] text-slate-500">Fokus Pembiasaan: <span className="font-semibold text-amber-800">{s.priorityHabit}</span></div>
                    {s.supervisionNote && (
                      <div className="text-[11px] text-blue-900 bg-blue-50/70 p-2 rounded-xl border border-blue-100 italic">
                        &quot;{s.supervisionNote}&quot;
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>{s.students} Siswa • {s.teachers} Guru • {s.classes} Rombel</span>
                    <button
                      onClick={() => handleOpenSchoolModal(s)}
                      className="font-bold text-[#0753A5] hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 px-3 py-1 rounded-xl"
                    >
                      <span>Beri Catatan Supervisi</span>
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'COMPARISON' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Matriks Komparasi {totalSchoolsCount} Satuan Pendidikan Binaan
              </h3>
              <p className="text-xs text-slate-500">
                Data teragregasi langsung dari Master Super Admin & Entri Admin Sekolah
              </p>
            </div>
            <button
              onClick={handleExportRegionalCsv}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Ekspor Matriks Wilayah (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Nama Sekolah</th>
                  <th className="py-3 px-3">NPSN</th>
                  <th className="py-3 px-3">Kepala Sekolah</th>
                  <th className="py-3 px-3">Peserta Didik</th>
                  <th className="py-3 px-3">Kelengkapan</th>
                  <th className="py-3 px-3">Konsistensi</th>
                  <th className="py-3 px-3">Status Monitoring</th>
                  <th className="py-3 px-3">RTL Aktif</th>
                  <th className="py-3 px-3 text-center">Aksi Supervisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fosterSchools.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <School className="w-8 h-8 text-slate-300" />
                        <span className="text-xs font-bold text-slate-700">Belum Ada Satuan Pendidikan Binaan</span>
                        <span className="text-[11px] text-slate-400 max-w-sm">
                          Semua metrik komparasi wilayah diset ke default 0 menunggu pendaftaran satuan pendidikan oleh Super Admin dan pembaruan oleh Admin Sekolah.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  fosterSchools.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <button
                          onClick={() => handleOpenSchoolModal(s)}
                          className="text-left font-bold text-slate-900 hover:text-[#0753A5] transition-colors cursor-pointer"
                        >
                          {s.name}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{s.npsn}</td>
                      <td className="py-3 px-3 text-slate-600">{s.headmaster}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{s.students} Anak</td>
                      <td className="py-3 px-3 font-bold text-[#0753A5]">{s.completeness}%</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">{s.consistency}%</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'TERPANTAU_BAIK'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'BELUM_ADA_DATA'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status === 'TERPANTAU_BAIK'
                            ? 'Terpantau Baik'
                            : s.status === 'BELUM_ADA_DATA'
                            ? 'Belum Ada Data (0)'
                            : 'Perlu Penguatan'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{s.activeRtl} Rencana</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenSchoolModal(s)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-[#0753A5] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Supervisi</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Prinsip Supervisi: Komparasi bertujuan kolaborasi antar-sekolah (peer sharing), bukan kompetisi diskriminatif.</span>
          </div>
        </div>
      )}

      {activeTab === 'MONITORING' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Portofolio Distribusi 7 Kebiasaan Lintas Satuan Pendidikan
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0753A5] border border-blue-200">
                  {totalSchoolsCount} Sekolah Binaan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Agregat pencapaian 7 dimensi kebiasaan lintas {totalSchoolsCount} sekolah binaan ({totalStudentsCount} siswa).
              </p>
            </div>

            {/* Tombol Unduh PDF Rekapitulasi Portofolio 7KAIH Wilayah & Persekolah */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setPrintPdfMode('REGIONAL')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                title="Cetak & Unduh Dokumen PDF Rekapitulasi Portofolio 7KAIH Seluruh Wilayah Binaan"
              >
                <Printer className="w-4 h-4" />
                <span>Unduh PDF Rekapitulasi Wilayah</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!selectedMonitoringSchoolId && fosterSchools.length > 0) {
                    setSelectedMonitoringSchoolId(fosterSchools[0].id);
                  }
                  setPrintPdfMode('PER_SCHOOL');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                title="Cetak & Unduh Dokumen PDF Rekapitulasi Portofolio 7KAIH Satuan Pendidikan (Per Sekolah)"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF Per Sekolah</span>
              </button>
            </div>
          </div>

          {/* Filter Rentang Tanggal Portofolio (Mingguan / Bulanan / Kustom) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20 border border-slate-200/90 space-y-3.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#0753A5] text-white flex items-center justify-center shadow-2xs">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Filter Periode Rentang Tanggal Laporan
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0753A5] border border-blue-200">
                      {activePeriodLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Memfilter metrik agregat 7 kebiasaan wilayah dan otomatis tercetak pada dokumen PDF unduhan
                  </p>
                </div>
              </div>

              {/* Status Jumlah Jurnal */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#0753A5]" />
                <span>
                  <strong>{totalFilteredJournalsCount}</strong> entri jurnal terpantau
                  {dateRangePreset !== 'ALL' && filterStartDate && filterEndDate && (
                    <span className="text-slate-500 font-normal"> ({periodDaysCount} hari)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Tombol Pilihan Preset Periode Cepat */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {[
                { id: 'ALL', label: 'Semua Periode', icon: '🌐' },
                { id: 'LAST_7_DAYS', label: '7 Hari (Mingguan)', icon: '⚡' },
                { id: 'THIS_MONTH', label: 'Bulan Ini', icon: '📅' },
                { id: 'LAST_MONTH', label: 'Bulan Lalu', icon: '🗓️' },
                { id: 'LAST_30_DAYS', label: '30 Hari Terakhir', icon: '⏱️' },
                { id: 'THIS_SEMESTER', label: 'Semester Ganjil', icon: '🎓' },
                { id: 'CUSTOM', label: 'Kustom Tanggal', icon: '🛠️' },
              ].map((p) => {
                const isActive = dateRangePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyDatePreset(p.id as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0753A5] text-white shadow-xs scale-102'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Rentang Tanggal Spesifik (Dari & Sampai) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/60">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-600 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Rentang Tanggal Spesifik:
                </span>
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Dari:</span>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => {
                      setFilterStartDate(e.target.value);
                      setDateRangePreset('CUSTOM');
                    }}
                    className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Sampai:</span>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => {
                      setFilterEndDate(e.target.value);
                      setDateRangePreset('CUSTOM');
                    }}
                    className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                  />
                </div>
                {(filterStartDate || filterEndDate) && (
                  <button
                    type="button"
                    onClick={() => applyDatePreset('ALL')}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {dateRangePreset !== 'ALL' && totalFilteredJournalsCount === 0 && (
                <div className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Belum ada data jurnal yang tercatat pada rentang tanggal ini. Capaian di bawah berstatus 0%.</span>
                </div>
              )}
            </div>
          </div>

          {/* Habit Distribution Grid using live habitAverages without artificial offsets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { code: 'WAKE_EARLY', label: 'Bangun Pagi', icon: '🌅', avg: habitAverages.wakeEarly },
              { code: 'WORSHIP', label: 'Beribadah', icon: '🕌', avg: habitAverages.worship },
              { code: 'EXERCISE', label: 'Berolahraga', icon: '🏃', avg: habitAverages.exercise },
              { code: 'HEALTHY_EATING', label: 'Makan Sehat', icon: '🥗', avg: habitAverages.healthyEat },
              { code: 'LEARNING', label: 'Gemar Belajar', icon: '📚', avg: habitAverages.learning },
              { code: 'SOCIAL', label: 'Bermasyarakat', icon: '🤝', avg: habitAverages.social },
              { code: 'SLEEP_EARLY', label: 'Tidur Cepat', icon: '🌙', avg: habitAverages.sleepEarly },
            ].map((hab) => {
              const status =
                hab.avg === 0
                  ? 'Belum Ada Data'
                  : hab.avg >= 85
                  ? 'Kuat'
                  : hab.avg >= 70
                  ? 'Penguatan'
                  : 'Prioritas Wilayah';
              return (
                <div key={hab.code} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{hab.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        status === 'Kuat'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'Penguatan'
                          ? 'bg-amber-100 text-amber-800'
                          : status === 'Belum Ada Data'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-2">{hab.label}</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{hab.avg}%</div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {totalSchoolsCount === 0 ? 'Default 0 (Belum ada sekolah)' : `Rata-rata ${totalSchoolsCount} sekolah binaan`}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Visualisasi Tren Capaian 7 Kebiasaan (Line Chart Bulanan) */}
          <SupervisorHabitTrendsChart
            schools={fosterSchools}
            journals={journals}
            selectedSchoolId={selectedMonitoringSchoolId || 'ALL'}
            onSelectSchool={(id) => setSelectedMonitoringSchoolId(id === 'ALL' ? '' : id)}
          />

          {/* Cross-School 7 Habit Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/60">
                  <th className="py-3 px-3">Satuan Pendidikan</th>
                  <th className="py-3 px-2 text-center">🌅 Pagi</th>
                  <th className="py-3 px-2 text-center">🕌 Ibadah</th>
                  <th className="py-3 px-2 text-center">🏃 Olahraga</th>
                  <th className="py-3 px-2 text-center">🥗 Makan</th>
                  <th className="py-3 px-2 text-center">📚 Belajar</th>
                  <th className="py-3 px-2 text-center">🤝 Sosial</th>
                  <th className="py-3 px-2 text-center">🌙 Tidur</th>
                  <th className="py-3 px-3 text-center">Rata-rata</th>
                  <th className="py-3 px-3 text-center">Aksi / PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fosterSchools.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <BookOpen className="w-8 h-8 text-slate-300" />
                        <span className="text-xs font-bold text-slate-700">Belum Ada Portofolio 7KAIH Terdata</span>
                        <span className="text-[11px] text-slate-400 max-w-sm">
                          Semua capaian dimensi pembiasaan saat ini default 0% karena data belum diinput oleh Super Admin dan Admin Sekolah.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  fosterSchools.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NPSN: {s.npsn} • {s.students} Siswa</div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{s.habits.wakeEarly}%</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{s.habits.worship}%</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{s.habits.exercise}%</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{s.habits.healthyEat}%</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{s.habits.learning}%</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{s.habits.social}%</td>
                      <td className="py-3 px-2 text-center font-bold text-amber-700">{s.habits.sleepEarly}%</td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-black text-[#0753A5]">{s.consistency}%</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMonitoringSchoolId(s.id);
                            setPrintPdfMode('PER_SCHOOL');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0753A5] font-bold text-[11px] transition-colors cursor-pointer border border-blue-200 shadow-2xs active:scale-95"
                          title={`Cetak & Unduh Dokumen PDF Portofolio 7KAIH ${s.name}`}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Unduh PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tampilan Khusus Tab Tren Bulanan (Line Chart) */}
      {activeTab === 'TRENDS' && (
        <div className="space-y-6">
          <SupervisorHabitTrendsChart
            schools={fosterSchools}
            journals={journals}
            selectedSchoolId={selectedMonitoringSchoolId || 'ALL'}
            onSelectSchool={(id) => setSelectedMonitoringSchoolId(id === 'ALL' ? '' : id)}
          />

          {/* Pedoman Analisis Tren & Supervisi Klinis Pengawas */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0753A5] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  Pedoman Analisis Tren Bulanan & Supervisi Klinis Pengawas Pembina
                </h4>
                <p className="text-xs text-slate-500">
                  Kerangka interpretasi visual grafik garis 7KAIH untuk merumuskan intervensi satuan pendidikan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Tren Meningkat (Zona Hijau &gt; 80%)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Dimensi kebiasaan yang berada di atas garis target 80% menunjukkan pembiasaan telah membudaya secara mandiri. Satuan pendidikan dapat dijadikan rujukan <em>best practice</em> antar-sekolah binaan.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Tren Fluktuatif (Zona Kuning 70% - 79%)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Perlu penguatan peran wali kelas dan pembiasaan terjadwal di jam sekolah. Pantau kepatuhan pengisian jurnal siswa di awal pekan dan pasca hari libur sekolah.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Tren Menurun / Kritis (&lt; 70%)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Memerlukan intervensi klinis langsung dari pengawas pembina dan kepala sekolah melalui rapat koordinasi RTL, edukasi parenting bersama orang tua, dan penyesuaian program pembiasaan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'RTL' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Rencana Tindak Lanjut (RTL) Supervisi & Pendampingan Wilayah
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Program intervensi klinis pengawas pembina dalam mendampingi kepala sekolah dan forum K3S/MKKS.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Agenda Supervisi Aktif
            </span>
          </div>

          <div className="space-y-4">
            {fosterSchools.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">Belum Ada Agenda Supervisi / RTL (Default 0)</h4>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Agenda RTL supervisi akan aktif otomatis setelah satuan pendidikan binaan didaftarkan oleh Super Admin dan diperbarui oleh Admin Sekolah.
                </p>
              </div>
            ) : (
              fosterSchools.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Supervisi Pembiasaan: {s.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          s.activeRtl > 0
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {s.activeRtl > 0 ? `${s.activeRtl} RTL Aktif` : '0 RTL Aktif (Default 0)'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#0753A5]">
                        Fokus: {s.priorityHabit}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Kepala Sekolah: <strong className="text-slate-800">{s.headmaster}</strong>
                    </span>
                  </div>

                  {s.schoolFollowUps && s.schoolFollowUps.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {s.schoolFollowUps.map((f: FollowUpPlan) => (
                        <div key={f.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>{f.finding}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#0753A5] border border-blue-100">
                              {f.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">{f.actionPlan}</p>
                          <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100">
                            <span>Target: <strong className="text-slate-600">{f.target}</strong></span>
                            <span>PJ: <strong className="text-slate-600">{f.owner}</strong></span>
                            <span>Progres: <strong className="text-emerald-600">{f.progressPercent}%</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      {s.supervisionNote
                        ? `Catatan aktif pengawas: "${s.supervisionNote}"`
                        : `Belum ada agenda RTL yang diinput oleh Admin Sekolah atau Guru untuk satuan pendidikan ini (Default 0).`}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Status Capaian:</span>
                      <strong className="text-[#0753A5]">{s.completeness}% Kelengkapan</strong>
                      <span className="text-slate-300">•</span>
                      <strong className="text-emerald-700">{s.consistency}% Konsistensi</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenSchoolModal(s)}
                        className="px-3 py-1 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                      >
                        Beri / Ubah Catatan Supervisi
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'AI_REGIONAL' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Analisis AI Supervisi Wilayah Binaan
                </h3>
                <p className="text-xs text-slate-500">
                  Rekomendasi tindak lanjut pembinaan manajerial dan akademik berbasis {totalSchoolsCount} sekolah binaan.
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateSupervisorAi}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiLoading ? 'Menyusun Analisis...' : 'Perbarui Analisis'}</span>
            </button>
          </div>

          {aiSupervisorResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                <h4 className="text-xs font-bold text-[#0753A5] uppercase tracking-wider">
                  📋 1. Fakta yang Tercatat
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {aiSupervisorResult.recordedFacts?.map((f: string, i: number) => <li key={i}>{f}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  🔍 2. Pola Wilayah
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {aiSupervisorResult.habitPatterns?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  ⚠️ 3. Keterbatasan Data
                </h4>
                <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
                  {aiSupervisorResult.dataLimitations?.map((l: string, i: number) => <li key={i}>{l}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  ❓ 4. Hipotesis untuk Diverifikasi
                </h4>
                <ul className="list-disc list-inside text-xs text-purple-900 space-y-1">
                  {aiSupervisorResult.hypothesesToVerify?.map((h: string, i: number) => <li key={i}>{h}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  💡 5. Rekomendasi Supervisi Wilayah
                </h4>
                <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1.5">
                  {aiSupervisorResult.actionableRecommendations?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal Info Ringkasan Satuan Pendidikan Binaan (Satu Tombol Info Tersendiri) */}
      {showRegionalStatsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold">
                  <Info className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    Info Statistik Satuan Pendidikan Binaan
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Ringkasan data agregat wilayah binaan Pengawas Pembina
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegionalStatsModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                title="Tutup info"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Modal: 4 Info Utama + RTL */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Jumlah Satuan Pendidikan Binaan */}
                <div className="bg-slate-50/90 p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <School className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      Jumlah Satuan Pendidikan Binaan
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{totalSchoolsCount} Sekolah</div>
                  <p className="text-xs text-slate-500">
                    {totalSchoolsCount === 0
                      ? 'Belum ada data satuan pendidikan'
                      : `${goodStatusCount} Terpantau Baik • ${unupdatedStatusCount > 0 ? `${unupdatedStatusCount} Belum Ada Data` : `${warningStatusCount} Perlu Penguatan`}`}
                  </p>
                </div>

                {/* 2. Total Siswa Binaan */}
                <div className="bg-slate-50/90 p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      Total Siswa Binaan
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{totalStudentsCount} Siswa</div>
                  <p className="text-xs text-slate-500">
                    {totalStudentsCount === 0 && totalTeachersCount === 0
                      ? 'Belum ada data siswa'
                      : `${totalTeachersCount} Tenaga Pendidik Terdata`}
                  </p>
                </div>

                {/* 3. Rata-rata Kelengkapan */}
                <div className="bg-slate-50/90 p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      Rata-rata Kelengkapan
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#0753A5]">{avgCompleteness}%</div>
                  <p className={`text-xs font-semibold ${avgCompleteness >= 80 ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {avgCompleteness >= 80
                      ? 'Target tercapai (>80%)'
                      : avgCompleteness > 0
                      ? 'Perlu ditingkatkan'
                      : 'Belum ada data jurnal terisi'}
                  </p>
                </div>

                {/* 4. Rata-rata Konsistensi */}
                <div className="bg-slate-50/90 p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      Rata-rata Konsistensi
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{avgConsistency}%</div>
                  <p className="text-xs text-slate-500">
                    {avgConsistency >= 80
                      ? 'Kategori pembiasaan baik'
                      : avgConsistency > 0
                      ? 'Perlu pendampingan berkala'
                      : 'Belum ada data jurnal terisi'}
                  </p>
                </div>
              </div>

              {/* 5. RTL Wilayah Aktif */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                    RTL Wilayah Aktif
                  </span>
                  <div className="text-xl font-black text-indigo-950 mt-0.5">{totalActiveRtl} RTL Terdaftar</div>
                  <p className="text-xs text-indigo-800/80 mt-0.5">
                    {totalActiveRtl > 0 ? 'Dalam pemantauan supervisi pengawas' : 'Belum ada rencana tindak lanjut'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegionalStatsModal(false);
                    setActiveTab('RTL');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Buka Tab RTL
                </button>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRegionalStatsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Supervision Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Supervisi Klinis & Manajerial Satuan Pendidikan
                </span>
                <h3 className="text-lg font-black mt-1">{selectedSchool.name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Kepala Sekolah: {selectedSchool.headmaster} ({selectedSchool.headmasterNip}) • {selectedSchool.students} Siswa • NPSN {selectedSchool.npsn}
                </p>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Kelengkapan</span>
                  <span className="text-base font-black text-[#0753A5]">{selectedSchool.completeness}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Konsistensi</span>
                  <span className="text-base font-black text-emerald-700">{selectedSchool.consistency}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">RTL Berjalan</span>
                  <span className="text-base font-black text-indigo-700">{selectedSchool.activeRtl} Rencana</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Fokus Penguatan</span>
                  <span className="text-xs font-black text-amber-800 mt-1 block truncate">{selectedSchool.priorityHabit}</span>
                </div>
              </div>

              {/* Supervision Form */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Catatan Supervisi Klinis & RTL Pembinaan Pengawas:
                </label>
                <textarea
                  rows={4}
                  value={currentNoteInput}
                  onChange={(e) => setCurrentNoteInput(e.target.value)}
                  placeholder="Tuliskan arahan pembinaan, strategi kolaborasi antar-sekolah (peer sharing), atau catatan tindak lanjut..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500 bg-slate-50/50 resize-none leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-900 leading-relaxed flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Catatan ini tersimpan dan tersinkronisasi sebagai panduan kepala sekolah dalam merumuskan RTL sekolah binaan.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedSchool(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSupervisionNote}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simpan Catatan Supervisi</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ============================================================================ */}
      {/* MODAL CETAK & UNDUH PDF RESMI PORTOFOLIO 7KAIH (WILAYAH & PER SEKOLAH) */}
      {/* ============================================================================ */}
      {printPdfMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static print:z-auto print:overflow-visible">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[96vh] flex flex-col print:max-h-none print:overflow-visible print:border-none print:shadow-none print:rounded-none">
            
            {/* Modal Toolbar (Sembunyi saat cetak / no-print) */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0753A5] text-white flex items-center justify-center shadow-xs">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">
                      {printPdfMode === 'REGIONAL'
                        ? 'Dokumen Resmi Rekapitulasi Portofolio 7KAIH Wilayah Binaan'
                        : `Dokumen Resmi Rekapitulasi Portofolio 7KAIH: ${activeMonitoringSchool?.name || 'Satuan Pendidikan'}`}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Siap Cetak / Simpan PDF
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standar Dokumen Pengawasan Karakter Disdikbud Kab. Tanah Laut • Cetak Standar A4 Resmi
                  </p>
                </div>
              </div>

              {/* Action Buttons & Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Switcher Tab Wilayah vs Per Sekolah */}
                <div className="inline-flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPrintPdfMode('REGIONAL')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      printPdfMode === 'REGIONAL'
                        ? 'bg-white text-[#0753A5] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Rekap Wilayah
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedMonitoringSchoolId && fosterSchools.length > 0) {
                        setSelectedMonitoringSchoolId(fosterSchools[0].id);
                      }
                      setPrintPdfMode('PER_SCHOOL');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      printPdfMode === 'PER_SCHOOL'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Rekap Per Sekolah
                  </button>
                </div>

                {/* Filter Periode Dokumen Laporan di Toolbar Modal */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs shadow-2xs">
                  <CalendarDays className="w-3.5 h-3.5 text-[#0753A5]" />
                  <span className="text-[11px] text-slate-500 font-semibold">Periode:</span>
                  <select
                    value={dateRangePreset}
                    onChange={(e) => applyDatePreset(e.target.value as any)}
                    className="bg-transparent text-xs font-bold text-slate-800 border-none outline-none cursor-pointer max-w-[150px] truncate"
                    title="Pilih periode rekapitulasi data untuk dicetak"
                  >
                    <option value="ALL">Semua Periode</option>
                    <option value="LAST_7_DAYS">7 Hari (Mingguan)</option>
                    <option value="THIS_MONTH">Bulan Ini</option>
                    <option value="LAST_MONTH">Bulan Lalu</option>
                    <option value="LAST_30_DAYS">30 Hari Terakhir</option>
                    <option value="THIS_SEMESTER">Semester Ganjil</option>
                    <option value="CUSTOM">Rentang Kustom</option>
                  </select>
                </div>

                {/* Per-School Dropdown Selector (if in PER_SCHOOL mode) */}
                {printPdfMode === 'PER_SCHOOL' && (
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs">
                    <School className="w-3.5 h-3.5 text-emerald-600" />
                    <select
                      value={activeMonitoringSchool?.id || ''}
                      onChange={(e) => setSelectedMonitoringSchoolId(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 border-none outline-none cursor-pointer max-w-[200px] truncate"
                    >
                      {fosterSchools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (NPSN: {s.npsn})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                  title="Buka dialog cetak untuk simpan sebagai PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Unduh PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintPdfMode(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
                  title="Tutup pratinjau"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Petunjuk Cetak PDF (no-print) */}
            <div className="px-6 py-2.5 bg-blue-50/80 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900 no-print">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  <strong>Petunjuk Unduh PDF:</strong> Klik tombol <strong>Cetak / Unduh PDF</strong> di atas, lalu pada dialog peramban ubah tujuan (Destination) ke <strong>"Simpan sebagai PDF" / "Save as PDF"</strong>.
                </span>
              </span>
              <span className="font-bold text-blue-700 text-[11px] shrink-0">
                Format: Kertas A4 Resmi
              </span>
            </div>

            {/* Document Printable Body */}
            <div className="p-8 sm:p-12 overflow-y-auto space-y-6 text-slate-900 print:p-0 print:space-y-4 print:overflow-visible flex-1">
              {printPdfMode === 'REGIONAL' ? (
                /* ========================================================== */
                /* 1. DOKUMEN REKAPITULASI PORTOFOLIO 7KAIH WILAYAH BINAAN    */
                /* ========================================================== */
                <div className="space-y-6 print:space-y-4">
                  {/* Kop Surat Resmi */}
                  <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-800">
                      PEMERINTAH KABUPATEN TANAH LAUT
                    </h2>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                      DINAS PENDIDIKAN DAN KEBUDAYAAN
                    </h3>
                    <h1 className="text-base sm:text-lg font-black text-slate-900 pt-0.5">
                      KELOMPOK KERJA PENGAWAS SEKOLAH (KKPS) • SATUAN PENDIDIKAN SMP
                    </h1>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Jl. Datu Insad Komplek Perkantoran Gagas, Pelaihari, Kabupaten Tanah Laut, Kalimantan Selatan 70814
                    </p>
                    <div className="pt-2 text-sm font-black uppercase tracking-wide text-[#0753A5]">
                      LAPORAN REKAPITULASI PORTOFOLIO 7 KEBIASAAN ANAK INDONESIA HEBAT (7KAIH)
                    </div>
                    <div className="text-xs text-slate-700 font-semibold">
                      WILAYAH PEMBINAAN PENGAWAS SEKOLAH • SEMESTER GANJIL/GENAP TAHUN PELAJARAN 2026/2027
                    </div>
                    <div className="pt-1.5 flex items-center justify-center gap-1.5 text-xs text-[#0753A5] font-black">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                        PERIODE DATA: {formalReportPeriodText}
                      </span>
                    </div>
                  </div>

                  {/* Identitas Pengawas & Satuan Pengawasan */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-slate-500 block">Pengawas Pembina:</span>
                        <strong className="text-slate-900 text-sm font-black">
                          {currentPersona?.name || 'Ahmad Muzani, M.Pd.'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Nomor Induk Pegawai (NIP):</span>
                        <strong className="text-slate-800 font-mono font-bold">
                          {currentPersona?.identifierValue || '196811051992031004'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Jabatan / Satuan Kerja:</span>
                        <strong className="text-slate-800 font-bold">
                          Pengawas SMP Disdikbud Kabupaten Tanah Laut
                        </strong>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-slate-500 block">Cakupan Wilayah Binaan:</span>
                        <strong className="text-slate-900 text-sm font-black">
                          Wilayah Pembinaan Satuan Pendidikan SMP
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Rentang Periode Pemantauan:</span>
                        <strong className="text-slate-900 font-bold">
                          {formalReportPeriodText}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tanggal Penerbitan Laporan:</span>
                        <strong className="text-slate-800 font-bold">
                          {formatIndonesianFullDate(new Date())}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 4 Kartu Ringkasan Indikator Wilayah */}
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <span className="text-slate-500 block text-[11px]">Sekolah Binaan:</span>
                      <div className="text-lg font-black text-slate-900 mt-0.5">
                        {totalSchoolsCount} <span className="text-xs font-semibold text-slate-500">Sekolah</span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <span className="text-slate-500 block text-[11px]">Peserta Didik Binaan:</span>
                      <div className="text-lg font-black text-[#0753A5] mt-0.5">
                        {totalStudentsCount.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">Siswa</span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <span className="text-slate-500 block text-[11px]">Rerata Kelengkapan Jurnal:</span>
                      <div className="text-lg font-black text-emerald-700 mt-0.5">
                        {avgCompleteness}%
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <span className="text-slate-500 block text-[11px]">Indeks Konsistensi 7KAIH:</span>
                      <div className="text-lg font-black text-indigo-700 mt-0.5">
                        {avgConsistency}%
                      </div>
                    </div>
                  </div>

                  {/* Matriks Capaian 7 Dimensi Kebiasaan Wilayah */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      I. DISTRIBUSI AGREGAT 7 KEBIASAAN ANAK INDONESIA HEBAT (SE-WILAYAH)
                    </h4>
                    <table className="w-full text-left text-xs border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800 font-bold">
                        <tr className="border-b border-slate-300">
                          <th className="py-2 px-3 w-10 text-center">No</th>
                          <th className="py-2 px-3">Dimensi 7 Kebiasaan Anak Indonesia Hebat</th>
                          <th className="py-2 px-3 w-28 text-center">Capaian Wilayah</th>
                          <th className="py-2 px-3 w-36 text-center">Status Evaluasi</th>
                          <th className="py-2 px-3">Rekomendasi Arahan Pembinaan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {[
                          { no: 1, name: 'Bangun Pagi', avg: habitAverages.wakeEarly, rec: 'Pertahankan rutinitas bangun sebelum subuh / pagi hari.' },
                          { no: 2, name: 'Beribadah', avg: habitAverages.worship, rec: 'Tingkatkan pendampingan sholat/doa bersama di sekolah dan rumah.' },
                          { no: 3, name: 'Berolahraga', avg: habitAverages.exercise, rec: 'Lakukan senam pagi/jalan sehat mingguan secara konsisten.' },
                          { no: 4, name: 'Makan Sehat & Bergizi', avg: habitAverages.healthyEat, rec: 'Sosialisasikan bekal bergizi seimbang dan kurangi jajan sembarangan.' },
                          { no: 5, name: 'Gemar Belajar & Membaca', avg: habitAverages.learning, rec: 'Galakkan pojok baca kelas dan literasi 15 menit sebelum pembelajaran.' },
                          { no: 6, name: 'Bermasyarakat & Peduli Sesama', avg: habitAverages.social, rec: 'Ajak siswa dalam bakti sosial, gotong royong, dan kesantunan bertutur.' },
                          { no: 7, name: 'Tidur Cepat (Istirahat Cukup)', avg: habitAverages.sleepEarly, rec: 'Edukasi pembatasan screen-time gawai pada malam hari bersama orang tua.' },
                        ].map((h) => {
                          const status =
                            h.avg === 0
                              ? 'Belum Ada Data'
                              : h.avg >= 85
                              ? 'Sangat Kuat (A)'
                              : h.avg >= 70
                              ? 'Baik / Penguatan (B)'
                              : 'Perlu Prioritas (C)';
                          return (
                            <tr key={h.no} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-center font-bold text-slate-600">{h.no}</td>
                              <td className="py-2 px-3 font-bold text-slate-900">{h.name}</td>
                              <td className="py-2 px-3 text-center font-black text-slate-900">{h.avg}%</td>
                              <td className="py-2 px-3 text-center font-semibold text-slate-800">{status}</td>
                              <td className="py-2 px-3 text-slate-600 text-[11px]">{h.rec}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Tabel Rekapitulasi Portofolio Satuan Pendidikan Binaan */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      II. REKAPITULASI CAPAIAN PORTOFOLIO PER SATUAN PENDIDIKAN BINAAN
                    </h4>
                    <table className="w-full text-left text-xs border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800 font-bold">
                        <tr className="border-b border-slate-300">
                          <th className="py-2 px-2.5 w-8 text-center">No</th>
                          <th className="py-2 px-2.5">Satuan Pendidikan</th>
                          <th className="py-2 px-2 text-center">NPSN</th>
                          <th className="py-2 px-2 text-center">Siswa</th>
                          <th className="py-2 px-2 text-center">Guru</th>
                          <th className="py-2 px-2 text-center">Kelengkapan</th>
                          <th className="py-2 px-2 text-center">Konsistensi</th>
                          <th className="py-2 px-2 text-center">Fokus Prioritas</th>
                          <th className="py-2 px-2 text-center">Status</th>
                          <th className="py-2 px-2 text-center">RTL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {fosterSchools.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-6 text-center text-slate-400">
                              Belum ada data satuan pendidikan binaan terdata.
                            </td>
                          </tr>
                        ) : (
                          fosterSchools.map((s, idx) => (
                            <tr key={s.id} className="hover:bg-slate-50">
                              <td className="py-2 px-2 text-center font-bold text-slate-600">{idx + 1}</td>
                              <td className="py-2 px-2.5 font-bold text-slate-900">{s.name}</td>
                              <td className="py-2 px-2 text-center font-mono text-[11px]">{s.npsn}</td>
                              <td className="py-2 px-2 text-center font-semibold">{s.students}</td>
                              <td className="py-2 px-2 text-center font-semibold">{s.teachers}</td>
                              <td className="py-2 px-2 text-center font-bold text-slate-800">{s.completeness}%</td>
                              <td className="py-2 px-2 text-center font-black text-[#0753A5]">{s.consistency}%</td>
                              <td className="py-2 px-2 text-center text-[10px] text-slate-600 truncate max-w-[120px]">{s.priorityHabit}</td>
                              <td className="py-2 px-2 text-center font-bold text-[10px]">
                                {s.status === 'TERPANTAU_BAIK' ? (
                                  <span className="text-emerald-700">Baik</span>
                                ) : s.status === 'PERLU_PENGUATAN' ? (
                                  <span className="text-amber-700">Penguatan</span>
                                ) : (
                                  <span className="text-slate-400">Belum Ada</span>
                                )}
                              </td>
                              <td className="py-2 px-2 text-center font-bold">{s.activeRtl}</td>
                            </tr>
                          ))
                        )}
                        {fosterSchools.length > 0 && (
                          <tr className="bg-slate-100/90 font-black border-t-2 border-slate-400">
                            <td colSpan={3} className="py-2 px-3 text-right">RATA-RATA WILAYAH:</td>
                            <td className="py-2 px-2 text-center">{totalStudentsCount}</td>
                            <td className="py-2 px-2 text-center">{totalTeachersCount}</td>
                            <td className="py-2 px-2 text-center">{avgCompleteness}%</td>
                            <td className="py-2 px-2 text-center text-[#0753A5]">{avgConsistency}%</td>
                            <td className="py-2 px-2 text-center text-[10px]">-</td>
                            <td className="py-2 px-2 text-center text-[10px]">{goodStatusCount}/{totalSchoolsCount} Baik</td>
                            <td className="py-2 px-2 text-center">{totalActiveRtl}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Catatan & Rekomendasi Supervisi Wilayah Pengawas */}
                  <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 text-xs space-y-1.5 break-inside-avoid">
                    <h4 className="font-bold text-slate-900 uppercase">
                      III. CATATAN REFLEKSI & REKOMENDASI PENGAWAS PEMBINA:
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Secara umum pencapaian 7 Kebiasaan Anak Indonesia Hebat (7KAIH) di wilayah binaan pada <strong>{activePeriodLabel}</strong> menunjukkan tingkat konsistensi sebesar <strong>{avgConsistency}%</strong> dengan kelengkapan pelaporan jurnal harian <strong>{avgCompleteness}%</strong> ({totalFilteredJournalsCount} entri jurnal tercatat). Fokus pembiasaan yang memerlukan pendampingan intensif berkesinambungan adalah dimensi <em>Tidur Cepat Tepat Waktu</em> dan <em>Makan Makanan Sehat</em> melalui sinergi aktif komite sekolah dan orang tua murid.
                    </p>
                  </div>

                  {/* Pengesahan Resmi Pengawas */}
                  <div className="pt-6 flex justify-end text-xs break-inside-avoid">
                    <div className="text-center space-y-16 w-72">
                      <p className="text-slate-700">
                        Pelaihari, {formatIndonesianFullDate(new Date())}<br />
                        <strong className="text-slate-900">Pengawas Pembina Satuan Pendidikan</strong>
                      </p>
                      <div>
                        <p className="font-black text-slate-900 underline decoration-dotted text-sm">
                          {currentPersona?.name || 'Ahmad Muzani, M.Pd.'}
                        </p>
                        <p className="font-normal text-[11px] text-slate-700 mt-0.5">
                          NIP. {currentPersona?.identifierValue || '196811051992031004'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Pengawas SMP Disdikbud Kab. Tanah Laut
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================== */
                /* 2. DOKUMEN REKAPITULASI PORTOFOLIO PER SATUAN PENDIDIKAN   */
                /* ========================================================== */
                activeMonitoringSchool ? (
                  <div className="space-y-6 print:space-y-4">
                    {/* Kop Surat Sekolah & Disdikbud */}
                    <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-800">
                        PEMERINTAH KABUPATEN TANAH LAUT
                      </h2>
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                        DINAS PENDIDIKAN DAN KEBUDAYAAN
                      </h3>
                      <h1 className="text-base sm:text-lg font-black text-slate-900 pt-0.5">
                        {activeMonitoringSchool.name.toUpperCase()}
                      </h1>
                      <p className="text-[11px] text-slate-600 font-medium">
                        NPSN: {activeMonitoringSchool.npsn} • Akreditasi: {activeMonitoringSchool.akreditasi} • Status: {activeMonitoringSchool.schoolStatus} • {activeMonitoringSchool.address || activeMonitoringSchool.district || 'Kabupaten Tanah Laut'}
                      </p>
                      <div className="pt-2 text-sm font-black uppercase tracking-wide text-emerald-800">
                        REKAPITULASI PORTOFOLIO PEMBIASAAN 7 KEBIASAAN ANAK INDONESIA HEBAT (7KAIH)
                      </div>
                      <div className="text-xs text-slate-700 font-semibold">
                        LEMBAR SUPERVISI & EVALUASI MUTU PEMBIASAAN KARAKTER SATUAN PENDIDIKAN
                      </div>
                      <div className="pt-1.5 flex items-center justify-center gap-1.5 text-xs text-emerald-800 font-black">
                        <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                          PERIODE DATA: {formalReportPeriodText}
                        </span>
                      </div>
                    </div>

                    {/* Identitas Satuan Pendidikan & Pimpinan */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-slate-500 block">Nama Satuan Pendidikan:</span>
                          <strong className="text-slate-900 text-sm font-black">
                            {activeMonitoringSchool.name}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Kepala Satuan Pendidikan:</span>
                          <strong className="text-slate-900 font-bold">
                            {activeMonitoringSchool.headmaster}
                          </strong>
                          <span className="text-slate-600 block text-[11px]">
                            NIP. {activeMonitoringSchool.headmasterNip}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Pengawas Pembina:</span>
                          <strong className="text-slate-800 font-bold">
                            {currentPersona?.name || 'Ahmad Muzani, M.Pd.'} (NIP: {currentPersona?.identifierValue || '196811051992031004'})
                          </strong>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-slate-500 block">Populasi Peserta Didik:</span>
                          <strong className="text-slate-900 font-bold">
                            {activeMonitoringSchool.students} Siswa • {activeMonitoringSchool.classes} Rombongan Belajar
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Tenaga Pendidik Terdata:</span>
                          <strong className="text-slate-900 font-bold">
                            {activeMonitoringSchool.teachers} Guru
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Periode Pemantauan Data:</span>
                          <strong className="text-slate-900 font-bold block">
                            {formalReportPeriodText}
                          </strong>
                          <span className="text-slate-500 text-[11px] block mt-0.5">
                            Penerbitan: {formatIndonesianFullDate(new Date())}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3 Kartu Ringkasan Capaian Sekolah */}
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-center">
                        <span className="text-slate-500 block text-[11px]">Kelengkapan Jurnal</span>
                        <div className="text-xl font-black text-[#0753A5] mt-1">
                          {activeMonitoringSchool.completeness}%
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-center">
                        <span className="text-slate-500 block text-[11px]">Indeks Konsistensi 7KAIH</span>
                        <div className="text-xl font-black text-emerald-700 mt-1">
                          {activeMonitoringSchool.consistency}%
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-center">
                        <span className="text-slate-500 block text-[11px]">Status Evaluasi Supervisi</span>
                        <div className="text-sm font-black text-slate-800 mt-2">
                          {activeMonitoringSchool.status === 'TERPANTAU_BAIK' ? '✅ Terpantau Baik' : activeMonitoringSchool.status === 'PERLU_PENGUATAN' ? '⚠️ Perlu Penguatan' : '⏳ Belum Ada Data'}
                        </div>
                      </div>
                    </div>

                    {/* Rincian 7 Kebiasaan Sekolah */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        I. CAPAIAN 7 DIMENSI KEBIASAAN ANAK INDONESIA HEBAT SATUAN PENDIDIKAN
                      </h4>
                      <table className="w-full text-left text-xs border border-slate-300">
                        <thead className="bg-slate-100 text-slate-800 font-bold">
                          <tr className="border-b border-slate-300">
                            <th className="py-2 px-3 w-10 text-center">No</th>
                            <th className="py-2 px-3">Dimensi Kebiasaan</th>
                            <th className="py-2 px-3 w-28 text-center">Ketercapaian</th>
                            <th className="py-2 px-3 w-36 text-center">Kategori</th>
                            <th className="py-2 px-3">Catatan Observasi Pembiasaan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {[
                            { no: 1, name: 'Bangun Pagi', val: activeMonitoringSchool.habits.wakeEarly, desc: 'Kedisiplinan persiapan belajar & ibadah subuh di rumah' },
                            { no: 2, name: 'Beribadah', val: activeMonitoringSchool.habits.worship, desc: 'Ketaatan ibadah wajib dan penguatan akhlak mulia' },
                            { no: 3, name: 'Berolahraga', val: activeMonitoringSchool.habits.exercise, desc: 'Kebugaran jasmani dan aktivitas fisik minimal 30 menit' },
                            { no: 4, name: 'Makan Sehat & Bergizi', val: activeMonitoringSchool.habits.healthyEat, desc: 'Pemenuhan gizi seimbang, sarapan pagi dan konsumsi air putih' },
                            { no: 5, name: 'Gemar Membaca & Belajar', val: activeMonitoringSchool.habits.learning, desc: 'Budaya literasi buku bacaan dan keteraturan belajar mandiri' },
                            { no: 6, name: 'Bermasyarakat & Gotong Royong', val: activeMonitoringSchool.habits.social, desc: 'Interaksi sosial positif, peduli lingkungan dan tolong menolong' },
                            { no: 7, name: 'Tidur Cepat (Tepat Waktu)', val: activeMonitoringSchool.habits.sleepEarly, desc: 'Kualitas waktu istirahat malam dan pencegahan begadang' },
                          ].map((item) => (
                            <tr key={item.no} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-center font-bold text-slate-600">{item.no}</td>
                              <td className="py-2 px-3 font-bold text-slate-900">{item.name}</td>
                              <td className="py-2 px-3 text-center font-black text-slate-900">{item.val}%</td>
                              <td className="py-2 px-3 text-center font-semibold text-slate-700">
                                {item.val >= 85 ? 'Sangat Kuat' : item.val >= 70 ? 'Berkembang Baik' : 'Butuh Penguatan'}
                              </td>
                              <td className="py-2 px-3 text-slate-600 text-[11px]">{item.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Rencana Tindak Lanjut (RTL) Supervisi */}
                    <div className="space-y-2 break-inside-avoid">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        II. AGENDA RENCANA TINDAK LANJUT (RTL) & SUPERVISI SEKOLAH
                      </h4>
                      {activeMonitoringSchool.schoolFollowUps && activeMonitoringSchool.schoolFollowUps.length > 0 ? (
                        <table className="w-full text-left text-xs border border-slate-300">
                          <thead className="bg-slate-100 text-slate-800 font-bold">
                            <tr className="border-b border-slate-300">
                              <th className="py-2 px-3 w-8 text-center">No</th>
                              <th className="py-2 px-3">Temuan / Fokus</th>
                              <th className="py-2 px-3">Rencana Aksi Intervensi</th>
                              <th className="py-2 px-3 w-28 text-center">Target Waktu</th>
                              <th className="py-2 px-3 w-24 text-center">PJ</th>
                              <th className="py-2 px-3 w-20 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {activeMonitoringSchool.schoolFollowUps.map((f: FollowUpPlan, i: number) => (
                              <tr key={f.id || i}>
                                <td className="py-2 px-3 text-center font-bold">{i + 1}</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">{f.finding}</td>
                                <td className="py-2 px-3 text-slate-700">{f.actionPlan}</td>
                                <td className="py-2 px-3 text-center font-mono text-[11px]">{f.target}</td>
                                <td className="py-2 px-3 text-center">{f.owner}</td>
                                <td className="py-2 px-3 text-center font-bold text-[11px] text-[#0753A5]">{f.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 italic">
                          Belum ada agenda RTL spesifik yang tercatat. Fokus tindak lanjut mengacu pada penguatan dimensi {activeMonitoringSchool.priorityHabit}.
                        </div>
                      )}
                    </div>

                    {/* Catatan Klinis Pengawas Pembina */}
                    <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 text-xs space-y-1.5 break-inside-avoid">
                      <h4 className="font-bold text-slate-900 uppercase">
                        III. CATATAN SUPERVISI KLINIS PENGAWAS PEMBINA:
                      </h4>
                      <p className="text-slate-700 leading-relaxed">
                        {activeMonitoringSchool.supervisionNote
                          ? activeMonitoringSchool.supervisionNote
                          : `Kepala Sekolah dan Dewan Guru ${activeMonitoringSchool.name} diharapkan secara konsisten mengawal pengisian jurnal harian 7KAIH oleh seluruh siswa dan menjalin komunikasi aktif dengan orang tua untuk mengoptimalkan kebiasaan yang masih membutuhkan penguatan.`}
                      </p>
                    </div>

                    {/* Pengesahan Ganda (Kepala Sekolah & Pengawas) */}
                    <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs break-inside-avoid">
                      <div className="space-y-16">
                        <p className="text-slate-700">
                          Mengetahui,<br />
                          <strong className="text-slate-900">Kepala Satuan Pendidikan</strong>
                        </p>
                        <div>
                          <p className="font-black text-slate-900 underline decoration-dotted text-sm">
                            ( {activeMonitoringSchool.headmaster || 'Kepala Sekolah'} )
                          </p>
                          <p className="font-normal text-[11px] text-slate-700 mt-0.5">
                            NIP. {activeMonitoringSchool.headmasterNip || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-16">
                        <p className="text-slate-700">
                          Pelaihari, {formatIndonesianFullDate(new Date())}<br />
                          <strong className="text-slate-900">Pengawas Pembina Satuan Pendidikan</strong>
                        </p>
                        <div>
                          <p className="font-black text-slate-900 underline decoration-dotted text-sm">
                            ( {currentPersona?.name || 'Ahmad Muzani, M.Pd.'} )
                          </p>
                          <p className="font-normal text-[11px] text-slate-700 mt-0.5">
                            NIP. {currentPersona?.identifierValue || '196811051992031004'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <p>Satuan pendidikan tidak ditemukan. Silakan pilih sekolah lain.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
