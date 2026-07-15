# FinanceLab API Documentation

## Base URL

```
Development: http://localhost:4000/api/v1
Production:  https://api.financelab.com/api/v1
```

## Authentication

Most endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-14T12:00:00.000Z"
}
```

### Authentication

#### Register
```
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-07-14T12:00:00.000Z"
  },
  "token": "jwt_token"
}
```

#### Login
```
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token"
}
```

### Users

#### Get Current User
```
GET /users/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-07-14T12:00:00.000Z",
  "updatedAt": "2026-07-14T12:00:00.000Z"
}
```

### Companies

#### Search Companies
```
GET /companies/search?q=Apple
```

**Response:**
```json
{
  "companies": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "sector": "Technology",
      "marketCap": 3000000000000
    }
  ]
}
```

#### Get Company Profile
```
GET /companies/:ticker
```

**Response:**
```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "marketCap": 3000000000000,
  "employees": 161000,
  "website": "https://www.apple.com",
  "description": "Apple Inc. designs, manufactures, and markets smartphones..."
}
```

### Financial Statements

#### Income Statement
```
GET /companies/:ticker/income-statement
```

#### Balance Sheet
```
GET /companies/:ticker/balance-sheet
```

#### Cash Flow
```
GET /companies/:ticker/cash-flow
```

### Financial Ratios

#### Get All Ratios
```
GET /companies/:ticker/ratios
```

**Response:**
```json
{
  "peRatio": 28.5,
  "pegRatio": 1.2,
  "roe": 0.25,
  "roa": 0.15,
  "debtToEquity": 1.5,
  "currentRatio": 1.2,
  "quickRatio": 1.0,
  "operatingMargin": 0.30,
  "profitMargin": 0.25,
  "grossMargin": 0.45,
  "freeCashFlow": 100000000000,
  "enterpriseValue": 3200000000000,
  "evEbitda": 22.5,
  "dividendYield": 0.005,
  "bookValue": 15.50
}
```

### Portfolio

#### Get Portfolio
```
GET /portfolio
```

#### Add Position
```
POST /portfolio
```

**Body:**
```json
{
  "ticker": "AAPL",
  "shares": 100,
  "purchasePrice": 150.00,
  "purchaseDate": "2026-01-15"
}
```

#### Remove Position
```
DELETE /portfolio/:id
```

### Watchlist

#### Get Watchlist
```
GET /watchlist
```

#### Add to Watchlist
```
POST /watchlist
```

**Body:**
```json
{
  "ticker": "AAPL"
}
```

#### Remove from Watchlist
```
DELETE /watchlist/:id
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INTERNAL_ERROR` | 500 | Server error |
| `RATE_LIMITED` | 429 | Too many requests |

## Rate Limiting

- **Authenticated**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour

## Pagination

List endpoints support pagination:

```
GET /companies?page=1&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5000,
    "totalPages": 250
  }
}
```
