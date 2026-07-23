FinanceLab — Development Log

A day-by-day journal of building FinanceLab, a professional financial analysis platform. This document tracks what was built, what was learned, and what went wrong.
Day 1 — Project Planning & Architecture

Goal: Define the project architecture, folder structure, and initialize version control — no feature code written.
What was done:
Decided on a decoupled monorepo architecture: separate frontend/ (Next.js) and backend/ (Express) services communicating via REST API, instead of a unified full-stack Next.js app.
Created the base folder structure: frontend/, backend/, docs/, along with README.md, ROADMAP.md, .gitignore, and docs/ARCHITECTURE.md.
Initialized a local Git repository and made the first commit.
Created a public GitHub repository and connected it to the local repo.
Issues encountered & resolved:
Git was not recognized in the terminal (CommandNotFoundException) — caused by installing Git while VS Code was already open, so the PATH hadn't refreshed. Fixed by fully closing and reopening VS Code after installation.
Git identity on the local repo was initially a placeholder — updated with real name/email to match the GitHub account before pushing.
Concepts learned:
Difference between a monolithic and a decoupled (frontend/backend) architecture.
Why architecture decisions should be documented (ARCHITECTURE.md) as part of the engineering process, not as an afterthought.
Git fundamentals: init, remote add origin, branch -M main, push -u origin main, and why the -u flag matters.
How PATH and terminal sessions interact with newly installed CLI tools on Windows.
Commit: chore: initialize project structure and architecture planning
Day 2 — Backend Skeleton with Express

Goal: Build a minimal Express server with a single /health endpoint, to validate the Node → Express → HTTP response chain before adding any real business logic.
What was done:
Initialized a Node.js project inside backend/ with npm init -y.
Installed Express (^5.2.1) as a dependency.
Installed nodemon as a dev dependency, for automatic server restarts during development.
Created server.js with a single GET /health route returning { status: "ok", timestamp: }.
Configured package.json scripts: dev (nodemon, for local development) and start (plain node, for production).
Verified the server locally at http://localhost:4000/health.
Issues encountered & resolved:
npm was not recognized in PowerShell (CommandNotFoundException) — Node.js was not yet installed. Fixed by installing Node.js LTS via the official Windows installer and restarting VS Code.
After installing Node.js, npm still failed with a PSSecurityException — PowerShell's execution policy was blocking script execution (npm itself runs as a .ps1 script on Windows). Fixed by running: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm run dev initially failed with Missing script: "dev" — the package.json edit adding the dev/start scripts had not been saved to disk (Ctrl+S) before running the command, so npm was still reading the old file. Lesson: always save before running.
Windows Firewall prompted to allow Node.js network access on first server start — expected behavior when a process opens a listening port for the first time; allowed for local development.
Visiting http://localhost:4000/ (no path) returned Cannot GET / — not a bug: the server only defines a /health route, so the root path is correctly unhandled. Fixed by navigating to the correct endpoint.
Concepts learned:
Role of package.json as a project's manifest (dependencies, scripts, metadata).
Difference between dependencies and devDependencies.
How an Express route is defined and how req/res work.
Why a /health endpoint is a standard practice in real backends (used by monitoring, deploy platforms, load balancers).
Practical debugging: distinguishing "code looks correct" from "code is actually saved and running."
Windows-specific development friction: PATH refresh, PowerShell execution policy, firewall prompts on first network use.
Commit: feat: add Express backend with health-check endpoint
Day 3 — TypeScript Migration & Database Setup with Prisma/Supabase

