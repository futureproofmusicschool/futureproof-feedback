# Music Subreddit-Style App (Vercel + LearnWorlds Embed)

## Goal
A single-subreddit clone specialized for original music tracks. Hosted on Vercel, embedded via iframe in LearnWorlds, visible only when embedded in LearnWorlds. Identity is the LearnWorlds `{{USER.USERNAME}}` value (no extra login).

## Scope (Exactly-like-Reddit except where noted)
- Posts: only audio tracks (mp3/wav), duration < 10 minutes.
- Listing: main feed with inline play, up/downvote, and sort by Hot (default), New, Top.
- Comments: threaded discussions per post with up/downvote per comment.
- Single community; no multi-subreddits or crossposts.

## Architecture
- Frontend: Next.js (App Router), React, Tailwind CSS.
- Backend: Next.js Route Handlers (serverless on Vercel) for APIs.
- DB: Supabase PostgreSQL with Prisma ORM.
- Storage: Google Cloud Storage bucket for audio files.
- Identity: No auth/SSO. Parent LearnWorlds page provides `username`; app trusts it.
- Embed: iframe within LearnWorlds only. Enforce via CSP `frame-ancestors` and server checks.

## LearnWorlds Integration (embed-only + username)
- Parent page sets iframe `src` to include the username:
  - Example: `https://<app-domain>/?u={{USER.USERNAME}}`
- Optional alternative: parent uses `postMessage` to send `{ username: '{{USER.USERNAME}}' }` to iframe after load.
- App behavior:
  - On load, confirm running in an iframe (`window.top !== window.self`). If not, show a 403 UI.
  - Obtain `username` from `u` query param (or `postMessage`), store in memory (and state) on the client.
  - All API calls include header `x-username: <username>`.

## Server Enforcement (no login, minimal checks)
- Headers/CSP: Set `Content-Security-Policy: frame-ancestors https://<your-learnworlds-domain>` to restrict embedding to LearnWorlds only.
- Middleware (Edge):
  - Reject requests missing `u` on the main app pages (SSR/HTML) with 403.
  - Optionally validate `Referer` contains your LearnWorlds domain to reduce direct access.
  - API routes require `x-username`; reject if missing.
- Cookies/Sessions: none used.

## Data Model (Postgres)
- users
  - id (uuid, pk)
  - username (text, unique)
  - created_at

- posts
  - id (uuid, pk)
  - author_user_id (uuid, fk → users.id)
  - title (text)
  - gcs_url (text) — Google Cloud Storage public/signed URL
  - gcs_object_path (text) — gs://bucket-name/path/to/file.mp3
  - mime_type (text) — `audio/mpeg` or `audio/wav`
  - duration_seconds (int) — validated < 600
  - score_cached (int) — optional denormalized
  - created_at, updated_at

- post_votes
  - user_id (uuid, fk)
  - post_id (uuid, fk)
  - value (int) — {-1, 1}
  - unique (user_id, post_id)

- comments
  - id (uuid, pk)
  - post_id (uuid, fk)
  - author_user_id (uuid, fk)
  - parent_comment_id (uuid, nullable, self fk) — for threads
  - body (text)
  - created_at, updated_at

- comment_votes
  - user_id (uuid, fk)
  - comment_id (uuid, fk)
  - value (int) — {-1, 1}
  - unique (user_id, comment_id)

Indexes:
- posts(created_at DESC), posts(score_cached DESC, created_at DESC)
- votes by (post_id) and (comment_id)
- comments(post_id, parent_comment_id, created_at)

## Sorting (Hot / New / Top)
- New: `ORDER BY created_at DESC`.
- Top: `ORDER BY sum(votes) DESC` (window or materialized/cached score).
- Hot (Reddit-like): classic Reddit hot (logarithmic + sign by score, time factor).
  - `score = upvotes - downvotes`
  - `order = log10(max(abs(score), 1))`
  - `sign = 1 if score>0; 0 if score==0; -1 if score<0`
  - `seconds = epoch(created_at) - 1134028003`
  - `hot = round(sign*order + seconds/45000, 7)`
  - Sort by `hot DESC`
- Recompute hot on read with cached aggregates, or scheduled refresh of `score_cached`/`hot_cached`.

## File Constraints & Upload Flow
- Client validation: accept `.mp3`, `.wav`; reject others.
- Duration: decode metadata client-side (Web Audio API) and re-validate server-side using duration metadata or ffprobe. Reject if ≥ 600s.
- Size: enforce size limits (e.g., ≤ 30–50 MB) client and server.
- Upload: Backend generates signed URL for direct upload to GCS bucket; client uploads, then posts metadata to `/api/posts` with `x-username` header and GCS object path.

## API Endpoints (sketch)
- `GET /api/session` — derive user by `x-username` (creates user if missing, idempotent).
- `POST /api/upload/signed-url` — generate GCS signed upload URL. Requires `x-username`. Returns `{uploadUrl, objectPath}`.
- `POST /api/posts` — create post (title, gcs_object_path, mime_type, duration). Requires `x-username`.
- `GET /api/posts?sort=hot|new|top&offset=&limit=` — list posts with aggregates and caller's vote (by username).
- `POST /api/posts/:id/vote` — body: `{value: -1|0|1}`. Requires `x-username`.
- `GET /api/posts/:id` — post detail with comments summary.
- `POST /api/comments` — create comment. Requires `x-username`.
- `GET /api/comments?postId=...` — thread fetch.
- `POST /api/comments/:id/vote` — vote on comment. Requires `x-username`.

## UI Flows
- Main feed: sort tabs (Hot default). Each post: title, author, age, score, inline audio, vote, comments link.
- Post detail: audio player, full comments tree, per-comment vote/reply/collapse.
- Submit: upload audio, validate, title, submit.

## Moderation & Abuse Controls (MVP-lite)
- Rate limits (IP + username) for posts/comments/votes.
- Report flag on comments/posts (store flags for review).

## Deployment & Config (Vercel)
- Env vars: `DATABASE_URL` (Supabase connection string), `GCS_BUCKET_NAME`, `GCS_PROJECT_ID`, `GCS_CLIENT_EMAIL`, `GCS_PRIVATE_KEY`.
- Headers via Next.js config/middleware to set CSP with `frame-ancestors https://<your-learnworlds-domain>`.
- Optional middleware referer check for `<your-learnworlds-domain>`.
- GCS bucket configured as public-read or use signed URLs for playback.
- Supabase connection pooling recommended for serverless (use pooling connection string).

## Testing
- Unit: sorting, vote tally logic.
- Integration: "username via query" → API create/vote/comment flows.
- E2E: Playwright against deployed preview in iframe context (with query param).

## Deliverables (MVP)
- Next.js app deployable on Vercel, iframe-embeddable only in LearnWorlds.
- Identity from `{{USER.USERNAME}}` working end-to-end (no additional login).
- Post upload with mp3/wav + duration check < 10 minutes.
- Feed with Hot/New/Top, inline playback, voting.
- Post detail with comments and voting.
