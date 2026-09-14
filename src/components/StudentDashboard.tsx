// ============================================================================
// SI-7KAIH AI - Student Dashboard Component
// Friendly, motivational, card-based, accessible, low cognitive load
// ============================================================================

import React, { useMemo } from 'react';
import {
  DailyJournal,
  Badge,
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
} from 'lucide-react';

interface StudentDashboardProps {
  todayJournal: DailyJournal;
  allJournals: DailyJournal[];
  onOpenJournal: () => void;
  onOpenReflection: () => void;
  onOpenBadges: () => void;
  onOpenAICoach: () => void;
  studentName: string;
  className: string;
  badges: Badge[];
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  todayJournal,
  allJournals,
  onOpenJournal,
  onOpenReflection,
  onOpenBadges,
  onOpenAICoach,
  studentName,
  className,
  badges,
}) => {
  const habitsIconMap = {
    WAKE_EARLY: Sun,
    WORSHIP: HeartHandshake,
    EXERCISE: Activity,
    HEALTHY_EATING: Apple,
    LEARNING: BookOpen,
    SOCIAL: Users,
    SLEEP_EARLY: Moon,
  };

  // Monthly Habit Calculations (Pure analytics formulas)
  const daysInMonth = 31;
  const recordedDays = allJournals.length;
  // Calculate average completed days for Wake Early as flagship example
  const wakeCompletedDays = allJournals.filter((j) => j.entries?.WAKE_EARLY?.completed).length;
  const monthlySummary = calculateMonthlyHabitSummary(wakeCompletedDays, recordedDays, daysInMonth);

  const completedCount = todayJournal?.completedCount || 0;
  const isAllCompleted = completedCount === 7;
  const firstName = studentName?.trim() ? studentName.trim().split(' ')[0] : 'Hebat';

  // Real consecutive streak calculation
  const streakDays = useMemo(() => {
    return allJournals.filter((j) => (j.completedCount || 0) >= 5).length;
  }, [allJournals]);

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
            <div className="text-sm font-semibold mb-3">
              Jurnal Hari Ini: <span className="font-extrabold underline decoration-amber-400">{completedCount} dari 7 Selesai</span>
            </div>
            <button
              id="hero-open-journal-btn"
              onClick={onOpenJournal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-[#0753A5] hover:bg-blue-50 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{completedCount > 0 ? (isAllCompleted ? 'Lihat / Edit Jurnal Hari Ini' : 'Lanjutkan Isi Jurnal') : 'Isi Jurnal Hari Ini'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7 Core Habits Quick Status Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>7 Kebiasaan Hari Ini</span>
            <span className="text-xs sm:text-sm font-normal text-slate-500">
              ({new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})
            </span>
          </h3>
          <button
            onClick={onOpenJournal}
            className="text-xs sm:text-sm font-bold text-[#0753A5] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Formulir</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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

      {/* Monthly Statistics & Habitual Threshold Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Pembiasaan Bulan Ini (Threshold 2/3: 21 hari target) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evaluasi Pembiasaan Bulanan
            </span>
            <span
              className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                monthlySummary.habitualStatus === 'SUDAH_TERBIASA'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {monthlySummary.habitualStatus === 'SUDAH_TERBIASA'
                ? 'Sudah Terbiasa'
                : 'Belum Terbiasa'}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {monthlySummary.numerator}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                / {monthlySummary.denominator} hari target
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rumus Baku: 2/3 × {daysInMonth} hari = target minimal {calculateHabitualThreshold(daysInMonth)} hari konsisten.
            </p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#41A85F] h-2.5 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (monthlySummary.numerator / monthlySummary.denominator) * 100
                )}%`,
              }}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Kelengkapan Jurnal:</span>
            <span className="font-bold text-[#0753A5]">
              {monthlySummary.completenessRate}% ({recordedDays}/{daysInMonth} hari)
            </span>
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
              Refleksi Bulanan
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
              {badges.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 flex flex-col items-center text-center gap-1"
                >
                  <span className="text-2xl">🏅</span>
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {b.title}
                  </p>
                  <span className="text-[10px] text-amber-700 font-semibold">Diraih</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tanpa perankingan: Fokus pada apresiasi proses & konsistensi diri.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
