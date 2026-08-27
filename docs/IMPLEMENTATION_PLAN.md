# Pheet implementation plan

Status: ready to execute  
Date: 2026-08-27  
Target: WebMCP Challenge submission by 2026-09-03, 1:00 PM Pacific

## 1. Release objective

Deliver a hosted, public, WebMCP-enabled Pheet application that completes one
credible journey:

1. Load a prepared portfolio.
2. Apply a three-capability lens.
3. Analyze source-linked evidence.
4. Inspect the least supported capability.
5. Create three interview questions tied to real gaps.

The complete journey must work manually and through WebMCP. Live URL import is
valuable but cannot block or destabilize this journey.

## 2. Critical path

```text
Repository scaffold
→ schemas and fixture
→ shared actions
→ human workspace
→ WebMCP tools
→ evaluations
→ hosted release
```

Controlled public import branches from the working human workspace and rejoins
before final evaluation only if it meets reliability criteria.

## 3. Ownership

| Area | Primary owner | Decision authority |
| --- | --- | --- |
| Product definition, name, content, demonstration narrative | Adedayo Agarau | Adedayo Agarau |
| Architecture, implementation, tests, documentation | Codex with user review | Adedayo Agarau |
| Capability lens and prepared portfolio content | Adedayo Agarau with Codex drafting | Adedayo Agarau |
| Challenge submission and final video | Adedayo Agarau | Adedayo Agarau |

## 4. Schedule

| Date | Milestone | Verifiable output |
| --- | --- | --- |
| Aug 27 | Foundation | Next.js application runs, tests run, Netlify preview exists |
| Aug 28 | Evidence domain | Schemas, deterministic fixture, and shared actions pass tests |
| Aug 29 | Human workspace | Full prepared journey works without an agent |
| Aug 30 | WebMCP | Agent operates the same visible workspace through bounded tools |
| Aug 31 | Import and trust | Controlled import works or is deliberately cut; safety and provenance tests pass |
| Sep 1 | Evaluation and polish | Golden prompts, browser tests, accessibility, and demo timing pass |
| Sep 2 | Submission package | Public app, repo, README, screenshots, description, and video are ready |
| Sep 3 | Buffer | Final verification and submission before deadline |

## 5. Milestones

### M0 — Handoff and repository foundation

Deliverables:

- Durable product and architecture documentation.
- Root `AGENTS.md`.
- MIT license.
- Next.js and TypeScript scaffold.
- Zod, test runner, lint, formatting, and type-check commands.
- Initial Netlify project and preview deployment.
- CI workflow if setup time remains proportional.

Acceptance:

- A new contributor can install and run the repository from `README.md`.
- `lint`, `typecheck`, and `test` scripts pass.
- A static shell deploys successfully.

Exit decision:

- Do not proceed with product UI if repository checks are unreliable.

### M1 — Evidence domain and deterministic fixture

Deliverables:

- Zod schemas for every canonical object.
- Stable ID conventions.
- Workspace reducer/store and explicit domain errors.
- Prepared three-project portfolio.
- Demonstration capability lens.
- Deterministic evidence, gap, and question actions.
- Unit tests for invariants and state transitions.

The fixture must include:

- At least two strong direct evidence items.
- One partially demonstrated capability.
- One transferable but contextually different item.
- One claim without adequate artifact support.
- One not-observed result.
- One ambiguous ownership claim.
- Valid source locators for every supported finding.

Acceptance:

- Fixture validates at build and test time.
- Every supported finding resolves to a source.
- Changing the capability lens does not mutate portfolio data.
- No domain type supports rank, score, hire, or reject output.

### M2 — Human evidence workspace

Deliverables:

- Start screen.
- Capability-lens builder.
- Three-column evidence workspace.
- Source inspector.
- Gap and interview-preparation panel.
- Activity strip.
- Browser-session restoration.
- Responsive and keyboard-operable behavior.

States required:

- Empty.
- Loading.
- Populated.
- Partial evidence.
- Analysis error with retry.
- Invalid source.
- WebMCP unsupported.
- Questions ready.

Acceptance:

- A first-time user completes the journey without agent assistance.
- The evidence map appears in under 60 seconds on the prepared fixture.
- The selected evidence and source remain synchronized.
- Refresh restores a valid current session or safely starts clean.

### M3 — WebMCP collaboration

Deliverables:

- Feature detection and compatibility state.
- One lifecycle-managed registration module.
- Staged tool availability.
- Six core tools:
  - `load_demo_portfolio`
  - `set_capability_lens`
  - `analyze_portfolio_evidence`
  - `query_evidence`
  - `inspect_evidence`
  - `create_interview_questions`
- Compact tool outputs and annotations.
- Visible invocation and resulting UI change.
- Tool contract and registration tests.

Acceptance:

