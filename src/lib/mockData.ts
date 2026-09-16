// ============================================================================
// SI-7KAIH AI - Seed Fixtures & Default Data
// ============================================================================

import {
  DailyJournal,
  HabitCode,
  SchoolProgram,
  FollowUpPlan,
  Badge,
  StudentMonthlyReflection,
  ParentMonthlyReflection,
  DailyHabitEntry,
} from '../../packages/types/src/index';

export const DEFAULT_BADGES: Badge[] = [
  {
    id: 'badge-01',
    code: 'STREAK_7',
    title: 'Konsisten 7 Hari',
    description: 'Mencatat jurnal harian 7 hari berturut-turut.',
    iconName: 'Flame',
  },
  {
    id: 'badge-02',
    code: 'EARLY_BIRD',
    title: 'Bangun Pagi Hebat',
    description: 'Bangun pagi segar dan bersemangat selama 14 hari.',
    iconName: 'SunMedium',
  },
  {
    id: 'badge-03',
    code: 'HEALTHY_CHAMP',
    title: 'Sahabat Sehat',
    description: 'Sarapan bernutrisi, makan buah/sayur, dan minum air cukup 14 hari.',
    iconName: 'Apple',
  },
  {
    id: 'badge-04',
    code: 'ACTIVE_MOVER',
    title: 'Aktif Bergerak',
    description: 'Berolahraga dan aktivitas fisik menyenangkan secara konsisten.',
    iconName: 'Activity',
  },
  {
    id: 'badge-05',
    code: 'CURIOUS_READER',
    title: 'Pembelajar Hebat',
    description: 'Gemar membaca buku dan menemukan hal baru secara mandiri.',
    iconName: 'BookOpenCheck',
  },
  {
    id: 'badge-06',
    code: 'HELPING_HAND',
    title: 'Peduli Sesama',
    description: 'Melakukan kebaikan, membantu sesama, dan gotong royong.',
    iconName: 'Heart',
  },
];

/**
 * Hitung status pembukaan lencana secara dinamis dari data jurnal harian aktual.
 * Jika belum ada data jurnal atau belum memenuhi kriteria, seluruh lencana berstatus TERKUNCI (earnedAt: undefined).
 */
export const calculateBadgesFromJournals = (
  journals: DailyJournal[] = [],
  baseBadges: Badge[] = DEFAULT_BADGES
): Badge[] => {
  if (!journals || journals.length === 0) {
    return baseBadges.map((b) => ({
      ...b,
      earnedAt: undefined,
    }));
  }

  const getJournalDate = (j: DailyJournal): string => j.journalDate || (j as unknown as { date?: string }).date || '';

  // Urutkan tanggal jurnal kronologis menaik
  const sorted = [...journals].sort((a, b) => getJournalDate(a).localeCompare(getJournalDate(b)));

  // 1. STREAK_7: Minimal 7 entri jurnal tercatat
  let streak7Date: string | undefined = undefined;
  if (sorted.length >= 7) {
    streak7Date = getJournalDate(sorted[6]);
  }

  // Hitung jumlah ketercapaian per dimensi kebiasaan
  const countHabit = (habitCode: HabitCode): { count: number; dateOfThreshold?: string } => {
    let count = 0;
    let dateOfThreshold: string | undefined = undefined;
    for (const j of sorted) {
      if (j.entries && j.entries[habitCode]?.completed) {
        count++;
        if (count === 14 && !dateOfThreshold) {
          dateOfThreshold = getJournalDate(j);
        }
      }
    }
    return { count, dateOfThreshold };
  };

  const wakeEarly = countHabit('WAKE_EARLY');
  const healthyEating = countHabit('HEALTHY_EATING');
  const exercise = countHabit('EXERCISE');
  const learning = countHabit('LEARNING');
  const social = countHabit('SOCIAL');

  return baseBadges.map((badge) => {
    let earnedAt: string | undefined = undefined;
    const latestDate = sorted.length > 0 ? getJournalDate(sorted[sorted.length - 1]) : undefined;

    switch (badge.code) {
      case 'STREAK_7':
        earnedAt = streak7Date;
        break;
      case 'EARLY_BIRD':
        if (wakeEarly.count >= 14) earnedAt = wakeEarly.dateOfThreshold || latestDate;
        break;
      case 'HEALTHY_CHAMP':
        if (healthyEating.count >= 14) earnedAt = healthyEating.dateOfThreshold || latestDate;
        break;
      case 'ACTIVE_MOVER':
        if (exercise.count >= 14) earnedAt = exercise.dateOfThreshold || latestDate;
        break;
      case 'CURIOUS_READER':
        if (learning.count >= 14) earnedAt = learning.dateOfThreshold || latestDate;
        break;
      case 'HELPING_HAND':
        if (social.count >= 14) earnedAt = social.dateOfThreshold || latestDate;
        break;
      default:
        earnedAt = undefined;
    }

    return {
      ...badge,
      earnedAt,
    };
  });
};

