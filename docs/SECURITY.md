# FinanceLab Security Guide

## Authentication & Authorization

### JWT Implementation
- Access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry, stored in httpOnly cookies
- Tokens signed with RS256 (asymmetric) algorithm
- Token rotation on refresh

### Password Security
- bcrypt with cost factor 12
- Minimum password requirements:
  - 8 characters minimum
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# JWT
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret

# API
API_PORT=4000
API_URL=http://localhost:4000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# External Services
ALPHA_VANTAGE_API_KEY=...
FINNHUB_API_KEY=...
```

## CORS Configuration

```typescript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://financelab.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## Rate Limiting

```typescript
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: 'Too many requests, please try again later'
};
```

## Input Validation

All inputs validated using Zod schemas:
- Sanitize strings (strip HTML)
- Validate email format
- Validate numeric ranges
- Validate enum values
- Prevent NoSQL injection

## Security Headers

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Database Security

- Connection strings in environment variables only
- Prisma prevents SQL injection by default
- Row-level security in Supabase
- Connection pooling to prevent overload
- Regular security patches

## Logging & Monitoring

- Log all authentication attempts
- Log failed requests with IP
- Monitor for suspicious patterns
- Alert on multiple failed logins
- Regular security audits

## Data Protection

- GDPR compliance for EU users
- Data encryption at rest (Supabase)
- HTTPS only in production
- Secure cookie settings
- Regular backups
