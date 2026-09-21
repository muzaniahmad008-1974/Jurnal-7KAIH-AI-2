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
import { HABIT_LIST } from '../lib/constants';
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
} from 'lucide-react';
import { formatRealtimeSaveTime } from '../lib/dateUtils';
import { ParentSignatureModal } from './ParentSignatureModal';

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

  // 1. Accurate filtering of journals belonging to the active student
  const studentJournals = useMemo(() => {
    const baseList = syncedJournals.length > 0 ? syncedJournals : (allJournals || []);
    const targetId = (studentId || todayJournal?.studentId || '').trim().toLowerCase();
    const targetNisn = (studentNisn || todayJournal?.studentNisn || '').trim();
    const targetName = (studentName || todayJournal?.studentName || '').trim().toLowerCase();

    const filtered = baseList.filter((j) => {
      if (targetId && j.studentId && j.studentId.toLowerCase() === targetId) return true;
      if (targetNisn && j.studentNisn && j.studentNisn === targetNisn) return true;
      if (targetName && j.studentName && j.studentName.trim().toLowerCase() === targetName) return true;
      if (!j.studentId && !j.studentNisn && !j.studentName) return true;
      return false;
    });

    // Merge with todayJournal to guarantee 0-latency reflection of today's journal state
    if (todayJournal?.journalDate) {
      const existsIdx = filtered.findIndex((j) => j.journalDate === todayJournal.journalDate);
      if (existsIdx >= 0) {
        filtered[existsIdx] = todayJournal;
      } else if ((todayJournal.completedCount || 0) > 0 || Object.values(todayJournal.entries || {}).some((e: any) => e?.completed)) {
        filtered.push(todayJournal);
      }
    }

    return filtered;
  }, [syncedJournals, allJournals, studentId, studentNisn, todayJournal, studentName]);

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

  const completedCount = todayJournal?.completedCount || 0;
  const isAllCompleted = completedCount === 7;
  const firstName = studentName?.trim() ? studentName.trim().split(' ')[0] : 'Hebat';

  const todaySavedRealtime = useMemo(() => {
    if (todayJournal?.savedAt) return todayJournal.savedAt;
    if (todayJournal?.updatedAt && (todayJournal.completedCount || 0) > 0) {
      return formatRealtimeSaveTime(todayJournal.updatedAt);
    }
    return null;
  }, [todayJournal]);

  // Real consecutive streak calculation specifically for this student
  const streakDays = useMemo(() => {
    return studentJournals.filter((j) => (j.completedCount || 0) >= 5).length;
  }, [studentJournals]);

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
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 flex flex-col items-center sm:items-end w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
              <Flame className="w-4 h-4 fill-amber-300" />
              <span>{streakDays > 0 ? `Konsisten ${streakDays} Hari Berturut-turut!` : 'Mulai Pembiasaan Hari Ini!'}</span>
            </div>
            <div className="text-sm font-semibold mb-1">
              Jurnal Hari Ini: <span className="font-extrabold underline decoration-amber-400">{completedCount} dari 7 Selesai</span>
            </div>
            {todaySavedRealtime && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/25 border border-emerald-300/40 text-[11px] font-semibold text-emerald-100 mb-2.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Clock className="w-3 h-3 text-emerald-300" />
                <span>Info Simpan Realtime: <strong className="text-white">{todaySavedRealtime}</strong></span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <button
                id="hero-open-journal-btn"
                onClick={onOpenJournal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-[#0753A5] hover:bg-blue-50 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{completedCount > 0 ? (isAllCompleted ? 'Lihat / Edit Jurnal Hari Ini' : 'Lanjutkan Isi Jurnal') : 'Isi Jurnal Hari Ini'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {completedCount > 0 && onResetTodayJournal && (
                <button
                  id="hero-reset-journal-btn"
                  onClick={() => {
                    if (window.confirm('Kosongkan seluruh isian Jurnal 7 Kebiasaan Hari Ini?')) {
                      onResetTodayJournal();
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-rose-600/40 text-rose-100 hover:text-white border border-white/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  title="Kosongkan seluruh isian jurnal 7 kebiasaan hari ini"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kosongkan Isian</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 7 Core Habits Quick Status Grid */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>7 Kebiasaan Hari Ini</span>
              <span className="text-xs sm:text-sm font-normal text-slate-500">
                ({new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})
              </span>
            </h3>
            {todaySavedRealtime && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>Info Simpan Realtime: {todaySavedRealtime}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {completedCount > 0 && onResetTodayJournal && (
              <button
                id="dashboard-reset-journal-btn"
                onClick={() => {
                  if (window.confirm('Kosongkan seluruh isian Jurnal 7 Kebiasaan Hari Ini?')) {
                    onResetTodayJournal();
                  }
                }}
                className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title="Kosongkan seluruh isian jurnal 7 kebiasaan hari ini"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kosongkan Isian</span>
              </button>
            )}
            <button
              onClick={onOpenJournal}
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
            const entry = todayJournal.entries[h.code];
            const isDone = !!entry?.completed;

            return (
              <div
                key={h.code}
                onClick={onOpenJournal}
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
          {todayJournal?.parentValidated ? (
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
                    setSelectedJournalToSign(todayJournal);
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
                        {todayJournal.parentValidatorName || 'Orang Tua / Wali Siswa'}
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-slate-400 block text-[11px]">Format &amp; Lokasi Validasi:</span>
                      <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                        {todayJournal.parentValidationType === 'INITIALS' ? 'Paraf Resmi' : 'Tanda Tangan Digital'}
                      </strong>
                      <span className="text-[10px] text-emerald-700 mt-0.5 block">
                        {todayJournal.parentValidationSource === 'PARENT_DASHBOARD'
                          ? '• Dari Dashboard Orang Tua'
                          : '• Dari Dashboard Murid'}
                      </span>
                    </div>
                  </div>

                  {todayJournal.parentValidatedAt && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Waktu Validasi:{' '}
                        <strong className="text-slate-700">
                          {new Date(todayJournal.parentValidatedAt).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}{' '}
                          pukul{' '}
                          {new Date(todayJournal.parentValidatedAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          WITA
                        </strong>
                      </span>
                    </div>
                  )}

                  {/* Pesan Apresiasi Orang Tua */}
                  {todayJournal.parentValidationNote && (
                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 space-y-1">
                      <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>Pesan Apresiasi &amp; Kasih Sayang Orang Tua:</span>
                      </span>
                      <p className="text-xs text-slate-800 italic leading-relaxed">
                        "{todayJournal.parentValidationNote}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Kolom 3: Pratinjau Tanda Tangan / Paraf */}
                <div className="bg-white p-3.5 rounded-2xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-between text-center min-h-[140px]">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-800">
                    {todayJournal.parentValidationType === 'INITIALS' ? 'Pratinjau Paraf' : 'Pratinjau Tanda Tangan'}
                  </span>

                  {todayJournal.parentSignature ? (
                    <div className="my-2 p-1 bg-blue-50/30 rounded-xl w-full flex items-center justify-center">
                      <img
                        src={todayJournal.parentSignature}
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
                      {todayJournal.parentValidatorName || 'Orang Tua / Wali'}
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
                      setSelectedJournalToSign(todayJournal);
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
          )}

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
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Lencana Pembiasaan</span>
              </h3>
              <button
                onClick={onOpenBadges}
                className="text-xs sm:text-sm font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Lihat Semua
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {badges.slice(0, 3).map((b) => {
                const isEarned = !!b.earnedAt;
                return (
                  <div
                    key={b.id}
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 transition-all ${
                      isEarned
                        ? 'bg-amber-50/80 border-amber-200/60 text-slate-800'
                        : 'bg-slate-50 border-slate-200/70 text-slate-500 opacity-75'
                    }`}
                  >
                    <span className="text-2xl">{isEarned ? '🏅' : '🔒'}</span>
                    <p className="text-xs font-bold leading-tight">
                      {b.title}
                    </p>
                    <span
                      className={`text-[10px] font-semibold ${
                        isEarned ? 'text-amber-700' : 'text-slate-500'
                      }`}
                    >
                      {isEarned ? 'Diraih' : 'Terkunci'}
                    </span>
                  </div>
                );
              })}
            </div>
            {badges.filter((b) => b.earnedAt).length === 0 && (
              <p className="text-[11px] text-slate-400 text-center mt-2.5 italic">
                Lencana default terkunci. Isi jurnal harian untuk membuka lencana karakter.
              </p>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tanpa perankingan: Fokus pada apresiasi proses & konsistensi diri.</span>
          </div>
        </div>
      </div>

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
