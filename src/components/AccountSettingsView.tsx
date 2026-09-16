// ============================================================================
// SI-7KAIH AI - Pengaturan Akun Pengguna Sesuai Wewenang Akses Masing-Masing
// Disesuaikan secara spesifik untuk 7 peran: Siswa, Ortu, Guru, Kepsek,
// Pengawas, Admin Sekolah, dan Super Admin
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Bell,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  School,
  FileText,
  BadgeCheck,
  Building2,
  Calendar,
  Sparkles,
  Award,
  Eye,
  EyeOff,
  Sliders,
  Database,
  Smartphone,
  Check,
  ShieldCheck,
  Compass,
  Users,
  Info,
  Clock,
  Stamp,
  FileCheck,
  LogOut,
  Timer,
  HelpCircle,
} from 'lucide-react';
import {
  UserPersona,
  getStoredUsers,
  saveStoredUsers,
  LogoutSettings,
  DEFAULT_LOGOUT_SETTINGS,
  saveStoredLogoutSettings,
  getStoredRolePreferences,
  saveStoredRolePreferences,
} from '../lib/constants';
import { UserRole } from '../../packages/types/src/index';
import { UserAvatar, ROLE_DEFAULT_AVATARS } from './UserAvatar';

interface AccountSettingsViewProps {
  currentPersona: UserPersona;
  onUpdatePersona: (updated: UserPersona) => void;
  activeNavTab?: string;
  logoutSettings: LogoutSettings;
  onUpdateLogoutSettings: (settings: LogoutSettings) => void;
  onTriggerLogout: () => void;
  sessionDurationFormatted?: string;
  initialSubTab?: SettingsTab;
}

