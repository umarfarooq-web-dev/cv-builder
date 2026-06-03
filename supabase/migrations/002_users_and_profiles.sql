-- Users + account profiles (linked to Supabase Auth)
-- Run after 001_cv_schema.sql

-- ---------------------------------------------------------------------------
-- users (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_email_idx on public.users (email);

-- ---------------------------------------------------------------------------
-- profiles (account profile — 1 per user, separate from cv_profiles / CV data)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  display_name text,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  city text,
  country text,
  bio text,
  website text,
  linked_in text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_user_id_idx on public.profiles (user_id);

-- Link CV documents to a user (optional for anonymous saves)
alter table public.cv_profiles
  add column if not exists user_id uuid references public.users (id) on delete cascade;

create index if not exists cv_profiles_user_id_idx on public.cv_profiles (user_id);

-- ---------------------------------------------------------------------------
-- Auto-create users + profiles when someone signs up (Supabase Auth)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_meta jsonb;
begin
  v_meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);

  insert into public.users (id, email)
  values (new.id, new.email);

  insert into public.profiles (
    user_id,
    display_name,
    first_name,
    last_name,
    avatar_url
  )
  values (
    new.id,
    coalesce(v_meta ->> 'display_name', v_meta ->> 'full_name', split_part(new.email, '@', 1)),
    v_meta ->> 'first_name',
    v_meta ->> 'last_name',
    v_meta ->> 'avatar_url'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Replace single-argument save function from 001
drop function if exists public.save_cv_from_json(jsonb);

-- ---------------------------------------------------------------------------
-- Save CV: attach to user + sync account profile from personal JSON
-- ---------------------------------------------------------------------------
create or replace function public.save_cv_from_json(
  p_data jsonb,
  p_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cv_id uuid;
  v_personal jsonb;
  v_item jsonb;
  v_i int;
begin
  if p_data is null then
    raise exception 'CV data is required';
  end if;

  if p_user_id is not null then
    if auth.uid() is null then
      raise exception 'Authentication required to save CV for a user';
    end if;
    if auth.uid() is distinct from p_user_id then
      raise exception 'Not authorized to save CV for this user';
    end if;
    if not exists (select 1 from public.users where id = p_user_id) then
      raise exception 'User not found';
    end if;
  end if;

  v_personal := coalesce(p_data -> 'personal', '{}'::jsonb);

  if p_user_id is not null then
    update public.profiles
    set
      first_name = coalesce(nullif(v_personal ->> 'firstName', ''), first_name),
      last_name = coalesce(nullif(v_personal ->> 'lastName', ''), last_name),
      display_name = coalesce(
        nullif(trim(concat(v_personal ->> 'firstName', ' ', v_personal ->> 'lastName')), ''),
        display_name
      ),
      phone = nullif(v_personal ->> 'phone', ''),
      city = nullif(v_personal ->> 'city', ''),
      country = nullif(v_personal ->> 'country', ''),
      linked_in = nullif(v_personal ->> 'linkedIn', ''),
      website = nullif(v_personal ->> 'website', '')
    where user_id = p_user_id;
  end if;

  insert into public.cv_profiles (
    user_id,
    sections,
    first_name,
    last_name,
    email,
    phone,
    city,
    country,
    linked_in,
    website,
    summary,
    skills,
    interests,
    payload
  )
  values (
    p_user_id,
    coalesce(p_data -> 'sections', '{}'::jsonb),
    coalesce(v_personal ->> 'firstName', ''),
    coalesce(v_personal ->> 'lastName', ''),
    coalesce(v_personal ->> 'email', ''),
    nullif(v_personal ->> 'phone', ''),
    nullif(v_personal ->> 'city', ''),
    nullif(v_personal ->> 'country', ''),
    nullif(v_personal ->> 'linkedIn', ''),
    nullif(v_personal ->> 'website', ''),
    coalesce(p_data ->> 'summary', ''),
    coalesce(
      (select array_agg(value) from jsonb_array_elements_text(coalesce(p_data -> 'skills', '[]'::jsonb))),
      '{}'::text[]
    ),
    coalesce(
      (select array_agg(value) from jsonb_array_elements_text(coalesce(p_data -> 'interests', '[]'::jsonb))),
      '{}'::text[]
    ),
    p_data
  )
  returning id into v_cv_id;

  v_i := 0;
  for v_item in select * from jsonb_array_elements(coalesce(p_data -> 'experiences', '[]'::jsonb))
  loop
    insert into public.cv_experiences (
      id, cv_id, sort_order, company, position, location,
      start_date, end_date, current, description
    )
    values (
      coalesce((v_item ->> 'id')::uuid, gen_random_uuid()),
      v_cv_id, v_i,
      v_item ->> 'company',
      v_item ->> 'position',
      nullif(v_item ->> 'location', ''),
      v_item ->> 'startDate',
      nullif(v_item ->> 'endDate', ''),
      coalesce((v_item ->> 'current')::boolean, false),
      coalesce(v_item ->> 'description', '')
    );
    v_i := v_i + 1;
  end loop;

  v_i := 0;
  for v_item in select * from jsonb_array_elements(coalesce(p_data -> 'education', '[]'::jsonb))
  loop
    insert into public.cv_education (
      id, cv_id, sort_order, institution, degree, field,
      start_date, end_date, current
    )
    values (
      coalesce((v_item ->> 'id')::uuid, gen_random_uuid()),
      v_cv_id, v_i,
      v_item ->> 'institution',
      v_item ->> 'degree',
      nullif(v_item ->> 'field', ''),
      v_item ->> 'startDate',
      nullif(v_item ->> 'endDate', ''),
      coalesce((v_item ->> 'current')::boolean, false)
    );
    v_i := v_i + 1;
  end loop;

  v_i := 0;
  for v_item in select * from jsonb_array_elements(coalesce(p_data -> 'projects', '[]'::jsonb))
  loop
    insert into public.cv_projects (
      id, cv_id, sort_order, name, role, url,
      start_date, end_date, current, description, technologies
    )
    values (
      coalesce((v_item ->> 'id')::uuid, gen_random_uuid()),
      v_cv_id, v_i,
      v_item ->> 'name',
      nullif(v_item ->> 'role', ''),
      nullif(v_item ->> 'url', ''),
      nullif(v_item ->> 'startDate', ''),
      nullif(v_item ->> 'endDate', ''),
      coalesce((v_item ->> 'current')::boolean, false),
      coalesce(v_item ->> 'description', ''),
      nullif(v_item ->> 'technologies', '')
    );
    v_i := v_i + 1;
  end loop;

  v_i := 0;
  for v_item in select * from jsonb_array_elements(coalesce(p_data -> 'articles', '[]'::jsonb))
  loop
    insert into public.cv_articles (
      id, cv_id, sort_order, title, publication, published_date, url, description
    )
    values (
      coalesce((v_item ->> 'id')::uuid, gen_random_uuid()),
      v_cv_id, v_i,
      v_item ->> 'title',
      v_item ->> 'publication',
      nullif(v_item ->> 'publishedDate', ''),
      nullif(v_item ->> 'url', ''),
      nullif(v_item ->> 'description', '')
    );
    v_i := v_i + 1;
  end loop;

  v_i := 0;
  for v_item in select * from jsonb_array_elements(coalesce(p_data -> 'blogs', '[]'::jsonb))
  loop
    insert into public.cv_blogs (
      id, cv_id, sort_order, title, platform, published_date, url, excerpt
    )
    values (
      coalesce((v_item ->> 'id')::uuid, gen_random_uuid()),
      v_cv_id, v_i,
      v_item ->> 'title',
      v_item ->> 'platform',
      nullif(v_item ->> 'publishedDate', ''),
      nullif(v_item ->> 'url', ''),
      nullif(v_item ->> 'excerpt', '')
    );
    v_i := v_i + 1;
  end loop;

  v_i := 0;
  for v_item in select * from jsonb_array_elements(coalesce(p_data -> 'certifications', '[]'::jsonb))
  loop
    insert into public.cv_certifications (
      id, cv_id, sort_order, name, issuer, issue_date, expiry_date, credential_id, url
    )
    values (
      coalesce((v_item ->> 'id')::uuid, gen_random_uuid()),
      v_cv_id, v_i,
      v_item ->> 'name',
      v_item ->> 'issuer',
      nullif(v_item ->> 'issueDate', ''),
      nullif(v_item ->> 'expiryDate', ''),
      nullif(v_item ->> 'credentialId', ''),
      nullif(v_item ->> 'url', '')
    );
    v_i := v_i + 1;
  end loop;

  v_i := 0;
  for v_item in select * from jsonb_array_elements(coalesce(p_data -> 'languages', '[]'::jsonb))
  loop
    insert into public.cv_languages (
      id, cv_id, sort_order, language, proficiency
    )
    values (
      coalesce((v_item ->> 'id')::uuid, gen_random_uuid()),
      v_cv_id, v_i,
      v_item ->> 'language',
      v_item ->> 'proficiency'
    );
    v_i := v_i + 1;
  end loop;

  v_i := 0;
  for v_item in select * from jsonb_array_elements(coalesce(p_data -> 'volunteer', '[]'::jsonb))
  loop
    insert into public.cv_volunteer (
      id, cv_id, sort_order, organization, role,
      start_date, end_date, current, description
    )
    values (
      coalesce((v_item ->> 'id')::uuid, gen_random_uuid()),
      v_cv_id, v_i,
      v_item ->> 'organization',
      v_item ->> 'role',
      v_item ->> 'startDate',
      nullif(v_item ->> 'endDate', ''),
      coalesce((v_item ->> 'current')::boolean, false),
      nullif(v_item ->> 'description', '')
    );
    v_i := v_i + 1;
  end loop;

  v_i := 0;
  for v_item in select * from jsonb_array_elements(coalesce(p_data -> 'awards', '[]'::jsonb))
  loop
    insert into public.cv_awards (
      id, cv_id, sort_order, title, issuer, award_date, description
    )
    values (
      coalesce((v_item ->> 'id')::uuid, gen_random_uuid()),
      v_cv_id, v_i,
      v_item ->> 'title',
      v_item ->> 'issuer',
      nullif(v_item ->> 'date', ''),
      nullif(v_item ->> 'description', '')
    );
    v_i := v_i + 1;
  end loop;

  v_i := 0;
  for v_item in select * from jsonb_array_elements(coalesce(p_data -> 'references', '[]'::jsonb))
  loop
    insert into public.cv_references (
      id, cv_id, sort_order, name, title, organization, email, phone
    )
    values (
      coalesce((v_item ->> 'id')::uuid, gen_random_uuid()),
      v_cv_id, v_i,
      v_item ->> 'name',
      nullif(v_item ->> 'title', ''),
      nullif(v_item ->> 'organization', ''),
      nullif(v_item ->> 'email', ''),
      nullif(v_item ->> 'phone', '')
    );
    v_i := v_i + 1;
  end loop;

  return v_cv_id;
end;
$$;

grant execute on function public.save_cv_from_json(jsonb, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS: users & profiles
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.profiles enable row level security;

create policy "Users can read own user row"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own user row"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- CVs: owners can read their own; keep public read for anon CVs if user_id is null
drop policy if exists "Anyone can read cv profiles" on public.cv_profiles;

create policy "Read own or public cv profiles"
  on public.cv_profiles for select
  to anon, authenticated
  using (user_id is null or auth.uid() = user_id);

create policy "Authenticated users insert own cvs"
  on public.cv_profiles for insert
  to authenticated
  with check (user_id is null or auth.uid() = user_id);