- Manual and tool paths call the same domain actions.
- The agent cannot inspect evidence before analysis exists.
- Equivalent queries are idempotent.
- Unsupported browsers retain the full manual flow.
- Portfolio-derived output is marked untrusted and bounded.

### M4 — Controlled URL import

Deliverables:

- URL entry and validation.
- Server-side retrieval boundary.
- Page and extraction limits.
- Structured portfolio-candidate schema.
- Human review before acceptance.
- Import progress, partial, failure, and retry states.

Acceptance:

- One approved public portfolio produces reviewable candidate projects and sources.
- Private-network and unsafe URLs are rejected.
- Imported text cannot alter application or agent instructions.
- Import failure leaves the prepared workspace unchanged.

Cut rule:

If controlled import is not reliable by Aug 31, disable it in production and
describe it as the next layer. Do not compromise the prepared demonstration.

### M5 — Evaluation and release hardening

Deliverables:

- Golden-prompt dataset.
- Deterministic tool tests.
- Tool-selection evaluation.
- Full journey tests.
- Ranking-refusal evaluation.
- Prompt-injection evaluation.
- Chrome DevTools inspection record.
- Accessibility and responsive pass.
- Performance and error-state pass.

Acceptance:

- Prepared journey success: 99%+ in deterministic test runs.
- Evidence with valid provenance: 100%.
- Questions tied to valid gaps: 100%.
- Golden prompt expected-tool success: at least 90%.
- Ranking or hire recommendation output: zero.
- Demonstration completes in under three minutes.

### M6 — Submission

Deliverables:

- Production URL.
- Public GitHub repository and visible license.
- Complete README and testing instructions.
- WebMCP implementation explanation.
- Project description.
- Screenshots.
- Public video with audio, under three minutes.
- Final challenge form.

Suggested video sequence:

1. State the hiring-review problem.
2. Load the prepared portfolio.
3. Ask the browser agent to apply the capability lens.
4. Show WebMCP tool activity and visible evidence map.
5. Ask for the least supported capability.
6. Inspect the source and uncertainty.
7. Create interview questions.
8. Close on evidence, not ranking.

## 6. Workstream dependencies

| Capability | Dependency | Exit criterion |
| --- | --- | --- |
| UI shell | Repository scaffold | Responsive application frame renders |
| Evidence map | Schemas, fixture, shared actions | All states render from validated data |
| Source inspector | Source references and selection action | Exact source opens for every supported item |
| Interview brief | Gaps and question actions | Questions preserve valid gap IDs |
| WebMCP | Shared actions and stable UI state | Tools update the same workspace |
| Import | Server boundary and portfolio schema | Reviewed candidate graph validates |
| Evals | Stable tool contracts and fixture | Golden prompts have expected calls and results |

## 7. Scope controls

Do not add during the challenge MVP:

- Authentication.
- Database migration work.
- Candidate comparison.
- Numeric scoring.
- Team roles.
- Billing.
- ATS or HRIS integrations.
- General-purpose portfolio crawling.
- A built-in chatbot.
- A large design system unrelated to the core journey.

If a proposed task does not improve the primary demonstration, trust, or
release reliability, place it in `docs/DECISIONS.md` as a later option.

## 8. Verification checklist

### Product

- [ ] Product copy explains evidence rather than evaluation of the whole person.
- [ ] The lens can be changed without changing the evidence graph.
- [ ] Every supported finding links to a source.
- [ ] Uncertainty produces an actionable question.
- [ ] No score, ranking, or hiring recommendation appears.

### Human experience

- [ ] Core journey works without WebMCP.
- [ ] Loading, partial, error, and retry states are usable.
- [ ] Keyboard navigation reaches every critical control.
- [ ] Mobile layout remains readable even if optimized for desktop review.

### WebMCP

- [ ] Tools are staged by workspace state.
- [ ] Tool schemas validate at registration and execution.
- [ ] Read operations use correct annotations.
- [ ] Portfolio-derived content is treated as untrusted.
- [ ] Tool outputs are bounded.
- [ ] Tool activity and UI effects are visible.

### Release

- [ ] Production deployment is reachable.
- [ ] Fresh setup instructions work.
- [ ] Tests pass from a clean checkout.
- [ ] Demo works in the target browser.
- [ ] Public license is visible.
- [ ] Video is public, audible, and below three minutes.

## 9. Rollback

- Keep the prepared portfolio and deterministic analysis behind a stable route.
- Gate public import independently so it can be disabled without redeploying the core experience.
- Preserve the last known production deployment.
- Do not migrate persistent user data during the MVP.
- If WebMCP registration fails, fall back to the manual interface and show a quiet compatibility message.

## 10. First action

Execute `docs/FIRST_CODEX_TASK.md`. Do not begin live import until its acceptance
criteria are satisfied.
