// ============================================================================
// SI-7KAIH AI - HabitTrendsChart Component
// Visualisasi Tren Frekuensi Keterlaksanaan 7 Kebiasaan Selama 30 Hari Terakhir
// Menggunakan 'recharts' LineChart dengan Mode Total dan Per-Dimensi
// ============================================================================

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Sparkles, Filter, CheckCircle2, Calendar } from 'lucide-react';
import { DailyJournal, HabitCode } from '../../packages/types/src/index';
import { HABIT_LIST } from '../lib/constants';

interface HabitTrendsChartProps {
  journals: DailyJournal[];
  todayJournal?: DailyJournal;
}

// 7 distinct, accessible, high-contrast colors matching the theme
export const HABIT_CHART_COLORS: Record<HabitCode, { stroke: string; label: string; bg: string }> = {
  WAKE_EARLY: { stroke: '#f59e0b', label: 'Bangun Pagi', bg: 'bg-amber-100 text-amber-800' },
  WORSHIP: { stroke: '#0284c7', label: 'Beribadah', bg: 'bg-sky-100 text-sky-800' },
  EXERCISE: { stroke: '#10b981', label: 'Berolahraga', bg: 'bg-emerald-100 text-emerald-800' },
  HEALTHY_EATING: { stroke: '#ef4444', label: 'Makan Sehat', bg: 'bg-rose-100 text-rose-800' },
  LEARNING: { stroke: '#8b5cf6', label: 'Gemar Belajar', bg: 'bg-purple-100 text-purple-800' },
  SOCIAL: { stroke: '#06b6d4', label: 'Bermasyarakat', bg: 'bg-cyan-100 text-cyan-800' },
  SLEEP_EARLY: { stroke: '#6366f1', label: 'Tidur Cepat', bg: 'bg-indigo-100 text-indigo-800' },
};

