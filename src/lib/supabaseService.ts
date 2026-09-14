// ============================================================================
// SI-7KAIH AI - Supabase Database Service & Permanent Storage Layer
// ============================================================================

import { supabase, checkSupabaseHealth } from './supabase';
import {
  DailyJournal,
  Badge,
  SchoolProgram,
  FollowUpPlan,
  StudentMonthlyReflection,
  ParentMonthlyReflection,
  AuditLog,
  HabitCode,
  HabitMaster,
} from '../../packages/types/src/index';
import { UserPersona, getStoredHabitMasters, getStoredUsers, isDeprecatedOrDummyUser } from './constants';
import { SchoolMaster, getStoredSchools } from './schoolMasterData';
import { Student, Rombel, getStoredStudents, getStoredRombels } from './studentData';

export interface SupabaseSyncStatus {
  isConfigured: boolean;
  isConnected: boolean;
  tablesReady: boolean;
  isRealtimeActive: boolean;
  isAutoSyncEnabled: boolean;
  lastSyncedAt: string | null;
  statusMessage: string;
  syncCount: number;
  lastSyncEvent: string | null;
}

// Global sync state listener
type SyncListener = (status: SupabaseSyncStatus) => void;
const listeners: Set<SyncListener> = new Set();

let currentStatus: SupabaseSyncStatus = {
  isConfigured: true,
  isConnected: false,
  tablesReady: false,
  isRealtimeActive: false,
  isAutoSyncEnabled: true,
  lastSyncedAt: null,
  statusMessage: 'Memeriksa koneksi Supabase...',
  syncCount: 0,
  lastSyncEvent: null,
};

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...currentStatus }));
}

// BroadcastChannel for instant zero-latency cross-tab and cross-window sync
const BROADCAST_CHANNEL_NAME = 'si7kaih_auto_sync_channel';
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && typeof (window as any).BroadcastChannel !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (_e) {
    // Fallback if BroadcastChannel is restricted
  }
}

export function subscribeToSyncStatus(listener: SyncListener): () => void {
  listeners.add(listener);
  listener({ ...currentStatus });
  return () => {
    listeners.delete(listener);
  };
}

export async function refreshSupabaseStatus(): Promise<SupabaseSyncStatus> {
  const health = await checkSupabaseHealth();
  currentStatus = {
    ...currentStatus,
    isConnected: health.connected,
    tablesReady: health.tablesReady,
    statusMessage: health.message,
  };
  notifyListeners();
  return currentStatus;
}

// ----------------------------------------------------------------------------
// 1. DAILY JOURNALS REPOSITORY
// ----------------------------------------------------------------------------

export async function fetchJournalsFromSupabase(): Promise<DailyJournal[] | null> {
  try {
    const { data, error } = await supabase
      .from('si7kaih_journals')
      .select('data')
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetchJournals notice:', error.message);
      return null;
    }

    if (Array.isArray(data)) {
      currentStatus.lastSyncedAt = new Date().toISOString();
      currentStatus.isConnected = true;
      currentStatus.tablesReady = true;
      notifyListeners();
      return data.map((item: any) => item.data as DailyJournal);
    }
    return null;
  } catch (err) {
    console.warn('Error fetching journals from Supabase:', err);
    return null;
  }
}

export async function saveJournalToSupabase(journal: DailyJournal): Promise<boolean> {
  try {
    const journalDate = journal.journalDate || (journal as any).date || new Date().toISOString().split('T')[0];
    const isParentVal =
      (journal as any).parentSignature ??
      Object.values(journal.entries || {}).some((e: any) => e.parentValidated);
    const isTeacherVal =
      (journal as any).teacherValidated ??
      Object.values(journal.entries || {}).some((e: any) => e.teacherValidated);

    const { error } = await supabase.from('si7kaih_journals').upsert(
      {
        id: journal.id,
        student_id: journal.studentId,
        date: journalDate,
        status: journal.status || 'SUBMITTED',
        parent_validated: Boolean(isParentVal),
        teacher_validated: Boolean(isTeacherVal),
        data: journal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,date' }
    );

    if (error) {
      console.warn('Supabase saveJournal warning:', error.message);
      return false;
    }

    currentStatus.lastSyncedAt = new Date().toISOString();
    currentStatus.syncCount++;
    currentStatus.lastSyncEvent = `Penyimpanan jurnal ${journal.studentName || journal.studentId}`;
    notifyListeners();

    // Broadcast immediately to all open tabs and windows
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({
          type: 'JOURNAL_SAVED',
          journal,
          timestamp: Date.now(),
        });
      } catch (_e) {}
    }

    return true;
  } catch (err) {
    console.warn('Error saving journal to Supabase:', err);
    return false;
  }
}

export async function saveAllJournalsToSupabase(journals: DailyJournal[]): Promise<number> {
  if (!journals || journals.length === 0) return 0;
  let successCount = 0;

  try {
    const rows = journals.map((j) => {
      const journalDate = j.journalDate || (j as any).date || new Date().toISOString().split('T')[0];
      const isParentVal =
        (j as any).parentSignature ??
        Object.values(j.entries || {}).some((e: any) => e.parentValidated);
      const isTeacherVal =
        (j as any).teacherValidated ??
        Object.values(j.entries || {}).some((e: any) => e.teacherValidated);

      return {
        id: j.id,
        student_id: j.studentId,
        date: journalDate,
        status: j.status || 'SUBMITTED',
        parent_validated: Boolean(isParentVal),
        teacher_validated: Boolean(isTeacherVal),
        data: j,
        updated_at: new Date().toISOString(),
      };
    });

    const { error } = await supabase
      .from('si7kaih_journals')
      .upsert(rows, { onConflict: 'student_id,date' });

    if (!error) {
      successCount = journals.length;
      currentStatus.lastSyncedAt = new Date().toISOString();
      notifyListeners();
    } else {
      console.warn('Batch journals upsert notice:', error.message);
    }
  } catch (err) {
    console.warn('Batch journals upsert error:', err);
  }

  return successCount;
}

