// ============================================================================
// SI-7KAIH AI - Master Data Siswa & Rombel Mandiri Satuan Pendidikan
// Pengelolaan mandiri 100% oleh Operator / Admin Sekolah tanpa Dapodik
// Termasuk template CSV, parser impor berkas, dan penyimpanan lokal
// ============================================================================

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  className: string;
  birthDate?: string;
  parentName: string;
  parentPhone?: string;
  status: 'AKTIF' | 'MUTASI' | 'LULUS';
  source: 'IMPORT_FILE' | 'INPUT_MANUAL' | 'SISTEM_AWAL';
  createdAt: string;
  username?: string;
  schoolName?: string;
  schoolId?: string;
}

export interface Rombel {
  id: string;
  code: string;
  name: string;
  phase: string;
  grade: number;
  teacher: string;
  teacherNip: string;
  capacity: number;
  academicYear: string;
  status: 'AKTIF' | 'NONAKTIF';
  source: 'INPUT_MANUAL' | 'IMPORT_FILE' | 'SISTEM_AWAL';
  schoolId?: string;
  schoolName?: string;
}

// Initial default Rombels for Master Data (Kosong secara default untuk diisi mandiri)
export const DEFAULT_ROMBELS: Rombel[] = [];

// Initial default Students for Master Data (Kosong secara default untuk diisi mandiri)
export const DEFAULT_STUDENTS: Student[] = [];

// Local storage management helpers
export const getStoredStudents = (): Student[] => {
  try {
    const saved = localStorage.getItem('si7kaih_students_mandiri');
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Hilangkan hanya data bawaan lama sistem awal jika berlabel SISTEM_AWAL
        const cleaned = parsed.filter(
          (s: Student) => s.source !== 'SISTEM_AWAL'
        );
        if (cleaned.length !== parsed.length) {
          saveStoredStudents(cleaned);
        }
        return cleaned;
      }
    }
  } catch (_e) {}
  return DEFAULT_STUDENTS;
};

export const saveStoredStudents = (students: Student[]): void => {
  try {
    localStorage.setItem('si7kaih_students_mandiri', JSON.stringify(students));
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('si7kaih_students_updated', { detail: students }));
      } catch (_e) {}
      if ('BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('si7kaih_sync_channel');
          bc.postMessage({ type: 'STUDENTS_UPDATED', students });
          bc.close();
        } catch (_e) {}
      }
    }
  } catch (_e) {}
};

export const resetStoredStudents = (): Student[] => {
  try {
    localStorage.setItem('si7kaih_students_mandiri', JSON.stringify([]));
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('si7kaih_students_updated', { detail: [] }));
      } catch (_e) {}
      if ('BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('si7kaih_sync_channel');
          bc.postMessage({ type: 'STUDENTS_UPDATED', students: [] });
          bc.close();
        } catch (_e) {}
      }
    }
  } catch (_e) {}
  return [];
};

export const getStoredRombels = (): Rombel[] => {
  try {
    const saved = localStorage.getItem('si7kaih_rombels_mandiri');
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Hilangkan hanya rombel berlabel SISTEM_AWAL, pertahankan semua rombel mandiri yang diinput operator
        const cleaned = parsed.filter(
          (r: Rombel) => r.source !== 'SISTEM_AWAL'
        );
        if (cleaned.length !== parsed.length) {
          try {
            localStorage.setItem('si7kaih_rombels_mandiri', JSON.stringify(cleaned));
          } catch (_e) {}
        }
        return cleaned;
      }
    }
  } catch (_e) {}
  return DEFAULT_ROMBELS;
};

export const saveStoredRombels = (rombels: Rombel[]): void => {
  try {
    localStorage.setItem('si7kaih_rombels_mandiri', JSON.stringify(rombels));
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('si7kaih_rombels_updated', { detail: rombels }));
      } catch (_e) {}
      if ('BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('si7kaih_sync_channel');
          bc.postMessage({ type: 'ROMBELS_UPDATED', rombels });
          bc.close();
        } catch (_e) {}
      }
    }
  } catch (_e) {}
};

export const resetStoredRombels = (): Rombel[] => {
  try {
    localStorage.setItem('si7kaih_rombels_mandiri', JSON.stringify([]));
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('si7kaih_rombels_updated', { detail: [] }));
      } catch (_e) {}
      if ('BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('si7kaih_sync_channel');
          bc.postMessage({ type: 'ROMBELS_UPDATED', rombels: [] });
          bc.close();
        } catch (_e) {}
      }
    }
  } catch (_e) {}
  return [];
};

// ============================================================================
// TEMPLATE CSV GENERATORS & DOWNLOADERS
// ============================================================================

