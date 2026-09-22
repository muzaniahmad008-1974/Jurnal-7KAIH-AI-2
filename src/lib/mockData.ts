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
    code: 'STREAK_3',
    title: 'Langkah Awal Hebat',
    description: 'Mencatat jurnal pembiasaan harian minimal 3 hari aktif.',
    iconName: 'Sparkles',
    category: 'STREAK',
    targetCount: 3,
    criteriaDescription: 'Mencatat jurnal pembiasaan aktif minimal 3 hari.',
  },
  {
    id: 'badge-02',
    code: 'STREAK_7',
    title: 'Konsisten 7 Hari',
    description: 'Mencatat jurnal pembiasaan harian minimal 7 hari aktif.',
    iconName: 'Flame',
    category: 'STREAK',
    targetCount: 7,
    criteriaDescription: 'Mencatat jurnal pembiasaan aktif minimal 7 hari.',
  },
  {
    id: 'badge-03',
    code: 'DEVOUT_SPIRIT',
    title: 'Pribadi Beriman',
    description: 'Melaksanakan ibadah tepat waktu dan bersyukur minimal 14 hari.',
    iconName: 'Sparkles',
    habitCode: 'WORSHIP',
    category: 'HABIT',
    targetCount: 14,
    criteriaDescription: 'Melaksanakan ibadah sesuai agama & bersyukur minimal 14 hari.',
  },
  {
    id: 'badge-04',
    code: 'EARLY_BIRD',
    title: 'Bangun Pagi Hebat',
    description: 'Bangun pagi segar dan bersemangat minimal 14 hari.',
    iconName: 'SunMedium',
    habitCode: 'WAKE_EARLY',
    category: 'HABIT',
    targetCount: 14,
    criteriaDescription: 'Bangun pagi sebelum fajar/tepat waktu minimal 14 hari.',
  },
  {
    id: 'badge-05',
    code: 'ACTIVE_MOVER',
    title: 'Aktif Bergerak',
    description: 'Berolahraga dan aktivitas fisik menyenangkan minimal 14 hari.',
    iconName: 'Activity',
    habitCode: 'EXERCISE',
    category: 'HABIT',
    targetCount: 14,
    criteriaDescription: 'Olahraga/aktivitas fisik minimal 15 menit selama 14 hari.',
  },
  {
    id: 'badge-06',
    code: 'HEALTHY_CHAMP',
    title: 'Sahabat Sehat',
    description: 'Sarapan bernutrisi, makan buah/sayur, dan minum air cukup 14 hari.',
    iconName: 'Apple',
    habitCode: 'HEALTHY_EATING',
    category: 'HABIT',
    targetCount: 14,
    criteriaDescription: 'Sarapan bergizi dan makan buah/sayur minimal 14 hari.',
  },
  {
    id: 'badge-07',
    code: 'CURIOUS_READER',
    title: 'Pembelajar Hebat',
    description: 'Gemar membaca buku dan belajar hal baru secara mandiri 14 hari.',
    iconName: 'BookOpenCheck',
    habitCode: 'LEARNING',
    category: 'HABIT',
    targetCount: 14,
    criteriaDescription: 'Membaca buku literasi/belajar mandiri minimal 14 hari.',
  },
  {
    id: 'badge-08',
    code: 'HELPING_HAND',
    title: 'Peduli Sesama',
    description: 'Melakukan kebaikan, membantu orang tua/sesama, dan gotong royong 14 hari.',
    iconName: 'Heart',
    habitCode: 'SOCIAL',
    category: 'HABIT',
    targetCount: 14,
    criteriaDescription: 'Berbuat baik, gotong royong, atau bantu sesama minimal 14 hari.',
  },
  {
    id: 'badge-09',
    code: 'DISCIPLINED_REST',
    title: 'Istirahat Teratur',
    description: 'Tidur cepat tepat waktu sebelum 21:30 dan istirahat cukup 14 hari.',
    iconName: 'Moon',
    habitCode: 'SLEEP_EARLY',
    category: 'HABIT',
    targetCount: 14,
    criteriaDescription: 'Tidur sebelum 21:30 & istirahat berkualitas minimal 14 hari.',
  },
  {
    id: 'badge-10',
    code: 'GOLDEN_HABIT_21',
    title: 'Karakter Emas 21 Hari',
    description: 'Konsistensi pembiasaan 7 kebiasaan selama 21 hari pembentukan karakter.',
    iconName: 'Trophy',
    category: 'MILESTONE',
    targetCount: 21,
    criteriaDescription: 'Mencapai minimal 5 dari 7 kebiasaan tuntas selama 21 hari.',
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
  const getJournalDate = (j: DailyJournal): string => j.journalDate || (j as unknown as { date?: string }).date || '';

  // Filter jurnal unik berdasarkan tanggal untuk menghindari duplikasi
  const uniqueDateMap = new Map<string, DailyJournal>();
  if (Array.isArray(journals)) {
    journals.forEach((j) => {
      const d = getJournalDate(j);
      if (d && (!uniqueDateMap.has(d) || (j.updatedAt && (!uniqueDateMap.get(d)?.updatedAt || j.updatedAt > (uniqueDateMap.get(d)?.updatedAt || ''))))) {
        uniqueDateMap.set(d, j);
      }
    });
  }

  const sorted = Array.from(uniqueDateMap.values()).sort((a, b) =>
    getJournalDate(a).localeCompare(getJournalDate(b))
  );

  const totalDays = sorted.length;
  const latestDate = totalDays > 0 ? getJournalDate(sorted[totalDays - 1]) : undefined;

  // 1. Streak 3 hari
  const streak3Date = totalDays >= 3 ? getJournalDate(sorted[2]) : undefined;
  // 2. Streak 7 hari
  const streak7Date = totalDays >= 7 ? getJournalDate(sorted[6]) : undefined;

  // Helper untuk mengecek keterlaksanaan kebiasaan
  const isHabitCompleted = (j: DailyJournal, code: HabitCode): boolean => {
    const raw = j as any;
    const entry = (j.entries && j.entries[code]) || (raw.habits && raw.habits[code]);
    if (!entry) return raw[code] === true;
    return !!(entry.completed || entry.status === 'COMPLETED' || raw[code] === true);
  };

  // Hitung jumlah ketercapaian per dimensi kebiasaan
  const countHabit = (habitCode: HabitCode, targetDays = 14): { count: number; dateOfThreshold?: string } => {
    let count = 0;
    let dateOfThreshold: string | undefined = undefined;
    for (const j of sorted) {
      if (isHabitCompleted(j, habitCode)) {
        count++;
        if (count === targetDays && !dateOfThreshold) {
          dateOfThreshold = getJournalDate(j);
        }
      }
    }
    return { count, dateOfThreshold };
  };

  const worship = countHabit('WORSHIP', 14);
  const wakeEarly = countHabit('WAKE_EARLY', 14);
  const exercise = countHabit('EXERCISE', 14);
  const healthyEating = countHabit('HEALTHY_EATING', 14);
  const learning = countHabit('LEARNING', 14);
  const social = countHabit('SOCIAL', 14);
  const sleepEarly = countHabit('SLEEP_EARLY', 14);

  // Hitung hari dengan minimal 5 kebiasaan tuntas (Karakter Emas 21 Hari)
  let daysWith5Plus = 0;
  let dateOfThreshold21: string | undefined = undefined;
  const allCodes: HabitCode[] = ['WAKE_EARLY', 'WORSHIP', 'EXERCISE', 'HEALTHY_EATING', 'LEARNING', 'SOCIAL', 'SLEEP_EARLY'];
  for (const j of sorted) {
    let completedInDay = 0;
    for (const c of allCodes) {
      if (isHabitCompleted(j, c)) completedInDay++;
    }
    if (completedInDay >= 5) {
      daysWith5Plus++;
      if (daysWith5Plus === 21 && !dateOfThreshold21) {
        dateOfThreshold21 = getJournalDate(j);
      }
    }
  }

  return baseBadges.map((badge) => {
    let earnedAt: string | undefined = undefined;
    let currentCount = 0;
    let targetCount = badge.targetCount || 14;

    switch (badge.code) {
      case 'STREAK_3':
        targetCount = 3;
        currentCount = totalDays;
        if (currentCount >= targetCount) earnedAt = streak3Date || latestDate;
        break;
      case 'STREAK_7':
        targetCount = 7;
        currentCount = totalDays;
        if (currentCount >= targetCount) earnedAt = streak7Date || latestDate;
        break;
      case 'DEVOUT_SPIRIT':
        targetCount = 14;
        currentCount = worship.count;
        if (currentCount >= targetCount) earnedAt = worship.dateOfThreshold || latestDate;
        break;
      case 'EARLY_BIRD':
        targetCount = 14;
        currentCount = wakeEarly.count;
        if (currentCount >= targetCount) earnedAt = wakeEarly.dateOfThreshold || latestDate;
        break;
      case 'ACTIVE_MOVER':
        targetCount = 14;
        currentCount = exercise.count;
        if (currentCount >= targetCount) earnedAt = exercise.dateOfThreshold || latestDate;
        break;
      case 'HEALTHY_CHAMP':
        targetCount = 14;
        currentCount = healthyEating.count;
        if (currentCount >= targetCount) earnedAt = healthyEating.dateOfThreshold || latestDate;
        break;
      case 'CURIOUS_READER':
        targetCount = 14;
        currentCount = learning.count;
        if (currentCount >= targetCount) earnedAt = learning.dateOfThreshold || latestDate;
        break;
      case 'HELPING_HAND':
        targetCount = 14;
        currentCount = social.count;
        if (currentCount >= targetCount) earnedAt = social.dateOfThreshold || latestDate;
        break;
      case 'DISCIPLINED_REST':
        targetCount = 14;
        currentCount = sleepEarly.count;
        if (currentCount >= targetCount) earnedAt = sleepEarly.dateOfThreshold || latestDate;
        break;
      case 'GOLDEN_HABIT_21':
        targetCount = 21;
        currentCount = daysWith5Plus;
        if (currentCount >= targetCount) earnedAt = dateOfThreshold21 || latestDate;
        break;
      default:
        // Cek jika badge punya habitCode
        if (badge.habitCode) {
          const res = countHabit(badge.habitCode, targetCount);
          currentCount = res.count;
          if (currentCount >= targetCount) earnedAt = res.dateOfThreshold || latestDate;
        } else {
          currentCount = totalDays;
          if (currentCount >= targetCount) earnedAt = latestDate;
        }
    }

    const progressPercent = Math.min(100, Math.round((currentCount / targetCount) * 100));

    return {
      ...badge,
      targetCount,
      currentCount,
      progressPercent,
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
