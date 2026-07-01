# SupportPilot

> AI-powered customer support assistant — capstone project for Vibe Coding with Claude + Cursor, Module 15.

A full-stack application where customers open support conversations and receive AI-generated, context-aware replies. Support admins configure the assistant's behaviour and manage escalated conversations — all without touching source code.

**Live demo**: https://capstone-project-client-bcnt.vercel.app

**Live demo**: Deploy instructions below
**Repository**: https://github.com/riteshyadavaffine/capstone_project  
**Test credentials**:
- Customer: `customer@supportpilot.dev` / `Password123!`
- Admin: `admin@supportpilot.dev` / `AdminPass123!`

---

## Features

- **AI replies**: Claude 3.5 Sonnet generates concise, jargon-free support responses
- **Graceful fallback**: Deterministic pattern-matched replies when the Anthropic API key is absent
- **Auto-escalation**: Configurable keyword list triggers immediate human queue placement
- **Manual escalation**: Customers can request a human at any time
- **Admin console**: System prompt, keywords, and support email configurable at runtime — no redeploy required
- **Escalation queue**: Admin sees all open escalations; can resolve with one click
- **User-facing errors only**: No HTTP codes or stack traces ever reach the UI
- **Mobile-responsive**: Login and dashboards work at 375 px viewport width
- **Loading states**: Spinners on every async operation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Node.js 24 + Express 5 + TypeScript |
| Persistence | lowdb (JSON file) |
| AI | Anthropic Claude 3.5 Sonnet |
| Auth | bcryptjs + jsonwebtoken |
| Validation | Zod v4 |
| Testing | Vitest + Supertest |

---

## Project Structure

```
Module 15/
├── apps/
│   ├── server/          # Express API (port 4000)
│   │   ├── src/         # TypeScript source
│   │   ├── tests/       # Vitest unit + integration tests
│   │   └── data/        # lowdb JSON file (git-ignored)
│   └── client/          # Vite + React SPA (port 5173)
│       └── src/
└── deliverables/        # All 11 capstone deliverables (markdown)
```

---

## Local Setup

### Prerequisites
- Node.js 20 or later
- npm 10 or later
- Git

### 1. Clone and install
```bash
git clone <your-repo-url>
cd "Module 15"
npm install
```

### 2. Configure environment
```bash
cp apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env`:
```
PORT=4000
JWT_SECRET=a-long-random-string-you-generate
ANTHROPIC_API_KEY=sk-ant-...   # optional — fallback replies work without it
CLIENT_ORIGIN=http://localhost:5173
```

> **Important**: Never commit the `.env` file. It is in `.gitignore` by default.

### 3. Run tests
```bash
npm run test -w @supportpilot/server
```

Expected output: 12 tests passing across 4 test files.

### 4. Start development servers
Open two terminals:

**Terminal 1 — API server**
```bash
cd apps/server
npm run dev
```

**Terminal 2 — React client**
```bash
cd apps/client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deployment

### Backend — Railway

1. Create a new Railway project
2. Add a service pointing to `apps/server`
3. Set environment variables in Railway dashboard:
   - `PORT` (Railway sets this automatically)
   - `JWT_SECRET`
   - `ANTHROPIC_API_KEY`
   - `CLIENT_ORIGIN` → your Vercel frontend URL
4. Railway auto-detects `npm run start` from `package.json`

### Frontend — Vercel

1. Import the repository into Vercel
2. Set **Root Directory** to `apps/client`
3. Add an environment variable:
   - `VITE_API_BASE` → your Railway backend URL (for example `https://your-backend.railway.app/api`)
4. Vercel auto-runs `npm run build`

> **Note**: In development, the client defaults to `/api` so Vite proxying still works. In production, set `VITE_API_BASE` to your backend `/api` URL.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default: 4000) | API server port |
| `JWT_SECRET` | Yes | Secret for signing JWTs — must be long and random |
| `ANTHROPIC_API_KEY` | No | Anthropic API key — fallback replies work without it |
| `CLIENT_ORIGIN` | No (default: http://localhost:5173) | Allowed CORS origin |

---

## Running Tests

```bash
# From repo root
npm run test -w @supportpilot/server

# From server directory
cd apps/server
npm test
```

**Test coverage**: 4 test files, 12 tests
- `tests/authService.test.ts` — login success and failure
- `tests/conversationService.test.ts` — create conversation, escalation via keywords
- `tests/adminService.test.ts` — read and update admin settings
- `tests/api.test.ts` — full API integration: login, conversation + message, settings update, auth guard, role guard, auto-escalation

---

## Security Notes

- Passwords are hashed with bcrypt at cost factor 10
- JWT tokens expire after 12 hours
- JWT secret is loaded from environment, never hardcoded
- `.env` files are in `.gitignore`
- All user input is validated with Zod before reaching service layer
- Role-based access control on all admin endpoints
- CORS restricted to `CLIENT_ORIGIN`
- Error messages shown to users are plain-language only — no stack traces, no HTTP codes

