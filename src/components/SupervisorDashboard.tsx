// ============================================================================
// SI-7KAIH AI - Supervisor Regional Dashboard Component
// Multi-school comparison, regional portfolio, supervisory recommendations
// Disinkronkan 100% dengan Data Terupdate dari Super Admin & Admin Sekolah
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Building2,
  Sparkles,
  TrendingUp,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Download,
  Eye,
  X,
  Send,
  Award,
  Users,
  RefreshCw,
  Search,
  Filter,
  School,
  GraduationCap,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { SchoolMaster, getStoredSchools } from '../lib/schoolMasterData';
import { Rombel, Student, getStoredRombels, getStoredStudents } from '../lib/studentData';
import { UserPersona, getStoredUsers } from '../lib/constants';
import { DailyJournal, FollowUpPlan } from '../../packages/types/src/index';

interface SupervisorDashboardProps {
  onOpenReportModal: () => void;
  activeNavTab?: string;
  currentPersona?: UserPersona;
  journals?: DailyJournal[];
  followUps?: FollowUpPlan[];
}

const getStoredSupervisorFollowUps = (): FollowUpPlan[] => {
  try {
    const rawTeacher = localStorage.getItem('si7kaih_teacher_followups_prod');
    const teacherPlans: FollowUpPlan[] = rawTeacher ? JSON.parse(rawTeacher) : [];
    const rawSchool = localStorage.getItem('si7kaih_followups_prod');
    const schoolPlans: FollowUpPlan[] = rawSchool ? JSON.parse(rawSchool) : [];
    return [...teacherPlans, ...schoolPlans];
  } catch (_e) {
    return [];
  }
};

const getStoredSupervisionNotes = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem('si7kaih_supervision_notes_prod');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const legacyDummyKeys = ['s-smp-01', 's-smp-02', 's-smp-03', 's-smp-04'];
        const sanitized: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (!legacyDummyKeys.includes(k) && typeof v === 'string') {
            sanitized[k] = v;
          }
        }
        return sanitized;
      }
    }
  } catch (_e) {}
  return {};
};

