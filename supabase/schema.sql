-- RadarGeek — database schema for Supabase.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste this file → Run.
-- Safe to run again: every statement checks whether its object already exists.
--
-- Security model
--   * Every phone signs in anonymously (no email, no password) and gets a random user id.
--   * Anyone can READ reports from the last 7 days (that is the whole point of the radar).
--   * A signed-in phone can only ADD reports in its own name; nobody can edit or delete them.
--   * One report per phone, per store, per game, every 5 minutes (anti-spam).

create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  store_id text not null check (char_length(store_id) between 1 and 64),
  franchise text not null check (franchise in ('pokemon', 'yugioh', 'onepiece', 'dbs', 'digimon')),
  stock text not null check (stock in ('beaucoup', 'peu', 'epuise')),
  queue text not null check (queue in ('aucune', 'petite', 'longue')),
  purchase_limit text not null check (purchase_limit in ('aucune', '1', '2', '3+', 'inconnue')),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_store_idx on public.reports (store_id, franchise, created_at desc);

alter table public.reports enable row level security;

drop policy if exists "Reports from the last 7 days are public" on public.reports;
create policy "Reports from the last 7 days are public"
  on public.reports for select
  to anon, authenticated
  using (created_at > now() - interval '7 days');

drop policy if exists "Signed-in phones add reports in their own name" on public.reports;
create policy "Signed-in phones add reports in their own name"
  on public.reports for insert
  to authenticated
  with check (user_id = auth.uid());

-- No update or delete policy: reports can't be changed or removed from the app.

-- The server sets the time and the author, whatever the phone sends.
create or replace function public.reports_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.created_at := now();
  new.user_id := auth.uid();
  if exists (
    select 1 from public.reports r
    where r.user_id = new.user_id
      and r.store_id = new.store_id
      and r.franchise = new.franchise
      and r.created_at > now() - interval '5 minutes'
  ) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists reports_before_insert on public.reports;
create trigger reports_before_insert
  before insert on public.reports
  for each row execute function public.reports_before_insert();

-- Live updates: phones are told about new reports as they arrive.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reports'
  ) then
    alter publication supabase_realtime add table public.reports;
  end if;
end;
$$;
