-- ============================================================================
-- SI-7KAIH AI - Skema Basis Data Supabase
-- Tabel Penyimpanan Permanen Jurnal, Refleksi, Akun Pengguna, dan Audit Log
-- ============================================================================

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabel Jurnal Harian Siswa (7 Kebiasaan Anak Indonesia Hebat)
CREATE TABLE IF NOT EXISTS public.si7kaih_journals (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'SUBMITTED',
    parent_validated BOOLEAN DEFAULT FALSE,
    teacher_validated BOOLEAN DEFAULT FALSE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT si7kaih_journals_student_date_unique UNIQUE (student_id, date)
);

-- 2. Tabel Refleksi Bulanan Siswa & Orang Tua
CREATE TABLE IF NOT EXISTS public.si7kaih_reflections (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'STUDENT' | 'PARENT'
    target_id TEXT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Master Akun Pengguna (RBAC & SIM Sekolah)
CREATE TABLE IF NOT EXISTS public.si7kaih_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    name TEXT,
    role TEXT NOT NULL,
    school_id TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabel Lencana / Gamifikasi
CREATE TABLE IF NOT EXISTS public.si7kaih_badges (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE,
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabel Program Sekolah Penguat Karakter
CREATE TABLE IF NOT EXISTS public.si7kaih_programs (
    id TEXT PRIMARY KEY,
    school_id TEXT,
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Tabel Rencana Tindak Lanjut (RTL) Supervisi & Guru
CREATE TABLE IF NOT EXISTS public.si7kaih_followups (
    id TEXT PRIMARY KEY,
    school_id TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Tabel Jejak Rekam / Audit Log Sistem
CREATE TABLE IF NOT EXISTS public.si7kaih_audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_name TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    details TEXT,
    school_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Row Level Security (RLS) & Kebijakan Akses (Anon & Authenticated)
-- ============================================================================

ALTER TABLE public.si7kaih_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_audit_logs ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Penuh untuk Klien SI-7KAIH AI
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read/write on journals" ON public.si7kaih_journals;
    CREATE POLICY "Allow public read/write on journals" ON public.si7kaih_journals FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public read/write on reflections" ON public.si7kaih_reflections;
    CREATE POLICY "Allow public read/write on reflections" ON public.si7kaih_reflections FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public read/write on users" ON public.si7kaih_users;
    CREATE POLICY "Allow public read/write on users" ON public.si7kaih_users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public read/write on badges" ON public.si7kaih_badges;
    CREATE POLICY "Allow public read/write on badges" ON public.si7kaih_badges FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public read/write on programs" ON public.si7kaih_programs;
    CREATE POLICY "Allow public read/write on programs" ON public.si7kaih_programs FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public read/write on followups" ON public.si7kaih_followups;
    CREATE POLICY "Allow public read/write on followups" ON public.si7kaih_followups FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public read/write on audit_logs" ON public.si7kaih_audit_logs;
    CREATE POLICY "Allow public read/write on audit_logs" ON public.si7kaih_audit_logs FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Indeks Performa Kueri
CREATE INDEX IF NOT EXISTS idx_journals_student_id ON public.si7kaih_journals (student_id);
CREATE INDEX IF NOT EXISTS idx_journals_date ON public.si7kaih_journals (date);
CREATE INDEX IF NOT EXISTS idx_reflections_target_id ON public.si7kaih_reflections (target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.si7kaih_audit_logs (created_at DESC);

-- ============================================================================
-- Supabase Realtime Publication (Sinkronisasi Otomatis Antar Pengguna)
-- ============================================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.si7kaih_journals;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.si7kaih_reflections;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.si7kaih_users;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.si7kaih_audit_logs;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;
