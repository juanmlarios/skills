# C# / .NET pack — review rules & gates

Loaded by standards-review reviewers for repos with `*.sln`/`*.csproj`. Derived from the retired backend-review skill (2026-07-16), generalized from its modular-monolith origin; the repo's own `docs/**` (ARCHITECTURE/MODULES/STANDARDS/TESTING) supply the specifics and always win.

## Hot rules (inject-me)

1. Read the repo's architecture docs before judging design; evaluate against established local patterns, not generic .NET preferences.
2. Modules own their contracts, handlers, persistence, migrations, schema, and tests together — move tests and docs with the code when ownership changes.
3. No cross-module EF reach-through; one owning `DbContext` per module area; no new shared schemas.
4. No fresh generic `IRepository<T>` / `IUnitOfWork` abstractions; no reintroducing banned mediators where the repo goes endpoint → handler directly.
5. Cross-cutting building blocks stay cross-cutting — never a second business layer.
6. Prefer synchronous execution; async only for long-running, cancelable, or durable-boundary work; public long-running surfaces use the repo's operation vocabulary.
7. Auth/policy registration lives in its platform owner; modules own business authorization decisions; preserve structured logging + redaction guarantees.
8. Architecture tests + build + solution tests are the closeout agreement; integration via the repo's established harness (e.g. WebApplicationFactory, Testcontainers).

## Review rules (diff + audit)

1. **Correctness & contracts:** API contract risk vs. callers; operation lifecycle semantics; async boundary correctness (cancellation, durability); EF Core ownership and migration coherence.
2. **Boundaries:** host composition stays in hosts/platform code; module boundaries respected; grep for the repo's banned markers/drift patterns (the config lists them) when relevant.
3. **Security:** auth/tenant boundaries; input validation at HTTP edges; secrets and logging redaction preserved.
4. **Tests:** boundary-touching changes exercise the architecture test suite; behavior changes get focused tests.

## Mechanical gates

Use the repo config's gate commands; typical shape:

- Architecture gate: `dotnet test <architecture-tests>.csproj -c Debug --no-build`
- Build gate: `dotnet build <solution>.sln -c Debug --no-restore`
- Test gate: `dotnet test <solution>.sln -c Debug --no-build`

When changes affect hosts, module boundaries, persistence, or public contracts: architecture gate plus at least one build or test gate. Smallest step that can prove or falsify the concern.
