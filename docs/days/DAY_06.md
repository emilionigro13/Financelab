# Day 6 — API Client Setup, CORS Configuration & Dashboard Layout

**Date:** 2026-07-15

**Goal:** Set up API client configuration with CORS, create a connection between frontend and backend, and build a dashboard layout.

---

## What Was Done

### Backend
- Configured CORS middleware with origin whitelist (`FRONTEND_URL`)
- Added API versioning prefix (`/api/v1/`)
- Enhanced health endpoint with database connectivity check
- Added structured error handling with consistent JSON response format
- Added request logging middleware

### Frontend
- Created typed API client (`lib/api.ts`) with `apiGet` and `apiPost` functions
- Added environment variable `NEXT_PUBLIC_API_URL` for backend URL
- Built Dashboard Layout with sidebar navigation and header
- Created Dashboard Overview page with connection status cards
- Added responsive design for sidebar (desktop/tablet/mobile)

---

## Issues Encountered & Resolved

### 1. dotenv Not Loading .env File
- **Symptom:** `DATABASE_URL: Required` — validation failed even with `.env` present
- **Root Cause:** Node.js doesn't automatically read `.env` files; `process.env` only contains system variables
- **Fix:** Installed `dotenv` package and added `import 'dotenv/config'` at the top of `config.ts`
- **Lesson:** `.env` files need a loader library like `dotenv` or `dotenvx`

### 2. Prisma Client Not Initialized
- **Symptom:** `@prisma/client did not initialize yet`
- **Root Cause:** Prisma Client code not generated after schema changes
- **Fix:** Ran `npx prisma generate` to generate the client from schema
- **Lesson:** After every schema change, run `prisma generate`

### 3. Prisma Migrate Stuck on Windows PowerShell
- **Symptom:** `npx prisma migrate dev` froze, not accepting `y/n` input
- **Root Cause:** PowerShell interactive input issues with Prisma CLI
- **Fix:** Used `npx prisma db push` instead (non-interactive)
- **Lesson:** On Windows, prefer non-interactive commands or use CMD instead of PowerShell

### 4. Connection Pooler Blocking Migrations
- **Symptom:** `db push` worked but `migrate dev` failed silently
- **Root Cause:** Supabase connection pooler (port 6543) doesn't support schema changes
- **Fix:** Used direct connection (port 5432) for migrations, then switched back to pooler for app
- **Lesson:** Database poolers are for queries, not DDL/schema changes

### 5. Missing tailwindcss-animate Dependency
- **Symptom:** Build error `Cannot find module 'tailwindcss-animate'`
- **Root Cause:** Referenced in `tailwind.config.ts` but not installed
- **Fix:** `npm install tailwindcss-animate`
- **Lesson:** Verify all config references are actual dependencies

---

## CORS Deep Dive

### What is CORS?
Browsers enforce the **Same-Origin Policy**: a page can only request resources from the same origin (protocol + domain + port). CORS allows servers to specify which origins can access their resources.

### Simple vs Preflighted Requests
- **Simple:** GET, HEAD, POST with limited headers → no preflight
- **Preflighted:** PUT, DELETE, custom headers → browser sends OPTIONS first

### Our CORS Configuration
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## Concepts Learned

- CORS mechanics: preflight requests, allowed origins, credentials
- API client patterns: centralized client vs scattered fetch calls
- Dashboard layout architecture: sidebar + header + main content
- Responsive navigation patterns
- Environment variables in Next.js: `NEXT_PUBLIC_` prefix for browser access
- Type-safe API responses with TypeScript generics
- Connection pooling vs direct database connections

---

## Commit

```
feat: setup API client, CORS, and dashboard layout
```

---

## Next Day Objective

**Day 7:** Implement user authentication (register/login) with password hashing using bcrypt and JWT token generation.
