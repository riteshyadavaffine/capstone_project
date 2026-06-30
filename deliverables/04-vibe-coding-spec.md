# Deliverable 4 — Vibe Coding Spec

## Section 1 — Project Summary

**Project name**: SupportPilot  
**Stack**: React 19 + TypeScript (Vite) / Node.js + Express 5 + TypeScript / lowdb / Anthropic SDK  
**AI model used for generation**: Claude (Cursor Composer, Plan Mode + Edit Mode)  
**Sprint structure**: 2 sprints — Sprint 1 (core), Sprint 2 (change request + polish)

---

## Section 2 — Roles and Responsibilities

| Role | What the AI does | What the human does |
|---|---|---|
| Plan Mode | Generates PRD, architecture, implementation plan | Reviews, challenges assumptions, makes decisions |
| Edit Mode | Writes code one task at a time in Cursor Composer | Reviews every diff, accepts/rejects, commits |
| Debug recovery | Diagnoses failure patterns when AI goes off track | Stops immediately, returns to Plan Mode |

---

## Section 3 — Constraints for AI

- Every Cursor Composer prompt must include: tech stack, file path, existing types, acceptance criteria
- No file should be generated that imports from a module not yet created
- Backend first, then frontend — never the reverse
- All error messages must be user-facing plain language — no HTTP status codes or stack traces
- Commits after every completed task, not batched

---

## Section 4 — Implementation Plan (as Cursor Composer Prompts)

See Section 8 (Prompt Library) for the actual prompt text. Tasks are numbered to match.

1. Scaffold monorepo, package.json files, tsconfig files
2. Create `db.ts` with lowdb, seed data, and `resetDb()` helper
3. Create `types.ts` (shared domain types)
4. Create `env.ts` (typed env loader with dotenv)
5. Create `middleware/auth.ts` (JWT authenticate + requireRole)
6. Create `services/authService.ts` (login + getUserById)
7. Create `routes/authRoutes.ts` (POST /login, GET /me)
8. Create `services/aiService.ts` (Anthropic SDK + fallback)
9. Create `services/conversationService.ts` (full CRUD + escalation)
10. Create `routes/conversationRoutes.ts`
11. Create `services/adminService.ts` (settings + escalation queue)
12. Create `routes/adminRoutes.ts`
13. Create `middleware/errorHandler.ts`
14. Create `app.ts` + `index.ts` (wire everything together)
15. Unit tests: authService, conversationService, adminService
16. Integration tests: api.test.ts (3 endpoints)
17. React: types.ts + api.ts (typed fetch wrappers)
18. React: useAuth hook (AuthContext + localStorage)
19. React: atomic components (AppShell, LoadingState, ErrorBanner, MessageComposer)
20. React: LoginPage
21. React: CustomerDashboard
22. React: AdminDashboard
23. React: App.tsx router + main.tsx
24. CSS: index.css (dark theme, responsive grid, all components)

---

## Section 5 — Sprint 2 Change Request Tasks

1. Audit every `catch` block — ensure the error message is extracted and passed to `ErrorBanner`
2. Add `.responsive-grid` CSS rule with `@media (max-width: 768px)` breakpoint
3. Apply `responsive-grid` class to Login and both Dashboard pages
4. Add `LoadingState` component to: conversation list fetch, message send, settings fetch, admin data fetch
5. Test all loading states by throttling the network in browser DevTools

---

## Section 6 — Review Checklist (after each Cursor Edit)

- [ ] No imports pointing to files not yet created
- [ ] TypeScript compiles with zero errors
- [ ] Error messages are plain language (no HTTP codes, no stack traces)
- [ ] New service functions have a corresponding unit test
- [ ] No `.env` file changes are staged in git
- [ ] Commit message describes what changed and why

---

## Section 7 — Out of Scope (tracked to prevent drift)

Password reset, file uploads, WebSockets, multi-tenant, OAuth, analytics, CSV export, markdown rendering

---

## Section 8 — Prompt Library

See `05-annotated-prompt-library.md`

