-- =====================================================================
-- Kelurahan Matani Satu - database panel admin
-- Jalankan SELURUH skrip ini SEKALI di Supabase:
-- SQL Editor > New query > Run
-- =====================================================================

-- 1. DUA AKUN TETAP ---------------------------------------------------
-- UBAH kedua email di bawah (tetap huruf kecil). Hanya kedua email ini
-- yang akan pernah bisa menjadi akun login.
create table if not exists public.fixed_accounts (
  email text primary key check (email = lower(email)),
  role  text not null check (role in ('admin','govt'))
);
alter table public.fixed_accounts enable row level security;
insert into public.fixed_accounts (email, role) values
  ('kkt149unsrat@gmail.com', 'admin'),
  ('matanisatu@gmail.com',  'govt')
on conflict (email) do nothing;

-- 2. TABEL PENDUDUK ----------------------------------------------------
create table if not exists public.penduduk (
  id                uuid primary key default gen_random_uuid(),
  nik               text not null unique check (nik ~ '^[0-9]{16}$'),
  no_kk             text,
  nama              text not null,
  tempat_lahir      text,
  tanggal_lahir     date,
  jenis_kelamin     text check (jenis_kelamin in ('L','P')),
  alamat            text,
  lingkungan        text check (lingkungan in (
                      'LINGKUNGAN I', 'LINGKUNGAN II', 'LINGKUNGAN III',
                      'LINGKUNGAN IV', 'LINGKUNGAN V')),
  hubungan          text,
  agama             text,
  pekerjaan         text,
  status_kawin      text,
  pendidikan        text,
  perlu_verifikasi  boolean not null default false,
  alasan_verifikasi text,
  updated_by        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists penduduk_lingkungan_idx
  on public.penduduk (lingkungan);
create index if not exists penduduk_no_kk_idx on public.penduduk (no_kk);
create index if not exists penduduk_nama_idx  on public.penduduk (nama);

-- mencatat siapa yang mengubah sebuah baris dan kapan
create or replace function public.penduduk_audit() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(nullif(auth.jwt() ->> 'email', ''),
                             new.updated_by);
  return new;
end $$;

drop trigger if exists penduduk_audit_trg on public.penduduk;
create trigger penduduk_audit_trg before insert or update
  on public.penduduk
  for each row execute function public.penduduk_audit();

-- 3. PERAN PETUGAS (STAFF) ---------------------------------------------
create table if not exists public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email   text not null unique,
  role    text not null check (role in ('admin','govt'))
);

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

-- 4. ATURAN KEAMANAN (Row Level Security) -----------------------------
alter table public.penduduk enable row level security;
alter table public.staff    enable row level security;

drop policy if exists "staff kelola penduduk" on public.penduduk;
create policy "staff kelola penduduk" on public.penduduk
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff lihat peran sendiri" on public.staff;
create policy "staff lihat peran sendiri" on public.staff
  for select to authenticated using (user_id = auth.uid());
-- (tidak ada policy insert/update/delete pada staff: peran tidak bisa
--  diubah dari website)

-- 5. KUNCI AKUN --------------------------------------------------------
-- Hanya email tetap yang bisa dibuat; tidak bisa diganti atau dihapus.
create or replace function public.guard_fixed_accounts() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if not exists (
      select 1 from public.fixed_accounts
      where email = lower(coalesce(new.email, ''))
    ) then
      raise exception 'Hanya 2 akun tetap yang diperbolehkan.';
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    if lower(old.email) is distinct from lower(new.email)
       and exists (select 1 from public.fixed_accounts
                   where email = lower(old.email)) then
      raise exception 'Email akun tetap tidak boleh diubah.';
    end if;
    return new;
  else
    if exists (select 1 from public.fixed_accounts
               where email = lower(old.email)) then
      raise exception 'Akun tetap tidak boleh dihapus.';
    end if;
    return old;
  end if;
end $$;

drop trigger if exists guard_fixed_accounts_trg on auth.users;
create trigger guard_fixed_accounts_trg
  before insert or update or delete on auth.users
  for each row execute function public.guard_fixed_accounts();

-- memberi peran otomatis saat akun tetap dibuat
create or replace function public.link_fixed_account() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.staff (user_id, email, role)
  select new.id, lower(new.email), f.role
  from public.fixed_accounts f
  where f.email = lower(new.email)
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists link_fixed_account_trg on auth.users;
create trigger link_fixed_account_trg after insert on auth.users
  for each row execute function public.link_fixed_account();

-- 6. STATISTIK DASHBOARD (hanya jumlah, tanpa nama atau NIK) ----------
create or replace function public.statistik_publik() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'total',     count(*),
    'lakiLaki',  count(*) filter (where jenis_kelamin = 'L'),
    'perempuan', count(*) filter (where jenis_kelamin = 'P'),
    'kepalaKeluarga',
       count(*) filter (where hubungan = 'KEPALA KELUARGA'),
    'usia', json_build_object(
      'anak', count(*) filter (
         where tanggal_lahir > current_date - interval '15 years'),
      'produktif', count(*) filter (
         where tanggal_lahir is null
            or (tanggal_lahir <= current_date - interval '15 years'
            and tanggal_lahir >  current_date - interval '65 years')),
      'lansia', count(*) filter (
         where tanggal_lahir <= current_date - interval '65 years')
    ),
    'perLingkungan', (
      select json_object_agg(l, (select count(*) from public.penduduk p
                                 where p.lingkungan = l))
      from unnest(array['LINGKUNGAN I', 'LINGKUNGAN II',
                        'LINGKUNGAN III', 'LINGKUNGAN IV',
                        'LINGKUNGAN V']) as l
    ),
    'diperbarui', now()
  ) from public.penduduk;
$$;

revoke all on function public.statistik_publik() from public;
grant execute on function public.statistik_publik()
  to anon, authenticated;

-- 7. HAK AKSES --------------------------------------------------------
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
alter default privileges in schema public
  grant all on tables to service_role;

grant select on public.staff to authenticated;
grant select, insert, update, delete on public.penduduk to authenticated;

notify pgrst, 'reload schema';