Goal: Migrate the backend from plain JavaScript to TypeScript, and connect it to a real PostgreSQL database (hosted on Supabase) via Prisma ORM, creating the first two data models.
What was done:
Migrated the backend from JavaScript (server.js, CommonJS) to TypeScript (src/index.ts, ES Modules import/export syntax).
Isolated application source code under a src/ directory, separate from configuration files and node_modules.
Configured tsconfig.json: rootDir: "./src", outDir: "./dist", strict mode enabled, to compile TypeScript into production-ready JavaScript.
Installed and configured Prisma ORM as the database toolkit.
Created a Supabase project (PostgreSQL, Frankfurt region) as the database provider.
Defined the initial data models in schema.prisma: User and Portfolio, with a one-to-many relation between them (onDelete: Cascade).
Configured database connection through environment variables.
Ran the first real migration (npx prisma migrate dev --name init), creating the User and Portfolio tables directly on the Supabase database.
Issues encountered & resolved:
Nodemon initially crashed when trying to run TypeScript files directly — resolved by installing ts-node and @types/express as dev dependencies.
A quote-mismatch typo in an import statement (from 'express"';) broke the TypeScript compiler — fixed by correcting the string delimiters.
A missing comma in tsconfig.json after manually editing the file caused a broken JSON configuration, which silently disabled editor type-checking — fixed by rewriting the file with strict JSON syntax and restarting the TypeScript language server.
The most significant issue: Prisma 7 removed support for url and directUrl directly inside schema.prisma (error P1012), a breaking change from Prisma 6 that isn't yet well documented outside the official reference. Root cause: Prisma 7 moved all connection configuration out of schema.prisma into a separate prisma.config.ts file, keeping the schema focused purely on data modeling.
Fixed by rewriting schema.prisma to contain only provider = "postgresql", and moving the actual connection string into prisma.config.ts, loaded via environment variables (DIRECT_URL for CLI migrations, DATABASE_URL for the app's runtime connection through Supabase's pooler).
A related tsconfig.json conflict: with rootDir set to ./src, TypeScript rejected prisma.config.ts
Concepts learned:
TypeScript vs JavaScript: type safety, compile-time errors, better IDE support.
ES Modules vs CommonJS: import/export vs require/module.exports.
tsconfig.json options and their purposes.
Prisma ORM architecture: schema definition, client generation, migrations.
Database schema design: models, relations, foreign keys, cascade deletes.
PostgreSQL data types: UUID, String, DateTime, Decimal (for financial precision).
One-to-many relationships and foreign key constraints.
Environment variable security for database connections.
Prisma migration workflow.
Commit: feat: migrate backend to TypeScript and setup Prisma/Supabase
Day 4 — Environment Configuration & Validation

Goal: Set up environment configuration validation with Zod, ensuring all required environment variables are present and correctly formatted before the server starts.
What was done:
Installed Zod for schema validation.
Created centralized config.ts module that validates all environment variables at startup.
Implemented type coercion (string → number, string → enum) for environment variables.
Added fail-fast validation: server exits immediately with clear error messages if config is invalid.
Created .env.example with documentation of all required variables.
Structured config object with nested categories: server, database, security, api.
Issues encountered & resolved:
Environment variables not loaded — DATABASE_URL: Required even though .env existed. Root cause: Node.js doesn't automatically read .env files; process.env only contains system variables. Fixed by installing dotenv package and adding import 'dotenv/config' at the top of config.ts. Lesson: .env files need a loader library like dotenv.
Type coercion confusion — PORT was string instead of number. Root cause: Environment variables are always strings. Fixed by using z.coerce.number() to automatically convert strings to numbers. Lesson: Always coerce env vars to their proper types.
Concepts learned:
Fail Fast Principle: If something will fail, fail immediately with a clear error.
Configuration as Code: Centralized config instead of scattered process.env references.
Type Coercion: Converting environment variable strings to proper types.
Schema Validation: Declarative validation with Zod.
Environment Variable Security: Never commit .env, always use .env.example.
Commit: feat: add environment configuration validation with Zod
Day 5 — Frontend Skeleton with Next.js