// ----------------------------------------------------------------------------
// 2. REFLECTIONS REPOSITORY (STUDENT & PARENT)
// ----------------------------------------------------------------------------

export async function fetchReflectionsFromSupabase(): Promise<{
  studentReflection?: StudentMonthlyReflection;
  parentReflection?: ParentMonthlyReflection;
} | null> {
  try {
    const { data, error } = await supabase.from('si7kaih_reflections').select('*');
    if (error || !Array.isArray(data)) return null;

    let studentRef: StudentMonthlyReflection | undefined;
    let parentRef: ParentMonthlyReflection | undefined;

    for (const item of data) {
      if (item.type === 'STUDENT' && !studentRef) {
        studentRef = item.data;
      } else if (item.type === 'PARENT' && !parentRef) {
        parentRef = item.data;
      }
    }

    return { studentReflection: studentRef, parentReflection: parentRef };
  } catch (err) {
    console.warn('Error fetching reflections from Supabase:', err);
    return null;
  }
}

export async function saveStudentReflectionToSupabase(
  ref: StudentMonthlyReflection,
  studentId: string = 'usr-student-01'
): Promise<boolean> {
  try {
    const id = `refl-stu-${ref.year}-${ref.month}-${studentId}`;
    const { error } = await supabase.from('si7kaih_reflections').upsert(
      {
        id,
        type: 'STUDENT',
        target_id: studentId,
        month: ref.month,
        year: ref.year,
        data: ref,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (!error) {
      currentStatus.lastSyncedAt = new Date().toISOString();
      currentStatus.syncCount++;
      currentStatus.lastSyncEvent = 'Penyimpanan refleksi bulanan siswa';
      notifyListeners();

      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({
            type: 'REFLECTION_SAVED',
            reflectionType: 'STUDENT',
            reflection: ref,
            timestamp: Date.now(),
          });
        } catch (_e) {}
      }
    }

    return !error;
  } catch (err) {
    console.warn('Error saving student reflection to Supabase:', err);
    return false;
  }
}

export async function saveParentReflectionToSupabase(
  ref: ParentMonthlyReflection,
  parentId: string = 'usr-parent-01'
): Promise<boolean> {
  try {
    const id = `refl-par-${ref.year}-${ref.month}-${parentId}`;
    const { error } = await supabase.from('si7kaih_reflections').upsert(
      {
        id,
        type: 'PARENT',
        target_id: parentId,
        month: ref.month,
        year: ref.year,
        data: ref,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (!error) {
      currentStatus.lastSyncedAt = new Date().toISOString();
      currentStatus.syncCount++;
      currentStatus.lastSyncEvent = 'Penyimpanan refleksi bulanan orang tua';
      notifyListeners();

      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({
            type: 'REFLECTION_SAVED',
            reflectionType: 'PARENT',
            reflection: ref,
            timestamp: Date.now(),
          });
        } catch (_e) {}
      }
    }

    return !error;
  } catch (err) {
    console.warn('Error saving parent reflection to Supabase:', err);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 3. USERS POOL REPOSITORY (RBAC & SIM SEKOLAH)
// ----------------------------------------------------------------------------

export async function fetchUsersFromSupabase(): Promise<UserPersona[] | null> {
  try {
    const { data, error } = await supabase.from('si7kaih_users').select('id, data');
    if (error || !Array.isArray(data) || data.length === 0) return null;
    return data
      .filter((d: any) => d && d.id && !d.id.startsWith('sys_'))
      .map((d: any) => d.data as UserPersona);
  } catch (err) {
    console.warn('Error fetching users from Supabase:', err);
    return null;
  }
}

export async function saveUsersToSupabase(users: UserPersona[]): Promise<boolean> {
  if (!users || users.length === 0) return false;
  try {
    const rows = users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      school_id: u.schoolId || null,
      data: u,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('si7kaih_users').upsert(rows, { onConflict: 'id' });
    if (!error) {
      currentStatus.lastSyncedAt = new Date().toISOString();
      currentStatus.syncCount++;
      currentStatus.lastSyncEvent = `Penyimpanan ${users.length} akun pengguna ke Supabase`;
      notifyListeners();

      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({
            type: 'USERS_SAVED',
            users,
            timestamp: Date.now(),
          });
        } catch (_e) {}
      }
    }
    return !error;
  } catch (err) {
    console.warn('Error saving users to Supabase:', err);
    return false;
  }
}

export async function saveSingleUserToSupabase(user: UserPersona): Promise<boolean> {
  try {
    const row = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      school_id: user.schoolId || null,
      data: user,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('si7kaih_users').upsert(row, { onConflict: 'id' });
    if (!error) {
      currentStatus.lastSyncedAt = new Date().toISOString();
      currentStatus.syncCount++;
      currentStatus.lastSyncEvent = `Penyimpanan akun pengguna ${user.name} (${user.role})`;
      notifyListeners();

      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({
            type: 'SINGLE_USER_SAVED',
            user,
            timestamp: Date.now(),
          });
        } catch (_e) {}
      }
    }
    return !error;
  } catch (err) {
    console.warn('Error saving single user to Supabase:', err);
    return false;
  }
}

// Global auto-sync listener for user pool modifications across the app
if (typeof window !== 'undefined') {
  let saveUsersDebounceTimer: any = null;
  window.addEventListener('si7kaih_users_updated', (e: any) => {
    const users = e.detail;
    if (Array.isArray(users) && users.length > 0) {
      if (saveUsersDebounceTimer) clearTimeout(saveUsersDebounceTimer);
      saveUsersDebounceTimer = setTimeout(() => {
        saveUsersToSupabase(users).catch((err) => {
          console.warn('Background auto-sync users to Supabase notice:', err);
        });
      }, 500);
    }
  });
}

