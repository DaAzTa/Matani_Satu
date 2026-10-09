-- admin-panel/supabase/profil.sql
-- Run ONCE in Supabase: SQL Editor > New query > paste > Run.
-- Requires the main schema script (it uses public.is_staff()).

create table if not exists public.profil_kelurahan (
  kunci      text primary key,                  -- e.g. 'identitas', 'fisik', ...
  urutan     int  not null,                     -- order of the tabs
  judul      text not null,                     -- full title of the section
  singkat    text not null,                     -- short tab label
  isi        jsonb not null default '{"groups": []}'::jsonb,
  updated_by text,
  updated_at timestamptz not null default now()
);

create or replace function public.profil_audit() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(nullif(auth.jwt() ->> 'email', ''), new.updated_by);
  return new;
end $$;

drop trigger if exists profil_audit_trg on public.profil_kelurahan;
create trigger profil_audit_trg before insert or update
  on public.profil_kelurahan
  for each row execute function public.profil_audit();

alter table public.profil_kelurahan enable row level security;

-- the profile is public information: anyone can read it
drop policy if exists "profil dibaca publik" on public.profil_kelurahan;
create policy "profil dibaca publik" on public.profil_kelurahan
  for select to anon, authenticated using (true);

-- only the two logged-in staff accounts can change it
drop policy if exists "staff ubah profil" on public.profil_kelurahan;
create policy "staff ubah profil" on public.profil_kelurahan
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

grant select on public.profil_kelurahan to anon, authenticated;
grant insert, update, delete on public.profil_kelurahan to authenticated;
grant all on public.profil_kelurahan to service_role;

notify pgrst, 'reload schema';