// ============================================================================
// SI-7KAIH AI - Date & Realtime Formatting Utilities
// ============================================================================

/**
 * Formats an ISO string or Date into Indonesian realtime format:
 * e.g. "15 Sep 2026 pukul 15:08:24 WIB"
 */
export function formatRealtimeSaveTime(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '';
    
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
    return `${datePart}, pukul ${timePart} WIB`;
  } catch (_e) {
    return '';
  }
}

/**
 * Returns just the time with seconds and timezone:
 * e.g. "15:08:24 WIB"
 */
export function formatTimeOnly(dateInput?: string | Date | null): string {
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
    return `${timePart} WIB`;
  } catch (_e) {
    return '';
  }
}

/**
 * Generate a current realtime timestamp info string:
 * e.g. "15 Sep 2026, pukul 15:08:24 WIB"
 */
export function getCurrentRealtimeString(): string {
  return formatRealtimeSaveTime(new Date());
}
