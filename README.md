# Spur – AI Support Agent for Live Chat Widget

Production-ready AI chat widget built with Node.js + Express, React, PostgreSQL, and Google Gemini LLM.

**[Frontend URL: https://spur-one.vercel.app/ ]** | **[Backend API URL: https://spur-pwl8.onrender.com ]**

## Table of Contents
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [How to Run](#how-to-run)
- [Environment Setup](#environment-setup)
- [API Docs](#api-docs)
- [Deployment](#deployment)

## 🚀 Quick Start

```bash
# Clone & setup backend
git clone https://github.com/Ankit08singh/Spur.git && cd Spur/backend
npm install
cp .env.example .env  # Add GEMINI_API_KEY and DATABASE_URL
npm run prisma:migrate dev && npm run dev

# Setup frontend (new terminal)
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173` → type a message → AI responds with formatted bullet points.

## 📁 Project Structure

```
backend/src/
├── server.ts              # Express app
├── config/prisma.ts       # Database client
├── routes/                # API endpoints
├── controllers/           # HTTP handlers
├── services/              # Business logic (chat, LLM)
├── repositories/          # Database queries
└── utils/constants.ts     # FAQ knowledge base

frontend/src/
├── components/ChatWidget.tsx   # Main state
├── components/ChatWindow.tsx   # Message display
├── components/ChatInput.tsx    # Input with auto-resize
├── services/api.ts             # HTTP client
└── types/chat.ts               # TypeScript interfaces
```

## 🏗️ Architecture

### Backend Structure (Layered Pattern)
```
Routes (chat.routes.ts)
  ↓ Validates HTTP request
Controllers (chat.controller.ts)
  ↓ Handles business logic
Services (chat.service.ts)
  ↓ Orchestrates message flow & LLM calls
Repositories (chat.repository.ts)
  ↓ Database queries via Prisma
PostgreSQL Database
```
- **Separation of concerns**: Each layer has single responsibility
- **Easy to test**: Mock each layer independently
- **Easy to extend**: Add new channels (WhatsApp, Telegram) by extending controllers

### Frontend Architecture
- **React + Vite**: Component-based UI with hooks for state management
- **localStorage**: Persists chatSessionId across page reloads
- **Message formatting**: Frontend parses `*` bullets from backend to **bold** text

### Database Schema
```
Conversation (id, createdAt, metadata)
  └── Messages (many) (id, conversationId, sender, text, createdAt)
```

---

## 🛠️ How to Run

### Prerequisites
- Node.js 18+, npm, PostgreSQL 12+

### Backend
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/spur"
GEMINI_API_KEY="your-api-key"
NODE_ENV=development
PORT=5000
EOF

# Database setup (migrations only, no seed needed)
npm run prisma:migrate dev

# Start server
npm run dev  # Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install

# Create .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:5000/api
EOF

npm run dev  # Runs on http://localhost:5173
```

### Verify Setup
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test chat
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

## 🔐 Environment Setup

### Backend (.env)
Required variables:
- **DATABASE_URL**: PostgreSQL connection string
  - Format: `postgresql://user:password@localhost:5432/dbname`
  - For production (Render): Use managed PostgreSQL connection string
- **GEMINI_API_KEY**: Google Generative AI API key
  - Get free key: https://aistudio.google.com/app/apikey
- **NODE_ENV**: `development` or `production`
- **PORT**: `5000` (default)

### Frontend (.env.local)
- **VITE_API_URL**: Backend API base URL
  - Local: `http://localhost:5000/api`
  - Production: `https://your-backend.onrender.com/api`

### Getting API Keys

**Google Gemini (Recommended - Free)**
```
1. Go to https://aistudio.google.com/app/apikey
2. Click "Get API Key" → Create new API key
3. Copy and paste into .env as GEMINI_API_KEY
```

**OpenAI (Optional alternative)**
```
1. https://platform.openai.com/api-keys
2. Create new secret key
3. Use in .env as OPENAI_API_KEY
```

**Anthropic Claude (Optional alternative)**
```
1. https://console.anthropic.com/account/keys
2. Create API key
3. Use in .env as ANTHROPIC_API_KEY
```

### Database Setup

**Migrations** (Run automatically on startup)
```bash
# Create/apply migrations
npm run prisma:migrate dev

# Reset database (dev only - wipes all data)
npm run prisma:migrate reset

# View database in UI
npm run prisma:studio
```

**Schema**
- `Conversation` table: Groups messages by session
- `Message` table: Stores user/AI messages with timestamps
- No seed data needed - conversations created on-demand

## 📡 API Documentation

### POST /api/chat/message
Send message, get AI response.
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"What is your return policy?","sessionId":"optional-id"}'
```
**Response:**
```json
{"success":true,"data":{"reply":"We offer a 30-day return policy...","sessionId":"conv_123"}}
```

### GET /api/chat/history/:sessionId
Fetch conversation history.
```bash
curl http://localhost:5000/api/chat/history/conv_123
```

### GET /api/health
Health check.
```bash
curl http://localhost:5000/api/health
```
**Response:**
```json
{"status":"ok"}
```


## 🧪 Testing

**Manual Tests:**
```bash
# Health check
curl http://localhost:5000/api/health

# Send message
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Invalid input (empty message)
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":""}'
```

## 🤖 LLM Integration

### Provider: Google Generative AI (Gemini)

**Why Gemini?**
- Free tier: 15 requests/minute (no credit card required)
- Fast: <1 second latency
- Good quality for support chat
- Easy to swap providers using service abstraction

**Model Used**: `gemini-3-flash-preview`
- Latest flash model (fast + efficient)
- Max output: 500 tokens (controls costs)
- Typical latency: 100-500ms

### Prompting Strategy

**System Prompt** (in `backend/src/utils/constants.ts`)
```
You are a helpful customer support agent for "TechStyle Store".

Store Knowledge:
* Free shipping on orders over $50
* 30-day return policy for most items
* Support hours: Mon-Fri 9 AM - 5 PM EST

IMPORTANT: Format responses with bullet points:
* Item 1
* Item 2
* Item 3
```

**Implementation** (in `backend/src/services/llm.service.ts`)
```typescript
// Pass conversation history (last 20 messages) + user message
const reply = await llmService.generateReply(conversationHistory, userMessage);
// Returns plain text with * bullets → frontend parses to bold
```

**Key Design Decisions:**
1. **Bullet point formatting**: Backend sends plain `* text`, frontend renders as **bold** for readability
2. **Conversation context**: Last 20 messages included in each request for coherent responses
3. **Error handling**: LLM failures return user-friendly messages, never expose API errors
4. **Token limiting**: 500 token max output to control costs and prevent runaway responses

### How to Switch Providers

The LLM service is abstracted - to use OpenAI or Claude instead:
```typescript
// In llm.service.ts, replace Gemini client with OpenAI/Claude
// Everything else stays the same - no controller/service changes needed
```



## 📊 Tech Stack

**Backend:** Node.js, Express.js, TypeScript, Prisma, PostgreSQL, Google Gemini
**Frontend:** React 19, Vite, TypeScript, localStorage
**Deploy:** Render (backend), Vercel (frontend)
