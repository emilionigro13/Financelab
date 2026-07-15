# FinanceLab — Development Log

A day-by-day journal of building FinanceLab, a professional financial analysis platform. This document tracks what was built, what was learned, and what went wrong.

---

## Day 1 — Project Planning & Architecture

**Goal:** Define the project architecture, folder structure, and initialize version control — no feature code written.

**What was done:**

- Decided on a decoupled monorepo architecture: separate frontend/ (Next.js) and backend/ (Express) services communicating via REST API, instead of a unified full-stack Next.js app.
- Created the base folder structure: frontend/, backend/, docs/, along with README.md, ROADMAP.md, .gitignore, and docs/ARCHITECTURE.md.
- Initialized a local Git repository and made the first commit.
- Created a public GitHub repository and connected it to the local repo.

**Issues encountered & resolved:**

- Git was not recognized in the terminal (CommandNotFoundException) — caused by installing Git while VS Code was already open, so the PATH hadn't refreshed. Fixed by fully closing and reopening VS Code after installation.
- Git identity on the local repo was initially a placeholder — updated with real name/email to match the GitHub account before pushing.

**Concepts learned:**

- Difference between a monolithic and a decoupled (frontend/backend) architecture.
- Why architecture decisions should be documented (ARCHITECTURE.md) as part of the engineering process, not as an afterthought.
- Git fundamentals: init, remote add origin, branch -M main, push -u origin main, and why the -u flag matters.
- How PATH and terminal sessions interact with newly installed CLI tools on Windows.

**Commit:** `chore: initialize project structure and architecture planning`

---

## Day 2 — Backend Skeleton with Express

**Goal:** Build a minimal Express server with a single /health endpoint, to validate the Node → Express → HTTP response chain before adding any real business logic.

**What was done:**

- Initialized a Node.js project inside backend/ with npm init -y.
- Installed Express (^5.2.1) as a dependency.
- Installed nodemon as a dev dependency, for automatic server restarts during development.
- Created server.js with a single GET /health route returning { status: "ok", timestamp: <ISO date> }.
- Configured package.json scripts: dev (nodemon, for local development) and start (plain node, for production).
- Verified the server locally at http://localhost:4000/health.

**Issues encountered & resolved:**

- npm was not recognized in PowerShell (CommandNotFoundException) — Node.js was not yet installed. Fixed by installing Node.js LTS via the official Windows installer and restarting VS Code.
- After installing Node.js, npm still failed with a PSSecurityException — PowerShell's execution policy was blocking script execution (npm itself runs as a .ps1 script on Windows). Fixed by running: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
- npm run dev initially failed with Missing script: "dev" — the package.json edit adding the dev/start scripts had not been saved to disk (Ctrl+S) before running the command, so npm was still reading the old file. Lesson: always save before running.
- Windows Firewall prompted to allow Node.js network access on first server start — expected behavior when a process opens a listening port for the first time; allowed for local development.
- Visiting http://localhost:4000/ (no path) returned Cannot GET / — not a bug: the server only defines a /health route, so the root path is correctly unhandled. Fixed by navigating to the correct endpoint.

**Concepts learned:**

- Role of package.json as a project's manifest (dependencies, scripts, metadata).
- Difference between dependencies and devDependencies.
- How an Express route is defined and how req/res work.
- Why a /health endpoint is a standard practice in real backends (used by monitoring, deploy platforms, load balancers).
- Practical debugging: distinguishing "code looks correct" from "code is actually saved and running."
- Windows-specific development friction: PATH refresh, PowerShell execution policy, firewall prompts on first network use.

**Commit:** `feat: add Express backend with health-check endpoint`

---

## Day 3 — TypeScript Migration & Database Setup with Prisma/Supabase

**Goal:** Migrate the backend from plain JavaScript to TypeScript, and connect it to a real PostgreSQL database (hosted on Supabase) via Prisma ORM, creating the first two data models.

**What was done:**

