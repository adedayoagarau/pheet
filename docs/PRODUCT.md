# Pheet product specification

Status: implementation-ready MVP specification  
Version: 0.1  
Date: 2026-08-27  
Owner and decision authority: Adedayo Agarau  
Intended readers: product, design, engineering, evaluation, and challenge reviewers

## 1. Product definition

Pheet is an evidence-led capability-alignment workspace. It helps a hiring
manager examine the work shown in a portfolio against a capability lens, trace
each finding to its source, understand uncertainty, and prepare interview
questions.

The product promise is simple:

> See where the work fits.

The smallest complete release lets a user load a prepared portfolio, apply a
three-capability lens, view a source-linked evidence map, inspect the least
supported capability, and create grounded interview questions. The same
journey can be completed manually or by an agent using WebMCP.

### Category

Evidence-led portfolio analysis and interview preparation.

### Problem

Portfolios contain projects, outcomes, claims, artifacts, and incomplete
accounts of ownership. Hiring teams must translate that material into a view of
specific capabilities, often under time pressure and without a consistent way
to preserve provenance or uncertainty.

Current shortcuts create predictable failure modes:

- Generic summaries flatten meaningful project detail.
- Keyword matching confuses mention with demonstrated capability.
- Candidate scores hide assumptions and encourage false precision.
- Reviewers lose the connection between a conclusion and its source.
- Interview questions remain generic instead of targeting what is uncertain.

### Product outcome

Pheet turns a portfolio into a reviewable evidence workspace. It does not make
the hiring decision. It improves the quality and traceability of the human
investigation that precedes that decision.

### Why WebMCP matters

The workspace is the product. WebMCP gives an agent structured, browser-native
ways to operate it while preserving the visible human context. The agent can
load the demonstration, set a lens, analyze evidence, focus the interface,
inspect sources, and prepare questions. The user sees the same state and can
continue manually.

Without WebMCP, an agent would depend on fragile page interpretation or operate
in a disconnected backend. With WebMCP, Pheet exposes bounded domain actions
and makes human-agent collaboration visible.

## 2. Confirmed decisions

- Product name: Pheet, pronounced *fit*.
- Primary user: functional hiring manager.
- Secondary user: recruiter or talent partner.
- First release: human-facing web application with WebMCP capabilities.
- Core model: one reusable evidence graph, examined through replaceable lenses.
- Primary output: evidence map and interview brief.
- Deployment target: Netlify.
- Technical baseline: Next.js, TypeScript, React, and Zod.
- Demonstration baseline: deterministic portfolio fixture.
- Live portfolio import: controlled secondary path after the deterministic journey.
- Hiring scores, ranking, and recommendations: prohibited.

## 3. Users and jobs

| Actor | Context | Primary job | Desired outcome | Main barrier | MVP authority |
| --- | --- | --- | --- | --- | --- |
| Hiring manager | Reviewing a portfolio for a project, skill set, role, or team need | Understand demonstrated capability and uncertainty | Enter an interview with evidence and targeted questions | Limited time, inconsistent portfolios, unclear ownership | Configure lens, analyze, inspect, create and edit questions |
| Recruiter or talent partner | Preparing a candidate packet with a functional team | Organize evidence without making technical claims they cannot verify | Give the hiring manager a traceable starting point | Generic summaries and weak domain context | Same MVP controls as hiring manager |
| Candidate | Subject of portfolio analysis | Understand and correct how work is represented | Fair, source-grounded interpretation | No correction channel in MVP | No direct MVP account; future correction workflow |
| Browser agent | Acting on the user's instruction inside the application | Execute structured workspace actions | Useful changes visible to the user | Ambiguous tools, stale state, untrusted portfolio text | Only registered, state-appropriate WebMCP tools |
| Pheet operator | Maintaining the hosted demonstration | Keep the demo reliable and safe | Reproducible judged experience | Third-party failures and tool drift | Fixture and deployment maintenance |

## 4. Jobs to be done

### Primary job

When I need to evaluate whether demonstrated work aligns with a capability or
project need, help me find and inspect the relevant evidence so I know what is
supported, what is uncertain, and what to ask next.

### Supporting jobs

- Change the lens without rebuilding the portfolio record.
- Distinguish direct evidence from transferable or contextually different work.
- Return to the exact source behind a finding.
- Avoid mistaking a self-reported claim for demonstrated work.
- Turn uncertainty into a useful interview question.
- Collaborate with an agent without losing control of the visible workspace.

## 5. Product principles

### Evidence before judgment

