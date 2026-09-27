# FraudLens

Real-time transaction risk scoring for small businesses that can't afford a
dedicated fraud team. Upload transactions (or load the built-in demo
dataset), and FraudLens scores every one, flags the risky ones, and
explains *why* in plain English.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma,
Postgres, NextAuth, and Recharts, with an optional Anthropic API layer for
the plain-English alert explanations.

## How the scoring works

`src/lib/anomaly.ts` computes a 0-100 risk score per transaction from four
signals, checked against that customer's own transaction history:

1. **Unusual amount** - IQR/adjusted-boxplot outlier check once a customer
   has enough history, falling back to a z-score check for newer customers.
2. **Unusual hour** - transactions between midnight and 5am.
3. **New location** - a location never seen before for that customer.
4. **Velocity** - three or more transactions from the same customer within
   an hour.

Transactions scoring 50+ generate an `Alert`. If `ANTHROPIC_API_KEY` is set,
the triggered signals are sent to Claude to produce a short, plain-English
explanation (`src/lib/ai-explain.ts`); otherwise the raw signal list is used
as the explanation, so the app works fully without an API key.

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Postgres database.** The fastest free option is
   [Neon](https://neon.tech) or [Supabase](https://supabase.com) - create a
   project and copy the connection string.

3. **Copy the env file and fill it in**
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL` - your Postgres connection string.
   - `NEXTAUTH_SECRET` - generate with `openssl rand -base64 32`.
   - `NEXTAUTH_URL` - `http://localhost:3000` for local dev.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - optional, only needed for
     "Sign in with Google". Without these, email/password sign-up still
     works fully.
   - `ANTHROPIC_API_KEY` - optional, enables AI-generated alert explanations.

4. **Push the schema to your database**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`, sign up, then click **Load demo dataset**
   on the Overview page to instantly populate transactions and alerts.

## Deploying to Vercel

1. Push this project to a GitHub repository.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the same environment variables from `.env` in the Vercel project
   settings (use your production Postgres URL, and set `NEXTAUTH_URL` to
   your Vercel deployment URL).
4. Deploy. Then run the migration against your production database once
   (from your machine, with `DATABASE_URL` pointed at production):
   ```bash
   npx prisma migrate deploy
   ```
5. Submit the GitHub repo URL and the live Vercel URL for the capstone.

## Suggested Demo Day flow (3 minutes)

1. Log in to a pre-seeded account (avoid seeding live on stage - it's fast,
   but a rehearsed flow is safer).
2. Show the Overview page: total transactions, open alerts, risk
   distribution chart.
3. Click into **Alerts** - pick one flagged transaction and read its
   AI-generated explanation and the underlying signals out loud.
4. Mark it "Reviewed" live to show the case-management workflow.
5. Close on the architecture: statistical scoring engine you designed
   (referencing the Adjusted Boxplot method), multi-tenant schema, and the
   AI explanation layer as the differentiator.

## Project structure

```
src/
  app/                 Pages and API routes (App Router)
    dashboard/         Overview, transactions, alerts (protected)
    api/               auth, transactions, alerts endpoints
  components/          Client components (charts, tables, forms)
  lib/                 anomaly.ts, ai-explain.ts, auth.ts, db.ts, csv.ts
prisma/
  schema.prisma        Organization, User, Transaction, Alert models
```

## Ideas for extending beyond the MVP

- Swap the statistical engine for a trained isolation-forest or
  autoencoder model, using the current engine's output as labeled data.
- Real bank/payment-gateway API integration instead of CSV upload.
- PDPA-aligned audit logging and data retention settings (ties into the
  finance/compliance angle).
- Per-organization configurable risk thresholds and rules.
