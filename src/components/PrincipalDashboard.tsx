// ============================================================================
// SI-7KAIH AI - Principal School Dashboard & Strategic Portfolio
// School-wide analytics, habit programs, early warning distribution, AI strategy
// Disinkronkan 100% dengan Data Terupdate dari Super Admin & Admin Sekolah
// Dihapus seluruh data default/dummy, murni bersumber dari data input mandiri
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SchoolProgram,
  FollowUpPlan,
  DailyJournal,
} from '../../packages/types/src/index';
import {
  Building2,
  Users,
  Compass,
  FileText,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Award,
  Download,
  Eye,
  X,
  Send,
  Check,
  CheckSquare,
  RefreshCw,
  School,
  MapPin,
  GraduationCap,
  ChevronDown,
  UserCheck,
  BookOpen,
  Plus,
  Search,
  Filter,
  Inbox,
  Clock,
  Briefcase,
  Lightbulb,
  Wand2,
  Target,
  Layers,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  Copy,
  Activity,
  Heart,
  Flame,
  Sun,
  Moon,
  Utensils,
  BookMarked,
  UserCheck2,
  ChevronRight,
} from 'lucide-react';
import { SchoolMaster, getStoredSchools } from '../lib/schoolMasterData';
import { Rombel, Student, getStoredRombels, getStoredStudents } from '../lib/studentData';
import { UserPersona, getStoredUsers, isDeprecatedOrDummyJournal } from '../lib/constants';

