// ============================================================================
// SI-7KAIH AI - Habit7DayProgressBar Component
// Visualisasi Progress Bar & Konsistensi 7 Kebiasaan Selama 7 Hari Terakhir
// Menampilkan progress bar individual untuk setiap kebiasaan, matriks 7-hari,
// tingkat konsistensi, streak, dan ringkasan keterlaksanaan mingguan.
// ============================================================================

import React, { useMemo, useState } from 'react';
import {
  Sun,
  Heart,
  Activity,
  Utensils,
  BookOpen,
  Users,
  Moon,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  Flame,
  Calendar,
  ArrowUpDown,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Award,
} from 'lucide-react';
import { DailyJournal, HabitCode } from '../../packages/types/src/index';
import { HABIT_LIST } from '../lib/constants';
import { getLocalDateString } from '../lib/dateUtils';

interface Habit7DayProgressBarProps {
  journals: DailyJournal[];
  todayJournal?: DailyJournal;
  onOpenJournal?: () => void;
  onSelectDate?: (dateStr: string) => void;
  studentName?: string;
}

// Visual configurations for each of the 7 habits
const HABIT_CONFIG: Record<
  HabitCode,
  {
    icon: React.FC<{ className?: string }>;
    gradient: string;
    lightBg: string;
    border: string;
    textColor: string;
    barColor: string;
    targetSubtitle: string;
  }
> = {
  WAKE_EARLY: {
    icon: Sun,
    gradient: 'from-amber-400 to-amber-600',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-amber-800',
    barColor: 'bg-gradient-to-r from-amber-400 to-amber-500',
    targetSubtitle: 'Bangun pagi segar sebelum subuh / pukul 05:30 WITA',
  },
  WORSHIP: {
    icon: Heart,
    gradient: 'from-sky-400 to-blue-600',
    lightBg: 'bg-sky-50',
    border: 'border-sky-200',
    textColor: 'text-sky-800',
    barColor: 'bg-gradient-to-r from-sky-400 to-blue-600',
    targetSubtitle: 'Ibadah tepat waktu sesuai agama dan keyakinan',
  },
  EXERCISE: {
    icon: Activity,
    gradient: 'from-emerald-400 to-teal-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-800',
    barColor: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    targetSubtitle: 'Aktivitas fisik / olahraga sehat minimal 15-30 menit',
  },
  HEALTHY_EATING: {
    icon: Utensils,
    gradient: 'from-rose-400 to-red-600',
    lightBg: 'bg-rose-50',
    border: 'border-rose-200',
    textColor: 'text-rose-800',
    barColor: 'bg-gradient-to-r from-rose-400 to-red-500',
    targetSubtitle: 'Sarapan bergizi seimbang, sayur & cukup air putih',
  },
  LEARNING: {
    icon: BookOpen,
    gradient: 'from-purple-400 to-violet-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-800',
    barColor: 'bg-gradient-to-r from-purple-400 to-violet-600',
    targetSubtitle: 'Membaca buku atau belajar mandiri minimal 20 menit',
  },
  SOCIAL: {
    icon: Users,
    gradient: 'from-cyan-400 to-teal-600',
    lightBg: 'bg-cyan-50',
    border: 'border-cyan-200',
    textColor: 'text-cyan-800',
    barColor: 'bg-gradient-to-r from-cyan-400 to-teal-600',
    targetSubtitle: 'Membantu keluarga, menyapa tetangga, atau gotong royong',
  },
  SLEEP_EARLY: {
    icon: Moon,
    gradient: 'from-indigo-500 to-blue-700',
    lightBg: 'bg-indigo-50',
    border: 'border-indigo-200',
    textColor: 'text-indigo-800',
    barColor: 'bg-gradient-to-r from-indigo-500 to-blue-700',
    targetSubtitle: 'Tidur tepat waktu sebelum pukul 21:30 & batasi gawai',
  },
};

type SortMode = 'OFFICIAL' | 'HIGHEST' | 'LOWEST';

