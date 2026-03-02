create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  phone text,
  role text not null default 'student',
  tier text not null default 'free' check (tier in ('free', 'pro', 'ultra')),
  password_hash text,
  full_name text,
  username text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

create or replace function public.handle_auth_user_upsert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only materialize a profile after at least one auth identity is verified.
  if coalesce(new.email_confirmed_at, new.phone_confirmed_at) is null then
    return new;
  end if;

  insert into public.profiles (
    id,
    email,
    phone,
    full_name,
    avatar_url
  )
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.phone, new.raw_user_meta_data ->> 'phone', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', '')), '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    phone = coalesce(excluded.phone, public.profiles.phone),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_or_updated on auth.users;
create trigger on_auth_user_created_or_updated
after insert or update on auth.users
for each row
execute function public.handle_auth_user_upsert();

create or replace function public.check_auth_availability(
  in_email text default null,
  in_phone text default null
)
returns table(email_exists boolean, phone_exists boolean)
language sql
security definer
set search_path = public, auth
as $$
  select
    exists (
      select 1
      from auth.users u
      where in_email is not null
        and lower(coalesce(u.email, '')) = lower(in_email)
        and u.email_confirmed_at is not null
    ) as email_exists,
    exists (
      select 1
      from auth.users u
      where in_phone is not null
        and coalesce(u.phone, '') = in_phone
        and u.phone_confirmed_at is not null
    ) as phone_exists;
$$;

-- One-time cleanup for historical rows created before verification
-- and any rows orphaned from auth.users.
delete from public.profiles p
where not exists (
  select 1
  from auth.users u
  where u.id = p.id
);

delete from public.profiles p
where exists (
  select 1
  from auth.users u
  where u.id = p.id
    and coalesce(u.email_confirmed_at, u.phone_confirmed_at) is null
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
