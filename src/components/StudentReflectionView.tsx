// ============================================================================
// SI-7KAIH AI - Student Monthly Reflection Component
// 5 standard questions + distinct AI suggestion stored separately
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  StudentMonthlyReflection,
  HabitCode,
  DailyJournal,
} from '../../packages/types/src/index';
import { HABIT_LIST } from '../lib/constants';
import {
  BookOpen,
  Sparkles,
  Send,
  Save,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface StudentReflectionViewProps {
  initialReflection: StudentMonthlyReflection;
  studentName: string;
  onSaveReflection: (reflection: StudentMonthlyReflection) => void;
  journals?: DailyJournal[];
  activeStudentId?: string;
}

interface MonthPeriod {
  year: number;
  month: number; // 1-12
  key: string;   // "YYYY-MM"
  label: string; // e.g. "September 2026"
  journalCount: number;
  lastJournalDate?: string;
}

export const StudentReflectionView: React.FC<StudentReflectionViewProps> = ({
  initialReflection,
  studentName,
  onSaveReflection,
  journals = [],
  activeStudentId,
}) => {
  // Dynamically derive all available months from journal data (removes any hardcoded default month)
  const availableMonths = useMemo<MonthPeriod[]>(() => {
    const monthMap = new Map<string, { year: number; month: number; count: number; lastDate: string }>();

    if (journals && journals.length > 0) {
      journals.forEach((j) => {
        const dateStr = j.journalDate || (j as any).date;
        if (dateStr && typeof dateStr === 'string') {
          const parts = dateStr.split('-');
          if (parts.length >= 2) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
              const key = `${y}-${String(m).padStart(2, '0')}`;
              const existing = monthMap.get(key);
              if (existing) {
                existing.count += 1;
                if (dateStr > existing.lastDate) {
                  existing.lastDate = dateStr;
                }
              } else {
                monthMap.set(key, { year: y, month: m, count: 1, lastDate: dateStr });
              }
            }
          }
        }
      });
    }

    // If no journals recorded yet, synchronize with current date month & year
    if (monthMap.size === 0) {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, '0')}`;
      monthMap.set(key, { year: y, month: m, count: 0, lastDate: '' });
    }

    const list: MonthPeriod[] = Array.from(monthMap.entries()).map(([key, data]) => {
      const d = new Date(data.year, data.month - 1, 1);
      const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      return {
        year: data.year,
        month: data.month,
        key,
        label,
        journalCount: data.count,
        lastJournalDate: data.lastDate,
      };
    });

    // Sort descending so the latest month with journal activity comes first
    list.sort((a, b) => b.key.localeCompare(a.key));
    return list;
  }, [journals]);

  // Active selected month key (defaults to the latest journal month)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => {
    return availableMonths[0]?.key || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  });

  // Ensure selectedMonthKey updates if availableMonths changes and doesn't contain current selection
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.some((m) => m.key === selectedMonthKey)) {
      setSelectedMonthKey(availableMonths[0].key);
    }
  }, [availableMonths, selectedMonthKey]);

  const activeMonth = useMemo<MonthPeriod>(() => {
    return (
      availableMonths.find((m) => m.key === selectedMonthKey) ||
      availableMonths[0] || {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        key: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        label: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        journalCount: 0,
      }
    );
  }, [availableMonths, selectedMonthKey]);

  const [easiestHabit, setEasiestHabit] = useState<HabitCode>(initialReflection.easiestHabit || 'WAKE_EARLY');
  const [hardestHabit, setHardestHabit] = useState<HabitCode>(initialReflection.hardestHabit || 'SLEEP_EARLY');
  const [rootCause, setRootCause] = useState(initialReflection.rootCause || '');
  const [actionPlan, setActionPlan] = useState(initialReflection.actionPlan || '');
  const [nextMonthTarget, setNextMonthTarget] = useState(initialReflection.nextMonthTarget || '');
  const [aiSuggestion, setAiSuggestion] = useState(initialReflection.aiSuggestedTarget || '');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load reflection for the currently selected active month
  useEffect(() => {
    try {
      const storageKey = `si7kaih_reflection_student_${activeStudentId || 'default'}_${activeMonth.key}`;
      const savedForMonth = localStorage.getItem(storageKey);
      if (savedForMonth) {
        const parsed = JSON.parse(savedForMonth);
        if (parsed) {
          setEasiestHabit(parsed.easiestHabit || 'WAKE_EARLY');
          setHardestHabit(parsed.hardestHabit || 'SLEEP_EARLY');
          setRootCause(parsed.rootCause || '');
          setActionPlan(parsed.actionPlan || '');
          setNextMonthTarget(parsed.nextMonthTarget || '');
          setAiSuggestion(parsed.aiSuggestedTarget || '');
          return;
        }
      }

      // If matches initialReflection month and year
      if (
        initialReflection &&
        initialReflection.month === activeMonth.month &&
        initialReflection.year === activeMonth.year
      ) {
        setEasiestHabit(initialReflection.easiestHabit || 'WAKE_EARLY');
        setHardestHabit(initialReflection.hardestHabit || 'SLEEP_EARLY');
        setRootCause(initialReflection.rootCause || '');
        setActionPlan(initialReflection.actionPlan || '');
        setNextMonthTarget(initialReflection.nextMonthTarget || '');
        setAiSuggestion(initialReflection.aiSuggestedTarget || '');
        return;
      }

      // Fallback: if only one month exists and initialReflection has text
      if (availableMonths.length === 1 && initialReflection && (initialReflection.rootCause || initialReflection.actionPlan)) {
        setEasiestHabit(initialReflection.easiestHabit || 'WAKE_EARLY');
        setHardestHabit(initialReflection.hardestHabit || 'SLEEP_EARLY');
        setRootCause(initialReflection.rootCause || '');
        setActionPlan(initialReflection.actionPlan || '');
        setNextMonthTarget(initialReflection.nextMonthTarget || '');
        setAiSuggestion(initialReflection.aiSuggestedTarget || '');
        return;
      }

      // Clean default for new month
      setEasiestHabit('WAKE_EARLY');
      setHardestHabit('SLEEP_EARLY');
      setRootCause('');
      setActionPlan('');
      setNextMonthTarget('');
      setAiSuggestion('');
    } catch (_e) {}
  }, [activeMonth.key, activeMonth.month, activeMonth.year, activeStudentId, availableMonths.length, initialReflection]);

  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'STUDENT_MONTHLY_REFLECTION',
          payload: {
            easiestHabit,
            hardestHabit,
            rootCause,
            actionPlan,
            nextMonthTarget,
            month: activeMonth.month,
            year: activeMonth.year,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.aiSuggestedTarget) {
          setAiSuggestion(data.data.aiSuggestedTarget);
        } else if (data.data?.recommendations?.[0]) {
          setAiSuggestion(data.data.recommendations[0]);
        }
      } else {
        // Fallback friendly suggestion
        setAiSuggestion(
          `Target ananda untuk bulan ${activeMonth.label} sangat baik. Untuk kebiasaan yang masih menantang, cobalah langkah bertahap misalnya menyiapkan perlengkapan 15 menit lebih awal dan diskusikan pengingat bersama orang tua.`
        );
      }
    } catch {
      setAiSuggestion(
        `Hebat sudah jujur merefleksikan diri pada bulan ${activeMonth.label}! Fokus pada konsistensi kecil setiap hari, dan minta bantuan keluarga untuk saling mengingatkan dengan gembira.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = () => {
    const updated: StudentMonthlyReflection = {
      ...initialReflection,
      id: initialReflection.id || `reflection-${activeStudentId || 'student'}-${activeMonth.key}`,
      studentId: activeStudentId || initialReflection.studentId || '',
      month: activeMonth.month,
      year: activeMonth.year,
      easiestHabit,
      hardestHabit,
      rootCause,
      actionPlan,
      nextMonthTarget,
      aiSuggestedTarget: aiSuggestion,
      updatedAt: new Date().toISOString(),
    };

    // Save to month-specific storage
    try {
      const storageKey = `si7kaih_reflection_student_${activeStudentId || 'default'}_${activeMonth.key}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (_e) {}

    onSaveReflection(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Card - Synchronized with Journal Month */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900">
                  Refleksi Bulanan Siswa: {activeMonth.label}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Tersinkron Jurnal</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ungkapkan perasaan, tantangan, dan rencana perbaikan ananda{' '}
                <span className="font-bold text-slate-700">{studentName}</span> pada bulan{' '}
                <span className="font-semibold text-slate-900">{activeMonth.label}</span> secara jujur.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              {activeMonth.journalCount > 0
                ? `${activeMonth.journalCount} catatan jurnal bulan ini`
                : 'Bulan berjalan (belum ada jurnal)'}
            </span>
          </div>
        </div>

        {/* Month Selector Pills - Allows switching between months present in journal data */}
        {availableMonths.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Bulan Jurnal:</span>
            </span>
            {availableMonths.map((m) => {
              const isSelected = m.key === activeMonth.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelectedMonthKey(m.key)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{m.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {m.journalCount} Jurnal
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5 Reflection Prompts */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Q1 & Q2: Easiest and Hardest Habit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              1. Kebiasaan yang paling mudah & menyenangkan dilakukan:
            </label>
            <select
              value={easiestHabit}
              onChange={(e) => setEasiestHabit(e.target.value as HabitCode)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-blue-500 bg-slate-50/50"
            >
              {HABIT_LIST.map((h) => (
                <option key={h.code} value={h.code}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              2. Kebiasaan yang masih sering terlewat / paling menantang:
            </label>
            <select
              value={hardestHabit}
              onChange={(e) => setHardestHabit(e.target.value as HabitCode)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-blue-500 bg-slate-50/50"
            >
              {HABIT_LIST.map((h) => (
                <option key={h.code} value={h.code}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Q3: Root cause */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            3. Menurut saya, apa yang menyebabkan kebiasaan tersebut masih menantang?
          </label>
          <textarea
            rows={3}
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            placeholder="Contoh: Terkadang masih asyik membaca atau bermain gawai hingga larut malam..."
            className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Q4: Action Plan */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            4. Apa rencana aksi nyata / langkah perbaikan saya?
          </label>
          <textarea
            rows={3}
            value={actionPlan}
            onChange={(e) => setActionPlan(e.target.value)}
            placeholder="Contoh: Menaruh gawai di luar kamar tidur mulai pukul 20:30 dan minta diingatkan ibu..."
            className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Q5: Next Month Target */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            5. Target pribadi yang ingin saya capai bulan depan:
          </label>
          <input
            type="text"
            value={nextMonthTarget}
            onChange={(e) => setNextMonthTarget(e.target.value)}
            placeholder="Contoh: Tidur sebelum jam 21:15 di malam sekolah agar bangun lebih segar"
            className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-blue-500 bg-slate-50/50"
          />
        </div>

        {/* AI Suggested Target (Stored in separate column, never replaces student words) */}
        <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-indigo-950">
                Saran Pendampingan AI (Bahan Diskusi Siswa & Guru / Orang Tua)
              </h4>
            </div>
            <button
              onClick={handleGenerateAi}
              disabled={isGeneratingAi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAi ? 'Menganalisis...' : 'Minta Saran AI'}</span>
            </button>
          </div>

          <div className="text-xs text-indigo-900 bg-white/80 p-3.5 rounded-xl border border-indigo-100 leading-relaxed">
            {aiSuggestion || 'Klik "Minta Saran AI" untuk mendapatkan masukan positif pelengkap refleksi.'}
          </div>

          <p className="text-[10px] text-indigo-600/80 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Saran AI disimpan terpisah dan tidak menggantikan refleksi orisinal siswa.</span>
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-emerald-600 font-bold">
            {isSaved && '✓ Refleksi bulanan berhasil disimpan!'}
          </div>
          <button
            id="save-reflection-btn"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Refleksi Bulanan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
