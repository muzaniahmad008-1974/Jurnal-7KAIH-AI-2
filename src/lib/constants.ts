// ============================================================================
// SI-7KAIH AI - Constants & Habit Definitions
// 7 Standard Habits and Role Personas
// ============================================================================

import { HabitCode, HabitMaster, UserRole } from '../../packages/types/src/index';

export type AuthChannel = 'MANDIRI_INTERNAL';

export interface UserPersona {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  avatar: string;
  schoolId?: string;
  schoolName?: string;
  className?: string;
  identifierLabel: string;
  identifierValue: string;
  username: string;
  passwordHash?: string;
  email: string;
  nip?: string;
  phone?: string;
  agencyUnit?: string;
  officeAddress?: string;
  bio?: string;
  twoFactorEnabled?: boolean;
  lastUpdated?: string;
  accountStatus: 'MANDIRI_TERVERIFIKASI' | 'MANDIRI_AKTIF' | 'MANDIRI_NONAKTIF';
  dataMode?: 'PRODUKSI_AKTIF';
  authChannel: AuthChannel;
  authProviderLabel: string;
  securityLevel: string;
  managedBy: string;
  childName?: string;
  childId?: string;
  childNisn?: string;
  createdDate?: string;
}

export const USER_PERSONAS: UserPersona[] = [
  {
    id: 'usr-superadmin-01',
    name: 'Dr. Ir. H. Agus Suryanto, M.T.',
    role: 'SUPER_ADMIN',
    title: 'Super Administrator SI-7KAIH Pusat',
    avatar: '🛡️',
    schoolName: 'Kementerian Dikdasmen / Seluruh Satuan Pendidikan',
    identifierLabel: 'ID Pegawai Pusat',
    identifierValue: 'PUSDATIN-ADM-8801',
    nip: '197408121999031002',
    phone: '+62 812-8899-7701',
    agencyUnit: 'Pusat Data dan Teknologi Informasi (Pusdatin) Kemendikdasmen',
    officeAddress: 'Gedung C Lantai 18, Kompleks Kemendikdasmen, Jl. Jenderal Sudirman, Senayan, Jakarta Pusat',
    bio: 'Super Administrator Pengendali Utama SI-7KAIH Nasional. Mengemban amanah pembinaan master data pembiasaan 7 Karakter Anak Indonesia Hebat, pengawasan tata kelola akun SIM satuan pendidikan, serta pengawalan integritas etika AI tanpa pelabelan negatif maupun perankingan siswa.',
    username: 'superadmin',
    email: 'superadmin@kemdikbud.go.id',
    twoFactorEnabled: true,
    lastUpdated: '2026-09-09',
    accountStatus: 'MANDIRI_TERVERIFIKASI',
    authChannel: 'MANDIRI_INTERNAL',
    authProviderLabel: 'Autentikasi Mandiri IAM Pusat',
    securityLevel: 'Super Administrator (Akses Penuh Semua Fitur & Master Data)',
    managedBy: 'Root Security Authority Kemdikbudristek',
    createdDate: '2026-05-01',
  },
];

// ============================================================================
// SISTEM TOMBSTONE AKUN TERHAPUS (PERMANENT DELETION PROTECTION)
// Memastikan akun yang dihapus oleh Super Admin tidak otomatis muncul kembali
// ============================================================================
export const DELETED_USERS_TOMBSTONES_KEY = 'si7kaih_deleted_users_tombstones';

