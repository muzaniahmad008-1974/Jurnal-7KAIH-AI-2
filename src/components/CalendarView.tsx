// ============================================================================
// SI-7KAIH AI - Monthly Habit Calendar Component
// Visual calendar strictly respecting the statistical rule:
// Missing data MUST NOT visually equal failed behavior.
// ============================================================================

import React, { useState } from 'react';
import {
  DailyJournal,
  HabitCode,
} from '../../packages/types/src/index';
import { HABIT_MASTERS, HABIT_LIST } from '../lib/constants';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface CalendarViewProps {
  journals: DailyJournal[];
  onSelectDate: (dateStr: string) => void;
  studentName: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  journals,
  onSelectDate,
  studentName,
}) => {
  const [selectedHabitFilter, setSelectedHabitFilter] = useState<HabitCode | 'ALL'>('ALL');
  const [currentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month metadata
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Map journals by date
  const journalMap = new Map<string, DailyJournal>();
  journals.forEach((j) => {
    journalMap.set(j.journalDate, j);
  });

  const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#0753A5]" />
            <h2 className="text-lg font-black text-slate-900">
              Kalender 7 Kebiasaan: {monthNames[month]} {year}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Jejak pembiasaan karakter ananda <span className="font-bold text-slate-700">{studentName}</span>.
          </p>
        </div>

        {/* Habit Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedHabitFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedHabitFilter === 'ALL'
                ? 'bg-[#0753A5] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua (Ringkasan)
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

            if (journal) {
              if (selectedHabitFilter === 'ALL') {
                const count = journal.completedCount;
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
                const entry = journal.entries[selectedHabitFilter];
                isHabitDone = !!entry?.completed;
                if (isHabitDone) {
                  cellStyle = 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-100/70';
                  badgeText = 'Terlaksana';
                  badgeColor = 'text-emerald-800 bg-emerald-100';
                } else {
                  cellStyle = 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100/70';
                  badgeText = 'Belum';
                  badgeColor = 'text-amber-700 bg-amber-100';
                }
              }
            }

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`h-20 sm:h-24 p-2 rounded-2xl border flex flex-col justify-between text-left transition-all cursor-pointer shadow-xs ${cellStyle} ${
                  isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-black ${isToday ? 'px-1.5 py-0.5 rounded-full bg-blue-600 text-white' : ''}`}>
                    {dayNum}
                  </span>
                  {journal && (
                    <span className="text-[10px] hidden sm:inline">
                      {journal.parentValidated || Object.values(journal.entries || {}).some((e: any) => e?.parentValidated)
                        ? '✅ Tervalidasi'
                        : '⏳ Menunggu'}
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
              <strong>Catatan Statistik:</strong> Data belum dicatat <span className="underline">bukan</span> berarti anak tidak melaksanakan kebiasaan.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
