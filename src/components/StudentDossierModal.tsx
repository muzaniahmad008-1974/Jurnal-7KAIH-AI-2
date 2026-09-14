// ============================================================================
// SI-7KAIH AI - Student Dossier & Individual Character Mentoring Modal
// Pedagogical view, habit breakdown, non-punitive observations, AI character analysis
// ============================================================================

import React, { useState } from 'react';
import { HabitCode } from '../../packages/types/src/index';
import { HABIT_LIST } from '../lib/constants';
import {
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  HeartHandshake,
  Sun,
  Activity,
  Apple,
  Users,
  Moon,
  Award,
  ShieldCheck,
  Save,
  Printer,
  ChevronRight,
  Info,
  Check,
  Loader2,
} from 'lucide-react';

export interface StudentDossierData {
  id: string;
  nisn: string;
  name: string;
  className?: string;
  completedTodayCount: number;
  monthlyConsistency: number; // %
  completenessRate: number; // %
  category: 'TERPANTAU_BAIK' | 'PERLU_PENGUATAN' | 'PERLU_PENDAMPINGAN';
  lastJournalDate: string;
  validatedByTeacher: boolean;
  parentName?: string;
  notes?: string;
}

interface StudentDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentDossierData | null;
  onValidateStudent: (studentId: string) => void;
  onOpenReportModal: () => void;
}

const habitIcons: Record<string, React.FC<{ className?: string }>> = {
  WAKE_EARLY: Sun,
  WORSHIP: HeartHandshake,
  EXERCISE: Activity,
  HEALTHY_EATING: Apple,
  LEARNING: BookOpen,
  SOCIAL: Users,
  SLEEP_EARLY: Moon,
};

