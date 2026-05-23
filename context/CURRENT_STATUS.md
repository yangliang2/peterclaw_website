# Current Status

## 2026-05-23

- Phase 3 deployment pipeline has been configured in `.github/workflows/deploy.yml`.
- Pushes to `main` build the Astro site and deploy `dist` to Cloudflare Pages.
- Pull requests build the Astro site, create a Cloudflare Pages preview deployment, and upsert a PR comment with the preview URL.
- Required GitHub repository secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- Cloudflare Pages project name defaults to `peterclaw-website`; set repository variable `CLOUDFLARE_PROJECT_NAME` to override it.
- Next handoff: codex 2 should start QA acceptance after the workflow is merged and a deployment run succeeds.
