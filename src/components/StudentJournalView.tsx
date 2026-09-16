// ============================================================================
// SI-7KAIH AI - Student Journal Full View Component
// Comprehensive daily habit logging, 7-day streak timeline, instant toggle,
// non-punitive guidance, and positive reinforcement
// ============================================================================

import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sun,
  HeartHandshake,
  Activity,
  Apple,
  BookOpen,
  Users,
  Moon,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  Flame,
  Info,
  Smile,
  ShieldCheck,
  RotateCcw,
  Clock,
} from 'lucide-react';
import {
  DailyJournal,
  HabitCode,
  WakeEarlyData,
  WorshipData,
  ExerciseData,
  HealthyEatingData,
  LearningData,
  SocialData,
  SleepEarlyData,
} from '../../packages/types/src/index';
import { HABIT_LIST, UserPersona } from '../lib/constants';
import { formatRealtimeSaveTime } from '../lib/dateUtils';

interface StudentJournalViewProps {
  journals: DailyJournal[];
  onSaveJournal: (journal: DailyJournal) => void;
  onResetDateJournal?: (date: string) => void;
  onResetAllJournals?: () => void;
  studentName: string;
  currentPersona?: UserPersona;
}

export const StudentJournalView: React.FC<StudentJournalViewProps> = ({
  journals,
  onSaveJournal,
  onResetDateJournal,
  onResetAllJournals,
  studentName,
  currentPersona,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const studentId = currentPersona?.id || 'usr-student-01';
  const schoolId = currentPersona?.schoolId || 's1000000-0000-0000-0000-000000000001';
  const schoolName = currentPersona?.schoolName || 'Satuan Pendidikan';
  const className = currentPersona?.className || '';
  const studentNisn = currentPersona?.identifierValue || '';

  // Find existing journal for selectedDate matching this student
  const currentJournal = useMemo(() => {
    return (
      journals.find(
        (j) =>
          j.journalDate === selectedDate &&
          (j.studentId === studentId ||
            (studentNisn && j.studentId === studentNisn) ||
            (studentNisn && j.studentNisn === studentNisn) ||
            (j.studentName && j.studentName.toLowerCase() === studentName.toLowerCase()) ||
            (!j.studentId && studentId === 'usr-student-01'))
      ) || {
        id: `journal-${selectedDate}-${studentId}`,
        studentId,
        studentName,
        studentNisn,
        schoolId,
        schoolName,
        className,
        journalDate: selectedDate,
        status: 'DRAFT',
        completedCount: 0,
        entries: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }, [journals, selectedDate, studentId, studentName, studentNisn, schoolId, schoolName, className]);

  const currentSavedRealtime = useMemo(() => {
    if (currentJournal?.savedAt) return currentJournal.savedAt;
    if (currentJournal?.updatedAt && currentJournal.completedCount > 0) {
      return formatRealtimeSaveTime(currentJournal.updatedAt);
    }
    return null;
  }, [currentJournal]);

  // Local entry states for the 7 habits - defaults clean & empty
  const [wakeEarly, setWakeEarly] = useState<WakeEarlyData>({
    completed: !!currentJournal?.entries?.WAKE_EARLY?.completed,
    wakeTime: (currentJournal?.entries?.WAKE_EARLY?.data as WakeEarlyData)?.wakeTime || '',
    mood: (currentJournal?.entries?.WAKE_EARLY?.data as WakeEarlyData)?.mood || 'SEGAR',
    optionalNote: (currentJournal?.entries?.WAKE_EARLY?.data as WakeEarlyData)?.optionalNote || '',
  });

  const [worship, setWorship] = useState<WorshipData>({
    completed: !!currentJournal?.entries?.WORSHIP?.completed,
    optionalNote: (currentJournal?.entries?.WORSHIP?.data as WorshipData)?.optionalNote || '',
  });

  const [exercise, setExercise] = useState<ExerciseData>({
    completed: !!currentJournal?.entries?.EXERCISE?.completed,
    activityType: (currentJournal?.entries?.EXERCISE?.data as ExerciseData)?.activityType || '',
    durationMinutes: (currentJournal?.entries?.EXERCISE?.data as ExerciseData)?.durationMinutes || 0,
    feeling: (currentJournal?.entries?.EXERCISE?.data as ExerciseData)?.feeling || 'SEGAR',
    optionalNote: (currentJournal?.entries?.EXERCISE?.data as ExerciseData)?.optionalNote || '',
  });

  const [healthyEating, setHealthyEating] = useState<HealthyEatingData>({
    breakfast: !!(currentJournal?.entries?.HEALTHY_EATING?.data as HealthyEatingData)?.breakfast,
    vegetableOrFruit: !!(currentJournal?.entries?.HEALTHY_EATING?.data as HealthyEatingData)?.vegetableOrFruit,
    water: !!(currentJournal?.entries?.HEALTHY_EATING?.data as HealthyEatingData)?.water,
    optionalNote: (currentJournal?.entries?.HEALTHY_EATING?.data as HealthyEatingData)?.optionalNote || '',
  });

  const [learning, setLearning] = useState<LearningData>({
    completed: !!currentJournal?.entries?.LEARNING?.completed,
    activityType: (currentJournal?.entries?.LEARNING?.data as LearningData)?.activityType || '',
    durationMinutes: (currentJournal?.entries?.LEARNING?.data as LearningData)?.durationMinutes || 0,
    newLearning: (currentJournal?.entries?.LEARNING?.data as LearningData)?.newLearning || '',
  });

  const [social, setSocial] = useState<SocialData>({
    completed: !!currentJournal?.entries?.SOCIAL?.completed,
    activityTypes: (currentJournal?.entries?.SOCIAL?.data as SocialData)?.activityTypes || [],
    shortStory: (currentJournal?.entries?.SOCIAL?.data as SocialData)?.shortStory || '',
  });

  const [sleepEarly, setSleepEarly] = useState<SleepEarlyData>({
    completed: !!currentJournal?.entries?.SLEEP_EARLY?.completed,
    sleepTime: (currentJournal?.entries?.SLEEP_EARLY?.data as SleepEarlyData)?.sleepTime || '',
    screenFreeBeforeSleep: !!(currentJournal?.entries?.SLEEP_EARLY?.data as SleepEarlyData)?.screenFreeBeforeSleep,
    optionalNote: (currentJournal?.entries?.SLEEP_EARLY?.data as SleepEarlyData)?.optionalNote || '',
  });

  // Re-sync when selectedDate or journals change
  React.useEffect(() => {
    const j = journals.find((item) => item.journalDate === selectedDate);
    if (j && Object.keys(j.entries || {}).length > 0) {
      setWakeEarly({
        completed: !!j.entries.WAKE_EARLY?.completed,
        wakeTime: (j.entries.WAKE_EARLY?.data as WakeEarlyData)?.wakeTime || '',
        mood: (j.entries.WAKE_EARLY?.data as WakeEarlyData)?.mood || 'SEGAR',
        optionalNote: (j.entries.WAKE_EARLY?.data as WakeEarlyData)?.optionalNote || '',
      });
      setWorship({
        completed: !!j.entries.WORSHIP?.completed,
        optionalNote: (j.entries.WORSHIP?.data as WorshipData)?.optionalNote || '',
      });
      setExercise({
        completed: !!j.entries.EXERCISE?.completed,
        activityType: (j.entries.EXERCISE?.data as ExerciseData)?.activityType || '',
        durationMinutes: (j.entries.EXERCISE?.data as ExerciseData)?.durationMinutes || 0,
        feeling: (j.entries.EXERCISE?.data as ExerciseData)?.feeling || 'SEGAR',
        optionalNote: (j.entries.EXERCISE?.data as ExerciseData)?.optionalNote || '',
      });
      setHealthyEating({
        breakfast: !!(j.entries.HEALTHY_EATING?.data as HealthyEatingData)?.breakfast,
        vegetableOrFruit: !!(j.entries.HEALTHY_EATING?.data as HealthyEatingData)?.vegetableOrFruit,
        water: !!(j.entries.HEALTHY_EATING?.data as HealthyEatingData)?.water,
        optionalNote: (j.entries.HEALTHY_EATING?.data as HealthyEatingData)?.optionalNote || '',
      });
      setLearning({
        completed: !!j.entries.LEARNING?.completed,
        activityType: (j.entries.LEARNING?.data as LearningData)?.activityType || '',
        durationMinutes: (j.entries.LEARNING?.data as LearningData)?.durationMinutes || 0,
        newLearning: (j.entries.LEARNING?.data as LearningData)?.newLearning || '',
      });
      setSocial({
        completed: !!j.entries.SOCIAL?.completed,
        activityTypes: (j.entries.SOCIAL?.data as SocialData)?.activityTypes || [],
        shortStory: (j.entries.SOCIAL?.data as SocialData)?.shortStory || '',
      });
      setSleepEarly({
        completed: !!j.entries.SLEEP_EARLY?.completed,
        sleepTime: (j.entries.SLEEP_EARLY?.data as SleepEarlyData)?.sleepTime || '',
        screenFreeBeforeSleep: !!(j.entries.SLEEP_EARLY?.data as SleepEarlyData)?.screenFreeBeforeSleep,
        optionalNote: (j.entries.SLEEP_EARLY?.data as SleepEarlyData)?.optionalNote || '',
      });
    } else {
      // Empty / reset form for clean date
      setWakeEarly({ completed: false, wakeTime: '', mood: 'SEGAR', optionalNote: '' });
      setWorship({ completed: false, optionalNote: '' });
      setExercise({ completed: false, activityType: '', durationMinutes: 0, feeling: 'SEGAR', optionalNote: '' });
      setHealthyEating({ breakfast: false, vegetableOrFruit: false, water: false, optionalNote: '' });
      setLearning({ completed: false, activityType: '', durationMinutes: 0, newLearning: '' });
      setSocial({ completed: false, activityTypes: [], shortStory: '' });
      setSleepEarly({ completed: false, sleepTime: '', screenFreeBeforeSleep: false, optionalNote: '' });
    }
  }, [selectedDate, journals]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isHealthyCompleted = healthyEating.breakfast && (healthyEating.vegetableOrFruit || healthyEating.water);
  const completedCount =
    (wakeEarly.completed ? 1 : 0) +
    (worship.completed ? 1 : 0) +
    (exercise.completed ? 1 : 0) +
    (isHealthyCompleted ? 1 : 0) +
    (learning.completed ? 1 : 0) +
    (social.completed ? 1 : 0) +
    (sleepEarly.completed ? 1 : 0);

  const handleSave = () => {
    const journalId = currentJournal?.id || `journal-${selectedDate}-${studentId}`;
    const now = new Date();
    const realtimeInfo = formatRealtimeSaveTime(now);

    const updatedJournal: DailyJournal = {
      id: journalId,
      studentId,
      studentName,
      studentNisn,
      schoolId,
      schoolName,
      className,
      journalDate: selectedDate,
      status: completedCount >= 6 ? 'SUBMITTED_COMPLETED' : 'SUBMITTED_NOT_COMPLETED',
      completedCount,
      savedAt: realtimeInfo,
      createdAt: currentJournal?.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
      entries: {
        WAKE_EARLY: {
          id: `entry-${selectedDate}-WAKE_EARLY`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000001',
          habitCode: 'WAKE_EARLY',
          completed: wakeEarly.completed,
          data: wakeEarly,
          validationStatus: currentJournal?.entries?.WAKE_EARLY?.validationStatus || 'PENDING',
          parentValidated: currentJournal?.entries?.WAKE_EARLY?.parentValidated || false,
          teacherValidated: currentJournal?.entries?.WAKE_EARLY?.teacherValidated || false,
          createdAt: currentJournal?.entries?.WAKE_EARLY?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        WORSHIP: {
          id: `entry-${selectedDate}-WORSHIP`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000002',
          habitCode: 'WORSHIP',
          completed: worship.completed,
          data: worship,
          validationStatus: currentJournal?.entries?.WORSHIP?.validationStatus || 'PENDING',
          parentValidated: currentJournal?.entries?.WORSHIP?.parentValidated || false,
          teacherValidated: currentJournal?.entries?.WORSHIP?.teacherValidated || false,
          createdAt: currentJournal?.entries?.WORSHIP?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        EXERCISE: {
          id: `entry-${selectedDate}-EXERCISE`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000003',
          habitCode: 'EXERCISE',
          completed: exercise.completed,
          data: exercise,
          validationStatus: currentJournal?.entries?.EXERCISE?.validationStatus || 'PENDING',
          parentValidated: currentJournal?.entries?.EXERCISE?.parentValidated || false,
          teacherValidated: currentJournal?.entries?.EXERCISE?.teacherValidated || false,
          createdAt: currentJournal?.entries?.EXERCISE?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        HEALTHY_EATING: {
          id: `entry-${selectedDate}-HEALTHY_EATING`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000004',
          habitCode: 'HEALTHY_EATING',
          completed: isHealthyCompleted,
          data: healthyEating,
          validationStatus: currentJournal?.entries?.HEALTHY_EATING?.validationStatus || 'PENDING',
          parentValidated: currentJournal?.entries?.HEALTHY_EATING?.parentValidated || false,
          teacherValidated: currentJournal?.entries?.HEALTHY_EATING?.teacherValidated || false,
          createdAt: currentJournal?.entries?.HEALTHY_EATING?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        LEARNING: {
          id: `entry-${selectedDate}-LEARNING`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000005',
          habitCode: 'LEARNING',
          completed: learning.completed,
          data: learning,
          validationStatus: currentJournal?.entries?.LEARNING?.validationStatus || 'PENDING',
          parentValidated: currentJournal?.entries?.LEARNING?.parentValidated || false,
          teacherValidated: currentJournal?.entries?.LEARNING?.teacherValidated || false,
          createdAt: currentJournal?.entries?.LEARNING?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        SOCIAL: {
          id: `entry-${selectedDate}-SOCIAL`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000006',
          habitCode: 'SOCIAL',
          completed: social.completed,
          data: social,
          validationStatus: currentJournal?.entries?.SOCIAL?.validationStatus || 'PENDING',
          parentValidated: currentJournal?.entries?.SOCIAL?.parentValidated || false,
          teacherValidated: currentJournal?.entries?.SOCIAL?.teacherValidated || false,
          createdAt: currentJournal?.entries?.SOCIAL?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        SLEEP_EARLY: {
          id: `entry-${selectedDate}-SLEEP_EARLY`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000007',
          habitCode: 'SLEEP_EARLY',
          completed: sleepEarly.completed,
          data: sleepEarly,
          validationStatus: currentJournal?.entries?.SLEEP_EARLY?.validationStatus || 'PENDING',
          parentValidated: currentJournal?.entries?.SLEEP_EARLY?.parentValidated || false,
          teacherValidated: currentJournal?.entries?.SLEEP_EARLY?.teacherValidated || false,
          createdAt: currentJournal?.entries?.SLEEP_EARLY?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    };

    onSaveJournal(updatedJournal);

    if (completedCount >= 6) {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    showToast(`Pengisian selesai! Jurnal tanggal ${selectedDate} berhasil disimpan secara realtime: ${realtimeInfo}`);
  };

  // Reset / kosongkan isian form tanggal ini
  const handleResetCurrentJournal = () => {
    setWakeEarly({ completed: false, wakeTime: '', mood: 'SEGAR', optionalNote: '' });
    setWorship({ completed: false, optionalNote: '' });
    setExercise({ completed: false, activityType: '', durationMinutes: 0, feeling: 'SEGAR', optionalNote: '' });
    setHealthyEating({ breakfast: false, vegetableOrFruit: false, water: false, optionalNote: '' });
    setLearning({ completed: false, activityType: '', durationMinutes: 0, newLearning: '' });
    setSocial({ completed: false, activityTypes: [], shortStory: '' });
    setSleepEarly({ completed: false, sleepTime: '', screenFreeBeforeSleep: false, optionalNote: '' });

    if (onResetDateJournal) {
      onResetDateJournal(selectedDate);
    } else {
      const journalId = currentJournal?.id || `journal-${selectedDate}`;
      const emptyJournal: DailyJournal = {
        id: journalId,
        studentId: currentJournal?.studentId || 'usr-student-01',
        schoolId: currentJournal?.schoolId || 's1000000-0000-0000-0000-000000000001',
        journalDate: selectedDate,
        status: 'DRAFT',
        completedCount: 0,
        entries: {} as any,
        createdAt: currentJournal?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSaveJournal(emptyJournal);
    }

    showToast(`Isian jurnal tanggal ${selectedDate} berhasil dikosongkan/direset.`);
  };

  // Generate 7-day strip (3 days before, today, 3 days after or recent 7 days)
  const recentDays = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const match = journals.find((j) => j.journalDate === str);
      list.push({
        dateStr: str,
        dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        dayNum: d.getDate(),
        completedCount: match ? match.completedCount : 0,
        hasRecord: !!match,
      });
    }
    return list;
  }, [journals]);

  const formattedSelectedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Date Strip */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0753A5] to-[#20A5D5] flex items-center justify-center text-white text-xl font-black shadow-sm">
              📝
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Jurnal 7 Kebiasaan Anak Indonesia Hebat
              </h2>
              <p className="text-xs text-slate-500">
                Ananda {studentName} • Pengisian harian jujur, mandiri, dan berkesinambungan.
              </p>
            </div>
          </div>

          {/* Quick Date Switcher */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-blue-500 bg-slate-50 cursor-pointer"
            />
            {selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0753A5] hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Hari Ini
              </button>
            )}
          </div>
        </div>

        {/* 7-Day Completion Timeline */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">
            Linimasa Pembiasaan Sepekan Terakhir:
          </span>
          <div className="grid grid-cols-7 gap-2">
            {recentDays.map((item) => {
              const isSelected = item.dateStr === selectedDate;
              const isFull = item.completedCount >= 6;
              const isPartial = item.completedCount > 0 && item.completedCount < 6;
              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'border-[#0753A5] bg-blue-50/80 ring-2 ring-blue-400/30'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500">{item.dayName}</span>
                  <span className="text-xs font-black text-slate-800">{item.dayNum}</span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {item.hasRecord ? (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isFull ? 'bg-emerald-500' : isPartial ? 'bg-amber-400' : 'bg-slate-300'
                        }`}
                      />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-200" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Progress Banner */}
      <div className="bg-gradient-to-r from-[#0753A5] to-[#0A64C2] rounded-3xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Tanggal Jurnal: {formattedSelectedDate}
            </span>
            {currentSavedRealtime ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-300/40 text-[11px] font-semibold text-emerald-100 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Clock className="w-3 h-3 text-emerald-300" />
                <span>Info Simpan Realtime: {currentSavedRealtime}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-medium text-blue-100">
                <Clock className="w-3 h-3 text-blue-200" />
                <span>Info Simpan: Belum pernah disimpan</span>
              </span>
            )}
          </div>
          <h3 className="text-xl font-black mt-1">
            {completedCount === 7
              ? 'Luar Biasa! Semua 7 Kebiasaan Tuntas Hari Ini 🎉'
              : completedCount >= 5
              ? 'Hebat Sekali! Sedikit Lagi Lengkap Semuanya 🌟'
              : 'Mari Lengkapi Kebiasaan Baikmu Hari Ini ☀️'}
          </h3>
          <p className="text-xs text-blue-100 mt-0.5">
            Setiap kebiasaan kecil yang kamu lakukan mengasah karakter luhur dan jiwa pembelajar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-blue-200 block">Ketercapaian:</span>
            <span className="text-2xl font-black">{completedCount} / 7</span>
          </div>
          <button
            id="btn-reset-journal-entry-top"
            type="button"
            onClick={handleResetCurrentJournal}
            className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-rose-500/30 text-white border border-white/25 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            title="Kosongkan seluruh isian jurnal tanggal ini"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Isian</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-blue-50 text-[#0753A5] font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Jurnal</span>
          </button>
        </div>
      </div>

      {/* 7 Habits Interactive Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Habit 1: Bangun Pagi */}
        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">1. Bangun Pagi</h4>
                <p className="text-[11px] text-slate-500">Memulai hari dengan segar dan tepat waktu</p>
              </div>
            </div>
            <button
              onClick={() => setWakeEarly((prev) => ({ ...prev, completed: !prev.completed }))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                wakeEarly.completed
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'border-2 border-slate-300 text-transparent hover:border-slate-400'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Jam Bangun:</label>
              <input
                type="time"
                value={wakeEarly.wakeTime}
                onChange={(e) => setWakeEarly({ ...wakeEarly, wakeTime: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Kondisi Bangun:</label>
              <select
                value={wakeEarly.mood}
                onChange={(e) => setWakeEarly({ ...wakeEarly, mood: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
              >
                <option value="SEGAR">Segar & Semangat</option>
                <option value="BIASA">Biasa Saja</option>
                <option value="NGANTUK">Masih Mengantuk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Habit 2: Beribadah */}
        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">2. Beribadah</h4>
                <p className="text-[11px] text-slate-500">Ibadah dan rasa syukur sesuai keyakinan</p>
              </div>
            </div>
            <button
              onClick={() => setWorship((prev) => ({ ...prev, completed: !prev.completed }))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                worship.completed
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'border-2 border-slate-300 text-transparent hover:border-slate-400'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs pt-1">
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Catatan Syukur / Doa:</label>
            <input
              type="text"
              value={worship.optionalNote || ''}
              onChange={(e) => setWorship({ ...worship, optionalNote: e.target.value })}
              placeholder="Contoh: Berdoa bersama keluarga sebelum sekolah..."
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
            />
          </div>
        </div>

        {/* Habit 3: Berolahraga */}
        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">3. Berolahraga</h4>
                <p className="text-[11px] text-slate-500">Aktivitas fisik menjaga kebugaran tubuh</p>
              </div>
            </div>
            <button
              onClick={() => setExercise((prev) => ({ ...prev, completed: !prev.completed }))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                exercise.completed
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'border-2 border-slate-300 text-transparent hover:border-slate-400'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Jenis Gerakan:</label>
              <input
                type="text"
                value={exercise.activityType}
                onChange={(e) => setExercise({ ...exercise, activityType: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Durasi (Menit):</label>
              <input
                type="number"
                min={5}
                max={120}
                value={exercise.durationMinutes}
                onChange={(e) => setExercise({ ...exercise, durationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Habit 4: Makan Sehat & Bergizi */}
        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Apple className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">4. Makan Sehat & Bergizi</h4>
                <p className="text-[11px] text-slate-500">Sarapan, sayur/buah, dan air putih cukup</p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isHealthyCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isHealthyCompleted ? 'Lengkap' : 'Pilih Menu'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
            <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={healthyEating.breakfast}
                onChange={(e) => setHealthyEating({ ...healthyEating, breakfast: e.target.checked })}
                className="rounded text-emerald-600"
              />
              <span className="font-semibold text-slate-700">Sarapan</span>
            </label>
            <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={healthyEating.vegetableOrFruit}
                onChange={(e) => setHealthyEating({ ...healthyEating, vegetableOrFruit: e.target.checked })}
                className="rounded text-emerald-600"
              />
              <span className="font-semibold text-slate-700">Sayur/Buah</span>
            </label>
            <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={healthyEating.water}
                onChange={(e) => setHealthyEating({ ...healthyEating, water: e.target.checked })}
                className="rounded text-emerald-600"
              />
              <span className="font-semibold text-slate-700">Air Cukup</span>
            </label>
          </div>
        </div>

        {/* Habit 5: Gemar Belajar */}
        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">5. Gemar Belajar</h4>
                <p className="text-[11px] text-slate-500">Literasi, rasa ingin tahu, dan wawasan baru</p>
              </div>
            </div>
            <button
              onClick={() => setLearning((prev) => ({ ...prev, completed: !prev.completed }))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                learning.completed
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'border-2 border-slate-300 text-transparent hover:border-slate-400'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Aktivitas Belajar:</label>
                <input
                  type="text"
                  value={learning.activityType}
                  onChange={(e) => setLearning({ ...learning, activityType: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Durasi (Menit):</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={learning.durationMinutes}
                  onChange={(e) => setLearning({ ...learning, durationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Hal Menarik yang Dipelajari:</label>
              <input
                type="text"
                value={learning.newLearning || ''}
                onChange={(e) => setLearning({ ...learning, newLearning: e.target.value })}
                placeholder="Ceritakan satu hal baru yang kamu pelajari..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Habit 6: Bermasyarakat */}
        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">6. Bermasyarakat</h4>
                <p className="text-[11px] text-slate-500">Membantu sesama, ramah, dan peduli lingkungan</p>
              </div>
            </div>
            <button
              onClick={() => setSocial((prev) => ({ ...prev, completed: !prev.completed }))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                social.completed
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'border-2 border-slate-300 text-transparent hover:border-slate-400'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs pt-1 space-y-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Kebaikan yang Dilakukan:</label>
              <input
                type="text"
                value={social.shortStory || ''}
                onChange={(e) => setSocial({ ...social, shortStory: e.target.value })}
                placeholder="Contoh: Membantu ibu membersihkan meja, menyapa tetangga..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Habit 7: Istirahat / Tidur Tepat Waktu */}
        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">7. Tidur Cepat / Tepat Waktu</h4>
                <p className="text-[11px] text-slate-500">Tidur cukup memberi energi prima untuk esok hari</p>
              </div>
            </div>
            <button
              onClick={() => setSleepEarly((prev) => ({ ...prev, completed: !prev.completed }))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                sleepEarly.completed
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'border-2 border-slate-300 text-transparent hover:border-slate-400'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Target Jam Tidur:</label>
              <input
                type="time"
                value={sleepEarly.sleepTime}
                onChange={(e) => setSleepEarly({ ...sleepEarly, sleepTime: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
              />
            </div>
            <div className="flex items-center pt-4">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 cursor-pointer w-full">
                <input
                  type="checkbox"
                  checked={sleepEarly.screenFreeBeforeSleep}
                  onChange={(e) => setSleepEarly({ ...sleepEarly, screenFreeBeforeSleep: e.target.checked })}
                  className="rounded text-purple-600"
                />
                <span className="font-bold text-purple-900 text-xs">
                  Bebas Gawai 30 Menit Sebelum Tidur 📱❌
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save CTA Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengisian jujur dinilai lebih tinggi daripada sekadar angka. Belajar bertanggung jawab!</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {currentSavedRealtime && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100/90 px-3 py-2 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Info Simpan Realtime: <strong className="text-slate-900 font-bold">{currentSavedRealtime}</strong></span>
            </span>
          )}
          <button
            id="btn-reset-journal-entry-bottom"
            type="button"
            onClick={handleResetCurrentJournal}
            className="px-4 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Kosongkan seluruh isian jurnal tanggal ini"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Kosongkan / Reset Isian</span>
          </button>
          {onResetAllJournals && (
            <button
              id="btn-reset-all-journals-student"
              type="button"
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh riwayat jurnal siswa? Seluruh rekaman jurnal akan di-reset ke kondisi awal tanpa isian.')) {
                  onResetAllJournals();
                  handleResetCurrentJournal();
                }
              }}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Kosongkan seluruh riwayat semua tanggal"
            >
              <span>Reset Semua Tanggal</span>
            </button>
          )}
          <button
            id="btn-save-journal-entry-bottom"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-[#0753A5] hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Jurnal Tanggal Ini</span>
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
