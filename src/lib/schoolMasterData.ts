// ============================================================================
// SI-7KAIH AI - Master Data Satuan Pendidikan (Sekolah)
// Dikelola oleh Super Admin untuk Seluruh Satuan Pendidikan di SIM Nasional
// ============================================================================

export interface SchoolMaster {
  id: string;
  npsn: string;
  name: string;
  jenjang: 'SMP' | 'SD' | 'MI' | 'MTS' | 'SMA' | 'SMK' | string;
  status: 'NEGERI' | 'SWASTA';
  akreditasi: 'A' | 'B' | 'C' | 'BELUM';
  district: string;
  city: string;
  province: string;
  address: string;
  principalName: string;
  principalNip: string;
  adminName: string;
  adminUsername: string;
  totalStudents: number;
  totalClasses: number;
  totalTeachers: number;
  habitCompletenessRate: number;
  habitConsistencyRate: number;
  activeStatus: 'AKTIF' | 'NONAKTIF';
  createdAt: string;
}

// Master satuan pendidikan default: UPTD SMPN 1 Jorong
export const DEFAULT_SCHOOLS: SchoolMaster[] = [
  {
    id: 'sch-smpn1-jorong',
    npsn: '30301725',
    name: 'UPTD SMPN 1 Jorong',
    jenjang: 'SMP',
    status: 'NEGERI',
    akreditasi: 'A',
    district: 'Jorong',
    city: 'Kab. Tanah Laut',
    province: 'Kalimantan Selatan',
    address: 'Jl. A. Yani KM. 88, Jorong, Kec. Jorong, Kab. Tanah Laut, Kalimantan Selatan',
    principalName: 'Adang Heri Nugroho, S.Pd, M.M',
    principalNip: '197105121998021004',
    adminName: 'Rina Dewi (Operator SIM)',
    adminUsername: 'admin.1jorong',
    totalStudents: 82,
    totalClasses: 3,
    totalTeachers: 12,
    habitCompletenessRate: 95,
    habitConsistencyRate: 92,
    activeStatus: 'AKTIF',
    createdAt: '2026-06-01',
  },
];

export const RESTORED_SCHOOLS: SchoolMaster[] = DEFAULT_SCHOOLS;

export const getStoredSchools = (): SchoolMaster[] => {
  try {
    const saved = localStorage.getItem('si7kaih_schools_master_prod');
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Hilangkan hanya data dummy bawaan lama sistem awal jika masih tersimpan di browser
        const legacyDefaultIds = new Set(['s-smp-01', 's-smp-02', 's-smp-03', 's-smp-04']);
        const legacyDefaultNames = new Set([
          'smpn 01 nusantara',
          'smpn 02 harapan bangsa',
          'smp swasta madani cendekia',
          'smp bintang juara',
        ]);

        const sanitized = parsed
          .filter(
            (s: SchoolMaster) =>
              !legacyDefaultIds.has(s.id) &&
              !legacyDefaultNames.has((s.name || '').trim().toLowerCase())
          )
          .map((s: SchoolMaster) => {
            const cleanName = (s.name || '').replace(/\s*\(Sekolah Dihapus\)/gi, '').trim();
            const isJorong = cleanName.toLowerCase().includes('jorong') || s.id === 'sch-smpn1-jorong' || s.id === 's-1789602026315';
            return {
              ...s,
              name: isJorong ? 'UPTD SMPN 1 Jorong' : cleanName,
              activeStatus: isJorong ? ('AKTIF' as const) : s.activeStatus,
              totalStudents: isJorong ? 82 : s.totalStudents,
              totalClasses: isJorong ? 3 : s.totalClasses,
            };
          });

        const hasJorong = sanitized.some((s) => s.name.toLowerCase().includes('jorong'));
        const finalSchools = hasJorong ? sanitized : [DEFAULT_SCHOOLS[0], ...sanitized];

        try {
          localStorage.setItem('si7kaih_schools_master_prod', JSON.stringify(finalSchools));
        } catch (_e) {}
        return finalSchools;
      }
    }
  } catch (_e) {}
  return DEFAULT_SCHOOLS;
};

export const saveStoredSchools = (schools: SchoolMaster[]): void => {
  try {
    localStorage.setItem('si7kaih_schools_master_prod', JSON.stringify(schools));
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        try {
          window.dispatchEvent(new CustomEvent('si7kaih_schools_updated', { detail: schools }));
        } catch (_e) {}
      }, 0);
    }
  } catch (_e) {}
};

export const resetStoredSchools = (): SchoolMaster[] => {
  try {
    localStorage.setItem('si7kaih_schools_master_prod', JSON.stringify(DEFAULT_SCHOOLS));
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        try {
          window.dispatchEvent(new CustomEvent('si7kaih_schools_updated', { detail: DEFAULT_SCHOOLS }));
        } catch (_e) {}
      }, 0);
    }
  } catch (_e) {}
  return DEFAULT_SCHOOLS;
};
