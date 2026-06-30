# Deliverable 10 — Debugging Journal

## Entry 1 — ESM top-level await and lowdb

**What happened**  
After scaffolding the project with `"type": "module"` in `package.json`, the server crashed on startup with `Cannot use import statement in a module` and then, after fixing that, a second crash with `Must use import to load ES Module`. The issue was that `lowdb/node` uses top-level `await` for `JSONFilePreset`, and the tsconfig `module` setting was `CommonJS`.

**Failure pattern**  
Configuration mismatch — the ESM module system and the TypeScript compiler settings were out of sync. This is the "Environment Setup Failure" pattern from Module 10.

**How I recovered**  
1. Stopped and diagnosed: read the full error messages rather than immediately re-running
2. Confirmed `"type": "module"` was set in `package.json`
3. Updated `tsconfig.json` to use `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`
4. Changed all internal imports to use `.js` extensions (required for NodeNext ESM)
5. Removed the `vitest poolOptions` configuration that was deprecated in Vitest 4

**What I would do differently**  
Set up the tsconfig and package.json `type` field together as the very first step, before writing any source code. ESM configuration in Node.js is not forgiving of incremental fixes.

---

## Entry 2 — npm package version mismatch

**What happened**  
`npm install` failed with `npm error notarget No matching version found for anthropic@^0.57.1`. The package had been renamed from `anthropic` to `@anthropic-ai/sdk`, and the version specified (`0.57.1`) did not exist under either name.

**Failure pattern**  
AI hallucination — the package name and version were both wrong. This is the "Hallucinated API / Package" pattern from Module 10: the AI confidently generated a package name that does not match the real npm registry.

**How I recovered**  
1. Ran `npm show @anthropic-ai/sdk version` to get the real package name and latest version
2. Checked several other packages (`vite`, `vitest`, `react`, `concurrently`) that had future version numbers specified
3. Updated all `package.json` files to use versions confirmed to exist on the registry
4. Re-ran `npm install` — clean result, zero errors

**What I would do differently**  
Always run `npm show <package> version` immediately after the AI generates a `package.json`, before attempting install. Treat AI-generated package versions as unverified until confirmed.

---

## Entry 3 — TypeScript null safety in async React callbacks

**What happened**  
TypeScript compilation of the React client failed with `TS18047: 'auth' is possibly 'null'` in two places — inside async callback functions in `CustomerDashboard.tsx` and `AdminDashboard.tsx`. The `auth` variable was checked as non-null at the component level with an early `return null`, but TypeScript's narrowing did not carry through to the inner async function closures.

**Failure pattern**  
TypeScript strict-mode narrowing does not persist into nested async callbacks the way it does in synchronous code. This is a "Context Lost in Closure" issue — the AI generated code that was logically safe (auth cannot be null when the button is visible) but not statically safe from TypeScript's perspective.

**How I recovered**  
1. Read the full compiler output — two specific lines, both in helper functions inside the component
2. Added a guard `if (!auth) return;` at the start of each nested async helper (`refreshSelected` and `reloadEscalations`)
3. Re-ran `tsc --noEmit` — zero errors

**What I would do differently**  
After accepting any AI-generated React component diff, immediately run `tsc --noEmit` before moving to the next task. TypeScript errors compound quickly if not caught at the point of introduction.