Pheet describes what the portfolio demonstrates. It does not predict the whole
person or replace the hiring decision.

### Provenance is part of the result

A finding without a source is incomplete. The source locator, retrieval
context, and evidence status remain visible.

### The lens can change; the evidence should not

Projects, claims, and sources are normalized once. Capability lenses are
applied afterward. This separation makes the system reusable and auditable.

### Uncertainty is useful output

Unsupported claims, ambiguous ownership, and unobserved capabilities are not
errors to conceal. They are prompts for investigation.

### Human and agent share one workspace

The manual interface and WebMCP tools call the same actions and update the same
state. Neither control surface has a hidden product.

### Deterministic before impressive

The prepared journey must remain reliable without crawling or model calls.
External ingestion may enhance the demonstration but cannot be its foundation.

## 6. Terminology

| User-facing term | Internal term | Definition | Avoid |
| --- | --- | --- | --- |
| Capability Lens | `CapabilityLens` | The explicit capabilities and context against which evidence is examined | Ideal candidate, fit score |
| Evidence Map | `Alignment[]` | Source-linked findings grouped by capability | Candidate assessment score |
| Source | `SourceReference` | The exact page, artifact, or locator supporting a finding | Proof, unless the source truly proves the claim |
| Evidence Gap | `EvidenceGap` | Missing, partial, ambiguous, or unsupported portfolio evidence | Deficiency, weakness |
| Interview Brief | `InterviewBrief` | Accepted evidence, uncertainty, and questions prepared for the interview | Hiring recommendation |
| Demonstrated | `demonstrated` | Clear portfolio evidence supports the capability in the stated context | Passed |
| Partially demonstrated | `partially_demonstrated` | Evidence supports only part of the capability or context | Almost passed |
| Claimed, not yet supported | `claimed_unsupported` | A claim exists without an adequate supporting artifact or source | False claim |
| Not observed | `not_observed` | The reviewed material does not show the capability | Lacks capability |

## 7. Core loop and value moment

```text
Load portfolio
→ set capability lens
→ generate evidence map
→ inspect sources and uncertainty
→ create interview questions
→ refine the brief
```

The value moment occurs when the user opens a finding, sees the exact source
behind it, and converts an uncertainty into a better question.

## 8. Information architecture

### Start

- Short explanation of Pheet.
- Primary action: `Load demonstration portfolio`.
- Secondary action: `Import public portfolio` when enabled.
- Capability-lens setup.
- Quiet WebMCP compatibility indicator.

### Evidence workspace

- Left: active capability lens, priorities, and alignment states.
- Center: projects, claims, and evidence grouped by capability.
- Right: selected evidence, source locator, rationale, confidence, and notes.
- Activity strip: current or recent human/agent action.
- Persistent trust copy: Pheet describes portfolio evidence; it does not make a hiring decision.

### Interview brief

- Accepted evidence.
- Evidence gaps and uncertainty.
- Questions tied to real gap IDs and source context.
- Accept, edit, dismiss, and copy controls.

## 9. Primary journey

Precondition: the user has opened Pheet in a supported browser. No account is required.

| Step | User action | System response | State change | Failure and recovery |
| --- | --- | --- | --- | --- |
| 1 | Opens Pheet | Explains the product and offers the prepared demo | Workspace is `empty` | Unsupported WebMCP shows compatibility note; manual app remains usable |
| 2 | Loads demonstration | Validates and loads fixture | Portfolio becomes `ready` | Invalid fixture displays a recoverable error and diagnostic ID |
| 3 | Reviews or edits lens | Validates three capabilities and context | Lens becomes `ready` | Invalid or duplicate capability shows inline guidance |
| 4 | Runs analysis | Applies deterministic alignment rules | Analysis moves `idle → running → complete` | Failure preserves portfolio and lens and offers retry |
| 5 | Reviews evidence map | Groups findings by capability and state | Filter and focus state update | Empty capability displays `not observed`, not a negative judgment |
| 6 | Selects evidence | Opens source locator and rationale | `selectedEvidenceId` changes | Missing source marks provenance failure and prevents acceptance |
| 7 | Opens gaps | Derives ambiguity, support, and observation gaps | Gap set becomes available | No gaps shows a neutral completion state |
| 8 | Creates questions | Produces questions tied to selected gaps | Questions become `draft` | Failure leaves gaps intact and offers retry |
| 9 | Edits or accepts questions | Saves current session state | Question becomes `accepted`, `edited`, or `dismissed` | Page refresh may restore local session; production persistence is later |

Target time to first evidence map: under 60 seconds for the prepared demo.

