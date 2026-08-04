# St. Genevieve Knights Admin Dashboard

This folder contains the Next.js administration application. The existing Eleventy website remains at the repository root and keeps its current GitHub Pages deployment.

## Local setup

Requirements: Node.js 20.9 or newer and a Neon Postgres project.

1. Copy `.env.example` to `.env.local`.
2. Add the pooled Neon connection string to `DATABASE_URL`.
3. Run `npm install`.
4. Apply the schema with `npm run db:migrate`.
5. Start the dashboard with `npm run dev`.

The dashboard is available at `http://localhost:3000`.

## Database migrations

- `npm run db:migrate` applies pending migrations.
- `npm run db:rollback` rolls back the latest migration batch.
- `npm run db:make -- migration_name` creates a migration.

Knex and the Postgres connection are server-only. Never import `src/lib/db.ts` into a Client Component, and never prefix `DATABASE_URL` with `NEXT_PUBLIC_`.

## Later Vercel deployment

Create a Vercel project from this GitHub repository and set its Root Directory to `dashboard`. Add `DATABASE_URL` and the Neon Auth variables in Vercel project settings. The intended production hostname is `admin.stgenknights.com`; `/dashboard` on the public website can redirect there.
