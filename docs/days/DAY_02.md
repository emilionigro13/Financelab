# Day 2 — Backend Skeleton with Express

**Date:** 2026-07-14

**Goal:** Build a minimal Express server with a single `/health` endpoint, to validate the Node → Express → HTTP response chain before adding any real business logic.

---

## What Was Done

- Initialized a Node.js project inside `backend/` with `npm init -y`
- Installed Express (^5.2.1) as a dependency
- Installed nodemon as a dev dependency, for automatic server restarts during development
- Created `server.js` with a single GET `/health` route returning `{ status: "ok", timestamp: <ISO date> }`
- Configured `package.json` scripts: `dev` (nodemon, for local development) and `start` (plain node, for production)
- Verified the server locally at `http://localhost:4000/health`

---

## Issues Encountered & Resolved

### 1. npm Not Recognized in PowerShell
- **Symptom:** `CommandNotFoundException` when running `npm`
- **Root Cause:** Node.js was not yet installed
- **Fix:** Installed Node.js LTS via the official Windows installer and restarted VS Code
- **Lesson:** Node.js installation includes npm — they come together

### 2. PowerShell Execution Policy (PSSecurityException)
- **Symptom:** `npm` failed with execution policy error
- **Root Cause:** PowerShell blocks script execution by default for security
- **Fix:**
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- **Lesson:** Windows security features can block development tools — understand why before disabling

### 3. Missing Script "dev"
- **Symptom:** `npm run dev` failed with "Missing script: dev"
- **Root Cause:** `package.json` edit wasn't saved to disk (Ctrl+S)
- **Fix:** Saved the file and ran again
- **Lesson:** Always save files before running commands — the terminal reads from disk, not from VS Code's memory

### 4. Windows Firewall Prompt
- **Symptom:** Windows asked to allow Node.js network access
- **Root Cause:** First time a process opens a listening port
- **Fix:** Allowed access for local development
- **Lesson:** Expected behavior — the OS is protecting you from unknown network activity

### 5. Cannot GET /
- **Symptom:** Visiting `http://localhost:4000/` showed error
- **Root Cause:** We only defined `/health` route, not `/`
- **Fix:** Navigated to correct endpoint `http://localhost:4000/health`
- **Lesson:** 404 errors mean "route not found" — check your URL matches your code

---

## Concepts Learned

- Role of `package.json` as a project's manifest (dependencies, scripts, metadata)
- Difference between **dependencies** and **devDependencies**
- How an Express route is defined and how `req`/`res` work
- Why a `/health` endpoint is a standard practice in real backends (used by monitoring, deploy platforms, load balancers)
- Practical debugging: distinguishing "code looks correct" from "code is actually saved and running"
- Windows-specific development friction: PATH refresh, PowerShell execution policy, firewall prompts on first network use

---

## Commit

```
feat: add Express backend with health-check endpoint
```

---

## Next Day Objective

**Day 3:** Migrate the backend from plain JavaScript to TypeScript, and connect it to a real PostgreSQL database (hosted on Supabase) via Prisma ORM.