Goal: Initialize the Next.js frontend with TypeScript, TailwindCSS, and a professional folder structure.
What was done:
Initialized Next.js 15 project with TypeScript and App Router.
Configured TailwindCSS with custom theme (FinanceLab brand colors: navy, emerald).
Created professional folder structure: app/, components/ui/, lib/.
Built landing page with hero section, feature cards, stats, and CTA.
Added global styles with CSS variables for theming (light/dark mode ready).
Configured fonts: Inter for UI text, JetBrains Mono for financial data.
Added SEO metadata with OpenGraph and Twitter cards.
Created reusable UI components: Button, Card with class-variance-authority.
Issues encountered & resolved:
Missing tailwindcss-animate — Build error Cannot find module 'tailwindcss-animate'. Root cause: Plugin referenced in tailwind.config.ts but not in package.json. Fixed by npm install tailwindcss-animate. Lesson: Always ensure dependencies listed in config are actually installed.
Component import errors — Cannot find module '@/components/ui/button'. Root cause: Path alias @/ not configured or files in wrong location. Fixed by verifying tsconfig.json paths and component file locations. Lesson: Path aliases need matching folder structure.
Concepts learned:
Next.js App Router vs Pages Router.
Server Components vs Client Components ('use client').
TailwindCSS utility-first approach.
CSS variables for theming.
class-variance-authority for type-safe component variants.
cn() utility with clsx + tailwind-merge.
SEO best practices with Next.js Metadata API.
Commit: feat: initialize Next.js frontend with TypeScript and Tailwind
Day 6 — API Client Setup, CORS Configuration & Dashboard Layout

Goal: Set up API client configuration with CORS, create a connection between frontend and backend, and build a dashboard layout.
What was done:
Backend:
Configured CORS middleware with origin whitelist (FRONTEND_URL).
Added API versioning prefix (/api/v1/).
Enhanced health endpoint with database connectivity check.
Added structured error handling with consistent JSON response format.
Added request logging middleware.
Frontend:
Created typed API client (lib/api.ts) with apiGet and apiPost functions.
Added environment variable NEXT_PUBLIC_API_URL for backend URL.
Built Dashboard Layout with sidebar navigation and header.
Created Dashboard Overview page with connection status cards.
Added responsive design for sidebar (desktop/tablet/mobile).
Issues encountered & resolved:
dotenv not loading .env file — DATABASE_URL: Required even with .env present. Root cause: Node.js doesn't automatically read .env files. Fixed by installing dotenv package and adding import 'dotenv/config' at the top of config.ts. Lesson: .env files need a loader library.
Prisma Client not initialized — @prisma/client did not initialize yet. Root cause: Prisma Client code not generated after schema changes. Fixed by running npx prisma generate. Lesson: After every schema change, run prisma generate.
Prisma migrate stuck on Windows PowerShell — npx prisma migrate dev froze, not accepting y/n input. Root cause: PowerShell interactive input issues with Prisma CLI. Fixed by using npx prisma db push instead (non-interactive). Lesson: On Windows, prefer non-interactive commands or use CMD instead of PowerShell.
Connection pooler blocking migrations — db push worked but migrate dev failed silently. Root cause: Supabase connection pooler (port 6543) doesn't support schema changes. Fixed by using direct connection (port 5432) for migrations, then switched back to pooler for app. Lesson: Database poolers are for queries, not DDL/schema changes.
Missing tailwindcss-animate dependency — Build error Cannot find module 'tailwindcss-animate'. Root cause: Referenced in tailwind.config.ts but not installed. Fixed by npm install tailwindcss-animate. Lesson: Verify all config references are actual dependencies.
Concepts learned:
CORS mechanics: preflight requests, allowed origins, credentials.
API client patterns: centralized client vs scattered fetch calls.
Dashboard layout architecture: sidebar + header + main content.
Responsive navigation patterns.
Environment variables in Next.js: NEXT_PUBLIC_ prefix for browser access.
Type-safe API responses with TypeScript generics.
Connection pooling vs direct database connections.
Commit: feat: setup API client, CORS, and dashboard layout
Day 7 — User Authentication (Register/Login) with bcrypt & JWT

