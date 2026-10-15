# sanad-mobile

End-user mobile app for **Sanad**, a support-ticket / helpdesk system. Expo · React Native ·
TypeScript · expo-router · TanStack Query.

Built against the contract in [`docs/API.md`](docs/API.md) (a verbatim copy of
`sanad-server/docs/API.md`; the server owns it). Requires a running `sanad-server`.
Library and pattern choices are justified in [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Prerequisites

- Node 22
- A device or simulator: **Expo Go** on a physical phone (same Wi-Fi as your computer), or an iOS
  Simulator / Android Emulator
- A running [`sanad-server`](../sanad-server) (defaults to port 4000)

## Environment

```sh
cp .env.example .env
```

`EXPO_PUBLIC_API_URL` is the only variable. It must be reachable **from the device**:

- iOS Simulator / Android Emulator on the same machine: `http://localhost:4000` works
  (Android emulator may need `http://10.0.2.2:4000`).
- Physical phone with Expo Go: use your computer's LAN IP, e.g. `http://192.168.1.20:4000` —
  `localhost` on the phone is the phone.

The app fails fast with a readable error if the variable is missing. Never commit `.env`.

## Run

```sh
npm install
npx expo start
```

Then press `i` (iOS Simulator), `a` (Android emulator), or scan the QR code with Expo Go.

Checks used before every commit:

```sh
npx tsc --noEmit
npx expo lint
```

## Demo account

_Pending the server's seed script (Phase 2): the seeded demo email will be listed here; the
password is given out-of-band. Until then, register any account in the app._

## Screenshots

| Sign in | My tickets | Create ticket | Ticket detail |
|---|---|---|---|
| ![Sign in](docs/screenshots/sign-in.png) | _pending server tickets API_ | _pending server tickets API_ | _pending server tickets API_ |

## Status

Phase 4b (client side) complete: create ticket with photos and resilient uploads, ticket detail
with status stepper, attachments, comments and requester status actions, edit-while-open, and
`sanad://tickets/<id>` deep links through the auth gate. Auth flows are verified against the live
server; the ticket screens exercise the contract and light up when the server's ticket endpoints
ship, after which the remaining screenshots and the demo account land here.
