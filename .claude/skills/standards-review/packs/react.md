# React / frontend pack — review rules & gates

Loaded by standards-review reviewers for repos whose `package.json` carries a react dependency. Merged from the retired react-doctor and frontend-review skills (2026-07-16). Repo-specific architecture (layering, providers, route patterns) comes from the repo's own `docs/ENGINEERING-STANDARDS.md` / config — this pack carries the stack-generic layer.

## Hot rules (inject-me)

≤15 lines; what `/workplan` pastes into builder contracts unless the repo's config overrides.

1. Route entrypoints stay thin and server-first; no feature behavior, SDK calls, or duplicate auth logic in route files.
2. Feature code lives in its feature directory; cross-cutting concerns (auth/api/query/navigation/realtime) live in the platform layer; features never import another feature's internals outside declared shared features.
3. Backend reads go through query hooks / the platform API client; never `fetch()` ad hoc in a page or presentational component, never fetch inside a state store.
4. Shareable state (filters, pagination, sort, tabs) lives in URL params, not `useState`; transient UI state in a feature-local store; forms via the repo's form+schema stack.
5. Gate on resolved capabilities, never raw role strings; no secret or backend-only value in a client-exposed env var.
6. Reuse the existing provider stack and shared realtime manager — never a page-local parallel.
7. Prefer the repo's UI primitives (e.g. `src/components/ui/**`) and existing shell/page patterns; keep transport/auth/query logic out of presentational components.
8. Preserve loading, empty, error, success, and denied states; keep accessibility checks (axe) green; add `data-testid` only where tests depend on it.
9. A page component over ~150 lines, >2 `useState`, >1 `useEffect`, or with multiple workflows/dialogs gets split into a controller hook + sections before the change is done.
10. TypeScript strict; `any` needs a justifying comment; test through the public interface, never a `_private` import.

## Review rules (diff + audit)

1. **Boundaries:** server/client boundary correctness; layering per the repo standards; no new cross-feature imports; route metadata/policy/search-param parsing in the feature's routes area.
2. **Data & state:** reads in query hooks with coherent cache keys; writes in commands/mutations with coherent invalidation; no duplicated server state in stores.
3. **Auth/security:** capability-driven gating; token/correlation/error-normalization behavior preserved through the shared client; no direct browser calls to private backends.
4. **Composition & UX:** existing primitives over new one-offs; all interaction states present; no querySelector/raw location hacks in components.
5. **Testability:** behavior changes covered through public interfaces; e2e/a11y expectations protected; coverage floors not regressed.

## Mechanical gates

Prefer the repo's own scripts (`npm run verify` / lint / type-check / test) — they win over fallbacks. Stack-generic evidence generators (candidates, not automatic findings — confirm each in code):

- `npx -y react-doctor@latest . --verbose --diff` — 0-100 score with security/performance/correctness/architecture diagnostics. Fix errors first, re-run to verify the score improved. Only diagnostics that hold up against repo standards become findings.
- `npx -y fallow@latest dead-code` and `npx -y fallow@latest dupes` — dead/duplicate candidates. Apply the engine's two-source rule before reporting: GitNexus `context`/`impact` upstream AND a check that "duplicates" aren't intentionally different per route/capability/boundary.
- Report-only gates with recorded baselines (knip/fallow/react-doctor in some repos): compare against the baseline; new work must not widen the gap.
