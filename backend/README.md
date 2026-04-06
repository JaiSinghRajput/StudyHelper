# Study Material Generator Backend

Secure Node.js/TypeScript backend with JWT authentication, role-based authorization, and streaming responses for the Study Material Generator application.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with access and refresh tokens
- 🛡️ **Authorization**: Role-based access control (user, premium, admin)
- 📡 **Streaming Responses**: SSE/NDJSON streaming for real-time study material generation
- 🎯 **Type-Safe**: Full TypeScript support with strict type checking
- 📝 **REST API**: Well-designed RESTful API endpoints
- 🚀 **Production-Ready**: Error handling, logging, and graceful shutdown

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Python backend for study material generation (running on port 8000)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
PYTHON_ENGINE_URL=http://localhost:8000
```

## Development

Start the development server with hot-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Build & Production

Build TypeScript to JavaScript:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Documentation

### Authentication Endpoints

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Validate Token
```bash
POST /api/auth/validate
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Study Material Endpoints

#### Generate Study Material (Streaming)
```bash
POST /api/study/generate
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "question": "What is machine learning?",
  "includeResearch": true,
  "includeDiagrams": true
}

Response: Streaming NDJSON format
{"type":"planning","data":{"subtopics":[...]},"timestamp":"..."}
{"type":"researching","data":{...},"progress":25,"timestamp":"..."}
{"type":"generating","data":{...},"progress":50,"timestamp":"..."}
{"type":"complete","data":{"id":"..."},"timestamp":"..."}
```

#### List Study Materials
```bash
GET /api/study/list?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Get Study Material
```bash
GET /api/study/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Delete Study Material
```bash
DELETE /api/study/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### User Statistics (Premium/Admin only)
```bash
GET /api/study/stats/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Test Users (Development)

The backend includes demo users for testing:

| Username | Email | Password | Role |
|----------|-------|----------|------|
| admin | admin@example.com | admin123 | admin |
| user | user@example.com | user123 | user |
| premium | premium@example.com | premium123 | premium |

## Project Structure

```
src/
├── config/         # Configuration files
│   └── environment.ts
├── middleware/     # Express middleware
│   ├── auth.ts
│   └── authorization.ts
├── routes/         # API routes
│   ├── auth.routes.ts
│   └── study.routes.ts
├── services/       # Business logic
│   ├── auth.service.ts
│   └── study.service.ts
├── types/          # TypeScript types
│   └── index.ts
├── utils/          # Utility functions
│   ├── crypto.ts
│   ├── jwt.ts
│   └── logger.ts
├── app.ts          # Express app setup
└── index.ts        # Entry point
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Signed with HS256 algorithm
- **Role-Based Authorization**: Fine-grained access control
- **CORS**: Configurable CORS origins
- **Request Logging**: All requests are logged with timestamps
- **Error Handling**: Secure error messages without leaking sensitive info

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| JWT_SECRET | JWT signing secret | required |
| JWT_REFRESH_SECRET | Refresh token secret | required |
| JWT_EXPIRY | Access token expiry | 15m |
| JWT_REFRESH_EXPIRY | Refresh token expiry | 7d |
| PYTHON_ENGINE_URL | Python engine URL | http://localhost:8000 |
| PYTHON_ENGINE_TIMEOUT | Request timeout (ms) | 60000 |
| CORS_ORIGIN | CORS allowed origins | http://localhost:3000,http://localhost:5173 |
| LOG_LEVEL | Logging level | info |

## TypeScript

The entire project is written in TypeScript with strict mode enabled. Type definitions are provided for all API responses and requests.

```bash
npm run typecheck
```

## License

MIT