export const getDeletedUsersTombstones = (): Record<string, number> => {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(DELETED_USERS_TOMBSTONES_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (_e) {}
  return {};
};

export const markUserAsDeleted = (userId?: string, username?: string, deletedBy?: string): void => {
  try {
    if (typeof window === 'undefined') return;
    const tombstones = getDeletedUsersTombstones();
    const now = Date.now();
    if (userId) {
      tombstones[userId] = now;
      tombstones[userId.toLowerCase()] = now;
    }
    if (username) {
      const cleanUser = username.toLowerCase().trim();
      tombstones[cleanUser] = now;
      tombstones[`user_${cleanUser}`] = now;
    }
    localStorage.setItem(DELETED_USERS_TOMBSTONES_KEY, JSON.stringify(tombstones));
  } catch (_e) {}
};

export const markUsersAsDeleted = (
  users: Array<{ id: string; username?: string }>,
  deletedBy?: string
): void => {
  try {
    if (typeof window === 'undefined') return;
    const tombstones = getDeletedUsersTombstones();
    const now = Date.now();
    users.forEach((u) => {
      if (u.id) {
        tombstones[u.id] = now;
        tombstones[u.id.toLowerCase()] = now;
      }
      if (u.username) {
        const cleanUser = u.username.toLowerCase().trim();
        tombstones[cleanUser] = now;
        tombstones[`user_${cleanUser}`] = now;
      }
    });
    localStorage.setItem(DELETED_USERS_TOMBSTONES_KEY, JSON.stringify(tombstones));
  } catch (_e) {}
};

export const unmarkUserAsDeleted = (userId?: string, username?: string): void => {
  try {
    if (typeof window === 'undefined') return;
    const tombstones = getDeletedUsersTombstones();
    if (userId) {
      delete tombstones[userId];
      delete tombstones[userId.toLowerCase()];
    }
    if (username) {
      const cleanUser = username.toLowerCase().trim();
      delete tombstones[cleanUser];
      delete tombstones[`user_${cleanUser}`];
    }
    localStorage.setItem(DELETED_USERS_TOMBSTONES_KEY, JSON.stringify(tombstones));
  } catch (_e) {}
};

export const isUserDeleted = (userId?: string, username?: string): boolean => {
  try {
    const tombstones = getDeletedUsersTombstones();
    if (userId) {
      if (tombstones[userId] || tombstones[userId.toLowerCase()]) {
        return true;
      }
    }
    if (username) {
      const cleanUser = username.toLowerCase().trim();
      if (tombstones[cleanUser] || tombstones[`user_${cleanUser}`]) {
        return true;
      }
    }
  } catch (_e) {}
  return false;
};

// Helper to identify legacy dummy or explicitly removed default accounts
export const isDeprecatedOrDummyUser = (u: UserPersona): boolean => {
  // Akun Super Admin root utama selalu dilindungi
  if (u.id === 'usr-superadmin-01' || (u.role === 'SUPER_ADMIN' && (u.username || '').toLowerCase() === 'superadmin')) {
    return false;
  }

  // Jika akun telah ditandai dihapus permanen oleh Super Admin (Tombstone), anggap tidak valid
  if (isUserDeleted(u.id, u.username)) {
    return true;
  }

  if (u.role === 'SUPER_ADMIN') return false;

  // Akun selain Pengawas Pembina dan Super Admin yang tidak memiliki satuan pendidikan dianggap tidak valid
  if (u.role !== 'SUPERVISOR' && !u.schoolId?.trim() && !u.schoolName?.trim()) {
    return true;
  }

  const username = (u.username || '').toLowerCase().trim();
  const id = (u.id || '').toLowerCase().trim();

  // Hilangkan data akun dummy bawaan sistem awal jika masih tersimpan
  const legacyDummyIds = new Set([
    'usr-student-01',
    'usr-student-02',
    'usr-parent-01',
    'usr-parent-02',
    'usr-teacher-01',
    'usr-teacher-02',
    'usr-admin-01',
    'usr-admin-02',
    'usr-admin-03',
    'usr-principal-01',
    'usr-principal-02',
    'usr-supervisor-01',
    'usr-admin-ria-dummy',
    'usr-custom-1789334675832',
    'usr-parent-1789303147354-0-0134567',
    'usr-admin-1789344430493',
    'usr-principal-1789287601949',
    'usr-teacher-1789302594922',
    'usr-supervisor-1789340225494',
  ]);
  const legacyDummyUsernames = new Set([
    '0123456781',
    '0123456799',
    'wali.0123456781',
    'wali.0123456799',
    'admin.sim',
    'admin.harapan',
    'operator.smpn01',
    '197206151997021002',
    '197804152002121003',
    '196811051992031004',
    '198203152006041008',
    '198506202010011009',
    '0134567',
    'wali.0134567',
    'admin.jorong1',
    'kepsek.adi',
    'fauzi',
  ]);

  return legacyDummyIds.has(id) || legacyDummyUsernames.has(username);
};

// Helper to identify legacy mock/dummy journal records
export const isDeprecatedOrDummyJournal = (j: any): boolean => {
  if (!j) return true;
  const sId = (j.studentId || '').toLowerCase().trim();
  const sName = (j.studentName || '').toLowerCase().trim();
  const jId = (j.id || '').toLowerCase().trim();

  // Exclude legacy mock student journals and test data
  if (
    sId === 'usr-student-01' ||
    sId === 'usr-student-02' ||
    sId.includes('sample-01') ||
    sId.includes('dummy') ||
    jId.includes('sample') ||
    sName.includes('budi pratama') ||
    sName.includes('siswa contoh') ||
    sName.includes('ananda dummy')
  ) {
    return true;
  }
  return false;
};

// Helper to retrieve and persist dynamically managed users in LocalStorage
export const getStoredUsers = (): UserPersona[] => {
  try {
    const saved = localStorage.getItem('si7kaih_users_pool_prod');
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = parsed
          .filter((u: UserPersona) => !isDeprecatedOrDummyUser(u) && !isUserDeleted(u.id, u.username))
          .map((u: UserPersona) => ({
            ...u,
            dataMode: 'PRODUKSI_AKTIF' as const,
          }));

        // Pastikan akun Super Admin selalu ada di pool pengguna
        const hasSuperAdmin = cleaned.some((u) => u.role === 'SUPER_ADMIN');
        const finalPool = hasSuperAdmin ? cleaned : [USER_PERSONAS[0], ...cleaned];

        if (finalPool.length !== parsed.length) {
          try {
            localStorage.setItem('si7kaih_users_pool_prod', JSON.stringify(finalPool));
          } catch (_e) {}
        }
        return finalPool;
      }
    }
  } catch (_e) {}
  return USER_PERSONAS;
};

