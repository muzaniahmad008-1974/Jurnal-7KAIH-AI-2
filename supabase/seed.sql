-- ============================================================================
-- SI-7KAIH AI - Seed Data (Development Fixtures)
-- 1 Region, 1 Supervisor, 4 Foster Schools, Principals, Teachers, Students, Parents,
-- 7 Standard Habits, Programs, RTL, and Badges
-- ============================================================================

-- 1. SEED HABITS (Standard System Master Records)
INSERT INTO habits (id, code, name, description, target_description, icon_name, display_order, is_system_master) VALUES
('b1000000-0000-0000-0000-000000000001', 'WAKE_EARLY', 'Bangun Pagi', 'Membiasakan bangun lebih awal dengan suasana hati segar untuk menyambut hari.', 'Bangun pagi pukul 04:30 - 06:00 dengan ceria.', 'Sun', 1, TRUE),
('b1000000-0000-0000-0000-000000000002', 'WORSHIP', 'Beribadah', 'Melaksanakan ibadah sesuai agama dan keyakinan masing-masing secara tulus.', 'Melaksanakan ibadah harian sesuai tuntunan keluarga.', 'HeartHandshake', 2, TRUE),
('b1000000-0000-0000-0000-000000000003', 'EXERCISE', 'Berolahraga', 'Melakukan aktivitas fisik minimal 15-30 menit untuk menjaga kebugaran tubuh.', 'Aktivitas fisik, senam, jalan santai, atau olahraga permainan.', 'Activity', 3, TRUE),
('b1000000-0000-0000-0000-000000000004', 'HEALTHY_EATING', 'Makan Sehat dan Bergizi', 'Membiasakan sarapan bergizi seimbang, mengonsumsi sayur/buah, dan cukup minum air putih.', 'Sarapan sehat bernutrisi seimbang dan minum air putih.', 'Apple', 4, TRUE),
('b1000000-0000-0000-0000-000000000005', 'LEARNING', 'Gemar Belajar', 'Menumbuhkan kecintaan membaca buku atau eksplorasi ilmu pengetahuan baru secara mandiri.', 'Membaca atau belajar mandiri minimal 15 menit per hari.', 'BookOpen', 5, TRUE),
('b1000000-0000-0000-0000-000000000006', 'SOCIAL', 'Bermasyarakat', 'Berinteraksi positif, membantu orang tua, menyapa tetangga, atau gotong royong.', 'Melakukan perbuatan baik dan kepedulian lingkungan sosial.', 'Users', 6, TRUE),
('b1000000-0000-0000-0000-000000000007', 'SLEEP_EARLY', 'Tidur Cepat', 'Membiasakan tidur tepat waktu sebelum pukul 21:30 dan membatasi layar sebelum tidur.', 'Tidur malam cukup (8-9 jam) bebas gawai sebelum tidur.', 'Moon', 7, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 2. SEED REGION
INSERT INTO regions (id, code, name, province, city) VALUES
('r1000000-0000-0000-0000-000000000001', 'REG-BDG-01', 'Wilayah Binaan I Kota Bandung', 'Jawa Barat', 'Kota Bandung')
ON CONFLICT (code) DO NOTHING;

-- 3. SEED ACADEMIC YEAR
INSERT INTO academic_years (id, name, semester, start_date, end_date, is_active) VALUES
('a1000000-0000-0000-0000-000000000001', '2025/2026', 'GANJIL', '2025-07-15', '2025-12-20', TRUE)
ON CONFLICT DO NOTHING;

-- 4. SEED 4 FOSTER SCHOOLS
INSERT INTO schools (id, region_id, npsn, name, address, phone, email) VALUES
('s1000000-0000-0000-0000-000000000001', 'r1000000-0000-0000-0000-000000000001', '20210001', 'SDN 01 Nusantara', 'Jl. Merdeka No. 45, Bandung', '022-710001', 'sdn01nusantara@edu.id'),
('s1000000-0000-0000-0000-000000000002', 'r1000000-0000-0000-0000-000000000001', '20210002', 'SDN 02 Harapan Bangsa', 'Jl. Diponegoro No. 12, Bandung', '022-710002', 'sdn02harapan@edu.id'),
('s1000000-0000-0000-0000-000000000003', 'r1000000-0000-0000-0000-000000000001', '20210003', 'SDN 03 Bintang Juara', 'Jl. Asia Afrika No. 88, Bandung', '022-710003', 'sdn03bintang@edu.id'),
('s1000000-0000-0000-0000-000000000004', 'r1000000-0000-0000-0000-000000000001', '20210004', 'SD Perintis Hebat', 'Jl. Riau No. 24, Bandung', '022-710004', 'sdperintis@edu.id')
ON CONFLICT (npsn) DO NOTHING;

-- 5. SEED BADGES (Gamification without character ranking)
INSERT INTO badges (id, code, title, description, icon_name, criteria) VALUES
('bd100000-0000-0000-0000-000000000001', 'STREAK_7', 'Konsisten 7 Hari', 'Berhasil mencatat jurnal harian 7 hari berturut-turut.', 'Flame', '{"streakDays": 7}'),
('bd100000-0000-0000-0000-000000000002', 'EARLY_BIRD', 'Bangun Pagi Hebat', 'Bangun pagi segar dan bersemangat selama 14 hari dalam sebulan.', 'SunMedium', '{"habit": "WAKE_EARLY", "count": 14}'),
('bd100000-0000-0000-0000-000000000003', 'HEALTHY_CHAMP', 'Sahabat Sehat', 'Makan sayur, buah, dan cukup minum air selama 14 hari.', 'Apple', '{"habit": "HEALTHY_EATING", "count": 14}'),
('bd100000-0000-0000-0000-000000000004', 'ACTIVE_MOVER', 'Aktif Bergerak', 'Berolahraga dan beraktivitas fisik menyenangkan selama 14 hari.', 'Activity', '{"habit": "EXERCISE", "count": 14}'),
('bd100000-0000-0000-0000-000000000005', 'CURIOUS_READER', 'Pembelajar Hebat', 'Membaca buku dan menemukan hal baru secara mandiri selama 14 hari.', 'BookOpenCheck', '{"habit": "LEARNING", "count": 14}'),
('bd100000-0000-0000-0000-000000000006', 'HELPING_HAND', 'Peduli Sesama', 'Melakukan aksi sosial dan membantu sesama secara rutin.', 'Heart', '{"habit": "SOCIAL", "count": 10}')
ON CONFLICT (code) DO NOTHING;

-- 6. SEED SCHOOL PROGRAMS (Programs mapped to habits)
INSERT INTO school_programs (id, school_id, habit_id, title, description, participant_scope, schedule, pic, start_date, is_active) VALUES
('p1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'Senam Bersama Ceria', 'Senam kesegaran jasmani dan gerak irama bersama di lapangan sekolah.', 'Seluruh Siswa Kelas 1-6', 'Setiap Selasa & Jumat 06:45 - 07:15', 'Pak Ahmad Fauzi, S.Pd.', '2025-08-01', TRUE),
('p1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'Jumat Bersih & Berbagi', 'Aksi gotong royong membersihkan kelas dan berbagi makanan sehat sederhana.', 'Fase A, B, C', 'Setiap Jumat 07:30 - 08:30', 'Ibu Siti Rahayu, S.Pd.', '2025-08-01', TRUE),
('p1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', '15 Menit Membaca Senyap', 'Membaca buku cerita non-pelajaran di sudut baca kelas sebelum pelajaran dimulai.', 'Seluruh Siswa', 'Senin - Kamis 07:00 - 07:15', 'Ibu Ratna Komalasari, M.Pd.', '2025-08-01', TRUE),
('p1000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'Kantin Sehat & Buah Ceria', 'Edukasi jajanan bernutrisi dan penyediaan buah potong segar di kantin sekolah.', 'Warga Sekolah', 'Setiap Hari Sekolah', 'Koordinator UKS', '2025-08-01', TRUE)
ON CONFLICT DO NOTHING;

-- 7. SEED FOLLOW-UP PLANS (RTL)
INSERT INTO follow_up_plans (id, school_id, finding, supporting_data, root_cause, root_cause_type, action_plan, target, indicator, owner, start_date, deadline, progress_percent, status) VALUES
('f1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'Pembiasaan Tidur Cepat di Kelas 4-A masih memerlukan pendampingan waktu tidur.', 'Tercatat rata-rata waktu tidur di atas jam 21:45 pada 35% siswa.', 'Paparan gawai tanpa batas waktu sebelum istirahat malam.', 'HYPOTHESIS_TO_VERIFY', 'Sosialisasi "Gerakan 30 Menit Bebas Gawai Sebelum Tidur" bersama orang tua.', '80% siswa tidur sebelum 21:30', 'Peningkatan konsistensi tidur cepat sebesar 20 poin persentase', 'Guru Kelas 4-A & Komite Orang Tua', '2025-08-15', '2025-09-30', 65, 'ON_TRACK')
ON CONFLICT DO NOTHING;
