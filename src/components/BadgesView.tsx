// ============================================================================
// SI-7KAIH AI - Badges & Character Milestones Component
// Positive reinforcement without competitive leaderboard or character ranking
// ============================================================================

import React from 'react';
import { Badge } from '../../packages/types/src/index';
import { Award, Flame, ShieldCheck, Star } from 'lucide-react';

interface BadgesViewProps {
  badges: Badge[];
  studentName: string;
}

export const BadgesView: React.FC<BadgesViewProps> = ({ badges, studentName }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-slate-900">
              Lencana Pencapaian Karakter
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Apresiasi atas konsistensi dan ikhtiar baik ananda <span className="font-bold text-slate-700">{studentName}</span>.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>{badges.filter((b) => b.earnedAt).length} Lencana Diraih</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((b) => {
          const isEarned = !!b.earnedAt;
          return (
            <div
              key={b.id}
              className={`p-5 rounded-3xl border transition-all shadow-xs flex flex-col justify-between ${
                isEarned
                  ? 'bg-white border-amber-200/80 hover:border-amber-300'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${
                      isEarned
                        ? 'bg-gradient-to-tr from-amber-100 to-amber-200'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isEarned ? '🏆' : '🔒'}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isEarned
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isEarned ? 'Terbuka' : 'Terkunci'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{b.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {isEarned ? `Diraih: ${b.earnedAt}` : 'Terus berproses!'}
                </span>
                {isEarned && (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    <span>Hebat!</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational Notice */}
      <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex items-center gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
        <p>
          <strong>Prinsip Pedagogis:</strong> Lencana ini bukan untuk perlombaan antar siswa, melainkan bentuk pengakuan atas usaha, ketekunan, dan kejujuran ananda dalam merawat kebiasaan baik setiap hari.
        </p>
      </div>
    </div>
  );
};
