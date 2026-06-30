# Deliverable 9 — API Reference Documentation

Base URL (development): `http://localhost:4000/api`

All authenticated endpoints require the header:
```
Authorization: Bearer <token>
```

All error responses follow this format:
```json
{
  "message": "Plain-language description of the problem."
}
```

---

## Authentication

### POST /api/auth/login

Sign in with email and password.

**Auth required**: No

**Request body**
```json
{
  "email": "customer@supportpilot.dev",
  "password": "Password123!"
}
```

**Success response** `200 OK`
```json
{
  "token": "eyJ...",
  "user": {
    "id": "user-demo",
    "email": "customer@supportpilot.dev",
    "name": "Demo Customer",
    "role": "customer"
  }
}
```

**Error responses**

| Status | Message |
|---|---|
| 400 | Some of the information you entered is incomplete or invalid. |
| 401 | We could not find an account with those details. Please check your email and password. |

---

### GET /api/auth/me

Returns the authenticated user's profile. Used to validate a stored token on app bootstrap.

**Auth required**: Yes (any role)

**Success response** `200 OK`
```json
{
  "user": {
    "id": "user-demo",
    "email": "customer@supportpilot.dev",
    "name": "Demo Customer",
    "role": "customer"
  }
}
```

**Error responses**

| Status | Message |
|---|---|
| 401 | Please sign in to continue. |

---

## Conversations

### GET /api/conversations

List conversations accessible to the signed-in user.
- Customers see only their own conversations.
- Admins see all conversations.
- Sorted newest-updated first.

**Auth required**: Yes (any role)

**Success response** `200 OK`
```json
{
  "items": [
    {
      "id": "conv-welcome",
      "userId": "user-demo",
      "subject": "Unable to reset my password",
      "status": "open",
      "escalated": false,
      "createdAt": "2026-06-30T18:00:00.000Z",
      "updatedAt": "2026-06-30T18:00:00.000Z",
      "messages": [...]
    }
  ]
}
```

---

### POST /api/conversations

Create a new conversation.

**Auth required**: Yes (any role)

**Request body**
```json
{
  "subject": "Need help with account access"
}
```

Constraints: `subject` must be 3–120 characters.

**Success response** `201 Created`
```json
{
  "conversation": {
    "id": "abc123",
    "userId": "user-demo",
    "subject": "Need help with account access",
    "status": "open",
    "escalated": false,
    "createdAt": "...",
    "updatedAt": "...",
    "messages": []
  }
}
```

**Error responses**

| Status | Message |
|---|---|
| 400 | Some of the information you entered is incomplete or invalid. |

---

### GET /api/conversations/:id

Get a single conversation with all its messages.

**Auth required**: Yes (owner or admin)

**Success response** `200 OK` — returns `{ conversation: Conversation }`

**Error responses**

| Status | Message |
|---|---|
| 404 | We could not find that conversation. |

---

### POST /api/conversations/:id/messages

Send a message in a conversation. The server:
1. Appends the user message
2. Checks for escalation keywords
3. Generates an AI (or fallback) reply
4. Appends the assistant message
5. Updates the conversation status

**Auth required**: Yes (owner or admin)

**Request body**
```json
{
  "content": "I keep getting an error when I log in."
}
```

Constraints: `content` must be 2–2000 characters.

**Success response** `200 OK`
```json
{
  "conversation": {
    "id": "abc123",
    "status": "waiting",
    "escalated": false,
    "messages": [
      { "id": "...", "role": "user", "content": "I keep getting an error...", "createdAt": "..." },
      { "id": "...", "role": "assistant", "content": "Here are the steps...", "createdAt": "..." }
    ]
  }
}
```

**Escalation behaviour**: If the message contains any configured escalation keyword, `status` becomes `"escalated"` and `escalated` becomes `true`.

---

### POST /api/conversations/:id/escalate

Manually escalate a conversation to the human support queue.

**Auth required**: Yes (owner or admin)

**Success response** `200 OK` — returns `{ conversation }` with `escalated: true`, `status: "escalated"`

---

### PATCH /api/conversations/:id/status

Update the status of a conversation. Admin only.

**Auth required**: Yes (admin only)

**Request body**
```json
{
  "status": "resolved"
}
```

Valid values: `"open"`, `"waiting"`, `"escalated"`, `"resolved"`

**Success response** `200 OK` — returns `{ conversation }`

**Error responses**

| Status | Message |
|---|---|
| 403 | Only support admins can update a conversation status. |

---

## Admin

### GET /api/admin/settings

Retrieve the current assistant settings.

**Auth required**: Yes (admin only)

**Success response** `200 OK`
```json
{
  "settings": {
    "systemPrompt": "You are SupportPilot...",
    "escalationKeywords": ["refund", "cancel", "angry", "urgent", "human", "manager"],
    "supportEmail": "support-team@supportpilot.dev"
  }
}
```

---

### PUT /api/admin/settings

Update the assistant settings.

**Auth required**: Yes (admin only)

**Request body**
```json
{
  "systemPrompt": "You are SupportPilot, a calm and empathetic assistant...",
  "escalationKeywords": ["refund", "urgent"],
  "supportEmail": "support@yourcompany.com"
}
```

Constraints:
- `systemPrompt`: 20–1000 characters
- `escalationKeywords`: 1–20 items, each 2–40 characters
- `supportEmail`: valid email format

**Success response** `200 OK`
```json
{
  "settings": { "systemPrompt": "...", "escalationKeywords": [...], "supportEmail": "..." },
  "message": "Assistant settings saved successfully."
}
```

---

### GET /api/admin/conversations

List all escalated conversations, sorted newest-updated first.

**Auth required**: Yes (admin only)

**Success response** `200 OK`
```json
{
  "items": [
    {
      "id": "...",
      "subject": "...",
      "status": "escalated",
      "escalated": true,
      "messages": [...]
    }
  ]
}
```

---

## Health

### GET /api/health

Liveness check — returns `200 OK` with `{ "status": "ok" }`. No auth required.

