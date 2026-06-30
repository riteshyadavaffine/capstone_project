# Deliverable 1 — Project Proposal

## Idea Brief: SupportPilot

### Problem Statement
Internal customer support teams using generic email queues lose context between conversations, have no consistent AI assistance, and lack the admin tooling to tune bot behaviour without re-deploying code. Support agents spend 40–60 % of their time answering the same ten questions repeatedly.

### Target User
- **Primary**: Customers of a small-to-mid SaaS company who need self-service support before escalating to a human
- **Secondary**: A support admin who configures the AI assistant's system prompt, escalation keywords, and support email routing

### Value Proposition
SupportPilot replaces a static FAQ page with an AI-assisted conversation interface. The AI generates contextually aware, jargon-free answers in real time. Anything the AI cannot handle confidently is escalated to a human queue immediately, keeping customers satisfied and admin workloads manageable.

### MVP Scope
1. JWT authentication for customer and admin roles
2. Customers can create conversations, send messages, and read AI replies
3. Auto-escalation when user messages contain configured escalation keywords
4. Manual escalation button for customers
5. Admin console to update: system prompt, escalation keywords, support email
6. Admin queue view for escalated conversations with one-click resolution
7. User-facing error messages — no stack traces or HTTP status codes visible
8. Mobile-responsive layouts on Login and Dashboard screens
9. Loading state on all data-fetching operations

### Top 3 Risks
1. **AI API unavailability**: mitigated with a deterministic fallback reply function that covers common patterns (password resets, billing, errors)
2. **Context poisoning across long conversations**: mitigated by slicing to the last 8 messages when building the AI prompt
3. **Scope creep in admin UI**: mitigated by keeping admin features to settings + escalation queue only in MVP

### Biggest Assumption
Customers will trust an AI-first support interface if responses are concise, actionable, and never show technical jargon. We validate this with clear, human-readable error messages on every failure path.

