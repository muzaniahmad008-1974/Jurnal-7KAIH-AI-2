// ============================================================================
// SI-7KAIH AI - Monthly Habit Calendar Component
// Visual calendar strictly respecting the statistical rule:
// Missing data MUST NOT visually equal failed behavior.
// Realtime synchronized with student journal updates and localStorage.
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  DailyJournal,
  HabitCode,
} from '../../packages/types/src/index';
import { HABIT_LIST } from '../lib/constants';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sun,
  HeartHandshake,
  Activity,
  Apple,
  BookOpen,
  Users,
  Moon,
} from 'lucide-react';
import { calculateHabitualThreshold } from '../../packages/analytics/src/index';

interface CalendarViewProps {
  journals: DailyJournal[];
  onSelectDate: (dateStr: string) => void;
  studentName: string;
  studentId?: string;
  studentNisn?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  journals,
  onSelectDate,
  studentName,
  studentId,
  studentNisn,
}) => {
  const [selectedHabitFilter, setSelectedHabitFilter] = useState<HabitCode | 'ALL'>('ALL');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Synced journals state guaranteeing realtime synchronization
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
    return journals || [];
  });

  // Keep syncedJournals in sync with props
  useEffect(() => {
    if (journals) {
      setSyncedJournals(journals);
    }
  }, [journals]);

  // Realtime listeners for journal updates from form, modal, or other tabs
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
      if (e.key === 'si7kaih_journals_prod') {
        handleSync();
      }
    });

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('si7kaih_sync_channel');
        bc.onmessage = (msg) => {
          if (msg.data?.type === 'JOURNALS_UPDATED' || msg.data?.type === 'STUDENT_UPDATED') {
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

  const handleManualRefresh = () => {
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month metadata
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Filter journals specifically for active student
  const studentJournals = useMemo(() => {
    const list = syncedJournals.length > 0 ? syncedJournals : (journals || []);
    const targetId = (studentId || '').trim().toLowerCase();
    const targetNisn = (studentNisn || '').trim();
    const targetName = (studentName || '').trim().toLowerCase();

    return list.filter((j) => {
      if (targetId && j.studentId && j.studentId.toLowerCase() === targetId) return true;
      if (targetNisn && j.studentNisn && j.studentNisn === targetNisn) return true;
      if (targetName && j.studentName && j.studentName.trim().toLowerCase() === targetName) return true;
      if (!j.studentId && !j.studentNisn && !j.studentName) return true;
      return false;
    });
  }, [syncedJournals, journals, studentId, studentNisn, studentName]);

  // Map journals by date
  const journalMap = useMemo(() => {
    const map = new Map<string, DailyJournal>();
    studentJournals.forEach((j) => {
      map.set(j.journalDate, j);
    });
    return map;
  }, [studentJournals]);

  // Current month journals for statistical summary
  const currentMonthJournals = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return studentJournals.filter((j) => j.journalDate && j.journalDate.startsWith(prefix));
  }, [studentJournals, year, month]);

  const recordedDays = useMemo(() => {
    const dates = new Set(
      currentMonthJournals
        .filter((j) => (j.completedCount || 0) > 0 || Object.values(j.entries || {}).some((e: any) => e?.completed))
        .map((j) => j.journalDate)
    );
    return dates.size;
  }, [currentMonthJournals]);

  const habitualDays = useMemo(() => {
    return currentMonthJournals.filter((j) => (j.completedCount || 0) >= 6).length;
  }, [currentMonthJournals]);

  const averageCompletedCount = useMemo(() => {
    if (recordedDays === 0) return 0;
    const total = currentMonthJournals.reduce((acc, j) => {
      const cnt = j.completedCount ?? Object.values(j.entries || {}).filter((e: any) => e?.completed).length;
      return acc + cnt;
    }, 0);
    return Math.round((total / recordedDays) * 10) / 10;
  }, [currentMonthJournals, recordedDays]);

  const validatedDaysCount = useMemo(() => {
    return currentMonthJournals.filter(
      (j) => j.parentValidated || Object.values(j.entries || {}).some((e: any) => e?.parentValidated)
    ).length;
  }, [currentMonthJournals]);

  const targetThreshold = calculateHabitualThreshold(daysInMonth);
  const completenessRate = Math.round((recordedDays / daysInMonth) * 100);

  const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleTodayMonth = () => {
    setCurrentDate(new Date());
  };

  const isCurrentMonthView = useMemo(() => {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() === month;
  }, [year, month]);

  return (
    <div className="space-y-6">
      {/* Header & Month Navigation Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0753A5] flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-[#0753A5]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Kalender 7 Kebiasaan: {monthNames[month]} {year}
                </h2>
                <p className="text-xs text-slate-500">
                  Jejak pembiasaan karakter ananda <span className="font-bold text-slate-700">{studentName}</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Real-time sync badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>Sinkron: {lastSyncTime}</span>
            </div>

            {/* Manual refresh button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
              title="Sinkronkan dengan data jurnal terkini"
            >
              <RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* Month Navigation */}
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-all cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {!isCurrentMonthView && (
                <button
                  type="button"
                  onClick={handleTodayMonth}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0753A5] hover:bg-white transition-all cursor-pointer"
                >
                  Bulan Ini
                </button>
              )}
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-all cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Cards Monthly Statistical Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
            <span className="text-[11px] font-semibold text-blue-700 block">Hari Tercatat</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900">{recordedDays}</span>
              <span className="text-xs text-slate-500">/ {daysInMonth} hari ({completenessRate}%)</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-700 block">Terbiasa (6-7 Selesai)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900">{habitualDays}</span>
              <span className="text-xs text-slate-500">hari ({targetThreshold} target)</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-700 block">Rerata Kebiasaan</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900">{averageCompletedCount}</span>
              <span className="text-xs text-slate-500">/ 7 kebiasaan</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
            <span className="text-[11px] font-semibold text-indigo-700 block">Tervalidasi Orang Tua</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900">{validatedDaysCount}</span>
              <span className="text-xs text-slate-500">hari tervalidasi</span>
            </div>
          </div>
        </div>

        {/* Habit Filter Chips */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1">Tampilan:</span>
          <button
            onClick={() => setSelectedHabitFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedHabitFilter === 'ALL'
                ? 'bg-[#0753A5] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua (Ringkasan 7 Kebiasaan)
          </button>
          {HABIT_LIST.map((h) => (
            <button
              key={h.code}
              onClick={() => setSelectedHabitFilter(h.code)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedHabitFilter === h.code
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {dayHeaders.map((d, idx) => (
            <div
              key={d}
              className={`text-xs font-bold py-1.5 ${
                idx === 0 || idx === 6 ? 'text-rose-500' : 'text-slate-500'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-2xl bg-slate-50/50 border border-transparent" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const journal = journalMap.get(dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            // Determine status based on habit filter
            let isHabitDone = false;
            let cellStyle = 'bg-slate-50/80 border-slate-200 text-slate-700'; // Missing/unrecorded by default (neutral gray)
            let badgeText = 'Belum Dicatat';
            let badgeColor = 'text-slate-400 bg-slate-100';

            if (journal && ((journal.completedCount || 0) > 0 || Object.values(journal.entries || {}).some((e: any) => e?.completed))) {
              if (selectedHabitFilter === 'ALL') {
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
                const entry = journal.entries?.[selectedHabitFilter];
                isHabitDone = !!entry?.completed;
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
                onClick={() => onSelectDate(dateStr)}
                className={`h-20 sm:h-24 p-2 rounded-2xl border flex flex-col justify-between text-left transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.01] ${cellStyle} ${
                  isToday ? 'ring-2 ring-blue-500 ring-offset-2 font-bold' : ''
                }`}
                title={`Klik untuk melihat / mengisi jurnal ${dateStr}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-black ${isToday ? 'px-1.5 py-0.5 rounded-full bg-blue-600 text-white' : ''}`}>
                    {dayNum}
                  </span>
                  {journal && (
                    <span className="text-[10px] hidden sm:inline font-semibold">
                      {isValidated ? '✅ Valid' : '⏳ Menunggu'}
                    </span>
                  )}
                </div>

                <div className="w-full">
                  <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md block truncate text-center ${badgeColor}`}>
                    {badgeText}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Non-punitive Statistical Invariant Legend */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-300" />
              <span className="text-slate-600 font-medium">Terbiasa / 6-7 Selesai</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-sky-100 border border-sky-300" />
              <span className="text-slate-600 font-medium">4-5 Selesai</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300" />
              <span className="text-slate-600 font-medium">1-3 Selesai</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-300" />
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
    </div>
  );
};
