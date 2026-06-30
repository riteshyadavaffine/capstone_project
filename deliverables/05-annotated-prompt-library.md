# Deliverable 5 — Annotated Prompt Library

Each entry: prompt template, target component, and annotation.

---

## Prompt 1 — Initial Architecture Plan

**Target**: Plan Mode → architecture document  
**Annotation**: Used at the start of the project to generate the complete six-section architecture document before any code was written. The XML tags keep the context sections separate and prevent the AI from conflating design decisions with implementation instructions.

```xml
<task>Generate a complete technical architecture document for the project below.</task>

<project>
  Name: SupportPilot
  Type: AI customer support assistant (full-stack)
  Stack: React + TypeScript frontend, Node.js + Express backend, lowdb JSON persistence, Anthropic Claude API
  Users: customers (support seekers) and admins (support team)
</project>

<requirements>
  - All 6 sections: tech stack, components, data model, API design, implementation sequence, risks
  - Every component must have a one-sentence responsibility
  - All API endpoints: method, path, auth requirement, request body, response body
  - Implementation sequence must be in dependency order (data layer first)
</requirements>

<output>Markdown document. No code. Architecture decisions only.</output>
```

---

## Prompt 2 — Database Module with Seed Data

**Target**: `apps/server/src/db.ts`  
**Annotation**: Includes all required type imports, the file path, and the specific seed records needed for testing. Without specifying the two seed users, the AI produces random email addresses that break tests.

```xml
<task>Create the database module at apps/server/src/db.ts</task>

<context>
  - Using lowdb 7 with JSONFilePreset (ESM)
  - Types are in apps/server/src/types.ts (User, Conversation, Message, Settings, DatabaseSchema)
  - File must export: db (the lowdb instance), defaultData (the seed), resetDb() (for test isolation)
</context>

<seed_data>
  Two users: customer@supportpilot.dev / Password123! (role: customer), admin@supportpilot.dev / AdminPass123! (role: admin)
  One seeded conversation on the customer account about password reset, with two messages
  Settings: a default system prompt, six escalation keywords, and a support email
</seed_data>

<constraints>
  - Passwords must be bcrypt-hashed (cost 10) at seed time, not plain text
  - resetDb() must deep-clone defaultData to avoid shared-reference bugs in tests
  - Export types, not just values
</constraints>
```

---

## Prompt 3 — JWT Authentication Middleware

**Target**: `apps/server/src/middleware/auth.ts`  
**Annotation**: The explicit instruction to return user-friendly messages (not "Unauthorized" or 401) was the critical constraint that kept all auth error paths in spec.

```xml
<task>Create JWT authentication middleware at apps/server/src/middleware/auth.ts</task>

<context>
  - Stack: Express 5, TypeScript, jsonwebtoken
  - Token is in Authorization header as "Bearer <token>"
  - AuthPayload type: { sub: string; role: UserRole; email: string }
  - Database is db from ../db.ts; users array has id, role, email, passwordHash
</context>

<exports>
  - authenticate: middleware that attaches req.user (SafeUser) or returns 401
  - requireRole(role): middleware factory that returns 403 if role does not match
  - AuthenticatedRequest: extended Request interface with optional user field
</exports>

<constraints>
  - All error messages must be plain English — no "Unauthorized", no HTTP codes visible in message body
  - If token is missing: "Please sign in to continue."
  - If token is expired or invalid: "Your session expired. Please sign in again."
  - If user is not found in DB: "Your session is no longer valid. Please sign in again."
</constraints>
```

---

## Prompt 4 — AI Service with Fallback

**Target**: `apps/server/src/services/aiService.ts`  
**Annotation**: The fallback requirement was not in the original brief — it was added after recognising that a missing API key would silently break the app. The fallback covers the three most common support categories, which satisfies > 80% of demo scenarios.

```xml
<task>Create the AI reply service at apps/server/src/services/aiService.ts</task>

<context>
  - Uses @anthropic-ai/sdk (not the old `anthropic` package)
  - Only creates the Anthropic client if ANTHROPIC_API_KEY is set in env
  - Types: Conversation, Settings from ../types.ts
</context>

<function>
  generateAssistantReply(conversation: Conversation, settings: Settings, latestMessage: string): Promise<string>
</function>

<ai_prompt_strategy>
  - Include only the last 8 messages from the conversation transcript
  - Use settings.systemPrompt as the system message
  - Ask for concise, jargon-free guidance
</ai_prompt_strategy>

<fallback>
  When ANTHROPIC_API_KEY is absent, return a deterministic helpful reply based on keyword detection:
  - "password" → reset steps + escalation offer
  - "refund" or "cancel" → billing escalation message
  - "error" or "bug" → debug information request
  - default → generic empathetic opener with escalation offer
</fallback>
```

