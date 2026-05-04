-- Burger Rush Restaurant Supabase schema
-- Run this file in Supabase Dashboard > SQL Editor.

create table if not exists public.orders (
  id text primary key,
  date text not null,
  type text not null check (type in ('Delivery', 'Pickup')),
  customer jsonb not null,
  items jsonb not null,
  total numeric(10, 2) not null default 0,
  status text not null default 'New',
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id text primary key,
  date_created text not null,
  name text not null,
  date text not null,
  time text not null,
  guests text not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists reservations_created_at_idx on public.reservations (created_at desc);
create index if not exists reservations_date_idx on public.reservations (date);

alter table public.orders enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "Allow public order inserts" on public.orders;
drop policy if exists "Allow public order reads" on public.orders;
drop policy if exists "Allow public reservation inserts" on public.reservations;
drop policy if exists "Allow public reservation reads" on public.reservations;

create policy "Allow public order reads"
on public.orders
for select
to anon
using (true);

create policy "Allow public order inserts"
on public.orders
for insert
to anon
with check (true);

create policy "Allow public reservation reads"
on public.reservations
for select
to anon
using (true);

create policy "Allow public reservation inserts"
on public.reservations
for insert
to anon
with check (true);
