# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Framework: Next.js 14 (App Router) with TypeScript and Tailwind CSS, located under app/
- Auth/data: NextAuth (credentials) + Prisma Client against PostgreSQL (Railway). Prisma models: calculations, weft_feeders, warp_yarns, plus NextAuth tables (User, Account, Session, VerificationToken).
- Core domain logic: app/lib/calculations.ts implements the textile cost calculations (length/pick, weft/warp costing, totals, profit, formatting).
- API surface:
  - GET/POST app/api/calculations/route.ts — list and create calculations for the authenticated user (NextAuth session)
  - GET/PUT/DELETE app/api/calculations/[id]/route.ts — retrieve/update/delete a calculation by id (NextAuth session)
  - Auth routes: app/api/auth/[...nextauth]/route.ts and app/api/auth/register/route.ts (credentials sign-up)
- Notable libs: next-auth, @next-auth/prisma-adapter, Prisma Client, Tailwind, shadcn/ui-style components in app/components/ui/*

Environment
- App uses environment variables from app/.env. Ensure (no values in code or output):
  - DATABASE_URL (Railway Postgres)
  - NEXTAUTH_SECRET

Package manager and working directory
- Yarn is used (yarn.lock in repo root). All commands run from the repository root.

Common commands
- Install dependencies
```sh path=null start=null
yarn install
```
- Start the dev server
```sh path=null start=null
yarn dev
```
- Build for production and run
```sh path=null start=null
yarn build
yarn start
```
- Lint
```sh path=null start=null
yarn lint
```
- Prisma (database) commands
  - Generate Prisma client after schema changes
```sh path=null start=null
yarn prisma generate
```
  - Create a new migration during development
```sh path=null start=null
yarn prisma migrate dev --name <migration_name>
```
  - Deploy migrations in production (Railway)
```sh path=null start=null
yarn prisma migrate deploy
```

Testing
- No test setup is detected (no Jest/Vitest config and no test script in app/package.json). If tests are added later, include commands here (e.g., yarn --cwd app test and how to run a single test).

High-level architecture and data flow
- UI and routing
  - App Router lives under app/app with layout.tsx, page.tsx, and API route handlers in app/app/api/*
  - UI components for the calculator live in app/components/*, with reusable primitives under app/components/ui/*
- Domain logic
  - app/lib/calculations.ts encapsulates the core textile cost calculations used by the UI, including derived totals and profit metrics
  - app/lib/types.ts provides the data shapes consumed across the UI and API
- Persistence and auth
  - NextAuth + Prisma (app/lib/auth.ts, app/app/api/auth/*) manage authentication and sessions in Postgres
  - Prisma schema (app/prisma/schema.prisma) defines application and NextAuth models; use Prisma commands to manage migrations

API usage notes
- API endpoints rely on NextAuth session cookies; no Authorization header is required when calling from the browser.

Formatting and styling
- Tailwind is configured via app/tailwind.config.ts and postcss via app/postcss.config.js, with global styles in app/app/globals.css

Repository docs
- Root README.md provides a brief description and deployment URL. This file (WARP.md) is the authoritative reference for commands and architecture.
