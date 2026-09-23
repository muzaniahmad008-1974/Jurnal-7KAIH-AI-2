// ============================================================================
// SI-7KAIH AI - Teacher Class Dashboard & Analytics Component
// Rigorous metrics, non-punitive early warning categories, AI insight generator
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  DailyJournal,
  HabitCode,
  SchoolProgram,
  FollowUpPlan,
  EarlyWarningCategory,
  AIRtlSuggestion,
} from '../../packages/types/src/index';
import {
  HABIT_LIST,
  UserPersona,
  getStoredUsers,
  isDeprecatedOrDummyJournal,
} from '../lib/constants';
import {
  calculateHabitualThreshold,
} from '../../packages/analytics/src/index';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  FileText,
  Calendar,
  Compass,
  Info,
  ShieldCheck,
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  Eye,
  Plus,
  X,
  Edit3,
  RefreshCw,
  School,
  GraduationCap,
  Layers,
  BookOpen,
  Bot,
  Wand2,
  Lightbulb,
  Clock,
  Flame,
  ExternalLink,
  User,
  CalendarDays,
  HelpCircle,
} from 'lucide-react';
import { StudentDossierModal, StudentDossierData } from './StudentDossierModal';
import { SchoolMaster, getStoredSchools } from '../lib/schoolMasterData';
import { Rombel, Student, getStoredRombels, getStoredStudents } from '../lib/studentData';
import {
  formatAcademicYearAndSemester,
  getCurrentIndonesianMonthYear,
  getLocalDateString,
  formatIndonesianFullDate,
  formatIndonesianShortDate,
  formatRealtimeSaveTime,
  formatTimeOnly,
} from '../lib/dateUtils';

interface TeacherDashboardProps {
  journals: DailyJournal[];
  programs: SchoolProgram[];
  followUps: FollowUpPlan[];
  onOpenReportModal: (student?: any) => void;
  activeNavTab?: string;
  currentPersona?: UserPersona;
  onValidateJournal?: (
    journalId: string,
    habitCode?: HabitCode,
    note?: string,
    validationMeta?: any
  ) => void;
}

interface StudentClassRow {
  id: string;
  nisn: string;
  name: string;
  completedTodayCount: number;
  monthlyConsistency: number; // %
  completenessRate: number; // %
  avgHabitsCompleted?: number; // average completed habits out of 7 (e.g. 6.2)
  totalJournalsCount?: number;
  category: EarlyWarningCategory | 'BELUM_ADA_DATA';
  lastJournalDate: string;
  validatedByTeacher: boolean;
  gender?: 'L' | 'P';
  parentName?: string;
  parentPhone?: string;
  address?: string;
  status?: string;
}

const VALIDATIONS_STORAGE_KEY = 'si7kaih_teacher_validations_prod';

const getStoredValidations = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(VALIDATIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_e) {}
  return {};
};

const saveStoredValidations = (val: Record<string, boolean>) => {
  try {
    localStorage.setItem(VALIDATIONS_STORAGE_KEY, JSON.stringify(val));
  } catch (_e) {}
};

const FOLLOWUPS_STORAGE_KEY = 'si7kaih_teacher_followups_prod';
const PROGRAMS_STORAGE_KEY = 'si7kaih_teacher_programs_prod';

const normalizeClassName = (name?: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^kelas\s*/i, '')
    .replace(/^kls\s*/i, '')
    .replace(/viii/g, '8')
    .replace(/vii/g, '7')
    .replace(/ix/g, '9')
    .replace(/x/g, '10')
    .replace(/[\s\-_]/g, '')
    .trim();
};

