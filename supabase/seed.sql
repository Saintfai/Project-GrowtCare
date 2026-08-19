-- ============================================================
-- Seed Data untuk Project GrowtCare
-- Berisi data dummy untuk Users, Patients, dan Measurements
-- ============================================================

-- 1. Tambahan Users (Opsional, admin default sudah dibuat di migration)
INSERT INTO public.users (id, username, password_hash, full_name, role, is_active, must_change_password)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'dokter_anak', crypt('dokter123', gen_salt('bf', 10)), 'Dr. Andi (Dokter Anak)', 'admin', true, false),
  ('22222222-2222-2222-2222-222222222222', 'perawat_kia', crypt('perawat123', gen_salt('bf', 10)), 'Siti (Perawat KIA)', 'admin', true, false)
ON CONFLICT (username) DO NOTHING;

-- 2. Patients (Pasien Balita Dummy)
INSERT INTO public.patients (id, medical_record_no, name, gender, date_of_birth, identity_number, parent_name, parent_phone, created_by)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'RS-2026-00001', 'Budi Santoso', 'L', '2023-01-15', '3171234567890001', 'Bapak Santoso', '081234567890', '11111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-444444444444', 'RS-2026-00002', 'Aisyah Putri', 'P', '2024-05-10', '3171234567890002', 'Ibu Aminah', '081298765432', '22222222-2222-2222-2222-222222222222'),
  ('55555555-5555-5555-5555-555555555555', 'RS-2026-00003', 'Kevin Wijaya', 'L', '2025-11-20', '3171234567890003', 'Bapak Wijaya', '081211223344', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- 3. Measurements (Riwayat Pengukuran Dummy)
INSERT INTO public.measurements 
  (id, patient_id, measured_at, weight_kg, height_cm, measurement_method, height_cm_corrected, age_months_decimal, age_display, bmi, z_score_bbu, z_score_tbu, z_score_bbtb, z_score_imtu, status_gizi_bbu, status_gizi_tbu, status_gizi_bbtb, status_gizi_imtu, input_source, created_by)
VALUES 
  -- Pengukuran Budi Santoso (Lahir 2023-01-15)
  -- Usia 1 Bulan (2023-02-15)
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '2023-02-15', 4.5, 54.5, 'berbaring', 54.5, 1.0, '1 Bulan', 15.15, 0.0, 0.0, 0.0, 0.0, 'Berat Badan Normal', 'Normal', 'Gizi Baik', 'Gizi Baik', 'manual', '11111111-1111-1111-1111-111111111111'),
  -- Usia 6 Bulan (2023-07-15)
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '2023-07-15', 7.9, 67.6, 'berbaring', 67.6, 6.0, '6 Bulan', 17.28, 0.0, 0.0, 0.0, 0.0, 'Berat Badan Normal', 'Normal', 'Gizi Baik', 'Gizi Baik', 'manual', '22222222-2222-2222-2222-222222222222'),
  -- Usia 12 Bulan (2024-01-15)
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '2024-01-15', 9.6, 75.7, 'berbaring', 75.7, 12.0, '12 Bulan', 16.75, -0.1, 0.0, -0.2, -0.1, 'Berat Badan Normal', 'Normal', 'Gizi Baik', 'Gizi Baik', 'manual', '11111111-1111-1111-1111-111111111111'),

  -- Pengukuran Aisyah Putri (Lahir 2024-05-10)
  -- Usia 2 Bulan (2024-07-10)
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '2024-07-10', 5.1, 57.1, 'berbaring', 57.1, 2.0, '2 Bulan', 15.64, 0.0, 0.0, 0.0, 0.0, 'Berat Badan Normal', 'Normal', 'Gizi Baik', 'Gizi Baik', 'manual', '22222222-2222-2222-2222-222222222222'),
  -- Usia 9 Bulan (2025-02-10)
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '2025-02-10', 7.5, 70.1, 'berbaring', 70.1, 9.0, '9 Bulan', 15.26, -1.0, -0.5, -1.0, -1.0, 'Berat Badan Normal', 'Normal', 'Gizi Baik', 'Gizi Baik', 'manual', '22222222-2222-2222-2222-222222222222'),

  -- Pengukuran Kevin Wijaya (Lahir 2025-11-20)
  -- Usia 0 Bulan / Baru Lahir (2025-11-20)
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '2025-11-20', 3.3, 49.9, 'berbaring', 49.9, 0.0, '0 Bulan', 13.25, 0.0, 0.0, 0.0, 0.0, 'Berat Badan Normal', 'Normal', 'Gizi Baik', 'Gizi Baik', 'manual', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;
