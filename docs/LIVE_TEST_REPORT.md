# Live production test report

Date: 2026-08-27

Origin: `https://aquamarine-cheesecake-c3d5fc.netlify.app/`

Netlify deploy: `6a9086e464438c0008dc4caf`

Git commit: `5cb3c5ee4713756336b90e54e25ae2754c727577`

## Deployment

- PASS: Netlify’s Git build produced and published the deterministic static
  Next.js export from `netlify.toml`.
- PASS: `/` returns HTTP 200 and the Pheet document.
- PASS: Netlify serves the Next.js static route and image assets.
- PASS: HTTPS includes HSTS and `X-Content-Type-Options: nosniff`.
- PASS: Both Playwright production journeys passed against the public origin.

## TC-LIVE-001 — Manual production journey

Verdict: PASS

- Start screen and visible loading state rendered.
- Prepared lens contained three capabilities.
- Analysis produced nine findings across all four evidence states.
- Context Atlas source inspection showed its source title, locator, observation,
  and interpretation.
- Uncertainty filter changed nine cards to five and restored the unchanged nine.
- Three questions referenced valid gap IDs; accepting a question updated its
  state.
- Refresh restored a clean workspace.
- No console warnings, errors, failed images, or failed resources were observed.

## TC-LIVE-002 — Codex in-app browser WebMCP

Verdict: PARTIAL — browser capability limitation

- Pheet loaded and presented its intentional manual fallback.
- The browser did not expose `document.modelContext` or `registerTool`.
- Native tools and registration transitions could not be tested.
- No registration-related console warning or error occurred.

## TC-LIVE-003 — Chrome WebMCP

Verdict: SKIP — Chrome connection unavailable

Chrome was installed but the ChatGPT/Codex browser extension bridge was not
available, so the test could not open a Chrome session. No fallback was used.

A repeat diagnostic on 2026-08-27 confirmed Chrome 152 was running, but the
required `com.openai.codexextension` native-host manifest was absent. The
extension-profile check was also denied by macOS permissions. This remains an
environment setup blocker rather than an application failure.

To complete this gate:

1. Test the production origin in ChatGPT desktop’s built-in browser with site
   tools enabled; or install the ChatGPT browser extension under
   **Settings → Computer use**.
2. For Chrome testing, enable `chrome://flags/#enable-webmcp-testing` and
   restart Chrome.
3. Execute the staged tool sequence in `docs/EVALUATION.md` and record the
   available tools at each phase.
