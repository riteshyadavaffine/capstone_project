# Deliverable — Security Audit Checklist

Conducted in Phase 7 (Testing, Documentation and Security).

---

## Pre-deployment Security Checklist

| Check | Status | Notes |
|---|---|---|
| JWT secret is not hardcoded | ✅ Pass | Loaded from `process.env.JWT_SECRET`; `.env` is in `.gitignore` |
| JWT secret has a sane fallback for dev only | ✅ Pass | Falls back to `'supportpilot-dev-secret'` — only acceptable in local dev, documented in `.env.example` |
| Passwords are hashed, not stored plain text | ✅ Pass | bcryptjs at cost factor 10 |
| Passwords are never logged | ✅ Pass | `login()` only logs nothing; `passwordHash` is stripped from `SafeUser` before any response |
| All inputs are validated before reaching services | ✅ Pass | Zod schemas on every route that accepts a request body |
| IDOR — users cannot access other users' conversations | ✅ Pass | `matchesConversationAccess()` in `conversationService.ts` checks `userId === user.id` for customers |
| CORS is restricted | ✅ Pass | `cors({ origin: env.clientOrigin })` — defaults to localhost:5173; must be set to production frontend URL |
| Error messages do not leak implementation details | ✅ Pass | `errorHandler.ts` returns plain-language messages; unknown errors log to `console.error` server-side only |
| `.env` files not committed | ✅ Pass | `.gitignore` includes `.env` and `.env.*`; `.env.example` has no real secrets |
| Admin routes protected by role middleware | ✅ Pass | All `/api/admin/*` routes use `requireRole('admin')` |
| Token expiry set | ✅ Pass | JWTs expire after 12 hours |
| `npm audit` result | ✅ Pass | Zero vulnerabilities found on `npm audit` (run after install) |

---

## Known Gaps (accepted for capstone scope)

| Gap | Severity | Mitigation for production |
|---|---|---|
| No rate limiting | Medium | Add `express-rate-limit` with per-IP and per-user limits on `/api/conversations/:id/messages` |
| No HTTP security headers (Helmet) | Low | Add `helmet` middleware in `app.ts` |
| No CSRF protection | Low | Add `csurf` or use SameSite cookie strategy |
| lowdb JSON file not encrypted at rest | Low | Acceptable for demo; use PostgreSQL with encryption at rest for production |
| No token revocation / blacklist | Low | Rotate `JWT_SECRET` to invalidate all sessions immediately if needed |