export const Habit7DayProgressBar: React.FC<Habit7DayProgressBarProps> = ({
  journals,
  todayJournal,
  onOpenJournal,
  onSelectDate,
  studentName = 'Peserta Didik',
}) => {
  const [sortMode, setSortMode] = useState<SortMode>('OFFICIAL');
  const [hoveredTile, setHoveredTile] = useState<{ habitCode: HabitCode; dateStr: string } | null>(null);

  // 1. Build the rolling 7-day window ending today (D-6 through D-0)
  const daysWindow = useMemo(() => {
    const list: Array<{
      dateStr: string;
      dateObj: Date;
      dayOfWeek: string;
      dayNum: number;
      monthShort: string;
      isToday: boolean;
      displayLabel: string;
    }> = [];

    const now = new Date();
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    const todayStr = getLocalDateString(now);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = getLocalDateString(d);
      list.push({
        dateStr,
        dateObj: d,
        dayOfWeek: dayNames[d.getDay()],
        dayNum: d.getDate(),
        monthShort: monthNames[d.getMonth()],
        isToday: dateStr === todayStr,
        displayLabel: `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`,
      });
    }

    return list;
  }, []);

  // 2. Index journals by date for quick O(1) lookups
  const journalMap = useMemo(() => {
    const map = new Map<string, DailyJournal>();

    journals.forEach((j) => {
      const d = j.journalDate || (j as any).date;
      if (d) {
        map.set(d, j);
      }
    });

    if (todayJournal?.journalDate) {
      map.set(todayJournal.journalDate, todayJournal);
    }

    return map;
  }, [journals, todayJournal]);

  // 3. Compute consistency metrics for each of the 7 habits across the 7-day window
  const habitsData = useMemo(() => {
    return HABIT_LIST.map((habit, index) => {
      const config = HABIT_CONFIG[habit.code] || HABIT_CONFIG.WAKE_EARLY;

      // Track daily status for all 7 days
      const daysStatus = daysWindow.map((day) => {
        const journal = journalMap.get(day.dateStr);
        let isDone = false;
        let note = '';
        let time = '';

        if (journal) {
          const entry =
            journal.entries?.[habit.code] ||
            (journal as any).habits?.[habit.code] ||
            (journal as any)[habit.code];

          isDone = !!(entry?.completed || entry === true);

          // Extract specific habit note or time if available
          if (entry?.data) {
            const d = entry.data;
            if (habit.code === 'WAKE_EARLY' && d.wokeUpAt) time = `Pukul ${d.wokeUpAt}`;
            if (habit.code === 'SLEEP_EARLY' && d.sleepTime) time = `Pukul ${d.sleepTime}`;
            if (habit.code === 'EXERCISE' && d.sportType) note = d.sportType;
            if (habit.code === 'LEARNING' && d.bookTitle) note = d.bookTitle;
            if (habit.code === 'SOCIAL' && d.socialAction) note = d.socialAction;
            if (habit.code === 'WORSHIP' && Array.isArray(d.prayActivities)) note = d.prayActivities.join(', ');
          }
        }

        return {
          dateStr: day.dateStr,
          dayOfWeek: day.dayOfWeek,
          dayNum: day.dayNum,
          monthShort: day.monthShort,
          displayLabel: day.displayLabel,
          isToday: day.isToday,
          isDone,
          note,
          time,
        };
      });

      const completedDays = daysStatus.filter((d) => d.isDone).length;
      const percentage = Math.round((completedDays / 7) * 100);

      // Current consecutive streak ending at the latest day (today or yesterday)
      let currentStreak = 0;
      for (let i = daysStatus.length - 1; i >= 0; i--) {
        if (daysStatus[i].isDone) {
          currentStreak++;
        } else if (i === daysStatus.length - 1 && daysStatus[i].isToday) {
          // If today isn't filled yet, check streak ending yesterday
          continue;
        } else {
          break;
        }
      }

      // Qualitative consistency status
      let consistencyStatus: {
        label: string;
        badgeColor: string;
        textColor: string;
        description: string;
      };

      if (completedDays === 7) {
        consistencyStatus = {
          label: 'Sangat Konsisten (100%)',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          textColor: 'text-emerald-700',
          description: 'Sempurna! Terlaksana tanpa terputus selama 7 hari penuh.',
        };
      } else if (completedDays >= 5) {
        consistencyStatus = {
          label: 'Konsisten (Terbiasa)',
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
          textColor: 'text-teal-700',
          description: 'Hebat! Mencapai ambang batas pembiasaan karakter (≥5 hari).',
        };
      } else if (completedDays >= 3) {
        consistencyStatus = {
          label: 'Mulai Terbentuk',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
          textColor: 'text-blue-700',
          description: 'Bagus, terus tingkatkan keteraturan pelaksanaan harian.',
        };
      } else if (completedDays >= 1) {
        consistencyStatus = {
          label: 'Perlu Pendampingan',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          textColor: 'text-amber-700',
          description: 'Masih perlu pengingat dan pendampingan orang tua/guru.',
        };
      } else {
        consistencyStatus = {
          label: 'Belum Terisi',
          badgeColor: 'bg-slate-100 text-slate-600 border-slate-300',
          textColor: 'text-slate-500',
          description: 'Belum ada catatan pelaksanaan dalam 7 hari terakhir.',
        };
      }

      return {
        habit,
        officialIndex: index + 1,
        config,
        daysStatus,
        completedDays,
        percentage,
        currentStreak,
        consistencyStatus,
      };
    });
  }, [daysWindow, journalMap]);

  // 4. Sorted habits based on user preference
  const sortedHabits = useMemo(() => {
    const list = [...habitsData];
    if (sortMode === 'HIGHEST') {
      return list.sort((a, b) => b.completedDays - a.completedDays);
    }
    if (sortMode === 'LOWEST') {
      return list.sort((a, b) => a.completedDays - b.completedDays);
    }
    return list; // Official 1-7 order
  }, [habitsData, sortMode]);

  // 5. Aggregate summary statistics for the 7-day period
  const aggregateStats = useMemo(() => {
    const totalPossible = 7 * 7; // 49 possible completions
    const totalCompleted = habitsData.reduce((acc, h) => acc + h.completedDays, 0);
    const overallPercentage = Math.round((totalCompleted / totalPossible) * 100);

    const sortedByCompletion = [...habitsData].sort((a, b) => b.completedDays - a.completedDays);
    const topHabit = sortedByCompletion[0];
    const lowestHabit = sortedByCompletion[sortedByCompletion.length - 1];

    const habitsHabitualCount = habitsData.filter((h) => h.completedDays >= 5).length;

    return {
      totalCompleted,
      totalPossible,
      overallPercentage,
      topHabit,
      lowestHabit,
      habitsHabitualCount,
    };
  }, [habitsData]);

  const startDateLabel = daysWindow[0]?.displayLabel || '';
  const endDateLabel = daysWindow[daysWindow.length - 1]?.displayLabel || '';

  return (
    <section
      aria-label="Progress Bar 7-Hari Konsistensi Kebiasaan"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6 transition-all"
    >
      {/* ==================================================================== */}
      {/* 1. HEADER SECTION & WINDOW INDICATOR */}
      {/* ==================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <TrendingUp className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Konsistensi 7 Kebiasaan Sepekan
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0753A5] border border-blue-200">
                <Calendar className="w-3 h-3 text-[#0753A5]" />
                <span>7 Hari Terakhir</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Pantau progress bar dan keteraturan setiap kebiasaan anak hebat{' '}
              <strong className="text-slate-700">{studentName}</strong> periode{' '}
              <span className="font-semibold text-slate-800">{startDateLabel} s.d. {endDateLabel}</span>.
            </p>
          </div>
        </div>

        {/* Controls: Sorting Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
            <span className="text-[10px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              <span>Urutkan:</span>
            </span>
            <button
              type="button"
              onClick={() => setSortMode('OFFICIAL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                sortMode === 'OFFICIAL'
                  ? 'bg-white text-[#0753A5] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Urutan Baku 7KAIH 1 s.d. 7"
            >
              Standar 1-7
            </button>
            <button
              type="button"
              onClick={() => setSortMode('HIGHEST')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                sortMode === 'HIGHEST'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Urutkan dari konsistensi tertinggi"
            >
              Tertinggi
            </button>
            <button
              type="button"
              onClick={() => setSortMode('LOWEST')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                sortMode === 'LOWEST'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Urutkan dari yang perlu ditingkatkan"
            >
              Fokus
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. SUMMARY METRICS RIBBON (4 KPI Cards) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Rata-rata Keterlaksanaan Mingguan */}
        <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-4 rounded-2xl border border-blue-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Konsistensi Sepekan
            </span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0753A5] tracking-tight">
              {aggregateStats.overallPercentage}%
            </span>
            <span className="text-xs font-semibold text-slate-600">
              ({aggregateStats.totalCompleted}/49 aksi)
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-tight">
            Tingkat keberhasilan pembiasaan menyeluruh
          </p>
        </div>

        {/* Metric 2: Kebiasaan Terbiasa (≥5 hari) */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-4 rounded-2xl border border-emerald-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Dimensi Terbiasa
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              {aggregateStats.habitsHabitualCount} / 7
            </span>
            <span className="text-xs font-semibold text-emerald-800">
              Kebiasaan
            </span>
          </div>
          <p className="text-[10px] text-emerald-700 mt-1 leading-tight font-medium">
            Memenuhi batas rutin (≥5 dari 7 hari)
          </p>
        </div>

        {/* Metric 3: Kebiasaan Paling Unggul */}
        <div className="bg-gradient-to-br from-amber-50/70 to-yellow-50/40 p-4 rounded-2xl border border-amber-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Paling Konsisten
            </span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-sm sm:text-base font-black text-slate-900 line-clamp-1">
              {aggregateStats.topHabit?.habit.name || '-'}
            </span>
            <span className="text-xs font-bold text-amber-800">
              {aggregateStats.topHabit?.completedDays || 0} dari 7 Hari ({aggregateStats.topHabit?.percentage || 0}%)
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-tight">
            Pertahankan ritme pembiasaan ini
          </p>
        </div>

        {/* Metric 4: Fokus Pendampingan */}
        <div className="bg-gradient-to-br from-rose-50/70 to-orange-50/40 p-4 rounded-2xl border border-rose-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Perlu Ditingkatkan
            </span>
            <HelpCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm sm:text-base font-black text-slate-900 line-clamp-1">
              {aggregateStats.lowestHabit?.habit.name || '-'}
            </span>
            <span className="text-xs font-bold text-rose-700">
              {aggregateStats.lowestHabit?.completedDays || 0} dari 7 Hari ({aggregateStats.lowestHabit?.percentage || 0}%)
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-tight">
            Ajak ananda membiasakan hal ini hari ini
          </p>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. 7 INDIVIDUAL HABIT PROGRESS BARS WITH 7-DAY MATRIX */}
      {/* ==================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>Rincian 7-Hari Per Kebiasaan</span>
            <span className="text-slate-400 font-normal">·</span>
            <span className="text-slate-500 font-medium normal-case">
              Klik pada hari untuk melengkapi atau meninjau jurnal
            </span>
          </h4>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Target Pembiasaan Baku: 5/7 Hari
          </span>
        </div>

        <div className="space-y-3.5">
          {sortedHabits.map((item) => {
            const { habit, officialIndex, config, daysStatus, completedDays, percentage, currentStreak, consistencyStatus } = item;
            const Icon = config.icon;

            return (
              <div
                key={habit.code}
                className="p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-white hover:bg-slate-50/40 transition-all shadow-2xs space-y-3"
              >
                {/* A. Habit Header: Icon, Name, Target, Ratio & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Habit Number & Gradient Icon */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${config.gradient} text-white flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.3]" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-slate-400">
                          #{officialIndex}
                        </span>
                        <h5 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                          {habit.name}
                        </h5>
                        {currentStreak >= 3 && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                            title={`Streak beruntun: ${currentStreak} hari aktif terlaksana`}
                          >
                            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{currentStreak} Hari Beruntun</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {config.targetSubtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right: Ratio Pill & Status */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${consistencyStatus.badgeColor}`}
                      title={consistencyStatus.description}
                    >
                      {consistencyStatus.label}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">
                        {completedDays}/7
                      </span>
                      <span className="text-xs font-semibold text-slate-400 ml-1">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* B. THE 7-DAY PROGRESS BAR WITH VISIBLE 7-DAY INTERVAL TICKS */}
                <div className="space-y-1.5">
                  <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
                    {/* Background tick markers for each of the 7 days (at 1/7, 2/7, 3/7, 4/7, 5/7, 6/7) */}
                    <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-10 opacity-30">
                      {[1, 2, 3, 4, 5, 6].map((tick) => (
                        <div
                          key={tick}
                          className="h-full w-0.5 bg-slate-400"
                          style={{ left: `${(tick / 7) * 100}%`, position: 'absolute' }}
                        />
                      ))}
                    </div>

                    {/* Target Threshold Indicator (5/7 = 71.4%) */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-20"
                      style={{ left: `${(5 / 7) * 100}%` }}
                      title="Ambang Batas Terbiasa: 5 Hari (71.4%)"
                    />

                    {/* Animated Fill Bar */}
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out shadow-xs ${config.barColor}`}
                      style={{ width: `${(completedDays / 7) * 100}%` }}
                    />
                  </div>

                  {/* Progress Bar Micro-legend */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5 font-medium">
                    <span>0 Hari</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Target Terbiasa: 5 Hari
                    </span>
                    <span>7 Hari (100%)</span>
                  </div>
                </div>

                {/* C. 7-DAY INTERACTIVE DAY TILES (Day 1 s.d. Day 7) */}
                <div className="pt-1">
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {daysStatus.map((day) => {
                      const isHovered =
                        hoveredTile?.habitCode === habit.code &&
                        hoveredTile?.dateStr === day.dateStr;

                      return (
                        <button
                          key={day.dateStr}
                          type="button"
                          onClick={() => {
                            if (onSelectDate) onSelectDate(day.dateStr);
                            if (onOpenJournal) onOpenJournal();
                          }}
                          onMouseEnter={() => setHoveredTile({ habitCode: habit.code, dateStr: day.dateStr })}
                          onMouseLeave={() => setHoveredTile(null)}
                          className={`group relative p-1.5 sm:p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[52px] sm:min-h-[58px] ${
                            day.isDone
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 hover:bg-emerald-100 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          } ${day.isToday ? 'ring-2 ring-blue-500 ring-offset-1 font-bold' : ''}`}
                          title={`${habit.name} · ${day.displayLabel}: ${day.isDone ? 'Terlaksana ✅' : 'Belum Terisi ⏳'}${day.time ? ` (${day.time})` : ''}${day.note ? ` - ${day.note}` : ''}`}
                        >
                          {/* Day Header */}
                          <div className="w-full flex items-center justify-between text-[9px] sm:text-[10px] leading-tight">
                            <span className="font-extrabold text-slate-700">{day.dayOfWeek}</span>
                            <span className="text-slate-400 font-medium">{day.dayNum}</span>
                          </div>

                          {/* Completion Icon */}
                          <div className="my-0.5">
                            {day.isDone ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-200/80 text-slate-400 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              </div>
                            )}
                          </div>

                          {/* Mini Label / Time indicator */}
                          <span className="text-[8px] sm:text-[9px] font-bold block truncate max-w-full">
                            {day.isDone ? (day.time ? day.time.replace('Pukul ', '') : 'Selesai') : day.isToday ? 'Hari ini' : '-'}
                          </span>

                          {/* Tooltip on Hover */}
                          {isHovered && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95">
                              <p className="font-bold">{day.displayLabel}</p>
                              <p className="text-slate-300">
                                {day.isDone ? `Terlaksana ${day.time || ''} ${day.note ? `(${day.note})` : ''}` : 'Belum tercatat'}
                              </p>
                              <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. FOOTER NOTE & CALL-TO-ACTION */}
      {/* ==================================================================== */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0753A5] flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900">
              Prinsip 7KAIH: Konsistensi Tanpa Hukuman
            </p>
            <p className="text-slate-500 text-[11px] leading-tight mt-0.5">
              Tiap hari adalah peluang baru untuk memupuk karakter hebat. Capai minimal 5 hari per kebiasaan untuk membentuk rutinitas permanen.
            </p>
          </div>
        </div>

        {onOpenJournal && (
          <button
            type="button"
            onClick={onOpenJournal}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Isi Jurnal Hari Ini</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </section>
  );
};