export const DEFAULT_PROGRAMS: SchoolProgram[] = [
  {
    id: 'prog-01',
    schoolId: 's-smp-01',
    title: 'Senam Bersama Ceria & Kebugaran Remaja',
    description: 'Senam kesegaran jasmani dan gerak ceria setiap Selasa & Jumat pagi di lapangan sekolah.',
    habitCode: 'EXERCISE',
    participantScope: 'Seluruh Siswa Kelas 7 - 9 (Fase D)',
    schedule: 'Selasa & Jumat 06:45 - 07:15',
    pic: 'Pak Ahmad Fauzi, S.Pd.',
    startDate: '2025-08-01',
    evidenceCount: 8,
    resultNote: 'Tercatat antusiasme siswa meningkat dan kehadiran pagi lebih disiplin.',
    isActive: true,
  },
  {
    id: 'prog-02',
    schoolId: 's-smp-01',
    title: 'Jumat Bersih, Peduli Lingkungan & Berbagi',
    description: 'Aksi gotong royong membersihkan kelas serta berbagi bekal sehat antar siswa.',
    habitCode: 'SOCIAL',
    participantScope: 'Fase D (Kelas 7, 8, dan 9)',
    schedule: 'Setiap Jumat 07:30 - 08:30',
    pic: 'Ibu Dewi Kartika, M.Pd.',
    startDate: '2025-08-01',
    evidenceCount: 5,
    resultNote: 'Kerjasama tim dan kepedulian lingkungan kelas terbukti semakin erat.',
    isActive: true,
  },
  {
    id: 'prog-03',
    schoolId: 's-smp-01',
    title: '15 Menit Literasi Mandiri & Membaca Senyap',
    description: 'Membaca buku pengayaan, sains, biografi dan sastra di pojok baca kelas.',
    habitCode: 'LEARNING',
    participantScope: 'Seluruh Siswa Fase D',
    schedule: 'Senin - Kamis 07:00 - 07:15',
    pic: 'Drs. H. Mulyono, M.M.',
    startDate: '2025-08-01',
    evidenceCount: 12,
    resultNote: 'Tingkat kunjungan perpustakaan dan buku yang diselesaikan meningkat.',
    isActive: true,
  },
  {
    id: 'prog-04',
    schoolId: 's-smp-01',
    title: 'Kantin Sehat & Buah Ceria',
    description: 'Penyediaan buah potong segar dan edukasi jajanan sehat bergizi seimbang remaja.',
    habitCode: 'HEALTHY_EATING',
    participantScope: 'Seluruh Warga Sekolah',
    schedule: 'Setiap Hari Sekolah',
    pic: 'Koordinator UKS',
    startDate: '2025-08-01',
    evidenceCount: 6,
    resultNote: 'Konsumsi makanan bergizi dan air mineral di sekolah terpantau baik.',
    isActive: true,
  },
];

