// ============================================================================
// SI-7KAIH AI - Daily Habit Journal Component
// Fast, kid-friendly, under 1 minute completion, accessible, positive UX
// ============================================================================

import React, { useState, useEffect } from 'react';
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
  Save,
  Send,
  X,
  Sparkles,
  Info,
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
import { formatRealtimeSaveTime } from '../lib/dateUtils';
import { UserPersona } from '../lib/constants';

interface DailyJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalDate: string;
  initialJournal?: DailyJournal;
  onSave: (updatedJournal: DailyJournal) => void;
  onReset?: (date: string) => void;
  currentPersona?: UserPersona;
}

export const DailyJournalModal: React.FC<DailyJournalModalProps> = ({
  isOpen,
  onClose,
  journalDate,
  initialJournal,
  onSave,
  onReset,
  currentPersona,
}) => {
  // State for all 7 habits - defaults clean and empty
  const [wakeEarly, setWakeEarly] = useState<WakeEarlyData>({
    completed: !!initialJournal?.entries?.WAKE_EARLY?.completed,
    wakeTime: (initialJournal?.entries?.WAKE_EARLY?.data as WakeEarlyData)?.wakeTime || '',
    mood: (initialJournal?.entries?.WAKE_EARLY?.data as WakeEarlyData)?.mood || 'SEGAR',
    optionalNote: (initialJournal?.entries?.WAKE_EARLY?.data as WakeEarlyData)?.optionalNote || '',
  });

  const [worship, setWorship] = useState<WorshipData>({
    completed: !!initialJournal?.entries?.WORSHIP?.completed,
    optionalNote: (initialJournal?.entries?.WORSHIP?.data as WorshipData)?.optionalNote || '',
  });

  const [exercise, setExercise] = useState<ExerciseData>({
    completed: !!initialJournal?.entries?.EXERCISE?.completed,
    activityType: (initialJournal?.entries?.EXERCISE?.data as ExerciseData)?.activityType || '',
    durationMinutes: (initialJournal?.entries?.EXERCISE?.data as ExerciseData)?.durationMinutes || 0,
    feeling: (initialJournal?.entries?.EXERCISE?.data as ExerciseData)?.feeling || 'SEGAR',
    optionalNote: (initialJournal?.entries?.EXERCISE?.data as ExerciseData)?.optionalNote || '',
  });

  const [healthyEating, setHealthyEating] = useState<HealthyEatingData>({
    breakfast: !!(initialJournal?.entries?.HEALTHY_EATING?.data as HealthyEatingData)?.breakfast,
    vegetableOrFruit: !!(initialJournal?.entries?.HEALTHY_EATING?.data as HealthyEatingData)?.vegetableOrFruit,
    water: !!(initialJournal?.entries?.HEALTHY_EATING?.data as HealthyEatingData)?.water,
    optionalNote: (initialJournal?.entries?.HEALTHY_EATING?.data as HealthyEatingData)?.optionalNote || '',
  });

  const [learning, setLearning] = useState<LearningData>({
    completed: !!initialJournal?.entries?.LEARNING?.completed,
    activityType: (initialJournal?.entries?.LEARNING?.data as LearningData)?.activityType || '',
    durationMinutes: (initialJournal?.entries?.LEARNING?.data as LearningData)?.durationMinutes || 0,
    newLearning: (initialJournal?.entries?.LEARNING?.data as LearningData)?.newLearning || '',
  });

  const [social, setSocial] = useState<SocialData>({
    completed: !!initialJournal?.entries?.SOCIAL?.completed,
    activityTypes: (initialJournal?.entries?.SOCIAL?.data as SocialData)?.activityTypes || [],
    shortStory: (initialJournal?.entries?.SOCIAL?.data as SocialData)?.shortStory || '',
  });

  const [sleepEarly, setSleepEarly] = useState<SleepEarlyData>({
    completed: !!initialJournal?.entries?.SLEEP_EARLY?.completed,
    sleepTime: (initialJournal?.entries?.SLEEP_EARLY?.data as SleepEarlyData)?.sleepTime || '',
    screenFreeBeforeSleep: !!(initialJournal?.entries?.SLEEP_EARLY?.data as SleepEarlyData)?.screenFreeBeforeSleep,
    optionalNote: (initialJournal?.entries?.SLEEP_EARLY?.data as SleepEarlyData)?.optionalNote || '',
  });

  const [isSavedDraft, setIsSavedDraft] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);
  const [lastSavedRealtime, setLastSavedRealtime] = useState<string>(() => {
    if (initialJournal?.savedAt) return initialJournal.savedAt;
    if (initialJournal?.updatedAt && initialJournal.completedCount > 0) {
      return formatRealtimeSaveTime(initialJournal.updatedAt);
    }
    return '';
  });
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Sync state whenever modal opens or initialJournal / journalDate changes
  useEffect(() => {
    if (isOpen) {
      if (initialJournal && Object.keys(initialJournal.entries || {}).length > 0) {
        setWakeEarly({
          completed: !!initialJournal.entries.WAKE_EARLY?.completed,
          wakeTime: (initialJournal.entries.WAKE_EARLY?.data as WakeEarlyData)?.wakeTime || '',
          mood: (initialJournal.entries.WAKE_EARLY?.data as WakeEarlyData)?.mood || 'SEGAR',
          optionalNote: (initialJournal.entries.WAKE_EARLY?.data as WakeEarlyData)?.optionalNote || '',
        });
        setWorship({
          completed: !!initialJournal.entries.WORSHIP?.completed,
          optionalNote: (initialJournal.entries.WORSHIP?.data as WorshipData)?.optionalNote || '',
        });
        setExercise({
          completed: !!initialJournal.entries.EXERCISE?.completed,
          activityType: (initialJournal.entries.EXERCISE?.data as ExerciseData)?.activityType || '',
          durationMinutes: (initialJournal.entries.EXERCISE?.data as ExerciseData)?.durationMinutes || 0,
          feeling: (initialJournal.entries.EXERCISE?.data as ExerciseData)?.feeling || 'SEGAR',
          optionalNote: (initialJournal.entries.EXERCISE?.data as ExerciseData)?.optionalNote || '',
        });
        setHealthyEating({
          breakfast: !!(initialJournal.entries.HEALTHY_EATING?.data as HealthyEatingData)?.breakfast,
          vegetableOrFruit: !!(initialJournal.entries.HEALTHY_EATING?.data as HealthyEatingData)?.vegetableOrFruit,
          water: !!(initialJournal.entries.HEALTHY_EATING?.data as HealthyEatingData)?.water,
          optionalNote: (initialJournal.entries.HEALTHY_EATING?.data as HealthyEatingData)?.optionalNote || '',
        });
        setLearning({
          completed: !!initialJournal.entries.LEARNING?.completed,
          activityType: (initialJournal.entries.LEARNING?.data as LearningData)?.activityType || '',
          durationMinutes: (initialJournal.entries.LEARNING?.data as LearningData)?.durationMinutes || 0,
          newLearning: (initialJournal.entries.LEARNING?.data as LearningData)?.newLearning || '',
        });
        setSocial({
          completed: !!initialJournal.entries.SOCIAL?.completed,
          activityTypes: (initialJournal.entries.SOCIAL?.data as SocialData)?.activityTypes || [],
          shortStory: (initialJournal.entries.SOCIAL?.data as SocialData)?.shortStory || '',
        });
        setSleepEarly({
          completed: !!initialJournal.entries.SLEEP_EARLY?.completed,
          sleepTime: (initialJournal.entries.SLEEP_EARLY?.data as SleepEarlyData)?.sleepTime || '',
          screenFreeBeforeSleep: !!(initialJournal.entries.SLEEP_EARLY?.data as SleepEarlyData)?.screenFreeBeforeSleep,
          optionalNote: (initialJournal.entries.SLEEP_EARLY?.data as SleepEarlyData)?.optionalNote || '',
        });
        if (initialJournal.savedAt) {
          setLastSavedRealtime(initialJournal.savedAt);
        } else if (initialJournal.updatedAt && initialJournal.completedCount > 0) {
          setLastSavedRealtime(formatRealtimeSaveTime(initialJournal.updatedAt));
        } else {
          setLastSavedRealtime('');
        }
      } else {
        // Reset to clean empty form
        setWakeEarly({ completed: false, wakeTime: '', mood: 'SEGAR', optionalNote: '' });
        setWorship({ completed: false, optionalNote: '' });
        setExercise({ completed: false, activityType: '', durationMinutes: 0, feeling: 'SEGAR', optionalNote: '' });
        setHealthyEating({ breakfast: false, vegetableOrFruit: false, water: false, optionalNote: '' });
        setLearning({ completed: false, activityType: '', durationMinutes: 0, newLearning: '' });
        setSocial({ completed: false, activityTypes: [], shortStory: '' });
        setSleepEarly({ completed: false, sleepTime: '', screenFreeBeforeSleep: false, optionalNote: '' });
        setLastSavedRealtime('');
      }
      setIsSavedDraft(false);
      setSaveSuccessNotice(null);
    }
  }, [isOpen, initialJournal, journalDate]);

  if (!isOpen) return null;

  // Reset form handler
  const handleResetForm = () => {
    setWakeEarly({ completed: false, wakeTime: '', mood: 'SEGAR', optionalNote: '' });
    setWorship({ completed: false, optionalNote: '' });
    setExercise({ completed: false, activityType: '', durationMinutes: 0, feeling: 'SEGAR', optionalNote: '' });
    setHealthyEating({ breakfast: false, vegetableOrFruit: false, water: false, optionalNote: '' });
    setLearning({ completed: false, activityType: '', durationMinutes: 0, newLearning: '' });
    setSocial({ completed: false, activityTypes: [], shortStory: '' });
    setSleepEarly({ completed: false, sleepTime: '', screenFreeBeforeSleep: false, optionalNote: '' });
    setIsSavedDraft(false);
    setLastSavedRealtime('');
    setSaveSuccessNotice(null);
    setResetNotice(true);
    setTimeout(() => {
      setResetNotice(false);
    }, 4000);

    if (onReset) {
      onReset(journalDate);
    }
  };

  // Calculate completed count
  const isHealthyCompleted = healthyEating.breakfast && (healthyEating.vegetableOrFruit || healthyEating.water);
  const completedCount =
    (wakeEarly.completed ? 1 : 0) +
    (worship.completed ? 1 : 0) +
    (exercise.completed ? 1 : 0) +
    (isHealthyCompleted ? 1 : 0) +
    (learning.completed ? 1 : 0) +
    (social.completed ? 1 : 0) +
    (sleepEarly.completed ? 1 : 0);

  const handleSubmit = (isDraft = false) => {
    const studentId = initialJournal?.studentId || currentPersona?.id || 'usr-student-01';
    const schoolId = initialJournal?.schoolId || currentPersona?.schoolId || 's1000000-0000-0000-0000-000000000001';
    const schoolName = initialJournal?.schoolName || currentPersona?.schoolName || 'Satuan Pendidikan';
    const className = initialJournal?.className || currentPersona?.className || '';
    const studentName = initialJournal?.studentName || currentPersona?.name || 'Siswa';
    const studentNisn = initialJournal?.studentNisn || currentPersona?.identifierValue || '';
    const journalId = initialJournal?.id || `journal-${journalDate}-${studentId}`;

    const now = new Date();
    const realtimeInfo = formatRealtimeSaveTime(now);
    setLastSavedRealtime(realtimeInfo);

    const updated: DailyJournal = {
      id: journalId,
      studentId,
      studentName,
      studentNisn,
      schoolId,
      schoolName,
      className,
      journalDate,
      status: isDraft
        ? 'DRAFT'
        : completedCount >= 6
        ? 'SUBMITTED_COMPLETED'
        : 'SUBMITTED_NOT_COMPLETED',
      completedCount,
      savedAt: realtimeInfo,
      entries: {
        WAKE_EARLY: {
          id: `entry-${journalDate}-WAKE_EARLY`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000001',
          habitCode: 'WAKE_EARLY',
          completed: wakeEarly.completed,
          data: wakeEarly,
          validationStatus: initialJournal?.entries?.WAKE_EARLY?.validationStatus || 'PENDING',
          parentValidated: initialJournal?.entries?.WAKE_EARLY?.parentValidated || false,
          teacherValidated: initialJournal?.entries?.WAKE_EARLY?.teacherValidated || false,
          createdAt: initialJournal?.entries?.WAKE_EARLY?.createdAt || now.toISOString(),
          updatedAt: now.toISOString(),
        },
        WORSHIP: {
          id: `entry-${journalDate}-WORSHIP`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000002',
          habitCode: 'WORSHIP',
          completed: worship.completed,
          data: worship,
          validationStatus: initialJournal?.entries?.WORSHIP?.validationStatus || 'PENDING',
          parentValidated: initialJournal?.entries?.WORSHIP?.parentValidated || false,
          teacherValidated: initialJournal?.entries?.WORSHIP?.teacherValidated || false,
          createdAt: initialJournal?.entries?.WORSHIP?.createdAt || now.toISOString(),
          updatedAt: now.toISOString(),
        },
        EXERCISE: {
          id: `entry-${journalDate}-EXERCISE`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000003',
          habitCode: 'EXERCISE',
          completed: exercise.completed,
          data: exercise,
          validationStatus: initialJournal?.entries?.EXERCISE?.validationStatus || 'PENDING',
          parentValidated: initialJournal?.entries?.EXERCISE?.parentValidated || false,
          teacherValidated: initialJournal?.entries?.EXERCISE?.teacherValidated || false,
          createdAt: initialJournal?.entries?.EXERCISE?.createdAt || now.toISOString(),
          updatedAt: now.toISOString(),
        },
        HEALTHY_EATING: {
          id: `entry-${journalDate}-HEALTHY_EATING`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000004',
          habitCode: 'HEALTHY_EATING',
          completed: isHealthyCompleted,
          data: healthyEating,
          validationStatus: initialJournal?.entries?.HEALTHY_EATING?.validationStatus || 'PENDING',
          parentValidated: initialJournal?.entries?.HEALTHY_EATING?.parentValidated || false,
          teacherValidated: initialJournal?.entries?.HEALTHY_EATING?.teacherValidated || false,
          createdAt: initialJournal?.entries?.HEALTHY_EATING?.createdAt || now.toISOString(),
          updatedAt: now.toISOString(),
        },
        LEARNING: {
          id: `entry-${journalDate}-LEARNING`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000005',
          habitCode: 'LEARNING',
          completed: learning.completed,
          data: learning,
          validationStatus: initialJournal?.entries?.LEARNING?.validationStatus || 'PENDING',
          parentValidated: initialJournal?.entries?.LEARNING?.parentValidated || false,
          teacherValidated: initialJournal?.entries?.LEARNING?.teacherValidated || false,
          createdAt: initialJournal?.entries?.LEARNING?.createdAt || now.toISOString(),
          updatedAt: now.toISOString(),
        },
        SOCIAL: {
          id: `entry-${journalDate}-SOCIAL`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000006',
          habitCode: 'SOCIAL',
          completed: social.completed,
          data: social,
          validationStatus: initialJournal?.entries?.SOCIAL?.validationStatus || 'PENDING',
          parentValidated: initialJournal?.entries?.SOCIAL?.parentValidated || false,
          teacherValidated: initialJournal?.entries?.SOCIAL?.teacherValidated || false,
          createdAt: initialJournal?.entries?.SOCIAL?.createdAt || now.toISOString(),
          updatedAt: now.toISOString(),
        },
        SLEEP_EARLY: {
          id: `entry-${journalDate}-SLEEP_EARLY`,
          dailyJournalId: journalId,
          habitId: 'b1000000-0000-0000-0000-000000000007',
          habitCode: 'SLEEP_EARLY',
          completed: sleepEarly.completed,
          data: sleepEarly,
          validationStatus: initialJournal?.entries?.SLEEP_EARLY?.validationStatus || 'PENDING',
          parentValidated: initialJournal?.entries?.SLEEP_EARLY?.parentValidated || false,
          teacherValidated: initialJournal?.entries?.SLEEP_EARLY?.teacherValidated || false,
          createdAt: initialJournal?.entries?.SLEEP_EARLY?.createdAt || now.toISOString(),
          updatedAt: now.toISOString(),
        },
      },
      createdAt: initialJournal?.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
    };

    onSave(updated);

    if (!isDraft) {
      setSaveSuccessNotice(`Pengisian selesai! Jurnal tersimpan realtime pada ${realtimeInfo}`);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Safe if confetti fails
      }
      setTimeout(() => {
        onClose();
      }, 1100);
    } else {
      setIsSavedDraft(true);
      setSaveSuccessNotice(`Draf isian jurnal berhasil disimpan realtime pada ${realtimeInfo}`);
      setTimeout(() => {
        setIsSavedDraft(false);
      }, 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-slate-50">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl">🌟</span>
              <h2 className="text-lg font-black text-[#0753A5]">
                Jurnal 7 Kebiasaan Hari Ini
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#0753A5]">
                {journalDate}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs text-slate-500">
                Catat rutinitas positifmu dengan jujur & gembira (&lt; 1 menit).
              </p>
              {lastSavedRealtime ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>Info Simpan Realtime: {lastSavedRealtime}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Info Simpan: Belum pernah disimpan</span>
                </span>
              )}
            </div>
          </div>
          <button
            id="close-journal-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker Bar */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">
              Progres Pembiasaan:
            </span>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-xs">
              {completedCount} dari 7 Selesai
            </span>
          </div>
          <div className="w-36 sm:w-48 bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#20A5D5] to-[#41A85F] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Realtime Save Success Notification */}
        {saveSuccessNotice && (
          <div className="mx-6 mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-300/80 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in fade-in slide-in-from-top-1 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessNotice}</span>
            </div>
            <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-md font-mono shrink-0 ml-2">
              REALTIME SYNC
            </span>
          </div>
        )}

        {/* Reset Feedback Notification */}
        {resetNotice && (
          <div className="mx-6 mt-3 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs font-semibold text-rose-700 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Seluruh isian Jurnal 7 Kebiasaan telah berhasil dikosongkan.</span>
            </div>
            <button
              onClick={() => setResetNotice(false)}
              className="text-rose-400 hover:text-rose-700 text-xs font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Body - 7 Habit Cards */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* 1. Bangun Pagi */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-all shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">1. Bangun Pagi</h3>
                  <p className="text-xs text-slate-500">Membiasakan bangun lebih awal dengan ceria.</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="habit-wake-completed"
                  checked={wakeEarly.completed}
                  onChange={(e) => setWakeEarly({ ...wakeEarly, completed: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded-md cursor-pointer accent-[#0753A5]"
                />
                <span className="text-xs font-bold text-slate-700">Selesai</span>
              </label>
            </div>

            {wakeEarly.completed && (
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Jam Bangun:</label>
                  <input
                    type="time"
                    value={wakeEarly.wakeTime}
                    onChange={(e) => setWakeEarly({ ...wakeEarly, wakeTime: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">Rekomendasi edukasi: 04:30 - 06:00</span>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Suasana Hati:</label>
                  <select
                    value={wakeEarly.mood}
                    onChange={(e) => setWakeEarly({ ...wakeEarly, mood: e.target.value as WakeEarlyData['mood'] })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-blue-500"
                  >
                    <option value="SANGAT_SEGAR">😊 Sangat Segar & Ceria</option>
                    <option value="SEGAR">🙂 Segar</option>
                    <option value="BIASA">😐 Cukup Biasa</option>
                    <option value="MENGANTUK">🥱 Masih Agak Mengantuk</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 2. Beribadah */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-all shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">2. Beribadah</h3>
                  <p className="text-xs text-slate-500">Beribadah sesuai agama & keyakinan masing-masing secara tulus.</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="habit-worship-completed"
                  checked={worship.completed}
                  onChange={(e) => setWorship({ ...worship, completed: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded-md cursor-pointer accent-[#0753A5]"
                />
                <span className="text-xs font-bold text-slate-700">Selesai</span>
              </label>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
              <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Privasi dijaga: Tanpa kewajiban foto ibadah & tanpa penilaian tingkat keimanan.</span>
            </div>
          </div>

          {/* 3. Berolahraga */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-all shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">3. Berolahraga</h3>
                  <p className="text-xs text-slate-500">Aktivitas fisik gembira minimal 15-30 menit.</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="habit-exercise-completed"
                  checked={exercise.completed}
                  onChange={(e) => setExercise({ ...exercise, completed: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded-md cursor-pointer accent-[#0753A5]"
                />
                <span className="text-xs font-bold text-slate-700">Selesai</span>
              </label>
            </div>

            {exercise.completed && (
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Aktivitas Olahraga:</label>
                  <input
                    type="text"
                    value={exercise.activityType}
                    onChange={(e) => setExercise({ ...exercise, activityType: e.target.value })}
                    placeholder="Misal: Senam, Jalan Santai, Sepeda"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Durasi (Menit):</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={exercise.durationMinutes}
                    onChange={(e) => setExercise({ ...exercise, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Makan Sehat dan Bergizi */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-all shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">4. Makan Sehat dan Bergizi</h3>
                  <p className="text-xs text-slate-500">Sarapan bernutrisi, konsumsi buah/sayur & air putih cukup.</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isHealthyCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {isHealthyCompleted ? 'Tercapai' : 'Belum Lengkap'}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={healthyEating.breakfast}
                  onChange={(e) => setHealthyEating({ ...healthyEating, breakfast: e.target.checked })}
                  className="rounded text-blue-600 accent-[#0753A5]"
                />
                <span className="font-semibold text-slate-700">🍳 Sarapan Sehat</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={healthyEating.vegetableOrFruit}
                  onChange={(e) => setHealthyEating({ ...healthyEating, vegetableOrFruit: e.target.checked })}
                  className="rounded text-blue-600 accent-[#0753A5]"
                />
                <span className="font-semibold text-slate-700">🥗 Sayur / Buah</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={healthyEating.water}
                  onChange={(e) => setHealthyEating({ ...healthyEating, water: e.target.checked })}
                  className="rounded text-blue-600 accent-[#0753A5]"
                />
                <span className="font-semibold text-slate-700">💧 Cukup Air Putih</span>
              </label>
            </div>
          </div>

          {/* 5. Gemar Belajar */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-all shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">5. Gemar Belajar</h3>
                  <p className="text-xs text-slate-500">Membaca buku atau eksplorasi ilmu baru minimal 15 menit.</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="habit-learning-completed"
                  checked={learning.completed}
                  onChange={(e) => setLearning({ ...learning, completed: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded-md cursor-pointer accent-[#0753A5]"
                />
                <span className="text-xs font-bold text-slate-700">Selesai</span>
              </label>
            </div>

            {learning.completed && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Aktivitas Belajar/Membaca:</label>
                    <input
                      type="text"
                      value={learning.activityType}
                      onChange={(e) => setLearning({ ...learning, activityType: e.target.value })}
                      placeholder="Membaca buku ensiklopedia / cerita"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Durasi (Menit):</label>
                    <input
                      type="number"
                      min={10}
                      value={learning.durationMinutes}
                      onChange={(e) => setLearning({ ...learning, durationMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Hal Baru yang Kupelajari Hari Ini:</label>
                  <input
                    type="text"
                    value={learning.newLearning}
                    onChange={(e) => setLearning({ ...learning, newLearning: e.target.value })}
                    placeholder="Ceritakan 1 hal menarik yang kamu ketahui hari ini..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 6. Bermasyarakat */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-all shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">6. Bermasyarakat</h3>
                  <p className="text-xs text-slate-500">Berbuat baik, membantu orang tua, menyapa sesama, atau gotong royong.</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="habit-social-completed"
                  checked={social.completed}
                  onChange={(e) => setSocial({ ...social, completed: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded-md cursor-pointer accent-[#0753A5]"
                />
                <span className="text-xs font-bold text-slate-700">Selesai</span>
              </label>
            </div>

            {social.completed && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Cerita Singkat Kebaikan Hari Ini:</label>
                  <input
                    type="text"
                    value={social.shortStory}
                    onChange={(e) => setSocial({ ...social, shortStory: e.target.value })}
                    placeholder="Membantu adik merapikan mainan, menyapa tetangga, dsb."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 7. Tidur Cepat */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-all shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0753A5] flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">7. Tidur Cepat</h3>
                  <p className="text-xs text-slate-500">Istirahat cukup (8-9 jam) & bebas gawai sebelum tidur.</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="habit-sleep-completed"
                  checked={sleepEarly.completed}
                  onChange={(e) => setSleepEarly({ ...sleepEarly, completed: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded-md cursor-pointer accent-[#0753A5]"
                />
                <span className="text-xs font-bold text-slate-700">Selesai</span>
              </label>
            </div>

            {sleepEarly.completed && (
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Target Jam Tidur:</label>
                  <input
                    type="time"
                    value={sleepEarly.sleepTime}
                    onChange={(e) => setSleepEarly({ ...sleepEarly, sleepTime: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer w-full mt-3 sm:mt-0">
                    <input
                      type="checkbox"
                      checked={sleepEarly.screenFreeBeforeSleep}
                      onChange={(e) => setSleepEarly({ ...sleepEarly, screenFreeBeforeSleep: e.target.checked })}
                      className="rounded text-blue-600 accent-[#0753A5]"
                    />
                    <span className="font-semibold text-slate-700">📱 Bebas Gawai 30 Menit Sebelum Tidur</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="save-draft-btn"
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>{isSavedDraft ? 'Tersimpan!' : 'Simpan Draf'}</span>
            </button>
            <button
              id="reset-modal-journal-btn"
              type="button"
              onClick={handleResetForm}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
              title="Kosongkan seluruh isian jurnal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kosongkan Isian</span>
            </button>
            {lastSavedRealtime && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium pl-1 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/70 shadow-2xs">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>Info Tersimpan: <strong className="text-slate-800 font-semibold">{lastSavedRealtime}</strong></span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              id="cancel-journal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              id="submit-journal-btn"
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0753A5] to-[#20A5D5] hover:opacity-95 shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Jurnal Hari Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
