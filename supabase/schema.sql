-- Campus360 production schema. Apply this entire file once in the
-- Supabase SQL Editor. It intentionally inserts no sample or demo data.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 80),
  avatar_url text,
  college_name text,
  course text,
  graduation_year smallint check (graduation_year between 2000 and 2100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.career_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  category text not null,
  summary text not null,
  skills jsonb not null default '[]'::jsonb,
  roadmap jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text,
  country text not null default 'India',
  institution_type text,
  rating numeric(2,1) check (rating between 0 and 5),
  ranking text,
  programs jsonb not null default '[]'::jsonb,
  career_tags text[] not null default '{}',
  average_package text,
  highest_package text,
  annual_fees text,
  description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.career_survey_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  recommended_career_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.community_channels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.community_channels(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 4000),
  attachment_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_message_has_content check (length(trim(body)) > 0 or attachment_path is not null)
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 180),
  category text not null check (category in ('Notes', 'Previous Year Question Papers (PYQs)', 'Study Guides', 'Used Books')),
  subject text not null,
  course text not null,
  semester text not null,
  college_name text,
  description text not null check (char_length(trim(description)) between 10 and 4000),
  resource_type text not null check (resource_type in ('PDF', 'PYQ', 'Study guide', 'Physical used book')),
  price_inr numeric(10,2) not null check (price_inr >= 0),
  condition text check (condition in ('Like New', 'Good', 'Acceptable')),
  contact_details text,
  asset_path text,
  image_path text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listing_asset_requirement check (
    (resource_type = 'Physical used book' and image_path is not null)
    or (resource_type <> 'Physical used book' and asset_path is not null)
  )
);

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete restrict,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete restrict,
  amount_inr numeric(10,2) not null check (amount_inr >= 0),
  status text not null default 'requested' check (status in ('requested', 'approved', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_not_own_listing check (buyer_id <> seller_id)
);

create table if not exists public.expense_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null,
  amount_inr numeric(10,2) not null check (amount_inr >= 0),
  spent_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_inr numeric(10,2) not null check (target_inr > 0),
  saved_inr numeric(10,2) not null default 0 check (saved_inr >= 0),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investment_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  investment_type text not null,
  amount_inr numeric(10,2) not null check (amount_inr > 0),
  invested_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_messages_channel_created_idx on public.community_messages(channel_id, created_at);
create index if not exists marketplace_listings_published_idx on public.marketplace_listings(status, created_at desc);
create index if not exists marketplace_orders_buyer_idx on public.marketplace_orders(buyer_id, created_at desc);
create index if not exists expense_entries_user_spent_idx on public.expense_entries(user_id, spent_on desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
drop trigger if exists career_profiles_set_updated_at on public.career_profiles;
drop trigger if exists colleges_set_updated_at on public.colleges;
drop trigger if exists community_messages_set_updated_at on public.community_messages;
drop trigger if exists marketplace_listings_set_updated_at on public.marketplace_listings;
drop trigger if exists marketplace_orders_set_updated_at on public.marketplace_orders;
drop trigger if exists savings_goals_set_updated_at on public.savings_goals;
drop trigger if exists study_tasks_set_updated_at on public.study_tasks;
create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger career_profiles_set_updated_at before update on public.career_profiles for each row execute procedure public.set_updated_at();
create trigger colleges_set_updated_at before update on public.colleges for each row execute procedure public.set_updated_at();
create trigger community_messages_set_updated_at before update on public.community_messages for each row execute procedure public.set_updated_at();
create trigger marketplace_listings_set_updated_at before update on public.marketplace_listings for each row execute procedure public.set_updated_at();
create trigger marketplace_orders_set_updated_at before update on public.marketplace_orders for each row execute procedure public.set_updated_at();
create trigger savings_goals_set_updated_at before update on public.savings_goals for each row execute procedure public.set_updated_at();
create trigger study_tasks_set_updated_at before update on public.study_tasks for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.career_profiles enable row level security;
alter table public.colleges enable row level security;
alter table public.career_survey_responses enable row level security;
alter table public.community_channels enable row level security;
alter table public.community_messages enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.marketplace_orders enable row level security;
alter table public.expense_entries enable row level security;
alter table public.savings_goals enable row level security;
alter table public.investment_entries enable row level security;
alter table public.study_tasks enable row level security;

create policy "profiles are visible to signed-in users" on public.profiles for select to authenticated using (true);
create policy "users can update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "catalogues are readable when published" on public.career_profiles for select to authenticated using (is_published);
create policy "colleges are readable when published" on public.colleges for select to authenticated using (is_published);
create policy "users manage own surveys" on public.career_survey_responses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "active channels are readable" on public.community_channels for select to authenticated using (is_active);
create policy "signed-in users can read messages" on public.community_messages for select to authenticated using (true);
create policy "users create own messages" on public.community_messages for insert to authenticated with check (author_id = auth.uid());
create policy "users update own messages" on public.community_messages for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "users delete own messages" on public.community_messages for delete to authenticated using (author_id = auth.uid());
create policy "published listings and own listings are readable" on public.marketplace_listings for select to authenticated using (status = 'published' or seller_id = auth.uid());
create policy "users create own listings" on public.marketplace_listings for insert to authenticated with check (seller_id = auth.uid());
create policy "users update own listings" on public.marketplace_listings for update to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid());
create policy "users delete own listings" on public.marketplace_listings for delete to authenticated using (seller_id = auth.uid());
create policy "participants can read orders" on public.marketplace_orders for select to authenticated using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "buyers create own orders" on public.marketplace_orders for insert to authenticated with check (buyer_id = auth.uid());
create policy "participants update orders" on public.marketplace_orders for update to authenticated using (buyer_id = auth.uid() or seller_id = auth.uid()) with check (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "users manage own expenses" on public.expense_entries for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own goals" on public.savings_goals for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own investments" on public.investment_entries for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own study tasks" on public.study_tasks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('campus360-assets', 'campus360-assets', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "authenticated users can read marketplace assets" on storage.objects for select to authenticated using (bucket_id = 'campus360-assets');
create policy "users upload into their own folder" on storage.objects for insert to authenticated with check (bucket_id = 'campus360-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users update own uploaded assets" on storage.objects for update to authenticated using (bucket_id = 'campus360-assets' and owner_id = auth.uid()) with check (bucket_id = 'campus360-assets' and owner_id = auth.uid());
create policy "users delete own uploaded assets" on storage.objects for delete to authenticated using (bucket_id = 'campus360-assets' and owner_id = auth.uid());
