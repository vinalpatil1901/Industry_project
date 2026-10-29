-- Campus360 community schema
-- Run this file in the Supabase SQL Editor. It is safe to run more than once
-- and intentionally creates no sample students, connections, or messages.

create extension if not exists pgcrypto;

-- One public profile is created for every Supabase auth account. The community
-- directory only reads these safe profile fields, never auth.users directly.
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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    case
      when char_length(trim(coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)))) between 2 and 80
        then left(trim(coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1))), 80)
      else 'Campus360 Student'
    end
  )
  on conflict (id) do update
    set display_name = excluded.display_name
    where public.profiles.display_name is null or trim(public.profiles.display_name) = '';
  return new;
end;
$$;

-- Backfill accounts created before the trigger was installed. This is what
-- makes already-registered students immediately visible in the directory.
insert into public.profiles (id, display_name)
select
  u.id,
  case
    when char_length(trim(coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(u.email, ''), '@', 1)))) between 2 and 80
      then left(trim(coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(u.email, ''), '@', 1))), 80)
    else 'Campus360 Student'
  end
from auth.users u
on conflict (id) do nothing;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- A single row represents a relationship in either direction. The expression
-- index prevents duplicate/crossed requests for the same two students.
create table if not exists public.community_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_connection_not_self check (requester_id <> recipient_id)
);

create unique index if not exists community_connections_unique_pair_idx
  on public.community_connections (least(requester_id, recipient_id), greatest(requester_id, recipient_id));
create index if not exists community_connections_requester_idx on public.community_connections (requester_id, status);
create index if not exists community_connections_recipient_idx on public.community_connections (recipient_id, status);

drop trigger if exists community_connections_set_updated_at on public.community_connections;
create trigger community_connections_set_updated_at
  before update on public.community_connections
  for each row execute procedure public.set_updated_at();

create or replace function public.validate_connection_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.requester_id <> old.requester_id or new.recipient_id <> old.recipient_id then
    raise exception 'Connection participants cannot be changed';
  end if;
  if old.status <> 'pending' or new.status not in ('accepted', 'rejected') then
    raise exception 'Only pending connection requests can be accepted or rejected';
  end if;
  return new;
end;
$$;

drop trigger if exists community_connections_validate_update on public.community_connections;
create trigger community_connections_validate_update
  before update on public.community_connections
  for each row execute procedure public.validate_connection_update();

-- Direct conversations can only be created by connected students and always
-- store their ids in a stable order, which guarantees one chat per pair.
create table if not exists public.community_direct_conversations (
  id uuid primary key default gen_random_uuid(),
  participant_one_id uuid not null references public.profiles(id) on delete cascade,
  participant_two_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint community_conversation_distinct_participants check (participant_one_id <> participant_two_id),
  constraint community_conversation_ordered_participants check (participant_one_id < participant_two_id),
  constraint community_conversation_unique_pair unique (participant_one_id, participant_two_id)
);

create table if not exists public.community_direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.community_direct_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists community_direct_messages_conversation_created_idx
  on public.community_direct_messages (conversation_id, created_at);

-- Security-definer helper used by the conversation policy. It has no exposed
-- data and only answers whether the pair has an accepted connection.
create or replace function public.users_are_connected(first_user uuid, second_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_connections c
    where c.status = 'accepted'
      and ((c.requester_id = first_user and c.recipient_id = second_user)
        or (c.requester_id = second_user and c.recipient_id = first_user))
  );
$$;

alter table public.profiles enable row level security;
alter table public.community_connections enable row level security;
alter table public.community_direct_conversations enable row level security;
alter table public.community_direct_messages enable row level security;

drop policy if exists "profiles are visible to signed-in users" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;
create policy "profiles are visible to signed-in users"
  on public.profiles for select to authenticated using (true);
create policy "users can update own profile"
  on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "participants can view connections" on public.community_connections;
drop policy if exists "users can send connection requests" on public.community_connections;
drop policy if exists "recipients can respond to connection requests" on public.community_connections;
create policy "participants can view connections"
  on public.community_connections for select to authenticated
  using (requester_id = auth.uid() or recipient_id = auth.uid());
