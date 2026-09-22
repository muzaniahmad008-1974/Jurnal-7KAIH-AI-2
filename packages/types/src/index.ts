// ============================================================================
// SI-7KAIH AI - Centralized TypeScript Types
// Sistem Jurnal dan Monitoring Tujuh Kebiasaan Anak Indonesia Hebat Berbasis AI
// ============================================================================

export type UserRole =
  | 'STUDENT'
  | 'PARENT'
  | 'TEACHER'
  | 'PRINCIPAL'
  | 'SUPERVISOR'
  | 'SCHOOL_ADMIN'
  | 'SUPER_ADMIN';

export type HabitCode =
  | 'WAKE_EARLY'
  | 'WORSHIP'
  | 'EXERCISE'
  | 'HEALTHY_EATING'
  | 'LEARNING'
  | 'SOCIAL'
  | 'SLEEP_EARLY';

export interface HabitMaster {
  id: string;
  code: HabitCode;
  name: string;
  description: string;
  targetDescription: string;
  iconName: string;
  displayOrder: number;
  isSystemMaster: true;
}

export type JournalStatus =
  | 'NOT_SUBMITTED'
  | 'DRAFT'
  | 'SUBMITTED_COMPLETED'
  | 'SUBMITTED_NOT_COMPLETED'
  | 'PENDING_VALIDATION'
  | 'VALIDATED'
  | 'CORRECTION_REQUESTED';

export type ValidationStatus =
  | 'PENDING'
  | 'VALIDATED'
  | 'CORRECTION_REQUESTED'
  | 'CORRECTED';

// Habitual Status (from 2/3 threshold formula)
export type HabitualStatus = 'SUDAH_TERBIASA' | 'BELUM_TERBIASA';

// Early Warning Internal Category (strictly internal, non-punitive)
export type EarlyWarningCategory =
  | 'TERPANTAU_BAIK'     // >= 6 habits
  | 'PERLU_PENGUATAN'    // 4 - 5 habits
  | 'PERLU_PENDAMPINGAN'; // <= 3 habits

// Root Cause Types for Follow-Up Plans (RTL)
export type RootCauseType =
  | 'FACT'
  | 'INFERENCE'
  | 'HYPOTHESIS_TO_VERIFY';

export type FollowUpStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'ON_TRACK'
  | 'AT_RISK'
  | 'OVERDUE'
  | 'COMPLETED'
  | 'VERIFIED';

// Habit-specific entry payloads
export interface WakeEarlyData {
  completed: boolean;
  wakeTime?: string; // e.g. "05:15"
  mood?: 'SANGAT_SEGAR' | 'SEGAR' | 'BIASA' | 'MENGANTUK';
  optionalNote?: string;
}

export interface WorshipData {
  completed: boolean;
  optionalNote?: string;
  // CRITICAL PRIVACY RULE: No photo evidence, no faith inference.
}

export interface ExerciseData {
  completed: boolean;
  activityType?: string; // e.g. "Jalan Pagi", "Senam", "Bersepeda", "Sepak Bola"
  durationMinutes?: number;
  feeling?: 'SEGAR' | 'LELAH_BAHAGIA' | 'BIASA' | 'LEMAS';
  optionalNote?: string;
}

export interface HealthyEatingData {
  breakfast: boolean;
  vegetableOrFruit: boolean;
  water: boolean; // Sufficient water (e.g. 6-8 glasses)
  optionalNote?: string;
}

export interface LearningData {
  completed: boolean;
  activityType?: string; // e.g. "Membaca Buku", "Eksplorasi Sains", "Belajar Mandiri"
  durationMinutes?: number;
  newLearning?: string; // What new thing was learned today
}

export interface SocialData {
  completed: boolean;
  activityTypes?: string[]; // e.g. ["Membantu Orang Tua", "Menyapa Tetangga", "Gotong Royong"]
  shortStory?: string; // Brief reflection story
}

export interface SleepEarlyData {
  completed: boolean;
  sleepTime?: string; // e.g. "21:00"
  screenFreeBeforeSleep?: boolean;
  optionalNote?: string;
}

export type HabitDataPayload =
  | WakeEarlyData
  | WorshipData
  | ExerciseData
  | HealthyEatingData
  | LearningData
  | SocialData
  | SleepEarlyData;

