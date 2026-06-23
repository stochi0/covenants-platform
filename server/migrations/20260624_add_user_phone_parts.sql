alter table public.users
  add column if not exists phone_country_code text,
  add column if not exists phone_national_number text;
