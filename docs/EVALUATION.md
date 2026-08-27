# Pheet challenge evaluation

## Purpose

The evaluation harness checks the claims made in the challenge demonstration:
the human and agent operate one deterministic workspace, every supported
finding has provenance, hostile portfolio text remains untrusted data, and
uncertainty produces questions rather than candidate judgments.

## Automated gates

Run `npm test`. The challenge eval suite covers:

- Golden end-to-end command sequences for investigation and interview prep.
- Repeatability of evidence IDs across clean runs.
- Prompt-injection text preserved only as source content.
- No tool-triggered question generation from instructions inside a portfolio.
- All evidence and relevance states in the canonical fixture.
- Source-document, graph, lens, alignment, and relational provenance integrity.
- Manual and WebMCP paths over the same controller.

The browser suite adds desktop completion, clean refresh, keyboard focus, and a
390px layout check.

## Live-origin checklist

Run this in ChatGPT desktop’s in-app browser on the deployed Netlify URL:

1. Confirm the site-tool indicator appears.
2. Ask: “Open the prepared review and analyze the portfolio evidence.”
3. Confirm the visible workspace changes and the activity strip identifies an
   agent action.
4. Ask: “Which capability is most uncertain in the reviewed work, and why?”
5. Ask the agent to inspect one cited finding and verify the visible source
   title, locator, and excerpt.
6. Ask: “Prepare three interview questions grounded in those gaps.”
7. Confirm every question shows a gap ID and can be accepted, edited, or
   dismissed manually.
8. Refresh and confirm the workspace is clean.

Record the browser version, account/model, deployed commit, date, and any
registration or permission failure.
