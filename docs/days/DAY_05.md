# Day 5 — Frontend Skeleton with Next.js

**Date:** 2026-07-14

**Goal:** Initialize the Next.js frontend with TypeScript, TailwindCSS, and a professional folder structure.

---

## What Was Done

- Initialized Next.js 15 project with TypeScript and App Router
- Configured TailwindCSS with custom theme (FinanceLab brand colors: navy, emerald)
- Created professional folder structure: `app/`, `components/ui/`, `lib/`
- Built landing page with hero section, feature cards, stats, and CTA
- Added global styles with CSS variables for theming (light/dark mode ready)
- Configured fonts: Inter for UI text, JetBrains Mono for financial data
- Added SEO metadata with OpenGraph and Twitter cards
- Created reusable UI components: `Button`, `Card` with class-variance-authority

---

## Why Next.js App Router?

- Server Components by default (better performance, less JavaScript)
- File-based routing (no react-router needed)
- Nested layouts
- Built-in SEO with Metadata API
- Image and font optimization

---

## Issues Encountered & Resolved

### 1. Missing tailwindcss-animate
- **Symptom:** Build error `Cannot find module 'tailwindcss-animate'`
- **Root Cause:** Plugin referenced in `tailwind.config.ts` but not in `package.json`
- **Fix:** `npm install tailwindcss-animate`
- **Lesson:** Always ensure dependencies listed in config are actually installed

### 2. Component Import Errors
- **Symptom:** `Cannot find module '@/components/ui/button'`
- **Root Cause:** Path alias `@/` not configured or files in wrong location
- **Fix:** Verified `tsconfig.json` paths and component file locations
- **Lesson:** Path aliases need matching folder structure

---

## Concepts Learned

- Next.js App Router vs Pages Router
- Server Components vs Client Components (`'use client'`)
- TailwindCSS utility-first approach
- CSS variables for theming
- `class-variance-authority` for type-safe component variants
- `cn()` utility with `clsx` + `tailwind-merge`
- SEO best practices with Next.js Metadata API

---

## Commit

```
feat: initialize Next.js frontend with TypeScript and Tailwind
```

---

## Next Day Objective

**Day 6:** Set up API client configuration with CORS, create a connection between frontend and backend, and build a dashboard layout.
