// ============================================================================
// SI-7KAIH AI - Super Admin Master Console Component
// Wewenang Akses Penuh: Semua Fitur, Master Data Global, & Pengelolaan Admin Sekolah
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  Database,
  Users,
  Building2,
  Calendar,
  BookOpen,
  Settings,
  KeyRound,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Layers,
  GraduationCap,
  Eye,
  FileSpreadsheet,
  Upload,
  UserPlus,
  Compass,
  FileText,
  Printer,
  ChevronRight,
  Sun,
  HeartHandshake,
  Activity,
  Apple,
  Moon,
  ExternalLink,
  UserCheck,
  Zap,
  LogOut,
  Sliders,
  Clock,
  Save,
  Stamp,
  Timer,
  Info,
  Link2,
} from 'lucide-react';
import {
  HabitCode,
  HabitMaster,
  UserRole,
  AuditLog,
} from '../../packages/types/src/index';
import {
  UserPersona,
  getStoredUsers,
  saveStoredUsers,
  getStoredHabitMasters,
  saveStoredHabitMasters,
  resetStoredHabitMasters,
  resetStoredUsers,
  LogoutSettings,
  DEFAULT_LOGOUT_SETTINGS,
  getStoredLogoutSettings,
  saveStoredLogoutSettings,
  RolePreferences,
  DEFAULT_ROLE_PREFERENCES,
  getStoredRolePreferences,
  saveStoredRolePreferences,
  markUserAsDeleted,
  markUsersAsDeleted,
  unmarkUserAsDeleted,
  isUserDeleted,
  setUserPassword,
  getUserPassword,
  verifyUserPassword,
} from '../lib/constants';
import {
  SchoolMaster,
  getStoredSchools,
  saveStoredSchools,
  resetStoredSchools,
} from '../lib/schoolMasterData';
import {
  Student,
  Rombel,
  getStoredStudents,
  saveStoredStudents,
  getStoredRombels,
  saveStoredRombels,
  resetStoredStudents,
  resetStoredRombels,
  downloadStudentTemplateCsv,
  downloadRombelTemplateCsv,
  isSameClass,
  isSameSchool,
} from '../lib/studentData';
import { DataImportModal } from './DataImportModal';
import { SuperAdminProfile } from './SuperAdminProfile';
import { ConfirmDeleteModal, DeleteModalState } from './ConfirmDeleteModal';
import { UserAvatar } from './UserAvatar';
import {
  saveSuperAdminMasterDataToSupabase,
  syncOnSuperAdminLogin,
  deleteUserFromSupabase,
  deleteUsersFromSupabase,
} from '../lib/supabaseService';

