-- DIASMATH™ — tabela de comentários dos apps
-- Execute no Supabase: SQL Editor → New query → Run
create extension if not exists pgcrypto;
create table if not exists public.diasmath_comments (
  id uuid primary key default gen_random_uuid(),
  app_slug text not null,
  app_name text not null,
  name text not null default 'Visitante',
  email text,
  comment text not null,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists diasmath_comments_app_created_idx
  on public.diasmath_comments (app_slug, created_at desc);
alter table public.diasmath_comments enable row level security;