- Migrated the backend from JavaScript (server.js, CommonJS) to TypeScript (src/index.ts, ES Modules import/export syntax).
- Isolated application source code under a src/ directory, separate from configuration files and node_modules.
- Configured tsconfig.json: rootDir: "./src", outDir: "./dist", strict mode enabled, to compile TypeScript into production-ready JavaScript.
- Installed and configured Prisma ORM as the database toolkit.
- Created a Supabase project (PostgreSQL, Frankfurt region) as the database provider.
- Defined the initial data models in schema.prisma: User and Portfolio, with a one-to-many relation between them (onDelete: Cascade).
- Configured database connection through environment variables.
- Ran the first real migration (npx prisma migrate dev --name init), creating the User and Portfolio tables directly on the Supabase database.

**Issues encountered & resolved:**

- Nodemon initially crashed when trying to run TypeScript files directly — resolved by installing ts-node and @types/express as dev dependencies.
- A quote-mismatch typo in an import statement (from 'express"';) broke the TypeScript compiler — fixed by correcting the string delimiters.
- A missing comma in tsconfig.json after manually editing the file caused a broken JSON configuration, which silently disabled editor type-checking — fixed by rewriting the file with strict JSON syntax and restarting the TypeScript language server.
- The most significant issue: Prisma 7 removed support for url and directUrl directly inside schema.prisma (error P1012), a breaking change from Prisma 6 that isn't yet well documented outside the official reference. Root cause: Prisma 7 moved all connection configuration out of schema.prisma into a separate prisma.config.ts file, keeping the schema focused purely on data modeling.
- Fixed by rewriting schema.prisma to contain only provider = "postgresql", and moving the actual connection string into prisma.config.ts, loaded via environment variables (DIRECT_URL for CLI migrations, DATABASE_URL for the app's runtime connection through Supabase's pooler).
- A related tsconfig.json conflict: with rootDir set to ./src, TypeScript rejected prisma.config.ts

**Concepts learned:**

- TypeScript vs JavaScript: type safety, compile-time errors, better IDE support.
- ES Modules vs CommonJS: import/export vs require/module.exports.
- tsconfig.json options and their purposes.
- Prisma ORM architecture: schema definition, client generation, migrations.
- Database schema design: models, relations, foreign keys, cascade deletes.
- PostgreSQL data types: UUID, String, DateTime, Decimal (for financial precision).
- One-to-many relationships and foreign key constraints.
- Environment variable security for database connections.
- Prisma migration workflow.

**Commit:** `feat: migrate backend to TypeScript and setup Prisma/Supabase`

---

## Day 4 — Environment Configuration & Validation

**Goal:** Set up environment configuration validation with Zod, ensuring all required environment variables are present and correctly formatted before the server starts.

**What was done:**

- Installed Zod for schema validation.
- Created centralized config.ts module that validates all environment variables at startup.
- Implemented type coercion (string → number, string → enum) for environment variables.
- Added fail-fast validation: server exits immediately with clear error messages if config is invalid.
- Created .env.example with documentation of all required variables.
- Structured config object with nested categories: server, database, security, api.

**Issues encountered & resolved:**

- Environment variables not loaded — DATABASE_URL: Required even though .env existed. Root cause: Node.js doesn't automatically read .env files; process.env only contains system variables. Fixed by installing dotenv package and adding import 'dotenv/config' at the top of config.ts. Lesson: .env files need a loader library like dotenv.
- Type coercion confusion — PORT was string instead of number. Root cause: Environment variables are always strings. Fixed by using z.coerce.number() to automatically convert strings to numbers. Lesson: Always coerce env vars to their proper types.

**Concepts learned:**

- Fail Fast Principle: If something will fail, fail immediately with a clear error.
- Configuration as Code: Centralized config instead of scattered process.env references.
- Type Coercion: Converting environment variable strings to proper types.
- Schema Validation: Declarative validation with Zod.
- Environment Variable Security: Never commit .env, always use .env.example.

**Commit:** `feat: add environment configuration validation with Zod`

---

## Day 5 — Frontend Skeleton with Next.js

**Goal:** Initialize the Next.js frontend with TypeScript, TailwindCSS, and a professional folder structure.

**What was done:**

