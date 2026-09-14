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
} from 'lucide-react';
import { UserPersona, getStoredUsers, USER_PERSONAS } from '../lib/constants';
import { Student, Rombel, getStoredStudents, getStoredRombels } from '../lib/studentData';
import { SchoolMaster, getStoredSchools } from '../lib/schoolMasterData';
import { DailyJournal } from '../../packages/types/src/index';
import { fetchUsersFromSupabase, fetchJournalsFromSupabase } from '../lib/supabaseService';

// Sampel data murid referensi SMP jika belum ada murid yang diimpor oleh Admin
const FALLBACK_SAMPLE_STUDENTS: Student[] = [
  {
    id: 'std-sample-01',
    nisn: '0081234561',
    name: 'Ahmad Fadhil Ramadhan',
    gender: 'L',
    className: 'Kelas 7A',
    parentName: 'Hendra Gunawan',
    parentPhone: '0812-3456-7801',
    status: 'AKTIF',
    source: 'INPUT_MANUAL',
    createdAt: '2026-07-01',
    username: 'ahmad.fadhil',
  },
  {
    id: 'std-sample-02',
    nisn: '0081234562',
    name: 'Alya Putri Lestari',
    gender: 'P',
    className: 'Kelas 7A',
    parentName: 'Bambang Sudibyo',
    parentPhone: '0812-3456-7802',
    status: 'AKTIF',
    source: 'INPUT_MANUAL',
    createdAt: '2026-07-01',
    username: 'alya.putri',
  },
  {
    id: 'std-sample-03',
    nisn: '0081234563',
    name: 'Bintang Pratama Putra',
    gender: 'L',
    className: 'Kelas 7B',
    parentName: 'Joko Susilo',
    parentPhone: '0812-3456-7803',
    status: 'AKTIF',
    source: 'INPUT_MANUAL',
    createdAt: '2026-07-01',
    username: 'bintang.pratama',
  },
  {
    id: 'std-sample-04',
    nisn: '0081234564',
    name: 'Cantika Dewi Rahmawati',
    gender: 'P',
    className: 'Kelas 7B',
    parentName: 'Surya Kencana',
    parentPhone: '0812-3456-7804',
    status: 'AKTIF',
    source: 'INPUT_MANUAL',
    createdAt: '2026-07-01',
    username: 'cantika.dewi',
  },
  {
    id: 'std-sample-05',
    nisn: '0081234565',
    name: 'Dimas Bagus Anggoro',
    gender: 'L',
    className: 'Kelas 8A',
    parentName: 'Agus Setiawan',
    parentPhone: '0812-3456-7805',
    status: 'AKTIF',
    source: 'INPUT_MANUAL',
    createdAt: '2026-07-01',
    username: 'dimas.bagus',
  },
  {
    id: 'std-sample-06',
    nisn: '0081234566',
    name: 'Elisa Zahra Khairunnisa',
    gender: 'P',
    className: 'Kelas 8B',
    parentName: 'Irwan Syahputra',
    parentPhone: '0812-3456-7806',
    status: 'AKTIF',
    source: 'INPUT_MANUAL',
    createdAt: '2026-07-01',
    username: 'elisa.zahra',
  },
  {
    id: 'std-sample-07',
    nisn: '0081234567',
    name: 'Farhan Maulana Akbar',
    gender: 'L',
    className: 'Kelas 9A',
    parentName: 'Lukman Hakim',
    parentPhone: '0812-3456-7807',
    status: 'AKTIF',
    source: 'INPUT_MANUAL',
    createdAt: '2026-07-01',
    username: 'farhan.maulana',
  },
  {
    id: 'std-sample-08',
    nisn: '0081234568',
    name: 'Gita Maharani Sukma',
    gender: 'P',
    className: 'Kelas 9B',
    parentName: 'Dedi Kurniawan',
    parentPhone: '0812-3456-7808',
    status: 'AKTIF',
    source: 'INPUT_MANUAL',
    createdAt: '2026-07-01',
    username: 'gita.maharani',
  },
];

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
  const [selectedSchoolForLogin, setSelectedSchoolForLogin] = useState<string>(() => {
    try {
      return localStorage.getItem('si7kaih_remembered_school') || 'ALL';
    } catch (_e) {
      return 'ALL';
    }
  });
  const [selectedClassForLogin, setSelectedClassForLogin] = useState<string>('ALL');
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
      return saved ? JSON.parse(saved) : [];
    } catch (_e) {
      return [];
    }
  });

  // State for Homeroom Teacher directory search & filters
  const [searchTeacherQuery, setSearchTeacherQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'ALL' | '7' | '8' | '9'>('ALL');
  const [copiedContactId, setCopiedContactId] = useState<string | null>(null);

  // Dynamic real-time listener for data updates across the application
  const syncLiveData = () => {
    try {
      setStudents(getStoredStudents());
      setRombels(getStoredRombels());
      setSchools(getStoredSchools());
      setUsers(getStoredUsers());
      const savedJournals = localStorage.getItem('si7kaih_journals_prod');
      setJournals(savedJournals ? JSON.parse(savedJournals) : []);

      // Pull latest authoritative users & journals from Supabase backend on access
      fetchUsersFromSupabase()
        .then((remoteUsers) => {
          if (remoteUsers && remoteUsers.length > 0) {
            setUsers(remoteUsers);
            localStorage.setItem('si7kaih_users_pool_prod', JSON.stringify(remoteUsers));
          }
        })
        .catch(() => {});

      fetchJournalsFromSupabase()
        .then((remoteJournals) => {
          if (remoteJournals && remoteJournals.length > 0) {
            setJournals(remoteJournals);
            localStorage.setItem('si7kaih_journals_prod', JSON.stringify(remoteJournals));
          }
        })
        .catch(() => {});
    } catch (_e) {}
  };

  useEffect(() => {
    syncLiveData();

    try {
      const notice = sessionStorage.getItem('si7kaih_auto_logout_notice');
      if (notice) {
        setInactivityNotice(notice);
        sessionStorage.removeItem('si7kaih_auto_logout_notice');
      }
    } catch (_e) {}

    window.addEventListener('storage', syncLiveData);
    window.addEventListener('si7kaih_students_updated', syncLiveData);
    window.addEventListener('si7kaih_journals_updated', syncLiveData);
    window.addEventListener('si7kaih_rombels_updated', syncLiveData);
    window.addEventListener('si7kaih_schools_updated', syncLiveData);
    window.addEventListener('si7kaih_users_updated', syncLiveData);
    window.addEventListener('focus', syncLiveData);

    return () => {
      window.removeEventListener('storage', syncLiveData);
      window.removeEventListener('si7kaih_students_updated', syncLiveData);
      window.removeEventListener('si7kaih_journals_updated', syncLiveData);
      window.removeEventListener('si7kaih_rombels_updated', syncLiveData);
      window.removeEventListener('si7kaih_schools_updated', syncLiveData);
      window.removeEventListener('si7kaih_users_updated', syncLiveData);
      window.removeEventListener('focus', syncLiveData);
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

  // Daftar lengkap murid untuk pilihan dropdown (menggabungkan master murid, akun pengguna murid, dan data referensi)
  const allAvailableStudents = useMemo<Student[]>(() => {
    const map = new Map<string, Student>();
    const defaultSchool = schools[0]?.name || '';

    // 1. Data murid tersimpan di master data
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
        const rawSchool = (s.schoolName || matchingUser?.schoolName || defaultSchool).trim();
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
          const rawSchool = (u.schoolName || defaultSchool).trim();
          map.set(key, {
            id: u.id,
            nisn: u.identifierValue || u.username,
            name: u.name,
            gender: u.avatar === '👧🏻' ? 'P' : 'L',
            className: u.className || 'Kelas 7A',
            parentName: (u as any).parentName || '-',
            status: 'AKTIF',
            source: 'INPUT_MANUAL',
            createdAt: u.createdDate || '2026-07-01',
            username: u.username,
            schoolName: rawSchool,
          });
        }
      });

    // 3. Jika belum ada data murid terisi di browser, muat sampel referensi SMP
    if (map.size === 0) {
      FALLBACK_SAMPLE_STUDENTS.forEach((s) => {
        const rawSchool = (s.schoolName || defaultSchool).trim();
        map.set(s.nisn.toLowerCase(), {
          ...s,
          schoolName: rawSchool,
        });
      });
    }

    const list = Array.from(map.values());
    return list.sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }, [students, users, schools]);

  // Daftar sekolah / satuan pendidikan unik yang tersedia untuk filter dropdown
  const availableSchoolsForLogin = useMemo<string[]>(() => {
    const set = new Set<string>();

    // 1. Dari master data satuan pendidikan
    schools.forEach((sch) => {
      if (sch.name && sch.name.trim()) set.add(sch.name.trim());
    });

    // 2. Dari data murid
    allAvailableStudents.forEach((s) => {
      if (s.schoolName && s.schoolName.trim()) set.add(s.schoolName.trim());
    });

    // 3. Dari akun pengguna terdaftar (selain superadmin nasional)
    users.forEach((u) => {
      if (
        u.schoolName &&
        u.schoolName.trim() &&
        !u.schoolName.toLowerCase().includes('kementerian')
      ) {
        set.add(u.schoolName.trim());
      }
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'));
  }, [schools, allAvailableStudents, users]);

  // Murid yang berada di bawah satuan pendidikan / sekolah yang sedang dipilih
  const studentsInSelectedSchool = useMemo<Student[]>(() => {
    if (selectedSchoolForLogin === 'ALL') {
      return allAvailableStudents;
    }
    return allAvailableStudents.filter((s) => s.schoolName === selectedSchoolForLogin);
  }, [allAvailableStudents, selectedSchoolForLogin]);

  // Daftar kelas / rombel unik yang tersedia untuk filter dropdown (tersinkron dengan sekolah terpilih)
  const availableClassesForLogin = useMemo<string[]>(() => {
    const set = new Set<string>();

    // Tambahkan kelas dari murid di sekolah terpilih
    studentsInSelectedSchool.forEach((s) => {
      if (s.className && s.className.trim()) set.add(s.className.trim());
    });

    // Tambahkan dari rombel master jika relevan dengan sekolah terpilih
    rombels.forEach((r) => {
      if (!r.name || !r.name.trim()) return;
      if (selectedSchoolForLogin === 'ALL') {
        set.add(r.name.trim());
      } else {
        const teacher = users.find(
          (u) =>
            u.role === 'TEACHER' &&
            (u.className === r.name || (r.teacher && u.name.toLowerCase().includes(r.teacher.toLowerCase())))
        );
        if (
          teacher?.schoolName === selectedSchoolForLogin ||
          studentsInSelectedSchool.some((s) => s.className === r.name)
        ) {
          set.add(r.name.trim());
        }
      }
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id', { numeric: true }));
  }, [rombels, studentsInSelectedSchool, selectedSchoolForLogin, users]);

  // Filter murid berdasarkan sekolah dan kelas yang dipilih pada dropdown
  const filteredStudentsForDropdown = useMemo<Student[]>(() => {
    return allAvailableStudents.filter((s) => {
      // 1. Filter sekolah jika dipilih spesifik
      if (selectedSchoolForLogin !== 'ALL' && s.schoolName !== selectedSchoolForLogin) {
        return false;
      }
      // 2. Filter kelas jika dipilih spesifik
      if (selectedClassForLogin !== 'ALL' && s.className !== selectedClassForLogin) {
        return false;
      }
      return true;
    });
  }, [allAvailableStudents, selectedSchoolForLogin, selectedClassForLogin]);

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
      if (newSchool === 'ALL') {
        localStorage.removeItem('si7kaih_remembered_school');
      } else {
        localStorage.setItem('si7kaih_remembered_school', newSchool);
      }
    } catch (_e) {}

    // Periksa apakah kelas saat ini masih valid di sekolah baru
    if (newSchool !== 'ALL') {
      const validClasses = new Set<string>();
      allAvailableStudents
        .filter((s) => s.schoolName === newSchool)
        .forEach((s) => {
          if (s.className) validClasses.add(s.className.trim());
        });

      if (selectedClassForLogin !== 'ALL' && !validClasses.has(selectedClassForLogin)) {
        setSelectedClassForLogin('ALL');
      }

      // Periksa apakah murid yang saat ini terpilih ada di sekolah baru
      if (selectedStudentNisn) {
        const found = allAvailableStudents.find((s) => s.nisn === selectedStudentNisn);
        if (found && found.schoolName && found.schoolName !== newSchool) {
          setSelectedStudentNisn('');
          setInputIdentifier('');
        }
      }
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
      // Sinkronkan sekolah jika saat ini masih 'ALL' dan siswa memiliki data sekolah
      if (found.schoolName && selectedSchoolForLogin === 'ALL') {
        setSelectedSchoolForLogin(found.schoolName);
        try {
          localStorage.setItem('si7kaih_remembered_school', found.schoolName);
        } catch (_e) {}
      }
      // Sinkronkan kelas jika saat ini masih 'ALL' dan siswa memiliki data kelas
      if (found.className && selectedClassForLogin === 'ALL') {
        setSelectedClassForLogin(found.className);
      }
      // Pengaturan login murid via dropdown: tidak menampilkan otomatis password
      setInputPassword('');
      setErrorMessage('');
    }
  };

  const handleClassChange = (newClass: string) => {
    setSelectedClassForLogin(newClass);
    if (newClass !== 'ALL' && selectedStudentNisn) {
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
            (selectedSchoolForLogin !== 'ALL' ? selectedSchoolForLogin : schools[0]?.name || 'Satuan Pendidikan');

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
            (selectedSchoolForLogin !== 'ALL' ? selectedSchoolForLogin : schools[0]?.name || 'Satuan Pendidikan');

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
    <div className="min-h-screen bg-gradient-to-b from-[#D4E8F8] via-[#EAF4FC] to-[#F1F6FA] text-slate-800 flex flex-col justify-between relative overflow-x-hidden select-none">
      
      {/* Background Subtle Campus Sketches / Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="campus-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#93C5FD" strokeWidth="0.5" strokeDasharray="3 3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#campus-grid)" />
        </svg>
      </div>

      {/* ==================================================================== */}
      {/* 1. TOP FLOATING NAVBAR (Pill Style as in Reference Image) */}
      {/* ==================================================================== */}
      <header className="w-full max-w-7xl mx-auto px-4 pt-4 sm:pt-6 relative z-30">
        <nav className="bg-white/95 backdrop-blur-md rounded-full border border-slate-200/90 shadow-md shadow-blue-900/5 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            {/* SI-7KAIH Sprout Logo Icon */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0753A5] to-[#20A5D5] flex items-center justify-center text-white shadow-xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21V12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M12 12C9 7 5 7 3 9C2 13 6 15 12 12Z" fill="#41A85F" />
                  <path d="M12 12C15 6 20 7 21 10C22 14 17 16 12 12Z" fill="#20A5D5" />
                </svg>
              </div>
              <span className="text-base sm:text-lg font-black tracking-tight text-[#0753A5]">
                SI-7KAIH AI
              </span>
            </div>

            {/* Tagline Divider & Text */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium pl-2 border-l border-slate-200">
              <span>Murid Sehat</span>
              <span>•</span>
              <span>Karakter Kuat</span>
              <span>•</span>
              <span>Masa Depan Hebat</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
            <button
              onClick={() => setNavModal(null)}
              className="flex items-center gap-1.5 text-[#0753A5] font-extrabold relative py-1 cursor-pointer transition-colors"
            >
              <span>🏠 Beranda</span>
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0753A5] rounded-full" />
            </button>
            <button
              onClick={() => setNavModal('TENTANG')}
              className="flex items-center gap-1.5 hover:text-[#0753A5] py-1 cursor-pointer transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Tentang</span>
            </button>
            <button
              onClick={() => setNavModal('MANFAAT')}
              className="flex items-center gap-1.5 hover:text-[#0753A5] py-1 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Manfaat</span>
            </button>
            <button
              onClick={() => setNavModal('KONTAK')}
              className="flex items-center gap-1.5 hover:text-[#0753A5] py-1 cursor-pointer transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Kontak</span>
            </button>
          </div>

          {/* Role Dropdown Pill with pointer click hint: "🎓 Untuk Murid SMP ⌵" */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 bg-[#EFF6FF] hover:bg-blue-100/90 text-[#0753A5] font-extrabold text-xs px-3.5 py-1.5 sm:py-2 rounded-full border border-blue-200/80 shadow-2xs transition-all cursor-pointer group"
              title="Klik di sini untuk memilih portal pengguna"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-200/70 text-blue-800 text-[10px] group-hover:scale-110 transition-transform">
                <MousePointerClick className="w-3 h-3 animate-pulse" />
              </span>
              {selectedRoleScope === 'PARENT' ? (
                <Users className="w-4 h-4 text-emerald-600" />
              ) : (
                <GraduationCap className="w-4 h-4 text-[#0753A5]" />
              )}
              <span className="truncate max-w-[140px] sm:max-w-none">{currentRoleInfo.label}</span>
              <span className="hidden md:inline-flex text-[9px] px-1.5 py-0.2 rounded-md bg-blue-200/60 text-blue-800 font-bold">
                Pilih Portal
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Pilih Lingkup Portal
                </div>
                {(Object.keys(roleScopeConfig) as Array<keyof typeof roleScopeConfig>).map((scopeKey) => {
                  const item = roleScopeConfig[scopeKey];
                  const isSelected = selectedRoleScope === scopeKey;
                  return (
                    <button
                      key={scopeKey}
                      onClick={() => handleSelectRoleScope(scopeKey)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/80 text-[#0753A5] font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {scopeKey === 'STUDENT'
                            ? '🎓'
                            : scopeKey === 'PARENT'
                            ? '👨‍👩‍👧'
                            : scopeKey === 'TEACHER'
                            ? '👨‍🏫'
                            : scopeKey === 'PRINCIPAL'
                            ? '🏫'
                            : scopeKey === 'SUPERVISOR'
                            ? '🔍'
                            : scopeKey === 'SCHOOL_ADMIN'
                            ? '⚙️'
                            : '🏛️'}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0753A5]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </nav>
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN HERO SECTION (3 Columns: Left Banner, Center Form, Right Stats) */}
      {/* ==================================================================== */}
      <main className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 relative z-20 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* ---------------------------------------------------------------- */}
          {/* COLUMN A: LEFT BANNER (7 Kebiasaan Anak Indonesia Hebat) */}
          {/* ---------------------------------------------------------------- */}
          <div className="lg:col-span-6 xl:col-span-6 bg-gradient-to-br from-[#D2E7FA] via-[#E4F1FD] to-[#D9ECFD] rounded-[32px] border border-sky-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
            
            {/* Background doodles: School building sketch & stationery */}
            <div className="absolute -right-4 -bottom-4 w-60 h-60 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-2 left-2 text-[60px] text-blue-500/5 font-serif font-black select-none pointer-events-none">
              7K
            </div>

            {/* Header of Left Card */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#093C75] tracking-tight leading-tight">
                  7 Kebiasaan
                  <br />
                  <span className="text-[#0753A5]">Anak Indonesia Hebat</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Kebiasaan kecil hari ini, masa depan besar esok nanti.
                </p>
              </div>

              {/* Speech bubble / sticky doodle note */}
              <div className="bg-white/95 border border-blue-200/80 rounded-2xl p-2.5 shadow-2xs rotate-1 text-center max-w-[170px] shrink-0">
                <p className="text-[11px] font-bold text-[#0753A5] leading-snug">
                  Disiplin Hari Ini, Versi Terbaik Esok Nanti
                </p>
                <span className="text-xs">😊 ☀️</span>
              </div>
            </div>

            {/* 7 Circle Habit Badges */}
            <div className="my-5 relative z-10">
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
                {/* 1. Bangun Pagi */}
                <div className="flex flex-col items-center gap-1 group">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                    <Sun className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 leading-tight">
                    Bangun<br />Pagi
                  </span>
                </div>

                {/* 2. Beribadah */}
                <div className="flex flex-col items-center gap-1 group">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0D9488] text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                    {/* Mosque / crescent SVG */}
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3v3m0 0a4 4 0 0 1 4 4v10H8V10a4 4 0 0 1 4-4Z" />
                      <path d="M4 14v6h4m8 0h4v-6" />
                      <circle cx="12" cy="7" r="1" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 leading-tight">
                    Beribadah
                  </span>
                </div>

                {/* 3. Berolahraga */}
                <div className="flex flex-col items-center gap-1 group">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 leading-tight">
                    Berolahraga
                  </span>
                </div>

                {/* 4. Makan Sehat */}
                <div className="flex flex-col items-center gap-1 group">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 leading-tight">
                    Makan<br />Sehat
                  </span>
                </div>
              </div>

              {/* Row 2: Habits 5, 6, 7 */}
              <div className="flex items-center justify-center gap-6 sm:gap-10 mt-3 text-center">
                {/* 5. Gemar Belajar */}
                <div className="flex flex-col items-center gap-1 group">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#9333EA] text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 leading-tight">
                    Gemar<br />Belajar
                  </span>
                </div>

                {/* 6. Bermasyarakat */}
                <div className="flex flex-col items-center gap-1 group">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 leading-tight">
                    Bermasyarakat
                  </span>
                </div>

                {/* 7. Tidur Lebih Awal */}
                <div className="flex flex-col items-center gap-1 group">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center shadow-md shadow-indigo-900/30 group-hover:scale-105 transition-transform">
                    <Moon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 leading-tight">
                    Tidur<br />Lebih Awal
                  </span>
                </div>
              </div>
            </div>

            {/* Students Illustration Composition (Indonesian SMP Students Character Art) */}
            <div className="relative mt-2 pt-2 border-t border-blue-200/60 flex flex-col items-center">
              
              {/* Badge Stickers */}
              <div className="absolute -top-3 left-2 bg-white/95 text-[#0753A5] font-black text-[10px] px-2.5 py-1 rounded-full shadow-xs border border-blue-200 rotate-[-6deg] z-10">
                Siswa Berkarakter ⭐
              </div>
              <div className="absolute -top-3 right-2 bg-amber-300 text-slate-900 font-black text-[10px] px-2.5 py-1 rounded-full shadow-xs border border-amber-400 rotate-[5deg] z-10">
                Masa Depan Hebat!! 🚀
              </div>

              {/* Vector Characters Scene */}
              <div className="w-full flex items-end justify-center gap-2 sm:gap-4 pt-4 pb-2">
                
                {/* Student 1 (Boy Left) */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-2 border-blue-300 shadow-md flex items-center justify-center text-3xl sm:text-4xl">
                    👦🏻
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full mt-1">
                    Mandiri
                  </span>
                </div>

                {/* Student 2 (Girl in Hijab Center) */}
                <div className="flex flex-col items-center -mt-2 scale-110">
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-white border-2 border-[#0753A5] shadow-lg flex items-center justify-center text-4xl sm:text-5xl">
                    🧕🏻
                  </div>
                  <span className="text-[9px] font-bold text-[#0753A5] bg-blue-50 px-2.5 py-0.5 rounded-full mt-1 border border-blue-200">
                    Berkarakter
                  </span>
                </div>

                {/* Student 3 (Boy Right) */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-2 border-blue-300 shadow-md flex items-center justify-center text-3xl sm:text-4xl">
                    🧑🏻
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full mt-1">
                    Kreatif
                  </span>
                </div>
              </div>

              {/* Desk with Books Stack, Laptop, Mug */}
              <div className="w-full bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-blue-200/80 flex flex-wrap items-center justify-between gap-2 shadow-2xs mt-2">
                
                {/* Book Spine Stacks */}
                <div className="flex items-center gap-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-600 text-white shadow-2xs">ILMU</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500 text-white shadow-2xs">AKHLAK</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-teal-600 text-white shadow-2xs">PRESTASI</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-600 text-white shadow-2xs">MASA DEPAN</span>
                  </div>
                </div>

                {/* Laptop Display */}
                <div className="flex-1 max-w-[180px] bg-slate-900 rounded-lg p-2 text-center text-white border border-slate-700 shadow-xs">
                  <div className="text-[9px] font-bold text-sky-300">
                    Belajar Bersama
                  </div>
                  <div className="text-[8px] text-emerald-400">
                    Tumbuh Bersama :)
                  </div>
                </div>

                {/* Mug & Campus Slogan */}
                <div className="text-right">
                  <div className="text-[9px] font-bold text-slate-700">
                    SMP Bersama Kita Bisa!
                  </div>
                  <div className="text-[8px] text-slate-500 font-medium">
                    ☕ Brighter Tomorrow
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* ---------------------------------------------------------------- */}
          {/* COLUMN B: CENTER LOGIN CARD (White Box as in Reference Image) */}
          {/* ---------------------------------------------------------------- */}
          <div className="lg:col-span-6 xl:col-span-4 bg-white rounded-[32px] border border-slate-200/90 shadow-xl shadow-blue-900/5 p-6 sm:p-8 flex flex-col justify-between space-y-5 relative">
            
            {/* Top Logo & AI Badge */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {/* Sprout emblem logo */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-[#0753A5] flex items-center justify-center shadow-xs">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21V12" stroke="#0753A5" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M12 12C9 7 5 7 3 9C2 13 6 15 12 12Z" fill="#41A85F" />
                      <path d="M12 12C15 6 20 7 21 10C22 14 17 16 12 12Z" fill="#20A5D5" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-[#0753A5]">
                      SI-7KAIH AI
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Jurnal Aktivitas Siswa
                    </p>
                  </div>
                </div>

                {/* AI / Portal Role Badge */}
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                    selectedRoleScope === 'PARENT'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-600 bg-amber-50 border border-amber-200'
                  }`}>
                    <span>{selectedRoleScope === 'PARENT' ? 'Portal Orang Tua' : selectedRoleScope === 'STUDENT' ? 'AI untuk Siswa' : currentRoleInfo.badge}</span>
                    <span>{selectedRoleScope === 'PARENT' ? '👨‍👩‍👧' : selectedRoleScope === 'STUDENT' ? '☀️' : '🛡️'}</span>
                  </span>
                </div>
              </div>

              {/* Petunjuk Interaktif Klik Portal Pengguna dengan Icon Animasi */}
              <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-900 shadow-sm ring-4 ring-amber-300/40 animate-bounce shrink-0">
                    <MousePointerClick className="w-3.5 h-3.5" />
                  </span>
                  <span className="tracking-tight">Klik Portal Pengguna:</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#0753A5] bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                  <span>Pilih Peran Akun ▾</span>
                </div>
              </div>

              {/* Quick Portal Switcher Tabs */}
              <div className="relative">
                <div className="bg-slate-100/95 p-1 rounded-2xl flex items-center gap-1 overflow-x-auto text-[11px] scrollbar-none ring-1 ring-slate-200/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleSelectRoleScope('STUDENT')}
                    className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all text-center whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 ${
                      selectedRoleScope === 'STUDENT'
                        ? 'bg-white text-[#0753A5] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🎓</span>
                    <span>Murid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRoleScope('PARENT')}
                    className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all text-center whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 ${
                      selectedRoleScope === 'PARENT'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>👨‍👩‍👧</span>
                    <span>Orang Tua</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRoleScope('TEACHER')}
                    className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all text-center whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 ${
                      selectedRoleScope === 'TEACHER'
                        ? 'bg-white text-[#0753A5] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>👨‍🏫</span>
                    <span>Guru</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCardRoleDropdownOpen(!isCardRoleDropdownOpen)}
                    className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      selectedRoleScope !== 'STUDENT' && selectedRoleScope !== 'PARENT' && selectedRoleScope !== 'TEACHER'
                        ? 'bg-white text-[#0753A5] shadow-xs ring-1 ring-blue-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Pilih peran lainnya (Kepala Sekolah, Pengawas, Admin SIM, Super Admin)"
                  >
                    <span>
                      {selectedRoleScope !== 'STUDENT' && selectedRoleScope !== 'PARENT' && selectedRoleScope !== 'TEACHER'
                        ? currentRoleInfo.badge.replace('Login ', '')
                        : 'Lainnya'}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isCardRoleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Popover Dropdown for Card Quick Switcher */}
                {isCardRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Pilih Portal Pengguna</span>
                      <span className="text-[9px] text-[#0753A5] font-bold">7 Peran Tersedia</span>
                    </div>
                    <div className="p-1 max-h-60 overflow-y-auto space-y-0.5">
                      {(Object.keys(roleScopeConfig) as Array<keyof typeof roleScopeConfig>).map((scopeKey) => {
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
                                {scopeKey === 'STUDENT'
                                  ? '🎓'
                                  : scopeKey === 'PARENT'
                                  ? '👨‍👩‍👧'
                                  : scopeKey === 'TEACHER'
                                  ? '👨‍🏫'
                                  : scopeKey === 'PRINCIPAL'
                                  ? '🏫'
                                  : scopeKey === 'SUPERVISOR'
                                  ? '🔍'
                                  : scopeKey === 'SCHOOL_ADMIN'
                                  ? '⚙️'
                                  : '🏛️'}
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
                  </div>
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
                        <label className="block text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                          <School className={`w-3.5 h-3.5 ${selectedRoleScope === 'PARENT' ? 'text-emerald-600' : 'text-[#0753A5]'}`} />
                          <span>Pilih Satuan Pendidikan / Sekolah:</span>
                        </label>
                        <div className="relative">
                          <select
                            id="login-select-school"
                            value={selectedSchoolForLogin}
                            onChange={(e) => handleSchoolChange(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all shadow-2xs"
                          >
                            <option value="ALL">Semua Satuan Pendidikan ({allAvailableStudents.length} Siswa)</option>
                            {availableSchoolsForLogin.map((sch) => {
                              const count = allAvailableStudents.filter((s) => s.schoolName === sch).length;
                              return (
                                <option key={sch} value={sch}>
                                  {sch} ({count} Siswa)
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      {/* 2. Dropdown Pilihan Kelas */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                          <Building2 className={`w-3.5 h-3.5 ${selectedRoleScope === 'PARENT' ? 'text-emerald-600' : 'text-[#0753A5]'}`} />
                          <span>Pilih Kelas / Rombel:</span>
                        </label>
                        <div className="relative">
                          <select
                            id="login-select-class"
                            value={selectedClassForLogin}
                            onChange={(e) => handleClassChange(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all shadow-2xs"
                          >
                            <option value="ALL">
                              {selectedSchoolForLogin === 'ALL'
                                ? `Semua Kelas (${studentsInSelectedSchool.length} Siswa)`
                                : `Semua Kelas di ${selectedSchoolForLogin} (${studentsInSelectedSchool.length} Siswa)`}
                            </option>
                            {availableClassesForLogin.map((cls) => {
                              const count = studentsInSelectedSchool.filter((s) => s.className === cls).length;
                              return (
                                <option key={cls} value={cls}>
                                  {cls} ({count} Siswa)
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      {/* 3. Dropdown Pilihan Nama Murid */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                          <User className={`w-3.5 h-3.5 ${selectedRoleScope === 'PARENT' ? 'text-emerald-600' : 'text-[#0753A5]'}`} />
                          <span>
                            {selectedRoleScope === 'STUDENT'
                              ? 'Pilih Nama Murid:'
                              : 'Pilih Nama Murid (Putra / Putri Ananda):'}
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            id="login-select-student"
                            value={selectedStudentNisn}
                            onChange={(e) => handleSelectStudentFromDropdown(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#0753A5] focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all shadow-2xs"
                          >
                            <option value="">
                              -- {selectedRoleScope === 'STUDENT' ? 'Klik untuk memilih nama Anda' : 'Klik untuk memilih nama ananda'} ({filteredStudentsForDropdown.length} Tersedia) --
                            </option>
                            {filteredStudentsForDropdown.map((s) => (
                              <option key={s.id || s.nisn} value={s.nisn}>
                                {s.name} — {s.className}{selectedSchoolForLogin === 'ALL' && s.schoolName ? ` (${s.schoolName})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
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

          {/* ---------------------------------------------------------------- */}
          {/* COLUMN C: RIGHT STATS & STICKY NOTE */}
          {/* ---------------------------------------------------------------- */}
          <div className="lg:col-span-12 xl:col-span-2 flex xl:flex-col sm:flex-row flex-col gap-4 justify-between">
            
            {/* Tilted Yellow Sticky Note */}
            <div className="bg-[#FEF08A] text-slate-900 p-5 rounded-3xl shadow-md border border-amber-300/80 -rotate-2 relative overflow-hidden flex flex-col justify-between flex-1 xl:flex-none xl:h-44">
              
              {/* Adhesive tape graphic at top */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-5 bg-white/60 backdrop-blur-xs border border-amber-200/80 rounded-sm rotate-1" />

              <div className="flex items-center justify-between pt-1">
                <span className="text-2xl">👑</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  Motivasi
                </span>
              </div>

              <div className="my-auto py-2">
                <p className="text-base sm:text-lg font-black leading-snug text-slate-900 tracking-tight">
                  Anak SMP Bisa Luar Biasa
                </p>
                <p className="text-[11px] text-amber-950/80 font-medium mt-1">
                  Maju bersama 7 Kebiasaan Anak Indonesia Hebat setiap hari!
                </p>
              </div>

              <div className="text-right text-[10px] font-bold text-amber-800">
                #GenerasiHebat
              </div>
            </div>

            {/* Stat Card 1: Total Siswa Bergabung */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between flex-1 xl:flex-none space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0753A5] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                  <span>↗ {studentMetrics.activePercent}% Aktif</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 block">
                  Total Siswa Bergabung
                </span>
                <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {studentMetrics.totalStudents.toLocaleString('id-ID')}
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {studentMetrics.activeStudents} Siswa SMP Aktif
                </span>
              </div>

              {/* Mini Green Bar Chart SVG */}
              <div className="flex items-end gap-1 h-5 pt-1" title={`${studentMetrics.totalStudents} siswa terdata di SIM`}>
                <span className="w-1.5 h-2 bg-emerald-300 rounded-xs" />
                <span className="w-1.5 h-3 bg-emerald-400 rounded-xs" />
                <span className="w-1.5 h-2.5 bg-emerald-300 rounded-xs" />
                <span className="w-1.5 h-4 bg-emerald-500 rounded-xs" />
                <span className="w-1.5 h-5 bg-emerald-600 rounded-xs" />
              </div>
            </div>

            {/* Stat Card 2: Hari Ini Sudah Aktif */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between flex-1 xl:flex-none space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                  <span>{studentMetrics.hasActiveToday ? `↗ +${studentMetrics.activeTodayPercent}%` : 'Siap Aktif'}</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 block">
                  Hari Ini Sudah Aktif
                </span>
                <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {studentMetrics.activeTodayCount.toLocaleString('id-ID')}
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {studentMetrics.hasActiveToday
                    ? `${studentMetrics.activeTodayCount} dari ${studentMetrics.totalStudents} Siswa`
                    : `0 dari ${studentMetrics.totalStudents} Siswa Hari Ini`}
                </span>
              </div>

              {/* Mini Green Bar Chart SVG */}
              <div className="flex items-end gap-1 h-5 pt-1" title={`${studentMetrics.activeTodayCount} siswa aktif mengisi jurnal hari ini`}>
                <span className={`w-1.5 rounded-xs transition-all ${studentMetrics.hasActiveToday ? 'h-2.5 bg-emerald-400' : 'h-1.5 bg-slate-200'}`} />
                <span className={`w-1.5 rounded-xs transition-all ${studentMetrics.hasActiveToday ? 'h-3.5 bg-emerald-500' : 'h-1.5 bg-slate-200'}`} />
                <span className={`w-1.5 rounded-xs transition-all ${studentMetrics.activeTodayCount > 1 ? 'h-4 bg-emerald-500' : 'h-1.5 bg-slate-200'}`} />
                <span className={`w-1.5 rounded-xs transition-all ${studentMetrics.activeTodayCount > 2 ? 'h-4.5 bg-emerald-600' : 'h-1.5 bg-slate-200'}`} />
                <span className={`w-1.5 rounded-xs transition-all ${studentMetrics.hasActiveToday ? 'h-5 bg-emerald-600' : 'h-1.5 bg-slate-200'}`} />
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* ==================================================================== */}
      {/* 3. BOTTOM FEATURES BANNER (Floating Card as in Reference Image) */}
      {/* ==================================================================== */}
      <section className="w-full max-w-7xl mx-auto px-4 pb-3 relative z-20">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          
          {/* Feature 1: Kebiasaan Baik */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">
                Kebiasaan Baik
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Membentuk Karakter Hebat
              </p>
            </div>
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200" />

          {/* Feature 2: Siswa Bahagia */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">
                Siswa Bahagia
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Sekolah Lebih Bermakna
              </p>
            </div>
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200" />

          {/* Feature 3: Generasi Sehat, Cerdas, Berakhlak */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">
                Generasi Sehat, Cerdas, Berakhlak
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Untuk Indonesia yang Lebih Baik
              </p>
            </div>
          </div>

          {/* Creator Attribution & Indonesian Callout */}
          <div className="ml-auto flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/90 border border-blue-200 text-slate-700 text-xs shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5 text-[#0753A5] shrink-0" />
              <span className="text-[11px] font-medium text-slate-600">
                Kreasi oleh <strong className="text-[#0753A5] font-black">Ahmad Muzani</strong> — Pengawas SMP Disdikbud Tanah Laut
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-[#0753A5] shrink-0">
              <span>Indonesia Butuh Kamu</span>
              <span className="text-amber-500">☀️ :)</span>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. FOOTER COPYRIGHT LINE */}
      {/* ==================================================================== */}
      <footer className="w-full text-center text-slate-500 text-[11px] font-medium py-3.5 px-4 relative z-10 border-t border-slate-200/60 bg-white/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
          <span>SI-7KAIH AI</span>
          <span className="text-slate-300">•</span>
          <span>Jurnal Aktivitas Siswa</span>
          <span className="text-slate-300">•</span>
          <span>Untuk Murid SMP</span>
          <span className="text-slate-300">•</span>
          <span>© 2024</span>
          <span className="text-slate-300">•</span>
          <span className="font-bold text-slate-700">
            Kreasi oleh Ahmad Muzani-Pengawas SMP Disdikbud Tanah Laut
          </span>
          <span className="text-slate-300">•</span>
          <span>Bersama Membangun Generasi Hebat</span>
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
