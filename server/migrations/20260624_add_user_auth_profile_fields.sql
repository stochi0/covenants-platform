alter table public.users
  add column if not exists phone_number text,
  add column if not exists company_name text,
  add column if not exists company_country text,
  add column if not exists designation text,
  add column if not exists department text,
  add column if not exists company_type text;
