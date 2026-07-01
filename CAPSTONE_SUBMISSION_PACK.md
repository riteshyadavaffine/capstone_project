# CAPSTONE SUBMISSION PACK

## Project
**SupportPilot — AI Customer Support Assistant**

## Candidate
**Name:** [Your Name]  
**Date:** 2026-07-01

## Submission Mode
This submission is provided as a **document-based evidence pack** with screenshots and links in place of a demo video.

---

## 1. Quick Links
- **GitHub Repository:** https://github.com/riteshyadavaffine/capstone_project
- **Live Application:** https://capstone-project-client-bcnt.vercel.app
- **Backend Health Check:** https://supportpilotserver-production.up.railway.app/api/health

**Test credentials**
- Customer: `customer@supportpilot.dev` / `Password123!`
- Admin: `admin@supportpilot.dev` / `AdminPass123!`

---

## 2. Project Summary
SupportPilot is a full-stack AI customer support assistant that allows customers to create support conversations, receive AI-assisted responses, and escalate issues to a human when needed. Admin users can configure assistant settings and manage escalated conversations.

### Key Features
- Customer login and conversation history
- AI/fallback assistant responses
- Escalation workflow
- Admin configuration panel
- User-friendly error handling
- Mobile-responsive layout
- Loading states across async actions
- Live deployment on Railway + Vercel

---

## 3. Screenshot Evidence Guide
Insert screenshots directly below each heading in the final document/PDF.

### Screenshot 1 — Live Login Screen
**What to capture:** Vercel app open on login page  
**Filename suggestion:** `01-login-screen.png`  
**Proves:** deployed URL works, polished UI, authentication entry point

### Screenshot 2 — Customer Dashboard After Login
**What to capture:** customer logged in, conversation list visible  
**Filename suggestion:** `02-customer-dashboard.png`  
**Proves:** auth flow works, customer role view works

### Screenshot 3 — Assistant Reply in Conversation
**What to capture:** a user message and assistant response shown together  
**Filename suggestion:** `03-assistant-reply.png`  
**Proves:** core product flow works, AI/fallback response works

### Screenshot 4 — Escalation Action
**What to capture:** escalated conversation or “Escalate to human” flow  
**Filename suggestion:** `04-escalation-flow.png`  
**Proves:** stakeholder-facing business workflow works

### Screenshot 5 — Admin Login / Admin Dashboard
**What to capture:** admin logged in with settings form visible  
**Filename suggestion:** `05-admin-dashboard.png`  
**Proves:** multi-role app, admin permissions work

### Screenshot 6 — Admin Settings Update
**What to capture:** settings saved successfully / success banner  
**Filename suggestion:** `06-admin-settings-save.png`  
**Proves:** config persistence and admin feature completeness

### Screenshot 7 — Escalated Conversations Queue
**What to capture:** escalated conversation visible for admin  
**Filename suggestion:** `07-escalated-queue.png`  
**Proves:** escalation pipeline works end-to-end

### Screenshot 8 — Mobile Responsive View
**What to capture:** browser device mode on login or dashboard  
**Filename suggestion:** `08-mobile-responsive.png`  
**Proves:** Sprint 2 change request completed

### Screenshot 9 — Friendly Error Message
**What to capture:** non-technical user-facing error banner  
**Filename suggestion:** `09-error-banner.png`  
**Proves:** error handling requirement completed

### Screenshot 10 — Test Results
**What to capture:** terminal showing passing tests  
**Filename suggestion:** `10-tests-passing.png`  
**Proves:** testing deliverable completed

### Screenshot 11 — GitHub Repository
**What to capture:** repo homepage showing commits and files  
**Filename suggestion:** `11-github-repo.png`  
**Proves:** repository exists, commit history exists, README present

### Screenshot 12 — Railway Health Endpoint / Deployment
**What to capture:** Railway backend URL working or health endpoint response  
**Filename suggestion:** `12-railway-health.png`  
**Proves:** backend is deployed and live

---

## 4. Walkthrough Summary (Use Instead of Video)
### 4.1 Customer Flow
1. Open live application.
2. Log in as demo customer.
3. View existing conversation.
4. Create a new support conversation.
5. Send a message.
6. Confirm assistant response is returned.
7. Escalate to human if needed.

### 4.2 Admin Flow
1. Sign out and log in as admin.
2. Open admin settings.
3. Update assistant system prompt / keywords / support email.
4. Confirm success message.
5. Review escalated conversations.
6. Mark a conversation resolved.

### 4.3 Deployment / Reliability Proof
1. Show Vercel frontend URL.
2. Show Railway backend health endpoint.
3. Show test suite passing.
4. Show GitHub repository.

---

## 5. Deliverables Index
| Deliverable | File |
|---|---|
| 1. Project Proposal | `deliverables/01-project-proposal.md` |
| 2. PRD | `deliverables/02-prd.md` |
| 3. Architecture | `deliverables/03-architecture.md` |
| 4. Vibe Coding Spec | `deliverables/04-vibe-coding-spec.md` |
| 5. Prompt Library | `deliverables/05-annotated-prompt-library.md` |
| 6. Change Request Log | `deliverables/06-sprint2-change-request.md` |
| 7. Self-Assessment | `deliverables/07-self-assessment.md` |
| 8. Security Checklist | `deliverables/08-security-checklist.md` |
| 9. API Docs | `deliverables/09-api-docs.md` |
| 10. Debugging Journal | `deliverables/10-debugging-journal.md` |
| 11. Retrospective | `deliverables/11-retrospective.md` |

---

## 6. Rubric Evidence Map
| Rubric Dimension | Evidence |
|---|---|
| Planning Quality | PRD + Architecture + Spec |
| Plan Mode Discipline | Spec + change request log |
| Prompt Engineering | Annotated prompt library |
| Architecture Quality | Architecture doc + repo structure |
| Code Organisation | `apps/server/src/` and `apps/client/src/` |
| Error Handling | Error screenshots + `errorHandler.ts` |
| Security | Security checklist + auth middleware |
| Testing | Passing tests screenshot + `apps/server/tests/` |
| Documentation | README + API docs |
| Deployment | Vercel + Railway screenshots |
| Debugging Recovery | Debugging journal |
| Change Request | Sprint 2 change request log + responsive screenshot |
| Product Thinking | Customer/admin screenshots |
| Retrospective | Retrospective file |

---

## 7. Final Submission Note
This capstone is submitted as a documentation-based evidence package. Where a video walkthrough is normally used, the same proof is provided through:
- live links,
- screenshot evidence,
- repository history,
- deployed application,
- tests,
- and linked deliverable files.

This preserves verifiability while fitting a document-only submission format.

