# Deliverable 11 — Retrospective

## How the original plan changed during execution

The initial architecture document specified `prisma + PostgreSQL` as the persistence layer. During Sprint 1, I recognised that setting up a PostgreSQL instance for a capstone demo would add substantial friction without demonstrating any additional AI-assisted development skill. The risk was either spending 45 minutes debugging database connections, or compromising the demo by using a cloud database with credentials that expire. I made a deliberate decision — documented in the PRD constraints — to replace PostgreSQL with `lowdb` (a JSON file database). This is appropriate for a single-instance demo. The decision was correct: it removed an entire infrastructure complexity layer and kept the focus on the AI-assisted development workflow.

The second change was the addition of a fallback reply function in `aiService.ts`. This was not in the original spec. During Sprint 1, I realised that a missing `ANTHROPIC_API_KEY` would cause the entire conversation feature to silently fail, making the app unusable for reviewers or evaluators who do not have an API key. The fallback covers the three most common support patterns (password resets, billing, errors) with deterministic, high-quality replies, and it is tested implicitly by all the integration tests (which do not set an API key).

## What was the hardest part

The hardest part was managing TypeScript's ESM module resolution. Node.js ESM requires `.js` extensions on all relative imports at compile time, even when the source files are `.ts`. This is counter-intuitive — you import `./services/authService.js` from a `.ts` file that will compile to `.js`. Every import had to use `.js` extensions, and the tsconfig had to be set to `module: NodeNext` and `moduleResolution: NodeNext` rather than the more common `ESNext` + `Node16` combination. Getting this right required reading the error messages carefully and tracing the problem to its root rather than patching symptoms.

## What failure occurred

The most significant failure was the AI hallucinating a package name and version: `anthropic@^0.57.1`. The real package is `@anthropic-ai/sdk` at version `0.107.0`. The AI was confident — it included the package in `dependencies` with a specific version number — and that confidence made it easy to accept without checking. The recovery was straightforward once I read the npm error carefully. But the lesson is durable: AI-generated `package.json` entries must be verified against the registry before running install. The tool I used to verify (`npm show <package> version`) is now part of my standard post-acceptance checklist.

## What I would build differently

If I were building this for production rather than a capstone demo, I would:
1. Replace lowdb with PostgreSQL + Prisma, and add proper migration tracking
2. Add rate limiting per user on the message endpoint to prevent AI API abuse
3. Add proper conversation search and status filtering on the frontend
4. Add WebSocket or Server-Sent Events for real-time assistant reply streaming
5. Separate the AI service into a proper queue (BullMQ or similar) so slow API responses do not block the HTTP request

For the capstone itself, the one thing I would do differently is initialise the git repository and make the first commit immediately after writing the architecture document, before any code. Having a meaningful commit history from the start would make the git deliverable stronger.

## What I am most proud of

The error handling architecture. Every failure path — from a missing JWT to a Zod validation failure to a 500 server error — flows through a single `errorHandler` middleware and returns a plain-language message in `{ message: string }` format. On the frontend, every async operation wraps its error in an `ErrorBanner` component. The result is that a user never sees a stack trace, an HTTP status code, or a generic "Something went wrong" message that gives them no next action. This was a deliberate architectural decision made in Plan Mode before writing the first line of code, and it held throughout the entire implementation.

The fallback AI system is also something I am proud of. Rather than making the app non-functional without an API key, the fallback covers the three most common support question categories with useful, actionable answers. A reviewer can experience the full application feature set without needing a paid API key.

## Key learnings

1. **Plan Mode is not optional for recovery.** When the vitest configuration was wrong, the instinct was to try fixes immediately. Returning to Plan Mode — reading the full error, identifying the root cause, writing down the correct fix before touching any file — saved at least two additional failed attempts.

2. **Package version numbers from AI are unverified facts.** Treat them like any other AI output that needs confirmation before use.

3. **TypeScript strict mode pays for itself.** The two null-safety errors caught by `tsc --noEmit` were real bugs: if the `auth` object had somehow become null inside the async callbacks (which can happen in production due to timing), the app would have thrown a runtime error. The compiler found them at zero cost.

4. **Fallbacks are features.** Designing the AI service with a deterministic fallback was not a compromise — it was a feature that makes the application more robust and more demonstrable.

5. **Separating `createApp()` from `listen()` pays for itself immediately.** The pattern of exporting the app factory separately from the server startup made Supertest integration tests work with zero extra configuration.

