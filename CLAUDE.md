# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file Express reverse proxy (`index.ts`) that shows an announcement
page to browser users before forwarding their traffic to a target
application. Once the user acknowledges the announcement, a cookie is set so
it isn't shown again. Non-browser requests (no browser-like `User-Agent`)
bypass the announcement entirely.

## Commands

```sh
npm install       # install dependencies
npm run dev        # run with nodemon + ts-node against index.ts (auto-restart)
npm run build       # compile TypeScript to ./build via tsc
npm run start        # run the compiled build (./build/index.js) — requires npm run build first
```

There are no tests or linter configured in this project.

## Architecture

Everything lives in `index.ts`, a single Express app with two routes:

- `POST /acknowledge` — sets the acknowledgement cookie (`COOKIE_NAME`) and
  redirects back to the `Referer`.
- `GET /{*splat}` (catch-all) — if the request looks like it's from a browser
  (`User-Agent` matches `Mozilla|Chrome|Safari|Firefox|Edge`) and the
  acknowledgement cookie is not set, it renders `index.pug` with the
  `ANNOUNCEMENT` message instead of proxying. Otherwise, the request is
  forwarded to `TARGET_BASE_URL` using `http-proxy`.

`index.pug` is the only view — a minimal page with the announcement message
and a form that POSTs to `/acknowledge`.

Configuration is entirely environment-variable driven (loaded via `dotenv`),
with no config files: `PORT`, `TARGET_BASE_URL`, `ANNOUNCEMENT`, and
`COOKIE_NAME`. Note the code intentionally spells `ANNOUNCEMENT` correctly
but the default `COOKIE_NAME` value (`anouncement_aknowledged`) is
misspelled — this is the existing default cookie name in production, so
don't "fix" the spelling without checking downstream impact.

## Deployment

`.gitlab-ci.yml` builds the Docker image (`Dockerfile`, `node:24` base) and
pushes it to an AWS ECR repository on pushes to `master`/`main`. There is no
test or lint stage in CI — `npm run build` (via the Dockerfile) is the only
gate.
