-- admin-panel/supabase/fitur-tambahan.sql
-- Run ONCE in Supabase: SQL Editor > New query > paste > Run.
-- Needs the earlier scripts: main schema, profil.sql and kematian.sql.
-- Adds: birth records, announcements (+ photo storage), activity log,
-- dashboard statistics per neighborhood, and the "Layanan" profile section.

-- =====================================================================
-- 1. BIRTH RECORDS
-- A newborn is a normal row in "penduduk" (living, relation ANAK) plus one
-- row in "kelahiran" with the parents' names. Both are saved together.
-- =====================================================================
create table if not exists public.kelahiran (
  id           uuid primary key default gen_random_uuid(),
  penduduk_id  uuid not null unique references public.penduduk (id) on delete cascade,
  nama_ayah    text,
  nama_ibu     text,
  dicatat_oleh text,
  dicatat_pada timestamptz not null default now()
);
create index if not exists kelahiran_dicatat_idx on public.kelahiran (dicatat_pada desc);

create or replace function public.kelahiran_audit() returns trigger
language plpgsql as $$
begin
  new.dicatat_pada := now();
  new.dicatat_oleh := coalesce(nullif(auth.jwt() ->> 'email', ''), new.dicatat_oleh);
  return new;
end $$;

drop trigger if exists kelahiran_audit_trg on public.kelahiran;
create trigger kelahiran_audit_trg before insert on public.kelahiran
  for each row execute function public.kelahiran_audit();

alter table public.kelahiran enable row level security;
drop policy if exists "staff kelola kelahiran" on public.kelahiran;
create policy "staff kelola kelahiran" on public.kelahiran
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
grant select, insert, update, delete on public.kelahiran to authenticated;
grant all on public.kelahiran to service_role;

create or replace function public.catat_kelahiran(
  p_nik text, p_nama text, p_jk text, p_tgl_lahir date, p_tempat_lahir text,
  p_no_kk text, p_lingkungan text, p_alamat text,
  p_nama_ayah text, p_nama_ibu text, p_hubungan text
) returns uuid
language plpgsql set search_path = public as $$
declare v_id uuid;
begin
  if p_tgl_lahir > current_date then
    raise exception 'Tanggal lahir tidak boleh di masa depan.';
  end if;
  insert into public.penduduk (nik, no_kk, nama, tempat_lahir, tanggal_lahir,
                               jenis_kelamin, alamat, lingkungan, hubungan)
  values (p_nik, nullif(trim(p_no_kk), ''), upper(trim(p_nama)),
          nullif(upper(trim(p_tempat_lahir)), ''), p_tgl_lahir, p_jk,
          nullif(trim(p_alamat), ''), nullif(p_lingkungan, ''),
          coalesce(nullif(p_hubungan, ''), 'ANAK'))
  returning id into v_id;
  insert into public.kelahiran (penduduk_id, nama_ayah, nama_ibu)
  values (v_id, nullif(trim(p_nama_ayah), ''), nullif(trim(p_nama_ibu), ''));
  return v_id;
end $$;

revoke all on function public.catat_kelahiran(text, text, text, date, text,
  text, text, text, text, text, text) from public, anon;
grant execute on function public.catat_kelahiran(text, text, text, date, text,
  text, text, text, text, text, text) to authenticated;

