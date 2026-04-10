# Backend System Architecture & Engine Integration

## Overview

The backend is designed as a secure middleware layer between the frontend and the Python AI engine, with streaming support for real-time updates.

## Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React/Vue)   │
└────────┬────────┘
         │
         │ HTTP with Bearer Token
         │
┌────────▼──────────────────────┐
│   Node.js/Express Backend      │
│ ┌────────────────────────────┐ │
│ │ Authentication Middleware  │ │
│ │ - JWT verification         │ │
│ │ - Token refresh            │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ Authorization Middleware   │ │
│ │ - Role-based access        │ │
│ │ - Permission checking      │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ Study Material Service     │ │
│ │ - Stream generation logic  │ │
│ │ - Material storage         │ │
│ └────────────────────────────┘ │
└────────┬──────────────────────┘
         │
         │ HTTP GET
         │ (streaming response)
         │
┌────────▼──────────────────────┐
│   Python AI Engine             │
│ (FastAPI/Uvicorn)             │
│ ┌────────────────────────────┐ │
│ │ /generate endpoint         │ │
│ │ - Subtopic planning        │ │
│ │ - Research execution       │ │
│ │ - Diagram generation       │ │
│ │ - Content writing          │ │
│ │ - Stream updates           │ │
│ └────────────────────────────┘ │
└────────┬──────────────────────┘
         │
         └─► External APIs
             - OpenAI/OpenRouter
             - Tavily Search
```

## Data Flow for Study Material Generation

### 1. Request Flow

```
Frontend User Input
    ↓
POST /api/study/generate
(with JWT token)
    ↓
authMiddleware: Verify JWT
    ↓
authorize('user', 'premium', 'admin'): Check role
    ↓
StudyService.generateStudyMaterial()
    ↓
Create Readable stream
    ↓
Call Python Engine /generate endpoint
    ↓
Pipe stream to HTTP response
```

### 2. Streaming Pipeline

```
Python Engine Output
    ↓
Parse JSON chunks
    ↓
Create StreamChunk {type, data, progress, timestamp}
    ↓
Write to HTTP response (NDJSON)
    ↓
Frontend receives line-by-line
    ↓
Parse and update UI in real-time
```

### 3. Stream Chunk Types

| Type | Purpose | Contains | Progress |
|------|---------|----------|----------|
| `planning` | Subtopic generation | `{subtopics: []}` | 10% |
| `researching` | Research data fetching | `{topic, sources, results}` | 25-50% |
| `generating` | Content generation | `{content: "..."}` | 50-80% |
| `complete` | Generation finished | `{id, message}` | 100% |
| `error` | Error occurred | `{error: "message"}` | - |

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/validate` - Validate current token

### Study Materials (Protected)

- `POST /api/study/generate` - Generate with streaming
- `GET /api/study/list` - List user's materials
- `GET /api/study/:id` - Get specific material
- `DELETE /api/study/:id` - Delete material
- `GET /api/study/stats/user` - User statistics (premium only)

## Security Features

### 1. Authentication
- JWT tokens with HS256 algorithm
- Access tokens: 15 minutes
- Refresh tokens: 7 days
- Secure password hashing with bcryptjs

### 2. Authorization
- Role-based access control (RBAC)
- Three roles: user, premium, admin
- Endpoint-level authorization checks
- Premium features behind role middleware

### 3. Input Validation
- Question length: 5-500 characters
- Request body validation
- Token format validation
- CORS origin validation

