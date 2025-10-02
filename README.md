# Jogmaya Cost Calculator

A Next.js (App Router) application for textile cost calculations. This version runs entirely on Railway with PostgreSQL using NextAuth (credentials) + Prisma. Supabase has been removed.

Tech stack
- Next.js 14, TypeScript, Tailwind
- NextAuth (credentials) + Prisma Client
- PostgreSQL (Railway)

Environment variables (set in Railway)
- DATABASE_URL: PostgreSQL connection string
- NEXTAUTH_SECRET: a long random secret
- Optional: NEXTAUTH_URL (e.g., https://your-railway-domain.app)

Commands
- Install: yarn install
- Dev: yarn dev
- Build: yarn build
- Start: yarn start (runs prisma migrate deploy then next start)
- Prisma:
  - yarn prisma generate
  - yarn prisma migrate dev --name <migration_name>
  - yarn prisma migrate deploy

Data migration from Supabase (optional)
- Use scripts/migrate_supabase_ownership.sql to insert data by joining on email, or
- Import a CSV mapping calc_id,email and run:
  - yarn tsx scripts/migrate-ownership.ts

Notes
- Auth and API endpoints use NextAuth session cookies; no Authorization header is needed from the browser.

Deployment on Railway
- Create a new Railway project and add a PostgreSQL database plugin.
- Add environment variables in the service settings:
  - DATABASE_URL: use the Railway Postgres connection string
  - NEXTAUTH_SECRET: generate a long random string
  - NEXTAUTH_URL: set to your public Railway URL after first deploy (e.g., https://your-app.up.railway.app)
- Deploy flow used by Railway:
  - Install deps: yarn install (this runs Prisma Client generation via postinstall)
  - Build: yarn build
  - Start: yarn start (runs prisma migrate deploy and then next start -p $PORT)
- First-time database setup:
  - This repo includes an initial Prisma migration under prisma/migrations. On first deploy, prisma migrate deploy will apply it and create the tables.
  - If you later change the schema, locally run: yarn prisma migrate dev --name <change> and commit the new migration before deploying.
