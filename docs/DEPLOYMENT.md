# Netlify deployment

Pheet deploys as a Next.js App Router application through Netlify’s automatic
OpenNext adapter.

## Repository deployment

Connect `adedayoagarau/pheet` to the Netlify site and use:

- Production branch: `main`
- Base directory: repository root
- Build command: `npm run build`
- Publish directory: leave unset so Netlify’s OpenNext adapter owns the output
- Node.js: `22`

These values are committed in `netlify.toml`; site-level overrides should be
cleared unless they intentionally differ.

Every push to `main` should produce a production deploy. Pull requests may use
Netlify deploy previews.

## Live verification

```bash
curl --fail --show-error --location \
  https://aquamarine-cheesecake-c3d5fc.netlify.app/

PHEET_BASE_URL=https://aquamarine-cheesecake-c3d5fc.netlify.app \
  npm run test:browser
```

The first command must return the Pheet document rather than Netlify’s generic
404 page. The second runs the complete browser journey against production.

For WebMCP, open the same URL in ChatGPT desktop’s in-app browser and follow
`docs/EVALUATION.md`.