const getStoredTeacherFollowUps = (): FollowUpPlan[] => {
  try {
    const raw = localStorage.getItem(FOLLOWUPS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(
          (f: FollowUpPlan) => !f.id.startsWith('rtl-0') && !f.id.includes('default') && !f.id.includes('sample')
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(FOLLOWUPS_STORAGE_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
  } catch (_e) {}
  return [];
};

const getStoredTeacherPrograms = (): SchoolProgram[] => {
  try {
    const raw = localStorage.getItem(PROGRAMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(
          (p: SchoolProgram) => !p.id.startsWith('prog-0') && !p.id.includes('default') && !p.id.includes('sample')
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
  } catch (_e) {}
  return [];
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  journals,
  programs,
  followUps,
  onOpenReportModal,
  activeNavTab,
  currentPersona,
  onValidateJournal,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STUDENTS' | 'MONITORING' | 'PROGRAMS' | 'RTL' | 'AI_INSIGHT'>('OVERVIEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'TERPANTAU_BAIK' | 'PERLU_PENGUATAN' | 'PERLU_PENDAMPINGAN' | 'BELUM_ADA_DATA'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AKTIF' | 'MUTASI' | 'LULUS'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentDossierData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // Dynamic data synchronized with School Admin and Super Admin
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [rombels, setRombels] = useState<Rombel[]>(() => getStoredRombels());
  const [schools, setSchools] = useState<SchoolMaster[]>(() => getStoredSchools());
  const [users, setUsers] = useState<UserPersona[]>(() => getStoredUsers());
  const [teacherValidations, setTeacherValidations] = useState<Record<string, boolean>>(() => getStoredValidations());
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [isSyncing, setIsSyncing] = useState(false);

  // Synchronized journals state reflecting real-time updates from students
  const [syncedJournals, setSyncedJournals] = useState<DailyJournal[]>(() => {
    try {
      const raw = localStorage.getItem('si7kaih_journals_prod');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_e) {}
    return journals || [];
  });
  const [liveSyncToast, setLiveSyncToast] = useState<{ studentName: string; time: string; count: number; className?: string } | null>(null);

  useEffect(() => {
    if (Array.isArray(journals) && journals.length > 0) {
      setSyncedJournals(journals);
    }
  }, [journals]);

  // Select active rombel based on persona or default to first rombel
  const [selectedRombelId, setSelectedRombelId] = useState<string>(() => {
    const allRombels = getStoredRombels();
    const matched = allRombels.find(
      (r) =>
        (currentPersona?.className && (
          r.name.toLowerCase().includes(currentPersona.className.toLowerCase().replace('kelas', '').trim()) ||
          currentPersona.className.toLowerCase().includes(r.name.toLowerCase()) ||
          currentPersona.className.toLowerCase().includes(r.code.toLowerCase())
        )) ||
        (currentPersona?.name && r.teacher.toLowerCase().includes(currentPersona.name.toLowerCase()))
    );
    return matched ? matched.id : allRombels[0]?.id || '';
  });

  // Sync listener for updates from Admin Sekolah, Super Admin, and Student Journals
  useEffect(() => {
    const handleUpdate = () => {
      setStudents(getStoredStudents());
      setRombels(getStoredRombels());
      setSchools(getStoredSchools());
      setUsers(getStoredUsers());
      setTeacherValidations(getStoredValidations());
      setLocalFollowUps(getStoredTeacherFollowUps());
      setLocalPrograms(getStoredTeacherPrograms());
      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    const handleJournalUpdate = (e?: any) => {
      let updatedList = e?.detail;
      if (!Array.isArray(updatedList) || updatedList.length === 0) {
        try {
          const raw = localStorage.getItem('si7kaih_journals_prod');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) updatedList = parsed;
          }
        } catch (_e) {}
      }
      if (Array.isArray(updatedList)) {
        setSyncedJournals(updatedList);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        const latest = updatedList[0];
        if (latest) {
          const sName = latest.studentName || 'Peserta Didik';
          const completedCount = typeof latest.completedCount === 'number'
            ? latest.completedCount
            : latest.entries
            ? Object.values(latest.entries).filter((h: any) => h?.completed).length
            : 0;
          setLiveSyncToast({
            studentName: sName,
            time: latest.savedAt || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            count: completedCount,
            className: latest.className,
          });
          setTimeout(() => setLiveSyncToast(null), 8000);
        }
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'si7kaih_journals_prod') {
        handleJournalUpdate();
      } else if (
        e.key === 'si7kaih_students_prod' ||
        e.key === 'si7kaih_rombels_prod' ||
        e.key === 'si7kaih_schools_prod' ||
        e.key === 'si7kaih_users_prod' ||
        e.key === VALIDATIONS_STORAGE_KEY
      ) {
        handleUpdate();
      }
    };

    // Cross-tab and window real-time broadcast channel
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('si7kaih_sync_channel');
        bc.onmessage = (ev) => {
          if (!ev.data) return;
          if (ev.data.type === 'JOURNALS_UPDATED' || ev.data.type === 'JOURNAL_SUBMITTED') {
            let updatedList = ev.data.journals;
            if (!Array.isArray(updatedList) || updatedList.length === 0) {
              try {
                const raw = localStorage.getItem('si7kaih_journals_prod');
                if (raw) updatedList = JSON.parse(raw);
              } catch (_e) {}
            }
            if (Array.isArray(updatedList)) {
              setSyncedJournals(updatedList);
            }
            setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            if (ev.data.latestJournal) {
              const latest = ev.data.latestJournal;
              const count = typeof latest.completedCount === 'number'
                ? latest.completedCount
                : latest.entries
                ? Object.values(latest.entries).filter((h: any) => h?.completed).length
                : 0;
              setLiveSyncToast({
                studentName: latest.studentName || 'Peserta Didik',
                time: latest.savedAt || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
                count,
                className: latest.className,
              });
              setTimeout(() => setLiveSyncToast(null), 8000);
            }
          } else if (
            ev.data.type === 'STUDENTS_UPDATED' ||
            ev.data.type === 'ROMBELS_UPDATED' ||
            ev.data.type === 'USERS_UPDATED' ||
            ev.data.type === 'USERS_SAVED' ||
            ev.data.type === 'SCHOOLS_UPDATED' ||
            ev.data.type === 'SUPER_ADMIN_MASTER_SYNC'
          ) {
            handleUpdate();
          }
        };
      }
    } catch (_e) {}

    window.addEventListener('si7kaih_students_updated', handleUpdate);
    window.addEventListener('si7kaih_rombels_updated', handleUpdate);
    window.addEventListener('si7kaih_schools_updated', handleUpdate);
    window.addEventListener('si7kaih_users_updated', handleUpdate);
    window.addEventListener('si7kaih_journals_updated', handleJournalUpdate);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('si7kaih_students_updated', handleUpdate);
      window.removeEventListener('si7kaih_rombels_updated', handleUpdate);
      window.removeEventListener('si7kaih_schools_updated', handleUpdate);
      window.removeEventListener('si7kaih_users_updated', handleUpdate);
      window.removeEventListener('si7kaih_journals_updated', handleJournalUpdate);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const syncAllData = () => {
    setIsSyncing(true);
    try {
      setStudents(getStoredStudents());
      setRombels(getStoredRombels());
      setSchools(getStoredSchools());
      setUsers(getStoredUsers());
      setTeacherValidations(getStoredValidations());
      setLocalFollowUps(getStoredTeacherFollowUps());
      setLocalPrograms(getStoredTeacherPrograms());
      try {
        const storedJournalsStr = localStorage.getItem('si7kaih_journals_prod');
        if (storedJournalsStr) {
          setSyncedJournals(JSON.parse(storedJournalsStr));
        }
      } catch (_e) {}
      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      showToast('Data dashboard wali kelas berhasil disinkronkan dengan isian jurnal murid & data sekolah.');
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Resolve active rombel and active school
  const activeRombel = useMemo(() => {
    const found = rombels.find((r) => r.id === selectedRombelId);
    if (found) return found;
    return rombels[0] || {
      id: 'rmb-default',
      name: currentPersona?.className || 'Rombongan Belajar',
      code: '-',
      academicYear: formatAcademicYearAndSemester().fullDisplay,
      teacher: currentPersona?.name || 'Wali Kelas',
      teacherNip: currentPersona?.identifierValue || '-',
      capacity: 32,
      phase: 'Fase D',
      schoolId: currentPersona?.schoolId || '',
    };
  }, [rombels, selectedRombelId, currentPersona]);

  // Dynamically resolve academic year and active semester from active rombel
  const rombelAcademicInfo = useMemo(() => {
    return formatAcademicYearAndSemester(activeRombel?.academicYear);
  }, [activeRombel?.academicYear]);

  const currentMonthYearName = useMemo(() => {
    return getCurrentIndonesianMonthYear();
  }, []);

  const activeSchool = useMemo(() => {
    if (activeRombel.schoolId) {
      const s = schools.find((sch) => sch.id === activeRombel.schoolId);
      if (s) return s;
    }
    if (currentPersona?.schoolId) {
      const s = schools.find((sch) => sch.id === currentPersona.schoolId);
      if (s) return s;
    }
    if (currentPersona?.schoolName) {
      const s = schools.find((sch) => sch.name.toLowerCase().includes(currentPersona.schoolName!.toLowerCase()) || currentPersona.schoolName!.toLowerCase().includes(sch.name.toLowerCase()));
      if (s) return s;
    }
    return schools[0] || {
      id: currentPersona?.schoolId || 'sch-default',
      npsn: '-',
      name: currentPersona?.schoolName || 'Satuan Pendidikan',
      level: 'SMP',
      status: 'NEGERI',
      accreditation: 'A',
      principalName: '-',
      principalNip: '-',
    };
  }, [schools, activeRombel, currentPersona]);

  // Filter rombels specifically for this teacher's school, augmented with classes found in school students
  const schoolRombels = useMemo(() => {
    const list = rombels.filter(
      (r) =>
        !activeSchool.id ||
        !r.schoolId ||
        r.schoolId === activeSchool.id ||
        (r.schoolName && activeSchool.name && r.schoolName.toLowerCase() === activeSchool.name.toLowerCase())
    );

    const existingNorms = new Set(list.map((r) => normalizeClassName(r.name)));
    const schoolMasterStudents = students.filter((s) => {
      if (!s.schoolId && !s.schoolName) return true;
      if (activeSchool.id && activeSchool.id !== 'sch-default' && s.schoolId) {
        return s.schoolId.toLowerCase() === activeSchool.id.toLowerCase();
      }
      if (activeSchool.name && s.schoolName) {
        return s.schoolName.toLowerCase().includes(activeSchool.name.toLowerCase()) || activeSchool.name.toLowerCase().includes(s.schoolName.toLowerCase());
      }
      return true;
    });

    const derivedRombels: Rombel[] = [];
    schoolMasterStudents.forEach((s) => {
      if (s.className && s.className.trim()) {
        const norm = normalizeClassName(s.className);
        if (norm && !existingNorms.has(norm)) {
          existingNorms.add(norm);
          const gradeNum = norm.includes('8') ? 8 : norm.includes('9') ? 9 : norm.includes('7') ? 7 : 7;
          derivedRombels.push({
            id: `rmb-derived-${norm}`,
            code: s.className.toUpperCase().replace(/\s+/g, '-'),
            name: s.className,
            phase: gradeNum >= 7 ? 'Fase D' : 'Fase C',
            grade: gradeNum,
            teacher: 'Wali Kelas',
            teacherNip: '-',
            capacity: 32,
            academicYear: '2026/2027 Ganjil',
            status: 'AKTIF',
            source: 'INPUT_MANUAL',
            schoolId: activeSchool.id,
            schoolName: activeSchool.name,
          });
        }
      }
    });

    const combined = [...list, ...derivedRombels];
    if (activeRombel && !combined.some((r) => r.id === activeRombel.id)) {
      return [activeRombel, ...combined];
    }
    return combined.length > 0 ? combined : [activeRombel];
  }, [rombels, students, activeSchool, activeRombel]);

  // Ensure selectedRombelId points to an existing rombel in the school list
  useEffect(() => {
    if (schoolRombels.length > 0) {
      const exists = schoolRombels.some((r) => r.id === selectedRombelId);
      if (!exists) {
        setSelectedRombelId(schoolRombels[0].id);
      }
    }
  }, [schoolRombels, selectedRombelId]);

  // Keep selectedRombelId synchronized if persona changes
  useEffect(() => {
    if (currentPersona) {
      const allRombels = getStoredRombels();
      const matched = allRombels.find(
        (r) =>
          (currentPersona.className && (
            r.name.toLowerCase().includes(currentPersona.className.toLowerCase().replace('kelas', '').trim()) ||
            currentPersona.className.toLowerCase().includes(r.name.toLowerCase()) ||
            currentPersona.className.toLowerCase().includes(r.code.toLowerCase())
          )) ||
          (currentPersona.name && r.teacher.toLowerCase().includes(currentPersona.name.toLowerCase()))
      );
      if (matched && matched.id !== selectedRombelId) {
        setSelectedRombelId(matched.id);
      }
    }
  }, [currentPersona, rombels]);

  // Sync with Header navigation tabs
  useEffect(() => {
    if (!activeNavTab) return;
    if (activeNavTab === 'monitoring') {
      setActiveTab('MONITORING');
    } else if (activeNavTab === 'validation') {
      setActiveTab('STUDENTS');
    } else if (activeNavTab === 'programs') {
      setActiveTab('PROGRAMS');
    } else if (activeNavTab === 'rtl') {
      setActiveTab('RTL');
    } else if (activeNavTab === 'ai-insight') {
      setActiveTab('AI_INSIGHT');
    } else if (activeNavTab === 'dashboard') {
      setActiveTab('OVERVIEW');
    }
  }, [activeNavTab]);

  // Students for the active class derived directly from Admin Sekolah master data
  const rawClassStudents = useMemo(() => {
    const targetSchoolId = (activeSchool.id || '').trim();
    const targetSchoolName = (activeSchool.name || '').toLowerCase().trim();

    const isClassMatch = (className?: string) => {
      if (!className) return false;
      const clean = normalizeClassName(className);
      const activeNorm = normalizeClassName(activeRombel.name);
      const activeCodeNorm = normalizeClassName(activeRombel.code || '');
      if (!clean || !activeNorm) return false;
      if (clean === activeNorm) return true;
      if (activeCodeNorm && clean === activeCodeNorm) return true;
      const rawClean = className.trim().toLowerCase();
      const rawActive = activeRombel.name.trim().toLowerCase();
      if (rawClean === rawActive) return true;
      return false;
    };

    const isSchoolMatch = (schoolId?: string, schoolName?: string) => {
      if (!schoolId && !schoolName) return true;
      if (!targetSchoolId || targetSchoolId === 'sch-default' || !targetSchoolName || targetSchoolName === 'satuan pendidikan') return true;
      if (schoolId && targetSchoolId && schoolId.toLowerCase() === targetSchoolId.toLowerCase()) return true;
      if (schoolName && targetSchoolName && (schoolName.toLowerCase().includes(targetSchoolName) || targetSchoolName.includes(schoolName.toLowerCase()))) return true;
      return false;
    };

    const studentMap = new Map<string, Student>();

    // 1. Primary Authority: Master Data Siswa Mandiri yang dikelola Admin Sekolah
    const schoolMasterStudents = students.filter((s) => isSchoolMatch(s.schoolId, s.schoolName));

    schoolMasterStudents.forEach((s) => {
      if (isClassMatch(s.className)) {
        studentMap.set(s.id, s);
      }
    });

    // 2. Also check registered student user personas
    users.forEach((u) => {
      if (u.role === 'STUDENT' && isClassMatch(u.className) && isSchoolMatch(u.schoolId, u.schoolName)) {
        const sid = u.identifierValue || u.username;
        const exists = Array.from(studentMap.values()).some(
          (s) => s.id === u.id || (sid && s.nisn === sid) || s.name.toLowerCase().trim() === u.name.toLowerCase().trim()
        );
        if (!exists) {
          studentMap.set(u.id, {
            id: u.id,
            nisn: sid || '-',
            name: u.name,
            gender: (u.avatar === '👧🏻' ? 'P' : 'L') as 'L' | 'P',
            className: u.className || activeRombel.name,
            parentName: u.childName ? `Orang Tua ${u.name}` : '-',
            status: 'AKTIF',
            source: 'INPUT_MANUAL',
            createdAt: u.createdDate || new Date().toISOString(),
            schoolId: u.schoolId || activeSchool.id,
            schoolName: u.schoolName || activeSchool.name,
          });
        }
      }
    });

    // 3. Resilient fallback: Also check journal submissions belonging to this class
    syncedJournals.forEach((j) => {
      if (isClassMatch(j.className) && (j.studentName || j.studentId || j.studentNisn)) {
        const exists = Array.from(studentMap.values()).some(
          (s) =>
            (j.studentId && s.id === j.studentId) ||
            (j.studentNisn && s.nisn === j.studentNisn) ||
            (j.studentName && s.name.toLowerCase().trim() === j.studentName.toLowerCase().trim())
        );
        if (!exists) {
          const generatedId = j.studentId || `stu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          studentMap.set(generatedId, {
            id: generatedId,
            nisn: j.studentNisn || '-',
            name: j.studentName || 'Peserta Didik',
            gender: 'L',
            className: j.className || activeRombel.name,
            parentName: '-',
            status: 'AKTIF',
            source: 'INPUT_MANUAL',
            createdAt: j.journalDate || new Date().toISOString(),
            schoolId: j.schoolId || activeSchool.id,
            schoolName: j.schoolName || activeSchool.name,
          });
        }
      }
    });

    return Array.from(studentMap.values());
  }, [students, users, syncedJournals, activeRombel, activeSchool]);

  // Calculate synchronized student rows with journal metrics (0 when no data)
  const studentsList: StudentClassRow[] = useMemo(() => {
    return rawClassStudents.map((st) => {
      const studentJournals = syncedJournals.filter((j) => {
        if (j.studentId && (j.studentId === st.id || j.studentId === st.nisn)) return true;
        if (j.studentNisn && st.nisn && j.studentNisn === st.nisn) return true;
        if (j.studentName && st.name && j.studentName.toLowerCase().trim() === st.name.toLowerCase().trim()) return true;
        return false;
      });

      let completedToday = 0;
      let monthlyConsistency = 0;
      let completenessRate = 0;
      let lastDate = '-';
      let totalCompletedHabits = 0;

      if (studentJournals.length > 0) {
        const now = new Date();
        const localTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const utcTodayStr = now.toISOString().split('T')[0];

        const todayJournal = studentJournals.find((j) => {
          const d = j.journalDate || (j as any).date;
          return d === localTodayStr || d === utcTodayStr;
        });

        if (todayJournal) {
          if (todayJournal.entries) {
            completedToday = Object.values(todayJournal.entries).filter((h: any) => h?.completed).length;
          } else if (todayJournal.habits) {
            completedToday = Object.values(todayJournal.habits).filter((h: any) => h?.completed).length;
          } else if (typeof todayJournal.completedCount === 'number') {
            completedToday = todayJournal.completedCount;
          }
        }

        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const recordedDates = new Set(
          studentJournals.map((j) => j.journalDate || (j as any).date).filter(Boolean)
        );
        completenessRate = Math.min(100, Math.round((recordedDates.size / daysInMonth) * 100));

        studentJournals.forEach((j) => {
          if (j.entries) {
            totalCompletedHabits += Object.values(j.entries).filter((h: any) => h?.completed).length;
          } else if (j.habits) {
            totalCompletedHabits += Object.values(j.habits).filter((h: any) => h?.completed).length;
          } else if (typeof j.completedCount === 'number') {
            totalCompletedHabits += j.completedCount;
          }
        });

        monthlyConsistency = studentJournals.length > 0
          ? Math.min(100, Math.round((totalCompletedHabits / (studentJournals.length * 7)) * 100))
          : 0;

        const sortedJournals = [...studentJournals].sort((a, b) => {
          const da = a.journalDate || (a as any).date || '';
          const db = b.journalDate || (b as any).date || '';
          return db.localeCompare(da);
        });
        lastDate = sortedJournals[0]?.journalDate || (sortedJournals[0] as any)?.date || '-';
      }

      const avgCompletedHabits = studentJournals.length > 0 ? (totalCompletedHabits / studentJournals.length) : 0;

      // Sync category strictly with 7 habits completion data:
      // TERPANTAU_BAIK: >= 5.6 kebiasaan (~6-7 kebiasaan) or monthlyConsistency >= 80%
      // PERLU_PENGUATAN: >= 3.8 kebiasaan (~4-5 kebiasaan) or monthlyConsistency >= 55%
      // PERLU_PENDAMPINGAN: < 3.8 kebiasaan (<= 3 kebiasaan) or monthlyConsistency < 55%
      const category: EarlyWarningCategory | 'BELUM_ADA_DATA' =
        studentJournals.length === 0
          ? 'BELUM_ADA_DATA'
          : (avgCompletedHabits >= 5.6 || monthlyConsistency >= 80)
          ? 'TERPANTAU_BAIK'
          : (avgCompletedHabits >= 3.8 || monthlyConsistency >= 55)
          ? 'PERLU_PENGUATAN'
          : 'PERLU_PENDAMPINGAN';

      const isValidated =
        !!teacherValidations[st.id] ||
        (st.nisn ? !!teacherValidations[st.nisn] : false) ||
        studentJournals.some((j) => j.teacherValidated);

      return {
        id: st.id,
        nisn: st.nisn,
        name: st.name,
        completedTodayCount: Math.min(7, completedToday),
        monthlyConsistency: Math.min(100, Math.max(0, monthlyConsistency)),
        completenessRate: Math.min(100, Math.max(0, completenessRate)),
        avgHabitsCompleted: studentJournals.length > 0 ? Math.round(avgCompletedHabits * 10) / 10 : 0,
        totalJournalsCount: studentJournals.length,
        category,
        lastJournalDate: lastDate,
        validatedByTeacher: isValidated,
        gender: st.gender,
        parentName: st.parentName,
        parentPhone: st.parentPhone,
        address: st.address,
        status: st.status,
      };
    });
  }, [rawClassStudents, syncedJournals, teacherValidations]);

  const [localFollowUps, setLocalFollowUps] = useState<FollowUpPlan[]>(() => getStoredTeacherFollowUps());
  const [localPrograms, setLocalPrograms] = useState<SchoolProgram[]>(() => getStoredTeacherPrograms());
  const [isRtlModalOpen, setIsRtlModalOpen] = useState(false);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);

  // New RTL form state
  const [newRtlFinding, setNewRtlFinding] = useState('');
  const [newRtlRootCause, setNewRtlRootCause] = useState('');
  const [newRtlRootCauseType, setNewRtlRootCauseType] = useState<'FACT' | 'HYPOTHESIS_TO_VERIFY'>('FACT');
  const [newRtlActionPlan, setNewRtlActionPlan] = useState('');
  const [newRtlOwner, setNewRtlOwner] = useState(`Wali Kelas & Paguyuban ${activeRombel.name}`);
  const [newRtlDeadline, setNewRtlDeadline] = useState('2026-09-30');
  const [newRtlProgress, setNewRtlProgress] = useState(25);

  // AI RTL Assistance state
  const [isAiRtlAssistantOpen, setIsAiRtlAssistantOpen] = useState(true);
  const [isGeneratingAiRtl, setIsGeneratingAiRtl] = useState(false);
  const [aiRtlFocusHabit, setAiRtlFocusHabit] = useState<string>('AUTO');
  const [aiRtlGeneratedSuggestion, setAiRtlGeneratedSuggestion] = useState<AIRtlSuggestion | null>(null);
  const [aiRtlAppliedSuccess, setAiRtlAppliedSuccess] = useState(false);

  // New Program form state
  const [newProgTitle, setNewProgTitle] = useState('');
  const [newProgHabit, setNewProgHabit] = useState<HabitCode>('HEALTHY_EATING');
  const [newProgDesc, setNewProgDesc] = useState('');
  const [newProgSchedule, setNewProgSchedule] = useState('Setiap Hari');
  const [newProgPic, setNewProgPic] = useState(`Guru ${activeRombel.name} & Paguyuban`);
  const [newProgScope, setNewProgScope] = useState(`Seluruh Siswa ${activeRombel.name} (${activeRombel.phase || 'Fase D'})`);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateRtl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRtlFinding || !newRtlActionPlan) {
      showToast('Harap lengkapi indikator temuan dan rencana aksi.');
      return;
    }
    const newPlan: FollowUpPlan = {
      id: `rtl-${Date.now()}`,
      schoolId: activeSchool.id,
      finding: newRtlFinding,
      supportingData: `Catatan monitoring pembiasaan ${activeRombel.name} (${activeRombel.phase || 'Fase D'})`,
      rootCause: newRtlRootCause || 'Berdasarkan rekapitulasi data pembiasaan',
      rootCauseType: newRtlRootCauseType,
      actionPlan: newRtlActionPlan,
      target: `Siswa ${activeRombel.name} & Orang Tua`,
      indicator: 'Peningkatan konsistensi pembiasaan mandiri',
      owner: newRtlOwner,
      startDate: new Date().toISOString().split('T')[0],
      deadline: newRtlDeadline,
      status: 'ACTIVE',
      progressPercent: Number(newRtlProgress) || 20,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newPlan, ...localFollowUps];
    setLocalFollowUps(updated);
    try {
      localStorage.setItem(FOLLOWUPS_STORAGE_KEY, JSON.stringify(updated));
    } catch (_e) {}
    setIsRtlModalOpen(false);
    setNewRtlFinding('');
    setNewRtlActionPlan('');
    setNewRtlRootCause('');
    showToast('Rencana Tindak Lanjut (RTL) berhasil ditambahkan!');

    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId: currentPersona?.id || 'usr-teacher-01',
        actorRole: 'TEACHER',
        action: 'CREATE_RTL',
        targetEntity: 'follow_up_plans',
        targetId: newPlan.id,
        metadata: { finding: newPlan.finding, actionPlan: newPlan.actionPlan },
      }),
    }).catch(() => {});
  };

  const handleUpdateRtlProgress = (id: string, newPercent: number) => {
    const updated = localFollowUps.map((r) =>
      r.id === id
        ? {
            ...r,
            progressPercent: newPercent,
            status: (newPercent >= 100 ? 'COMPLETED' : 'ACTIVE') as 'COMPLETED' | 'ACTIVE',
            updatedAt: new Date().toISOString().split('T')[0],
          }
        : r
    );
    setLocalFollowUps(updated);
    try {
      localStorage.setItem(FOLLOWUPS_STORAGE_KEY, JSON.stringify(updated));
    } catch (_e) {}
    showToast('Progres RTL berhasil diperbarui.');
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgTitle || !newProgDesc) {
      showToast('Harap lengkapi nama program dan deskripsinya.');
      return;
    }
    const newProg: SchoolProgram = {
      id: `prog-${Date.now()}`,
      schoolId: activeSchool.id,
      title: newProgTitle,
      description: newProgDesc,
      habitCode: newProgHabit,
      participantScope: newProgScope,
      schedule: newProgSchedule,
      pic: newProgPic,
      startDate: new Date().toISOString().split('T')[0],
      evidenceCount: 0,
      isActive: true,
    };
    const updated = [newProg, ...localPrograms];
    setLocalPrograms(updated);
    try {
      localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(updated));
    } catch (_e) {}
    setIsProgramModalOpen(false);
    setNewProgTitle('');
    setNewProgDesc('');
    showToast('Inisiatif Program Kelas berhasil ditambahkan!');

    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId: currentPersona?.id || 'usr-teacher-01',
        actorRole: 'TEACHER',
        action: 'CREATE_PROGRAM',
        targetEntity: 'school_programs',
        targetId: newProg.id,
        metadata: { title: newProg.title, habitCode: newProg.habitCode },
      }),
    }).catch(() => {});
  };

  const handleValidateStudent = (studentId: string) => {
    const updated = { ...teacherValidations, [studentId]: true };
    const s = studentsList.find((st) => st.id === studentId);
    if (s?.nisn) updated[s.nisn] = true;
    setTeacherValidations(updated);
    saveStoredValidations(updated);

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent((prev) => (prev ? { ...prev, validatedByTeacher: true } : null));
    }

    // Also notify App / backend through onValidateJournal
    const studentJ = syncedJournals.find(
      (j) =>
        j.studentId === studentId ||
        (s && s.nisn && j.studentNisn === s.nisn) ||
        (s && j.studentName && j.studentName.toLowerCase().trim() === s.name.toLowerCase().trim())
    );

    if (studentJ && onValidateJournal) {
      onValidateJournal(studentJ.id, undefined, 'Divalidasi oleh Wali Kelas', {
        validatorName: activeRombel.teacher || currentPersona?.name || 'Wali Kelas',
        asTeacher: true,
      });
    }

    // Persist validation to journals in localStorage
    try {
      const storedJournalsStr = localStorage.getItem('si7kaih_journals_prod');
      if (storedJournalsStr) {
        const list: DailyJournal[] = JSON.parse(storedJournalsStr);
        let modified = false;
        const nextList = list.map((j) => {
          const match =
            j.studentId === studentId ||
            (s && s.nisn && j.studentNisn === s.nisn) ||
            (s && j.studentName && j.studentName.toLowerCase().trim() === s.name.toLowerCase().trim());
          if (match) {
            modified = true;
            const updatedEntries = { ...j.entries };
            if (updatedEntries) {
              Object.keys(updatedEntries).forEach((k) => {
                const hCode = k as HabitCode;
                if (updatedEntries[hCode]) {
                  updatedEntries[hCode] = { ...updatedEntries[hCode], teacherValidated: true };
                }
              });
            }
            return {
              ...j,
              teacherValidated: true,
              teacherValidatedAt: new Date().toISOString(),
              entries: updatedEntries,
            };
          }
          return j;
        });
        if (modified) {
          localStorage.setItem('si7kaih_journals_prod', JSON.stringify(nextList));
          setSyncedJournals(nextList);
          window.dispatchEvent(new CustomEvent('si7kaih_journals_updated', { detail: nextList }));
        }
      }
    } catch (_e) {}

    showToast(`Jurnal ananda ${s?.name || 'siswa'} berhasil divalidasi oleh Wali Kelas.`);
  };

  const handleValidateAllToday = () => {
    const studentsWithToday = studentsList.filter((s) => s.completedTodayCount > 0 && !s.validatedByTeacher);
    if (studentsWithToday.length === 0) {
      showToast('Semua siswa yang mengisi hari ini sudah tervalidasi.');
      return;
    }

    const updated = { ...teacherValidations };
    studentsWithToday.forEach((s) => {
      updated[s.id] = true;
      if (s.nisn) updated[s.nisn] = true;
    });
    setTeacherValidations(updated);
    saveStoredValidations(updated);

    try {
      const storedJournalsStr = localStorage.getItem('si7kaih_journals_prod');
      if (storedJournalsStr) {
        const list: DailyJournal[] = JSON.parse(storedJournalsStr);
        const idsSet = new Set(studentsWithToday.map((s) => s.id));
        const nisnsSet = new Set(studentsWithToday.map((s) => s.nisn).filter(Boolean));
        const namesSet = new Set(studentsWithToday.map((s) => s.name.toLowerCase().trim()));

        const nextList = list.map((j) => {
          const match =
            (j.studentId && idsSet.has(j.studentId)) ||
            (j.studentNisn && nisnsSet.has(j.studentNisn)) ||
            (j.studentName && namesSet.has(j.studentName.toLowerCase().trim()));
          if (match) {
            const updatedEntries = { ...j.entries };
            if (updatedEntries) {
              Object.keys(updatedEntries).forEach((k) => {
                const hCode = k as HabitCode;
                if (updatedEntries[hCode]) {
                  updatedEntries[hCode] = { ...updatedEntries[hCode], teacherValidated: true };
                }
              });
            }
            return {
              ...j,
              teacherValidated: true,
              teacherValidatedAt: new Date().toISOString(),
              entries: updatedEntries,
            };
          }
          return j;
        });

        localStorage.setItem('si7kaih_journals_prod', JSON.stringify(nextList));
        setSyncedJournals(nextList);
        window.dispatchEvent(new CustomEvent('si7kaih_journals_updated', { detail: nextList }));
      }
    } catch (_e) {}

    showToast(`Berhasil memvalidasi ${studentsWithToday.length} siswa yang mengisi hari ini!`);
  };

  // Synchronized aggregates (reset to 0 if no students or no journal entries)
  const totalStudentsCount = studentsList.length;
  const filledTodayCount = studentsList.filter((s) => s.completedTodayCount > 0).length;
  const averageConsistency = studentsList.length > 0
    ? Math.round((studentsList.reduce((acc, s) => acc + s.monthlyConsistency, 0) / studentsList.length) * 10) / 10
    : 0;
  const averageCompleteness = studentsList.length > 0
    ? Math.round((studentsList.reduce((acc, s) => acc + s.completenessRate, 0) / studentsList.length) * 10) / 10
    : 0;

  const averageHabitsToday = useMemo(() => {
    if (filledTodayCount === 0) return 0;
    const totalTodayHabits = studentsList.reduce((acc, s) => acc + s.completedTodayCount, 0);
    return Math.round((totalTodayHabits / filledTodayCount) * 10) / 10;
  }, [studentsList, filledTodayCount]);

  const classAvgHabitsPerEntry = useMemo(() => {
    if (studentsList.length === 0) return 0;
    const sum = studentsList.reduce((acc, s) => acc + (s.avgHabitsCompleted || 0), 0);
    return Math.round((sum / studentsList.length) * 10) / 10;
  }, [studentsList]);

  const goodCount = studentsList.filter((s) => s.category === 'TERPANTAU_BAIK').length;
  const strengthenCount = studentsList.filter((s) => s.category === 'PERLU_PENGUATAN').length;
  const supportCount = studentsList.filter((s) => s.category === 'PERLU_PENDAMPINGAN').length;
  const unupdatedCount = studentsList.filter((s) => s.category === 'BELUM_ADA_DATA').length;
  const validatedCount = studentsList.filter((s) => s.validatedByTeacher).length;

  // Class journals strictly matched to students in this rombel and school
  const classJournals = useMemo(() => {
    const studentIds = new Set(rawClassStudents.map((s) => s.id));
    const studentNisns = new Set(rawClassStudents.map((s) => s.nisn).filter(Boolean));
    const studentNames = new Set(rawClassStudents.map((s) => s.name.toLowerCase().trim()));
    const normActiveRombel = normalizeClassName(activeRombel.name);

    return syncedJournals.filter((j) => {
      if (j.studentId && (studentIds.has(j.studentId) || studentNisns.has(j.studentId))) return true;
      if (j.studentNisn && (studentNisns.has(j.studentNisn) || studentIds.has(j.studentNisn))) return true;
      if (j.studentName && studentNames.has(j.studentName.toLowerCase().trim())) return true;
      if (j.className && normActiveRombel) {
        const normJ = normalizeClassName(j.className);
        if (normJ === normActiveRombel || normJ.includes(normActiveRombel) || normActiveRombel.includes(normJ)) return true;
      }
      return false;
    });
  }, [rawClassStudents, syncedJournals, activeRombel]);

  const hasJournalData = useMemo(() => {
    return classJournals.length > 0;
  }, [classJournals]);

  const classHabitStats = useMemo(() => {
    const habitDefinitions = [
      { code: 'WAKE_EARLY', name: 'Bangun Pagi' },
      { code: 'WORSHIP', name: 'Beribadah' },
      { code: 'EXERCISE', name: 'Berolahraga' },
      { code: 'HEALTHY_EATING', name: 'Makan Sehat & Bergizi' },
      { code: 'LEARNING', name: 'Gemar Belajar' },
      { code: 'SOCIAL', name: 'Bermasyarakat' },
      { code: 'SLEEP_EARLY', name: 'Tidur Cepat' },
    ];

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const localTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const utcTodayStr = now.toISOString().split('T')[0];

    const todayJournals = classJournals.filter((j) => {
      const d = j.journalDate || (j as any).date;
      return d === localTodayStr || d === utcTodayStr;
    });

    const totalRegisteredStudents = studentsList.length;

    return habitDefinitions.map((h) => {
      const hCode = h.code as HabitCode;

      // Hitung persentase keterlaksanaan bulan berjalan berdasarkan rata-rata pengisian jurnal murid dari sejumlah siswa yang terdaftar
      let sumStudentRates = 0;
      let totalCompletedInMonth = 0;
      let totalJournalEntriesInMonth = 0;

      studentsList.forEach((st) => {
        // Ambil riwayat jurnal siswa terdaftar ini
        const sJournals = classJournals.filter((j) => {
          if (j.studentId && (j.studentId === st.id || j.studentId === st.nisn)) return true;
          if (j.studentNisn && st.nisn && j.studentNisn === st.nisn) return true;
          if (j.studentName && st.name && j.studentName.toLowerCase().trim() === st.name.toLowerCase().trim()) return true;
          return false;
        });

        // Filter jurnal bulan berjalan
        const monthJournals = sJournals.filter((j) => {
          const d = j.journalDate || (j as any).date;
          return d ? d.startsWith(currentMonthPrefix) : true;
        });
        const targetJournals = monthJournals.length > 0 ? monthJournals : sJournals;

        if (targetJournals.length > 0) {
          totalJournalEntriesInMonth += targetJournals.length;
          let studentHabitDone = 0;
          targetJournals.forEach((j) => {
            const habitEntry = (j.entries && j.entries[hCode]) || (j.habits && (j as any).habits[hCode]);
            if (habitEntry && habitEntry.completed) {
              studentHabitDone++;
              totalCompletedInMonth++;
            }
          });
          const studentRate = studentHabitDone / targetJournals.length;
          sumStudentRates += studentRate;
        }
      });

      // Rata-rata persentase keterlaksanaan dari seluruh siswa yang terdaftar
      const pct = totalRegisteredStudents > 0
        ? Math.min(100, Math.max(0, Math.round((sumStudentRates / totalRegisteredStudents) * 100)))
        : 0;

      let todayCompletedCount = 0;
      todayJournals.forEach((j) => {
        const habitEntry = (j.entries && j.entries[hCode]) || (j.habits && (j as any).habits[hCode]);
        if (habitEntry && habitEntry.completed) {
          todayCompletedCount++;
        }
      });

      return {
        code: h.code,
        name: h.name,
        percentage: pct,
        completedCount: totalCompletedInMonth,
        totalCount: totalJournalEntriesInMonth,
        todayCompletedCount,
        todayTotalCount: todayJournals.length,
        status: (pct >= 80 ? 'TERPANTAU_BAIK' : pct >= 60 ? 'PERLU_PENGUATAN' : pct > 0 ? 'PERLU_PENDAMPINGAN' : 'BELUM_ADA_DATA') as any,
      };
    });
  }, [classJournals, studentsList]);

  const sortedHabits = useMemo(() => {
    return [...classHabitStats].sort((a, b) => b.percentage - a.percentage);
  }, [classHabitStats]);

  const topHabit = sortedHabits[0];
  const secondTopHabit = sortedHabits[1];
  const lowestHabit = useMemo(() => {
    if (!hasJournalData) return null;
    return sortedHabits[sortedHabits.length - 1];
  }, [sortedHabits, hasJournalData]);
  const secondLowestHabit = useMemo(() => {
    if (!hasJournalData || sortedHabits.length < 2) return null;
    return sortedHabits[sortedHabits.length - 2];
  }, [sortedHabits, hasJournalData]);

  // Open real Student Dossier with true data or structured empty state
  const openStudentDossier = (s: StudentClassRow) => {
    const sJournals = syncedJournals.filter((j) => {
      return (
        j.studentId === s.id ||
        j.studentId === s.nisn ||
        (j.studentNisn && s.nisn && j.studentNisn === s.nisn) ||
        (j.studentName && s.name && j.studentName.toLowerCase().trim() === s.name.toLowerCase().trim())
      );
    });
    const habitCodes: HabitCode[] = [
      'WAKE_EARLY',
      'WORSHIP',
      'EXERCISE',
      'HEALTHY_EATING',
      'LEARNING',
      'SOCIAL',
      'SLEEP_EARLY',
    ];

    const habitBreakdown: Record<HabitCode, { percentage: number; days: number }> = {
      WAKE_EARLY: { percentage: 0, days: 0 },
      WORSHIP: { percentage: 0, days: 0 },
      EXERCISE: { percentage: 0, days: 0 },
      HEALTHY_EATING: { percentage: 0, days: 0 },
      LEARNING: { percentage: 0, days: 0 },
      SOCIAL: { percentage: 0, days: 0 },
      SLEEP_EARLY: { percentage: 0, days: 0 },
    };

    if (sJournals.length > 0) {
      habitCodes.forEach((code) => {
        const count = sJournals.filter((j) => {
          const entry = (j.entries && j.entries[code]) || (j.habits && j.habits[code]);
          return entry && entry.completed;
        }).length;
        habitBreakdown[code] = {
          percentage: Math.min(100, Math.round((count / sJournals.length) * 100)),
          days: count,
        };
      });
    }

    const dossierData: StudentDossierData = {
      id: s.id,
      nisn: s.nisn,
      name: s.name,
      className: activeRombel.name,
      completedTodayCount: s.completedTodayCount,
      monthlyConsistency: s.monthlyConsistency,
      completenessRate: s.completenessRate,
      category: s.category,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      gender: s.gender,
      status: s.status,
      validatedByTeacher: s.validatedByTeacher,
      lastJournalDate: s.lastJournalDate,
      habitBreakdown,
      recentJournals: sJournals.slice(0, 10).map((j) => {
        const count = j.entries
          ? Object.values(j.entries).filter((e: any) => e?.completed).length
          : j.habits
          ? Object.values(j.habits).filter((e: any) => e?.completed).length
          : j.completedCount || 0;
        return {
          date: j.journalDate || (j as any).date || '',
          count,
          status: count >= 6 ? 'Lengkap' : count >= 4 ? 'Cukup' : 'Perlu Pendampingan',
          time: (j as any).savedAt || (j as any).time || (j.updatedAt ? new Date(j.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-'),
        };
      }),
    };
    setSelectedStudent(dossierData);
  };

  const handleExportCsv = () => {
    const headers = [
      'No',
      'NISN',
      'Nama Siswa',
      'Kelas',
      'Jenis Kelamin',
      'Status Siswa',
      'Nama Orang Tua',
      'No. HP Orang Tua',
      'Jurnal Hari Ini',
      'Rerata Isian Kebiasaan',
      'Kelengkapan (%)',
      'Konsistensi (%)',
      'Kategori Monitoring',
      'Validasi Guru',
    ];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.nisn}"`,
      `"${s.name}"`,
      `"${activeRombel.name}"`,
      s.gender || 'L',
      `"${s.status || 'AKTIF'}"`,
      `"${s.parentName || '-'}"`,
      `"${s.parentPhone || '-'}"`,
      `"${s.completedTodayCount}/7"`,
      `"${s.avgHabitsCompleted || 0}/7"`,
      `${s.completenessRate}%`,
      `${s.monthlyConsistency}%`,
      s.category === 'TERPANTAU_BAIK'
        ? 'Terpantau Baik'
        : s.category === 'PERLU_PENGUATAN'
        ? 'Perlu Penguatan'
        : s.category === 'PERLU_PENDAMPINGAN'
        ? 'Perlu Pendampingan'
        : 'Belum Ada Data',
      s.validatedByTeacher ? 'Tervalidasi' : 'Belum Divalidasi',
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeClassName = activeRombel.name.replace(/\s+/g, '_');
    a.download = `Data_7KAIH_${safeClassName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Data monitoring pembiasaan ${activeRombel.name} berhasil diunduh (CSV).`);
  };

  const handleGenerateClassAi = async () => {
    setIsAnalyzingAi(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'TEACHER_CLASS_INSIGHT',
          payload: {
            className: `${activeRombel.name} (${activeRombel.phase || 'Fase D'})`,
            schoolName: activeSchool.name,
            stats: classHabitStats,
            completenessRate: averageCompleteness,
            averageConsistency: averageConsistency,
            totalStudents: totalStudentsCount,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiAnalysisResult(json.data);
      } else {
        if (!hasJournalData || totalStudentsCount === 0) {
          setAiAnalysisResult({
            recordedFacts: [
              `Belum ada data jurnal pembiasaan yang diperbarui untuk rombel ${activeRombel.name} (${activeRombel.phase || 'Fase D'}).`,
              `Total ${totalStudentsCount} siswa terdaftar di rombel ini dengan status pemantauan aktif.`,
            ],
            habitPatterns: [
              'Data pembiasaan harian menunggu entri pertama dari siswa atau orang tua.',
            ],
            dataLimitations: [
              'Ketiadaan data jurnal menandakan sistem belum menerima pembaruan dari Admin Sekolah atau peserta didik.',
            ],
            hypothesesToVerify: [
              'Perlu sosialisasi pengisian jurnal 7 Kebiasaan Anak Indonesia Hebat kepada peserta didik dan orang tua.',
            ],
            actionableRecommendations: [
              'Sosialisasikan jadwal dan tata cara pengisian jurnal mandiri kepada siswa.',
              'Koordinasikan dengan paguyuban kelas untuk mendukung pembiasaan di rumah.',
            ],
          });
        } else {
          setAiAnalysisResult({
            recordedFacts: [
              `Kelengkapan jurnal harian ${activeRombel.name} (${activeRombel.phase || 'Fase D'}) mencapai ${averageCompleteness}% dengan ${totalStudentsCount} siswa terdaftar.`,
              topHabit && topHabit.percentage > 0
                ? `Pembiasaan ${topHabit.name} (${topHabit.percentage}%)${secondTopHabit && secondTopHabit.percentage > 0 ? ` dan ${secondTopHabit.name} (${secondTopHabit.percentage}%)` : ''} mencatat konsistensi tertinggi terpantau.`
                : 'Belum ada pembiasaan yang mencatat konsistensi mandiri signifikan.',
              lowestHabit
                ? `Pembiasaan ${lowestHabit.name} berada pada angka ${lowestHabit.percentage}%.`
                : 'Belum ada data pembiasaan tercatat.',
            ],
            habitPatterns: [
              'Konsistensi hari kerja menunjukkan keteraturan yang lebih baik dibanding akhir pekan.',
              'Keteraturan pagi berkaitan erat dengan persiapan belajar siswa di kelas.',
            ],
            dataLimitations: [
              `Sebanyak ${Math.max(0, Math.round(100 - averageCompleteness))}% jurnal harian masih menunggu pengisian berkala.`,
            ],
            hypothesesToVerify: [
              'Dukungan dan monitoring berkala orang tua di rumah berpengaruh signifikan terhadap kontinuitas pembiasaan.',
            ],
            actionableRecommendations: [
              'Diskusikan penguatan pembiasaan bersama paguyuban kelas secara berkala.',
              goodCount > 0 ? `Apresiasi ${goodCount} siswa terpantau konsisten dalam apel pagi sekolah.` : 'Sosialisasikan tata cara pengisian jurnal 7KAIH.',
              supportCount > 0 ? `Lakukan pendampingan suportif terhadap ${supportCount} siswa tanpa pelabelan negatif.` : 'Pertahankan budaya positif kelas.',
            ],
          });
        }
      }
    } catch {
      setAiAnalysisResult({
        recordedFacts: [
          `Data ${activeRombel.name} menunjukkan kelengkapan ${averageCompleteness}% dan konsistensi rata-rata ${averageConsistency}%.`,
          topHabit && topHabit.percentage > 0 ? `Pembiasaan tertinggi: ${topHabit.name} (${topHabit.percentage}%).` : 'Belum ada pembiasaan dengan konsistensi tercatat.',
        ],
        habitPatterns: ['Pengisian jurnal membutuhkan koordinasi suportif dengan peserta didik dan orang tua.'],
        dataLimitations: ['Data entri pembiasaan sedang dalam pembaruan berkala dari peserta didik.'],
        hypothesesToVerify: ['Komunikasi dengan orang tua menjadi faktor pendukung utama pembiasaan mandiri.'],
        actionableRecommendations: ['Sosialisasikan pembiasaan 7 Kebiasaan Anak Indonesia Hebat dalam paguyuban kelas.'],
      });
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleGenerateAiRtl = async (customFocus?: string) => {
    setIsGeneratingAiRtl(true);
    setAiRtlAppliedSuccess(false);
    try {
      const sortedByLowest = [...classHabitStats].sort((a, b) => (a.percentage || 0) - (b.percentage || 0));
      const lowestHabitObj = sortedByLowest[0];
      const lowestHabitCode = (lowestHabitObj?.code as string) || 'SLEEP_EARLY';

      const chosenFocus = customFocus || (aiRtlFocusHabit === 'AUTO' ? lowestHabitCode : aiRtlFocusHabit);

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'FollowUpGenerator',
          actorRole: 'TEACHER',
          payload: {
            className: `${activeRombel.name} (${activeRombel.phase || 'Fase D'})`,
            schoolName: activeSchool.name,
            focusHabit: chosenFocus,
            lowestHabit: lowestHabitCode,
            completenessRate: averageCompleteness,
            consistencyRate: averageConsistency,
            totalStudents: totalStudentsCount,
            stats: classHabitStats,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.rtlSuggestion) {
          setAiRtlGeneratedSuggestion(json.data.rtlSuggestion);
          showToast('✨ Draf RTL berhasil dirumuskan oleh Asisten AI!');
        } else if (json.data?.recommendations?.[0]) {
          const fallbackSuggestion: AIRtlSuggestion = {
            finding: `Penguatan pembiasaan ${chosenFocus} pada rombel ${activeRombel.name}.`,
            rootCauseType: 'HYPOTHESIS_TO_VERIFY',
            rootCause: json.data.hypothesesToVerify?.[0] || 'Keteraturan aktivitas di rumah perlu diselaraskan dengan agenda sekolah.',
            actionPlan: json.data.recommendations[0],
            target: `Peserta Didik ${activeRombel.name} & Orang Tua`,
            indicator: 'Peningkatan konsistensi pembiasaan mandiri ≥85%',
            owner: `Wali Kelas & Paguyuban ${activeRombel.name}`,
            recommendedDeadline: new Date(Date.now() + 21 * 24 * 3600 * 1000).toISOString().split('T')[0],
            reasoning: 'Intervensi positif dan kolaboratif menumbuhkan kesadaran intrinsik siswa tanpa tekanan moral.',
          };
          setAiRtlGeneratedSuggestion(fallbackSuggestion);
          showToast('✨ Draf RTL berhasil dirumuskan oleh AI!');
        }
      }
    } catch (_err) {
      showToast('Gagal memuat bantuan AI, menggunakan draf rekomendasi lokal.');
    } finally {
      setIsGeneratingAiRtl(false);
    }
  };

  const handleApplyAiRtlSuggestion = (suggestionToApply?: AIRtlSuggestion) => {
    const s = suggestionToApply || aiRtlGeneratedSuggestion;
    if (!s) return;
    setNewRtlFinding(s.finding);
    setNewRtlRootCauseType(s.rootCauseType || 'FACT');
    setNewRtlRootCause(s.rootCause || '');
    setNewRtlActionPlan(s.actionPlan || '');
    if (s.owner) setNewRtlOwner(s.owner);
    if (s.recommendedDeadline) setNewRtlDeadline(s.recommendedDeadline);
    setAiRtlAppliedSuccess(true);
    showToast('✨ Draf AI diterapkan ke formulir! Anda dapat menyesuaikan teks sebelum menyimpan.');
    setTimeout(() => setAiRtlAppliedSuccess(false), 5000);
  };

  const handleOpenAiRtl = (presetFocus?: string) => {
    setIsRtlModalOpen(true);
    setIsAiRtlAssistantOpen(true);
    if (presetFocus) {
      setAiRtlFocusHabit(presetFocus);
      handleGenerateAiRtl(presetFocus);
    } else {
      if (!aiRtlGeneratedSuggestion) {
        handleGenerateAiRtl('AUTO');
      }
    }
  };

  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn.includes(searchTerm);
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || (s.status || 'AKTIF') === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // ==========================================================================
  // 1. REKAP LINIMASA PEMBIASAAN SEPEKAN TERAKHIR MURID
  // ==========================================================================
  const [timelineStudentId, setTimelineStudentId] = useState<string>('ALL');

  const selectedTimelineStudent = useMemo(() => {
    if (timelineStudentId === 'ALL') return null;
    return studentsList.find((s) => s.id === timelineStudentId || s.nisn === timelineStudentId) || null;
  }, [timelineStudentId, studentsList]);

  // 7-day timeline strip (from 6 days ago up to today)
  const timelineRecentDays = useMemo(() => {
    const list = [];
    const baseDate = new Date();
    const todayStr = getLocalDateString(baseDate);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const str = getLocalDateString(d);

      if (timelineStudentId === 'ALL') {
        const dateJournals = classJournals.filter((j) => {
          const dStr = j.journalDate || (j as any).date;
          return dStr === str;
        });

        const studentSet = new Set<string>();
        dateJournals.forEach((j) => {
          const key = j.studentId || j.studentNisn || j.studentName || '';
          if (key) studentSet.add(key);
        });

        const studentsFilledCount = studentSet.size;
        const total = totalStudentsCount > 0 ? totalStudentsCount : 1;
        const rate = Math.round((studentsFilledCount / total) * 100);

        let totalHabitsCompleted = 0;
        dateJournals.forEach((j) => {
          let cnt = 0;
          if (typeof j.completedCount === 'number') cnt = j.completedCount;
          else if (j.entries) cnt = Object.values(j.entries).filter((e: any) => !!e?.completed).length;
          else if (j.habits) cnt = Object.values(j.habits).filter((e: any) => !!e?.completed).length;
          totalHabitsCompleted += cnt;
        });

        const avgHabits = studentsFilledCount > 0 ? Math.round((totalHabitsCompleted / studentsFilledCount) * 10) / 10 : 0;
        const hasRecord = studentsFilledCount > 0;
        const isFull = rate >= 80;
        const isPartial = rate > 0 && rate < 80;

        list.push({
          dateStr: str,
          dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }),
          dayNum: d.getDate(),
          fullDateLabel: formatIndonesianFullDate(d),
          studentsFilledCount,
          totalStudentsCount,
          rate,
          avgHabits,
          hasRecord,
          isFull,
          isPartial,
          isToday: str === todayStr,
          journalsCount: dateJournals.length,
        });
      } else {
        const match = classJournals.find((j) => {
          const dStr = j.journalDate || (j as any).date;
          if (dStr !== str) return false;
          if (selectedTimelineStudent?.id && j.studentId === selectedTimelineStudent.id) return true;
          if (selectedTimelineStudent?.nisn && (j.studentNisn === selectedTimelineStudent.nisn || j.studentId === selectedTimelineStudent.nisn)) return true;
          if (selectedTimelineStudent?.name && j.studentName && j.studentName.toLowerCase().trim() === selectedTimelineStudent.name.toLowerCase().trim()) return true;
          return false;
        });

        let count = 0;
        if (match) {
          if (typeof match.completedCount === 'number') count = match.completedCount;
          else if (match.entries) count = Object.values(match.entries).filter((e: any) => !!e?.completed).length;
          else if (match.habits) count = Object.values(match.habits).filter((e: any) => !!e?.completed).length;
        }

        const hasRecord = count > 0;
        const isFull = count >= 6;
        const isPartial = count > 0 && count < 6;
        const isValidated = match?.teacherValidated || (selectedTimelineStudent ? teacherValidations[selectedTimelineStudent.id] : false);

        list.push({
          dateStr: str,
          dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }),
          dayNum: d.getDate(),
          fullDateLabel: formatIndonesianFullDate(d),
          completedCount: count,
          hasRecord,
          isFull,
          isPartial,
          isValidated: !!isValidated,
          isToday: str === todayStr,
          savedAt: match?.savedAt || (match?.updatedAt ? formatRealtimeSaveTime(match.updatedAt, 'WITA') : null),
        });
      }
    }
    return list;
  }, [timelineStudentId, classJournals, totalStudentsCount, selectedTimelineStudent, teacherValidations]);

  const timelineActiveDays = useMemo(() => {
    return timelineRecentDays.filter((d: any) => (d.studentsFilledCount || d.completedCount || 0) > 0).length;
  }, [timelineRecentDays]);

  // ==========================================================================
  // 2. REKAP KALENDER KEBIASAAN 7KAIH MURID (UPDATE INFO BULAN TAHUN)
  // ==========================================================================
  const [calDate, setCalDate] = useState<Date>(() => new Date());
  const [calHabitFilter, setCalHabitFilter] = useState<string>('ALL');
  const [calStudentId, setCalStudentId] = useState<string>('ALL');
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [calLastSyncTime, setCalLastSyncTime] = useState<string>(() => formatTimeOnly(new Date(), 'WITA'));

  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calFirstDayIndex = new Date(calYear, calMonth, 1).getDay(); // 0 = Sunday
  const calMonthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const calMonthLabel = calMonthNames[calMonth];
  const calDayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const selectedCalStudent = useMemo(() => {
    if (calStudentId === 'ALL') return null;
    return studentsList.find((s) => s.id === calStudentId || s.nisn === calStudentId) || null;
  }, [calStudentId, studentsList]);

  // Monthly journals for rombel or selected student
  const calMonthJournals = useMemo(() => {
    const prefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
    return classJournals.filter((j) => {
      const dStr = j.journalDate || (j as any).date;
      if (!dStr || !dStr.startsWith(prefix)) return false;
      if (calStudentId === 'ALL') return true;
      if (selectedCalStudent?.id && j.studentId === selectedCalStudent.id) return true;
      if (selectedCalStudent?.nisn && (j.studentNisn === selectedCalStudent.nisn || j.studentId === selectedCalStudent.nisn)) return true;
      if (selectedCalStudent?.name && j.studentName && j.studentName.toLowerCase().trim() === selectedCalStudent.name.toLowerCase().trim()) return true;
      return false;
    });
  }, [classJournals, calYear, calMonth, calStudentId, selectedCalStudent]);

  // Date -> Journals Map
  const calDateJournalsMap = useMemo(() => {
    const map = new Map<string, DailyJournal[]>();
    calMonthJournals.forEach((j) => {
      const dStr = j.journalDate || (j as any).date;
      if (!dStr) return;
      if (!map.has(dStr)) map.set(dStr, []);
      map.get(dStr)!.push(j);
    });
    return map;
  }, [calMonthJournals]);

  // Monthly metrics
  const calRecordedDays = useMemo(() => {
    return calDateJournalsMap.size;
  }, [calDateJournalsMap]);

  const calHabitualDays = useMemo(() => {
    if (calStudentId === 'ALL') {
      let count = 0;
      calDateJournalsMap.forEach((jList) => {
        const unique = new Set(jList.map((j) => j.studentId || j.studentNisn || j.studentName).filter(Boolean));
        const rate = totalStudentsCount > 0 ? (unique.size / totalStudentsCount) * 100 : 0;
        if (rate >= 75) count++;
      });
      return count;
    } else {
      return calMonthJournals.filter((j) => {
        const cnt = typeof j.completedCount === 'number'
          ? j.completedCount
          : Object.values(j.entries || {}).filter((e: any) => !!e?.completed).length;
        return cnt >= 6;
      }).length;
    }
  }, [calStudentId, calDateJournalsMap, calMonthJournals, totalStudentsCount]);

  const calAverageHabits = useMemo(() => {
    if (calMonthJournals.length === 0) return 0;
    let totalHabits = 0;
    calMonthJournals.forEach((j) => {
      let cnt = 0;
      if (typeof j.completedCount === 'number') cnt = j.completedCount;
      else if (j.entries) cnt = Object.values(j.entries).filter((e: any) => !!e?.completed).length;
      else if (j.habits) cnt = Object.values(j.habits).filter((e: any) => !!e?.completed).length;
      totalHabits += cnt;
    });
    return Math.round((totalHabits / calMonthJournals.length) * 10) / 10;
  }, [calMonthJournals]);

  const calValidatedDays = useMemo(() => {
    if (calStudentId === 'ALL') {
      return calMonthJournals.filter((j) => {
        if (j.teacherValidated) return true;
        if (j.studentId && teacherValidations[j.studentId]) return true;
        if (j.studentNisn && teacherValidations[j.studentNisn]) return true;
        return false;
      }).length;
    } else {
      return calMonthJournals.filter((j) => {
        if (j.teacherValidated || j.parentValidated) return true;
        if (selectedCalStudent && teacherValidations[selectedCalStudent.id]) return true;
        return false;
      }).length;
    }
  }, [calStudentId, calMonthJournals, teacherValidations, selectedCalStudent]);

  const calTargetThreshold = calculateHabitualThreshold(calDaysInMonth);
  const calCompletenessRate = Math.round((calRecordedDays / calDaysInMonth) * 100);

  const isCalCurrentMonth = useMemo(() => {
    const now = new Date();
    return now.getFullYear() === calYear && now.getMonth() === calMonth;
  }, [calYear, calMonth]);

  const handlePrevCalMonth = () => {
    setCalDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextCalMonth = () => {
    setCalDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const handleTodayCalMonth = () => {
    setCalDate(new Date());
  };

  const handleManualSync = () => {
    setIsManualSyncing(true);
    setTimeout(() => {
      try {
        const raw = localStorage.getItem('si7kaih_journals_prod');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setSyncedJournals(parsed);
        }
      } catch (_e) {}
      setCalLastSyncTime(formatTimeOnly(new Date(), 'WITA'));
      setIsManualSyncing(false);
      showToast('🔄 Kalender kebiasaan murid berhasil disinkronkan!');
    }, 450);
  };

  // Day detail modal state
  const [selectedDayDetailModal, setSelectedDayDetailModal] = useState<{
    dateStr: string;
    fullDateLabel: string;
  } | null>(null);

  const [modalStudentFilterQuery, setModalStudentFilterQuery] = useState('');

  // Students and their journal status on selected date for the Day Detail modal
  const modalDateStudents = useMemo(() => {
    if (!selectedDayDetailModal) return [];
    const dateStr = selectedDayDetailModal.dateStr;

    return studentsList.map((st) => {
      const match = classJournals.find((j) => {
        const dStr = j.journalDate || (j as any).date;
        if (dStr !== dateStr) return false;
        if (j.studentId && (j.studentId === st.id || j.studentId === st.nisn)) return true;
        if (j.studentNisn && st.nisn && j.studentNisn === st.nisn) return true;
        if (j.studentName && st.name && j.studentName.toLowerCase().trim() === st.name.toLowerCase().trim()) return true;
        return false;
      });

      let completedCount = 0;
      const habitsBreakdown: Record<string, boolean> = {};
      if (match) {
        if (typeof match.completedCount === 'number') completedCount = match.completedCount;
        if (match.entries) {
          Object.entries(match.entries).forEach(([k, v]: [string, any]) => {
            habitsBreakdown[k] = !!v?.completed;
          });
          if (completedCount === 0) {
            completedCount = Object.values(match.entries).filter((e: any) => !!e?.completed).length;
          }
        } else if (match.habits) {
          Object.entries(match.habits).forEach(([k, v]: [string, any]) => {
            habitsBreakdown[k] = !!v?.completed;
          });
          if (completedCount === 0) {
            completedCount = Object.values(match.habits).filter((e: any) => !!e?.completed).length;
          }
        }
      }

      const isValidated = !!match?.teacherValidated || !!teacherValidations[st.id] || (st.nisn ? !!teacherValidations[st.nisn] : false);

      return {
        student: st,
        hasJournal: !!match,
        journalId: match?.id,
        completedCount,
        habitsBreakdown,
        isValidated,
        savedAt: match?.savedAt || (match?.updatedAt ? formatRealtimeSaveTime(match.updatedAt, 'WITA') : null),
      };
    });
  }, [selectedDayDetailModal, studentsList, classJournals, teacherValidations]);

  const filteredModalStudents = useMemo(() => {
    if (!modalStudentFilterQuery.trim()) return modalDateStudents;
    const q = modalStudentFilterQuery.toLowerCase().trim();
    return modalDateStudents.filter(
      (item) =>
        item.student.name.toLowerCase().includes(q) ||
        item.student.nisn.includes(q)
    );
  }, [modalDateStudents, modalStudentFilterQuery]);

  const handleValidateAllOnModalDate = () => {
    if (!selectedDayDetailModal) return;
    const unvalidated = modalDateStudents.filter((m) => m.hasJournal && !m.isValidated);
    if (unvalidated.length === 0) {
      showToast('Semua siswa yang mengisi pada tanggal ini sudah tervalidasi.');
      return;
    }

    const updated = { ...teacherValidations };
    unvalidated.forEach((m) => {
      updated[m.student.id] = true;
      if (m.student.nisn) updated[m.student.nisn] = true;
    });
    setTeacherValidations(updated);
    saveStoredValidations(updated);

    try {
      const storedJournalsStr = localStorage.getItem('si7kaih_journals_prod');
      if (storedJournalsStr) {
        const list: DailyJournal[] = JSON.parse(storedJournalsStr);
        const idsSet = new Set(unvalidated.map((m) => m.student.id));
        const nisnsSet = new Set(unvalidated.map((m) => m.student.nisn).filter(Boolean));
        const namesSet = new Set(unvalidated.map((m) => m.student.name.toLowerCase().trim()));

        const nextList = list.map((j) => {
          const match =
            (j.journalDate === selectedDayDetailModal.dateStr || (j as any).date === selectedDayDetailModal.dateStr) &&
            ((j.studentId && idsSet.has(j.studentId)) ||
              (j.studentNisn && nisnsSet.has(j.studentNisn)) ||
              (j.studentName && namesSet.has(j.studentName.toLowerCase().trim())));
          if (match) {
            const updatedEntries = { ...j.entries };
            if (updatedEntries) {
              Object.keys(updatedEntries).forEach((k) => {
                const hCode = k as HabitCode;
                if (updatedEntries[hCode]) {
                  updatedEntries[hCode] = { ...updatedEntries[hCode], teacherValidated: true };
                }
              });
            }
            return {
              ...j,
              teacherValidated: true,
              teacherValidatedAt: new Date().toISOString(),
              entries: updatedEntries,
            };
          }
          return j;
        });

        localStorage.setItem('si7kaih_journals_prod', JSON.stringify(nextList));
        setSyncedJournals(nextList);
        window.dispatchEvent(new CustomEvent('si7kaih_journals_updated', { detail: nextList }));
      }
    } catch (_e) {}

    showToast(`Berhasil memvalidasi ${unvalidated.length} siswa untuk tanggal ${selectedDayDetailModal.dateStr}!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Class Banner with Dapodik & Admin Sekolah Live Sync Indicator */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-blue-50 border border-blue-100/80 text-[#0753A5]">🏫</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Dashboard {activeRombel.name} ({activeRombel.phase || 'Fase D'}) • {activeSchool.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Terhubung Admin Sekolah
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Sinkronisasi Isian Jurnal Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                <span>Wali Kelas: <strong className="text-slate-700 font-semibold">{activeRombel.teacher}</strong></span>
                <span>•</span>
                <span>T.A. {rombelAcademicInfo.academicYear} ({rombelAcademicInfo.semesterName})</span>
                <span>•</span>
                <span>NPSN: {activeSchool.npsn || '20109988'}</span>
              </p>
            </div>
          </div>

          {/* Rombel Switcher & Sync Meta */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-500">Pilih Rombel ({activeSchool.name}):</span>
              <select
                value={selectedRombelId}
                onChange={(e) => setSelectedRombelId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 border-none outline-none cursor-pointer"
              >
                {schoolRombels.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.phase || 'Fase D'}) - Wali: {r.teacher}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={syncAllData}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-[#0753A5] text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
              title="Sinkronkan data dari Admin Sekolah & Dapodik"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sinkronisasi...' : 'Sinkronkan Data'}</span>
            </button>

            <span className="text-[10px] text-slate-400 font-medium">
              Update terakhir: {lastSyncTime} WIB
            </span>
          </div>
        </div>

        {/* View Switcher Chips */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'OVERVIEW' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agregat Kelas
          </button>
          <button
            onClick={() => setActiveTab('MONITORING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'MONITORING' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Kategori Monitoring (7KAIH)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'MONITORING' ? 'bg-blue-100 text-[#0753A5]' : 'bg-slate-200 text-slate-700'
            }`}>
              {studentsList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'STUDENTS' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Validasi Siswa ({studentsList.length})
          </button>
          <button
            onClick={() => setActiveTab('PROGRAMS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PROGRAMS' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Program Kelas ({localPrograms.length})
          </button>
          <button
            onClick={() => setActiveTab('RTL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'RTL' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rencana RTL ({localFollowUps.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('AI_INSIGHT');
              if (!aiAnalysisResult) handleGenerateClassAi();
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'AI_INSIGHT' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Insight Kelas</span>
          </button>
        </div>
      </div>

      {/* Real-time Student Journal Update Alert Banner */}
      {liveSyncToast && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300/80 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 text-emerald-900 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="text-xs">
              <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] mr-1.5 px-1.5 py-0.5 rounded bg-emerald-200/60">
                Update Isian Murid Baru
              </span>
              Ananda <strong className="font-bold text-emerald-950">{liveSyncToast.studentName}</strong>
              {liveSyncToast.className ? ` (${liveSyncToast.className})` : ''} baru saja menyimpan jurnal ({liveSyncToast.count}/7 Kebiasaan) pada {liveSyncToast.time}. Data dashboard kelas telah otomatis terbarui.
            </div>
          </div>
          <button
            onClick={() => setLiveSyncToast(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-emerald-100/80 transition-colors shrink-0 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* 4 Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Kelengkapan Jurnal Kelas
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#0753A5]">{averageCompleteness}%</span>
                <span className={`text-xs font-semibold ${averageCompleteness > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {averageCompleteness > 0 ? `${averageCompleteness}% Lengkap` : 'Belum Ada Data'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {filledTodayCount} dari {totalStudentsCount} siswa sudah mengisi hari ini
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Rata-Rata Konsistensi
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{averageConsistency}%</span>
                <span className={`text-xs font-semibold ${averageConsistency >= 80 ? 'text-emerald-600' : averageConsistency > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {averageConsistency >= 80 ? 'Terbiasa' : averageConsistency > 0 ? 'Perlu Penguatan' : 'Belum Ada Data'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dihitung dari {studentsList.length} siswa rombel {activeRombel.name}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Distribusi Kategori Monitoring
                  </span>
                  <button
                    onClick={() => setActiveTab('MONITORING')}
                    className="text-[11px] font-bold text-[#0753A5] hover:underline cursor-pointer"
                  >
                    Tab Monitoring →
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold" title="Terpantau Baik (≥6 Kebiasaan / ≥80%)">
                    {goodCount} Baik
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-bold" title="Perlu Penguatan (4-5 Kebiasaan / 55-79%)">
                    {strengthenCount} Penguatan
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-bold" title="Perlu Pendampingan (≤3 Kebiasaan / <55%)">
                    {supportCount} Damping
                  </span>
                  {unupdatedCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold" title="Belum Ada Data">
                      {unupdatedCount} Belum Ada Data
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                *Sinkron dengan kelengkapan isian 7 kebiasaan {studentsList.length} siswa rombel {activeRombel.name}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Validasi Wali Kelas Hari Ini
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-900">{validatedCount} / {totalStudentsCount}</span>
                  <span className={`text-xs font-semibold ${totalStudentsCount === 0 ? 'text-slate-400' : totalStudentsCount - validatedCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {totalStudentsCount === 0 ? 'Belum Ada Siswa' : totalStudentsCount - validatedCount > 0 ? `${totalStudentsCount - validatedCount} Menunggu` : 'Semua Tervalidasi'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">
                  {filledTodayCount} siswa isi hari ini
                </span>
                {studentsList.some((s) => s.completedTodayCount > 0 && !s.validatedByTeacher) && (
                  <button
                    onClick={handleValidateAllToday}
                    className="text-[11px] font-bold text-[#0753A5] hover:underline cursor-pointer"
                  >
                    Validasi Semua
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================================ */}
          {/* 1. REKAP LINIMASA PEMBIASAAN SEPEKAN TERAKHIR MURID */}
          {/* ============================================================================ */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0753A5] to-[#20A5D5] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-900">
                      Linimasa Pembiasaan Sepekan Terakhir Murid
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Sinkron Data Terkini</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rekap 7 hari kalender pembiasaan murid di rombel {activeRombel.name} • Klik tanggal untuk detail isian & validasi cepat.
                  </p>
                </div>
              </div>

              {/* Filter Murid & Konsistensi Badge */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-500">Tampilan Murid:</span>
                  <select
                    value={timelineStudentId}
                    onChange={(e) => setTimelineStudentId(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 border-none outline-none cursor-pointer max-w-[200px] truncate"
                  >
                    <option value="ALL">👥 Seluruh Murid Rombel ({totalStudentsCount} Siswa)</option>
                    {studentsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.nisn})
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
                  Konsistensi: <strong className="text-[#0753A5] font-black">{timelineActiveDays} dari 7 Hari</strong> Aktif
                </span>
              </div>
            </div>

            {/* 7-Day Grid Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {timelineRecentDays.map((item: any) => (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() =>
                    setSelectedDayDetailModal({
                      dateStr: item.dateStr,
                      fullDateLabel: item.fullDateLabel,
                    })
                  }
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative group hover:shadow-md ${
                    item.isToday
                      ? 'border-[#0753A5] bg-blue-50/70 ring-2 ring-blue-400/40 shadow-xs'
                      : item.hasRecord
                      ? 'border-slate-200 bg-white hover:border-blue-300'
                      : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                  title={`Klik untuk melihat detail isian jurnal siswa pada ${item.fullDateLabel}`}
                >
                  {/* Header: Day name + Today Pill */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {item.dayName}
                    </span>
                    {item.isToday && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#0753A5] text-white">
                        Hari Ini
                      </span>
                    )}
                  </div>

                  {/* Day Number and Full Date */}
                  <div>
                    <div className="text-xl font-black text-slate-900 group-hover:text-[#0753A5] transition-colors">
                      {item.dayNum}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {item.fullDateLabel.split(',')[1]?.trim() || item.dateStr}
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="pt-2 border-t border-slate-100 w-full flex flex-col gap-1">
                    {timelineStudentId === 'ALL' ? (
                      item.hasRecord ? (
                        <>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold w-fit ${
                              item.isFull
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.isFull ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            <span>
                              {item.studentsFilledCount}/{item.totalStudentsCount} Siswa
                            </span>
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium">
                            Rerata: {item.avgHabits}/7 Kebiasaan
                          </span>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>0 Siswa Mengisi</span>
                        </span>
                      )
                    ) : item.hasRecord ? (
                      <>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold w-fit ${
                            item.isFull
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isFull ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{item.completedCount}/7 Tuntas</span>
                        </span>
                        <span className="text-[9px] font-medium text-slate-500">
                          {item.isValidated ? '✅ Tervalidasi' : '⏳ Menunggu'}
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span>0/7 Terisi</span>
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 7 Habits Aggregate Horizontal Bars */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Konsistensi 7 Kebiasaan di {activeRombel.name} ({activeRombel.phase || 'Fase D'})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Persentase keterlaksanaan rata-rata pengisian jurnal dari {totalStudentsCount} siswa terdaftar bulan berjalan ({currentMonthYearName}).
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0753A5] border border-blue-200">
                {rombelAcademicInfo.fullDisplay}
              </span>
            </div>

            <div className="space-y-4">
              {classHabitStats.map((habit) => (
                <div key={habit.code} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{habit.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          habit.percentage >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : habit.percentage >= 70
                            ? 'bg-amber-100 text-amber-800'
                            : habit.percentage > 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {habit.percentage >= 85
                          ? 'Terpantau Baik'
                          : habit.percentage >= 70
                          ? 'Perlu Penguatan'
                          : habit.percentage > 0
                          ? 'Perlu Pendampingan'
                          : 'Belum Ada Data'}
                      </span>
                      <span className="font-black text-slate-900 w-12 text-right">
                        {habit.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        habit.percentage >= 85
                          ? 'bg-[#41A85F]'
                          : habit.percentage >= 70
                          ? 'bg-[#F5B900]'
                          : habit.percentage > 0
                          ? 'bg-rose-500'
                          : 'bg-slate-200'
                      }`}
                      style={{ width: `${habit.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  {lowestHabit && lowestHabit.percentage > 0
                    ? `Kebiasaan ${lowestHabit.name} (${lowestHabit.percentage}%) menjadi sasaran prioritas Rencana Tindak Lanjut (RTL).`
                    : 'Belum ada data jurnal pembiasaan yang diperbarui untuk rombel ini (data 0%).'}
                </span>
              </span>
              <button
                onClick={() => setActiveTab('RTL')}
                className="font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Buka RTL Kelas →
              </button>
            </div>
          </div>

          {/* ============================================================================ */}
          {/* 2. REKAP KALENDER KEBIASAAN 7KAIH MURID (UPDATE INFO BULAN TAHUN) */}
          {/* ============================================================================ */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5 transition-all">
            {/* Calendar Header & Month Navigation Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#0753A5] flex items-center justify-center shrink-0 shadow-2xs">
                  <Calendar className="w-5 h-5 text-[#0753A5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-900">
                      Rekap Kalender Kebiasaan 7KAIH Murid: {calMonthLabel} {calYear}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Sinkron Realtime: {calLastSyncTime} WITA
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rekap kalender pembiasaan karakter peserta didik rombel {activeRombel.name} ({activeRombel.phase || 'Fase D'}). Diperbarui dari setiap pengisian jurnal.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Manual Sync Trigger */}
                <button
                  type="button"
                  onClick={handleManualSync}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
                  title="Sinkronkan data kalender sekarang"
                >
                  <RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin text-blue-600' : ''}`} />
                </button>

                {/* Month Switcher (Bulan Tahun Navigation) */}
                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={handlePrevCalMonth}
                    className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-all cursor-pointer"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {!isCalCurrentMonth && (
                    <button
                      type="button"
                      onClick={handleTodayCalMonth}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0753A5] hover:bg-white transition-all cursor-pointer"
                    >
                      Bulan Ini
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNextCalMonth}
                    className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-all cursor-pointer"
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Murid Selector & Habit Filter Chips */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Filter Murid Dropdown */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-bold text-slate-600">Pilih Subjek:</span>
                  <select
                    value={calStudentId}
                    onChange={(e) => setCalStudentId(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 border-none outline-none cursor-pointer max-w-[240px] truncate"
                  >
                    <option value="ALL">👥 Seluruh Murid Rombel ({totalStudentsCount} Siswa)</option>
                    {studentsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.nisn})
                      </option>
                    ))}
                  </select>
                </div>

                {calStudentId !== 'ALL' && selectedCalStudent && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-[#0753A5] font-semibold border border-blue-200">
                    Memantau: <strong className="font-bold">{selectedCalStudent.name}</strong> • NISN: {selectedCalStudent.nisn}
                  </span>
                )}
              </div>

              {/* Habit Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-xs font-bold text-slate-500 mr-1">Filter Kebiasaan:</span>
                <button
                  type="button"
                  onClick={() => setCalHabitFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    calHabitFilter === 'ALL'
                      ? 'bg-[#0753A5] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua (Ringkasan 7 Kebiasaan)
                </button>
                {HABIT_LIST.map((h) => (
                  <button
                    key={h.code}
                    type="button"
                    onClick={() => setCalHabitFilter(h.code)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      calHabitFilter === h.code
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Cards Monthly Statistical Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-700 block">Hari Tercatat</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-slate-900">{calRecordedDays}</span>
                  <span className="text-xs text-slate-500">/ {calDaysInMonth} hari ({calCompletenessRate}%)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-700 block">
                  {calStudentId === 'ALL' ? 'Partisipasi Tinggi (≥75%)' : 'Terbiasa (6-7 Selesai)'}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-slate-900">{calHabitualDays}</span>
                  <span className="text-xs text-slate-500">
                    hari {calStudentId !== 'ALL' ? `(${calTargetThreshold} target)` : 'konsisten'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
                <span className="text-[11px] font-semibold text-amber-700 block">Rerata Kebiasaan</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-slate-900">{calAverageHabits}</span>
                  <span className="text-xs text-slate-500">/ 7 kebiasaan</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                <span className="text-[11px] font-semibold text-indigo-700 block">Tervalidasi Guru / Wali</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-slate-900">{calValidatedDays}</span>
                  <span className="text-xs text-slate-500">
                    {calStudentId === 'ALL' ? 'entri jurnal' : 'hari tervalidasi'}
                  </span>
                </div>
              </div>
            </div>

            {/* Calendar Day-of-Week Headers */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center pt-1">
              {calDayHeaders.map((d, idx) => (
                <div
                  key={d}
                  className={`text-xs font-bold py-1 ${
                    idx === 0 || idx === 6 ? 'text-rose-500' : 'text-slate-500'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {Array.from({ length: calFirstDayIndex }).map((_, i) => (
                <div key={`cal-empty-${i}`} className="h-18 sm:h-22 rounded-2xl bg-slate-50/50 border border-transparent" />
              ))}

              {Array.from({ length: calDaysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isToday = getLocalDateString() === dateStr;
                const cellDate = new Date(calYear, calMonth, dayNum);

                let cellStyle = 'bg-slate-50/80 border-slate-200 text-slate-700';
                let badgeText = 'Belum Dicatat';
                let badgeColor = 'text-slate-400 bg-slate-100';
                let subText = '';

                if (calStudentId === 'ALL') {
                  const dayJournals = calDateJournalsMap.get(dateStr) || [];
                  const studentSet = new Set(dayJournals.map((j) => j.studentId || j.studentNisn || j.studentName).filter(Boolean));
                  const filledCount = studentSet.size;

                  if (filledCount > 0) {
                    const rate = totalStudentsCount > 0 ? (filledCount / totalStudentsCount) * 100 : 0;
                    if (calHabitFilter === 'ALL') {
                      let totalH = 0;
                      dayJournals.forEach((j) => {
                        if (typeof j.completedCount === 'number') totalH += j.completedCount;
                        else if (j.entries) totalH += Object.values(j.entries).filter((e: any) => !!e?.completed).length;
                        else if (j.habits) totalH += Object.values(j.habits).filter((e: any) => !!e?.completed).length;
                      });
                      const avgH = Math.round((totalH / filledCount) * 10) / 10;

                      if (rate >= 75) {
                        cellStyle = 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-100/70';
                        badgeColor = 'text-emerald-800 bg-emerald-100';
                      } else if (rate >= 40) {
                        cellStyle = 'bg-sky-50/80 border-sky-300 text-sky-950 hover:bg-sky-100/70';
                        badgeColor = 'text-sky-800 bg-sky-100';
                      } else {
                        cellStyle = 'bg-amber-50/80 border-amber-300 text-amber-950 hover:bg-amber-100/70';
                        badgeColor = 'text-amber-800 bg-amber-100';
                      }
                      badgeText = `${filledCount}/${totalStudentsCount} Siswa`;
                      subText = `Rerata: ${avgH}/7`;
                    } else {
                      let habitCompletedCount = 0;
                      dayJournals.forEach((j) => {
                        const entry = (j.entries as any)?.[calHabitFilter] || (j.habits as any)?.[calHabitFilter];
                        if (entry && entry.completed) habitCompletedCount++;
                      });
                      if (habitCompletedCount > 0) {
                        cellStyle = 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-100/70';
                        badgeColor = 'text-emerald-800 bg-emerald-100';
                        badgeText = `${habitCompletedCount}/${totalStudentsCount} Siswa`;
                        subText = 'Terlaksana';
                      } else {
                        cellStyle = 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100/70';
                        badgeColor = 'text-amber-700 bg-amber-100';
                        badgeText = `0/${totalStudentsCount} Siswa`;
                        subText = 'Belum';
                      }
                    }
                  }
                } else {
                  const studentJournalsOnDate = calDateJournalsMap.get(dateStr) || [];
                  const journal = studentJournalsOnDate[0];

                  if (journal && ((journal.completedCount || 0) > 0 || Object.values(journal.entries || {}).some((e: any) => e?.completed))) {
                    if (calHabitFilter === 'ALL') {
                      const count = journal.completedCount ?? Object.values(journal.entries || {}).filter((e: any) => e?.completed).length;
                      if (count >= 6) {
                        cellStyle = 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-100/70';
                        badgeText = `${count}/7 Selesai`;
                        badgeColor = 'text-emerald-800 bg-emerald-100';
                      } else if (count >= 4) {
                        cellStyle = 'bg-sky-50/80 border-sky-300 text-sky-950 hover:bg-sky-100/70';
                        badgeText = `${count}/7 Selesai`;
                        badgeColor = 'text-sky-800 bg-sky-100';
                      } else {
                        cellStyle = 'bg-amber-50/80 border-amber-300 text-amber-950 hover:bg-amber-100/70';
                        badgeText = `${count}/7 Selesai`;
                        badgeColor = 'text-amber-800 bg-amber-100';
                      }
                    } else {
                      const entry = (journal.entries as any)?.[calHabitFilter] || (journal.habits as any)?.[calHabitFilter];
                      const isHabitDone = !!entry?.completed;
                      if (isHabitDone) {
                        cellStyle = 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-100/70';
                        badgeText = 'Terlaksana ✓';
                        badgeColor = 'text-emerald-800 bg-emerald-100';
                      } else {
                        cellStyle = 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100/70';
                        badgeText = 'Belum';
                        badgeColor = 'text-amber-700 bg-amber-100';
                      }
                    }

                    const isValidated = journal.teacherValidated || (selectedCalStudent ? teacherValidations[selectedCalStudent.id] : false);
                    subText = isValidated ? '✅ Valid' : '⏳ Menunggu';
                  }
                }

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() =>
                      setSelectedDayDetailModal({
                        dateStr,
                        fullDateLabel: formatIndonesianFullDate(cellDate),
                      })
                    }
                    className={`h-18 sm:h-22 p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-between text-left transition-all cursor-pointer shadow-2xs hover:shadow-md hover:scale-[1.01] ${cellStyle} ${
                      isToday ? 'ring-2 ring-blue-500 ring-offset-2 font-bold' : ''
                    }`}
                    title={`Klik untuk melihat detail jurnal rombel pada ${dateStr}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-black ${isToday ? 'px-1.5 py-0.5 rounded-full bg-blue-600 text-white' : ''}`}>
                        {dayNum}
                      </span>
                      {subText && (
                        <span className="text-[9px] font-semibold hidden sm:inline text-slate-600">
                          {subText}
                        </span>
                      )}
                    </div>

                    <div className="w-full">
                      <span className={`text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-md block truncate text-center ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Non-punitive Statistical Invariant Legend */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300" />
                  <span className="text-slate-600 font-medium">Terbiasa / 6-7 Selesai</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-sky-100 border border-sky-300" />
                  <span className="text-slate-600 font-medium">4-5 Selesai</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
                  <span className="text-slate-600 font-medium">1-3 Selesai</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300" />
                  <span className="text-slate-600 font-medium">Belum Dicatat (Data Kosong)</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-[11px]">
                  <strong>Catatan Statistik:</strong> Data belum dicatat <span className="underline">bukan</span> berarti anak tidak melaksanakan kebiasaan. Klik tanggal manapun untuk melihat isian siswa & memvalidasi.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'STUDENTS' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama siswa atau NISN..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {studentsList.some((s) => s.completedTodayCount > 0 && !s.validatedByTeacher) && (
                <button
                  onClick={handleValidateAllToday}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  title="Validasi sekaligus semua murid yang mengisi jurnal hari ini"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Validasi Semua Hari Ini</span>
                </button>
              )}
              <button
                onClick={handleExportCsv}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Unduh rekap kelas dalam format CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Ekspor CSV</span>
              </button>
              <div className="text-xs text-slate-500 hidden sm:block">
                Menampilkan <span className="font-bold text-slate-800">{filteredStudents.length}</span> dari {studentsList.length} siswa
              </div>
            </div>
          </div>

          {/* Category & Status Filter Pills */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Kategori:</span>
              </span>
              {[
                { id: 'ALL', label: 'Semua Kategori', count: studentsList.length },
                { id: 'TERPANTAU_BAIK', label: 'Terpantau Baik', count: studentsList.filter((s) => s.category === 'TERPANTAU_BAIK').length },
                { id: 'PERLU_PENGUATAN', label: 'Perlu Penguatan', count: studentsList.filter((s) => s.category === 'PERLU_PENGUATAN').length },
                { id: 'PERLU_PENDAMPINGAN', label: 'Perlu Pendampingan', count: studentsList.filter((s) => s.category === 'PERLU_PENDAMPINGAN').length },
                { id: 'BELUM_ADA_DATA', label: 'Belum Ada Data', count: studentsList.filter((s) => s.category === 'BELUM_ADA_DATA').length },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id as any)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                    categoryFilter === f.id
                      ? 'bg-[#0753A5] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">Status Siswa:</span>
              {[
                { id: 'ALL', label: 'Semua Status' },
                { id: 'AKTIF', label: 'Aktif' },
                { id: 'MUTASI', label: 'Mutasi' },
                { id: 'LULUS', label: 'Lulus' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {st.label} {st.id !== 'ALL' ? `(${studentsList.filter((s) => (s.status || 'AKTIF') === st.id).length})` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Siswa</th>
                  <th className="py-3 px-3">Hari Ini</th>
                  <th className="py-3 px-3">Kelengkapan</th>
                  <th className="py-3 px-3">Konsistensi</th>
                  <th className="py-3 px-3">Kategori Monitoring*</th>
                  <th className="py-3 px-3 text-center">Portofolio</th>
                  <th className="py-3 px-3 text-right">Validasi Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      {studentsList.length === 0
                        ? 'Belum ada data siswa di rombel ini. Sinkronkan atau tambahkan siswa melalui menu Admin Sekolah.'
                        : 'Tidak ada siswa yang sesuai dengan filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <button
                          onClick={() => openStudentDossier(s)}
                          className="text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 group-hover:text-[#0753A5] transition-colors">
                              {s.name}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                s.gender === 'P'
                                  ? 'bg-pink-100 text-pink-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {s.gender === 'P' ? 'P' : 'L'}
                            </span>
                            {s.status && s.status !== 'AKTIF' && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  s.status === 'MUTASI'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {s.status}
                              </span>
                            )}
                          </div>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            NISN: {s.nisn} {s.parentName ? `• Wali: ${s.parentName}` : ''} {s.parentPhone ? `• HP: ${s.parentPhone}` : ''}
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold px-2 py-0.5 rounded ${s.completedTodayCount > 0 ? 'text-blue-700 bg-blue-50' : 'text-slate-500 bg-slate-100'}`}>
                          {s.completedTodayCount}/7 Kebiasaan
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700">{s.completenessRate}%</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700">{s.monthlyConsistency}%</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.category === 'TERPANTAU_BAIK'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.category === 'PERLU_PENGUATAN'
                              ? 'bg-amber-100 text-amber-800'
                              : s.category === 'PERLU_PENDAMPINGAN'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.category === 'TERPANTAU_BAIK'
                            ? 'Terpantau Baik'
                            : s.category === 'PERLU_PENGUATAN'
                            ? 'Perlu Penguatan'
                            : s.category === 'PERLU_PENDAMPINGAN'
                            ? 'Perlu Pendampingan'
                            : 'Belum Ada Data'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => openStudentDossier(s)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-[#0753A5] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title="Buka rekap portofolio & pembiasaan siswa"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Detail</span>
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {s.validatedByTeacher ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <Check className="w-3.5 h-3.5" />
                            <span>Tervalidasi</span>
                          </span>
                        ) : (
                          <button
                            className="px-2.5 py-1 rounded-lg bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer shadow-xs"
                            onClick={() => handleValidateStudent(s.id)}
                          >
                            Validasi
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            *Catatan Etis: Kategori monitoring merupakan alat bantu internal guru untuk menyusun pendampingan, bukan raport karakter atau label kegagalan siswa.
          </div>
        </div>
      )}

      {activeTab === 'MONITORING' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Kategori Monitoring & Matriks 7 Kebiasaan Anak Indonesia Hebat
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0753A5]">
                  {activeRombel.name} ({activeRombel.phase || 'Fase D'})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Tersinkronisasi Data Jurnal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Sinkronisasi komprehensif data dashboard kelas pada info tab kategori monitoring dengan data kelengkapan isian 7 kebiasaan peserta didik secara objektif, transparan, dan non-punitif.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {studentsList.some((s) => s.completedTodayCount > 0 && !s.validatedByTeacher) && (
                <button
                  onClick={handleValidateAllToday}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white cursor-pointer shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Validasi Semua Hari Ini</span>
                </button>
              )}
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Rekap CSV</span>
              </button>
            </div>
          </div>

          {/* 4 Synchronized Category & Completeness Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Terpantau Baik */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Terpantau Baik
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-800">
                    ≥ 6 Kebiasaan
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-emerald-950">{goodCount}</span>
                  <span className="text-xs font-semibold text-emerald-700">
                    Siswa ({totalStudentsCount > 0 ? Math.round((goodCount / totalStudentsCount) * 100) : 0}%)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1 leading-tight">
                  Konsistensi ≥ 80% atau rerata 6-7 kebiasaan mandiri terisi tertib.
                </p>
              </div>
              <div className="w-full bg-emerald-200/60 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalStudentsCount > 0 ? (goodCount / totalStudentsCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Card 2: Perlu Penguatan */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Perlu Penguatan
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-800">
                    4-5 Kebiasaan
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-amber-950">{strengthenCount}</span>
                  <span className="text-xs font-semibold text-amber-700">
                    Siswa ({totalStudentsCount > 0 ? Math.round((strengthenCount / totalStudentsCount) * 100) : 0}%)
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1 leading-tight">
                  Konsistensi 55-79% atau rerata 4-5 kebiasaan mandiri terisi.
                </p>
              </div>
              <div className="w-full bg-amber-200/60 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalStudentsCount > 0 ? (strengthenCount / totalStudentsCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Card 3: Perlu Pendampingan */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Perlu Pendampingan
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200/70 text-rose-800">
                    ≤ 3 Kebiasaan
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-rose-950">{supportCount}</span>
                  <span className="text-xs font-semibold text-rose-700">
                    Siswa ({totalStudentsCount > 0 ? Math.round((supportCount / totalStudentsCount) * 100) : 0}%)
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 mt-1 leading-tight">
                  Konsistensi &lt; 55% atau rerata ≤ 3 kebiasaan terisi berkala.
                </p>
              </div>
              <div className="w-full bg-rose-200/60 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalStudentsCount > 0 ? (supportCount / totalStudentsCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Card 4: Kelengkapan Isian 7 Kebiasaan */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Kelengkapan Isian Kelas
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200/70 text-blue-800">
                    Hari Ini
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-blue-950">{filledTodayCount}/{totalStudentsCount}</span>
                  <span className="text-xs font-semibold text-blue-700">
                    Siswa ({totalStudentsCount > 0 ? Math.round((filledTodayCount / totalStudentsCount) * 100) : 0}%)
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 mt-1 leading-tight">
                  Rerata terisi hari ini: <strong>{averageHabitsToday} / 7 kebiasaan</strong> • Kelengkapan bulanan: <strong>{averageCompleteness}%</strong>
                </p>
              </div>
              <div className="w-full bg-blue-200/60 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-[#0753A5] h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalStudentsCount > 0 ? (filledTodayCount / totalStudentsCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Panel Rincian Kelengkapan 7 Dimensi Kebiasaan 7KAIH */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Tingkat Keterlaksanaan 7 Dimensi Kebiasaan Kelas {activeRombel.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  Rerata Kelas: {classAvgHabitsPerEntry} / 7 Kebiasaan
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Data terakumulasi dari seluruh isian jurnal siswa rombel ini
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {classHabitStats.map((stat) => {
                const habitMeta: Record<string, { icon: string; shortName: string }> = {
                  WAKE_EARLY: { icon: '🌅', shortName: 'Pagi' },
                  WORSHIP: { icon: '🕌', shortName: 'Ibadah' },
                  EXERCISE: { icon: '🏃', shortName: 'Olahraga' },
                  HEALTHY_EATING: { icon: '🥗', shortName: 'Makan Sehat' },
                  LEARNING: { icon: '📚', shortName: 'Belajar' },
                  SOCIAL: { icon: '🤝', shortName: 'Bermasyarakat' },
                  SLEEP_EARLY: { icon: '🌙', shortName: 'Tidur' },
                };
                const meta = habitMeta[stat.code] || { icon: '✨', shortName: stat.name };
                const isHigh = stat.percentage >= 80;
                const isMedium = stat.percentage >= 55;
                const badgeColor =
                  stat.percentage === 0
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : isHigh
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isMedium
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <div
                    key={stat.code}
                    className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base">{meta.icon}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${badgeColor}`}>
                          {stat.percentage}%
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-1 truncate" title={stat.name}>
                        {meta.shortName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {stat.todayCompletedCount} siswa hari ini
                      </div>
                    </div>
                    <div>
                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            stat.percentage >= 80 ? 'bg-emerald-500' : stat.percentage >= 55 ? 'bg-amber-500' : stat.percentage > 0 ? 'bg-rose-500' : 'bg-slate-200'
                          }`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1 text-right">
                        {stat.completedCount} entri
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diagnostic Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dimensi Kekuatan Terpantau Baik</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {hasJournalData && topHabit && topHabit.percentage > 0 ? (
                  <>
                    <strong>{topHabit.name} ({topHabit.percentage}%)</strong>
                    {secondTopHabit && secondTopHabit.percentage > 0 && (
                      <> dan <strong>{secondTopHabit.name} ({secondTopHabit.percentage}%)</strong></>
                    )}{' '}
                    menunjukkan konsistensi tertinggi di kelas. Peserta didik memiliki kesiapan pembiasaan yang tertib.
                  </>
                ) : (
                  'Belum ada data jurnal pembiasaan siswa yang diperbarui untuk pemetaan dimensi kekuatan (data 0%).'
                )}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Dimensi Memerlukan Penguatan Bersama</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {hasJournalData && lowestHabit && lowestHabit.percentage < 100 ? (
                  <>
                    <strong>{lowestHabit.name} ({lowestHabit.percentage}%)</strong>
                    {secondLowestHabit && secondLowestHabit.percentage !== lowestHabit.percentage && (
                      <> dan <strong>{secondLowestHabit.name} ({secondLowestHabit.percentage}%)</strong></>
                    )}{' '}
                    memerlukan kolaborasi dan penguatan bersama orang tua tanpa pelabelan negatif.
                  </>
                ) : (
                  'Belum ada data jurnal pembiasaan siswa yang diperbarui untuk pemetaan penguatan dimensi (data 0%).'
                )}
              </p>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Kategori:</span>
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({studentsList.length})
              </button>
              <button
                onClick={() => setCategoryFilter('TERPANTAU_BAIK')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  categoryFilter === 'TERPANTAU_BAIK'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span>Terpantau Baik</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 font-bold">
                  {goodCount}
                </span>
              </button>
              <button
                onClick={() => setCategoryFilter('PERLU_PENGUATAN')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  categoryFilter === 'PERLU_PENGUATAN'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span>Perlu Penguatan</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 font-bold">
                  {strengthenCount}
                </span>
              </button>
              <button
                onClick={() => setCategoryFilter('PERLU_PENDAMPINGAN')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  categoryFilter === 'PERLU_PENDAMPINGAN'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                <span>Perlu Pendampingan</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 font-bold">
                  {supportCount}
                </span>
              </button>
              {unupdatedCount > 0 && (
                <button
                  onClick={() => setCategoryFilter('BELUM_ADA_DATA' as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    (categoryFilter as string) === 'BELUM_ADA_DATA'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Belum Ada Data</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 font-bold">
                    {unupdatedCount}
                  </span>
                </button>
              )}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari siswa atau NISN..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-hidden focus:border-[#0753A5]"
              />
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50/80">
                  <th className="py-3 px-3">Siswa</th>
                  <th className="py-3 px-2 text-center" title="Kelengkapan Hari Ini">Hari Ini</th>
                  <th className="py-3 px-2 text-center" title="Rata-rata Isian">Rerata Isian</th>
                  <th className="py-3 px-2 text-center" title="Bangun Pagi">🌅 Pagi</th>
                  <th className="py-3 px-2 text-center" title="Beribadah">🕌 Ibadah</th>
                  <th className="py-3 px-2 text-center" title="Berolahraga">🏃 Olahraga</th>
                  <th className="py-3 px-2 text-center" title="Makan Sehat & Bergizi">🥗 Sehat</th>
                  <th className="py-3 px-2 text-center" title="Gemar Belajar">📚 Belajar</th>
                  <th className="py-3 px-2 text-center" title="Bermasyarakat">🤝 Sosial</th>
                  <th className="py-3 px-2 text-center" title="Tidur Cepat">🌙 Tidur</th>
                  <th className="py-3 px-3 text-center">Konsistensi</th>
                  <th className="py-3 px-3">Kategori Monitoring</th>
                  <th className="py-3 px-2 text-center">Validasi Guru</th>
                  <th className="py-3 px-3 text-center">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-8 text-center text-slate-400">
                      Tidak ada siswa yang sesuai dengan filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const studentJournals = syncedJournals.filter((j) => {
                      return (
                        j.studentId === s.id ||
                        j.studentId === s.nisn ||
                        (j.studentNisn && s.nisn && j.studentNisn === s.nisn) ||
                        (j.studentName && s.name && j.studentName.toLowerCase().trim() === s.name.toLowerCase().trim())
                      );
                    });
                    const hasStudentJournal = studentJournals.length > 0;

                    const getHabitStatus = (habitKey: string) => {
                      if (!hasStudentJournal) return { label: '-', className: 'bg-slate-100 text-slate-400', title: 'Belum ada data' };
                      let completedCount = 0;
                      studentJournals.forEach((j) => {
                        const entry = (j.entries && j.entries[habitKey]) || (j.habits && j.habits[habitKey]);
                        if (entry && entry.completed) completedCount++;
                      });
                      const rate = Math.round((completedCount / studentJournals.length) * 100);
                      if (rate >= 80) return { label: '✓', className: 'bg-emerald-100 text-emerald-700', title: `Terbiasa Mandiri (${rate}% - ${completedCount}/${studentJournals.length} entri)` };
                      if (rate >= 50) return { label: '•', className: 'bg-amber-100 text-amber-700', title: `Sedang Dikuatkan (${rate}% - ${completedCount}/${studentJournals.length} entri)` };
                      return { label: '!', className: 'bg-rose-100 text-rose-700', title: `Perlu Pendampingan (${rate}% - ${completedCount}/${studentJournals.length} entri)` };
                    };

                    const todayPillColor =
                      s.completedTodayCount >= 6
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.completedTodayCount >= 4
                        ? 'bg-amber-100 text-amber-800'
                        : s.completedTodayCount > 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-400';

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                            <span>{s.nisn}</span>
                            {s.gender && (
                              <span className="text-[9px] px-1 rounded bg-slate-100 text-slate-600">
                                {s.gender}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Kelengkapan Hari Ini */}
                        <td className="py-2.5 px-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${todayPillColor}`}>
                            {s.completedTodayCount > 0 ? `${s.completedTodayCount}/7` : '0/7'}
                          </span>
                        </td>

                        {/* Rerata Isian */}
                        <td className="py-2.5 px-2 text-center">
                          <span className="font-mono font-bold text-slate-800">
                            {s.avgHabitsCompleted ? `${s.avgHabitsCompleted}/7` : '-'}
                          </span>
                          <div className="text-[9px] text-slate-400">
                            {s.completenessRate}% entri
                          </div>
                        </td>

                        {/* 7 Kebiasaan */}
                        {['WAKE_EARLY', 'WORSHIP', 'EXERCISE', 'HEALTHY_EATING', 'LEARNING', 'SOCIAL', 'SLEEP_EARLY'].map((hKey) => {
                          const status = getHabitStatus(hKey);
                          return (
                            <td key={hKey} className="py-2.5 px-2 text-center">
                              <span
                                title={status.title}
                                className={`inline-block w-6 h-6 rounded-full font-bold text-[10px] leading-6 cursor-help ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </td>
                          );
                        })}

                        {/* Konsistensi */}
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono font-bold text-slate-800">{s.monthlyConsistency}%</span>
                        </td>

                        {/* Kategori Monitoring */}
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block w-fit ${
                                s.category === 'TERPANTAU_BAIK'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : s.category === 'PERLU_PENGUATAN'
                                  ? 'bg-amber-100 text-amber-800'
                                  : s.category === 'PERLU_PENDAMPINGAN'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {s.category === 'TERPANTAU_BAIK'
                                ? 'Terpantau Baik'
                                : s.category === 'PERLU_PENGUATAN'
                                ? 'Perlu Penguatan'
                                : s.category === 'PERLU_PENDAMPINGAN'
                                ? 'Perlu Pendampingan'
                                : 'Belum Ada Data'}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {s.category === 'TERPANTAU_BAIK'
                                ? '≥ 6 kebiasaan'
                                : s.category === 'PERLU_PENGUATAN'
                                ? '4 - 5 kebiasaan'
                                : s.category === 'PERLU_PENDAMPINGAN'
                                ? '≤ 3 kebiasaan'
                                : 'Belum isi jurnal'}
                            </span>
                          </div>
                        </td>

                        {/* Validasi Guru */}
                        <td className="py-2.5 px-2 text-center">
                          {s.validatedByTeacher ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Valid</span>
                            </span>
                          ) : s.completedTodayCount > 0 || hasStudentJournal ? (
                            <button
                              onClick={() => handleValidateStudent(s.id)}
                              className="px-2 py-0.5 rounded-md bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer shadow-xs transition-colors"
                            >
                              Validasi
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">-</span>
                          )}
                        </td>

                        {/* Dossier */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => openStudentDossier(s)}
                            className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 text-[#0753A5] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Lihat</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <div>
              <strong>Keterangan Simbol:</strong> (✓) Terbiasa Mandiri (≥80%) • (•) Sedang Dikuatkan (50-79%) • (!) Perlu Pendampingan (&lt;50%) • (-) Belum Ada Data Jurnal.
            </div>
            <div className="text-slate-500 italic">
              *Catatan Etis: Kategori monitoring merupakan instrumen diagnostik pendampingan karakter internal, bukan perankingan atau pelabelan siswa.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PROGRAMS' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Program Pembiasaan Terstruktur {activeRombel.name} ({activeRombel.phase || 'Fase D'})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kegiatan pembiasaan terpadu yang dijalankan bersama dewan guru dan paguyuban kelas.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-[#0753A5]">
                {localPrograms.length} Program Terjadwal
              </span>
              <button
                onClick={() => setIsProgramModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Usulkan Inisiatif</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localPrograms.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 col-span-2">
                <p className="font-semibold text-xs text-slate-700">Belum ada Program Pembiasaan Terdaftar</p>
                <p className="text-[11px] text-slate-400 mt-1">Klik tombol "Usulkan Inisiatif" untuk menambahkan program kelas.</p>
              </div>
            ) : (
              localPrograms.map((prog) => (
                <div
                  key={prog.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#0753A5]">
                        {prog.habitCode}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Aktif Berjalan
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{prog.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{prog.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1">
                    <div>⏰ Jadwal: <strong className="text-slate-800">{prog.schedule}</strong></div>
                    <div>👤 Penanggung Jawab: <strong className="text-slate-800">{prog.pic}</strong></div>
                    <div>🎯 Sasaran: <strong className="text-slate-800">{prog.participantScope}</strong></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'RTL' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Rencana Tindak Lanjut (RTL) {activeRombel.name} ({activeRombel.phase || 'Fase D'})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Program intervensi berbasis data dan akar masalah terverifikasi.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {localFollowUps.filter((f) => f.status !== 'COMPLETED').length} Tindak Lanjut Aktif
                </span>
                <button
                  onClick={() => handleOpenAiRtl()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#0753A5] hover:opacity-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer group"
                  title="Susun RTL dengan Rekomendasi Asisten AI Berbasis Data Rombel"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
                  <span>Bantuan AI RTL</span>
                </button>
                <button
                  onClick={() => setIsRtlModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah RTL Baru</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {localFollowUps.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-3">
                  <div>
                    <p className="font-semibold text-xs text-slate-700">Belum ada Rencana Tindak Lanjut (RTL)</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Gunakan tombol "Bantuan AI RTL" untuk rekomendasi otomatis berbasis data rombel terkini atau "Tambah RTL Baru" untuk input manual.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenAiRtl()}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:opacity-95 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Susun RTL dengan AI</span>
                    </button>
                    <button
                      onClick={() => setIsRtlModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-500" />
                      <span>Tambah Manual</span>
                    </button>
                  </div>
                </div>
              ) : (
                localFollowUps.map((rtl) => (
                  <div
                    key={rtl.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#0753A5]">
                        {rtl.finding}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rtl.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-[#0753A5]'
                      }`}>
                        Status: {rtl.status === 'COMPLETED' ? 'Selesai' : 'Sedang Berjalan'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium">Akar Masalah ({rtl.rootCauseType === 'FACT' ? 'Fakta Terverifikasi' : 'Hipotesis'}):</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{rtl.rootCause}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Rencana Aksi:</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{rtl.actionPlan}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <span className="text-slate-500 text-[11px]">Progres:</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-[#41A85F] h-2 rounded-full"
                            style={{ width: `${rtl.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 text-[11px]">{rtl.progressPercent}%</span>
                        {rtl.progressPercent < 100 && (
                          <button
                            onClick={() => handleUpdateRtlProgress(rtl.id, Math.min(100, rtl.progressPercent + 25))}
                            className="px-2 py-0.5 rounded-lg border border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                            title="Tingkatkan Progres"
                          >
                            +25%
                          </button>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Tenggat: <strong className="text-slate-700">{rtl.deadline}</strong> • PIC: {rtl.owner}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'AI_INSIGHT' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Analisis AI Pedagogis {activeRombel.name} ({activeRombel.phase || 'Fase D'})
                </h3>
                <p className="text-xs text-slate-500">
                  Struktur komprehensif: Fakta, Pola, Keterbatasan Data, Hipotesis, dan Rekomendasi.
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateClassAi}
              disabled={isAnalyzingAi}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzingAi ? 'Memproses Analisis AI...' : 'Perbarui Analisis AI'}</span>
            </button>
          </div>

          {aiAnalysisResult && (
            <div className="space-y-4">
              {/* 1. Fakta yang Tercatat */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                <h4 className="text-xs font-bold text-[#0753A5] uppercase tracking-wider flex items-center gap-1.5">
                  <span>📋 1. Fakta yang Tercatat</span>
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {aiAnalysisResult.recordedFacts?.map((fact: string, idx: number) => (
                    <li key={idx}>{fact}</li>
                  ))}
                </ul>
              </div>

              {/* 2. Pola Pembiasaan */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔍 2. Pola Pembiasaan</span>
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {aiAnalysisResult.habitPatterns?.map((pat: string, idx: number) => (
                    <li key={idx}>{pat}</li>
                  ))}
                </ul>
              </div>

              {/* 3. Keterbatasan Data */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚠️ 3. Keterbatasan Data</span>
                </h4>
                <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
                  {aiAnalysisResult.dataLimitations?.map((lim: string, idx: number) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>

              {/* 4. Hipotesis untuk Diverifikasi */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>❓ 4. Hipotesis yang Perlu Diverifikasi (Bukan Fakta Pasti)</span>
                </h4>
                <ul className="list-disc list-inside text-xs text-purple-900 space-y-1">
                  {aiAnalysisResult.hypothesesToVerify?.map((hyp: string, idx: number) => (
                    <li key={idx}>{hyp}</li>
                  ))}
                </ul>
              </div>

              {/* 5. Rekomendasi Pendampingan */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💡 5. Rekomendasi Pendampingan Positif</span>
                </h4>
                <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1.5">
                  {aiAnalysisResult.actionableRecommendations?.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Output AI telah divalidasi bebas klaim kausalitas semu dan bebas perangkingan karakter.</span>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Interactive Student Dossier & Character Mentoring Modal */}
      <StudentDossierModal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        student={selectedStudent}
        onValidateStudent={handleValidateStudent}
        onOpenReportModal={onOpenReportModal}
      />

      {/* Modal Tambah RTL Baru dengan Bantuan AI */}
      {isRtlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0753A5] flex items-center justify-center font-bold text-base">
                  📋
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Tambah RTL Kelas Baru</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0753A5]">
                      {activeRombel.name}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Rencana Tindak Lanjut berbasis fakta & hipotesis terverifikasi</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextState = !isAiRtlAssistantOpen;
                    setIsAiRtlAssistantOpen(nextState);
                    if (nextState && !aiRtlGeneratedSuggestion) {
                      handleGenerateAiRtl();
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isAiRtlAssistantOpen
                      ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'
                  }`}
                  title="Buka / Tutup Asisten AI RTL"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>{isAiRtlAssistantOpen ? 'Sembunyikan AI' : 'Bantuan AI RTL'}</span>
                </button>
                <button
                  onClick={() => setIsRtlModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto pr-1 space-y-4 text-xs flex-1">
              {/* Asisten AI Box */}
              {isAiRtlAssistantOpen && (
                <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-blue-50/60 border border-indigo-200/90 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-indigo-950">Asisten AI: Rekomendasi Rencana Tindak Lanjut</h4>
                        <p className="text-[10px] text-indigo-700/80">
                          Analisis data pembiasaan rombel {activeRombel.name} ({averageCompleteness}% kelengkapan, {averageConsistency}% konsistensi)
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-indigo-800 border border-indigo-200/60">
                      Non-Punitive • 7KAIH
                    </span>
                  </div>

                  {/* Focus Habit Selector & Action */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-indigo-900 mb-1">
                          Fokus Isu / Kebiasaan Intervensi:
                        </label>
                        <select
                          value={aiRtlFocusHabit}
                          onChange={(e) => setAiRtlFocusHabit(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="AUTO">🎯 Otomatis: Rekomendasi Analisis AI (Kebiasaan Kritis)</option>
                          <option value="SLEEP_EARLY">🌙 Tidur Cepat / Tepat Waktu (Batas Gawai)</option>
                          <option value="HEALTHY_EATING">🥗 Makan Sehat & Bergizi (Sarapan Bersama)</option>
                          <option value="WAKE_UP_EARLY">🌅 Bangun Pagi Mandiri & Ceria</option>
                          <option value="STUDY_DILIGENTLY">📚 Gemar Belajar & Literasi 15 Menit</option>
                          <option value="EXERCISE">🏃 Berolahraga & Aktivitas Fisik</option>
                          <option value="WORSHIP">🕌 Keteraturan Beribadah Ceria</option>
                          <option value="SOCIAL_HELP">🤝 Berbuat Kebaikan & Kepedulian</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGenerateAiRtl()}
                        disabled={isGeneratingAiRtl}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#0753A5] hover:opacity-95 text-white font-bold text-xs transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                      >
                        {isGeneratingAiRtl ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Menyusun RTL...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Hasilkan Draf AI</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-indigo-700 font-semibold">Pilihan Cepat:</span>
                      {[
                        { label: '🛌 Jam Istirahat & Gawai', code: 'SLEEP_EARLY' },
                        { label: '🥗 Sarapan Bergizi', code: 'HEALTHY_EATING' },
                        { label: '📖 Pojok Literasi', code: 'STUDY_DILIGENTLY' },
                        { label: '🌅 Bangun Ceria', code: 'WAKE_UP_EARLY' },
                        { label: '🏃 Senam Ceria', code: 'EXERCISE' },
                      ].map((preset) => (
                        <button
                          key={preset.code}
                          type="button"
                          onClick={() => {
                            setAiRtlFocusHabit(preset.code);
                            handleGenerateAiRtl(preset.code);
                          }}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-white/90 hover:bg-white text-indigo-900 border border-indigo-200/80 hover:border-indigo-400 transition-all cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Suggestion Card Display */}
                  {aiRtlGeneratedSuggestion && (
                    <div className="bg-white rounded-xl p-3.5 border border-indigo-200 space-y-2.5 shadow-xs animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-800">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Draf Rekomendasi AI Siap Diadopsi</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleGenerateAiRtl()}
                          disabled={isGeneratingAiRtl}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${isGeneratingAiRtl ? 'animate-spin' : ''}`} />
                          <span>Variasi Lain</span>
                        </button>
                      </div>

                      <div className="space-y-2 text-slate-800 text-[11px]">
                        <div>
                          <span className="font-bold text-slate-600">🎯 Indikator Temuan: </span>
                          <span className="font-medium text-slate-900">{aiRtlGeneratedSuggestion.finding}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-600">
                            🔍 Akar Masalah ({aiRtlGeneratedSuggestion.rootCauseType === 'FACT' ? 'Fakta Terverifikasi' : 'Hipotesis'}):{' '}
                          </span>
                          <span className="font-medium text-slate-900">{aiRtlGeneratedSuggestion.rootCause}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-600">💡 Rencana Aksi Positif: </span>
                          <span className="font-medium text-indigo-900">{aiRtlGeneratedSuggestion.actionPlan}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                          <span><strong>Sasaran:</strong> {aiRtlGeneratedSuggestion.target || 'Peserta Didik & Orang Tua'}</span>
                          <span><strong>Tenggat:</strong> {aiRtlGeneratedSuggestion.recommendedDeadline}</span>
                          <span><strong>PIC:</strong> {aiRtlGeneratedSuggestion.owner || `Wali Kelas & Paguyuban`}</span>
                        </div>
                        {aiRtlGeneratedSuggestion.reasoning && (
                          <p className="text-[10px] text-slate-600 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 italic">
                            💬 <strong>Alasan Pedagogis:</strong> {aiRtlGeneratedSuggestion.reasoning}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyAiRtlSuggestion()}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Terapkan Draf AI ke Formulir di Bawah</span>
                      </button>
                    </div>
                  )}

                  {aiRtlAppliedSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Draf AI berhasil dimasukkan ke formulir! Anda dapat meninjau atau mengedit sebelum menyimpan.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Formulir RTL (Dapat Diisi Manual atau Diisi Otomatis oleh AI) */}
              <form onSubmit={handleCreateRtl} className="space-y-3.5 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Indikator Temuan / Isu Pembiasaan *</label>
                    {newRtlFinding && (
                      <span className="text-[10px] text-slate-400">Siap disimpan</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Keteraturan tidur tepat waktu rombel belum optimal"
                    value={newRtlFinding}
                    onChange={(e) => setNewRtlFinding(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5] text-xs transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tipe Akar Masalah</label>
                    <select
                      value={newRtlRootCauseType}
                      onChange={(e) => setNewRtlRootCauseType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5] text-xs bg-white"
                    >
                      <option value="FACT">Fakta Terverifikasi (Data/Observasi Nyata)</option>
                      <option value="HYPOTHESIS_TO_VERIFY">Hipotesis (Perlu Konfirmasi Paguyuban)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tenggat Target RTL</label>
                    <input
                      type="date"
                      value={newRtlDeadline}
                      onChange={(e) => setNewRtlDeadline(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5] text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Akar Masalah yang Mendasari</label>
                  <input
                    type="text"
                    placeholder="Contoh: Penggunaan gawai malam hari di atas jam 21.00 saat hari sekolah"
                    value={newRtlRootCause}
                    onChange={(e) => setNewRtlRootCause(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5] text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rencana Aksi & Intervensi Positif *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Contoh: Dialog kolaboratif bersama orang tua mengenai batas layar & kesepakatan tidur pukul 20.45"
                    value={newRtlActionPlan}
                    onChange={(e) => setNewRtlActionPlan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5] text-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Penanggung Jawab (PIC)</label>
                    <input
                      type="text"
                      value={newRtlOwner}
                      onChange={(e) => setNewRtlOwner(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5] text-xs"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-slate-700">Progres Awal: {newRtlProgress}%</label>
                      <span className="text-[10px] text-slate-400">Tahap Inisiasi</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={newRtlProgress}
                      onChange={(e) => setNewRtlProgress(Number(e.target.value))}
                      className="w-full mt-2 accent-[#0753A5]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRtlModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Simpan RTL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Program Inisiatif */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  🌟
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Usulkan Program Inisiatif Kelas</h3>
                  <p className="text-[11px] text-slate-500">Program pembiasaan kolaboratif sekolah & keluarga</p>
                </div>
              </div>
              <button
                onClick={() => setIsProgramModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Program Inisiatif *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gerakan Sarapan Sehat Bersama (Isi Piringku)"
                  value={newProgTitle}
                  onChange={(e) => setNewProgTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dimensi 7 Kebiasaan</label>
                  <select
                    value={newProgHabit}
                    onChange={(e) => setNewProgHabit(e.target.value as HabitCode)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5] text-xs bg-white"
                  >
                    <option value="WAKE_EARLY">1. Bangun Pagi</option>
                    <option value="WORSHIP">2. Taat Beribadah</option>
                    <option value="EXERCISE">3. Rajin Berolahraga</option>
                    <option value="HEALTHY_EATING">4. Makan Makanan Sehat</option>
                    <option value="LEARNING">5. Gemar Membaca & Belajar</option>
                    <option value="SOCIAL">6. Bermasyarakat</option>
                    <option value="SLEEP_EARLY">7. Tidur Tepat Waktu</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jadwal Pelaksanaan</label>
                  <input
                    type="text"
                    value={newProgSchedule}
                    onChange={(e) => setNewProgSchedule(e.target.value)}
                    placeholder="Contoh: Setiap Hari Rabu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5] text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Kegiatan *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Siswa membawa bekal makanan bergizi seimbang dari rumah dan makan bersama di kelas didampingi guru"
                  value={newProgDesc}
                  onChange={(e) => setNewProgDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5] text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    value={newProgPic}
                    onChange={(e) => setNewProgPic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5] text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sasaran Peserta</label>
                  <input
                    type="text"
                    value={newProgScope}
                    onChange={(e) => setNewProgScope(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5] text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Tambahkan Inisiatif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL REKAP DETAIL HARIAN JURNAL */}
      {/* ============================================================================ */}
      {selectedDayDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#0753A5] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Rekap Jurnal Harian: {selectedDayDetailModal.fullDateLabel}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rombel {activeRombel.name} ({activeRombel.phase || 'Fase D'}) • {modalDateStudents.filter((m) => m.hasJournal).length} dari {totalStudentsCount} Murid Mengisi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayDetailModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={modalStudentFilterQuery}
                  onChange={(e) => setModalStudentFilterQuery(e.target.value)}
                  placeholder="Cari nama murid atau NISN..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500"
                />
              </div>

              {modalDateStudents.some((m) => m.hasJournal && !m.isValidated) && (
                <button
                  type="button"
                  onClick={handleValidateAllOnModalDate}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Validasi Semua Siswa Tanggal Ini</span>
                </button>
              )}
            </div>

            {/* Student List */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {filteredModalStudents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Tidak ada siswa yang sesuai dengan kata kunci pencarian.
                </div>
              ) : (
                filteredModalStudents.map((item) => (
                  <div
                    key={item.student.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      item.hasJournal
                        ? 'bg-white border-slate-200/90 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200/60 opacity-80'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                            item.hasJournal
                              ? item.completedCount >= 6
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {item.student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{item.student.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">NISN: {item.student.nisn}</span>
                          </div>
                          {item.hasJournal && item.savedAt && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Disimpan: {item.savedAt}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.hasJournal ? (
                          <>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.completedCount >= 6
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.completedCount >= 4
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.completedCount}/7 Kebiasaan
                            </span>

                            {item.isValidated ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Valid</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleValidateStudent(item.student.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer shadow-xs transition-colors"
                              >
                                Validasi
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDayDetailModal(null);
                                openStudentDossier(item.student);
                              }}
                              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 text-[#0753A5] font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Dossier</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            Belum Ada Jurnal
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Habit Badges Breakdown */}
                    {item.hasJournal && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                        {HABIT_LIST.map((h) => {
                          const isDone = item.habitsBreakdown[h.code];
                          return (
                            <span
                              key={h.code}
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 line-through'
                              }`}
                              title={`${h.name}: ${isDone ? 'Terlaksana' : 'Belum Terlaksana'}`}
                            >
                              {isDone ? '✓' : '✗'} {h.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                *Klik tombol validasi untuk menyetujui jurnal peserta didik secara resmi.
              </span>
              <button
                type="button"
                onClick={() => setSelectedDayDetailModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup Rekap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