create policy "users can send connection requests"
  on public.community_connections for insert to authenticated
  with check (requester_id = auth.uid() and recipient_id <> auth.uid() and status = 'pending');
create policy "recipients can respond to connection requests"
  on public.community_connections for update to authenticated
  using (recipient_id = auth.uid() and status = 'pending')
  with check (recipient_id = auth.uid() and status in ('accepted', 'rejected'));

drop policy if exists "participants can view direct conversations" on public.community_direct_conversations;
drop policy if exists "connected participants can create conversations" on public.community_direct_conversations;
create policy "participants can view direct conversations"
  on public.community_direct_conversations for select to authenticated
  using (participant_one_id = auth.uid() or participant_two_id = auth.uid());
create policy "connected participants can create conversations"
  on public.community_direct_conversations for insert to authenticated
  with check (
    (participant_one_id = auth.uid() or participant_two_id = auth.uid())
    and public.users_are_connected(participant_one_id, participant_two_id)
  );

drop policy if exists "participants can view direct messages" on public.community_direct_messages;
drop policy if exists "participants can send direct messages" on public.community_direct_messages;
create policy "participants can view direct messages"
  on public.community_direct_messages for select to authenticated
  using (
    exists (
      select 1 from public.community_direct_conversations c
      where c.id = conversation_id
        and (c.participant_one_id = auth.uid() or c.participant_two_id = auth.uid())
    )
  );
create policy "participants can send direct messages"
  on public.community_direct_messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.community_direct_conversations c
      where c.id = conversation_id
        and (c.participant_one_id = auth.uid() or c.participant_two_id = auth.uid())
    )
  );

-- Supabase Realtime needs each table in its publication. The exception block
-- keeps this file re-runnable after a table has already been added.
do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null;
end;
$$;
do $$
begin
  alter publication supabase_realtime add table public.community_connections;
exception when duplicate_object then null;
end;
$$;
do $$
begin
  alter publication supabase_realtime add table public.community_direct_messages;
exception when duplicate_object then null;
end;
$$;

-- Marketplace asset policies retained for the existing marketplace module.
drop policy if exists "authenticated users can read marketplace assets" on storage.objects;
drop policy if exists "users upload into their own folder" on storage.objects;
drop policy if exists "users update own uploaded assets" on storage.objects;
drop policy if exists "users delete own uploaded assets" on storage.objects;
create policy "authenticated users can read marketplace assets" on storage.objects for select to authenticated using (bucket_id = 'campus360-assets');
create policy "users upload into their own folder" on storage.objects for insert to authenticated with check (bucket_id = 'campus360-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users update own uploaded assets" on storage.objects for update to authenticated using (bucket_id = 'campus360-assets' and owner_id = auth.uid()::text) with check (bucket_id = 'campus360-assets' and owner_id = auth.uid()::text);
create policy "users delete own uploaded assets" on storage.objects for delete to authenticated using (bucket_id = 'campus360-assets' and owner_id = auth.uid()::text);

-- Remaining application data models. These declarations keep the web client,
-- including Surveys, College Recommendations, Learn & Earn and Money, aligned
-- with the database when this schema is applied to a fresh project.
create table if not exists public.career_survey_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  recommended_career_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text,
  country text not null default 'India',
  institution_type text,
  rating numeric(2, 1) check (rating between 0 and 5),
  ranking text,
  programs jsonb not null default '[]'::jsonb,
  career_tags text[] not null default '{}',
  average_package text,
  highest_package text,
  annual_fees text,
  description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint colleges_name_city_unique unique (name, city)
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 180),
  category text not null check (category in ('Notes', 'Previous Year Question Papers (PYQs)', 'Study Guides', 'Used Books')),
  subject text not null,
  course text not null,
  semester text not null,
  college_name text,
  description text not null check (char_length(trim(description)) between 10 and 4000),
  resource_type text not null check (resource_type in ('PDF', 'PYQ', 'Study guide', 'Physical used book')),
  price_inr numeric(10, 2) not null check (price_inr >= 0),
  condition text check (condition in ('Like New', 'Good', 'Acceptable')),
  contact_details text,
  asset_path text,
  image_path text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listing_asset_requirement check ((resource_type = 'Physical used book' and image_path is not null) or (resource_type <> 'Physical used book' and asset_path is not null))
);

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete restrict,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  amount_inr numeric(10, 2) not null check (amount_inr >= 0),
  status text not null default 'requested' check (status in ('requested', 'approved', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_not_own_listing check (buyer_id <> seller_id),
  constraint marketplace_order_unique_request unique (listing_id, buyer_id)
);

create table if not exists public.expense_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 180),
  category text not null,
  amount_inr numeric(10, 2) not null check (amount_inr > 0),
  spent_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 180),
  target_inr numeric(10, 2) not null check (target_inr > 0),
  saved_inr numeric(10, 2) not null default 0 check (saved_inr >= 0),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investment_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  investment_type text not null,
  amount_inr numeric(10, 2) not null check (amount_inr > 0),
  invested_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 300),
  subject text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists career_survey_user_created_idx on public.career_survey_responses (user_id, created_at desc);
