# Deliverable 2 — Product Requirements Document (PRD)

## Section 1 — Problem

Support teams at small SaaS companies lack an AI-assisted, in-product support channel. Customers bounce between email, Slack, and a static FAQ page, losing context every time. Support admins cannot adjust the AI bot's behaviour without touching source code. The result is slower resolution times, inconsistent tone, and frustrated customers.

---

## Section 2 — Users

| Persona | Description |
|---|---|
| **Customer** | A SaaS end user who needs help with account access, billing, or errors. Low technical literacy. Wants a clear, fast answer. |
| **Support Admin** | An internal support team member. Manages escalations and configures the AI assistant's tone and escalation rules. Technical, but not a developer. |

---

## Section 3 — User Stories

| ID | Story | Priority |
|---|---|---|
| US-01 | As a customer, I can sign in so that I reach my personal support space | Must |
| US-02 | As a customer, I can start a new conversation with a subject line | Must |
| US-03 | As a customer, I can send a message and receive an AI-generated reply | Must |
| US-04 | As a customer, I can escalate my conversation to a human when the AI cannot help | Must |
| US-05 | As a customer, I see clear, friendly error messages — no technical jargon | Must |
| US-06 | As a customer, I see a spinner while my message is being sent | Must (Sprint 2) |
| US-07 | As an admin, I can sign in to a separate admin console | Must |
| US-08 | As an admin, I can update the AI system prompt without redeploying | Must |
| US-09 | As an admin, I can edit the escalation keyword list | Must |
| US-10 | As an admin, I can view and resolve escalated conversations | Must |
| US-11 | As any user, the Login and Dashboard screens are usable on mobile | Must (Sprint 2) |

---

## Section 4 — Features

### Must-have Features with Acceptance Criteria

**F-01 — Authentication**
- Acceptance: POST /api/auth/login returns a JWT and safe user object on valid credentials
- Acceptance: Invalid credentials return a user-friendly message, not a server error or HTTP code
- Acceptance: Token persists in localStorage and is included on all subsequent requests

**F-02 — Conversation management**
- Acceptance: Customers can create conversations with a subject of 3–120 characters
- Acceptance: Customers can only see their own conversations; admins can see all
- Acceptance: Conversations are sorted newest-first

**F-03 — AI reply generation**
- Acceptance: Sending a message returns an assistant reply within 5 seconds (or fallback if API is unavailable)
- Acceptance: The last 8 messages are included in the AI prompt for context
- Acceptance: Replies contain no internal error messages, stack traces, or technical codes

**F-04 — Escalation**
- Acceptance: Sending a message containing any configured keyword automatically escalates the conversation
- Acceptance: Customer can manually escalate via button
- Acceptance: Escalated conversation appears in admin queue immediately

**F-05 — Admin settings**
- Acceptance: Admin can update system prompt (20–1000 chars), keywords (1–20 items), and support email
- Acceptance: Changes persist across server restarts
- Acceptance: Saving shows a success confirmation message

**F-06 — Sprint 2 change request items**
- Acceptance: All error states show a plain-language message in a red banner — no HTTP codes or stack traces visible
- Acceptance: Login and both dashboard pages are usable at 375px viewport width
- Acceptance: All data-fetching operations (conversation list, message send, settings load) show a loading spinner

---

## Section 5 — Non-functional Requirements

| NFR | Requirement |
|---|---|
| Performance | AI reply must return within 8 seconds; fallback reply within 200ms |
| Security | JWT secret is not committed to source control; passwords are bcrypt-hashed at cost 10 |
| Accessibility | All interactive elements are keyboard-accessible; loading states have `aria-live` |
| Compatibility | Supported browsers: Chrome 110+, Firefox 110+, Safari 16+ |
| Data | No sensitive data logged to the console; `.env` files excluded from git |

---

## Section 6 — Out of Scope

1. Password reset via email
2. File/image attachment uploads
3. Real-time push notifications (WebSocket)
4. Multi-tenant or multi-company support
5. Conversation search and full-text filtering
6. Rate limiting per user
7. OAuth / SSO (Google, GitHub login)
8. Analytics and reporting dashboard
9. Export conversations to CSV or PDF
10. Rich text or markdown rendering in messages

---

## Section 7 — Success Metrics

| Metric | Target |
|---|---|
| All unit + integration tests pass | 100 % |
| TypeScript compiles with zero errors | Zero errors |
| AI fallback triggers when API key is absent | Confirmed |
| Escalation triggers on configured keywords | Confirmed |

---

## Section 8 — Open Questions

| Question | Decision |
|---|---|
| Should the fallback reply be branded? | Yes — it uses the system prompt tone |
| Do admins see their own conversations as customers? | No — admin role is support-only in MVP |
| Should conversation status update automatically after admin resolves? | Yes — `resolved` removes from escalation queue |

---

## Section 9 — Constraints

- Free-tier hosting (Railway or Render for backend, Vercel for frontend)
- No paid database — using lowdb (JSON file) which is appropriate for demo/single-instance deployments
- Anthropic API key required for live AI; fallback replies work without it
- Node.js 20+ required for ESM top-level `await`

