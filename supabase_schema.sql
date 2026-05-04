-- Burger Rush Restaurant Supabase schema
-- Run this file in Supabase Dashboard > SQL Editor.
-- It creates readable columns for orders and migrates old JSON order data if it exists.

create table if not exists public.orders (
  id text primary key,
  date text not null,
  type text not null check (type in ('Delivery', 'Pickup')),
  customer_name text not null,
  customer_phone text not null,
  delivery_address text,
  order_items jsonb not null default '[]'::jsonb,
  subtotal numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 0,
  tax numeric(10, 2) not null default 0,
  total_price numeric(10, 2) not null default 0,
  status text not null default 'Pending' check (status in ('Pending', 'Done')),
  created_at timestamptz not null default now()
);

do $$
begin
  alter table public.orders add column if not exists customer_name text;
  alter table public.orders add column if not exists customer_phone text;
  alter table public.orders add column if not exists delivery_address text;
  alter table public.orders add column if not exists order_items jsonb default '[]'::jsonb;
  alter table public.orders add column if not exists subtotal numeric(10, 2) default 0;
  alter table public.orders add column if not exists delivery_fee numeric(10, 2) default 0;
  alter table public.orders add column if not exists tax numeric(10, 2) default 0;
  alter table public.orders add column if not exists total_price numeric(10, 2) default 0;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'status'
  ) then
    alter table public.orders drop constraint if exists orders_status_check;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'customer'
  ) then
    update public.orders
    set
      customer_name = coalesce(customer_name, nullif(customer ->> 'name', ''), 'Unknown Customer'),
      customer_phone = coalesce(customer_phone, nullif(customer ->> 'phone', ''), 'Not provided'),
      delivery_address = coalesce(delivery_address, customer ->> 'address', '')
    where customer_name is null or customer_phone is null or delivery_address is null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'items'
  ) then
    update public.orders
    set order_items = coalesce(order_items, items, '[]'::jsonb)
    where order_items is null or order_items = '[]'::jsonb;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'total'
  ) then
    update public.orders
    set total_price = coalesce(nullif(total_price, 0), total, 0)
    where total_price is null or total_price = 0;
  end if;
end $$;

update public.orders
set
  customer_name = coalesce(customer_name, 'Unknown Customer'),
  customer_phone = coalesce(customer_phone, 'Not provided'),
  delivery_address = coalesce(delivery_address, ''),
  order_items = coalesce(order_items, '[]'::jsonb),
  subtotal = coalesce(subtotal, total_price, 0),
  delivery_fee = coalesce(delivery_fee, 0),
  tax = coalesce(tax, 0),
  total_price = coalesce(total_price, 0),
  status = case
    when status = 'Done' then 'Done'
    else 'Pending'
  end;

alter table public.orders alter column customer_name set not null;
alter table public.orders alter column customer_phone set not null;
alter table public.orders alter column order_items set not null;
alter table public.orders alter column subtotal set not null;
alter table public.orders alter column delivery_fee set not null;
alter table public.orders alter column tax set not null;
alter table public.orders alter column total_price set not null;
alter table public.orders alter column status set default 'Pending';
alter table public.orders add constraint orders_status_check check (status in ('Pending', 'Done'));

alter table public.orders drop column if exists customer;
alter table public.orders drop column if exists items;
alter table public.orders drop column if exists total;

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
create index if not exists orders_customer_phone_idx on public.orders (customer_phone);
create index if not exists reservations_created_at_idx on public.reservations (created_at desc);
create index if not exists reservations_date_idx on public.reservations (date);

alter table public.orders enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "Allow public order inserts" on public.orders;
drop policy if exists "Allow public order reads" on public.orders;
drop policy if exists "Allow public order status updates" on public.orders;
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

create policy "Allow public order status updates"
on public.orders
for update
to anon
using (true)
with check (status in ('Pending', 'Done'));

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