export const saveStoredUsers = (users: UserPersona[]): void => {
  try {
    const sanitized = users.filter((u) => !isDeprecatedOrDummyUser(u) && !isUserDeleted(u.id, u.username));
    localStorage.setItem('si7kaih_users_pool_prod', JSON.stringify(sanitized));
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        try {
          window.dispatchEvent(new CustomEvent('si7kaih_users_updated', { detail: sanitized }));
        } catch (_e) {}
      }, 0);
      if ('BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('si7kaih_sync_channel');
          bc.postMessage({
            type: 'USERS_SAVED',
            users: sanitized,
            timestamp: Date.now(),
          });
          bc.close();
        } catch (_e) {}
      }
    }
  } catch (_e) {}
};

export const HABIT_MASTERS: Record<HabitCode, HabitMaster> = {
  WAKE_EARLY: {
    id: 'b1000000-0000-0000-0000-000000000001',
    code: 'WAKE_EARLY',
    name: 'Bangun Pagi',
    description: 'Membiasakan bangun lebih awal dengan suasana hati segar untuk menyambut hari.',
    targetDescription: 'Bangun pagi pukul 04:30 - 06:00 dengan ceria dan bersemangat.',
    iconName: 'Sun',
    displayOrder: 1,
    isSystemMaster: true,
  },
  WORSHIP: {
    id: 'b1000000-0000-0000-0000-000000000002',
    code: 'WORSHIP',
    name: 'Beribadah',
    description: 'Melaksanakan ibadah sesuai agama dan keyakinan masing-masing secara tulus.',
    targetDescription: 'Melaksanakan ibadah harian sesuai bimbingan keluarga tanpa paksaan.',
    iconName: 'HeartHandshake',
    displayOrder: 2,
    isSystemMaster: true,
  },
  EXERCISE: {
    id: 'b1000000-0000-0000-0000-000000000003',
    code: 'EXERCISE',
    name: 'Berolahraga',
    description: 'Melakukan aktivitas fisik minimal 15-30 menit untuk menjaga kebugaran tubuh.',
    targetDescription: 'Senam, jalan santai, bersepeda, atau olahraga permainan aktif.',
    iconName: 'Activity',
    displayOrder: 3,
    isSystemMaster: true,
  },
  HEALTHY_EATING: {
    id: 'b1000000-0000-0000-0000-000000000004',
    code: 'HEALTHY_EATING',
    name: 'Makan Sehat dan Bergizi',
    description: 'Membiasakan sarapan bergizi seimbang, mengonsumsi sayur/buah, dan cukup minum air putih.',
    targetDescription: 'Sarapan bernutrisi, makan buah/sayur, dan minum air putih cukup.',
    iconName: 'Apple',
    displayOrder: 4,
    isSystemMaster: true,
  },
  LEARNING: {
    id: 'b1000000-0000-0000-0000-000000000005',
    code: 'LEARNING',
    name: 'Gemar Belajar',
    description: 'Menumbuhkan kecintaan membaca buku atau eksplorasi hal baru secara mandiri.',
    targetDescription: 'Membaca buku cerita / ensiklopedia atau belajar mandiri minimal 15 menit.',
    iconName: 'BookOpen',
    displayOrder: 5,
    isSystemMaster: true,
  },
  SOCIAL: {
    id: 'b1000000-0000-0000-0000-000000000006',
    code: 'SOCIAL',
    name: 'Bermasyarakat',
    description: 'Berinteraksi positif, membantu orang tua, menyapa tetangga, atau gotong royong.',
    targetDescription: 'Melakukan kebaikan, membantu orang tua, atau peduli sesama.',
    iconName: 'Users',
    displayOrder: 6,
    isSystemMaster: true,
  },
  SLEEP_EARLY: {
    id: 'b1000000-0000-0000-0000-000000000007',
    code: 'SLEEP_EARLY',
    name: 'Tidur Cepat',
    description: 'Membiasakan tidur tepat waktu sebelum pukul 21:30 dan membatasi layar gawai.',
    targetDescription: 'Tidur cukup 8-9 jam tanpa layar gawai menjelang tidur.',
    iconName: 'Moon',
    displayOrder: 7,
    isSystemMaster: true,
  },
};

