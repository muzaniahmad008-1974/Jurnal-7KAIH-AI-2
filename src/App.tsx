/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// SI-7KAIH AI - Sistem Jurnal & Monitoring 7 Kebiasaan Anak Indonesia Hebat
// Main Application Component
// ============================================================================

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  USER_PERSONAS,
  UserPersona,
  HABIT_LIST,
  getStoredUsers,
  saveStoredUsers,
  LogoutSettings,
  getStoredLogoutSettings,
  isDeprecatedOrDummyUser,
  isDeprecatedOrDummyJournal,
  setUserPassword,
} from './lib/constants';
import {
  DailyJournal,
  Badge,
  SchoolProgram,
  FollowUpPlan,
  StudentMonthlyReflection,
  ParentMonthlyReflection,
  HabitCode,
} from '../packages/types/src/index';
import {
  DEFAULT_BADGES,
  DEFAULT_PROGRAMS,
  DEFAULT_FOLLOW_UPS,
  DEFAULT_STUDENT_REFLECTION,
  DEFAULT_PARENT_REFLECTION,
  generateSyntheticJournals,
  calculateBadgesFromJournals,
} from './lib/mockData';
import { RESTORED_JOURNALS_REAL, RESTORED_STUDENTS } from './lib/jorongRestoredData';
import { normalizeClassName } from './lib/studentData';

// UI Components
import { Header } from './components/Header';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentJournalView } from './components/StudentJournalView';
import { DailyJournalModal } from './components/DailyJournalModal';
import { CalendarView } from './components/CalendarView';
import { StudentReflectionView } from './components/StudentReflectionView';
import { BadgesView } from './components/BadgesView';
import { AICoachView } from './components/AICoachView';
import { ParentValidationView } from './components/ParentValidationView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { PrincipalDashboard } from './components/PrincipalDashboard';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { SchoolAdminView } from './components/SchoolAdminView';
import { SuperAdminView } from './components/SuperAdminView';
import { ReportView } from './components/ReportView';
import { LoginModal } from './components/LoginModal';
import { LoginDashboard } from './components/LoginDashboard';
import { AccountSettingsView } from './components/AccountSettingsView';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { SupabaseModal } from './components/SupabaseModal';
import { InactivityWarningModal } from './components/InactivityWarningModal';
import {
  fetchJournalsFromSupabase,
  fetchReflectionsFromSupabase,
  fetchUsersFromSupabase,
  saveJournalToSupabase,
  deleteJournalFromSupabase,
  deleteAllJournalsFromSupabase,
  recordDeletedJournalTombstone,
  clearJournalTombstone,
  isJournalTombstoned,
  saveStudentReflectionToSupabase,
  saveParentReflectionToSupabase,
  saveSingleUserToSupabase,
  refreshSupabaseStatus,
  startAutomaticSynchronization,
  syncOnSuperAdminLogin,
  fetchSuperAdminMasterDataFromSupabase,
  applySuperAdminMasterDataToStorage,
} from './lib/supabaseService';
import { Database, Zap, CheckCircle2, Clock } from 'lucide-react';
import { formatRealtimeSaveTime, getLocalDateString } from './lib/dateUtils';

