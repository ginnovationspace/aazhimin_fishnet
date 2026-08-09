# Aazhimin

A modern ecommerce marketplace for the fishing-net industry.

## Monorepo Structure

This project is a Turborepo monorepo containing:

- `apps/web`: Next.js frontend application
- `apps/api`: Node.js Express API server
- `packages/database`: Prisma schema and database client
- `packages/ui`: Shared UI components
- `packages/types`: Shared TypeScript types
- `packages/validation`: Shared Zod validation schemas
- `packages/auth`: Shared authentication helpers
- `packages/config`: Shared configuration utilities

## Getting Started

1. Copy `.env.example` to `.env` and fill in the required environment variables.
2. Install dependencies: `pnpm install`
3. Prisma generate: `pnpm prisma:generate` (or run `pnpm dev` which includes it)
4. Run migrations: `pnpm prisma:migrate`
5. Start the development servers: `pnpm dev`

## Available Scripts

In the root directory:

- `pnpm dev`: Start both the API and web app in development mode
- `pnpm build`: Build both applications
- `pnpm lint`: Run ESLint across the workspace
- `pnpm typecheck`: Run TypeScript type checking
- `pnpm test`: Run tests

In the `apps/api` directory:

- `pnpm prisma:generate`: Generate Prisma client
- `pnpm prisma:migrate`: Run Prisma migrations
- `pnpm prisma:studio`: Open Prisma Studio

## Environment Variables

See `.env.example` for the required variables.

## License

ISC