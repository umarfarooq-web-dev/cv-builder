-- CV Builder schema (matches CvFormData JSON shape from the React app)
-- Run in Supabase SQL Editor or via: supabase db push

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Main profile (personal + summary + section toggles + tag lists + full JSON)
-- ---------------------------------------------------------------------------
create table public.cv_profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- sections { summary, experience, education, skills, ... }
  sections jsonb not null default '{}'::jsonb,

  -- personal { firstName, lastName, email, ... }
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  city text,
  country text,
  linked_in text,
  website text,

  summary text not null default '',
  skills text[] not null default '{}',
  interests text[] not null default '{}',

  -- exact form payload for round-trip / auditing
  payload jsonb not null
);

create index cv_profiles_email_idx on public.cv_profiles (email);
create index cv_profiles_created_at_idx on public.cv_profiles (created_at desc);

-- ---------------------------------------------------------------------------
-- Child tables (array items from the JSON)
-- ---------------------------------------------------------------------------
create table public.cv_experiences (
  id uuid primary key,
  cv_id uuid not null references public.cv_profiles (id) on delete cascade,
  sort_order int not null default 0,
  company text not null,
  position text not null,
  location text,
  start_date text not null,
  end_date text,
  current boolean not null default false,
  description text not null
);

create table public.cv_education (
  id uuid primary key,
  cv_id uuid not null references public.cv_profiles (id) on delete cascade,
  sort_order int not null default 0,
  institution text not null,
  degree text not null,
  field text,
  start_date text not null,
  end_date text,
  current boolean not null default false
);

create table public.cv_projects (
  id uuid primary key,
  cv_id uuid not null references public.cv_profiles (id) on delete cascade,
  sort_order int not null default 0,
  name text not null,
  role text,
  url text,
  start_date text,
  end_date text,
  current boolean not null default false,
  description text not null,
  technologies text
);

create table public.cv_articles (
  id uuid primary key,
  cv_id uuid not null references public.cv_profiles (id) on delete cascade,
  sort_order int not null default 0,
  title text not null,
  publication text not null,
  published_date text,
  url text,
  description text
);

create table public.cv_blogs (
  id uuid primary key,
  cv_id uuid not null references public.cv_profiles (id) on delete cascade,
  sort_order int not null default 0,
  title text not null,
  platform text not null,
  published_date text,
  url text,
  excerpt text
);

create table public.cv_certifications (
  id uuid primary key,
  cv_id uuid not null references public.cv_profiles (id) on delete cascade,
  sort_order int not null default 0,
  name text not null,
  issuer text not null,
  issue_date text,
  expiry_date text,
  credential_id text,
  url text
);

create table public.cv_languages (
  id uuid primary key,
  cv_id uuid not null references public.cv_profiles (id) on delete cascade,
  sort_order int not null default 0,
  language text not null,
  proficiency text not null check (
    proficiency in ('Native', 'Fluent', 'Professional', 'Conversational', 'Basic')
  )
);

create table public.cv_volunteer (
  id uuid primary key,
  cv_id uuid not null references public.cv_profiles (id) on delete cascade,
  sort_order int not null default 0,
  organization text not null,
  role text not null,
  start_date text not null,
  end_date text,
  current boolean not null default false,
  description text
);

create table public.cv_awards (
  id uuid primary key,
  cv_id uuid not null references public.cv_profiles (id) on delete cascade,
  sort_order int not null default 0,
  title text not null,
  issuer text not null,
  award_date text,
  description text
);

create table public.cv_references (
  id uuid primary key,
  cv_id uuid not null references public.cv_profiles (id) on delete cascade,
  sort_order int not null default 0,
  name text not null,
  title text,
  organization text,
  email text,
  phone text
);

-- ---------------------------------------------------------------------------
-- Save entire CV from JSON (matches CvFormData)
-- ---------------------------------------------------------------------------
create or replace function public.save_cv_from_json(p_data jsonb)
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

  v_personal := coalesce(p_data -> 'personal', '{}'::jsonb);

  insert into public.cv_profiles (
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

grant execute on function public.save_cv_from_json(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security (allow insert via RPC; optional direct read)
-- ---------------------------------------------------------------------------
alter table public.cv_profiles enable row level security;
alter table public.cv_experiences enable row level security;
alter table public.cv_education enable row level security;
alter table public.cv_projects enable row level security;
alter table public.cv_articles enable row level security;
alter table public.cv_blogs enable row level security;
alter table public.cv_certifications enable row level security;
alter table public.cv_languages enable row level security;
alter table public.cv_volunteer enable row level security;
alter table public.cv_awards enable row level security;
alter table public.cv_references enable row level security;

create policy "Anyone can read cv profiles"
  on public.cv_profiles for select
  to anon, authenticated
  using (true);

create policy "Anyone can read cv experiences"
  on public.cv_experiences for select to anon, authenticated using (true);
create policy "Anyone can read cv education"
  on public.cv_education for select to anon, authenticated using (true);
create policy "Anyone can read cv projects"
  on public.cv_projects for select to anon, authenticated using (true);
create policy "Anyone can read cv articles"
  on public.cv_articles for select to anon, authenticated using (true);
create policy "Anyone can read cv blogs"
  on public.cv_blogs for select to anon, authenticated using (true);
create policy "Anyone can read cv certifications"
  on public.cv_certifications for select to anon, authenticated using (true);
create policy "Anyone can read cv languages"
  on public.cv_languages for select to anon, authenticated using (true);
create policy "Anyone can read cv volunteer"
  on public.cv_volunteer for select to anon, authenticated using (true);
create policy "Anyone can read cv awards"
  on public.cv_awards for select to anon, authenticated using (true);
create policy "Anyone can read cv references"
  on public.cv_references for select to anon, authenticated using (true);
