# First Codex task: deterministic Pheet vertical slice

## Goal

Build the first deterministic vertical slice of Pheet.

The finished slice must allow a user to:

1. Open the prepared portfolio.
2. Apply the demonstration capability lens.
3. See evidence grouped by capability.
4. Inspect one evidence item and its source.
5. Identify one uncertainty or gap.
6. Generate grounded interview questions.

## Required context

Read in this order before coding:

1. `AGENTS.md`
2. `docs/PRODUCT.md`
3. `docs/ARCHITECTURE.md`
4. `docs/IMPLEMENTATION_PLAN.md`
5. `fixtures/demo-portfolio.json`

Use the architecture illustrations under `docs/assets/` as conceptual context,
not pixel-perfect UI designs.

## Scope

### Implement

- Next.js, TypeScript, and React scaffold.
- Zod schemas for the canonical MVP objects.
- Validated prepared fixture loading.
- Demonstration capability lens.
- Serializable workspace reducer or small store.
- Shared domain actions for loading, lens setup, analysis, query, inspection, gaps, and questions.
- Start screen.
- Three-column evidence workspace.
- Source inspector.
- Gap and interview-question panel.
- Loading, empty, partial, error, retry, and unsupported-WebMCP states.
- Unit tests for schemas, state transitions, provenance, and question-gap relationships.
- README setup and verification commands.

### Do not implement yet

- Public URL import.
- Model API calls.
- WebMCP registration.
- Authentication.
- Database persistence.
- Candidate comparison.
- Scoring or hiring recommendations.
- Production analytics service.

Design the shared actions so WebMCP adapters can be added without changing
their behavior in the next milestone.

## Constraints

- Every demonstrated or partially demonstrated evidence item must resolve to a valid source.
- Portfolio, project, claim, and source IDs remain stable when the lens changes.
- Human interface components must not contain duplicated domain rules.
- The prepared journey works without network services.
- Missing evidence must be described as “not observed in the reviewed work.”
- Use accessible semantic controls and preserve keyboard operation.
- Do not add large UI or state dependencies without explaining the need.

## Done when

- A fresh checkout installs and runs from the README.
- The complete journey works manually.
- The fixture exercises all required evidence and relevance states.
- Invalid fixture data fails with a controlled diagnostic.
- Source selection and evidence selection remain synchronized.
- Questions reference valid evidence-gap IDs.
- The page is usable at desktop and narrow mobile widths.
- Formatting, lint, type-check, and tests pass.
- The final response reports changed files, architectural decisions, verification, and remaining limitations.

## Working instruction

Start in Plan mode. Inspect the repository and this handoff. Produce a concise
implementation plan and identify any true blocker before writing code. Choose
reasonable defaults for non-blocking details. Then implement, test, and review
the complete slice rather than stopping after scaffolding.
