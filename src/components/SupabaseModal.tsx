// ============================================================================
// SI-7KAIH AI - Supabase Connection & SQL Schema Viewer Modal
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  FileCode,
  Layers,
} from 'lucide-react';
import { SUPABASE_CONFIG } from '../lib/supabase';
import {
  subscribeToSyncStatus,
  refreshSupabaseStatus,
  syncAllToSupabase,
  SupabaseSyncStatus,
} from '../lib/supabaseService';
import { DailyJournal, StudentMonthlyReflection, ParentMonthlyReflection } from '../../packages/types/src/index';
import { UserPersona } from '../lib/constants';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  journals: DailyJournal[];
  studentReflection: StudentMonthlyReflection;
  parentReflection: ParentMonthlyReflection;
  users: UserPersona[];
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  journals,
  studentReflection,
  parentReflection,
  users,
}) => {
  const [syncStatus, setSyncStatus] = useState<SupabaseSyncStatus>({
    isConnected: false,
    tablesReady: false,
    syncCount: 0,
    statusMessage: 'Memeriksa...',
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'REVISION' | 'FULL'>('REVISION');

  useEffect(() => {
    const unsub = subscribeToSyncStatus(setSyncStatus);
    refreshSupabaseStatus();
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  // 1. Revisi Skema: RLS Berbasis Peran (Sesuai File Lampiran)
  const revisionSqlCode = `-- ============================================================================
-- SI-7KAIH AI -- Revisi Skema: RLS Berbasis Peran (Role-Based Security)
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Jalankan SETELAH skema dasar (si7kaih_*) sudah ada di database.
--
-- CATATAN PENTING SEBELUM MENJALANKAN INI:
-- RLS berbasis peran hanya bisa aman kalau aplikasi memakai Supabase Auth
-- (supabase.auth.signUp / signInWithPassword) untuk login, karena database
-- perlu tahu SIAPA pengguna yang mengirim request lewat auth.uid().
-- Kalau login masih custom (cek username/password sendiri di tabel
-- si7kaih_users), semua request dari browser tetap memakai anon key yang
-- sama, sehingga database tidak bisa membedakan siswa A dari siswa B.
-- Kalau frontend belum pakai Supabase Auth, itu harus dikerjakan dulu
-- sebelum skema ini benar-benar melindungi data.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Hubungkan si7kaih_users ke akun Supabase Auth
-- ----------------------------------------------------------------------------
ALTER TABLE public.si7kaih_users
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- Normalisasi nilai role yang sudah ada sebelum memasang constraint baru
UPDATE public.si7kaih_users
SET role = CASE LOWER(role)
    WHEN 'student' THEN 'siswa'
    WHEN 'teacher' THEN 'guru'
    WHEN 'principal' THEN 'kepala_sekolah'
    WHEN 'parent' THEN 'orang_tua'
    WHEN 'supervisor' THEN 'pengawas'
    WHEN 'school_admin' THEN 'guru'
    WHEN 'super_admin' THEN 'pengawas'
    ELSE LOWER(role)
END
WHERE role IS NOT NULL;

ALTER TABLE public.si7kaih_users
    DROP CONSTRAINT IF EXISTS si7kaih_users_role_check;
ALTER TABLE public.si7kaih_users
    ADD CONSTRAINT si7kaih_users_role_check
    CHECK (role IN ('siswa', 'guru', 'kepala_sekolah', 'orang_tua', 'pengawas'));

CREATE INDEX IF NOT EXISTS si7kaih_users_school_id_idx ON public.si7kaih_users (school_id);
CREATE INDEX IF NOT EXISTS si7kaih_users_role_idx ON public.si7kaih_users (role);

-- ----------------------------------------------------------------------------
-- 2. Tabel relasi: orang tua-siswa dan pengawas-sekolah
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.si7kaih_parent_links (
    id TEXT PRIMARY KEY,
    parent_user_id TEXT NOT NULL REFERENCES public.si7kaih_users(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES public.si7kaih_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT si7kaih_parent_links_unique UNIQUE (parent_user_id, student_id)
);
CREATE INDEX IF NOT EXISTS si7kaih_parent_links_student_idx ON public.si7kaih_parent_links (student_id);

CREATE TABLE IF NOT EXISTS public.si7kaih_supervisor_schools (
    id TEXT PRIMARY KEY,
    supervisor_id TEXT NOT NULL REFERENCES public.si7kaih_users(id) ON DELETE CASCADE,
    school_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT si7kaih_supervisor_schools_unique UNIQUE (supervisor_id, school_id)
);
CREATE INDEX IF NOT EXISTS si7kaih_supervisor_schools_school_idx ON public.si7kaih_supervisor_schools (school_id);

-- ----------------------------------------------------------------------------
-- 3. Kolom tambahan untuk pengecekan RLS berbasis sekolah/penulis
-- ----------------------------------------------------------------------------
ALTER TABLE public.si7kaih_journals ADD COLUMN IF NOT EXISTS school_id TEXT;
ALTER TABLE public.si7kaih_reflections ADD COLUMN IF NOT EXISTS school_id TEXT;
ALTER TABLE public.si7kaih_reflections ADD COLUMN IF NOT EXISTS author_id TEXT;

CREATE INDEX IF NOT EXISTS si7kaih_journals_school_idx ON public.si7kaih_journals (school_id);
CREATE INDEX IF NOT EXISTS si7kaih_journals_student_idx ON public.si7kaih_journals (student_id);
CREATE INDEX IF NOT EXISTS si7kaih_reflections_school_idx ON public.si7kaih_reflections (school_id);
CREATE INDEX IF NOT EXISTS si7kaih_reflections_target_idx ON public.si7kaih_reflections (target_id);
CREATE INDEX IF NOT EXISTS si7kaih_programs_school_idx ON public.si7kaih_programs (school_id);
CREATE INDEX IF NOT EXISTS si7kaih_followups_school_idx ON public.si7kaih_followups (school_id);
CREATE INDEX IF NOT EXISTS si7kaih_audit_logs_school_idx ON public.si7kaih_audit_logs (school_id);
CREATE INDEX IF NOT EXISTS si7kaih_audit_logs_actor_idx ON public.si7kaih_audit_logs (actor_id);

-- ----------------------------------------------------------------------------
-- 4. Fungsi bantu (SECURITY DEFINER supaya tidak terjebak RLS rekursif)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.si7kaih_my_app_id()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
    SELECT id FROM public.si7kaih_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.si7kaih_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
    SELECT role FROM public.si7kaih_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.si7kaih_my_school_id()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
    SELECT school_id FROM public.si7kaih_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.si7kaih_is_parent_of(p_student_id TEXT)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.si7kaih_parent_links
        WHERE parent_user_id = public.si7kaih_my_app_id()
        AND student_id = p_student_id
    );
$$;

CREATE OR REPLACE FUNCTION public.si7kaih_supervises_school(p_school_id TEXT)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.si7kaih_supervisor_schools
        WHERE supervisor_id = public.si7kaih_my_app_id()
        AND school_id = p_school_id
    );
$$;

-- ----------------------------------------------------------------------------
-- 5. Trigger: isi kolom sensitif dari server, jangan percaya input klien
--    untuk school_id / author_id / actor_id, dan cegah eskalasi peran
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.si7kaih_fill_journal_school()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    NEW.school_id := (SELECT school_id FROM public.si7kaih_users WHERE id = NEW.student_id);
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS si7kaih_journals_fill_school ON public.si7kaih_journals;
CREATE TRIGGER si7kaih_journals_fill_school
    BEFORE INSERT OR UPDATE OF student_id ON public.si7kaih_journals
    FOR EACH ROW EXECUTE FUNCTION public.si7kaih_fill_journal_school();

CREATE OR REPLACE FUNCTION public.si7kaih_fill_reflection_meta()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    NEW.school_id := (SELECT school_id FROM public.si7kaih_users WHERE id = NEW.target_id);
    NEW.author_id := public.si7kaih_my_app_id();
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS si7kaih_reflections_fill_meta ON public.si7kaih_reflections;
CREATE TRIGGER si7kaih_reflections_fill_meta
    BEFORE INSERT ON public.si7kaih_reflections
    FOR EACH ROW EXECUTE FUNCTION public.si7kaih_fill_reflection_meta();

CREATE OR REPLACE FUNCTION public.si7kaih_fill_audit_actor()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    NEW.actor_id := public.si7kaih_my_app_id();
    NEW.actor_role := public.si7kaih_my_role();
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS si7kaih_audit_logs_fill_actor ON public.si7kaih_audit_logs;
CREATE TRIGGER si7kaih_audit_logs_fill_actor
    BEFORE INSERT ON public.si7kaih_audit_logs
    FOR EACH ROW EXECUTE FUNCTION public.si7kaih_fill_audit_actor();

CREATE OR REPLACE FUNCTION public.si7kaih_prevent_role_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role AND public.si7kaih_my_role() <> 'pengawas' THEN
        RAISE EXCEPTION 'Hanya pengawas yang dapat mengubah peran pengguna';
    END IF;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS si7kaih_users_prevent_role_change ON public.si7kaih_users;
CREATE TRIGGER si7kaih_users_prevent_role_change
    BEFORE UPDATE OF role ON public.si7kaih_users
    FOR EACH ROW EXECUTE FUNCTION public.si7kaih_prevent_role_change();

-- ----------------------------------------------------------------------------
-- 6. Pastikan RLS aktif di semua tabel, termasuk yang baru
-- ----------------------------------------------------------------------------
ALTER TABLE public.si7kaih_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_parent_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_supervisor_schools ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 7. Hapus semua policy akses publik lama
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read/write on journals" ON public.si7kaih_journals;
DROP POLICY IF EXISTS "Allow public read/write on reflections" ON public.si7kaih_reflections;
DROP POLICY IF EXISTS "Allow public read/write on users" ON public.si7kaih_users;
DROP POLICY IF EXISTS "Allow public read/write on badges" ON public.si7kaih_badges;
DROP POLICY IF EXISTS "Allow public read/write on programs" ON public.si7kaih_programs;
DROP POLICY IF EXISTS "Allow public read/write on followups" ON public.si7kaih_followups;
DROP POLICY IF EXISTS "Allow public read/write on audit_logs" ON public.si7kaih_audit_logs;

-- ----------------------------------------------------------------------------
-- 8. Policy: si7kaih_users
-- ----------------------------------------------------------------------------
CREATE POLICY "users_select_self_or_related" ON public.si7kaih_users
    FOR SELECT TO authenticated
    USING (
        auth_user_id = auth.uid()
        OR public.si7kaih_my_role() = 'pengawas'
        OR (public.si7kaih_my_role() IN ('guru', 'kepala_sekolah') AND school_id = public.si7kaih_my_school_id())
        OR (public.si7kaih_my_role() = 'orang_tua' AND public.si7kaih_is_parent_of(id))
    );

CREATE POLICY "users_insert_self_as_siswa" ON public.si7kaih_users
    FOR INSERT TO authenticated
    WITH CHECK (auth_user_id = auth.uid() AND role = 'siswa');

CREATE POLICY "users_update_self" ON public.si7kaih_users
    FOR UPDATE TO authenticated
    USING (auth_user_id = auth.uid() OR public.si7kaih_my_role() = 'pengawas')
    WITH CHECK (auth_user_id = auth.uid() OR public.si7kaih_my_role() = 'pengawas');

CREATE POLICY "users_delete_pengawas_only" ON public.si7kaih_users
    FOR DELETE TO authenticated
    USING (public.si7kaih_my_role() = 'pengawas');

-- ----------------------------------------------------------------------------
-- 9. Policy: si7kaih_journals
-- ----------------------------------------------------------------------------
CREATE POLICY "journals_select" ON public.si7kaih_journals
    FOR SELECT TO authenticated
    USING (
        student_id = public.si7kaih_my_app_id()
        OR public.si7kaih_is_parent_of(student_id)
        OR (public.si7kaih_my_role() IN ('guru', 'kepala_sekolah') AND school_id = public.si7kaih_my_school_id())
        OR (public.si7kaih_my_role() = 'pengawas' AND public.si7kaih_supervises_school(school_id))
    );

CREATE POLICY "journals_insert_own" ON public.si7kaih_journals
    FOR INSERT TO authenticated
    WITH CHECK (student_id = public.si7kaih_my_app_id() AND public.si7kaih_my_role() = 'siswa');

CREATE POLICY "journals_update" ON public.si7kaih_journals
    FOR UPDATE TO authenticated
    USING (
        student_id = public.si7kaih_my_app_id()
        OR public.si7kaih_is_parent_of(student_id)
        OR (public.si7kaih_my_role() IN ('guru', 'kepala_sekolah') AND school_id = public.si7kaih_my_school_id())
    )
    WITH CHECK (
        student_id = public.si7kaih_my_app_id()
        OR public.si7kaih_is_parent_of(student_id)
        OR (public.si7kaih_my_role() IN ('guru', 'kepala_sekolah') AND school_id = public.si7kaih_my_school_id())
    );

-- ----------------------------------------------------------------------------
-- 10. Policy: si7kaih_reflections
-- ----------------------------------------------------------------------------
CREATE POLICY "reflections_select" ON public.si7kaih_reflections
    FOR SELECT TO authenticated
    USING (
        target_id = public.si7kaih_my_app_id()
        OR author_id = public.si7kaih_my_app_id()
        OR public.si7kaih_is_parent_of(target_id)
        OR (public.si7kaih_my_role() IN ('guru', 'kepala_sekolah') AND school_id = public.si7kaih_my_school_id())
        OR (public.si7kaih_my_role() = 'pengawas' AND public.si7kaih_supervises_school(school_id))
    );

CREATE POLICY "reflections_insert" ON public.si7kaih_reflections
    FOR INSERT TO authenticated
    WITH CHECK (
        target_id = public.si7kaih_my_app_id()
        OR (public.si7kaih_my_role() = 'orang_tua' AND public.si7kaih_is_parent_of(target_id))
    );

CREATE POLICY "reflections_update_own" ON public.si7kaih_reflections
    FOR UPDATE TO authenticated
    USING (author_id = public.si7kaih_my_app_id())
    WITH CHECK (author_id = public.si7kaih_my_app_id());

-- ----------------------------------------------------------------------------
-- 11. Policy: si7kaih_badges
-- ----------------------------------------------------------------------------
CREATE POLICY "badges_select_all_authenticated" ON public.si7kaih_badges
    FOR SELECT TO authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- 12. Policy: si7kaih_programs
-- ----------------------------------------------------------------------------
CREATE POLICY "programs_select_same_school" ON public.si7kaih_programs
    FOR SELECT TO authenticated
    USING (
        school_id = public.si7kaih_my_school_id()
        OR (public.si7kaih_my_role() = 'pengawas' AND public.si7kaih_supervises_school(school_id))
    );

CREATE POLICY "programs_insert_kepsek_pengawas" ON public.si7kaih_programs
    FOR INSERT TO authenticated
    WITH CHECK (
        (public.si7kaih_my_role() = 'kepala_sekolah' AND school_id = public.si7kaih_my_school_id())
        OR (public.si7kaih_my_role() = 'pengawas' AND public.si7kaih_supervises_school(school_id))
    );

CREATE POLICY "programs_update_kepsek_pengawas" ON public.si7kaih_programs
    FOR UPDATE TO authenticated
    USING (
        (public.si7kaih_my_role() = 'kepala_sekolah' AND school_id = public.si7kaih_my_school_id())
        OR (public.si7kaih_my_role() = 'pengawas' AND public.si7kaih_supervises_school(school_id))
    )
    WITH CHECK (
        (public.si7kaih_my_role() = 'kepala_sekolah' AND school_id = public.si7kaih_my_school_id())
        OR (public.si7kaih_my_role() = 'pengawas' AND public.si7kaih_supervises_school(school_id))
    );

-- ----------------------------------------------------------------------------
-- 13. Policy: si7kaih_followups (RTL)
-- ----------------------------------------------------------------------------
CREATE POLICY "followups_select_same_school" ON public.si7kaih_followups
    FOR SELECT TO authenticated
    USING (
        school_id = public.si7kaih_my_school_id()
        OR (public.si7kaih_my_role() = 'pengawas' AND public.si7kaih_supervises_school(school_id))
    );

CREATE POLICY "followups_insert_kepsek_pengawas" ON public.si7kaih_followups
    FOR INSERT TO authenticated
    WITH CHECK (
        (public.si7kaih_my_role() = 'kepala_sekolah' AND school_id = public.si7kaih_my_school_id())
        OR (public.si7kaih_my_role() = 'pengawas' AND public.si7kaih_supervises_school(school_id))
    );

CREATE POLICY "followups_update_kepsek_pengawas" ON public.si7kaih_followups
    FOR UPDATE TO authenticated
    USING (
        (public.si7kaih_my_role() = 'kepala_sekolah' AND school_id = public.si7kaih_my_school_id())
        OR (public.si7kaih_my_role() = 'pengawas' AND public.si7kaih_supervises_school(school_id))
    )
    WITH CHECK (
        (public.si7kaih_my_role() = 'kepala_sekolah' AND school_id = public.si7kaih_my_school_id())
        OR (public.si7kaih_my_role() = 'pengawas' AND public.si7kaih_supervises_school(school_id))
    );

-- ----------------------------------------------------------------------------
-- 14. Policy: si7kaih_audit_logs
-- ----------------------------------------------------------------------------
CREATE POLICY "audit_logs_insert_own_action" ON public.si7kaih_audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "audit_logs_select_kepsek_pengawas" ON public.si7kaih_audit_logs
    FOR SELECT TO authenticated
    USING (
        (public.si7kaih_my_role() = 'kepala_sekolah' AND school_id = public.si7kaih_my_school_id())
        OR (public.si7kaih_my_role() = 'pengawas' AND public.si7kaih_supervises_school(school_id))
    );

-- ----------------------------------------------------------------------------
-- 15. Policy: si7kaih_parent_links & si7kaih_supervisor_schools
-- ----------------------------------------------------------------------------
CREATE POLICY "parent_links_select" ON public.si7kaih_parent_links
    FOR SELECT TO authenticated
    USING (
        parent_user_id = public.si7kaih_my_app_id()
        OR student_id = public.si7kaih_my_app_id()
        OR public.si7kaih_my_role() = 'pengawas'
    );

CREATE POLICY "parent_links_insert_pengawas" ON public.si7kaih_parent_links
    FOR INSERT TO authenticated
    WITH CHECK (public.si7kaih_my_role() = 'pengawas');

CREATE POLICY "parent_links_update_pengawas" ON public.si7kaih_parent_links
    FOR UPDATE TO authenticated
    USING (public.si7kaih_my_role() = 'pengawas')
    WITH CHECK (public.si7kaih_my_role() = 'pengawas');

CREATE POLICY "parent_links_delete_pengawas" ON public.si7kaih_parent_links
    FOR DELETE TO authenticated
    USING (public.si7kaih_my_role() = 'pengawas');

CREATE POLICY "supervisor_schools_select" ON public.si7kaih_supervisor_schools
    FOR SELECT TO authenticated
    USING (supervisor_id = public.si7kaih_my_app_id() OR public.si7kaih_my_role() = 'pengawas');

CREATE POLICY "supervisor_schools_insert_pengawas" ON public.si7kaih_supervisor_schools
    FOR INSERT TO authenticated
    WITH CHECK (public.si7kaih_my_role() = 'pengawas');

CREATE POLICY "supervisor_schools_update_pengawas" ON public.si7kaih_supervisor_schools
    FOR UPDATE TO authenticated
    USING (public.si7kaih_my_role() = 'pengawas')
    WITH CHECK (public.si7kaih_my_role() = 'pengawas');

CREATE POLICY "supervisor_schools_delete_pengawas" ON public.si7kaih_supervisor_schools
    FOR DELETE TO authenticated
    USING (public.si7kaih_my_role() = 'pengawas');

-- ----------------------------------------------------------------------------
-- 16. Publikasi Realtime
-- ----------------------------------------------------------------------------
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
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.si7kaih_programs;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;`;

  // 2. Skema Penuh (Full Setup)
  const fullSqlCode = `-- ============================================================================
-- SI-7KAIH AI - Skema Basis Data Supabase Lengkap (Setup Awal / Penuh)
-- Mencakup: Pembuatan Tabel Dasar, Kolom Sensitif, Triggers, & RLS Peran
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabel Master Akun Pengguna
CREATE TABLE IF NOT EXISTS public.si7kaih_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    name TEXT,
    role TEXT NOT NULL,
    school_id TEXT,
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.si7kaih_users
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE public.si7kaih_users
SET role = CASE LOWER(role)
    WHEN 'student' THEN 'siswa'
    WHEN 'teacher' THEN 'guru'
    WHEN 'principal' THEN 'kepala_sekolah'
    WHEN 'parent' THEN 'orang_tua'
    WHEN 'supervisor' THEN 'pengawas'
    WHEN 'school_admin' THEN 'guru'
    WHEN 'super_admin' THEN 'pengawas'
    ELSE LOWER(role)
END
WHERE role IS NOT NULL;

ALTER TABLE public.si7kaih_users
    DROP CONSTRAINT IF EXISTS si7kaih_users_role_check;
ALTER TABLE public.si7kaih_users
    ADD CONSTRAINT si7kaih_users_role_check
    CHECK (role IN ('siswa', 'guru', 'kepala_sekolah', 'orang_tua', 'pengawas'));

CREATE INDEX IF NOT EXISTS si7kaih_users_school_id_idx ON public.si7kaih_users (school_id);
CREATE INDEX IF NOT EXISTS si7kaih_users_role_idx ON public.si7kaih_users (role);

-- 2. Tabel Jurnal Harian Siswa
CREATE TABLE IF NOT EXISTS public.si7kaih_journals (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    school_id TEXT,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'SUBMITTED',
    parent_validated BOOLEAN DEFAULT FALSE,
    teacher_validated BOOLEAN DEFAULT FALSE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT si7kaih_journals_student_date_unique UNIQUE (student_id, date)
);

ALTER TABLE public.si7kaih_journals ADD COLUMN IF NOT EXISTS school_id TEXT;
CREATE INDEX IF NOT EXISTS si7kaih_journals_school_idx ON public.si7kaih_journals (school_id);
CREATE INDEX IF NOT EXISTS si7kaih_journals_student_idx ON public.si7kaih_journals (student_id);

-- 3. Tabel Refleksi Bulanan Siswa & Orang Tua
CREATE TABLE IF NOT EXISTS public.si7kaih_reflections (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    school_id TEXT,
    author_id TEXT,
    month INT NOT NULL,
    year INT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.si7kaih_reflections ADD COLUMN IF NOT EXISTS school_id TEXT;
ALTER TABLE public.si7kaih_reflections ADD COLUMN IF NOT EXISTS author_id TEXT;
CREATE INDEX IF NOT EXISTS si7kaih_reflections_school_idx ON public.si7kaih_reflections (school_id);
CREATE INDEX IF NOT EXISTS si7kaih_reflections_target_idx ON public.si7kaih_reflections (target_id);

-- 4. Tabel Lencana / Gamifikasi
CREATE TABLE IF NOT EXISTS public.si7kaih_badges (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE,
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabel Program Sekolah
CREATE TABLE IF NOT EXISTS public.si7kaih_programs (
    id TEXT PRIMARY KEY,
    school_id TEXT,
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS si7kaih_programs_school_idx ON public.si7kaih_programs (school_id);

-- 6. Tabel Rencana Tindak Lanjut (RTL)
CREATE TABLE IF NOT EXISTS public.si7kaih_followups (
    id TEXT PRIMARY KEY,
    school_id TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS si7kaih_followups_school_idx ON public.si7kaih_followups (school_id);

-- 7. Tabel Jejak Rekam / Audit Log
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
CREATE INDEX IF NOT EXISTS si7kaih_audit_logs_school_idx ON public.si7kaih_audit_logs (school_id);
CREATE INDEX IF NOT EXISTS si7kaih_audit_logs_actor_idx ON public.si7kaih_audit_logs (actor_id);

-- 8. Tabel Relasi: Orang Tua-Siswa & Pengawas-Sekolah
CREATE TABLE IF NOT EXISTS public.si7kaih_parent_links (
    id TEXT PRIMARY KEY,
    parent_user_id TEXT NOT NULL REFERENCES public.si7kaih_users(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES public.si7kaih_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT si7kaih_parent_links_unique UNIQUE (parent_user_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.si7kaih_supervisor_schools (
    id TEXT PRIMARY KEY,
    supervisor_id TEXT NOT NULL REFERENCES public.si7kaih_users(id) ON DELETE CASCADE,
    school_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT si7kaih_supervisor_schools_unique UNIQUE (supervisor_id, school_id)
);

-- 9. Fungsi Bantu RLS
CREATE OR REPLACE FUNCTION public.si7kaih_my_app_id()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
    SELECT id FROM public.si7kaih_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.si7kaih_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
    SELECT role FROM public.si7kaih_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.si7kaih_my_school_id()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
    SELECT school_id FROM public.si7kaih_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.si7kaih_is_parent_of(p_student_id TEXT)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.si7kaih_parent_links
        WHERE parent_user_id = public.si7kaih_my_app_id()
        AND student_id = p_student_id
    );
$$;

CREATE OR REPLACE FUNCTION public.si7kaih_supervises_school(p_school_id TEXT)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.si7kaih_supervisor_schools
        WHERE supervisor_id = public.si7kaih_my_app_id()
        AND school_id = p_school_id
    );
$$;

-- 10. Triggers Server-Side
CREATE OR REPLACE FUNCTION public.si7kaih_fill_journal_school()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    NEW.school_id := (SELECT school_id FROM public.si7kaih_users WHERE id = NEW.student_id);
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS si7kaih_journals_fill_school ON public.si7kaih_journals;
CREATE TRIGGER si7kaih_journals_fill_school
    BEFORE INSERT OR UPDATE OF student_id ON public.si7kaih_journals
    FOR EACH ROW EXECUTE FUNCTION public.si7kaih_fill_journal_school();

CREATE OR REPLACE FUNCTION public.si7kaih_fill_reflection_meta()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    NEW.school_id := (SELECT school_id FROM public.si7kaih_users WHERE id = NEW.target_id);
    NEW.author_id := public.si7kaih_my_app_id();
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS si7kaih_reflections_fill_meta ON public.si7kaih_reflections;
CREATE TRIGGER si7kaih_reflections_fill_meta
    BEFORE INSERT ON public.si7kaih_reflections
    FOR EACH ROW EXECUTE FUNCTION public.si7kaih_fill_reflection_meta();

CREATE OR REPLACE FUNCTION public.si7kaih_fill_audit_actor()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    NEW.actor_id := public.si7kaih_my_app_id();
    NEW.actor_role := public.si7kaih_my_role();
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS si7kaih_audit_logs_fill_actor ON public.si7kaih_audit_logs;
CREATE TRIGGER si7kaih_audit_logs_fill_actor
    BEFORE INSERT ON public.si7kaih_audit_logs
    FOR EACH ROW EXECUTE FUNCTION public.si7kaih_fill_audit_actor();

-- 11. Row Level Security & Policies
ALTER TABLE public.si7kaih_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_parent_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_supervisor_schools ENABLE ROW LEVEL SECURITY;

-- 12. Publikasi Realtime
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
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.si7kaih_programs;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;`;

  const currentSql = activeTab === 'REVISION' ? revisionSqlCode : fullSqlCode;

  const handleCopySql = () => {
    navigator.clipboard.writeText(currentSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncAllToSupabase({
        journals,
        studentReflection,
        parentReflection,
        users,
      });
      setSyncFeedback(res.message);
      await refreshSupabaseStatus();
    } catch (err: any) {
      setSyncFeedback(`Gagal: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      id="supabase-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div
        id="supabase-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Koneksi Basis Data Supabase</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-300 text-emerald-950">
                  <ShieldCheck className="w-3 h-3 text-emerald-900" />
                  RLS Berbasis Peran
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Penyimpanan Permanen Jurnal 7 Kebiasaan & Master SIM Sekolah
              </p>
            </div>
          </div>
          <button
            id="close-supabase-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-4">
            <div
              className={`w-4 h-4 rounded-full mt-1 shrink-0 ${
                syncStatus.tablesReady
                  ? 'bg-emerald-500 animate-pulse'
                  : syncStatus.isConnected
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <div className="flex-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  {syncStatus.tablesReady
                    ? '🟢 Supabase Aktif & Sinkronisasi Permanen'
                    : syncStatus.isConnected
                    ? '🟡 Terhubung ke Supabase (Menunggu Skema Tabel)'
                    : '🔴 Menghubungkan ke Supabase...'}
                </span>
                <button
                  onClick={() => refreshSupabaseStatus()}
                  className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Periksa Ulang
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1">{syncStatus.statusMessage}</p>
              <div className="mt-2 text-xs font-mono text-slate-500 truncate">
                Target URL: <span className="text-emerald-700 font-semibold">{SUPABASE_CONFIG.url}</span>
              </div>
              {syncStatus.lastSyncedAt && (
                <div className="mt-1 text-xs text-slate-500">
                  Terakhir sinkron: {new Date(syncStatus.lastSyncedAt).toLocaleTimeString('id-ID')}
                </div>
              )}
            </div>
          </div>

          {/* Real-time Multi-User Auto-Sync Banner */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
                <Zap className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Sinkronisasi Otomatis Antar Pengguna: AKTIF</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Real-Time Live
              </span>
            </div>
            <p className="text-xs text-emerald-800/90 leading-relaxed">
              Setiap kali siswa mengisi jurnal di perangkatnya, atau orang tua/guru melakukan validasi kebiasaan, data akan disinkronkan secara otomatis tanpa perlu memuat ulang halaman.
            </p>
            <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-700">
              <span className="font-mono">
                Transaksi Otomatis: <strong className="text-emerald-900">{syncStatus.syncCount} pembaruan</strong>
              </span>
              <span className="text-emerald-600 italic">
                {syncStatus.lastSyncEvent || 'Mendengarkan event realtime...'}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              id="sync-now-supabase-btn"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Data Sekarang'}
            </button>

            <button
              id="copy-sql-schema-btn"
              onClick={handleCopySql}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedSql
                ? 'Skema SQL Berhasil Disalin!'
                : activeTab === 'REVISION'
                ? 'Salin Revisi RLS SQL (File Lampiran)'
                : 'Salin Skema Lengkap Supabase'}
            </button>
          </div>

          {syncFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {/* Tab Selector: Revisi RLS vs Skema Lengkap */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-600" />
                <span>Pilih Skema SQL untuk Dijalankan:</span>
              </h3>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('REVISION')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'REVISION'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Revisi RLS (Lampiran)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('FULL')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'FULL'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Skema Lengkap</span>
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>
                  {activeTab === 'REVISION'
                    ? 'Panduan Menjalankan Revisi Skema RLS Berbasis Peran:'
                    : 'Panduan Menjalankan Skema SQL Lengkap (Setup Awal):'}
                </span>
              </div>
              <ol className="text-slate-600 space-y-1.5 list-decimal list-inside pl-0.5 leading-relaxed">
                <li>
                  Klik tombol <strong>"Salin {activeTab === 'REVISION' ? 'Revisi RLS SQL' : 'Skema Lengkap Supabase'}"</strong> di atas.
                </li>
                <li>
                  Buka tab <strong>Supabase Dashboard</strong> proyek Anda, masuk ke menu{' '}
                  <span className="font-semibold text-slate-800">SQL Editor</span>, dan buat query baru.
                </li>
                <li>
                  Tempel (Paste) kode SQL tersebut lalu klik <strong>"Run"</strong>.
                  {activeTab === 'REVISION'
                    ? ' Skema akan menambahkan relasi orang tua-siswa, pengawas, fungsi keamanan, dan kebijakan RLS per peran.'
                    : ' Seluruh tabel dasar dan kebijakan RLS akan otomatis terkonfigurasi tuntas.'}
                </li>
              </ol>
            </div>

            {/* Code Preview Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700">
                  {activeTab === 'REVISION'
                    ? 'Pratinjau: supabase/migrations/20260927000002_role_based_security_revision.sql'
                    : 'Pratinjau: supabase/schema.sql (Lengkap)'}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {activeTab === 'REVISION' ? 'File Lampiran Pengguna' : 'Master Skema Lengkap'}
                </span>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed border border-slate-800 select-all">
                {currentSql}
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Kredensial URL & Key dikonfigurasi melalui Secrets
          </span>
          <button
            id="close-supabase-modal-footer-btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
