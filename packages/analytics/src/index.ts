// ============================================================================
// SI-7KAIH AI - Centralized Analytics Engine
// Pure, deterministic business formulas for habit development and monitoring
// ============================================================================

import {
  EarlyWarningCategory,
  HabitualStatus,
} from '../../types/src/index';

/**
 * Calculates the required days in a month to be considered "Sudah Terbiasa".
 * Formula: Math.ceil((2 / 3) * daysInMonth)
 *
 * Expected threshold values:
 * 28 days -> 19
 * 29 days -> 20
 * 30 days -> 20
 * 31 days -> 21
 */
export function calculateHabitualThreshold(daysInMonth: number): number {
  if (daysInMonth <= 0) return 0;
  return Math.ceil((2 / 3) * daysInMonth);
}

/**
 * Calculates data completeness rate (percentage of days recorded).
 * Non-negotiable statistical rule: Missing journal does NOT mean failed habit.
 */
export function calculateCompletenessRate(
  recordedDays: number,
  daysInMonth: number
): number {
  if (daysInMonth <= 0) return 0;
  const clampedRecorded = Math.min(Math.max(0, recordedDays), daysInMonth);
  return Number(((clampedRecorded / daysInMonth) * 100).toFixed(1));
}

/**
 * Calculates habit consistency rate (percentage of recorded days where habit was completed).
 * Consistency is calculated over RECORDED days so missing entries are not treated as failures.
 */
export function calculateConsistencyRate(
  completedDays: number,
  recordedDays: number
): number {
  if (recordedDays <= 0) return 0;
  const clampedCompleted = Math.min(Math.max(0, completedDays), recordedDays);
  return Number(((clampedCompleted / recordedDays) * 100).toFixed(1));
}

export interface HabitSummaryCalculation {
  daysInMonth: number;
  recordedDays: number;
  completedDays: number;
  thresholdDays: number;
  completenessRate: number;
  consistencyRate: number;
  habitualStatus: HabitualStatus;
  numerator: number;
  denominator: number;
  displayRatio: string;
}

/**
 * Evaluates monthly habit development status.
 * Always exposes both numerator and denominator to prevent misinterpretation.
 */
export function calculateMonthlyHabitSummary(
  completedDays: number,
  recordedDays: number,
  daysInMonth: number
): HabitSummaryCalculation {
  const thresholdDays = calculateHabitualThreshold(daysInMonth);
  const completenessRate = calculateCompletenessRate(recordedDays, daysInMonth);
  const consistencyRate = calculateConsistencyRate(completedDays, recordedDays);

  const habitualStatus: HabitualStatus =
    completedDays >= thresholdDays ? 'SUDAH_TERBIASA' : 'BELUM_TERBIASA';

  return {
    daysInMonth,
    recordedDays,
    completedDays,
    thresholdDays,
    completenessRate,
    consistencyRate,
    habitualStatus,
    numerator: completedDays,
    denominator: thresholdDays,
    displayRatio: `${completedDays} / ${thresholdDays} hari target (dari ${daysInMonth} hari)`,
  };
}

/**
 * Non-punitive early warning internal monitoring category.
 * INTERNAL USE ONLY: Must be labeled as "Kategori monitoring internal aplikasi",
 * never as an official government classification.
 *
 * >= 6 habits habitual: TERPANTAU_BAIK
 * 4 - 5 habits habitual: PERLU_PENGUATAN
 * <= 3 habits habitual: PERLU_PENDAMPINGAN
 */
export function calculateEarlyWarning(
  habitsHabitualCount: number
): EarlyWarningCategory {
  if (habitsHabitualCount >= 6) {
    return 'TERPANTAU_BAIK';
  } else if (habitsHabitualCount >= 4) {
    return 'PERLU_PENGUATAN';
  } else {
    return 'PERLU_PENDAMPINGAN';
  }
}

export function getEarlyWarningLabel(category: EarlyWarningCategory): string {
  switch (category) {
    case 'TERPANTAU_BAIK':
      return 'Terpantau Baik';
    case 'PERLU_PENGUATAN':
      return 'Perlu Penguatan';
    case 'PERLU_PENDAMPINGAN':
      return 'Perlu Pendampingan';
  }
}

/**
 * Calculates trend between two periods without inferring false causality.
 * Displays "Perubahan +X poin persentase" rather than claiming a program caused it.
 */
export function calculateTrend(
  currentRate: number,
  previousRate: number
): {
  diff: number;
  formattedText: string;
  isPositive: boolean;
} {
  const diff = Number((currentRate - previousRate).toFixed(1));
  const sign = diff >= 0 ? '+' : '';
  return {
    diff,
    formattedText: `Perubahan ${sign}${diff} poin persentase`,
    isPositive: diff >= 0,
  };
}