const saveStoredSupervisionNotes = (notes: Record<string, string>) => {
  try {
    localStorage.setItem('si7kaih_supervision_notes_prod', JSON.stringify(notes));
  } catch (_e) {}
};

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  onOpenReportModal,
  activeNavTab,
  currentPersona,
  journals = [],
  followUps = [],
}) => {
  const [activeTab, setActiveTab] = useState<'REGIONAL_OVERVIEW' | 'COMPARISON' | 'MONITORING' | 'RTL' | 'AI_REGIONAL'>('REGIONAL_OVERVIEW');
  const [aiSupervisorResult, setAiSupervisorResult] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [supervisionNotes, setSupervisionNotes] = useState<Record<string, string>>(() => getStoredSupervisionNotes());
  const [currentNoteInput, setCurrentNoteInput] = useState('');

  // Synchronized Master & Mandiri Data States
  const [schools, setSchools] = useState<SchoolMaster[]>(() => getStoredSchools());
  const [rombels, setRombels] = useState<Rombel[]>(() => getStoredRombels());
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [userAccounts, setUserAccounts] = useState<UserPersona[]>(() => getStoredUsers());
  const [localFollowUps, setLocalFollowUps] = useState<FollowUpPlan[]>(() => {
    const stored = getStoredSupervisorFollowUps();
    return stored.length > 0 ? stored : followUps;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenjang, setFilterJenjang] = useState<'ALL' | 'SD' | 'SMP' | 'SMA'>('ALL');
  const [selectedMonitoringSchoolId, setSelectedMonitoringSchoolId] = useState<string>('');

  // Re-sync all data from authoritative storage
  const syncAllData = () => {
    setIsSyncing(true);
    const freshSchools = getStoredSchools();
    const freshRombels = getStoredRombels();
    const freshStudents = getStoredStudents();
    const freshUsers = getStoredUsers();
    setSchools(freshSchools);
    setRombels(freshRombels);
    setStudents(freshStudents);
    setUserAccounts(freshUsers);
    setLocalFollowUps(getStoredSupervisorFollowUps());
    setSupervisionNotes(getStoredSupervisionNotes());
    setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setTimeout(() => setIsSyncing(false), 500);
  };

  // Listen to cross-tab storage and application events
  useEffect(() => {
    const handleSync = () => syncAllData();

    window.addEventListener('storage', handleSync);
    window.addEventListener('si7kaih_schools_updated', handleSync);
    window.addEventListener('si7kaih_students_updated', handleSync);
    window.addEventListener('si7kaih_rombels_updated', handleSync);
    window.addEventListener('si7kaih_users_updated', handleSync);
    window.addEventListener('si7kaih_followups_updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('si7kaih_schools_updated', handleSync);
      window.removeEventListener('si7kaih_students_updated', handleSync);
      window.removeEventListener('si7kaih_rombels_updated', handleSync);
      window.removeEventListener('si7kaih_users_updated', handleSync);
      window.removeEventListener('si7kaih_followups_updated', handleSync);
    };
  }, []);

  // Sync with Header navigation tabs
  useEffect(() => {
    if (!activeNavTab) return;
    if (activeNavTab === 'schools-comparison') {
      setActiveTab('COMPARISON');
    } else if (activeNavTab === 'monitoring') {
      setActiveTab('MONITORING');
    } else if (activeNavTab === 'rtl') {
      setActiveTab('RTL');
    } else if (activeNavTab === 'ai-supervisor') {
      setActiveTab('AI_REGIONAL');
    } else if (activeNavTab === 'dashboard') {
      setActiveTab('REGIONAL_OVERVIEW');
    }
  }, [activeNavTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenSchoolModal = (school: any) => {
    setSelectedSchool(school);
    setCurrentNoteInput(supervisionNotes[school.id] || '');
  };

  const handleSaveSupervisionNote = () => {
    if (!selectedSchool) return;
    const updated = {
      ...supervisionNotes,
      [selectedSchool.id]: currentNoteInput,
    };
    setSupervisionNotes(updated);
    saveStoredSupervisionNotes(updated);
    showToast(`Catatan supervisi untuk ${selectedSchool.name} berhasil disimpan.`);
    setSelectedSchool(null);
  };

  // Dynamically map all schools from Master Super Admin with live metrics from School Admin
  const fosterSchools = useMemo(() => {
    return schools.map((s) => {
      // 1. Peserta Didik: Ambil dari data siswa mandiri aktual atau totalStudents yang diisi admin, default 0
      const schoolStudents = students.filter(
        (st) =>
          (st.schoolId && st.schoolId === s.id) ||
          (st.schoolName && st.schoolName.trim().toLowerCase() === s.name.trim().toLowerCase())
      );
      const studentCount = schoolStudents.length > 0 ? schoolStudents.length : (s.totalStudents || 0);

      // 2. Tenaga Pendidik: Ambil dari akun guru aktif untuk sekolah ini atau totalTeachers yang diisi admin, default 0
      const schoolTeachers = userAccounts.filter(
        (u) =>
          u.role === 'TEACHER' &&
          ((u.schoolId && u.schoolId === s.id) ||
            (u.schoolName && u.schoolName.trim().toLowerCase() === s.name.trim().toLowerCase()))
      );
      const teacherCount = schoolTeachers.length > 0 ? schoolTeachers.length : (s.totalTeachers || 0);

      // 3. Rombongan Belajar: Ambil dari rombel mandiri aktual atau totalClasses yang diisi admin, default 0
      const schoolRombels = rombels.filter(
        (r) =>
          (r.schoolId && r.schoolId === s.id) ||
          (r.schoolName && r.schoolName.trim().toLowerCase() === s.name.trim().toLowerCase())
      );
      const classCount = schoolRombels.length > 0 ? schoolRombels.length : (s.totalClasses || 0);

      // 4. Jurnal Harian & Metrik 7 Kebiasaan
      const schoolStudentIds = new Set(schoolStudents.map((st) => st.id));
      const schoolJournals = journals.filter(
        (j) =>
          (j.schoolId && j.schoolId === s.id) ||
          (j.studentId && schoolStudentIds.has(j.studentId))
      );

      const habitCounts: Record<string, { total: number; completed: number }> = {
        WAKE_EARLY: { total: 0, completed: 0 },
        WORSHIP: { total: 0, completed: 0 },
        EXERCISE: { total: 0, completed: 0 },
        HEALTHY_EATING: { total: 0, completed: 0 },
        LEARNING: { total: 0, completed: 0 },
        SOCIAL: { total: 0, completed: 0 },
        SLEEP_EARLY: { total: 0, completed: 0 },
      };

      let completeness = 0;
      let consistency = 0;
      let totalCompletedHabits = 0;

      if (schoolJournals.length > 0) {
        let totalEntries = 0;
        schoolJournals.forEach((j) => {
          if (j.entries) {
            Object.entries(j.entries).forEach(([code, entry]) => {
              if (habitCounts[code]) {
                habitCounts[code].total += 1;
                if (entry && (entry as any).completed) {
                  habitCounts[code].completed += 1;
                  totalCompletedHabits += 1;
                }
                totalEntries += 1;
              }
            });
          }
        });

        const denominator = studentCount > 0 ? studentCount * 30 : 30;
        completeness = Math.min(100, Math.round((schoolJournals.length / denominator) * 100));
        consistency = totalEntries > 0 ? Math.min(100, Math.round((totalCompletedHabits / totalEntries) * 100)) : 0;
      } else {
        // Jika belum ada entri jurnal dan belum diupdate data oleh super admin dan admin sekolah, reset ke default 0
        completeness = typeof s.habitCompletenessRate === 'number' ? s.habitCompletenessRate : 0;
        consistency = typeof s.habitConsistencyRate === 'number' ? s.habitConsistencyRate : 0;
      }

      // Setiap kebiasaan reset ke default 0 jika belum ada data/jurnal
      const habits = {
        wakeEarly: habitCounts.WAKE_EARLY.total > 0
          ? Math.round((habitCounts.WAKE_EARLY.completed / habitCounts.WAKE_EARLY.total) * 100)
          : 0,
        worship: habitCounts.WORSHIP.total > 0
          ? Math.round((habitCounts.WORSHIP.completed / habitCounts.WORSHIP.total) * 100)
          : 0,
        exercise: habitCounts.EXERCISE.total > 0
          ? Math.round((habitCounts.EXERCISE.completed / habitCounts.EXERCISE.total) * 100)
          : 0,
        healthyEat: habitCounts.HEALTHY_EATING.total > 0
          ? Math.round((habitCounts.HEALTHY_EATING.completed / habitCounts.HEALTHY_EATING.total) * 100)
          : 0,
        learning: habitCounts.LEARNING.total > 0
          ? Math.round((habitCounts.LEARNING.completed / habitCounts.LEARNING.total) * 100)
          : 0,
        social: habitCounts.SOCIAL.total > 0
          ? Math.round((habitCounts.SOCIAL.completed / habitCounts.SOCIAL.total) * 100)
          : 0,
        sleepEarly: habitCounts.SLEEP_EARLY.total > 0
          ? Math.round((habitCounts.SLEEP_EARLY.completed / habitCounts.SLEEP_EARLY.total) * 100)
          : 0,
      };

      // RTL aktif: Ambil dari data rencana tindak lanjut sekolah aktual, reset ke default 0 bila belum ada data
      const schoolFollowUps = localFollowUps.filter(
        (f) =>
          (f.schoolId && f.schoolId === s.id) ||
          (s.name && f.finding && f.finding.toLowerCase().includes(s.name.toLowerCase()))
      );
      const activeRtl = schoolFollowUps.filter((f) => f.status !== 'COMPLETED').length;

      const hasActivity =
        studentCount > 0 ||
        teacherCount > 0 ||
        classCount > 0 ||
        completeness > 0 ||
        consistency > 0 ||
        schoolJournals.length > 0;

      const status: 'TERPANTAU_BAIK' | 'PERLU_PENGUATAN' | 'BELUM_ADA_DATA' = !hasActivity
        ? 'BELUM_ADA_DATA'
        : completeness >= 80 && consistency >= 70
        ? 'TERPANTAU_BAIK'
        : 'PERLU_PENGUATAN';

      let priorityHabit = 'Belum Ada Data (0%)';
      if (schoolJournals.length > 0 || (completeness > 0 && consistency > 0)) {
        const habitList = [
          { name: 'Bangun Pagi', val: habits.wakeEarly },
          { name: 'Beribadah', val: habits.worship },
          { name: 'Berolahraga', val: habits.exercise },
          { name: 'Makan Sehat', val: habits.healthyEat },
          { name: 'Gemar Belajar', val: habits.learning },
          { name: 'Bermasyarakat', val: habits.social },
          { name: 'Tidur Cepat', val: habits.sleepEarly },
        ].sort((a, b) => a.val - b.val);
        priorityHabit = `${habitList[0].name} (${habitList[0].val}%)`;
      }

      return {
        id: s.id,
        name: s.name,
        npsn: s.npsn,
        jenjang: s.jenjang || 'SMP',
        schoolStatus: s.status || 'NEGERI',
        akreditasi: s.akreditasi || 'A',
        district: s.district || 'Kecamatan Binaan',
        city: s.city || 'Kota Administrasi',
        address: s.address || '',
        students: studentCount,
        teachers: teacherCount,
        classes: classCount,
        completeness,
        consistency,
        status,
        activeRtl,
        schoolFollowUps,
        headmaster: s.principalName || 'Belum Ditentukan',
        headmasterNip: s.principalNip || '-',
        admin: s.adminName || 'Belum Ada Admin',
        priorityHabit,
        habits,
        supervisionNote: supervisionNotes[s.id] || '',
      };
    });
  }, [schools, students, rombels, userAccounts, supervisionNotes, journals, localFollowUps]);

  // Filtered schools for search / filter views
  const filteredSchools = useMemo(() => {
    return fosterSchools.filter((s) => {
      const matchQuery =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.npsn.includes(searchQuery) ||
        s.headmaster.toLowerCase().includes(searchQuery.toLowerCase());
      const matchJenjang = filterJenjang === 'ALL' || s.jenjang === filterJenjang;
      return matchQuery && matchJenjang;
    });
  }, [fosterSchools, searchQuery, filterJenjang]);

  // Regional Aggregate Metrics
  const totalSchoolsCount = fosterSchools.length;
  const totalStudentsCount = useMemo(
    () => fosterSchools.reduce((acc, s) => acc + s.students, 0),
    [fosterSchools]
  );
  const totalTeachersCount = useMemo(
    () => fosterSchools.reduce((acc, s) => acc + s.teachers, 0),
    [fosterSchools]
  );

  const schoolsWithMetrics = useMemo(
    () => fosterSchools.filter((s) => s.status !== 'BELUM_ADA_DATA'),
    [fosterSchools]
  );

  const avgCompleteness = useMemo(() => {
    if (schoolsWithMetrics.length === 0) return 0;
    const sum = schoolsWithMetrics.reduce((acc, s) => acc + s.completeness, 0);
    return +(sum / schoolsWithMetrics.length).toFixed(1);
  }, [schoolsWithMetrics]);

  const avgConsistency = useMemo(() => {
    if (schoolsWithMetrics.length === 0) return 0;
    const sum = schoolsWithMetrics.reduce((acc, s) => acc + s.consistency, 0);
    return +(sum / schoolsWithMetrics.length).toFixed(1);
  }, [schoolsWithMetrics]);

  const totalActiveRtl = useMemo(
    () => fosterSchools.reduce((acc, s) => acc + s.activeRtl, 0),
    [fosterSchools]
  );

  const goodStatusCount = useMemo(
    () => fosterSchools.filter((s) => s.status === 'TERPANTAU_BAIK').length,
    [fosterSchools]
  );
  const unupdatedStatusCount = useMemo(
    () => fosterSchools.filter((s) => s.status === 'BELUM_ADA_DATA').length,
    [fosterSchools]
  );
  const warningStatusCount = totalSchoolsCount - goodStatusCount - unupdatedStatusCount;

  // Habit Averages across schools for tab MONITORING
  const habitAverages = useMemo(() => {
    if (schoolsWithMetrics.length === 0) {
      return {
        wakeEarly: 0,
        worship: 0,
        exercise: 0,
        healthyEat: 0,
        learning: 0,
        social: 0,
        sleepEarly: 0,
      };
    }
    const count = schoolsWithMetrics.length;
    return {
      wakeEarly: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.wakeEarly, 0) / count).toFixed(1),
      worship: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.worship, 0) / count).toFixed(1),
      exercise: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.exercise, 0) / count).toFixed(1),
      healthyEat: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.healthyEat, 0) / count).toFixed(1),
      learning: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.learning, 0) / count).toFixed(1),
      social: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.social, 0) / count).toFixed(1),
      sleepEarly: +(schoolsWithMetrics.reduce((acc, s) => acc + s.habits.sleepEarly, 0) / count).toFixed(1),
    };
  }, [schoolsWithMetrics]);

  // Selected School for Monitoring Portfolio
  const activeMonitoringSchool = useMemo(() => {
    if (selectedMonitoringSchoolId) {
      const found = fosterSchools.find((s) => s.id === selectedMonitoringSchoolId);
      if (found) return found;
    }
    return fosterSchools[0] || null;
  }, [fosterSchools, selectedMonitoringSchoolId]);

  const handleExportRegionalCsv = () => {
    if (fosterSchools.length === 0) {
      showToast('Belum ada data satuan pendidikan binaan untuk diekspor (default 0).');
      return;
    }
    const headers = [
      'NPSN',
      'Nama Satuan Pendidikan',
      'Jenjang',
      'Status',
      'Akreditasi',
      'Kepala Sekolah',
      'NIP Kepala Sekolah',
      'Peserta Didik Terdata',
      'Tenaga Pendidik',
      'Rombel',
      'Kelengkapan Data (%)',
      'Konsistensi 7KAIH (%)',
      'Status Monitoring',
      'RTL Aktif',
      'Fokus Prioritas',
      'Catatan Supervisi Pengawas',
    ];
    const rows = fosterSchools.map((s) => [
      `"${s.npsn}"`,
      `"${s.name}"`,
      s.jenjang,
      s.schoolStatus,
      s.akreditasi,
      `"${s.headmaster}"`,
      `"${s.headmasterNip}"`,
      s.students,
      s.teachers,
      s.classes,
      s.completeness,
      s.consistency,
      `"${s.status}"`,
      s.activeRtl,
      `"${s.priorityHabit}"`,
      `"${s.supervisionNote.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      '\uFEFF' +
      [
        `"Matriks Komparasi Supervisi Satuan Pendidikan Binaan SI-7KAIH"`,
        `"Pengawas: ${currentPersona?.name || 'Pengawas Pembina'} - Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}"`,
        '',
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Matriks_Supervisi_Wilayah_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Matriks supervisi komparasi wilayah binaan berhasil diekspor (CSV).');
  };

  const handleGenerateSupervisorAi = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'SUPERVISOR_REGIONAL_ANALYSIS',
          payload: {
            supervisorName: currentPersona?.name || 'Pengawas Pembina',
            jurisdiction: 'Wilayah Binaan Satuan Pendidikan',
            totalSchools: totalSchoolsCount,
            totalStudents: totalStudentsCount,
            avgCompleteness,
            avgConsistency,
            schools: fosterSchools.map((s) => ({
              name: s.name,
              completeness: s.completeness,
              consistency: s.consistency,
              status: s.status,
              priority: s.priorityHabit,
            })),
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiSupervisorResult(json.data);
      } else {
        if (totalSchoolsCount === 0 || schoolsWithMetrics.length === 0) {
          setAiSupervisorResult({
            recordedFacts: [
              `Satuan pendidikan binaan terdata: ${totalSchoolsCount} sekolah dengan total ${totalStudentsCount} peserta didik dan ${totalTeachersCount} pendidik terdata.`,
              `Status entri data: Belum ada data jurnal atau aktivitas pembiasaan yang diperbarui oleh Admin Sekolah (kelengkapan rata-rata: ${avgCompleteness}%).`,
              `Konsistensi pembiasaan 7KAIH saat ini berada pada angka default 0% (menunggu pengisian mandiri).`,
            ],
            habitPatterns: [
              'Pola pembiasaan 7KAIH wilayah belum terbentuk karena belum ada aktivitas jurnal berkala yang diinput oleh satuan pendidikan.',
            ],
            dataLimitations: [
              'Seluruh metrik dan indikator saat ini berada pada kondisi default 0 karena belum ada sinkronisasi/entri data dari Super Admin dan Admin Sekolah.',
            ],
            hypothesesToVerify: [
              'Verifikasi kesiapan akun pengguna (guru, siswa, orang tua) dan perangkat pada satuan pendidikan binaan.',
            ],
            actionableRecommendations: [
              'Lakukan koordinasi dengan Dinas Pendidikan dan Admin Sekolah untuk pemutakhiran master siswa dan rombel.',
              'Sosialisasikan panduan pengisian jurnal harian 7KAIH kepada wali kelas dan paguyuban orang tua.',
              'Jadwalkan pendampingan awal aktivasi sistem untuk satuan pendidikan binaan.',
            ],
          });
        } else {
          setAiSupervisorResult({
            recordedFacts: [
              `Membina ${totalSchoolsCount} satuan pendidikan dengan total ${totalStudentsCount} peserta didik dan ${totalTeachersCount} pendidik terdata.`,
              `Rata-rata kelengkapan pengisian jurnal wilayah mencapai ${avgCompleteness}%.`,
              `Rata-rata konsistensi pembiasaan 7KAIH berada di angka ${avgConsistency}%.`,
            ],
            habitPatterns: [
              'Capaian dimensi kebiasaan terdistribusi sesuai dengan data entri mandiri satuan pendidikan.',
              'Perlu perhatian pada dimensi dengan persentase terendah untuk penguatan berkelanjutan.',
            ],
            dataLimitations: [
              'Akurasi analisis bergantung pada keteraturan input jurnal harian oleh siswa dan validasi guru/orang tua.',
            ],
            hypothesesToVerify: [
              'Keterlibatan orang tua dalam validasi berkorelasi positif dengan konsistensi pembiasaan siswa.',
            ],
            actionableRecommendations: [
              'Fasilitasi forum peer sharing antar-kepala sekolah (MKKS) untuk replikasi praktik baik.',
              'Jadwalkan pendampingan supervisi klinis ke satuan pendidikan dengan kategori perlu penguatan.',
              'Tingkatkan keterlibatan paguyuban orang tua dalam pemantauan jurnal anak di rumah.',
            ],
          });
        }
      }
    } catch {
      setAiSupervisorResult({
        recordedFacts: [
          `Satuan pendidikan binaan: ${totalSchoolsCount} sekolah, ${totalStudentsCount} peserta didik, rata-rata kelengkapan ${avgCompleteness}%.`,
        ],
        habitPatterns: [
          totalSchoolsCount === 0 || schoolsWithMetrics.length === 0
            ? 'Pola pembiasaan belum terbentuk (menunggu entri data satuan pendidikan).'
            : 'Konsistensi pembiasaan terpantau berbasis data sinkronisasi sekolah.',
        ],
        dataLimitations: ['Ketergantungan pada kelengkapan sinkronisasi data Dapodik/lokal.'],
        hypothesesToVerify: ['Kesiapan sarana pendukung digital di satuan pendidikan binaan.'],
        actionableRecommendations: ['Lakukan kunjungan supervisi dan koordinasi aktivasi akun satuan pendidikan.'],
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Supervisor Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-800 text-white flex items-center justify-center text-2xl shadow-sm">
            🧭
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                Dashboard Pengawas Pembina • Wilayah Binaan
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
                {totalSchoolsCount} Satuan Pendidikan
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                IAM Mandiri Terverifikasi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pengawas: <strong>{currentPersona?.name || 'Pengawas Pembina'}</strong> (NIP: {currentPersona?.identifierValue || '-'}) • Wilayah Pembinaan Satuan Pendidikan
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => {
                  syncAllData();
                  showToast('Data sekolah binaan berhasil diperbarui!');
                }}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                title="Perbarui data sekolah binaan"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Perbarui Data'}</span>
              </button>
              <span className="text-[11px] text-slate-400">
                Pembaruan terakhir: {lastSyncTime}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('REGIONAL_OVERVIEW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'REGIONAL_OVERVIEW' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600'
            }`}
          >
            Ringkasan Wilayah
          </button>
          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'COMPARISON' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600'
            }`}
          >
            Komparasi {totalSchoolsCount} Sekolah
          </button>
          <button
            onClick={() => setActiveTab('MONITORING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MONITORING' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600'
            }`}
          >
            Portofolio 7KAIH
          </button>
          <button
            onClick={() => setActiveTab('RTL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'RTL' ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-600'
            }`}
          >
            RTL Pengawasan ({totalActiveRtl})
          </button>
          <button
            onClick={() => {
              setActiveTab('AI_REGIONAL');
              if (!aiSupervisorResult) handleGenerateSupervisorAi();
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'AI_REGIONAL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-700 bg-indigo-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Analisis Wilayah</span>
          </button>
        </div>
      </div>

      {activeTab === 'REGIONAL_OVERVIEW' && (
        <div className="space-y-6">
          {/* 5 Quick Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Satuan Pendidikan Binaan
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalSchoolsCount} Sekolah</div>
              <p className="text-[11px] text-slate-500 mt-1">
                {totalSchoolsCount === 0
                  ? 'Default 0 (Belum ada data)'
                  : `${goodStatusCount} Terpantau • ${unupdatedStatusCount > 0 ? `${unupdatedStatusCount} Belum Ada Data` : `${warningStatusCount} Penguatan`}`}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Siswa Binaan
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalStudentsCount} Siswa</div>
              <p className="text-[11px] text-slate-500 mt-1">
                {totalStudentsCount === 0 && totalTeachersCount === 0
                  ? 'Default 0 (Belum ada data)'
                  : `${totalTeachersCount} Tenaga Pendidik`}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Rata-rata Kelengkapan
              </span>
              <div className="text-2xl font-black text-[#0753A5] mt-1">{avgCompleteness}%</div>
              <p className={`text-[11px] font-semibold mt-1 ${avgCompleteness >= 80 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {avgCompleteness >= 80
                  ? 'Target tercapai (>80%)'
                  : avgCompleteness > 0
                  ? 'Perlu ditingkatkan'
                  : 'Default 0 (Belum ada data)'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Rata-rata Konsistensi
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{avgConsistency}%</div>
              <p className="text-[11px] text-slate-500 mt-1">
                {avgConsistency >= 80
                  ? 'Kategori pembiasaan baik'
                  : avgConsistency > 0
                  ? 'Perlu pendampingan'
                  : 'Default 0 (Belum ada data)'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                RTL Wilayah Aktif
              </span>
              <div className="text-2xl font-black text-indigo-700 mt-1">{totalActiveRtl} RTL</div>
              <p className="text-[11px] text-slate-500 mt-1">
                {totalActiveRtl > 0 ? 'Dalam pemantauan supervisi' : 'Default 0 (Belum ada RTL)'}
              </p>
            </div>
          </div>

          {/* Search and filter controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari sekolah binaan, NPSN, atau nama kepala sekolah..."
                className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Jenjang:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                {(['ALL', 'SD', 'SMP', 'SMA'] as const).map((j) => (
                  <button
                    key={j}
                    onClick={() => setFilterJenjang(j)}
                    className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filterJenjang === j ? 'bg-white text-[#0753A5] shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {j === 'ALL' ? 'Semua' : j}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* School List Cards synchronized with live Master */}
          {filteredSchools.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto text-2xl">
                🏫
              </div>
              <h3 className="text-base font-black text-slate-900">
                {searchQuery || filterJenjang !== 'ALL'
                  ? 'Sekolah Tidak Ditemukan'
                  : 'Belum Ada Satuan Pendidikan Binaan Terdata'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {searchQuery || filterJenjang !== 'ALL'
                  ? 'Tidak ada satuan pendidikan binaan yang sesuai dengan filter pencarian atau jenjang.'
                  : 'Belum ada data sekolah yang didaftarkan oleh Super Admin atau diperbarui oleh Admin Sekolah. Semua indikator diset ke default 0.'}
              </p>
              {searchQuery || filterJenjang !== 'ALL' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterJenjang('ALL');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Reset Filter</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    syncAllData();
                    showToast('Data diperbarui dari sistem.');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0753A5] text-xs font-bold transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Periksa Pembaruan Data</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSchools.map((s) => (
                <div
                  key={s.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base">
                        🏫
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{s.name}</h3>
                        <p className="text-[11px] text-slate-500">
                          NPSN: <strong>{s.npsn}</strong> • {s.schoolStatus} • Akreditasi {s.akreditasi}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        s.status === 'TERPANTAU_BAIK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'BELUM_ADA_DATA'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.status === 'TERPANTAU_BAIK'
                        ? 'Terpantau Baik'
                        : s.status === 'BELUM_ADA_DATA'
                        ? 'Belum Ada Data (0)'
                        : 'Perlu Penguatan'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-2xl">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Kelengkapan</span>
                      <p className="font-bold text-[#0753A5] text-sm mt-0.5">{s.completeness}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Konsistensi</span>
                      <p className="font-bold text-emerald-700 text-sm mt-0.5">{s.consistency}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">RTL Aktif</span>
                      <p className="font-bold text-indigo-700 text-sm mt-0.5">{s.activeRtl} Rencana</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>Kepala Sekolah: <strong>{s.headmaster}</strong></div>
                    <div className="text-[11px] text-slate-500">Fokus Pembiasaan: <span className="font-semibold text-amber-800">{s.priorityHabit}</span></div>
                    {s.supervisionNote && (
                      <div className="text-[11px] text-blue-900 bg-blue-50/70 p-2 rounded-xl border border-blue-100 italic">
                        &quot;{s.supervisionNote}&quot;
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>{s.students} Siswa • {s.teachers} Guru • {s.classes} Rombel</span>
                    <button
                      onClick={() => handleOpenSchoolModal(s)}
                      className="font-bold text-[#0753A5] hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 px-3 py-1 rounded-xl"
                    >
                      <span>Beri Catatan Supervisi</span>
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'COMPARISON' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Matriks Komparasi {totalSchoolsCount} Satuan Pendidikan Binaan
              </h3>
              <p className="text-xs text-slate-500">
                Data teragregasi langsung dari Master Super Admin & Entri Admin Sekolah
              </p>
            </div>
            <button
              onClick={handleExportRegionalCsv}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Ekspor Matriks Wilayah (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Nama Sekolah</th>
                  <th className="py-3 px-3">NPSN</th>
                  <th className="py-3 px-3">Kepala Sekolah</th>
                  <th className="py-3 px-3">Peserta Didik</th>
                  <th className="py-3 px-3">Kelengkapan</th>
                  <th className="py-3 px-3">Konsistensi</th>
                  <th className="py-3 px-3">Status Monitoring</th>
                  <th className="py-3 px-3">RTL Aktif</th>
                  <th className="py-3 px-3 text-center">Aksi Supervisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fosterSchools.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <School className="w-8 h-8 text-slate-300" />
                        <span className="text-xs font-bold text-slate-700">Belum Ada Satuan Pendidikan Binaan</span>
                        <span className="text-[11px] text-slate-400 max-w-sm">
                          Semua metrik komparasi wilayah diset ke default 0 menunggu pendaftaran satuan pendidikan oleh Super Admin dan pembaruan oleh Admin Sekolah.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  fosterSchools.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <button
                          onClick={() => handleOpenSchoolModal(s)}
                          className="text-left font-bold text-slate-900 hover:text-[#0753A5] transition-colors cursor-pointer"
                        >
                          {s.name}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{s.npsn}</td>
                      <td className="py-3 px-3 text-slate-600">{s.headmaster}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{s.students} Anak</td>
                      <td className="py-3 px-3 font-bold text-[#0753A5]">{s.completeness}%</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">{s.consistency}%</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'TERPANTAU_BAIK'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'BELUM_ADA_DATA'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status === 'TERPANTAU_BAIK'
                            ? 'Terpantau Baik'
                            : s.status === 'BELUM_ADA_DATA'
                            ? 'Belum Ada Data (0)'
                            : 'Perlu Penguatan'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{s.activeRtl} Rencana</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenSchoolModal(s)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-[#0753A5] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Supervisi</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Prinsip Supervisi: Komparasi bertujuan kolaborasi antar-sekolah (peer sharing), bukan kompetisi diskriminatif.</span>
          </div>
        </div>
      )}

      {activeTab === 'MONITORING' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Portofolio Distribusi 7 Kebiasaan Lintas Satuan Pendidikan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Agregat pencapaian 7 dimensi kebiasaan lintas {totalSchoolsCount} sekolah binaan ({totalStudentsCount} siswa).
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-[#0753A5]">
              {totalStudentsCount} Siswa Terpantau
            </span>
          </div>

          {/* Habit Distribution Grid using live habitAverages without artificial offsets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { code: 'WAKE_EARLY', label: 'Bangun Pagi', icon: '🌅', avg: habitAverages.wakeEarly },
              { code: 'WORSHIP', label: 'Beribadah', icon: '🕌', avg: habitAverages.worship },
              { code: 'EXERCISE', label: 'Berolahraga', icon: '🏃', avg: habitAverages.exercise },
              { code: 'HEALTHY_EATING', label: 'Makan Sehat', icon: '🥗', avg: habitAverages.healthyEat },
              { code: 'LEARNING', label: 'Gemar Belajar', icon: '📚', avg: habitAverages.learning },
              { code: 'SOCIAL', label: 'Bermasyarakat', icon: '🤝', avg: habitAverages.social },
              { code: 'SLEEP_EARLY', label: 'Tidur Cepat', icon: '🌙', avg: habitAverages.sleepEarly },
            ].map((hab) => {
              const status =
                hab.avg === 0
                  ? 'Belum Ada Data'
                  : hab.avg >= 85
                  ? 'Kuat'
                  : hab.avg >= 70
                  ? 'Penguatan'
                  : 'Prioritas Wilayah';
              return (
                <div key={hab.code} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{hab.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        status === 'Kuat'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'Penguatan'
                          ? 'bg-amber-100 text-amber-800'
                          : status === 'Belum Ada Data'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-2">{hab.label}</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{hab.avg}%</div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {totalSchoolsCount === 0 ? 'Default 0 (Belum ada sekolah)' : `Rata-rata ${totalSchoolsCount} sekolah binaan`}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Cross-School 7 Habit Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/60">
                  <th className="py-3 px-3">Satuan Pendidikan</th>
                  <th className="py-3 px-2 text-center">🌅 Pagi</th>
                  <th className="py-3 px-2 text-center">🕌 Ibadah</th>
                  <th className="py-3 px-2 text-center">🏃 Olahraga</th>
                  <th className="py-3 px-2 text-center">🥗 Makan</th>
                  <th className="py-3 px-2 text-center">📚 Belajar</th>
                  <th className="py-3 px-2 text-center">🤝 Sosial</th>
                  <th className="py-3 px-2 text-center">🌙 Tidur</th>
                  <th className="py-3 px-3 text-center">Rata-rata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fosterSchools.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <BookOpen className="w-8 h-8 text-slate-300" />
                        <span className="text-xs font-bold text-slate-700">Belum Ada Portofolio 7KAIH Terdata</span>
                        <span className="text-[11px] text-slate-400 max-w-sm">
                          Semua capaian dimensi pembiasaan saat ini default 0% karena data belum diinput oleh Super Admin dan Admin Sekolah.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  fosterSchools.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NPSN: {s.npsn} • {s.students} Siswa</div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{s.habits.wakeEarly}%</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{s.habits.worship}%</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{s.habits.exercise}%</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{s.habits.healthyEat}%</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{s.habits.learning}%</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{s.habits.social}%</td>
                      <td className="py-3 px-2 text-center font-bold text-amber-700">{s.habits.sleepEarly}%</td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-black text-[#0753A5]">{s.consistency}%</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'RTL' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Rencana Tindak Lanjut (RTL) Supervisi & Pendampingan Wilayah
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Program intervensi klinis pengawas pembina dalam mendampingi kepala sekolah dan forum K3S/MKKS.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Agenda Supervisi Aktif
            </span>
          </div>

          <div className="space-y-4">
            {fosterSchools.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">Belum Ada Agenda Supervisi / RTL (Default 0)</h4>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Agenda RTL supervisi akan aktif otomatis setelah satuan pendidikan binaan didaftarkan oleh Super Admin dan diperbarui oleh Admin Sekolah.
                </p>
              </div>
            ) : (
              fosterSchools.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Supervisi Pembiasaan: {s.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          s.activeRtl > 0
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {s.activeRtl > 0 ? `${s.activeRtl} RTL Aktif` : '0 RTL Aktif (Default 0)'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#0753A5]">
                        Fokus: {s.priorityHabit}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Kepala Sekolah: <strong className="text-slate-800">{s.headmaster}</strong>
                    </span>
                  </div>

                  {s.schoolFollowUps && s.schoolFollowUps.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {s.schoolFollowUps.map((f: FollowUpPlan) => (
                        <div key={f.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>{f.finding}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#0753A5] border border-blue-100">
                              {f.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">{f.actionPlan}</p>
                          <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100">
                            <span>Target: <strong className="text-slate-600">{f.target}</strong></span>
                            <span>PJ: <strong className="text-slate-600">{f.owner}</strong></span>
                            <span>Progres: <strong className="text-emerald-600">{f.progressPercent}%</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      {s.supervisionNote
                        ? `Catatan aktif pengawas: "${s.supervisionNote}"`
                        : `Belum ada agenda RTL yang diinput oleh Admin Sekolah atau Guru untuk satuan pendidikan ini (Default 0).`}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Status Capaian:</span>
                      <strong className="text-[#0753A5]">{s.completeness}% Kelengkapan</strong>
                      <span className="text-slate-300">•</span>
                      <strong className="text-emerald-700">{s.consistency}% Konsistensi</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenSchoolModal(s)}
                        className="px-3 py-1 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                      >
                        Beri / Ubah Catatan Supervisi
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'AI_REGIONAL' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Analisis AI Supervisi Wilayah Binaan
                </h3>
                <p className="text-xs text-slate-500">
                  Rekomendasi tindak lanjut pembinaan manajerial dan akademik berbasis {totalSchoolsCount} sekolah binaan.
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateSupervisorAi}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiLoading ? 'Menyusun Analisis...' : 'Perbarui Analisis'}</span>
            </button>
          </div>

          {aiSupervisorResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                <h4 className="text-xs font-bold text-[#0753A5] uppercase tracking-wider">
                  📋 1. Fakta yang Tercatat
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {aiSupervisorResult.recordedFacts?.map((f: string, i: number) => <li key={i}>{f}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  🔍 2. Pola Wilayah
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {aiSupervisorResult.habitPatterns?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  ⚠️ 3. Keterbatasan Data
                </h4>
                <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
                  {aiSupervisorResult.dataLimitations?.map((l: string, i: number) => <li key={i}>{l}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  ❓ 4. Hipotesis untuk Diverifikasi
                </h4>
                <ul className="list-disc list-inside text-xs text-purple-900 space-y-1">
                  {aiSupervisorResult.hypothesesToVerify?.map((h: string, i: number) => <li key={i}>{h}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  💡 5. Rekomendasi Supervisi Wilayah
                </h4>
                <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1.5">
                  {aiSupervisorResult.actionableRecommendations?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clinical Supervision Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Supervisi Klinis & Manajerial Satuan Pendidikan
                </span>
                <h3 className="text-lg font-black mt-1">{selectedSchool.name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Kepala Sekolah: {selectedSchool.headmaster} ({selectedSchool.headmasterNip}) • {selectedSchool.students} Siswa • NPSN {selectedSchool.npsn}
                </p>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Kelengkapan</span>
                  <span className="text-base font-black text-[#0753A5]">{selectedSchool.completeness}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Konsistensi</span>
                  <span className="text-base font-black text-emerald-700">{selectedSchool.consistency}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">RTL Berjalan</span>
                  <span className="text-base font-black text-indigo-700">{selectedSchool.activeRtl} Rencana</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Fokus Penguatan</span>
                  <span className="text-xs font-black text-amber-800 mt-1 block truncate">{selectedSchool.priorityHabit}</span>
                </div>
              </div>

              {/* Supervision Form */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Catatan Supervisi Klinis & RTL Pembinaan Pengawas:
                </label>
                <textarea
                  rows={4}
                  value={currentNoteInput}
                  onChange={(e) => setCurrentNoteInput(e.target.value)}
                  placeholder="Tuliskan arahan pembinaan, strategi kolaborasi antar-sekolah (peer sharing), atau catatan tindak lanjut..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-blue-500 bg-slate-50/50 resize-none leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-900 leading-relaxed flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Catatan ini tersimpan dan tersinkronisasi sebagai panduan kepala sekolah dalam merumuskan RTL sekolah binaan.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedSchool(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSupervisionNote}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simpan Catatan Supervisi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
