// ============================================================================
// SI-7KAIH AI - Halaman Masuk / Portal Autentikasi Mandiri Satuan Pendidikan
// Seluruh Akun Dibuat & Dikelola Mandiri oleh Admin (Bebas Portal Eksternal)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  School,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  Shield,
  User,
  Users,
  Search,
  Sparkles,
} from 'lucide-react';
import { UserPersona, getStoredUsers, verifyUserPassword } from '../lib/constants';
import { UserAvatar } from './UserAvatar';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (persona: UserPersona) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [users, setUsers] = useState<UserPersona[]>([]);
  const [inputIdentifier, setInputIdentifier] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'STUDENT_PARENT' | 'EDUCATOR' | 'ADMIN_SUPERVISOR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUsers(getStoredUsers());
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanId = inputIdentifier.trim().toLowerCase();
    if (!cleanId) {
      setErrorMessage('Harap masukkan ID Pengguna, Username, NISN, atau NIP terdaftar.');
      return;
    }

    // Match against internal users pool
    const matched = users.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.identifierValue.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.name.toLowerCase().includes(cleanId)
    );

    if (!matched) {
      setErrorMessage('Akun mandiri tidak ditemukan. Pastikan akun telah didaftarkan oleh Administrator.');
      return;
    }

    if (matched.accountStatus === 'MANDIRI_NONAKTIF') {
      setErrorMessage('Akun ini sedang dinonaktifkan oleh Administrator. Hubungi Admin SIM Sekolah.');
      return;
    }

    if (inputPassword.trim() && !verifyUserPassword(matched, inputPassword.trim())) {
      setErrorMessage('Kata sandi yang Anda masukkan salah.');
      return;
    }

    setSuccessMessage(`Autentikasi mandiri berhasil! Selamat datang, ${matched.name}.`);
    setTimeout(() => {
      onLoginSuccess(matched);
      onClose();
    }, 400);
  };

  const filteredUsers = users.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.identifierValue.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    if (activeCategory === 'STUDENT_PARENT') {
      return u.role === 'STUDENT' || u.role === 'PARENT';
    }
    if (activeCategory === 'EDUCATOR') {
      return u.role === 'TEACHER' || u.role === 'PRINCIPAL';
    }
    if (activeCategory === 'ADMIN_SUPERVISOR') {
      return u.role === 'SUPERVISOR' || u.role === 'SCHOOL_ADMIN' || u.role === 'SUPER_ADMIN';
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#0753A5] via-[#0A64C2] to-[#1478D8] text-white p-6 text-center relative">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-2xl text-white shadow-inner">
            7K
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider text-blue-100 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sistem Autentikasi Mandiri Satuan Pendidikan
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Portal Masuk Mandiri SI-7KAIH
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-lg mx-auto">
            Seluruh kredensial & hak akses dikelola mandiri oleh Administrator tanpa ketergantungan pada portal eksternal
          </p>
        </div>

        {/* Informational Policy Banner */}
        <div className="bg-emerald-50/90 border-b border-emerald-200/80 px-6 py-3 flex items-start gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-emerald-950">100% Autentikasi Mandiri & Kedaulatan Data Lokal:</span>
            <span className="ml-1 text-emerald-800">
              Sistem tidak terhubung ke portal manapun. Pendaftaran akun, pembaruan kata sandi, dan wewenang peran diatur secara otonom oleh Admin Satuan Pendidikan.
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[65vh]">
          {/* Direct Credentials Login Form */}
          <form onSubmit={handleManualLogin} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#0753A5]" />
                Masuk dengan Kredensial Akun Mandiri
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Autentikasi Akun Resmi SIM
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ID Pengguna / Username / NISN / NIP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Masukkan ID Pengguna, NISN, atau NIP..."
                    value={inputIdentifier}
                    onChange={(e) => {
                      setInputIdentifier(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Kata Sandi Akun Mandiri
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0753A5] to-[#1478D8] hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk Sistem Mandiri</span>
            </button>
          </form>

          {/* Quick Persona Directory */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Daftar Akun Mandiri Terdaftar ({users.length} Akun)
                </p>
                <p className="text-[11px] text-slate-500">
                  Pilih akun untuk mengisi ID formulir (Hanya Super Admin yang memiliki opsi masuk langsung default)
                </p>
              </div>

              {/* Role filter buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px]">
                <button
                  onClick={() => setActiveCategory('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                    activeCategory === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveCategory('STUDENT_PARENT')}
                  className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                    activeCategory === 'STUDENT_PARENT'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Siswa & Wali
                </button>
                <button
                  onClick={() => setActiveCategory('EDUCATOR')}
                  className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                    activeCategory === 'EDUCATOR'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Guru & Kepsek
                </button>
                <button
                  onClick={() => setActiveCategory('ADMIN_SUPERVISOR')}
                  className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                    activeCategory === 'ADMIN_SUPERVISOR'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pengawas & Admin
                </button>
              </div>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nama, username, atau NIP/NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredUsers.map((persona) => {
                const isSuperAdmin = persona.role === 'SUPER_ADMIN';
                return (
                  <div
                    key={persona.id}
                    onClick={() => {
                      if (isSuperAdmin) {
                        onLoginSuccess(persona);
                        onClose();
                      } else {
                        setInputIdentifier(persona.username || persona.identifierValue);
                        setInputPassword('');
                        setErrorMessage('');
                        setSuccessMessage(`ID akun ${persona.name} terpilih. Silakan masukkan kata sandi akun.`);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group shadow-2xs hover:shadow-xs ${
                      isSuperAdmin
                        ? 'border-purple-300 bg-purple-50/40 hover:bg-purple-100/60 hover:border-purple-500'
                        : 'border-slate-200 hover:border-[#0753A5] bg-white hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar
                        avatar={persona.avatar}
                        role={persona.role}
                        name={persona.name}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {persona.name}
                          </p>
                          <span
                            className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                              isSuperAdmin
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {persona.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {persona.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono mt-0.5">
                          <span>ID: {persona.username || persona.identifierValue}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold">Mandiri</span>
                        </div>
                      </div>
                    </div>
                    {isSuperAdmin ? (
                      <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-lg border border-purple-200 shrink-0 ml-1.5">
                        Masuk Langsung
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-800 px-2 py-1 rounded-lg shrink-0 ml-1.5 transition-colors">
                        Pilih ID
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Institutional Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#0753A5]" />
            <span>Kedaulatan Kredensial Mandiri Satuan Pendidikan • Non-Portal Eksternal</span>
          </span>
          <span className="font-mono text-[10px]">VERSI 1.0.0-MANDIRI</span>
        </div>
      </div>
    </div>
  );
};