export const getStoredHabitMasters = (): Record<HabitCode, HabitMaster> => {
  try {
    const saved = localStorage.getItem('si7kaih_habit_masters_prod');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...HABIT_MASTERS, ...parsed };
      }
    }
  } catch (_e) {}
  return HABIT_MASTERS;
};

export const saveStoredHabitMasters = (masters: Record<HabitCode, HabitMaster>): void => {
  try {
    localStorage.setItem('si7kaih_habit_masters_prod', JSON.stringify(masters));
  } catch (_e) {}
};

export const resetStoredHabitMasters = (): Record<HabitCode, HabitMaster> => {
  try {
    localStorage.setItem('si7kaih_habit_masters_prod', JSON.stringify(HABIT_MASTERS));
  } catch (_e) {}
  return HABIT_MASTERS;
};

export const resetStoredUsers = (): UserPersona[] => {
  try {
    localStorage.setItem('si7kaih_users_pool_prod', JSON.stringify(USER_PERSONAS));
  } catch (_e) {}
  return USER_PERSONAS;
};

export const HABIT_LIST = Object.values(HABIT_MASTERS);

// ============================================================================
// Pengaturan Tombol Logout & Selesai Sesi Pengguna
// ============================================================================

export interface LogoutSettings {
  confirmBeforeLogout: boolean; // Menampilkan modal konfirmasi sebelum sesi diakhiri
  redirectDestination: 'LOGIN_DASHBOARD' | 'SSO_MODAL'; // Pengalihan pasca logout (Default ke Login Dashboard)
  clearDraftOnLogout: boolean; // Bersihkan draf isian yang belum tersimpan
  autoLogoutInactivity: 'DISABLED' | '5_MIN' | '15_MIN' | '30_MIN' | '60_MIN'; // Timer otomatis keluar saat inaktif
  showLogoutButtonInHeader: boolean; // Tampilkan tombol logout langsung di bilah atas (Header)
  recordAuditOnLogout: boolean; // Catat aktivitas logout ke audit log keamanan
  showSessionTimerBadge: boolean; // Tampilkan indikator durasi aktif sesi
}

export const DEFAULT_LOGOUT_SETTINGS: LogoutSettings = {
  confirmBeforeLogout: true,
  redirectDestination: 'LOGIN_DASHBOARD',
  clearDraftOnLogout: false,
  autoLogoutInactivity: 'DISABLED',
  showLogoutButtonInHeader: true,
  recordAuditOnLogout: true,
  showSessionTimerBadge: true,
};

