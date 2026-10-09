-- admin-panel/supabase/kematian.sql
-- Run ONCE in Supabase: SQL Editor > New query > paste > Run.
-- Adds death records. A resident who dies is NOT deleted: the row stays,
-- is marked MENINGGAL, and is no longer counted in the active population.

-- 1. New columns -------------------------------------------------------
alter table public.penduduk add column if not exists status_hidup text not null default 'HIDUP';
alter table public.penduduk add column if not exists tanggal_meninggal date;
alter table public.penduduk add column if not exists tempat_meninggal text;
alter table public.penduduk add column if not exists sebab_meninggal text;
alter table public.penduduk add column if not exists dicatat_oleh text;
alter table public.penduduk add column if not exists dicatat_pada timestamptz;

alter table public.penduduk drop constraint if exists penduduk_status_hidup_chk;
alter table public.penduduk add constraint penduduk_status_hidup_chk
  check (status_hidup in ('HIDUP', 'MENINGGAL'));

-- a death record must have a date
alter table public.penduduk drop constraint if exists penduduk_meninggal_chk;
alter table public.penduduk add constraint penduduk_meninggal_chk
  check (status_hidup <> 'MENINGGAL' or tanggal_meninggal is not null);

create index if not exists penduduk_status_idx on public.penduduk (status_hidup);

-- 2. Audit trigger (replaces the old function; the trigger itself stays) ---
create or replace function public.penduduk_audit() returns trigger
language plpgsql as $$
declare baru boolean := false;
begin
  new.updated_at := now();
  new.updated_by := coalesce(nullif(auth.jwt() ->> 'email', ''), new.updated_by);

  if new.status_hidup = 'MENINGGAL' then
    if new.tanggal_meninggal > current_date then
      raise exception 'Tanggal meninggal tidak boleh di masa depan.';
    end if;
    if new.tanggal_lahir is not null
       and new.tanggal_meninggal < new.tanggal_lahir then
      raise exception 'Tanggal meninggal tidak boleh sebelum tanggal lahir.';
    end if;
    if tg_op = 'INSERT' then
      baru := true;
    elsif old.status_hidup is distinct from 'MENINGGAL' then
      baru := true;
    end if;
    if baru then                       -- remember who recorded it, and when
      new.dicatat_pada := now();
      new.dicatat_oleh := nullif(auth.jwt() ->> 'email', '');
    end if;
  else                                 -- restored to HIDUP: clear death details
    new.tanggal_meninggal := null;
    new.tempat_meninggal  := null;
    new.sebab_meninggal   := null;
    new.dicatat_oleh      := null;
    new.dicatat_pada      := null;
  end if;
  return new;
end $$;

-- 3. Statistics: count only living residents, and add death counts ---------
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
    'tahun', extract(year from current_date)::int,
    'diperbarui', now()
  ) from public.penduduk where status_hidup = 'HIDUP';
$$;

revoke all on function public.statistik_publik() from public;
grant execute on function public.statistik_publik() to anon, authenticated;

notify pgrst, 'reload schema';