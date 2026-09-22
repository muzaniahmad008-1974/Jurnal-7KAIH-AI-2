// ============================================================================
// SI-7KAIH AI - Student Dashboard Component
// Friendly, motivational, card-based, accessible, low cognitive load
// ============================================================================

import React, { useMemo, useState, useEffect } from 'react';
import {
  DailyJournal,
  Badge,
  HabitCode,
} from '../../packages/types/src/index';
import { HABIT_LIST, isDeprecatedOrDummyJournal } from '../lib/constants';
import {
  calculateMonthlyHabitSummary,
  calculateHabitualThreshold,
} from '../../packages/analytics/src/index';
import {
  Sun,
  HeartHandshake,
  Activity,
  Apple,
  BookOpen,
  Users,
  Moon,
  CheckCircle2,
  Sparkles,
  Flame,
  Award,
  ArrowRight,
  Clock,
  ShieldCheck,
  RotateCcw,
  PenTool,
  Feather,
  Heart,
  Sliders,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  Printer,
  Info,
  X,
  Trophy,
  Check,
} from 'lucide-react';
import { calculateBadgesFromJournals, DEFAULT_BADGES } from '../lib/mockData';
import {
  formatRealtimeSaveTime,
  formatTimeOnly,
  getLocalDateString,
  formatIndonesianFullDate,
  formatIndonesianShortDate,
} from '../lib/dateUtils';
import { ParentSignatureModal } from './ParentSignatureModal';
import { HabitTrendsChart } from './HabitTrendsChart';

