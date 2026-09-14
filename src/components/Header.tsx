// ============================================================================
// SI-7KAIH AI - Header & Navigation Component
// Supports fast role switching between all 7 roles, active school indicator,
// and navigation tabs.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  USER_PERSONAS,
  UserPersona,
  getStoredUsers,
  LogoutSettings,
} from '../lib/constants';
import {
  Sparkles,
  ChevronDown,
  Printer,
  Calendar,
  Award,
  BookOpen,
  Users,
  Building2,
  Compass,
  Settings,
  Shield,
  FileText,
  CheckCircle2,
  Trophy,
  Lock,
  KeyRound,
  LogOut,
  ShieldCheck,
  Database,
  UserCheck,
  Clock,
} from 'lucide-react';
import { SSOModal } from './SSOModal';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  currentPersona: UserPersona;
  onSelectPersona: (persona: UserPersona) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenReportModal: () => void;
  onOpenLoginModal?: () => void;
  onOpenLoginDashboard?: () => void;
  onOpenSupabaseModal?: () => void;
  logoutSettings?: LogoutSettings;
  onTriggerLogout?: () => void;
  sessionDurationFormatted?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  onSelectPersona,
  activeTab,
  onSelectTab,
  onOpenReportModal,
  onOpenLoginModal,
  onOpenLoginDashboard,
  onOpenSupabaseModal,
  logoutSettings,
  onTriggerLogout,
  sessionDurationFormatted,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isSSOModalOpen, setIsSSOModalOpen] = useState(false);
  const [userList, setUserList] = useState<UserPersona[]>(() => getStoredUsers());

  useEffect(() => {
    const handleUpdate = () => setUserList(getStoredUsers());
    window.addEventListener('si7kaih_users_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('si7kaih_users_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Tabs based on active role
  const getNavTabs = () => {
    switch (currentPersona.role) {
      case 'STUDENT':
        return [
          { id: 'dashboard', label: 'Beranda', icon: Sparkles },
          { id: 'journal', label: 'Jurnal Hari Ini', icon: CheckCircle2 },
          { id: 'calendar', label: 'Kalender Kebiasaan', icon: Calendar },
          { id: 'reflection', label: 'Refleksi Bulanan', icon: BookOpen },
          { id: 'badges', label: 'Pencapaian', icon: Award },
          { id: 'ai-coach', label: 'Teman AI', icon: Sparkles },
          { id: 'account-settings', label: 'Pengaturan Akun', icon: Settings },
        ];
      case 'PARENT':
        return [
          { id: 'dashboard', label: 'Anak Saya', icon: Users },
          { id: 'validation', label: 'Validasi Harian', icon: CheckCircle2 },
          { id: 'parent-reflection', label: 'Refleksi Orang Tua', icon: BookOpen },
          { id: 'challenges', label: 'Tantangan Keluarga', icon: Trophy },
          { id: 'calendar', label: 'Kalender Anak', icon: Calendar },
          { id: 'account-settings', label: 'Pengaturan Akun', icon: Settings },
        ];
      case 'TEACHER':
        return [
          { id: 'dashboard', label: 'Dashboard Kelas', icon: Building2 },
          { id: 'monitoring', label: 'Monitoring 7KAIH', icon: Calendar },
          { id: 'validation', label: 'Validasi Guru', icon: CheckCircle2 },
          { id: 'programs', label: 'Program Sekolah', icon: Compass },
          { id: 'rtl', label: 'Rencana Tindak Lanjut (RTL)', icon: FileText },
          { id: 'ai-insight', label: 'AI Insight Kelas', icon: Sparkles },
          { id: 'account-settings', label: 'Pengaturan Akun', icon: Settings },
        ];
      case 'PRINCIPAL':
        return [
          { id: 'dashboard', label: 'Dashboard Sekolah', icon: Building2 },
          { id: 'monitoring', label: 'Portofolio 7KAIH', icon: Calendar },
          { id: 'programs', label: 'Program Sekolah', icon: Compass },
          { id: 'rtl', label: 'RTL & Monitoring', icon: FileText },
          { id: 'ai-school', label: 'Analisis AI Sekolah', icon: Sparkles },
          { id: 'account-settings', label: 'Pengaturan Akun', icon: Settings },
        ];
      case 'SUPERVISOR':
        return [
          { id: 'dashboard', label: 'Dashboard Wilayah', icon: Compass },
          { id: 'schools-comparison', label: 'Perbandingan 4 Sekolah', icon: Building2 },
          { id: 'monitoring', label: 'Portofolio 7KAIH Wilayah', icon: Calendar },
          { id: 'rtl', label: 'RTL Pengawasan', icon: FileText },
          { id: 'ai-supervisor', label: 'AI Analysis Wilayah', icon: Sparkles },
          { id: 'account-settings', label: 'Pengaturan Akun', icon: Settings },
        ];
      case 'SCHOOL_ADMIN':
        return [
          { id: 'dashboard', label: 'Manajemen Data', icon: Settings },
          { id: 'programs', label: 'Kelola Program', icon: Compass },
          { id: 'users', label: 'Autentikasi Mandiri', icon: KeyRound },
          { id: 'audit-logs', label: 'Log Audit Keamanan', icon: Shield },
          { id: 'account-settings', label: 'Pengaturan Akun', icon: Settings },
        ];
      case 'SUPER_ADMIN':
        return [
          { id: 'super-dashboard', label: 'Ringkasan Eksekutif', icon: Compass },
          { id: 'master-data', label: 'Master Data Global', icon: Database },
          { id: 'all-features', label: 'Akses Semua Fitur', icon: Sparkles },
          { id: 'users-admin', label: 'Akun Admin & Pengguna', icon: KeyRound },
          { id: 'super-profile', label: 'Profil Super Admin', icon: UserCheck },
          { id: 'account-settings', label: 'Pengaturan Akun', icon: Settings },
          { id: 'audit-logs', label: 'Log Audit & RLS', icon: Shield },
          { id: 'system-settings', label: 'Guardrails AI & Sistem', icon: Settings },
        ];
      default:
        return [
          { id: 'dashboard', label: 'Beranda', icon: Sparkles },
          { id: 'account-settings', label: 'Pengaturan Akun', icon: Settings },
        ];
    }
  };

  const navTabs = getNavTabs();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0753A5] to-[#20A5D5] flex items-center justify-center text-white font-black text-xl shadow-md">
            7K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0753A5]">
                SI-7KAIH <span className="text-[#20A5D5]">AI</span>
              </h1>
              <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0753A5] border border-blue-200">
                Resmi
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block font-medium">
              Tujuh Kebiasaan Anak Indonesia Hebat Berbasis AI
            </p>
          </div>
        </div>

        {/* Action Controls & Persona Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dashboard Login Portal Button (Dihilangkan khusus dashboard murid & orang tua) */}
          {onOpenLoginDashboard && currentPersona.role !== 'STUDENT' && currentPersona.role !== 'PARENT' && (
            <button
              id="btn-login-dashboard"
              onClick={onOpenLoginDashboard}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#0753A5] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer border border-blue-200 shadow-2xs"
              title="Buka Dashboard Login Aplikasi & Matriks Wewenang"
            >
              <KeyRound className="w-4 h-4 text-[#0753A5]" />
              <span className="hidden sm:inline">Dashboard Login</span>
            </button>
          )}

          {/* Supabase Permanent Storage & Cloud DB Button (Dihilangkan khusus dashboard murid & orang tua) */}
          {onOpenSupabaseModal && currentPersona.role !== 'STUDENT' && currentPersona.role !== 'PARENT' && (
            <button
              id="btn-header-supabase"
              onClick={onOpenSupabaseModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer border border-emerald-200 shadow-2xs"
              title="Pengaturan Basis Data Cloud Supabase"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline font-medium">Basis Data Cloud</span>
            </button>
          )}

          {/* Print/Export Report Button */}
          <button
            id="btn-print-report"
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="Cetak Dokumen Resmi Portofolio"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Cetak Dokumen Resmi</span>
          </button>

          {/* Prominent Session End / Logout Button in Header */}
          {onTriggerLogout && (logoutSettings?.showLogoutButtonInHeader ?? true) && (
            <button
              id="btn-header-logout"
              onClick={onTriggerLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer border border-rose-200 shadow-2xs"
              title="Selesaikan Sesi Pengguna Ini (Logout)"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span className="hidden md:inline">Selesai Sesi</span>
            </button>
          )}

          {/* Official SSO / Standalone Profile Card & Session Switcher */}
          <div className="relative">
            <button
              id="role-switcher-btn"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-blue-400 bg-white text-left transition-all cursor-pointer shadow-xs hover:shadow-sm"
              title="Profil Pengguna & Status Autentikasi"
            >
              <div className="relative">
                <UserAvatar
                  avatar={currentPersona.avatar}
                  role={currentPersona.role}
                  name={currentPersona.name}
                  size="sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="leading-tight">
                <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">{currentPersona.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border bg-emerald-50 text-emerald-800 border-emerald-300">
                    MANDIRI
                  </span>
                </div>
                <div className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-[180px] font-mono mt-0.5">
                  {currentPersona.identifierLabel}: {currentPersona.identifierValue}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
            </button>

            {/* Dropdown Menu: Official User Card */}
            {roleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100">
                  {/* Profile Header */}
                  <div className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        avatar={currentPersona.avatar}
                        role={currentPersona.role}
                        name={currentPersona.name}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {currentPersona.name}
                          </p>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            {currentPersona.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">
                          {currentPersona.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate font-mono">
                          {currentPersona.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Autentikasi Mandiri Satuan Pendidikan</span>
                      </span>
                      <span className="text-slate-500">{currentPersona.schoolName || 'Internal'}</span>
                    </div>

                    {sessionDurationFormatted && (logoutSettings?.showSessionTimerBadge ?? true) && (
                      <div className="mt-2 px-2.5 py-1 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                        <span className="flex items-center gap-1 text-[#0753A5] font-semibold">
                          <Clock className="w-3 h-3 text-[#0753A5]" />
                          <span>Durasi Sesi Ini:</span>
                        </span>
                        <span className="font-bold text-slate-800">{sessionDurationFormatted}</span>
                      </div>
                    )}
                  </div>

                  {/* Switch SSO / Standalone Account Button */}
                  <div className="py-2.5 space-y-1.5">
                    {/* Account Settings for Any Role */}
                    <button
                      id="btn-dropdown-account-settings"
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onSelectTab('account-settings');
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-[#0753A5] text-xs font-bold transition-colors cursor-pointer border border-blue-200"
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-[#0753A5]" />
                        <span>Pengaturan Akun ({currentPersona.role})</span>
                      </div>
                      <span className="text-[10px] bg-[#0753A5] text-white px-2 py-0.5 rounded-md font-semibold">
                        Buka
                      </span>
                    </button>

                    {/* Dedicated Logout Settings Shortcut (Dihilangkan untuk Murid & Orang Tua) */}
                    {currentPersona.role !== 'STUDENT' && currentPersona.role !== 'PARENT' && (
                      <button
                        id="btn-dropdown-logout-settings"
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onSelectTab('account-settings');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-rose-50/60 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors cursor-pointer border border-rose-200"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4 text-rose-600" />
                          <span>Pengaturan Tombol Selesai Sesi</span>
                        </div>
                        <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-md font-semibold">
                          Atur
                        </span>
                      </button>
                    )}

                    {/* Login Dashboard Link (Dihilangkan khusus dashboard murid & orang tua) */}
                    {onOpenLoginDashboard && currentPersona.role !== 'STUDENT' && currentPersona.role !== 'PARENT' && (
                      <button
                        id="btn-dropdown-login-dashboard"
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onOpenLoginDashboard();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-emerald-600" />
                          <span>Portal Dashboard Login</span>
                        </div>
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-semibold">
                          Portal
                        </span>
                      </button>
                    )}

                    {currentPersona.role === 'SUPER_ADMIN' && (
                      <button
                        id="btn-dropdown-edit-super-profile"
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onSelectTab('super-profile');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 text-xs font-bold transition-colors cursor-pointer border border-purple-200"
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-purple-700" />
                          <span>Edit Profil Super Admin Mandiri</span>
                        </div>
                        <span className="text-[10px] bg-purple-700 text-white px-2 py-0.5 rounded-md font-semibold">
                          Profil
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        setIsSSOModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-600" />
                        <span>Daftar Cepat Akun Mandiri</span>
                      </div>
                      <span className="text-[10px] bg-slate-700 text-white px-2 py-0.5 rounded-md font-semibold">
                        Sesi
                      </span>
                    </button>
                  </div>

                  {/* Quick Select of Frequent Roles */}
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                      Kredensial Pengguna Mandiri (Dikelola Admin)
                    </p>
                    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                      {userList.map((p) => {
                        const isSelected = p.id === currentPersona.id;
                        const isSuper = p.role === 'SUPER_ADMIN';
                        const isSchoolAdmin = p.role === 'SCHOOL_ADMIN';
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              onSelectPersona(p);
                              setRoleDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer text-xs ${
                              isSelected
                                ? 'bg-blue-50 text-[#0753A5] font-bold border border-blue-200'
                                : isSuper
                                ? 'bg-purple-50/60 hover:bg-purple-100/70 text-slate-800'
                                : isSchoolAdmin
                                ? 'bg-amber-50/50 hover:bg-amber-100/60 text-slate-800'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <UserAvatar
                              avatar={p.avatar}
                              role={p.role}
                              name={p.name}
                              size="sm"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="truncate text-xs font-semibold">{p.name}</p>
                                {isSuper ? (
                                  <span className="text-[8px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-black border border-purple-300">
                                    🛡️ SUPER ADMIN
                                  </span>
                                ) : isSchoolAdmin ? (
                                  <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                                    ★ ADMIN SEKOLAH
                                  </span>
                                ) : (
                                  <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                                    MANDIRI
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 truncate">{p.title}</p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Logout / Switch User Action */}
                  <div className="pt-2">
                    <button
                      id="btn-dropdown-logout"
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        if (onTriggerLogout) {
                          onTriggerLogout();
                        } else if (onOpenLoginDashboard) {
                          onOpenLoginDashboard();
                        } else if (onOpenLoginModal) {
                          onOpenLoginModal();
                        } else {
                          setIsSSOModalOpen(true);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-white bg-rose-600 hover:bg-rose-700 text-xs font-black transition-colors cursor-pointer shadow-xs"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Selesaikan Sesi (Logout Sekarang)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SSO Modal Component */}
      <SSOModal
        isOpen={isSSOModalOpen}
        onClose={() => setIsSSOModalOpen(false)}
        currentPersona={currentPersona}
        onSelectPersona={onSelectPersona}
        onLogout={onOpenLoginModal}
      />

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 py-1" aria-label="Tabs">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0753A5] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
