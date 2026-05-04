# Burger Rush Restaurant

A responsive Vite + React fast-food restaurant website with online ordering, table booking, add-to-cart animation, and a private owner page for saved orders.

## Features

- Customer-facing fast-food landing page
- Searchable and filterable menu
- Smooth product-card hover effect
- Add-to-cart fly animation
- Delivery and pickup checkout form
- Table booking form
- Private `/owner` page with passcode-protected order and booking records
- Owner actions for editing, completing, deleting, and exporting orders
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

Owner page locally:

```text
http://127.0.0.1:5173/owner
```

Owner page on GitHub Pages:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/#owner
```

Demo owner passcode:

```text
1234
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

The owner page will be available at:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/#owner
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

## Note

Orders and bookings are saved in Supabase Postgres through the Supabase REST API.

## Supabase Tables

Run this SQL in **Supabase > SQL Editor** before using the website:

```sql
create table if not exists public.orders (
  id text primary key,
  date text not null,
  type text not null,
  customer jsonb not null,
  items jsonb not null,
  total numeric not null,
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

alter table public.orders enable row level security;
alter table public.reservations enable row level security;

create policy "Allow public order reads"
on public.orders for select
to anon
using (true);

create policy "Allow public order inserts"
on public.orders for insert
to anon
with check (true);

create policy "Allow public order updates"
on public.orders for update
to anon
using (true)
with check (true);

create policy "Allow public order deletes"
on public.orders for delete
to anon
using (true);

create policy "Allow public reservation reads"
on public.reservations for select
to anon
using (true);

create policy "Allow public reservation inserts"
on public.reservations for insert
to anon
with check (true);

create policy "Allow public reservation deletes"
on public.reservations for delete
to anon
using (true);
```

For a production restaurant, replace the demo owner passcode and public update/delete policies with secure Supabase Auth and server-side authorization.
