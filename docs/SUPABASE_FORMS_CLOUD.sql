create extension if not exists pgcrypto;

create table if not exists public.diasmath_forms_users (
  id text primary key,
  name text not null default 'Professor',
  email text not null unique,
  school text,
  city text,
  password_hash text not null,
  reset_code text,
  reset_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diasmath_forms_users_email_idx
  on public.diasmath_forms_users (email);

create table if not exists public.diasmath_forms_forms (
  id text primary key,
  owner_email text not null,
  owner_id text,
  title text,
  description text,
  published boolean not null default false,
  form jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diasmath_forms_forms_owner_email_idx
  on public.diasmath_forms_forms (owner_email);

create index if not exists diasmath_forms_forms_updated_at_idx
  on public.diasmath_forms_forms (updated_at desc);

create table if not exists public.diasmath_forms_responses (
  id text primary key,
  form_id text not null,
  form_title text,
  submitted_at timestamptz not null default now(),
  participant jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  form_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists diasmath_forms_responses_form_id_idx
  on public.diasmath_forms_responses (form_id);

create index if not exists diasmath_forms_responses_submitted_at_idx
  on public.diasmath_forms_responses (submitted_at desc);

alter table public.diasmath_forms_users enable row level security;
alter table public.diasmath_forms_forms enable row level security;
alter table public.diasmath_forms_responses enable row level security;

notify pgrst, 'reload schema';
