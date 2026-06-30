# Deliverable 3 — Technical Architecture

## Section 1 — Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite | Component model maps cleanly to conversation UI; Vite proxies /api in dev |
| Backend | Node.js 24 + Express 5 + TypeScript | Async/await ESM, familiar REST structure, easy Railway/Render deployment |
| Persistence | lowdb (JSON file) | Zero config, zero cost; sufficient for a single-instance demo/capstone |
| AI | Anthropic Claude 3.5 Sonnet via `@anthropic-ai/sdk` | Best-in-class instruction following; falls back gracefully when key absent |
| Auth | bcryptjs (password hashing) + jsonwebtoken (JWT) | Stateless, portable, easy to invalidate by rotating secret |
| Validation | Zod v4 | Schema-first, TypeScript-native, friendly error messages |
| Testing | Vitest + Supertest | Fast ESM-native test runner; supertest for API integration testing |
| Deployment | Railway (backend) + Vercel (frontend) | Both free-tier, minimal config |

---

## Section 2 — Components

```
apps/
├── server/                         # Express API
│   └── src/
│       ├── index.ts                # Entry point — starts HTTP server
│       ├── app.ts                  # Creates Express app, mounts routes
│       ├── db.ts                   # lowdb setup, seed data, resetDb helper
│       ├── env.ts                  # Typed environment variable loader
│       ├── types.ts                # Shared domain types (User, Conversation, Message, Settings)
│       ├── middleware/
│       │   ├── auth.ts             # JWT authenticate + requireRole guards
│       │   └── errorHandler.ts     # Zod + HttpError + 500 catch-all
│       ├── routes/
│       │   ├── authRoutes.ts       # POST /auth/login, GET /auth/me
│       │   ├── conversationRoutes.ts # CRUD + messages + escalate + status
│       │   └── adminRoutes.ts      # GET/PUT /admin/settings, GET /admin/conversations
│       └── services/
│           ├── authService.ts      # login(), getUserById()
│           ├── conversationService.ts # list, create, addMessage, escalate, updateStatus
│           ├── adminService.ts     # getSettings, updateSettings, getEscalated
│           └── aiService.ts        # generateAssistantReply() + keyword-based fallback
└── client/                         # Vite + React SPA
    └── src/
        ├── main.tsx                # ReactDOM root, AuthProvider mount
        ├── App.tsx                 # Role-based routing (LoginPage | CustomerDashboard | AdminDashboard)
        ├── types.ts                # Client-side domain types (mirrors server, no passwordHash)
        ├── hooks/
        │   └── useAuth.tsx         # AuthContext — token + user, persist to localStorage
        ├── services/
        │   └── api.ts              # Typed fetch wrappers for every endpoint
        ├── components/
        │   ├── AppShell.tsx        # Page header + main wrapper
        │   ├── LoadingState.tsx    # Spinner + accessible aria-live label
        │   ├── ErrorBanner.tsx     # Red banner for user-facing error messages
        │   └── MessageComposer.tsx # Textarea + Send form
        ├── pages/
        │   ├── LoginPage.tsx       # Sign-in form, demo credentials display
        │   ├── CustomerDashboard.tsx # Conversation list + thread + composer
        │   └── AdminDashboard.tsx  # Settings form + escalation queue
        └── styles/
            └── index.css           # CSS custom properties, responsive grid, all component styles
```

---

## Section 3 — Data Model

### User
```ts
{
  id: string          // nanoid
  email: string       // unique
  name: string
  passwordHash: string // bcrypt cost 10
  role: 'customer' | 'admin'
}
```

### Conversation
```ts
{
  id: string
  userId: string      // owner
  subject: string
  status: 'open' | 'waiting' | 'escalated' | 'resolved'
  escalated: boolean  // true when keywords triggered or manual button used
  createdAt: string   // ISO 8601
  updatedAt: string
  messages: Message[]
}
```

### Message
```ts
{
  id: string
  role: 'user' | 'assistant' | 'admin'
  content: string
  createdAt: string
}
```

### Settings (singleton)
```ts
{
  systemPrompt: string
  escalationKeywords: string[]
  supportEmail: string
}
```

---

## Section 4 — API Design

All endpoints prefixed `/api`. Auth endpoints are public. All others require `Authorization: Bearer <token>`.

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | /api/auth/login | None | `{ email, password }` | `{ token, user }` |
| GET | /api/auth/me | JWT | — | `{ user }` |
| GET | /api/conversations | JWT | — | `{ items: Conversation[] }` |
| POST | /api/conversations | JWT | `{ subject }` | `{ conversation }` (201) |
| GET | /api/conversations/:id | JWT | — | `{ conversation }` |
| POST | /api/conversations/:id/messages | JWT | `{ content }` | `{ conversation }` |
| POST | /api/conversations/:id/escalate | JWT | — | `{ conversation }` |
| PATCH | /api/conversations/:id/status | JWT (admin) | `{ status }` | `{ conversation }` |
| GET | /api/admin/settings | JWT (admin) | — | `{ settings }` |
| PUT | /api/admin/settings | JWT (admin) | Settings object | `{ settings, message }` |
| GET | /api/admin/conversations | JWT (admin) | — | `{ items: Conversation[] }` |

**Error format** (all endpoints):
```json
{ "message": "Plain-language user-facing description." }
```

---

## Section 5 — Implementation Sequence

1. `db.ts` + `types.ts` — data foundation
2. `env.ts` — typed config
3. `middleware/auth.ts` — JWT guards
4. `services/authService.ts` → `routes/authRoutes.ts`
5. `services/aiService.ts` (fallback first, API second)
6. `services/conversationService.ts` → `routes/conversationRoutes.ts`
7. `services/adminService.ts` → `routes/adminRoutes.ts`
8. `middleware/errorHandler.ts` + `app.ts` + `index.ts`
9. Unit tests (authService, conversationService, adminService)
10. Integration tests (api.test.ts)
11. React client: types → api.ts → useAuth → components → pages → CSS
12. Sprint 2: error banners, mobile layout, loading states

---

## Section 6 — Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Anthropic API rate limit during demo | Low | Deterministic fallback replies cover common support patterns |
| lowdb write conflicts under concurrent load | Medium (not relevant for demo) | Out of scope for MVP; document in retrospective |
| JWT secret in environment during deployment | High if forgotten | `.env.example` documents it; `.gitignore` prevents commit |
| Context window overflow on very long conversations | Low | Slice to last 8 messages before sending to API |