---

## Prompt 5 — Conversation Service with Escalation Logic

**Target**: `apps/server/src/services/conversationService.ts`  
**Annotation**: The escalation logic was the most complex service function. Specifying the keyword check, status transitions, and the "admin reply vs user reply" distinction in the prompt prevented the AI from generating ambiguous role logic.

```xml
<task>Create the conversation service at apps/server/src/services/conversationService.ts</task>

<context>
  - Database: db from ../db.ts
  - Types: Conversation, Message, SafeUser from ../types.ts
  - AI integration: generateAssistantReply from ./aiService.ts
  - IDs: nanoid from nanoid
</context>

<functions>
  - listConversations(user): returns all for admin, user-scoped for customers — sorted newest first
  - createConversation(user, subject): creates with status "open"
  - getConversationById(user, id): throws HttpError 404 if not found or not accessible
  - addMessage(user, id, content): appends user message, checks escalation keywords, generates AI reply, appends assistant message, updates status
  - escalateConversation(user, id): sets escalated=true, status="escalated"
  - updateConversationStatus(user, id, status): admin only — throws 403 for customers
</functions>

<escalation_rules>
  - Check db.data.settings.escalationKeywords (case-insensitive) against the user message content
  - If match: escalated=true, status="escalated"
  - If no match and not resolved: status="waiting"
  - Admin messages use role="admin", customer messages use role="user"
</escalation_rules>
```

---

## Prompt 6 — Zod Validation on API Routes

**Target**: All route files  
**Annotation**: Without this explicit instruction, the AI omitted Zod schemas from routes and validated nothing. The min/max constraints are the same as in the PRD acceptance criteria.

```xml
<task>Add Zod input validation to the route at apps/server/src/routes/conversationRoutes.ts</task>

<context>
  - Zod v4 is installed — use z from 'zod'
  - All schemas defined at the top of the file, before router definition
  - Validation errors are handled by the global error handler in ../middleware/errorHandler.ts
  - The error handler catches ZodError and returns a user-friendly 400 message
</context>

<schemas>
  - createConversationSchema: subject — string, min 3, max 120
  - addMessageSchema: content — string, min 2, max 2000
  - updateStatusSchema: status — enum ['open', 'waiting', 'escalated', 'resolved']
</schemas>

<pattern>
  const body = schemaName.parse(req.body) inside try/catch, next(error) in catch
</pattern>
```

---

## Prompt 7 — React Auth Context

**Target**: `apps/client/src/hooks/useAuth.tsx`  
**Annotation**: The localStorage bootstrap check was a late addition after testing — the app would log out on refresh without it. The `fetchMe` call during bootstrap also re-validates the stored token against the server, preventing stale tokens from surviving server restarts.

```xml
<task>Create the authentication context at apps/client/src/hooks/useAuth.tsx</task>

<context>
  - React 19, TypeScript
  - AuthState type: { token: string; user: User }
  - Persists to localStorage under key "supportpilot-auth"
  - On mount: reads from localStorage, validates token against GET /api/auth/me
  - If /auth/me fails: clear localStorage, set auth to null
</context>

<exports>
  - AuthProvider: context provider component
  - useAuth(): returns { auth, isBootstrapping, setAuth, signOut }
</exports>

<constraints>
  - isBootstrapping must be true until the /auth/me check resolves — prevents flash of login screen
  - signOut clears both state and localStorage
  - setAuth(null) clears localStorage
</constraints>
```

---

## Prompt 8 — Mobile-Responsive CSS

**Target**: `apps/client/src/styles/index.css`  
**Annotation**: Part of the Sprint 2 change request. The breakpoint at 768px was chosen to cover all common phone viewport widths. The `responsive-grid` class was designed to compose with the existing `dashboard-grid` so it could be applied selectively without modifying structural layout rules.

