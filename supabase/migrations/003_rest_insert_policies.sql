-- Allow single REST insert into cv_profiles (no RPC required)
-- Run after 002_users_and_profiles.sql

drop policy if exists "Authenticated users insert own cvs" on public.cv_profiles;

create policy "Insert cv profiles via REST"
  on public.cv_profiles for insert
  to anon, authenticated
  with check (
    (auth.uid() is null and user_id is null)
    or (auth.uid() is not null and auth.uid() = user_id)
  );

-- Keep account profile in sync when a signed-in user saves a CV (one insert → trigger updates profiles)
create or replace function public.sync_profile_from_cv_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_personal jsonb;
begin
  if new.user_id is null then
    return new;
  end if;

  v_personal := coalesce(new.payload -> 'personal', '{}'::jsonb);

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
  where user_id = new.user_id;

  return new;
end;
$$;

drop trigger if exists cv_profiles_sync_profile on public.cv_profiles;

create trigger cv_profiles_sync_profile
  after insert on public.cv_profiles
  for each row
  execute function public.sync_profile_from_cv_insert();