// ----------------------------------------------------------------------------
// 4. AUDIT LOGS REPOSITORY
// ----------------------------------------------------------------------------

export async function fetchAuditLogsFromSupabase(): Promise<AuditLog[] | null> {
  try {
    const { data, error } = await supabase
      .from('si7kaih_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !Array.isArray(data)) return null;

    return data.map((d: any) => ({
      id: d.id,
      actorId: d.actor_id,
      actorName: d.actor_name,
      actorRole: d.actor_role,
      action: d.action,
      entityType: 'general',
      entityId: d.id,
      schoolId: d.school_id,
      details: d.details,
      createdAt: d.created_at,
    }));
  } catch (err) {
    console.warn('Error fetching audit logs from Supabase:', err);
    return null;
  }
}

export async function logAuditToSupabase(log: AuditLog): Promise<boolean> {
  try {
    const { error } = await supabase.from('si7kaih_audit_logs').insert({
      id: log.id,
      actor_id: log.actorId,
      actor_name: log.actorName,
      actor_role: log.actorRole,
      action: log.action,
      details: log.details || '',
      school_id: log.schoolId || null,
      created_at: log.createdAt || new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    console.warn('Error logging audit to Supabase:', err);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 5. MASTER SYNC FUNCTION & SUPER ADMIN MASTER DATA REPOSITORY
// ----------------------------------------------------------------------------

export async function syncAllToSupabase(payload: {
  journals: DailyJournal[];
  studentReflection: StudentMonthlyReflection;
  parentReflection: ParentMonthlyReflection;
  users: UserPersona[];
}): Promise<{ success: boolean; message: string }> {
  try {
    await refreshSupabaseStatus();

    let journalsSynced = 0;
    if (payload.journals.length > 0) {
      journalsSynced = await saveAllJournalsToSupabase(payload.journals);
    }

    await saveStudentReflectionToSupabase(payload.studentReflection);
    await saveParentReflectionToSupabase(payload.parentReflection);

    if (payload.users.length > 0) {
      await saveUsersToSupabase(payload.users);
    }

    currentStatus.lastSyncedAt = new Date().toISOString();
    notifyListeners();

    return {
      success: true,
      message: `Berhasil sinkronisasi permanen ke Supabase (${journalsSynced} jurnal tersinkron).`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Sinkronisasi gagal: ${err?.message || 'Gagal menghubungi server'}`,
    };
  }
}

// ----------------------------------------------------------------------------
// SUPER ADMIN MASTER DATA REPOSITORY (SEKOLAH, ROMBEL, SISWA, 7 KEBIASAAN, AKUN)
// ----------------------------------------------------------------------------

export interface SuperAdminMasterPayload {
  users?: UserPersona[];
  schools?: SchoolMaster[];
  rombels?: Rombel[];
  students?: Student[];
  habitMasters?: Record<HabitCode, HabitMaster>;
  syncTimestamp?: number;
  lastUpdatedBy?: string;
  actionType?: string;
}

/**
 * Menyimpan seluruh atau sebagian data master yang dikelola Super Admin ke Supabase
 * dan memicu event realtime ke seluruh perangkat lain.
 */
export async function saveSuperAdminMasterDataToSupabase(
  payload: SuperAdminMasterPayload
): Promise<boolean> {
  try {
    const timestamp = Date.now();
    const isoTime = new Date().toISOString();
    const updatedBy = payload.lastUpdatedBy || 'SUPER_ADMIN';

    // 1. Simpan Master Sekolah jika ada
    if (payload.schools && Array.isArray(payload.schools)) {
      const { error: schoolErr } = await supabase.from('si7kaih_programs').upsert(
        {
          id: 'sys_master_schools',
          school_id: 'SYSTEM',
          title: 'SYS_MASTER_SCHOOLS',
          data: {
            list: payload.schools,
            updatedAt: isoTime,
            updatedBy,
          },
          updated_at: isoTime,
        },
        { onConflict: 'id' }
      );
      if (schoolErr) {
        console.warn('Gagal menyimpan sys_master_schools ke Supabase:', schoolErr);
      }
    }

    // 2. Simpan Master Rombel jika ada
    if (payload.rombels && Array.isArray(payload.rombels)) {
      const { error: rombelErr } = await supabase.from('si7kaih_programs').upsert(
        {
          id: 'sys_master_rombels',
          school_id: 'SYSTEM',
          title: 'SYS_MASTER_ROMBELS',
          data: {
            list: payload.rombels,
            updatedAt: isoTime,
            updatedBy,
          },
          updated_at: isoTime,
        },
        { onConflict: 'id' }
      );
      if (rombelErr) {
        console.warn('Gagal menyimpan sys_master_rombels ke Supabase:', rombelErr);
      }
    }

    // 3. Simpan Master Siswa jika ada
    if (payload.students && Array.isArray(payload.students)) {
      const { error: studentErr } = await supabase.from('si7kaih_programs').upsert(
        {
          id: 'sys_master_students',
          school_id: 'SYSTEM',
          title: 'SYS_MASTER_STUDENTS',
          data: {
            list: payload.students,
            updatedAt: isoTime,
            updatedBy,
          },
          updated_at: isoTime,
        },
        { onConflict: 'id' }
      );
      if (studentErr) {
        console.warn('Gagal menyimpan sys_master_students ke Supabase:', studentErr);
      }
    }

    // 4. Simpan Master 7 Kebiasaan Anak Indonesia Hebat jika ada
    if (payload.habitMasters && typeof payload.habitMasters === 'object') {
      const { error: habitErr } = await supabase.from('si7kaih_programs').upsert(
        {
          id: 'sys_master_habits',
          school_id: 'SYSTEM',
          title: 'SYS_MASTER_HABITS',
          data: {
            dict: payload.habitMasters,
            updatedAt: isoTime,
            updatedBy,
          },
          updated_at: isoTime,
        },
        { onConflict: 'id' }
      );
      if (habitErr) {
        console.warn('Gagal menyimpan sys_master_habits ke Supabase:', habitErr);
      }
    }

    // 5. Simpan Akun Pengguna jika ada
    if (payload.users && Array.isArray(payload.users) && payload.users.length > 0) {
      await saveUsersToSupabase(payload.users);
    }

    // 6. Update metadata sinkronisasi global di tabel si7kaih_users
    // (Tabel ini tergabung dalam supabase_realtime sehingga memicu event seketika ke seluruh perangkat!)
    const syncMetadata: any = {
      type: 'SUPER_ADMIN_MASTER_SYNC',
      actionType: payload.actionType || 'DATA_UPDATE',
      timestamp,
      updatedAt: isoTime,
      lastUpdatedBy: updatedBy,
      counts: {
        schools: payload.schools ? payload.schools.length : undefined,
        rombels: payload.rombels ? payload.rombels.length : undefined,
        students: payload.students ? payload.students.length : undefined,
        users: payload.users ? payload.users.length : undefined,
      },
    };

    // Sematkan array schools langsung dalam event realtime agar perangkat lain langsung menerima data
    if (payload.schools && Array.isArray(payload.schools)) {
      syncMetadata.schools = payload.schools;
    }

    const { error: syncMetaErr } = await supabase.from('si7kaih_users').upsert(
      {
        id: 'sys_master_data_sync',
        username: 'system_master_sync',
        name: 'System Master Sync Metadata',
        role: 'SUPER_ADMIN',
        school_id: 'SYSTEM',
        data: syncMetadata,
        updated_at: isoTime,
      },
      { onConflict: 'id' }
    );
    if (syncMetaErr) {
      console.warn('Gagal menyimpan sys_master_data_sync ke Supabase:', syncMetaErr);
    }

    // 7. Siarkan pesan broadcast channel antar tab / jendela aktif
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'SUPER_ADMIN_MASTER_SYNC',
        masterData: payload,
        timestamp,
      });
    }

    currentStatus.lastSyncedAt = isoTime;
    currentStatus.syncCount++;
    currentStatus.lastSyncEvent = `Data Master Super Admin diperbarui (${updatedBy})`;
    notifyListeners();

    return true;
  } catch (err) {
    console.warn('Error saving Super Admin master data to Supabase:', err);
    return false;
  }
}

/**
 * Mengambil data master terkini (Sekolah, Rombel, Siswa, 7 Kebiasaan, Akun) dari Supabase
 */
export async function fetchSuperAdminMasterDataFromSupabase(): Promise<SuperAdminMasterPayload | null> {
  try {
    const { data: programRows, error } = await supabase
      .from('si7kaih_programs')
      .select('id, data')
      .in('id', ['sys_master_schools', 'sys_master_rombels', 'sys_master_students', 'sys_master_habits']);

    const result: SuperAdminMasterPayload = {
      syncTimestamp: Date.now(),
    };

    if (!error && Array.isArray(programRows)) {
      programRows.forEach((row: any) => {
        if (row.id === 'sys_master_schools' && row.data?.list) {
          result.schools = row.data.list;
        }
        if (row.id === 'sys_master_rombels' && row.data?.list) {
          result.rombels = row.data.list;
        }
        if (row.id === 'sys_master_students' && row.data?.list) {
          result.students = row.data.list;
        }
        if (row.id === 'sys_master_habits' && row.data?.dict) {
          result.habitMasters = row.data.dict;
        }
      });
    }

    // Ambil juga data users terbaru
    const users = await fetchUsersFromSupabase();
    if (users && users.length > 0) {
      result.users = users;
    }

    // Fallback redundancy: jika schools belum didapat dari si7kaih_programs, cek sys_master_data_sync
    if (!result.schools || result.schools.length === 0) {
      try {
        const { data: syncRow } = await supabase
          .from('si7kaih_users')
          .select('data')
          .eq('id', 'sys_master_data_sync')
          .maybeSingle();

        if (syncRow?.data?.schools && Array.isArray(syncRow.data.schools) && syncRow.data.schools.length > 0) {
          result.schools = syncRow.data.schools;
        }
      } catch (_e) {}
    }

    return result;
  } catch (err) {
    console.warn('Error fetching Super Admin master data from Supabase:', err);
    return null;
  }
}

/**
 * Mengambil data master satuan pendidikan terbaru secara langsung dari Supabase
 */
export async function fetchSchoolsFromSupabase(): Promise<SchoolMaster[] | null> {
  try {
    // 1. Coba ambil dari si7kaih_programs (sys_master_schools)
    const { data: row, error } = await supabase
      .from('si7kaih_programs')
      .select('data')
      .eq('id', 'sys_master_schools')
      .maybeSingle();

    if (!error && row?.data?.list && Array.isArray(row.data.list)) {
      return row.data.list as SchoolMaster[];
    }

    // 2. Coba fallback dari si7kaih_users (sys_master_data_sync)
    const { data: syncRow, error: syncError } = await supabase
      .from('si7kaih_users')
      .select('data')
      .eq('id', 'sys_master_data_sync')
      .maybeSingle();

    if (!syncError && syncRow?.data?.schools && Array.isArray(syncRow.data.schools)) {
      return syncRow.data.schools as SchoolMaster[];
    }

    return null;
  } catch (err) {
    console.warn('Error fetching schools from Supabase:', err);
    return null;
  }
}

/**
 * Menyimpan data master satuan pendidikan langsung ke Supabase dan memicu sinkronisasi otomatis ke seluruh perangkat
 */
export async function saveSchoolsToSupabase(
  schools: SchoolMaster[],
  updatedBy: string = 'Super Administrator'
): Promise<boolean> {
  return saveSuperAdminMasterDataToSupabase({
    schools,
    lastUpdatedBy: updatedBy,
    actionType: 'UPDATE_SCHOOLS',
  });
}

/**
 * Menerapkan data master Super Admin ke LocalStorage & menembakkan custom window event
 * agar semua komponen UI terupdate seketika (zero page-refresh).
 */
export function applySuperAdminMasterDataToStorage(data: SuperAdminMasterPayload): boolean {
  let changed = false;
  try {
    if (data.schools && Array.isArray(data.schools)) {
      const current = localStorage.getItem('si7kaih_schools_master_prod');
      const serialized = JSON.stringify(data.schools);
      if (!current || current !== serialized) {
        localStorage.setItem('si7kaih_schools_master_prod', serialized);
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            try {
              window.dispatchEvent(new CustomEvent('si7kaih_schools_updated', { detail: data.schools }));
            } catch (_e) {}
          }, 0);
        }
        changed = true;
      }
    }

    if (data.rombels && Array.isArray(data.rombels)) {
      const current = localStorage.getItem('si7kaih_rombels_mandiri');
      const serialized = JSON.stringify(data.rombels);
      if (!current || current !== serialized) {
        localStorage.setItem('si7kaih_rombels_mandiri', serialized);
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            try {
              window.dispatchEvent(new CustomEvent('si7kaih_rombels_updated', { detail: data.rombels }));
            } catch (_e) {}
          }, 0);
        }
        changed = true;
      }
    }

    if (data.students && Array.isArray(data.students)) {
      const current = localStorage.getItem('si7kaih_students_mandiri');
      const serialized = JSON.stringify(data.students);
      if (!current || current !== serialized) {
        localStorage.setItem('si7kaih_students_mandiri', serialized);
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            try {
              window.dispatchEvent(new CustomEvent('si7kaih_students_updated', { detail: data.students }));
            } catch (_e) {}
          }, 0);
        }
        changed = true;
      }
    }

    if (data.habitMasters && typeof data.habitMasters === 'object') {
      const current = localStorage.getItem('si7kaih_habit_masters_prod');
      const serialized = JSON.stringify(data.habitMasters);
      if (!current || current !== serialized) {
        localStorage.setItem('si7kaih_habit_masters_prod', serialized);
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            try {
              window.dispatchEvent(new CustomEvent('si7kaih_habits_updated', { detail: data.habitMasters }));
            } catch (_e) {}
          }, 0);
        }
        changed = true;
      }
    }

    if (data.users && Array.isArray(data.users)) {
      const sanitizedUsers = data.users.filter((u) => !isDeprecatedOrDummyUser(u));
      const current = localStorage.getItem('si7kaih_users_pool_prod');
      const serialized = JSON.stringify(sanitizedUsers);
      if (!current || current !== serialized) {
        localStorage.setItem('si7kaih_users_pool_prod', serialized);
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            try {
              window.dispatchEvent(new CustomEvent('si7kaih_users_updated', { detail: sanitizedUsers }));
            } catch (_e) {}
          }, 0);
        }
        changed = true;
      }
    }
  } catch (err) {
    console.warn('Error applying master data to storage:', err);
  }
  return changed;
}

/**
 * Sinkronisasi otomatis saat Super Admin login ulang:
 * Mengambil master data Supabase, merekonsiliasi dengan data lokal, mengupdate Supabase
 * dan menyiarkan ke semua perangkat lain secara realtime.
 */
export async function syncOnSuperAdminLogin(
  superAdminUser: UserPersona
): Promise<{ success: boolean; message: string; details: any }> {
  try {
    await refreshSupabaseStatus();

    // 1. Ambil data master cloud dari Supabase
    const remoteMaster = await fetchSuperAdminMasterDataFromSupabase();

    // 2. Ambil data lokal saat ini
    const localSchools = getStoredSchools();
    const localRombels = getStoredRombels();
    const localStudents = getStoredStudents();
    const localHabits = getStoredHabitMasters();
    const localUsers = getStoredUsers();

    // 3. Rekonsiliasi cerdas
    // - Sekolah: gabungkan master sekolah berdasarkan ID
    let finalSchools = localSchools;
    if (remoteMaster?.schools && remoteMaster.schools.length > 0) {
      if (localSchools.length === 0) {
        finalSchools = remoteMaster.schools;
      } else {
        const map = new Map<string, SchoolMaster>();
        remoteMaster.schools.forEach((s) => map.set(s.id, s));
        localSchools.forEach((s) => map.set(s.id, s));
        finalSchools = Array.from(map.values());
      }
    }

    // - Rombel: gabungkan master rombel
    let finalRombels = localRombels;
    if (remoteMaster?.rombels && remoteMaster.rombels.length > 0) {
      if (localRombels.length === 0) {
        finalRombels = remoteMaster.rombels;
      } else {
        const map = new Map<string, Rombel>();
        remoteMaster.rombels.forEach((r) => map.set(r.code || r.name, r));
        localRombels.forEach((r) => map.set(r.code || r.name, r));
        finalRombels = Array.from(map.values());
      }
    }

    // - Peserta Didik: gabungkan berdasarkan NISN
    let finalStudents = localStudents;
    if (remoteMaster?.students && remoteMaster.students.length > 0) {
      if (localStudents.length === 0) {
        finalStudents = remoteMaster.students;
      } else {
        const map = new Map<string, Student>();
        remoteMaster.students.forEach((s) => map.set(s.nisn, s));
        localStudents.forEach((s) => map.set(s.nisn, s));
        finalStudents = Array.from(map.values());
      }
    }

    // - 7 Kebiasaan:
    let finalHabits = localHabits;
    if (remoteMaster?.habitMasters && Object.keys(remoteMaster.habitMasters).length > 0) {
      finalHabits = { ...localHabits, ...remoteMaster.habitMasters };
    }

    // - Pengguna: gabungkan akun dan pastikan akun Super Admin ini aktif
    let finalUsers = localUsers;
    if (remoteMaster?.users && remoteMaster.users.length > 0) {
      const map = new Map<string, UserPersona>();
      remoteMaster.users.forEach((u) => map.set(u.id, u));
      localUsers.forEach((u) => map.set(u.id, u));
      map.set(superAdminUser.id, superAdminUser);
      finalUsers = Array.from(map.values()).filter((u) => !isDeprecatedOrDummyUser(u));
    }

    // 4. Terapkan state terkonsolidasi ke penyimpanan lokal & trigger reactive event
    applySuperAdminMasterDataToStorage({
      schools: finalSchools,
      rombels: finalRombels,
      students: finalStudents,
      habitMasters: finalHabits,
      users: finalUsers,
    });

    // 5. Upload master data terkonsolidasi ke Supabase agar menjadi acuan permanen di Cloud
    await saveSuperAdminMasterDataToSupabase({
      schools: finalSchools,
      rombels: finalRombels,
      students: finalStudents,
      habitMasters: finalHabits,
      users: finalUsers,
      lastUpdatedBy: superAdminUser.name || 'Super Admin',
      actionType: 'SUPER_ADMIN_RE_LOGIN_SYNC',
    });

    // 6. Catat audit log di Supabase
    await logAuditToSupabase({
      id: `audit-login-sync-${Date.now()}`,
      actorId: superAdminUser.id,
      actorName: superAdminUser.name,
      actorRole: 'SUPER_ADMIN',
      action: 'SUPER_ADMIN_LOGIN_RE_SYNC',
      entityType: 'MASTER_DATA',
      entityId: 'ALL',
      details: `Super Admin login ulang & sinkronisasi otomatis seluruh master data (${finalSchools.length} sekolah, ${finalRombels.length} rombel, ${finalStudents.length} siswa, ${finalUsers.length} pengguna) ke semua perangkat`,
      createdAt: new Date().toISOString(),
    });

    // 7. Siarkan pesan broadcast channel antar jendela/tab
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'SUPER_ADMIN_LOGIN_SYNC',
        adminName: superAdminUser.name,
        timestamp: Date.now(),
        masterData: {
          schools: finalSchools,
          rombels: finalRombels,
          students: finalStudents,
          habitMasters: finalHabits,
          users: finalUsers,
        },
      });
    }

    return {
      success: true,
      message: 'Data master berhasil disinkronkan otomatis ke semua perangkat.',
      details: {
        schoolsCount: finalSchools.length,
        rombelsCount: finalRombels.length,
        studentsCount: finalStudents.length,
        usersCount: finalUsers.length,
      },
    };
  } catch (err: any) {
    console.warn('syncOnSuperAdminLogin error:', err);
    return {
      success: false,
      message: `Sinkronisasi login Super Admin gagal: ${err?.message || 'Koneksi terganggu'}`,
      details: null,
    };
  }
}

// ----------------------------------------------------------------------------
// 6. REAL-TIME MULTI-USER AUTO-SYNCHRONIZATION
// ----------------------------------------------------------------------------

export interface AutoSyncCallbacks {
  onJournalUpdate: (journal: DailyJournal, source: 'realtime' | 'poll' | 'broadcast') => void;
  onAllJournalsSync?: (journals: DailyJournal[]) => void;
  onReflectionUpdate?: (
    type: 'STUDENT' | 'PARENT',
    reflection: StudentMonthlyReflection | ParentMonthlyReflection,
    source: 'realtime' | 'poll' | 'broadcast'
  ) => void;
  onUserUpdate?: (user: UserPersona, source: 'realtime' | 'poll' | 'broadcast') => void;
  onAllUsersSync?: (users: UserPersona[], source: 'realtime' | 'poll' | 'broadcast') => void;
  onSuperAdminMasterSync?: (data: SuperAdminMasterPayload, source: 'realtime' | 'poll' | 'broadcast') => void;
  onNotification?: (message: string, detail?: string) => void;
}

export function startAutomaticSynchronization(callbacks: AutoSyncCallbacks): () => void {
  let isCleanedUp = false;
  let realtimeChannel: any = null;

  // A. Realtime Channel using Supabase WebSocket (postgres_changes)
  try {
    realtimeChannel = supabase
      .channel('si7kaih_realtime_stream')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'si7kaih_journals' },
        (payload: any) => {
          if (isCleanedUp) return;
          if (payload.new && payload.new.data) {
            const updatedJournal = payload.new.data as DailyJournal;
            callbacks.onJournalUpdate(updatedJournal, 'realtime');
            currentStatus.syncCount++;
            currentStatus.lastSyncedAt = new Date().toISOString();
            currentStatus.lastSyncEvent = `Pembaruan realtime jurnal (${updatedJournal.studentName || updatedJournal.studentId})`;
            notifyListeners();
            callbacks.onNotification?.(
              'Jurnal diperbarui otomatis',
              `Data jurnal ${updatedJournal.studentName || 'siswa'} disinkronkan langsung dari Supabase.`
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'si7kaih_reflections' },
        (payload: any) => {
          if (isCleanedUp) return;
          if (payload.new && payload.new.data) {
            const type = payload.new.type as 'STUDENT' | 'PARENT';
            const reflection = payload.new.data;
            callbacks.onReflectionUpdate?.(type, reflection, 'realtime');
            currentStatus.syncCount++;
            currentStatus.lastSyncedAt = new Date().toISOString();
            currentStatus.lastSyncEvent = `Pembaruan realtime refleksi ${type === 'PARENT' ? 'orang tua' : 'siswa'}`;
            notifyListeners();
            callbacks.onNotification?.(
              'Refleksi diperbarui otomatis',
              `Refleksi bulanan ${type === 'PARENT' ? 'orang tua' : 'siswa'} disinkronkan secara realtime.`
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'si7kaih_users' },
        (payload: any) => {
          if (isCleanedUp) return;
          if (payload.new && payload.new.data) {
            // Handle Master Sync triggered by Super Admin
            if (payload.new.id === 'sys_master_data_sync') {
              const syncData = payload.new.data;
              if (syncData?.schools && Array.isArray(syncData.schools)) {
                applySuperAdminMasterDataToStorage({ schools: syncData.schools });
                callbacks.onSuperAdminMasterSync?.({ schools: syncData.schools }, 'realtime');
                currentStatus.syncCount++;
                currentStatus.lastSyncedAt = new Date().toISOString();
                currentStatus.lastSyncEvent = 'Sinkronisasi realtime data master satuan pendidikan dari Super Admin';
                notifyListeners();
                callbacks.onNotification?.(
                  'Data Satuan Pendidikan Diperbarui',
                  'Data master satuan pendidikan diperbarui oleh Super Admin dan disinkronkan otomatis.'
                );
              }

              fetchSuperAdminMasterDataFromSupabase().then((masterPayload) => {
                if (masterPayload && !isCleanedUp) {
                  applySuperAdminMasterDataToStorage(masterPayload);
                  callbacks.onSuperAdminMasterSync?.(masterPayload, 'realtime');
                  currentStatus.syncCount++;
                  currentStatus.lastSyncedAt = new Date().toISOString();
                  currentStatus.lastSyncEvent = 'Sinkronisasi realtime data master dari Super Admin';
                  notifyListeners();
                }
              });
              return;
            }

            // Ignore system internal records
            if (payload.new.id && String(payload.new.id).startsWith('sys_')) {
              return;
            }

            const updatedUser = payload.new.data as UserPersona;
            try {
              const raw = localStorage.getItem('si7kaih_users_pool_prod');
              const pool: UserPersona[] = raw ? JSON.parse(raw) : [];
              const idx = pool.findIndex((u) => u.id === updatedUser.id);
              if (idx >= 0) {
                pool[idx] = updatedUser;
              } else {
                pool.push(updatedUser);
              }
              localStorage.setItem('si7kaih_users_pool_prod', JSON.stringify(pool));
              if (typeof window !== 'undefined') {
                setTimeout(() => {
                  try {
                    window.dispatchEvent(new CustomEvent('si7kaih_users_updated', { detail: pool }));
                  } catch (_e) {}
                }, 0);
              }
            } catch (_e) {}

            callbacks.onUserUpdate?.(updatedUser, 'realtime');
            currentStatus.syncCount++;
            currentStatus.lastSyncedAt = new Date().toISOString();
            currentStatus.lastSyncEvent = `Pembaruan realtime profil ${updatedUser.name} (${updatedUser.role})`;
            notifyListeners();
            callbacks.onNotification?.(
              'Profil/Akun Terperbarui',
              `Data akun ${updatedUser.name} (${updatedUser.role}) telah terupdate di semua perangkat.`
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'si7kaih_programs' },
        (payload: any) => {
          if (isCleanedUp) return;
          if (payload.new && payload.new.id) {
            if (payload.new.id === 'sys_master_schools' && payload.new.data?.list) {
              const schoolsList = payload.new.data.list;
              applySuperAdminMasterDataToStorage({ schools: schoolsList });
              callbacks.onSuperAdminMasterSync?.({ schools: schoolsList }, 'realtime');
              currentStatus.syncCount++;
              currentStatus.lastSyncedAt = new Date().toISOString();
              currentStatus.lastSyncEvent = 'Pembaruan data master satuan pendidikan dari Super Admin';
              notifyListeners();
              callbacks.onNotification?.(
                'Data Satuan Pendidikan Diperbarui',
                'Data master satuan pendidikan diperbarui oleh Super Admin dan disinkronkan otomatis.'
              );
            } else if (String(payload.new.id).startsWith('sys_master_')) {
              fetchSuperAdminMasterDataFromSupabase().then((masterPayload) => {
                if (masterPayload && !isCleanedUp) {
                  applySuperAdminMasterDataToStorage(masterPayload);
                  callbacks.onSuperAdminMasterSync?.(masterPayload, 'realtime');
                  currentStatus.syncCount++;
                  currentStatus.lastSyncedAt = new Date().toISOString();
                  currentStatus.lastSyncEvent = 'Pembaruan data master dari Super Admin';
                  notifyListeners();
                }
              });
            }
          }
        }
      )
      .subscribe((status: string) => {
        if (!isCleanedUp) {
          currentStatus.isRealtimeActive = status === 'SUBSCRIBED';
          notifyListeners();
        }
      });
  } catch (err) {
    console.warn('Realtime channel subscription notice:', err);
  }

  // B. Cross-Tab / Cross-Window Broadcast Listener
  const handleBroadcastMessage = (event: MessageEvent) => {
    if (isCleanedUp || !event.data) return;
    if (event.data.type === 'JOURNAL_SAVED' && event.data.journal) {
      callbacks.onJournalUpdate(event.data.journal, 'broadcast');
      currentStatus.syncCount++;
      currentStatus.lastSyncedAt = new Date().toISOString();
      currentStatus.lastSyncEvent = 'Sinkronisasi instan antar jendela browser';
      notifyListeners();
    }
    if (event.data.type === 'REFLECTION_SAVED' && event.data.reflection) {
      callbacks.onReflectionUpdate?.(
        event.data.reflectionType,
        event.data.reflection,
        'broadcast'
      );
      currentStatus.syncCount++;
      currentStatus.lastSyncedAt = new Date().toISOString();
      notifyListeners();
    }
    if (event.data.type === 'SINGLE_USER_SAVED' && event.data.user) {
      const updatedUser = event.data.user as UserPersona;
      try {
        const raw = localStorage.getItem('si7kaih_users_pool_prod');
        const pool: UserPersona[] = raw ? JSON.parse(raw) : [];
        const idx = pool.findIndex((u) => u.id === updatedUser.id);
        if (idx >= 0) {
          pool[idx] = updatedUser;
        } else {
          pool.push(updatedUser);
        }
        localStorage.setItem('si7kaih_users_pool_prod', JSON.stringify(pool));
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            try {
              window.dispatchEvent(new CustomEvent('si7kaih_users_updated', { detail: pool }));
            } catch (_e) {}
          }, 0);
        }
      } catch (_e) {}
      callbacks.onUserUpdate?.(updatedUser, 'broadcast');
      currentStatus.syncCount++;
      currentStatus.lastSyncedAt = new Date().toISOString();
      notifyListeners();
    }
    if (event.data.type === 'USERS_SAVED' && Array.isArray(event.data.users)) {
      callbacks.onAllUsersSync?.(event.data.users, 'broadcast');
      currentStatus.syncCount++;
      currentStatus.lastSyncedAt = new Date().toISOString();
      notifyListeners();
    }
    if (
      (event.data.type === 'SUPER_ADMIN_MASTER_SYNC' || event.data.type === 'SUPER_ADMIN_LOGIN_SYNC') &&
      event.data.masterData
    ) {
      applySuperAdminMasterDataToStorage(event.data.masterData);
      callbacks.onSuperAdminMasterSync?.(event.data.masterData, 'broadcast');
      currentStatus.syncCount++;
      currentStatus.lastSyncedAt = new Date().toISOString();
      currentStatus.lastSyncEvent = 'Sinkronisasi data master Super Admin antar tab/jendela';
      notifyListeners();
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // C. Unified remote sync runner for background polling and user access events
  const syncAllRemoteData = async () => {
    if (isCleanedUp) return;
    try {
      // 1. Fetch latest journals
      const remoteJournals = await fetchJournalsFromSupabase();
      if (remoteJournals && remoteJournals.length > 0 && !isCleanedUp) {
        callbacks.onAllJournalsSync?.(remoteJournals);
      }

      // 2. Fetch latest users
      const remoteUsers = await fetchUsersFromSupabase();
      if (remoteUsers && remoteUsers.length > 0 && !isCleanedUp) {
        try {
          const raw = localStorage.getItem('si7kaih_users_pool_prod');
          const localPool: UserPersona[] = raw ? JSON.parse(raw) : [];
          const userMap = new Map<string, UserPersona>();
          localPool.forEach((u) => userMap.set(u.id, u));
          let hasDiff = false;
          remoteUsers.forEach((ru) => {
            const ex = userMap.get(ru.id);
            if (!ex || JSON.stringify(ex) !== JSON.stringify(ru)) {
              userMap.set(ru.id, ru);
              hasDiff = true;
            }
          });
          if (hasDiff) {
            const merged = Array.from(userMap.values());
            localStorage.setItem('si7kaih_users_pool_prod', JSON.stringify(merged));
            if (typeof window !== 'undefined') {
              setTimeout(() => {
                try {
                  window.dispatchEvent(new CustomEvent('si7kaih_users_updated', { detail: merged }));
                } catch (_e) {}
              }, 0);
            }
            callbacks.onAllUsersSync?.(merged, 'poll');
          }
        } catch (_e) {
          callbacks.onAllUsersSync?.(remoteUsers, 'poll');
        }
      }

      // 3. Fetch latest reflections
      const remoteReflections = await fetchReflectionsFromSupabase();
      if (remoteReflections && !isCleanedUp) {
        if (remoteReflections.studentReflection) {
          callbacks.onReflectionUpdate?.('STUDENT', remoteReflections.studentReflection, 'poll');
        }
        if (remoteReflections.parentReflection) {
          callbacks.onReflectionUpdate?.('PARENT', remoteReflections.parentReflection, 'poll');
        }
      }

      // 4. Fetch latest master data (Sekolah, Rombel, Siswa, 7 Kebiasaan) from Super Admin
      const remoteMaster = await fetchSuperAdminMasterDataFromSupabase();
      if (remoteMaster && !isCleanedUp) {
        const masterChanged = applySuperAdminMasterDataToStorage(remoteMaster);
        if (masterChanged) {
          callbacks.onSuperAdminMasterSync?.(remoteMaster, 'poll');
          currentStatus.syncCount++;
          currentStatus.lastSyncedAt = new Date().toISOString();
          notifyListeners();
        }
      }
    } catch (_e) {
      // Quiet background check
    }
  };

  // Run periodic polling every 10 seconds when tab is visible
  const pollInterval = setInterval(() => {
    if (isCleanedUp || (typeof document !== 'undefined' && document.visibilityState === 'hidden')) return;
    syncAllRemoteData();
  }, 10000);

  // Immediate sync whenever user accesses tab, switches back to app, or regains network
  const handleVisibilityOrFocus = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible' && !isCleanedUp) {
      syncAllRemoteData();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('online', handleVisibilityOrFocus);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    }
  }

  // Cleanup handler
  return () => {
    isCleanedUp = true;
    clearInterval(pollInterval);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('online', handleVisibilityOrFocus);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      }
    }
    if (realtimeChannel) {
      try {
        supabase.removeChannel(realtimeChannel);
      } catch (_e) {}
    }
  };
}