-- =====================================================================
-- 2. ANNOUNCEMENTS + PHOTO STORAGE
-- =====================================================================
create table if not exists public.pengumuman (
  id          uuid primary key default gen_random_uuid(),
  judul       text not null,
  isi         text not null,
  foto_url    text,
  tanggal     date not null default current_date,
  terbit      boolean not null default true,
  dibuat_oleh text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists pengumuman_tanggal_idx
  on public.pengumuman (tanggal desc, created_at desc);

create or replace function public.pengumuman_audit() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.dibuat_oleh := coalesce(nullif(auth.jwt() ->> 'email', ''), new.dibuat_oleh);
  end if;
  return new;
end $$;

drop trigger if exists pengumuman_audit_trg on public.pengumuman;
create trigger pengumuman_audit_trg before insert or update on public.pengumuman
  for each row execute function public.pengumuman_audit();

alter table public.pengumuman enable row level security;

-- residents (no login) can read PUBLISHED announcements only
drop policy if exists "pengumuman terbit dibaca publik" on public.pengumuman;
create policy "pengumuman terbit dibaca publik" on public.pengumuman
  for select to anon, authenticated using (terbit);

-- staff can read drafts and change everything
drop policy if exists "staff kelola pengumuman" on public.pengumuman;
create policy "staff kelola pengumuman" on public.pengumuman
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

grant select on public.pengumuman to anon, authenticated;
grant insert, update, delete on public.pengumuman to authenticated;
grant all on public.pengumuman to service_role;

-- public photo bucket (max 2 MB per photo, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pengumuman', 'pengumuman', true, 2097152,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "foto pengumuman dibaca publik" on storage.objects;
create policy "foto pengumuman dibaca publik" on storage.objects
  for select to anon, authenticated using (bucket_id = 'pengumuman');

drop policy if exists "staff unggah foto pengumuman" on storage.objects;
create policy "staff unggah foto pengumuman" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pengumuman' and public.is_staff());

drop policy if exists "staff ubah foto pengumuman" on storage.objects;
create policy "staff ubah foto pengumuman" on storage.objects
  for update to authenticated
  using (bucket_id = 'pengumuman' and public.is_staff());

drop policy if exists "staff hapus foto pengumuman" on storage.objects;
create policy "staff hapus foto pengumuman" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pengumuman' and public.is_staff());

-- =====================================================================
-- 3. ACTIVITY LOG (who changed what, and when)
-- Filled automatically by triggers. Imports and the SQL Editor are not logged
-- (they have no logged-in user).
-- =====================================================================
create table if not exists public.log_aktivitas (
  id        bigint generated always as identity primary key,
  waktu     timestamptz not null default now(),
  email     text not null,
  aksi      text not null,
  tabel     text,
  ringkasan text not null,
  rincian   jsonb
);
create index if not exists log_waktu_idx on public.log_aktivitas (waktu desc);

alter table public.log_aktivitas enable row level security;
drop policy if exists "staff lihat log" on public.log_aktivitas;
create policy "staff lihat log" on public.log_aktivitas
  for select to authenticated using (public.is_staff());
-- (to let ONLY the admin role read the log, use:
--  using (exists (select 1 from public.staff
--                 where user_id = auth.uid() and role = 'admin')) )

revoke all on public.log_aktivitas from anon, authenticated;
grant select on public.log_aktivitas to authenticated;
grant all on public.log_aktivitas to service_role;

create or replace function public.catat_log() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_email text := nullif(auth.jwt() ->> 'email', '');
  v_old   jsonb;
  v_new   jsonb;
  v_row   jsonb;
  v_diff  jsonb := '{}'::jsonb;
  v_aksi  text;
  v_nama  text;
  v_obj   text;
  k       text;
begin
  if v_email is null then
    return null;
  end if;

  if tg_op = 'DELETE' then
    v_old := to_jsonb(old);
    v_row := v_old;
  elsif tg_op = 'INSERT' then
    v_new := to_jsonb(new);
    v_row := v_new;
  else
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_row := v_new;
  end if;

  v_nama := coalesce(v_row ->> 'nama', v_row ->> 'judul', v_row ->> 'singkat', '');
  if tg_table_name = 'kelahiran' then
    select nama into v_nama from public.penduduk
    where id = (v_row ->> 'penduduk_id')::uuid;
    v_nama := coalesce(v_nama, '');
  end if;

  v_obj := case tg_table_name
             when 'profil_kelurahan' then 'profil'
             else tg_table_name end;

  if tg_op = 'INSERT' then
    v_aksi := case when tg_table_name = 'kelahiran' then 'KELAHIRAN' else 'TAMBAH' end;
  elsif tg_op = 'DELETE' then
    v_aksi := 'HAPUS';
  else
    for k in select jsonb_object_keys(v_new) loop
      if k in ('updated_at', 'updated_by', 'dicatat_pada', 'dicatat_oleh') then
        continue;
      end if;
      if v_new -> k is distinct from v_old -> k then
        if length(coalesce(v_new ->> k, '')) > 300
           or length(coalesce(v_old ->> k, '')) > 300 then
          v_diff := v_diff || jsonb_build_object(k, '(teks panjang diubah)');
        else
          v_diff := v_diff || jsonb_build_object(
                      k, jsonb_build_array(v_old -> k, v_new -> k));
        end if;
      end if;
    end loop;
    if v_diff = '{}'::jsonb then
      return null;
    end if;
    v_aksi := 'UBAH';
    if tg_table_name = 'penduduk' then
      if v_new ->> 'status_hidup' = 'MENINGGAL'
         and v_old ->> 'status_hidup' is distinct from 'MENINGGAL' then
        v_aksi := 'KEMATIAN';
      elsif v_old ->> 'status_hidup' = 'MENINGGAL'
         and v_new ->> 'status_hidup' is distinct from 'MENINGGAL' then
        v_aksi := 'BATAL_KEMATIAN';
      end if;
    end if;
  end if;

  insert into public.log_aktivitas (email, aksi, tabel, ringkasan, rincian)
  values (
    v_email, v_aksi, tg_table_name,
    case v_aksi
      when 'TAMBAH'         then 'Menambah ' || v_obj || ': ' || v_nama
      when 'HAPUS'          then 'Menghapus ' || v_obj || ': ' || v_nama
      when 'KELAHIRAN'      then 'Mencatat kelahiran: ' || v_nama
      when 'KEMATIAN'       then 'Mencatat kematian: ' || v_nama
      when 'BATAL_KEMATIAN' then 'Membatalkan catatan kematian: ' || v_nama
      else 'Mengubah ' || v_obj || ': ' || v_nama
    end,
    case when tg_op = 'UPDATE' then v_diff else null end
  );
  return null;
end $$;

drop trigger if exists log_penduduk_trg on public.penduduk;
create trigger log_penduduk_trg after insert or update or delete on public.penduduk
  for each row execute function public.catat_log();

drop trigger if exists log_kelahiran_trg on public.kelahiran;
create trigger log_kelahiran_trg after insert or update or delete on public.kelahiran
  for each row execute function public.catat_log();

drop trigger if exists log_pengumuman_trg on public.pengumuman;
create trigger log_pengumuman_trg after insert or update or delete on public.pengumuman
  for each row execute function public.catat_log();

drop trigger if exists log_profil_trg on public.profil_kelurahan;
create trigger log_profil_trg after insert or update or delete on public.profil_kelurahan
  for each row execute function public.catat_log();

-- the panel calls this when someone downloads Excel / PDF
create or replace function public.catat_unduhan(
  p_halaman text, p_format text, p_jumlah int
) returns void
language plpgsql security definer set search_path = public as $$
declare v_email text := nullif(auth.jwt() ->> 'email', '');
begin
  if v_email is null or not public.is_staff() then
    raise exception 'Tidak diizinkan.';
  end if;
  insert into public.log_aktivitas (email, aksi, tabel, ringkasan)
  values (v_email, 'UNDUH', null,
          'Mengunduh ' || p_halaman || ' (' || upper(p_format) || ', '
          || p_jumlah || ' baris)');
end $$;

revoke all on function public.catat_unduhan(text, text, int) from public, anon;
grant execute on function public.catat_unduhan(text, text, int) to authenticated;

-- =====================================================================
-- 4. STATISTICS
-- 4a. public statistics (adds births)
-- =====================================================================
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
                                 where p.lingkungan = l
                                   and p.status_hidup = 'HIDUP'))
      from unnest(array['LINGKUNGAN I', 'LINGKUNGAN II',
                        'LINGKUNGAN III', 'LINGKUNGAN IV',
                        'LINGKUNGAN V']) as l
    ),
    'meninggalTahunIni', (
      select count(*) from public.penduduk
      where status_hidup = 'MENINGGAL'
        and extract(year from tanggal_meninggal)
            = extract(year from current_date)
    ),
    'meninggalTotal', (
      select count(*) from public.penduduk where status_hidup = 'MENINGGAL'
    ),
    'kelahiranTahunIni', (
      select count(*) from public.kelahiran k
      join public.penduduk p on p.id = k.penduduk_id
      where extract(year from p.tanggal_lahir) = extract(year from current_date)
    ),
    'kelahiranTotal', (select count(*) from public.kelahiran),
    'tahun', extract(year from current_date)::int,
    'diperbarui', now()
  ) from public.penduduk where status_hidup = 'HIDUP';
