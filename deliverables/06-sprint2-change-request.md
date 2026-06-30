# Deliverable — Sprint 2 Change Request Log

**Change request received**: Start of Sprint 2  
**Assessment completed**: Plan Mode review before any code changes  
**Items fully incorporated**: All 3

---

## Change Request Items

### 1. User-facing error messages — clear and actionable, no technical jargon

**Impact assessment**:
- Backend: Already implemented in `errorHandler.ts` and `HttpError` throughout services
- Frontend: Required adding `ErrorBanner` component and wiring to every async operation
- Risk: Low — additive change
- Effort: ~20 minutes

**Files changed**:
- `apps/client/src/components/ErrorBanner.tsx` (new)
- `apps/client/src/pages/LoginPage.tsx` — added ErrorBanner
- `apps/client/src/pages/CustomerDashboard.tsx` — added ErrorBanner to all catch blocks
- `apps/client/src/pages/AdminDashboard.tsx` — added ErrorBanner to all catch blocks

**Acceptance criteria met**: ✅ No HTTP codes, status numbers, or stack traces visible in any UI error path

---

### 2. Mobile-responsive layout on at least 2 key screens

**Impact assessment**:
- CSS only — no component logic changes required
- Used CSS `@media` breakpoint at `768px`
- Applied to: Login page, CustomerDashboard, AdminDashboard (all 3 screens)
- Risk: Low — additive CSS, does not affect desktop layout
- Effort: ~20 minutes

**Files changed**:
- `apps/client/src/styles/index.css` — added `.responsive-grid` class + `@media (max-width: 768px)` overrides for `.page-header`, `.auth-card`, `.auth-layout`, main padding

**Acceptance criteria met**: ✅ Tested at 375px in browser DevTools — all screens usable, no horizontal scroll

---

### 3. Loading state on all data-fetching operations

**Impact assessment**:
- `LoadingState` component needed for spinner + accessible label
- Five fetch operations needed loading states: conversation list, send message, create conversation, settings fetch, admin data fetch
- Risk: Low — additive
- Effort: ~25 minutes

**Files changed**:
- `apps/client/src/components/LoadingState.tsx` (new)
- `apps/client/src/pages/CustomerDashboard.tsx` — `loadingList` + `sending` states
- `apps/client/src/pages/AdminDashboard.tsx` — `loading` + `saving` states
- `apps/client/src/styles/index.css` — `.loading-state` + `.spinner` + `@keyframes spin`

**Acceptance criteria met**: ✅ All async operations show a spinner while pending; spinners disappear when data resolves or an error is displayed

---

## Plan Mode Assessment Output (summary)

Before writing any Sprint 2 code, assessed each change request item against the current implementation:

| Item | Additive? | Architecture impact | Data model impact |
|---|---|---|---|
| Error messages | Partially (frontend only) | None — server already correct | None |
| Mobile layout | Yes | None | None |
| Loading states | Yes | None | None |

**Decision**: All three items are low-risk, additive changes. No spec sections or data model entries need to be removed or changed. Proceed to Edit Mode with tasks in the order listed above.

