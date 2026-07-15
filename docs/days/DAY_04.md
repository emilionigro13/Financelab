# Day 4 — Environment Configuration & Validation

**Date:** 2026-07-14

**Goal:** Set up environment configuration validation with Zod, ensuring all required environment variables are present and correctly formatted before the server starts.

---

## What Was Done

- Installed Zod for schema validation
- Created centralized `config.ts` module that validates all environment variables at startup
- Implemented type coercion (string → number, string → enum) for environment variables
- Added fail-fast validation: server exits immediately with clear error messages if config is invalid
- Created `.env.example` with documentation of all required variables
- Structured config object with nested categories: `server`, `database`, `security`, `api`

---

## Why Zod?

- TypeScript-first validation library
- Excellent error messages
- Composable schemas
- Type inference (derive TypeScript types from schema)
- Industry standard (used by tRPC, Next.js, etc.)

---

## Issues Encountered & Resolved

### 1. Environment Variables Not Loaded
- **Symptom:** `DATABASE_URL: Required` even though `.env` existed
- **Root Cause:** Node.js doesn't automatically read `.env` files
- **Fix:** Installed `dotenv` package and added `import 'dotenv/config'` at the top of `config.ts`
- **Lesson:** `process.env` only contains system env vars — `.env` files need a loader

### 2. Type Coercion Confusion
- **Symptom:** `PORT` was string instead of number
- **Root Cause:** Environment variables are always strings
- **Fix:** Used `z.coerce.number()` to automatically convert strings to numbers
- **Lesson:** Always coerce env vars to their proper types

---

## Concepts Learned

- **Fail Fast Principle:** If something will fail, fail immediately with a clear error
- **Configuration as Code:** Centralized config instead of scattered `process.env` references
- **Type Coercion:** Converting environment variable strings to proper types
- **Schema Validation:** Declarative validation with Zod
- **Environment Variable Security:** Never commit `.env`, always use `.env.example`

---

## Commit

```
feat: add environment configuration validation with Zod
```

---

## Next Day Objective

**Day 5:** Initialize the Next.js frontend with TypeScript, TailwindCSS, and a professional folder structure.