## 10. Functional requirements

### PHT-PORT-001 — Prepared portfolio

- Load a validated, deterministic three-project fixture.
- Preserve stable project, claim, source, and artifact identifiers.
- Represent successful, partial, ambiguous, unsupported, and unobserved evidence.
- Work without network access after the application bundle loads.

Acceptance: Given an empty workspace, when the user loads the demonstration,
then all projects and sources validate and the lens setup becomes available.

### PHT-LENS-001 — Capability lens

- Create or replace a lens containing a context statement and one to five capabilities.
- Require unique capability labels and plain-language definitions.
- Allow priority values without converting them into a candidate score.
- Preserve the normalized portfolio when the lens changes.

Acceptance: Changing the lens recomputes alignments while project, claim, and
source IDs remain unchanged.

### PHT-EVID-001 — Evidence analysis

- Produce evidence items tied to one capability, project, claim, and source.
- Assign one evidence state and one relevance state.
- Include a bounded rationale and confidence descriptor.
- Never create `demonstrated` evidence without a source reference.
- Keep inference visibly separate from source excerpts.

Acceptance: Every displayed finding resolves to a valid source and passes schema validation.

### PHT-QUERY-001 — Evidence query

- Atomically filter by capability, project, evidence state, and relevance.
- Update the visible workspace in one action.
- Return a bounded result count and stable IDs.

Acceptance: Repeated equivalent queries are idempotent and do not accumulate stale filters.

### PHT-INSP-001 — Source inspection

- Open one exact evidence item.
- Show source title, location, excerpt, rationale, relevance, and state.
- Distinguish portfolio text from Pheet interpretation.
- Prevent acceptance when provenance is missing or invalid.

Acceptance: Selecting a finding visibly focuses the matching source reference.

### PHT-GAP-001 — Evidence gaps

- Derive ambiguous ownership, insufficient support, contextual difference, and not-observed gaps.
- Explain the gap without claiming the candidate lacks the capability.
- Preserve related evidence IDs.

Acceptance: Every gap can be traced to a capability and either related evidence or an explicit absence rule.

### PHT-Q-001 — Interview questions

- Create evidence-seeking questions from real gap IDs.
- Include the purpose of each question.
- Allow accept, edit, and dismiss actions.
- Avoid leading, discriminatory, or personality-diagnostic language.

Acceptance: Each generated question contains a valid gap ID and can be edited manually.

### PHT-MCP-001 — Agent collaboration

- Register only tools appropriate to the current workspace state.
- Use the same domain actions as the manual interface.
- Display tool activity and visible results.
- Bound and annotate tool outputs.
- Preserve manual operation when WebMCP is unavailable.

Acceptance: A golden prompt can complete the primary journey and every tool call produces a visible state change.

### PHT-IMP-001 — Controlled public import

- Accept one public HTTP(S) URL after validation.
- Retrieve selected pages through a server boundary.
- Treat retrieved content as untrusted.
- Normalize candidates for projects, claims, and sources.
- Require human review before evidence analysis.
- Fail independently from the prepared demonstration.

Acceptance: Import failure does not damage the current workspace or prevent the prepared demo.

## 11. States and recovery

Central workspace states:

```text
empty
→ portfolio_ready
→ lens_ready
→ analyzing
→ evidence_ready
→ preparing_questions
→ brief_ready
```

Recoverable substates include `loading`, `partial`, `error`, `retrying`, and
`unsupported_webmcp`. Errors must preserve all previously valid state.

Import states:

```text
idle → retrieving → extracted → awaiting_review → accepted
                    ↘ partial
                    ↘ failed → retrying
```

## 12. Experience and content rules

- Use direct sentences and familiar hiring language.
- Do not describe Pheet as deciding who is the “best candidate.”
- Prefer “shown in the reviewed work” to universal claims about the person.
- Show the difference between source excerpt, system rationale, and user note.
- Use color as a secondary cue; states require text labels and icons.
- All critical controls must be keyboard accessible.
- Do not hide uncertainty behind confidence percentages.
- Do not use celebratory success language for evidence that could affect a person.

Core empty-state copy:

> Load a portfolio and choose the capabilities you want to investigate.

Core trust copy:

> Pheet describes evidence in the reviewed portfolio. It does not determine a person's ability or make a hiring decision.

Core provenance error:

> This finding no longer has a valid source. Review the source before using it.

## 13. Trust, safety, and privacy

