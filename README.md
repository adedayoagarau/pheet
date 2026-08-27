# Pheet

**Pheet** (pronounced *fit*) is an evidence-led capability-alignment workspace.

It examines demonstrated work in a portfolio against a capability lens, keeps
every conclusion connected to its source, shows what remains uncertain, and
helps a hiring manager prepare better interview questions.

> See where the work fits.

## What Pheet is not

Pheet is not a candidate score, personality assessment, applicant-tracking
system, or automated hiring decision-maker. It describes portfolio evidence in
relation to a specific need. It does not determine a person's overall ability.

## Core journey

1. Load a prepared portfolio or controlled public URL.
2. Set a capability lens.
3. Analyze projects, claims, and source-linked evidence.
4. Inspect strong, partial, unsupported, or missing evidence.
5. Generate interview questions grounded in uncertainty.

The same journey is available through the human interface and WebMCP tools.
Both control surfaces use one shared action layer and update one visible
workspace.

## Repository status

This repository currently contains the product and engineering handoff for the
first build. The first implementation milestone is defined in
[`docs/FIRST_CODEX_TASK.md`](docs/FIRST_CODEX_TASK.md).

## Documentation

- [`AGENTS.md`](AGENTS.md): durable instructions for coding agents
- [`docs/PRODUCT.md`](docs/PRODUCT.md): product specification
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): technical architecture
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md): delivery plan
- [`docs/WEBMCP_RESEARCH.md`](docs/WEBMCP_RESEARCH.md): platform research and implementation patterns
- [`docs/DECISIONS.md`](docs/DECISIONS.md): current decision log
- [`fixtures/demo-portfolio.json`](fixtures/demo-portfolio.json): deterministic demonstration data

## Intended stack

- Next.js
- TypeScript
- React
- Zod
- WebMCP imperative API
- Vitest and browser-level tests
- Vercel deployment

Exact package scripts will be added by the first implementation task.

## Visual architecture

The six illustrations under `docs/assets/` explain:

1. Product architecture
2. Hiring-manager journey
3. Evidence model
4. Shared human and WebMCP actions
5. Import and normalization
6. Trust, evaluation, and scale

## License

MIT

