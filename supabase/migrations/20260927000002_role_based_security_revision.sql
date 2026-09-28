-- ============================================================================
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

-- Signup mandiri hanya boleh membuat profil dengan role 'siswa'. Akun
-- guru/kepala_sekolah/orang_tua/pengawas sebaiknya dibuat lewat proses admin
-- (mis. Edge Function dengan service role key), bukan lewat insert dari klien.
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

-- Catatan: policy update ini masih mengizinkan guru/kepsek mengubah seluruh
-- baris (termasuk isi data JSONB), bukan hanya kolom validasi. Kalau perlu
-- dibatasi hanya ke kolom teacher_validated, tambahkan trigger yang menolak
-- perubahan data JSONB dari peran selain siswa pemilik jurnal.
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
-- Tidak ada policy DELETE untuk journals -> ditolak untuk semua peran.

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
-- 11. Policy: si7kaih_badges (data referensi, baca untuk semua yang login)
-- ----------------------------------------------------------------------------
CREATE POLICY "badges_select_all_authenticated" ON public.si7kaih_badges
    FOR SELECT TO authenticated
    USING (true);
-- Sengaja tidak ada policy INSERT/UPDATE/DELETE -> hanya bisa dikelola lewat
-- Supabase dashboard atau service role key, bukan dari aplikasi klien.

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
-- 14. Policy: si7kaih_audit_logs (log tidak boleh diubah/dihapus siapa pun)
-- ----------------------------------------------------------------------------
CREATE POLICY "audit_logs_insert_own_action" ON public.si7kaih_audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);
-- actor_id/actor_role diisi otomatis oleh trigger, bukan dari input klien.

CREATE POLICY "audit_logs_select_kepsek_pengawas" ON public.si7kaih_audit_logs
    FOR SELECT TO authenticated
    USING (
        (public.si7kaih_my_role() = 'kepala_sekolah' AND school_id = public.si7kaih_my_school_id())
        OR (public.si7kaih_my_role() = 'pengawas' AND public.si7kaih_supervises_school(school_id))
    );
-- Sengaja tidak ada policy UPDATE/DELETE untuk siapa pun -> log bersifat permanen.

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
-- 16. Publikasi Realtime (dipertahankan dari skema sebelumnya)
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
END $$;