export interface DailyHabitEntry {
  id: string;
  dailyJournalId: string;
  habitId: string;
  habitCode: HabitCode;
  completed: boolean;
  data: HabitDataPayload;
  validationStatus: ValidationStatus;
  parentValidated: boolean;
  teacherValidated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyJournal {
  id: string;
  studentId: string;
  studentName?: string;
  schoolId: string;
  journalDate: string; // YYYY-MM-DD
  status: JournalStatus;
  completedCount: number; // 0 to 7
  entries: Record<HabitCode, DailyHabitEntry>;
  createdAt: string;
  updatedAt: string;
  savedAt?: string;
  parentValidated?: boolean;
  parentValidatedAt?: string;
  parentValidationNote?: string;
  parentSignature?: string; // Base64 PNG data URL of parent signature/paraf
  parentValidatorName?: string; // Name of the parent/guardian validator
  parentValidationType?: 'SIGNATURE' | 'INITIALS'; // Format validasi: Tanda Tangan atau Paraf
  parentValidationSource?: 'STUDENT_DASHBOARD' | 'PARENT_DASHBOARD'; // Sumber validasi
  className?: string;
  studentNisn?: string;
  schoolName?: string;
}

export interface HabitValidation {
  id: string;
  entryId: string;
  dailyJournalId: string;
  validatorRole: 'PARENT' | 'TEACHER';
  validatorId: string;
  validatorName: string;
  status: ValidationStatus;
  note?: string;
  signature?: string;
  validationType?: 'SIGNATURE' | 'INITIALS';
  validatedAt: string;
}

export interface MonthlyHabitSummary {
  studentId: string;
  habitCode: HabitCode;
  month: number; // 1 - 12
  year: number;
  daysInMonth: number;
  recordedDays: number;
  completedDays: number;
  thresholdDays: number;
  completenessRate: number; // recordedDays / daysInMonth
  consistencyRate: number;  // completedDays / recordedDays (or completedDays / daysInMonth based on formulation)
  habitualStatus: HabitualStatus;
}

export interface StudentMonthlyReflection {
  id: string;
  studentId: string;
  month: number;
  year: number;
  easiestHabit: HabitCode;
  hardestHabit: HabitCode;
  rootCause: string;
  actionPlan: string;
  nextMonthTarget: string;
  aiSuggestedTarget?: string; // AI suggestion stored separately, never replaces student's writing
  createdAt: string;
}

export interface ParentMonthlyReflection {
  id: string;
  studentId: string;
  parentId: string;
  month: number;
  year: number;
  observedChange: string;
  difficulty: string;
  familySupport: string;
  parentNote: string;
  nextMonthSupport: string;
  createdAt: string;
}

export interface SchoolProgram {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  habitCode: HabitCode;
  participantScope: string; // e.g. "Seluruh Siswa Kelas 1-6", "Fase A & B"
  schedule: string; // e.g. "Setiap Jumat 07:00 - 07:45"
  pic: string; // Person In Charge
  startDate: string;
  endDate?: string;
  evidenceCount: number;
  resultNote?: string;
  isActive: boolean;
}

export interface FollowUpPlan {
  id: string;
  schoolId: string;
  finding: string;
  supportingData: string;
  rootCause: string;
  rootCauseType: RootCauseType;
  actionPlan: string;
  target: string;
  indicator: string;
  owner: string;
  startDate: string;
  deadline: string;
  progressPercent: number;
  status: FollowUpStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  code: string;
  title: string;
  description: string;
  iconName: string;
  earnedAt?: string;
  habitCode?: HabitCode;
  category?: 'HABIT' | 'STREAK' | 'MILESTONE';
  targetCount?: number;
  currentCount?: number;
  progressPercent?: number;
  criteriaDescription?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  schoolId?: string;
  details?: string;
  createdAt: string;
}

// AI Structured Output Types
export interface AIFact {
  statement: string;
  metricReferences: string[];
}

export interface AIAnalysisResult {
  facts: AIFact[];
  patterns: string[];
  limitations: string[];
  hypothesesToVerify: string[];
  recommendations: string[];
  supportingMetrics: Record<string, string | number>;
}