- Initialized Next.js 15 project with TypeScript and App Router.
- Configured TailwindCSS with custom theme (FinanceLab brand colors: navy, emerald).
- Created professional folder structure: app/, components/ui/, lib/.
- Built landing page with hero section, feature cards, stats, and CTA.
- Added global styles with CSS variables for theming (light/dark mode ready).
- Configured fonts: Inter for UI text, JetBrains Mono for financial data.
- Added SEO metadata with OpenGraph and Twitter cards.
- Created reusable UI components: Button, Card with class-variance-authority.

**Issues encountered & resolved:**

- Missing tailwindcss-animate — Build error Cannot find module 'tailwindcss-animate'. Root cause: Plugin referenced in tailwind.config.ts but not in package.json. Fixed by npm install tailwindcss-animate. Lesson: Always ensure dependencies listed in config are actually installed.
- Component import errors — Cannot find module '@/components/ui/button'. Root cause: Path alias @/ not configured or files in wrong location. Fixed by verifying tsconfig.json paths and component file locations. Lesson: Path aliases need matching folder structure.

**Concepts learned:**

- Next.js App Router vs Pages Router.
- Server Components vs Client Components ('use client').
- TailwindCSS utility-first approach.
- CSS variables for theming.
- class-variance-authority for type-safe component variants.
- cn() utility with clsx + tailwind-merge.
- SEO best practices with Next.js Metadata API.

**Commit:** `feat: initialize Next.js frontend with TypeScript and Tailwind`

---

## Day 6 — API Client Setup, CORS Configuration & Dashboard Layout

**Goal:** Set up API client configuration with CORS, create a connection between frontend and backend, and build a dashboard layout.

**What was done:**

**Backend:**
- Configured CORS middleware with origin whitelist (FRONTEND_URL).
- Added API versioning prefix (/api/v1/).
- Enhanced health endpoint with database connectivity check.
- Added structured error handling with consistent JSON response format.
- Added request logging middleware.

**Frontend:**
- Created typed API client (lib/api.ts) with apiGet and apiPost functions.
- Added environment variable NEXT_PUBLIC_API_URL for backend URL.
- Built Dashboard Layout with sidebar navigation and header.
- Created Dashboard Overview page with connection status cards.
- Added responsive design for sidebar (desktop/tablet/mobile).

**Issues encountered & resolved:**

- dotenv not loading .env file — DATABASE_URL: Required even with .env present. Root cause: Node.js doesn't automatically read .env files. Fixed by installing dotenv package and adding import 'dotenv/config' at the top of config.ts. Lesson: .env files need a loader library.
- Prisma Client not initialized — @prisma/client did not initialize yet. Root cause: Prisma Client code not generated after schema changes. Fixed by running npx prisma generate. Lesson: After every schema change, run prisma generate.
- Prisma migrate stuck on Windows PowerShell — npx prisma migrate dev froze, not accepting y/n input. Root cause: PowerShell interactive input issues with Prisma CLI. Fixed by using npx prisma db push instead (non-interactive). Lesson: On Windows, prefer non-interactive commands or use CMD instead of PowerShell.
- Connection pooler blocking migrations — db push worked but migrate dev failed silently. Root cause: Supabase connection pooler (port 6543) doesn't support schema changes. Fixed by using direct connection (port 5432) for migrations, then switched back to pooler for app. Lesson: Database poolers are for queries, not DDL/schema changes.
- Missing tailwindcss-animate dependency — Build error Cannot find module 'tailwindcss-animate'. Root cause: Referenced in tailwind.config.ts but not installed. Fixed by npm install tailwindcss-animate. Lesson: Verify all config references are actual dependencies.

**Concepts learned:**

- CORS mechanics: preflight requests, allowed origins, credentials.
- API client patterns: centralized client vs scattered fetch calls.
- Dashboard layout architecture: sidebar + header + main content.
- Responsive navigation patterns.
- Environment variables in Next.js: NEXT_PUBLIC_ prefix for browser access.
- Type-safe API responses with TypeScript generics.
- Connection pooling vs direct database connections.

**Commit:** `feat: setup API client, CORS, and dashboard layout`

---

## Next Up

**Day 7:** User Authentication (Register/Login) with bcrypt password hashing and JWT token generation.
