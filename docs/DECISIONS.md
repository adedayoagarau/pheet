# Pheet decision log

This file records current product and architecture decisions. Superseded ideas
should be replaced here rather than allowed to coexist in implementation.

## Confirmed decisions

| Date | Decision | Rationale | Consequence |
| --- | --- | --- | --- |
| 2026-08-27 | Name the product Pheet, pronounced *fit* | Distinctive expression of contextual fit | Teach pronunciation once in launch copy and README |
| 2026-08-27 | Define Pheet as an evidence-led capability-alignment workspace | Keeps the product focused on reviewable work rather than prediction | Evidence map and interview brief are the core outputs |
| 2026-08-27 | Make the hiring manager the primary MVP user | This user must interpret functional capability and conduct the interview | Optimize the workspace for evidence investigation, not candidate marketing |
| 2026-08-27 | Treat fit as contextual | Capability fit changes with a project, skill set, team, or environment | Lenses are replaceable and separate from portfolio evidence |
| 2026-08-27 | Prohibit scoring, ranking, and hire/reject recommendations | Such outputs create false precision and employment risk | Domain types, UI, and tools contain no overall score or recommendation |
| 2026-08-27 | Build a real front-end product | Users need to inspect sources and control the workspace | WebMCP augments rather than replaces the human experience |
| 2026-08-27 | Use one shared action layer | Prevents behavioral drift between buttons and agent tools | React UI and WebMCP handlers remain adapters over domain actions |
| 2026-08-27 | Normalize evidence before applying a lens | The same portfolio should support different questions | Evidence graph remains stable when lenses change |
| 2026-08-27 | Build the prepared demonstration before crawling | External retrieval and extraction can fail | The judged core journey is deterministic |
| 2026-08-27 | Use Next.js, TypeScript, React, Zod, and Netlify | Supports the App Router, public deployment, and rapid iteration | Architecture stays monolithic for MVP |
| 2026-08-27 | Use clean in-memory state for the deterministic slice | The first journey should be reproducible and retain no candidate data | Refresh resets the workspace; all persistence is deferred |
| 2026-08-27 | Stage WebMCP tools by application state | Reduces ambiguity and invalid call order | Tools available after analysis differ from initial tools |
| 2026-08-27 | Treat all portfolio material as untrusted | Public pages may contain malicious or irrelevant instructions | Tool annotations, bounded outputs, and injection evals are required |
| 2026-08-27 | Make uncertainty a first-class output | Portfolios are incomplete and ownership is often ambiguous | Gaps lead to interview questions rather than negative judgments |

## Working assumptions

| Assumption | Reasonable default | Revisit trigger |
| --- | --- | --- |
| Demonstration portfolio | Fictional, realistic three-project portfolio | User provides an owned public portfolio and explicitly chooses it |
| Demonstration lens | Context understanding, technical depth, cross-functional execution | Final video narrative requires a different lens |
| Import provider | Firecrawl for controlled retrieval | Reliability, price, or platform constraints make another retriever preferable |
| Structured extraction | Provider-neutral server adapter | A chosen model and API are configured |
| MVP persistence | None; clean refresh | Authentication or collaboration enters scope |
| Tool count | Six core tools | Evals show a combined or split tool is materially clearer |

## Open decisions

These do not block the first vertical slice.

| Decision | Recommendation | Needed by |
| --- | --- | --- |
| Ship live URL import in judged build? | Ship only if reliable by Aug 31; otherwise disable and keep as documented next layer | Release hardening |
| Final visual identity | Use the current restrained evidence-workspace direction; defer full brand system | UI polish |
| Model-backed extraction provider | Choose after deterministic analysis works and credentials are available | Import milestone |
| Post-MVP buyer | Validate individual hiring manager versus hiring-team workspace | After challenge |
| Candidate correction model | Design before any durable real-candidate storage | Persistent product phase |

## Rejected or superseded directions

- Universal job-match score.
- “Best candidate” ranking.
- Automated hire or reject recommendation.
- Portfolio crawling as the primary product.
- Backend-only agent service without a human workspace.
- Built-in chat as the primary interface.
- Authentication and multi-tenant infrastructure in the challenge MVP.

## Decision protocol

When a new decision changes product invariants, domain objects, tool behavior,
trust posture, or MVP scope:

1. Update this log.
2. Reconcile `PRODUCT.md` and `ARCHITECTURE.md`.
3. Update `AGENTS.md` only if the decision creates a durable agent rule.
4. Add or change acceptance tests before declaring implementation complete.