interface StudentDashboardProps {
  todayJournal: DailyJournal;
  allJournals: DailyJournal[];
  onOpenJournal: () => void;
  onResetTodayJournal?: () => void;
  onOpenReflection: () => void;
  onOpenBadges: () => void;
  onOpenAICoach: () => void;
  studentName: string;
  studentId?: string;
  studentNisn?: string;
  className: string;
  badges: Badge[];
  onValidateJournal?: (
    journalId: string,
    habitCode?: HabitCode,
    note?: string,
    validationMeta?: {
      signature?: string;
      validatorName?: string;
      validationType?: 'SIGNATURE' | 'INITIALS';
      source?: 'STUDENT_DASHBOARD' | 'PARENT_DASHBOARD';
      asParent?: boolean;
    }
  ) => void;
  onSelectDate?: (dateStr: string) => void;
  onOpenCalendar?: () => void;
  onOpenReportModal?: (student?: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  todayJournal,
  allJournals,
  onOpenJournal,
  onResetTodayJournal,
  onOpenReflection,
  onOpenBadges,
  onOpenAICoach,
  studentName,
  studentId,
  studentNisn,
  className,
  badges,
  onValidateJournal,
  onSelectDate,
  onOpenCalendar,
  onOpenReportModal,
}) => {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);
  const [selectedJournalToSign, setSelectedJournalToSign] = useState<DailyJournal | null>(null);
  const [showValidationSettings, setShowValidationSettings] = useState<boolean>(false);
  const [showPastJournals, setShowPastJournals] = useState<boolean>(false);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [selectedHabitEval, setSelectedHabitEval] = useState<HabitCode | 'ALL'>('ALL');
  const [showHabitsDetail, setShowHabitsDetail] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Dedicated Calendar View State inside Student Dashboard
  const [calDate, setCalDate] = useState<Date>(() => new Date());
  const [calHabitFilter, setCalHabitFilter] = useState<HabitCode | 'ALL'>('ALL');

  // Local synced journals state guaranteeing immediate reactive synchronization
  const [syncedJournals, setSyncedJournals] = useState<DailyJournal[]>(() => {
    try {
      const saved = localStorage.getItem('si7kaih_journals_prod');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_e) {}
    return allJournals || [];
  });

  // Keep syncedJournals in lockstep with allJournals prop
  useEffect(() => {
    if (allJournals) {
      setSyncedJournals(allJournals);
    }
  }, [allJournals]);

  // Parent validation mode preference:
  // 'BOTH' (default): Bisa divalidasi di Dashboard Murid maupun Dashboard Orang Tua
  // 'PARENT_ONLY': Hanya melalui login Dashboard Orang Tua
  const [validationLocationMode, setValidationLocationMode] = useState<'BOTH' | 'PARENT_ONLY'>(() => {
    try {
      const saved = localStorage.getItem('si7kaih_parent_val_mode');
      return saved === 'PARENT_ONLY' ? 'PARENT_ONLY' : 'BOTH';
    } catch {
      return 'BOTH';
    }
  });

  const handleToggleValidationMode = (mode: 'BOTH' | 'PARENT_ONLY') => {
    setValidationLocationMode(mode);
    try {
      localStorage.setItem('si7kaih_parent_val_mode', mode);
      window.dispatchEvent(new CustomEvent('si7kaih_parent_val_mode_changed', { detail: mode }));
    } catch (_e) {}
  };

  // Real-time synchronization listeners for journal updates from form, other tabs, or parent validations
  useEffect(() => {
    const handleSync = (evt?: Event) => {
      setLastSyncTime(
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      try {
        const customEvt = evt as CustomEvent<DailyJournal[]>;
        if (customEvt?.detail && Array.isArray(customEvt.detail)) {
          setSyncedJournals(customEvt.detail);
          return;
        }
        const saved = localStorage.getItem('si7kaih_journals_prod');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setSyncedJournals(parsed);
          }
        }
      } catch (_e) {}
    };

    window.addEventListener('si7kaih_journals_updated', handleSync);
    window.addEventListener('storage', (e) => {
      if (e.key === 'si7kaih_journals_prod' || e.key === 'si7kaih_parent_val_mode') {
        handleSync();
      }
    });

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('si7kaih_sync_channel');
        bc.onmessage = (msg) => {
          if (
            msg.data?.type === 'JOURNALS_UPDATED' ||
            msg.data?.type === 'STUDENT_UPDATED' ||
            msg.data?.type === 'MASTER_DATA_SYNC'
          ) {
            handleSync();
          }
        };
      } catch (_e) {}
    }

    return () => {
      window.removeEventListener('si7kaih_journals_updated', handleSync);
      if (bc) bc.close();
    };
  }, []);

  const handleManualSync = () => {
    setIsManualSyncing(true);
    setLastSyncTime(
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    try {
      const saved = localStorage.getItem('si7kaih_journals_prod');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSyncedJournals(parsed);
        }
      }
    } catch (_e) {}
    setTimeout(() => {
      setIsManualSyncing(false);
    }, 400);
  };

  const habitsIconMap = {
    WAKE_EARLY: Sun,
    WORSHIP: HeartHandshake,
    EXERCISE: Activity,
    HEALTHY_EATING: Apple,
    LEARNING: BookOpen,
    SOCIAL: Users,
    SLEEP_EARLY: Moon,
  };

  // 1. Accurate filtering of journals belonging to the active student (strictly no default/dummy)
  const studentJournals = useMemo(() => {
    const baseList = syncedJournals.length > 0 ? syncedJournals : (allJournals || []);
    const targetId = (studentId || todayJournal?.studentId || '').trim().toLowerCase();
    const targetNisn = (studentNisn || todayJournal?.studentNisn || '').trim();
    const targetName = (studentName || todayJournal?.studentName || '').trim().toLowerCase();

    const filtered = baseList.filter((j) => {
      if (isDeprecatedOrDummyJournal(j)) return false;
      const jId = (j.studentId || '').trim().toLowerCase();
      const jNisn = (j.studentNisn || '').trim();
      const jName = (j.studentName || '').trim().toLowerCase();

      if (targetId && jId && jId === targetId) return true;
      if (targetNisn && (jNisn === targetNisn || jId === targetNisn)) return true;
      if (targetName && jName && jName === targetName) return true;
      return false;
    });

    // Merge with todayJournal to guarantee 0-latency reflection of today's journal state
    if (todayJournal?.journalDate && !isDeprecatedOrDummyJournal(todayJournal)) {
      const existsIdx = filtered.findIndex((j) => j.journalDate === todayJournal.journalDate);
      if (existsIdx >= 0) {
        const existing = filtered[existsIdx];
        const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        const propTime = todayJournal.updatedAt ? new Date(todayJournal.updatedAt).getTime() : 0;
        if (propTime >= existingTime) {
          filtered[existsIdx] = todayJournal;
        }
      } else if ((todayJournal.completedCount || 0) > 0 || Object.values(todayJournal.entries || {}).some((e: any) => e?.completed)) {
        filtered.push(todayJournal);
      }
    }

    return filtered;
  }, [syncedJournals, allJournals, studentId, studentNisn, todayJournal, studentName]);

  // 1b. Lencana Pencapaian Karakter yang tersinkronisasi otomatis dengan pembaruan jurnal aktif murid
  const syncedBadges = useMemo(() => {
    return calculateBadgesFromJournals(studentJournals, DEFAULT_BADGES);
  }, [studentJournals]);

  const earnedBadgesCount = useMemo(() => {
    return syncedBadges.filter((b) => !!b.earnedAt).length;
  }, [syncedBadges]);

  const inProgressBadgesCount = syncedBadges.length - earnedBadgesCount;

  const [badgeFilter, setBadgeFilter] = useState<'ALL' | 'EARNED' | 'IN_PROGRESS'>('ALL');
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState<Badge | null>(null);
  const [isCriteriaGuideOpen, setIsCriteriaGuideOpen] = useState(false);

  const filteredBadges = useMemo(() => {
    if (badgeFilter === 'EARNED') return syncedBadges.filter((b) => !!b.earnedAt);
    if (badgeFilter === 'IN_PROGRESS') return syncedBadges.filter((b) => !b.earnedAt);
    return syncedBadges;
  }, [syncedBadges, badgeFilter]);

  const getBadgeVisual = (code: string, isEarned: boolean) => {
    switch (code) {
      case 'STREAK_3':
        return { emoji: '🔥', dimension: '3 Hari Aktif', tagBg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'STREAK_7':
        return { emoji: '⚡', dimension: 'Konsisten 7 Hari', tagBg: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'DEVOUT_SPIRIT':
        return { emoji: '🕌', dimension: 'Beribadah', tagBg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'EARLY_BIRD':
        return { emoji: '🌅', dimension: 'Bangun Pagi', tagBg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'ACTIVE_MOVER':
        return { emoji: '🏃‍♂️', dimension: 'Berolahraga', tagBg: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'HEALTHY_CHAMP':
        return { emoji: '🥗', dimension: 'Makan Sehat & Bergizi', tagBg: 'bg-green-100 text-green-800 border-green-200' };
      case 'CURIOUS_READER':
        return { emoji: '📖', dimension: 'Gemar Belajar', tagBg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'HELPING_HAND':
        return { emoji: '🤝', dimension: 'Bermasyarakat', tagBg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'DISCIPLINED_REST':
        return { emoji: '🌙', dimension: 'Tidur Cepat', tagBg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'GOLDEN_HABIT_21':
        return { emoji: '👑', dimension: 'Karakter Emas 21 Hari', tagBg: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      default:
        return { emoji: isEarned ? '🏅' : '🔒', dimension: 'Pembiasaan', tagBg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  // Calendar state derivations for monthly view inside Student Dashboard
  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calFirstDayIndex = new Date(calYear, calMonth, 1).getDay(); // 0 = Sunday
  const calMonthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const calMonthLabel = calMonthNames[calMonth];

  const calMonthJournals = useMemo(() => {
    const prefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
    return studentJournals.filter((j) => j.journalDate && j.journalDate.startsWith(prefix));
  }, [studentJournals, calYear, calMonth]);

  const calJournalMap = useMemo(() => {
    const map = new Map<string, DailyJournal>();
    studentJournals.forEach((j) => {
      map.set(j.journalDate, j);
    });
    if (todayJournal?.journalDate) {
      map.set(todayJournal.journalDate, todayJournal);
    }
    return map;
  }, [studentJournals, todayJournal]);

  const calRecordedDays = useMemo(() => {
    const dates = new Set(
      calMonthJournals
        .filter((j) => (j.completedCount || 0) > 0 || Object.values(j.entries || {}).some((e: any) => e?.completed))
        .map((j) => j.journalDate)
    );
    return dates.size;
  }, [calMonthJournals]);

  const calHabitualDays = useMemo(() => {
    return calMonthJournals.filter((j) => (j.completedCount || 0) >= 6).length;
  }, [calMonthJournals]);

  const calAverageHabits = useMemo(() => {
    if (calRecordedDays === 0) return 0;
    const total = calMonthJournals.reduce((acc, j) => {
      const cnt = j.completedCount ?? Object.values(j.entries || {}).filter((e: any) => e?.completed).length;
      return acc + cnt;
    }, 0);
    return Math.round((total / calRecordedDays) * 10) / 10;
  }, [calMonthJournals, calRecordedDays]);

  const calValidatedDays = useMemo(() => {
    return calMonthJournals.filter(
      (j) => j.parentValidated || Object.values(j.entries || {}).some((e: any) => e?.parentValidated)
    ).length;
  }, [calMonthJournals]);

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

  const handleDayClick = (dateStr: string) => {
    if (onSelectDate) {
      onSelectDate(dateStr);
    } else if (dateStr === todayJournal?.journalDate) {
      onOpenJournal();
    }
  };

  const calDayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const { activeYear, activeMonthIdx, daysInMonth, activeMonthLabel } = useMemo(() => {
    let d = new Date();
    if (studentJournals.length > 0) {
      const dates = studentJournals
        .map((j) => j.journalDate)
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a));
      if (dates[0]) {
        const parts = dates[0].split('-');
        if (parts.length >= 2) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(y) && !isNaN(m)) {
            d = new Date(y, m - 1, 1);
          }
        }
      }
    }
    const year = d.getFullYear();
    const monthIdx = d.getMonth();
    const days = new Date(year, monthIdx + 1, 0).getDate();
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return { activeYear: year, activeMonthIdx: monthIdx, daysInMonth: days, activeMonthLabel: label };
  }, [studentJournals]);

  // 3. Filter journals for active month
  const currentMonthJournals = useMemo(() => {
    const prefix = `${activeYear}-${String(activeMonthIdx + 1).padStart(2, '0')}`;
    return studentJournals.filter((j) => j.journalDate && j.journalDate.startsWith(prefix));
  }, [studentJournals, activeYear, activeMonthIdx]);

  // 4. Threshold & Recorded Days Calculation
  const targetThreshold = calculateHabitualThreshold(daysInMonth);
  const recordedDays = useMemo(() => {
    const dates = new Set(
      currentMonthJournals
        .filter((j) => (j.completedCount || 0) > 0 || Object.values(j.entries || {}).some((e: any) => e?.completed))
        .map((j) => j.journalDate)
    );
    return dates.size;
  }, [currentMonthJournals]);

  // 5. Dimension-by-dimension calculation for all 7 habits
  const habitsEvaluation = useMemo(() => {
    return HABIT_LIST.map((h) => {
      const completedDays = currentMonthJournals.filter(
        (j) => j.entries?.[h.code]?.completed
      ).length;
      const isHabitual = completedDays >= targetThreshold;
      const consistencyRate = recordedDays > 0 ? Math.round((completedDays / recordedDays) * 100) : 0;
      const progressPercent = Math.min(100, Math.round((completedDays / targetThreshold) * 100));

      return {
        code: h.code,
        name: h.name,
        completedDays,
        targetThreshold,
        isHabitual,
        consistencyRate,
        progressPercent,
      };
    });
  }, [currentMonthJournals, targetThreshold, recordedDays]);

  // 6. Aggregated metrics across 7 habits
  const habitualCount = useMemo(() => {
    return habitsEvaluation.filter((h) => h.isHabitual).length;
  }, [habitsEvaluation]);

  const averageCompletedDays = useMemo(() => {
    if (habitsEvaluation.length === 0) return 0;
    const total = habitsEvaluation.reduce((acc, h) => acc + h.completedDays, 0);
    return Math.round((total / habitsEvaluation.length) * 10) / 10;
  }, [habitsEvaluation]);

  const completenessRate = Math.round((recordedDays / daysInMonth) * 100);

  // 7. Active evaluation data based on selected dimension
  const currentHabitEval = useMemo(() => {
    if (selectedHabitEval === 'ALL') return null;
    return habitsEvaluation.find((h) => h.code === selectedHabitEval) || null;
  }, [selectedHabitEval, habitsEvaluation]);

  // Live ticking time for current day and second
  const [liveCurrentTime, setLiveCurrentTime] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTodayDateStr = useMemo(() => getLocalDateString(liveCurrentTime), [liveCurrentTime]);
  const formattedFullTodayDate = useMemo(() => formatIndonesianFullDate(liveCurrentTime), [liveCurrentTime]);
  const formattedShortTodayDate = useMemo(() => formatIndonesianShortDate(liveCurrentTime), [liveCurrentTime]);
  const liveClockTimeStr = useMemo(() => formatTimeOnly(liveCurrentTime, 'WITA'), [liveCurrentTime]);

  // Resolve the active, most up-to-date journal for today for this student
  const activeTodayJournal = useMemo(() => {
    // 1. Check in studentJournals for an entry matching currentTodayDateStr
    const match = studentJournals.find((j) => j.journalDate === currentTodayDateStr);
    if (match) {
      if (todayJournal && todayJournal.journalDate === currentTodayDateStr && todayJournal.updatedAt && match.updatedAt) {
        if (new Date(todayJournal.updatedAt).getTime() > new Date(match.updatedAt).getTime()) {
          return todayJournal;
        }
      }
      return match;
    }
    // 2. If todayJournal prop is on today's date
    if (todayJournal && (todayJournal.journalDate === currentTodayDateStr || !todayJournal.journalDate)) {
      return todayJournal;
    }
    // 3. Fallback to empty default journal representation for today
    return todayJournal;
  }, [studentJournals, currentTodayDateStr, todayJournal]);

  const completedCount = useMemo(() => {
    if (!activeTodayJournal) return 0;
    if (typeof activeTodayJournal.completedCount === 'number') {
      return activeTodayJournal.completedCount;
    }
    if (activeTodayJournal.entries) {
      return Object.values(activeTodayJournal.entries).filter((e: any) => e?.completed).length;
    }
    return 0;
  }, [activeTodayJournal]);

  const isAllCompleted = completedCount === 7;
  const firstName = studentName?.trim() ? studentName.trim().split(' ')[0] : 'Hebat';

  const todaySavedRealtime = useMemo(() => {
    if (!activeTodayJournal) return null;
    if (activeTodayJournal.savedAt) {
      return formatRealtimeSaveTime(activeTodayJournal.savedAt, 'WITA');
    }
    if (activeTodayJournal.updatedAt && completedCount > 0) {
      return formatRealtimeSaveTime(activeTodayJournal.updatedAt, 'WITA');
    }
    return null;
  }, [activeTodayJournal, completedCount]);

  // Real consecutive streak calculation specifically for this student
  const streakDays = useMemo(() => {
    return studentJournals.filter((j) => (j.completedCount || 0) >= 5).length;
  }, [studentJournals]);

  // Linimasa Pembiasaan Sepekan Terakhir (6 hari lalu s.d. hari ini) - Data riil terkini
  const recentDays = useMemo(() => {
    const list = [];
    const baseDate = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const str = getLocalDateString(d);

      let match = studentJournals.find((j) => j.journalDate === str && !isDeprecatedOrDummyJournal(j));
      if (str === currentTodayDateStr && activeTodayJournal) {
        match = activeTodayJournal;
      }

      let count = 0;
      if (match) {
        if (typeof match.completedCount === 'number') {
          count = match.completedCount;
        } else if (match.entries) {
          count = Object.values(match.entries).filter((e: any) => !!e?.completed).length;
        }
      }

      const hasRecord = count > 0;
      const isFull = count >= 6;
      const isPartial = count > 0 && count < 6;

      list.push({
        dateStr: str,
        dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        dayNum: d.getDate(),
        fullDateLabel: formatIndonesianFullDate(d),
        completedCount: count,
        hasRecord,
        isFull,
        isPartial,
        isToday: str === currentTodayDateStr,
        savedAt: match?.savedAt || (match?.updatedAt && count > 0 ? formatRealtimeSaveTime(match.updatedAt, 'WITA') : null),
      });
    }
    return list;
  }, [studentJournals, currentTodayDateStr, activeTodayJournal]);

  const activeDaysInWeek = useMemo(() => {
    return recentDays.filter((d) => d.completedCount > 0).length;
  }, [recentDays]);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-r from-[#0753A5] via-[#0960BE] to-[#20A5D5] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{className ? `${className} • Semangat Pagi!` : 'Semangat Pagi Anak Indonesia Hebat!'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Halo, {studentName || 'Siswa Hebat'}! 🌟
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Tiap langkah kecil dalam 7 kebiasaan baikmu hari ini membentuk masa depan yang tangguh, cerdas, dan berkarakter mulia.
            </p>
          </div>

          {/* Quick Today Action */}
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 flex flex-col items-center sm:items-end w-full md:w-auto shadow-sm">
            {/* Live Synchronized Current Day & Time */}
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-100 mb-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/15 shadow-2xs backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5 text-sky-300" />
              <span className="font-bold">{formattedFullTodayDate}</span>
              <span className="text-white/40">•</span>
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-mono font-bold text-amber-200">{liveClockTimeStr}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
              <Flame className="w-4 h-4 fill-amber-300" />
              <span>{streakDays > 0 ? `Konsisten ${streakDays} Hari Berturut-turut!` : 'Mulai Pembiasaan Hari Ini!'}</span>
            </div>
            
            <div className="text-sm font-semibold mb-1">
              Jurnal Hari Ini ({formattedShortTodayDate}):{' '}
              <span className={`font-extrabold underline decoration-2 ${completedCount >= 6 ? 'text-emerald-300 decoration-emerald-400' : completedCount > 0 ? 'text-sky-200 decoration-sky-300' : 'text-amber-200 decoration-amber-400'}`}>
                {completedCount} dari 7 Selesai
              </span>
            </div>

            {/* Info Waktu Terupdate Hari Terkini */}
            {todaySavedRealtime ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/50 text-[11px] font-semibold text-emerald-100 mb-3 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Clock className="w-3 h-3 text-emerald-300" />
                <span>Info Waktu Terupdate: <strong className="text-white">{todaySavedRealtime}</strong></span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-300/40 text-[11px] font-semibold text-amber-100 mb-3 shadow-2xs">
                <Clock className="w-3 h-3 text-amber-300" />
                <span>Info Waktu Terkini: <strong className="text-white">{formattedFullTodayDate}</strong> (Belum Diisi)</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <button
                id="hero-open-journal-btn"
                onClick={() => {
                  if (onSelectDate) {
                    onSelectDate(currentTodayDateStr);
                  } else {
                    onOpenJournal();
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-[#0753A5] hover:bg-blue-50 font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                title={`Buka Formulir Jurnal Hari Ini: ${formattedFullTodayDate}`}
              >
                <span>
                  {completedCount > 0
                    ? (isAllCompleted ? `Lihat / Edit Jurnal Hari Ini (${formattedShortTodayDate})` : `Lanjutkan Isi Jurnal (${formattedShortTodayDate})`)
                    : `Isi Jurnal Hari Ini (${formattedShortTodayDate})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {completedCount > 0 && onResetTodayJournal && (
                <button
                  id="hero-reset-journal-btn"
                  onClick={() => {
                    if (window.confirm(`Kosongkan seluruh isian Jurnal 7 Kebiasaan Hari Ini (${formattedFullTodayDate})?`)) {
                      onResetTodayJournal();
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-rose-600/40 text-rose-100 hover:text-white border border-white/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  title={`Kosongkan seluruh isian jurnal 7 kebiasaan hari ini (${formattedShortTodayDate})`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kosongkan Isian</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* LINIMASA PEMBIASAAN SEPEKAN TERAKHIR (Sinkron Realtime dengan Data Jurnal Murid) */}
      {/* ============================================================================ */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0753A5] to-[#20A5D5] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900">
                  Linimasa Pembiasaan Sepekan Terakhir
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sinkron Data Terkini</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ketercapaian 7 hari kalender pembiasaan ananda {studentName || 'siswa'} • Bebas data dummy/default.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
              Konsistensi: <strong className="text-[#0753A5] font-black">{activeDaysInWeek} dari 7 Hari</strong> Aktif
            </span>
          </div>
        </div>

        {/* 7-Day Grid Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {recentDays.map((item) => (
            <button
              key={item.dateStr}
              onClick={() => {
                if (onSelectDate) {
                  onSelectDate(item.dateStr);
                }
                onOpenJournal();
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative group hover:shadow-md ${
                item.isToday
                  ? 'border-[#0753A5] bg-blue-50/70 ring-2 ring-blue-400/40 shadow-xs'
                  : item.hasRecord
                  ? 'border-slate-200 bg-white hover:border-blue-300'
                  : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
              }`}
              title={`Klik untuk membuka/mengisi jurnal ${item.fullDateLabel}`}
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
              <div className="pt-2 border-t border-slate-100 w-full flex items-center justify-between">
                {item.hasRecord ? (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
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

        {/* Legend & Instructions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span><strong>6–7 Kebiasaan:</strong> Tuntas Sempurna</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span><strong>1–5 Kebiasaan:</strong> Sebagian Terlaksana</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span><strong>0/7 Terisi:</strong> Belum Ada Catatan Jurnal</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-400 italic">
            * Klik salah satu kartu tanggal di atas untuk membuka & mengisi jurnal hari tersebut.
          </span>
        </div>
      </div>

      {/* 7 Core Habits Quick Status Grid */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>7 Kebiasaan Hari Ini</span>
              <span className="text-xs sm:text-sm font-normal text-slate-500">
                ({formattedFullTodayDate})
              </span>
            </h3>
            {todaySavedRealtime && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>Info Terupdate: {todaySavedRealtime}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {completedCount > 0 && onResetTodayJournal && (
              <button
                id="dashboard-reset-journal-btn"
                onClick={() => {
                  if (window.confirm(`Kosongkan seluruh isian Jurnal 7 Kebiasaan Hari Ini (${formattedFullTodayDate})?`)) {
                    onResetTodayJournal();
                  }
                }}
                className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title={`Kosongkan seluruh isian jurnal 7 kebiasaan hari ini (${formattedShortTodayDate})`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kosongkan Isian</span>
              </button>
            )}
            <button
              onClick={() => {
                if (onSelectDate) {
                  onSelectDate(currentTodayDateStr);
                } else {
                  onOpenJournal();
                }
              }}
              className="text-xs sm:text-sm font-bold text-[#0753A5] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Formulir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HABIT_LIST.map((h, index) => {
            const Icon = habitsIconMap[h.code];
            const entry = activeTodayJournal?.entries?.[h.code] || todayJournal?.entries?.[h.code];
            const isDone = !!entry?.completed;

            return (
              <div
                key={h.code}
                onClick={() => {
                  if (onSelectDate) {
                    onSelectDate(currentTodayDateStr);
                  } else {
                    onOpenJournal();
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-white border-emerald-200 hover:border-emerald-300'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {index + 1}. {h.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {isDone ? '✓ Sudah terlaksana' : 'Belum diisi'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isDone ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 text-xs font-bold">
                      +
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================================ */}
      {/* INFO KALENDER KEBIASAAN 7KAIH (Sinkron Realtime dengan Jurnal Murid) */}
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
                  Kalender Kebiasaan 7KAIH: {calMonthLabel} {calYear}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sinkron Realtime: {lastSyncTime} WITA
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Jejak pembiasaan karakter harian ananda <span className="font-bold text-slate-700">{studentName}</span>. Otomatis diperbarui dari setiap pengisian jurnal.
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

            {/* Month Switcher */}
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

            {/* Full Calendar Link if available */}
            {onOpenCalendar && (
              <button
                type="button"
                onClick={onOpenCalendar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#0753A5] hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer border border-blue-200"
              >
                <span>Halaman Kalender</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
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
            <span className="text-[11px] font-semibold text-emerald-700 block">Terbiasa (6-7 Selesai)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900">{calHabitualDays}</span>
              <span className="text-xs text-slate-500">hari ({calTargetThreshold} target)</span>
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
            <span className="text-[11px] font-semibold text-indigo-700 block">Tervalidasi Orang Tua</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900">{calValidatedDays}</span>
              <span className="text-xs text-slate-500">hari tervalidasi</span>
            </div>
          </div>
        </div>

        {/* Habit Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs font-bold text-slate-500 mr-1">Tampilan:</span>
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
          {/* Empty cells before month start */}
          {Array.from({ length: calFirstDayIndex }).map((_, i) => (
            <div key={`cal-empty-${i}`} className="h-18 sm:h-22 rounded-2xl bg-slate-50/50 border border-transparent" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: calDaysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const journal = calJournalMap.get(dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            // Determine status based on habit filter
            let cellStyle = 'bg-slate-50/80 border-slate-200 text-slate-700'; // Missing/unrecorded by default (neutral gray)
            let badgeText = 'Belum Dicatat';
            let badgeColor = 'text-slate-400 bg-slate-100';

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
                const entry = journal.entries?.[calHabitFilter];
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
            }

            const isValidated = journal?.parentValidated || Object.values(journal?.entries || {}).some((e: any) => e?.parentValidated);

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => handleDayClick(dateStr)}
                className={`h-18 sm:h-22 p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-between text-left transition-all cursor-pointer shadow-2xs hover:shadow-md hover:scale-[1.01] ${cellStyle} ${
                  isToday ? 'ring-2 ring-blue-500 ring-offset-2 font-bold' : ''
                }`}
                title={`Klik untuk melihat / mengisi jurnal ${dateStr}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-black ${isToday ? 'px-1.5 py-0.5 rounded-full bg-blue-600 text-white' : ''}`}>
                    {dayNum}
                  </span>
                  {journal && (
                    <span className="text-[9px] sm:text-[10px] font-semibold hidden sm:inline">
                      {isValidated ? '✅ Valid' : '⏳ Menunggu'}
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
              <strong>Catatan Statistik:</strong> Data belum dicatat <span className="underline">bukan</span> berarti anak tidak melaksanakan kebiasaan. Klik pada tanggal untuk mengisi atau melengkapi jurnal.
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* KARTU VALIDASI & PENDAMPINGAN ORANG TUA / WALI (Sinkronisasi 2-Arah Realtime) */}
      {/* ============================================================================ */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
        {/* Card Header & Sync Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#0753A5] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#0753A5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Validasi &amp; Pendampingan Orang Tua / Wali
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sinkron Realtime</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Orang tua dapat memvalidasi langsung di Dashboard Murid ini atau melalui Dashboard Orang Tua (data tersinkron otomatis).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Settings Button */}
            <button
              type="button"
              onClick={() => setShowValidationSettings(!showValidationSettings)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showValidationSettings
                  ? 'bg-blue-50 text-[#0753A5] border-blue-200 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Pengaturan Mode Lokasi Validasi Orang Tua"
            >
              <Sliders className="w-3.5 h-3.5 text-[#0753A5]" />
              <span>Pengaturan Validasi</span>
              {showValidationSettings ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Settings Panel */}
        {showValidationSettings && (
          <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#0753A5]" />
                <span>Pengaturan Lokasi Validasi Jurnal Harian:</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Pembaruan terakhir: {lastSyncTime}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                onClick={() => handleToggleValidationMode('BOTH')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  validationLocationMode === 'BOTH'
                    ? 'bg-white border-[#0753A5] shadow-xs'
                    : 'bg-white/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs">
                    Mode Fleksibel (Direkomendasikan)
                  </span>
                  {validationLocationMode === 'BOTH' && (
                    <span className="w-4 h-4 rounded-full bg-[#0753A5] text-white text-[10px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                  Orang tua dapat memvalidasi dan membubuhkan tanda tangan/paraf <strong>langsung di Dashboard Murid</strong> saat mendampingi anak, <strong>maupun di Dashboard Orang Tua</strong> secara mandiri.
                </p>
              </div>

              <div
                onClick={() => handleToggleValidationMode('PARENT_ONLY')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  validationLocationMode === 'PARENT_ONLY'
                    ? 'bg-white border-[#0753A5] shadow-xs'
                    : 'bg-white/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs">
                    Khusus di Dashboard Orang Tua
                  </span>
                  {validationLocationMode === 'PARENT_ONLY' && (
                    <span className="w-4 h-4 rounded-full bg-[#0753A5] text-white text-[10px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                  Orang tua wajib masuk melalui akun orang tua terlebih dahulu untuk memvalidasi jurnal harian ananda.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-blue-900 flex items-center gap-2 bg-blue-100/50 p-2.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>
                Data validasi, tanda tangan digital, paraf, serta catatan apresiasi secara otomatis tersinkronisasi 2-arah ke Supabase dan localStorage secara realtime.
              </span>
            </div>
          </div>
        )}

        {/* Validation Body for Today's Journal */}
        <div className="p-6">
          {(() => {
            const currentValJournal = activeTodayJournal || todayJournal;
            return currentValJournal?.parentValidated ? (
              /* SUDAH DIVALIDASI */
              <div className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 p-5 sm:p-6 rounded-2xl border border-emerald-200 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-extrabold text-emerald-950">
                        Jurnal Hari Ini Telah Divalidasi Orang Tua / Wali
                      </h4>
                      <p className="text-xs text-emerald-700">
                        Terverifikasi resmi dalam portofolio 7 Kebiasaan Anak Indonesia Hebat
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJournalToSign(currentValJournal);
                      setIsSignatureModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Perbarui Tanda Tangan atau Catatan Validasi"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Perbarui Tanda Tangan / Catatan</span>
                  </button>
                </div>

                {/* Grid: Validator Metadata & Signature Box */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Info Kolom 1 & 2 */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-emerald-100">
                        <span className="text-slate-400 block text-[11px]">Nama Orang Tua / Wali:</span>
                        <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                          {currentValJournal.parentValidatorName || 'Orang Tua / Wali Siswa'}
                        </strong>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-emerald-100">
                        <span className="text-slate-400 block text-[11px]">Format &amp; Lokasi Validasi:</span>
                        <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                          {currentValJournal.parentValidationType === 'INITIALS' ? 'Paraf Resmi' : 'Tanda Tangan Digital'}
                        </strong>
                        <span className="text-[10px] text-emerald-700 mt-0.5 block">
                          {currentValJournal.parentValidationSource === 'PARENT_DASHBOARD'
                            ? '• Dari Dashboard Orang Tua'
                            : '• Dari Dashboard Murid'}
                        </span>
                      </div>
                    </div>

                    {currentValJournal.parentValidatedAt && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Waktu Validasi:{' '}
                          <strong className="text-slate-700">
                            {new Date(currentValJournal.parentValidatedAt).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}{' '}
                            pukul{' '}
                            {new Date(currentValJournal.parentValidatedAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            WITA
                          </strong>
                        </span>
                      </div>
                    )}

                    {/* Pesan Apresiasi Orang Tua */}
                    {currentValJournal.parentValidationNote && (
                      <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 space-y-1">
                        <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          <span>Pesan Apresiasi &amp; Kasih Sayang Orang Tua:</span>
                        </span>
                        <p className="text-xs text-slate-800 italic leading-relaxed">
                          "{currentValJournal.parentValidationNote}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Kolom 3: Pratinjau Tanda Tangan / Paraf */}
                  <div className="bg-white p-3.5 rounded-2xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-between text-center min-h-[140px]">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-800">
                      {currentValJournal.parentValidationType === 'INITIALS' ? 'Pratinjau Paraf' : 'Pratinjau Tanda Tangan'}
                    </span>

                    {currentValJournal.parentSignature ? (
                      <div className="my-2 p-1 bg-blue-50/30 rounded-xl w-full flex items-center justify-center">
                        <img
                          src={currentValJournal.parentSignature}
                          alt="Tanda Tangan / Paraf Orang Tua"
                          className="max-h-20 max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="my-3 py-2 px-4 bg-emerald-50 rounded-xl text-emerald-700 text-xs font-semibold">
                        ✓ Tervalidasi Resmi
                      </div>
                    )}

                    <div className="w-full pt-1 border-t border-slate-100">
                      <p className="text-[11px] font-extrabold text-slate-800 truncate">
                        {currentValJournal.parentValidatorName || 'Orang Tua / Wali'}
                      </p>
                      <span className="text-[9px] text-emerald-600 block">Digital Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            /* BELUM DIVALIDASI */
            <div className="bg-gradient-to-br from-blue-50/50 via-slate-50 to-amber-50/30 p-5 sm:p-6 rounded-2xl border border-blue-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Menunggu Validasi Orang Tua Hari Ini</span>
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      ({completedCount} dari 7 Selesai)
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                    {completedCount > 0
                      ? 'Ananda sudah mencatatkan jurnal hari ini. Ayah / Ibu / Wali dipersilakan memeriksa dan membubuhkan tanda tangan atau paraf digital pendampingan.'
                      : 'Ananda belum mengisi jurnal 7 kebiasaan hari ini. Silakan isi terlebih dahulu, lalu mintalah orang tua untuk memvalidasi dan membubuhkan tanda tangan.'}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    id="student-dashboard-validate-parent-btn"
                    onClick={() => {
                      setSelectedJournalToSign(currentValJournal);
                      setIsSignatureModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#0753A5] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <PenTool className="w-4 h-4 text-emerald-300" />
                    <span>Validasi Orang Tua (Tanda Tangan / Paraf)</span>
                  </button>
                </div>
              </div>

              {/* Informative footer note */}
              <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0753A5]" />
                  <span>
                    Validasi di sini akan otomatis tercatat di <strong>Dashboard Orang Tua</strong> &amp; <strong>Laporan Resmi</strong>.
                  </span>
                </div>
                {validationLocationMode === 'PARENT_ONLY' && (
                  <span className="text-amber-700 font-semibold">
                    *Mode Khusus Dashboard Orang Tua aktif (opsi validasi pendampingan langsung tetap tersedia jika orang tua hadir).
                  </span>
                )}
              </div>
            </div>
          );
        })()}

          {/* Collapsible: Riwayat Jurnal Sebelumnya untuk Divalidasi */}
          {allJournals.length > 1 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPastJournals(!showPastJournals)}
                className="text-xs font-bold text-[#0753A5] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {showPastJournals
                    ? 'Sembunyikan Riwayat Validasi Tanggal Sebelumnya'
                    : 'Periksa / Validasi Jurnal Tanggal Sebelumnya'}
                </span>
                {showPastJournals ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showPastJournals && (
                <div className="mt-3 space-y-2 animate-fade-in">
                  <p className="text-[11px] text-slate-500">
                    Daftar jurnal hari sebelumnya. Orang tua dapat memeriksa dan membubuhkan tanda tangan untuk hari yang belum divalidasi:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {allJournals
                      .filter((j) => j.journalDate !== todayJournal?.journalDate)
                      .sort((a, b) => b.journalDate.localeCompare(a.journalDate))
                      .slice(0, 6)
                      .map((pastJ) => {
                        const isPastValidated = !!pastJ.parentValidated;
                        const pastDate = new Date(pastJ.journalDate + 'T00:00:00').toLocaleDateString(
                          'id-ID',
                          { weekday: 'short', day: 'numeric', month: 'short' }
                        );

                        return (
                          <div
                            key={pastJ.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                              isPastValidated
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 block truncate">
                                {pastDate}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {pastJ.completedCount || 0}/7 Selesai •{' '}
                                {isPastValidated ? (
                                  <strong className="text-emerald-700">✓ Tervalidasi</strong>
                                ) : (
                                  <span className="text-amber-700">Belum divalidasi</span>
                                )}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJournalToSign(pastJ);
                                setIsSignatureModalOpen(true);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                                isPastValidated
                                  ? 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                                  : 'bg-[#0753A5] text-white hover:bg-blue-700'
                              }`}
                            >
                              {isPastValidated ? 'Lihat TTD' : 'Validasi'}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 30-Day Habit Trends Visualization using Recharts */}
      <HabitTrendsChart
        journals={studentJournals}
        todayJournal={todayJournal}
      />

      {/* Monthly Statistics & Habitual Threshold Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Evaluasi Pembiasaan (Sinkron Realtime dengan Pengisian Jurnal Murid) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Header: Judul, Sinkronisasi Realtime, & Status Terbiasa */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Evaluasi Pembiasaan • {activeMonthLabel}
                  </span>
                  <button
                    type="button"
                    onClick={handleManualSync}
                    className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 rounded cursor-pointer"
                    title="Sinkronkan dengan data jurnal terkini"
                  >
                    <RefreshCw className={`w-3 h-3 ${isManualSyncing ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700">
                    Sinkron Jurnal: {lastSyncTime} WITA
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full shrink-0 self-start sm:self-auto ${
                  selectedHabitEval === 'ALL'
                    ? habitualCount >= 5 || averageCompletedDays >= targetThreshold
                      ? 'bg-emerald-100 text-emerald-800'
                      : recordedDays > 0 || averageCompletedDays > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                    : currentHabitEval?.isHabitual
                    ? 'bg-emerald-100 text-emerald-800'
                    : (currentHabitEval?.completedDays || 0) > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {selectedHabitEval === 'ALL'
                  ? habitualCount >= 5 || averageCompletedDays >= targetThreshold
                    ? 'Sudah Terbiasa'
                    : recordedDays > 0 || averageCompletedDays > 0
                    ? 'Sedang Berproses'
                    : 'Belum Terbiasa'
                  : currentHabitEval?.isHabitual
                  ? 'Sudah Terbiasa'
                  : (currentHabitEval?.completedDays || 0) > 0
                  ? 'Sedang Berproses'
                  : 'Belum Terbiasa'}
              </span>
            </div>

            {/* Quick Dimensi Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedHabitEval('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedHabitEval === 'ALL'
                    ? 'bg-[#0753A5] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                7 Kebiasaan ({habitualCount}/7)
              </button>
              {habitsEvaluation.map((h) => {
                const isSelected = selectedHabitEval === h.code;
                const shortLabel =
                  h.code === 'WAKE_EARLY'
                    ? 'Bangun Pagi'
                    : h.code === 'WORSHIP'
                    ? 'Beribadah'
                    : h.code === 'EXERCISE'
                    ? 'Olahraga'
                    : h.code === 'HEALTHY_EATING'
                    ? 'Makan Sehat'
                    : h.code === 'LEARNING'
                    ? 'Belajar'
                    : h.code === 'SOCIAL'
                    ? 'Masyarakat'
                    : 'Tidur Cepat';
                return (
                  <button
                    key={h.code}
                    type="button"
                    onClick={() => setSelectedHabitEval(h.code)}
                    className={`px-2 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#0753A5] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{shortLabel}</span>
                    {h.isHabitual && <span className="text-emerald-400 text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Main Progress Figures */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {selectedHabitEval === 'ALL' ? averageCompletedDays : currentHabitEval?.completedDays || 0}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  / {targetThreshold} hari target {selectedHabitEval === 'ALL' ? '(rata-rata)' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {selectedHabitEval === 'ALL'
                  ? `Rumus Baku: 2/3 × ${daysInMonth} hari = minimal ${targetThreshold} hari konsisten. Sebanyak ${habitualCount} dari 7 kebiasaan sudah mencapai target pembiasaan.`
                  : `Keterlaksanaan ${currentHabitEval?.name}: tercapai ${currentHabitEval?.completedDays || 0} hari (${currentHabitEval?.consistencyRate || 0}% konsistensi) dari ${recordedDays} hari pengisian jurnal.`}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#41A85F] h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    selectedHabitEval === 'ALL'
                      ? Math.round((averageCompletedDays / targetThreshold) * 100)
                      : currentHabitEval?.progressPercent || 0
                  )}%`,
                }}
              />
            </div>

            {/* Collapsible Detail 7 Kebiasaan */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowHabitsDetail(!showHabitsDetail)}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>{showHabitsDetail ? 'Sembunyikan Rincian 7 Kebiasaan' : 'Lihat Rincian Capaian 7 Kebiasaan'}</span>
                {showHabitsDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showHabitsDetail && (
                <div className="mt-2.5 space-y-1.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto scrollbar-thin">
                  {habitsEvaluation.map((h) => {
                    const HabitIcon = habitsIconMap[h.code as keyof typeof habitsIconMap] || Sun;
                    return (
                      <div
                        key={h.code}
                        onClick={() => setSelectedHabitEval(h.code)}
                        className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          selectedHabitEval === h.code
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              h.isHabitual ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <HabitIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-slate-800 block truncate">
                              {h.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {h.completedDays} / {targetThreshold} hari • {h.consistencyRate}% konsistensi
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            h.isHabitual
                              ? 'bg-emerald-100 text-emerald-800'
                              : h.completedDays > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {h.isHabitual ? 'Sudah Terbiasa' : h.completedDays > 0 ? 'Sedang Berproses' : 'Belum'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer Card: Kelengkapan Jurnal & Input Hari Ini */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span>Kelengkapan Jurnal:</span>
              <span className="font-bold text-[#0753A5]">
                {completenessRate}% ({recordedDays}/{daysInMonth} hari)
              </span>
            </div>
            {completedCount > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                Hari ini: {completedCount}/7 ✓
              </span>
            )}
          </div>

          {onOpenReportModal && (
            <button
              type="button"
              onClick={() => onOpenReportModal({ id: studentId, name: studentName, nisn: studentNisn, className })}
              className="w-full mt-3 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#0753A5] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Buka Dokumen Resmi Portofolio Bulanan 7KAIH untuk siswa ini"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Dokumen Portofolio Resmi Bulanan</span>
            </button>
          )}
        </div>

        {/* Card 2: AI Teman Belajar & Refleksi */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-white p-6 rounded-3xl border border-indigo-100 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Teman AI SI-7KAIH</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {recordedDays > 0
                ? `"Hebat ${firstName}! Kamu sudah mencatatkan jurnal pembiasaan baikmu. Tetap semangat melatih 7 kebiasaan anak Indonesia hebat setiap hari!"`
                : `"Halo ${firstName}! Jurnal 7 Kebiasaan Anak Indonesia Hebat siap diisi. Tiap langkah kecil kebaikanmu membentuk karakter cerdas dan berakhlak mulia!"`}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-indigo-100/60 flex items-center justify-between">
            <button
              onClick={onOpenAICoach}
              className="text-xs sm:text-sm font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Tanya Teman AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenReflection}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
            >
              Refleksi {activeMonthLabel}
            </button>
          </div>
        </div>

        {/* Card 3: Pencapaian & Lencana Karakter Positif */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            {/* Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Lencana Pencapaian Karakter</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Apresiasi proses & pembiasaan 7 Kebiasaan Anak Indonesia Hebat
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCriteriaGuideOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Lihat kriteria & panduan perolehan lencana"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Kriteria</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenBadges}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sub-header status & filter chips */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setBadgeFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    badgeFilter === 'ALL'
                      ? 'bg-[#0753A5] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({syncedBadges.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBadgeFilter('EARNED')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    badgeFilter === 'EARNED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Diraih ({earnedBadgesCount})
                </button>
                <button
                  type="button"
                  onClick={() => setBadgeFilter('IN_PROGRESS')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    badgeFilter === 'IN_PROGRESS'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Berproses ({inProgressBadgesCount})
                </button>
              </div>

              <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{earnedBadgesCount} dari {syncedBadges.length} Terbuka</span>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredBadges.slice(0, 6).map((b) => {
                const isEarned = !!b.earnedAt;
                const visual = getBadgeVisual(b.code, isEarned);
                const current = b.currentCount || 0;
                const target = b.targetCount || 14;
                const pct = typeof b.progressPercent === 'number' ? b.progressPercent : Math.min(100, Math.round((current / target) * 100));

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBadgeDetail(b)}
                    className={`p-3 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer hover:shadow-xs hover:border-blue-300 ${
                      isEarned
                        ? 'bg-amber-50/70 border-amber-300/80 text-slate-900'
                        : 'bg-slate-50/80 border-slate-200/80 text-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">{visual.emoji}</span>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                            isEarned
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-slate-200 text-slate-600 border-slate-300'
                          }`}
                        >
                          {isEarned ? 'Diraih ✓' : `${current}/${target} H`}
                        </span>
                      </div>
                      <p className="text-xs font-bold leading-tight line-clamp-1 text-slate-900">
                        {b.title}
                      </p>
                      <span className="text-[10px] text-slate-500 block line-clamp-1 mt-0.5">
                        {visual.dimension}
                      </span>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-200/60">
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isEarned ? 'bg-emerald-500' : 'bg-[#0753A5]'
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1 font-medium">
                        <span>{isEarned ? 'Tuntas' : `Target: ${target} H`}</span>
                        <span className="font-bold text-slate-700">{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredBadges.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Tidak ada lencana pada filter ini.
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px]">Tanpa perankingan: Fokus pada apresiasi proses & konsistensi diri.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCriteriaGuideOpen(true)}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer ml-2 shrink-0"
            >
              Panduan Kriteria &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Modal Panduan & Kriteria Diraih Lencana Karakter */}
      {isCriteriaGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col justify-between overflow-hidden">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Kriteria & Panduan Diraih Lencana Karakter</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standar Pembiasaan 7 Kebiasaan Anak Indonesia Hebat (Kemendikbudristek)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCriteriaGuideOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="overflow-y-auto py-4 space-y-3 pr-1">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Sinkronisasi Jurnal Aktif:</strong> Lencana ini diperbarui secara otomatis setiap kali ananda menyimpan atau memvalidasi jurnal pembiasaan harian. Tidak ada perankingan antar siswa.
                </p>
              </div>

              <div className="space-y-2.5">
                {syncedBadges.map((b) => {
                  const isEarned = !!b.earnedAt;
                  const visual = getBadgeVisual(b.code, isEarned);
                  const current = b.currentCount || 0;
                  const target = b.targetCount || 14;
                  const pct = typeof b.progressPercent === 'number' ? b.progressPercent : Math.min(100, Math.round((current / target) * 100));

                  return (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isEarned
                          ? 'bg-amber-50/50 border-amber-200 text-slate-900'
                          : 'bg-slate-50/60 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl shrink-0">{visual.emoji}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${visual.tagBg}`}>
                                {visual.dimension}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {b.description}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              <strong>Syarat Kriteria:</strong> {b.criteriaDescription || `Terlaksana minimal ${target} hari pembiasaan.`}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-block border ${
                              isEarned
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}
                          >
                            {isEarned ? 'Diraih ✓' : 'Berproses'}
                          </span>
                          <span className="block text-[11px] font-bold text-slate-700 mt-1">
                            {current} / {target} Hari ({pct}%)
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <div className="w-2/3 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isEarned ? 'bg-emerald-500' : 'bg-[#0753A5]'
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-500 ml-2">
                          {isEarned ? `Diraih: ${b.earnedAt}` : `Butuh ${Math.max(0, target - current)} hari lagi`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {earnedBadgesCount} dari {syncedBadges.length} Lencana telah berhasil diraih
              </span>
              <button
                type="button"
                onClick={() => setIsCriteriaGuideOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Lencana Tunggal */}
      {selectedBadgeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-3xl flex items-center justify-center shadow-xs">
                  {getBadgeVisual(selectedBadgeDetail.code, !!selectedBadgeDetail.earnedAt).emoji}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedBadgeDetail.title}</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {getBadgeVisual(selectedBadgeDetail.code, !!selectedBadgeDetail.earnedAt).dimension}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBadgeDetail(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>{selectedBadgeDetail.description}</p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Kriteria Syarat Perolehan:</span>
                  <span className="text-[#0753A5]">Target {selectedBadgeDetail.targetCount || 14} Hari</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  {selectedBadgeDetail.criteriaDescription || `Melaksanakan kebiasaan ini secara konsisten minimal ${selectedBadgeDetail.targetCount || 14} hari pembiasaan.`}
                </p>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span>Progres Ananda:</span>
                    <span className={selectedBadgeDetail.earnedAt ? 'text-emerald-700 font-bold' : 'text-blue-700 font-bold'}>
                      {selectedBadgeDetail.currentCount || 0} / {selectedBadgeDetail.targetCount || 14} Hari ({selectedBadgeDetail.progressPercent || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedBadgeDetail.earnedAt ? 'bg-emerald-500' : 'bg-[#0753A5]'
                      }`}
                      style={{ width: `${selectedBadgeDetail.progressPercent || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Status Saat Ini:</strong>{' '}
                  {selectedBadgeDetail.earnedAt ? (
                    <span className="text-emerald-800 font-bold">
                      Selamat! Lencana ini telah berhasil diraih pada {selectedBadgeDetail.earnedAt}.
                    </span>
                  ) : (
                    <span>
                      Sedang berproses. Masih memerlukan {Math.max(0, (selectedBadgeDetail.targetCount || 14) - (selectedBadgeDetail.currentCount || 0))} hari pembiasaan lagi untuk membuka lencana ini.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBadgeDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tanda Tangan / Paraf Validasi Orang Tua (Dashboard Murid) */}
      {isSignatureModalOpen && selectedJournalToSign && (
        <ParentSignatureModal
          isOpen={isSignatureModalOpen}
          onClose={() => {
            setIsSignatureModalOpen(false);
            setSelectedJournalToSign(null);
          }}
          journal={selectedJournalToSign}
          studentName={studentName}
          className={className}
          defaultValidatorName={selectedJournalToSign.parentValidatorName}
          source="STUDENT_DASHBOARD"
          onSaveValidation={({ journalId, parentName, note, validationType, signatureDataUrl, source }) => {
            if (onValidateJournal) {
              onValidateJournal(journalId, undefined, note, {
                signature: signatureDataUrl,
                validatorName: parentName,
                validationType,
                source,
                asParent: true,
              });
            }
          }}
        />
      )}
    </div>
  );
};