export const StudentDossierModal: React.FC<StudentDossierModalProps> = ({
  isOpen,
  onClose,
  student,
  onValidateStudent,
  onOpenReportModal,
}) => {
  const [teacherNote, setTeacherNote] = useState(
    student?.notes || 'Ananda menunjukkan antusiasme belajar yang tinggi serta sikap santun kepada sesama teman.'
  );
  const [isSavedNote, setIsSavedNote] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'HABITS' | 'TIMELINE' | 'AI_COACHING'>('HABITS');

  if (!isOpen || !student) return null;

  // Mock specific habit rates based on student profile
  const isGood = student.category === 'TERPANTAU_BAIK';
  const isWeak = student.category === 'PERLU_PENDAMPINGAN';

  const habitRates: Record<HabitCode, { percentage: number; days: number }> = {
    WAKE_EARLY: { percentage: isGood ? 96 : isWeak ? 70 : 85, days: isGood ? 29 : isWeak ? 21 : 26 },
    WORSHIP: { percentage: isGood ? 98 : isWeak ? 85 : 92, days: isGood ? 30 : isWeak ? 26 : 28 },
    EXERCISE: { percentage: isGood ? 85 : isWeak ? 60 : 75, days: isGood ? 26 : isWeak ? 18 : 23 },
    HEALTHY_EATING: { percentage: isGood ? 92 : isWeak ? 65 : 82, days: isGood ? 28 : isWeak ? 20 : 25 },
    LEARNING: { percentage: isGood ? 90 : isWeak ? 70 : 84, days: isGood ? 27 : isWeak ? 21 : 25 },
    SOCIAL: { percentage: isGood ? 88 : isWeak ? 75 : 80, days: isGood ? 27 : isWeak ? 23 : 24 },
    SLEEP_EARLY: { percentage: isGood ? 78 : isWeak ? 50 : 65, days: isGood ? 24 : isWeak ? 15 : 20 },
  };

  const handleSaveNote = () => {
    setIsSavedNote(true);
    setTimeout(() => setIsSavedNote(false), 2500);
  };

  const handleGenerateStudentAi = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'StudentReflectionCoach',
          payload: {
            studentName: student.name,
            nisn: student.nisn,
            completenessRate: student.completenessRate,
            consistencyRate: student.monthlyConsistency,
            category: student.category,
          },
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiAnalysis(json.data);
        setActiveSubTab('AI_COACHING');
      }
    } catch (e) {
      console.error('Failed to generate student AI analysis', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-student-name"
      >
        {/* Header with Student Identity */}
        <div className="bg-gradient-to-r from-[#0753A5] to-[#20A5D5] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white text-[#0753A5] font-black text-2xl flex items-center justify-center shadow-md">
              {student.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="modal-student-name" className="text-xl font-black tracking-tight text-white">
                  {student.name}
                </h2>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    student.category === 'TERPANTAU_BAIK'
                      ? 'bg-emerald-400 text-slate-900'
                      : student.category === 'PERLU_PENGUATAN'
                      ? 'bg-amber-300 text-slate-900'
                      : 'bg-rose-300 text-slate-900'
                  }`}
                >
                  {student.category === 'TERPANTAU_BAIK'
                    ? 'Terpantau Baik'
                    : student.category === 'PERLU_PENGUATAN'
                    ? 'Perlu Penguatan'
                    : 'Perlu Pendampingan'}
                </span>
              </div>
              <div className="text-xs text-blue-100 flex flex-wrap items-center gap-3">
                <span>NISN: <strong>{student.nisn}</strong></span>
                <span>•</span>
                <span>Kelas: <strong>{student.className || 'Kelas 7-A (Fase D)'}</strong></span>
                <span>•</span>
                <span>Jurnal Terakhir: <strong>{student.lastJournalDate}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Metric Bar */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/70 text-center py-3.5 px-4 text-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">Capaian Hari Ini</div>
            <div className="text-base font-black text-[#0753A5]">{student.completedTodayCount}/7 Kebiasaan</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">Kelengkapan Bulanan</div>
            <div className="text-base font-black text-emerald-600">{student.completenessRate}%</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">Konsistensi Rutinitas</div>
            <div className="text-base font-black text-slate-900">{student.monthlyConsistency}%</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('HABITS')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'HABITS'
                ? 'border-[#0753A5] text-[#0753A5]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Rincian 7 Kebiasaan
          </button>
          <button
            onClick={() => setActiveSubTab('TIMELINE')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'TIMELINE'
                ? 'border-[#0753A5] text-[#0753A5]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Aktivitas 7 Hari Terakhir
          </button>
          <button
            onClick={() => setActiveSubTab('AI_COACHING')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'AI_COACHING'
                ? 'border-[#0753A5] text-[#0753A5]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pendampingan AI Pedagogis</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-6 max-h-[55vh] overflow-y-auto">
          {activeSubTab === 'HABITS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Distribusi Konsistensi Kebiasaan (30 Hari Terakhir)</span>
                <span className="font-bold text-slate-700">Target Ideal: ≥85%</span>
              </div>

              <div className="space-y-3">
                {HABIT_LIST.map((h) => {
                  const stat = habitRates[h.code];
                  const Icon = habitIcons[h.code] || Sparkles;
                  return (
                    <div
                      key={h.code}
                      className="p-3 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-blue-50 text-[#0753A5]">
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-bold text-slate-800">{h.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-500 font-mono">
                            {stat.days}/30 hari
                          </span>
                          <span
                            className={`font-black text-xs w-10 text-right ${
                              stat.percentage >= 85
                                ? 'text-emerald-600'
                                : stat.percentage >= 70
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {stat.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            stat.percentage >= 85
                              ? 'bg-[#41A85F]'
                              : stat.percentage >= 70
                              ? 'bg-[#F5B900]'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Teacher Observation Notes Input */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Catatan Pembimbingan Karakter Guru</span>
                  </label>
                  {isSavedNote && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Tersimpan</span>
                    </span>
                  )}
                </div>
                <textarea
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500 leading-relaxed"
                  placeholder="Tuliskan apresiasi, pengamatan perilaku positif, atau arahan motivasi untuk ananda..."
                />
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setTeacherNote('Ananda sangat konsisten beribadah dan aktif dalam interaksi positif bersama teman sekelas.')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      + Konsisten & Mandiri
                    </button>
                    <button
                      onClick={() => setTeacherNote('Mari bersama-sama memperkuat waktu istirahat malam agar bangun pagi semakin ceria.')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      + Penguatan Tidur Cepat
                    </button>
                  </div>
                  <button
                    onClick={handleSaveNote}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    <span>Simpan Catatan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'TIMELINE' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Rekam jejak 7 hari terakhir menunjukkan keteraturan pengisian jurnal harian.
              </div>
              <div className="space-y-2.5">
                {[
                  { date: '2026-09-08 (Hari Ini)', count: student.completedTodayCount, status: 'Lengkap', time: '19:30' },
                  { date: '2026-09-07 (Senin)', count: 7, status: 'Sempurna', time: '20:15' },
                  { date: '2026-09-06 (Minggu)', count: 6, status: 'Lengkap', time: '20:00' },
                  { date: '2026-09-05 (Sabtu)', count: 6, status: 'Lengkap', time: '21:10' },
                  { date: '2026-09-04 (Jumat)', count: 7, status: 'Sempurna', time: '19:45' },
                  { date: '2026-09-03 (Kamis)', count: 5, status: 'Perlu Tidur Cepat', time: '20:30' },
                  { date: '2026-09-02 (Rabu)', count: 7, status: 'Sempurna', time: '19:50' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{item.date}</div>
                        <div className="text-[10px] text-slate-400">Dicatat pukul {item.time} WIB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0753A5] bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {item.count}/7 Selesai
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'AI_COACHING' && (
            <div className="space-y-4">
              {!aiAnalysis ? (
                <div className="p-8 text-center space-y-4 rounded-2xl bg-gradient-to-b from-blue-50/50 to-indigo-50/50 border border-blue-100">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0753A5] flex items-center justify-center mx-auto text-xl">
                    <Sparkles className="w-6 h-6 text-[#0753A5]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900">
                      Asistensi Karakter AI Berbasis Pedagogi Positif
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Sistem AI menganalisis data jurnal {student.name} untuk menyusun apresiasi berbasis fakta, pola kebiasaan, dan rekomendasi pendampingan non-punitive.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateStudentAi}
                    disabled={isAiLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menganalisis Jurnal Ananda...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Hasilkan Analisis Karakter AI</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Facts */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                    <div className="text-xs font-black text-[#0753A5] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Fakta Data Terverifikasi</span>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                      {aiAnalysis.facts?.map((f: any, i: number) => (
                        <li key={i}>{f.statement || f}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Patterns */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
                    <div className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pola & Potensi Pembiasaan</span>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                      {aiAnalysis.patterns?.map((p: string, i: number) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Pedagogical Recommendations */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                    <div className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Saran Pendampingan Guru & Kolaborasi Orang Tua</span>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                      {aiAnalysis.recommendations?.map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak Rapor Karakter</span>
          </button>

          <div className="flex items-center gap-2">
            {!student.validatedByTeacher ? (
              <button
                onClick={() => {
                  onValidateStudent(student.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Validasi Jurnal Ananda</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Telah Divalidasi Guru</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