export default function App() {
  // Active Persona (Loaded from persistent storage if active session exists in browser)
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(() => {
    try {
      const saved = localStorage.getItem('si7kaih_persona_prod');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isDeprecatedOrDummyUser(parsed)) {
          localStorage.removeItem('si7kaih_persona_prod');
          localStorage.removeItem('si7kaih_session_active');
        } else {
          const storedList = getStoredUsers();
          const match = storedList.find((p) => p.id === parsed.id);
          if (match) {
            return match;
          }
        }
      }
    } catch (_e) {}
    const superAdmin =
      getStoredUsers().find((p) => p.role === 'SUPER_ADMIN') ||
      USER_PERSONAS.find((p) => p.role === 'SUPER_ADMIN') ||
      USER_PERSONAS[0];
    return superAdmin;
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  // Hanya buka view APP jika ada sesi login aktif yang tersimpan otomatis di browser (localStorage)
  const [viewMode, setViewMode] = useState<'APP' | 'LOGIN_DASHBOARD'>(() => {
    try {
      const activeSession = localStorage.getItem('si7kaih_session_active');
      const savedPersona = localStorage.getItem('si7kaih_persona_prod');
      if (savedPersona) {
        const parsed = JSON.parse(savedPersona);
        if (isDeprecatedOrDummyUser(parsed)) {
          localStorage.removeItem('si7kaih_persona_prod');
          localStorage.removeItem('si7kaih_session_active');
          return 'LOGIN_DASHBOARD';
        }
      }
      if (activeSession === 'true' && savedPersona) {
        return 'APP';
      }
    } catch (_e) {}
    return 'LOGIN_DASHBOARD';
  });

  // Logout Settings and Session Duration Management
  const [logoutSettings, setLogoutSettings] = useState<LogoutSettings>(() => getStoredLogoutSettings());
  const [storedUsers, setStoredUsers] = useState<UserPersona[]>(() => getStoredUsers());

  // Listen to users pool updates
  useEffect(() => {
    const handleUsersUpdated = () => {
      setStoredUsers(getStoredUsers());
    };
    window.addEventListener('si7kaih_users_updated', handleUsersUpdated);
    window.addEventListener('storage', handleUsersUpdated);
    return () => {
      window.removeEventListener('si7kaih_users_updated', handleUsersUpdated);
      window.removeEventListener('storage', handleUsersUpdated);
    };
  }, []);

  // Listen to external/SuperAdmin logout settings updates
  useEffect(() => {
    const handleLogoutSettingsUpdated = () => {
      setLogoutSettings(getStoredLogoutSettings());
    };
    window.addEventListener('si7kaih_logout_settings_updated', handleLogoutSettingsUpdated);
    window.addEventListener('storage', handleLogoutSettingsUpdated);
    return () => {
      window.removeEventListener('si7kaih_logout_settings_updated', handleLogoutSettingsUpdated);
      window.removeEventListener('storage', handleLogoutSettingsUpdated);
    };
  }, []);

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isInactivityWarningOpen, setIsInactivityWarningOpen] = useState(false);
  const [inactivityTimeoutMinutes, setInactivityTimeoutMinutes] = useState<number>(5);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDurationSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  const sessionDurationFormatted = useMemo(() => {
    const mins = Math.floor(sessionDurationSeconds / 60);
    const secs = sessionDurationSeconds % 60;
    if (mins === 0) return `${secs} detik`;
    return `${mins}m ${secs}s`;
  }, [sessionDurationSeconds]);

  // Core domain states with LocalStorage persistence for production continuity
  // Sinkronkan data jurnal murni sesuai data riil yang diinput oleh siswa
  const [journals, setJournals] = useState<DailyJournal[]>(() => {
    try {
      const resetKey = 'si7kaih_reset_7b_oct02_v2';
      const studentResetKey = 'si7kaih_students_clean_v7_nodummy';

      // Bersihkan cache siswa lama untuk menghapus 32 data dummy legacy 8-C
      if (!localStorage.getItem(studentResetKey)) {
        localStorage.setItem('si7kaih_students_mandiri', JSON.stringify(RESTORED_STUDENTS));
        localStorage.setItem(studentResetKey, 'true');
      }

      const TARGET_RESET_7B_DATES = new Set([
        '2026-09-22',
        '2026-09-23',
        '2026-09-24',
        '2026-09-25',
        '2026-09-26',
        '2026-09-27',
      ]);

      const s7BIds = new Set(RESTORED_STUDENTS.filter((s) => normalizeClassName(s.className) === '7-B').map((s) => s.id));
      const s7BNisns = new Set(RESTORED_STUDENTS.filter((s) => normalizeClassName(s.className) === '7-B').map((s) => s.nisn));

      const is7BTargetDate = (j: DailyJournal) => {
        const sClass = (j as any).studentClass;
        const is7B =
          s7BIds.has(j.studentId) ||
          s7BNisns.has(j.studentNisn) ||
          (j.className && (j.className.includes('7-B') || j.className.includes('7B'))) ||
          (sClass && (sClass.includes('7-B') || sClass.includes('7B'))) ||
          normalizeClassName(j.className) === '7-B';
        const d = j.journalDate || (j as any).date;
        return is7B && d && TARGET_RESET_7B_DATES.has(d);
      };

      const saved = localStorage.getItem('si7kaih_journals_prod');
      if (localStorage.getItem(resetKey) && saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const filtered = parsed
              .filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j))
              .filter((j: DailyJournal) => !is7BTargetDate(j));
            
            // Pastikan entri 2 Oktober dari RESTORED_JOURNALS_REAL tidak hilang jika belum ada
            const existingKeys = new Set(
              filtered.map((j: DailyJournal) => `${j.studentId}_${j.journalDate || (j as any).date}`)
            );
            RESTORED_JOURNALS_REAL.forEach((rj) => {
              const rDate = rj.journalDate || (rj as any).date;
              if (rDate === '2026-10-02' && !existingKeys.has(`${rj.studentId}_${rDate}`)) {
                filtered.push(rj);
              }
            });
            return filtered;
          }
        } catch (_e) {}
      }

      // Reset cache: bersihkan seluruh isian jurnal 7-B tanggal 22 s.d. 27 September
      // Namun pertahankan dan pastikan seluruh isian tanggal 2 Oktober siswa kelas 7-B aman tersimpan
      let cleanList = RESTORED_JOURNALS_REAL;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const map = new Map<string, DailyJournal>();
            parsed
              .filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j))
              .filter((j: DailyJournal) => !is7BTargetDate(j))
              .forEach((pj: DailyJournal) => {
                map.set(pj.id, pj);
                const d = pj.journalDate || (pj as any).date;
                if (pj.studentId && d) {
                  map.set(`${pj.studentId}_${d}`, pj);
                }
              });

            // Masukkan RESTORED_JOURNALS_REAL (termasuk 2 Oktober) jika belum ada di map
            RESTORED_JOURNALS_REAL.forEach((rj) => {
              const d = rj.journalDate || (rj as any).date;
              const key = `${rj.studentId}_${d}`;
              if (!map.has(rj.id) && !map.has(key)) {
                map.set(rj.id, rj);
              }
            });

            cleanList = Array.from(map.values());
          }
        } catch (_e) {}
      }

      localStorage.setItem('si7kaih_journals_prod', JSON.stringify(cleanList));
      localStorage.setItem(resetKey, 'true');

      // Rekam tombstone untuk 7-B tanggal 22-27 September agar tidak ter-resurrect
      try {
        const s7BStudents = RESTORED_STUDENTS.filter((s) => normalizeClassName(s.className) === '7-B');
        TARGET_RESET_7B_DATES.forEach((d) => {
          s7BStudents.forEach((st) => {
            recordDeletedJournalTombstone(st.id, d, st.nisn, st.name, `journal-${d}-${st.id}`);
          });
        });
        // Pastikan tombstones untuk 2 Oktober DIBERSIHKAN secara tuntas
        s7BStudents.forEach((st) => {
          clearJournalTombstone(st.id, '2026-10-02', st.nisn, st.name, `journal-2026-10-02-${st.id}`);
        });
      } catch (_e) {}

      // Bersihkan tombstone legacy wildcard any_* yang menyebabkan konflik antar-siswa
      const rawTs = localStorage.getItem('si7kaih_deleted_journals_tombstones');
      if (rawTs) {
        try {
          const tsObj = JSON.parse(rawTs);
          let tsChanged = false;
          Object.keys(tsObj).forEach((k) => {
            if (k.startsWith('any_') || k.includes('2026-10-02')) {
              delete tsObj[k];
              tsChanged = true;
            }
          });
          if (tsChanged) {
            localStorage.setItem('si7kaih_deleted_journals_tombstones', JSON.stringify(tsObj));
          }
        } catch (_e) {}
      }
      return cleanList;
    } catch (_e) {
      return RESTORED_JOURNALS_REAL;
    }
  });

  // Listen to journal updates across tabs for realtime synchronization (avoid self-triggering loop)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'si7kaih_journals_prod' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j));
            setJournals((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(cleaned)) {
                return prev;
              }
              return cleaned;
            });
          }
        } catch (_e) {}
      }
    };

    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('si7kaih_sync_channel');
        bc.onmessage = (msg) => {
          if (msg.data?.type === 'JOURNALS_UPDATED' && msg.data?.sender !== 'APP_ROOT') {
            try {
              const saved = localStorage.getItem('si7kaih_journals_prod');
              if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                  const cleaned = parsed.filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j));
                  setJournals((prev) => {
                    if (JSON.stringify(prev) === JSON.stringify(cleaned)) {
                      return prev;
                    }
                    return cleaned;
                  });
                }
              }
            } catch (_e) {}
          }
        };
      } catch (_e) {}
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, []);

  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const savedJournals = localStorage.getItem('si7kaih_journals_prod');
      const parsedJournals: DailyJournal[] = savedJournals ? JSON.parse(savedJournals) : [];
      return calculateBadgesFromJournals(parsedJournals);
    } catch (_e) {}
    return DEFAULT_BADGES;
  });

  const [programs, setPrograms] = useState<SchoolProgram[]>(() => {
    try {
      const saved = localStorage.getItem('si7kaih_programs_prod');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (p: SchoolProgram) => !p.id.startsWith('prog-0') && !p.id.includes('default') && !p.id.includes('sample')
          );
        }
      }
    } catch (_e) {}
    return [];
  });

  const [followUps, setFollowUps] = useState<FollowUpPlan[]>(() => {
    try {
      const saved = localStorage.getItem('si7kaih_followups_prod');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (f: FollowUpPlan) => !f.id.startsWith('rtl-0') && !f.id.includes('default') && !f.id.includes('sample')
          );
        }
      }
    } catch (_e) {}
    return [];
  });

  const [studentReflection, setStudentReflection] = useState<StudentMonthlyReflection>(() => {
    try {
      const saved = localStorage.getItem('si7kaih_student_reflection_prod');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.rootCause === 'string' && parsed.rootCause.includes('membaca komik')) {
          return DEFAULT_STUDENT_REFLECTION;
        }
        return parsed;
      }
    } catch (_e) {}
    return DEFAULT_STUDENT_REFLECTION;
  });

  const [parentReflection, setParentReflection] = useState<ParentMonthlyReflection>(() => {
    try {
      const saved = localStorage.getItem('si7kaih_parent_reflection_prod');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Hapus data default/dummy lawas atau data tanpa studentId yang jelas
        if (
          !parsed ||
          !parsed.studentId ||
          (typeof parsed.observedChange === 'string' &&
            (parsed.observedChange.includes('Budi') ||
              parsed.observedChange.includes('Contoh') ||
              parsed.observedChange.includes('Default')))
        ) {
          localStorage.removeItem('si7kaih_parent_reflection_prod');
          return DEFAULT_PARENT_REFLECTION;
        }
        return parsed;
      }
    } catch (_e) {}
    return DEFAULT_PARENT_REFLECTION;
  });

  // Sync to LocalStorage hanya saat user berada dalam mode sesi aplikasi aktif
  useEffect(() => {
    try {
      if (viewMode === 'APP') {
        localStorage.setItem('si7kaih_persona_prod', JSON.stringify(currentPersona));
        localStorage.setItem('si7kaih_session_active', 'true');
      }
    } catch (_e) {}
  }, [currentPersona, viewMode]);

  useEffect(() => {
    try {
      localStorage.setItem('si7kaih_journals_prod', JSON.stringify(journals));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('si7kaih_journals_updated', { detail: journals }));
      }
    } catch (_e) {}
    // Reset or unlock badges dynamically based on updated journal records without triggering reference churn
    setBadges((prevBadges) => {
      let targetJournals = journals;
      if (currentPersona.role === 'STUDENT') {
        targetJournals = journals.filter(
          (j) =>
            isJournalMatchingCurrentPersona(j) &&
            !isDeprecatedOrDummyJournal(j) &&
            !isJournalTombstoned(j.studentId, j.journalDate || (j as any).date, j.studentNisn, j.studentName, j.id)
        );
      } else if (currentPersona.role === 'PARENT') {
        const cNisn = (currentPersona.childNisn || '').trim();
        const cName = (currentPersona.childName || '').toLowerCase().trim();
        targetJournals = journals.filter(
          (j) =>
            !isDeprecatedOrDummyJournal(j) &&
            !isJournalTombstoned(j.studentId, j.journalDate || (j as any).date, j.studentNisn, j.studentName, j.id) &&
            ((cNisn && j.studentNisn && j.studentNisn === cNisn) ||
              (cName && j.studentName && j.studentName.toLowerCase().trim() === cName))
        );
      }
      const newBadges = calculateBadgesFromJournals(targetJournals);
      if (JSON.stringify(prevBadges) === JSON.stringify(newBadges)) {
        return prevBadges;
      }
      return newBadges;
    });
  }, [journals, currentPersona]);

  useEffect(() => {
    try {
      localStorage.setItem('si7kaih_badges_prod', JSON.stringify(badges));
    } catch (_e) {}
  }, [badges]);

  useEffect(() => {
    try {
      localStorage.setItem('si7kaih_programs_prod', JSON.stringify(programs));
    } catch (_e) {}
  }, [programs]);

  useEffect(() => {
    try {
      localStorage.setItem('si7kaih_followups_prod', JSON.stringify(followUps));
    } catch (_e) {}
  }, [followUps]);

  useEffect(() => {
    try {
      localStorage.setItem('si7kaih_student_reflection_prod', JSON.stringify(studentReflection));
    } catch (_e) {}
  }, [studentReflection]);

  useEffect(() => {
    try {
      localStorage.setItem('si7kaih_parent_reflection_prod', JSON.stringify(parentReflection));
    } catch (_e) {}
  }, [parentReflection]);

  // Modals state
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [selectedJournalDate, setSelectedJournalDate] = useState<string>(() => '2026-10-02');
  const [modalTargetStudent, setModalTargetStudent] = useState<{
    id: string;
    name: string;
    nisn?: string;
    className?: string;
    schoolId?: string;
    schoolName?: string;
  } | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportStudent, setSelectedReportStudent] = useState<any | null>(null);

  const handleOpenReportModal = (studentData?: any) => {
    if (studentData && (studentData.name || studentData.nisn || studentData.id)) {
      setSelectedReportStudent(studentData);
    } else {
      setSelectedReportStudent(null);
    }
    setIsReportModalOpen(true);
  };
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Real-time synchronization toast and status notification
  const [syncToast, setSyncToast] = useState<{
    id: string;
    title: string;
    detail?: string;
  } | null>(null);

  // Auto-dismiss sync toast after 4.5 seconds
  useEffect(() => {
    if (!syncToast) return;
    const timer = setTimeout(() => {
      setSyncToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [syncToast]);

  // Synchronize initial data from Supabase backend & start live auto-sync
  useEffect(() => {
    let isMounted = true;
    const loadFromSupabase = async () => {
      try {
        await refreshSupabaseStatus();
        const [remoteJournals, remoteReflections, remoteUsers] = await Promise.all([
          fetchJournalsFromSupabase(),
          fetchReflectionsFromSupabase(),
          fetchUsersFromSupabase(),
        ]);
        if (isMounted) {
          if (remoteJournals && remoteJournals.length > 0) {
            const filteredJournals = remoteJournals.filter(
              (j) =>
                !isJournalTombstoned(j.studentId, j.journalDate || (j as any).date, j.studentNisn, j.studentName, j.id) &&
                !isDeprecatedOrDummyJournal(j)
            );
            const cleanJournals = filteredJournals.map((j) => {
              const cleanSchool = (j.schoolName || '').replace(/\s*\(Sekolah Dihapus\)/gi, '').trim();
              return {
                ...j,
                schoolName:
                  !cleanSchool || cleanSchool.toLowerCase().includes('jorong')
                    ? 'UPTD SMPN 1 Jorong'
                    : cleanSchool,
                schoolId: 'sch-smpn1-jorong',
              };
            });
            // Gabungkan entri remote dengan entri lokal yang valid (termasuk isian 28 September dan 2 Oktober siswa 7-B)
            // KECUALI entri yang sudah dikosongkan/ditombstone oleh siswa
            setJournals((prev) => {
              const prevMap = new Map<string, DailyJournal>();
              prev.forEach((pj) => {
                if (!isDeprecatedOrDummyJournal(pj) && !isJournalTombstoned(pj.studentId, pj.journalDate || (pj as any).date, pj.studentNisn, pj.studentName, pj.id)) {
                  prevMap.set(pj.id, pj);
                  const pDate = pj.journalDate || (pj as any).date;
                  if (pj.studentId && pDate) {
                    prevMap.set(`${pj.studentId}_${pDate}`, pj);
                  }
                }
              });

              // Smart merge: prioritaskan local update jika lebih baru dari remote
              const resolvedRemote = cleanJournals.map((rj) => {
                const rDate = rj.journalDate || (rj as any).date;
                const local = prevMap.get(rj.id) || (rj.studentId && rDate ? prevMap.get(`${rj.studentId}_${rDate}`) : undefined);
                if (local) {
                  const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
                  const remoteTime = rj.updatedAt ? new Date(rj.updatedAt).getTime() : 0;
                  if (localTime >= remoteTime || (local.completedCount || 0) > (rj.completedCount || 0)) {
                    return local;
                  }
                }
                return rj;
              });

              const resolvedMap = new Map<string, DailyJournal>();
              resolvedRemote.forEach((rj) => resolvedMap.set(rj.id, rj));
              prev.forEach((pj) => {
                if (!resolvedMap.has(pj.id) && !isDeprecatedOrDummyJournal(pj) && !isJournalTombstoned(pj.studentId, pj.journalDate || (pj as any).date, pj.studentNisn, pj.studentName, pj.id)) {
                  resolvedMap.set(pj.id, pj);
                }
              });
              RESTORED_JOURNALS_REAL.forEach((rj) => {
                const rDate = rj.journalDate || (rj as any).date;
                const hasMatch = Array.from(resolvedMap.values()).some((ej) => {
                  const eDate = ej.journalDate || (ej as any).date;
                  return ej.id === rj.id || (ej.studentId === rj.studentId && eDate === rDate);
                });
                if (!hasMatch && !isDeprecatedOrDummyJournal(rj) && !isJournalTombstoned(rj.studentId, rDate, rj.studentNisn, rj.studentName, rj.id)) {
                  resolvedMap.set(rj.id, rj);
                }
              });

              const mergedJournals = Array.from(resolvedMap.values());
              try {
                localStorage.setItem('si7kaih_journals_prod', JSON.stringify(mergedJournals));
              } catch (_e) {}
              return mergedJournals;
            });
          } else {
            // Ketika remote kosong/offline: JANGAN PERNAH menimpa data lokal dengan RESTORED_JOURNALS_REAL!
            // Pertahankan data lokal siswa yang sedang berjalan (termasuk isian 28 September dan penghapusan)
            setJournals((prev) => {
              const localClean = prev.filter(
                (j) =>
                  !isDeprecatedOrDummyJournal(j) &&
                  !isJournalTombstoned(j.studentId, j.journalDate || (j as any).date, j.studentNisn, j.studentName, j.id)
              );
              if (localClean.length > 0) {
                try {
                  localStorage.setItem('si7kaih_journals_prod', JSON.stringify(localClean));
                } catch (_e) {}
                return localClean;
              }
              const cleanReal = RESTORED_JOURNALS_REAL.filter(
                (rj) =>
                  !isDeprecatedOrDummyJournal(rj) &&
                  !isJournalTombstoned(rj.studentId, rj.journalDate || (rj as any).date, rj.studentNisn, rj.studentName, rj.id)
              );
              try {
                localStorage.setItem('si7kaih_journals_prod', JSON.stringify(cleanReal));
              } catch (_e) {}
              return cleanReal;
            });
          }
          if (remoteReflections) {
            if (remoteReflections.studentReflection) {
              setStudentReflection(remoteReflections.studentReflection);
            }
            if (remoteReflections.parentReflection) {
              setParentReflection(remoteReflections.parentReflection);
            }
          }
          if (remoteUsers && remoteUsers.length > 0) {
            try {
              localStorage.setItem('si7kaih_users_pool_prod', JSON.stringify(remoteUsers));
              setTimeout(() => {
                try {
                  window.dispatchEvent(new CustomEvent('si7kaih_users_updated', { detail: remoteUsers }));
                } catch (_e) {}
              }, 0);
              setCurrentPersona((prev) => {
                const match = remoteUsers.find((u) => u.id === prev.id || u.username === prev.username);
                if (match && JSON.stringify(match) !== JSON.stringify(prev)) {
                  localStorage.setItem('si7kaih_persona_prod', JSON.stringify(match));
                  return match;
                }
                return prev;
              });
            } catch (_e) {}
          }
        }
      } catch (err) {
        console.warn('Initial Supabase fetch check:', err);
      }

      // Always pull latest Super Admin master data (Schools, Rombels, Students, Habits) from Supabase on any device
      try {
        const masterData = await fetchSuperAdminMasterDataFromSupabase();
        if (masterData && isMounted) {
          applySuperAdminMasterDataToStorage(masterData);
          if (masterData.schools && Array.isArray(masterData.schools)) {
            try {
              window.dispatchEvent(new CustomEvent('si7kaih_schools_updated', { detail: masterData.schools }));
            } catch (_e) {}
          }
          if (masterData.rombels && Array.isArray(masterData.rombels)) {
            try {
              window.dispatchEvent(new CustomEvent('si7kaih_rombels_updated', { detail: masterData.rombels }));
            } catch (_e) {}
          }
          if (masterData.students && Array.isArray(masterData.students)) {
            try {
              window.dispatchEvent(new CustomEvent('si7kaih_students_updated', { detail: masterData.students }));
            } catch (_e) {}
          }
        }
      } catch (err) {
        console.warn('Initial Super Admin master data fetch check:', err);
      }

      // If current active session is Super Admin, trigger auto-sync silently in background on boot
      if (currentPersona.role === 'SUPER_ADMIN') {
        syncOnSuperAdminLogin(currentPersona).catch((err) =>
          console.warn('Initial Super Admin sync check:', err)
        );
      }
    };
    loadFromSupabase();

    // Start Real-Time Multi-User Auto Synchronization (runs quietly in background)
    const stopAutoSync = startAutomaticSynchronization({
      onJournalUpdate: (updatedJournal, _source) => {
        if (!isMounted) return;
        const date = updatedJournal.journalDate || (updatedJournal as any).date;
        if (isJournalTombstoned(updatedJournal.studentId, date, updatedJournal.studentNisn, updatedJournal.studentName, updatedJournal.id)) {
          return;
        }
        setJournals((prev) => {
          const idx = prev.findIndex((j) => {
            if (j.id && updatedJournal.id && j.id === updatedJournal.id) return true;
            const jDate = j.journalDate || (j as any).date;
            const targetDate = updatedJournal.journalDate || (updatedJournal as any).date;
            if (jDate !== targetDate) return false;

            const jId = (j.studentId || '').trim().toLowerCase();
            const targetId = (updatedJournal.studentId || '').trim().toLowerCase();
            if (jId && targetId && jId === targetId) return true;

            const jNisn = (j.studentNisn || '').trim();
            const targetNisn = (updatedJournal.studentNisn || '').trim();
            if (jNisn && targetNisn && jNisn === targetNisn) return true;

            const jName = (j.studentName || '').trim().toLowerCase();
            const targetName = (updatedJournal.studentName || '').trim().toLowerCase();
            if (jName && targetName && jName === targetName) {
              if (
                !updatedJournal.className ||
                !j.className ||
                normalizeClassName(updatedJournal.className) === normalizeClassName(j.className)
              ) {
                return true;
              }
            }

            return false;
          });
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updatedJournal;
            return next;
          }
          return [updatedJournal, ...prev];
        });
      },
      onJournalDeleted: (studentId, date, studentNisn, studentName) => {
        if (!isMounted) return;
        setJournals((prev) => {
          const next = prev.filter((j) => {
            const jDate = j.journalDate || (j as any).date;
            if (jDate !== date) return true;
            const jId = (j.studentId || '').trim().toLowerCase();
            const jNisn = (j.studentNisn || '').trim();
            const jName = (j.studentName || '').trim().toLowerCase();

            if (studentId && jId && jId === studentId.trim().toLowerCase()) return false;
            if (studentNisn && (jNisn === studentNisn.trim() || jId === studentNisn.trim())) return false;
            if (studentName && jName && jName === studentName.trim().toLowerCase()) return false;
            return true;
          });
          try {
            localStorage.setItem('si7kaih_journals_prod', JSON.stringify(next));
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('si7kaih_journals_updated', { detail: next }));
            }
          } catch (_e) {}
          return next;
        });
      },
      onAllJournalsSync: (remoteJournals) => {
        if (!isMounted) return;
        const valid = remoteJournals.filter(
          (rj) =>
            !isJournalTombstoned(rj.studentId, rj.journalDate || (rj as any).date, rj.studentNisn, rj.studentName, rj.id) &&
            !isDeprecatedOrDummyJournal(rj)
        );
        const cleaned = valid.map((j) => {
          const cleanSchool = (j.schoolName || '').replace(/\s*\(Sekolah Dihapus\)/gi, '').trim();
          return {
            ...j,
            schoolName:
              !cleanSchool || cleanSchool.toLowerCase().includes('jorong')
                ? 'UPTD SMPN 1 Jorong'
                : cleanSchool,
            schoolId: 'sch-smpn1-jorong',
          };
        });
        setJournals((prev) => {
          const remoteIds = new Set(cleaned.map((j) => j.id));
          const missingLocal = prev.filter(
            (pj) =>
              !remoteIds.has(pj.id) &&
              !isDeprecatedOrDummyJournal(pj) &&
              !isJournalTombstoned(pj.studentId, pj.journalDate || (pj as any).date, pj.studentNisn, pj.studentName, pj.id)
          );
          const merged = [...cleaned, ...missingLocal];
          try {
            localStorage.setItem('si7kaih_journals_prod', JSON.stringify(merged));
          } catch (_e) {}
          return merged;
        });
      },
      onReflectionUpdate: (type, reflection, _source) => {
        if (!isMounted) return;
        if (type === 'STUDENT') {
          setStudentReflection(reflection as StudentMonthlyReflection);
        } else if (type === 'PARENT') {
          setParentReflection(reflection as ParentMonthlyReflection);
        }
      },
      onUserUpdate: (updatedUser, _source) => {
        if (!isMounted) return;
        setCurrentPersona((prev) => {
          if (prev.id === updatedUser.id || prev.username === updatedUser.username) {
            try {
              localStorage.setItem('si7kaih_persona_prod', JSON.stringify(updatedUser));
            } catch (_e) {}
            return updatedUser;
          }
          return prev;
        });
      },
      onAllUsersSync: (remoteUsers) => {
        if (!isMounted) return;
        setCurrentPersona((prev) => {
          const match = remoteUsers.find((u) => u.id === prev.id || u.username === prev.username);
          if (match && JSON.stringify(match) !== JSON.stringify(prev)) {
            try {
              localStorage.setItem('si7kaih_persona_prod', JSON.stringify(match));
            } catch (_e) {}
            return match;
          }
          return prev;
        });
      },
      onNotification: (title, detail) => {
        if (!isMounted) return;
        setSyncToast({
          id: `toast-${Date.now()}`,
          title,
          detail,
        });
      },
      onSuperAdminMasterSync: (masterData, _source) => {
        if (!isMounted) return;
        if (masterData?.schools && Array.isArray(masterData.schools)) {
          try {
            window.dispatchEvent(new CustomEvent('si7kaih_schools_updated', { detail: masterData.schools }));
          } catch (_e) {}
        }
      },
    });

    return () => {
      isMounted = false;
      stopAutoSync();
    };
  }, []);

  // Ensure dashboard view is always freshly updated from server whenever accessed on any device
  useEffect(() => {
    if (viewMode === 'APP') {
      fetchJournalsFromSupabase()
        .then((remoteJournals) => {
          if (remoteJournals && remoteJournals.length > 0) {
            const filteredJournals = remoteJournals.filter(
              (j) =>
                !isJournalTombstoned(j.studentId, j.journalDate || (j as any).date, j.studentNisn, j.studentName, j.id) &&
                !isDeprecatedOrDummyJournal(j)
            );
            const cleaned = filteredJournals.map((j) => {
              const cleanSchool = (j.schoolName || '').replace(/\s*\(Sekolah Dihapus\)/gi, '').trim();
              return {
                ...j,
                schoolName:
                  !cleanSchool || cleanSchool.toLowerCase().includes('jorong')
                    ? 'UPTD SMPN 1 Jorong'
                    : cleanSchool,
                schoolId: 'sch-smpn1-jorong',
              };
            });
            setJournals((prev) => {
              const remoteIds = new Set(cleaned.map((j) => j.id));
              const missingLocal = prev.filter(
                (pj) =>
                  !remoteIds.has(pj.id) &&
                  !isDeprecatedOrDummyJournal(pj) &&
                  !isJournalTombstoned(pj.studentId, pj.journalDate || (pj as any).date, pj.studentNisn, pj.studentName, pj.id)
              );
              const merged = [...cleaned, ...missingLocal];
              try {
                localStorage.setItem('si7kaih_journals_prod', JSON.stringify(merged));
              } catch (_e) {}
              return merged;
            });
          }
        })
        .catch(() => {});

      fetchUsersFromSupabase()
        .then((remoteUsers) => {
          if (remoteUsers && remoteUsers.length > 0) {
            setCurrentPersona((prev) => {
              const match = remoteUsers.find((u) => u.id === prev.id || u.username === prev.username);
              if (match && JSON.stringify(match) !== JSON.stringify(prev)) {
                try {
                  localStorage.setItem('si7kaih_persona_prod', JSON.stringify(match));
                } catch (_e) {}
                return match;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }
  }, [viewMode, activeTab, currentPersona.id]);

  // State to guarantee that emptyDefaultJournal has a fresh timestamp upon reset
  const [lastResetTimestamp, setLastResetTimestamp] = useState<number>(0);

  // Helper to accurately match if a journal belongs to the active student persona
  const isJournalMatchingCurrentPersona = (j: DailyJournal): boolean => {
    if (currentPersona.role !== 'STUDENT') return false;
    const targetId = (currentPersona.id || '').trim().toLowerCase();
    const targetNisn = (currentPersona.identifierValue || '').trim();
    const targetName = (currentPersona.name || '').trim().toLowerCase();

    const jId = (j.studentId || '').trim().toLowerCase();
    const jNisn = (j.studentNisn || '').trim();
    const jName = (j.studentName || '').trim().toLowerCase();

    if (targetId && jId && jId === targetId) return true;
    if (targetNisn && (jNisn === targetNisn || jId === targetNisn)) return true;
    if (targetName && jName && jName === targetName) {
      if (
        !currentPersona.className ||
        !j.className ||
        normalizeClassName(currentPersona.className) === normalizeClassName(j.className) ||
        currentPersona.className.toLowerCase() === j.className.toLowerCase()
      ) {
        return true;
      }
    }
    return false;
  };

  // Today's journal - clean empty fallback when no entry exists (using local date string)
  const todayStr = useMemo(() => getLocalDateString(), []);
  const emptyDefaultJournal: DailyJournal = useMemo(
    () => ({
      id: `journal-${todayStr}-${currentPersona.id}`,
      studentId: currentPersona.id,
      studentName: currentPersona.name,
      studentNisn: currentPersona.identifierValue,
      className: currentPersona.className,
      schoolId: currentPersona.schoolId || 's1000000-0000-0000-0000-000000000001',
      schoolName: currentPersona.schoolName,
      journalDate: todayStr,
      status: 'DRAFT',
      completedCount: 0,
      entries: {} as any,
      createdAt: new Date().toISOString(),
      updatedAt: lastResetTimestamp > 0 ? new Date(lastResetTimestamp).toISOString() : new Date().toISOString(),
    }),
    [todayStr, currentPersona, lastResetTimestamp]
  );

  const todayJournal = useMemo(() => {
    return (
      journals.find(
        (j) =>
          j.journalDate === todayStr &&
          isJournalMatchingCurrentPersona(j)
      ) || emptyDefaultJournal
    );
  }, [journals, todayStr, emptyDefaultJournal, currentPersona]);

  // Handle resetting a single date's journal (strictly isolated to current student without affecting classmates)
  const handleResetSingleDateJournal = (dateStr: string) => {
    const studentId = currentPersona.id;
    const studentNisn = currentPersona.identifierValue;
    const studentName = currentPersona.name;
    const journalId = `journal-${dateStr}-${studentId}`;

    setLastResetTimestamp(Date.now());

    // Record tombstones for all matching existing journals for this student and date
    const existingMatches = journals.filter(
      (j) => (j.journalDate === dateStr || (j as any).date === dateStr) && isJournalMatchingCurrentPersona(j)
    );
    existingMatches.forEach((ej) => {
      recordDeletedJournalTombstone(ej.studentId || studentId, dateStr, ej.studentNisn || studentNisn, ej.studentName || studentName, ej.id);
    });
    recordDeletedJournalTombstone(studentId, dateStr, studentNisn, studentName, journalId);

    setJournals((prev) => {
      const next = prev.filter((j) => {
        const jDate = j.journalDate || (j as any).date;
        if (jDate !== dateStr) return true;

        // If current persona is a STUDENT, ONLY delete/empty this student's journal!
        // Keep all other students in the class (Kelas 7-B) completely untouched!
        if (currentPersona.role === 'STUDENT') {
          return !isJournalMatchingCurrentPersona(j);
        }

        // If admin or other role, match specific studentId or NISN
        if (studentId && j.studentId && j.studentId.toLowerCase() === studentId.toLowerCase()) return false;
        if (studentNisn && j.studentNisn && j.studentNisn === studentNisn) return false;
        if (studentName && j.studentName && j.studentName.toLowerCase().trim() === studentName.toLowerCase().trim()) return false;
        return true;
      });

      try {
        localStorage.setItem('si7kaih_journals_prod', JSON.stringify(next));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('si7kaih_journals_updated', { detail: next }));
        }
      } catch (_e) {}
      return next;
    });

    // Delete from Supabase cloud database specifically for this student
    deleteJournalFromSupabase(studentId, dateStr, studentNisn, studentName).catch((err) =>
      console.warn('Supabase deleteJournal error:', err)
    );

    // Audit log
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId: currentPersona.id,
        actorRole: currentPersona.role,
        action: 'RESET_JOURNAL',
        targetEntity: 'daily_journals',
        targetId: journalId,
        metadata: {
          journalDate: dateStr,
          studentName: currentPersona.name,
          className: currentPersona.className,
        },
      }),
    }).catch(() => {});

    setSyncToast({
      id: `reset-${Date.now()}`,
      title: 'Isian Jurnal Berhasil Dikosongkan',
      detail: `Data isian Jurnal 7 Kebiasaan tanggal ${dateStr} untuk ${currentPersona.name || 'siswa'} telah direset menjadi bersih.`,
    });
  };

  // Handle resetting all journals
  const handleResetAllJournals = () => {
    journals.forEach((j) => recordDeletedJournalTombstone(j.studentId, j.journalDate));
    setJournals([]);
    try {
      localStorage.removeItem('si7kaih_journals_prod');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('si7kaih_journals_updated', { detail: [] }));
      }
    } catch (_e) {}
    deleteAllJournalsFromSupabase().catch((err) => console.warn('Supabase deleteAllJournals error:', err));
    setSyncToast({
      id: `reset-all-${Date.now()}`,
      title: 'Seluruh Jurnal Dikosongkan',
      detail: 'Semua data jurnal telah direset menjadi bersih.',
    });
  };

  // Handle saving daily journal with synchronized metadata
  const handleSaveJournal = (updated: DailyJournal) => {
    const realtimeInfo = updated.savedAt || formatRealtimeSaveTime(new Date());
    const studentId = updated.studentId || currentPersona.id || 'usr-student-01';
    const schoolId = updated.schoolId || currentPersona.schoolId || 's1000000-0000-0000-0000-000000000001';
    const schoolName = updated.schoolName || currentPersona.schoolName || 'Satuan Pendidikan';
    const className = updated.className || currentPersona.className || '';
    const studentName = updated.studentName || currentPersona.name || 'Siswa';
    const studentNisn = updated.studentNisn || currentPersona.identifierValue || '';

    const journalWithSaveTime: DailyJournal = {
      ...updated,
      studentId,
      schoolId,
      schoolName,
      className,
      studentName,
      studentNisn,
      savedAt: realtimeInfo,
    };

    // Bersihkan tombstone penghapusan agar isian baru tidak lagi diblokir / terbuang
    clearJournalTombstone(studentId, journalWithSaveTime.journalDate, studentNisn, studentName, journalWithSaveTime.id);

    let updatedJournalsList: DailyJournal[] = [];
    setJournals((prev) => {
      const idx = prev.findIndex((j) => {
        if (j.id && journalWithSaveTime.id && j.id === journalWithSaveTime.id) return true;
        const jDate = j.journalDate || (j as any).date;
        const targetDate = journalWithSaveTime.journalDate || (journalWithSaveTime as any).date;
        if (jDate !== targetDate) return false;

        const jId = (j.studentId || '').trim().toLowerCase();
        const targetId = (journalWithSaveTime.studentId || '').trim().toLowerCase();
        if (jId && targetId && jId === targetId) return true;

        const jNisn = (j.studentNisn || '').trim();
        const targetNisn = (journalWithSaveTime.studentNisn || '').trim();
        if (jNisn && targetNisn && jNisn === targetNisn) return true;

        const jName = (j.studentName || '').trim().toLowerCase();
        const targetName = (journalWithSaveTime.studentName || '').trim().toLowerCase();
        if (jName && targetName && jName === targetName) {
          if (
            !journalWithSaveTime.className ||
            !j.className ||
            normalizeClassName(journalWithSaveTime.className) === normalizeClassName(j.className)
          ) {
            return true;
          }
        }

        return false;
      });
      let next: DailyJournal[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = journalWithSaveTime;
      } else {
        next = [journalWithSaveTime, ...prev];
      }
      updatedJournalsList = next;
      try {
        localStorage.setItem('si7kaih_journals_prod', JSON.stringify(next));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('si7kaih_journals_updated', { detail: next }));
        }
      } catch (_e) {}
      return next;
    });

    // Show realtime sync notification toast
    setSyncToast({
      id: `save-${Date.now()}`,
      title: 'Info Simpan Realtime: Jurnal Berhasil Disimpan',
      detail: `Data jurnal tanggal ${journalWithSaveTime.journalDate} ananda ${studentName} (${className || 'Kelas'}) terekam realtime pada ${realtimeInfo} dan tersinkronisasi ke Dashboard Guru Wali Kelas.`,
    });

    // Record audit log via server API
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId: currentPersona.id,
        actorRole: currentPersona.role,
        action: 'SUBMIT_JOURNAL',
        targetEntity: 'daily_journals',
        targetId: journalWithSaveTime.id,
        metadata: {
          journalDate: journalWithSaveTime.journalDate,
          completedCount: journalWithSaveTime.completedCount,
          savedAt: realtimeInfo,
          studentName,
          className,
          schoolId,
        },
      }),
    }).catch(() => {});

    // Save permanently to Supabase
    saveJournalToSupabase(journalWithSaveTime).catch((err) =>
      console.warn('Supabase save error:', err)
    );
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('si7kaih_sync_channel');
        bc.postMessage({
          type: 'JOURNALS_UPDATED',
          journals: updatedJournalsList.length > 0 ? updatedJournalsList : [journalWithSaveTime],
          latestJournal: journalWithSaveTime,
        });
        bc.close();
      }
    } catch (_e) {}
  };

  // Handle parent or teacher journal validation (syncs across student & parent dashboards)
  const handleValidateJournal = (
    journalId: string,
    habitCode?: HabitCode,
    note?: string,
    validationMeta?: {
      signature?: string;
      validatorName?: string;
      validationType?: 'SIGNATURE' | 'INITIALS';
      source?: 'STUDENT_DASHBOARD' | 'PARENT_DASHBOARD';
      asParent?: boolean;
    }
  ) => {
    let updatedJournalToPersist: DailyJournal | null = null;
    setJournals((prev) => {
      const nextJournals = prev.map((j) => {
        const isMatch =
          j.id === journalId ||
          (j.journalDate && (journalId === j.journalDate || journalId.includes(j.journalDate)));
        if (isMatch) {
          const isParent =
            currentPersona.role === 'PARENT' ||
            !!validationMeta?.asParent ||
            !!validationMeta?.signature ||
            validationMeta?.source === 'STUDENT_DASHBOARD';
          const isTeacher = currentPersona.role === 'TEACHER';
          const updatedEntries = { ...j.entries };
          if (habitCode) {
            if (updatedEntries[habitCode]) {
              updatedEntries[habitCode] = {
                ...updatedEntries[habitCode],
                validationStatus: 'VALIDATED',
                parentValidated: isParent ? true : updatedEntries[habitCode].parentValidated,
                teacherValidated: isTeacher ? true : updatedEntries[habitCode].teacherValidated,
              };
            }
          } else {
            // Validate all entries for that day
            Object.keys(updatedEntries).forEach((k) => {
              const code = k as HabitCode;
              updatedEntries[code] = {
                ...updatedEntries[code],
                validationStatus: 'VALIDATED',
                parentValidated: isParent ? true : updatedEntries[code].parentValidated,
                teacherValidated: isTeacher ? true : updatedEntries[code].teacherValidated,
              };
            });
          }
          const updatedJournal: DailyJournal = {
            ...j,
            entries: updatedEntries,
            parentValidated: isParent ? true : j.parentValidated,
            parentValidatedAt: isParent ? new Date().toISOString() : j.parentValidatedAt,
            parentValidationNote: isParent ? (note !== undefined ? note : j.parentValidationNote) : j.parentValidationNote,
            parentSignature: validationMeta?.signature || j.parentSignature,
            parentValidatorName:
              validationMeta?.validatorName ||
              j.parentValidatorName ||
              (isParent ? (currentPersona.name || 'Orang Tua / Wali') : undefined),
            parentValidationType: validationMeta?.validationType || j.parentValidationType || 'SIGNATURE',
            parentValidationSource:
              validationMeta?.source ||
              (currentPersona.role === 'PARENT' ? 'PARENT_DASHBOARD' : 'STUDENT_DASHBOARD'),
          };
          updatedJournalToPersist = updatedJournal;
          return updatedJournal;
        }
        return j;
      });

      // Synchronize to localStorage immediately for cross-tab and instant reactive listeners
      try {
        localStorage.setItem('si7kaih_journals_prod', JSON.stringify(nextJournals));
        window.dispatchEvent(new CustomEvent('si7kaih_journals_updated', { detail: nextJournals }));
      } catch (_e) {}

      return nextJournals;
    });

    // Save validated state to Supabase
    if (updatedJournalToPersist) {
      saveJournalToSupabase(updatedJournalToPersist).catch((err) =>
        console.warn('Supabase validation save error:', err)
      );
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('si7kaih_sync_channel');
          bc.postMessage({
            type: 'JOURNALS_UPDATED',
            journals: updatedJournalToPersist ? [updatedJournalToPersist] : undefined,
            latestJournal: updatedJournalToPersist,
          });
          bc.close();
        }
      } catch (_e) {}
    }

    // Record audit log
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId: currentPersona.id,
        actorRole: currentPersona.role,
        action: 'VALIDATE_JOURNAL',
        targetEntity: 'daily_journals',
        targetId: journalId,
        metadata: { note: note || 'Disetujui dan diberikan apresiasi positif' },
      }),
    }).catch(() => {});
  };

  const handleSaveStudentReflection = (ref: StudentMonthlyReflection) => {
    setStudentReflection(ref);
    saveStudentReflectionToSupabase(ref, currentPersona.id).catch((err) =>
      console.warn('Supabase student reflection save error:', err)
    );
  };

  const handleSaveParentReflection = (ref: ParentMonthlyReflection) => {
    setParentReflection(ref);
    if (ref.studentId) {
      const periodKey = `${ref.year || new Date().getFullYear()}-${String(ref.month || new Date().getMonth() + 1).padStart(2, '0')}`;
      try {
        localStorage.setItem(`si7kaih_reflection_parent_${ref.studentId}_${periodKey}`, JSON.stringify(ref));
      } catch (_e) {}
    }
    saveParentReflectionToSupabase(ref, currentPersona.id).catch((err) =>
      console.warn('Supabase parent reflection save error:', err)
    );
  };

  const handleUpdatePersona = (updated: UserPersona) => {
    setCurrentPersona(updated);
    try {
      localStorage.setItem('si7kaih_persona_prod', JSON.stringify(updated));
      if (updated.passwordHash) {
        setUserPassword(updated.id, updated.passwordHash, [
          updated.username,
          updated.identifierValue,
          updated.email,
          updated.childNisn,
        ]);
      }
      const pool = getStoredUsers();
      const idx = pool.findIndex((u) => u.id === updated.id);
      if (idx !== -1) {
        pool[idx] = updated;
        saveStoredUsers(pool);
      }
    } catch (_e) {}

    // Save user update to Supabase and broadcast across devices
    saveSingleUserToSupabase(updated).catch((err) =>
      console.warn('Supabase persona update error:', err)
    );
  };

  // When switching personas, reset active tab to dashboard and restart session timer
  const handleSelectPersona = (p: UserPersona) => {
    setCurrentPersona(p);
    setActiveTab('dashboard');
    setSessionStartTime(Date.now());
    setSessionDurationSeconds(0);

    // Otomatis sinkronkan data yang diupdate oleh Super Admin di background saat Super Admin login/re-login
    if (p.role === 'SUPER_ADMIN') {
      syncOnSuperAdminLogin(p).catch((err) =>
        console.warn('Super Admin login sync error:', err)
      );
    }
  };

  const executeLogout = (clearDraft: boolean) => {
    setIsLogoutConfirmOpen(false);

    // If clear draft is requested, remove transient draft keys from localStorage
    if (clearDraft) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('draft') || key.includes('temp_journal') || key.includes('form_cache'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (_e) {}
    }

    // Record audit log if enabled
    if (logoutSettings.recordAuditOnLogout) {
      fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentPersona.id,
          actorRole: currentPersona.role,
          action: 'LOGOUT_SESSION',
          targetEntity: 'user_session',
          targetId: currentPersona.id,
          metadata: {
            sessionDurationSeconds,
            sessionDurationFormatted,
            redirectDestination: logoutSettings.redirectDestination,
            clearDraft,
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch(() => {});
    }

    // Reset session timer
    setSessionStartTime(Date.now());
    setSessionDurationSeconds(0);

    // Clear active persona and active session from storage so session is cleanly terminated without leftover history
    try {
      localStorage.removeItem('si7kaih_persona_prod');
      localStorage.removeItem('si7kaih_session_active');
    } catch (_e) {}

    // Handle redirection based on logoutSettings (default directly to clean LOGIN_DASHBOARD)
    if (logoutSettings.redirectDestination === 'SSO_MODAL') {
      setIsLoginModalOpen(true);
      setViewMode('LOGIN_DASHBOARD');
    } else {
      setViewMode('LOGIN_DASHBOARD');
    }
  };

  const handleTriggerLogout = () => {
    if (logoutSettings.confirmBeforeLogout) {
      setIsLogoutConfirmOpen(true);
    } else {
      executeLogout(logoutSettings.clearDraftOnLogout);
    }
  };

  // Handlers for Inactivity Warning Modal
  const handleStayLoggedIn = useCallback(() => {
    setIsInactivityWarningOpen(false);
  }, []);

  const handleInactivityLogout = useCallback(() => {
    setIsInactivityWarningOpen(false);
    try {
      sessionStorage.setItem(
        'si7kaih_auto_logout_notice',
        currentPersona.role === 'STUDENT'
          ? 'Sesi murid Anda otomatis diakhiri karena tidak ada aktivitas selama 5 menit demi menjaga keamanan akun.'
          : 'Sesi Anda otomatis diakhiri karena batas waktu inaktivitas telah tercapai.'
      );
    } catch (_e) {}
    executeLogout(logoutSettings.clearDraftOnLogout);
  }, [currentPersona.role, executeLogout, logoutSettings.clearDraftOnLogout]);

  // Auto-logout on inactivity: otomatis 5 menit untuk dashboard murid dan orang tua dengan notifikasi peringatan interaktif
  useEffect(() => {
    if (viewMode === 'LOGIN_DASHBOARD') {
      setIsInactivityWarningOpen(false);
      return;
    }

    const isStudent = currentPersona.role === 'STUDENT';
    const isParent = currentPersona.role === 'PARENT';
    const isProtectedRole = isStudent || isParent;

    const effectiveSetting =
      isProtectedRole && logoutSettings.autoLogoutInactivity === 'DISABLED'
        ? '5_MIN'
        : (isProtectedRole ? '5_MIN' : logoutSettings.autoLogoutInactivity);

    if (effectiveSetting === 'DISABLED') {
      setIsInactivityWarningOpen(false);
      return;
    }

    const minutesMap: Record<string, number> = {
      '5_MIN': 5,
      '15_MIN': 15,
      '30_MIN': 30,
      '60_MIN': 60,
    };

    const totalMinutes = minutesMap[effectiveSetting] || (isProtectedRole ? 5 : 30);
    setInactivityTimeoutMinutes(totalMinutes);

    const totalTimeoutMs = totalMinutes * 60 * 1000;
    // Peringatan interaktif muncul 60 detik sebelum sesi ditutup otomatis
    const warningDurationMs = 60 * 1000;
    const silentTimeoutMs = Math.max(10 * 1000, totalTimeoutMs - warningDurationMs);

    let silentTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(silentTimer);
      if (!isInactivityWarningOpen) {
        silentTimer = setTimeout(() => {
          setIsInactivityWarningOpen(true);
        }, silentTimeoutMs);
      }
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();

    return () => {
      clearTimeout(silentTimer);
      events.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [
    logoutSettings.autoLogoutInactivity,
    logoutSettings.clearDraftOnLogout,
    viewMode,
    currentPersona.id,
    currentPersona.role,
    isInactivityWarningOpen,
  ]);

  const openJournalForDate = (dateStr: string, targetStudent?: any) => {
    setSelectedJournalDate(dateStr);
    setModalTargetStudent(targetStudent || null);
    setIsJournalModalOpen(true);
  };

  // Render main content area according to currentPersona.role and activeTab
  const renderContent = () => {
    // 1. If user switched to Login Dashboard View (Gerbang Masuk Tunggal)
    if (viewMode === 'LOGIN_DASHBOARD') {
      return (
        <LoginDashboard
          onLoginSuccess={(persona) => {
            handleSelectPersona(persona);
            try {
              localStorage.setItem('si7kaih_persona_prod', JSON.stringify(persona));
              localStorage.setItem('si7kaih_session_active', 'true');
            } catch (_e) {}
            setViewMode('APP');
            setActiveTab('dashboard');
          }}
        />
      );
    }

    // 2. If user selected Account Settings tab
    if (activeTab === 'account-settings') {
      return (
        <AccountSettingsView
          currentPersona={currentPersona}
          onUpdatePersona={handleUpdatePersona}
          activeNavTab={activeTab}
          logoutSettings={logoutSettings}
          onUpdateLogoutSettings={setLogoutSettings}
          onTriggerLogout={handleTriggerLogout}
          sessionDurationFormatted={sessionDurationFormatted}
        />
      );
    }

    const role = currentPersona.role;

    if (role === 'STUDENT') {
      const activeStudentName = currentPersona.name || '';
      const activeStudentClass = currentPersona.className || currentPersona.title || '';

      switch (activeTab) {
        case 'dashboard':
          return (
            <StudentDashboard
              todayJournal={todayJournal}
              allJournals={journals}
              onOpenJournal={() => openJournalForDate(todayStr)}
              onResetTodayJournal={() => handleResetSingleDateJournal(todayStr)}
              onOpenReflection={() => setActiveTab('reflection')}
              onOpenBadges={() => setActiveTab('badges')}
              onOpenAICoach={() => setActiveTab('ai-coach')}
              studentName={activeStudentName}
              studentId={currentPersona.id}
              studentNisn={currentPersona.identifierValue}
              className={activeStudentClass}
              badges={badges}
              onValidateJournal={handleValidateJournal}
              onSelectDate={openJournalForDate}
              onOpenCalendar={() => setActiveTab('calendar')}
              onOpenReportModal={handleOpenReportModal}
            />
          );
        case 'journal':
          return (
            <StudentJournalView
              journals={journals}
              onSaveJournal={handleSaveJournal}
              onResetDateJournal={handleResetSingleDateJournal}
              onResetAllJournals={handleResetAllJournals}
              studentName={activeStudentName}
              currentPersona={currentPersona}
            />
          );
        case 'calendar':
          return (
            <CalendarView
              journals={journals}
              onSelectDate={openJournalForDate}
              studentName={activeStudentName}
              studentId={currentPersona.id}
              studentNisn={currentPersona.identifierValue}
              className={activeStudentClass}
            />
          );
        case 'reflection':
          return (
            <StudentReflectionView
              initialReflection={studentReflection}
              studentName={activeStudentName}
              onSaveReflection={handleSaveStudentReflection}
              journals={journals}
              activeStudentId={currentPersona.id}
            />
          );
        case 'badges':
          return <BadgesView badges={badges} studentName={activeStudentName} />;
        case 'ai-coach':
          return <AICoachView studentName={activeStudentName} role="STUDENT" />;
        default:
          return (
            <StudentDashboard
              todayJournal={todayJournal}
              allJournals={journals}
              onOpenJournal={() => openJournalForDate(todayStr)}
              onResetTodayJournal={() => handleResetSingleDateJournal(todayStr)}
              onOpenReflection={() => setActiveTab('reflection')}
              onOpenBadges={() => setActiveTab('badges')}
              onOpenAICoach={() => setActiveTab('ai-coach')}
              studentName={activeStudentName}
              studentId={currentPersona.id}
              studentNisn={currentPersona.identifierValue}
              className={activeStudentClass}
              badges={badges}
              onValidateJournal={handleValidateJournal}
              onSelectDate={openJournalForDate}
              onOpenCalendar={() => setActiveTab('calendar')}
              onOpenReportModal={handleOpenReportModal}
            />
          );
      }
    }

    if (role === 'PARENT') {
      const activeChildName = currentPersona.childName || 'Ananda';
      const activeClassName = currentPersona.className || 'Fase D';
      if (activeTab === 'calendar') {
        return (
          <CalendarView
            journals={journals}
            onSelectDate={openJournalForDate}
            studentName={activeChildName}
            studentId={currentPersona.childId}
            studentNisn={currentPersona.childNisn}
            className={activeClassName}
          />
        );
      }
      return (
        <ParentValidationView
          journals={journals}
          initialReflection={parentReflection}
          studentName={activeChildName}
          className={activeClassName}
          schoolName={currentPersona.schoolName || ''}
          currentPersona={currentPersona}
          studentId={currentPersona.childId}
          studentNisn={currentPersona.childNisn}
          onValidateJournal={handleValidateJournal}
          onSaveReflection={handleSaveParentReflection}
          activeNavTab={activeTab}
          onOpenReportModal={handleOpenReportModal}
        />
      );
    }

    if (role === 'TEACHER') {
      return (
        <TeacherDashboard
          journals={journals}
          programs={programs}
          followUps={followUps}
          onOpenReportModal={handleOpenReportModal}
          activeNavTab={activeTab}
          currentPersona={currentPersona}
          onValidateJournal={handleValidateJournal}
          onEditStudentJournal={(student, dateStr) => {
            openJournalForDate(dateStr || selectedJournalDate || '2026-10-02', student);
          }}
        />
      );
    }

    if (role === 'PRINCIPAL') {
      return (
        <PrincipalDashboard
          programs={programs}
          followUps={followUps}
          onOpenReportModal={handleOpenReportModal}
          activeNavTab={activeTab}
          currentPersona={currentPersona}
          journals={journals}
        />
      );
    }

    if (role === 'SUPERVISOR') {
      return (
        <SupervisorDashboard
          onOpenReportModal={handleOpenReportModal}
          activeNavTab={activeTab}
          currentPersona={currentPersona}
          journals={journals}
          followUps={followUps}
          onSelectTab={setActiveTab}
        />
      );
    }

    if (role === 'SUPER_ADMIN') {
      return (
        <SuperAdminView
          activeNavTab={activeTab}
          onOpenReportModal={handleOpenReportModal}
          onSelectPersona={handleSelectPersona}
          currentPersona={currentPersona}
          onUpdatePersona={(updated) => {
            setCurrentPersona(updated);
            try {
              localStorage.setItem('si7kaih_persona_prod', JSON.stringify(updated));
              const pool = getStoredUsers();
              const idx = pool.findIndex((u) => u.id === updated.id);
              if (idx !== -1) {
                pool[idx] = updated;
                saveStoredUsers(pool);
              }
            } catch (_e) {}
          }}
          logoutSettings={logoutSettings}
          onUpdateLogoutSettings={setLogoutSettings}
          onTriggerLogout={handleTriggerLogout}
        />
      );
    }

    if (role === 'SCHOOL_ADMIN') {
      return (
        <SchoolAdminView
          isSuperAdmin={false}
          activeNavTab={activeTab}
          currentPersona={currentPersona}
        />
      );
    }

    return <div>Tampilan Peran</div>;
  };

  const activeStudentIdForModal =
    currentPersona.role === 'STUDENT'
      ? currentPersona.id
      : currentPersona.role === 'PARENT'
      ? currentPersona.childId || currentPersona.childNisn
      : undefined;

  const selectedJournalForModal = useMemo(() => {
    return journals.find((j) => {
      const jDate = j.journalDate || (j as any).date;
      if (jDate !== selectedJournalDate) return false;
      if (isDeprecatedOrDummyJournal(j)) return false;
      if (isJournalTombstoned(j.studentId, jDate, j.studentNisn, j.studentName, j.id)) return false;

      if (modalTargetStudent) {
        const targetId = (modalTargetStudent.id || '').trim().toLowerCase();
        const targetNisn = (modalTargetStudent.nisn || '').trim();
        const targetName = (modalTargetStudent.name || '').trim().toLowerCase();
        const jId = (j.studentId || '').trim().toLowerCase();
        const jNisn = (j.studentNisn || '').trim();
        const jName = (j.studentName || '').trim().toLowerCase();
        if (targetId && jId && jId === targetId) return true;
        if (targetNisn && (jNisn === targetNisn || jId === targetNisn)) return true;
        if (targetName && jName && jName === targetName) return true;
        return false;
      }

      if (currentPersona.role === 'STUDENT') {
        return isJournalMatchingCurrentPersona(j);
      }
      if (currentPersona.role === 'PARENT') {
        const childId = (currentPersona.childId || '').trim().toLowerCase();
        const childNisn = (currentPersona.childNisn || currentPersona.identifierValue || '').trim();
        const childName = (currentPersona.childName || '').trim().toLowerCase();
        const jId = (j.studentId || '').trim().toLowerCase();
        const jNisn = (j.studentNisn || '').trim();
        const jName = (j.studentName || '').trim().toLowerCase();
        if (childId && jId && jId === childId) return true;
        if (childNisn && (jNisn === childNisn || jId === childNisn)) return true;
        if (childName && jName && jName === childName) return true;
        return false;
      }
      if (activeStudentIdForModal) {
        const jId = (j.studentId || '').trim().toLowerCase();
        return jId === activeStudentIdForModal.trim().toLowerCase();
      }
      return true;
    });
  }, [journals, selectedJournalDate, activeStudentIdForModal, currentPersona, modalTargetStudent]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Responsive Header with RBAC Persona Switcher (Hanya dirender saat sesi pengguna aktif) */}
      {viewMode !== 'LOGIN_DASHBOARD' && (
        <Header
          currentPersona={currentPersona}
          onSelectPersona={(p) => {
            handleSelectPersona(p);
            setViewMode('APP');
          }}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setViewMode('APP');
            setActiveTab(tab);
          }}
          onOpenReportModal={() => handleOpenReportModal()}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenLoginDashboard={() => setViewMode('LOGIN_DASHBOARD')}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          logoutSettings={logoutSettings}
          onTriggerLogout={handleTriggerLogout}
          sessionDurationFormatted={sessionDurationFormatted}
        />
      )}

      {/* 3. Main Workspace Container */}
      <main className={viewMode === 'LOGIN_DASHBOARD' ? 'flex-1 w-full p-0' : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'}>
        {renderContent()}
      </main>

      {/* 4. Footer (Hanya dirender saat sesi pengguna aktif; Login Dashboard memiliki footer sendiri sesuai desain referensi) */}
      {viewMode !== 'LOGIN_DASHBOARD' && (
        <footer className="bg-white border-t border-slate-200/80 py-6 text-xs sm:text-sm text-slate-600 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#0753A5] text-white flex items-center justify-center font-black text-xs shadow-xs">
                7K
              </span>
              <div>
                <p className="font-bold text-slate-800 text-xs sm:text-sm">
                  SI-7KAIH AI • Sistem Jurnal dan Monitoring 7 Kebiasaan Anak Indonesia Hebat
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kementerian Pendidikan Dasar dan Menengah RI • Kreasi oleh Ahmad Muzani - Pengawas SMP Disdikbud Tanah Laut • Versi Rilis Produksi 1.0.0
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
              {/* Basis Data Cloud/Supabase: Hanya tampil pada dashboard admin dan superadmin */}
              {(currentPersona.role === 'SCHOOL_ADMIN' || currentPersona.role === 'SUPER_ADMIN') && (
                <>
                  <button
                    id="btn-footer-supabase"
                    onClick={() => setIsSupabaseModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold cursor-pointer transition-colors text-xs"
                    title="Basis Data Supabase Permanen"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Basis Data Supabase</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </button>
                  <span className="text-slate-300">•</span>
                </>
              )}
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Sistem Aktif & Terlindungi UU PDP No. 27/2022
              </span>
              {/* Dashboard Login: Dihilangkan khusus dashboard murid & orang tua */}
              {currentPersona.role !== 'STUDENT' && currentPersona.role !== 'PARENT' && (
                <>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={() => setViewMode('LOGIN_DASHBOARD')}
                    className="text-[#0753A5] hover:underline font-semibold cursor-pointer"
                  >
                    Dashboard Login Aplikasi
                  </button>
                </>
              )}
            </div>
          </div>
        </footer>
      )}

      {/* 5. Daily Habit Entry Modal (<1 min completion) */}
      {isJournalModalOpen && (
        <DailyJournalModal
          isOpen={isJournalModalOpen}
          onClose={() => {
            setIsJournalModalOpen(false);
            setModalTargetStudent(null);
          }}
          journalDate={selectedJournalDate}
          initialJournal={selectedJournalForModal}
          onSave={handleSaveJournal}
          onReset={handleResetSingleDateJournal}
          currentPersona={currentPersona}
          targetStudent={modalTargetStudent}
        />
      )}

      {/* 6. Printable Official Report Modal */}
      {isReportModalOpen && (
        <ReportView
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setSelectedReportStudent(null);
          }}
          targetStudent={selectedReportStudent}
          studentName={
            selectedReportStudent?.name ||
            (currentPersona.role === 'STUDENT'
              ? currentPersona.name
              : currentPersona.role === 'PARENT'
              ? currentPersona.childName || ''
              : '')
          }
          className={
            selectedReportStudent?.className ||
            (currentPersona.role === 'STUDENT'
              ? currentPersona.className || currentPersona.title || ''
              : currentPersona.className || '')
          }
          schoolName={selectedReportStudent?.schoolName || currentPersona.schoolName || ''}
          nisn={
            selectedReportStudent?.nisn ||
            (currentPersona.role === 'STUDENT'
              ? currentPersona.identifierValue
              : currentPersona.role === 'PARENT'
              ? currentPersona.childNisn || ''
              : '')
          }
          monthName="September"
          year={2026}
          journals={journals}
          studentReflection={
            selectedReportStudent
              ? studentReflection?.studentId === selectedReportStudent.id
                ? studentReflection
                : undefined
              : studentReflection
          }
          parentReflection={
            selectedReportStudent
              ? parentReflection?.studentId === selectedReportStudent.id
                ? parentReflection
                : undefined
              : parentReflection
          }
          badges={badges}
          currentPersona={currentPersona}
        />
      )}

      {/* 7. Official SSO Login / Authentication Portal Modal */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(persona) => {
            handleSelectPersona(persona);
            setIsLoginModalOpen(false);
          }}
        />
      )}

      {/* 8. Logout Confirmation & Session Termination Modal */}
      {isLogoutConfirmOpen && (
        <LogoutConfirmModal
          isOpen={isLogoutConfirmOpen}
          onClose={() => setIsLogoutConfirmOpen(false)}
          currentPersona={currentPersona}
          sessionDurationFormatted={sessionDurationFormatted}
          logoutSettings={logoutSettings}
          onConfirmLogout={(clearDraft) => executeLogout(clearDraft)}
        />
      )}

      {/* 9. Supabase Database Connection & Synchronization Modal */}
      {isSupabaseModalOpen && (
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          journals={journals}
          studentReflection={studentReflection}
          parentReflection={parentReflection}
          users={storedUsers}
        />
      )}

      {/* 10. Peringatan Otomatis Sebelum Logout Sesi Akibat Inaktivitas (Khusus Murid & Akun Aktif) */}
      {isInactivityWarningOpen && (
        <InactivityWarningModal
          isOpen={isInactivityWarningOpen}
          studentName={currentPersona.name}
          role={currentPersona.role}
          totalTimeoutMinutes={inactivityTimeoutMinutes}
          warningDurationSeconds={60}
          onStayLoggedIn={handleStayLoggedIn}
          onLogoutNow={handleInactivityLogout}
        />
      )}

      {/* 10. Floating Notification Toast (Shown only on explicit user actions or important alerts) */}
      {syncToast && (
        <div
          id="auto-sync-toast"
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/60 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>{syncToast.title}</span>
              </h4>
              <button
                id="close-sync-toast-btn"
                onClick={() => setSyncToast(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer ml-2 p-0.5"
                title="Tutup Notifikasi"
              >
                ✕
              </button>
            </div>
            {syncToast.detail && (
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {syncToast.detail}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