### 4. Error Handling
- Secure error messages (no sensitive info leak)
- Comprehensive logging
- Error tracking with timestamps
- Graceful error recovery

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-refresh-secret>
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Python Engine
PYTHON_ENGINE_URL=http://localhost:8000
PYTHON_ENGINE_TIMEOUT=60000

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=info
```

## Required Modifications to Python Engine

The Python engine needs to be modified to support streaming responses:

### 1. Streaming Endpoint

Create a new endpoint that streams JSON chunks:

```python
@app.get("/generate")
async def generate_streaming(
    question: str,
    include_research: bool = True,
    include_diagrams: bool = True
):
    """
    Generate study material with streaming response
    Returns: NDJSON format (newline-delimited JSON)
    """
    
    # Stream chunk 1: Planning
    yield '{"type":"planning","data":' + json.dumps({
        "subtopics": generate_subtopics(question)
    }) + ',"progress":10}\n'
    
    # Stream chunk 2: Researching
    for i, topic in enumerate(topics):
        progress = 25 + int((i / len(topics)) * 25)
        yield '{"type":"researching","data":' + json.dumps({
            "topic": topic,
            "results": search_and_extract(topic)
        }) + f',"progress":{progress}}}\\n'
    
    # Stream chunk 3: Generating
    yield '{"type":"generating","data":' + json.dumps({
        "content": generate_markdown(question, research_data)
    }) + ',"progress":80}\n'
    
    # Stream chunk 4: Complete
    yield '{"type":"complete","data":{"message":"Done"}}\n'
```

### 2. Response Header

Set content type for streaming:

```python
from fastapi.responses import StreamingResponse

return StreamingResponse(
    generate_streaming(question, include_research, include_diagrams),
    media_type="application/x-ndjson"
)
```

### 3. Error Handling in Stream

Include error chunks:

```python
try:
    # Processing...
except Exception as e:
    yield '{"type":"error","data":' + json.dumps({
        "error": str(e)
    }) + '}\n'
```

## Frontend Integration Checklist

- [ ] Implement streaming response handler using fetch API
- [ ] Parse NDJSON format (line-by-line JSON)
- [ ] Handle different chunk types (planning, researching, generating)
- [ ] Display progress bar/indicator
- [ ] Show live content generation
- [ ] Handle stream errors gracefully
- [ ] Implement token refresh on 401
- [ ] Store tokens securely (HttpOnly cookies)
- [ ] Add loading states and spinners
- [ ] Add error UI notifications
- [ ] Test with demo credentials
- [ ] Add accessibility features

## Performance Considerations

### 1. Streaming Benefits
- Real-time UI updates (no waiting for complete response)
- Better UX feedback with progress indicators
- Lower initial response latency
- Memory efficient for large documents

### 2. Optimization
- Implement request debouncing (prevent duplicate requests)
- Cache completed materials
- Set reasonable timeouts (60 seconds default)
- Limit concurrent requests per user

### 3. Scaling
- Use connection pooling for Python engine
- Implement load balancing if needed
- Monitor memory usage during streaming
- Consider queue system for high traffic

## Testing

### Unit Tests Needed
- [ ] JWT token generation and verification
- [ ] Password hashing and comparison
- [ ] Authorization middleware
- [ ] Study material service logic

### Integration Tests Needed
- [ ] Full auth flow (register → login → refresh)
- [ ] Streaming response generation
- [ ] Error handling and recovery
- [ ] CORS policy compliance

### Load Tests Needed
- [ ] Concurrent streaming requests
- [ ] Long-running streams
- [ ] Token refresh under load

## Deployment

### Prerequisites
- Node.js 18+
- npm/yarn
- Python engine running on port 8000

### Build
```bash
npm install
npm run build
```

### Start
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

## Monitoring & Logging

All requests are logged with:
- Timestamp
- Method and path
- User IP
- User agent
- Response time
- Status code
- Errors and exceptions

Access logs via `LogLevel.INFO`
Debug logs via `LogLevel.DEBUG`

## Support Resources

- **API Documentation**: `STREAMING_API.md`
- **README**: Backend setup and configuration
- **Type Definitions**: `src/types/index.ts`
- **Environment Setup**: `.env.example`

## Git Commits Timeline

- **April 6**: Setup and configuration (TypeScript, types, utils)
- **April 7**: Authentication and authorization (JWT, middleware)
- **April 8**: Study service and API routes (streaming, integration)
- **April 9**: Release v1.0.0 (complete, production-ready)

## Version: 1.0.0
## Released: April 9, 2026
