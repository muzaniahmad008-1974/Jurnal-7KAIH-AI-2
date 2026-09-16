// ============================================================================
// SI-7KAIH AI - Parent Validation & Monthly Reflection Component
// Warm parent-child communication, positive feedback loop, fast approval
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  DailyJournal,
  ParentMonthlyReflection,
  HabitCode,
} from '../../packages/types/src/index';
import { HABIT_LIST, UserPersona, isDeprecatedOrDummyJournal } from '../lib/constants';
import {
  Heart,
  CheckCircle2,
  Clock,
  MessageCircle,
  Save,
  BookOpen,
  Calendar,
  Sparkles,
  ShieldCheck,
  Send,
  Trophy,
  Award,
  CheckSquare,
  Plus,
  Users,
  ArrowRight,
  TrendingUp,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface ParentValidationViewProps {
  journals: DailyJournal[];
  initialReflection: ParentMonthlyReflection;
  studentName: string;
  className: string;
  schoolName?: string;
  currentPersona?: UserPersona;
  studentId?: string;
  studentNisn?: string;
  onValidateJournal: (journalId: string, habitCode?: HabitCode, parentNote?: string) => void;
  onSaveReflection: (reflection: ParentMonthlyReflection) => void;
  activeNavTab?: string;
  onOpenReportModal?: () => void;
}

export const ParentValidationView: React.FC<ParentValidationViewProps> = ({
  journals,
  initialReflection,
  studentName,
  className,
  schoolName,
  currentPersona,
  studentId,
  studentNisn,
  onValidateJournal,
  onSaveReflection,
  activeNavTab,
  onOpenReportModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'VALIDATION' | 'REFLECTION' | 'CHALLENGES'>('OVERVIEW');
  const [notesByJournalId, setNotesByJournalId] = useState<Record<string, string>>({});
  const [validatedSuccessId, setValidatedSuccessId] = useState<string | null>(null);
  const [liveSyncTime, setLiveSyncTime] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Sync with Header navigation tabs
  useEffect(() => {
    if (!activeNavTab) return;
    if (activeNavTab === 'dashboard') {
      setActiveSubTab('OVERVIEW');
    } else if (activeNavTab === 'validation') {
      setActiveSubTab('VALIDATION');
    } else if (activeNavTab === 'reflection' || activeNavTab === 'parent-reflection') {
      setActiveSubTab('REFLECTION');
    } else if (activeNavTab === 'challenges') {
      setActiveSubTab('CHALLENGES');
    }
  }, [activeNavTab]);

  // Realtime synchronization listener for student journal updates
  useEffect(() => {
    const handleJournalSync = () => {
      setLiveSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    window.addEventListener('si7kaih_journals_updated', handleJournalSync);
    window.addEventListener('storage', (e) => {
      if (e.key === 'si7kaih_journals_prod') {
        handleJournalSync();
      }
    });

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('si7kaih_sync_channel');
        bc.onmessage = (msg) => {
          if (msg.data?.type === 'JOURNALS_UPDATED') {
            handleJournalSync();
          }
        };
      } catch (_e) {}
    }

    return () => {
      window.removeEventListener('si7kaih_journals_updated', handleJournalSync);
      if (bc) bc.close();
    };
  }, []);

  // Filter journals specifically for this child without any hardcoded/default/dummy data
  const childJournals = useMemo(() => {
    const cleanStudentName = (studentName || currentPersona?.childName || '').toLowerCase().trim();
    const cleanStudentId = (studentId || currentPersona?.childId || '').toLowerCase().trim();
    const cleanStudentNisn = (studentNisn || currentPersona?.childNisn || '').toLowerCase().trim();

    return journals.filter((j) => {
      if (!j) return false;
      if (isDeprecatedOrDummyJournal(j)) return false;

      const jStudentId = (j.studentId || '').toLowerCase().trim();
      const jStudentNisn = (j.studentNisn || '').toLowerCase().trim();
      const jStudentName = (j.studentName || '').toLowerCase().trim();

      // Check ID match
      if (cleanStudentId && jStudentId && jStudentId === cleanStudentId) return true;
      // Check NISN match
      if (cleanStudentNisn && jStudentNisn && jStudentNisn === cleanStudentNisn) return true;
      // Check Name match
      if (cleanStudentName && jStudentName) {
        if (jStudentName === cleanStudentName || jStudentName.includes(cleanStudentName) || cleanStudentName.includes(jStudentName)) {
          return true;
        }
      }

      // If neither has explicit IDs but only one student context exists
      if (!cleanStudentId && !cleanStudentNisn && !jStudentId && !jStudentNisn && cleanStudentName && jStudentName) {
        return true;
      }

      return false;
    });
  }, [journals, studentName, studentId, studentNisn, currentPersona]);

  // Family Challenges State (starts clean without default completed progress)
  const [familyChallenges, setFamilyChallenges] = useState([
    {
      id: 'fc-1',
      title: 'Makan Bersama Tanpa Gadget',
      description: 'Menikmati sarapan atau makan malam bersama tanpa layar gawai, saling berbagi cerita hari ini.',
      habitTarget: 'HEALTHY_EATING',
      targetCount: 3,
      currentCount: 0,
      completed: false,
      impact: 'Mendukung pembiasaan Makan Sehat & Percakapan Hangat Keluarga',
    },
    {
      id: 'fc-2',
      title: 'Literasi 15 Menit Sebelum Tidur',
      description: 'Membaca buku cerita, dongeng budi pekerti, atau buku sains bersama selama 15 menit.',
      habitTarget: 'LEARNING',
      targetCount: 5,
      currentCount: 0,
      completed: false,
      impact: 'Mendukung pembiasaan Gemar Belajar & Tidur Lebih Awal',
    },
    {
      id: 'fc-3',
      title: 'Olahraga / Jalan Pagi Ceria Akhir Pekan',
      description: 'Jalan santai bersama keluarga di pagi hari akhir pekan atau bersepeda keliling lingkungan.',
      habitTarget: 'EXERCISE',
      targetCount: 1,
      currentCount: 0,
      completed: false,
      impact: 'Mendukung pembiasaan Berolahraga & Daya Tahan Tubuh',
    },
    {
      id: 'fc-4',
      title: 'Kamar Bersih & Mandiri',
      description: 'Membimbing anak merapikan tempat tidur sendiri dan meletakkan pakaian kotor pada tempatnya.',
      habitTarget: 'WAKE_EARLY',
      targetCount: 4,
      currentCount: 0,
      completed: false,
      impact: 'Mendukung Kemandirian & Tanggung Jawab Sejak Dini',
    },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleIncrementChallenge = (id: string) => {
    setFamilyChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextCount = Math.min(c.targetCount, c.currentCount + 1);
          const isDone = nextCount >= c.targetCount;
          return { ...c, currentCount: nextCount, completed: isDone };
        }
        return c;
      })
    );
    showToast('Aktivitas keluarga berhasil dicatat!');
  };

  // Reflection form states - clean defaults without hardcoded child strings
  const [observedChange, setObservedChange] = useState(initialReflection?.observedChange || '');
  const [difficulty, setDifficulty] = useState(initialReflection?.difficulty || '');
  const [familySupport, setFamilySupport] = useState(initialReflection?.familySupport || '');
  const [nextMonthSupport, setNextMonthSupport] = useState(initialReflection?.nextMonthSupport || '');
  const [parentNote, setParentNote] = useState(initialReflection?.parentNote || '');
  const [isReflectionSaved, setIsReflectionSaved] = useState(false);

  useEffect(() => {
    if (initialReflection) {
      setObservedChange((prev) => (prev !== (initialReflection.observedChange || '') ? (initialReflection.observedChange || '') : prev));
      setDifficulty((prev) => (prev !== (initialReflection.difficulty || '') ? (initialReflection.difficulty || '') : prev));
      setFamilySupport((prev) => (prev !== (initialReflection.familySupport || '') ? (initialReflection.familySupport || '') : prev));
      setNextMonthSupport((prev) => (prev !== (initialReflection.nextMonthSupport || '') ? (initialReflection.nextMonthSupport || '') : prev));
      setParentNote((prev) => (prev !== (initialReflection.parentNote || '') ? (initialReflection.parentNote || '') : prev));
    }
  }, [
    initialReflection?.observedChange,
    initialReflection?.difficulty,
    initialReflection?.familySupport,
    initialReflection?.nextMonthSupport,
    initialReflection?.parentNote,
  ]);

  // Dynamic metrics calculation strictly based on child's journals (no default mock data)
  const daysInMonth = 31;
  const recordedDays = childJournals.length;
  const completenessPct = Math.round((recordedDays / daysInMonth) * 100);

  const isJournalParentValidated = (j: DailyJournal): boolean => {
    if (j.parentValidated) return true;
    if ((j as any).parent_validated) return true;
    const entries = Object.values(j.entries || {});
    return entries.length > 0 && entries.every((val) => (val as any)?.parentValidated);
  };

  const validatedCount = childJournals.filter(isJournalParentValidated).length;

  let totalCompletedSlots = 0;
  const totalSlots = recordedDays * 7;
  if (recordedDays > 0) {
    childJournals.forEach((j) => {
      Object.values(j.entries || {}).forEach((entry) => {
        if ((entry as { completed?: boolean })?.completed) totalCompletedSlots++;
      });
    });
  }
  const consistencyPct = totalSlots > 0 ? Math.round((totalCompletedSlots / totalSlots) * 100) : 0;

  const habitDimensions = [
    { code: 'WAKE_EARLY' as HabitCode, name: 'Bangun Pagi Tepat Waktu', desc: 'Bangun pagi dan bersiap memulai hari' },
    { code: 'WORSHIP' as HabitCode, name: 'Taat Beribadah', desc: 'Ibadah rutin tepat waktu bersama keluarga' },
    { code: 'EXERCISE' as HabitCode, name: 'Rajin Berolahraga', desc: 'Aktivitas fisik, senam, atau olahraga teratur' },
    { code: 'HEALTHY_EATING' as HabitCode, name: 'Makan Makanan Sehat & Bergizi', desc: 'Menu bergizi seimbang dan sarapan sehat' },
    { code: 'LEARNING' as HabitCode, name: 'Gemar Membaca & Belajar', desc: 'Literasi mandiri dan mengulang pelajaran' },
    { code: 'SOCIAL' as HabitCode, name: 'Bermasyarakat & Peduli Sesama', desc: 'Sopan santun, gotong royong, dan peduli sesama' },
    { code: 'SLEEP_EARLY' as HabitCode, name: 'Tidur Cepat & Cukup', desc: 'Tidur teratur dan istirahat berkualitas' },
  ].map((h) => {
    const completedCount = childJournals.filter((j) => j.entries?.[h.code]?.completed).length;
    const pct = recordedDays > 0 ? Math.round((completedCount / recordedDays) * 100) : 0;
    return {
      ...h,
      completedCount,
      pct,
      note: recordedDays > 0 ? `${completedCount} dari ${recordedDays} hari terlaksana` : 'Belum ada catatan aktivitas',
    };
  });

  // Sort child journals descending (newest first)
  const sortedJournals = useMemo(() => {
    return [...childJournals].sort((a, b) => b.journalDate.localeCompare(a.journalDate));
  }, [childJournals]);

  const pendingJournals = useMemo(() => {
    return sortedJournals.filter((j) => !isJournalParentValidated(j));
  }, [sortedJournals]);

  const handleValidate = (journalId: string, habitCode?: HabitCode, customNote?: string) => {
    const note = customNote !== undefined ? customNote : (notesByJournalId[journalId] ?? '');
    onValidateJournal(journalId, habitCode, note.trim() || undefined);
    setValidatedSuccessId(journalId);
    showToast('Validasi data jurnal anak berhasil diperbarui!');
    setTimeout(() => setValidatedSuccessId(null), 3000);
  };

  const handleSaveReflection = () => {
    const updated: ParentMonthlyReflection = {
      ...initialReflection,
      observedChange,
      difficulty,
      familySupport,
      nextMonthSupport,
      parentNote,
      updatedAt: new Date().toISOString(),
    };
    onSaveReflection(updated);
    setIsReflectionSaved(true);
    showToast('Refleksi bulanan orang tua berhasil disimpan!');
    setTimeout(() => setIsReflectionSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Child Identity Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-500 text-white text-2xl flex items-center justify-center shadow-sm">
            👦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">{studentName || 'Peserta Didik'}</h2>
              {className && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0753A5]">
                  {className}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {schoolName ? `${schoolName} • ` : ''}Pemantauan Kolaboratif Orang Tua & Sekolah
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0753A5] border border-blue-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Buka Laporan Resmi</span>
            </button>
          )}

          {/* Sub-tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveSubTab('OVERVIEW')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'OVERVIEW'
                  ? 'bg-white text-[#0753A5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Ringkasan Anak</span>
            </button>
            <button
              onClick={() => setActiveSubTab('VALIDATION')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'VALIDATION'
                  ? 'bg-white text-[#0753A5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Validasi Harian</span>
              {pendingJournals.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                  {pendingJournals.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('REFLECTION')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'REFLECTION'
                  ? 'bg-white text-[#0753A5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Refleksi Orang Tua</span>
            </button>
            <button
              onClick={() => setActiveSubTab('CHALLENGES')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'CHALLENGES'
                  ? 'bg-white text-[#0753A5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Tantangan Keluarga</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. OVERVIEW: Ringkasan Anak Saya */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Konsistensi 7 Kebiasaan</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-900">{consistencyPct}%</span>
                {recordedDays > 0 && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {recordedDays} Hari
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {recordedDays > 0
                  ? (consistencyPct >= 80 ? 'Status: Sangat Konsisten' : consistencyPct >= 60 ? 'Status: Berkembang Baik' : 'Status: Perlu Pendampingan')
                  : 'Status: Belum ada data'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Kelengkapan Jurnal</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-900">{recordedDays}</span>
                <span className="text-xs font-medium text-slate-400">/ {daysInMonth} Hari</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {recordedDays > 0 ? `${completenessPct}% Tercatat Rapi` : 'Belum ada catatan'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Validasi Orang Tua</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-[#0753A5]">{validatedCount}</span>
                <span className="text-xs font-medium text-slate-400">/ {recordedDays} Jurnal</span>
              </div>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                {pendingJournals.length > 0 ? `${pendingJournals.length} menunggu konfirmasi` : (recordedDays > 0 ? 'Semua telah divalidasi' : 'Belum ada jurnal')}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Tantangan Keluarga</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-amber-600">
                  {familyChallenges.filter((c) => c.completed).length}
                </span>
                <span className="text-xs font-medium text-slate-400">/ {familyChallenges.length} Selesai</span>
              </div>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">Aktivitas Rumah</p>
            </div>
          </div>

          {/* Habit Dimensions Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Capaian 7 Dimensi Kebiasaan {studentName ? studentName : 'Anak'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekapitulasi pembiasaan sepanjang bulan berjalan berbasis catatan harian.
                </p>
              </div>
              {className && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0753A5] border border-blue-100">
                  {className}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {habitDimensions.map((h, i) => (
                <div key={h.code} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">{i + 1}. {h.name}</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      h.pct >= 85 ? 'bg-emerald-100 text-emerald-800' : h.pct >= 70 ? 'bg-blue-100 text-[#0753A5]' : h.pct > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {h.pct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        h.pct >= 85 ? 'bg-emerald-500' : h.pct >= 70 ? 'bg-blue-500' : h.pct > 0 ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                      style={{ width: `${h.pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{h.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Feedback & Fast Quick Actions Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Teacher Feedback (2 cols) */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-6 rounded-3xl border border-blue-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0753A5] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  👩‍🏫
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Catatan dari Guru Wali Kelas {className ? `(${className})` : ''}</h4>
                  <p className="text-xs text-slate-500">Komunikasi Berkala Dewan Guru & Orang Tua</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed bg-white/70 p-4 rounded-2xl border border-blue-100/70">
                {studentName ? (
                  <p className="italic text-slate-600">
                    Catatan umpan balik dan rekomendasi pembiasaan untuk ananda <strong className="text-slate-800 font-semibold">{studentName}</strong> dari dewan guru akan diperbarui secara berkala pada akhir pekan dan masa evaluasi bulanan.
                  </p>
                ) : (
                  <p className="italic text-slate-400">
                    Belum ada catatan khusus dari wali kelas untuk ananda.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions (1 col) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Aksi Cepat Orang Tua</h4>
                <p className="text-xs text-slate-500">Langkah mudah mendampingi pembiasaan ananda hari ini:</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveSubTab('VALIDATION')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs font-bold text-slate-800 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Validasi Jurnal</span>
                  </span>
                  {pendingJournals.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {pendingJournals.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveSubTab('CHALLENGES')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-xs font-bold text-slate-800 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Tantangan Keluarga</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => setActiveSubTab('REFLECTION')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs font-bold text-slate-800 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#0753A5]" />
                    <span>Tulis Refleksi Bulanan</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {onOpenReportModal && (
                  <button
                    onClick={onOpenReportModal}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 text-xs font-bold text-[#0753A5] transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0753A5]" />
                      <span>Lihat Laporan Portofolio</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#0753A5]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VALIDATION */}
      {activeSubTab === 'VALIDATION' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Daftar Jurnal yang Perlu Divalidasi</span>
              <span className="text-xs font-semibold text-slate-500">
                ({pendingJournals.length} menunggu konfirmasi)
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sinkron Realtime ({liveSyncTime} WIB)
              </span>
              <button
                type="button"
                onClick={() => {
                  try {
                    window.dispatchEvent(new CustomEvent('si7kaih_journals_updated'));
                    setLiveSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                    showToast('Data jurnal anak berhasil disinkronkan!');
                  } catch (_e) {}
                }}
                title="Sinkronkan pembaruan data jurnal anak"
                className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Segarkan</span>
              </button>
            </div>
          </div>

          {/* Kebijakan Validasi Harian Orang Tua */}
          <div className="p-4 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 rounded-3xl border border-blue-200/80 flex items-start gap-3.5 text-xs text-blue-950 shadow-xs">
            <div className="w-9 h-9 rounded-2xl bg-[#0753A5] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Validasi Harian Sesuai Isian Anak</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0753A5] font-bold text-[10px] tracking-wide uppercase">
                  Data Sinkron Realtime
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-xs">
                Data jurnal di bawah ini disinkronkan langsung dari catatan harian yang diisi oleh ananda <strong>{studentName || 'Siswa'}</strong>. Orang tua memvalidasi dan mengapresiasi kebiasaan yang dicatatkan anak pada hari tersebut tanpa data default buatan.
              </p>
            </div>
          </div>

          {sortedJournals.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-center space-y-3.5 shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-[#0753A5] flex items-center justify-center text-3xl">
                📝
              </div>
              <h4 className="text-base font-bold text-slate-900">Belum Ada Data Jurnal dari Ananda</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Ananda <strong className="text-slate-800">{studentName || 'Peserta Didik'}</strong> belum mencatatkan isian jurnal harian pembiasaan. Data jurnal harian akan otomatis muncul di sini secara tersinkronisasi segera setelah ananda mengisi dan menyimpan jurnalnya.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Menunggu pengisian jurnal oleh ananda
                </span>
              </div>
            </div>
          ) : (
            sortedJournals.map((journal) => {
              const isFullyValidated = isJournalParentValidated(journal);
              const completedCount = journal.completedCount ?? Object.values(journal.entries || {}).filter((e: any) => e?.completed).length;
              const currentNote = notesByJournalId[journal.id] ?? (journal.parentValidationNote || '');

              return (
                <div
                  key={journal.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            Jurnal Tanggal: {journal.journalDate}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {completedCount} dari 7 Kebiasaan Terisi
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Status Data: <span className="font-semibold text-blue-600">{completedCount} kebiasaan dicatatkan ananda</span>
                          {journal.savedAt && (
                            <span className="ml-2 text-slate-500">• Waktu Simpan: <strong className="text-emerald-700 font-semibold">{journal.savedAt}</strong></span>
                          )}
                          {journal.parentValidatedAt && (
                            <span className="ml-2 text-slate-500">• Divalidasi: <strong className="text-indigo-700 font-semibold">{new Date(journal.parentValidatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</strong></span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isFullyValidated ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Tervalidasi Sesuai Jurnal Anak</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Siap Divalidasi Orang Tua</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Habit Cards Summary */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span>Rincian Kebiasaan yang Diisi Ananda:</span>
                      <span className="text-[10px] italic text-slate-400">Klik kebiasaan untuk validasi paraf individual</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {HABIT_LIST.map((h) => {
                        const entry = journal.entries?.[h.code];
                        const isDone = !!entry?.completed;
                        const isEntryValidated = !!entry?.parentValidated;
                        const noteSnippet = entry?.data?.optionalNote || entry?.data?.subject || entry?.data?.exerciseType || entry?.data?.socialAct;

                        return (
                          <button
                            key={h.code}
                            type="button"
                            onClick={() => handleValidate(journal.id, h.code)}
                            title={`Klik untuk validasi paraf ${h.name}`}
                            className={`p-2.5 rounded-2xl border text-center text-xs transition-all cursor-pointer text-left flex flex-col justify-between ${
                              isDone
                                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 hover:bg-emerald-100/70'
                                : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <div>
                              <p className="font-bold truncate text-[11px]">{h.name}</p>
                              <p className="text-[10px] mt-0.5 font-medium">
                                {isDone ? '✓ Dilakukan' : 'Belum'}
                              </p>
                              {noteSnippet && (
                                <p className="text-[9px] text-slate-500 truncate mt-0.5 italic">
                                  {noteSnippet}
                                </p>
                              )}
                            </div>
                            <div className="mt-1 pt-1 border-t border-slate-200/50 flex items-center justify-between">
                              <span className="text-[9px] font-semibold text-slate-400">Paraf:</span>
                              <span className={`text-[9px] font-bold ${isEntryValidated ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {isEntryValidated ? '✓ Ya' : '—'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions & Encouragement Note */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>Pesan Kasih Sayang & Dukungan untuk Ananda:</span>
                      </label>
                      <input
                        type="text"
                        value={currentNote}
                        onChange={(e) =>
                          setNotesByJournalId((prev) => ({ ...prev, [journal.id]: e.target.value }))
                        }
                        placeholder={journal.parentValidationNote || "Tuliskan apresiasi hangat untuk usaha ananda hari ini..."}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-blue-500"
                      />
                      {journal.parentValidationNote && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          Catatan sebelumnya: "{journal.parentValidationNote}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <span className="text-[11px] text-slate-500">
                        {validatedSuccessId === journal.id
                          ? '✓ Jurnal berhasil divalidasi sesuai data ananda!'
                          : `Validasi harian mengonfirmasi ${completedCount} kebiasaan yang dicatatkan ananda.`}
                      </span>
                      <button
                        id={`validate-btn-${journal.id}`}
                        onClick={() => handleValidate(journal.id, undefined, currentNote)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer ${
                          isFullyValidated
                            ? 'bg-slate-700 hover:bg-slate-800'
                            : 'bg-[#41A85F] hover:bg-emerald-700'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isFullyValidated
                            ? 'Perbarui Validasi & Catatan'
                            : `Validasi Sesuai Jurnal Anak (${completedCount}/7 Kebiasaan)`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. REFLECTION: Parent Monthly Reflection Form */}
      {activeSubTab === 'REFLECTION' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Formulir Refleksi Orang Tua (Bulanan)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Catatan pengamatan orang tua menjadi panduan berharga bagi guru dalam mendampingi tumbuh kembang karakter anak secara holistik.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                1. Perubahan positif yang paling tampak pada ananda di rumah bulan ini:
              </label>
              <textarea
                rows={3}
                value={observedChange}
                onChange={(e) => setObservedChange(e.target.value)}
                placeholder="Tuliskan perkembangan atau perubahan positif ananda yang diamati di rumah..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                2. Tantangan atau kesulitan yang masih dihadapi dalam pembiasaan di rumah:
              </label>
              <textarea
                rows={3}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                placeholder="Tuliskan kendala atau tantangan pembiasaan yang masih dihadapi..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                3. Bentuk dukungan keluarga yang telah kami berikan:
              </label>
              <textarea
                rows={3}
                value={familySupport}
                onChange={(e) => setFamilySupport(e.target.value)}
                placeholder="Tuliskan pendampingan dan dukungan yang telah diberikan keluarga di rumah..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                4. Rencana dukungan keluarga bulan depan:
              </label>
              <input
                type="text"
                value={nextMonthSupport}
                onChange={(e) => setNextMonthSupport(e.target.value)}
                placeholder="Tuliskan rencana pendampingan keluarga untuk bulan depan..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                5. Catatan / Pesan khusus untuk Bapak/Ibu Guru Wali Kelas:
              </label>
              <textarea
                rows={2}
                value={parentNote}
                onChange={(e) => setParentNote(e.target.value)}
                placeholder="Tuliskan catatan, pesan, atau masukan kolaborasi untuk guru wali kelas..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-emerald-600 font-bold">
              {isReflectionSaved && '✓ Refleksi orang tua tersimpan dengan sukses!'}
            </span>
            <button
              onClick={handleSaveReflection}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Refleksi Orang Tua</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Tantangan Kolaborasi Keluarga Hebat */}
      {activeSubTab === 'CHALLENGES' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-6 rounded-3xl border border-amber-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h3 className="text-base font-black text-amber-950">
                  Tantangan Kolaborasi Keluarga Hebat (Tri Sentra Pendidikan)
                </h3>
              </div>
              <p className="text-xs text-amber-900/80 max-w-2xl">
                Karakter mulia bertumbuh paling subur ketika teladan di rumah berpadu dengan pembiasaan di sekolah. Selesaikan aktivitas bersama ananda pekan ini.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/90 px-4 py-2.5 rounded-2xl border border-amber-200 shadow-xs">
              <Award className="w-6 h-6 text-amber-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Capaian Pekan Ini</span>
                <span className="text-sm font-black text-slate-900">
                  {familyChallenges.filter((c) => c.completed).length} dari {familyChallenges.length} Selesai
                </span>
              </div>
            </div>
          </div>

          {/* Grid of Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {familyChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`p-5 rounded-3xl border transition-all ${
                  challenge.completed
                    ? 'bg-emerald-50/50 border-emerald-200 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{challenge.title}</h4>
                      {challenge.completed && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          ✓ Selesai
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{challenge.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                    {challenge.impact}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {challenge.currentCount} / {challenge.targetCount} kali
                    </span>
                    {!challenge.completed ? (
                      <button
                        onClick={() => handleIncrementChallenge(challenge.id)}
                        className="px-3 py-1 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Catat Hari Ini</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Pekan Ini Tuntas</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Family Pledge Card */}
          <div className="p-5 rounded-3xl bg-blue-50/60 border border-blue-200/70 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-bold block text-blue-950">
                Komitmen Pengasuhan Positif SI-7KAIH:
              </span>
              Setiap catatan dan kehadiran orang tua adalah dorongan moral terkuat bagi kemandirian anak. Menghargai proses pembiasaan jauh lebih bermakna daripada menuntut kesempurnaan.
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
