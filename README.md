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

_To be added after server Phase 2 seeds demo data (email only — the password is given out-of-band)._

## Screenshots

_To be added once the ticket flows ship (Phase 4b)._

## Status

Phase 4a: scaffold, secure session (sign-in / register / refresh / sign-out), app shell, and the
My-tickets list (loading / empty / error, pull-to-refresh, infinite scroll). The list goes live when
the server's ticket endpoints ship; create-ticket and ticket detail land in Phase 4b.