create index if not exists marketplace_listings_published_idx on public.marketplace_listings (status, created_at desc);
create index if not exists marketplace_orders_buyer_idx on public.marketplace_orders (buyer_id, created_at desc);
create index if not exists expense_entries_user_spent_idx on public.expense_entries (user_id, spent_on desc);
create index if not exists savings_goals_user_idx on public.savings_goals (user_id, created_at desc);
create index if not exists investment_entries_user_idx on public.investment_entries (user_id, invested_on desc);
create index if not exists study_tasks_user_idx on public.study_tasks (user_id, due_at);

drop trigger if exists colleges_set_updated_at on public.colleges;
drop trigger if exists marketplace_listings_set_updated_at on public.marketplace_listings;
drop trigger if exists marketplace_orders_set_updated_at on public.marketplace_orders;
drop trigger if exists savings_goals_set_updated_at on public.savings_goals;
drop trigger if exists study_tasks_set_updated_at on public.study_tasks;
create trigger colleges_set_updated_at before update on public.colleges for each row execute procedure public.set_updated_at();
create trigger marketplace_listings_set_updated_at before update on public.marketplace_listings for each row execute procedure public.set_updated_at();
create trigger marketplace_orders_set_updated_at before update on public.marketplace_orders for each row execute procedure public.set_updated_at();
create trigger savings_goals_set_updated_at before update on public.savings_goals for each row execute procedure public.set_updated_at();
create trigger study_tasks_set_updated_at before update on public.study_tasks for each row execute procedure public.set_updated_at();

alter table public.career_survey_responses enable row level security;
alter table public.colleges enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.marketplace_orders enable row level security;
alter table public.expense_entries enable row level security;
alter table public.savings_goals enable row level security;
alter table public.investment_entries enable row level security;
alter table public.study_tasks enable row level security;