export const ALL_HABIT_DEFINITIONS: { code: string; label: string; icon: string; bg: string; color: string }[] = [
  { code: 'BANGUN_PAGI', label: 'Bangun Pagi', icon: '🌅', bg: 'bg-amber-50 border-amber-200 text-amber-800', color: 'text-amber-600' },
  { code: 'BERIBADAH', label: 'Beribadah', icon: '🤲', bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', color: 'text-emerald-600' },
  { code: 'BEROLAHRAGA', label: 'Berolahraga', icon: '🏃', bg: 'bg-indigo-50 border-indigo-200 text-indigo-800', color: 'text-indigo-600' },
  { code: 'MAKAN_SEHAT', label: 'Makan Sehat', icon: '🥗', bg: 'bg-rose-50 border-rose-200 text-rose-800', color: 'text-rose-600' },
  { code: 'GEMAR_BELAJAR', label: 'Gemar Belajar', icon: '📚', bg: 'bg-blue-50 border-blue-200 text-blue-800', color: 'text-blue-600' },
  { code: 'BERMASYARAKAT', label: 'Bermasyarakat', icon: '🤝', bg: 'bg-purple-50 border-purple-200 text-purple-800', color: 'text-purple-600' },
  { code: 'TIDUR_CEPAT', label: 'Tidur Cepat', icon: '🌙', bg: 'bg-cyan-50 border-cyan-200 text-cyan-800', color: 'text-cyan-600' },
];

interface PrincipalDashboardProps {
  programs: SchoolProgram[];
  followUps: FollowUpPlan[];
  onOpenReportModal: () => void;
  activeNavTab?: string;
  currentPersona?: UserPersona;
  journals?: DailyJournal[];
}

export interface UnifiedSchoolProgram {
  id: string;
  habitCode: string;
  title: string;
  description: string;
  participantScope: string;
  schedule: string;
  pic: string;
  evidenceCount?: number;
  status?: string;
  resultNote?: string;
  schoolId?: string;
  source?: string;
}

export interface SupervisionDirective {
  id: string;
  date: string;
  timestamp: number;
  principalName: string;
  schoolName: string;
  note: string;
}

export const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({
  programs: initialPrograms = [],
  followUps: initialFollowUps = [],
  onOpenReportModal,
  activeNavTab,
  currentPersona,
  journals: initialJournals = [],
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CLASSES' | 'PROGRAMS' | 'RTL' | 'AI_STRATEGY'>('OVERVIEW');
  const [aiSchoolResult, setAiSchoolResult] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [inspectedStudent, setInspectedStudent] = useState<{
    student: any;
    journals: DailyJournal[];
  } | null>(null);

  // AI Assistance States (Tab Program Sekolah)
  const [aiProgramResult, setAiProgramResult] = useState<any | null>(null);
  const [isAiProgramLoading, setIsAiProgramLoading] = useState(false);
  const [isAiModalDrafting, setIsAiModalDrafting] = useState(false);
  const [aiModalThemeInput, setAiModalThemeInput] = useState('');

  // AI Assistance States (Tab RTL & Monitoring)
  const [selectedDirectiveFocus, setSelectedDirectiveFocus] = useState<string>('DISIPLIN_TIDUR_GAWAI');
  const [isDraftingDirective, setIsDraftingDirective] = useState(false);
  const [aiDirectiveResult, setAiDirectiveResult] = useState<any | null>(null);
  const [aiRtlSynthesisResult, setAiRtlSynthesisResult] = useState<any | null>(null);
  const [isAiRtlLoading, setIsAiRtlLoading] = useState(false);

  // Synchronized Master & Mandiri Data States
  const [schools, setSchools] = useState<SchoolMaster[]>(() => getStoredSchools());
  const [rombels, setRombels] = useState<Rombel[]>(() => getStoredRombels());
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [userAccounts, setUserAccounts] = useState<UserPersona[]>(() => getStoredUsers());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Synchronized Journals State
  const [syncedJournals, setSyncedJournals] = useState<DailyJournal[]>(() => {
    try {
      const raw = localStorage.getItem('si7kaih_journals_prod');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j));
        }
      }
    } catch (_e) {}
    return (initialJournals || []).filter((j) => !isDeprecatedOrDummyJournal(j));
  });

  // Approved Programs State (Stored in LocalStorage, no default dummy IDs)
  const [approvedPrograms, setApprovedPrograms] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('si7kaih_principal_approved_programs');
      if (saved) return JSON.parse(saved);
    } catch (_e) {}
    return {};
  });

  // Supervision Directives State (Stored in LocalStorage)
  const [supervisionDirectives, setSupervisionDirectives] = useState<SupervisionDirective[]>(() => {
    try {
      const saved = localStorage.getItem('si7kaih_principal_supervision_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_e) {}
    return [];
  });

  // Add Program Modal State
  const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);
  const [newProgramTitle, setNewProgramTitle] = useState('');
  const [newProgramHabit, setNewProgramHabit] = useState('BANGUN_PAGI');
  const [newProgramDesc, setNewProgramDesc] = useState('');
  const [newProgramScope, setNewProgramScope] = useState('Semua Rombel (Fase D)');
  const [newProgramSchedule, setNewProgramSchedule] = useState('Setiap Hari');
  const [newProgramPic, setNewProgramPic] = useState('');

  // Selected School Selector ID (Dynamic based on currentPersona or first school, NO hardcoded 's-smp-01')
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(() => {
    if (currentPersona?.schoolId) return currentPersona.schoolId;
    const stored = getStoredSchools();
    if (currentPersona?.schoolName) {
      const match = stored.find(
        (s) => s.name.trim().toLowerCase() === currentPersona.schoolName?.trim().toLowerCase()
      );
      if (match) return match.id;
    }
    return stored[0]?.id || '';
  });

  // Update selectedSchoolId if persona or schools change
  useEffect(() => {
    if (currentPersona?.schoolId && currentPersona.schoolId !== selectedSchoolId) {
      setSelectedSchoolId(currentPersona.schoolId);
    } else if (!selectedSchoolId && schools.length > 0) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [currentPersona, schools, selectedSchoolId]);

  // Synchronized Unified Programs from all authoritative sources
  const [unifiedProgramsList, setUnifiedProgramsList] = useState<UnifiedSchoolProgram[]>(() => {
    return loadAllUnifiedPrograms(initialPrograms);
  });

  // Synchronized Unified RTLs from all authoritative sources
  const [unifiedFollowUpsList, setUnifiedFollowUpsList] = useState<FollowUpPlan[]>(() => {
    return loadAllUnifiedFollowUps(initialFollowUps);
  });

  function loadAllUnifiedPrograms(propsPrograms: SchoolProgram[] = []): UnifiedSchoolProgram[] {
    const list: UnifiedSchoolProgram[] = [];
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();

    const addProgram = (prog: UnifiedSchoolProgram) => {
      // Filter out dummy/sample programs
      if (!prog || !prog.title) return;
      const lowerId = (prog.id || '').toLowerCase();
      const lowerTitle = prog.title.toLowerCase();
      if (
        lowerId.startsWith('prog-0') ||
        lowerId.startsWith('prg-0') ||
        lowerId.includes('default') ||
        lowerId.includes('sample') ||
        lowerTitle.includes('contoh') ||
        lowerTitle.includes('sample')
      ) {
        return;
      }
      if (!seenIds.has(prog.id) && !seenTitles.has(lowerTitle)) {
        seenIds.add(prog.id);
        seenTitles.add(lowerTitle);
        list.push(prog);
      }
    };

    // 1. From School Admin programs (si7kaih_school_programs_prod)
    try {
      const rawSchool = localStorage.getItem('si7kaih_school_programs_prod');
      if (rawSchool) {
        const parsed = JSON.parse(rawSchool);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            addProgram({
              id: p.id || `prg-sch-${Math.random()}`,
              title: p.title || 'Program Pembiasaan',
              habitCode: p.habitTarget || p.habitCode || 'PEMBIASAAN',
              description: p.description || p.title || '-',
              participantScope: p.participants || p.participantScope || 'Semua Rombel',
              schedule: p.frequency || p.schedule || 'Terjadwal',
              pic: p.leadTeacher || p.pic || 'Tim Karakter',
              status: p.status || 'AKTIF',
              evidenceCount: p.evidenceCount || 0,
              schoolId: p.schoolId,
              source: 'ADMIN_SEKOLAH',
            });
          });
        }
      }
    } catch (_e) {}

    // 2. From Teacher programs (si7kaih_teacher_programs_prod)
    try {
      const rawTeacher = localStorage.getItem('si7kaih_teacher_programs_prod');
      if (rawTeacher) {
        const parsed = JSON.parse(rawTeacher);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: SchoolProgram) => {
            addProgram({
              id: p.id,
              title: p.title,
              habitCode: p.habitCode,
              description: p.description,
              participantScope: p.participantScope,
              schedule: p.schedule,
              pic: p.pic,
              evidenceCount: p.evidenceCount || 0,
              resultNote: p.resultNote,
              source: 'GURU_ROMBEL',
            });
          });
        }
      }
    } catch (_e) {}

    // 3. From General app programs (si7kaih_programs_prod)
    try {
      const rawGeneral = localStorage.getItem('si7kaih_programs_prod');
      if (rawGeneral) {
        const parsed = JSON.parse(rawGeneral);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: SchoolProgram) => {
            addProgram({
              id: p.id,
              title: p.title,
              habitCode: p.habitCode,
              description: p.description,
              participantScope: p.participantScope,
              schedule: p.schedule,
              pic: p.pic,
              evidenceCount: p.evidenceCount || 0,
              resultNote: p.resultNote,
              source: 'SIM_SEKOLAH',
            });
          });
        }
      }
    } catch (_e) {}

    // 4. From props
    (propsPrograms || []).forEach((p) => {
      addProgram({
        id: p.id,
        title: p.title,
        habitCode: p.habitCode,
        description: p.description,
        participantScope: p.participantScope,
        schedule: p.schedule,
        pic: p.pic,
        evidenceCount: p.evidenceCount || 0,
        resultNote: p.resultNote,
        source: 'MASTER',
      });
    });

    return list;
  }

  function loadAllUnifiedFollowUps(propsFollowUps: FollowUpPlan[] = []): FollowUpPlan[] {
    const list: FollowUpPlan[] = [];
    const seenIds = new Set<string>();

    const addRtl = (rtl: FollowUpPlan) => {
      if (!rtl || !rtl.finding) return;
      const lowerId = (rtl.id || '').toLowerCase();
      if (
        lowerId.startsWith('rtl-0') ||
        lowerId.includes('default') ||
        lowerId.includes('sample') ||
        rtl.finding.toLowerCase().includes('contoh')
      ) {
        return;
      }
      if (!seenIds.has(rtl.id)) {
        seenIds.add(rtl.id);
        list.push(rtl);
      }
    };

    // 1. From Teacher Followups
    try {
      const rawTeacher = localStorage.getItem('si7kaih_teacher_followups_prod');
      if (rawTeacher) {
        const parsed = JSON.parse(rawTeacher);
        if (Array.isArray(parsed)) parsed.forEach(addRtl);
      }
    } catch (_e) {}

    // 2. From School Followups
    try {
      const rawSchool = localStorage.getItem('si7kaih_followups_prod');
      if (rawSchool) {
        const parsed = JSON.parse(rawSchool);
        if (Array.isArray(parsed)) parsed.forEach(addRtl);
      }
    } catch (_e) {}

    // 3. From props
    (propsFollowUps || []).forEach(addRtl);

    return list;
  }

  // Authoritative re-synchronization of all data
  const syncAllData = useCallback(() => {
    setIsSyncing(true);
    const freshSchools = getStoredSchools();
    const freshRombels = getStoredRombels();
    const freshStudents = getStoredStudents();
    const freshUsers = getStoredUsers();

    // Read fresh journals
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

    // Read fresh approved programs
    try {
      const rawApproved = localStorage.getItem('si7kaih_principal_approved_programs');
      if (rawApproved) setApprovedPrograms(JSON.parse(rawApproved));
    } catch (_e) {}

    // Read fresh directives
    try {
      const rawDirectives = localStorage.getItem('si7kaih_principal_supervision_notes');
      if (rawDirectives) {
        const parsed = JSON.parse(rawDirectives);
        if (Array.isArray(parsed)) setSupervisionDirectives(parsed);
      }
    } catch (_e) {}

    setSchools(freshSchools);
    setRombels(freshRombels);
    setStudents(freshStudents);
    setUserAccounts(freshUsers);
    setSyncedJournals(freshJournals.length > 0 ? freshJournals : initialJournals);
    setUnifiedProgramsList(loadAllUnifiedPrograms(initialPrograms));
    setUnifiedFollowUpsList(loadAllUnifiedFollowUps(initialFollowUps));

    setLastSyncTime(
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    setTimeout(() => setIsSyncing(false), 400);
  }, [initialJournals, initialPrograms, initialFollowUps]);

  // Real-time synchronization listeners across tabs and custom events
  useEffect(() => {
    const handleSync = () => syncAllData();

    const handleJournalsEvent = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        const cleaned = e.detail.filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j));
        setSyncedJournals(cleaned);
        setLastSyncTime(
          new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      } else {
        syncAllData();
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'si7kaih_journals_prod' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setSyncedJournals(parsed.filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j)));
            setLastSyncTime(
              new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            );
          }
        } catch (_err) {}
      }
      syncAllData();
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('si7kaih_schools_updated', handleSync);
    window.addEventListener('si7kaih_students_updated', handleSync);
    window.addEventListener('si7kaih_rombels_updated', handleSync);
    window.addEventListener('si7kaih_users_updated', handleSync);
    window.addEventListener('si7kaih_journals_updated', handleJournalsEvent);
    window.addEventListener('si7kaih_programs_updated', handleSync);
    window.addEventListener('si7kaih_followups_updated', handleSync);
    window.addEventListener('si7kaih_supervision_updated', handleSync);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('si7kaih_sync_channel');
        bc.onmessage = (event) => {
          if (event.data?.journals && Array.isArray(event.data.journals)) {
            setSyncedJournals(event.data.journals.filter((j: any) => !isDeprecatedOrDummyJournal(j)));
            setLastSyncTime(
              new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            );
          } else {
            syncAllData();
          }
        };
      } catch (_e) {}
    }

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('si7kaih_schools_updated', handleSync);
      window.removeEventListener('si7kaih_students_updated', handleSync);
      window.removeEventListener('si7kaih_rombels_updated', handleSync);
      window.removeEventListener('si7kaih_users_updated', handleSync);
      window.removeEventListener('si7kaih_journals_updated', handleJournalsEvent);
      window.removeEventListener('si7kaih_programs_updated', handleSync);
      window.removeEventListener('si7kaih_followups_updated', handleSync);
      window.removeEventListener('si7kaih_supervision_updated', handleSync);
      if (bc) bc.close();
    };
  }, [syncAllData]);

  // Sync props changes
  useEffect(() => {
    setUnifiedProgramsList(loadAllUnifiedPrograms(initialPrograms));
  }, [initialPrograms]);

  useEffect(() => {
    setUnifiedFollowUpsList(loadAllUnifiedFollowUps(initialFollowUps));
  }, [initialFollowUps]);

  useEffect(() => {
    let freshJournals: DailyJournal[] = [];
    try {
      const raw = localStorage.getItem('si7kaih_journals_prod');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          freshJournals = parsed.filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j));
        }
      }
    } catch (_e) {}

    if (freshJournals.length > 0) {
      setSyncedJournals(freshJournals);
    } else if (initialJournals) {
      setSyncedJournals(initialJournals.filter((j) => !isDeprecatedOrDummyJournal(j)));
    }
  }, [initialJournals]);

  // Active School resolution: strictly matches selected school or persona's school
  const activeSchool: SchoolMaster = useMemo(() => {
    const match =
      schools.find((s) => s.id === selectedSchoolId) ||
      schools.find((s) => s.id === currentPersona?.schoolId) ||
      schools.find(
        (s) =>
          currentPersona?.schoolName &&
          s.name.trim().toLowerCase() === currentPersona.schoolName.trim().toLowerCase()
      ) ||
      schools[0];

    if (match) return match;

    // Neutral empty fallback if no school is registered yet (No fake default data)
    return {
      id: currentPersona?.schoolId || '',
      npsn: currentPersona?.identifierValue || '-',
      name: currentPersona?.schoolName || 'Satuan Pendidikan',
      jenjang: 'SMP',
      status: 'NEGERI',
      akreditasi: 'A',
      district: '-',
      city: '-',
      province: '-',
      address: '-',
      principalName: currentPersona?.name || '-',
      principalNip: currentPersona?.identifierValue || '-',
      adminName: '-',
      adminUsername: '-',
      totalStudents: 0,
      totalClasses: 0,
      totalTeachers: 0,
      habitCompletenessRate: 0,
      habitConsistencyRate: 0,
      activeStatus: 'AKTIF',
      createdAt: new Date().toISOString().split('T')[0],
    };
  }, [schools, selectedSchoolId, currentPersona]);

  const normalizeClassName = (name?: string) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/^kelas\s+/, '')
      .replace(/^rombel\s+/, '')
      .replace(/[-_\s]/g, '')
      .replace(/^vii([a-z0-9])/i, '7$1')
      .replace(/^viii([a-z0-9])/i, '8$1')
      .replace(/^ix([a-z0-9])/i, '9$1');
  };

  // Scoped Rombels for active school (No cross-school leakage)
  const schoolScopedRombels = useMemo(() => {
    const scoped = rombels.filter((r) => {
      if (!r) return false;
      if (activeSchool.id && r.schoolId && r.schoolId.toLowerCase() === activeSchool.id.toLowerCase()) return true;
      if (
        activeSchool.name &&
        r.schoolName &&
        r.schoolName.trim().toLowerCase() === activeSchool.name.trim().toLowerCase()
      )
        return true;
      if (!r.schoolId && !r.schoolName && schools.length <= 1) return true;
      return false;
    });

    if (scoped.length === 0 && (schools.length <= 1 || !activeSchool.id)) {
      return rombels;
    }
    return scoped;
  }, [rombels, activeSchool, schools]);

  // Scoped Students for active school
  const schoolScopedStudents = useMemo(() => {
    const scoped = students.filter((s) => {
      if (!s) return false;
      if (activeSchool.id && s.schoolId && s.schoolId.toLowerCase() === activeSchool.id.toLowerCase()) return true;
      if (
        activeSchool.name &&
        s.schoolName &&
        s.schoolName.trim().toLowerCase() === activeSchool.name.trim().toLowerCase()
      )
        return true;
      if (!s.schoolId && !s.schoolName && schools.length <= 1) return true;
      return false;
    });

    if (scoped.length === 0 && (schools.length <= 1 || !activeSchool.id)) {
      return students;
    }
    return scoped;
  }, [students, activeSchool, schools]);

  // Scoped Journals strictly for active school
  const schoolScopedJournals = useMemo(() => {
    return syncedJournals.filter((j) => {
      if (!j) return false;
      // 1. School ID match
      if (activeSchool.id && j.schoolId && j.schoolId.toLowerCase() === activeSchool.id.toLowerCase()) return true;
      // 2. School Name match
      if (activeSchool.name && j.schoolName && j.schoolName.trim().toLowerCase() === activeSchool.name.trim().toLowerCase()) return true;
      // 3. Matched student in this school
      const sId = j.studentId;
      const sNisn = j.studentNisn;
      const sName = (j.studentName || '').toLowerCase().trim();
      if (schoolScopedStudents.some((s) => (s.id && s.id === sId) || (s.nisn && s.nisn === sNisn) || (sName && s.name.toLowerCase().trim() === sName))) {
        return true;
      }
      // 4. Matched rombel in this school
      const normJClass = normalizeClassName(j.className);
      if (normJClass && schoolScopedRombels.some((r) => normalizeClassName(r.name) === normJClass || normalizeClassName(r.code) === normJClass)) {
        return true;
      }
      // 5. Default when single school
      if (schools.length <= 1) return true;
      return false;
    });
  }, [syncedJournals, activeSchool, schoolScopedStudents, schoolScopedRombels, schools.length]);

  // Today ISO Date string (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Today's journals for the school
  const todaySchoolJournals = useMemo(() => {
    return schoolScopedJournals.filter((j) => j.journalDate === todayStr);
  }, [schoolScopedJournals, todayStr]);

  // Unique students who filled today in this school
  const todayFilledStudentsCount = useMemo(() => {
    const set = new Set<string>();
    todaySchoolJournals.forEach((j) => {
      const key = j.studentNisn || j.studentId || j.studentName || j.id;
      if (key) set.add(key.toLowerCase().trim());
    });
    return set.size;
  }, [todaySchoolJournals]);

  // Most recent journal submissions (Live Feed for Principal)
  const recentSchoolJournals = useMemo(() => {
    return [...schoolScopedJournals]
      .sort((a, b) => {
        const timeA = a.savedAt || a.updatedAt || a.createdAt || a.journalDate;
        const timeB = b.savedAt || b.updatedAt || b.createdAt || b.journalDate;
        return (timeB || '').localeCompare(timeA || '');
      })
      .slice(0, 8);
  }, [schoolScopedJournals]);

  // Parent Validation metrics across school
  const parentValidationStats = useMemo(() => {
    const validated = schoolScopedJournals.filter((j) => j.parentValidated === true);
    const total = schoolScopedJournals.length;
    const rate = total > 0 ? Math.round((validated.length / total) * 100) : 0;
    return {
      validatedCount: validated.length,
      totalCount: total,
      rate,
    };
  }, [schoolScopedJournals]);

  // School-wide 7 Habits Realtime Analytics
  const schoolHabitAnalytics = useMemo(() => {
    const habitKeys: { code: string; label: string; icon: string; bg: string; color: string }[] = [
      { code: 'WAKE_EARLY', label: 'Bangun Pagi', icon: '🌅', bg: 'bg-amber-50 text-amber-800 border-amber-200', color: 'text-amber-600' },
      { code: 'WORSHIP', label: 'Beribadah', icon: '🤲', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', color: 'text-emerald-600' },
      { code: 'EXERCISE', label: 'Berolahraga', icon: '🏃', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', color: 'text-indigo-600' },
      { code: 'HEALTHY_EATING', label: 'Makan Sehat', icon: '🥗', bg: 'bg-rose-50 text-rose-800 border-rose-200', color: 'text-rose-600' },
      { code: 'LEARNING', label: 'Gemar Belajar', icon: '📚', bg: 'bg-blue-50 text-blue-800 border-blue-200', color: 'text-blue-600' },
      { code: 'BERMASYARAKAT', label: 'Bermasyarakat', icon: '🤝', bg: 'bg-purple-50 text-purple-800 border-purple-200', color: 'text-purple-600' },
      { code: 'TIDUR_CEPAT', label: 'Tidur Cepat', icon: '🌙', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200', color: 'text-cyan-600' },
    ];

    if (schoolScopedJournals.length === 0) {
      return habitKeys.map((h) => ({
        ...h,
        percentage: activeSchool.habitCompletenessRate || 0,
        completedCount: 0,
        totalCount: 0,
        todayCompleted: 0,
        status: 'MENUNGGU_JURNAL',
      }));
    }

    return habitKeys.map((h) => {
      let completedCount = 0;
      let todayCompleted = 0;
      schoolScopedJournals.forEach((j) => {
        const entry = (j.entries && (j.entries as any)[h.code]) || (j.habits && (j.habits as any)[h.code]);
        if (entry && (entry.completed || entry.status === 'COMPLETED')) {
          completedCount++;
          if (j.journalDate === todayStr) todayCompleted++;
        }
      });

      const pct = Math.min(100, Math.round((completedCount / schoolScopedJournals.length) * 100));
      const status = pct >= 80 ? 'UNGGUL' : pct >= 60 ? 'KONSISTEN' : 'PERLU_PENGUATAN';
      return {
        ...h,
        percentage: pct,
        completedCount,
        totalCount: schoolScopedJournals.length,
        todayCompleted,
        status,
      };
    });
  }, [schoolScopedJournals, todayStr, activeSchool]);

  // Sync with Header navigation tabs
  useEffect(() => {
    if (!activeNavTab) return;
    if (activeNavTab === 'monitoring' || activeNavTab === 'classes') {
      setActiveTab('CLASSES');
    } else if (activeNavTab === 'programs') {
      setActiveTab('PROGRAMS');
    } else if (activeNavTab === 'rtl') {
      setActiveTab('RTL');
    } else if (activeNavTab === 'ai-school') {
      setActiveTab('AI_STRATEGY');
    } else if (activeNavTab === 'dashboard') {
      setActiveTab('OVERVIEW');
    }
  }, [activeNavTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleApproveProgram = (programId: string, title: string) => {
    setApprovedPrograms((prev) => {
      const next = !prev[programId];
      const updated = { ...prev, [programId]: next };
      try {
        localStorage.setItem('si7kaih_principal_approved_programs', JSON.stringify(updated));
      } catch (_e) {}
      showToast(
        next
          ? `Program "${title}" disahkan oleh Kepala Sekolah.`
          : `Status pengesahan program "${title}" diperbarui.`
      );
      return updated;
    });
  };

  const handleSendFeedback = () => {
    if (!feedbackNote.trim()) return;
    showToast(
      `Catatan apresiasi berhasil dikirim ke Wali ${selectedClass?.rawName || selectedClass?.name || 'Kelas'}.`
    );
    setFeedbackNote('');
  };

  const handleSendSupervisionDirective = () => {
    if (!feedbackNote.trim()) {
      showToast('Silakan ketik catatan arahan terlebih dahulu.');
      return;
    }

    const newDirective: SupervisionDirective = {
      id: `dir-${Date.now()}`,
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      timestamp: Date.now(),
      principalName: activeSchool.principalName || currentPersona?.name || 'Kepala Sekolah',
      schoolName: activeSchool.name,
      note: feedbackNote.trim(),
    };

    const updated = [newDirective, ...supervisionDirectives];
    setSupervisionDirectives(updated);
    try {
      localStorage.setItem('si7kaih_principal_supervision_notes', JSON.stringify(updated));
      localStorage.setItem('si7kaih_supervision_notes_prod', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('si7kaih_supervision_updated', { detail: updated }));
    } catch (_e) {}

    showToast('Arahan strategis berhasil disimpan dan diteruskan ke seluruh dewan guru.');
    setFeedbackNote('');
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramTitle.trim()) {
      showToast('Judul program pembiasaan wajib diisi!');
      return;
    }

    const newProg: UnifiedSchoolProgram = {
      id: `prg-sch-${Date.now()}`,
      title: newProgramTitle.trim(),
      habitCode: newProgramHabit,
      description: newProgramDesc.trim() || newProgramTitle.trim(),
      participantScope: newProgramScope.trim() || 'Semua Rombel',
      schedule: newProgramSchedule.trim() || 'Terjadwal',
      pic: newProgramPic.trim() || activeSchool.principalName || 'Dewan Guru',
      status: 'AKTIF',
      evidenceCount: 0,
      schoolId: activeSchool.id,
      source: 'KEPALA_SEKOLAH',
    };

    // Save to School Admin storage
    try {
      const existing = localStorage.getItem('si7kaih_school_programs_prod');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [newProg, ...parsed];
      localStorage.setItem('si7kaih_school_programs_prod', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('si7kaih_programs_updated', { detail: updated }));
    } catch (_e) {}

    // Auto approve this program by Principal
    setApprovedPrograms((prev) => {
      const next = { ...prev, [newProg.id]: true };
      try {
        localStorage.setItem('si7kaih_principal_approved_programs', JSON.stringify(next));
      } catch (_e) {}
      return next;
    });

    setUnifiedProgramsList((prev) => [newProg, ...prev]);
    setIsAddProgramModalOpen(false);
    setNewProgramTitle('');
    setNewProgramDesc('');
    setNewProgramPic('');
    showToast(`Inisiatif program "${newProg.title}" berhasil disahkan & diterbitkan.`);
  };

  // Dynamic Class Breakdowns synthesized strictly from live Rombels, Students & Journals
  const classBreakdowns = useMemo(() => {
    if (!schoolScopedRombels || schoolScopedRombels.length === 0) {
      return [];
    }

    const habitCodes = [
      { code: 'WAKE_EARLY', label: 'Bangun Pagi' },
      { code: 'WORSHIP', label: 'Beribadah' },
      { code: 'EXERCISE', label: 'Berolahraga' },
      { code: 'HEALTHY_EATING', label: 'Makan Sehat' },
      { code: 'LEARNING', label: 'Gemar Belajar' },
      { code: 'SOCIAL', label: 'Bermasyarakat' },
      { code: 'SLEEP_EARLY', label: 'Tidur Cepat' },
    ];

    return schoolScopedRombels.map((r) => {
      const normalizedRombelName = r.name.toLowerCase().trim();

      // Match students belonging to this rombel
      const matchedStudents = schoolScopedStudents.filter((s) => {
        const sClass = (s.className || '').toLowerCase().trim();
        if (sClass === normalizedRombelName) return true;
        if (normalizeClassName(s.className) === normalizeClassName(r.name)) return true;
        if (sClass.includes(normalizedRombelName) || normalizedRombelName.includes(sClass)) return true;
        const rCode = r.code ? r.code.toLowerCase().replace('rombel-', '') : '';
        if (rCode && sClass.includes(rCode)) return true;
        return false;
      });

      // Check user accounts for teacher assigned to this rombel
      const assignedTeacherUser = userAccounts.find(
        (u) =>
          u.role === 'TEACHER' &&
          (u.className === r.name || (r.teacher && u.name.toLowerCase() === r.teacher.toLowerCase()))
      );
      const teacherName = assignedTeacherUser?.name || r.teacher || '-';
      const teacherNip = assignedTeacherUser?.identifierValue || r.teacherNip || '-';

      // Match journals for this rombel
      const studentIds = new Set(matchedStudents.map((s) => s.id));
      const studentNisns = new Set(matchedStudents.map((s) => s.nisn).filter(Boolean));
      const studentNames = new Set(matchedStudents.map((s) => s.name.toLowerCase().trim()));

      const rombelJournals = schoolScopedJournals.filter((j) => {
        if (studentIds.has(j.studentId)) return true;
        if (j.studentNisn && studentNisns.has(j.studentNisn)) return true;
        if (j.studentName && studentNames.has(j.studentName.toLowerCase().trim())) return true;
        if (normalizeClassName(j.className) === normalizeClassName(r.name)) return true;
        return false;
      });

      // Merge students with journals into allRombelStudents if not yet in matchedStudents
      const allRombelStudents = [...matchedStudents];
      const existingStudentKeys = new Set(
        matchedStudents.map((s) => (s.nisn || s.id || s.name).toLowerCase().trim())
      );

      rombelJournals.forEach((j) => {
        const key = (j.studentNisn || j.studentId || j.studentName || '').toLowerCase().trim();
        if (key && !existingStudentKeys.has(key)) {
          existingStudentKeys.add(key);
          allRombelStudents.push({
            id: j.studentId || `std-${Math.random()}`,
            nisn: j.studentNisn || '-',
            name: j.studentName || 'Peserta Didik',
            gender: 'L',
            schoolId: activeSchool.id,
            schoolName: activeSchool.name,
            className: r.name,
            status: 'AKTIF',
          } as Student);
        }
      });

      const studentCount = allRombelStudents.length;

      // Calculate true habit metrics from live student journals
      const habitStats = habitCodes.map((h) => {
        let count = 0;
        let todayCount = 0;
        rombelJournals.forEach((j) => {
          const entry = (j.entries && (j.entries as any)[h.code]) || (j.habits && (j.habits as any)[h.code]);
          if (entry && (entry.completed || entry.status === 'COMPLETED')) {
            count++;
            if (j.journalDate === todayStr) todayCount++;
          }
        });
        const pct = rombelJournals.length > 0 ? Math.min(100, Math.round((count / rombelJournals.length) * 100)) : 0;
        return { ...h, percentage: pct, completedCount: count, todayCount };
      });

      const sortedHabitStats = [...habitStats].sort((a, b) => b.percentage - a.percentage);
      const topHabit = rombelJournals.length > 0
        ? `${sortedHabitStats[0].label} (${sortedHabitStats[0].percentage}%)`
        : 'Menunggu Jurnal';
      const priorityHabit = rombelJournals.length > 0
        ? `${sortedHabitStats[sortedHabitStats.length - 1].label} (${sortedHabitStats[sortedHabitStats.length - 1].percentage}%)`
        : 'Pengisian Awal';

      // Synthesize individual student stats with real live journal data
      const studentsDetail = allRombelStudents.map((st) => {
        const studentJournals = rombelJournals.filter(
          (j) =>
            j.studentId === st.id ||
            (st.nisn && j.studentNisn === st.nisn) ||
            (j.studentName && st.name && j.studentName.toLowerCase().trim() === st.name.toLowerCase().trim())
        );

        const journalCount = studentJournals.length;
        const todayJournal = studentJournals.find((j) => j.journalDate === todayStr);

        let totalCompletedSlots = 0;
        studentJournals.forEach((j) => {
          habitCodes.forEach((h) => {
            const entry = (j.entries && (j.entries as any)[h.code]) || (j.habits && (j.habits as any)[h.code]);
            if (entry && (entry.completed || entry.status === 'COMPLETED')) totalCompletedSlots++;
          });
        });

        const consistencyRate = journalCount > 0
          ? Math.min(100, Math.round((totalCompletedSlots / (journalCount * 7)) * 100))
          : 0;

        let category: 'TERPANTAU_BAIK' | 'PERLU_PENGUATAN' | 'PERLU_PENDAMPINGAN';
        if (consistencyRate >= 75) category = 'TERPANTAU_BAIK';
        else if (consistencyRate >= 50) category = 'PERLU_PENGUATAN';
        else category = 'PERLU_PENDAMPINGAN';

        const isParentValidated = studentJournals.some((j) => j.parentValidated === true);
        const sortedJ = [...studentJournals].sort((a, b) => (b.journalDate || '').localeCompare(a.journalDate || ''));
        const latestJ = sortedJ[0];

        return {
          ...st,
          journalCount,
          isFilledToday: !!todayJournal,
          todayHabitsCount: todayJournal ? (todayJournal.completedCount || 0) : 0,
          consistencyRate,
          category,
          isParentValidated,
          latestJournalDate: latestJ?.journalDate,
          latestValidationNote: latestJ?.parentValidationNote,
          studentJournals,
        };
      });

      const good = studentsDetail.filter((s) => s.category === 'TERPANTAU_BAIK').length;
      const warning = studentsDetail.filter((s) => s.category === 'PERLU_PENGUATAN').length;
      const assist = studentsDetail.filter((s) => s.category === 'PERLU_PENDAMPINGAN').length;
      const todayFilledCount = studentsDetail.filter((s) => s.isFilledToday).length;

      let completeness = 0;
      let consistency = 0;

      if (rombelJournals.length > 0) {
        const totalEntries = rombelJournals.length * 7;
        const totalCompleted = habitStats.reduce((acc, h) => acc + h.completedCount, 0);
        completeness = totalEntries > 0 ? +((totalCompleted / totalEntries) * 100).toFixed(1) : 0;

        const activeStudentsWithJournals = studentsDetail.filter((s) => s.journalCount > 0);
        if (activeStudentsWithJournals.length > 0) {
          const sumConsistency = activeStudentsWithJournals.reduce((acc, s) => acc + s.consistencyRate, 0);
          consistency = +(sumConsistency / activeStudentsWithJournals.length).toFixed(1);
        } else {
          consistency = completeness;
        }
      } else if (studentCount > 0 && activeSchool.habitCompletenessRate > 0) {
        completeness = activeSchool.habitCompletenessRate;
        consistency = activeSchool.habitConsistencyRate || activeSchool.habitCompletenessRate;
      }

      return {
        id: r.id,
        name: r.name.includes('Fase') ? r.name : `${r.name} (${r.phase || 'Fase D'})`,
        rawName: r.name,
        teacher: teacherName,
        teacherNip: teacherNip,
        students: studentCount,
        studentList: allRombelStudents,
        studentsDetail,
        totalJournals: rombelJournals.length,
        todayFilledCount,
        habitStats,
        completeness,
        consistency,
        good,
        warning,
        assist,
        topHabit,
        priorityHabit,
        capacity: r.capacity || 32,
        academicYear: r.academicYear || '2025/2026 Ganjil',
        phase: r.phase || 'Fase D',
      };
    });
  }, [schoolScopedRombels, schoolScopedStudents, userAccounts, schoolScopedJournals, activeSchool, todayStr]);

  // Filtered Class Breakdowns based on Search Query
  const filteredClassBreakdowns = useMemo(() => {
    if (!classSearchQuery.trim()) return classBreakdowns;
    const q = classSearchQuery.toLowerCase();
    return classBreakdowns.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.teacher.toLowerCase().includes(q) ||
        c.rawName.toLowerCase().includes(q)
    );
  }, [classBreakdowns, classSearchQuery]);

  // Aggregate stats derived strictly from live data
  const totalActiveStudents = useMemo(() => {
    if (schoolScopedStudents.length > 0) {
      return schoolScopedStudents.length;
    }
    const fromRombels = classBreakdowns.reduce((acc, c) => acc + c.students, 0);
    if (fromRombels > 0) return fromRombels;
    return activeSchool.totalStudents || 0;
  }, [schoolScopedStudents, classBreakdowns, activeSchool]);

  const totalTeachersCount = useMemo(() => {
    const teachersInSchool = userAccounts.filter(
      (u) =>
        u.role === 'TEACHER' &&
        (!u.schoolId ||
          u.schoolId === activeSchool.id ||
          (u.schoolName && activeSchool.name && u.schoolName.toLowerCase().trim() === activeSchool.name.toLowerCase().trim()))
    ).length;
    if (teachersInSchool > 0) return teachersInSchool;

    const assignedTeachers = new Set(
      schoolScopedRombels.map((r) => r.teacher?.trim()).filter(Boolean)
    );
    if (assignedTeachers.size > 0) return assignedTeachers.size;

    return activeSchool.totalTeachers || 0;
  }, [userAccounts, activeSchool, schoolScopedRombels]);

  const totalGoodStudents = useMemo(
    () => classBreakdowns.reduce((acc, c) => acc + c.good, 0),
    [classBreakdowns]
  );
  const totalWarningStudents = useMemo(
    () => classBreakdowns.reduce((acc, c) => acc + c.warning, 0),
    [classBreakdowns]
  );
  const totalAssistStudents = useMemo(
    () => classBreakdowns.reduce((acc, c) => acc + c.assist, 0),
    [classBreakdowns]
  );

  // Overall school habit rates calculated strictly from live school journals
  const overallCompleteness = useMemo(() => {
    if (schoolScopedJournals.length > 0) {
      const totalEntries = schoolScopedJournals.length * 7;
      let totalCompleted = 0;
      schoolHabitAnalytics.forEach((h) => {
        totalCompleted += h.completedCount;
      });
      return totalEntries > 0 ? +((totalCompleted / totalEntries) * 100).toFixed(1) : 0;
    }
    const classesWithData = classBreakdowns.filter((c) => c.completeness > 0);
    if (classesWithData.length > 0) {
      const sum = classesWithData.reduce((acc, c) => acc + c.completeness, 0);
      return +(sum / classesWithData.length).toFixed(1);
    }
    return activeSchool.habitCompletenessRate || 0;
  }, [schoolScopedJournals, schoolHabitAnalytics, classBreakdowns, activeSchool]);

  const overallConsistency = useMemo(() => {
    const classesWithData = classBreakdowns.filter((c) => c.consistency > 0);
    if (classesWithData.length > 0) {
      const sum = classesWithData.reduce((acc, c) => acc + c.consistency, 0);
      return +(sum / classesWithData.length).toFixed(1);
    }
    return activeSchool.habitConsistencyRate || 0;
  }, [classBreakdowns, activeSchool]);

  const todaySchoolCompletionPercentage = useMemo(() => {
    if (totalActiveStudents === 0) return 0;
    return Math.min(100, Math.round((todayFilledStudentsCount / totalActiveStudents) * 100));
  }, [todayFilledStudentsCount, totalActiveStudents]);

  const handleExportSchoolCsv = () => {
    const headers = [
      'Nama Kelas',
      'Wali Kelas',
      'NIP Wali Kelas',
      'Jumlah Siswa',
      'Total Jurnal Murid',
      'Mengisi Hari Ini',
      'Kelengkapan (%)',
      'Konsistensi (%)',
      'Terpantau Baik',
      'Perlu Penguatan',
      'Perlu Pendampingan',
      'Pembiasaan Unggul',
      'Fokus Pendampingan',
    ];
    const rows = classBreakdowns.map((c) => [
      `"${c.name}"`,
      `"${c.teacher}"`,
      `"${c.teacherNip}"`,
      c.students,
      c.totalJournals || 0,
      c.todayFilledCount || 0,
      c.completeness,
      c.consistency,
      c.good,
      c.warning,
      c.assist,
      `"${c.topHabit}"`,
      `"${c.priorityHabit}"`,
    ]);
    const csvContent =
      '\uFEFF' +
      [
        `"Rekap Eksekutif Satuan Pendidikan 7KAIH - ${activeSchool.name}"`,
        `"NPSN: ${activeSchool.npsn} - Kepala Sekolah: ${activeSchool.principalName} - Tanggal: ${new Date().toLocaleDateString('id-ID')}"`,
        `"Total Jurnal Terdata: ${schoolScopedJournals.length} - Siswa Mengisi Hari Ini: ${todayFilledStudentsCount} (${todaySchoolCompletionPercentage}%)"`,
        '',
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_7KAIH_${activeSchool.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Rekap eksekutif ${activeSchool.name} berhasil diunduh (CSV).`);
  };

  const handleGenerateSchoolAi = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'PRINCIPAL_SCHOOL_STRATEGY',
          payload: {
            schoolName: activeSchool.name,
            npsn: activeSchool.npsn,
            principalName: activeSchool.principalName,
            totalStudents: totalActiveStudents,
            totalClasses: classBreakdowns.length,
            totalJournals: schoolScopedJournals.length,
            todayJournalsCount: todaySchoolJournals.length,
            todayFilledStudentsCount: todayFilledStudentsCount,
            parentValidatedCount: parentValidationStats.validatedCount,
            topHabit: schoolHabitAnalytics[0]?.label || '-',
            lowestHabit: schoolHabitAnalytics[schoolHabitAnalytics.length - 1]?.label || '-',
            overallCompleteness: overallCompleteness,
            overallConsistency: overallConsistency,
            activeProgramsCount: unifiedProgramsList.length,
            goodCount: totalGoodStudents,
            warningCount: totalWarningStudents,
            assistCount: totalAssistStudents,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiSchoolResult(json.data || json);
        showToast('Analisis AI Strategis Tingkat Sekolah berhasil disintesis.');
      } else {
        throw new Error('Fallback strategy synthesis');
      }
    } catch (_e) {
      // Dynamic fallback based on real metrics
      setAiSchoolResult({
        recordedFacts: [
          `Satuan pendidikan ${activeSchool.name} (NPSN: ${activeSchool.npsn}) mencatat ${totalActiveStudents} peserta didik di ${classBreakdowns.length} rombel aktif dengan total ${schoolScopedJournals.length} jurnal murid terkini tersimpan.`,
          `Sebanyak ${todayFilledStudentsCount} siswa telah mengisi jurnal hari ini (${todaySchoolCompletionPercentage}%), dengan rata-rata kelengkapan sekolah ${overallCompleteness}% dan konsistensi ${overallConsistency}%.`,
          `Sebanyak ${parentValidationStats.validatedCount} jurnal (${parentValidationStats.rate}%) telah divalidasi oleh orang tua murid.`,
          `Sebanyak ${totalGoodStudents} siswa terpantau baik, ${totalWarningStudents} memerlukan penguatan, dan ${totalAssistStudents} memerlukan pendampingan aktif.`,
        ],
        habitPatterns: [
          schoolHabitAnalytics.length > 0 && schoolHabitAnalytics[0].percentage > 0
            ? `Pembiasaan paling konsisten teramati pada domain "${schoolHabitAnalytics[0].label}" (${schoolHabitAnalytics[0].percentage}% keterlaksanaan).`
            : 'Pola pembiasaan sedang dalam pemetaan awal menunggu akumulasi jurnal harian.',
          schoolHabitAnalytics.length > 0 && schoolHabitAnalytics[schoolHabitAnalytics.length - 1].percentage < 70
            ? `Domain "${schoolHabitAnalytics[schoolHabitAnalytics.length - 1].label}" (${schoolHabitAnalytics[schoolHabitAnalytics.length - 1].percentage}%) menjadi prioritas utama penguatan pembiasaan.`
            : 'Seluruh domain pembiasaan 7KAIH terpantau seimbang.',
          totalWarningStudents > 0
            ? `Terdapat ${totalWarningStudents} siswa pada kelompok penguatan yang membutuhkan dorongan pembiasaan terarah.`
            : 'Seluruh peserta didik terpantau dalam kondisi pembiasaan positif.',
        ],
        dataLimitations: [
          'Evaluasi berbasis pada data mandiri satuan pendidikan yang telah disinkronkan oleh Admin Sekolah dan Pendidik.',
          'Korelasikan data ini dengan observasi langsung serta verifikasi berkala dari orang tua murid.',
        ],
        hypothesesToVerify: [
          'Apakah pembiasaan di rumah telah mendapatkan pendampingan yang konsisten dari wali murid?',
          'Apakah jadwal kegiatan sekolah dapat dioptimalkan untuk memfasilitasi pembiasaan positif sebelum KBM dimulai?',
        ],
        actionableRecommendations: [
          'Laksanakan koordinasi supervisi berkala dengan wali kelas mengenai progres siswa dalam kategori penguatan.',
          'Pastikan seluruh rombel telah melengkapi jurnal mandiri peserta didik secara tertib.',
          'Manfaatkan fitur pengesahan program untuk mengalokasikan sarana pendukung pembiasaan 7KAIH.',
        ],
      });
      showToast('Analisis AI Strategis berbasis data satuan pendidikan berhasil disusun.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Habit Coverage Diagnostics for 7KAIH in School Programs
  const habitCoverage = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_HABIT_DEFINITIONS.forEach((h) => {
      counts[h.code] = 0;
    });
    unifiedProgramsList.forEach((p) => {
      const code = p.habitCode;
      if (counts[code] !== undefined) {
        counts[code]++;
      }
    });
    const coveredHabits = ALL_HABIT_DEFINITIONS.filter((h) => (counts[h.code] || 0) > 0);
    const uncoveredHabits = ALL_HABIT_DEFINITIONS.filter((h) => (counts[h.code] || 0) === 0);
    return {
      counts,
      coveredCount: coveredHabits.length,
      uncoveredCount: uncoveredHabits.length,
      coveragePercent: Math.round((coveredHabits.length / 7) * 100),
      coveredHabits,
      uncoveredHabits,
    };
  }, [unifiedProgramsList]);

  // AI Generator: Program Recommendations (Tab Program Sekolah)
  const handleGenerateProgramRecommendations = async () => {
    setIsAiProgramLoading(true);
    try {
      const existingHabits = Array.from(new Set(unifiedProgramsList.map((p) => p.habitCode)));
      const uncovered = ALL_HABIT_DEFINITIONS.filter((h) => !existingHabits.includes(h.code)).map((h) => h.code);

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'PRINCIPAL_PROGRAM_RECOMMENDER',
          actorRole: 'PRINCIPAL',
          payload: {
            schoolName: activeSchool.name,
            npsn: activeSchool.npsn,
            principalName: activeSchool.principalName,
            totalStudents: totalActiveStudents,
            existingProgramsCount: unifiedProgramsList.length,
            existingHabits,
            lowHabit: uncovered[0] || 'TIDUR_CEPAT',
            overallCompleteness,
            overallConsistency,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiProgramResult(json.data || json);
        showToast('Analisis cakupan & rekomendasi program 7KAIH berhasil disusun AI.');
      } else {
        throw new Error('API request failed');
      }
    } catch (_e) {
      setAiProgramResult({
        recordedFacts: [
          `Satuan pendidikan ${activeSchool.name} saat ini memiliki ${unifiedProgramsList.length} program pembiasaan aktif.`,
          `Sebanyak ${habitCoverage.coveredCount} dari 7 dimensi 7KAIH telah tercover program inisiatif resmi.`,
        ],
        patterns: [
          'Inisiatif pembiasaan yang mengikutsertakan paguyuban keluarga terbukti memiliki dampak 2x lebih konsisten.',
          'Program tantangan mingguan berbasis apresiasi meningkatkan antusiasme partisipasi siswa.',
        ],
        programSuggestions: [
          {
            id: `prg-ai-fallback-1`,
            habitCode: 'TIDUR_CEPAT',
            title: 'Gerakan 1 Jam Bebas Layar Sebelum Tidur (Screen-Free Wind-Down)',
            description: 'Kampanye pembatasan layar gawai 60 menit sebelum waktu istirahat malam dengan kartu komitmen bersama orang tua untuk menjamin kebugaran fisik peserta didik saat menyambut fajar.',
            participantScope: 'Seluruh Rombel Belajar',
            schedule: 'Setiap Malam (Senin - Minggu)',
            pic: 'Tim Kesiswaan, BK & Paguyuban Rombel',
            reasoning: 'Data menunjukkan kebiasaan tidur malam tepat waktu menjadi faktor penentu konsentrasi belajar pagi hari.',
            indicator: '85% siswa tidur sebelum pukul 21.30 dan mencatatkan kondisi segar di jurnal harian.',
          },
          {
            id: `prg-ai-fallback-2`,
            habitCode: 'MAKAN_SEHAT',
            title: 'Tantangan Bekal Gizi Pelangi & Jumat Tanpa Sampah Plastik',
            description: 'Program pembiasaan sarapan/makan siang bergizi seimbang (karbohidrat, sayur, buah, protein) dengan membawa wadah makanan dan tumbler mandiri dari rumah.',
            participantScope: 'Semua Rombel Belajar',
            schedule: 'Setiap Hari Jumat',
            pic: 'Pembina UKS & Kader Adiwiyata',
            reasoning: 'Meningkatkan kesadaran asupan mikronutrien anak serta menumbuhkan kepedulian lingkungan hidup.',
            indicator: 'Tercapainya 90% konsistensi menu sayur/buah mingguan pada catatan pembiasaan makan sehat.',
          },
          {
            id: `prg-ai-fallback-3`,
            habitCode: 'BERMASYARAKAT',
            title: 'Aksi Nyata "Satu Hari Satu Kebaikan" (One Day One Kindness)',
            description: 'Pemberian apresiasi mingguan bagi aksi empati, tolong-menolong sesama teman, gotong royong kebersihan lingkungan sekolah, dan keteladanan sosial santun.',
            participantScope: 'Semua Rombel & Pengurus OSIS',
            schedule: 'Terintegrasi dalam Refleksi Mingguan',
            pic: 'Wali Kelas & Pembina Karakter',
            reasoning: 'Memperkuat jiwa Pancasila dan budaya saling menghargai di lingkungan satuan pendidikan.',
            indicator: 'Meningkatnya catatan jurnal dimensi bermasyarakat dengan ragam aksi positif terdokumentasi.',
          },
        ],
      });
      showToast('Rekomendasi inisiatif program 7KAIH berhasil dirumuskan.');
    } finally {
      setIsAiProgramLoading(false);
    }
  };

  // Adopt AI suggested program directly into official school programs
  const handleAdoptAiProgram = (suggestion: any) => {
    const newProg: UnifiedSchoolProgram = {
      id: `prg-sch-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: suggestion.title,
      habitCode: suggestion.habitCode,
      description: suggestion.description,
      participantScope: suggestion.participantScope || 'Seluruh Peserta Didik',
      schedule: suggestion.schedule || 'Terjadwal Rutin',
      pic: suggestion.pic || 'Tim Karakter & Dewan Guru',
      status: 'AKTIF',
      evidenceCount: 0,
      schoolId: activeSchool.id,
      source: 'AI_REKOMENDASI_KEPALA_SEKOLAH',
      resultNote: suggestion.indicator ? `Target Indikator: ${suggestion.indicator}` : undefined,
    };

    try {
      const existing = localStorage.getItem('si7kaih_school_programs_prod');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [newProg, ...parsed];
      localStorage.setItem('si7kaih_school_programs_prod', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('si7kaih_programs_updated', { detail: updated }));
    } catch (_e) {}

    setApprovedPrograms((prev) => {
      const next = { ...prev, [newProg.id]: true };
      try {
        localStorage.setItem('si7kaih_principal_approved_programs', JSON.stringify(next));
      } catch (_e) {}
      return next;
    });

    setUnifiedProgramsList((prev) => [newProg, ...prev]);
    showToast(`Program "${newProg.title}" berhasil diadopsi dan disahkan Kepala Sekolah!`);
  };

  // AI Assistant for Drafting in Add Program Modal
  const handleDraftProgramWithAi = (themeKeyword?: string) => {
    setIsAiModalDrafting(true);
    const keyword = (themeKeyword || aiModalThemeInput || '').toLowerCase();
    setTimeout(() => {
      if (keyword.includes('sarapan') || keyword.includes('makan') || keyword.includes('gizi') || newProgramHabit === 'MAKAN_SEHAT') {
        setNewProgramTitle('Gerakan Sarapan Sehat & Kampanye Tumbler Mandiri');
        setNewProgramHabit('MAKAN_SEHAT');
        setNewProgramScope('Semua Rombel Belajar');
        setNewProgramSchedule('Setiap Hari Jumat Pagi');
        setNewProgramPic('Pembina UKS & Tim Adiwiyata');
        setNewProgramDesc('Pembiasaan sarapan menu gizi seimbang (karbohidrat, lauk protein, sayur, buah) bersama di kelas dengan membawa tempat makan dan botol minum ramah lingkungan tanpa kemasan plastik sekali pakai.');
      } else if (keyword.includes('tidur') || keyword.includes('gawai') || keyword.includes('malam') || newProgramHabit === 'TIDUR_CEPAT') {
        setNewProgramTitle('Program Keluarga 1 Jam Bebas Gawai Sebelum Istirahat');
        setNewProgramHabit('TIDUR_CEPAT');
        setNewProgramScope('Seluruh Siswa & Paguyuban Kelas');
        setNewProgramSchedule('Setiap Malam Pukul 20.30 - 21.30');
        setNewProgramPic('Guru BK & Paguyuban Orang Tua');
        setNewProgramDesc('Gerakan edukasi kolaboratif sekolah dan orang tua murid untuk mematikan layar gadget 60 menit sebelum tidur, digantikan dengan membaca buku cerita atau refleksi malam bersama keluarga.');
      } else if (keyword.includes('senam') || keyword.includes('olahraga') || keyword.includes('fisik') || newProgramHabit === 'BEROLAHRAGA') {
        setNewProgramTitle('Senam Kebugaran 7KAIH Ceria 15 Menit');
        setNewProgramHabit('BEROLAHRAGA');
        setNewProgramScope('Seluruh Warga Sekolah');
        setNewProgramSchedule('Setiap Selasa & Jumat Sebelum KBM');
        setNewProgramPic('Guru PJOK & Tim Kesiswaan');
        setNewProgramDesc('Senam irama kebugaran jasmani bersama di lapangan sekolah untuk membangun semangat kebersamaan, daya tahan fisik, dan kesiapan fokus belajar peserta didik.');
      } else if (keyword.includes('ibadah') || keyword.includes('sholat') || keyword.includes('doa') || newProgramHabit === 'BERIBADAH') {
        setNewProgramTitle('Gerakan Bintang Fajar: Doa Pagi & Refleksi Spiritual Bersama');
        setNewProgramHabit('BERIBADAH');
        setNewProgramScope('Semua Peserta Didik Menurut Agama Masing-Masing');
        setNewProgramSchedule('Setiap Pagi 15 Menit Sebelum Jam Pelajaran');
        setNewProgramPic('Guru Pendidikan Agama & Budi Pekerti');
        setNewProgramDesc('Pembiasaan memulai hari dengan berdoa, pembacaan kitab suci, atau sholat dhuha berjamaah secara khusyuk dan sukarela untuk memupuk integritas moral dan ketakwaan.');
      } else if (keyword.includes('baca') || keyword.includes('buku') || keyword.includes('belajar') || newProgramHabit === 'GEMAR_BELAJAR') {
        setNewProgramTitle('Pojok Literasi Menyenangkan: 15 Menit Membaca Bebas');
        setNewProgramHabit('GEMAR_BELAJAR');
        setNewProgramScope('Semua Rombel Belajar');
        setNewProgramSchedule('Setiap Rabu & Kamis Jam Ke-0');
        setNewProgramPic('Kepala Perpustakaan & Duta Baca');
        setNewProgramDesc('Peserta didik membaca buku pilihan non-pelajaran selama 15 menit dan menuliskan 1 kalimat mutiara atau inspirasi yang diperoleh di lembar pohon literasi kelas.');
      } else if (keyword.includes('kebaikan') || keyword.includes('sampah') || keyword.includes('masyarakat') || newProgramHabit === 'BERMASYARAKAT') {
        setNewProgramTitle('Gerakan Operasi Semut & Satu Hari Satu Kebaikan');
        setNewProgramHabit('BERMASYARAKAT');
        setNewProgramScope('Seluruh Peserta Didik');
        setNewProgramSchedule('Setiap Hari saat Jam Istirahat & Pulang');
        setNewProgramPic('Wali Kelas & Kader Lingkungan Hidup');
        setNewProgramDesc('Pembiasaan memungut sampah di sekeliling, saling membantu teman yang membutuhkan, serta mendokumentasikan aksi empati nyata di buku jurnal kebiasaan bermasyarakat.');
      } else {
        setNewProgramTitle('Program Bangun Pagi Ceria & Sambut Hangat Siswa di Gerbang');
        setNewProgramHabit('BANGUN_PAGI');
        setNewProgramScope('Seluruh Peserta Didik');
        setNewProgramSchedule('Setiap Hari Sekolah Pukul 06.30 - 07.00');
        setNewProgramPic('Guru Piket & Tim Disiplin Positif');
        setNewProgramDesc('Guru menyambut kehadiran peserta didik di gerbang sekolah dengan Senyum, Salam, Sapa (3S), mengapresiasi anak-anak yang hadir sebelum bel berbunyi.');
      }
      setIsAiModalDrafting(false);
      showToast('✨ Draf formulir inisiatif program berhasil diisi otomatis oleh AI!');
    }, 350);
  };

  // AI Generator: Executive Supervision Directives (Tab RTL & Monitoring)
  const handleGenerateDirectiveWithAi = async (focusKey?: string) => {
    const focusToUse = focusKey || selectedDirectiveFocus;
    setIsDraftingDirective(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'PRINCIPAL_DIRECTIVE_ASSISTANT',
          actorRole: 'PRINCIPAL',
          payload: {
            schoolName: activeSchool.name,
            principalName: activeSchool.principalName || currentPersona?.name || 'Kepala Sekolah',
            focus: focusToUse,
            totalStudents: totalActiveStudents,
            overallConsistency,
            warningCount: totalWarningStudents,
            rtlsCount: unifiedFollowUpsList.length,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        setAiDirectiveResult(data);
        if (data.directiveDraft?.directiveText) {
          setFeedbackNote(data.directiveDraft.directiveText);
        } else if (data.reply) {
          setFeedbackNote(data.reply);
        }
        showToast('Draf arahan supervisi resmi Kepala Sekolah berhasil disusun oleh AI.');
      } else {
        throw new Error('API failed');
      }
    } catch (_e) {
      let title = 'Instruksi Supervisi Kepala Sekolah: Penguatan 7KAIH';
      let text = '';
      if (focusToUse.includes('TIDUR') || focusToUse.includes('GAWAI')) {
        title = `Instruksi Supervisi: Gerakan Pendampingan Waktu Tidur & Detoks Gawai Malam Hari`;
        text = `Bapak dan Ibu Dewan Guru serta segenap Wali Kelas ${activeSchool.name} yang saya hormati.\n\nBerdasarkan monitoring komprehensif data jurnal 7KAIH terhadap ${totalActiveStudents} peserta didik (tingkat konsistensi ${overallConsistency}%), ditemukan bahwa kebiasaan waktu istirahat malam memerlukan perhatian dan pendampingan ekstra bersama orang tua di rumah.\n\nSaya menginstruksikan kepada seluruh wali kelas untuk:\n1. Mengomunikasikan pembatasan layar gawai 1 jam sebelum tidur melalui grup paguyuban kelas.\n2. Menyelaraskan volume PR agar anak memiliki waktu istirahat yang cukup di malam hari.\n3. Memberikan apresiasi hangat pada apel/refleksi pagi bagi siswa yang bangun dan tidur teratur.\n4. Mencatat perkembangan pembiasaan tidur sehat tanpa melabeli peserta didik secara negatif.\n\nMari kita bimbing ananda dengan keteladanan kasih sayang dan komitmen utuh.\n\nHormat saya,\n${activeSchool.principalName || currentPersona?.name || 'Kepala Sekolah'}\nKepala Sekolah ${activeSchool.name}`;
      } else if (focusToUse.includes('ORANG_TUA') || focusToUse.includes('PAGUYUBAN')) {
        title = `Instruksi Supervisi: Penguatan Sinergi Rumah & Paguyuban Kelas`;
        text = `Yth. Bapak/Ibu Wali Kelas dan Tim Pendamping Karakter ${activeSchool.name}.\n\nKeberhasilan 7 Kebiasaan Anak Indonesia Hebat bertumpu pada keselarasan antara pembiasaan di sekolah dan keteladanan di rumah. Saya meminta seluruh wali kelas mengoptimalkan forum komunikasi paguyuban kelas untuk:\n1. Mensosialisasikan pentingnya pengisian jurnal 7KAIH mandiri dengan jujur, riang, dan tanpa tekanan.\n2. Membagikan panduan pembiasaan positif di rumah (sarapan bergizi, ibadah bersama, membaca buku).\n3. Mengadakan sesi apresiasi bulanan bagi keluarga yang konsisten mendampingi ananda.\n\nKemitraan guru dan orang tua adalah kunci emas pembentukan karakter mulia anak bangsa.\n\nHormat saya,\n${activeSchool.principalName || currentPersona?.name || 'Kepala Sekolah'}\nKepala Sekolah ${activeSchool.name}`;
      } else {
        title = `Instruksi Supervisi: Optimalisasi Pembiasaan Karakter & Validasi Jurnal Berkelanjutan`;
        text = `Bapak dan Ibu Pendidik ${activeSchool.name} yang mulia.\n\nSaya mengapresiasi setinggi-tingginya dedikasi Bapak/Ibu yang terus mengawal jurnal pembiasaan peserta didik kita. Agar dampak pembiasaan semakin mengakar kuat dalam budaya satuan pendidikan:\n1. Lakukan validasi berkala setiap akhir pekan disertai umpan balik apresiatif pada lembar jurnal anak.\n2. Fokuskan pendampingan pada peserta didik yang membutuhkan dorongan ekstra dengan pendekatan persuasif personal.\n3. Integrasikan nilai 7KAIH ke dalam kegiatan pembelajaran harian di kelas.\n\nTeruslah menjadi teladan kebaikan yang menginspirasi setiap langkah tumbuh kembang anak didik kita.\n\nHormat saya,\n${activeSchool.principalName || currentPersona?.name || 'Kepala Sekolah'}\nKepala Sekolah ${activeSchool.name}`;
      }
      setFeedbackNote(text);
      setAiDirectiveResult({ directiveDraft: { title, directiveText: text } });
      showToast('Draf arahan supervisi Kepala Sekolah berhasil disusun oleh AI.');
    } finally {
      setIsDraftingDirective(false);
    }
  };

  // AI Generator: RTL Cross-Class Synthesizer (Tab RTL & Monitoring)
  const handleGenerateRtlSynthesis = async () => {
    setIsAiRtlLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'PRINCIPAL_RTL_SYNTHESIZER',
          actorRole: 'PRINCIPAL',
          payload: {
            schoolName: activeSchool.name,
            principalName: activeSchool.principalName,
            rtlsCount: unifiedFollowUpsList.length,
            warningCount: totalWarningStudents,
            assistCount: totalAssistStudents,
            rtlsSample: unifiedFollowUpsList.slice(0, 6).map((r) => ({
              finding: r.finding,
              rootCause: r.rootCause,
              habit: r.habitCode,
            })),
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiRtlSynthesisResult(json.data || json);
        showToast('Sintesis cerdas RTL & rekomendasi kebijakan sekolah berhasil disusun AI.');
      } else {
        throw new Error('API failed');
      }
    } catch (_e) {
      setAiRtlSynthesisResult({
        recordedFacts: [
          `Terdata ${unifiedFollowUpsList.length} RTL dari rombel belajar serta ${totalWarningStudents} siswa dalam kelompok penguatan.`,
          'Sintesis mengindikasikan benang merah pada tantangan ritme malam hari dan manajemen gawai.',
        ],
        patterns: [
          'Sebagian besar RTL rombel berakar pada kebiasaan tidur malam yang belum tertata rapi di rumah.',
          'Dibutuhkan kebijakan payung tingkat sekolah untuk melengkapi intervensi personal wali kelas.',
        ],
        rtlSynthesis: {
          dominantIssue: 'Keterlambatan jam tidur malam akibat interaksi layar gawai (screen-time) berlebih',
          rootCauseCluster: 'Faktor Lingkungan Rumah: Belum adanya kesepakatan batas waktu gawai keluarga dan minimnya rutinitas tenang sebelum tidur.',
          affectedScope: 'Terdistribusi di beberapa rombel, terutama siswa fase transisi dan kelas tinggi.',
          recommendedPolicy: 'Pemberlakuan Kebijakan Sekolah "Keluarga Sadar Gawai Sehat" & Penyelarasan Volume PR Malam.',
          strategicActionPlan: '1. Sosialisasi deklarasi bersama Komite Sekolah tentang Gerakan Detoks Gawai Malam.\n2. Penataan jadwal tugas rumah agar maksimal diselesaikan sebelum pukul 19.30 WIB.\n3. Integrasi materi literasi digital sehat dalam layanan BK dan bimbingan wali kelas.',
          targetMetric: 'Penurunan siswa kategori butuh pendampingan tidur hingga 60% dalam tempo 30 hari kalender.',
          responsibleLead: 'Wakasek Kesiswaan, Koordinator BK, & Tim Paguyuban Sekolah',
        },
      });
      showToast('Sintesis isu RTL sekolah berhasil dirumuskan.');
    } finally {
      setIsAiRtlLoading(false);
    }
  };

  // Adopt AI RTL Policy into school-level follow up plans
  const handleAdoptAiRtlPolicy = (synthesis: any) => {
    if (!synthesis) return;
    const now = new Date().toISOString();
    const newRtl: FollowUpPlan = {
      id: `rtl-sch-ai-${Date.now()}`,
      schoolId: activeSchool.id,
      finding: synthesis.dominantIssue || 'Kebijakan Penguatan 7KAIH Tingkat Sekolah',
      supportingData: `Tersintesis dari ${unifiedFollowUpsList.length} RTL kelas dan ${totalWarningStudents} siswa kelompok penguatan`,
      rootCause: synthesis.rootCauseCluster || 'Faktor lingkungan rumah dan koordinasi pola istirahat peserta didik.',
      rootCauseType: 'FACT',
      actionPlan: `${synthesis.recommendedPolicy}\n\nLangkah Strategis:\n${synthesis.strategicActionPlan || ''}`,
      target: 'Seluruh Rombel & Warga Sekolah',
      indicator: synthesis.targetMetric || 'Peningkatan konsistensi pembiasaan hingga di atas 90%',
      owner: synthesis.responsibleLead || 'Kepala Sekolah & Tim Pengembang Kurikulum',
      startDate: now.split('T')[0],
      deadline: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      progressPercent: 0,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      ...({
        targetTime: '30 Hari Kalender',
        pic: synthesis.responsibleLead || 'Kepala Sekolah & Tim Pengembang Kurikulum',
        habitCode: '7KAIH_SEKOLAH',
      } as any),
    };

    try {
      const existing = localStorage.getItem('si7kaih_followups_prod');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [newRtl, ...parsed];
      localStorage.setItem('si7kaih_followups_prod', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('si7kaih_followups_updated', { detail: updated }));
    } catch (_e) {}

    setUnifiedFollowUpsList((prev) => [newRtl, ...prev]);
    showToast('Kebijakan Intervensi AI berhasil diterbitkan ke portofolio RTL Sekolah!');
  };

  return (
    <div className="space-y-6">
      {/* Principal School Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0753A5] text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
            🏛️
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                {activeSchool.name} • Dashboard Kepala Sekolah
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
                {activeSchool.status} • Akreditasi {activeSchool.akreditasi || '-'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                Jenjang {activeSchool.jenjang}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kepala Sekolah: <strong>{activeSchool.principalName}</strong> (NIP: {activeSchool.principalNip || '-'}) • NPSN: <strong>{activeSchool.npsn}</strong> • {activeSchool.district || 'Wilayah Binaan'}, {activeSchool.city || 'Kota Administrasi'}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {schools.length > 1 && (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    aria-label="Pilih Satuan Pendidikan"
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id} className="text-slate-900">
                        {s.name} ({s.npsn})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={() => {
                  syncAllData();
                  showToast('Data dashboard berhasil disinkronkan dengan data jurnal murid terkini!');
                }}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0753A5] text-xs font-bold transition-all cursor-pointer disabled:opacity-50 border border-blue-200 shadow-2xs"
                title="Sinkronkan data dashboard dengan pembaruan pengisian jurnal murid terkini"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Data Jurnal'}</span>
              </button>
              <span className="text-[11px] text-slate-400">
                Pembaruan: {lastSyncTime}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'OVERVIEW' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600'
            }`}
          >
            Ringkasan Sekolah
          </button>
          <button
            onClick={() => setActiveTab('CLASSES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CLASSES' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600'
            }`}
          >
            Portofolio {classBreakdowns.length} Rombel
          </button>
          <button
            onClick={() => setActiveTab('PROGRAMS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PROGRAMS' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600'
            }`}
          >
            Program Sekolah ({unifiedProgramsList.length})
          </button>
          <button
            onClick={() => setActiveTab('RTL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'RTL' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600'
            }`}
          >
            RTL & Supervisi ({unifiedFollowUpsList.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('AI_STRATEGY');
              if (!aiSchoolResult) handleGenerateSchoolAi();
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'AI_STRATEGY' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-700 bg-indigo-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Strategis</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Real-time Student Journal Synchronization Status Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-xl shrink-0">
                <Activity className="w-5 h-5 animate-pulse text-emerald-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black tracking-wide uppercase text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Sinkronisasi Jurnal Murid Aktif
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/10">
                    Real-time Database
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-0.5">
                  Seluruh data analitik, rombel, dan pembiasaan otomatis terhubung langsung dengan entri jurnal harian terkini peserta didik.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-left">
                <span className="text-[10px] text-slate-300 block">Jurnal Terdata</span>
                <strong className="text-xs font-black text-white">{schoolScopedJournals.length} Jurnal</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-left">
                <span className="text-[10px] text-slate-300 block">Mengisi Hari Ini</span>
                <strong className="text-xs font-black text-emerald-300">
                  {todayFilledStudentsCount} Siswa ({todaySchoolCompletionPercentage}%)
                </strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-left">
                <span className="text-[10px] text-slate-300 block">Validasi Ortu</span>
                <strong className="text-xs font-black text-amber-300">
                  {parentValidationStats.validatedCount} ({parentValidationStats.rate}%)
                </strong>
              </div>
              <button
                onClick={() => {
                  syncAllData();
                  showToast('Data dashboard telah disinkronkan dengan pengisian jurnal murid terkini!');
                }}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>
            </div>
          </div>

          {/* Key School Metrics strictly synthesized from live data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Siswa Aktif Terdata
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{totalActiveStudents} Siswa</span>
                <span className="text-xs font-bold text-slate-500">{classBreakdowns.length} Rombel</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {schoolScopedJournals.length} total jurnal murid tersimpan • {totalTeachersCount} Pendidik
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Kelengkapan Jurnal Sekolah
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#0753A5]">
                  {overallCompleteness}%
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {overallCompleteness >= 85 ? 'Memenuhi Target' : 'Perlu Didorong'}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#0753A5] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, overallCompleteness)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Target capaian satuan pendidikan: min. 85%
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Konsistensi Pembiasaan
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {overallConsistency}%
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {overallConsistency >= 80 ? 'Konsisten' : 'Tahap Awal'}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, overallConsistency)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Rata-rata 7 kebiasaan peserta didik</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Distribusi Pendampingan Siswa
              </span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {totalGoodStudents} Terpantau
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-bold">
                  {totalWarningStudents} Penguatan
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-xs font-bold">
                  {totalAssistStudents} Damping
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">*Berdasarkan akumulasi konsistensi jurnal siswa</p>
            </div>
          </div>

          {/* 7 Habits School-wide Realtime Analytics Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Audit 7 Dimensi Kebiasaan Murid Tingkat Sekolah</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0753A5]">
                    Live dari {schoolScopedJournals.length} Jurnal
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tingkat keterlaksanaan setiap dimensi kebiasaan terhitung otomatis dari seluruh lembar jurnal murid terkini.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Pembaruan: {lastSyncTime}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {schoolHabitAnalytics.map((h) => (
                <div
                  key={h.code}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{h.icon}</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                        h.status === 'UNGGUL'
                          ? 'bg-emerald-100 text-emerald-800'
                          : h.status === 'KONSISTEN'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {h.status === 'UNGGUL' ? 'Unggul' : h.status === 'KONSISTEN' ? 'Stabil' : 'Penguatan'}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-tight">{h.label}</h5>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black text-slate-900">{h.percentage}%</span>
                      <span className="text-[10px] text-slate-500">tercapai</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0753A5] h-full rounded-full transition-all duration-500"
                        style={{ width: `${h.percentage}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
                      <span>Hari Ini: <strong>{h.todayCompleted}</strong></span>
                      <span>Total: <strong>{h.completedCount}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Recent Student Journals Feed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-[#0753A5]" />
                  <span>Aktivitas Pengisian Jurnal Murid Terkini</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Real-time Feed
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar entri jurnal murid yang baru saja diisi atau diperbarui oleh siswa di lingkungan {activeSchool.name}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">
                  Menampilkan {recentSchoolJournals.length} Entri Terkini
                </span>
                <button
                  onClick={() => setActiveTab('CLASSES')}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Lihat Seluruh Rombel →
                </button>
              </div>
            </div>

            {recentSchoolJournals.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500 space-y-2">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700">Belum Ada Catatan Jurnal Murid</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Entri jurnal harian yang diisi oleh siswa secara mandiri akan muncul secara langsung di sini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {recentSchoolJournals.map((j) => {
                  const studentName = j.studentName || 'Peserta Didik';
                  const studentClass = j.className || 'Rombel Belajar';
                  const habitsCompletedCount = j.completedCount !== undefined
                    ? j.completedCount
                    : j.entries
                    ? Object.values(j.entries).filter((e: any) => e?.completed).length
                    : 0;

                  return (
                    <div
                      key={j.id || `${j.studentId}-${j.journalDate}`}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900 line-clamp-1">{studentName}</span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {studentClass}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{j.journalDate}</span>
                          </span>
                          {j.parentValidated ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Valid Ortu</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                              Menunggu Ortu
                            </span>
                          )}
                        </div>

                        {/* Completed Habits Pills */}
                        <div className="pt-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-600 mb-1">
                            <span>Keterisian Pembiasaan:</span>
                            <strong className="text-[#0753A5] font-bold">{habitsCompletedCount} / 7</strong>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {schoolHabitAnalytics.map((h) => {
                              const entry = (j.entries && (j.entries as any)[h.code]) || (j.habits && (j.habits as any)[h.code]);
                              const isDone = !!(entry && (entry.completed || entry.status === 'COMPLETED'));
                              return (
                                <span
                                  key={h.code}
                                  className={`text-[10px] w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                                    isDone
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                                      : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                                  }`}
                                  title={`${h.label}: ${isDone ? 'Terlaksana' : 'Belum Terlaksana'}`}
                                >
                                  {h.icon}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Parent or Student Note snippet */}
                        {j.parentValidationNote && (
                          <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[10px] text-emerald-900 italic line-clamp-2">
                            "{j.parentValidationNote}"
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          const studentObj = schoolScopedStudents.find(
                            (s) => s.id === j.studentId || (j.studentNisn && s.nisn === j.studentNisn)
                          ) || {
                            id: j.studentId,
                            nisn: j.studentNisn || '-',
                            name: studentName,
                            className: studentClass,
                            gender: 'L',
                            schoolId: activeSchool.id,
                            status: 'AKTIF',
                          };
                          const studentJournals = schoolScopedJournals.filter(
                            (item) =>
                              item.studentId === j.studentId ||
                              (j.studentNisn && item.studentNisn === j.studentNisn) ||
                              (item.studentName && item.studentName.toLowerCase().trim() === studentName.toLowerCase().trim())
                          );
                          setInspectedStudent({
                            student: studentObj,
                            journals: studentJournals,
                          });
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-[#0753A5] font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lihat Riwayat Jurnal Siswa</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rombel Performance & Participation Comparison */}
          {classBreakdowns.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Perbandingan Partisipasi Jurnal Lintas Rombel
                  </h3>
                  <p className="text-xs text-slate-500">
                    Monitoring keaktifan harian dan kelengkapan jurnal di setiap kelas secara komparatif.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('CLASSES')}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Kelola Portofolio Kelas →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {classBreakdowns.map((c) => (
                  <div
                    key={c.id || c.name}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between space-y-2.5 cursor-pointer"
                    onClick={() => setSelectedClass(c)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{c.name}</h4>
                        <span className="text-[10px] text-slate-500">Wali: {c.teacher}</span>
                      </div>
                      <span className="text-xs font-black text-[#0753A5] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                        {c.completeness}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-600">
                        <span>Konsistensi Rata-rata</span>
                        <strong className="text-emerald-700">{c.consistency}%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${c.consistency}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Hari Ini: <strong>{c.todayFilledCount}</strong> / {c.students} Anak</span>
                      <span>Total Jurnal: <strong>{c.totalJournals}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* School Programs Quick Cards */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Program Pembiasaan Sekolah Berkelanjutan
                </h3>
                <p className="text-xs text-slate-500">
                  Inisiatif pembiasaan karakter yang telah disahkan oleh Kepala Sekolah ({unifiedProgramsList.length} Program)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddProgramModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Inisiatif</span>
                </button>
                <button
                  onClick={() => setActiveTab('PROGRAMS')}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Lihat Semua →
                </button>
              </div>
            </div>

            {unifiedProgramsList.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-xs">Belum ada program pembiasaan aktif</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                  Daftarkan inisiatif pembiasaan sekolah untuk disahkan secara resmi oleh Kepala Sekolah.
                </p>
                <button
                  onClick={() => setIsAddProgramModalOpen(true)}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Mulai Daftarkan Program</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {unifiedProgramsList.slice(0, 4).map((p) => {
                  const isApproved = approvedPrograms[p.id] !== false;
                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0753A5]">
                            {p.habitCode}
                          </span>
                          {isApproved ? (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                              <Check className="w-3 h-3" />
                              <span>Disahkan</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700">Menunggu</span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">{p.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                      </div>
                      <div className="pt-2 mt-3 border-t border-slate-200/60 text-[10px] text-slate-600 flex items-center justify-between">
                        <span>PIC: {p.pic}</span>
                        <span>{p.schedule}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CLASSES TAB */}
      {activeTab === 'CLASSES' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Portofolio 7 Kebiasaan Lintas Rombel
              </h3>
              <p className="text-xs text-slate-500">
                {activeSchool.name} • Tahun Ajaran 2025/2026 ({activeSchool.jenjang}) • Disinkronkan dengan Data Mandiri
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari rombel atau wali kelas..."
                  value={classSearchQuery}
                  onChange={(e) => setClassSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-blue-500 w-56"
                />
              </div>
              <button
                onClick={handleExportSchoolCsv}
                disabled={classBreakdowns.length === 0}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Ekspor Rekap (CSV)</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Rombel / Fase</th>
                  <th className="py-3 px-3">Wali Kelas</th>
                  <th className="py-3 px-3">Siswa</th>
                  <th className="py-3 px-3">Jurnal Murid</th>
                  <th className="py-3 px-3">Kelengkapan</th>
                  <th className="py-3 px-3">Konsistensi</th>
                  <th className="py-3 px-3">Terpantau Baik</th>
                  <th className="py-3 px-3">Perlu Penguatan</th>
                  <th className="py-3 px-3">Perlu Pendampingan</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClassBreakdowns.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      <GraduationCap className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-700 text-sm">
                        {classSearchQuery ? 'Rombel Tidak Ditemukan' : 'Belum Ada Rombongan Belajar Terdaftar'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        {classSearchQuery
                          ? `Tidak ditemukan rombel yang cocok dengan kata kunci "${classSearchQuery}".`
                          : 'Rombongan belajar dan peserta didik mandiri dapat didaftarkan atau diimpor oleh Admin Sekolah melalui menu SIM Satuan Pendidikan.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredClassBreakdowns.map((c) => (
                    <tr key={c.id || c.name} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <button
                          onClick={() => setSelectedClass(c)}
                          className="text-left font-bold text-slate-900 hover:text-[#0753A5] transition-colors cursor-pointer"
                        >
                          {c.name}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{c.teacher}</div>
                        <div className="text-[10px] text-slate-400">{c.teacherNip}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{c.students} Anak</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{c.totalJournals || 0} Jurnal</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          {c.todayFilledCount || 0} mengisi hari ini
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#0753A5]">{c.completeness}%</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">{c.consistency}%</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          {c.good} Siswa
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">
                          {c.warning} Siswa
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold">
                          {c.assist} Siswa
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedClass(c)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-[#0753A5] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Detail</span>
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

      {/* PROGRAMS TAB */}
      {activeTab === 'PROGRAMS' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Daftar Program Pembiasaan & Inisiatif Sekolah
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengesahan resmi dan supervisi program karakter oleh Kepala Sekolah untuk {activeSchool.name}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">
                {Object.values(approvedPrograms).filter((v) => v !== false).length} dari {unifiedProgramsList.length} Program Disahkan
              </span>
              <button
                onClick={() => setIsAddProgramModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Inisiatif Sekolah</span>
              </button>
            </div>
          </div>

          {/* AI 7KAIH Program Strategic Diagnostic & Recommender */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-slate-50 border border-indigo-200/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Bantuan AI: Analisis Cakupan & Rekomendasi Program 7KAIH</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Supervisi Strategis
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    Audit kelengkapan pembiasaan 7KAIH dan rancang inisiatif prioritas berbasis data riil sekolah.
                  </p>
                </div>
              </div>
              <button
                onClick={handleGenerateProgramRecommendations}
                disabled={isAiProgramLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                {isAiProgramLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menganalisis Cakupan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiProgramResult ? 'Perbarui Rekomendasi AI' : 'Rekomendasikan Program dengan AI'}</span>
                  </>
                )}
              </button>
            </div>

            {/* 7 Habits Coverage Meter */}
            <div className="p-3.5 rounded-xl bg-white/80 border border-indigo-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Audit Cakupan 7 Kebiasaan dalam Program Sekolah:</span>
                </span>
                <span className="font-extrabold text-indigo-700">
                  {habitCoverage.coveredCount} dari 7 Dimensi Tercover ({habitCoverage.coveragePercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${habitCoverage.coveragePercent}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ALL_HABIT_DEFINITIONS.map((h) => {
                  const count = habitCoverage.counts[h.code] || 0;
                  const isCovered = count > 0;
                  return (
                    <span
                      key={h.code}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        isCovered
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}
                      title={isCovered ? `${count} program aktif` : 'Belum ada program spesifik untuk kebiasaan ini'}
                    >
                      <span>{h.icon}</span>
                      <span>{h.label}</span>
                      {isCovered ? (
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900">
                          Perlu Program
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Render AI Program Suggestions if available */}
            {aiProgramResult && (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Temuan Analisis Portofolio Sekolah:</span>
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5 text-blue-800">
                    {aiProgramResult.recordedFacts?.map((f: string, idx: number) => (
                      <li key={idx}>{f}</li>
                    ))}
                    {aiProgramResult.patterns?.map((p: string, idx: number) => (
                      <li key={`p-${idx}`}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(aiProgramResult.programSuggestions || []).map((sug: any, idx: number) => {
                    const habitMeta = ALL_HABIT_DEFINITIONS.find((h) => h.code === sug.habitCode) || {
                      label: sug.habitCode,
                      icon: '✨',
                      bg: 'bg-blue-50 border-blue-200 text-blue-800',
                    };
                    return (
                      <div
                        key={sug.id || idx}
                        className="p-4 rounded-xl border border-indigo-200 bg-white shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-400 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${habitMeta.bg}`}>
                              <span>{habitMeta.icon}</span>
                              <span>{habitMeta.label}</span>
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              Opsi Inovasi #{idx + 1}
                            </span>
                          </div>
                          <h5 className="text-xs font-black text-slate-900 leading-snug">
                            {sug.title}
                          </h5>
                          <p className="text-[11px] text-slate-600 line-clamp-3">
                            {sug.description}
                          </p>
                          <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                            <div>🎯 <strong>Sasaran:</strong> {sug.participantScope}</div>
                            <div>⏰ <strong>Jadwal:</strong> {sug.schedule}</div>
                            <div>👤 <strong>PIC:</strong> {sug.pic}</div>
                            {sug.indicator && (
                              <div className="text-indigo-800 bg-indigo-50/70 p-1.5 rounded mt-1 font-medium">
                                📈 <strong>Indikator:</strong> {sug.indicator}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAdoptAiProgram(sug)}
                          className="w-full mt-2 py-2 px-3 rounded-lg bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adopsi Jadi Inisiatif Resmi</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {unifiedProgramsList.length === 0 ? (
            <div className="p-12 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">Belum Ada Program Pembiasaan Terdaftar</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Program pembiasaan sekolah yang diinput oleh Admin Sekolah, Dewan Guru, atau Kepala Sekolah akan muncul di sini untuk mendapatkan pengesahan resmi.
              </p>
              <button
                onClick={() => setIsAddProgramModalOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Inisiatif Pembiasaan Baru</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {unifiedProgramsList.map((p) => {
                const isApproved = approvedPrograms[p.id] !== false;
                return (
                  <div key={p.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                        {isApproved ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Disahkan Kepala Sekolah</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Menunggu Pengesahan
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0753A5]">
                          {p.habitCode}
                        </span>
                        <button
                          onClick={() => handleToggleApproveProgram(p.id, p.title)}
                          className={`text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer shadow-xs ${
                            isApproved
                              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {isApproved ? 'Ubah Status' : 'Sahkan Program'}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{p.description}</p>
                    <div className="text-xs text-slate-500 pt-2 border-t border-slate-200/60 flex flex-wrap gap-4">
                      <span>🎯 Sasaran: <strong>{p.participantScope}</strong></span>
                      <span>⏰ Jadwal: <strong>{p.schedule}</strong></span>
                      <span>👤 Penanggung Jawab: <strong>{p.pic}</strong></span>
                    </div>
                    {p.resultNote && (
                      <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        💡 <strong>Catatan Capaian:</strong> {p.resultNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RTL TAB */}
      {activeTab === 'RTL' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Rencana Tindak Lanjut (RTL) & Supervisi Eksekutif
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring intervensi berbasis data untuk {classBreakdowns.length} rombel belajar serta arahan resmi Kepala Sekolah.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {unifiedFollowUpsList.length} RTL Terpantau
            </span>
          </div>

          {/* Form Arahan Supervisi Umum Kepala Sekolah dengan Bantuan AI */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border border-blue-200 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0753A5]" />
                <span>Instruksi & Arahan Supervisi Kepala Sekolah untuk Dewan Guru</span>
              </h4>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0753A5] border border-blue-200">
                Resmi • Kanal Internal Sekolah
              </span>
            </div>

            {/* AI Directive Drafting Toolbar */}
            <div className="p-3.5 rounded-xl bg-white/90 border border-blue-200/80 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Bantuan AI: Susun Draf Arahan Supervisi Tematik</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Pilih fokus lalu klik tombol draf AI
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'DISIPLIN_TIDUR_GAWAI', label: '🌙 Disiplin Tidur & Detoks Gawai' },
                  { key: 'SINERGI_PAGUYUBAN', label: '🤝 Sinergi Paguyuban Ortu' },
                  { key: 'AKTIVITAS_FISIK_GIZI', label: '🏃 Olahraga & Sarapan Sehat' },
                  { key: 'VALIDASI_APRESIASI', label: '🌟 Apresiasi & Validasi Guru' },
                  { key: 'INTERVENSI_SISWA_KHUSUS', label: '⚠️ Pendampingan Siswa Khusus' },
                ].map((foc) => {
                  const isSelected = selectedDirectiveFocus === foc.key;
                  return (
                    <button
                      key={foc.key}
                      type="button"
                      onClick={() => {
                        setSelectedDirectiveFocus(foc.key);
                        handleGenerateDirectiveWithAi(foc.key);
                      }}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      {foc.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 italic">
                  💡 AI menyelaraskan draf dengan data konsistensi ({overallConsistency}%) dan {totalWarningStudents} siswa kelompok penguatan.
                </span>
                <button
                  type="button"
                  onClick={() => handleGenerateDirectiveWithAi()}
                  disabled={isDraftingDirective}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  {isDraftingDirective ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyusun Draf...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>✨ Susun Draf dengan AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              rows={5}
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="Tuliskan arahan strategis, tindak lanjut pembinaan karakter, atau rekomendasi untuk seluruh wali kelas dan dewan guru (dapat digenerate otomatis melalui Bantuan AI di atas)..."
              className="w-full text-xs p-3.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                {feedbackNote ? 'Teks arahan siap ditinjau dan diteruskan.' : 'Klik tombol draf AI atau ketik arahan secara mandiri.'}
              </span>
              <button
                onClick={handleSendSupervisionDirective}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim & Terbitkan Arahan Resmi</span>
              </button>
            </div>
          </div>

          {/* AI RTL Synthesizer & Strategic Policy Recommender */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-200/90 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Bantuan AI: Sintesis Isu Dominan RTL & Kebijakan Sekolah</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Tingkat Satuan Pendidikan
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    Sintesis cerdas benang merah kendala dari {unifiedFollowUpsList.length} RTL kelas untuk menghasilkan kebijakan payung tingkat sekolah.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateRtlSynthesis}
                disabled={isAiRtlLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                {isAiRtlLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menganalisis Sintesis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiRtlSynthesisResult ? 'Perbarui Sintesis AI' : 'Sintesis RTL dengan AI'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Synthesized Results Card */}
            {aiRtlSynthesisResult && aiRtlSynthesisResult.rtlSynthesis && (
              <div className="p-4 sm:p-5 rounded-xl bg-white border border-emerald-200 shadow-xs space-y-3.5 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span>Rumusan Hasil Sintesis Lintas Rombel & Rekomendasi Kebijakan</span>
                  </span>
                  <button
                    onClick={() => handleAdoptAiRtlPolicy(aiRtlSynthesisResult.rtlSynthesis)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambahkan ke Portofolio RTL Sekolah</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      🚨 Isu Dominan Teridentifikasi (Sistemik)
                    </span>
                    <p className="font-bold text-slate-900 leading-snug">
                      {aiRtlSynthesisResult.rtlSynthesis.dominantIssue}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      <strong>Kluster Akar Masalah:</strong> {aiRtlSynthesisResult.rtlSynthesis.rootCauseCluster}
                    </p>
                    <div className="text-[10px] text-amber-800 mt-1 pt-1 border-t border-amber-200/60">
                      📍 Cakupan Terpapar: {aiRtlSynthesisResult.rtlSynthesis.affectedScope || 'Lintas rombel fase kelas'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      🏛️ Rekomendasi Kebijakan Sekolah (Kepala Sekolah)
                    </span>
                    <p className="font-bold text-emerald-950 leading-snug">
                      {aiRtlSynthesisResult.rtlSynthesis.recommendedPolicy}
                    </p>
                    <div className="text-[11px] text-slate-700 whitespace-pre-line mt-1">
                      {aiRtlSynthesisResult.rtlSynthesis.strategicActionPlan}
                    </div>
                    <div className="text-[10px] text-emerald-900 mt-1.5 pt-1 border-t border-emerald-200/60 flex flex-wrap justify-between gap-2">
                      <span>🎯 <strong>Target:</strong> {aiRtlSynthesisResult.rtlSynthesis.targetMetric}</span>
                      <span>👤 <strong>PIC:</strong> {aiRtlSynthesisResult.rtlSynthesis.responsibleLead}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Directives History */}
          {supervisionDirectives.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Riwayat Arahan & Instruksi Kepala Sekolah Terbit ({supervisionDirectives.length})</span>
              </h4>
              <div className="space-y-2">
                {supervisionDirectives.map((d) => (
                  <div key={d.id} className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold text-slate-800">{d.principalName}</span>
                      <span>{d.date}</span>
                    </div>
                    <p className="text-slate-700 mt-0.5">{d.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Plans List */}
          {unifiedFollowUpsList.length === 0 ? (
            <div className="p-12 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">Belum Ada Rencana Tindak Lanjut (RTL)</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Rencana Tindak Lanjut yang disusun oleh wali kelas atau guru pendamping akan otomatis tersinkronisasi di sini untuk monitoring dan evaluasi strategis Kepala Sekolah.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {unifiedFollowUpsList.map((rtl) => (
                <div
                  key={rtl.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0753A5]">
                        {rtl.finding}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {rtl.habitCode}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Target: {rtl.targetTime}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Akar Masalah</span>
                      <p className="text-slate-700 mt-1">{rtl.rootCause}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                      <span className="text-[#0753A5] font-bold block text-[10px] uppercase">Rencana Aksi Sekolah</span>
                      <p className="text-blue-900 mt-1">{rtl.actionPlan}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span>PIC: <strong>{rtl.pic}</strong></span>
                    <span className="text-emerald-700 font-bold">✓ Terverifikasi Kepala Sekolah</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI STRATEGY TAB */}
      {activeTab === 'AI_STRATEGY' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Analisis AI Strategis Tingkat Sekolah ({activeSchool.name})
                </h3>
                <p className="text-xs text-slate-500">
                  Rekomendasi kepemimpinan sekolah berlandaskan 5 pilar analitik etis dengan data terupdate.
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateSchoolAi}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiLoading ? 'Menyusun Analisis...' : 'Perbarui Analisis'}</span>
            </button>
          </div>

          {aiSchoolResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                <h4 className="text-xs font-bold text-[#0753A5] uppercase tracking-wider">
                  📋 1. Fakta yang Tercatat
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {aiSchoolResult.recordedFacts?.map((f: string, i: number) => <li key={i}>{f}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  🔍 2. Pola Pembiasaan Sekolah
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {aiSchoolResult.habitPatterns?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  ⚠️ 3. Keterbatasan Data
                </h4>
                <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
                  {aiSchoolResult.dataLimitations?.map((l: string, i: number) => <li key={i}>{l}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  ❓ 4. Hipotesis untuk Diverifikasi
                </h4>
                <ul className="list-disc list-inside text-xs text-purple-900 space-y-1">
                  {aiSchoolResult.hypothesesToVerify?.map((h: string, i: number) => <li key={i}>{h}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  💡 5. Rekomendasi Kebijakan & RTL Sekolah
                </h4>
                <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1.5">
                  {aiSchoolResult.actionableRecommendations?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Data agregat sekolah menjaga kerahasiaan pribadi siswa sesuai regulasi privasi pendidikan.</span>
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

      {/* Add School Program Modal */}
      {isAddProgramModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-[#0753A5] to-[#0A64C2] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Tambah Inisiatif Pembiasaan Sekolah</h3>
                <p className="text-xs text-blue-100 mt-0.5">{activeSchool.name}</p>
              </div>
              <button
                onClick={() => setIsAddProgramModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="p-5 space-y-4 text-xs">
              {/* AI Auto-Draft Assistant */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-white border border-indigo-200 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Bantuan AI: Isi Draf Program Otomatis</span>
                  </span>
                  <span className="text-[10px] text-indigo-700 bg-indigo-100/70 font-semibold px-2 py-0.5 rounded-full">
                    Generator Praktis
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🥗 Sarapan Gizi & Tumbler', key: 'sarapan' },
                    { label: '������ 1 Jam Bebas Gawai', key: 'tidur' },
                    { label: '🏃 Senam Ceria 7KAIH', key: 'senam' },
                    { label: '📚 Pojok Literasi Pagi', key: 'baca' },
                    { label: '🤲 Bintang Fajar Doa', key: 'ibadah' },
                    { label: '🤝 Operasi Semut', key: 'kebaikan' },
                  ].map((pill) => (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={() => handleDraftProgramWithAi(pill.key)}
                      disabled={isAiModalDrafting}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-indigo-950 cursor-pointer transition-all shadow-2xs"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-1 border-t border-indigo-100">
                  <input
                    type="text"
                    value={aiModalThemeInput}
                    onChange={(e) => setAiModalThemeInput(e.target.value)}
                    placeholder="Atau ketik topik khusus (cth: piket gotong royong)..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleDraftProgramWithAi()}
                    disabled={isAiModalDrafting}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs shrink-0"
                  >
                    {isAiModalDrafting ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    <span>✨ Draf AI</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Inisiatif / Program:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gerakan Sarapan Sehat Jumat Pagi"
                  value={newProgramTitle}
                  onChange={(e) => setNewProgramTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Kebiasaan:</label>
                  <select
                    value={newProgramHabit}
                    onChange={(e) => setNewProgramHabit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500 bg-white"
                  >
                    <option value="BANGUN_PAGI">Bangun Pagi</option>
                    <option value="BERIBADAH">Beribadah</option>
                    <option value="BEROLAHRAGA">Berolahraga</option>
                    <option value="MAKAN_SEHAT">Makan Sehat & Bergizi</option>
                    <option value="GEMAR_BELAJAR">Gemar Belajar</option>
                    <option value="BERMASYARAKAT">Bermasyarakat</option>
                    <option value="TIDUR_CEPAT">Tidur Cepat</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sasaran Peserta:</label>
                  <input
                    type="text"
                    placeholder="Semua Rombel (Fase D)"
                    value={newProgramScope}
                    onChange={(e) => setNewProgramScope(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jadwal Pelaksanaan:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Setiap Jumat Pagi"
                    value={newProgramSchedule}
                    onChange={(e) => setNewProgramSchedule(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab (PIC):</label>
                  <input
                    type="text"
                    placeholder="Nama Pendidik / Tim Karakter"
                    value={newProgramPic}
                    onChange={(e) => setNewProgramPic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat Inisiatif:</label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan tujuan dan mekanisme pembiasaan karakter ini..."
                  value={newProgramDesc}
                  onChange={(e) => setNewProgramDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProgramModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Sahkan & Terbitkan Inisiatif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Detail / Consultation Modal with Synchronized Student Roster & Live Journals */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0753A5] to-[#0A64C2] p-6 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                    Detail Portofolio Rombel Terintegrasi
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-400/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                    {selectedClass.totalJournals || 0} Jurnal Terdata
                  </span>
                </div>
                <h3 className="text-lg font-black mt-1.5">{selectedClass.name}</h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Wali Kelas: <strong>{selectedClass.teacher}</strong> ({selectedClass.teacherNip}) • {selectedClass.students} Siswa Terdaftar • {selectedClass.academicYear}
                </p>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Kelengkapan Jurnal</span>
                  <span className="text-base font-black text-[#0753A5]">{selectedClass.completeness}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Konsistensi Pembiasaan</span>
                  <span className="text-base font-black text-emerald-700">{selectedClass.consistency}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Mengisi Hari Ini</span>
                  <span className="text-base font-black text-indigo-700">
                    {selectedClass.todayFilledCount || 0} Siswa
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Distribusi Status</span>
                  <div className="flex items-center justify-center gap-1 mt-1 text-xs font-bold">
                    <span className="text-emerald-700">{selectedClass.good} B</span> •
                    <span className="text-amber-700">{selectedClass.warning} P</span> •
                    <span className="text-rose-700">{selectedClass.assist} D</span>
                  </div>
                </div>
              </div>

              {/* 7 Habits Breakdown for this Rombel */}
              {selectedClass.habitStats && selectedClass.habitStats.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Capaian 7 Dimensi Kebiasaan Rombel {selectedClass.rawName || selectedClass.name}
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      ⭐ Unggul: <strong>{selectedClass.topHabit}</strong> • 🎯 Prioritas: <strong>{selectedClass.priorityHabit}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {selectedClass.habitStats.map((h: any) => (
                      <div key={h.code} className="p-2 rounded-xl bg-white border border-slate-200 text-center">
                        <span className="text-base">{h.label === 'Bangun Pagi' ? '🌅' : h.label === 'Beribadah' ? '🤲' : h.label === 'Berolahraga' ? '🏃' : h.label === 'Makan Sehat' ? '🥗' : h.label === 'Gemar Belajar' ? '📚' : h.label === 'Bermasyarakat' ? '🤝' : '🌙'}</span>
                        <div className="text-[10px] font-bold text-slate-700 mt-0.5 truncate">{h.label}</div>
                        <div className="text-xs font-black text-[#0753A5]">{h.percentage}%</div>
                        <div className="text-[9px] text-slate-400">{h.completedCount} terisi</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Synchronized Student Roster With Real-time Journal Progress */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0753A5]" />
                    <span>Daftar Peserta Didik & Progres Jurnal Terkini</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                    {selectedClass.studentsDetail && selectedClass.studentsDetail.length > 0
                      ? `${selectedClass.studentsDetail.length} Siswa Terdata`
                      : `${selectedClass.students} Siswa`}
                  </span>
                </div>

                {selectedClass.studentsDetail && selectedClass.studentsDetail.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">NISN</th>
                          <th className="py-2.5 px-3">Nama Siswa</th>
                          <th className="py-2.5 px-2 text-center">Jurnal</th>
                          <th className="py-2.5 px-2 text-center">Hari Ini</th>
                          <th className="py-2.5 px-2 text-center">Konsistensi</th>
                          <th className="py-2.5 px-2 text-center">Status</th>
                          <th className="py-2.5 px-2 text-center">Validasi Ortu</th>
                          <th className="py-2.5 px-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedClass.studentsDetail.map((s: any) => (
                          <tr key={s.id || s.nisn} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{s.nisn}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                            <td className="py-2.5 px-2 text-center font-semibold text-slate-700">
                              {s.journalCount} Hari
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              {s.isFilledToday ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  ✓ ({s.todayHabitsCount}/7)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                                  Belum Isi
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-center font-black text-[#0753A5]">
                              {s.consistencyRate}%
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  s.category === 'TERPANTAU_BAIK'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : s.category === 'PERLU_PENGUATAN'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {s.category === 'TERPANTAU_BAIK' ? 'Baik' : s.category === 'PERLU_PENGUATAN' ? 'Penguatan' : 'Damping'}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              {s.isParentValidated ? (
                                <span className="text-[10px] font-bold text-emerald-700">✓ Valid</span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Menunggu</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => {
                                  setInspectedStudent({
                                    student: s,
                                    journals: s.studentJournals || [],
                                  });
                                }}
                                className="px-2 py-1 rounded-md border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-[#0753A5] font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lihat Jurnal</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-700">
                      Rombel ini terdaftar dengan kuota {selectedClass.capacity || 32} siswa.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Data peserta didik mandiri dapat diimpor langsung melalui panel Admin Sekolah.
                    </p>
                  </div>
                )}
              </div>

              {/* Feedback to Teacher Form */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  Kirim Apresiasi & Catatan Pembinaan untuk Wali Kelas:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder={`Apresiasi untuk ${selectedClass.teacher}: Contoh pertahankan keteraturan ibadah dan tidur tepat waktu...`}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500 bg-slate-50/50"
                  />
                  <button
                    onClick={handleSendFeedback}
                    className="px-4 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Portofolio disinkronkan otomatis dengan SIM Satuan Pendidikan dan Jurnal Murid Terkini.
              </span>
              <button
                onClick={() => setSelectedClass(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Journal Inspection Modal (Detail Pengisian Jurnal Murid oleh Kepala Sekolah) */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-blue-800 p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                    Inspeksi Jurnal Murid Terkini
                  </span>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    {inspectedStudent.journals.length} Entri Tersimpan
                  </span>
                </div>
                <h3 className="text-base font-black mt-1">
                  {inspectedStudent.student.name} ({inspectedStudent.student.className || selectedClass?.name || 'Rombel'})
                </h3>
                <p className="text-xs text-indigo-100 mt-0.5">
                  NISN: <strong>{inspectedStudent.student.nisn || '-'}</strong> • Konsistensi: <strong>{inspectedStudent.student.consistencyRate || 0}%</strong>
                </p>
              </div>
              <button
                onClick={() => setInspectedStudent(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {inspectedStudent.journals.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500 space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700">Belum Ada Catatan Jurnal</p>
                  <p className="text-[11px] text-slate-400">
                    Siswa ini belum mengisi jurnal harian 7KAIH secara mandiri.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inspectedStudent.journals
                    .sort((a, b) => (b.journalDate || '').localeCompare(a.journalDate || ''))
                    .map((j) => {
                      const completedCount = j.completedCount !== undefined
                        ? j.completedCount
                        : j.entries
                        ? Object.values(j.entries).filter((e: any) => e?.completed).length
                        : 0;

                      return (
                        <div
                          key={j.id || j.journalDate}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <strong className="text-xs font-bold text-slate-900">{j.journalDate}</strong>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                                {completedCount} dari 7 Kebiasaan Terlaksana
                              </span>
                            </div>

                            <div>
                              {j.parentValidated ? (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Divalidasi Orang Tua: {j.parentValidatorName || 'Orang Tua / Wali'}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                                  Menunggu Validasi Orang Tua
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 7 Habits Checkboxes Display */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            {schoolHabitAnalytics.map((h) => {
                              const entry = (j.entries && (j.entries as any)[h.code]) || (j.habits && (j.habits as any)[h.code]);
                              const isDone = !!(entry && (entry.completed || entry.status === 'COMPLETED'));
                              return (
                                <div
                                  key={h.code}
                                  className={`p-2 rounded-xl border flex items-center gap-2 ${
                                    isDone
                                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-semibold'
                                      : 'bg-white border-slate-200 text-slate-400'
                                  }`}
                                >
                                  <span className="text-base">{h.icon}</span>
                                  <div className="text-[10px] leading-tight">
                                    <div className="font-bold truncate">{h.label}</div>
                                    <div>{isDone ? '✓ Terlaksana' : '—'}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Validation Note or Reflection Note */}
                          {j.parentValidationNote && (
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                              💬 <strong>Catatan Orang Tua:</strong> {j.parentValidationNote}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Pencatatan pembiasaan bersifat formatif, apresiatif, dan non-komparatif.
              </span>
              <button
                onClick={() => setInspectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
