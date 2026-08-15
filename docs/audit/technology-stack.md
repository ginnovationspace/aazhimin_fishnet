# Technology Stack Audit

## Overview

This document audits the versions and usage of key technologies in the fishnet repository.

## Audited Technologies

| Technology | Version(s) Found | Used? | Healthy? | Outdated? | Problem | Recommendation |
|------------|------------------|-------|----------|-----------|---------|----------------|
| Node.js | Not explicitly specified in root package.json; apps/api and apps/web devDependencies include `@types/node@^24.3.3` suggesting compatibility with Node.js 24.x | Yes (implied by scripts) | Yes (assuming Node.js 24.x is used) | Unknown | No explicit Node.js version in package.json engines field | Add `engines` field to root package.json to specify supported Node.js version (e.g., ">=20.0.0") |
| Package Manager | Not specified; repository uses workspaces and mentions pnpm in earlier context but no lockfile for pnpm seen; appears to use npm (package-lock.json present in apps/api) | Yes (npm inferred from package-lock.json) | Yes | Unknown | Inconsistent package manager usage (pnpm mentioned in early context but npm lockfiles present) | Standardize on one package manager (npm or pnpm) and update documentation; remove unused lockfiles |
| Next.js | ^15.5.3 (apps/web/package.json) | Yes (frontend framework) | Yes | No (latest as of 2026-08) | None | Keep updated |
| React | ^18.3.1 (apps/web/package.json and @fishnet/ui) | Yes (frontend library) | Yes | No | None | Keep updated |
| TypeScript | ^5.9.2 (across all packages) | Yes (type-safe development) | Yes | No | None | Keep updated |
| Tailwind CSS | ^3.3.0 (apps/web devDependencies) | Yes (styling) | Yes | Unknown | Version may be behind; latest is higher | Update to latest Tailwind CSS version |
| @tailwindcss/forms | ^0.5.7 (apps/web) | Yes (plugin) | Yes | Unknown | None | Keep updated |
| @tailwindcss/typography | ^0.5.10 (apps/web) | Yes (plugin) | Yes | Unknown | None | Keep updated |
| ORM (Prisma) | @prisma/client@^6.16.1 (packages/database) | Yes (database access) | Yes | Unknown | Version may be behind; check for updates | Update to latest Prisma version |
| PostgreSQL | Not directly specified; relies on Prisma adapter and DATABASE_URL env var | Yes (via Prisma) | Yes | N/A | None | Ensure Neon PostgreSQL compatibility with Prisma version |
| Authentication | bcryptjs@^2.4.3, jsonwebtoken@^9.0.2 (@fishnet/auth); next-auth@^4.24.11 (apps/web) | Yes (authentication) | Yes | Unknown | next-auth version may be behind; check compatibility with Next.js 15 | Update next-auth to version compatible with Next.js 15; consider using Next.js 15's built-in auth if applicable |
| Validation | zod@^3.22.4 (@fishnet/validation) | Yes (schema validation) | Yes | Unknown | None | Keep updated |
| Testing Framework | Jest@^29.0.0 (apps/api devDependencies) | Yes (backend unit tests) | Yes | Unknown | Jest 29 is behind latest; consider upgrading | Upgrade Jest to latest version; add frontend testing framework (e.g., Vitest, React Testing Library) |
| ESLint | ^8 (across packages) | Yes (linting) | Yes | Unknown | ESLint v9 is latest; consider upgrading | Upgrade ESLint to v9 and update configurations |
| Formatting Tools | None explicitly configured (no Prettier, etc.) | No | N/A | N/A | Missing code formatting standard | Add Prettier configuration and integrate with linting pipeline |
| Turbo | See turbo.json (root) | Yes (monorepo build system) | Yes | Unknown | None | Keep Turbo updated; consider adding more pipeline steps (e.g., checksum) |
| Deployment Tooling | Vercel (implied by next build and Vercel-friendly scripts) | Yes (deployment target) | Yes | Unknown | None | Ensure Vercel configuration (vercel.json) is present and optimized |
| Logging | winston@^3.8.2 (apps/api) | Yes (backend logging) | Yes | Unknown | None | Keep updated |
| HTTP Client | axios@^1.12.1, node-fetch@^3.3.2 (apps/api) | Yes (external HTTP requests) | Yes | Unknown | None | Keep updated |
| File Upload | express-fileupload@^1.4.0 (apps/api) | Yes (file upload handling) | Yes | Unknown | None | Keep updated |
| Date Handling | date-fns@^4.1.0 (apps/web) | Yes (date formatting) | Yes | Unknown | None | Keep updated |
| Sanitization | dompurify@^3.0.8 (apps/web) | Yes (XSS prevention) | Yes | Unknown | None | Keep updated |
| UI Components | @headlessui/react@^1.7.18, flowbite-react@^0.7.2, react-icons@^5.0.1, etc. (apps/web) | Yes (UI library) | Yes | Unknown | None | Keep updated |
| State Management | zustand@^4.5.1 (apps/web) | Yes (client-state management) | Yes | Unknown | None | Keep updated |
| Charts | react-apexcharts@^1.4.1 (apps/web) | Yes (charting) | Yes | Unknown | None | Keep updated |
| Carousel | slick-carousel@^1.8.1 (apps/web) | Yes (carousel component) | Yes | Unknown | Consider replacing with more modern accessible alternative | Evaluate replacing with a more accessible carousel (e.g., react-responsive-carousel) |
| SVG Maps | svgmap@^2.10.1 (apps/web) | Yes (SVG map rendering) | Yes | Unknown | None | Keep updated |

## Notes

- The repository uses a monorepo structure with TurboRepo for task management.
- Shared packages are versioned via workspace:* dependencies, ensuring consistency.
- The backend uses Express.js with TypeScript.
- The frontend uses Next.js 15 with the App Router and TypeScript.
- Database access is via Prisma ORM targeting PostgreSQL (Neon compatible).
- Authentication combines custom bcrypt/jwt logic with NextAuth.js.
- Validation uses Zod schemas.
- Testing is currently limited to backend Jest tests; frontend tests are missing.
- No explicit formatting tool (Prettier) is configured.
- The repository lacks a root package.json to define workspace metadata and engines.

## Recommendations

1. Add a root package.json to define the workspace and specify Node.js version via engines.
2. Standardize on a single package manager (npm or pnpm) and remove conflicting lockfiles.
3. Update all dependencies to their latest compatible versions, especially Tailwind CSS, Prisma, next-auth, Jest, ESLint, and Turbo.
4. Add a frontend testing framework (e.g., Vitest + React Testing Library) and write unit tests for components.
5. Add Prettier for code formatting and integrate it with the linting script.
6. Consider replacing non-accessible UI components (like slick-carousel) with accessible alternatives.
7. Add a vercel.json file to configure Vercel deployment explicitly (frameworks, build commands, etc.).
8. Ensure all shared packages have proper package.json files (notifications package is missing package.json).