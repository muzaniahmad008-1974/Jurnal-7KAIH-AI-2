// ============================================================================
// SI-7KAIH AI - Analytics Unit Tests
// Tests for habitual thresholds, statistical rules, and early warning
// ============================================================================

import {
  calculateHabitualThreshold,
  calculateCompletenessRate,
  calculateConsistencyRate,
  calculateMonthlyHabitSummary,
  calculateEarlyWarning,
  calculateTrend,
} from '../index';

export function runAnalyticsTests() {
  const results: { test: string; passed: boolean; error?: string }[] = [];

  function assertEqual<T>(actual: T, expected: T, testName: string) {
    if (actual === expected) {
      results.push({ test: testName, passed: true });
    } else {
      results.push({
        test: testName,
        passed: false,
        error: `Expected ${expected}, got ${actual}`,
      });
    }
  }

  // 1. Threshold calculations
  assertEqual(calculateHabitualThreshold(28), 19, 'Threshold for 28 days = 19');
  assertEqual(calculateHabitualThreshold(29), 20, 'Threshold for 29 days = 20');
  assertEqual(calculateHabitualThreshold(30), 20, 'Threshold for 30 days = 20');
  assertEqual(calculateHabitualThreshold(31), 21, 'Threshold for 31 days = 21');

  // 2. Data completeness rate vs habit consistency
  // Recorded 15 out of 30 days = 50.0% completeness
  assertEqual(calculateCompletenessRate(15, 30), 50.0, 'Completeness rate 15/30 = 50%');

  // Completed 12 out of 15 recorded days = 80.0% consistency
  assertEqual(calculateConsistencyRate(12, 15), 80.0, 'Consistency rate 12/15 = 80%');

  // 3. Monthly Habit Status
  const summary1 = calculateMonthlyHabitSummary(21, 30, 31);
  assertEqual(summary1.habitualStatus, 'SUDAH_TERBIASA', '21 completed days in 31-day month is SUDAH_TERBIASA');
  assertEqual(summary1.thresholdDays, 21, 'Threshold is 21');

  const summary2 = calculateMonthlyHabitSummary(18, 30, 31);
  assertEqual(summary2.habitualStatus, 'BELUM_TERBIASA', '18 completed days in 31-day month is BELUM_TERBIASA');

  // 4. Early Warning Categories
  assertEqual(calculateEarlyWarning(7), 'TERPANTAU_BAIK', '7 habits = TERPANTAU_BAIK');
  assertEqual(calculateEarlyWarning(6), 'TERPANTAU_BAIK', '6 habits = TERPANTAU_BAIK');
  assertEqual(calculateEarlyWarning(5), 'PERLU_PENGUATAN', '5 habits = PERLU_PENGUATAN');
  assertEqual(calculateEarlyWarning(4), 'PERLU_PENGUATAN', '4 habits = PERLU_PENGUATAN');
  assertEqual(calculateEarlyWarning(3), 'PERLU_PENDAMPINGAN', '3 habits = PERLU_PENDAMPINGAN');
  assertEqual(calculateEarlyWarning(1), 'PERLU_PENDAMPINGAN', '1 habit = PERLU_PENDAMPINGAN');

  // 5. Trend formatting (no causal assertions)
  const trend = calculateTrend(85.5, 66.5);
  assertEqual(trend.formattedText, 'Perubahan +19 poin persentase', 'Non-causal trend wording');

  return results;
}
