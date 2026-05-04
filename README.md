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

This project stores demo orders and bookings in browser `localStorage`. For a real public restaurant website, connect the checkout and owner dashboard to a secure backend database and authentication system.