interface SuperAdminViewProps {
  activeNavTab?: string;
  onOpenReportModal: () => void;
  onSelectPersona: (persona: UserPersona) => void;
  currentPersona?: UserPersona;
  onUpdatePersona?: (persona: UserPersona) => void;
  logoutSettings?: LogoutSettings;
  onUpdateLogoutSettings?: (settings: LogoutSettings) => void;
  onTriggerLogout?: () => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  activeNavTab,
  onOpenReportModal,
  onSelectPersona,
  currentPersona,
  onUpdatePersona,
  logoutSettings,
  onUpdateLogoutSettings,
  onTriggerLogout,
}) => {
  // Navigation & Subtabs
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'MASTER_DATA' | 'ALL_FEATURES' | 'USERS' | 'PROGRAMS' | 'AUDIT' | 'SETTINGS' | 'PROFILE'
  >('OVERVIEW');
  const [masterSubTab, setMasterSubTab] = useState<
    'HABITS' | 'SCHOOLS' | 'ROMBELS' | 'STUDENTS' | 'ACCOUNTS'
  >('HABITS');

  // Subtabs for Settings (Pusat Pengaturan Terpadu Super Admin)
  const [settingsSubTab, setSettingsSubTab] = useState<'LOGOUT' | 'ROLE_PREFERENCES' | 'GUARDRAILS'>('LOGOUT');
  const [selectedRolePrefTab, setSelectedRolePrefTab] = useState<UserRole>('STUDENT');

  // Super Admin Management States for Logout Settings & Role Preferences
  const [adminLogoutSettings, setAdminLogoutSettings] = useState<LogoutSettings>(
    () => logoutSettings || getStoredLogoutSettings()
  );
  const [rolePreferences, setRolePreferences] = useState<RolePreferences>(
    () => getStoredRolePreferences()
  );
  const [logoutSaveSuccess, setLogoutSaveSuccess] = useState(false);
  const [rolePrefsSaveSuccess, setRolePrefsSaveSuccess] = useState(false);

  // Sync external logoutSettings prop
  useEffect(() => {
    if (logoutSettings) {
      setAdminLogoutSettings(logoutSettings);
    }
  }, [logoutSettings]);

  // Listen to cross-window or local updates
  useEffect(() => {
    const handleLogoutSync = () => {
      setAdminLogoutSettings(getStoredLogoutSettings());
    };
    const handleRolePrefsSync = () => {
      setRolePreferences(getStoredRolePreferences());
    };
    window.addEventListener('si7kaih_logout_settings_updated', handleLogoutSync);
    window.addEventListener('si7kaih_role_preferences_updated', handleRolePrefsSync);
    window.addEventListener('storage', handleLogoutSync);
    return () => {
      window.removeEventListener('si7kaih_logout_settings_updated', handleLogoutSync);
      window.removeEventListener('si7kaih_role_preferences_updated', handleRolePrefsSync);
      window.removeEventListener('storage', handleLogoutSync);
    };
  }, []);

  // Master Data States
  const [habitMasters, setHabitMasters] = useState<Record<HabitCode, HabitMaster>>(() =>
    getStoredHabitMasters()
  );
  const [schools, setSchools] = useState<SchoolMaster[]>(() => getStoredSchools());
  const [rombels, setRombels] = useState<Rombel[]>(() => getStoredRombels());
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [userAccounts, setUserAccounts] = useState<UserPersona[]>(() => getStoredUsers());

  // Real-time synchronization of users & master records across tabs / window mutations
  useEffect(() => {
    const syncAllMaster = () => {
      const freshUsers = getStoredUsers();
      setUserAccounts((prev) => (JSON.stringify(prev) === JSON.stringify(freshUsers) ? prev : freshUsers));
      const freshSchools = getStoredSchools();
      setSchools((prev) => (JSON.stringify(prev) === JSON.stringify(freshSchools) ? prev : freshSchools));
      const freshRombels = getStoredRombels();
      setRombels((prev) => (JSON.stringify(prev) === JSON.stringify(freshRombels) ? prev : freshRombels));
      const freshStudents = getStoredStudents();
      setStudents((prev) => (JSON.stringify(prev) === JSON.stringify(freshStudents) ? prev : freshStudents));
      const freshHabits = getStoredHabitMasters();
      setHabitMasters((prev) => (JSON.stringify(prev) === JSON.stringify(freshHabits) ? prev : freshHabits));
    };
    syncAllMaster();

    window.addEventListener('storage', syncAllMaster);
    window.addEventListener('si7kaih_users_updated', syncAllMaster);
    window.addEventListener('si7kaih_schools_updated', syncAllMaster);
    window.addEventListener('si7kaih_rombels_updated', syncAllMaster);
    window.addEventListener('si7kaih_students_updated', syncAllMaster);
    window.addEventListener('si7kaih_habits_updated', syncAllMaster);
    window.addEventListener('focus', syncAllMaster);

    return () => {
      window.removeEventListener('storage', syncAllMaster);
      window.removeEventListener('si7kaih_users_updated', syncAllMaster);
      window.removeEventListener('si7kaih_schools_updated', syncAllMaster);
      window.removeEventListener('si7kaih_rombels_updated', syncAllMaster);
      window.removeEventListener('si7kaih_students_updated', syncAllMaster);
      window.removeEventListener('si7kaih_habits_updated', syncAllMaster);
      window.removeEventListener('focus', syncAllMaster);
    };
  }, []);

  // Search & Filter
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [schoolJenjangFilter, setSchoolJenjangFilter] = useState<string>('ALL');
  const [schoolStatusFilter, setSchoolStatusFilter] = useState<string>('ALL');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');

  // Modals & Forms
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importModalTab, setImportModalTab] = useState<'STUDENTS' | 'ROMBELS'>('STUDENTS');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal: Add/Edit School
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolMaster | null>(null);
  const [schoolFormName, setSchoolFormName] = useState('');
  const [schoolFormNpsn, setSchoolFormNpsn] = useState('');
  const [schoolFormJenjang, setSchoolFormJenjang] = useState<'SMP' | 'SD' | 'MTS' | 'MI' | 'SMA' | 'SMK' | string>('SMP');
  const [schoolFormStatus, setSchoolFormStatus] = useState<'NEGERI' | 'SWASTA'>('NEGERI');
  const [schoolFormAkreditasi, setSchoolFormAkreditasi] = useState<'A' | 'B' | 'C' | 'BELUM'>('A');
  const [schoolFormPrincipal, setSchoolFormPrincipal] = useState('');
  const [schoolFormAdminName, setSchoolFormAdminName] = useState('');
  const [schoolFormAdminUser, setSchoolFormAdminUser] = useState('');
  const [schoolFormAddress, setSchoolFormAddress] = useState('');

  // Modal: Add / Edit User & School Admin Account (Terhubung Data Master Global)
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserPersona | null>(null);
  const [adminFormRole, setAdminFormRole] = useState<UserRole>('SCHOOL_ADMIN');
  const [adminFormName, setAdminFormName] = useState('');
  const [adminFormSchool, setAdminFormSchool] = useState('');
  const [adminFormUsername, setAdminFormUsername] = useState('');
  const [adminFormEmail, setAdminFormEmail] = useState('');
  const [adminFormNip, setAdminFormNip] = useState('');
  const [adminFormClassName, setAdminFormClassName] = useState('');
  const [adminFormPassword, setAdminFormPassword] = useState('123456');
  const [selectedExistingPersonSuper, setSelectedExistingPersonSuper] = useState('');

  // Modal: Edit Habit Master
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitMaster | null>(null);
  const [habitFormTarget, setHabitFormTarget] = useState('');
  const [habitFormDesc, setHabitFormDesc] = useState('');

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [logFilterRole, setLogFilterRole] = useState('ALL');

  // Guardrails State
  const [guardrails, setGuardrails] = useState({
    antiRanking: true,
    antiShaming: true,
    rlsEnforced: true,
    uuPdpCompliant: true,
  });

  // Delete & Action Modal State
  const [deleteModalState, setDeleteModalState] = useState<DeleteModalState>({
    isOpen: false,
    type: 'SCHOOL',
    title: '',
    itemName: '',
  });

  // Bulk Selection States
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Sync with Header navigation tabs
  useEffect(() => {
    if (!activeNavTab) return;
    if (activeNavTab === 'dashboard' || activeNavTab === 'super-dashboard') {
      setActiveTab('OVERVIEW');
    } else if (activeNavTab === 'master-data') {
      setActiveTab('MASTER_DATA');
    } else if (activeNavTab === 'all-features') {
      setActiveTab('ALL_FEATURES');
    } else if (activeNavTab === 'users-management' || activeNavTab === 'users-admin') {
      setActiveTab('USERS');
    } else if (activeNavTab === 'programs') {
      setActiveTab('PROGRAMS');
    } else if (activeNavTab === 'audit-logs') {
      setActiveTab('AUDIT');
    } else if (activeNavTab === 'system-settings') {
      setActiveTab('SETTINGS');
    } else if (activeNavTab === 'super-profile' || activeNavTab === 'profile') {
      setActiveTab('PROFILE');
    }
  }, [activeNavTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Super Admin handlers for Logout & Session Policy
  const handleSaveAdminLogoutSettings = () => {
    saveStoredLogoutSettings(adminLogoutSettings);
    if (onUpdateLogoutSettings) {
      onUpdateLogoutSettings(adminLogoutSettings);
    }
    setLogoutSaveSuccess(true);
    showToast('✅ Pengaturan tombol selesai sesi & kebijakan logout berhasil disimpan!');
    setTimeout(() => setLogoutSaveSuccess(false), 3500);
  };

  const handleResetAdminLogoutSettings = () => {
    const defaults = { ...DEFAULT_LOGOUT_SETTINGS };
    setAdminLogoutSettings(defaults);
    saveStoredLogoutSettings(defaults);
    if (onUpdateLogoutSettings) {
      onUpdateLogoutSettings(defaults);
    }
    setLogoutSaveSuccess(true);
    showToast('🔄 Pengaturan tombol selesai sesi dikembalikan ke standar default.');
    setTimeout(() => setLogoutSaveSuccess(false), 3500);
  };

  // Super Admin handlers for Role Operational Preferences
  const handleSaveRolePreferences = () => {
    saveStoredRolePreferences(rolePreferences);
    setRolePrefsSaveSuccess(true);
    showToast('✅ Preferensi operasional seluruh peran berhasil disimpan!');
    setTimeout(() => setRolePrefsSaveSuccess(false), 3500);
  };

  const handleResetRolePreferences = () => {
    const defaults = { ...DEFAULT_ROLE_PREFERENCES };
    setRolePreferences(defaults);
    saveStoredRolePreferences(defaults);
    setRolePrefsSaveSuccess(true);
    showToast('🔄 Preferensi operasional peran dikembalikan ke standar nasional.');
    setTimeout(() => setRolePrefsSaveSuccess(false), 3500);
  };

  const [isSyncingMaster, setIsSyncingMaster] = useState(false);

  const handleManualSyncMaster = async () => {
    setIsSyncingMaster(true);
    try {
      const res = await syncOnSuperAdminLogin(currentPersona);
      if (res.success) {
        showToast(
          `Sukses: ${res.details?.schoolsCount || 0} sekolah, ${res.details?.rombelsCount || 0} rombel, ${res.details?.studentsCount || 0} siswa, dan ${res.details?.usersCount || 0} akun disinkronkan otomatis ke semua perangkat!`
        );
      } else {
        showToast(res.message);
      }
    } catch (err: any) {
      showToast('Gagal sinkronisasi: ' + (err?.message || 'Koneksi terputus'));
    } finally {
      setIsSyncingMaster(false);
    }
  };

  // Persist Handlers with Auto-Sync to Supabase and Cross-Device Realtime Broadcast
  const updateSchools = (newSchools: SchoolMaster[]) => {
    setSchools(newSchools);
    saveStoredSchools(newSchools);
    saveSuperAdminMasterDataToSupabase({
      schools: newSchools,
      lastUpdatedBy: currentPersona?.name || 'Super Administrator',
      actionType: 'UPDATE_SCHOOLS',
    }).catch((e) => console.warn('Supabase schools sync notice:', e));
  };

  const updateUsers = (newUsers: UserPersona[]) => {
    setUserAccounts(newUsers);
    saveStoredUsers(newUsers);
    saveSuperAdminMasterDataToSupabase({
      users: newUsers,
      lastUpdatedBy: currentPersona?.name || 'Super Administrator',
      actionType: 'UPDATE_USERS',
    }).catch((e) => console.warn('Supabase users sync notice:', e));
  };

  const updateHabits = (newHabits: Record<HabitCode, HabitMaster>) => {
    setHabitMasters(newHabits);
    saveStoredHabitMasters(newHabits);
    saveSuperAdminMasterDataToSupabase({
      habitMasters: newHabits,
      lastUpdatedBy: currentPersona?.name || 'Super Administrator',
      actionType: 'UPDATE_HABITS',
    }).catch((e) => console.warn('Supabase habits sync notice:', e));
  };

  const updateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStoredStudents(newStudents);
    saveSuperAdminMasterDataToSupabase({
      students: newStudents,
      lastUpdatedBy: currentPersona?.name || 'Super Administrator',
      actionType: 'UPDATE_STUDENTS',
    }).catch((e) => console.warn('Supabase students sync notice:', e));
  };

  const updateRombels = (newRombels: Rombel[]) => {
    setRombels(newRombels);
    saveStoredRombels(newRombels);
    saveSuperAdminMasterDataToSupabase({
      rombels: newRombels,
      lastUpdatedBy: currentPersona?.name || 'Super Administrator',
      actionType: 'UPDATE_ROMBELS',
    }).catch((e) => console.warn('Supabase rombels sync notice:', e));
  };

  // Master Data Global Reset Handlers via in-app Modal
  const handleResetHabitMasters = () => {
    setDeleteModalState({
      isOpen: true,
      type: 'RESET',
      title: 'Reset Master 7KAIH',
      itemName: 'Standar Baku 7 Kebiasaan Anak Indonesia Hebat',
      itemIdentifier: 'Kepmendikdasmen No. 7/2025',
      warningMessage: 'Perubahan standar kustom kebiasaan akan dikembalikan ke standar baku nasional.',
      data: { action: 'RESET_HABITS' },
    });
  };

  const handleResetSchools = () => {
    setDeleteModalState({
      isOpen: true,
      type: 'RESET',
      title: 'Kosongkan Master Satuan Pendidikan',
      itemName: 'Daftar Sekolah Master Global',
      itemIdentifier: `${schools.length} satuan pendidikan tersimpan`,
      warningMessage: 'Seluruh data master satuan pendidikan akan dikosongkan dari sistem.',
      data: { action: 'RESET_SCHOOLS' },
    });
  };

  const handleResetRombels = () => {
    setDeleteModalState({
      isOpen: true,
      type: 'RESET',
      title: 'Kosongkan Master Rombel',
      itemName: 'Daftar Rombongan Belajar Global',
      itemIdentifier: `${rombels.length} rombel tersimpan`,
      warningMessage: 'Seluruh rombongan belajar akan dikosongkan/dibersihkan dari master data.',
      data: { action: 'RESET_ROMBELS' },
    });
  };

  const handleResetStudents = () => {
    setDeleteModalState({
      isOpen: true,
      type: 'RESET',
      title: 'Kosongkan Master Peserta Didik',
      itemName: 'Daftar Peserta Didik Global',
      itemIdentifier: `${students.length} peserta didik tersimpan`,
      warningMessage: 'Seluruh peserta didik akan dikosongkan/dibersihkan dari master data.',
      data: { action: 'RESET_STUDENTS' },
    });
  };

  const handleResetUsers = () => {
    setDeleteModalState({
      isOpen: true,
      type: 'RESET',
      title: 'Reset Master Akun Pengguna',
      itemName: 'Daftar Seluruh Pengguna & Hak Akses',
      itemIdentifier: `${userAccounts.length} akun pengguna`,
      warningMessage: 'Seluruh akun non-Super Admin (admin sekolah, kepala sekolah, pengawas, guru, siswa, dll) akan dibersihkan dari master data.',
      data: { action: 'RESET_USERS' },
    });
  };

  // Master Data Global Delete Handlers with in-app Confirmation
  const handleOpenDeleteSchool = (school: SchoolMaster) => {
    setDeleteModalState({
      isOpen: true,
      type: 'SCHOOL',
      title: 'Hapus Satuan Pendidikan Master',
      itemName: school.name,
      itemIdentifier: `NPSN: ${school.npsn} • Jenjang: ${school.jenjang} • Kepala: ${school.principalName}`,
      warningMessage: `Satuan pendidikan "${school.name}" akan dihapus dari Master Global. Data rombel dan akun terkait akan terpengaruh.`,
      data: school,
    });
  };

  const handleOpenDeleteRombel = (rombel: Rombel) => {
    setDeleteModalState({
      isOpen: true,
      type: 'ROMBEL',
      title: 'Hapus Rombongan Belajar Master',
      itemName: rombel.name,
      itemIdentifier: `Kode: ${rombel.code} • Tingkat ${rombel.grade} • Wali: ${rombel.teacher}`,
      warningMessage: `Rombongan belajar "${rombel.name}" akan dihapus dari Master Global. Data siswa pada rombel ini tetap tersimpan.`,
      data: rombel,
    });
  };

  const handleOpenDeleteStudent = (student: Student) => {
    setDeleteModalState({
      isOpen: true,
      type: 'STUDENT',
      title: 'Hapus Peserta Didik Master',
      itemName: student.name,
      itemIdentifier: `NISN: ${student.nisn} • ${student.className} • Wali: ${student.parentName}`,
      warningMessage: `Data peserta didik "${student.name}" akan dihapus secara permanen dari Master Global.`,
      data: student,
    });
  };

  const handleOpenDeleteUser = (user: UserPersona) => {
    if (user.role === 'SUPER_ADMIN' && userAccounts.filter((u) => u.role === 'SUPER_ADMIN').length <= 1) {
      showToast('Tidak dapat menghapus akun Super Admin utama terakhir!');
      return;
    }
    if (currentPersona && user.id === currentPersona.id) {
      showToast('Tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan!');
      return;
    }
    setDeleteModalState({
      isOpen: true,
      type: 'USER',
      title: 'Hapus Akun Pengguna Secara Permanen',
      itemName: `${user.name} (@${user.username})`,
      itemIdentifier: `Peran: ${user.role} • Satuan Pendidikan: ${user.schoolName || 'SIM Pusat'}`,
      warningMessage: `Akun pengguna "${user.name}" (@${user.username}) akan dihapus secara permanen dari basis data dan dicatat dalam daftar proteksi agar tidak otomatis muncul kembali.`,
      data: user,
    });
  };

  const handleOpenDeleteSelectedStudents = () => {
    if (selectedStudentIds.size === 0) return;
    setDeleteModalState({
      isOpen: true,
      type: 'BULK_STUDENT',
      title: `Hapus ${selectedStudentIds.size} Peserta Didik Terpilih`,
      itemName: `${selectedStudentIds.size} Peserta Didik terpilih`,
      itemIdentifier: 'Penghapusan massal data siswa',
      warningMessage: `Semua ${selectedStudentIds.size} peserta didik yang dipilih akan dihapus secara permanen dari Master Global.`,
    });
  };

  const handleOpenDeleteSelectedUsers = () => {
    const validSelected = Array.from(selectedUserIds).filter((id) => {
      const u = userAccounts.find((acc) => acc.id === id);
      if (!u) return false;
      if (u.role === 'SUPER_ADMIN' && userAccounts.filter((acc) => acc.role === 'SUPER_ADMIN').length <= 1) return false;
      if (currentPersona && u.id === currentPersona.id) return false;
      return true;
    });

    if (validSelected.length === 0) {
      showToast('Tidak ada akun yang dapat dihapus (akun Super Admin aktif dilindungi).');
      return;
    }

    setDeleteModalState({
      isOpen: true,
      type: 'BULK_USER',
      title: `Hapus ${validSelected.length} Akun Pengguna Terpilih`,
      itemName: `${validSelected.length} Akun Pengguna terpilih`,
      itemIdentifier: 'Penghapusan massal akun pengguna secara permanen',
      warningMessage: `Semua ${validSelected.length} akun pengguna terpilih akan dihapus secara permanen dari basis data dan dicatat dalam daftar proteksi agar tidak otomatis muncul kembali.`,
    });
  };

  const handleOpenClearLogs = () => {
    setDeleteModalState({
      isOpen: true,
      type: 'AUDIT_LOGS',
      title: 'Bersihkan Log Audit Aktivitas',
      itemName: 'Seluruh Riwayat Log Audit Sistem',
      itemIdentifier: `${logs.length} catatan audit tercatat`,
      warningMessage: 'Semua catatan log audit akan dibersihkan dari tampilan sistem.',
    });
  };

  // Direct alias wrappers
  const handleDeleteSchool = (school: SchoolMaster) => handleOpenDeleteSchool(school);
  const handleDeleteRombel = (rombel: Rombel) => handleOpenDeleteRombel(rombel);
  const handleDeleteStudent = (student: Student) => handleOpenDeleteStudent(student);
  const handleDeleteUser = (user: UserPersona) => handleOpenDeleteUser(user);

  // Centralized Execution of Modal Confirmation
  const handleExecuteDelete = () => {
    const { type, data } = deleteModalState;

    if (type === 'SCHOOL' && data) {
      const school = data as SchoolMaster;
      const updated = schools.filter((s) => s.id !== school.id);
      updateSchools(updated);

      // Sinkronisasi: Nonaktifkan akun yang berafiliasi dengan satuan pendidikan ini
      const updatedUsers = userAccounts.map((u) => {
        if (u.schoolId === school.id || u.schoolName?.toLowerCase() === school.name.toLowerCase()) {
          return {
            ...u,
            schoolName: `${u.schoolName} (Sekolah Dihapus)`,
            accountStatus: 'MANDIRI_NONAKTIF' as const,
          };
        }
        return u;
      });
      updateUsers(updatedUsers);
      showToast(`Satuan pendidikan "${school.name}" berhasil dihapus & akun terkait dinonaktifkan.`);
    } else if (type === 'ROMBEL' && data) {
      const rombel = data as Rombel;
      const updated = rombels.filter((r) => r.id !== rombel.id);
      updateRombels(updated);
      showToast(`Rombongan belajar "${rombel.name}" berhasil dihapus.`);
    } else if (type === 'STUDENT' && data) {
      const student = data as Student;
      const updated = students.filter((s) => s.id !== student.id);
      updateStudents(updated);
      showToast(`Peserta didik "${student.name}" berhasil dihapus.`);
      setSelectedStudentIds((prev) => {
        const next = new Set(prev);
        next.delete(student.id);
        return next;
      });
    } else if (type === 'USER' && data) {
      const user = data as UserPersona;

      // 1. Rekam tombstone agar tidak otomatis muncul kembali saat refresh atau sinkronisasi
      markUserAsDeleted(user.id, user.username, currentPersona?.name);

      // 2. Hapus langsung dari Supabase database
      deleteUserFromSupabase(user.id, user.username).catch((err) => {
        console.warn('Gagal menghapus user dari Supabase:', err);
      });

      // 3. Hapus dari state lokal
      const updated = userAccounts.filter(
        (u) => u.id !== user.id && (!user.username || u.username.toLowerCase() !== user.username.toLowerCase())
      );
      updateUsers(updated);

      // 4. Sinkronisasi: Jika akun adalah Admin Sekolah, perbarui Master Satuan Pendidikan
      if (user.role === 'SCHOOL_ADMIN') {
        const updatedSchools = schools.map((s) => {
          if (
            (user.schoolId && s.id === user.schoolId) ||
            (s.adminUsername && s.adminUsername.toLowerCase() === user.username.toLowerCase())
          ) {
            return {
              ...s,
              adminName: '',
              adminUsername: '',
              adminEmail: '',
            };
          }
          return s;
        });
        updateSchools(updatedSchools);
      }

      showToast(`Akun pengguna "${user.name}" (@${user.username}) berhasil dihapus secara permanen.`);
      setSelectedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    } else if (type === 'BULK_STUDENT') {
      const updated = students.filter((s) => !selectedStudentIds.has(s.id));
      updateStudents(updated);
      showToast(`${selectedStudentIds.size} peserta didik terpilih berhasil dihapus.`);
      setSelectedStudentIds(new Set());
    } else if (type === 'BULK_USER') {
      const usersToDelete = userAccounts.filter((u) => {
        if (!selectedUserIds.has(u.id)) return false;
        if (u.role === 'SUPER_ADMIN' && userAccounts.filter((acc) => acc.role === 'SUPER_ADMIN').length <= 1) return false;
        if (currentPersona && u.id === currentPersona.id) return false;
        return true;
      });

      if (usersToDelete.length === 0) {
        showToast('Tidak ada akun valid yang dapat dihapus.');
        setDeleteModalState((prev) => ({ ...prev, isOpen: false }));
        return;
      }

      // 1. Rekam tombstone massal
      markUsersAsDeleted(
        usersToDelete.map((u) => ({ id: u.id, username: u.username })),
        currentPersona?.name
      );

      // 2. Hapus dari Supabase database
      const delIds = usersToDelete.map((u) => u.id);
      const delUsernames = usersToDelete.map((u) => u.username);
      deleteUsersFromSupabase(delIds, delUsernames).catch((err) => {
        console.warn('Gagal menghapus massal user dari Supabase:', err);
      });

      // 3. Hapus dari state lokal
      const idSet = new Set(delIds);
      const updated = userAccounts.filter((u) => !idSet.has(u.id));
      updateUsers(updated);

      // 4. Sinkronisasi sekolah jika ada admin sekolah yang dihapus
      const deletedAdminUsernames = new Set(
        usersToDelete
          .filter((u) => u.role === 'SCHOOL_ADMIN')
          .map((u) => u.username.toLowerCase())
      );
      if (deletedAdminUsernames.size > 0) {
        const updatedSchools = schools.map((s) => {
          if (s.adminUsername && deletedAdminUsernames.has(s.adminUsername.toLowerCase())) {
            return {
              ...s,
              adminName: '',
              adminUsername: '',
              adminEmail: '',
            };
          }
          return s;
        });
        updateSchools(updatedSchools);
      }

      showToast(`${usersToDelete.length} akun pengguna terpilih berhasil dihapus secara permanen.`);
      setSelectedUserIds(new Set());
    } else if (type === 'AUDIT_LOGS') {
      setLogs([]);
      showToast('Seluruh riwayat log aktivitas berhasil dibersihkan.');
    } else if (type === 'RESET' && data) {
      if (data.action === 'RESET_HABITS') {
        const def = resetStoredHabitMasters();
        updateHabits(def);
        showToast('Standar Master 7KAIH berhasil di-reset ke pengaturan baku nasional.');
      } else if (data.action === 'RESET_SCHOOLS') {
        const def = resetStoredSchools();
        updateSchools(def);
        showToast('Master Satuan Pendidikan berhasil dikosongkan.');
      } else if (data.action === 'RESET_ROMBELS') {
        const def = resetStoredRombels();
        updateRombels(def);
        showToast('Master Rombongan Belajar berhasil dikosongkan.');
      } else if (data.action === 'RESET_STUDENTS') {
        const def = resetStoredStudents();
        updateStudents(def);
        setSelectedStudentIds(new Set());
        showToast('Master Peserta Didik berhasil dikosongkan.');
      } else if (data.action === 'RESET_USERS') {
        const usersToDelete = userAccounts.filter((u) => u.role !== 'SUPER_ADMIN');
        if (usersToDelete.length > 0) {
          markUsersAsDeleted(
            usersToDelete.map((u) => ({ id: u.id, username: u.username })),
            currentPersona?.name
          );
          deleteUsersFromSupabase(
            usersToDelete.map((u) => u.id),
            usersToDelete.map((u) => u.username)
          ).catch((err) => console.warn('Supabase reset users delete notice:', err));
        }
        const def = resetStoredUsers();
        updateUsers(def);
        setSelectedUserIds(new Set());
        showToast('Master Akun berhasil dibersihkan permanen (hanya Super Admin aktif).');
      }
    }

    setDeleteModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // School Form Actions
  const handleOpenAddSchool = () => {
    setEditingSchool(null);
    setSchoolFormName('');
    setSchoolFormNpsn('');
    setSchoolFormJenjang('SMP');
    setSchoolFormStatus('NEGERI');
    setSchoolFormAkreditasi('A');
    setSchoolFormPrincipal('');
    setSchoolFormAdminName('');
    setSchoolFormAdminUser('');
    setSchoolFormAddress('');
    setIsSchoolModalOpen(true);
  };

  const handleOpenEditSchool = (sch: SchoolMaster) => {
    setEditingSchool(sch);
    setSchoolFormName(sch.name);
    setSchoolFormNpsn(sch.npsn);
    setSchoolFormJenjang(sch.jenjang || 'SMP');
    setSchoolFormStatus(sch.status);
    setSchoolFormAkreditasi(sch.akreditasi);
    setSchoolFormPrincipal(sch.principalName);
    setSchoolFormAdminName(sch.adminName);
    setSchoolFormAdminUser(sch.adminUsername);
    setSchoolFormAddress(sch.address);
    setIsSchoolModalOpen(true);
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolFormName.trim() || !schoolFormNpsn.trim()) {
      showToast('Nama Satuan Pendidikan dan NPSN wajib diisi!');
      return;
    }

    if (editingSchool) {
      const updatedSchoolName = schoolFormName.trim();
      const updatedAdminName = schoolFormAdminName.trim();
      const updatedAdminUser = schoolFormAdminUser.trim().toLowerCase();
      const updatedPrincipal = schoolFormPrincipal.trim();

      const updated = schools.map((s) =>
        s.id === editingSchool.id
          ? {
              ...s,
              name: updatedSchoolName,
              npsn: schoolFormNpsn.trim(),
              jenjang: schoolFormJenjang,
              status: schoolFormStatus,
              akreditasi: schoolFormAkreditasi,
              principalName: updatedPrincipal || s.principalName,
              adminName: updatedAdminName || s.adminName,
              adminUsername: updatedAdminUser || s.adminUsername,
              address: schoolFormAddress.trim() || s.address,
            }
          : s
      );
      setSchools(updated);
      saveStoredSchools(updated);

      // Sinkronisasi dengan userAccounts (Administrator dan Pengguna Sekolah Terdaftar)
      let updatedUsers = userAccounts.map((u) => {
        const isAssociated = u.schoolId === editingSchool.id || u.schoolName?.toLowerCase() === editingSchool.name.toLowerCase();
        if (!isAssociated) return u;

        const isTargetAdmin =
          u.role === 'SCHOOL_ADMIN' &&
          ((editingSchool.adminUsername && u.username.toLowerCase() === editingSchool.adminUsername.toLowerCase()) ||
            (updatedAdminUser && u.username.toLowerCase() === updatedAdminUser) ||
            u.name.toLowerCase() === (editingSchool.adminName || '').toLowerCase());

        if (isTargetAdmin) {
          return {
            ...u,
            name: updatedAdminName || u.name,
            username: updatedAdminUser || u.username,
            schoolId: editingSchool.id,
            schoolName: updatedSchoolName,
            title: `Administrator SIM ${updatedSchoolName}`,
            email: updatedAdminUser ? `${updatedAdminUser}@sekolah.sch.id` : u.email,
          };
        }

        if (u.role === 'PRINCIPAL') {
          return {
            ...u,
            name: updatedPrincipal || u.name,
            schoolId: editingSchool.id,
            schoolName: updatedSchoolName,
            title: `Kepala ${updatedSchoolName}`,
          };
        }

        return {
          ...u,
          schoolId: editingSchool.id,
          schoolName: updatedSchoolName,
        };
      });

      // Jika belum ada akun SCHOOL_ADMIN tetapi username admin diisi di Master Satdik, buatkan otomatis
      if (updatedAdminUser && !updatedUsers.some((u) => u.role === 'SCHOOL_ADMIN' && u.schoolId === editingSchool.id)) {
        const newAdminPersona: UserPersona = {
          id: `usr-admin-${Date.now()}`,
          name: updatedAdminName || `Admin ${updatedSchoolName}`,
          role: 'SCHOOL_ADMIN',
          title: `Administrator SIM ${updatedSchoolName}`,
          avatar: '💻',
          schoolId: editingSchool.id,
          schoolName: updatedSchoolName,
          identifierLabel: 'NIP / ID Admin',
          identifierValue: `ADM-${schoolFormNpsn.trim()}`,
          username: updatedAdminUser,
          email: `${updatedAdminUser}@sekolah.sch.id`,
          accountStatus: 'MANDIRI_TERVERIFIKASI',
          authChannel: 'MANDIRI_INTERNAL',
          authProviderLabel: `Autentikasi Mandiri SIM ${updatedSchoolName}`,
          securityLevel: 'Operator Satuan Pendidikan (Dikelola Super Admin)',
          managedBy: 'Super Administrator SI-7KAIH Pusat',
          createdDate: new Date().toISOString().split('T')[0],
        };
        updatedUsers.push(newAdminPersona);
      }
      setUserAccounts(updatedUsers);
      saveStoredUsers(updatedUsers);

      // Sinkronisasi rombels dan students
      const updatedRombels = rombels.map((r) =>
        r.schoolId === editingSchool.id || r.schoolName?.toLowerCase() === editingSchool.name.toLowerCase()
          ? { ...r, schoolName: updatedSchoolName, schoolId: editingSchool.id }
          : r
      );
      setRombels(updatedRombels);
      saveStoredRombels(updatedRombels);

      const updatedStudents = students.map((std) =>
        std.schoolId === editingSchool.id || std.schoolName?.toLowerCase() === editingSchool.name.toLowerCase()
          ? { ...std, schoolName: updatedSchoolName, schoolId: editingSchool.id }
          : std
      );
      setStudents(updatedStudents);
      saveStoredStudents(updatedStudents);

      // Sinkronisasi komprehensif ke Supabase dan siarkan ke seluruh perangkat
      saveSuperAdminMasterDataToSupabase({
        schools: updated,
        users: updatedUsers,
        rombels: updatedRombels,
        students: updatedStudents,
        lastUpdatedBy: currentPersona?.name || 'Super Administrator',
        actionType: 'UPDATE_SCHOOL_AND_USERS',
      }).catch((e) => console.warn('Supabase master sync notice:', e));

      showToast(`Data Satuan Pendidikan "${updatedSchoolName}" & seluruh akun terkait berhasil diperbarui dan disinkronkan ke semua perangkat!`);
    } else {
      const newId = `s-${Date.now()}`;
      const newSchool: SchoolMaster = {
        id: newId,
        name: schoolFormName.trim(),
        npsn: schoolFormNpsn.trim(),
        jenjang: schoolFormJenjang,
        status: schoolFormStatus,
        akreditasi: schoolFormAkreditasi,
        district: 'Kecamatan Terdaftar',
        city: 'Kota Administrasi',
        province: 'Wilayah Binaan',
        address: schoolFormAddress.trim() || '-',
        principalName: schoolFormPrincipal.trim() || '-',
        principalNip: '-',
        adminName: schoolFormAdminName.trim() || 'Admin Sekolah',
        adminUsername: schoolFormAdminUser.trim() || `admin.${schoolFormNpsn}`,
        totalStudents: 0,
        totalClasses: 0,
        totalTeachers: 0,
        habitCompletenessRate: 0,
        habitConsistencyRate: 0,
        activeStatus: 'AKTIF',
        createdAt: new Date().toISOString().split('T')[0],
      };
      const updatedSchoolsList = [...schools, newSchool];
      setSchools(updatedSchoolsList);
      saveStoredSchools(updatedSchoolsList);

      // Automatically provision a School Admin persona if desired
      let updatedUsersList = [...userAccounts];
      if (schoolFormAdminUser.trim()) {
        const newAdminPersona: UserPersona = {
          id: `usr-admin-${Date.now()}`,
          name: schoolFormAdminName.trim() || `Admin ${schoolFormName}`,
          role: 'SCHOOL_ADMIN',
          title: `Administrator SIM ${schoolFormName}`,
          avatar: '💻',
          schoolId: newId,
          schoolName: schoolFormName.trim(),
          identifierLabel: 'NIP / ID Admin',
          identifierValue: `ADM-${schoolFormNpsn}`,
          username: schoolFormAdminUser.trim(),
          email: `${schoolFormAdminUser.trim()}@sekolah.sch.id`,
          accountStatus: 'MANDIRI_TERVERIFIKASI',
          authChannel: 'MANDIRI_INTERNAL',
          authProviderLabel: 'Autentikasi Mandiri SIM Sekolah',
          securityLevel: 'Operator Satuan Pendidikan (Pengelola Akun Mandiri)',
          managedBy: 'Super Administrator SI-7KAIH Pusat',
          createdDate: new Date().toISOString().split('T')[0],
          passwordHash: '123456',
        };
        setUserPassword(newAdminPersona.id, '123456', [
          newAdminPersona.username,
          newAdminPersona.identifierValue,
          newAdminPersona.email,
        ]);
        updatedUsersList = [...userAccounts, newAdminPersona];
        setUserAccounts(updatedUsersList);
        saveStoredUsers(updatedUsersList);
      }

      if (schoolFormPrincipal.trim() && schoolFormPrincipal.trim() !== '-') {
        const principalUsername = `kepsek.${schoolFormNpsn.trim()}`;
        const newPrincipalPersona: UserPersona = {
          id: `usr-kepsek-${Date.now()}`,
          name: schoolFormPrincipal.trim(),
          role: 'PRINCIPAL',
          title: `Kepala ${schoolFormName.trim()}`,
          avatar: '👨‍💼',
          schoolId: newId,
          schoolName: schoolFormName.trim(),
          identifierLabel: 'NIP Kepala Sekolah',
          identifierValue: `19800101${Date.now().toString().slice(-10)}`,
          username: principalUsername,
          email: `${principalUsername}@sekolah.sch.id`,
          accountStatus: 'MANDIRI_TERVERIFIKASI',
          authChannel: 'MANDIRI_INTERNAL',
          authProviderLabel: 'Autentikasi Mandiri SIM Sekolah',
          securityLevel: 'Kepala Satuan Pendidikan (Akses Eksekutif & Supervisi)',
          managedBy: 'Super Administrator SI-7KAIH Pusat',
          createdDate: new Date().toISOString().split('T')[0],
          passwordHash: '123456',
        };
        setUserPassword(newPrincipalPersona.id, '123456', [
          newPrincipalPersona.username,
          newPrincipalPersona.identifierValue,
          newPrincipalPersona.email,
        ]);
        updatedUsersList = [...updatedUsersList, newPrincipalPersona];
        setUserAccounts(updatedUsersList);
        saveStoredUsers(updatedUsersList);
      }

      // Sinkronisasi penambahan satuan pendidikan ke Supabase
      saveSuperAdminMasterDataToSupabase({
        schools: updatedSchoolsList,
        users: updatedUsersList,
        lastUpdatedBy: currentPersona?.name || 'Super Administrator',
        actionType: 'CREATE_SCHOOL',
      }).catch((e) => console.warn('Supabase save school notice:', e));

      showToast(`Satuan Pendidikan ${schoolFormJenjang} "${newSchool.name}" (${schoolFormStatus}) berhasil didaftarkan dan disinkronkan ke semua perangkat!`);
    }
    setIsSchoolModalOpen(false);
  };

  // Aggregated Admin from Master Satuan Pendidikan (SchoolMaster) & Existing Accounts
  const availableAdminsMaster = useMemo(() => {
    return schools.map((sch) => {
      const sanitizedAdminUser = sch.adminUsername;
      const sanitizedAdminName = sch.adminName;

      const existingAccount = userAccounts.find(
        (u) =>
          u.schoolId === sch.id &&
          u.role === 'SCHOOL_ADMIN' &&
          ((sanitizedAdminUser && u.username.toLowerCase() === sanitizedAdminUser.toLowerCase()) ||
            (sanitizedAdminName && u.name.toLowerCase() === sanitizedAdminName.toLowerCase()))
      );

      return {
        schoolId: sch.id,
        schoolName: sch.name,
        npsn: sch.npsn,
        adminName: sanitizedAdminName ? sanitizedAdminName.trim() : `Admin ${sch.name}`,
        adminUsername: sanitizedAdminUser?.trim() || `admin.${sch.npsn}`,
        principalName: sch.principalName?.trim(),
        principalNip: sch.principalNip?.trim(),
        hasAccount: !!existingAccount,
        existingUsername: existingAccount?.username,
      };
    });
  }, [schools, userAccounts]);

  // Derived lists of existing teachers and students for Super Admin user creation
  const availableTeachersSuper = useMemo(() => {
    const map = new Map<string, { name: string; nip?: string; className?: string; schoolId?: string; schoolName?: string }>();
    rombels.forEach((r) => {
      if (r.teacher && r.teacher.trim()) {
        map.set(r.teacher.trim(), {
          name: r.teacher.trim(),
          nip: r.teacherNip || '',
          className: r.name,
        });
      }
    });
    userAccounts
      .filter((u) => u.role === 'TEACHER')
      .forEach((u) => {
        if (!map.has(u.name)) {
          map.set(u.name, {
            name: u.name,
            nip: u.identifierValue || u.nip || '',
            className: u.className || '',
            schoolId: u.schoolId,
            schoolName: u.schoolName,
          });
        }
      });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rombels, userAccounts]);

  const availableStudentsSuper = useMemo(() => {
    return [...students].sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  const handleSelectExistingPersonSuper = (val: string) => {
    setSelectedExistingPersonSuper(val);
    if (!val || val === 'MANUAL') {
      return;
    }

    if (val.startsWith('ADMIN_MASTER:')) {
      const schId = val.replace('ADMIN_MASTER:', '');
      const found = availableAdminsMaster.find((a) => a.schoolId === schId);
      if (found) {
        setAdminFormSchool(found.schoolId);
        setAdminFormName(found.adminName);
        setAdminFormRole('SCHOOL_ADMIN');
        setAdminFormClassName('Administrator SIM Sekolah');
        setAdminFormNip('');
        const schoolDomain = found.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanUser = (found.adminUsername || `admin.${schoolDomain}`).toLowerCase().replace(/\s+/g, '');
        setAdminFormUsername(cleanUser);
        setAdminFormEmail(`${cleanUser}@${schoolDomain}.sch.id`);
      }
    } else if (val.startsWith('PRINCIPAL_MASTER:')) {
      const schId = val.replace('PRINCIPAL_MASTER:', '');
      const found = availableAdminsMaster.find((a) => a.schoolId === schId);
      if (found && found.principalName) {
        setAdminFormSchool(found.schoolId);
        setAdminFormName(found.principalName);
        setAdminFormRole('PRINCIPAL');
        setAdminFormClassName(`Kepala ${found.schoolName}`);
        setAdminFormNip(found.principalNip || '');
        const schoolDomain = found.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanUser = found.principalName
          .toLowerCase()
          .replace(/^(pak|ibu|bapak|dr|drs|dra|h|hj)\.?\s+/gi, '')
          .split(',')[0]
          .trim()
          .replace(/[^a-z0-9]/g, '.');
        setAdminFormUsername(`kepsek.${cleanUser || schoolDomain}`);
        setAdminFormEmail(`kepsek.${cleanUser || schoolDomain}@${schoolDomain}.sch.id`);
      }
    } else if (val.startsWith('TEACHER:')) {
      const teacherName = val.replace('TEACHER:', '');
      const found = availableTeachersSuper.find((t) => t.name === teacherName);
      if (found) {
        if (found.schoolId) {
          setAdminFormSchool(found.schoolId);
        }
        const assignedSchool = schools.find((s) => s.id === (found.schoolId || adminFormSchool)) || schools[0];
        const schoolName = assignedSchool?.name || 'Satuan Pendidikan';
        const schoolDomain = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'sekolah';
        setAdminFormName(found.name);
        setAdminFormRole('TEACHER');
        setAdminFormNip(found.nip || '');
        setAdminFormClassName(found.className || '');
        const cleanUser = found.name
          .toLowerCase()
          .replace(/^(pak|ibu|bapak|dr|drs|dra|h|hj)\.?\s+/gi, '')
          .split(',')[0]
          .trim()
          .replace(/[^a-z0-9]/g, '.');
        setAdminFormUsername(cleanUser || 'guru.' + Date.now().toString().slice(-4));
        setAdminFormEmail(`${cleanUser || 'guru'}@${schoolDomain}.sch.id`);
      }
    } else if (val.startsWith('STUDENT:')) {
      const nisn = val.replace('STUDENT:', '');
      const found = availableStudentsSuper.find((s) => s.nisn === nisn);
      if (found) {
        const assignedSchool = schools.find((s) => s.id === adminFormSchool) || schools[0];
        const schoolName = assignedSchool?.name || 'Satuan Pendidikan';
        const schoolDomain = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'sekolah';
        setAdminFormName(found.name);
        setAdminFormRole('STUDENT');
        setAdminFormNip(found.nisn);
        setAdminFormClassName(found.className);
        const cleanUser = found.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '.');
        setAdminFormUsername(found.nisn || cleanUser);
        setAdminFormEmail(`${found.nisn || cleanUser}@${schoolDomain}.sch.id`);
      }
    }
  };

  // Add School Admin / User Modal Actions
  const handleOpenAddAdmin = () => {
    setEditingUser(null);
    setSelectedExistingPersonSuper('');
    setAdminFormRole('SCHOOL_ADMIN');
    setAdminFormName('');
    setAdminFormSchool('');
    setAdminFormUsername('');
    setAdminFormEmail('');
    setAdminFormNip('');
    setAdminFormClassName('');
    setAdminFormPassword('123456');
    setIsAddAdminModalOpen(true);
  };

  const handleOpenEditUser = (u: UserPersona) => {
    setEditingUser(u);
    setSelectedExistingPersonSuper('');
    setAdminFormRole(u.role);
    setAdminFormName(u.name);
    const matchedSchool = schools.find(
      (s) =>
        s.id === u.schoolId ||
        s.name.toLowerCase() === (u.schoolName || '').toLowerCase() ||
        (s.adminUsername && s.adminUsername.toLowerCase() === u.username.toLowerCase())
    );
    setAdminFormSchool(matchedSchool ? matchedSchool.id : (u.schoolId || ''));
    setAdminFormUsername(u.username);
    setAdminFormEmail(u.email || '');
    setAdminFormNip(u.identifierValue || u.nip || '');
    setAdminFormClassName(u.className || '');
    setAdminFormPassword(u.passwordHash || getUserPassword(u) || '123456');
    setIsAddAdminModalOpen(true);
  };

  // Helper: Status keterhubungan akun ke Data Master Global
  const getMasterConnectionInfo = (u: UserPersona) => {
    if (u.role === 'SUPER_ADMIN') {
      return {
        type: 'SIM_PUSAT',
        badge: '🛡️ SIM Pusat',
        label: 'SIM Pusat Nasional',
        sublabel: 'Kemendikdasmen RI',
        color: 'bg-purple-50 text-purple-800 border-purple-200',
      };
    }
    if (u.role === 'SCHOOL_ADMIN') {
      const matchedSchool = schools.find(
        (s) =>
          s.id === u.schoolId ||
          (s.adminUsername && s.adminUsername.toLowerCase() === u.username.toLowerCase()) ||
          s.name.toLowerCase() === (u.schoolName || '').toLowerCase()
      );
      if (matchedSchool) {
        return {
          type: 'SCHOOL',
          badge: '🔗 Master Satdik',
          label: `Master Satdik: ${matchedSchool.npsn}`,
          sublabel: matchedSchool.name,
          color: 'bg-amber-50 text-amber-900 border-amber-300',
        };
      }
    }
    if (u.role === 'PRINCIPAL') {
      const matchedSchool = schools.find(
        (s) =>
          s.id === u.schoolId ||
          (s.principalName && s.principalName.toLowerCase() === u.name.toLowerCase()) ||
          s.name.toLowerCase() === (u.schoolName || '').toLowerCase()
      );
      if (matchedSchool) {
        return {
          type: 'PRINCIPAL',
          badge: '🔗 Master Kepsek',
          label: `Master Satdik: ${matchedSchool.npsn}`,
          sublabel: `Kepala ${matchedSchool.name}`,
          color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        };
      }
    }
    if (u.role === 'TEACHER') {
      const matchedRombel = rombels.find(
        (r) =>
          (r.teacher && r.teacher.toLowerCase() === u.name.toLowerCase()) ||
          (u.className && r.name.toLowerCase() === u.className.toLowerCase() && (!u.schoolId || r.schoolId === u.schoolId))
      );
      if (matchedRombel) {
        return {
          type: 'ROMBEL',
          badge: '🔗 Master Rombel',
          label: `Master Rombel: ${matchedRombel.code || matchedRombel.name}`,
          sublabel: `${matchedRombel.name} (${matchedRombel.schoolName || 'Satdik'})`,
          color: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        };
      }
    }
    if (u.role === 'STUDENT') {
      const matchedStudent = students.find(
        (std) =>
          (u.identifierValue && std.nisn === u.identifierValue) ||
          std.username?.toLowerCase() === u.username.toLowerCase() ||
          std.name.toLowerCase() === u.name.toLowerCase()
      );
      if (matchedStudent) {
        return {
          type: 'STUDENT',
          badge: '🔗 Master Siswa',
          label: `Master Siswa: ${matchedStudent.nisn}`,
          sublabel: `${matchedStudent.className} (${matchedStudent.schoolName || 'Satdik'})`,
          color: 'bg-blue-50 text-blue-900 border-blue-200',
        };
      }
    }
    if (u.role === 'PARENT') {
      const matchedStudent = students.find(
        (std) =>
          (u.childNisn && std.nisn === u.childNisn) ||
          (u.childName && std.name.toLowerCase() === u.childName.toLowerCase()) ||
          std.parentUsername?.toLowerCase() === u.username.toLowerCase()
      );
      if (matchedStudent) {
        return {
          type: 'PARENT',
          badge: '🔗 Master Wali',
          label: `Master Wali: ${matchedStudent.nisn}`,
          sublabel: `Orang Tua: ${matchedStudent.name}`,
          color: 'bg-teal-50 text-teal-900 border-teal-200',
        };
      }
    }
    return {
      type: 'STANDALONE',
      badge: '🌐 Akun Mandiri',
      label: 'Kredensial Mandiri',
      sublabel: u.schoolName || 'Internal Satdik',
      color: 'bg-slate-50 text-slate-700 border-slate-200',
    };
  };

  // Sinkronisasi Seluruh Akun dengan Data Master Global
  const handleSyncAccountsWithMasterData = () => {
    try {
      let updatedSchools = [...schools];
      let updatedUsers = [...userAccounts];
      let updatedRombels = [...rombels];
      let updatedStudents = [...students];
      let syncCount = 0;

      // 1. Hubungkan / perbarui Master Satuan Pendidikan ke Akun Pengguna
      updatedSchools = updatedSchools.map((sch) => {
        let schAdmin = updatedUsers.find(
          (u) =>
            u.role === 'SCHOOL_ADMIN' &&
            (u.schoolId === sch.id ||
              (sch.adminUsername && u.username.toLowerCase() === sch.adminUsername.toLowerCase()) ||
              u.schoolName?.toLowerCase() === sch.name.toLowerCase())
        );

        if (schAdmin) {
          if (schAdmin.schoolId !== sch.id || schAdmin.schoolName !== sch.name) {
            schAdmin = { ...schAdmin, schoolId: sch.id, schoolName: sch.name };
            updatedUsers = updatedUsers.map((u) => (u.id === schAdmin!.id ? schAdmin! : u));
            syncCount++;
          }
          return {
            ...sch,
            adminName: schAdmin.name || sch.adminName,
            adminUsername: schAdmin.username || sch.adminUsername,
            adminEmail: schAdmin.email || sch.adminEmail,
          };
        } else if (sch.adminUsername && sch.adminUsername.trim()) {
          const cleanUser = sch.adminUsername.trim().toLowerCase();
          // Jika username sudah pernah dihapus permanen oleh Super Admin, jangan buat akun baru
          if (isUserDeleted(undefined, cleanUser)) {
            return {
              ...sch,
              adminUsername: '',
              adminName: '',
              adminEmail: '',
            };
          }
          const newAdmin: UserPersona = {
            id: `usr-admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: sch.adminName || `Admin ${sch.name}`,
            role: 'SCHOOL_ADMIN',
            title: `Administrator SIM ${sch.name}`,
            avatar: '💻',
            schoolId: sch.id,
            schoolName: sch.name,
            identifierLabel: 'NIP / ID Admin',
            identifierValue: `ADM-${sch.npsn}`,
            username: cleanUser,
            email: `${cleanUser}@sekolah.sch.id`,
            accountStatus: 'MANDIRI_TERVERIFIKASI',
            authChannel: 'MANDIRI_INTERNAL',
            authProviderLabel: `Autentikasi Mandiri SIM ${sch.name}`,
            securityLevel: 'Operator Satuan Pendidikan (Dikelola Super Admin)',
            managedBy: 'Super Administrator SI-7KAIH Pusat',
            createdDate: new Date().toISOString().split('T')[0],
          };
          updatedUsers.push(newAdmin);
          syncCount++;
        }
        return sch;
      });

      // 2. Hitung statistik riil per sekolah
      updatedSchools = updatedSchools.map((sch) => {
        const schoolStudents = updatedStudents.filter(
          (std) => std.schoolId === sch.id || std.schoolName?.toLowerCase() === sch.name.toLowerCase()
        );
        const schoolRombels = updatedRombels.filter(
          (r) => r.schoolId === sch.id || r.schoolName?.toLowerCase() === sch.name.toLowerCase()
        );
        const schoolTeachers = updatedUsers.filter(
          (u) => u.role === 'TEACHER' && (u.schoolId === sch.id || u.schoolName?.toLowerCase() === sch.name.toLowerCase())
        );
        return {
          ...sch,
          totalStudents: schoolStudents.length > 0 ? schoolStudents.length : sch.totalStudents,
          totalClasses: schoolRombels.length > 0 ? schoolRombels.length : sch.totalClasses,
          totalTeachers: schoolTeachers.length > 0 ? schoolTeachers.length : sch.totalTeachers,
        };
      });

      // 3. Sinkronisasi Guru ke Rombel
      updatedUsers
        .filter((u) => u.role === 'TEACHER' && u.className)
        .forEach((t) => {
          updatedRombels = updatedRombels.map((r) => {
            const matchSchool = !r.schoolId || !t.schoolId || r.schoolId === t.schoolId;
            if (matchSchool && r.name.toLowerCase() === (t.className || '').toLowerCase()) {
              if (!r.teacher || r.teacher === '-') {
                syncCount++;
                return {
                  ...r,
                  teacher: t.name,
                  teacherNip: t.identifierValue || t.nip || r.teacherNip,
                  schoolId: t.schoolId || r.schoolId,
                  schoolName: t.schoolName || r.schoolName,
                };
              }
            }
            return r;
          });
        });

      // 4. Sinkronisasi Siswa ke Master Siswa
      updatedUsers
        .filter((u) => u.role === 'STUDENT')
        .forEach((sUser) => {
          const matchingStudent = updatedStudents.find(
            (std) => (sUser.identifierValue && std.nisn === sUser.identifierValue) || std.username === sUser.username
          );
          if (!matchingStudent) {
            const newStudent: Student = {
              id: `std-${sUser.id}`,
              nisn: sUser.identifierValue || `0123${Math.floor(100000 + Math.random() * 900000)}`,
              name: sUser.name,
              className: sUser.className || 'Kelas 7-A',
              schoolId: sUser.schoolId,
              schoolName: sUser.schoolName || 'Satuan Pendidikan',
              gender: 'L',
              parentName: `Orang Tua (${sUser.name})`,
              parentPhone: '-',
              status: 'AKTIF',
              source: 'INPUT_MANUAL',
              createdAt: new Date().toISOString().split('T')[0],
              username: sUser.username,
            };
            updatedStudents.push(newStudent);
            syncCount++;
          }
        });

      updateSchools(updatedSchools);
      updateUsers(updatedUsers);
      updateRombels(updatedRombels);
      updateStudents(updatedStudents);

      showToast(
        `Sinkronisasi Master Data Sukses! ${updatedUsers.length} akun terhubung ke ${updatedSchools.length} sekolah, ${updatedRombels.length} rombel, dan ${updatedStudents.length} siswa.`
      );
    } catch (err: any) {
      showToast('Gagal melakukan sinkronisasi master data: ' + (err?.message || 'Kesalahan sistem'));
    }
  };

  const handleSaveAdminAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFormName.trim() || !adminFormUsername.trim()) {
      showToast('Nama dan Username Pengguna wajib diisi!');
      return;
    }

    const assignedSchool = schools.find((s) => s.id === adminFormSchool) || schools[0];
    const schoolName = assignedSchool?.name || 'Satuan Pendidikan';
    const schoolId = assignedSchool?.id || adminFormSchool || 'sch-default';
    const roleTitles: Record<UserRole, string> = {
      STUDENT: `Siswa ${adminFormClassName || 'Fase D'}`,
      PARENT: 'Orang Tua / Wali Murid',
      TEACHER: `Guru / Wali ${adminFormClassName || 'Kelas'}`,
      PRINCIPAL: `Kepala ${schoolName}`,
      SUPERVISOR: 'Pengawas Pembina',
      SCHOOL_ADMIN: `Administrator SIM ${schoolName}`,
      SUPER_ADMIN: 'Super Administrator',
    };

    const roleAvatars: Record<UserRole, string> = {
      STUDENT: '🎓',
      PARENT: '👨‍👩‍👧',
      TEACHER: '👨‍🏫',
      PRINCIPAL: '👨‍💼',
      SUPERVISOR: '📋',
      SCHOOL_ADMIN: '💻',
      SUPER_ADMIN: '🛡️',
    };

    const cleanUsername = adminFormUsername.trim().toLowerCase();
    const cleanName = adminFormName.trim();
    const cleanEmail =
      adminFormEmail.trim() ||
      `${cleanUsername}@${assignedSchool.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')}.sch.id`;

    if (editingUser) {
      // EDIT MODE: Update existing persona
      const finalPass = adminFormPassword.trim() || editingUser.passwordHash || '123456';
      const updatedUser: UserPersona = {
        ...editingUser,
        name: cleanName,
        role: adminFormRole,
        title: roleTitles[adminFormRole] || `Pengguna ${schoolName}`,
        avatar: roleAvatars[adminFormRole] || editingUser.avatar || '👤',
        schoolId: schoolId,
        schoolName: schoolName,
        className: adminFormClassName.trim() || undefined,
        identifierLabel:
          adminFormRole === 'STUDENT'
            ? 'NISN'
            : adminFormRole === 'PARENT'
            ? 'NIK Wali'
            : adminFormRole === 'SCHOOL_ADMIN'
            ? 'NIP Operator'
            : 'NIP / NUPTK',
        identifierValue: adminFormNip.trim() || editingUser.identifierValue,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: finalPass,
      };

      setUserPassword(updatedUser.id, finalPass, [
        updatedUser.username,
        updatedUser.identifierValue,
        updatedUser.email,
        updatedUser.childNisn,
      ]);

      unmarkUserAsDeleted(updatedUser.id, updatedUser.username);
      const updatedUsersList = userAccounts.map((u) => (u.id === editingUser.id ? updatedUser : u));
      updateUsers(updatedUsersList);

      // Sinkronisasi ke Master Satuan Pendidikan jika akun adalah Admin atau Kepala Sekolah
      if (adminFormRole === 'SCHOOL_ADMIN') {
        const updatedSchools = schools.map((s) =>
          s.id === schoolId
            ? {
                ...s,
                adminName: cleanName,
                adminUsername: cleanUsername,
                adminEmail: cleanEmail,
              }
            : s
        );
        updateSchools(updatedSchools);
      } else if (adminFormRole === 'PRINCIPAL') {
        const updatedSchools = schools.map((s) =>
          s.id === schoolId
            ? {
                ...s,
                principalName: cleanName,
                principalNip: adminFormNip.trim() || s.principalNip,
              }
            : s
        );
        updateSchools(updatedSchools);
      } else if (adminFormRole === 'TEACHER' && adminFormClassName.trim()) {
        const updatedRombels = rombels.map((r) =>
          (r.schoolId === schoolId || r.schoolName?.toLowerCase() === schoolName.toLowerCase()) &&
          r.name.toLowerCase() === adminFormClassName.trim().toLowerCase()
            ? {
                ...r,
                teacher: cleanName,
                teacherNip: adminFormNip.trim() || r.teacherNip,
              }
            : r
        );
        updateRombels(updatedRombels);
      } else if (adminFormRole === 'STUDENT') {
        const updatedStudents = students.map((std) =>
          std.username === editingUser.username || (adminFormNip && std.nisn === adminFormNip.trim())
            ? {
                ...std,
                name: cleanName,
                className: adminFormClassName.trim() || std.className,
                schoolId: schoolId,
                schoolName: schoolName,
                username: cleanUsername,
              }
            : std
        );
        updateStudents(updatedStudents);
      }

      setIsAddAdminModalOpen(false);
      setEditingUser(null);
      setSelectedExistingPersonSuper('');
      showToast(
        `Perubahan akun ${updatedUser.name} (${updatedUser.role}) berhasil disimpan & disinkronkan ke Master Data!`
      );
    } else {
      // CREATE MODE: Create new persona and connect to master data
      const newAccount: UserPersona = {
        id: `usr-${adminFormRole.toLowerCase()}-${Date.now()}`,
        name: cleanName,
        role: adminFormRole,
        title: roleTitles[adminFormRole] || `Pengguna ${schoolName}`,
        avatar: roleAvatars[adminFormRole] || '👤',
        schoolId: schoolId,
        schoolName: schoolName,
        className: adminFormClassName.trim() || undefined,
        identifierLabel:
          adminFormRole === 'STUDENT'
            ? 'NISN'
            : adminFormRole === 'PARENT'
            ? 'NIK Wali'
            : adminFormRole === 'SCHOOL_ADMIN'
            ? 'NIP Operator'
            : 'NIP / NUPTK',
        identifierValue:
          adminFormNip.trim() ||
          (adminFormRole === 'STUDENT'
            ? `0123${Math.floor(100000 + Math.random() * 900000)}`
            : `199${Math.floor(1000000000000 + Math.random() * 900000000000)}`),
        username: cleanUsername,
        email: cleanEmail,
        accountStatus: 'MANDIRI_TERVERIFIKASI',
        authChannel: 'MANDIRI_INTERNAL',
        authProviderLabel: `Autentikasi Mandiri SIM ${assignedSchool.name}`,
        securityLevel:
          adminFormRole === 'SCHOOL_ADMIN'
            ? 'Administrator Satuan Pendidikan (Dikelola Super Admin)'
            : adminFormRole === 'TEACHER'
            ? 'Pendidik / Wali Kelas (Akun Mandiri Terverifikasi)'
            : adminFormRole === 'STUDENT'
            ? 'Peserta Didik (Akun Mandiri Terdaftar)'
            : 'Pengguna Satuan Pendidikan',
        managedBy: 'Super Administrator SI-7KAIH Pusat',
        createdDate: new Date().toISOString().split('T')[0],
        passwordHash: adminFormPassword.trim() || '123456',
      };

      const finalNewPass = newAccount.passwordHash || '123456';
      setUserPassword(newAccount.id, finalNewPass, [
        newAccount.username,
        newAccount.identifierValue,
        newAccount.email,
        newAccount.childNisn,
      ]);

      unmarkUserAsDeleted(newAccount.id, newAccount.username);
      updateUsers([...userAccounts, newAccount]);

      // Sinkronisasi otomatis ke Data Master Global
      if (adminFormRole === 'SCHOOL_ADMIN') {
        const updatedSchools = schools.map((s) =>
          s.id === schoolId
            ? {
                ...s,
                adminName: cleanName,
                adminUsername: cleanUsername,
                adminEmail: cleanEmail,
              }
            : s
        );
        updateSchools(updatedSchools);
      } else if (adminFormRole === 'PRINCIPAL') {
        const updatedSchools = schools.map((s) =>
          s.id === schoolId
            ? {
                ...s,
                principalName: cleanName,
                principalNip: adminFormNip.trim() || s.principalNip,
              }
            : s
        );
        updateSchools(updatedSchools);
      } else if (adminFormRole === 'TEACHER' && adminFormClassName.trim()) {
        const updatedRombels = rombels.map((r) =>
          (r.schoolId === schoolId || r.schoolName?.toLowerCase() === schoolName.toLowerCase()) &&
          r.name.toLowerCase() === adminFormClassName.trim().toLowerCase()
            ? {
                ...r,
                teacher: cleanName,
                teacherNip: adminFormNip.trim() || r.teacherNip,
              }
            : r
        );
        updateRombels(updatedRombels);
      } else if (adminFormRole === 'STUDENT') {
        const alreadyInStudents = students.some(
          (std) => std.nisn === newAccount.identifierValue || std.username === cleanUsername
        );
        if (!alreadyInStudents) {
          const newStudentRec: Student = {
            id: `std-${newAccount.id}`,
            nisn: newAccount.identifierValue || `0123${Date.now().toString().slice(-6)}`,
            name: cleanName,
            className: adminFormClassName.trim() || 'Kelas 7-A',
            schoolId: schoolId,
            schoolName: schoolName,
            gender: 'L',
            parentName: `Orang Tua (${cleanName})`,
            parentPhone: '-',
            status: 'AKTIF',
            source: 'INPUT_MANUAL',
            createdAt: new Date().toISOString().split('T')[0],
            username: cleanUsername,
          };
          updateStudents([...students, newStudentRec]);
        }
      }

      setIsAddAdminModalOpen(false);
      setSelectedExistingPersonSuper('');
      showToast(
        `Akun ${newAccount.name} (${newAccount.role} - ${newAccount.username}) untuk ${assignedSchool.name} berhasil diterbitkan & terhubung ke Data Master Global!`
      );
    }
  };

  // Edit Habit Master Actions
  const handleOpenEditHabit = (h: HabitMaster) => {
    setEditingHabit(h);
    setHabitFormTarget(h.targetDescription);
    setHabitFormDesc(h.description);
    setIsHabitModalOpen(true);
  };

  const handleSaveHabitMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit) return;

    const updated = {
      ...habitMasters,
      [editingHabit.code]: {
        ...editingHabit,
        targetDescription: habitFormTarget.trim() || editingHabit.targetDescription,
        description: habitFormDesc.trim() || editingHabit.description,
      },
    };
    updateHabits(updated);
    setIsHabitModalOpen(false);
    showToast(`Master Standar Kebiasaan "${editingHabit.name}" berhasil diperbarui!`);
  };

  // Toggle User Status
  const handleToggleUserStatus = (userId: string) => {
    const updated = userAccounts.map((u) => {
      if (u.id === userId) {
        const nextStatus =
          u.accountStatus === 'MANDIRI_AKTIF' || u.accountStatus === 'MANDIRI_TERVERIFIKASI'
            ? ('MANDIRI_NONAKTIF' as const)
            : ('MANDIRI_AKTIF' as const);
        return { ...u, accountStatus: nextStatus };
      }
      return u;
    });
    updateUsers(updated);
    showToast('Status akun pengguna berhasil diperbarui.');
  };

  // Fetch Audit Logs
  const fetchAuditLogs = () => {
    setIsLogsLoading(true);
    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(() => {})
      .finally(() => setIsLogsLoading(false));
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Filtered lists
  const filteredSchools = schools.filter((s) => {
    if (schoolJenjangFilter !== 'ALL' && s.jenjang !== schoolJenjangFilter) return false;
    if (schoolStatusFilter !== 'ALL' && s.status !== schoolStatusFilter) return false;
    return (
      s.name.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
      s.npsn.includes(schoolSearchQuery) ||
      s.principalName.toLowerCase().includes(schoolSearchQuery.toLowerCase())
    );
  });

  const filteredUsers = userAccounts.filter((u) => {
    if (!u) return false;
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase().trim();
      const name = (u.name || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      const idVal = (u.identifierValue || '').toLowerCase();
      const school = (u.schoolName || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const className = (u.className || '').toLowerCase();
      return (
        name.includes(q) ||
        username.includes(q) ||
        idVal.includes(q) ||
        school.includes(q) ||
        email.includes(q) ||
        className.includes(q)
      );
    }
    return true;
  });

  const userCountsByRole = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: userAccounts.length,
      SCHOOL_ADMIN: 0,
      TEACHER: 0,
      STUDENT: 0,
      PARENT: 0,
      PRINCIPAL: 0,
      SUPERVISOR: 0,
      SUPER_ADMIN: 0,
    };
    userAccounts.forEach((u) => {
      if (u && u.role && counts[u.role] !== undefined) {
        counts[u.role]++;
      }
    });
    return counts;
  }, [userAccounts]);

  const schoolAdminUsers = userAccounts.filter((u) => u && u.role === 'SCHOOL_ADMIN');

  return (
    <div className="space-y-6">
      {/* 1. Super Admin Institutional Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-[#0753A5] text-white p-6 sm:p-7 rounded-3xl shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider">
                  Super Administrator SIM-7KAIH Pusat
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  Otoritas Penuh Sistem
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Konsol Super Admin & Pengendalian Master Data Nasional
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-3xl leading-relaxed">
                Wewenang tertinggi untuk mengakses seluruh fitur, mengelola master 7 kebiasaan, satuan pendidikan, rombel, peserta didik, serta menerbitkan dan mengatur akun <strong>Administrator Sekolah</strong>.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="btn-banner-sync-all-devices"
              onClick={handleManualSyncMaster}
              disabled={isSyncingMaster}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 border border-emerald-400/40 shadow-md transition-colors cursor-pointer"
              title="Kirim dan sinkronkan data master ke seluruh perangkat yang terhubung secara realtime"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingMaster ? 'animate-spin' : ''}`} />
              <span>{isSyncingMaster ? 'Menyinkronkan...' : 'Singkronkan ke Semua Perangkat'}</span>
            </button>
            <button
              id="btn-banner-super-profile"
              onClick={() => setActiveTab('PROFILE')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 border border-purple-400/30 shadow-md transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>👤 Profil Super Admin (Edit Mandiri)</span>
            </button>
            <button
              onClick={handleOpenAddAdmin}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Akun Admin Sekolah</span>
            </button>
            <button
              onClick={handleOpenAddSchool}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>+ Tambah Satuan Pendidikan</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-blue-200 font-semibold">Satuan Pendidikan</p>
            <p className="text-xl font-black text-white mt-0.5">{schools.length} Sekolah</p>
            <p className="text-[10px] text-emerald-300 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              100% Terdaftar SIM
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-blue-200 font-semibold">Akun Admin Sekolah</p>
            <p className="text-xl font-black text-amber-300 mt-0.5">{schoolAdminUsers.length} Akun Aktif</p>
            <p className="text-[10px] text-blue-200 mt-0.5">Operator Berlisensi</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-blue-200 font-semibold">Total Peserta Didik</p>
            <p className="text-xl font-black text-white mt-0.5">{students.length} Siswa</p>
            <p className="text-[10px] text-emerald-300 mt-0.5">{rombels.length} Rombel Lintas Kelas</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-blue-200 font-semibold">Kepatuhan UU PDP & RLS</p>
            <p className="text-xl font-black text-emerald-300 mt-0.5">100% Terpenuhi</p>
            <p className="text-[10px] text-blue-200 mt-0.5">Isolasi Mandiri Berlaku</p>
          </div>
        </div>
      </div>

      {/* 2. Super Admin Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 text-xs font-bold overflow-x-auto scrollbar-none bg-white p-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'bg-[#0753A5] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Ringkasan Eksekutif</span>
        </button>

        <button
          onClick={() => setActiveTab('MASTER_DATA')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'MASTER_DATA'
              ? 'bg-[#0753A5] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Master Data Global (Semua Data)</span>
        </button>

        <button
          onClick={() => setActiveTab('ALL_FEATURES')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'ALL_FEATURES'
              ? 'bg-[#0753A5] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Akses Semua Fitur Peran</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'USERS'
              ? 'bg-[#0753A5] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Akun Admin Sekolah & Pengguna ({userAccounts.length})</span>
        </button>

        <button
          id="tab-super-profile"
          onClick={() => setActiveTab('PROFILE')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'PROFILE'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-purple-900 hover:bg-purple-50 font-bold'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Profil Super Admin (Mandiri)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'AUDIT'
              ? 'bg-[#0753A5] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Log Audit & Integritas</span>
        </button>

        <button
          id="tab-super-logout"
          onClick={() => {
            setActiveTab('SETTINGS');
            setSettingsSubTab('LOGOUT');
          }}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'SETTINGS' && settingsSubTab === 'LOGOUT'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Pengaturan Selesai Sesi (Logout)</span>
        </button>

        <button
          id="tab-super-role-prefs"
          onClick={() => {
            setActiveTab('SETTINGS');
            setSettingsSubTab('ROLE_PREFERENCES');
          }}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'SETTINGS' && settingsSubTab === 'ROLE_PREFERENCES'
              ? 'bg-[#0753A5] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Preferensi Operasional Peran</span>
        </button>

        <button
          id="tab-super-guardrails"
          onClick={() => {
            setActiveTab('SETTINGS');
            setSettingsSubTab('GUARDRAILS');
          }}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'SETTINGS' && settingsSubTab === 'GUARDRAILS'
              ? 'bg-[#0753A5] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Guardrails AI & Sistem</span>
        </button>
      </div>

      {/* 3. TAB: OVERVIEW (RINGKASAN EKSEKUTIF) */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Quick Nav Cards to Core Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0753A5] flex items-center justify-center mb-3">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Kelola Semua Master Data</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Akses penuh ke Master 7 Kebiasaan, Satuan Pendidikan, Rombel, dan Siswa tanpa batas.
              </p>
              <button
                onClick={() => setActiveTab('MASTER_DATA')}
                className="mt-3 text-xs font-bold text-[#0753A5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Master Data</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Kelola Akun Admin Sekolah</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tersedia {schoolAdminUsers.length} akun Admin Sekolah. Anda dapat menambah akun baru untuk sekolah mana pun.
              </p>
              <button
                onClick={() => {
                  setActiveTab('USERS');
                  setUserRoleFilter('SCHOOL_ADMIN');
                }}
                className="mt-3 text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola Admin Sekolah</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Akses Langsung Semua Fitur</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Jalankan atau tinjau langsung fitur Siswa, Orang Tua, Guru, Kepala Sekolah, dan Pengawas.
              </p>
              <button
                onClick={() => setActiveTab('ALL_FEATURES')}
                className="mt-3 text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Hub Fitur</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-rose-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3">
                <LogOut className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pengaturan Tombol Selesai Sesi (Logout)</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Atur kebijakan logout, auto-logout inaktivitas 5 menit akun murid & orang tua, modal konfirmasi, dan audit log sesi.
              </p>
              <button
                id="btn-overview-open-logout"
                onClick={() => {
                  setActiveTab('SETTINGS');
                  setSettingsSubTab('LOGOUT');
                }}
                className="mt-3 text-xs font-bold text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola Pengaturan Sesi & Logout</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-sky-200 shadow-xs hover:border-sky-400 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Preferensi Operasional Peran</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Konfigurasi terpusat jam bangun/baca siswa, jadwal validasi guru, pengingat orang tua, dan aturan sekolah.
              </p>
              <button
                id="btn-overview-open-role-prefs"
                onClick={() => {
                  setActiveTab('SETTINGS');
                  setSettingsSubTab('ROLE_PREFERENCES');
                }}
                className="mt-3 text-xs font-bold text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola Preferensi Peran</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-purple-200 shadow-xs hover:border-purple-400 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Profil Super Admin Mandiri</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ubah nama resmi, gelar, NIP, unit kerja, username, kata sandi mandiri, serta KTA digital resmi.
              </p>
              <button
                id="btn-overview-open-profile"
                onClick={() => setActiveTab('PROFILE')}
                className="mt-3 text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Edit Profil Saya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Master Satuan Pendidikan Overview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Daftar Satuan Pendidikan di SIM Nasional</h3>
                <p className="text-xs text-slate-500">
                  Data sekolah terdaftar, kuota siswa, dan akun Administrator Sekolah yang bertugas
                </p>
              </div>
              <button
                onClick={handleOpenAddSchool}
                className="px-3.5 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Sekolah</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                    <th className="p-3">NPSN</th>
                    <th className="p-3">Nama Satuan Pendidikan</th>
                    <th className="p-3">Status / Akreditasi</th>
                    <th className="p-3">Kepala Sekolah</th>
                    <th className="p-3">Admin Sekolah Bertugas</th>
                    <th className="p-3">Siswa & Rombel</th>
                    <th className="p-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schools.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <span className="text-2xl">🏫</span>
                          <span className="font-semibold text-slate-600">Belum ada data satuan pendidikan terdaftar.</span>
                          <span className="text-xs text-slate-400">Silakan klik tombol &quot;Tambah Sekolah&quot; untuk menambahkan satuan pendidikan baru.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    schools.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-700">{sch.npsn}</td>
                      <td className="p-3 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#0753A5]" />
                          <span>{sch.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-normal">{sch.address}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            sch.jenjang === 'SMP'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : sch.jenjang === 'SD'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {sch.jenjang || 'SD'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            sch.status === 'NEGERI'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {sch.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
                            Akreditasi {sch.akreditasi}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-700">{sch.principalName}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-bold text-slate-800">{sch.adminName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">@{sch.adminUsername}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-600">
                        {sch.totalStudents > 0 ? `${sch.totalStudents} Siswa` : `${students.length} Siswa`} • {sch.totalClasses > 0 ? `${sch.totalClasses} Kelas` : `${rombels.length} Kelas`}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpenEditSchool(sch)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0753A5] hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Ubah Data Sekolah"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: MASTER DATA GLOBAL */}
      {activeTab === 'MASTER_DATA' && (
        <div className="space-y-6">
          {/* Master Subtab Bar */}
          <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setMasterSubTab('HABITS')}
              className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                masterSubTab === 'HABITS'
                  ? 'border-b-2 border-[#0753A5] text-[#0753A5]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Master 7 Kebiasaan (7KAIH)</span>
            </button>
            <button
              onClick={() => setMasterSubTab('SCHOOLS')}
              className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                masterSubTab === 'SCHOOLS'
                  ? 'border-b-2 border-[#0753A5] text-[#0753A5]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Master Satuan Pendidikan ({schools.length})</span>
            </button>
            <button
              onClick={() => setMasterSubTab('ROMBELS')}
              className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                masterSubTab === 'ROMBELS'
                  ? 'border-b-2 border-[#0753A5] text-[#0753A5]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Master Rombongan Belajar ({rombels.length})</span>
            </button>
            <button
              onClick={() => setMasterSubTab('STUDENTS')}
              className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                masterSubTab === 'STUDENTS'
                  ? 'border-b-2 border-[#0753A5] text-[#0753A5]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Master Peserta Didik ({students.length})</span>
            </button>
            <button
              onClick={() => setMasterSubTab('ACCOUNTS')}
              className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                masterSubTab === 'ACCOUNTS'
                  ? 'border-b-2 border-[#0753A5] text-[#0753A5]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Master Akun & Hak Akses ({userAccounts.length})</span>
            </button>
          </div>

          {/* Subtab 1: HABIT MASTERS */}
          {masterSubTab === 'HABITS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Standar Master 7 Kebiasaan Anak Indonesia Hebat (7KAIH)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Konfigurasi parameter, target capaian, dan pedoman resmi pembiasaan nasional
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0753A5] font-bold text-xs border border-blue-200">
                    Kepmendikdasmen No. 7/2025
                  </span>
                  <button
                    onClick={handleResetHabitMasters}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Reset Master 7KAIH ke Standar Baku Nasional"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Standar Baku</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.values(habitMasters) as HabitMaster[]).map((h) => (
                  <div
                    key={h.code}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-[#0753A5] flex items-center justify-center font-black">
                          {h.displayOrder}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{h.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400">{h.code}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenEditHabit(h)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0753A5] hover:bg-blue-100/60 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Ubah Standar</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{h.description}</p>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Target Capaian Operasional
                      </span>
                      <p className="text-slate-800 font-medium">{h.targetDescription}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab 2: SCHOOL MASTERS */}
          {masterSubTab === 'SCHOOLS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={schoolSearchQuery}
                      onChange={(e) => setSchoolSearchQuery(e.target.value)}
                      placeholder="Cari NPSN, nama sekolah, kepala sekolah..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    />
                  </div>

                  {/* Filter Jenjang (SMP, SD, dll) */}
                  <select
                    value={schoolJenjangFilter}
                    onChange={(e) => setSchoolJenjangFilter(e.target.value)}
                    className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                  >
                    <option value="ALL">Semua Jenjang ({schools.length})</option>
                    <option value="SMP">Jenjang SMP ({schools.filter(s => s.jenjang === 'SMP').length})</option>
                    <option value="SD">Jenjang SD ({schools.filter(s => s.jenjang === 'SD').length})</option>
                    <option value="MTS">Jenjang MTS ({schools.filter(s => s.jenjang === 'MTS').length})</option>
                    <option value="MI">Jenjang MI ({schools.filter(s => s.jenjang === 'MI').length})</option>
                    <option value="SMA">Jenjang SMA ({schools.filter(s => s.jenjang === 'SMA').length})</option>
                    <option value="SMK">Jenjang SMK ({schools.filter(s => s.jenjang === 'SMK').length})</option>
                  </select>

                  {/* Filter Status (Negeri, Swasta) */}
                  <select
                    value={schoolStatusFilter}
                    onChange={(e) => setSchoolStatusFilter(e.target.value)}
                    className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="NEGERI">Status Negeri ({schools.filter(s => s.status === 'NEGERI').length})</option>
                    <option value="SWASTA">Status Swasta ({schools.filter(s => s.status === 'SWASTA').length})</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    {filteredSchools.length} dari {schools.length} Satuan
                  </span>
                  <button
                    onClick={handleResetSchools}
                    className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Reset Master Satuan Pendidikan ke Data Bawaan"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Master</span>
                  </button>
                  <button
                    onClick={handleOpenAddSchool}
                    className="px-3.5 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Satuan Pendidikan</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                      <th className="p-3">NPSN</th>
                      <th className="p-3">Satuan Pendidikan</th>
                      <th className="p-3">Jenjang & Status</th>
                      <th className="p-3">Kepala Sekolah</th>
                      <th className="p-3">Administrator Ditugaskan</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSchools.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          Tidak ada satuan pendidikan yang sesuai dengan filter jenjang atau pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredSchools.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-700">{s.npsn}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{s.city || s.district || s.address}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                s.jenjang === 'SMP'
                                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                                  : s.jenjang === 'SD'
                                  ? 'bg-sky-100 text-sky-800 border-sky-200'
                                  : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                              }`}>
                                {s.jenjang || 'SD'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                s.status === 'NEGERI'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {s.status}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                Akred {s.akreditasi}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 font-medium text-slate-700">{s.principalName}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800">{s.adminName}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">@{s.adminUsername}</span>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditSchool(s)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#0753A5] hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Ubah Satuan Pendidikan"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSchool(s)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Satuan Pendidikan dari Master Global"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 3: ROMBELS */}
          {masterSubTab === 'ROMBELS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Master Rombongan Belajar (Rombel) Lintas Sekolah</h3>
                  <p className="text-xs text-slate-500">Daftar kelas Kurikulum Merdeka, kuota siswa, dan guru wali kelas</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetRombels}
                    className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Reset Master Rombel ke Data Bawaan"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Master</span>
                  </button>
                  <button
                    onClick={downloadRombelTemplateCsv}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Template CSV</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                      <th className="p-3">Kode Rombel</th>
                      <th className="p-3">Nama Rombel</th>
                      <th className="p-3">Tingkat & Fase</th>
                      <th className="p-3">Wali Kelas</th>
                      <th className="p-3">Kapasitas</th>
                      <th className="p-3">Jumlah Siswa</th>
                      <th className="p-3">Tahun Ajaran</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rombels.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                          Belum ada data rombongan belajar mandiri. Silakan gunakan Template CSV atau fitur impor rombel sekolah.
                        </td>
                      </tr>
                    ) : (
                      rombels.map((r) => {
                        const enrolledCount = students.filter((s) => {
                          const matchClass = isSameClass(s.className, r.name);
                          if (!matchClass) return false;
                          if (r.schoolId && s.schoolId) return r.schoolId === s.schoolId;
                          if (r.schoolName && s.schoolName) return isSameSchool(s.schoolName, r.schoolName);
                          return true;
                        }).length;

                        return (
                          <tr key={r.id} className="hover:bg-slate-50/60">
                            <td className="p-3 font-mono font-bold text-slate-700">{r.code}</td>
                            <td className="p-3 font-bold text-slate-900">{r.name}</td>
                            <td className="p-3">{r.phase} (Kelas {r.grade})</td>
                            <td className="p-3 font-medium text-slate-700">{r.teacher}</td>
                            <td className="p-3 font-mono text-slate-700">{r.capacity} Kuota</td>
                            <td className="p-3 font-mono">
                              <button
                                type="button"
                                onClick={() => {
                                  setStudentSearchQuery(r.name);
                                  setMasterSubTab('STUDENTS');
                                }}
                                className="group flex items-center gap-1.5 cursor-pointer text-left hover:underline"
                                title={`Lihat ${enrolledCount} siswa terdaftar untuk rombel ${r.name}`}
                              >
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                                    enrolledCount > 0
                                      ? 'bg-blue-50 text-[#0753A5] border border-blue-200 shadow-2xs'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                                  }`}
                                >
                                  {enrolledCount} Siswa
                                </span>
                                {enrolledCount > 0 && (
                                  <span className="text-[10px] text-slate-400 group-hover:text-[#0753A5]">→</span>
                                )}
                              </button>
                            </td>
                            <td className="p-3">{r.academicYear}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {r.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteRombel(r)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus Rombel dari Master Global"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 4: STUDENTS */}
          {masterSubTab === 'STUDENTS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Cari NISN, nama siswa, atau orang tua..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {selectedStudentIds.size > 0 && (
                    <button
                      onClick={handleOpenDeleteSelectedStudents}
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs animate-in fade-in duration-150"
                      title="Hapus Siswa Terpilih"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Terpilih ({selectedStudentIds.size})</span>
                    </button>
                  )}
                  <button
                    onClick={handleResetStudents}
                    className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Reset Master Siswa ke Data Bawaan"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Master</span>
                  </button>
                  <button
                    onClick={downloadStudentTemplateCsv}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Template CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      setImportModalTab('STUDENTS');
                      setIsImportModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Impor CSV</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                      <th className="p-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            students.length > 0 &&
                            students
                              .filter((s) =>
                                s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                                s.nisn.includes(studentSearchQuery)
                              )
                              .every((s) => selectedStudentIds.has(s.id))
                          }
                          onChange={(e) => {
                            const filtered = students.filter(
                              (s) =>
                                s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                                s.nisn.includes(studentSearchQuery)
                            );
                            if (e.target.checked) {
                              setSelectedStudentIds(new Set(filtered.map((s) => s.id)));
                            } else {
                              setSelectedStudentIds(new Set());
                            }
                          }}
                          className="rounded text-[#0753A5] focus:ring-0 cursor-pointer"
                          aria-label="Pilih semua siswa"
                        />
                      </th>
                      <th className="p-3">NISN</th>
                      <th className="p-3">Nama Peserta Didik</th>
                      <th className="p-3">L/P</th>
                      <th className="p-3">Rombel</th>
                      <th className="p-3">Orang Tua / Wali</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                          Belum ada data peserta didik mandiri. Silakan gunakan tombol Impor Siswa atau Template CSV untuk mengisi master data.
                        </td>
                      </tr>
                    ) : (
                      students
                        .filter((s) =>
                          s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                          s.nisn.includes(studentSearchQuery)
                        )
                        .slice(0, 30)
                        .map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/60">
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.has(s.id)}
                                onChange={(e) => {
                                  const next = new Set(selectedStudentIds);
                                  if (e.target.checked) next.add(s.id);
                                  else next.delete(s.id);
                                  setSelectedStudentIds(next);
                                }}
                                className="rounded text-[#0753A5] focus:ring-0 cursor-pointer"
                                aria-label={`Pilih ${s.name}`}
                              />
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-700">{s.nisn}</td>
                            <td className="p-3 font-bold text-slate-900">{s.name}</td>
                            <td className="p-3">{s.gender}</td>
                            <td className="p-3">{s.className}</td>
                            <td className="p-3 font-medium text-slate-700">{s.parentName}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {s.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleOpenDeleteStudent(s)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus Siswa dari Master Global"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 5: ACCOUNTS */}
          {masterSubTab === 'ACCOUNTS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Manajemen Akun & Otoritas Seluruh Pengguna</h3>
                    <p className="text-xs text-slate-500">Daftar kredensial mandiri, reset status, dan penambahan akun Admin Sekolah</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncAccountsWithMasterData}
                    className="px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#0753A5] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Sinkronkan seluruh akun administrator dan pengguna dengan data master satuan pendidikan, rombel, dan siswa"
                  >
                    <Link2 className="w-3.5 h-3.5 text-[#0753A5]" />
                    <span>Sinkronkan ke Master Data</span>
                  </button>
                  <button
                    onClick={handleResetUsers}
                    className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Reset Master Akun & Hak Akses ke Pengaturan Bawaan"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Master</span>
                  </button>
                  <button
                    onClick={handleOpenAddAdmin}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Tambah Akun Pengguna / Admin</span>
                  </button>
                </div>
              </div>

              {/* Filter by Role */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {['ALL', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER', 'PRINCIPAL', 'SUPERVISOR', 'STUDENT', 'PARENT'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      userRoleFilter === r
                        ? 'bg-[#0753A5] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r === 'ALL' ? 'Semua Peran' : r === 'SCHOOL_ADMIN' ? '★ Admin Sekolah' : r}
                  </button>
                ))}
              </div>

              {/* Bulk Actions Banner if users are selected */}
              {selectedUserIds.size > 0 && (
                <div className="flex items-center justify-between p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{selectedUserIds.size} akun pengguna dipilih untuk penghapusan permanen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUserIds(new Set())}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      Batalkan Pilihan
                    </button>
                    <button
                      id="btn-bulk-delete-master-users"
                      onClick={handleOpenDeleteSelectedUsers}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Permanen {selectedUserIds.size} Akun Terpilih</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            filteredUsers.length > 0 &&
                            filteredUsers
                              .filter(
                                (u) =>
                                  u.id !== currentPersona?.id &&
                                  (u.role !== 'SUPER_ADMIN' ||
                                    userAccounts.filter((acc) => acc.role === 'SUPER_ADMIN').length > 1)
                              )
                              .every((u) => selectedUserIds.has(u.id))
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              const selectable = filteredUsers
                                .filter(
                                  (u) =>
                                    u.id !== currentPersona?.id &&
                                    (u.role !== 'SUPER_ADMIN' ||
                                      userAccounts.filter((acc) => acc.role === 'SUPER_ADMIN').length > 1)
                                )
                                .map((u) => u.id);
                              setSelectedUserIds(new Set(selectable));
                            } else {
                              setSelectedUserIds(new Set());
                            }
                          }}
                          className="rounded text-[#0753A5] focus:ring-[#0753A5] cursor-pointer"
                          title="Pilih Semua Akun yang Dapat Dihapus"
                        />
                      </th>
                      <th className="p-3">Pengguna</th>
                      <th className="p-3">Peran / Role</th>
                      <th className="p-3">Username</th>
                      <th className="p-3">Satuan Pendidikan</th>
                      <th className="p-3">Keterhubungan Master Global</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const conn = getMasterConnectionInfo(u);
                      const isProtected =
                        currentPersona?.id === u.id ||
                        (u.role === 'SUPER_ADMIN' &&
                          userAccounts.filter((acc) => acc.role === 'SUPER_ADMIN').length <= 1);

                      return (
                        <tr
                          key={u.id}
                          className={`transition-colors ${
                            selectedUserIds.has(u.id) ? 'bg-rose-50/40' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.has(u.id)}
                              disabled={isProtected}
                              onChange={(e) => {
                                setSelectedUserIds((prev) => {
                                  const next = new Set(prev);
                                  if (e.target.checked) {
                                    next.add(u.id);
                                  } else {
                                    next.delete(u.id);
                                  }
                                  return next;
                                });
                              }}
                              className="rounded text-[#0753A5] focus:ring-[#0753A5] disabled:opacity-30 cursor-pointer"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar avatar={u.avatar} role={u.role} name={u.name} size="sm" />
                              <div>
                                <p className="font-bold text-slate-900">{u.name}</p>
                                <p className="text-[10px] text-slate-400">{u.title}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                u.role === 'SUPER_ADMIN'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                  : u.role === 'SCHOOL_ADMIN'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-800">{u.username}</td>
                          <td className="p-3 text-slate-600">{u.schoolName || 'Pusat Nasional'}</td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border w-fit ${conn.color}`}>
                                <Link2 className="w-3 h-3 shrink-0" />
                                <span>{conn.badge}</span>
                              </span>
                              <span className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[170px]" title={conn.label}>
                                {conn.label}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                u.accountStatus === 'MANDIRI_NONAKTIF'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {u.accountStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="px-2 py-1 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                              title="Edit Akun & Sinkronkan ke Data Master Global"
                            >
                              <Edit3 className="w-3 h-3 text-amber-700" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setUserPassword(u.id, '123456', [u.username, u.identifierValue, u.email, u.childNisn]);
                                const updatedUsers = userAccounts.map((acc) =>
                                  acc.id === u.id
                                    ? { ...acc, passwordHash: '123456', lastUpdated: new Date().toISOString().slice(0, 10) }
                                    : acc
                                );
                                updateUsers(updatedUsers);
                                showToast(`Kata sandi akun ${u.name} (${u.username}) berhasil direset ke 123456 dan disinkronkan ke login.`);
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-50/80 text-amber-800 hover:bg-amber-100 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 border border-amber-200"
                              title="Reset Kata Sandi ke Default (123456) & Sinkronkan ke Sistem Login"
                            >
                              <KeyRound className="w-3 h-3 text-amber-600" />
                              <span>Reset Sandi</span>
                            </button>
                            <button
                              onClick={() => onSelectPersona(u)}
                              className="px-2 py-1 rounded-lg bg-blue-50 text-[#0753A5] hover:bg-blue-100 text-[11px] font-bold cursor-pointer"
                              title="Beralih dan Masuk sebagai Pengguna Ini"
                            >
                              Masuk
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(u.id)}
                              className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px] font-medium cursor-pointer"
                            >
                              {u.accountStatus === 'MANDIRI_NONAKTIF' ? 'Aktifkan' : 'Nonaktifkan'}
                            </button>
                            <button
                              id={`btn-delete-master-user-${u.id}`}
                              onClick={() => handleDeleteUser(u)}
                              disabled={isProtected}
                              className="px-2 py-1 rounded-lg border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 hover:border-rose-300 disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              title={
                                isProtected
                                  ? 'Akun aktif atau Super Admin utama dilindungi dari penghapusan'
                                  : 'Hapus Akun Pengguna Secara Permanen'
                              }
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                              <span>Hapus</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB: AKSES SEMUA FITUR PERAN (OMNI-FEATURE HUB) */}
      {activeTab === 'ALL_FEATURES' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 via-indigo-50 to-blue-50 p-6 rounded-3xl border border-amber-200/80 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                Wewenang Akses Penuh
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Operasional Multi-Peran (Produksi Aktif)
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900">
              Hub Akses Seluruh Fitur Aplikasi SI-7KAIH
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              Sebagai Super Admin, Anda memiliki hak istimewa untuk membuka dan mengoperasikan setiap modul aplikasi. Anda dapat beralih secara langsung ke antarmuka peran manapun di bawah ini atau mencetak dokumen resmi portofolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Feature 1: Siswa */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                    👦
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Modul Siswa
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Fitur Peserta Didik (Siswa)</h4>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  <li>Pencatatan Jurnal Harian 7KAIH (&lt;1 Menit)</li>
                  <li>Kalender Warna Kebiasaan Bulanan</li>
                  <li>Refleksi Bulanan & Target Mandiri</li>
                  <li>Gamifikasi 6 Lencana & AI Coach Ceria</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  const studentPersona = userAccounts.find((u) => u.role === 'STUDENT');
                  if (studentPersona) {
                    onSelectPersona(studentPersona);
                    showToast(`Beralih ke antarmuka Siswa (${studentPersona.name})...`);
                  } else {
                    showToast('Belum ada akun Siswa terdaftar di master data.');
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Buka Antarmuka Siswa</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 2: Orang Tua */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                    👩
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Modul Orang Tua
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Fitur Orang Tua / Wali</h4>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  <li>Validasi Jurnal Harian Anak di Rumah</li>
                  <li>Catatan Apresiasi & Refleksi Orang Tua</li>
                  <li>Tantangan Kebiasaan Bersama Keluarga</li>
                  <li>Kalender Pantau Rutinitas Anak</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  const parentPersona = userAccounts.find((u) => u.role === 'PARENT');
                  if (parentPersona) {
                    onSelectPersona(parentPersona);
                    showToast(`Beralih ke antarmuka Orang Tua (${parentPersona.name})...`);
                  } else {
                    showToast('Belum ada akun Orang Tua terdaftar di master data.');
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Buka Antarmuka Orang Tua</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 3: Guru */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                    👨‍🏫
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Modul Pendidik
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Fitur Guru & Wali Kelas</h4>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  <li>Monitoring 7KAIH Kelas Mandiri</li>
                  <li>Validasi Berkala & Apresiasi Guru</li>
                  <li>Rencana Tindak Lanjut (RTL) Non-Punitive</li>
                  <li>Analisis AI Pola Kebiasaan Kelas</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  const teacherPersona = userAccounts.find((u) => u.role === 'TEACHER');
                  if (teacherPersona) {
                    onSelectPersona(teacherPersona);
                    showToast(`Beralih ke antarmuka Guru (${teacherPersona.name})...`);
                  } else {
                    showToast('Belum ada akun Guru/Wali Kelas terdaftar di master data.');
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Buka Antarmuka Guru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 4: Kepala Sekolah */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                    👩‍💼
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Modul Pimpinan
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Fitur Kepala Sekolah</h4>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  <li>Portofolio 7KAIH Seluruh Satuan Pendidikan</li>
                  <li>Program Pembiasaan Sekolah Terintegrasi</li>
                  <li>RTL Manajerial & Supervisi Guru</li>
                  <li>Analisis AI Strategis Tingkat Sekolah</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  const principalPersona = userAccounts.find((u) => u.role === 'PRINCIPAL');
                  if (principalPersona) {
                    onSelectPersona(principalPersona);
                    showToast(`Beralih ke antarmuka Kepala Sekolah (${principalPersona.name})...`);
                  } else {
                    showToast('Belum ada akun Kepala Sekolah terdaftar di master data.');
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Buka Antarmuka Kepala Sekolah</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 5: Pengawas Pembina */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl">
                    👨‍💼
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                    Modul Pengawas
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Fitur Pengawas Pembina Wilayah</h4>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  <li>Komparasi Portofolio Satuan Pendidikan Binaan</li>
                  <li>Catatan Pengawasan & Apresiasi Sekolah</li>
                  <li>RTL Pembinaan Pengawas Wilayah</li>
                  <li>AI Analysis Rekomendasi Wilayah</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  const supervisorPersona = userAccounts.find((u) => u.role === 'SUPERVISOR');
                  if (supervisorPersona) {
                    onSelectPersona(supervisorPersona);
                    showToast(`Beralih ke antarmuka Pengawas (${supervisorPersona.name})...`);
                  } else {
                    showToast('Belum ada akun Pengawas terdaftar di master data.');
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Buka Antarmuka Pengawas</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 6: Cetak Dokumen Rapor */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                    🖨️
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Modul Pelaporan Resmi
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Dokumen Resmi Portofolio 7KAIH</h4>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  <li>Dokumen Portofolio Resmi Berkop Lambang Garuda</li>
                  <li>Kepatuhan Format Kemendikdasmen No. 7/2025</li>
                  <li>Tanda Tangan Tripartit (Siswa, Wali, Guru)</li>
                  <li>Siap Cetak atau Simpan sebagai PDF</li>
                </ul>
              </div>
              <button
                onClick={onOpenReportModal}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Buka Dokumen Portofolio Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB: AKUN ADMIN SEKOLAH & PENGGUNA (USERS) */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Pengelolaan Akun Administrator Sekolah & Pengguna
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar akun mandiri aktif. Anda dapat menambahkan Administrator Sekolah baru untuk satuan pendidikan terdaftar.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncAccountsWithMasterData}
                  className="px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#0753A5] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Sinkronkan seluruh akun administrator dan pengguna dengan data master satuan pendidikan, rombel, dan siswa"
                >
                  <Link2 className="w-4 h-4 text-[#0753A5]" />
                  <span>Sinkronkan ke Master Data</span>
                </button>
                <button
                  onClick={handleResetUsers}
                  className="px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reset Akun Pengguna ke Pengaturan Bawaan"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Akun</span>
                </button>
                <button
                  onClick={handleOpenAddAdmin}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Tambah Akun Pengguna / Admin</span>
                </button>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Cari nama, username, atau satuan pendidikan..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                <button
                  onClick={() => setUserRoleFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    userRoleFilter === 'ALL'
                      ? 'bg-[#0753A5] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({userCountsByRole.ALL || 0})
                </button>
                <button
                  onClick={() => setUserRoleFilter('SCHOOL_ADMIN')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    userRoleFilter === 'SCHOOL_ADMIN'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  ★ Admin Sekolah ({userCountsByRole.SCHOOL_ADMIN || 0})
                </button>
                <button
                  onClick={() => setUserRoleFilter('TEACHER')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    userRoleFilter === 'TEACHER'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  👨‍🏫 Guru ({userCountsByRole.TEACHER || 0})
                </button>
                <button
                  onClick={() => setUserRoleFilter('STUDENT')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    userRoleFilter === 'STUDENT'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  🎓 Siswa ({userCountsByRole.STUDENT || 0})
                </button>
                <button
                  onClick={() => setUserRoleFilter('PARENT')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    userRoleFilter === 'PARENT'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                  }`}
                >
                  👨‍👩‍👧 Orang Tua ({userCountsByRole.PARENT || 0})
                </button>
                <button
                  onClick={() => setUserRoleFilter('PRINCIPAL')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    userRoleFilter === 'PRINCIPAL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                  }`}
                >
                  👨‍💼 Kepsek ({userCountsByRole.PRINCIPAL || 0})
                </button>
                <button
                  onClick={() => setUserRoleFilter('SUPERVISOR')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    userRoleFilter === 'SUPERVISOR'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
                  }`}
                >
                  📋 Pengawas ({userCountsByRole.SUPERVISOR || 0})
                </button>
                <button
                  onClick={() => setUserRoleFilter('SUPER_ADMIN')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    userRoleFilter === 'SUPER_ADMIN'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  🛡️ Super Admin ({userCountsByRole.SUPER_ADMIN || 0})
                </button>
              </div>
            </div>

            {/* Bulk Actions Banner if users are selected */}
            {selectedUserIds.size > 0 && (
              <div className="flex items-center justify-between p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{selectedUserIds.size} akun pengguna dipilih untuk penghapusan permanen</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedUserIds(new Set())}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    Batalkan Pilihan
                  </button>
                  <button
                    id="btn-bulk-delete-users"
                    onClick={handleOpenDeleteSelectedUsers}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Permanen {selectedUserIds.size} Akun Terpilih</span>
                  </button>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredUsers.length > 0 &&
                          filteredUsers
                            .filter(
                              (u) =>
                                u.id !== currentPersona?.id &&
                                (u.role !== 'SUPER_ADMIN' ||
                                  userAccounts.filter((acc) => acc.role === 'SUPER_ADMIN').length > 1)
                            )
                            .every((u) => selectedUserIds.has(u.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const selectable = filteredUsers
                              .filter(
                                (u) =>
                                  u.id !== currentPersona?.id &&
                                  (u.role !== 'SUPER_ADMIN' ||
                                    userAccounts.filter((acc) => acc.role === 'SUPER_ADMIN').length > 1)
                              )
                              .map((u) => u.id);
                            setSelectedUserIds(new Set(selectable));
                          } else {
                            setSelectedUserIds(new Set());
                          }
                        }}
                        className="rounded text-[#0753A5] focus:ring-[#0753A5] cursor-pointer"
                        title="Pilih Semua Akun yang Dapat Dihapus"
                      />
                    </th>
                    <th className="p-3">Nama Pengguna</th>
                    <th className="p-3">Peran & Tanggung Jawab</th>
                    <th className="p-3">Satuan Pendidikan</th>
                    <th className="p-3">Username & Email</th>
                    <th className="p-3">Keterhubungan Master Global</th>
                    <th className="p-3">Kanal Autentikasi</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isSchoolAdmin = u.role === 'SCHOOL_ADMIN';
                    const conn = getMasterConnectionInfo(u);
                    const isProtected =
                      currentPersona?.id === u.id ||
                      (u.role === 'SUPER_ADMIN' &&
                        userAccounts.filter((acc) => acc.role === 'SUPER_ADMIN').length <= 1);

                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          selectedUserIds.has(u.id)
                            ? 'bg-rose-50/40'
                            : isSchoolAdmin
                            ? 'bg-amber-50/30 hover:bg-amber-50/60'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.has(u.id)}
                            disabled={isProtected}
                            onChange={(e) => {
                              setSelectedUserIds((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) {
                                  next.add(u.id);
                                } else {
                                  next.delete(u.id);
                                }
                                return next;
                              });
                            }}
                            className="rounded text-[#0753A5] focus:ring-[#0753A5] disabled:opacity-30 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar avatar={u.avatar} role={u.role} name={u.name} size="md" />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{u.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {u.identifierLabel || 'ID'}: {u.identifierValue || '-'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              u.role === 'SUPER_ADMIN'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : u.role === 'SCHOOL_ADMIN'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {u.role === 'SCHOOL_ADMIN' ? 'ADMIN SEKOLAH' : u.role}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5">{u.title}</p>
                        </td>
                        <td className="p-3 font-medium text-slate-700">
                          {u.schoolName || 'Kementerian Dikdasmen (Pusat)'}
                        </td>
                        <td className="p-3">
                          <p className="font-mono font-bold text-slate-800">{u.username}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border w-fit ${conn.color}`}>
                              <Link2 className="w-3 h-3 shrink-0" />
                              <span>{conn.badge}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[170px]" title={conn.label}>
                              {conn.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mandiri Terverifikasi</span>
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                              u.accountStatus === 'MANDIRI_NONAKTIF'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.accountStatus === 'MANDIRI_NONAKTIF' ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                            />
                            {u.accountStatus === 'MANDIRI_NONAKTIF' ? 'NONAKTIF' : 'PRODUKSI AKTIF'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Edit Akun & Sinkronkan ke Data Master Global"
                          >
                            <Edit3 className="w-3 h-3 text-amber-700" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setUserPassword(u.id, '123456', [u.username, u.identifierValue, u.email, u.childNisn]);
                              const updatedUsers = userAccounts.map((acc) =>
                                acc.id === u.id
                                  ? { ...acc, passwordHash: '123456', lastUpdated: new Date().toISOString().slice(0, 10) }
                                  : acc
                              );
                              updateUsers(updatedUsers);
                              showToast(`Kata sandi akun ${u.name} (${u.username}) berhasil direset ke 123456 dan disinkronkan ke login.`);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50/80 text-amber-900 hover:bg-amber-100 text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Reset Kata Sandi ke Default (123456) & Sinkronkan ke Sistem Login"
                          >
                            <KeyRound className="w-3 h-3 text-amber-600" />
                            <span>Reset Sandi</span>
                          </button>
                          <button
                            onClick={() => onSelectPersona(u)}
                            className="px-2.5 py-1 rounded-lg bg-[#0753A5] text-white hover:bg-blue-700 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                            title="Beralih ke Sesi Pengguna Ini"
                          >
                            Masuk Sesi
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            {u.accountStatus === 'MANDIRI_NONAKTIF' ? 'Aktifkan' : 'Nonaktifkan'}
                          </button>
                          <button
                            id={`btn-delete-user-${u.id}`}
                            onClick={() => handleDeleteUser(u)}
                            disabled={isProtected}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 hover:border-rose-300 disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                            title={
                              isProtected
                                ? 'Akun aktif atau Super Admin utama dilindungi dari penghapusan'
                                : 'Hapus Akun Pengguna Secara Permanen'
                            }
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB: AUDIT LOGS GLOBAL */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">Log Audit Keamanan & Integritas Global</h3>
              <p className="text-xs text-slate-500">
                Pencatatan menyeluruh setiap entri, validasi, dan transaksi data sesuai amanat UU PDP No. 27/2022
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAuditLogs}
                disabled={isLogsLoading}
                className="px-3 py-1.5 rounded-xl bg-[#0753A5] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLogsLoading ? 'animate-spin' : ''}`} />
                <span>Segarkan Log</span>
              </button>
              {logs.length > 0 && (
                <button
                  onClick={handleOpenClearLogs}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Bersihkan Semua Catatan Log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan Log</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Aktor & Peran</th>
                  <th className="p-3">Aksi</th>
                  <th className="p-3">Entitas Sasaran</th>
                  <th className="p-3">Rincian Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      Belum ada catatan log audit transaksi.
                    </td>
                  </tr>
                ) : (
                  logs.slice(0, 30).map((l, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 font-mono text-[11px]">
                      <td className="p-3 text-slate-500">{l.createdAt || 'Baru saja'}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-800">{l.actorName || l.actorId}</span>
                        <span className="text-[10px] text-slate-400 block font-sans font-bold">
                          {l.actorRole}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-[#0753A5]">{l.action}</td>
                      <td className="p-3 text-slate-600">{l.entityType} ({l.entityId})</td>
                      <td className="p-3 text-slate-500 truncate max-w-xs">
                        {l.details || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. TAB: SETTINGS, LOGOUT POLICY & ROLE PREFERENCES */}
      {activeTab === 'SETTINGS' && (
        <div className="space-y-6">
          {/* Subtab Selector */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs overflow-x-auto">
            <div className="flex space-x-1 min-w-max">
              <button
                id="btn-subtab-logout"
                onClick={() => setSettingsSubTab('LOGOUT')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  settingsSubTab === 'LOGOUT'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>Pengaturan Tombol Selesai Sesi (Logout & Inaktivitas)</span>
                <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-rose-200/80 text-rose-900 font-black">
                  5 Menit Murid & Ortu
                </span>
              </button>

              <button
                id="btn-subtab-role-prefs"
                onClick={() => setSettingsSubTab('ROLE_PREFERENCES')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  settingsSubTab === 'ROLE_PREFERENCES'
                    ? 'bg-[#0753A5] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Preferensi Operasional Peran (Siswa, Guru, Ortu, Sekolah)</span>
              </button>

              <button
                id="btn-subtab-guardrails"
                onClick={() => setSettingsSubTab('GUARDRAILS')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  settingsSubTab === 'GUARDRAILS'
                    ? 'bg-[#0753A5] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Penegakan AI Guardrails & Kebijakan Etika</span>
              </button>
            </div>
          </div>

          {/* SUBTAB 1: LOGOUT POLICY & TIMEOUT */}
          {settingsSubTab === 'LOGOUT' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span>Pengaturan Tombol Selesai Sesi (Logout) & Kebijakan Inaktivitas Global</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                      Pusat kendali kebijakan sesi nasional: kelola tombol logout header, modal konfirmasi, pengalihan portal, dan durasi auto-logout inaktivitas 5 menit khusus akun murid & orang tua (standar UU PDP No. 27/2022).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-admin-reset-logout"
                      onClick={handleResetAdminLogoutSettings}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Kembalikan Default</span>
                    </button>
                    <button
                      type="button"
                      id="btn-admin-save-logout"
                      onClick={handleSaveAdminLogoutSettings}
                      className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Pengaturan Logout Global</span>
                    </button>
                  </div>
                </div>

                {logoutSaveSuccess && (
                  <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pengaturan tombol selesai sesi dan batas inaktivitas murid & orang tua berhasil diperbarui untuk seluruh pengguna aplikasi.</span>
                  </div>
                )}
              </div>

              {/* Grid of Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Perilaku Tombol & Konfirmasi */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Perilaku Tombol & Konfirmasi Keamanan</h3>
                      <p className="text-[11px] text-slate-500">Mencegah siswa dan pengguna keluar tanpa sengaja saat belajar</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start justify-between gap-4 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">
                          Tampilkan Dialog Konfirmasi Sebelum Logout
                        </span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">
                          Menampilkan modal dialog: "Apakah Anda yakin ingin menyelesaikan sesi?" demi mencegah kehilangan draf.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={adminLogoutSettings.confirmBeforeLogout}
                        onChange={(e) =>
                          setAdminLogoutSettings((prev) => ({
                            ...prev,
                            confirmBeforeLogout: e.target.checked,
                          }))
                        }
                        className="mt-1 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-start justify-between gap-4 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">
                          Tampilkan Tombol 'Selesai Sesi' di Bilah Header
                        </span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">
                          Menempatkan tombol merah tegas di navbar atas untuk akses cepat penyelesaian sesi.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={adminLogoutSettings.showLogoutButtonInHeader}
                        onChange={(e) =>
                          setAdminLogoutSettings((prev) => ({
                            ...prev,
                            showLogoutButtonInHeader: e.target.checked,
                          }))
                        }
                        className="mt-1 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-start justify-between gap-4 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">
                          Tampilkan Lencana Waktu Durasi Sesi Aktif
                        </span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">
                          Menampilkan durasi aktif (contoh: 12m 45s) di samping profil pengguna untuk monitoring waktu belajar.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={adminLogoutSettings.showSessionTimerBadge}
                        onChange={(e) =>
                          setAdminLogoutSettings((prev) => ({
                            ...prev,
                            showSessionTimerBadge: e.target.checked,
                          }))
                        }
                        className="mt-1 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* 2. Pengalihan & Perlindungan Privasi */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Tujuan Pengalihan & Privasi Siswa</h3>
                      <p className="text-[11px] text-slate-500">Menjamin kepatuhan perlindungan data pribadi UU PDP No. 27/2022</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <span className="text-xs font-bold text-slate-800 block">
                        Tujuan Pengalihan Pasca-Logout
                      </span>
                      <div className="space-y-2 pt-1">
                        <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="superRedirectDestination"
                            value="LOGIN_DASHBOARD"
                            checked={adminLogoutSettings.redirectDestination === 'LOGIN_DASHBOARD'}
                            onChange={() =>
                              setAdminLogoutSettings((prev) => ({
                                ...prev,
                                redirectDestination: 'LOGIN_DASHBOARD',
                              }))
                            }
                            className="mt-0.5 text-[#0753A5] focus:ring-[#0753A5]"
                          />
                          <div>
                            <span className="font-bold block">Dashboard Login Utama (Direkomendasikan)</span>
                            <span className="text-[11px] text-slate-500">
                              Mengalihkan pengguna kembali ke halaman login utama aplikasi secara bersih tanpa autofill kata sandi/NISN.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="superRedirectDestination"
                            value="PERSONA_SWITCHER"
                            checked={adminLogoutSettings.redirectDestination === 'PERSONA_SWITCHER'}
                            onChange={() =>
                              setAdminLogoutSettings((prev) => ({
                                ...prev,
                                redirectDestination: 'PERSONA_SWITCHER',
                              }))
                            }
                            className="mt-0.5 text-[#0753A5] focus:ring-[#0753A5]"
                          />
                          <div>
                            <span className="font-bold block">Dialog Cepat Pemilihan Akun (Modal SSO)</span>
                            <span className="text-[11px] text-slate-500">
                              Membuka modal cepat untuk beralih profil peran lain di lingkungan uji coba.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <label className="flex items-start justify-between gap-4 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">
                          Bersihkan Draf Isian Formulir Belum Tersimpan
                        </span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">
                          Menghapus draf jurnal sementara di peramban ketika sesi selesai demi mencegah kebocoran data di komputer bersama.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={adminLogoutSettings.clearDraftOnLogout}
                        onChange={(e) =>
                          setAdminLogoutSettings((prev) => ({
                            ...prev,
                            clearDraftOnLogout: e.target.checked,
                          }))
                        }
                        className="mt-1 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* 3. Batas Waktu Inaktivitas Otomatis */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Batas Waktu Inaktivitas Sesi (Auto-Logout)</h3>
                      <p className="text-[11px] text-slate-500">Proteksi otomatis jika komputer ditinggalkan siswa tanpa logout</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2">
                      <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Timer className="w-4 h-4 text-amber-600" />
                        <span>Kebijakan Batas Waktu Tanpa Aktivitas:</span>
                      </label>
                      <select
                        value={adminLogoutSettings.autoLogoutInactivity}
                        onChange={(e) =>
                          setAdminLogoutSettings((prev) => ({
                            ...prev,
                            autoLogoutInactivity: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-amber-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="5_MIN">
                          5 Menit (Standar Wajib Akun Murid - Peringatan Interaktif 60 Detik)
                        </option>
                        <option value="15_MIN">15 Menit (Standar Lab Komputer Bersama)</option>
                        <option value="30_MIN">30 Menit (Standar Ruang Kelas / Chromebook)</option>
                        <option value="60_MIN">60 Menit (Ruang Guru / Tata Usaha)</option>
                        <option value="DISABLED">Dinonaktifkan (Logout Manual Saja)</option>
                      </select>
                      <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                        <strong>🛡️ Standar Dashboard Murid & Orang Tua:</strong> Sesi akun murid dan orang tua secara default dilengkapi timer proteksi 5 menit inaktivitas disertai dialog peringatan interaktif 60 detik sebelum keluar otomatis demi melindungi kerahasiaan catatan kebiasaan siswa dan data keluarga.
                      </div>
                    </div>

                    <label className="flex items-start justify-between gap-4 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">
                          Catat Riwayat Selesai Sesi ke Log Audit SIM
                        </span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">
                          Merekam timestamp, durasi aktif, dan metode penyelesaian sesi (manual/auto-logout) ke log audit nasional.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={adminLogoutSettings.recordAuditOnLogout}
                        onChange={(e) =>
                          setAdminLogoutSettings((prev) => ({
                            ...prev,
                            recordAuditOnLogout: e.target.checked,
                          }))
                        }
                        className="mt-1 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* 4. Panel Uji Coba & Status Sesi */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Uji Coba & Simulasi Selesai Sesi</h3>
                      <p className="text-[11px] text-slate-500">Verifikasi alur logout sebelum diterapkan ke seluruh sekolah</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">Konfirmasi Pop-up:</span>
                        <span className="font-bold text-slate-800">
                          {adminLogoutSettings.confirmBeforeLogout ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">Tombol Header:</span>
                        <span className="font-bold text-slate-800">
                          {adminLogoutSettings.showLogoutButtonInHeader ? 'Ditampilkan' : 'Disembunyikan'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">Auto-Logout Murid:</span>
                        <span className="font-bold text-rose-700">5 Menit (Notif 60d)</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">Pembersihan Draf:</span>
                        <span className="font-bold text-slate-800">
                          {adminLogoutSettings.clearDraftOnLogout ? 'Otomatis Bersih' : 'Simpan Sementara'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      id="btn-admin-test-logout-action"
                      onClick={onTriggerLogout}
                      className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Uji Coba Alur Selesai Sesi (Logout Sekarang)</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-500">
                      Tombol di atas mengeksekusi alur logout sesuai pengaturan yang sedang aktif.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: ROLE OPERATIONAL PREFERENCES */}
          {settingsSubTab === 'ROLE_PREFERENCES' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0753A5] flex items-center justify-center">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <span>Preferensi Operasional Seluruh Peran (Manajemen Terpusat)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                      Pusat standardisasi operasional alur kerja harian untuk Siswa, Orang Tua, Guru, Kepala Sekolah, Pengawas, dan Admin Sekolah. Pengaturan ini dipusatkan ke Super Admin agar murid dan pengguna dapat fokus beraktivitas tanpa beban teknis.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-admin-reset-role-prefs"
                      onClick={handleResetRolePreferences}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Kembalikan Standar</span>
                    </button>
                    <button
                      type="button"
                      id="btn-admin-save-role-prefs"
                      onClick={handleSaveRolePreferences}
                      className="px-4 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Preferensi Seluruh Peran</span>
                    </button>
                  </div>
                </div>

                {rolePrefsSaveSuccess && (
                  <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Preferensi operasional seluruh peran berhasil disimpan dan disinkronkan ke seluruh sistem!</span>
                  </div>
                )}
              </div>

              {/* Role Switcher Pills */}
              <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs overflow-x-auto">
                <div className="flex space-x-1 min-w-max">
                  {(
                    [
                      { role: 'STUDENT', label: 'Peran Siswa (Murid)', icon: '🎓' },
                      { role: 'PARENT', label: 'Peran Orang Tua', icon: '👨‍👩‍👧' },
                      { role: 'TEACHER', label: 'Peran Guru / Wali Kelas', icon: '👨‍🏫' },
                      { role: 'HEADMASTER', label: 'Peran Kepala Sekolah', icon: '🏛️' },
                      { role: 'SUPERVISOR', label: 'Peran Pengawas Sekolah', icon: '📋' },
                      { role: 'SCHOOL_ADMIN', label: 'Peran Admin Sekolah', icon: '🛡️' },
                      { role: 'SUPER_ADMIN', label: 'Peran Super Admin', icon: '⚡' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.role}
                      onClick={() => setSelectedRolePrefTab(item.role)}
                      className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        selectedRolePrefTab === item.role
                          ? 'bg-[#0753A5] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ROLE 1: SISWA */}
              {selectedRolePrefTab === 'STUDENT' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>🎓 Preferensi Operasional Siswa (Standar Nasional Pembiasaan)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Pengaturan target rutinitas harian 7 Kebiasaan Anak Indonesia Hebat yang diterapkan pada portofolio siswa.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0753A5] text-[10px] font-bold">
                      Dikelola Terpusat oleh Super Admin
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-[#0753A5] shrink-0" />
                    <span>
                      Tab ini sebelumnya tampil di Dashboard Murid. Sesuai instruksi kebijakan privasi & kesederhanaan antarmuka, pengaturan ini dipindahkan ke Super Admin agar murid dapat fokus mengisi jurnal tanpa distraksi konfigurasi teknis.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Target Bangun Pagi (Kebiasaan 1)</span>
                      </label>
                      <input
                        type="time"
                        value={rolePreferences.studentWakeTime}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            studentWakeTime: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      />
                      <p className="text-[10px] text-slate-400">Standar: Bangun sebelum subuh/fajar (05:00 WIB)</p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Target Membaca/Literasi (Kebiasaan 5)</span>
                      </label>
                      <input
                        type="time"
                        value={rolePreferences.studentReadingReminder}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            studentReadingReminder: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      />
                      <p className="text-[10px] text-slate-400">Pengingat literasi sore hari (16:30 WIB)</p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Target Tidur / Istirahat (Kebiasaan 7)</span>
                      </label>
                      <input
                        type="time"
                        value={rolePreferences.studentBedTime}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            studentBedTime: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      />
                      <p className="text-[10px] text-slate-400">Target istirahat cukup anak (21:00 WIB)</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Kebijakan Visibilitas Catatan Reflektif Jurnal Siswa
                    </label>
                    <select
                      value={rolePreferences.studentJournalPrivacy}
                      onChange={(e) =>
                        setRolePreferences((prev) => ({
                          ...prev,
                          studentJournalPrivacy: e.target.value,
                        }))
                      }
                      className="w-full sm:w-80 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800"
                    >
                      <option value="RESTRICTED_TEACHER_PARENT">
                        Ketat: Hanya Wali Kelas & Orang Tua Kandung (UU PDP No. 27/2022)
                      </option>
                      <option value="OPEN_TO_MENTORS">Terbuka untuk Guru Pembimbing & Guru BK</option>
                      <option value="CLASS_ONLY">Hanya Siswa dan Wali Kelas</option>
                    </select>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Sesuai Undang-Undang Perlindungan Data Pribadi No. 27/2022, catatan reflektif hati dan curahan rasa siswa hanya boleh dibaca oleh pihak berwenang langsung (Wali Kelas dan Orang Tua).
                    </p>
                  </div>
                </div>
              )}

              {/* ROLE 2: ORANG TUA */}
              {selectedRolePrefTab === 'PARENT' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">👨‍👩‍👧 Preferensi Pendampingan Orang Tua</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Konfigurasi notifikasi validasi pembiasaan di rumah dan laporan mingguan untuk orang tua murid.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Aturan & Kebijakan Validasi Harian Orang Tua</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Standar Nasional
                        </span>
                      </label>
                      <select
                        id="select-parent-validation-req"
                        value={rolePreferences.parentValidationRequirement || 'ACCORDING_TO_CHILD_JOURNAL'}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            parentValidationRequirement: e.target.value as 'ACCORDING_TO_CHILD_JOURNAL' | 'REQUIRE_ALL_7',
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800"
                      >
                        <option value="ACCORDING_TO_CHILD_JOURNAL">
                          Sesuai Data Jurnal Anak (Fleksibel & Realistis — Tidak Harus 7 Kebiasaan Selesai)
                        </option>
                        <option value="REQUIRE_ALL_7">
                          Harus Selesai Seluruh 7 Kebiasaan (Ketat)
                        </option>
                      </select>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {rolePreferences.parentValidationRequirement === 'REQUIRE_ALL_7'
                          ? 'Validasi harian orang tua baru dapat disetujui jika seluruh 7 indikator kebiasaan telah dicentang selesai oleh siswa.'
                          : 'Validasi harian orang tua tidak mengharuskan seluruh 7 kebiasaan dicentang selesai, melainkan memvalidasi sesuai data aktual yang dicatatkan anak pada hari tersebut guna membina kejujuran dan apresiasi positif.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Jam Pengingat Validasi Harian</span>
                      </label>
                      <input
                        type="time"
                        value={rolePreferences.parentReminderTime}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            parentReminderTime: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      />
                      <p className="text-[10px] text-slate-400">Pengingat paraf/validasi kebiasaan malam hari (19:30 WIB)</p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Kirim Ringkasan Mingguan via WA / Email</span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">
                          Mengirim rekap ketercapaian 7 Kebiasaan anak setiap akhir pekan.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={rolePreferences.parentWeeklySummary}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            parentWeeklySummary: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 sm:col-span-2">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Izinkan Validasi Parsial / Berapapun Kebiasaan Terisi</span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">
                          Orang tua tetap dapat memberikan validasi dan apresiasi motivasi meskipun anak baru mengisi sebagian kebiasaan hari ini.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={rolePreferences.parentAllowPartialValidation ?? true}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            parentAllowPartialValidation: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ROLE 3: GURU / WALI KELAS */}
              {selectedRolePrefTab === 'TEACHER' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">👨‍🏫 Preferensi Guru & Wali Kelas</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Batas waktu verifikasi mingguan, toleransi peringatan siswa tidak aktif, dan PIN validasi cepat.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">Batas Validasi Mingguan</label>
                      <select
                        value={rolePreferences.teacherValidationDeadline}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            teacherValidationDeadline: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="JUMAT_1600">Jumat, 16:00 WIB (Akhir Jam Sekolah)</option>
                        <option value="SABTU_1800">Sabtu, 18:00 WIB (Standar Nasional)</option>
                        <option value="MINGGU_2000">Minggu, 20:00 WIB (Malam Senin)</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">
                        Peringatan Siswa Butuh Dukungan
                      </label>
                      <select
                        value={rolePreferences.teacherAlertInactiveDays}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            teacherAlertInactiveDays: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        <option value={1}>1 Hari Tidak Mengisi (Respons Sangat Cepat)</option>
                        <option value={2}>2 Hari Tidak Mengisi (Standar Moderat)</option>
                        <option value={3}>3 Hari Tidak Mengisi (Toleransi Akhir Pekan)</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">PIN Validasi Cepat Guru (4 Digit)</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={rolePreferences.teacherQuickPin}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            teacherQuickPin: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono tracking-widest"
                      />
                      <p className="text-[10px] text-slate-400">Digunakan untuk validasi batch 1 kelas sekaligus</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ROLE 4: KEPALA SEKOLAH */}
              {selectedRolePrefTab === 'HEADMASTER' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">🏛️ Preferensi Pengesahan Kepala Sekolah</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Pengaturan stempel digital resmi, target ketercapaian karakter (IKU), dan cut-off laporan bulanan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">
                        Target Partisipasi Pembiasaan (IKU %)
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={rolePreferences.principalTargetRate}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            principalTargetRate: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      />
                      <p className="text-[10px] text-slate-400">Target sekolah: minimal {rolePreferences.principalTargetRate}% partisipasi</p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">
                        Tanggal Cut-Off Laporan Bulanan
                      </label>
                      <select
                        value={rolePreferences.principalReportCutoffDay}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            principalReportCutoffDay: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        <option value={25}>Tanggal 25 Setiap Bulan</option>
                        <option value={28}>Tanggal 28 Setiap Bulan (Standar)</option>
                        <option value={30}>Akhir Bulan Kalender</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Stempel Digital Resmi Aktif</span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">
                          Membubuhkan cap digital pada cetak lembar portofolio.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={rolePreferences.principalStampActive}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            principalStampActive: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ROLE 5: PENGAWAS */}
              {selectedRolePrefTab === 'SUPERVISOR' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">📋 Preferensi Pengawas Sekolah / Disdik</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Rayon binaan pengawasan dan jadwal siklus evaluasi mutu karakter antar satuan pendidikan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">Wilayah / Rayon Binaan</label>
                      <input
                        type="text"
                        value={rolePreferences.supervisorRegion}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            supervisorRegion: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      />
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">Siklus Evaluasi Wilayah</label>
                      <select
                        value={rolePreferences.supervisorVisitSchedule}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            supervisorVisitSchedule: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="BULANAN">Bulanan (Evaluasi Berkala)</option>
                        <option value="TRIWULAN">Triwulanan (Standar Disdik)</option>
                        <option value="SEMESTER">Semesteran</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">Format Laporan Supervisi</label>
                      <select
                        value={rolePreferences.supervisorReportFormat}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            supervisorReportFormat: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="STANDAR_KEMENDIKDASMEN">Standar Kemendikdasmen (Lengkap)</option>
                        <option value="RINGKAS_EKSEKUTIF">Ringkasan Eksekutif Walikota/Bupati</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ROLE 6: ADMIN SEKOLAH */}
              {selectedRolePrefTab === 'SCHOOL_ADMIN' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">🛡️ Preferensi Administrator Satuan Pendidikan</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Kebijakan keamanan sandi pengguna baru, masa kedaluwarsa sesi, dan reset sandi mandiri.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">Panjang Sandi Minimum</label>
                      <select
                        value={rolePreferences.adminMinPasswordLength}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            adminMinPasswordLength: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        <option value={6}>6 Karakter (Fleksibel Murid SD/SMP)</option>
                        <option value={8}>8 Karakter (Standar Disarankan)</option>
                        <option value={10}>10 Karakter (Tinggi / Kompleks)</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">Kedaluwarsa Sesi Login</label>
                      <select
                        value={rolePreferences.adminSessionExpiry}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            adminSessionExpiry: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="8_JAM">8 Jam (1 Hari Sekolah)</option>
                        <option value="24_JAM">24 Jam (Standar Operasional)</option>
                        <option value="7_HARI">7 Hari (Tetap Masuk)</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Izinkan Reset Mandiri</span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">
                          Siswa/Guru dapat meminta tautan pemulihan kata sandi.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={rolePreferences.adminAllowSelfReset}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            adminAllowSelfReset: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ROLE 7: SUPER ADMIN */}
              {selectedRolePrefTab === 'SUPER_ADMIN' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">⚡ Preferensi Super Administrator (Nasional)</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Kebijakan isolasi mandiri antar sekolah (RLS), proteksi AI guardrail, dan siklus retensi log audit.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Enforce Row-Level Security (RLS)</span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">
                          Isolasi basis data mandiri antar satuan pendidikan.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={rolePreferences.superAdminEnforceRls}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            superAdminEnforceRls: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">AI Guardrails Policy</label>
                      <select
                        value={rolePreferences.superAdminAiGuardrails}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            superAdminAiGuardrails: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="STRICT_ANTI_BULLYING">Strict Anti-Bullying & Positive Reinforcement</option>
                        <option value="MODERATE">Moderat (Hanya Saring Kata Kasar)</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">Retensi Log Audit</label>
                      <select
                        value={rolePreferences.superAdminAuditRetention}
                        onChange={(e) =>
                          setRolePreferences((prev) => ({
                            ...prev,
                            superAdminAuditRetention: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="1_TAHUN">1 Tahun Kalender</option>
                        <option value="3_TAHUN">3 Tahun Kalender (Standar Akreditasi)</option>
                        <option value="PERMANEN">Permanen (Arsip Nasional)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 3: AI GUARDRAILS & SYSTEM INVARIANTS */}
          {settingsSubTab === 'GUARDRAILS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Penegakan AI Guardrails & Kebijakan Etika Nasional
                </h3>
                <p className="text-xs text-slate-500">
                  Konfigurasi kebijakan sistem dan penguncian invariant etika SI-7KAIH
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Anti-Ranking & Anti-Komparasi Siswa</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      TERKUNCI AKTIF
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Melarang sistem memeringkatkan peserta didik, melarang leaderboard publik, dan memastikan portofolio berorientasi refleksi pribadi.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Anti-Character Judgment (AI Guardrail)</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      TERKUNCI AKTIF
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Menolak pelabelan karakter anak (seperti "malas", "tidak beriman") dan mewajibkan rekomendasi berbasis penguatan positif.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Isolasi Mandiri Satuan Pendidikan</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      AKTIF (RLS)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Data antar sekolah terisolasi secara otonom, dikelola langsung oleh Operator Sekolah tanpa portal luar.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Kepatuhan UU PDP No. 27/2022</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      TERVERIFIKASI
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Data ibadah tanpa bukti foto (Privasi Penuh), enkripsi identitas wali, dan log audit tamper-evident.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 9. TAB: PROFIL SUPER ADMIN (MANDIRI) */}
      {activeTab === 'PROFILE' && (
        <SuperAdminProfile
          currentPersona={
            currentPersona ||
            userAccounts.find((u) => u.role === 'SUPER_ADMIN') ||
            userAccounts[0]
          }
          onUpdatePersona={(updated) => {
            if (onUpdatePersona) {
              onUpdatePersona(updated);
            }
            updateUsers(
              userAccounts.map((u) => (u.id === updated.id ? updated : u))
            );
            showToast('✅ Profil Super Admin mandiri berhasil diperbarui!');
          }}
          onSwitchTab={(targetTab) => {
            if (targetTab === 'MASTER_DATA') setActiveTab('MASTER_DATA');
            else if (targetTab === 'USERS') setActiveTab('USERS');
            else if (targetTab === 'AUDIT') setActiveTab('AUDIT');
            else if (targetTab === 'SETTINGS') setActiveTab('SETTINGS');
            else if (targetTab === 'ALL_FEATURES') setActiveTab('ALL_FEATURES');
            else setActiveTab('OVERVIEW');
          }}
        />
      )}

      {/* MODAL: Tambah / Edit Satuan Pendidikan */}
      {isSchoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] my-auto overflow-hidden">
            {/* Modal Header (Sticky / Fixed) */}
            <div className="flex items-center justify-between p-5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0753A5]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {editingSchool ? 'Perbarui Satuan Pendidikan' : 'Tambah Satuan Pendidikan Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Registrasi sekolah ke sistem SIM-7KAIH Nasional</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSchoolModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchool} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
              {/* Scrollable Form Body */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                {/* Quick Preset Selector for Jenjang & Status */}
                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">
                      Pilihan Cepat Jenjang & Status:
                    </span>
                    <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      Mendukung Jenjang SMP & SD
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSchoolFormJenjang('SMP');
                        setSchoolFormStatus('NEGERI');
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        schoolFormJenjang === 'SMP' && schoolFormStatus === 'NEGERI'
                          ? 'bg-purple-700 text-white border-purple-700 shadow-xs ring-2 ring-purple-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <span>🏫</span>
                      <span>SMP Negeri</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSchoolFormJenjang('SMP');
                        setSchoolFormStatus('SWASTA');
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        schoolFormJenjang === 'SMP' && schoolFormStatus === 'SWASTA'
                          ? 'bg-purple-700 text-white border-purple-700 shadow-xs ring-2 ring-purple-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <span>🏢</span>
                      <span>SMP Swasta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSchoolFormJenjang('SD');
                        setSchoolFormStatus('NEGERI');
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        schoolFormJenjang === 'SD' && schoolFormStatus === 'NEGERI'
                          ? 'bg-[#0753A5] text-white border-[#0753A5] shadow-xs ring-2 ring-blue-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <span>🏫</span>
                      <span>SD Negeri</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSchoolFormJenjang('SD');
                        setSchoolFormStatus('SWASTA');
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        schoolFormJenjang === 'SD' && schoolFormStatus === 'SWASTA'
                          ? 'bg-[#0753A5] text-white border-[#0753A5] shadow-xs ring-2 ring-blue-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <span>🏢</span>
                      <span>SD Swasta</span>
                    </button>
                  </div>
                </div>

                {/* Form Row: Jenjang & Status Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Jenjang Satuan Pendidikan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={schoolFormJenjang}
                      onChange={(e) => setSchoolFormJenjang(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    >
                      <option value="SMP">SMP - Sekolah Menengah Pertama (Fase D / Usia 13-15)</option>
                      <option value="SD">SD - Sekolah Dasar (Fase A-C / Usia 7-12)</option>
                      <option value="MTS">MTS - Madrasah Tsanawiyah (Kemenag)</option>
                      <option value="MI">MI - Madrasah Ibtidaiyah (Kemenag)</option>
                      <option value="SMA">SMA - Sekolah Menengah Atas (Fase E-F)</option>
                      <option value="SMK">SMK - Sekolah Menengah Kejuruan</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {schoolFormJenjang === 'SMP'
                        ? '✨ Jenjang SMP: Penerapan 7 Karakter Hebat Fase D'
                        : schoolFormJenjang === 'SD'
                        ? '✨ Jenjang SD: Penerapan 7 Karakter Hebat Fase A-C'
                        : `✨ Jenjang ${schoolFormJenjang}: Penerapan 7 Karakter Hebat`}
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Status Satuan Pendidikan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={schoolFormStatus}
                      onChange={(e) => setSchoolFormStatus(e.target.value as 'NEGERI' | 'SWASTA')}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    >
                      <option value="NEGERI">NEGERI (Pemerintah Daerah / Dinas)</option>
                      <option value="SWASTA">SWASTA (Yayasan / Penyelenggara Mandiri)</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {schoolFormStatus === 'NEGERI'
                        ? 'Sekolah milik Pemerintah Daerah'
                        : 'Sekolah milik Yayasan / Badan Penyelenggara'}
                    </span>
                  </div>
                </div>

                {/* Form Row: NPSN & Akreditasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nomor Pokok Sekolah Nasional (NPSN) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={schoolFormJenjang === 'SMP' ? 'Contoh: 20108891' : 'Contoh: 20104529'}
                      value={schoolFormNpsn}
                      onChange={(e) => setSchoolFormNpsn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Akreditasi</label>
                    <select
                      value={schoolFormAkreditasi}
                      onChange={(e) => setSchoolFormAkreditasi(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    >
                      <option value="A">Akreditasi A (Unggul)</option>
                      <option value="B">Akreditasi B (Baik)</option>
                      <option value="C">Akreditasi C</option>
                      <option value="BELUM">Belum Terakreditasi</option>
                    </select>
                  </div>
                </div>

                {/* Form Row: Nama Satuan Pendidikan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Satuan Pendidikan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      schoolFormJenjang === 'SMP'
                        ? schoolFormStatus === 'NEGERI'
                          ? 'Contoh: SMP Negeri 01 Nusantara'
                          : 'Contoh: SMP Swasta Madani Cendekia'
                        : schoolFormStatus === 'NEGERI'
                        ? 'Contoh: SDN 05 Menteng Jaya'
                        : 'Contoh: SD Teladan Cemerlang'
                    }
                    value={schoolFormName}
                    onChange={(e) => setSchoolFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                  />
                </div>

                {/* Form Row: Nama Kepala Sekolah */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ibu Siti Rahmawati, M.Pd."
                    value={schoolFormPrincipal}
                    onChange={(e) => setSchoolFormPrincipal(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Admin / Operator Sekolah
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Ahmad Rizal, S.Kom."
                      value={schoolFormAdminName}
                      onChange={(e) => setSchoolFormAdminName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Username Login Admin
                    </label>
                    <input
                      type="text"
                      placeholder="admin.sdn05"
                      value={schoolFormAdminUser}
                      onChange={(e) => setSchoolFormAdminUser(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Satuan Pendidikan</label>
                  <input
                    type="text"
                    placeholder="Jl. Thamrin No. 20, Jakarta Pusat"
                    value={schoolFormAddress}
                    onChange={(e) => setSchoolFormAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                  />
                </div>
              </div>

              {/* Sticky Action Buttons Footer */}
              <div className="flex items-center justify-end gap-2 p-4 sm:p-5 pt-3 border-t border-slate-100 shrink-0 bg-slate-50/80 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsSchoolModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  {editingSchool ? 'Simpan Perubahan' : 'Daftarkan Sekolah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah / Edit Akun Pengguna & Admin Sekolah */}
      {isAddAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] my-auto overflow-hidden">
            <div className="flex items-center justify-between p-5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${editingUser ? 'bg-blue-50 text-[#0753A5]' : 'bg-amber-50 text-amber-700'}`}>
                  {editingUser ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {editingUser ? 'Edit Akun Pengguna / Administrator' : 'Tambah Akun Pengguna / Administrator Sekolah'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingUser
                      ? 'Perubahan akun akan langsung terhubung dan disinkronkan ke Data Master Global'
                      : 'Penerbitan akun mandiri terhubung langsung dengan Data Master Satuan Pendidikan, Rombel, dan Siswa'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddAdminModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdminAccount} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
              <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1 overscroll-contain">
                {editingUser && (
                  <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
                    <Link2 className="w-4 h-4 text-[#0753A5] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#0753A5]">Mode Edit Terhubung Master Data Global</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Menyimpan perubahan pada akun <strong>{editingUser.name}</strong> akan secara otomatis memperbarui data master terkait ({editingUser.role === 'SCHOOL_ADMIN' ? 'Data Operator Master Satuan Pendidikan' : editingUser.role === 'PRINCIPAL' ? 'Data Kepala Sekolah Master' : editingUser.role === 'TEACHER' ? 'Data Guru & Wali Rombel Master' : 'Data Peserta Didik Master'}).
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Pilih Satuan Pendidikan <span className="text-rose-500">*</span>
                    </label>
                    {(() => {
                      const schAdm = availableAdminsMaster.find((a) => a.schoolId === adminFormSchool);
                      if (!schAdm) return null;
                      return (
                        <button
                          type="button"
                          onClick={() => handleSelectExistingPersonSuper(`ADMIN_MASTER:${schAdm.schoolId}`)}
                          className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Tarik data admin dari master sekolah ini"
                        >
                          <Zap className="w-3 h-3 text-amber-700" />
                          <span>Pilih Admin Master: {schAdm.adminName.split(' ')[0]}</span>
                        </button>
                      );
                    })()}
                  </div>
                  <select
                    value={adminFormSchool}
                    onChange={(e) => setAdminFormSchool(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                  >
                    <option value="">-- Pilih Satuan Pendidikan --</option>
                    {schools.map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        {sch.name} (NPSN: {sch.npsn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* DROPDOWN SUMBER DATA: Agregasi Admin Master Sekolah, Guru, atau Siswa */}
                <div className="bg-gradient-to-r from-amber-50/70 to-blue-50/50 p-3.5 rounded-2xl border border-amber-200/80">
                  <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-amber-900">
                      <UserCheck className="w-4 h-4 text-amber-700" />
                      Pilih dari Master Satuan Pendidikan, Guru, atau Siswa
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-amber-200 text-amber-800 font-bold">
                      {availableAdminsMaster.length} Admin Master &bull; {availableTeachersSuper.length} Guru &bull; {availableStudentsSuper.length} Siswa
                    </span>
                  </label>
                  <select
                    value={selectedExistingPersonSuper}
                    onChange={(e) => handleSelectExistingPersonSuper(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-amber-300 bg-white font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  >
                    <option value="">-- Pilih dari Master Admin Sekolah / Guru / Siswa (Isi Otomatis) --</option>
                    <option value="MANUAL">✍️ Ketik Manual / Nama Pengguna Baru</option>
                    
                    <optgroup label={`🏢 Data Admin SIM Master Satuan Pendidikan (${availableAdminsMaster.length} Sekolah)`}>
                      {availableAdminsMaster.map((adm) => (
                        <option key={`adm-${adm.schoolId}`} value={`ADMIN_MASTER:${adm.schoolId}`}>
                          {adm.adminName} — {adm.schoolName} (User: {adm.adminUsername}) {adm.hasAccount ? '✓ [Akun Terdaftar]' : '⚡ [Siap Diterbitkan]'}
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label={`👨‍💼 Data Kepala Sekolah Master (${availableAdminsMaster.filter((a) => a.principalName).length} Sekolah)`}>
                      {availableAdminsMaster.filter((a) => a.principalName).map((adm) => (
                        <option key={`prin-${adm.schoolId}`} value={`PRINCIPAL_MASTER:${adm.schoolId}`}>
                          {adm.principalName} — Kepsek {adm.schoolName} {adm.principalNip ? `(NIP: ${adm.principalNip})` : ''}
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label={`👨‍🏫 Data Guru & Pendidik (${availableTeachersSuper.length})`}>
                      {availableTeachersSuper.map((t, idx) => (
                        <option key={`ts-${idx}`} value={`TEACHER:${t.name}`}>
                          {t.name} {t.className ? `[Wali ${t.className}]` : ''} {t.nip ? `(NIP: ${t.nip})` : ''}
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label={`🎓 Data Siswa & Peserta Didik (${availableStudentsSuper.length})`}>
                      {availableStudentsSuper.map((s) => (
                        <option key={s.id || s.nisn} value={`STUDENT:${s.nisn}`}>
                          {s.name} - {s.className} (NISN: {s.nisn})
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  {/* Status dan Keterangan Sinkronisasi */}
                  {selectedExistingPersonSuper.startsWith('ADMIN_MASTER:') ? (() => {
                    const schId = selectedExistingPersonSuper.replace('ADMIN_MASTER:', '');
                    const adm = availableAdminsMaster.find((a) => a.schoolId === schId);
                    if (!adm) return null;
                    return (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-[11px] text-amber-950 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Terhubung Data Master: {adm.schoolName} (NPSN: {adm.npsn})</span>
                          <p className="text-[10px] text-amber-900 mt-0.5">
                            Operator: <strong className="font-semibold">{adm.adminName}</strong> (Username: <code className="bg-amber-200/80 px-1 py-0.5 rounded font-mono font-bold">{adm.adminUsername}</code>).
                            {adm.hasAccount
                              ? ' ⚠️ Akun dengan kredensial ini telah terdaftar di sistem. Anda dapat memperbarui data atau menerbitkan kredensial login baru.'
                              : ' ✅ Siap diterbitkan sebagai akun Operator SIM Satuan Pendidikan.'}
                          </p>
                        </div>
                      </div>
                    );
                  })() : (
                    <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                      Memilih Admin dari Master Satuan Pendidikan otomatis mengisi nama sekolah, nama operator, username, email resmi, dan hak akses.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Peran Hak Akses <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={adminFormRole}
                      onChange={(e) => setAdminFormRole(e.target.value as UserRole)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    >
                      <option value="SCHOOL_ADMIN">Operator / Admin Sekolah</option>
                      <option value="TEACHER">Guru / Wali Kelas</option>
                      <option value="STUDENT">Siswa (Peserta Didik)</option>
                      <option value="PRINCIPAL">Kepala Sekolah</option>
                      <option value="SUPERVISOR">Pengawas Pembina</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Rombel / Penugasan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Kelas 7-A"
                      value={adminFormClassName}
                      onChange={(e) => setAdminFormClassName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Lengkap Pengguna <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rahmat Hidayat, S.Kom."
                      value={adminFormName}
                      onChange={(e) => setAdminFormName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {adminFormRole === 'STUDENT' ? 'Nomor NISN' : 'Nomor NIP / ID'}
                    </label>
                    <input
                      type="text"
                      placeholder={adminFormRole === 'STUDENT' ? 'Masukkan 10 digit NISN' : 'Masukkan NIP atau Nomor ID'}
                      value={adminFormNip}
                      onChange={(e) => setAdminFormNip(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Username Login <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="admin.sdn01"
                      value={adminFormUsername}
                      onChange={(e) => setAdminFormUsername(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email Kontak Resmi
                    </label>
                    <input
                      type="email"
                      placeholder="pengguna@sekolah.sch.id"
                      value={adminFormEmail}
                      onChange={(e) => setAdminFormEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kata Sandi Awal (Password Mandiri)
                  </label>
                  <input
                    type="text"
                    value={adminFormPassword}
                    onChange={(e) => setAdminFormPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Password dapat diganti mandiri oleh pengguna saat login pertama kali.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-4 sm:p-5 pt-3 border-t border-slate-100 shrink-0 bg-slate-50/80 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddAdminModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-xs text-slate-950 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{editingUser ? 'Simpan & Sinkronkan ke Master' : 'Terbitkan & Hubungkan ke Master Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ubah Standar Kebiasaan (7KAIH) */}
      {isHabitModalOpen && editingHabit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] my-auto overflow-hidden">
            <div className="flex items-center justify-between p-5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0753A5]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Ubah Standar Master: {editingHabit.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">{editingHabit.code}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHabitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHabitMaster} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deskripsi Kebiasaan</label>
                  <textarea
                    rows={3}
                    value={habitFormDesc}
                    onChange={(e) => setHabitFormDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Capaian Operasional
                  </label>
                  <textarea
                    rows={3}
                    value={habitFormTarget}
                    onChange={(e) => setHabitFormTarget(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-4 sm:p-5 pt-3 border-t border-slate-100 shrink-0 bg-slate-50/80 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsHabitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  Simpan Standar Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportStudents={(newStudents, mode) => {
          if (mode === 'REPLACE') {
            updateStudents(newStudents);
          } else {
            const combined = [...students, ...newStudents];
            updateStudents(combined);
          }
          showToast(`Berhasil mengimpor ${newStudents.length} data siswa.`);
        }}
        onImportRombels={(newRombels, mode) => {
          if (mode === 'REPLACE') {
            updateRombels(newRombels);
          } else {
            const combined = [...rombels, ...newRombels];
            updateRombels(combined);
          }
          showToast(`Berhasil mengimpor ${newRombels.length} rombongan belajar.`);
        }}
        defaultTab={importModalTab}
      />

      {/* Global Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleExecuteDelete}
        title={deleteModalState.title}
        itemName={deleteModalState.itemName}
        itemIdentifier={deleteModalState.itemIdentifier}
        warningMessage={deleteModalState.warningMessage}
        confirmLabel={deleteModalState.type === 'RESET' ? 'Ya, Reset Sekarang' : 'Ya, Hapus Sekarang'}
        isDanger={deleteModalState.type !== 'RESET'}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
