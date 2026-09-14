-- ============================================================================
-- SI-7KAIH AI - Production Database Migration
-- Sistem Jurnal dan Monitoring Tujuh Kebiasaan Anak Indonesia Hebat Berbasis AI
-- PostgreSQL + Supabase RLS Schema
-- ============================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. REGIONS
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- e.g. "2025/2026"
    semester VARCHAR(10) NOT NULL, -- "GANJIL" | "GENAP"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SCHOOLS
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
    npsn VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PROFILES (Users linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- references auth.users(id)
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. USER ROLES (RBAC with explicit roles)
CREATE TYPE user_role_enum AS ENUM (
    'STUDENT',
    'PARENT',
    'TEACHER',
    'PRINCIPAL',
    'SUPERVISOR',
    'SCHOOL_ADMIN',
    'SUPER_ADMIN'
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, role, school_id)
);

-- 6. CLASSES
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    name VARCHAR(50) NOT NULL, -- e.g. "Kelas 4-A"
    grade_level INT NOT NULL, -- 1 to 12
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. STUDENTS
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    nisn VARCHAR(20) NOT NULL UNIQUE,
    gender VARCHAR(10) NOT NULL, -- 'L' | 'P'
    birth_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CLASS STUDENTS
CREATE TABLE IF NOT EXISTS class_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(class_id, student_id, academic_year_id)
);

-- 9. PARENTS
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL DEFAULT 'ORANG_TUA', -- AYAH | IBU | WALI
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PARENT STUDENTS (Constraint: UNIQUE(parent_id, student_id))
CREATE TABLE IF NOT EXISTS parent_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

-- 11. TEACHERS
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    nip VARCHAR(30),
    specialization VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. TEACHER CLASSES (Assigned classes for teachers / homeroom)
CREATE TABLE IF NOT EXISTS teacher_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    is_homeroom BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(teacher_id, class_id)
);

-- 13. SUPERVISORS
CREATE TABLE IF NOT EXISTS supervisors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
    nip VARCHAR(30),
    rank_grade VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. SCHOOL SUPERVISORS (Constraint: UNIQUE(supervisor_id, school_id))
CREATE TABLE IF NOT EXISTS school_supervisors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supervisor_id UUID NOT NULL REFERENCES supervisors(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(supervisor_id, school_id)
);

-- 15. HABITS (System Master Records - Protected from Deletion)
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    target_description TEXT NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    display_order INT NOT NULL,
    is_system_master BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. HABIT FORM CONFIGS
CREATE TABLE IF NOT EXISTS habit_form_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE RESTRICT,
    field_schema JSONB NOT NULL,
    validation_rules JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. DAILY JOURNALS (Constraint: UNIQUE(student_id, journal_date))
CREATE TYPE journal_status_enum AS ENUM (
    'NOT_SUBMITTED',
    'DRAFT',
    'SUBMITTED_COMPLETED',
    'SUBMITTED_NOT_COMPLETED',
    'PENDING_VALIDATION',
    'VALIDATED',
    'CORRECTION_REQUESTED'
);

CREATE TABLE IF NOT EXISTS daily_journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    journal_date DATE NOT NULL,
    status journal_status_enum NOT NULL DEFAULT 'NOT_SUBMITTED',
    completed_count INT NOT NULL DEFAULT 0 CHECK (completed_count BETWEEN 0 AND 7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, journal_date)
);

-- 18. DAILY HABIT ENTRIES (Constraint: UNIQUE(daily_journal_id, habit_id))
CREATE TYPE validation_status_enum AS ENUM (
    'PENDING',
    'VALIDATED',
    'CORRECTION_REQUESTED',
    'CORRECTED'
);

CREATE TABLE IF NOT EXISTS daily_habit_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_journal_id UUID NOT NULL REFERENCES daily_journals(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE RESTRICT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    payload JSONB NOT NULL DEFAULT '{}',
    validation_status validation_status_enum NOT NULL DEFAULT 'PENDING',
    parent_validated BOOLEAN NOT NULL DEFAULT FALSE,
    teacher_validated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(daily_journal_id, habit_id)
);

-- 19. HABIT VALIDATIONS (Audit history preserved, never overwritten)
CREATE TABLE IF NOT EXISTS habit_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES daily_habit_entries(id) ON DELETE CASCADE,
    validator_role VARCHAR(20) NOT NULL, -- 'PARENT' | 'TEACHER'
    validator_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    status validation_status_enum NOT NULL,
    note TEXT,
    validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. MONTHLY HABIT SUMMARIES
CREATE TABLE IF NOT EXISTS monthly_habit_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE RESTRICT,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    days_in_month INT NOT NULL,
    recorded_days INT NOT NULL,
    completed_days INT NOT NULL,
    threshold_days INT NOT NULL,
    completeness_rate NUMERIC(5, 2) NOT NULL,
    consistency_rate NUMERIC(5, 2) NOT NULL,
    habitual_status VARCHAR(30) NOT NULL, -- 'SUDAH_TERBIASA' | 'BELUM_TERBIASA'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, habit_id, month, year)
);

-- 21. MONTHLY REFLECTIONS (Student)
CREATE TABLE IF NOT EXISTS monthly_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    easiest_habit_id UUID REFERENCES habits(id),
    hardest_habit_id UUID REFERENCES habits(id),
    root_cause TEXT,
    action_plan TEXT,
    next_month_target TEXT,
    ai_suggested_target TEXT, -- AI recommendation stored separately
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, month, year)
);