drop policy if exists "users manage own surveys" on public.career_survey_responses;
drop policy if exists "published colleges are readable" on public.colleges;
drop policy if exists "published listings and own listings are readable" on public.marketplace_listings;
drop policy if exists "users create own listings" on public.marketplace_listings;
drop policy if exists "users update own listings" on public.marketplace_listings;
drop policy if exists "users delete own listings" on public.marketplace_listings;
drop policy if exists "participants can read orders" on public.marketplace_orders;
drop policy if exists "buyers create own orders" on public.marketplace_orders;
drop policy if exists "sellers can update orders" on public.marketplace_orders;
drop policy if exists "users manage own expenses" on public.expense_entries;
drop policy if exists "users manage own goals" on public.savings_goals;
drop policy if exists "users manage own investments" on public.investment_entries;
drop policy if exists "users manage own study tasks" on public.study_tasks;
create policy "users manage own surveys" on public.career_survey_responses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "published colleges are readable" on public.colleges for select to authenticated using (is_published);
create policy "published listings and own listings are readable" on public.marketplace_listings for select to authenticated using (status = 'published' or seller_id = auth.uid());
create policy "users create own listings" on public.marketplace_listings for insert to authenticated with check (seller_id = auth.uid());
create policy "users update own listings" on public.marketplace_listings for update to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid());
create policy "users delete own listings" on public.marketplace_listings for delete to authenticated using (seller_id = auth.uid());
create policy "participants can read orders" on public.marketplace_orders for select to authenticated using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "buyers create own orders" on public.marketplace_orders for insert to authenticated with check (buyer_id = auth.uid() and seller_id <> auth.uid() and status in ('requested', 'completed'));
create policy "sellers can update orders" on public.marketplace_orders for update to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid() and status in ('approved', 'completed', 'cancelled'));
create policy "users manage own expenses" on public.expense_entries for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own goals" on public.savings_goals for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own investments" on public.investment_entries for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own study tasks" on public.study_tasks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Curated public institutions for a usable production recommendation baseline.
-- These are institutions and programs only; volatile fees, rankings and salary
-- figures are intentionally left null instead of presenting stale estimates.
insert into public.colleges (name, city, state, country, institution_type, programs, career_tags, description, is_published)
values
  ('Indian Institute of Technology Bombay', 'Mumbai', 'Maharashtra', 'India', 'Public technical university', '["B.Tech Computer Science and Engineering", "B.Tech Electrical Engineering", "B.Des"]'::jsonb, array['tech','ai','cloud','quant','engineering','design'], 'Public technical university offering engineering, science, design, and research programmes.', true),
  ('Indian Institute of Technology Delhi', 'New Delhi', 'Delhi', 'India', 'Public technical university', '["B.Tech Computer Science and Engineering", "B.Tech Mathematics and Computing", "B.Des"]'::jsonb, array['tech','ai','cloud','quant','engineering','design'], 'Public technical university offering engineering, science, design, and research programmes.', true),
  ('Indian Institute of Technology Madras', 'Chennai', 'Tamil Nadu', 'India', 'Public technical university', '["B.Tech Computer Science and Engineering", "B.Tech Data Science", "B.Tech Electrical Engineering"]'::jsonb, array['tech','ai','cloud','quant','engineering','research'], 'Public technical university offering engineering, science, and research programmes.', true),
  ('Indian Institute of Technology Kanpur', 'Kanpur', 'Uttar Pradesh', 'India', 'Public technical university', '["B.Tech Computer Science and Engineering", "B.Tech Aerospace Engineering", "B.Tech Biological Sciences"]'::jsonb, array['tech','ai','cloud','quant','engineering','research','biotech'], 'Public technical university offering engineering, science, and research programmes.', true),
  ('Indian Institute of Science', 'Bengaluru', 'Karnataka', 'India', 'Public research university', '["BS Research", "M.Tech Artificial Intelligence", "M.Tech Computational and Data Science"]'::jsonb, array['ai','tech','cloud','quant','engineering','research','biotech'], 'Public research university with undergraduate and postgraduate science and engineering programmes.', true),
  ('Indian Institute of Management Ahmedabad', 'Ahmedabad', 'Gujarat', 'India', 'Public management institute', '["Integrated Programme in Management", "Post Graduate Programme in Management"]'::jsonb, array['business','finance','quant','management'], 'Public management institute offering management and business programmes.', true),
  ('National Institute of Design', 'Ahmedabad', 'Gujarat', 'India', 'Public design institute', '["Bachelor of Design", "Master of Design"]'::jsonb, array['design','creative','product'], 'National design institute offering undergraduate and postgraduate design programmes.', true),
  ('All India Institute of Medical Sciences, New Delhi', 'New Delhi', 'Delhi', 'India', 'Public medical university', '["MBBS", "Bachelor of Science Nursing", "Postgraduate Medical Education"]'::jsonb, array['healthcare','medicine','research'], 'Public medical university offering medical, nursing, and health-science programmes.', true),
  ('National Law School of India University', 'Bengaluru', 'Karnataka', 'India', 'Public law university', '["BA LLB (Hons)", "LLM"]'::jsonb, array['law','policy','business'], 'Public law university offering undergraduate and postgraduate legal education.', true),
  ('Tata Institute of Social Sciences', 'Mumbai', 'Maharashtra', 'India', 'Public social-science institute', '["BA in Social Sciences", "MA in Social Work", "MA in Development Studies"]'::jsonb, array['social','policy','research','management'], 'Public institute offering social science, policy, and development programmes.', true)
on conflict (name, city) do update set
  programs = excluded.programs,
  career_tags = excluded.career_tags,
  description = excluded.description,
  is_published = true,
  updated_at = now();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('campus360-assets', 'campus360-assets', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
