-- Run this in Supabase SQL Editor if PaperPilot's original schema is already installed.
-- Safe to run more than once.
alter table public.saved_papers
  add column if not exists collection text not null default 'Unsorted';

create table if not exists public.paper_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.paper_collections enable row level security;
revoke all on table public.paper_collections from anon;
grant select, insert, delete on table public.paper_collections to authenticated;

drop policy if exists "Users can manage their own collections" on public.paper_collections;
create policy "Users can manage their own collections"
  on public.paper_collections for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
