// ============================================================================
// SI-7KAIH AI - Student Monthly Reflection Component
// 5 standard questions + distinct AI suggestion stored separately
// ============================================================================

import React, { useState } from 'react';
import {
  StudentMonthlyReflection,
  HabitCode,
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
} from 'lucide-react';

interface StudentReflectionViewProps {
  initialReflection: StudentMonthlyReflection;
  studentName: string;
  onSaveReflection: (reflection: StudentMonthlyReflection) => void;
}

export const StudentReflectionView: React.FC<StudentReflectionViewProps> = ({
  initialReflection,
  studentName,
  onSaveReflection,
}) => {
  const [easiestHabit, setEasiestHabit] = useState<HabitCode>(initialReflection.easiestHabit);
  const [hardestHabit, setHardestHabit] = useState<HabitCode>(initialReflection.hardestHabit);
  const [rootCause, setRootCause] = useState(initialReflection.rootCause);
  const [actionPlan, setActionPlan] = useState(initialReflection.actionPlan);
  const [nextMonthTarget, setNextMonthTarget] = useState(initialReflection.nextMonthTarget);
  const [aiSuggestion, setAiSuggestion] = useState(initialReflection.aiSuggestedTarget || '');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
          `Target ananda sangat baik. Untuk kebiasaan yang masih menantang, cobalah langkah bertahap misalnya menyiapkan perlengkapan 15 menit lebih awal dan diskusikan pengingat bersama orang tua.`
        );
      }
    } catch {
      setAiSuggestion(
        `Hebat sudah jujur merefleksikan diri! Fokus pada konsistensi kecil setiap hari, dan minta bantuan keluarga untuk saling mengingatkan dengan gembira.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = () => {
    const updated: StudentMonthlyReflection = {
      ...initialReflection,
      easiestHabit,
      hardestHabit,
      rootCause,
      actionPlan,
      nextMonthTarget,
      aiSuggestedTarget: aiSuggestion,
      updatedAt: new Date().toISOString(),
    };
    onSaveReflection(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Refleksi Bulanan Siswa: Agustus 2025
            </h2>
            <p className="text-xs text-slate-500">
              Ungkapkan perasaan, tantangan, dan rencana perbaikan ananda <span className="font-bold text-slate-700">{studentName}</span> secara jujur.
            </p>
          </div>
        </div>
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