Goal: Build a complete authentication system: registration, login, password hashing with bcryptjs, and JWT token generation.
What was done:
Created src/utils/password.ts with hashPassword() and verifyPassword() using bcryptjs (12 salt rounds).
Created src/utils/jwt.ts with generateToken() and verifyToken() using jsonwebtoken.
Created src/middleware/auth.middleware.ts with authenticateToken() to protect future routes (Bearer pattern).
Created src/routes/auth.routes.ts with endpoints POST /api/v1/auth/register and POST /api/v1/auth/login.
Updated src/index.ts to mount auth routes under /api/v1/auth.
Updated prisma/schema.prisma adding firstName and lastName to the User model.
Configured .env with JWT_SECRET and JWT_EXPIRES_IN.
Connected the backend to the PostgreSQL database on Supabase (Frankfurt region).
Issues encountered & resolved:
Cannot find module 'cors' — cors and @types/cors packages were missing. Fixed with npm install cors and npm install -D @types/cors.
Cannot find module '../routes/health.routes.js' — conflict between TypeScript NodeNext (requires .js in imports) and tsx (does not want them). Fixed by changing tsconfig.json from "module": "NodeNext" to "module": "ESNext" and "moduleResolution": "bundler", removing .js extensions from relative imports.
No overload matches this call on jwt.sign() — expiresIn type was not compatible. Fixed by reading JWT_SECRET and JWT_EXPIRES_IN directly from process.env in jwt.ts instead of passing them from config.
@prisma/client did not initialize yet — Prisma Client was not regenerated after schema changes. Fixed with npx prisma generate.
DIRECT_URL: Required — DIRECT_URL variable was missing from .env. Added to satisfy Zod validation.
Can't reach database server at localhost:5432 — local PostgreSQL was not running. Decided to migrate to Supabase (already configured in previous days) by inserting real connection strings into .env.
Route POST /api/v1/auth/register not found — another Node process was using port 4000. Fixed by killing all node processes with taskkill /F /IM node.exe and restarting the FinanceLab server.
Unknown argument 'firstName' — Prisma schema only had a name field instead of firstName/lastName. Fixed by updating schema.prisma and re-running npx prisma db push.
Prisma db push stuck on Supabase port 6543 — the connection pooler does not support DDL/schema changes. Fixed by temporarily using port 5432 (direct connection) for the push, then restoring port 6543 for app runtime.
EPERM: operation not permitted during prisma generate — file locked by a previous process. Fixed with taskkill /F /IM node.exe and deleting the node_modules\.prisma folder before regenerating.
Concepts learned:
bcryptjs vs bcrypt: bcryptjs is pure JavaScript, no native dependencies (no rebuild needed on Windows).
JWT architecture: header (algorithm), payload (claims), signature (HMAC). The token is stateless.
Bearer token pattern: Authorization: Bearer &lt;token&gt; is the de-facto standard for protected REST APIs.
Timing attack prevention: use the same error message ("Invalid credentials") for both non-existent email and wrong password.
Zod schema validation for user input: email format, password strength (min 8 chars, uppercase, lowercase, number).
Prisma connection pooler (port 6543) vs direct connection (port 5432): pooler is for queries, direct is for DDL/migrations.
moduleResolution: "bundler" in TypeScript: allows relative imports without .js extension, compatible with tsx.
Commit: feat: add user authentication with bcrypt and JWT
Day 8 — Frontend Authentication Pages (Login/Register) with React Context, Zod & Protected Routes

