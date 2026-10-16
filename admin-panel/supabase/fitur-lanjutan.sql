-- admin-panel/supabase/fitur-lanjutan.sql
-- Run ONCE in Supabase: SQL Editor > New query > paste > Run.
-- Needs the earlier scripts, including fitur-tambahan.sql.
-- Adds: gallery, events calendar, trend/pyramid statistics, data quality checker.
-- NOTE: it REPLACES the function catat_log() from fitur-tambahan.sql (same
-- function, plus one small rule so the data checker does not flood the log).

-- =====================================================================
-- 1. GALLERY (photos are stored in the same bucket as announcements)
-- =====================================================================
create table if not exists public.galeri (
  id          uuid primary key default gen_random_uuid(),
  judul       text not null default '',
  foto_url    text not null,
  tanggal     date not null default current_date,
  terbit      boolean not null default true,
  dibuat_oleh text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists galeri_urut_idx on public.galeri (tanggal desc, created_at desc);

-- =====================================================================
-- 2. EVENTS CALENDAR
-- =====================================================================
create table if not exists public.kegiatan (
  id              uuid primary key default gen_random_uuid(),
  judul           text not null,
  deskripsi       text,
  tanggal         date not null,
  tanggal_selesai date,
  waktu           text,
  lokasi          text,
  terbit          boolean not null default true,
  dibuat_oleh     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (tanggal_selesai is null or tanggal_selesai >= tanggal)
);
create index if not exists kegiatan_tanggal_idx on public.kegiatan (tanggal);

create or replace function public.komunitas_audit() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.dibuat_oleh := coalesce(nullif(auth.jwt() ->> 'email', ''), new.dibuat_oleh);
  end if;
  return new;
end $$;

drop trigger if exists galeri_audit_trg on public.galeri;
create trigger galeri_audit_trg before insert or update on public.galeri
  for each row execute function public.komunitas_audit();
drop trigger if exists kegiatan_audit_trg on public.kegiatan;
create trigger kegiatan_audit_trg before insert or update on public.kegiatan
  for each row execute function public.komunitas_audit();

alter table public.galeri   enable row level security;
alter table public.kegiatan enable row level security;

drop policy if exists "galeri terbit dibaca publik" on public.galeri;
create policy "galeri terbit dibaca publik" on public.galeri
  for select to anon, authenticated using (terbit);
drop policy if exists "staff kelola galeri" on public.galeri;
create policy "staff kelola galeri" on public.galeri
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "kegiatan terbit dibaca publik" on public.kegiatan;
create policy "kegiatan terbit dibaca publik" on public.kegiatan
  for select to anon, authenticated using (terbit);
drop policy if exists "staff kelola kegiatan" on public.kegiatan;
create policy "staff kelola kegiatan" on public.kegiatan
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

grant select on public.galeri, public.kegiatan to anon, authenticated;
grant insert, update, delete on public.galeri, public.kegiatan to authenticated;
grant all on public.galeri, public.kegiatan to service_role;

-- =====================================================================
-- 3. ACTIVITY LOG: replace catat_log() (adds the "app.tanpa_log" switch)
--    and attach it to the two new tables
-- =====================================================================
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
  if v_email is null or coalesce(current_setting('app.tanpa_log', true), '') = '1' then
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

drop trigger if exists log_galeri_trg on public.galeri;
create trigger log_galeri_trg after insert or update or delete on public.galeri
  for each row execute function public.catat_log();
drop trigger if exists log_kegiatan_trg on public.kegiatan;
create trigger log_kegiatan_trg after insert or update or delete on public.kegiatan
  for each row execute function public.catat_log();

-- =====================================================================
-- 4. TREND + POPULATION PYRAMID (staff only; optional neighborhood)
--    bulanan  : births and deaths for the last 12 months
--    piramida : living residents by 5-year age group and sex
-- =====================================================================
create or replace function public.statistik_tren(p_lingkungan text default null)
returns json
language sql stable set search_path = public as $$
  with
  bulan as (
    select generate_series(date_trunc('month', current_date) - interval '11 months',
                           date_trunc('month', current_date),
                           interval '1 month')::date as b
  ),
  lahir as (
    select date_trunc('month', p.tanggal_lahir)::date as b, count(*) as n
    from public.kelahiran k
    join public.penduduk p on p.id = k.penduduk_id
    where p_lingkungan is null or p.lingkungan = p_lingkungan
    group by 1
  ),
  mati as (
    select date_trunc('month', tanggal_meninggal)::date as b, count(*) as n
    from public.penduduk
    where status_hidup = 'MENINGGAL'
      and (p_lingkungan is null or lingkungan = p_lingkungan)
    group by 1
  ),
  umur as (
    select least(extract(year from age(current_date, tanggal_lahir))::int / 5, 15) as kel,
           jenis_kelamin as jk
    from public.penduduk
    where status_hidup = 'HIDUP' and tanggal_lahir is not null
      and (p_lingkungan is null or lingkungan = p_lingkungan)
  ),
  grup as (
    select kel,
           count(*) filter (where jk = 'L') as laki,
           count(*) filter (where jk = 'P') as perempuan
    from umur group by kel
  )
  select json_build_object(
    'bulanan', (
      select json_agg(json_build_object(
               'bulan', to_char(bulan.b, 'YYYY-MM'),
               'lahir', coalesce(lahir.n, 0),
               'meninggal', coalesce(mati.n, 0)) order by bulan.b)
      from bulan
      left join lahir on lahir.b = bulan.b
      left join mati  on mati.b  = bulan.b
    ),
    'piramida', (
      select json_agg(json_build_object(
               'kelompok', case when g.i = 15 then '75+'
                                else (g.i * 5)::text || '-' || (g.i * 5 + 4)::text end,
               'laki', coalesce(grup.laki, 0),
               'perempuan', coalesce(grup.perempuan, 0)) order by g.i)
      from generate_series(0, 15) as g(i)
      left join grup on grup.kel = g.i
    )
  );
$$;

revoke all on function public.statistik_tren(text) from public, anon;
grant execute on function public.statistik_tren(text) to authenticated;

-- =====================================================================
-- 5. DATA QUALITY CHECKER: writes its findings into the existing
--    "Cek" flag (perlu_verifikasi + alasan_verifikasi).
--    - flags it set earlier ("Pemeriksa data: ...") are cleared first
--    - flags that come from the Excel import are never touched
--    p_items = [{"id": "<uuid>", "alasan": "text"}, ...]
-- =====================================================================
create or replace function public.terapkan_pemeriksaan(p_items jsonb)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_email  text := nullif(auth.jwt() ->> 'email', '');
  v_bersih int;
  v_tandai int;
begin
  if v_email is null or not public.is_staff() then
    raise exception 'Tidak diizinkan.';
  end if;

  perform set_config('app.tanpa_log', '1', true);

  update public.penduduk
  set perlu_verifikasi = false, alasan_verifikasi = null
  where alasan_verifikasi like 'Pemeriksa data:%';
  get diagnostics v_bersih = row_count;

  update public.penduduk p
  set perlu_verifikasi = true,
      alasan_verifikasi = 'Pemeriksa data: ' || left(x.alasan, 400)
  from jsonb_to_recordset(p_items) as x(id uuid, alasan text)
  where p.id = x.id and p.status_hidup = 'HIDUP' and not p.perlu_verifikasi;
  get diagnostics v_tandai = row_count;

  perform set_config('app.tanpa_log', '', true);

  insert into public.log_aktivitas (email, aksi, tabel, ringkasan)
  values (v_email, 'PERIKSA', 'penduduk',
          'Menjalankan pemeriksa data: ' || v_tandai || ' ditandai "Cek", '
          || v_bersih || ' tanda lama dibersihkan');

  return json_build_object('ditandai', v_tandai, 'dibersihkan', v_bersih);
end $$;

revoke all on function public.terapkan_pemeriksaan(jsonb) from public, anon;
grant execute on function public.terapkan_pemeriksaan(jsonb) to authenticated;

notify pgrst, 'reload schema';