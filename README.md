# Announcement Proxy

A small reverse proxy that shows an announcement page to users before letting
them through to the target application. Once acknowledged, a cookie is
stored in the user's browser so the announcement isn't shown again.

Requests without a browser-like `User-Agent` (e.g. API clients, health
checks) skip the announcement and are proxied straight through.

## How it works

1. A browser request comes in without the acknowledgement cookie set.
2. The proxy responds with an announcement page instead of forwarding the
   request.
3. The user submits the acknowledgement form (`POST /acknowledge`), which
   sets a cookie and redirects back to the referring page.
4. On subsequent requests, the cookie is present, so the proxy forwards
   traffic to `TARGET_BASE_URL` via `http-proxy`.

## Environment variables

| Variable          | Description                                    | Default                          |
| ----------------- | ----------------------------------------------- | --------------------------------- |
| `PORT`             | Port the server listens on                      | `3000`                            |
| `TARGET_BASE_URL`  | Base URL of the application being proxied to    | *required* — the server refuses to start without it |
| `ANNOUNCEMENT`     | Message displayed on the announcement page      | `No anouncement message provided` |
| `COOKIE_NAME`      | Name of the cookie used to track acknowledgement | `anouncement_aknowledged`         |

A `.env` file may be used to set these locally (see `dotenv`).

## Running locally

```sh
npm install
npm run dev
```

## Building and running

```sh
npm install
npm run build
npm run start
```

## Docker

```sh
docker build -t announcement-proxy .
docker run -p 3000:3000 \
  -e TARGET_BASE_URL=https://example.com \
  -e ANNOUNCEMENT="Scheduled maintenance this weekend" \
  announcement-proxy
```
