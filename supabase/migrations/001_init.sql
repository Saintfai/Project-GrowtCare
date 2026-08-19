-- ============================================================
-- GrowtCare — Migration 001: Initial Schema
-- Berdasarkan PRD v0.3
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
create extension if not exists pgcrypto;   -- untuk gen_random_uuid()
create extension if not exists pg_trgm;    -- untuk fuzzy search nama pasien

-- ============================================================
-- 2. HELPER FUNCTIONS
-- ============================================================

-- Auto-update kolom updated_at saat UPDATE
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 3. TABEL USERS (auth custom, tanpa email)
-- ============================================================
create table public.users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  full_name text not null,
  role text not null default 'admin' check (role in ('admin')),
  is_active boolean not null default true,
  must_change_password boolean not null default true,
  last_login_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at_users
  before update on public.users
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 4. TABEL LOGIN_ATTEMPTS (rate limiting)
-- ============================================================
create table public.login_attempts (
  username text primary key,
  attempt_count integer not null default 1,
  window_start timestamptz not null default now()
);

-- ============================================================
-- 5. TABEL PATIENTS
-- ============================================================

-- Sequence untuk auto-generate nomor urut No. RM
create sequence if not exists public.patient_seq_default;

-- Function untuk generate No. RM: RS-[tahun]-[urutan]
create or replace function public.generate_medical_record_no()
returns text
language plpgsql
as $$
declare
  next_val bigint;
begin
  select nextval('public.patient_seq_default') into next_val;
  return 'RS-' || extract(year from now())::text || '-' || lpad(next_val::text, 5, '0');
end;
$$;

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  medical_record_no text unique not null default public.generate_medical_record_no(),
  name text not null,
  gender text not null check (gender in ('L','P')),
  date_of_birth date not null,
  identity_number text,
  parent_name text,
  parent_phone text,
  is_active boolean not null default true,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index untuk fuzzy search nama
create index idx_patients_name on public.patients using gin (name gin_trgm_ops);
-- Index untuk search No. RM
create index idx_patients_mrn on public.patients (medical_record_no);

create trigger set_updated_at_patients
  before update on public.patients
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 7. TABEL MEASUREMENTS
-- ============================================================
create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  measured_at date not null,
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  measurement_method text check (measurement_method in ('berdiri','berbaring')),
  height_cm_corrected numeric(5,2),
  age_months_decimal numeric(6,2) not null,
  age_display text not null,
  bmi numeric(5,2),
  z_score_bbu numeric(4,2),
  z_score_tbu numeric(4,2),
  z_score_bbtb numeric(4,2),
  z_score_imtu numeric(4,2),
  status_gizi_bbu text,
  status_gizi_tbu text,
  status_gizi_bbtb text,
  status_gizi_imtu text,
  input_source text not null default 'manual' check (input_source in ('manual','excel_import')),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_measurements_patient on public.measurements (patient_id, measured_at);

create trigger set_updated_at_measurements
  before update on public.measurements
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 8. TABEL IMPORT_LOGS (Fase 2, tapi struktur disiapkan)
-- ============================================================
create table public.import_logs (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid references public.users(id),
  filename text not null,
  total_rows integer not null,
  success_rows integer not null,
  failed_rows integer not null,
  error_detail jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 9. TABEL ACTIVITY_LOGS (Fase 2, tapi struktur disiapkan)
-- ============================================================
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  action text not null,
  target_table text,
  target_id uuid,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index idx_activity_logs_user on public.activity_logs (user_id, created_at);

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Aktifkan RLS di semua tabel
alter table public.users enable row level security;
alter table public.patients enable row level security;
alter table public.measurements enable row level security;
alter table public.login_attempts enable row level security;
alter table public.import_logs enable row level security;
alter table public.activity_logs enable row level security;

-- USERS: semua akun aktif yang login bisa lihat & kelola
create policy "users_select" on public.users
  for select using (auth.jwt() ->> 'sub' is not null);

create policy "users_insert" on public.users
  for insert with check (
    exists (
      select 1 from public.users u
      where u.id = (auth.jwt() ->> 'sub')::uuid and u.is_active
    )
  );

create policy "users_update" on public.users
  for update using (
    exists (
      select 1 from public.users u
      where u.id = (auth.jwt() ->> 'sub')::uuid and u.is_active
    )
  );

-- PATIENTS: semua akun aktif bisa CRUD
create policy "patients_select" on public.patients
  for select using (auth.jwt() ->> 'sub' is not null);

create policy "patients_insert" on public.patients
  for insert with check (
    exists (
      select 1 from public.users u
      where u.id = (auth.jwt() ->> 'sub')::uuid and u.is_active
    )
  );

create policy "patients_update" on public.patients
  for update using (
    exists (
      select 1 from public.users u
      where u.id = (auth.jwt() ->> 'sub')::uuid and u.is_active
    )
  );

create policy "patients_delete" on public.patients
  for delete using (
    exists (
      select 1 from public.users u
      where u.id = (auth.jwt() ->> 'sub')::uuid and u.is_active
    )
  );

-- MEASUREMENTS: semua akun aktif bisa CRUD
create policy "measurements_select" on public.measurements
  for select using (auth.jwt() ->> 'sub' is not null);

create policy "measurements_insert" on public.measurements
  for insert with check (
    exists (
      select 1 from public.users u
      where u.id = (auth.jwt() ->> 'sub')::uuid and u.is_active
    )
  );

create policy "measurements_update" on public.measurements
  for update using (
    exists (
      select 1 from public.users u
      where u.id = (auth.jwt() ->> 'sub')::uuid and u.is_active
    )
  );

create policy "measurements_delete" on public.measurements
  for delete using (
    exists (
      select 1 from public.users u
      where u.id = (auth.jwt() ->> 'sub')::uuid and u.is_active
    )
  );

-- LOGIN_ATTEMPTS: hanya bisa diakses lewat Edge Function (service role)
-- Tidak perlu policy untuk client biasa

-- IMPORT_LOGS: semua akun aktif bisa lihat & tambah
create policy "import_logs_select" on public.import_logs
  for select using (auth.jwt() ->> 'sub' is not null);

create policy "import_logs_insert" on public.import_logs
  for insert with check (
    exists (
      select 1 from public.users u
      where u.id = (auth.jwt() ->> 'sub')::uuid and u.is_active
    )
  );

-- ACTIVITY_LOGS: semua akun bisa lihat & insert
create policy "activity_logs_select" on public.activity_logs
  for select using (auth.jwt() ->> 'sub' is not null);

create policy "activity_logs_insert" on public.activity_logs
  for insert with check (auth.jwt() ->> 'sub' is not null);

-- ============================================================
-- 11. COLUMN PRIVILEGE — Sembunyikan password_hash
-- ============================================================
revoke select (password_hash) on public.users from anon;
revoke select (password_hash) on public.users from authenticated;

-- ============================================================
-- 12. SEED DATA — Admin pertama
-- ============================================================
-- Password: admin123 → WAJIB DIGANTI setelah login pertama!
insert into public.users (username, password_hash, full_name, role, is_active, must_change_password)
values (
  'admin',
  crypt('admin123', gen_salt('bf', 10)),
  'Administrator',
  'admin',
  true,
  true
);
