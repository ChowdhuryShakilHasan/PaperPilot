-- Run this once in the Supabase SQL Editor for your project.
create table if not exists public.saved_papers (
  user_id uuid not null references auth.users(id) on delete cascade,
  openalex_id text not null,
  title text not null,
  authors jsonb not null default '[]'::jsonb,
  year integer,
  venue text not null default '',
  citations integer not null default 0,
  doi text not null default '',
  abstract text not null default '',
  topics jsonb not null default '[]'::jsonb,
  open_access boolean not null default false,
  status text not null default 'saved' check (status in ('saved', 'reading', 'completed')),
  collection text not null default 'Unsorted',
  tags text[] not null default '{}',
  note text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, openalex_id)
);

-- These statements also upgrade projects that already created saved_papers.
alter table public.saved_papers add column if not exists collection text not null default 'Unsorted';

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

alter table public.saved_papers enable row level security;
revoke all on table public.saved_papers from anon;
grant select, insert, update, delete on table public.saved_papers to authenticated;

drop policy if exists "Users can view their own saved papers" on public.saved_papers;
create policy "Users can view their own saved papers"
  on public.saved_papers for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can save papers to their own library" on public.saved_papers;
create policy "Users can save papers to their own library"
  on public.saved_papers for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own saved papers" on public.saved_papers;
create policy "Users can update their own saved papers"
  on public.saved_papers for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own saved papers" on public.saved_papers;
create policy "Users can delete their own saved papers"
  on public.saved_papers for delete to authenticated
  using ((select auth.uid()) = user_id);