export const DEFAULT_FOLLOW_UPS: FollowUpPlan[] = [
  {
    id: 'rtl-01',
    schoolId: 's-smp-01',
    finding: 'Pembiasaan Tidur Cepat di Kelas 7-A masih memerlukan pendampingan waktu istirahat malam.',
    supportingData: 'Sebanyak 35% siswa tercatat tidur di atas pukul 22:00 pada hari sekolah.',
    rootCause: 'Penggunaan gawai tanpa pengawasan menjelang tidur malam.',
    rootCauseType: 'HYPOTHESIS_TO_VERIFY',
    actionPlan: 'Sosialisasi "Gerakan 30 Menit Bebas Gawai Sebelum Tidur" melalui komite paguyuban kelas.',
    target: '85% siswa kelas 7-A tidur sebelum pukul 21:30.',
    indicator: 'Peningkatan konsistensi tidur cepat sebesar +18 poin persentase.',
    owner: 'Guru Kelas 7-A & Komite Orang Tua',
    startDate: '2025-08-15',
    deadline: '2025-09-30',
    progressPercent: 65,
    status: 'ON_TRACK',
    createdAt: '2025-08-15',
    updatedAt: '2025-09-01',
  },
  {
    id: 'rtl-02',
    schoolId: 's-smp-01',
    finding: 'Kelengkapan pencatatan jurnal harian di Fase D hari Sabtu-Minggu lebih rendah dibanding hari kerja.',
    supportingData: 'Kelengkapan jurnal akhir pekan rata-rata 58%, hari kerja 92%.',
    rootCause: 'Orang tua dan siswa mengira pencatatan jurnal hanya berlaku saat hari masuk sekolah.',
    rootCauseType: 'FACT',
    actionPlan: 'Edukasi bahwa 7 Kebiasaan Anak Indonesia Hebat berlangsung 7 hari seminggu di rumah.',
    target: 'Kelengkapan jurnal akhir pekan mencapai minimal 80%.',
    indicator: 'Kenaikan kelengkapan data akhir pekan sebesar +22 poin persentase.',
    owner: 'Tim Kesiswaan & Guru Wali Kelas',
    startDate: '2025-08-20',
    deadline: '2025-10-15',
    progressPercent: 45,
    status: 'ACTIVE',
    createdAt: '2025-08-20',
    updatedAt: '2025-09-02',
  },
];

export const DEFAULT_STUDENT_REFLECTION: StudentMonthlyReflection = {
  id: '',
  studentId: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  easiestHabit: 'WAKE_EARLY',
  hardestHabit: 'SLEEP_EARLY',
  rootCause: '',
  actionPlan: '',
  nextMonthTarget: '',
  aiSuggestedTarget: '',
  createdAt: new Date().toISOString(),
};

export const DEFAULT_PARENT_REFLECTION: ParentMonthlyReflection = {
  id: '',
  studentId: '',
  parentId: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  observedChange: '',
  difficulty: '',
  familySupport: '',
  parentNote: '',
  nextMonthSupport: '',
  createdAt: new Date().toISOString(),
};

// Generate 30 days of synthetic journal history for Budi Pratama
export function generateSyntheticJournals(studentId: string, schoolId: string): DailyJournal[] {
  const journals: DailyJournal[] = [];
  const habitsList: HabitCode[] = [
    'WAKE_EARLY',
    'WORSHIP',
    'EXERCISE',
    'HEALTHY_EATING',
    'LEARNING',
    'SOCIAL',
    'SLEEP_EARLY',
  ];

  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Seed realistic pattern: High consistency on wake, worship, healthy eating, learning
    // Slightly more variable on exercise & sleep early
    const entries: Record<HabitCode, DailyHabitEntry> = {} as Record<HabitCode, DailyHabitEntry>;
    let completedCount = 0;

    habitsList.forEach((code) => {
      // Deterministic pseudo-randomness based on date and code
      const seedVal = (d.getDate() * 7 + code.length * 3 + i) % 10;
      let completed = true;
      if (code === 'SLEEP_EARLY' && seedVal > 6) completed = false;
      if (code === 'EXERCISE' && seedVal > 7) completed = false;
      if (code === 'SOCIAL' && seedVal > 8) completed = false;

      if (completed) completedCount++;

      entries[code] = {
        id: `entry-${dateStr}-${code}`,
        dailyJournalId: `journal-${dateStr}`,
        habitId: `b1000000-0000-0000-0000-00000000000${habitsList.indexOf(code) + 1}`,
        habitCode: code,
        completed,
        data: {
          completed,
          optionalNote: completed ? 'Alhamdulillah terlaksana dengan baik.' : '',
        },
        validationStatus: i > 2 ? 'VALIDATED' : i === 1 ? 'PENDING' : 'PENDING',
        parentValidated: i > 2,
        teacherValidated: i > 3,
        createdAt: `${dateStr}T19:30:00Z`,
        updatedAt: `${dateStr}T20:00:00Z`,
      };
    });

    journals.push({
      id: `journal-${dateStr}`,
      studentId,
      schoolId,
      journalDate: dateStr,
      status: completedCount >= 6 ? 'SUBMITTED_COMPLETED' : 'SUBMITTED_NOT_COMPLETED',
      completedCount,
      entries,
      createdAt: `${dateStr}T19:30:00Z`,
      updatedAt: `${dateStr}T20:00:00Z`,
    });
  }

  return journals;
}
