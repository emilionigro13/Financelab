# Day 3 — TypeScript Migration & Database Setup with Prisma/Supabase

**Date:** 2026-07-14

**Goal:** Migrate the backend from plain JavaScript to TypeScript, and connect it to a real PostgreSQL database (hosted on Supabase) via Prisma ORM, creating the first two data models.

---

## What Was Done

- Migrated the backend from JavaScript (`server.js`, CommonJS) to TypeScript (`src/index.ts`, ES Modules `import`/`export` syntax)
- Isolated application source code under a `src/` directory, separate from configuration files and `node_modules`
- Configured `tsconfig.json`: `rootDir: "./src"`, `outDir: "./dist"`, strict mode enabled, to compile TypeScript into production-ready JavaScript
- Installed and configured Prisma ORM as the database toolkit
- Created a Supabase project (PostgreSQL, Frankfurt region) as the database provider
- Defined the initial data models in `schema.prisma`: `User` and `Portfolio`, with a one-to-many relation between them (`onDelete: Cascade`)
- Configured database connection through environment variables
- Ran the first real migration (`npx prisma migrate dev --name init`), creating the `User` and `Portfolio` tables directly on the Supabase database

---

## Issues Encountered & Resolved

### 1. Nodemon Crashed on TypeScript Files
- **Symptom:** Nodemon couldn't run `.ts` files directly
- **Root Cause:** Nodemon only understands JavaScript by default
- **Fix:** Installed `ts-node` and `@types/express` as dev dependencies
- **Lesson:** TypeScript needs a transpiler to run — `ts-node` does this on-the-fly

### 2. Quote Mismatch in Import
- **Symptom:** TypeScript compiler error
- **Root Cause:** `from 'express"';` — mismatched quotes
- **Fix:** Corrected to `from 'express';`
- **Lesson:** TypeScript is strict about syntax — errors are caught at compile time

### 3. Broken tsconfig.json
- **Symptom:** Type checking not working in editor
- **Root Cause:** Missing comma in JSON after manual edit
- **Fix:** Rewrote file with proper JSON syntax, restarted TypeScript language server
- **Lesson:** JSON is strict — no trailing commas, proper quoting

### 4. Prisma 7 Breaking Change (P1012 Error)
- **Symptom:** `Error P1012: url is not a known configuration parameter`
- **Root Cause:** Prisma 7 removed `url` and `directUrl` from `schema.prisma`
- **Fix:** Removed `url` from schema, kept only `provider = "postgresql"`, moved connection config to separate file
- **Lesson:** Major version upgrades can have breaking changes — always check changelog

### 5. tsconfig.json Conflict with Prisma Config
- **Symptom:** TypeScript rejected `prisma.config.ts` location
- **Root Cause:** `rootDir: "./src"` means TS only looks in `src/`
- **Fix:** Adjusted tsconfig to include prisma config or moved file location
- **Lesson:** `rootDir` restricts where TypeScript looks for files

---

## Concepts Learned

- TypeScript fundamentals: static typing, compile-time error catching, better IDE support
- ES Modules vs CommonJS: `import`/`export` vs `require`/`module.exports`
- `tsconfig.json` options and their purposes
- Prisma ORM architecture: schema definition, client generation, migrations
- Database schema design: models, relations, foreign keys, cascade deletes
- PostgreSQL data types: `UUID`, `String`, `DateTime`, `Decimal` (for financial precision)
- One-to-many relationships and foreign key constraints
- Environment variable security for database connections
- Prisma migration workflow

---

## Commit

```
feat: migrate backend to TypeScript and setup Prisma/Supabase
```

---

## Next Day Objective

**Day 4:** Set up environment configuration validation with Zod, ensuring all required environment variables are present and correctly formatted before the server starts.