```xml
<task>Add mobile-responsive layout to apps/client/src/styles/index.css</task>

<context>
  - Existing layout uses CSS Grid: dashboard-grid has grid-template-columns: 300px 1fr
  - Target screens: Login page (.auth-layout / .auth-card), CustomerDashboard, AdminDashboard
  - Sprint 2 change request: at least 2 key screens must be responsive at 375px viewport
</context>

<requirements>
  - Add .responsive-grid class with @media (max-width: 768px) { grid-template-columns: 1fr }
  - At 768px and below: .page-header stacks vertically, padding reduces
  - At 768px and below: .auth-card padding reduces, max-width becomes 100%
  - Use CSS custom properties already defined in :root — do not add new colour values
</requirements>

<constraint>Do not change any desktop layout rules. Only add responsive overrides inside @media blocks.</constraint>
```

---

## Prompt 9 — Unit Test Scaffolding

**Target**: `apps/server/tests/*.test.ts`  
**Annotation**: Providing the exact seed credentials in the prompt prevented hallucinated email addresses or passwords in test files.

```xml
<task>Write Vitest unit tests for apps/server/src/services/authService.ts</task>

<context>
  - Test runner: Vitest 4 (ESM)
  - resetDb() is exported from ../src/db.ts and must be called in beforeEach
  - Seed credentials: customer@supportpilot.dev / Password123!, admin@supportpilot.dev / AdminPass123!
</context>

<test_cases>
  1. login() succeeds with correct customer credentials — asserts token is truthy and user.email matches
  2. login() rejects with wrong password — asserts the thrown error message matches the user-facing string
</test_cases>

<pattern>
  import { beforeEach, describe, expect, it } from 'vitest'
  beforeEach: await resetDb()
  Each test: isolated, no shared state
</pattern>
```

---

## Prompt 10 — API Integration Test

**Target**: `apps/server/tests/api.test.ts`  
**Annotation**: Supertest was chosen over a live HTTP call so tests don't depend on a running server process. The `createApp()` factory pattern (separating the app from the `listen()` call) was specifically designed to make supertest work cleanly.

```xml
<task>Write a Supertest integration test for the SupportPilot API at apps/server/tests/api.test.ts</task>

<context>
  - The Express app is created by createApp() from ../src/app.ts
  - Database is reset with resetDb() before each test
  - Seed users: customer@supportpilot.dev / Password123!, admin@supportpilot.dev / AdminPass123!
</context>

<test_cases>
  1. POST /api/auth/login returns 200 with user.role === "customer"
  2. POST /api/conversations creates a conversation, then POST /api/conversations/:id/messages returns 2 messages
  3. PUT /api/admin/settings as admin returns 200 with updated supportEmail
</test_cases>

<helper>
  Create a loginAs(email, password) async helper that returns the JWT token string
</helper>
```

---

## Prompt 11 — Sprint 2 Change Request Assessment

**Target**: Plan Mode assessment before writing Sprint 2 code  
**Annotation**: This prompt was used to return to Plan Mode before implementing the change request, following the Module 6 discipline of stopping before coding.

```xml
<task>Assess the impact of this change request on the current implementation plan and spec.</task>

<change_request>
  1. Add user-facing error messages that are clear and actionable — no technical jargon visible to users
  2. Add a mobile-responsive layout to at least 2 key screens
  3. Add a loading state to all data-fetching operations
</change_request>

<current_state>
  Sprint 1 complete: backend fully implemented, React frontend functional, all unit and integration tests passing
  Existing error handling: server returns plain-language messages in { message: string } format
  Existing CSS: dark theme, dashboard grid, no mobile breakpoints yet
  Existing loading: partial — conversation list has loadingList state but AdminDashboard does not
</current_state>

<output>
  For each change request item:
  1. Which files need to change
  2. Is this additive or does it require existing code to change
  3. Risk level (low / medium / high)
  4. Estimated effort in minutes
</output>
```

---

## Prompt 12 — Security Audit Review

**Target**: Security review of auth and data-handling code  
**Annotation**: Used in Phase 7 (Testing and Documentation) as the Module 11 Claude security review prompt.

```xml
<task>Perform a security audit of the authentication and data-handling code below.</task>

<code_under_review>
  - apps/server/src/middleware/auth.ts (JWT validation)
  - apps/server/src/services/authService.ts (login, bcrypt compare)
  - apps/server/src/db.ts (data persistence, seed)
</code_under_review>

<check_for>
  - JWT secret exposed in source code or default to empty string
  - Passwords stored in plain text or logged
  - Missing input validation before database operations
  - Insecure direct object references (users accessing other users' data)
  - CORS configuration too permissive
  - Error messages that reveal implementation details
</check_for>

<output>
  For each issue found: severity (low/medium/high/critical), what it is, how to fix it
  For each check with no issue: confirmed safe with brief explanation
</output>
```