$$;

revoke all on function public.statistik_publik() from public;
grant execute on function public.statistik_publik() to anon, authenticated;

-- 4b. dashboard statistics, optionally for ONE neighborhood (staff only:
--     it runs with the caller's rights, so the security rules apply)
create or replace function public.statistik_admin(p_lingkungan text default null)
returns json
language sql stable set search_path = public as $$
  with
  h as (select * from public.penduduk
        where status_hidup = 'HIDUP'
          and (p_lingkungan is null or lingkungan = p_lingkungan)),
  m as (select * from public.penduduk
        where status_hidup = 'MENINGGAL'
          and (p_lingkungan is null or lingkungan = p_lingkungan)),
  b as (select p.* from public.kelahiran k
        join public.penduduk p on p.id = k.penduduk_id
        where p_lingkungan is null or p.lingkungan = p_lingkungan)
  select json_build_object(
    'total',          (select count(*) from h),
    'lakiLaki',       (select count(*) from h where jenis_kelamin = 'L'),
    'perempuan',      (select count(*) from h where jenis_kelamin = 'P'),
    'kepalaKeluarga', (select count(*) from h where hubungan = 'KEPALA KELUARGA'),
    'usia', json_build_object(
      'anak', (select count(*) from h
               where tanggal_lahir > current_date - interval '15 years'),
      'produktif', (select count(*) from h
               where tanggal_lahir is null
                  or (tanggal_lahir <= current_date - interval '15 years'
                  and tanggal_lahir >  current_date - interval '65 years')),
      'lansia', (select count(*) from h
               where tanggal_lahir <= current_date - interval '65 years')
    ),
    'perLingkungan', (
      select json_object_agg(l, (select count(*) from public.penduduk p
                                 where p.lingkungan = l
                                   and p.status_hidup = 'HIDUP'))
      from unnest(array['LINGKUNGAN I', 'LINGKUNGAN II',
                        'LINGKUNGAN III', 'LINGKUNGAN IV',
                        'LINGKUNGAN V']) as l
    ),
    'perluVerifikasi', (select count(*) from h where perlu_verifikasi),
    'meninggalTahunIni', (select count(*) from m
        where extract(year from tanggal_meninggal) = extract(year from current_date)),
    'kelahiranTahunIni', (select count(*) from b
        where extract(year from tanggal_lahir) = extract(year from current_date)),
    'tahun',      extract(year from current_date)::int,
    'lingkungan', p_lingkungan
  );
$$;

revoke all on function public.statistik_admin(text) from public, anon;
grant execute on function public.statistik_admin(text) to authenticated;

-- =====================================================================
-- 5. PROFILE SECTION "LAYANAN" (service info / document requirements)
-- Staff can edit it later in the panel: Profil Kelurahan > Layanan.
-- The texts below are a GENERIC STARTING EXAMPLE: the kelurahan office must
-- check and adjust them before they are shown to the public.
-- =====================================================================
insert into public.profil_kelurahan (kunci, urutan, judul, singkat, isi)
values (
  'layanan', 11, 'Layanan dan Persyaratan Dokumen', 'Layanan',
  $isi$
  {
    "intro": "Persyaratan umum untuk beberapa layanan di kantor kelurahan. Persyaratan dapat berbeda atau berubah, jadi hubungi kantor kelurahan untuk memastikan sebelum datang.",
    "groups": [
      {
        "items": [
          {
            "l": "Surat Keterangan Domisili",
            "v": "Persyaratan umum:\n- Fotokopi KTP\n- Fotokopi Kartu Keluarga (KK)\n- Surat pengantar dari kepala lingkungan",
            "n": "Contoh awal: perlu dicek dan disesuaikan oleh petugas kelurahan."
          },
          {
            "l": "Surat Keterangan Tidak Mampu (SKTM)",
            "v": "Persyaratan umum:\n- Fotokopi KTP\n- Fotokopi Kartu Keluarga (KK)\n- Surat pengantar dari kepala lingkungan\n- Keterangan tujuan penggunaan surat",
            "n": "Contoh awal: perlu dicek dan disesuaikan oleh petugas kelurahan."
          },
          {
            "l": "Surat Pengantar Pembuatan KTP",
            "v": "Persyaratan umum:\n- Fotokopi Kartu Keluarga (KK)\n- Dokumen pendukung sesuai keperluan (misalnya akta kelahiran)\n- Surat pengantar dari kepala lingkungan",
            "n": "Contoh awal: perlu dicek dan disesuaikan oleh petugas kelurahan."
          },
          { "l": "Jam pelayanan", "v": null, "n": "" },
          { "l": "Kontak kantor kelurahan", "v": null, "n": "" }
        ]
      }
    ]
  }
  $isi$::jsonb
)
on conflict (kunci) do nothing;

notify pgrst, 'reload schema';