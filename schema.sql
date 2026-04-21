-- Church of Second Chances — Supabase schema
-- Run in Supabase SQL Editor (or supabase db push). Enable Auth (Email + Phone) in Dashboard.
--
-- Integrations (plug in later):
--   • Owncast: front-end iframe URL (see app/(public)/live/page.tsx)
--   • Twilio: Auth → Providers → Phone → Twilio credentials; SMS OTP + edge dispatch below
--   • Resend: RESEND_API_KEY in Edge secrets; send transactional / reminder / live emails
--   • Web Push: VAPID keys in .env + Dashboard; see .env.example
--   • Future AI sermon tagging: store Whisper segments in sermons.transcript; optional embedding column below

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";
-- pgvector: enable in Dashboard → Database → Extensions → vector (recommended for semantic search)
-- If this fails locally, comment the next two lines and the embedding column on public.sermons.
create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  email text,
  notify_email boolean not null default false,
  notify_sms boolean not null default false,
  notify_push boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  is_live boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid references public.profiles (id),
  preached_at date not null,
  duration_seconds integer,
  video_url text,
  audio_url text,
  thumbnail_path text,
  key_verses text[] not null default '{}',
  tags text[] not null default '{}',
  bible_books text[] not null default '{}',
  transcript jsonb not null default '[]'::jsonb,
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(description, '')), 'B')
    || setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C')
    || setweight(to_tsvector('english', coalesce(array_to_string(key_verses, ' '), '')), 'C')
  ) stored,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sermons_search_vector_idx on public.sermons using gin (search_vector);
create index if not exists sermons_preached_at_idx on public.sermons (preached_at desc);
create index if not exists sermons_tags_gin on public.sermons using gin (tags);
create index if not exists sermons_bible_books_gin on public.sermons using gin (bible_books);

-- Dedupe scheduled reminders (24h / 1h) — edge function marks rows here after send
create table if not exists public.event_reminders_sent (
  event_id uuid not null references public.events (id) on delete cascade,
  reminder_type text not null check (reminder_type in ('reminder_24h', 'reminder_1h')),
  sent_at timestamptz not null default now(),
  primary key (event_id, reminder_type)
);

-- Outbound fan-out queue — Edge Function (service role) claims rows with processed_at IS NULL
create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  channel text not null check (channel in ('email', 'sms', 'push')),
  notification_type text not null check (notification_type in ('reminder_24h', 'reminder_1h', 'live_now')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists notification_outbox_pending_idx
  on public.notification_outbox (processed_at)
  where processed_at is null;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Storage (sermon thumbnails / media)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('sermon-media', 'sermon-media', true)
on conflict (id) do nothing;

-- Public read; authenticated admins write (mirror profiles.is_admin)
create policy "Public read sermon-media"
on storage.objects for select
using (bucket_id = 'sermon-media');

create policy "Admins upload sermon-media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'sermon-media'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

create policy "Admins update sermon-media"
on storage.objects for update to authenticated
using (
  bucket_id = 'sermon-media'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

create policy "Admins delete sermon-media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'sermon-media'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

-- ---------------------------------------------------------------------------
-- Triggers: profile bootstrap + timestamps + live notifications
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

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists sermons_set_updated_at on public.sermons;
create trigger sermons_set_updated_at
before update on public.sermons
for each row execute function public.set_updated_at();

-- New auth user → profile row (metadata from signInWithOtp options.data)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, notify_email, notify_sms, notify_push)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data->>'phone', ''), new.phone),
    coalesce((new.raw_user_meta_data->>'notify_email')::boolean, false),
    coalesce((new.raw_user_meta_data->>'notify_sms')::boolean, false),
    coalesce((new.raw_user_meta_data->>'notify_push')::boolean, false)
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    notify_email = excluded.notify_email,
    notify_sms = excluded.notify_sms,
    notify_push = excluded.notify_push,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- When an event goes live, fan out to opted-in members (email / SMS / push with subscription)
create or replace function public.queue_live_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and new.is_live is true
     and coalesce(old.is_live, false) is distinct from true then
    insert into public.notification_outbox (user_id, event_id, channel, notification_type, payload)
    select
      p.id,
      new.id,
      ch.channel,
      'live_now',
      jsonb_build_object(
        'title', new.title,
        'starts_at', new.starts_at,
        'event_id', new.id
      )
    from public.profiles p
    cross join lateral (
      select 'email'::text as channel
      where p.notify_email and coalesce(nullif(trim(p.email), ''), null) is not null
      union all
      select 'sms'
      where p.notify_sms and coalesce(nullif(trim(p.phone), ''), null) is not null
      union all
      select 'push'
      where p.notify_push
        and exists (select 1 from public.push_subscriptions ps where ps.user_id = p.id)
    ) ch;
  end if;
  return new;
end;
$$;

drop trigger if exists events_queue_live on public.events;
create trigger events_queue_live
after update on public.events
for each row execute function public.queue_live_notifications();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.sermons enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.event_reminders_sent enable row level security;

-- Profiles: each user reads/updates self (insert handled by trigger; optional direct insert for tests)
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Events & sermons: public read; admin write
create policy "events_select_public"
  on public.events for select
  using (true);

create policy "events_insert_admin"
  on public.events for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "events_update_admin"
  on public.events for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "events_delete_admin"
  on public.events for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "sermons_select_public"
  on public.sermons for select
  using (true);

create policy "sermons_insert_admin"
  on public.sermons for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "sermons_update_admin"
  on public.sermons for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "sermons_delete_admin"
  on public.sermons for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Push subscriptions: owner only
create policy "push_subscriptions_owner_all"
  on public.push_subscriptions for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Outbox / reminder audit: no policies for authenticated — only service_role (Edge Functions) bypasses RLS

-- ---------------------------------------------------------------------------
-- Realtime: live service toggles + countdowns
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.events;

-- ---------------------------------------------------------------------------
-- Reminder scheduling (24h / 1h) — design notes
-- ---------------------------------------------------------------------------
-- Implement dispatch in supabase/functions/dispatch-event-reminders (cron every 5–10 minutes):
--   1) Select events where starts_at is between now()+50m and now()+70m and no row in event_reminders_sent for 'reminder_1h'
--   2) Select events where starts_at is between now()+23h50m and now()+24h10m for 'reminder_24h'
--   3) Insert notification_outbox rows per user/channel (same shape as live trigger)
--   4) Insert event_reminders_sent to dedupe
-- Optional: enable pg_cron in Dashboard and schedule:
--   select net.http_post(
--     url := 'https://<project-ref>.supabase.co/functions/v1/dispatch-event-reminders',
--     headers := jsonb_build_object('Authorization', 'Bearer <service_role_secret>'),
--     body := '{}'::jsonb
--   );

-- ---------------------------------------------------------------------------
-- Bootstrap first admin (replace with your user id after first signup)
-- ---------------------------------------------------------------------------
-- update public.profiles set is_admin = true where email = 'you@example.com';
