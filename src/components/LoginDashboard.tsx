// ============================================================================
// SI-7KAIH AI - Dashboard Login Aplikasi (Reflektif & Sesuai Desain Referensi)
// 7 Kebiasaan Anak Indonesia Hebat • Jurnal Aktivitas Siswa
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  Users,
  CalendarCheck,
  Sun,
  Activity,
  Utensils,
  BookOpen,
  Heart,
  Moon,
  Sparkles,
  Trophy,
  HelpCircle,
  Phone,
  Mail,
  Info,
  GraduationCap,
  X,
  RefreshCw,
  Check,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
  School,
  Search,
  Copy,
  MessageCircle,
  MousePointerClick,
  Building2,
  Clock,
  Wifi,
  Battery,
} from 'lucide-react';
import { UserPersona, getStoredUsers, USER_PERSONAS, isDeprecatedOrDummyJournal } from '../lib/constants';
import { Student, Rombel, getStoredStudents, getStoredRombels } from '../lib/studentData';
import { SchoolMaster, getStoredSchools } from '../lib/schoolMasterData';
import { DailyJournal } from '../../packages/types/src/index';
import {
  fetchUsersFromSupabase,
  fetchJournalsFromSupabase,
  fetchSchoolsFromSupabase,
  applySuperAdminMasterDataToStorage,
} from '../lib/supabaseService';

// Data referensi murid kosong secara default bila belum diupdate oleh Super Admin atau Admin Sekolah
const FALLBACK_SAMPLE_STUDENTS: Student[] = [];

interface LoginDashboardProps {
  onLoginSuccess: (persona: UserPersona) => void;
}

