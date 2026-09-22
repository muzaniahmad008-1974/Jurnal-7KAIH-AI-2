// ============================================================================
// SI-7KAIH AI - Badges & Character Milestones Component
// Positive reinforcement without competitive leaderboard or character ranking
// ============================================================================

import React, { useState, useMemo } from 'react';
import { Badge } from '../../packages/types/src/index';
import { Award, Flame, ShieldCheck, Star, HelpCircle, CheckCircle2, Clock, X, Info } from 'lucide-react';

interface BadgesViewProps {
  badges: Badge[];
  studentName: string;
}

export const BadgesView: React.FC<BadgesViewProps> = ({ badges, studentName }) => {
  const [filter, setFilter] = useState<'ALL' | 'EARNED' | 'IN_PROGRESS'>('ALL');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const earnedCount = badges.filter((b) => !!b.earnedAt).length;
  const inProgressCount = badges.length - earnedCount;

  const filteredBadges = useMemo(() => {
    if (filter === 'EARNED') return badges.filter((b) => !!b.earnedAt);
    if (filter === 'IN_PROGRESS') return badges.filter((b) => !b.earnedAt);
    return badges;
  }, [badges, filter]);

  const getBadgeVisual = (code: string, isEarned: boolean) => {
    switch (code) {
      case 'STREAK_3':
        return { emoji: '🔥', dimension: '3 Hari Aktif', color: 'text-amber-600', bg: 'from-amber-100 to-amber-200' };
      case 'STREAK_7':
        return { emoji: '⚡', dimension: 'Konsisten 7 Hari', color: 'text-orange-600', bg: 'from-orange-100 to-orange-200' };
      case 'DEVOUT_SPIRIT':
        return { emoji: '🕌', dimension: 'Beribadah', color: 'text-emerald-600', bg: 'from-emerald-100 to-emerald-200' };
      case 'EARLY_BIRD':
        return { emoji: '🌅', dimension: 'Bangun Pagi', color: 'text-amber-600', bg: 'from-amber-100 to-amber-200' };
      case 'ACTIVE_MOVER':
        return { emoji: '🏃‍♂️', dimension: 'Berolahraga', color: 'text-sky-600', bg: 'from-sky-100 to-sky-200' };
      case 'HEALTHY_CHAMP':
        return { emoji: '🥗', dimension: 'Makan Sehat & Bergizi', color: 'text-green-600', bg: 'from-green-100 to-green-200' };
      case 'CURIOUS_READER':
        return { emoji: '📖', dimension: 'Gemar Belajar', color: 'text-indigo-600', bg: 'from-indigo-100 to-indigo-200' };
      case 'HELPING_HAND':
        return { emoji: '🤝', dimension: 'Bermasyarakat', color: 'text-rose-600', bg: 'from-rose-100 to-rose-200' };
      case 'DISCIPLINED_REST':
        return { emoji: '🌙', dimension: 'Tidur Cepat', color: 'text-purple-600', bg: 'from-purple-100 to-purple-200' };
      case 'GOLDEN_HABIT_21':
        return { emoji: '👑', dimension: 'Karakter Emas 21 Hari', color: 'text-yellow-600', bg: 'from-yellow-100 to-yellow-200' };
      default:
        return { emoji: isEarned ? '🏅' : '🔒', dimension: 'Pembiasaan', color: 'text-blue-600', bg: 'from-blue-100 to-blue-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-black text-slate-900">
              Lencana Pencapaian Karakter
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Apresiasi atas konsistensi pembiasaan 7 Kebiasaan Anak Indonesia Hebat ananda <span className="font-bold text-slate-700">{studentName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border shadow-xs ${
              earnedCount > 0
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <Star className={`w-4 h-4 ${earnedCount > 0 ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span>
              {earnedCount > 0
                ? `${earnedCount} dari ${badges.length} Lencana Diraih`
                : `0 dari ${badges.length} Diraih (Sedang Berproses)`}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Sync Status Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'ALL'
                ? 'bg-[#0753A5] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Lencana ({badges.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('EARNED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'EARNED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sudah Diraih ({earnedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'IN_PROGRESS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sedang Berproses ({inProgressCount})
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Data tersinkronisasi otomatis dengan catatan jurnal harian</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((b) => {
          const isEarned = !!b.earnedAt;
          const visual = getBadgeVisual(b.code, isEarned);
          const current = b.currentCount || 0;
          const target = b.targetCount || 14;
          const pct = typeof b.progressPercent === 'number' ? b.progressPercent : Math.min(100, Math.round((current / target) * 100));

          return (
            <div
              key={b.id}
              onClick={() => setSelectedBadge(b)}
              className={`p-5 rounded-3xl border transition-all shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-md ${
                isEarned
                  ? 'bg-white border-amber-300 hover:border-amber-400'
                  : 'bg-white/80 border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${
                      isEarned
                        ? `bg-gradient-to-tr ${visual.bg}`
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {visual.emoji}
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-block ${
                        isEarned
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {isEarned ? 'Diraih ✓' : 'Berproses'}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium mt-1">
                      {visual.dimension}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{b.title}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {b.description}
                  </p>
                </div>

                {/* Kriteria Diraih Box */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-slate-400" />
                      <span>Kriteria:</span>
                    </span>
                    <span className="font-bold text-slate-800">
                      Target {target} Hari
                    </span>
                  </div>
                  <p className="text-slate-500 text-[10px] leading-tight">
                    {b.criteriaDescription || `Terlaksana minimal ${target} hari pembiasaan.`}
                  </p>

                  {/* Progress Bar */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                      <span className={isEarned ? 'text-emerald-700' : 'text-slate-600'}>
                        Tercapai: {current}/{target} Hari
                      </span>
                      <span className={isEarned ? 'text-emerald-700' : 'text-blue-700'}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isEarned
                            ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                            : 'bg-[#0753A5]'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  {isEarned ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Diraih: {b.earnedAt}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Kurang {Math.max(0, target - current)} hari lagi</span>
                    </span>
                  )}
                </span>
                <span className="text-blue-600 hover:underline font-bold text-[10px]">
                  Detail Kriteria &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational Notice */}
      <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex items-center gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
        <p>
          <strong>Prinsip Pedagogis SI-7KAIH:</strong> Lencana Karakter bukan untuk kompetisi atau perankingan antar siswa, melainkan bentuk pengakuan atas usaha, ketekunan, dan kejujuran ananda dalam merawat 7 Kebiasaan Anak Indonesia Hebat.
        </p>
      </div>

      {/* Modal Detail Lencana */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-3xl flex items-center justify-center shadow-xs">
                  {getBadgeVisual(selectedBadge.code, !!selectedBadge.earnedAt).emoji}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedBadge.title}</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {getBadgeVisual(selectedBadge.code, !!selectedBadge.earnedAt).dimension}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>{selectedBadge.description}</p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Kriteria Syarat Perolehan:</span>
                  <span className="text-[#0753A5]">Target {selectedBadge.targetCount || 14} Hari</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  {selectedBadge.criteriaDescription || `Melaksanakan kebiasaan ini secara konsisten minimal ${selectedBadge.targetCount || 14} hari pembiasaan.`}
                </p>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span>Progres Ananda:</span>
                    <span className={selectedBadge.earnedAt ? 'text-emerald-700 font-bold' : 'text-blue-700 font-bold'}>
                      {selectedBadge.currentCount || 0} / {selectedBadge.targetCount || 14} Hari ({selectedBadge.progressPercent || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedBadge.earnedAt ? 'bg-emerald-500' : 'bg-[#0753A5]'
                      }`}
                      style={{ width: `${selectedBadge.progressPercent || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Status Saat Ini:</strong>{' '}
                  {selectedBadge.earnedAt ? (
                    <span className="text-emerald-800 font-bold">
                      Selamat! Lencana ini telah berhasil diraih pada {selectedBadge.earnedAt}.
                    </span>
                  ) : (
                    <span>
                      Sedang berproses. Masih memerlukan {Math.max(0, (selectedBadge.targetCount || 14) - (selectedBadge.currentCount || 0))} hari pembiasaan lagi untuk membuka lencana ini.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
