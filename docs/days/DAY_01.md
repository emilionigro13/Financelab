# Day 1 — Project Planning & Architecture

**Date:** 2026-07-14

**Goal:** Define the project architecture, folder structure, and initialize version control — no feature code written.

---

## What Was Done

- Decided on a **decoupled monorepo architecture**: separate `frontend/` (Next.js) and `backend/` (Express) services communicating via REST API, instead of a unified full-stack Next.js app.
- Created the base folder structure: `frontend/`, `backend/`, `docs/`, along with `README.md`, `ROADMAP.md`, `.gitignore`, and `docs/ARCHITECTURE.md`.
- Initialized a local Git repository and made the first commit.
- Created a public GitHub repository and connected it to the local repo.

---

## Why Decoupled?

1. **Separation of Concerns**: Frontend and backend can evolve independently
2. **Scalability**: Each service can be scaled separately
3. **Technology Flexibility**: Different teams can use optimal tools for each layer
4. **Testing**: Easier to test components in isolation
5. **University Portfolio Value**: Demonstrates real-world engineering knowledge

---

## Issues Encountered & Resolved

### 1. Git Not Recognized in Terminal
- **Symptom:** `CommandNotFoundException` when running `git`
- **Root Cause:** Git was installed while VS Code was already open, so the PATH hadn't refreshed
- **Fix:** Fully closed and reopened VS Code after Git installation
- **Lesson:** Environment changes (PATH) require fresh terminal sessions

### 2. Git Identity Mismatch
- **Symptom:** GitHub showed wrong author name on commits
- **Root Cause:** Local Git identity was set to placeholder values
- **Fix:** Updated with real name/email matching GitHub account:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your@email.com"
  ```
- **Lesson:** Git identity is separate from GitHub account — must be configured locally

---

## Concepts Learned

- Difference between a **monolithic** and a **decoupled** (frontend/backend) architecture
- Why architecture decisions should be documented (`ARCHITECTURE.md`) as part of the engineering process, not as an afterthought
- Git fundamentals: `init`, `remote add origin`, `branch -M main`, `push -u origin main`, and why the `-u` flag matters
- How PATH and terminal sessions interact with newly installed CLI tools on Windows

---

## Commit

```
chore: initialize project structure and architecture planning
```

---

## Next Day Objective

**Day 2:** Build a minimal Express server with a single `/health` endpoint to validate the Node → Express → HTTP response chain.
