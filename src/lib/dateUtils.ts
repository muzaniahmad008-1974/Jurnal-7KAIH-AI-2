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

