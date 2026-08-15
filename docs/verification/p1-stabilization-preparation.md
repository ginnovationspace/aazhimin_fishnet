# P1 Stabilization Preparation

## Goal
Stabilize the codebase: ensure TypeScript correctness, ESLint compliance, reliable API startup, database connectivity, and basic testing infrastructure.

## Tasks

### 1. TypeScript Consistency
- Ensure all packages have valid `tsconfig.json` extending a base config if appropriate.
- Check for any `@ts-ignore` comments and resolve them.
- Verify that path aliases work correctly (e.g., `@fishnet/*`).
- Run `pnpm typecheck` (to be executed when possible).

### 2. ESLint Configuration
- Review `.eslintrc.json` and package-specific ESLint configs.
- Ensure ESLint runs without errors on the codebase.
- Fix any linting errors (excluding formatting concerns for now).
- Run `pnpm lint` (to be executed when possible).

### 3. API Reliability
- Verify that `apps/api/app.ts` starts without errors.
- Check that all routes are registered and middleware is applied correctly.
- Ensure error handling is centralized (asyncHandler, AppError).
- Verify that logging middleware works.
- Test health endpoint `/health` returns 200.

### 4. Database Connectivity
- Confirm Prisma schema is valid and can generate client.
- Verify that `DATABASE_URL` environment variable is used correctly.
- Ensure migrations can be applied (non-destructive).
- Test a simple query (e.g., find many users) via Prisma client.

### 5. Validation System
- Audit shared validation schemas in `@fishnet/validation`.
- Ensure they are used across API controllers.
- Test validation functions with valid and invalid inputs.

### 6. Error Handling
- Verify that `asyncHandler` utility properly catchesasync errors.
- Ensure `AppError` is used consistently.
- Check that error responses do not leak stack traces or secrets.

### 7. Testing Infrastructure
- Review existing Jest tests in `apps/api/tests`.
- Ensure they run and pass (where applicable).
- Add basic tests for critical paths (auth, product creation, order flow).
- Set up test database setup/teardown if needed.

### 8. Shared Package Health
- Ensure each shared package (`auth`, `config`, `database`, `notifications`, `types`, `ui`, `validation`) builds independently.
- Verify that their `main` and `types` fields point to correct distribution files.
- Check that they have proper `build` and `dev` scripts.

### 9. Dependency Audit
- Identify unused dependencies (using `pnpm ls` or similar).
- Ensure no duplicate or conflicting versions.
- Verify that `workspace:*` aliases resolve correctly.

## Expected Outcomes
After P1 stabilization, the following should pass when executable:
- `pnpm typecheck` → PASS
- `pnpm lint` → PASS
- `pnpm test` → PASS (or at least critical tests pass)
- API startup → PASS
- Web startup → PASS (Next.js dev server starts)
- Database connectivity → PASS
- Prisma generation → PASS

## Preparation Steps Completed (as of now)
- Root package.json standardized on pnpm and Node >=20.
- Notifications package fixed (added missing package.json and tsconfig.json).
- Conflicting lockfiles removed (package-lock.json, bun.lock).
- Empty `packages/db` directory removed.
- All shared packages have package.json and tsconfig.json.
- Turbo configuration reviewed and appears correct.

## Next Steps When Execution Possible
1. Run `pnpm install` to install dependencies.
2. Execute the P1 tasks listed above, fixing any issues found.
3. Re-run verification steps until all pass.
4. Then proceed to P2 (Seller onboarding).

---
*This document is prepared in anticipation of command execution being restored. Actual verification and fixes will be performed once `pnpm` and related commands can be executed.*