export const generateStudentTemplateCsv = (): string => {
  const headers = [
    'NISN',
    'Nama_Lengkap',
    'Jenis_Kelamin',
    'Rombel_Kelas',
    'Tanggal_Lahir',
    'Nama_Wali',
    'No_HP_Wali',
  ];

  const sampleRows: string[][] = [];

  const csvRows = [
    headers.join(','),
    ...sampleRows.map((row) => row.map((field) => `"${field.replace(/"/g, '""')}"`).join(',')),
  ];

  return '\uFEFF' + csvRows.join('\r\n');
};

export const downloadStudentTemplateCsv = (): void => {
  const csvContent = generateStudentTemplateCsv();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TEMPLATE_IMPORT_PESERTA_DIDIK_MANDIRI_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateRombelTemplateCsv = (): string => {
  const headers = [
    'Kode_Rombel',
    'Nama_Rombel',
    'Tingkat_Kelas',
    'Fase_Kurikulum',
    'Nama_Wali_Kelas',
    'NIP_Wali_Kelas',
    'Kapasitas_Siswa',
    'Tahun_Ajaran',
  ];

  const sampleRows: string[][] = [];

  const csvRows = [
    headers.join(','),
    ...sampleRows.map((row) => row.map((field) => `"${field.replace(/"/g, '""')}"`).join(',')),
  ];

  return '\uFEFF' + csvRows.join('\r\n');
};

export const downloadRombelTemplateCsv = (): void => {
  const csvContent = generateRombelTemplateCsv();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TEMPLATE_IMPORT_ROMBEL_MANDIRI_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============================================================================
// CSV PARSERS & VALIDATORS
// ============================================================================

// Helper to safely split CSV line considering quoted fields
function parseCsvLine(line: string, delimiter: string = ','): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuote && line[i + 1] === '"') {
        currentValue += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === delimiter && !insideQuote) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim());
  return values;
}

// Detect delimiter: comma, semicolon, or tab
function detectDelimiter(headerLine: string): string {
  if (headerLine.includes(';') && !headerLine.includes(',')) return ';';
  if (headerLine.includes('\t')) return '\t';
  return ',';
}

export function parseStudentCsv(csvText: string): {
  valid: Student[];
  errors: string[];
  totalRows: number;
} {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    return {
      valid: [],
      errors: ['Berkas CSV kosong atau tidak memiliki baris data setelah header.'],
      totalRows: 0,
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  // Find column indices
  const nisnIdx = headers.findIndex((h) => h.includes('nisn'));
  const nameIdx = headers.findIndex((h) => h.includes('nama') || h.includes('name'));
  const genderIdx = headers.findIndex((h) => h.includes('jenis') || h.includes('kelamin') || h.includes('gender') || h === 'jk');
  const rombelIdx = headers.findIndex((h) => h.includes('rombel') || h.includes('kelas') || h.includes('class'));
  const birthDateIdx = headers.findIndex((h) => h.includes('lahir') || h.includes('tgl') || h.includes('birth'));
  const parentIdx = headers.findIndex((h) => h.includes('wali') || h.includes('orangtua') || h.includes('parent'));
  const phoneIdx = headers.findIndex((h) => h.includes('hp') || h.includes('telp') || h.includes('phone') || h.includes('kontak'));

  const valid: Student[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const row = parseCsvLine(rawLine, delimiter);
    const lineNum = i + 1;

    const nisn = nisnIdx !== -1 && row[nisnIdx] ? row[nisnIdx].replace(/[^0-9]/g, '') : '';
    const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : '';
    const rawGender = genderIdx !== -1 && row[genderIdx] ? row[genderIdx].trim().toUpperCase() : 'L';
    const gender: 'L' | 'P' = rawGender.startsWith('P') || rawGender === 'PEREMPUAN' ? 'P' : 'L';
    const className = rombelIdx !== -1 && row[rombelIdx] ? row[rombelIdx].trim() : 'Kelas 7-A';
    const birthDate = birthDateIdx !== -1 && row[birthDateIdx] ? row[birthDateIdx].trim() : '2015-01-01';
    const parentName = parentIdx !== -1 && row[parentIdx] ? row[parentIdx].trim() : 'Orang Tua / Wali';
    const parentPhone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx].trim() : '';

    if (!name) {
      errors.push(`Baris ${lineNum}: Nama siswa wajib diisi.`);
      continue;
    }

    if (!nisn) {
      errors.push(`Baris ${lineNum} (${name}): Nomor NISN wajib diisi.`);
      continue;
    }

    valid.push({
      id: `std-import-${Date.now()}-${i}`,
      nisn: nisn.padStart(10, '0').slice(-10),
      name,
      gender,
      className: className.startsWith('Kelas') ? className : `Kelas ${className}`,
      birthDate,
      parentName,
      parentPhone,
      status: 'AKTIF',
      source: 'IMPORT_FILE',
      createdAt: new Date().toISOString().slice(0, 10),
    });
  }

  return { valid, errors, totalRows: lines.length - 1 };
}

