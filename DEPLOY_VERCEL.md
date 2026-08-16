# Deploying Fishnet on Vercel

Deploy this monorepo as two Vercel projects connected to the same repository.

## Web project

1. Import the repository in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Select the Next.js framework preset.
4. Add `NEXT_PUBLIC_API_BASE_URL` with the deployed API URL, for example `https://fishnet-api.vercel.app`.
5. Add `NEXT_PUBLIC_APP_URL` with the deployed web URL.

## API project

1. Import the same repository as a second project.
2. Set **Root Directory** to `apps/api`.
3. Keep the detected Express framework settings.
4. Add `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `API_PUBLIC_URL`, and any Stripe or Google OAuth secrets in Vercel Project Settings.
5. Set `FRONTEND_URL` to the deployed web URL and `API_PUBLIC_URL` to the deployed API URL.

The API exports its Express app for Vercel and only calls `listen()` during local development. Do not create a Next.js API proxy or deploy the removed repository-root `vercel.json`.
# Vercel deployment

Deploy the repository as **two Vercel projects**. The web site and Express API are separate deployments.

## 1. API project

Create a Vercel project from this repository with **Root Directory** set to `apps/api`.
Set these variables for Production, Preview, and Development:

- `DATABASE_URL` — the Neon/Postgres connection string.
- `JWT_SECRET` — a long, unique secret.
- `FRONTEND_URL=https://fishnet-web.vercel.app`
- `API_PUBLIC_URL=https://YOUR-API-PROJECT.vercel.app`
- `OAUTH_STATE_SECRET` — required only for OAuth.
- Google and Stripe secrets — required only when those integrations are enabled.

Deploy the API and confirm `https://YOUR-API-PROJECT.vercel.app/health` returns JSON with `status: "OK"`.

## 2. Web project

Create another Vercel project from the same repository with **Root Directory** set to `apps/web`.
Set these variables for Production, Preview, and Development:

- `NEXT_PUBLIC_API_BASE_URL=https://YOUR-API-PROJECT.vercel.app`
- `NEXT_PUBLIC_APP_URL=https://fishnet-web.vercel.app`

`NEXT_PUBLIC_API_BASE_URL` must be the deployed API URL — never `http://localhost:4000`. A Vercel browser cannot access localhost on your computer. Redeploy the web project after setting it because `NEXT_PUBLIC_*` values are built into the browser bundle.

## Verify

1. Open `https://YOUR-API-PROJECT.vercel.app/health`.
2. Open `https://YOUR-API-PROJECT.vercel.app/api/products`.
3. Open `https://fishnet-web.vercel.app` and confirm product requests no longer target `localhost:4000`.