Goal: Build the frontend authentication layer: login and register pages, global auth state via React Context, JWT persistence in localStorage, client-side form validation, and protected dashboard routes.
What was done:
Created src/lib/auth-context.tsx with React Context API to manage global auth state (user, token, isLoading) across the application.
Created src/app/providers.tsx as a Client Component bridge to wrap the app with AuthProvider inside the RootLayout.
Updated src/app/layout.tsx to import and use Providers, ensuring auth state is available on every page.
Created src/app/login/page.tsx with controlled form, Zod client-side validation, error handling, and redirect to /dashboard on success.
Created src/app/register/page.tsx with controlled form, Zod validation including cross-field password matching (.refine), and redirect to /dashboard on success.
Created src/components/auth/AuthGuard.tsx to protect the dashboard: redirects unauthenticated users to /login and shows a loading spinner while checking localStorage.
Created src/components/user-nav.tsx to display the logged-in user's name/email and a logout button in the dashboard header.
Created src/app/dashboard/layout.tsx wrapping children with AuthGuard.
Created src/app/dashboard/page.tsx as the main dashboard view with placeholder stats cards and the UserNav in the header.
Updated src/app/page.tsx (homepage) to import and render UserNav in the header, showing auth status even on the landing page.
Updated src/lib/api.ts to align token storage key with the existing localStorage key ("token") and to properly inject the Bearer Authorization header.
Added frontend environment variable NEXT_PUBLIC_API_URL in .env.local.
Issues encountered & resolved:
Module '"@/lib/api"' has no exported member 'apiPost' — the existing api.ts only exported apiPost as a standalone function but the import path was failing due to mismatched expectations. Fixed by verifying the exact export structure and ensuring api.ts exports both apiGet and apiPost as named exports.
Cannot find module './providers' — Providers component was created but TypeScript had not picked it up. Fixed by saving the file and restarting the TypeScript language server.
Cannot find module or type declarations for './globals.css' — next-env.d.ts was missing or corrupted, preventing Next.js CSS module declarations from loading. Fixed by recreating frontend/next-env.d.ts with the /// <reference types="next" /> triple-slash directives and adding declare module '*.css';.
Property 'errors' does not exist on type 'ZodError' — in Zod v3, the correct property for validation issues is .issues, not .errors. Fixed by replacing result.error.errors with result.error.issues in both login and register forms.
Type 'symbol' cannot be used as an index type on issue.path[0] — Zod issue.path is typed as (string | number)[], so path[0] could be a number. Fixed by adding a type guard: const field = issue.path[0]; if (typeof field === 'string') { ... }.
Parameter 'err' implicitly has an 'any' type in catch blocks — TypeScript strict mode requires typed catch variables. Fixed by replacing catch (err: any) with catch (err) and using err instanceof Error ? err.message : '...' for safe error message extraction.
Missing dependency tailwindcss-animate — build failed because the package was referenced in tailwind.config.ts but not installed in the frontend. Fixed with npm install tailwindcss-animate.
Missing dependency zod — Zod was used for form validation but not listed in frontend package.json. Fixed with npm install zod.
Dashboard returned 404 after login — the /dashboard route existed as a layout but had no page.tsx. Fixed by creating src/app/dashboard/page.tsx with a basic dashboard UI.
"Email already registered" on second registration attempt — the Supabase PostgreSQL database is persistent, so users created during testing remain in the database. Fixed by either using a new unique email for each test or manually deleting test rows from the Supabase Table Editor.
Supabase sent an email confirmation code — Supabase Auth (managed service) has email confirmations enabled by default, but our custom Express auth system does not use Supabase Auth. The confirmation email can be safely ignored; our JWT tokens are generated independently by the backend.
Concepts learned:
React Context API for global state: createContext, useContext, and the Provider pattern eliminate prop drilling across deeply nested components.
Controlled forms in React: binding input values to useState gives full control over validation, formatting, and submission logic.
Zod client-side validation: safeParse avoids throwing exceptions; .issues provides structured error data; .refine enables cross-field validation (e.g., password === confirmPassword).
Type narrowing in TypeScript: typeof checks and instanceof Error prevent implicit-any errors and make catch blocks type-safe.
localStorage as a JWT persistence layer: tokens survive page refreshes but are vulnerable to XSS. This is acceptable for an MVP but will be replaced with httpOnly cookies in production.
Protected routes in Next.js App Router: a Client Component (AuthGuard) with useEffect and useRouter can intercept navigation and redirect unauthenticated users before rendering protected content.
Next.js environment variables: only variables prefixed with NEXT_PUBLIC_ are exposed to the browser; the rest remain server-side.
Commit: feat: add frontend authentication pages with JWT and protected routes
Next Up