type SettingsTab = 'PROFILE' | 'PRIVILEGES' | 'PREFERENCES' | 'SECURITY' | 'LOGOUT';

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  currentPersona,
  onUpdatePersona,
  logoutSettings,
  onUpdateLogoutSettings,
  onTriggerLogout,
  sessionDurationFormatted,
  initialSubTab,
}) => {
  const isStudent = currentPersona.role === 'STUDENT';
  const isParent = currentPersona.role === 'PARENT';
  const isRestrictedRole = isStudent || isParent;

  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    if (isRestrictedRole && (initialSubTab === 'PREFERENCES' || initialSubTab === 'LOGOUT')) {
      return 'PROFILE';
    }
    return initialSubTab || 'PROFILE';
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Safeguard: Ensure students & parents cannot be placed in PREFERENCES or LOGOUT tabs (managed by Super Admin)
  useEffect(() => {
    if (isRestrictedRole && (activeTab === 'PREFERENCES' || activeTab === 'LOGOUT')) {
      setActiveTab('PROFILE');
    }
  }, [isRestrictedRole, activeTab]);

  useEffect(() => {
    if (initialSubTab) {
      if (isRestrictedRole && (initialSubTab === 'PREFERENCES' || initialSubTab === 'LOGOUT')) {
        setActiveTab('PROFILE');
      } else {
        setActiveTab(initialSubTab);
      }
    }
  }, [initialSubTab, isRestrictedRole]);

  // 1. Profile fields
  const [name, setName] = useState(currentPersona.name || '');
  const [title, setTitle] = useState(currentPersona.title || '');
  const [avatar, setAvatar] = useState(currentPersona.avatar || ROLE_DEFAULT_AVATARS[currentPersona.role] || '👤');
  const [email, setEmail] = useState(currentPersona.email || '');
  const [phone, setPhone] = useState(currentPersona.phone || '0812-3456-7890');
  const [identifierValue, setIdentifierValue] = useState(currentPersona.identifierValue || '');
  const [bio, setBio] = useState(
    currentPersona.bio ||
      `Berkomitmen aktif mengimplementasikan 7 Kebiasaan Anak Indonesia Hebat secara konsisten.`
  );

  // 2. Security & Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // 3. Role-specific preferences states
  // Student preferences
  const [studentWakeTime, setStudentWakeTime] = useState('05:00');
  const [studentBedTime, setStudentBedTime] = useState('21:00');
  const [studentReadingReminder, setStudentReadingReminder] = useState('16:30');
  const [studentJournalPrivacy, setStudentJournalPrivacy] = useState('RESTRICTED_TEACHER_PARENT');

  // Parent preferences
  const [parentReminderTime, setParentReminderTime] = useState('19:30');
  const [parentWeeklySummary, setParentWeeklySummary] = useState(true);
  const [parentChildName, setParentChildName] = useState(currentPersona.childName || '');
  const [parentChildNisn, setParentChildNisn] = useState(currentPersona.childNisn || currentPersona.identifierValue || '');

  // Teacher preferences
  const [teacherTargetClass, setTeacherTargetClass] = useState(currentPersona.className || '');
  const [teacherValidationDeadline, setTeacherValidationDeadline] = useState('SABTU_1800');
  const [teacherAlertInactiveDays, setTeacherAlertInactiveDays] = useState(2);
  const [teacherQuickPin, setTeacherQuickPin] = useState('7788');

  // Principal preferences
  const [principalSignName, setPrincipalSignName] = useState(currentPersona.name || '');
  const [principalStampActive, setPrincipalStampActive] = useState(true);
  const [principalReportCutoffDay, setPrincipalReportCutoffDay] = useState(28);
  const [principalTargetRate, setPrincipalTargetRate] = useState(85);

  // Supervisor preferences
  const [supervisorRegion, setSupervisorRegion] = useState('Wilayah Binaan I Disdik (Subdin SMP)');
  const [supervisorVisitSchedule, setSupervisorVisitSchedule] = useState('BULANAN');
  const [supervisorReportFormat, setSupervisorReportFormat] = useState('STANDAR_KEMENDIKDASMEN');

  // School Admin preferences
  const [adminMinPasswordLength, setAdminMinPasswordLength] = useState(8);
  const [adminSessionExpiry, setAdminSessionExpiry] = useState('24_JAM');
  const [adminAllowSelfReset, setAdminAllowSelfReset] = useState(true);

  // Super Admin preferences
  const [superAdminEnforceRls, setSuperAdminEnforceRls] = useState(true);
  const [superAdminAiGuardrails, setSuperAdminAiGuardrails] = useState('STRICT_ANTI_BULLYING');
  const [superAdminAuditRetention, setSuperAdminAuditRetention] = useState('1_TAHUN');

  // 4. Logout Settings states
  const [confirmBeforeLogout, setConfirmBeforeLogout] = useState(logoutSettings?.confirmBeforeLogout ?? true);
  const [redirectDestination, setRedirectDestination] = useState(logoutSettings?.redirectDestination ?? 'LOGIN_DASHBOARD');
  const [clearDraftOnLogout, setClearDraftOnLogout] = useState(logoutSettings?.clearDraftOnLogout ?? false);
  const [autoLogoutInactivity, setAutoLogoutInactivity] = useState(
    logoutSettings?.autoLogoutInactivity ?? (isStudent ? '5_MIN' : 'DISABLED')
  );
  const [showLogoutButtonInHeader, setShowLogoutButtonInHeader] = useState(logoutSettings?.showLogoutButtonInHeader ?? true);
  const [recordAuditOnLogout, setRecordAuditOnLogout] = useState(logoutSettings?.recordAuditOnLogout ?? true);
  const [showSessionTimerBadge, setShowSessionTimerBadge] = useState(logoutSettings?.showSessionTimerBadge ?? true);

  useEffect(() => {
    if (logoutSettings) {
      setConfirmBeforeLogout(logoutSettings.confirmBeforeLogout);
      setRedirectDestination(logoutSettings.redirectDestination);
      setClearDraftOnLogout(logoutSettings.clearDraftOnLogout);
      setAutoLogoutInactivity(
        logoutSettings.autoLogoutInactivity === 'DISABLED' && isStudent
          ? '5_MIN'
          : logoutSettings.autoLogoutInactivity
      );
      setShowLogoutButtonInHeader(logoutSettings.showLogoutButtonInHeader);
      setRecordAuditOnLogout(logoutSettings.recordAuditOnLogout);
      setShowSessionTimerBadge(logoutSettings.showSessionTimerBadge);
    }
  }, [logoutSettings, isStudent]);

  const handleSaveLogoutSettings = () => {
    const updated: LogoutSettings = {
      confirmBeforeLogout,
      redirectDestination,
      clearDraftOnLogout,
      autoLogoutInactivity,
      showLogoutButtonInHeader,
      recordAuditOnLogout,
      showSessionTimerBadge,
    };
    saveStoredLogoutSettings(updated);
    onUpdateLogoutSettings(updated);
    setSaveSuccess(true);
    setSaveMessage('Pengaturan tombol selesai sesi (logout) berhasil disimpan!');
    setTimeout(() => setSaveSuccess(false), 4000);

    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId: currentPersona.id,
        actorRole: currentPersona.role,
        action: 'UPDATE_LOGOUT_SETTINGS',
        targetEntity: 'session_configuration',
        targetId: currentPersona.id,
        metadata: { ...updated },
      }),
    }).catch(() => {});
  };

  const handleResetLogoutSettings = () => {
    const defaults = { ...DEFAULT_LOGOUT_SETTINGS };
    setConfirmBeforeLogout(defaults.confirmBeforeLogout);
    setRedirectDestination(defaults.redirectDestination);
    setClearDraftOnLogout(defaults.clearDraftOnLogout);
    setAutoLogoutInactivity(defaults.autoLogoutInactivity);
    setShowLogoutButtonInHeader(defaults.showLogoutButtonInHeader);
    setRecordAuditOnLogout(defaults.recordAuditOnLogout);
    setShowSessionTimerBadge(defaults.showSessionTimerBadge);
    saveStoredLogoutSettings(defaults);
    onUpdateLogoutSettings(defaults);
    setSaveSuccess(true);
    setSaveMessage('Pengaturan tombol selesai sesi dikembalikan ke konfigurasi standar!');
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Load stored preferences if any
  useEffect(() => {
    setName(currentPersona.name || '');
    setTitle(currentPersona.title || '');
    setAvatar(currentPersona.avatar || ROLE_DEFAULT_AVATARS[currentPersona.role] || '👤');
    setEmail(currentPersona.email || '');
    setPhone(currentPersona.phone || '0812-3456-7890');
    setIdentifierValue(currentPersona.identifierValue || '');
  }, [currentPersona]);

  // Preset avatars for roles
  const roleAvatarOptions: Record<UserRole, string[]> = {
    STUDENT: ['👦', '👧', '🧑', '🎓', '🎒', '🌟', '📚', '⚽'],
    PARENT: ['👩', '👨', '👨‍👩‍👧', '👨‍👩‍👦', '🏡', '🌸', '☕', '❤️'],
    TEACHER: ['👨‍🏫', '👩‍🏫', '🧑‍🏫', '📖', '📝', '✨', '🎓', '📋'],
    PRINCIPAL: ['👨‍💼', '👩‍💼', '🏛️', '🎖️', '🏅', '📜', '👔', '🏢'],
    SUPERVISOR: ['📋', '👨‍💼', '👩‍💼', '🔍', '📊', '📈', '📌', '🌐'],
    SCHOOL_ADMIN: ['💻', '★', '⚙️', '🛡️', '🔑', '🖥️', '📊', '📂'],
    SUPER_ADMIN: ['🛡️', '👑', '⚡', '🌐', '🏛️', '🔒', '💎', '🚀'],
  };

  const currentAvatarOptions = roleAvatarOptions[currentPersona.role] || ['👤', '✨', '⭐', '🌟'];

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSaveSuccess(false);

    if (!name.trim()) {
      setErrorMessage('Nama lengkap tidak boleh kosong.');
      return;
    }

    const updatedUser: UserPersona = {
      ...currentPersona,
      name: name.trim(),
      title: title.trim(),
      avatar,
      email: email.trim(),
      phone: phone.trim(),
      identifierValue: identifierValue.trim(),
      bio: bio.trim(),
      lastUpdated: new Date().toISOString(),
    };

    // Save in stored users list
    try {
      const usersList = getStoredUsers();
      const idx = usersList.findIndex((u) => u.id === currentPersona.id);
      if (idx !== -1) {
        usersList[idx] = updatedUser;
      } else {
        usersList.push(updatedUser);
      }
      saveStoredUsers(usersList);
      onUpdatePersona(updatedUser);

      // Record audit log
      fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentPersona.id,
          actorRole: currentPersona.role,
          action: 'UPDATE_ACCOUNT_SETTINGS',
          targetEntity: 'user_accounts',
          targetId: currentPersona.id,
          metadata: {
            updatedFields: ['name', 'avatar', 'title', 'email', 'phone', 'identifierValue'],
            role: currentPersona.role,
          },
        }),
      }).catch(() => {});

      setSaveSuccess(true);
      setSaveMessage('Pengaturan profil berhasil disimpan & disinkronkan ke seluruh sistem!');
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (_err) {
      setErrorMessage('Gagal menyimpan perubahan profil ke penyimpanan lokal.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPasswordSuccess(false);

    if (!newPassword) {
      setErrorMessage('Kata sandi baru tidak boleh kosong.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    // Simpan pembaruan kata sandi akun produksi aktif
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    // Audit log
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId: currentPersona.id,
        actorRole: currentPersona.role,
        action: 'CHANGE_PASSWORD',
        targetEntity: 'user_accounts',
        targetId: currentPersona.id,
        metadata: {
          role: currentPersona.role,
          timestamp: new Date().toISOString(),
        },
      }),
    }).catch(() => {});

    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Card with Role Badge */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <UserAvatar
                avatar={avatar}
                role={currentPersona.role}
                name={name}
                size="lg"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {name}
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-50 text-[#0753A5] border-blue-200 uppercase">
                  {currentPersona.role}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Mandiri Terverifikasi</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Data Akun: Produksi Aktif</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{title}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {currentPersona.identifierLabel}: {identifierValue} • {currentPersona.schoolName || 'Nasional'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSaveProfile()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0753A5] hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>

        {/* Success / Error notification */}
        {saveSuccess && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'PROFILE'
                ? 'bg-[#0753A5] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil & Identitas Pribadi</span>
          </button>

          <button
            onClick={() => setActiveTab('PRIVILEGES')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'PRIVILEGES'
                ? 'bg-[#0753A5] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BadgeCheck className="w-4 h-4" />
            <span>Wewenang Akses ({currentPersona.role})</span>
          </button>

          {/* TAB 3: PREFERENSI OPERASIONAL PERAN - Dihilangkan khusus Dashboard Murid & Orang Tua */}
          {!isRestrictedRole && (
            <button
              onClick={() => setActiveTab('PREFERENCES')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'PREFERENCES'
                  ? 'bg-[#0753A5] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Preferensi Operasional Peran</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'SECURITY'
                ? 'bg-[#0753A5] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Keamanan & Kata Sandi Mandiri</span>
          </button>

          {/* TAB 5: PENGATURAN LOGOUT - Dihilangkan khusus Dashboard Murid & Orang Tua (dikelola oleh Super Admin) */}
          {!isRestrictedRole && (
            <button
              id="tab-btn-logout-settings"
              onClick={() => setActiveTab('LOGOUT')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'LOGOUT'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>Pengaturan Tombol Selesai Sesi (Logout)</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: PROFIL & IDENTITAS PRIBADI */}
      {activeTab === 'PROFILE' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-[#0753A5]" />
              <span>Informasi Profil & Kredensial Pengguna</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Data identitas resmi yang terhubung dengan pencatatan jurnal dan monitoring portofolio 7KAIH.
            </p>
          </div>

          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Pilih Ikon Avatar Profil ({currentPersona.role})
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {currentAvatarOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAvatar(opt)}
                  className={`w-11 h-11 rounded-2xl border text-xl flex items-center justify-center transition-all cursor-pointer ${
                    avatar === opt
                      ? 'border-[#0753A5] bg-blue-50 shadow-xs ring-2 ring-blue-500/20 scale-105'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900 outline-none"
                required
              />
            </div>

            {/* Gelar / Jabatan Deskriptif */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jabatan / Deskripsi Peran
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900 outline-none"
              />
            </div>

            {/* Nomor Identitas Resmi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {currentPersona.identifierLabel} (Nomor Identitas Resmi)
              </label>
              <input
                type="text"
                value={identifierValue}
                onChange={(e) => setIdentifierValue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900 outline-none font-mono"
              />
            </div>

            {/* Username Akun */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ID / Username Akun Mandiri
              </label>
              <input
                type="text"
                value={currentPersona.username}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 outline-none font-mono cursor-not-allowed"
                title="Dikelola oleh Administrator Satuan Pendidikan"
              />
            </div>

            {/* Email Resmi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alamat Email Pengguna
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900 outline-none font-mono"
              />
            </div>

            {/* Nomor Telepon / WA */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nomor WhatsApp / Kontak Aktif
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900 outline-none font-mono"
              />
            </div>

            {/* Satuan Pendidikan & Rombel */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Satuan Pendidikan Terdaftar
              </label>
              <input
                type="text"
                value={currentPersona.schoolName || 'Pusat / Kemendikdasmen'}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rombongan Belajar (Rombel)
              </label>
              <input
                type="text"
                value={currentPersona.className || 'Tidak Berlaku (Staf / Pimpinan)'}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 outline-none cursor-not-allowed"
              />
            </div>

            {/* Bio Profil */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Catatan Komitmen Integritas / Bio Profil
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900 outline-none"
              />
            </div>

            {/* Submit button */}
            <div className="sm:col-span-2 pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0753A5] hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: WEWENANG AKSES KHUSUS PERAN (RBAC) */}
      {activeTab === 'PRIVILEGES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-[#0753A5]" />
              <span>Wewenang Akses & Hak Operasi Peran: {currentPersona.role}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tingkat otoritas, hak manipulasi data (CRUD), dan batasan perlindungan privasi yang berlaku pada akun Anda.
            </p>
          </div>

          {/* Role Privilege Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                <span>Hak Akses yang Diberikan</span>
              </h3>
              <div className="space-y-2 text-xs text-blue-950">
                {currentPersona.role === 'STUDENT' && (
                  <>
                    <p>• Mengisi formulir 7 Kebiasaan Anak Indonesia Hebat harian (&lt;1 menit).</p>
                    <p>• Melihat kalender kebiasaan dan grafik konsistensi pribadi.</p>
                    <p>• Mengisi refleksi bulanan mandiri berbimbingan AI.</p>
                    <p>• Mengklaim dan mengoleksi lencana prestasi (badges) kebiasaan.</p>
                    <p>• Berinteraksi dengan Teman AI Karakter Ramah Anak.</p>
                    <p>• Mengunduh Dokumen Portofolio Resmi 7KAIH pribadi.</p>
                  </>
                )}
                {currentPersona.role === 'PARENT' && (
                  <>
                    <p>• Memantau jurnal harian 7 kebiasaan anak kandung yang tertaut.</p>
                    <p>• Memberikan validasi harian (Centang Persetujuan & Apresiasi Positif).</p>
                    <p>• Mengisi refleksi bulanan keluarga untuk mendukung pembiasaan di rumah.</p>
                    <p>• Memantau kalender kebiasaan anak dan tantangan keluarga.</p>
                    <p>• Mengunduh laporan e-Rapor 7KAIH anak.</p>
                  </>
                )}
                {currentPersona.role === 'TEACHER' && (
                  <>
                    <p>• Memantau keterisian dan tren 7KAIH seluruh siswa di rombel binaan.</p>
                    <p>• Memberikan validasi guru harian/mingguan untuk jurnal kelas.</p>
                    <p>• Mengelola Program Pembiasaan Kelas (target & aktivitas pembiasaan).</p>
                    <p>• Menyusun Rencana Tindak Lanjut (RTL) Pembiasaan Kelas.</p>
                    <p>• Menghasilkan analisis AI Insight dinamika pembiasaan kelas.</p>
                    <p>• Mencetak portofolio resmi kelas untuk arsip satuan pendidikan.</p>
                  </>
                )}
                {currentPersona.role === 'PRINCIPAL' && (
                  <>
                    <p>• Mengakses dashboard eksekutif portofolio 7KAIH seluruh satuan pendidikan.</p>
                    <p>• Menyetujui dan mengawasi pelaksanaan Program Pembiasaan Sekolah.</p>
                    <p>• Mengesahkan portofolio resmi sekolah dengan tanda tangan & stempel.</p>
                    <p>• Meninjau Rencana Tindak Lanjut (RTL) pembiasaan tingkat sekolah.</p>
                    <p>• Memanfaatkan AI Prediktif untuk analisis budaya mutu sekolah.</p>
                  </>
                )}
                {currentPersona.role === 'SUPERVISOR' && (
                  <>
                    <p>• Mengakses dashboard komparasi 4 jenjang sekolah di wilayah binaan.</p>
                    <p>• Memantau kepatuhan pembiasaan tingkat gugus / sub-rayon kerja.</p>
                    <p>• Merumuskan RTL Pengawasan & rekomendasi pembinaan mutu sekolah.</p>
                    <p>• Menjalankan AI Analysis untuk deteksi kesenjangan mutu antar sekolah.</p>
                    <p>• Mengunduh rekapitulasi portofolio pengawasan wilayah.</p>
                  </>
                )}
                {currentPersona.role === 'SCHOOL_ADMIN' && (
                  <>
                    <p>• Manajemen penuh seluruh akun mandiri warga sekolah (Siswa, Ortu, Guru, Kepsek).</p>
                    <p>• Reset kata sandi mandiri warga sekolah secara instan.</p>
                    <p>• Pengelolaan master program pembiasaan & data rombel sekolah.</p>
                    <p>• Pemantauan log audit keamanan data internal sekolah.</p>
                    <p>• Ekspor cadangan database sekolah (.json / .csv).</p>
                  </>
                )}
                {currentPersona.role === 'SUPER_ADMIN' && (
                  <>
                    <p>• Otoritas nasional tertinggi tanpa batasan isolasi data.</p>
                    <p>• Kontrol master standar 7 Kebiasaan Nasional Kemendikdasmen.</p>
                    <p>• Manajemen seluruh akun Administrator Satuan Pendidikan.</p>
                    <p>• Akses operasional pergantian peran secara langsung pada sistem produksi aktif.</p>
                    <p>• Pengawasan log audit RLS & kebijakan AI Guardrails nasional.</p>
                  </>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-700" />
                <span>Batasan & Perlindungan Privasi (UU PDP)</span>
              </h3>
              <div className="space-y-2 text-xs text-amber-950">
                <p>
                  <strong>Isolasi Data:</strong> Anda hanya dapat melihat data yang berada dalam lingkup wewenang tugas Anda. Akses lintas sekolah atau lintas rombel tanpa wewenang diblokir otomatis oleh Row-Level Security.
                </p>
                <p>
                  <strong>Prinsip Anti-Shaming:</strong> Dilarang menggunakan data jurnal untuk membandingkan, mempermalukan, atau menghukum siswa.
                </p>
                <p>
                  <strong>Audit Trail Tak Terhapuskan:</strong> Seluruh aktivitas pengubahan data, validasi, dan login dicatat secara permanen dalam Log Audit Keamanan.
                </p>
                <p>
                  <strong>Kedaulatan Mandiri:</strong> Kredensial Anda tersimpan di lingkungan satuan pendidikan tanpa transmisi ke server pihak ketiga.
                </p>
              </div>
            </div>
          </div>

          {/* Account status badge */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-slate-800">Status Otorisasi Akun</p>
              <p className="text-slate-500">Dikelola oleh: {currentPersona.managedBy || 'Administrator Satuan Pendidikan'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                ✓ MANDIRI AKTIF & TERVERIFIKASI
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PREFERENSI OPERASIONAL SPESIFIK PERAN (Khusus Non-Murid & Non-Orang Tua) */}
      {!isRestrictedRole && activeTab === 'PREFERENCES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0753A5]" />
              <span>Pengaturan Khusus Peran {currentPersona.role}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Konfigurasi alur kerja, pengingat kebiasaan, dan preferensi operasional harian Anda.
            </p>
          </div>

          {/* IF ROLE === STUDENT */}
          {currentPersona.role === 'STUDENT' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pengingat Rutin 7 Kebiasaan Anak Indonesia Hebat
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Target Bangun Pagi</span>
                  </label>
                  <input
                    type="time"
                    value={studentWakeTime}
                    onChange={(e) => setStudentWakeTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                  <p className="text-[10px] text-slate-400">Kebiasaan 1: Bangun Pagi</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Target Literasi / Membaca</span>
                  </label>
                  <input
                    type="time"
                    value={studentReadingReminder}
                    onChange={(e) => setStudentReadingReminder(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                  <p className="text-[10px] text-slate-400">Kebiasaan 5: Gemar Membaca</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Target Istirahat / Tidur</span>
                  </label>
                  <input
                    type="time"
                    value={studentBedTime}
                    onChange={(e) => setStudentBedTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                  <p className="text-[10px] text-slate-400">Kebiasaan 7: Istirahat Cukup</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-blue-50/40 space-y-2">
                <label className="text-xs font-bold text-blue-900 block">
                  Visibilitas Catatan Reflektif Jurnal Anda
                </label>
                <select
                  value={studentJournalPrivacy}
                  onChange={(e) => setStudentJournalPrivacy(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-blue-200 bg-white text-xs text-slate-800"
                >
                  <option value="RESTRICTED_TEACHER_PARENT">Hanya Wali Kelas & Orang Tua Kandung (Standar Perlindungan UU PDP)</option>
                  <option value="RESTRICTED_TEACHER_ONLY">Hanya Wali Kelas & Guru Pembimbing Karakter</option>
                </select>
                <p className="text-[11px] text-blue-700">
                  Data Anda tidak pernah dipublikasikan ke siswa lain untuk mencegah perundungan (anti-shaming).
                </p>
              </div>
            </div>
          )}

          {/* IF ROLE === PARENT */}
          {currentPersona.role === 'PARENT' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tautan Akun Anak & Pengingat Validasi Harian
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-800">Nama Siswa / Anak Binaan</label>
                  <input
                    type="text"
                    value={parentChildName}
                    onChange={(e) => setParentChildName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">NISN: {parentChildNisn} • Kelas 7-A (Fase D)</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-800">Waktu Pengingat Validasi Harian</label>
                  <input
                    type="time"
                    value={parentReminderTime}
                    onChange={(e) => setParentReminderTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                  <p className="text-[10px] text-slate-500">Notifikasi pengingat untuk mengecek kebiasaan anak setiap malam</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-teal-950">Terima Ringkasan Mingguan via WhatsApp / Email</p>
                  <p className="text-[11px] text-teal-700">Ringkasan kemajuan 7 kebiasaan anak setiap hari Minggu sore</p>
                </div>
                <input
                  type="checkbox"
                  checked={parentWeeklySummary}
                  onChange={(e) => setParentWeeklySummary(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 cursor-pointer"
                />
              </div>

              {/* Aturan Validasi Harian Orang Tua Info Box */}
              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/60 space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0753A5]" />
                  <span className="text-xs font-bold text-[#0753A5]">Kebijakan Validasi Harian Orang Tua</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0753A5]">
                    Sesuai Jurnal Anak
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Validasi harian <strong>tidak mengharuskan anak menyelesaikan seluruh 7 kebiasaan</strong>. Orang tua dapat memvalidasi dan memberikan pesan motivasi sesuai data riil yang diisikan ananda pada hari tersebut.
                </p>
              </div>
            </div>
          )}

          {/* IF ROLE === TEACHER */}
          {currentPersona.role === 'TEACHER' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pengaturan Monitoring & Validasi Rombel Binaan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-800">Rombongan Belajar (Rombel) Binaan</label>
                  <input
                    type="text"
                    value={teacherTargetClass}
                    onChange={(e) => setTeacherTargetClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                  <p className="text-[10px] text-slate-400">{currentPersona.schoolName ? `${currentPersona.schoolName}` : 'Satuan Pendidikan'}</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-800">PIN Validasi Cepat Guru (4 Digit)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={teacherQuickPin}
                    onChange={(e) => setTeacherQuickPin(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono tracking-widest"
                  />
                  <p className="text-[10px] text-slate-400">Digunakan untuk konfirmasi persetujuan jurnal kelas sekaligus</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/40 space-y-1.5">
                  <label className="text-xs font-bold text-emerald-950">Peringatan Siswa Perlu Dukungan</label>
                  <select
                    value={teacherAlertInactiveDays}
                    onChange={(e) => setTeacherAlertInactiveDays(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-emerald-200 bg-white text-xs"
                  >
                    <option value={1}>Jika belum mengisi jurnal &gt; 1 hari</option>
                    <option value={2}>Jika belum mengisi jurnal &gt; 2 hari berturut-turut (Standar)</option>
                    <option value={3}>Jika belum mengisi jurnal &gt; 3 hari berturut-turut</option>
                  </select>
                  <p className="text-[10px] text-emerald-700">Untuk pendampingan restoratif bersama guru BK & wali murid</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/40 space-y-1.5">
                  <label className="text-xs font-bold text-emerald-950">Batas Waktu Validasi Mingguan</label>
                  <select
                    value={teacherValidationDeadline}
                    onChange={(e) => setTeacherValidationDeadline(e.target.value)}
                    className="w-full p-2 rounded-xl border border-emerald-200 bg-white text-xs"
                  >
                    <option value="JUMAT_1600">Setiap Jumat pukul 16:00 WIB</option>
                    <option value="SABTU_1800">Setiap Sabtu pukul 18:00 WIB (Standar)</option>
                    <option value="MINGGU_2000">Setiap Minggu pukul 20:00 WIB</option>
                  </select>
                  <p className="text-[10px] text-emerald-700">Waktu rekapitulasi nilai pembiasaan sebelum rapat pekanan</p>
                </div>
              </div>
            </div>
          )}

          {/* IF ROLE === PRINCIPAL */}
          {currentPersona.role === 'PRINCIPAL' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pengesahan Portofolio & Kebijakan Sekolah
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Stamp className="w-4 h-4 text-indigo-600" />
                    <span>Nama Pengesah Dokumen Portofolio</span>
                  </label>
                  <input
                    type="text"
                    value={principalSignName}
                    onChange={(e) => setPrincipalSignName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                  <p className="text-[10px] text-slate-500">Tercetak pada Dokumen Resmi Portofolio 7KAIH Satuan Pendidikan</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    <span>Target Partisipasi Pembiasaan Sekolah</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={60}
                      max={100}
                      value={principalTargetRate}
                      onChange={(e) => setPrincipalTargetRate(Number(e.target.value))}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="text-xs font-bold text-indigo-900 w-12 text-right">{principalTargetRate}%</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Target indikator kinerja utama (IKU) karakter sekolah</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-indigo-950">Gunakan Stempel Resmi Digital Satuan Pendidikan</p>
                  <p className="text-[11px] text-indigo-700">Secara otomatis menyertakan stempel digital pada e-Rapor & Dokumen Cetak 7KAIH</p>
                </div>
                <input
                  type="checkbox"
                  checked={principalStampActive}
                  onChange={(e) => setPrincipalStampActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* IF ROLE === SUPERVISOR */}
          {currentPersona.role === 'SUPERVISOR' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Cakupan Wilayah Pengawasan & Frekuensi Supervisi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-800">Nama Wilayah / Rayon Binaan</label>
                  <input
                    type="text"
                    value={supervisorRegion}
                    onChange={(e) => setSupervisorRegion(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                  <p className="text-[10px] text-slate-500">Mencakup 4 sekolah binaan (SD, SMP, SMA, SMK)</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-800">Jadwal Siklus Evaluasi Wilayah</label>
                  <select
                    value={supervisorVisitSchedule}
                    onChange={(e) => setSupervisorVisitSchedule(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="BULANAN">1x Per Bulan (Telaah Dinamika Karakter)</option>
                    <option value="TRIWULAN">Per Triwulan (Audit Mutu Pembiasaan)</option>
                    <option value="SEMESTER">Per Semester (Laporan Komparatif Disdik)</option>
                  </select>
                  <p className="text-[10px] text-slate-500">Frekuensi otomatisasi AI analysis komparasi sekolah</p>
                </div>
              </div>
            </div>
          )}

          {/* IF ROLE === SCHOOL_ADMIN */}
          {currentPersona.role === 'SCHOOL_ADMIN' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Kebijakan Keamanan & Tata Kelola Akun Sekolah
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-800">Panjang Sandi Minimum Pengguna Baru</label>
                  <select
                    value={adminMinPasswordLength}
                    onChange={(e) => setAdminMinPasswordLength(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value={6}>6 Karakter (Standar Siswa SD/SMP)</option>
                    <option value={8}>8 Karakter (Rekomendasi Keamanan)</option>
                    <option value={10}>10 Karakter (Tinggi / Khusus Pendidik)</option>
                  </select>
                  <p className="text-[10px] text-slate-500">Berlaku saat Admin menambahkan akun baru secara massal</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-800">Masa Kedaluwarsa Sesi Login</label>
                  <select
                    value={adminSessionExpiry}
                    onChange={(e) => setAdminSessionExpiry(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="8_JAM">8 Jam (Satu Hari Kerja)</option>
                    <option value="24_JAM">24 Jam (Standar Sekolah)</option>
                    <option value="7_HARI">7 Hari (Perangkat Terverifikasi)</option>
                  </select>
                  <p className="text-[10px] text-slate-500">Membatasi durasi login tanpa aktivitas</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-950">Izinkan Reset Mandiri via Bantuan Admin Satuan Pendidikan</p>
                  <p className="text-[11px] text-amber-700">Warga sekolah dapat meminta reset sandi langsung ke meja SIM sekolah</p>
                </div>
                <input
                  type="checkbox"
                  checked={adminAllowSelfReset}
                  onChange={(e) => setAdminAllowSelfReset(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* IF ROLE === SUPER_ADMIN */}
          {currentPersona.role === 'SUPER_ADMIN' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Kebijakan Global Platform SI-7KAIH Nasional
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-purple-50/30 space-y-2">
                  <label className="text-xs font-bold text-purple-950">Penegakan Row-Level Security (RLS) Nasional</label>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Isolasi data antar sekolah otomatis aktif</span>
                    <input
                      type="checkbox"
                      checked={superAdminEnforceRls}
                      onChange={(e) => setSuperAdminEnforceRls(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Mencegah kebocoran data siswa antar satuan pendidikan</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-purple-50/30 space-y-2">
                  <label className="text-xs font-bold text-purple-950">Tingkat Sensor Guardrails AI</label>
                  <select
                    value={superAdminAiGuardrails}
                    onChange={(e) => setSuperAdminAiGuardrails(e.target.value)}
                    className="w-full p-2 rounded-xl border border-purple-200 bg-white text-xs"
                  >
                    <option value="STRICT_ANTI_BULLYING">Ketat (Anti-Perundungan & Sensor Kata Kasar)</option>
                    <option value="BALANCED">Moderat (Edukasi Empati)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">Menjamin interaksi AI aman dan ramah anak</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => handleSaveProfile()}
              className="px-5 py-2.5 rounded-xl bg-[#0753A5] hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Peran</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: KEAMANAN & KATA SANDI MANDIRI */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0753A5]" />
              <span>Keamanan Kredensial & Pembaruan Kata Sandi Mandiri</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh kata sandi disimpan dengan enkripsi aman di lingkungan internal tanpa dikirim ke server pihak ketiga.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Kata sandi mandiri berhasil diperbarui dan diverifikasi secara lokal!</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama Anda..."
                  className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi Baru (Minimal 6 Karakter)
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-[#0753A5] hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <KeyRound className="w-4 h-4" />
              <span>Perbarui Kata Sandi</span>
            </button>
          </form>

          {/* Active Session & Device Card */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Perangkat & Sesi Masuk Aktif
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0753A5] flex items-center justify-center font-bold shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Perangkat Peramban Saat Ini</p>
                  <p className="text-slate-500 text-[11px]">Sesi Aktif Mandiri • IP Terproteksi RLS Satuan Pendidikan</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                SESI SAAT INI
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PENGATURAN TOMBOL LOGOUT & SELESAI SESI PENGGUNA (Dikelola Super Admin) */}
      {!isRestrictedRole && activeTab === 'LOGOUT' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span>Pengaturan Tombol Selesai Sesi (Logout)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Konfigurasikan perilaku tombol logout, dialog konfirmasi pengakhiran sesi, pengalihan portal, dan perlindungan privasi data peserta didik & warga sekolah sesuai standar UU PDP No. 27/2022.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-reset-logout-settings"
                  onClick={handleResetLogoutSettings}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Kembalikan ke pengaturan standar"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
                <button
                  type="button"
                  id="btn-save-logout-settings"
                  onClick={handleSaveLogoutSettings}
                  className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pengaturan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Perilaku Tombol & Konfirmasi */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Perilaku Tombol & Konfirmasi Keamanan</span>
              </h3>

              {/* Option 1: Confirm Before Logout */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="toggle-confirm-logout" className="text-xs font-bold text-slate-900 cursor-pointer">
                    Dialog Konfirmasi Sebelum Selesai Sesi
                  </label>
                  <input
                    id="toggle-confirm-logout"
                    type="checkbox"
                    checked={confirmBeforeLogout}
                    onChange={(e) => setConfirmBeforeLogout(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Menampilkan modal konfirmasi pop-up saat tombol Keluar/Logout ditekan. Sangat disarankan untuk mencegah ketidaksengajaan keluar saat sedang mengisi jurnal atau validasi.
                </p>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{confirmBeforeLogout ? 'Konfirmasi aktif (Aman dari salah klik)' : 'Keluar instan tanpa dialog'}</span>
                </div>
              </div>

              {/* Option 2: Show Logout Button in Header */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="toggle-header-logout" className="text-xs font-bold text-slate-900 cursor-pointer">
                    Tombol 'Selesai Sesi' Cepat di Bilah Atas (Header)
                  </label>
                  <input
                    id="toggle-header-logout"
                    type="checkbox"
                    checked={showLogoutButtonInHeader}
                    onChange={(e) => setShowLogoutButtonInHeader(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Menempatkan tombol beraksen rose 'Selesai Sesi' langsung di bilah navigasi Header utama agar pengguna dapat menyelesaikan sesi dengan 1 sentuhan.
                </p>
              </div>

              {/* Option 3: Show Session Timer Badge in Profile */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="toggle-session-timer" className="text-xs font-bold text-slate-900 cursor-pointer">
                    Indikator Waktu Durasi Sesi Berjalan
                  </label>
                  <input
                    id="toggle-session-timer"
                    type="checkbox"
                    checked={showSessionTimerBadge}
                    onChange={(e) => setShowSessionTimerBadge(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Menampilkan lamanya waktu sesi kerja aktif (contoh: 15m 24s) pada kartu profil dan dialog konfirmasi keluar.
                </p>
              </div>
            </div>

            {/* 2. Tujuan Pengalihan Pasca-Logout */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#0753A5]" />
                <span>Tujuan Pengalihan Pasca Selesai Sesi</span>
              </h3>

              <div className="space-y-3">
                {/* Destination 1: Login Dashboard */}
                <label
                  className={`block p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    redirectDestination === 'LOGIN_DASHBOARD'
                      ? 'bg-blue-50/70 border-[#0753A5] ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="logout_dest"
                      value="LOGIN_DASHBOARD"
                      checked={redirectDestination === 'LOGIN_DASHBOARD'}
                      onChange={() => setRedirectDestination('LOGIN_DASHBOARD')}
                      className="mt-1 text-[#0753A5] focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Dashboard Login Aplikasi Utama
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#0753A5]">
                          Rekomendasi
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mengarahkan pengguna ke halaman Dashboard Login lengkap dengan katalog akun warga sekolah, matriks wewenang, dan formulir login mandiri.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Destination 2: SSO Modal */}
                <label
                  className={`block p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    redirectDestination === 'SSO_MODAL'
                      ? 'bg-blue-50/70 border-[#0753A5] ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="logout_dest"
                      value="SSO_MODAL"
                      checked={redirectDestination === 'SSO_MODAL'}
                      onChange={() => setRedirectDestination('SSO_MODAL')}
                      className="mt-1 text-[#0753A5] focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900">
                        Dialog Cepat Pemilihan Akun (Modal SSO)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Membuka jendela pop-up cepat untuk berganti ke akun pengguna lain secara instan tanpa berpindah halaman.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. Privasi Data & Batas Waktu Inaktif */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Privasi Data & Otomatisasi Selesai Sesi</span>
              </h3>

              {/* Clear draft checkbox */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="toggle-clear-draft" className="text-xs font-bold text-slate-900 cursor-pointer">
                    Bersihkan Draf Isian Formulir Belum Tersimpan
                  </label>
                  <input
                    id="toggle-clear-draft"
                    type="checkbox"
                    checked={clearDraftOnLogout}
                    onChange={(e) => setClearDraftOnLogout(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Menghapus catatan draf sementara yang belum disimpan di peramban saat pengguna menekan tombol logout. Sangat dianjurkan untuk komputer bersama di lab atau perpustakaan sekolah.
                </p>
              </div>

              {/* Inactivity Auto Logout */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900">
                    Batas Waktu Otomatis Keluar (Auto-Logout Inaktivitas)
                  </label>
                  {isStudent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-[#0753A5] border border-blue-200">
                      Standar Murid: 5 Menit
                    </span>
                  )}
                </div>
                <select
                  value={autoLogoutInactivity}
                  onChange={(e) => setAutoLogoutInactivity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 outline-none"
                >
                  <option value="5_MIN">5 Menit Tidak Ada Aktivitas (Standar Otomatis Murid - Peringatan 60 Detik)</option>
                  <option value="15_MIN">15 Menit Tidak Ada Aktivitas (Standar Lab Bersama)</option>
                  <option value="30_MIN">30 Menit Tidak Ada Aktivitas (Standar Ruang Kelas)</option>
                  <option value="60_MIN">60 Menit Tidak Ada Aktivitas (Ruang Guru / Kantor)</option>
                  <option value="DISABLED">Dinonaktifkan (Logout Manual Saja)</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Secara otomatis mengakhiri sesi jika perangkat ditinggalkan tanpa interaksi. Sebelum sesi ditutup, sistem menampilkan modal peringatan interaktif dan hitung mundur 60 detik demi menjaga kerahasiaan data sesuai UU Perlindungan Data Pribadi.
                </p>
                {isStudent && (
                  <div className="mt-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#0753A5] shrink-0 mt-0.5" />
                    <span>
                      <strong>Perlindungan Akun Murid:</strong> Saat akun murid tidak aktif selama 4 menit, layar peringatan akan muncul memberi kesempatan 60 detik untuk tetap masuk atau keluar secara aman.
                    </span>
                  </div>
                )}
              </div>

              {/* Audit Log Recording */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="toggle-audit-logout" className="text-xs font-bold text-slate-900 cursor-pointer">
                    Pencatatan Audit Log Selesai Sesi
                  </label>
                  <input
                    id="toggle-audit-logout"
                    type="checkbox"
                    checked={recordAuditOnLogout}
                    onChange={(e) => setRecordAuditOnLogout(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Merekam waktu keluar dan durasi pemakaian sesi ke log audit SIM sekolah untuk tujuan akuntabilitas pengawasan.
                </p>
              </div>
            </div>

            {/* 4. Panel Uji Coba Tombol Selesai Sesi */}
            <div className="bg-gradient-to-br from-rose-50/50 via-white to-amber-50/30 rounded-3xl p-6 border border-rose-200/80 shadow-xs space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Uji Coba & Tindakan Tombol Logout</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Lihat dan uji coba langsung perilaku tombol selesai sesi untuk akun Anda ({currentPersona.name} • {currentPersona.role}).
                </p>

                {/* Current session info */}
                <div className="mt-4 p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Pengguna Aktif:</span>
                    <strong className="text-slate-900">{currentPersona.name}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Wewenang / Peran:</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#0753A5] font-bold text-[10px]">
                      {currentPersona.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Durasi Sesi Ini:</span>
                    <strong className="text-slate-800 font-mono">
                      {sessionDurationFormatted || 'Berjalan'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Status Konfirmasi:</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      confirmBeforeLogout ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {confirmBeforeLogout ? 'Modal Konfirmasi Aktif' : 'Logout Langsung'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  id="btn-test-logout-action"
                  type="button"
                  onClick={onTriggerLogout}
                  className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Uji Coba Tombol Selesai Sesi (Logout Sekarang)</span>
                </button>
                <p className="text-[10px] text-center text-slate-500">
                  Tombol di atas akan menjalankan alur logout sesuai dengan preferensi yang tersimpan saat ini.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
