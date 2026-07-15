# FinanceLab Architecture

## Overview

FinanceLab uses a **decoupled monorepo architecture** with separate frontend and backend services communicating via REST API.

## Why Decoupled?

1. **Separation of Concerns**: Frontend handles UI/UX, backend handles business logic
2. **Independent Scaling**: Each service can scale independently based on load
3. **Team Collaboration**: Different teams can work on frontend/backend simultaneously
4. **Technology Flexibility**: Each service uses the best tools for its purpose
5. **University Portfolio**: Demonstrates understanding of real-world architecture patterns

## Architecture Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │         │    Database     │
│   (Next.js)     │◄───────►│   (Express)     │◄───────►│  (PostgreSQL)   │
│   Vercel        │  REST   │   Railway       │  Prisma │   Supabase      │
└─────────────────┘         └─────────────────┘         └─────────────────┘
       │                            │
       │                            │
       ▼                            ▼
┌─────────────────┐         ┌─────────────────┐
│   TradingView   │         │   JWT Auth      │
│   Chart.js      │         │   Rate Limit    │
│   Tailwind      │         │   Logging       │
└─────────────────┘         └─────────────────┘
```

## Tech Stack Rationale

### Frontend: Next.js + React + TypeScript + TailwindCSS
- **Next.js**: SSR/SSG for SEO, file-based routing, API routes if needed
- **React**: Component-based architecture, virtual DOM, massive ecosystem
- **TypeScript**: Type safety, better IDE support, fewer runtime errors
- **TailwindCSS**: Utility-first CSS, rapid development, consistent design

### Backend: Node.js + Express + TypeScript
- **Node.js**: Same language as frontend, non-blocking I/O, great for APIs
- **Express**: Minimal, flexible, industry standard for Node.js APIs
- **TypeScript**: Consistent type safety across the entire stack

### Database: PostgreSQL + Prisma
- **PostgreSQL**: ACID compliance, complex queries, JSON support, production-grade
- **Prisma**: Type-safe database access, migrations, excellent developer experience
- **Supabase**: Managed PostgreSQL with connection pooling, auth, real-time features

### Authentication: JWT
- **JWT**: Stateless, scalable, works across multiple services
- **bcrypt**: Secure password hashing with salt

## Folder Structure

```
FinanceLab/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # App Router (Next.js 13+)
│   │   ├── components/   # Reusable components
│   │   ├── lib/          # Utilities, API client
│   │   ├── types/        # TypeScript types
│   │   └── styles/       # Global styles
│   ├── public/           # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── backend/               # Express API server
│   ├── src/
│   │   ├── config/       # Configuration (env, database)
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── models/       # Prisma models (if needed)
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Helper functions
│   │   └── index.ts      # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── config.ts     # Prisma configuration
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                  # Documentation
    ├── ARCHITECTURE.md
    ├── API.md
    └── SECURITY.md
```

## API Design Principles

1. **RESTful**: Standard HTTP methods (GET, POST, PUT, DELETE)
2. **JSON**: Consistent JSON request/response format
3. **Versioning**: `/api/v1/` prefix for future compatibility
4. **Status Codes**: Proper HTTP status codes (200, 201, 400, 401, 404, 500)
5. **Error Format**: Consistent error response structure

## Security Considerations

1. **Environment Variables**: All secrets in `.env`, never committed
2. **CORS**: Restricted to known origins
3. **Rate Limiting**: Prevent abuse and DDoS
4. **Input Validation**: Sanitize all user inputs
5. **SQL Injection**: Prisma ORM prevents this by default
6. **XSS Protection**: Content Security Policy headers
7. **HTTPS**: Required in production
8. **JWT Security**: Short expiry, refresh tokens, secure cookies

## Scalability Considerations

1. **Stateless Backend**: No server-side sessions, easy to scale horizontally
2. **Database Connection Pooling**: Supabase handles this
3. **Caching**: Redis for session storage and API response caching
4. **CDN**: Vercel's edge network for static assets
5. **Database Indexing**: Strategic indexes for query performance

## Development Workflow

1. **Git Flow**: Feature branches, pull requests, code review
2. **Commit Convention**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
3. **Testing**: Unit tests with Jest, integration tests with Supertest
4. **Linting**: ESLint + Prettier for code consistency
5. **CI/CD**: GitHub Actions for automated testing and deployment