export const HabitTrendsChart: React.FC<HabitTrendsChartProps> = ({
  journals,
  todayJournal,
}) => {
  const [viewMode, setViewMode] = useState<'TOTAL' | 'BY_DIMENSION'>('TOTAL');
  const [activeDimension, setActiveDimension] = useState<HabitCode | 'ALL'>('ALL');

  // Build last 30 days dataset (from D-29 up to today D-0)
  const chartData = useMemo(() => {
    // Index journals by date string (YYYY-MM-DD)
    const journalMap = new Map<string, DailyJournal>();
    journals.forEach((j) => {
      const d = j.journalDate || (j as any).date;
      if (d) {
        journalMap.set(d, j);
      }
    });

    if (todayJournal?.journalDate) {
      journalMap.set(todayJournal.journalDate, todayJournal);
    }

    const data: Array<{
      date: string;
      displayDate: string;
      shortDate: string;
      dayOfWeek: string;
      completedTotal: number;
      WAKE_EARLY: number;
      WORSHIP: number;
      EXERCISE: number;
      HEALTHY_EATING: number;
      LEARNING: number;
      SOCIAL: number;
      SLEEP_EARLY: number;
      isValidated: boolean;
      hasRecord: boolean;
    }> = [];

    const now = new Date();
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const journal = journalMap.get(dateStr);
      let completedTotal = 0;
      const habitValues: Record<HabitCode, number> = {
        WAKE_EARLY: 0,
        WORSHIP: 0,
        EXERCISE: 0,
        HEALTHY_EATING: 0,
        LEARNING: 0,
        SOCIAL: 0,
        SLEEP_EARLY: 0,
      };

      let isValidated = false;
      let hasRecord = false;

      if (journal) {
        hasRecord = true;
        isValidated = !!(
          journal.parentValidated ||
          (journal as any).teacherValidated ||
          (journal.entries &&
            Object.values(journal.entries).some(
              (e: any) => e?.parentValidated || e?.teacherValidated || e?.validationStatus === 'VALIDATED'
            ))
        );

        // Calculate each habit completion
        HABIT_LIST.forEach((h) => {
          const entry =
            journal.entries?.[h.code] ||
            (journal as any).habits?.[h.code] ||
            (journal as any)[h.code];
          const isDone = !!(entry?.completed || entry === true);
          if (isDone) {
            habitValues[h.code] = 1;
            completedTotal++;
          }
        });

        // Fallback to completedCount if entries map is empty
        if (completedTotal === 0 && (journal.completedCount || 0) > 0) {
          completedTotal = journal.completedCount;
        }
      }

      data.push({
        date: dateStr,
        displayDate: `${d.getDate()} ${monthNames[d.getMonth()]}`,
        shortDate: `${d.getDate()}/${d.getMonth() + 1}`,
        dayOfWeek: dayNames[d.getDay()],
        completedTotal,
        ...habitValues,
        isValidated,
        hasRecord,
      });
    }

    return data;
  }, [journals, todayJournal]);

  // Summary statistics for the last 30 days
  const stats = useMemo(() => {
    const daysWithData = chartData.filter((d) => d.hasRecord && d.completedTotal > 0);
    const recordedDaysCount = daysWithData.length;
    const totalHabitsCompleted = chartData.reduce((acc, d) => acc + d.completedTotal, 0);
    const avgHabitsPerActiveDay =
      recordedDaysCount > 0
        ? Math.round((totalHabitsCompleted / recordedDaysCount) * 10) / 10
        : 0;
    const habitualDays = chartData.filter((d) => d.completedTotal >= 6).length;
    const latest7Days = chartData.slice(-7);
    const latest7Avg =
      latest7Days.filter((d) => d.hasRecord).length > 0
        ? Math.round(
            (latest7Days.reduce((acc, d) => acc + d.completedTotal, 0) /
              Math.max(1, latest7Days.filter((d) => d.hasRecord).length)) *
              10
          ) / 10
        : 0;

    return {
      recordedDaysCount,
      totalHabitsCompleted,
      avgHabitsPerActiveDay,
      habitualDays,
      latest7Avg,
    };
  }, [chartData]);

  // Custom Recharts Tooltip with rich details
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-3 rounded-2xl shadow-xl border border-slate-700/80 text-xs min-w-[210px] z-50">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="font-bold text-slate-200">
              {dataPoint?.dayOfWeek}, {dataPoint?.displayDate}
            </span>
            {dataPoint?.isValidated && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Tervalidasi
              </span>
            )}
          </div>

          {viewMode === 'TOTAL' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Kebiasaan Terlaksana:</span>
                <span className="font-extrabold text-base text-blue-400">
                  {dataPoint?.completedTotal} <span className="text-xs text-slate-400 font-normal">/ 7</span>
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.round((dataPoint?.completedTotal / 7) * 100)}%` }}
                />
              </div>
              <div className="pt-1.5 grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                {HABIT_LIST.map((h) => {
                  const done = !!dataPoint?.[h.code];
                  return (
                    <div key={h.code} className="flex items-center gap-1 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${done ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span className={done ? 'text-slate-200' : 'text-slate-500'}>{h.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {payload.map((item: any) => {
                const habitMeta = HABIT_CHART_COLORS[item.dataKey as HabitCode];
                const isCompleted = item.value === 1;
                return (
                  <div key={item.dataKey} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-300">{habitMeta?.label || item.name}</span>
                    </div>
                    <span
                      className={`font-bold ${
                        isCompleted ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {isCompleted ? 'Terlaksana' : 'Belum'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="habit-30d-trends-card"
      className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0753A5] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Grafik Tren Keterlaksanaan 7 Kebiasaan</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0753A5] border border-blue-100">
                  30 Hari Terakhir
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualisasi frekuensi pembiasaan harian yang dicatat secara konsisten.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setViewMode('TOTAL');
                setActiveDimension('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'TOTAL'
                  ? 'bg-white text-[#0753A5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Frekuensi Total (0-7)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('BY_DIMENSION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'BY_DIMENSION'
                  ? 'bg-white text-[#0753A5] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per Dimensi Kebiasaan
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block">Hari Aktif Mengisi</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-slate-900">{stats.recordedDaysCount}</span>
            <span className="text-xs text-slate-500">/ 30 hari</span>
          </div>
        </div>

        <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100/80">
          <span className="text-[11px] font-semibold text-blue-700 block">Total Pembiasaan Selesai</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-blue-900">{stats.totalHabitsCompleted}</span>
            <span className="text-xs text-blue-600">kegiatan</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100/80">
          <span className="text-[11px] font-semibold text-emerald-700 block">Hari Target (6-7 Terbiasa)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-emerald-900">{stats.habitualDays}</span>
            <span className="text-xs text-emerald-600">hari</span>
          </div>
        </div>

        <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100/80">
          <span className="text-[11px] font-semibold text-indigo-700 block">Rerata 7 Hari Terakhir</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-indigo-900">{stats.latest7Avg}</span>
            <span className="text-xs text-indigo-600">/ 7 kebiasaan</span>
          </div>
        </div>
      </div>

      {/* Dimension Filter Bar (Visible in BY_DIMENSION mode) */}
      {viewMode === 'BY_DIMENSION' && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Fokus Dimensi:</span>
          </span>
          <button
            type="button"
            onClick={() => setActiveDimension('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeDimension === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua (7 Garis)
          </button>
          {HABIT_LIST.map((h) => {
            const meta = HABIT_CHART_COLORS[h.code];
            const isSelected = activeDimension === h.code;
            return (
              <button
                key={h.code}
                type="button"
                onClick={() => setActiveDimension(h.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                style={{
                  backgroundColor: isSelected ? meta.stroke : undefined,
                  borderColor: isSelected ? meta.stroke : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#ffffff' : meta.stroke }}
                />
                <span>{h.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Recharts LineChart Canvas */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="totalLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0753A5" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="shortDate"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              domain={viewMode === 'TOTAL' ? [0, 7] : [0, 1.2]}
              ticks={viewMode === 'TOTAL' ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 1]}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => (viewMode === 'TOTAL' ? `${v}` : v === 1 ? 'Ya' : 'Tdk')}
            />
            <Tooltip content={<CustomTooltip />} />

            {viewMode === 'TOTAL' ? (
              <>
                {/* Target threshold indicator (>=6 is HABITUAL) */}
                <ReferenceLine
                  y={6}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Target Terbiasa (6)',
                    position: 'insideTopRight',
                    fill: '#059669',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completedTotal"
                  name="Frekuensi Kebiasaan Terlaksana"
                  stroke="url(#totalLineGradient)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#0753A5', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                />
              </>
            ) : (
              <>
                {HABIT_LIST.filter(
                  (h) => activeDimension === 'ALL' || activeDimension === h.code
                ).map((h) => {
                  const meta = HABIT_CHART_COLORS[h.code];
                  return (
                    <Line
                      key={h.code}
                      type="monotone"
                      dataKey={h.code}
                      name={h.name}
                      stroke={meta.stroke}
                      strokeWidth={activeDimension === h.code ? 3 : 2}
                      dot={{ r: 2.5, fill: meta.stroke }}
                      activeDot={{ r: 5, fill: meta.stroke, strokeWidth: 2, stroke: '#fff' }}
                    />
                  );
                })}
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Insight Note */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            {stats.recordedDaysCount >= 20
              ? 'Konsistensi luar biasa! Kamu sudah rutin mengisi jurnal 7 Kebiasaan secara konsisten.'
              : stats.recordedDaysCount > 0
              ? `Tercatat ${stats.recordedDaysCount} hari pengisian dalam 30 hari terakhir. Pertahankan rutinitasmu!`
              : 'Belum ada catatan jurnal dalam 30 hari terakhir. Mulai isi jurnalmu hari ini!'}
          </span>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[#0753A5] inline-block rounded" />
            <span>Grafik Garis Recharts</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-emerald-500 inline-block rounded border-dashed" />
            <span>Target Terbiasa (6/7)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
