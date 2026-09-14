// ============================================================================
// SI-7KAIH AI - Pengelolaan Sesi & Akun Autentikasi Mandiri
// Seluruh Akun Dibuat & Dikelola Mandiri oleh Admin (Bebas Portal Eksternal)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  X,
  School,
  KeyRound,
  ArrowRight,
  Shield,
  Search,
  UserCheck,
} from 'lucide-react';
import { UserPersona, getStoredUsers } from '../lib/constants';
import { UserAvatar } from './UserAvatar';

interface SSOModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: UserPersona;
  onSelectPersona: (persona: UserPersona) => void;
  onLogout?: () => void;
}

export const SSOModal: React.FC<SSOModalProps> = ({
  isOpen,
  onClose,
  currentPersona,
  onSelectPersona,
  onLogout,
}) => {
  const [users, setUsers] = useState<UserPersona[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'STUDENT_PARENT' | 'EDUCATOR' | 'ADMIN_SUPERVISOR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUsers(getStoredUsers());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayedPersonas = users.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.identifierValue.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    if (categoryFilter === 'STUDENT_PARENT') {
      return p.role === 'STUDENT' || p.role === 'PARENT';
    }
    if (categoryFilter === 'EDUCATOR') {
      return p.role === 'TEACHER' || p.role === 'PRINCIPAL';
    }
    if (categoryFilter === 'ADMIN_SUPERVISOR') {
      return p.role === 'SUPERVISOR' || p.role === 'SCHOOL_ADMIN' || p.role === 'SUPER_ADMIN';
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Institutional Header */}
        <div className="bg-gradient-to-r from-[#0753A5] via-[#0A64C2] to-[#1478D8] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-2xl text-white shadow-inner">
              7K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  ● Autentikasi Mandiri Satuan Pendidikan
                </span>
                <span className="text-[10px] text-blue-200">
                  Non-Portal Eksternal
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                Pengelolaan Sesi & Akun Mandiri SI-7KAIH
              </h2>
              <p className="text-[11px] text-blue-100">
                Kredensial seluruh pengguna diterbitkan & dikelola mandiri oleh Administrator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Session Status Card */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600">
              Sesi Aktif: <strong className="text-slate-900">{currentPersona.name}</strong> ({currentPersona.title})
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-300">
              🛡️ AUTENTIKASI MANDIRI
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Token Mandiri Internal • Sesi Aman</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {/* Channel Explanation Box */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0753A5] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#0753A5]">
                Kedaulatan Penuh Autentikasi Pengguna
              </p>
              <p className="text-[11px] text-blue-900 leading-relaxed mt-0.5">
                Pengaturan hak akses, verifikasi identitas, dan penerbitan kredensial seluruh pengguna (Siswa, Orang Tua, Guru, Kepala Sekolah, Pengawas, dan Operator) dibuat 100% secara mandiri oleh Administrator Satuan Pendidikan tanpa terhubung ke portal luar manapun.
              </p>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Sesi Akun Terdaftar ({displayedPersonas.length} Akun)
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setCategoryFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    categoryFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setCategoryFilter('STUDENT_PARENT')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    categoryFilter === 'STUDENT_PARENT'
                      ? 'bg-[#0753A5] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Siswa & Wali
                </button>
                <button
                  onClick={() => setCategoryFilter('EDUCATOR')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    categoryFilter === 'EDUCATOR'
                      ? 'bg-[#0753A5] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Guru & Kepsek
                </button>
                <button
                  onClick={() => setCategoryFilter('ADMIN_SUPERVISOR')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    categoryFilter === 'ADMIN_SUPERVISOR'
                      ? 'bg-[#0753A5] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pengawas & Admin
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Cari akun mandiri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>

          {/* Personas Cards */}
          <div className="grid grid-cols-1 gap-2">
            {displayedPersonas.map((p) => {
              const isActive = p.id === currentPersona.id;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPersona(p);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-blue-50/80 border-[#0753A5] shadow-xs ring-1 ring-[#0753A5]/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      avatar={p.avatar}
                      role={p.role}
                      name={p.name}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {p.name}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md border bg-emerald-50 text-emerald-800 border-emerald-200">
                          MANDIRI
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Sesi Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-0.5">
                        {p.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">
                          Username: {p.username || p.identifierValue}
                        </span>
                        <span className="text-slate-400">
                          Dikelola: {p.managedBy || 'Admin Sekolah'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isActive ? (
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                        Sedang Aktif
                      </span>
                    ) : (
                      <button
                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl text-[#0753A5] bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <span>Ganti Sesi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100/80 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-[#0753A5]" />
            <span>Sistem Mandiri Satuan Pendidikan • Non-Portal Eksternal</span>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition-colors cursor-pointer text-xs"
              >
                Keluar Sesi
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
