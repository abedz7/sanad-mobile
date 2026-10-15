# Decisions — sanad-mobile

One paragraph per library and per load-bearing pattern. The contract in
[`API.md`](API.md) is owned by `sanad-server` and is not a decision of this repo.

## Libraries

**expo-router.** File-based routing on top of React Navigation, maintained by Expo itself. Route
groups `(auth)` / `(app)` express the signed-out/signed-in split directly in the file tree, and
`Stack.Protected` guards make the redirect rule declarative — a deep link into `(app)` while signed
out lands on sign-in with no imperative navigation code. The alternative (hand-wired React
Navigation) buys flexibility this app doesn't need at the cost of more code to review.

**@tanstack/react-query.** Server state — caching, retries, pagination, pull-to-refresh, and
invalidation — is the hard part of this app, and Query is the boring, well-documented answer.
`useInfiniteQuery` gives the tickets list infinite scroll from the contract's `meta` pagination with
no bespoke state machine. Just as important for security: `queryClient.clear()` on sign-out is one
call that provably drops every cached response tied to the old session.

**axios.** Chosen over `fetch` for interceptors: one request interceptor injects the in-memory
access token, one response interceptor owns the entire 401-refresh-retry story and error
normalisation. With `fetch` both would be a hand-rolled wrapper around every call; with axios they
are two small, auditable functions in `src/api/client.ts`.

**react-hook-form + zod (+ @hookform/resolvers).** zod schemas mirror the server's validation rules
(password 10–128, name ≤ 80, email ≤ 254) so users get instant field errors for anything the server
would reject anyway, while the server stays the authority. react-hook-form keeps per-keystroke
re-renders out of the form screens and its `isSubmitting` drives the disabled submit button.

**expo-secure-store (and deliberately not AsyncStorage).** The 30-day refresh token is the crown
jewel; it belongs in the iOS Keychain / Android Keystore, which is exactly what expo-secure-store
wraps. AsyncStorage is plaintext on disk and is not a dependency of this app at all — that is
checked, not assumed — so no code path can drift into persisting tokens insecurely.

**expo-image-picker.** The Expo-maintained picker for the Phase 4b attachment flow (camera roll,
permission handling). Listed now because it is part of the fixed stack; it gains a fuller paragraph
when the create-ticket screen ships.

## Patterns

**Access token in memory only.** `src/auth/tokenStore.ts` keeps the 15-minute access token in a
module variable — never persisted, never serialised, gone when the process dies. On a cold start the
app silently exchanges the stored refresh token for a new pair. Losing 15 minutes of token on a kill
is a feature, not a bug.

**tokenStore as the only secure-store importer.** Exactly one file imports `expo-secure-store` and
it exposes get/set/clear and nothing else. Reviewing token handling means reviewing one 40-line file;
nothing else in the codebase can even reach the keychain.

**Interceptor refresh with a single-flight queue.** On a 401 outside `/auth/*` the client performs
one silent `POST /auth/refresh` and retries the original request once (`_retried` flag). Because the
server rotates refresh tokens and revokes the family on reuse, concurrent 401s must not race: all of
them await one shared `refreshPromise`, so exactly one refresh hits the server per expiry. If refresh
fails, the client wipes secure store, and an emitted signed-out event lets AuthProvider clear the
query cache and route to sign-in — the interceptor stays free of any navigation or React dependency.

**Errors normalised to the contract envelope.** Every failure becomes an `ApiRequestError` carrying
the contract's `code`/`message`/`details`/`requestId`. Screens switch on `code` (the stable part per
the contract) to choose copy — e.g. the deliberately generic "Email or password is incorrect" for
`AUTH_INVALID_CREDENTIALS` — and never render raw axios/network internals.

**One label map.** Status and priority display names and colours live only in `src/lib/labels.ts`;
every badge imports from there, so a renamed status is a one-line change. The brand accent
(`src/lib/theme.ts`) is kept separate from those maps on purpose: an "in progress" badge must never
look like a button.
