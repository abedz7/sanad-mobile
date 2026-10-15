# sanad-mobile — rules for anyone (human or agent) working in this repo

End-user mobile app for **Sanad**, a Support Ticket / Helpdesk system built as a 48-hour technical
assessment. Reviewers grade component organisation, navigation, state handling, error handling,
README quality, commit history and, above all, **security**.

## Contract

`docs/API.md` is a **verbatim copy** of `sanad-server/docs/API.md`. The server owns it. Never invent
an endpoint, field or error code: if something is missing, stop and report the gap. `src/types/api.ts`
is hand-written from the contract and is the only place enums (status, priority, error codes) live.

## Stack (fixed — do not substitute without asking)

Expo (current SDK) · React Native · TypeScript (strict) · expo-router · TanStack Query · axios ·
react-hook-form + zod · expo-secure-store · expo-image-picker.

## Architecture rules

- `app/` holds routes only (expo-router). Screens compose components from `src/components/`; data
  comes from hooks in `src/api/` (one file per resource, TanStack Query). No fetch calls in screens.
- Every list/detail screen renders all three of loading / empty / error. Errors say what happened
  and offer retry. Empty states invite the next action. Lists support pull-to-refresh.
- Status and priority labels/colours come from one map in `src/lib/labels.ts`.
- Only the transitions the contract allows for a requester are offered; the server still decides.

## Security rules (non-negotiable)

- Refresh token lives **only** in `expo-secure-store` (`src/auth/tokenStore.ts`). Access token lives
  in memory. `@react-native-async-storage/async-storage` is not a dependency and must not become one.
- Tokens are never logged, never put in query strings, never included in deep links or navigation params.
- Deep links carry an id at most; the screen re-fetches through the authenticated API. Nothing in a
  link is trusted.
- On any `401`: one silent refresh attempt, then retry once. If refresh fails: wipe secure store,
  clear the query cache, route to sign-in.
- Sign-out calls `POST /auth/logout`, then wipes secure store and query cache regardless of the response.
- Attachments are downloaded through the authenticated endpoint with the bearer token into the app's
  cache directory; never opened from a raw API URL.
- `EXPO_PUBLIC_API_URL` is the only env var. `.env` is gitignored; `.env.example` has placeholders only.
- All user text is rendered in `<Text>`; no WebView, no HTML rendering.

## Engineering rules

- Build only what `docs/API.md` and the screen list in the brief specify. Propose before adding
  anything else or anything structural.
- Prefer boring, well-known libraries; each dependency gets one paragraph in `docs/DECISIONS.md`.
- No `any` without a comment. No `// @ts-ignore`.
- Commits: conventional (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`), one concern each,
  small, in the author's name only — no bot trailers. Never commit `.env`, `node_modules`, builds.
- README: prereqs (Node, Expo Go or simulator), env vars (API URL reachable from the device — LAN IP,
  not localhost), `npm install && npx expo start`, demo user account (email only), screenshots.
