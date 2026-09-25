-- Wedding shared photo setup for Supabase.
-- 1) Supabase Dashboard -> Authentication -> Providers -> Anonymous Sign-Ins = ON.
-- 2) Run this entire script in SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  affiliation text not null,
  dietary_preference text,
  blessings text,
  created_at timestamptz not null default now()
);

alter table public.rsvp_responses enable row level security;

drop policy if exists "Guests can submit RSVP responses" on public.rsvp_responses;
create policy "Guests can submit RSVP responses"
on public.rsvp_responses for insert to authenticated
with check (guest_id = auth.uid());

create table if not exists public.quiz_responses (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  score integer not null check (score between 0 and 100),
  created_at timestamptz not null default now()
);

alter table public.quiz_responses enable row level security;

drop policy if exists "Guests can save their own quiz responses" on public.quiz_responses;
create policy "Guests can save their own quiz responses"
on public.quiz_responses for insert to authenticated
with check (guest_id = auth.uid());

create table if not exists public.wedding_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text not null,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.wedding_photos enable row level security;

drop policy if exists "Anyone can view wedding photos" on public.wedding_photos;
create policy "Anyone can view wedding photos"
on public.wedding_photos for select to anon, authenticated using (true);

drop policy if exists "Guests can add their own wedding photos" on public.wedding_photos;
create policy "Guests can add their own wedding photos"
on public.wedding_photos for insert to authenticated
with check (uploaded_by = auth.uid());

drop policy if exists "Guests can delete their own wedding photos" on public.wedding_photos;
create policy "Guests can delete their own wedding photos"
on public.wedding_photos for delete to authenticated
using (uploaded_by = auth.uid());

insert into storage.buckets (id, name, public)
values ('wedding-photos', 'wedding-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Guests can upload wedding photos" on storage.objects;
create policy "Guests can upload wedding photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'wedding-photos'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Anyone can view wedding photos" on storage.objects;
create policy "Anyone can view wedding photos"
on storage.objects for select to anon, authenticated
using (bucket_id = 'wedding-photos');

drop policy if exists "Guests can delete their own wedding photos" on storage.objects;
create policy "Guests can delete their own wedding photos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'wedding-photos'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Add the table to Realtime only if it is not already present.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'wedding_photos'
  ) then
    alter publication supabase_realtime add table public.wedding_photos;
  end if;
end $$;