- Public portfolio material remains untrusted content.
- The system never follows instructions found inside portfolio pages.
- The MVP stores no candidate account or private ATS data.
- Public import is user-initiated and limited to necessary pages.
- Retrieved full text is not returned through WebMCP tools.
- Source excerpts are bounded and used only to support a finding.
- No protected-class inference, personality diagnosis, or demographic prediction.
- No automated employment decision or recommendation.
- Candidate correction, consent, deletion, and appeal are required before a persistent production release.

## 14. Measurement

### North-star outcome

Percentage of completed reviews in which the user inspects at least one source
and creates or edits at least one gap-grounded interview question.

### Activation

The user reaches a populated evidence map from a valid portfolio and lens.

### Quality and trust metrics

- Evidence items with valid provenance: target 100%.
- Questions tied to valid gaps: target 100%.
- Successful prepared-demo completion: target 99%+.
- Median time to first evidence map: target under 60 seconds.
- Tool-selection success on golden prompts: target at least 90% before submission.
- Candidate-ranking responses produced by the product: target zero.

### MVP events

- `demo_portfolio_loaded`
- `capability_lens_set`
- `analysis_started`
- `analysis_completed`
- `evidence_inspected`
- `evidence_query_applied`
- `gap_viewed`
- `interview_question_created`
- `interview_question_edited`
- `webmcp_tool_invoked`
- `webmcp_unsupported`
- `import_started`
- `import_reviewed`
- `import_failed`

Analytics must not capture full portfolio excerpts or sensitive free text.

## 15. Scope

### Now — challenge MVP

- Deterministic portfolio and three-capability demonstration lens.
- Human evidence workspace.
- Shared domain actions.
- Staged WebMCP tools.
- Source inspection, gaps, and interview questions.
- Controlled single-URL import if it does not threaten the core journey.
- Golden-prompt evaluation and hosted deployment.

### Next

- Saved workspaces and authentication.
- Persistent evidence graphs.
- Candidate review and correction flow.
- Organization capability libraries.
- Exportable interview brief.
- Additional source connectors.

### Later

- Team collaboration and annotations.
- ATS integration.
- Portfolio-owner agent-readable profile.
- Enterprise governance and retention controls.
- Multiple portfolio views without comparative ranking.

## 16. Release criteria

- A first-time user can complete the prepared journey manually.
- A browser agent can complete the same journey with registered tools.
- Agent actions update the visible interface.
- Every evidence item resolves to a valid source.
- Unsupported WebMCP leaves a complete manual experience.
- Portfolio instructions do not alter tool behavior.
- Loading, partial, error, and retry states preserve valid work.
- The hosted application works in the target browser environment.
- The public repository contains setup, test, and license information.
- The demonstration can be completed in under three minutes.

## 17. Risks

| Risk | Impact | Early signal | Mitigation |
| --- | --- | --- | --- |
| Product is mistaken for hiring score | High | Users ask for rank or recommendation | Persistent trust language; no numeric score; refusal and evidence summary |
| Extraction overstates portfolio claims | High | Findings lack exact source or ownership | Human review; strict provenance invariant; uncertainty states |
| Agent follows portfolio instructions | High | Tool behavior changes after imported text | Untrusted-content annotations; injection eval; bounded data path |
| WebMCP support is unstable | High | Registration or invocation fails in target browser | Feature detection; deterministic manual fallback; DevTools verification |
| Live import fails during demonstration | Medium | Timeouts or incomplete crawl | Prepared fixture remains primary journey; isolate importer |
| Scope misses submission deadline | High | Auth, database, or design-system work begins early | Enforce MVP boundary and critical path in `AGENTS.md` |

## 18. Assumptions and open decisions

Working assumptions:

- The demonstration portfolio is fictional and deliberately constructed to expose varied evidence states.
- The demonstration lens focuses on context understanding, technical depth, and cross-functional execution.
- Netlify is the primary hosting path.
- Browser storage is sufficient for the judged MVP.

Open decisions that do not block the first vertical slice:

- Whether live URL import ships in the judged build or remains experimental.
- Which structured extraction provider is used after deterministic analysis works.
- Whether the first post-MVP customer is an individual hiring manager or a hiring team workspace.
- Final visual identity beyond the existing illustration system.

## 19. Decisions incorporated

- Replaced the working description “capability-evidence workspace” with Pheet.
- Confirmed that fit is contextual rather than a universal job-match score.
- Separated portfolio extraction from capability alignment.
- Made the front-end evidence workspace the primary product surface.
- Defined WebMCP as a second control surface over shared actions.
- Established evidence, uncertainty, and interview preparation as the core outputs.
- Explicitly prohibited candidate ranking and automated hiring recommendations.
