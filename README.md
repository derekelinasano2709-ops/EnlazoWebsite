# Enlazo Website (static starter)

A responsive dark-blue website for Enlazo — Connect Through Play.

## Pages
- `index.html` — landing page
- `commands.html` — searchable command directory (illustrative, not live-synced)
- `dashboard.html` — dashboard preview, not yet connected to Discord OAuth or a backend
- `privacy.html` — privacy-policy draft
- `terms.html` — terms-of-service draft

## Publish with GitHub Pages
1. Upload all files and the `assets` folder to the root of a GitHub repository.
2. In repository Settings → Pages, select deploy from branch `main` and folder `/ (root)`.
3. Wait for GitHub Pages to publish the site.

## Before public launch
- Confirm the invite URL and required bot permissions.
- Review privacy and terms against actual data collection and storage; the legal pages are drafts.
- The dashboard needs a secure server-side backend, Discord OAuth2 login, permission validation, and API endpoints before it can modify real server settings.
- Keep Discord bot tokens and other secrets out of HTML, JavaScript, GitHub, and client-side code.