-- 22. PARENT REFLECTIONS
CREATE TABLE IF NOT EXISTS parent_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    observed_change TEXT NOT NULL,
    difficulty TEXT,
    family_support TEXT NOT NULL,
    parent_note TEXT,
    next_month_support TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(parent_id, student_id, month, year)
);

-- 23. TEACHER NOTES
CREATE TABLE IF NOT EXISTS teacher_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'MENTORING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. SCHOOL PROGRAMS
CREATE TABLE IF NOT EXISTS school_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    participant_scope VARCHAR(100) NOT NULL,
    schedule VARCHAR(100) NOT NULL,
    pic VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    result_note TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. PROGRAM TARGETS & EVIDENCE
CREATE TABLE IF NOT EXISTS program_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES school_programs(id) ON DELETE CASCADE,
    target_metric VARCHAR(100) NOT NULL,
    target_value NUMERIC(6, 2) NOT NULL,
    current_value NUMERIC(6, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS program_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES school_programs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 26. FOLLOW-UP PLANS (RTL - Rencana Tindak Lanjut)
CREATE TYPE root_cause_type_enum AS ENUM (
    'FACT',
    'INFERENCE',
    'HYPOTHESIS_TO_VERIFY'
);

CREATE TYPE follow_up_status_enum AS ENUM (
    'DRAFT',
    'ACTIVE',
    'ON_TRACK',
    'AT_RISK',
    'OVERDUE',
    'COMPLETED',
    'VERIFIED'
);

CREATE TABLE IF NOT EXISTS follow_up_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    finding TEXT NOT NULL,
    supporting_data TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    root_cause_type root_cause_type_enum NOT NULL DEFAULT 'HYPOTHESIS_TO_VERIFY',
    action_plan TEXT NOT NULL,
    target TEXT NOT NULL,
    indicator TEXT NOT NULL,
    owner VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    deadline DATE NOT NULL,
    progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    status follow_up_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follow_up_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES follow_up_plans(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    progress_percent INT NOT NULL,
    status follow_up_status_enum NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 27. MONITORING RECORDS (School & Supervisor tracking)
CREATE TABLE IF NOT EXISTS monitoring_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    supervisor_id UUID REFERENCES supervisors(id),
    category VARCHAR(50) NOT NULL,
    observations TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    monitored_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 28. BADGES & STUDENT BADGES (Gamification - No character ranking)
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    criteria JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, badge_id)
);

-- 29. NOTIFICATIONS & PREFERENCES
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    journal_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    validation_request BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_digest BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 30. AI ANALYSES & AI AUDIT LOGS
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    actor_role VARCHAR(30) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    school_id UUID REFERENCES schools(id),
    student_id UUID REFERENCES students(id),
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    task_type VARCHAR(50) NOT NULL,
    model_provider VARCHAR(50) NOT NULL,
    latency_ms INT,
    input_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 31. SYSTEM SETTINGS & FEATURE FLAGS
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_flags (
    name VARCHAR(100) PRIMARY KEY,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 32. AUDIT LOGS (Immutable security logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    actor_name VARCHAR(255),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    school_id UUID REFERENCES schools(id),
    before_data JSONB,
    after_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Default rule: DENY all unless explicitly permitted
-- ============================================================================

ALTER TABLE daily_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Student Access Policy: Students can view and manage only their own journal records
CREATE POLICY "Student access own journals" ON daily_journals
    FOR ALL
    USING (
        student_id IN (
            SELECT id FROM students WHERE profile_id = auth.uid()
        )
    );

-- 2. Parent Access Policy: Parents can access journals of linked students
CREATE POLICY "Parent access linked student journals" ON daily_journals
    FOR SELECT
    USING (
        student_id IN (
            SELECT ps.student_id FROM parent_students ps
            JOIN parents p ON p.id = ps.parent_id
            WHERE p.profile_id = auth.uid()
        )
    );

-- 3. Teacher Access Policy: Teachers can access journals of students in assigned classes
CREATE POLICY "Teacher access assigned class journals" ON daily_journals
    FOR SELECT
    USING (
        student_id IN (
            SELECT cs.student_id FROM class_students cs
            JOIN teacher_classes tc ON tc.class_id = cs.class_id
            JOIN teachers t ON t.id = tc.teacher_id
            WHERE t.profile_id = auth.uid()
        )
    );

-- 4. Principal Access Policy: Principal can access journals within their school scope
CREATE POLICY "Principal access school journals" ON daily_journals
    FOR SELECT
    USING (
        school_id IN (
            SELECT p.school_id FROM profiles p
            JOIN user_roles ur ON ur.profile_id = p.id
            WHERE p.auth_user_id = auth.uid() AND ur.role = 'PRINCIPAL'
        )
    );

-- 5. Supervisor Aggregate Access Policy: Supervisor can query aggregate metrics for assigned schools
CREATE POLICY "Supervisor access foster schools" ON daily_journals
    FOR SELECT
    USING (
        school_id IN (
            SELECT ss.school_id FROM school_supervisors ss
            JOIN supervisors s ON s.id = ss.supervisor_id
            WHERE s.profile_id = auth.uid()
        )
    );
