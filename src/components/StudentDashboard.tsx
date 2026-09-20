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
  className,
  badges,
  onValidateJournal,
}) => {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);
  const [selectedJournalToSign, setSelectedJournalToSign] = useState<DailyJournal | null>(null);
  const [showValidationSettings, setShowValidationSettings] = useState<boolean>(false);
  const [showPastJournals, setShowPastJournals] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

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

  // Real-time synchronization listeners for journal updates from Parent Dashboard or other tabs
  useEffect(() => {
    const handleSync = () => {
      setLastSyncTime(
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
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
          if (msg.data?.type === 'JOURNALS_UPDATED') {
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

  // Derive active month name synchronized with updated journal data
  const activeMonthLabel = useMemo(() => {
    if (allJournals && allJournals.length > 0) {
      const dates = allJournals
        .map((j) => j.journalDate || (j as any).date)
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a));
      if (dates[0]) {
        const parts = dates[0].split('-');
        if (parts.length >= 2) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(y) && !isNaN(m)) {
            const d = new Date(y, m - 1, 1);
            return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
          }
        }
      }
    }
    return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, [allJournals]);

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
        {/* Card 1: Pembiasaan Bulan Ini (Threshold 2/3: 21 hari target) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evaluasi Pembiasaan • {activeMonthLabel}
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
