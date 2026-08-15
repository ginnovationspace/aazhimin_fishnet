#!/usr/bin/env bash

# fishnet Foundation Repair Script
# This script repairs the repository foundation to make it buildable with pnpm.

set -e  # Exit on error

echo "Starting fishnet foundation repair..."

# 1. Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit: baseline before repairs"
else
  echo "Git repository already initialized."
fi

# 2. Standardize on pnpm: remove conflicting lockfiles
echo "Removing conflicting lockfiles..."
rm -f package-lock.json bun.lock
# Also remove lockfiles in apps/api and any other packages
find . -name "package-lock.json" -not -path "./node_modules/*" -delete
find . -name "bun.lock" -not -path "./node_modules/*" -delete

# 3. Remove empty packages/db directory
echo "Removing empty packages/db directory..."
rm -rf packages/db

# 4. Install pnpm dependencies (this will create pnpm-lock.yaml)
echo "Installing dependencies with pnpm..."
pnpm install

# 5. Verify workspace build
echo "Building workspace..."
pnpm build

# 6. Verify linting
echo "Linting workspace..."
pnpm lint

# 7. Verify typecheck
echo "Typechecking workspace..."
pnpm typecheck

# 8. Verify tests
echo "Running tests..."
pnpm test

echo "fishnet foundation repair completed successfully."