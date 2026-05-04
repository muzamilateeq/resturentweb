# Burger Rush Restaurant

A responsive Vite + React fast-food restaurant website with online ordering, table booking, add-to-cart animation, and Supabase Postgres storage.

## Features

- Customer-facing fast-food landing page
- Searchable and filterable menu
- Smooth product-card hover effect
- Add-to-cart fly animation
- Delivery and pickup checkout form
- Table booking form
- Supabase Postgres storage for orders and table bookings
- Responsive layout for desktop, tablet, and mobile screens

## Local Development

```powershell
npm install
npm run dev
```

Customer website:

```text
http://127.0.0.1:5173/
```

Private dashboard:

```text
http://127.0.0.1:5173/admin-dashboard
```

## Production Build

```powershell
npm run build
```

## GitHub Pages Deployment

This project includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

After pushing to the `main` branch:

1. Open the GitHub repository.
2. Go to **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.
4. Wait for the **Deploy to GitHub Pages** action to finish.

Your customer website will be available at:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

### Alternative: Deploy From `docs`

If you use **Settings > Pages > Deploy from a branch**, run:

```powershell
npm run deploy:docs
```

Then commit and push the generated `docs` folder. In GitHub Pages settings choose:

```text
Source: Deploy from a branch
Branch: main
Folder: /docs
```

## Supabase Data

Orders and bookings are saved in Supabase Postgres through the Supabase REST API. View customer data directly inside your Supabase dashboard tables:

- `orders`
- `reservations`

The website also includes a private owner dashboard at `/admin-dashboard` so you can view Supabase orders, update Pending/Done status, and review table bookings without opening Supabase every time.

Run [supabase_schema.sql](./supabase_schema.sql) in **Supabase > SQL Editor** before using the website.

The schema creates:

- `orders`: customer name, phone, address, selected food, subtotal, delivery fee, tax, total price, status, and timestamps in clear columns
- `reservations`: booking name, date, time, guests, and timestamps

You can also copy and run this SQL manually:

```sql
create table if not exists public.orders (
  id text primary key,
  date text not null,
  type text not null,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text,
  order_items jsonb not null default '[]'::jsonb,
  subtotal numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 0,
  tax numeric(10, 2) not null default 0,
  total_price numeric(10, 2) not null default 0,
  status text not null default 'Pending',
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

alter table public.orders enable row level security;
alter table public.reservations enable row level security;

create policy "Allow public order inserts"
on public.orders for insert
to anon
with check (true);

create policy "Allow public reservation inserts"
on public.reservations for insert
to anon
with check (true);
```

For a production restaurant, add server-side validation and private dashboard authentication if you later need an internal admin panel.
