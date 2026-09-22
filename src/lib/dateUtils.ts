// ============================================================================
// SI-7KAIH AI - Date & Realtime Formatting Utilities
// ============================================================================

/**
 * Returns YYYY-MM-DD string in local timezone (avoiding UTC offset day shifts)
 */
export function getLocalDateString(dateInput: Date = new Date()): string {
  const year = dateInput.getFullYear();
  const month = String(dateInput.getMonth() + 1).padStart(2, '0');
  const day = String(dateInput.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date or date string into Indonesian full day and date:
 * e.g. "Senin, 21 September 2026"
 */
export function formatIndonesianFullDate(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' 
      ? (dateInput.includes('T') ? new Date(dateInput) : new Date(dateInput + 'T00:00:00'))
      : dateInput;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (_e) {
    return '';
  }
}

/**
 * Formats a Date or date string into short Indonesian date:
 * e.g. "21 Sep 2026"
 */
export function formatIndonesianShortDate(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' 
      ? (dateInput.includes('T') ? new Date(dateInput) : new Date(dateInput + 'T00:00:00'))
      : dateInput;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (_e) {
    return '';
  }
}

/**
 * Formats an ISO string or Date into Indonesian realtime format:
 * e.g. "21 Sep 2026, pukul 15:08:24 WITA"
 */
export function formatRealtimeSaveTime(dateInput?: string | Date | null, tz: 'WITA' | 'WIB' = 'WITA'): string {
  if (!dateInput) return '';
  try {
    if (typeof dateInput === 'string' && (dateInput.includes('pukul') || dateInput.includes('WITA') || dateInput.includes('WIB'))) {
      return dateInput;
    }
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return typeof dateInput === 'string' ? dateInput : '';
    
    const datePart = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timePart = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return `${datePart}, pukul ${timePart} ${tz}`;
  } catch (_e) {
    return '';
  }
}

/**
 * Returns just the time with seconds and timezone:
 * e.g. "15:08:24 WITA"
 */
export function formatTimeOnly(dateInput?: string | Date | null, tz: 'WITA' | 'WIB' = 'WITA'): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '';
    const timePart = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return `${timePart} ${tz}`;
  } catch (_e) {
    return '';
  }
}

/**
 * Generate a current realtime timestamp info string:
 * e.g. "21 Sep 2026, pukul 15:08:24 WITA"
 */
export function getCurrentRealtimeString(tz: 'WITA' | 'WIB' = 'WITA'): string {
  return formatRealtimeSaveTime(new Date(), tz);
}

/**
 * Resolves and formats academic year and active semester dynamically or from rombel config
 * e.g. "Semester Ganjil 2026/2027" or "Semester Genap 2025/2026"
 */
export function formatAcademicYearAndSemester(raw?: string, dateInput: Date = new Date()): {
  academicYear: string;
  semesterName: string;
  fullDisplay: string;
} {
  const month = dateInput.getMonth() + 1; // 1-12
  const currentYear = dateInput.getFullYear();

  // Default based on Indonesian school calendar (July-Dec = Ganjil, Jan-June = Genap)
  const defaultSemester = month >= 7 && month <= 12 ? 'Semester Ganjil' : 'Semester Genap';
  const defaultYear = month >= 7 && month <= 12 ? `${currentYear}/${currentYear + 1}` : `${currentYear - 1}/${currentYear}`;

  if (!raw || !raw.trim()) {
    return {
      academicYear: defaultYear,
      semesterName: defaultSemester,
      fullDisplay: `${defaultSemester} ${defaultYear}`,
    };
  }

  const trimmed = raw.trim();
  let semesterName = defaultSemester;
  if (/genap/i.test(trimmed)) {
    semesterName = 'Semester Genap';
  } else if (/ganjil/i.test(trimmed)) {
    semesterName = 'Semester Ganjil';
  }

  const yearMatch = trimmed.match(/\d{4}\s*\/\s*\d{4}/);
  const academicYear = yearMatch ? yearMatch[0].replace(/\s+/g, '') : defaultYear;

  return {
    academicYear,
    semesterName,
    fullDisplay: `${semesterName} ${academicYear}`,
  };
}

/**
 * Returns the current month and year in Indonesian:
 * e.g. "September 2026"
 */
export function getCurrentIndonesianMonthYear(dateInput: Date = new Date()): string {
  try {
    return dateInput.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  } catch (_e) {
    return '';
  }
}