Day 9 — User Profile & Account Settings

Goal: Build a complete profile settings page where authenticated users can update their information, change their password (requiring the old one), and delete their account with a confirmation modal. Requires new protected backend endpoints.
What was done:
Backend:
Created src/middleware/auth.middleware.ts with authenticateToken() to extract and verify JWT from the Authorization: Bearer <token> header, attaching user payload to req.user.
Extended src/routes/auth.routes.ts with four new protected endpoints:
GET /api/v1/auth/me — returns current user data from the database (source of truth, not localStorage).
PUT /api/v1/auth/me — updates profile fields (firstName, lastName, email) with partial validation.
PUT /api/v1/auth/password — changes password only after verifying the old password with bcrypt.
DELETE /api/v1/auth/me — permanently deletes the user account; Prisma cascade removes associated Portfolio records.
Added Zod schemas for each new endpoint with .optional() for partial updates and .refine() to reject empty PUT /me requests.
Frontend:
Added apiPut() and apiDelete() to src/lib/api.ts with automatic Bearer token injection.
Extended AuthContext with updateUser(data: Partial<User>) to merge partial updates into React state and localStorage instantly.
Created src/app/dashboard/profile/page.tsx with three sections:
Profile Information form (firstName, lastName, email) with success/error feedback.
Change Password form requiring oldPassword, newPassword, and confirmPassword.
Danger Zone with Delete Account button and a custom confirmation modal (fixed overlay, no external library).
Updated src/app/dashboard/page.tsx to include a "Profile" link in the header next to UserNav.
Issues encountered & resolved:
Type '"/dashboard/profile"' is not assignable to type 'RouteImpl<...>' — Next.js 15 has strict route typing for the Link component href prop. Root cause: the /dashboard/profile route exists at runtime but TypeScript's generated route types don't always pick up nested dynamic routes immediately. Fixed by casting the href with as any as a temporary measure; in production this resolves itself after a build.
Argument of type 'User | null' is not assignable to parameter of type 'Partial<User>' — after calling apiPut('/auth/me'), the response type declared user as potentially null. Root cause: TypeScript strict null checking on the generic response type. Fixed by explicitly typing the apiPut generic with the exact user shape and adding a runtime guard if (res.data.user) before calling updateUser().
Missing next-env.d.ts caused Cannot find module './globals.css' again — the file was overwritten or deleted during file operations. Fixed by recreating frontend/next-env.d.ts with the Next.js triple-slash reference directives and restarting the TypeScript server.
Dashboard returned 404 after login — /dashboard/layout.tsx existed with AuthGuard but there was no page.tsx inside the dashboard folder. Root cause: Next.js requires both layout.tsx and page.tsx for a route to render. Fixed by creating src/app/dashboard/page.tsx with the dashboard UI.
Concepts learned:
Express middleware pattern: middleware runs before route handlers, enabling authentication gating at the route level rather than inside every controller.
TypeScript Partial<T> utility: converts all properties of a type to optional, perfect for PATCH/PUT partial update payloads.
Bearer token extraction: splitting Authorization: Bearer <token> and verifying with the same jwt.verify used at login.
Timing attack prevention on password change: verifying oldPassword with bcrypt before rejecting ensures attackers cannot enumerate valid tokens by observing response times.
Custom modal without libraries: a fixed-position div with z-50 and a semi-transparent backdrop (bg-black/50) is lighter than installing Radix Dialog or similar for a simple confirmation.
Database cascade deletes: Prisma's onDelete: Cascade on the User-Portfolio relation automatically cleans up dependent records when an account is deleted.
Commit: feat: add user profile settings with update, password change and account deletion
Next Up

Day 10: Company Search & Detail Page — Integrate a real financial data API (Yahoo Finance / Finnhub / Alpha Vantage) for live stock data, build search autocomplete, and create company detail pages with price charts.