export const LoginDashboard: React.FC<LoginDashboardProps> = ({ onLoginSuccess }) => {
  // Baca kredensial yang tersimpan di browser (localStorage) jika sebelumnya dicentang "Ingat saya"
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem('si7kaih_remember_me') !== 'false';
    } catch (_e) {
      return true;
    }
  });

  const [inputIdentifier, setInputIdentifier] = useState(() => {
    try {
      return localStorage.getItem('si7kaih_remembered_identifier') || '';
    } catch (_e) {
      return '';
    }
  });

  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active role filter & dropdown state - muat dari peran yang tersimpan di browser jika ada
  const [selectedRoleScope, setSelectedRoleScope] = useState<'STUDENT' | 'PARENT' | 'TEACHER' | 'PRINCIPAL' | 'SUPERVISOR' | 'SCHOOL_ADMIN' | 'SUPER_ADMIN'>(() => {
    try {
      const savedRole = localStorage.getItem('si7kaih_remembered_role');
      if (savedRole && ['STUDENT', 'PARENT', 'TEACHER', 'PRINCIPAL', 'SUPERVISOR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(savedRole)) {
        return savedRole as any;
      }
    } catch (_e) {}
    return 'STUDENT';
  });
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isCardRoleDropdownOpen, setIsCardRoleDropdownOpen] = useState(false);

  // Pengaturan dropdown pilihan sekolah, kelas, dan murid untuk login Murid & Orang Tua
  // Default ke '0' bila belum diupdate datanya oleh superadmin dan admin sekolah
  const [selectedSchoolForLogin, setSelectedSchoolForLogin] = useState<string>(() => {
    const storedSchools = getStoredSchools();
    if (storedSchools.length === 0) return '0';
    try {
      const saved = localStorage.getItem('si7kaih_remembered_school');
      if (saved && saved !== '0' && (saved === 'ALL' || storedSchools.some((s) => s.name === saved))) {
        return saved;
      }
    } catch (_e) {}
    return 'ALL';
  });
  const [selectedClassForLogin, setSelectedClassForLogin] = useState<string>(() => {
    const storedRombels = getStoredRombels();
    if (storedRombels.length === 0) return '0';
    return 'ALL';
  });
  const [selectedStudentNisn, setSelectedStudentNisn] = useState<string>('');
  const [loginInputMode, setLoginInputMode] = useState<'DROPDOWN' | 'MANUAL'>('DROPDOWN');
  const [inactivityNotice, setInactivityNotice] = useState<string | null>(null);

  // Modals
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [navModal, setNavModal] = useState<'TENTANG' | 'MANFAAT' | 'KONTAK' | null>(null);

  // Live synchronized metrics with application student & journal data
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [rombels, setRombels] = useState<Rombel[]>(() => getStoredRombels());
  const [schools, setSchools] = useState<SchoolMaster[]>(() => getStoredSchools());
  const [users, setUsers] = useState<UserPersona[]>(() => getStoredUsers());
  const [journals, setJournals] = useState<DailyJournal[]>(() => {
    try {
      const saved = localStorage.getItem('si7kaih_journals_prod');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j));
        }
      }
      return [];
    } catch (_e) {
      return [];
    }
  });

  // State for Homeroom Teacher directory search & filters
  const [searchTeacherQuery, setSearchTeacherQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'ALL' | '7' | '8' | '9'>('ALL');
  const [copiedContactId, setCopiedContactId] = useState<string | null>(null);

  // Dynamic real-time listener for data updates across the application
  const syncLocalDataOnly = () => {
    try {
      const freshStudents = getStoredStudents();
      setStudents((prev) => (JSON.stringify(prev) === JSON.stringify(freshStudents) ? prev : freshStudents));
      const freshRombels = getStoredRombels();
      setRombels((prev) => (JSON.stringify(prev) === JSON.stringify(freshRombels) ? prev : freshRombels));
      const freshSchools = getStoredSchools();
      setSchools((prev) => (JSON.stringify(prev) === JSON.stringify(freshSchools) ? prev : freshSchools));
      const freshUsers = getStoredUsers();
      setUsers((prev) => (JSON.stringify(prev) === JSON.stringify(freshUsers) ? prev : freshUsers));
      const savedJournals = localStorage.getItem('si7kaih_journals_prod');
      if (savedJournals) {
        const parsed = JSON.parse(savedJournals);
        if (Array.isArray(parsed)) {
          const fresh = parsed.filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j));
          setJournals((prev) => (JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh));
        }
      }
    } catch (_e) {}
  };

  useEffect(() => {
    syncLocalDataOnly();

    // Pull latest authoritative users, schools & journals from Supabase once on mount
    fetchSchoolsFromSupabase()
      .then((remoteSchools) => {
        if (remoteSchools && remoteSchools.length > 0) {
          setSchools((prev) => (JSON.stringify(prev) === JSON.stringify(remoteSchools) ? prev : remoteSchools));
          applySuperAdminMasterDataToStorage({ schools: remoteSchools });
        }
      })
      .catch(() => {});

    fetchUsersFromSupabase()
      .then((remoteUsers) => {
        if (remoteUsers && remoteUsers.length > 0) {
          setUsers((prev) => (JSON.stringify(prev) === JSON.stringify(remoteUsers) ? prev : remoteUsers));
          try {
            localStorage.setItem('si7kaih_users_pool_prod', JSON.stringify(remoteUsers));
          } catch (_e) {}
        }
      })
      .catch(() => {});

    fetchJournalsFromSupabase()
      .then((remoteJournals) => {
        if (remoteJournals && remoteJournals.length > 0) {
          const cleaned = remoteJournals.filter((j: DailyJournal) => !isDeprecatedOrDummyJournal(j));
          setJournals((prev) => (JSON.stringify(prev) === JSON.stringify(cleaned) ? prev : cleaned));
          try {
            localStorage.setItem('si7kaih_journals_prod', JSON.stringify(cleaned));
          } catch (_e) {}
        }
      })
      .catch(() => {});

    try {
      const notice = sessionStorage.getItem('si7kaih_auto_logout_notice');
      if (notice) {
        setInactivityNotice(notice);
        sessionStorage.removeItem('si7kaih_auto_logout_notice');
      }
    } catch (_e) {}

    window.addEventListener('storage', syncLocalDataOnly);
    window.addEventListener('si7kaih_students_updated', syncLocalDataOnly);
    window.addEventListener('si7kaih_rombels_updated', syncLocalDataOnly);
    window.addEventListener('si7kaih_schools_updated', syncLocalDataOnly);
    window.addEventListener('si7kaih_users_updated', syncLocalDataOnly);
    window.addEventListener('focus', syncLocalDataOnly);

    return () => {
      window.removeEventListener('storage', syncLocalDataOnly);
      window.removeEventListener('si7kaih_students_updated', syncLocalDataOnly);
      window.removeEventListener('si7kaih_rombels_updated', syncLocalDataOnly);
      window.removeEventListener('si7kaih_schools_updated', syncLocalDataOnly);
      window.removeEventListener('si7kaih_users_updated', syncLocalDataOnly);
      window.removeEventListener('focus', syncLocalDataOnly);
    };
  }, []);

  // Synchronized Directory of all Homeroom Teachers from Rombel & User Master Data
  const allHomeroomTeachers = useMemo(() => {
    const list: Array<{
      id: string;
      className: string;
      grade: number;
      phase: string;
      teacherName: string;
      teacherNip: string;
      schoolName: string;
      email: string;
      phone: string;
      cleanPhone: string;
      studentCount: number;
      avatar: string;
      status: string;
    }> = [];

    const defaultSchool = schools[0]?.name || 'Satuan Pendidikan';

    // 1. Gather all active rombels
    rombels.forEach((r, idx) => {
      const matchingUser = users.find(
        (u) =>
          u.role === 'TEACHER' &&
          (u.className === r.name ||
            (r.teacher && u.name.toLowerCase().includes(r.teacher.toLowerCase())) ||
            (u.name && r.teacher && r.teacher.toLowerCase().includes(u.name.toLowerCase())))
      );

      const studentCount = students.filter((s) => s.className === r.name).length;
      const isFemale =
        r.teacher?.toLowerCase().includes('ibu') ||
        r.teacher?.toLowerCase().includes('dewi') ||
        r.teacher?.toLowerCase().includes('sri') ||
        r.teacher?.toLowerCase().includes('endang') ||
        r.teacher?.toLowerCase().includes('kartika');
      const avatar = matchingUser?.avatar || (isFemale ? '👩‍🏫' : '👨‍🏫');

      const cleanClassTag = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = matchingUser?.email || (matchingUser?.schoolName ? `wali.${cleanClassTag}@${matchingUser.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '')}.sch.id` : `wali.${cleanClassTag}@sekolah.sch.id`);

      const rawPhone =
        (matchingUser as any)?.phone ||
        `0812-3456-${String(7100 + (idx + 1) * 19).padStart(4, '0')}`;
      const cleanPhone = rawPhone.replace(/\D/g, '').replace(/^0/, '62');

      list.push({
        id: `rombel-${r.id || idx}`,
        className: r.name,
        grade: r.grade || (r.name.includes('7') ? 7 : r.name.includes('8') ? 8 : 9),
        phase: r.phase || 'Fase D',
        teacherName: r.teacher || 'Guru Wali Kelas',
        teacherNip: r.teacherNip || matchingUser?.identifierValue || '-',
        schoolName: matchingUser?.schoolName || defaultSchool,
        email,
        phone: rawPhone,
        cleanPhone,
        studentCount,
        avatar,
        status: r.status || 'AKTIF',
      });
    });

    // 2. Include any TEACHER users that might not have a corresponding rombel
    users
      .filter((u) => u.role === 'TEACHER')
      .forEach((u, uIdx) => {
        const alreadyInList = list.some(
          (item) =>
            item.teacherName.toLowerCase() === u.name.toLowerCase() ||
            (u.className && item.className === u.className)
        );
        if (!alreadyInList) {
          const rawPhone = (u as any).phone || `0813-8899-${String(6200 + (uIdx + 1) * 23).padStart(4, '0')}`;
          const cleanPhone = rawPhone.replace(/\D/g, '').replace(/^0/, '62');
          const className = u.className || 'Guru Pembina Karakter';
          const grade = className.includes('7') ? 7 : className.includes('8') ? 8 : className.includes('9') ? 9 : 7;
          list.push({
            id: `usr-${u.id || uIdx}`,
            className,
            grade,
            phase: 'Fase D',
            teacherName: u.name,
            teacherNip: u.identifierValue || '-',
            schoolName: u.schoolName || defaultSchool,
            email: u.email || `guru.${uIdx}@sekolah.sch.id`,
            phone: rawPhone,
            cleanPhone,
            studentCount: students.filter((s) => s.className === className).length,
            avatar: u.avatar || '👨‍🏫',
            status: 'AKTIF',
          });
        }
      });

    return list;
  }, [rombels, users, students, schools]);

  // Filtered teachers based on search query and grade
  const filteredHomeroomTeachers = useMemo(() => {
    return allHomeroomTeachers.filter((t) => {
      const q = searchTeacherQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        t.teacherName.toLowerCase().includes(q) ||
        t.className.toLowerCase().includes(q) ||
        t.teacherNip.toLowerCase().includes(q) ||
        t.schoolName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q);

      const matchesGrade =
        selectedGradeFilter === 'ALL' || String(t.grade) === selectedGradeFilter;

      return matchesSearch && matchesGrade;
    });
  }, [allHomeroomTeachers, searchTeacherQuery, selectedGradeFilter]);

  const handleCopyContact = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedContactId(id);
      setTimeout(() => setCopiedContactId(null), 2500);
    } catch (_e) {}
  };

  // Compute live synchronized metrics directly from student database & journals
  const studentMetrics = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'AKTIF').length;
    const totalRombels = rombels.length;

    // Calculate percentage of active students
    const activePercent = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 100;

    // Calculate active students today from journals recorded in application
    const todayStr = new Date().toISOString().split('T')[0];
    const todayJournals = journals.filter((j) => {
      const isToday = j.journalDate === todayStr || (j as any).date === todayStr;
      const hasCompletedHabits =
        (j.completedCount && j.completedCount > 0) ||
        (j.entries && Object.values(j.entries).some((e: any) => e?.completed)) ||
        ((j as any).habits && Object.values((j as any).habits).some((h: any) => h?.completed));
      return isToday && hasCompletedHabits;
    });

    // Count unique active student IDs who have journal entries today
    const activeStudentIds = new Set(todayJournals.map((j) => j.studentId));
    const activeTodayCount = activeStudentIds.size;
    const activeTodayPercent = totalStudents > 0 ? Math.round((activeTodayCount / totalStudents) * 100) : 0;

    return {
      totalStudents,
      activeStudents,
      totalRombels,
      activePercent,
      activeTodayCount,
      activeTodayPercent,
      hasActiveToday: activeTodayCount > 0,
    };
  }, [students, rombels, journals]);

  // Role configuration mapping
  const roleScopeConfig = {
    STUDENT: {
      label: 'Untuk Murid SMP',
      badge: 'Login Murid SMP',
      greeting: 'Selamat Datang, Anak Hebat!',
      subgreeting: 'Masuk untuk mencatat kebiasaan baikmu setiap hari',
      defaultUser: '',
      defaultName: '',
      placeholder: 'Masukkan NISN atau Username Murid...',
    },
    PARENT: {
      label: 'Untuk Orang Tua / Wali',
      badge: 'Portal Orang Tua / Wali',
      greeting: 'Selamat Datang, Ayah / Bunda!',
      subgreeting: 'Masuk untuk memantau & memvalidasi jurnal pembiasaan ananda di rumah',
      defaultUser: '',
      defaultName: '',
      placeholder: 'Masukkan Username Orang Tua atau NISN / Username Siswa...',
    },
    TEACHER: {
      label: 'Untuk Guru / Wali Kelas',
      badge: 'Login Pendidik & Wali Kelas',
      greeting: 'Selamat Datang, Bapak/Ibu Guru!',
      subgreeting: 'Masuk untuk validasi jurnal dan pendampingan karakter siswa',
      defaultUser: '',
      defaultName: '',
      placeholder: 'Masukkan NIP atau Username Pendidik...',
    },
    PRINCIPAL: {
      label: 'Untuk Kepala Sekolah',
      badge: 'Login Kepala Satuan Pendidikan',
      greeting: 'Selamat Datang, Kepala Sekolah!',
      subgreeting: 'Masuk untuk pantau iklim sekolah dan keterlaksanaan 7KAIH',
      defaultUser: '',
      defaultName: '',
      placeholder: 'Masukkan NIP atau Username Kepala Sekolah...',
    },
    SUPERVISOR: {
      label: 'Untuk Pengawas Pembina',
      badge: 'Login Pengawas Pembina',
      greeting: 'Selamat Datang, Pengawas!',
      subgreeting: 'Masuk untuk supervisi manajerial dan pembinaan antar-sekolah',
      defaultUser: '',
      defaultName: '',
      placeholder: 'Masukkan NIP Pembina atau Username...',
    },
    SCHOOL_ADMIN: {
      label: 'Untuk Admin Sekolah',
      badge: 'Login Administrator Sekolah',
      greeting: 'Selamat Datang, Admin Sekolah!',
      subgreeting: 'Kelola data Dapodik, rombel, akun siswa, dan integrasi SIM',
      defaultUser: '',
      defaultName: '',
      placeholder: 'Masukkan Username Administrator SIM...',
    },
    SUPER_ADMIN: {
      label: 'Untuk Super Admin',
      badge: 'Login Pusat Kemendikdasmen',
      greeting: 'Selamat Datang, Super Admin!',
      subgreeting: 'Pusat kendali nasional 7 Kebiasaan Anak Indonesia Hebat',
      defaultUser: '',
      defaultName: '',
      placeholder: 'Masukkan Username Super Admin...',
    },
  };

  const currentRoleInfo = roleScopeConfig[selectedRoleScope];

  // Daftar lengkap murid untuk pilihan dropdown (hanya murid yang diinput/diimpor oleh Admin Sekolah atau didaftarkan di sistem)
  const allAvailableStudents = useMemo<Student[]>(() => {
    const map = new Map<string, Student>();
    const defaultSchool = schools[0]?.name || '';

    // 1. Data murid tersimpan di master data yang diunggah/diinput oleh Admin Sekolah
    students.forEach((s) => {
      const key = (s.nisn || s.username || s.id || s.name).trim().toLowerCase();
      if (key) {
        // Cari apakah ada akun pengguna murid yang memiliki info nama sekolah
        const matchingUser = users.find(
          (u) =>
            u.role === 'STUDENT' &&
            ((u.identifierValue && u.identifierValue.toLowerCase() === (s.nisn || '').toLowerCase()) ||
              (u.username && u.username.toLowerCase() === (s.username || s.nisn || '').toLowerCase()) ||
              u.id === s.id)
        );
        const matchingSchool = schools.find((sch) => sch.id === s.schoolId || sch.name === s.schoolName);
        const rawSchool = (s.schoolName || matchingSchool?.name || matchingUser?.schoolName || defaultSchool).trim();
        map.set(key, {
          ...s,
          schoolName: rawSchool,
        });
      }
    });

    // 2. Akun pengguna dengan peran STUDENT
    users
      .filter((u) => u.role === 'STUDENT')
      .forEach((u) => {
        const key = (u.identifierValue || u.username || u.id || u.name).trim().toLowerCase();
        if (key && !map.has(key)) {
          const matchingSchool = schools.find((sch) => sch.id === u.schoolId || sch.name === u.schoolName);
          const rawSchool = (u.schoolName || matchingSchool?.name || defaultSchool).trim();
          map.set(key, {
            id: u.id,
            nisn: u.identifierValue || u.username,
            name: u.name,
            gender: u.avatar === '👧🏻' ? 'P' : 'L',
            className: u.className || '',
            parentName: (u as any).parentName || '-',
            status: 'AKTIF',
            source: 'INPUT_MANUAL',
            createdAt: u.createdDate || '2026-07-01',
            username: u.username,
            schoolName: rawSchool,
          });
        }
      });

    // Catatan: FALLBACK_SAMPLE_STUDENTS tidak dimuat agar bila data belum diupdate oleh Admin Sekolah atau Super Admin, jumlah data murni 0
    const list = Array.from(map.values());
    return list.sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }, [students, users, schools]);

  // Daftar sekolah / satuan pendidikan unik yang tersedia untuk filter dropdown (Hanya dari data master yang telah diupdate oleh Super Admin)
  const availableSchoolsForLogin = useMemo<string[]>(() => {
    const set = new Set<string>();

    // 1. Dari master data satuan pendidikan yang diupdate oleh Super Admin
    schools.forEach((sch) => {
      if (sch.name && sch.name.trim()) set.add(sch.name.trim());
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'));
  }, [schools]);

  // Nilai efektif sekolah: jika belum ada data dari Super Admin, otomatis '0'
  const effectiveSelectedSchool = availableSchoolsForLogin.length === 0 ? '0' : selectedSchoolForLogin;

  // Murid yang berada di bawah satuan pendidikan / sekolah yang sedang dipilih
  const studentsInSelectedSchool = useMemo<Student[]>(() => {
    if (effectiveSelectedSchool === '0' || availableSchoolsForLogin.length === 0) {
      return [];
    }
    if (effectiveSelectedSchool === 'ALL') {
      return allAvailableStudents;
    }
    return allAvailableStudents.filter((s) => s.schoolName === effectiveSelectedSchool);
  }, [allAvailableStudents, effectiveSelectedSchool, availableSchoolsForLogin]);

  // Daftar kelas / rombel unik yang tersedia untuk filter dropdown (tersinkron dengan rombel & siswa yang diupdate oleh Admin Sekolah)
  const availableClassesForLogin = useMemo<string[]>(() => {
    // Jika belum ada satuan pendidikan atau satuan pendidikan di-default ke '0', kelas otomatis 0
    if (availableSchoolsForLogin.length === 0 || effectiveSelectedSchool === '0') {
      return [];
    }

    const set = new Set<string>();

    // 1. Dari master rombel yang diupdate oleh Admin Sekolah
    rombels.forEach((r) => {
      if (!r.name || !r.name.trim()) return;
      if (effectiveSelectedSchool === 'ALL') {
        set.add(r.name.trim());
      } else {
        const currentSchoolObj = schools.find((sch) => sch.name.toLowerCase() === effectiveSelectedSchool.toLowerCase());
        const matchSchool =
          (r.schoolName && r.schoolName.toLowerCase() === effectiveSelectedSchool.toLowerCase()) ||
          (currentSchoolObj && r.schoolId && r.schoolId === currentSchoolObj.id) ||
          studentsInSelectedSchool.some((s) => s.className === r.name);
        if (matchSchool) {
          set.add(r.name.trim());
        }
      }
    });

    // 2. Dari data murid yang diinput Admin Sekolah di sekolah terpilih
    studentsInSelectedSchool.forEach((s) => {
      if (s.className && s.className.trim()) {
        set.add(s.className.trim());
      }
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id', { numeric: true }));
  }, [rombels, studentsInSelectedSchool, effectiveSelectedSchool, availableSchoolsForLogin, schools]);

  // Nilai efektif kelas: jika belum ada data rombel dari Admin Sekolah, otomatis '0'
  const effectiveSelectedClass =
    availableSchoolsForLogin.length === 0 || availableClassesForLogin.length === 0
      ? '0'
      : selectedClassForLogin;

  // Filter murid berdasarkan sekolah dan kelas yang dipilih pada dropdown
  const filteredStudentsForDropdown = useMemo<Student[]>(() => {
    if (
      availableSchoolsForLogin.length === 0 ||
      effectiveSelectedSchool === '0' ||
      availableClassesForLogin.length === 0 ||
      effectiveSelectedClass === '0'
    ) {
      return [];
    }
    return allAvailableStudents.filter((s) => {
      // 1. Filter sekolah jika dipilih spesifik
      if (effectiveSelectedSchool !== 'ALL' && s.schoolName !== effectiveSelectedSchool) {
        return false;
      }
      // 2. Filter kelas jika dipilih spesifik
      if (effectiveSelectedClass !== 'ALL' && s.className !== effectiveSelectedClass) {
        return false;
      }
      return true;
    });
  }, [allAvailableStudents, effectiveSelectedSchool, effectiveSelectedClass, availableSchoolsForLogin, availableClassesForLogin]);

  // Detail murid yang sedang dipilih
  const selectedStudentDetail = useMemo<Student | undefined>(() => {
    const target = (selectedStudentNisn || inputIdentifier).trim().toLowerCase();
    if (!target) return undefined;
    return allAvailableStudents.find(
      (s) =>
        s.nisn.toLowerCase() === target ||
        (s.username && s.username.toLowerCase() === target) ||
        s.id.toLowerCase() === target ||
        s.name.toLowerCase() === target
    );
  }, [allAvailableStudents, selectedStudentNisn, inputIdentifier]);

  // Handler pergantian sekolah pada dropdown (sinkronisasi reset kelas dan murid jika tidak cocok)
  const handleSchoolChange = (newSchool: string) => {
    setSelectedSchoolForLogin(newSchool);
    try {
      if (newSchool === 'ALL' || newSchool === '0') {
        localStorage.removeItem('si7kaih_remembered_school');
      } else {
        localStorage.setItem('si7kaih_remembered_school', newSchool);
      }
    } catch (_e) {}

    // Periksa apakah kelas saat ini masih valid di sekolah baru
    if (newSchool !== 'ALL' && newSchool !== '0') {
      const validClasses = new Set<string>();
      allAvailableStudents
        .filter((s) => s.schoolName === newSchool)
        .forEach((s) => {
          if (s.className) validClasses.add(s.className.trim());
        });

      if (selectedClassForLogin !== 'ALL' && selectedClassForLogin !== '0' && !validClasses.has(selectedClassForLogin)) {
        setSelectedClassForLogin(validClasses.size > 0 ? 'ALL' : '0');
      }

      // Periksa apakah murid yang saat ini terpilih ada di sekolah baru
      if (selectedStudentNisn) {
        const found = allAvailableStudents.find((s) => s.nisn === selectedStudentNisn);
        if (found && found.schoolName && found.schoolName !== newSchool) {
          setSelectedStudentNisn('');
          setInputIdentifier('');
        }
      }
    } else if (newSchool === '0') {
      setSelectedClassForLogin('0');
      setSelectedStudentNisn('');
      setInputIdentifier('');
    }
  };

  const handleSelectStudentFromDropdown = (nisn: string) => {
    setSelectedStudentNisn(nisn);
    if (!nisn) {
      setInputIdentifier('');
      return;
    }
    const found = allAvailableStudents.find((s) => s.nisn === nisn || s.id === nisn);
    if (found) {
      setInputIdentifier(found.nisn || found.username || found.name);
      // Sinkronkan sekolah jika saat ini masih 'ALL' atau '0' dan siswa memiliki data sekolah
      if (found.schoolName && (selectedSchoolForLogin === 'ALL' || selectedSchoolForLogin === '0')) {
        setSelectedSchoolForLogin(found.schoolName);
        try {
          localStorage.setItem('si7kaih_remembered_school', found.schoolName);
        } catch (_e) {}
      }
      // Sinkronkan kelas jika saat ini masih 'ALL' atau '0' dan siswa memiliki data kelas
      if (found.className && (selectedClassForLogin === 'ALL' || selectedClassForLogin === '0')) {
        setSelectedClassForLogin(found.className);
      }
      // Pengaturan login murid via dropdown: tidak menampilkan otomatis password
      setInputPassword('');
      setErrorMessage('');
    }
  };

  const handleClassChange = (newClass: string) => {
    setSelectedClassForLogin(newClass);
    if (newClass !== 'ALL' && newClass !== '0' && selectedStudentNisn) {
      const found = allAvailableStudents.find((s) => s.nisn === selectedStudentNisn);
      if (found && found.className !== newClass) {
        setSelectedStudentNisn('');
        setInputIdentifier('');
      }
    }
  };

  // Handle switching role scope from dropdown
  const handleSelectRoleScope = (scope: typeof selectedRoleScope) => {
    setSelectedRoleScope(scope);
    setIsRoleDropdownOpen(false);
    setIsCardRoleDropdownOpen(false);

    if (scope === 'STUDENT' || scope === 'PARENT') {
      setLoginInputMode('DROPDOWN');
    }

    // Cek apakah ada data identitas yang tersimpan otomatis di browser untuk peran ini
    try {
      const savedRole = localStorage.getItem('si7kaih_remembered_role');
      const savedId = localStorage.getItem('si7kaih_remembered_identifier');
      if (savedRole === scope && savedId) {
        setInputIdentifier(savedId);
        setSelectedStudentNisn(savedId);
      } else if (scope !== 'STUDENT' && scope !== 'PARENT') {
        setInputIdentifier('');
        setSelectedStudentNisn('');
      }
    } catch (_e) {
      if (scope !== 'STUDENT' && scope !== 'PARENT') {
        setInputIdentifier('');
        setSelectedStudentNisn('');
      }
    }
    // Tidak menampilkan otomatis password pada form login
    setInputPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Perform actual login validation
  const performLogin = (identifier: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      if (selectedRoleScope === 'STUDENT' || selectedRoleScope === 'PARENT') {
        setErrorMessage(
          selectedRoleScope === 'STUDENT'
            ? 'Harap pilih nama murid dan kelas dari dropdown terlebih dahulu.'
            : 'Harap pilih nama murid ananda dan kelas dari dropdown terlebih dahulu.'
        );
      } else {
        setErrorMessage(
          selectedRoleScope === 'PARENT'
            ? 'Harap masukkan username orang tua atau NISN / username siswa putra-putri Anda.'
            : 'Harap masukkan NISN, username, NIP, atau ID pengguna Anda.'
        );
      }
      return;
    }

    const activePassword = inputPassword.trim();
    if (!activePassword) {
      setErrorMessage(
        selectedRoleScope === 'STUDENT'
          ? 'Harap masukkan password akun murid Anda.'
          : 'Harap masukkan password akun Anda.'
      );
      return;
    }

    setIsSubmitting(true);

    const saveBrowserRememberState = (role: string, identifierVal: string) => {
      try {
        if (rememberMe) {
          localStorage.setItem('si7kaih_remember_me', 'true');
          localStorage.setItem('si7kaih_remembered_role', role);
          localStorage.setItem('si7kaih_remembered_identifier', identifierVal);
        } else {
          localStorage.setItem('si7kaih_remember_me', 'false');
          localStorage.removeItem('si7kaih_remembered_role');
          localStorage.removeItem('si7kaih_remembered_identifier');
        }
      } catch (_e) {}
    };

    setTimeout(() => {
      const freshUsers = getStoredUsers();
      const freshStudents = getStoredStudents();
      const poolOfStudents = freshStudents.length > 0 ? freshStudents : allAvailableStudents;

      // Autentikasi akun Super Administrator
      if (cleanId === 'superadmin' || cleanId === 'superadmin.kemdikbud' || cleanId === 'pusdatin-adm-8801') {
        const sa = freshUsers.find((u) => u.role === 'SUPER_ADMIN') || USER_PERSONAS.find((u) => u.role === 'SUPER_ADMIN');
        if (sa) {
          saveBrowserRememberState('SUPER_ADMIN', cleanId);
          setIsSubmitting(false);
          setSuccessMessage(`Autentikasi Berhasil! Mengalihkan ke dashboard ${sa.name}...`);
          setTimeout(() => {
            onLoginSuccess(sa);
          }, 350);
          return;
        }
      }

      // 1. Lingkup Autentikasi: ORANG TUA / WALI
      if (selectedRoleScope === 'PARENT') {
        // Cek apakah ada akun eksplisit bertipe PARENT di master akun pengguna
        const matchedParent = freshUsers.find(
          (u) =>
            u.role === 'PARENT' &&
            (u.username.toLowerCase() === cleanId ||
              u.identifierValue.toLowerCase() === cleanId ||
              u.email.toLowerCase() === cleanId ||
              u.name.toLowerCase().includes(cleanId) ||
              (u.childNisn && u.childNisn.toLowerCase() === cleanId))
        );

        if (matchedParent) {
          if (matchedParent.accountStatus === 'MANDIRI_NONAKTIF') {
            setIsSubmitting(false);
            setErrorMessage('Akun orang tua ini sedang dinonaktifkan oleh Administrator SIM Sekolah.');
            return;
          }
          saveBrowserRememberState(matchedParent.role, cleanId);
          setIsSubmitting(false);
          setSuccessMessage(`Autentikasi Orang Tua Berhasil! Selamat datang, ${matchedParent.name}...`);
          setTimeout(() => {
            onLoginSuccess(matchedParent);
          }, 350);
          return;
        }

        // Dukungan login orang tua langsung via NISN / Username anak terdaftar
        const matchedStudent = poolOfStudents.find(
          (s) =>
            s.nisn.toLowerCase() === cleanId ||
            s.username.toLowerCase() === cleanId ||
            s.id.toLowerCase() === cleanId ||
            s.name.toLowerCase().includes(cleanId)
        );

        if (matchedStudent) {
          const parentName =
            matchedStudent.parentName && matchedStudent.parentName !== '-'
              ? matchedStudent.parentName
              : `Orang Tua (${matchedStudent.name})`;

          const resolvedSchoolName =
            matchedStudent.schoolName ||
            (effectiveSelectedSchool !== 'ALL' && effectiveSelectedSchool !== '0'
              ? effectiveSelectedSchool
              : schools[0]?.name || 'Satuan Pendidikan');

          const dynamicParentPersona: UserPersona = {
            id: `parent-${matchedStudent.id}`,
            name: parentName,
            role: 'PARENT',
            title: `Wali Murid dari ${matchedStudent.name} (${matchedStudent.className})`,
            avatar: '👨‍👩‍👧',
            schoolName: resolvedSchoolName,
            className: matchedStudent.className,
            identifierLabel: 'NISN Ananda',
            identifierValue: matchedStudent.nisn,
            username: `wali.${matchedStudent.nisn}`,
            email: `wali.${matchedStudent.nisn}@keluarga.sch.id`,
            accountStatus: 'MANDIRI_AKTIF',
            authChannel: 'MANDIRI_INTERNAL',
            authProviderLabel: 'Portal Orang Tua Mandiri',
            securityLevel: 'Orang Tua / Wali Murid',
            managedBy: 'Satuan Pendidikan & Orang Tua Siswa',
            childName: matchedStudent.name,
            childId: matchedStudent.id,
            childNisn: matchedStudent.nisn,
          };

          saveBrowserRememberState('PARENT', cleanId);
          setIsSubmitting(false);
          setSuccessMessage(`Autentikasi Wali Murid Berhasil! Mengalihkan ke pendampingan ${matchedStudent.name}...`);
          setTimeout(() => {
            onLoginSuccess(dynamicParentPersona);
          }, 350);
          return;
        }

        setIsSubmitting(false);
        setErrorMessage(
          'Data siswa atau akun orang tua tidak ditemukan. Pastikan NISN atau username ananda telah terdaftar di master data satuan pendidikan.'
        );
        return;
      }

      // 2. Lingkup Autentikasi: SISWA / MURID
      if (selectedRoleScope === 'STUDENT') {
        const matchedStudentUser = freshUsers.find(
          (u) =>
            u.role === 'STUDENT' &&
            (u.username.toLowerCase() === cleanId ||
              u.identifierValue.toLowerCase() === cleanId ||
              u.email.toLowerCase() === cleanId ||
              u.name.toLowerCase().includes(cleanId))
        );
        if (matchedStudentUser) {
          if (matchedStudentUser.accountStatus === 'MANDIRI_NONAKTIF') {
            setIsSubmitting(false);
            setErrorMessage('Akun murid dinonaktifkan oleh Administrator SIM Sekolah.');
            return;
          }
          saveBrowserRememberState(matchedStudentUser.role, cleanId);
          setIsSubmitting(false);
          setSuccessMessage(`Autentikasi Berhasil! Selamat datang, ${matchedStudentUser.name}...`);
          setTimeout(() => {
            onLoginSuccess(matchedStudentUser);
          }, 350);
          return;
        }

        const matchedStudent = poolOfStudents.find(
          (s) =>
            s.nisn.toLowerCase() === cleanId ||
            s.username.toLowerCase() === cleanId ||
            s.id.toLowerCase() === cleanId ||
            s.name.toLowerCase().includes(cleanId)
        );
        if (matchedStudent) {
          const resolvedSchoolName =
            matchedStudent.schoolName ||
            (effectiveSelectedSchool !== 'ALL' && effectiveSelectedSchool !== '0'
              ? effectiveSelectedSchool
              : schools[0]?.name || 'Satuan Pendidikan');

          const dynamicStudentPersona: UserPersona = {
            id: matchedStudent.id,
            name: matchedStudent.name,
            role: 'STUDENT',
            title: `Siswa ${matchedStudent.className}`,
            avatar: matchedStudent.gender === 'L' ? '👦🏻' : '👧🏻',
            schoolName: resolvedSchoolName,
            className: matchedStudent.className,
            identifierLabel: 'NISN',
            identifierValue: matchedStudent.nisn,
            username: matchedStudent.username || matchedStudent.nisn,
            email: `${matchedStudent.username || matchedStudent.nisn}@siswa.sch.id`,
            accountStatus: 'MANDIRI_AKTIF',
            authChannel: 'MANDIRI_INTERNAL',
            authProviderLabel: 'Portal Siswa Mandiri',
            securityLevel: 'Peserta Didik (Pengisian Jurnal & Refleksi Harian)',
            managedBy: 'Wali Kelas & Admin Satuan Pendidikan',
          };
          saveBrowserRememberState('STUDENT', cleanId);
          setIsSubmitting(false);
          setSuccessMessage(`Autentikasi Berhasil! Selamat datang, ${matchedStudent.name}...`);
          setTimeout(() => {
            onLoginSuccess(dynamicStudentPersona);
          }, 350);
          return;
        }
      }

      // 3. Pencocokan akun umum untuk Pendidik, Kepala Sekolah, Pengawas, dan Admin
      const matched = freshUsers.find(
        (u) =>
          u.username.toLowerCase() === cleanId ||
          u.identifierValue.toLowerCase() === cleanId ||
          u.email.toLowerCase() === cleanId ||
          u.name.toLowerCase().includes(cleanId)
      );

      if (!matched) {
        setIsSubmitting(false);
        setErrorMessage(
          'Akun tidak ditemukan. Pastikan NISN / NIP / Username terdaftar resmi di SIM Satuan Pendidikan.'
        );
        return;
      }

      if (matched.accountStatus === 'MANDIRI_NONAKTIF') {
        setIsSubmitting(false);
        setErrorMessage('Akun Anda dinonaktifkan oleh Administrator Satuan Pendidikan.');
        return;
      }

      saveBrowserRememberState(matched.role, cleanId);
      setIsSubmitting(false);
      setSuccessMessage(`Autentikasi Berhasil! Mengalihkan ke dashboard ${matched.name}...`);
      setTimeout(() => {
        onLoginSuccess(matched);
      }, 350);
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(inputIdentifier);
  };

  // PIN Login execution (Hanya Super Admin yang memiliki verifikasi master PIN default)
  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPinError('');

    if (pinInput.length < 4) {
      setPinError('Masukkan 4 digit PIN Anda');
      return;
    }

    const freshUsers = getStoredUsers();
    // Default PIN verification khusus Super Admin master access
    if (pinInput === '1234' || pinInput === '8801') {
      const superAdmin = freshUsers.find((u) => u.role === 'SUPER_ADMIN') || USER_PERSONAS.find((u) => u.role === 'SUPER_ADMIN');
      if (superAdmin) {
        setIsPinModalOpen(false);
        setSuccessMessage(`PIN Master Super Admin Terverifikasi! Mengalihkan...`);
        setTimeout(() => {
          onLoginSuccess(superAdmin);
        }, 350);
        return;
      }
    }

    // Untuk pengguna lain, PIN harus cocok dengan 4 digit akhir identitas akun yang terdaftar
    const pinMatch = freshUsers.find(
      (u) => u.identifierValue.slice(-4) === pinInput || u.username.slice(-4) === pinInput
    );
    if (pinMatch) {
      setIsPinModalOpen(false);
      setSuccessMessage(`PIN Valid! Mengalihkan ke ${pinMatch.name}...`);
      setTimeout(() => {
        onLoginSuccess(pinMatch);
      }, 350);
      return;
    }

    setPinError('PIN tidak valid atau tidak terdaftar di sistem.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F2A] via-[#1E1B4B] via-[#2D124D] to-[#0D1527] text-slate-800 flex flex-col justify-between items-center px-4 py-4 sm:py-6 relative overflow-x-hidden select-none">
      
      {/* Decorative Radiant Background Glowing Orbs (Gradasi Penuh Warna) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/4 -right-32 w-[450px] h-[450px] rounded-full bg-fuchsia-500/25 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-28 left-1/4 w-96 h-96 rounded-full bg-amber-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-2/3 -left-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />

      {/* Background Subtle Tech/Geometric Mesh Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mobile-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="2 4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mobile-grid)" />
        </svg>
      </div>

      {/* ==================================================================== */}
      {/* 1. TOP FLOATING UTILITY BAR (Glassmorphism Pill with Nav Modals) */}
      {/* ==================================================================== */}
      <header className="w-full max-w-[440px] pt-1 pb-3 relative z-30 flex items-center justify-between gap-2 px-1">
        {/* App Mini Logo & Name */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-xs">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="text-xs font-black tracking-tight text-white">
            SI-7KAIH AI
          </span>
          <span className="text-[10px] text-blue-200 font-semibold hidden sm:inline">
            • SMP Hebat
          </span>
        </div>

        {/* Quick Nav Links Modals (Tentang, Manfaat, Kontak) */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setNavModal('TENTANG')}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-2xs"
            title="Tentang SI-7KAIH AI"
          >
            Tentang
          </button>
          <button
            type="button"
            onClick={() => setNavModal('MANFAAT')}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-2xs"
            title="Manfaat Program"
          >
            Manfaat
          </button>
          <button
            type="button"
            onClick={() => setNavModal('KONTAK')}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-2xs"
            title="Kontak Layanan"
          >
            Kontak
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN HERO SECTION - SINGLE MOBILE APP CARD (Gradasi Penuh Warna & Gaya Mobile) */}
      {/* ==================================================================== */}
      <main className="w-full max-w-[430px] mx-auto px-2 sm:px-4 py-4 sm:py-6 relative z-20 flex-1 flex flex-col justify-center items-center">
        {/* Mobile Device Frame with High-End Depth and Gradient Border */}
        <div className="w-full rounded-[42px] p-[2.5px] bg-gradient-to-b from-cyan-400 via-indigo-500 to-pink-500 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_40px_rgba(99,102,241,0.25)] ring-1 ring-white/30 transition-all duration-300">
          <div className="w-full rounded-[40px] bg-slate-900 overflow-hidden flex flex-col">
            
            {/* Mobile Status Bar (iOS / Android Style) */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 px-6 pt-3.5 pb-1 flex items-center justify-between text-[11px] font-bold text-white/95 select-none">
              <span className="tracking-tight font-black">07:00</span>
              {/* Dynamic Island Notch */}
              <div className="w-24 h-4 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center gap-1.5 shadow-inner border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="w-2.5 h-2.5 rounded-full bg-black/90 border border-slate-700" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold tracking-wider">5G</span>
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4 text-emerald-300 fill-emerald-300" />
              </div>
            </div>

            {/* Mobile App Header: Full Vibrant Gradient Banner */}
            <div className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] via-[#7C3AED] to-[#EC4899] p-5 pt-3 text-white relative overflow-hidden select-none">
              {/* Decorative radial glows */}
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/15 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-amber-400/25 blur-xl pointer-events-none" />

              {/* App Brand Row */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21V12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M12 12C9 7 5 7 3 9C2 13 6 15 12 12Z" fill="#34D399" />
                      <path d="M12 12C15 6 20 7 21 10C22 14 17 16 12 12Z" fill="#38BDF8" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h1 className="text-lg font-black tracking-tight leading-tight drop-shadow-xs">
                        SI-7KAIH AI
                      </h1>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 tracking-wider">
                        App
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-100/90 font-medium">
                      Jurnal Aktivitas Siswa SMP
                    </p>
                  </div>
                </div>

                {/* Role indicator pill (Klik untuk buka daftar peran / Lainnya) */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsCardRoleDropdownOpen(true)}
                    className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/25 hover:bg-white/35 active:scale-95 transition-all backdrop-blur-md border border-white/40 flex items-center gap-1 shadow-sm cursor-pointer"
                    title="Ganti portal peran pengguna"
                  >
                    <span>
                      {selectedRoleScope === 'PARENT'
                        ? '👨‍👩‍👧'
                        : selectedRoleScope === 'STUDENT'
                        ? '🎓'
                        : selectedRoleScope === 'TEACHER'
                        ? '👨‍🏫'
                        : selectedRoleScope === 'PRINCIPAL'
                        ? '🏫'
                        : selectedRoleScope === 'SUPERVISOR'
                        ? '🔍'
                        : selectedRoleScope === 'SCHOOL_ADMIN'
                        ? '⚙️'
                        : '🏛️'}
                    </span>
                    <span>
                      {selectedRoleScope === 'STUDENT'
                        ? 'Murid'
                        : selectedRoleScope === 'PARENT'
                        ? 'Orang Tua'
                        : selectedRoleScope === 'TEACHER'
                        ? 'Guru'
                        : selectedRoleScope === 'PRINCIPAL'
                        ? 'Kepsek'
                        : selectedRoleScope === 'SUPERVISOR'
                        ? 'Pengawas'
                        : selectedRoleScope === 'SCHOOL_ADMIN'
                        ? 'Admin SIM'
                        : 'Super Admin'}
                    </span>
                    <span className="text-[9px] opacity-75">▾</span>
                  </button>
                </div>
              </div>

              {/* Welcome text based on role */}
              <div className="mt-3 relative z-10">
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                  {selectedRoleScope === 'STUDENT' && 'Selamat Datang, Anak Hebat! ✨'}
                  {selectedRoleScope === 'PARENT' && 'Selamat Datang, Ayah / Bunda! 👨‍👩‍👧'}
                  {selectedRoleScope === 'TEACHER' && 'Selamat Datang, Bapak/Ibu Guru! 👨‍🏫'}
                  {selectedRoleScope === 'PRINCIPAL' && 'Selamat Datang, Kepala Sekolah! 🏫'}
                  {selectedRoleScope === 'SUPERVISOR' && 'Selamat Datang, Pengawas Pembina! 🔍'}
                  {selectedRoleScope === 'SCHOOL_ADMIN' && 'Selamat Datang, Administrator! ⚙️'}
                  {selectedRoleScope === 'SUPER_ADMIN' && 'Selamat Datang, Super Admin! 🏛️'}
                </h2>
                <p className="text-xs text-blue-100/90 mt-0.5 leading-snug">
                  {currentRoleInfo.subgreeting}
                </p>
              </div>

              {/* 7 Kebiasaan Story / Icon Ribbon */}
              <div className="mt-3.5 pt-2.5 border-t border-white/20 relative z-10">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-blue-100 mb-1.5 px-0.5">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-300" />
                    <span>7 Kebiasaan Anak Indonesia Hebat</span>
                  </span>
                  <span className="text-[9px] text-pink-200 font-bold">7 Dimensi</span>
                </div>

                <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5">
                  <div className="flex flex-col items-center gap-0.5 shrink-0" title="1. Bangun Pagi">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-xs ring-2 ring-white/50">
                      <Sun className="w-4 h-4 stroke-[2.4]" />
                    </div>
                    <span className="text-[8px] font-black text-blue-50 leading-tight">Pagi</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 shrink-0" title="2. Beribadah">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-xs ring-2 ring-white/50">
                      <Heart className="w-4 h-4 stroke-[2.4]" />
                    </div>
                    <span className="text-[8px] font-black text-blue-50 leading-tight">Ibadah</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 shrink-0" title="3. Berolahraga">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-400 text-white flex items-center justify-center shadow-xs ring-2 ring-white/50">
                      <Activity className="w-4 h-4 stroke-[2.4]" />
                    </div>
                    <span className="text-[8px] font-black text-blue-50 leading-tight">Olahraga</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 shrink-0" title="4. Makan Sehat">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-600 to-lime-400 text-white flex items-center justify-center shadow-xs ring-2 ring-white/50">
                      <Utensils className="w-4 h-4 stroke-[2.4]" />
                    </div>
                    <span className="text-[8px] font-black text-blue-50 leading-tight">Makan</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 shrink-0" title="5. Gemar Belajar">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-violet-400 text-white flex items-center justify-center shadow-xs ring-2 ring-white/50">
                      <BookOpen className="w-4 h-4 stroke-[2.4]" />
                    </div>
                    <span className="text-[8px] font-black text-blue-50 leading-tight">Belajar</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 shrink-0" title="6. Bermasyarakat">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-pink-400 text-white flex items-center justify-center shadow-xs ring-2 ring-white/50">
                      <Users className="w-4 h-4 stroke-[2.4]" />
                    </div>
                    <span className="text-[8px] font-black text-blue-50 leading-tight">Sosial</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 shrink-0" title="7. Tidur Cepat">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-700 to-blue-500 text-white flex items-center justify-center shadow-xs ring-2 ring-white/50">
                      <Moon className="w-4 h-4 stroke-[2.4]" />
                    </div>
                    <span className="text-[8px] font-black text-blue-50 leading-tight">Tidur</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Form Body */}
            <div className="bg-white p-5 sm:p-6 flex flex-col justify-between space-y-4 relative">
              <div className="space-y-3">

              {/* Petunjuk Interaktif Klik Portal Pengguna dengan Icon Animasi */}
              <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-900 shadow-sm ring-4 ring-amber-300/40 animate-bounce shrink-0">
                    <MousePointerClick className="w-3.5 h-3.5" />
                  </span>
                  <span className="tracking-tight">Portal Pengguna:</span>
                </div>
                {/* Akses Tunggal Pilihan Portal Lainnya / Semua Peran */}
                <button
                  type="button"
                  id="btn-semua-peran-lainnya"
                  onClick={() => setIsCardRoleDropdownOpen(!isCardRoleDropdownOpen)}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full cursor-pointer transition-all shadow-2xs ${
                    selectedRoleScope !== 'STUDENT' && selectedRoleScope !== 'PARENT' && selectedRoleScope !== 'TEACHER'
                      ? 'bg-[#0753A5] text-white ring-2 ring-blue-300'
                      : 'text-[#0753A5] bg-blue-50 hover:bg-blue-100 border border-blue-200/90 active:scale-95'
                  }`}
                  title="Buka semua 7 pilihan portal peran pengguna (termasuk Kepala Sekolah, Pengawas, Admin SIM, Super Admin)"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedRoleScope !== 'STUDENT' && selectedRoleScope !== 'PARENT' && selectedRoleScope !== 'TEACHER'
                      ? 'bg-amber-300 animate-pulse'
                      : 'bg-blue-600 animate-ping'
                  }`} />
                  <span className="whitespace-nowrap">
                    {selectedRoleScope !== 'STUDENT' && selectedRoleScope !== 'PARENT' && selectedRoleScope !== 'TEACHER'
                      ? `${currentRoleInfo.badge.replace('Login ', '')} ▾`
                      : 'Semua Peran / Lainnya ▾'}
                  </span>
                </button>
              </div>

              {/* Quick Portal Switcher Tabs (3 Kolom Luas: Murid, Orang Tua Lengkap, Guru) */}
              <div className="relative">
                <div className="bg-slate-100/95 p-1 rounded-2xl grid grid-cols-3 gap-1.5 text-xs ring-1 ring-slate-200/80 shadow-2xs w-full">
                  {/* Tab 1: Murid */}
                  <button
                    type="button"
                    onClick={() => handleSelectRoleScope('STUDENT')}
                    className={`py-2 px-2 rounded-xl font-bold transition-all text-center whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedRoleScope === 'STUDENT'
                        ? 'bg-white text-[#0753A5] shadow-xs ring-1 ring-blue-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <span className="text-sm">🎓</span>
                    <span className="whitespace-nowrap">Murid</span>
                  </button>

                  {/* Tab 2: Orang Tua (Lengkap tanpa terpotong) */}
                  <button
                    type="button"
                    onClick={() => handleSelectRoleScope('PARENT')}
                    className={`py-2 px-2 rounded-xl font-bold transition-all text-center whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedRoleScope === 'PARENT'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <span className="text-sm">👨‍👩‍👧</span>
                    <span className="whitespace-nowrap">Orang Tua</span>
                  </button>

                  {/* Tab 3: Guru */}
                  <button
                    type="button"
                    onClick={() => handleSelectRoleScope('TEACHER')}
                    className={`py-2 px-2 rounded-xl font-bold transition-all text-center whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedRoleScope === 'TEACHER'
                        ? 'bg-white text-[#0753A5] shadow-xs ring-1 ring-blue-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <span className="text-sm">👨‍🏫</span>
                    <span className="whitespace-nowrap">Guru</span>
                  </button>
                </div>

                {/* Status Bar Jika Peran 'Lainnya' Sedang Aktif */}
                {selectedRoleScope !== 'STUDENT' && selectedRoleScope !== 'PARENT' && selectedRoleScope !== 'TEACHER' && (
                  <div className="mt-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-[#0753A5]">
                    <div className="flex items-center gap-1.5 font-bold truncate">
                      <span>
                        {selectedRoleScope === 'PRINCIPAL' ? '🏫' : selectedRoleScope === 'SUPERVISOR' ? '🔍' : selectedRoleScope === 'SCHOOL_ADMIN' ? '⚙️' : '🏛️'}
                      </span>
                      <span className="truncate">Peran Aktif: <strong>{currentRoleInfo.badge}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCardRoleDropdownOpen(true)}
                      className="text-[10px] font-black text-blue-700 hover:text-blue-900 shrink-0 ml-1 underline cursor-pointer"
                    >
                      Ubah ▾
                    </button>
                  </div>
                )}

                {/* Popover Dropdown for Card Quick Switcher */}
                {isCardRoleDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
                      onClick={() => setIsCardRoleDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[75vh] overflow-y-auto">
                      <div className="px-3.5 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                          <span>Pilih Portal Pengguna</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsCardRoleDropdownOpen(false)}
                          className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
                          title="Tutup"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Kelompok Portal Utama */}
                      <div className="px-3 pt-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Portal Utama
                      </div>
                      <div className="px-1.5 space-y-0.5">
                        {(['STUDENT', 'PARENT', 'TEACHER'] as const).map((scopeKey) => {
                          const item = roleScopeConfig[scopeKey];
                          const isSelected = selectedRoleScope === scopeKey;
                          return (
                            <button
                              key={scopeKey}
                              type="button"
                              onClick={() => handleSelectRoleScope(scopeKey)}
                              className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50 text-[#0753A5] font-black ring-1 ring-blue-200'
                                  : 'text-slate-700 hover:bg-slate-50 font-semibold'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">
                                  {scopeKey === 'STUDENT' ? '🎓' : scopeKey === 'PARENT' ? '👨‍👩‍👧' : '👨‍🏫'}
                                </span>
                                <div>
                                  <div className="leading-tight">{item.label}</div>
                                  <div className="text-[10px] text-slate-400 font-normal">{item.badge}</div>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-[#0753A5] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Kelompok Portal Lainnya */}
                      <div className="px-3 pt-2.5 pb-1 text-[10px] font-black text-amber-600 uppercase tracking-wider border-t border-slate-100 mt-1.5 flex items-center justify-between">
                        <span>Pilihan Portal Pengguna Lainnya</span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">4 Peran</span>
                      </div>
                      <div className="px-1.5 pb-1 space-y-0.5">
                        {(['PRINCIPAL', 'SUPERVISOR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'] as const).map((scopeKey) => {
                          const item = roleScopeConfig[scopeKey];
                          const isSelected = selectedRoleScope === scopeKey;
                          return (
                            <button
                              key={scopeKey}
                              type="button"
                              onClick={() => handleSelectRoleScope(scopeKey)}
                              className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-50 text-amber-900 font-black ring-1 ring-amber-300'
                                  : 'text-slate-700 hover:bg-slate-50 font-semibold'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">
                                  {scopeKey === 'PRINCIPAL' ? '🏫' : scopeKey === 'SUPERVISOR' ? '🔍' : scopeKey === 'SCHOOL_ADMIN' ? '⚙️' : '🏛️'}
                                </span>
                                <div>
                                  <div className="leading-tight">{item.label}</div>
                                  <div className="text-[10px] text-slate-400 font-normal">{item.badge}</div>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-amber-700 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Main Heading & Greeting */}
              <div className="pt-1">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {selectedRoleScope === 'STUDENT' ? (
                    <>Selamat Datang, <span className="text-[#0753A5]">Anak Hebat!</span></>
                  ) : selectedRoleScope === 'PARENT' ? (
                    <>Selamat Datang, <span className="text-emerald-700">Ayah / Bunda!</span></>
                  ) : selectedRoleScope === 'TEACHER' ? (
                    <>Selamat Datang, <span className="text-[#0753A5]">Bapak/Ibu Guru!</span></>
                  ) : selectedRoleScope === 'PRINCIPAL' ? (
                    <>Selamat Datang, <span className="text-purple-700">Kepala Sekolah!</span></>
                  ) : selectedRoleScope === 'SUPERVISOR' ? (
                    <>Selamat Datang, <span className="text-cyan-700">Pengawas Pembina!</span></>
                  ) : selectedRoleScope === 'SCHOOL_ADMIN' ? (
                    <>Selamat Datang, <span className="text-amber-700">Admin SIM!</span></>
                  ) : (
                    <>Selamat Datang, <span className="text-purple-700">Super Admin!</span></>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {currentRoleInfo.subgreeting}
                </p>
              </div>
            </div>

            {/* Inactivity Notice Banner */}
            {inactivityNotice && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5 animate-in fade-in shadow-2xs">
                <Clock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <p className="font-bold text-amber-950">Sesi Telah Berakhir Otomatis</p>
                  <p className="text-amber-800 leading-relaxed">{inactivityNotice}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setInactivityNotice(null)}
                  className="text-amber-700 hover:text-amber-950 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-amber-100 cursor-pointer"
                  title="Tutup Notifikasi"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Error or Success Notification */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* PENGATURAN LOGIN MURID DAN ORANG TUA: DROPDOWN PILIHAN SEKOLAH, KELAS, DAN NAMA MURID */}
              {selectedRoleScope === 'STUDENT' || selectedRoleScope === 'PARENT' ? (
                <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-blue-50/60 to-slate-50/80 border border-blue-100 shadow-2xs">
                  {/* Header & Mode Switcher */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className={`w-4 h-4 ${selectedRoleScope === 'PARENT' ? 'text-emerald-700' : 'text-[#0753A5]'}`} />
                      <label className="text-xs sm:text-sm font-bold text-slate-800">
                        {selectedRoleScope === 'STUDENT'
                          ? 'Pilihan Sekolah, Kelas, & Nama Murid'
                          : 'Pilihan Sekolah, Kelas, & Nama Ananda'}
                      </label>
                    </div>

                    <div className="flex items-center bg-white/90 p-0.5 rounded-xl border border-slate-200 shadow-2xs text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setLoginInputMode('DROPDOWN')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          loginInputMode === 'DROPDOWN'
                            ? selectedRoleScope === 'PARENT'
                              ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                              : 'bg-[#0753A5] text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>Pilih Dropdown</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginInputMode('MANUAL')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          loginInputMode === 'MANUAL'
                            ? selectedRoleScope === 'PARENT'
                              ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                              : 'bg-[#0753A5] text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>Ketik Manual</span>
                      </button>
                    </div>
                  </div>

                  {loginInputMode === 'DROPDOWN' ? (
                    <div className="space-y-3">
                      {/* 1. Dropdown Pilihan Sekolah / Satuan Pendidikan */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                            <School className={`w-3.5 h-3.5 ${selectedRoleScope === 'PARENT' ? 'text-emerald-600' : 'text-[#0753A5]'}`} />
                            <span>Pilih Satuan Pendidikan / Sekolah:</span>
                          </label>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              availableSchoolsForLogin.length === 0
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-[#0753A5] border-blue-200'
                            }`}
                          >
                            {availableSchoolsForLogin.length} Satuan Pendidikan
                          </span>
                        </div>
                        <div className="relative">
                          <select
                            id="login-select-school"
                            value={effectiveSelectedSchool}
                            onChange={(e) => handleSchoolChange(e.target.value)}
                            disabled={availableSchoolsForLogin.length === 0}
                            className={`w-full pl-3 pr-8 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-2xs outline-none ${
                              availableSchoolsForLogin.length === 0
                                ? 'border-amber-200 bg-amber-50/50 text-amber-900 cursor-not-allowed'
                                : 'border-slate-200 bg-white text-slate-800 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 cursor-pointer'
                            }`}
                          >
                            {availableSchoolsForLogin.length === 0 ? (
                              <option value="0">0 Satuan Pendidikan (Belum diupdate Super Admin)</option>
                            ) : (
                              <>
                                <option value="ALL">
                                  Semua Satuan Pendidikan ({availableSchoolsForLogin.length} Sekolah, {allAvailableStudents.length} Siswa)
                                </option>
                                {availableSchoolsForLogin.map((sch) => {
                                  const count = allAvailableStudents.filter((s) => s.schoolName === sch).length;
                                  return (
                                    <option key={sch} value={sch}>
                                      {sch} ({count} Siswa)
                                    </option>
                                  );
                                })}
                              </>
                            )}
                          </select>
                        </div>
                        {availableSchoolsForLogin.length === 0 && (
                          <p className="text-[10px] text-amber-700 flex items-center gap-1 mt-1 font-medium">
                            <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Data satuan pendidikan di-default ke 0 (belum diupdate oleh Super Admin).</span>
                          </p>
                        )}
                      </div>

                      {/* 2. Dropdown Pilihan Kelas */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                            <Building2 className={`w-3.5 h-3.5 ${selectedRoleScope === 'PARENT' ? 'text-emerald-600' : 'text-[#0753A5]'}`} />
                            <span>Pilih Kelas / Rombel:</span>
                          </label>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              availableClassesForLogin.length === 0
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-[#0753A5] border-blue-200'
                            }`}
                          >
                            {availableClassesForLogin.length} Kelas
                          </span>
                        </div>
                        <div className="relative">
                          <select
                            id="login-select-class"
                            value={effectiveSelectedClass}
                            onChange={(e) => handleClassChange(e.target.value)}
                            disabled={availableClassesForLogin.length === 0}
                            className={`w-full pl-3 pr-8 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-2xs outline-none ${
                              availableClassesForLogin.length === 0
                                ? 'border-amber-200 bg-amber-50/50 text-amber-900 cursor-not-allowed'
                                : 'border-slate-200 bg-white text-slate-800 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 cursor-pointer'
                            }`}
                          >
                            {availableClassesForLogin.length === 0 ? (
                              <option value="0">0 Kelas (Belum diupdate Admin Sekolah)</option>
                            ) : (
                              <>
                                <option value="ALL">
                                  {effectiveSelectedSchool === 'ALL'
                                    ? `Semua Kelas (${availableClassesForLogin.length} Kelas, ${studentsInSelectedSchool.length} Siswa)`
                                    : `Semua Kelas di ${effectiveSelectedSchool} (${availableClassesForLogin.length} Kelas, ${studentsInSelectedSchool.length} Siswa)`}
                                </option>
                                {availableClassesForLogin.map((cls) => {
                                  const count = studentsInSelectedSchool.filter((s) => s.className === cls).length;
                                  return (
                                    <option key={cls} value={cls}>
                                      {cls} ({count} Siswa)
                                    </option>
                                  );
                                })}
                              </>
                            )}
                          </select>
                        </div>
                        {availableClassesForLogin.length === 0 && (
                          <p className="text-[10px] text-amber-700 flex items-center gap-1 mt-1 font-medium">
                            <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Data kelas di-default ke 0 (belum diupdate oleh Admin Sekolah).</span>
                          </p>
                        )}
                      </div>

                      {/* 3. Dropdown Pilihan Nama Murid */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                            <User className={`w-3.5 h-3.5 ${selectedRoleScope === 'PARENT' ? 'text-emerald-600' : 'text-[#0753A5]'}`} />
                            <span>
                              {selectedRoleScope === 'STUDENT'
                                ? 'Pilih Nama Murid:'
                                : 'Pilih Nama Murid (Putra / Putri Ananda):'}
                            </span>
                          </label>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              filteredStudentsForDropdown.length === 0
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {filteredStudentsForDropdown.length} Siswa
                          </span>
                        </div>
                        <div className="relative">
                          <select
                            id="login-select-student"
                            value={selectedStudentNisn}
                            onChange={(e) => handleSelectStudentFromDropdown(e.target.value)}
                            disabled={filteredStudentsForDropdown.length === 0}
                            className={`w-full pl-3 pr-8 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-2xs outline-none ${
                              filteredStudentsForDropdown.length === 0
                                ? 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                                : 'border-slate-200 bg-white text-slate-800 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 cursor-pointer'
                            }`}
                          >
                            <option value="">
                              {filteredStudentsForDropdown.length === 0
                                ? '-- Belum ada data siswa (0 Murid) --'
                                : `-- ${selectedRoleScope === 'STUDENT' ? 'Klik untuk memilih nama Anda' : 'Klik untuk memilih nama ananda'} (${filteredStudentsForDropdown.length} Tersedia) --`}
                            </option>
                            {filteredStudentsForDropdown.map((s) => (
                              <option key={s.id || s.nisn} value={s.nisn}>
                                {s.name} — {s.className}{effectiveSelectedSchool === 'ALL' && s.schoolName ? ` (${s.schoolName})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        {filteredStudentsForDropdown.length === 0 && (
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
                            <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Data siswa masih 0. Admin Sekolah dapat menambahkan siswa melalui Master Siswa.</span>
                          </p>
                        )}
                      </div>

                      {/* 4. Kartu Konfirmasi Siswa Terpilih */}
                      {selectedStudentDetail ? (
                        <div
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                            selectedRoleScope === 'PARENT'
                              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                              : 'bg-blue-50/90 border-blue-200 text-blue-950'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-2xl shrink-0">
                              {selectedRoleScope === 'PARENT' ? '👨‍👩‍👧' : selectedStudentDetail.gender === 'L' ? '👦🏻' : '👧🏻'}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                                  {selectedStudentDetail.name}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    selectedRoleScope === 'PARENT'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-blue-100 text-[#0753A5] border border-blue-200'
                                  }`}
                                >
                                  {selectedStudentDetail.className}
                                </span>
                                {selectedStudentDetail.schoolName && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 truncate max-w-[180px]">
                                    {selectedStudentDetail.schoolName}
                                  </span>
                                )}
                              </div>
                              {selectedRoleScope === 'STUDENT' ? (
                                <p className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1.5">
                                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                                  <span className="font-medium text-slate-600">Murid Terdaftar Aktif</span>
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-600 mt-0.5">
                                  {selectedStudentDetail.parentName && selectedStudentDetail.parentName !== '-' ? (
                                    <span>Wali Murid: <strong className="text-slate-800">{selectedStudentDetail.parentName}</strong></span>
                                  ) : (
                                    <span className="font-medium text-slate-600">Murid Terdaftar Aktif</span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectStudentFromDropdown('')}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline shrink-0 cursor-pointer"
                            title="Ganti pilihan murid"
                          >
                            Ganti
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          💡 Pilih sekolah, kelas, dan nama murid pada dropdown di atas untuk mengisi identitas login otomatis.
                        </p>
                      )}

                      {/* Hidden input for HTML form compliance */}
                      <input
                        type="hidden"
                        id="login-username"
                        name="username"
                        value={inputIdentifier}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-600">
                        {selectedRoleScope === 'STUDENT'
                          ? 'Ketik NISN atau Username Murid:'
                          : 'Ketik NISN Ananda atau Username Orang Tua:'}
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="login-username"
                          name="username"
                          autoComplete="username"
                          type="text"
                          value={inputIdentifier}
                          onChange={(e) => {
                            setInputIdentifier(e.target.value);
                            setSelectedStudentNisn(e.target.value);
                          }}
                          placeholder={currentRoleInfo.placeholder || 'Masukkan NISN atau username'}
                          className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 bg-white"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setLoginInputMode('DROPDOWN')}
                        className="text-xs text-[#0753A5] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1 mt-1"
                      >
                        <span>← Kembali ke pilihan dropdown nama & kelas murid</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* NISN / Username Field untuk peran Guru, Kepala Sekolah, Pengawas, Admin */
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    {selectedRoleScope === 'TEACHER' || selectedRoleScope === 'PRINCIPAL' || selectedRoleScope === 'SUPERVISOR'
                      ? 'NIP / Username Pendidik'
                      : 'ID Pengguna / Username'}
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-username"
                      name="username"
                      autoComplete="username"
                      type="text"
                      value={inputIdentifier}
                      onChange={(e) => setInputIdentifier(e.target.value)}
                      placeholder={currentRoleInfo.placeholder || 'Masukkan NIP atau username'}
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-2xl border border-slate-200 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base text-slate-900 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Helper guidance note specifically for Parents */}
              {selectedRoleScope === 'PARENT' && (
                <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 text-xs sm:text-sm text-emerald-950 flex items-start gap-2.5">
                  <span className="text-lg shrink-0">👨‍👩‍👧</span>
                  <div className="space-y-0.5 leading-snug">
                    <span className="font-bold text-emerald-900 block">Akses Mandiri Orang Tua / Wali:</span>
                    <span className="text-emerald-800">
                      Bapak/Ibu dapat memilih nama ananda dan kelas melalui dropdown di atas untuk langsung memantau dan mendampingi pembiasaan baik di rumah.
                    </span>
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordModalOpen(true)}
                    className="text-xs text-[#0753A5] hover:underline font-semibold cursor-pointer"
                  >
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    name="password"
                    autoComplete="current-password"
                    type={showPassword ? 'text' : 'password'}
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-11 pr-11 py-2.5 sm:py-3 rounded-2xl border border-slate-200 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base text-slate-900 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0753A5] focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Ingat saya</span>
                </label>
                <span className="text-xs text-slate-400">
                  SIM Satuan Pendidikan
                </span>
              </div>

              {/* Primary Login Button: "➔ Masuk" */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 rounded-2xl text-white font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 mt-2 ${
                  selectedRoleScope === 'PARENT'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/10'
                    : 'bg-[#0753A5] hover:bg-blue-700 shadow-blue-900/10'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>{selectedRoleScope === 'PARENT' ? 'Masuk Portal Orang Tua' : 'Masuk ke Aplikasi'}</span>
                  </>
                )}
              </button>

              {/* Secondary Button: "⁝⁝⁝ Masuk dengan PIN" */}
              <button
                type="button"
                onClick={() => setIsPinModalOpen(true)}
                className="w-full py-2.5 sm:py-3 px-4 rounded-2xl bg-[#EFF6FF] hover:bg-blue-100/80 text-[#0753A5] border border-blue-200/90 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#0753A5]" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="5" r="2" />
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="19" cy="5" r="2" />
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                  <circle cx="5" cy="19" r="2" />
                  <circle cx="12" cy="19" r="2" />
                  <circle cx="19" cy="19" r="2" />
                </svg>
                <span>Masuk dengan PIN</span>
              </button>
            </form>

            {/* Role Context Indicator & Quick Help */}
            <div className="space-y-3 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400">
                  {currentRoleInfo.badge}
                </span>
              </div>

              {/* Help Line */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#0753A5] font-semibold cursor-pointer transition-all bg-slate-50 hover:bg-blue-50/80 px-3.5 py-1.5 rounded-full border border-slate-200/80 hover:border-blue-200 shadow-2xs group"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0753A5] group-hover:scale-110 transition-transform" />
                  <span>Butuh bantuan? <strong className="text-[#0753A5] underline">Hubungi wali kelas</strong></span>
                  <span className="text-[10px] bg-blue-100/90 text-[#0753A5] px-2 py-0.5 rounded-full font-black border border-blue-200">
                    {allHomeroomTeachers.length} Guru
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* Smartphone Bottom Home Indicator inside Card */}
          <div className="bg-white/95 pb-3 pt-1 text-center select-none">
            <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto mb-1.5" />
            <p className="text-[10px] text-slate-400 font-medium">
              Kementerian Pendidikan Dasar & Menengah RI • Inovasi Pengawas SMP Tanah Laut
            </p>
          </div>

          </div>
        </div>
      </main>

      {/* ==================================================================== */}
      {/* 3. FOOTER COPYRIGHT LINE */}
      {/* ==================================================================== */}
      <footer className="w-full text-center text-slate-400 text-[11px] font-medium py-2.5 px-4 relative z-10">
        <div className="max-w-md mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>SI-7KAIH AI</span>
          <span className="text-slate-600">•</span>
          <span>7 Kebiasaan Anak Indonesia Hebat</span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-slate-300">Kreasi Ahmad Muzani</span>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* MODAL: MASUK DENGAN PIN */}
      {/* ==================================================================== */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0753A5] flex items-center justify-center font-bold">
                  <svg className="w-5 h-5 text-[#0753A5]" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="5" r="2" />
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="19" cy="5" r="2" />
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                    <circle cx="5" cy="19" r="2" />
                    <circle cx="12" cy="19" r="2" />
                    <circle cx="19" cy="19" r="2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Masuk Cepat dengan PIN</h3>
                  <p className="text-[11px] text-slate-500">Gunakan 4 digit PIN atau pilih akun pengguna aktif terdaftar</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPinModalOpen(false);
                  setPinInput('');
                  setPinError('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{pinError}</span>
              </div>
            )}

            {/* PIN Display */}
            <div className="flex justify-center items-center gap-3 py-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-black ${
                    pinInput.length > i
                      ? 'border-[#0753A5] bg-blue-50 text-[#0753A5]'
                      : 'border-slate-200 bg-slate-50 text-slate-300'
                  }`}
                >
                  {pinInput.length > i ? '•' : ''}
                </div>
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') setPinInput('');
                    else if (k === '⌫') setPinInput((prev) => prev.slice(0, -1));
                    else if (pinInput.length < 4) {
                      const newPin = pinInput + k;
                      setPinInput(newPin);
                      if (newPin.length === 4) {
                        setTimeout(() => handlePinSubmit(), 150);
                      }
                    }
                  }}
                  className="py-3 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-[#0753A5] font-extrabold text-sm border border-slate-200/80 transition-colors shadow-2xs cursor-pointer active:scale-95"
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Petunjuk Autentikasi Cepat PIN */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-500">
                Gunakan 4 digit PIN akun Anda atau PIN master untuk otentikasi cepat.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: HUBUNGI WALI KELAS (TERSIKRONISASI SELURUH WALI KELAS) */}
      {/* ==================================================================== */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] space-y-4 animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0753A5]/10 text-[#0753A5] flex items-center justify-center font-bold shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Direktori Kontak & Bantuan Seluruh Wali Kelas
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Tersinkronisasi ({allHomeroomTeachers.length} Wali Kelas Aktif)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data otomatis tersinkronisasi dengan pembaruan rombel dan akun pendidik dari Admin Sekolah & Super Admin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTeacherQuery}
                  onChange={(e) => setSearchTeacherQuery(e.target.value)}
                  placeholder="Cari nama wali kelas, kelas (misal: 7-A, 8-B), NIP, atau nama sekolah..."
                  className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0753A5] focus:bg-white transition-all"
                />
                {searchTeacherQuery && (
                  <button
                    onClick={() => setSearchTeacherQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Grade Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-[11px] font-bold text-slate-400 mr-1 flex-shrink-0">Tingkat:</span>
                {[
                  { id: 'ALL', label: `Semua (${allHomeroomTeachers.length})` },
                  { id: '7', label: `Kelas 7 (${allHomeroomTeachers.filter((t) => t.grade === 7).length})` },
                  { id: '8', label: `Kelas 8 (${allHomeroomTeachers.filter((t) => t.grade === 8).length})` },
                  { id: '9', label: `Kelas 9 (${allHomeroomTeachers.filter((t) => t.grade === 9).length})` },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedGradeFilter(pill.id as any)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                      selectedGradeFilter === pill.id
                        ? 'bg-[#0753A5] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Homeroom Teachers Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[46vh]">
              {filteredHomeroomTeachers.length > 0 ? (
                filteredHomeroomTeachers.map((t) => {
                  const isCopied = copiedContactId === t.id;
                  const waMessage = encodeURIComponent(
                    `Halo ${t.teacherName}, saya ingin berkonsultasi mengenai akun jurnal SI-7KAIH AI untuk ${t.className} (${t.schoolName}).`
                  );
                  const waUrl = `https://wa.me/${t.cleanPhone}?text=${waMessage}`;

                  return (
                    <div
                      key={t.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left Profile Info */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-xl flex-shrink-0">
                          {t.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {t.teacherName}
                            </h4>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#0753A5]/10 text-[#0753A5] border border-blue-200/60">
                              {t.className}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-600">
                              {t.phase}
                            </span>
                            {t.studentCount > 0 && (
                              <span className="text-[10px] font-bold text-slate-500">
                                • {t.studentCount} Siswa
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                            <span>🏫 {t.schoolName}</span>
                            <span>•</span>
                            <span>NIP: <span className="font-mono text-slate-700">{t.teacherNip}</span></span>
                          </div>

                          <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="font-mono truncate">{t.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center sm:flex-col sm:items-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        {/* WhatsApp Direct Action */}
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          title="Hubungi via WhatsApp resmi"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat WhatsApp</span>
                        </a>

                        {/* Copy Phone Number */}
                        <button
                          type="button"
                          onClick={() => handleCopyContact(t.id, t.phone)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title="Salin nomor telepon"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span className="font-mono">{t.phone}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-3xl">🔍</span>
                  <p className="text-xs font-bold text-slate-700">
                    Tidak ditemukan data wali kelas
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Coba ubah kata kunci pencarian atau ganti filter kelas di atas.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTeacherQuery('');
                      setSelectedGradeFilter('ALL');
                    }}
                    className="mt-2 text-xs font-bold text-[#0753A5] hover:underline"
                  >
                    Tampilkan Semua Wali Kelas
                  </button>
                </div>
              )}
            </div>

            {/* Advisory / Policy Note */}
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800 text-xs">
                <span>🕒 Jam Layanan Konsultasi: Senin - Jumat (07.00 - 15.30 WIB)</span>
                <span className="text-[#0753A5]">SMP Mandiri</span>
              </div>
              <p className="leading-relaxed text-slate-500">
                Sesuai prinsip perlindungan data siswa (UU PDP No. 27/2022), lupa password dan verifikasi akun murid ditangani langsung oleh wali kelas atau admin sekolah bersangkutan.
              </p>
            </div>

            {/* Modal Footer Close Button */}
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              Tutup Direktori
            </button>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: LUPA PASSWORD */}
      {/* ==================================================================== */}
      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  🔐
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Pemulihan Password</h3>
                  <p className="text-[11px] text-slate-500">Reset password terintegrasi SIM Sekolah</p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Demi perlindungan data pribadi siswa (UU PDP No. 27/2022), reset kata sandi mandiri dilakukan melalui verifikasi oleh Wali Kelas atau Administrator SIM Satuan Pendidikan.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800">Langkah Pemulihan:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                <li>Hubungi Wali Kelas Anda melalui WhatsApp/Ruang Konseling.</li>
                <li>Admin Sekolah akan menerbitkan PIN reset sementara (berlaku 24 jam).</li>
                <li>Gunakan opsi <strong>"Masuk dengan PIN"</strong> untuk login cepat.</li>
              </ol>
            </div>

            <button
              onClick={() => {
                setIsForgotPasswordModalOpen(false);
                setIsHelpModalOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-[#0753A5] text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
            >
              Hubungi Wali Kelas Sekarang
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: TENTANG / MANFAAT / KONTAK */}
      {/* ==================================================================== */}
      {navModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>{navModal === 'TENTANG' ? '📘 Tentang SI-7KAIH AI' : navModal === 'MANFAAT' ? '🌟 Manfaat Program 7 Kebiasaan' : '📬 Kontak & Informasi'}</span>
              </h3>
              <button
                onClick={() => setNavModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {navModal === 'TENTANG' && (
              <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                <p>
                  <strong>SI-7KAIH AI</strong> adalah Sistem Jurnal dan Monitoring 7 Kebiasaan Anak Indonesia Hebat yang diinisiasi oleh <strong>Kementerian Pendidikan Dasar dan Menengah Republik Indonesia</strong>.
                </p>
                <p>
                  Aplikasi ini merupakan <strong>kreasi oleh Ahmad Muzani — Pengawas SMP Disdikbud Kabupaten Tanah Laut</strong> sebagai wujud inovasi pendampingan karakter peserta didik berbasis data digital.
                </p>
                <p>
                  Program ini berlandaskan pendekatan pembiasaan positif (non-punitive, anti-shaming) untuk memperkuat profil lulusan melalui tujuh dimensi kebiasaan harian: Bangun Pagi, Beribadah, Berolahraga, Makan Sehat, Gemar Belajar, Bermasyarakat, dan Tidur Tepat Waktu.
                </p>
              </div>
            )}

            {navModal === 'MANFAAT' && (
              <div className="text-xs text-slate-600 space-y-2">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-900">
                  <strong>1. Bagi Siswa:</strong> Membangun kedisiplinan dan kesadaran diri secara menyenangkan tanpa takut dibandingkan.
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                  <strong>2. Bagi Orang Tua:</strong> Mengetahui perkembangan pembiasaan anak di rumah dan sekolah secara transparan.
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-900">
                  <strong>3. Bagi Sekolah & Guru:</strong> Menyusun Rencana Tindak Lanjut (RTL) berbasis data faktual bukan asumsi.
                </div>
              </div>
            )}

            {navModal === 'KONTAK' && (
              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <div>🏢 <strong>Pusat Layanan SI-7KAIH Kemendikdasmen RI</strong></div>
                <div>📍 Kompleks Kemendikdasmen, Gedung E Lantai 5, Senayan, Jakarta Pusat</div>
                <div>✨ <strong>Inovator Program:</strong> Ahmad Muzani (Pengawas SMP Disdikbud Kabupaten Tanah Laut)</div>
                <div>✉️ Email: <strong>bantuan@kemendikdasmen.go.id</strong></div>
                <div>📞 Helpdesk: <strong>(021) 572-5610</strong> (Hari Kerja 08.00 - 16.00 WIB)</div>
              </div>
            )}

            <button
              onClick={() => setNavModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#0753A5] text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
