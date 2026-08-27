# Netlify deployment

Pheet’s deterministic first slice deploys as a static Next.js App Router export.
The current application has no server routes, authentication, persistence, or
runtime import service, so a server adapter would add failure modes without
adding product capability.

## Repository deployment

Connect `adedayoagarau/pheet` to the Netlify site and use:

- Production branch: `main`
- Base directory: repository root
- Build command: `npm run build`
- Publish directory: `out`
- Node.js: `22`

These values are committed in `netlify.toml`; site-level overrides should be
cleared unless they intentionally differ.

`next.config.ts` declares `output: "export"`, making local CLI deploys and Git
continuous deployment publish the same deterministic artifact without a
runtime adapter.

When a later milestone introduces server-backed URL retrieval, authentication,
or persistence, remove the static export, leave the publish directory unset,
and adopt Netlify’s supported Next.js runtime as an explicit architecture
migration. Do not mix that migration into the client-only slice.

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
`docs/EVALUATION.md`. Chrome testing can use its WebMCP testing flag; the static
deployment does not inject an origin-trial token at request time.