export const getStoredLogoutSettings = (): LogoutSettings => {
  try {
    const saved = localStorage.getItem('si7kaih_logout_settings_prod');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_LOGOUT_SETTINGS, ...parsed };
    }
  } catch (_e) {}
  return DEFAULT_LOGOUT_SETTINGS;
};

export const saveStoredLogoutSettings = (settings: LogoutSettings): void => {
  try {
    localStorage.setItem('si7kaih_logout_settings_prod', JSON.stringify(settings));
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        try {
          window.dispatchEvent(new Event('si7kaih_logout_settings_updated'));
        } catch (_e) {}
      }, 0);
    }
  } catch (_e) {}
};

// ============================================================================
// PREFERENSI OPERASIONAL PERAN (ROLE PREFERENCES)
// Pengaturan Alur Kerja Peran Siswa, Guru, Orang Tua, Sekolah, & Pengawas
// ============================================================================

export interface RolePreferences {
  // Siswa
  studentWakeTime: string;
  studentBedTime: string;
  studentReadingReminder: string;
  studentJournalPrivacy: string;

  // Orang Tua
  parentReminderTime: string;
  parentWeeklySummary: boolean;
  parentValidationRequirement: 'ACCORDING_TO_CHILD_JOURNAL' | 'REQUIRE_ALL_7';
  parentAllowPartialValidation: boolean;

  // Guru / Wali Kelas
  teacherValidationDeadline: string;
  teacherAlertInactiveDays: number;
  teacherQuickPin: string;

  // Kepala Sekolah
  principalStampActive: boolean;
  principalReportCutoffDay: number;
  principalTargetRate: number;

  // Pengawas Sekolah
  supervisorRegion: string;
  supervisorVisitSchedule: string;
  supervisorReportFormat: string;

  // Admin Sekolah
  adminMinPasswordLength: number;
  adminSessionExpiry: string;
  adminAllowSelfReset: boolean;

  // Super Admin
  superAdminEnforceRls: boolean;
  superAdminAiGuardrails: string;
  superAdminAuditRetention: string;
}

export const DEFAULT_ROLE_PREFERENCES: RolePreferences = {
  studentWakeTime: '05:00',
  studentBedTime: '21:00',
  studentReadingReminder: '16:30',
  studentJournalPrivacy: 'RESTRICTED_TEACHER_PARENT',

  parentReminderTime: '19:30',
  parentWeeklySummary: true,
  parentValidationRequirement: 'ACCORDING_TO_CHILD_JOURNAL',
  parentAllowPartialValidation: true,

  teacherValidationDeadline: 'SABTU_1800',
  teacherAlertInactiveDays: 2,
  teacherQuickPin: '7788',

  principalStampActive: true,
  principalReportCutoffDay: 28,
  principalTargetRate: 85,

  supervisorRegion: 'Wilayah Binaan I Disdik (Subdin SMP)',
  supervisorVisitSchedule: 'BULANAN',
  supervisorReportFormat: 'STANDAR_KEMENDIKDASMEN',

  adminMinPasswordLength: 8,
  adminSessionExpiry: '24_JAM',
  adminAllowSelfReset: true,

  superAdminEnforceRls: true,
  superAdminAiGuardrails: 'STRICT_ANTI_BULLYING',
  superAdminAuditRetention: '1_TAHUN',
};

export const getStoredRolePreferences = (): RolePreferences => {
  try {
    const saved = localStorage.getItem('si7kaih_role_preferences_prod');
    if (saved) {
      return { ...DEFAULT_ROLE_PREFERENCES, ...JSON.parse(saved) };
    }
  } catch (_e) {}
  return DEFAULT_ROLE_PREFERENCES;
};

export const saveStoredRolePreferences = (prefs: RolePreferences): void => {
  try {
    localStorage.setItem('si7kaih_role_preferences_prod', JSON.stringify(prefs));
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        try {
          window.dispatchEvent(new Event('si7kaih_role_preferences_updated'));
        } catch (_e) {}
      }, 0);
    }
  } catch (_e) {}
};

