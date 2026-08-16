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
