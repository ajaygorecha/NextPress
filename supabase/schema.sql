-- ============================================================
-- NextPress CMS - Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Users ────────────────────────────────────────────────────────────────────

create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  email       text not null,
  role        text not null default 'editor' check (role in ('admin', 'editor')),
  created_at  timestamptz not null default now()
);

alter table public.users enable row level security;

-- Users can read any user profile (needed for author display)
create policy "users_select" on public.users
  for select using (true);

-- Users can update their own profile
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Security definer function to check admin role (avoids RLS infinite recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

-- Admin can manage all users
create policy "users_admin" on public.users
  for all using (public.is_admin());

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    'editor'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Categories ───────────────────────────────────────────────────────────────

create table if not exists public.categories (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  slug         text not null unique,
  description  text,
  show_in_menu boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_select" on public.categories
  for select using (true);

create policy "categories_write" on public.categories
  for all using (auth.uid() is not null);

-- ── Tags ─────────────────────────────────────────────────────────────────────

create table if not exists public.tags (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

alter table public.tags enable row level security;

create policy "tags_select" on public.tags
  for select using (true);

create policy "tags_write" on public.tags
  for all using (auth.uid() is not null);

-- ── Posts ─────────────────────────────────────────────────────────────────────

create table if not exists public.posts (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  slug             text not null unique,
  content          text not null default '',
  featured_image   text,
  author_id        uuid references public.users(id) on delete set null,
  status           text not null default 'draft' check (status in ('draft', 'published')),
  category_id      uuid references public.categories(id) on delete set null,
  meta_title       text,
  meta_description text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.posts enable row level security;

-- Public can read published posts
create policy "posts_select_published" on public.posts
  for select using (status = 'published' or auth.uid() = author_id or auth.uid() is not null);

-- Authenticated users can create posts
create policy "posts_insert" on public.posts
  for insert with check (auth.uid() is not null);

-- Authors can update their own posts; admins can update any
create policy "posts_update" on public.posts
  for update using (
    auth.uid() = author_id or public.is_admin()
  );

-- Authors can delete their own posts; admins can delete any
create policy "posts_delete" on public.posts
  for delete using (
    auth.uid() = author_id or public.is_admin()
  );

-- ── Post Tags (Junction) ──────────────────────────────────────────────────────

create table if not exists public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id  uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

alter table public.post_tags enable row level security;

create policy "post_tags_select" on public.post_tags
  for select using (true);

create policy "post_tags_write" on public.post_tags
  for all using (auth.uid() is not null);

-- ── Storage ───────────────────────────────────────────────────────────────────
-- Create a bucket named 'media' in Supabase Dashboard > Storage
-- Then set these policies:

-- Allow authenticated users to upload
-- Allow public read access
-- (Configure in Supabase Dashboard > Storage > media bucket > Policies)
