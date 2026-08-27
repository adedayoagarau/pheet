# WebMCP Challenge submission package

## One-line pitch

Pheet lets a hiring manager and an AI agent investigate the same portfolio
evidence, trace every finding to its source, and turn uncertainty into better
interview questions—without scoring the person.

## Why WebMCP

Portfolio review is investigative: a person needs judgment and context while an
agent can rapidly filter evidence, follow provenance, and prepare structured
questions. WebMCP lets both participants share the live page, state, and action
history instead of moving sensitive evidence into a separate chatbot or hiding
agent work from the reviewer.

## Judge path

1. Open the Netlify URL in ChatGPT desktop’s in-app browser.
2. Ask: “Start the Pheet demo review and analyze the portfolio.”
3. Ask: “Show me the weakest-supported capability and inspect the source behind
   one related finding.”
4. Ask: “Prepare three grounded interview questions for the remaining gaps.”
5. Accept one question manually to demonstrate human control of agent-created
   work.

## Three-minute video outline

- **0:00–0:20 — Problem:** portfolios contain useful evidence but are incomplete,
  hard to compare with a focused need, and easy to over-interpret.
- **0:20–0:45 — Product:** introduce the prepared review, capability lens, and
  evidence-not-verdict principle.
- **0:45–1:35 — Agent collaboration:** use ChatGPT site tools to start and analyze
  the review, then show the visible agent activity and capability groups.
- **1:35–2:05 — Trust:** inspect a finding, exact source section, observation,
  interpretation, relevance, and classification confidence.
- **2:05–2:35 — Result:** identify uncertainty and prepare three gap-grounded
  questions; accept or edit one manually.
- **2:35–2:55 — Implementation:** six staged tools, shared serialized commands,
  Zod validation, bounded untrusted outputs, deterministic offline fixture.
- **2:55–3:00 — Close:** “See where the work fits—evidence, not a verdict.”

## Judging-criteria mapping

- **WebMCP leverage:** six staged, state-aware tools; shared visible state;
  lifecycle cleanup; runtime schemas; bounded untrusted output.
- **Execution:** complete responsive manual and agent journeys with automated
  unit, integration, evaluation, production-build, and browser checks.
- **Potential impact:** reduces portfolio-review overhead while improving source
  accountability and interview preparation for hiring managers.
- **Creativity and ambition:** treats uncertainty—not prediction or scoring—as a
  collaborative product output.

## Submission assets still required

### Complete

- Public Netlify URL:
  `https://aquamarine-cheesecake-c3d5fc.netlify.app/`
- Public GitHub repository: `https://github.com/adedayoagarau/pheet`
- Visible MIT license.
- Deterministic manual production journey and responsive browser checks.
- Automated WebMCP contract, lifecycle, grounding, provenance, and adversarial
  evaluation coverage.

### Remaining

- Native live-origin WebMCP run in a host exposing `document.modelContext`.
- Public YouTube demo under three minutes with audio.
- Final Devpost screenshots and concise submission description.
