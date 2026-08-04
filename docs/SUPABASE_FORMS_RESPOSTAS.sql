create extension if not exists pgcrypto;

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

alter table public.diasmath_forms_responses enable row level security;