export function parseRombelCsv(csvText: string): {
  valid: Rombel[];
  errors: string[];
  totalRows: number;
} {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    return {
      valid: [],
      errors: ['Berkas CSV kosong atau tidak memiliki baris data setelah header.'],
      totalRows: 0,
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const codeIdx = headers.findIndex((h) => h.includes('kode') || h.includes('code'));
  const nameIdx = headers.findIndex((h) => h.includes('nama') || h.includes('rombel'));
  const gradeIdx = headers.findIndex((h) => h.includes('tingkat') || h.includes('grade'));
  const phaseIdx = headers.findIndex((h) => h.includes('fase') || h.includes('phase'));
  const teacherIdx = headers.findIndex((h) => h.includes('wali') || h.includes('guru') || h.includes('teacher'));
  const nipIdx = headers.findIndex((h) => h.includes('nip') || h.includes('nuptk'));
  const capIdx = headers.findIndex((h) => h.includes('kapasitas') || h.includes('kuota') || h.includes('capacity'));
  const yearIdx = headers.findIndex((h) => h.includes('tahun') || h.includes('ajaran') || h.includes('semester'));

  const valid: Rombel[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const row = parseCsvLine(rawLine, delimiter);
    const lineNum = i + 1;

    const rawName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : '';
    if (!rawName) {
      errors.push(`Baris ${lineNum}: Nama Rombel wajib diisi.`);
      continue;
    }

    const name = rawName.startsWith('Kelas') ? rawName : `Kelas ${rawName}`;
    const code = codeIdx !== -1 && row[codeIdx] ? row[codeIdx].trim() : `ROMBEL-${name.replace(/[^0-9A-Za-z]/g, '')}`;
    
    // Determine grade number
    let grade = 7;
    if (gradeIdx !== -1 && row[gradeIdx]) {
      const gNum = parseInt(row[gradeIdx].replace(/[^0-9]/g, ''), 10);
      if (!isNaN(gNum)) grade = gNum;
    } else {
      const match = name.match(/\d+/);
      if (match) grade = parseInt(match[0], 10);
    }

    // Determine Phase (Default to Fase D for SMP)
    let phase = (grade >= 7 && grade <= 9) ? 'Fase D' : (grade <= 2 ? 'Fase A' : grade <= 4 ? 'Fase B' : grade <= 6 ? 'Fase C' : 'Fase D');
    if (phaseIdx !== -1 && row[phaseIdx] && row[phaseIdx].toLowerCase().includes('fase')) {
      phase = row[phaseIdx].trim();
    }

    const teacher = teacherIdx !== -1 && row[teacherIdx] ? row[teacherIdx].trim() : 'Guru Wali Kelas Mandiri';
    const teacherNip = nipIdx !== -1 && row[nipIdx] ? row[nipIdx].trim() : '-';
    const capacity = capIdx !== -1 && row[capIdx] ? parseInt(row[capIdx].replace(/[^0-9]/g, ''), 10) || 30 : 30;
    const academicYear = yearIdx !== -1 && row[yearIdx] ? row[yearIdx].trim() : '2025/2026 Ganjil';

    valid.push({
      id: `r-import-${Date.now()}-${i}`,
      code,
      name,
      phase,
      grade,
      teacher,
      teacherNip,
      capacity,
      academicYear,
      status: 'AKTIF',
      source: 'IMPORT_FILE',
    });
  }

  return { valid, errors, totalRows: lines.length - 1 };
}

// ============================================================================
// NORMALISASI & SINKRONISASI KELAS / ROMBEL & SEKOLAH
// Memastikan integritas dan keselarasan nama rombel dan kelas peserta didik
// ============================================================================

/**
 * Menormalisasi format nama kelas menjadi bentuk standar kanonikal (contoh: "8-C")
 * Menangani ragam penulisan seperti "Kelas 8-C", "8-C", "8 - C", "Kelas 8C", "8C", "VIII-C", "Kelas VIII-C", "8 C", dll.
 */
export function normalizeClassName(raw?: string): string {
  if (!raw) return '';
  let str = raw.trim();
  // Hilangkan awalan "Kelas" / "Kls" jika ada
  str = str.replace(/^(kelas|kls)\s*/i, '').trim();

  // Konversi angka romawi kelas ke angka desimal
  str = str.replace(/^VIII\b/i, '8');
  str = str.replace(/^VII\b/i, '7');
  str = str.replace(/^IX\b/i, '9');
  str = str.replace(/^VI\b/i, '6');
  str = str.replace(/^IV\b/i, '4');
  str = str.replace(/^V\b/i, '5');
  str = str.replace(/^III\b/i, '3');
  str = str.replace(/^II\b/i, '2');
  str = str.replace(/^I\b/i, '1');
  str = str.replace(/^X\b/i, '10');
  str = str.replace(/^XI\b/i, '11');
  str = str.replace(/^XII\b/i, '12');

  // Cocokkan pola angka diikuti huruf seperti "8-C", "8 C", "8C", "8_C"
  const match = str.match(/^(\d+)\s*[-_ ]*\s*([A-Za-z0-9]+)$/);
  if (match) {
    return `${match[1]}-${match[2].toUpperCase()}`;
  }

  return str.replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Membandingkan dua nama kelas/rombel secara cerdas dan fleksibel.
 * Mengembalikan true jika keduanya merujuk pada kelas yang sama (misal: "Kelas 8-C" dan "8-C" -> true).
 */
export function isSameClass(classA?: string, classB?: string): boolean {
  if (!classA || !classB) return false;
  const cleanA = classA.trim();
  const cleanB = classB.trim();
  if (cleanA.toLowerCase() === cleanB.toLowerCase()) return true;
  const normA = normalizeClassName(cleanA);
  const normB = normalizeClassName(cleanB);
  if (normA && normB && normA === normB) return true;
  return false;
}

/**
 * Membandingkan nama sekolah/satuan pendidikan secara fleksibel.
 * Mengabaikan perbedaan singkatan "UPTD", "SMP Negeri" vs "SMPN", spasi ganda, dan huruf besar/kecil.
 */
export function isSameSchool(schoolA?: string, schoolB?: string): boolean {
  if (!schoolA || !schoolB) return false;
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/\buptd\b/gi, '')
      .replace(/\bnegeri\b/gi, 'n')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  const a = norm(schoolA);
  const b = norm(schoolB);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

/**
 * Fungsi sinkronisasi master: menyelaraskan data rombel dan peserta didik untuk satuan pendidikan
 */
export function synchronizeSchoolRombelsAndStudents(params: {
  schoolId?: string;
  schoolName?: string;
  currentStudents: Student[];
  currentRombels: Rombel[];
}): {
  updatedStudents: Student[];
  updatedRombels: Rombel[];
  changedCount: number;
  addedRombelsCount: number;
} {
  const { schoolId, schoolName, currentStudents, currentRombels } = params;

  let changedCount = 0;
  let addedRombelsCount = 0;
  const newRombels = [...currentRombels];

  const targetStudents = currentStudents.map((s) => {
    // Cek apakah siswa milik sekolah ini
    const matchesSchool =
      (!schoolId && !schoolName) ||
      (schoolId && s.schoolId && s.schoolId.toLowerCase() === schoolId.toLowerCase()) ||
      (schoolName && s.schoolName && isSameSchool(s.schoolName, schoolName));

    if (!matchesSchool) {
      return s;
    }

    const updatedS = { ...s };
    if (schoolName && s.schoolName !== schoolName) {
      updatedS.schoolName = schoolName;
    }
    if (schoolId && s.schoolId !== schoolId) {
      updatedS.schoolId = schoolId;
    }

    if (updatedS.className) {
      const matchedRombel = newRombels.find((r) => isSameClass(r.name, updatedS.className));
      if (matchedRombel) {
        if (updatedS.className !== matchedRombel.name) {
          updatedS.className = matchedRombel.name;
          changedCount++;
        }
      } else {
        const norm = normalizeClassName(updatedS.className);
        const gradeMatch = norm.match(/^(\d+)/);
        const grade = gradeMatch ? parseInt(gradeMatch[1], 10) : 8;
        const phase =
          grade >= 7 && grade <= 9
            ? 'Fase D'
            : grade <= 2
            ? 'Fase A'
            : grade <= 4
            ? 'Fase B'
            : grade <= 6
            ? 'Fase C'
            : 'Fase D';
        const canonicalName = updatedS.className.startsWith('Kelas')
          ? updatedS.className
          : `Kelas ${updatedS.className.trim()}`;

        const createdRombel: Rombel = {
          id: `rombel-sync-${Date.now()}-${newRombels.length}`,
          code: `ROMBEL-${norm.replace(/[^A-Za-z0-9]/g, '')}`,
          name: canonicalName,
          grade,
          phase,
          teacher: 'Guru Wali Kelas',
          teacherNip: '-',
          capacity: 32,
          academicYear: '2025/2026 Ganjil',
          status: 'AKTIF',
          source: 'INPUT_MANUAL',
          schoolId: schoolId || '',
          schoolName: schoolName || '',
        };
        newRombels.push(createdRombel);
        addedRombelsCount++;
        if (updatedS.className !== canonicalName) {
          updatedS.className = canonicalName;
          changedCount++;
        }
      }
    }

    return updatedS;
  });

  return {
    updatedStudents: targetStudents,
    updatedRombels: newRombels,
    changedCount,
    addedRombelsCount,
  };
}

