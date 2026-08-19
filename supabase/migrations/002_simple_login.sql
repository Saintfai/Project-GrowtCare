-- ============================================================
-- Migration 002: Simple Custom Login & Bypass RLS untuk Testing UI
-- ============================================================

-- 1. Buka (Bypass) RLS Sementara untuk tabel-tabel utama
-- Kita drop policy lama yang mewajibkan JWT, dan ganti dengan true (bisa diakses publik / anon).

-- PATIENTS
DROP POLICY IF EXISTS "patients_select" ON public.patients;
DROP POLICY IF EXISTS "patients_insert" ON public.patients;
DROP POLICY IF EXISTS "patients_update" ON public.patients;
DROP POLICY IF EXISTS "patients_delete" ON public.patients;

CREATE POLICY "patients_select" ON public.patients FOR SELECT USING (true);
CREATE POLICY "patients_insert" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "patients_update" ON public.patients FOR UPDATE USING (true);
CREATE POLICY "patients_delete" ON public.patients FOR DELETE USING (true);

-- MEASUREMENTS
DROP POLICY IF EXISTS "measurements_select" ON public.measurements;
DROP POLICY IF EXISTS "measurements_insert" ON public.measurements;
DROP POLICY IF EXISTS "measurements_update" ON public.measurements;
DROP POLICY IF EXISTS "measurements_delete" ON public.measurements;

CREATE POLICY "measurements_select" ON public.measurements FOR SELECT USING (true);
CREATE POLICY "measurements_insert" ON public.measurements FOR INSERT WITH CHECK (true);
CREATE POLICY "measurements_update" ON public.measurements FOR UPDATE USING (true);
CREATE POLICY "measurements_delete" ON public.measurements FOR DELETE USING (true);


-- 2. Buat fungsi RPC untuk mengecek login (username & password)
-- Fungsi ini akan dijalankan secara SECURITY DEFINER agar bisa melihat password_hash.

CREATE OR REPLACE FUNCTION public.check_login(p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user record;
BEGIN
  -- Cari user berdasarkan username
  SELECT id, username, full_name, role, password_hash 
  INTO v_user
  FROM public.users
  WHERE username = p_username AND is_active = true;

  -- Jika user tidak ditemukan
  IF v_user IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Username tidak ditemukan atau tidak aktif');
  END IF;

  -- Cocokkan password menggunakan pgcrypto (crypt)
  IF v_user.password_hash = crypt(p_password, v_user.password_hash) THEN
    -- Sukses
    RETURN json_build_object(
      'success', true, 
      'user', json_build_object(
        'id', v_user.id,
        'username', v_user.username,
        'full_name', v_user.full_name,
        'role', v_user.role
      )
    );
  ELSE
    -- Password salah
    RETURN json_build_object('success', false, 'message', 'Password salah');
  END IF;
END;
$$;
