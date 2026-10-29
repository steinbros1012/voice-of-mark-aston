# Beep Me

Campus ride marketplace for college students. Drivers post a **Beep** (origin,
destination, departure time, seats, price per seat); riders on the same campus
request seats, pay in the app, chat to coordinate pickup, and rate each other
afterwards. Beep Me keeps a 15% platform fee on each booking. Launch campus: UNCW.

## Stack

| Concern | Service / library | Where it lives |
| --- | --- | --- |
| App | React Native + Expo SDK 58, TypeScript strict, Expo Router | `src/` |
| Database, auth, RLS | Supabase (Postgres) | `supabase/migrations/` |
| Server-side logic, email | Supabase Edge Functions | `supabase/functions/` |
| Ride payments and driver payouts | Stripe Connect | Phase 5 |
| Premium subscription (Beep Me Plus) | RevenueCat | Phase 5 |
| Product analytics | PostHog | Phase 2 onward |
| Crash and error tracking | Sentry | `src/lib/sentry.ts` |
| Transactional email | Resend (called only from an Edge Function) | Phase 6 |

## Project layout

```
beep-me/
├─ app.config.ts            Expo config (reads build-time env, no secrets)
├─ metro.config.js          Expo Metro config wrapped by Sentry for source maps
├─ eslint.config.js         eslint-config-expo (flat config)
├─ .env.example             Every client / build-time variable, documented
├─ src/
│  ├─ app/                  Expo Router routes (files here are screens)
│  │  ├─ _layout.tsx        Root stack, theme, Sentry init
│  │  ├─ (auth)/            welcome, sign-in, sign-up, verify-email, onboarding
│  │  ├─ (tabs)/            feed (index), search, post, rides, profile
│  │  ├─ beep/[id]          Beep detail
│  │  ├─ booking/[id]       Booking detail with chat
│  │  ├─ user/[id]          Public profile
│  │  ├─ rate/[bookingId]   Post-ride rating (modal)
│  │  └─ paywall            Beep Me Plus (modal)
│  ├─ components/ui/        Shared primitives (Screen, Text, Button, TextField, Avatar, ...)
│  ├─ constants/            theme tokens, universities, fee math
│  ├─ features/             One folder per domain (auth, profile, beeps, ...): hooks + API calls
│  ├─ hooks/                React hooks
│  ├─ lib/                  Service clients: env, supabase, analytics (PostHog), sentry
│  └─ types/                database.ts mirrors the SQL schema for the typed Supabase client
├─ scripts/db-test.sh       Applies migrations + RLS tests to a local Postgres
└─ supabase/
   ├─ migrations/           SQL migrations with RLS policies
   ├─ tests/                RLS test suite and the local auth/storage stub
   └─ functions/            Edge Functions + .env.example for their secrets
```

Routes only render UI; data access goes through `src/lib` and feature hooks so
screens stay thin and testable.

## Getting started

Requirements: Node 20+, npm, and either the Expo Go app on a phone or an iOS
Simulator / Android Emulator. Xcode is only needed for local iOS builds.

```bash
cd beep-me
npm install
cp .env.example .env            # fill in the keys you have; blanks are tolerated
npx expo start                  # press i (iOS), a (Android) or w (web)
```

Quality gates, run before every commit:

```bash
npm run typecheck   # tsc --noEmit (strict + noUncheckedIndexedAccess)
npm run lint        # eslint via expo lint
npm run doctor      # expo-doctor dependency and config health
```

Expo Go works until a library with native code is added (Stripe, RevenueCat,
Sentry's native layer). From then on use a development build:

```bash
npx expo run:ios            # or run:android, locally
npx eas-cli@latest build --profile development --platform ios   # in the cloud
```

### Environment variables

* `.env` is git-ignored. Only `.env.example` is committed.
* Variables prefixed `EXPO_PUBLIC_` are inlined into the JavaScript bundle and
  are visible to anyone with the app, so only publishable keys go there.
* Secrets (Stripe secret key, Resend API key, webhook secrets) belong in
  `supabase/functions/.env` and are only ever read by Edge Functions.
* After editing `.env`, fully reload the app (not just fast refresh).
* `src/lib/env.ts` is the single place the app reads environment variables.
  Use `env.x` for optional access and `requireEnv('x')` where a service must
  be configured.

## Service setup

Each section lists the keys it produces and where they go.

### 1. Supabase (database, auth, RLS)

1. Create a project at <https://supabase.com/dashboard> (or restore an
   existing one). Pick a region close to campus (US East for UNCW).
2. Project Settings → API: copy the **Project URL** and the **anon / publishable**
   key into `.env` as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Install the CLI and link the project so migrations can be applied:
   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref <project-ref>
   supabase db push          # applies supabase/migrations/*
   ```
4. Authentication → Sign In / Providers → Email: enable the Email provider.
   Beep Me is passwordless: students receive a 6-digit code by email for both
   sign-up and log-in.
5. Authentication → Emails → Templates: both **Confirm sign up** (first
   sign-in creates the user) and **Magic Link** (returning users) must include
   the `{{ .Token }}` variable so the email carries a code rather than a link:
   ```html
   <h2>Your Beep Me code</h2>
   <p>Enter this code in the app: <strong>{{ .Token }}</strong></p>
   ```
6. Authentication → Hooks → **Before User Created**: enable it with the
   Postgres function `public.hook_before_user_created` (created by the first
   migration). It rejects sign-ups whose email domain is not a supported
   campus, so the .edu rule is enforced server-side, not only in the app.
7. Authentication → URL Configuration: add `beepme://` to the redirect allow-list.

How verification works: requesting a code calls `signInWithOtp`; the
Before User Created hook rejects non-campus domains before any row exists.
The profile row is created by a trigger with `university_id` derived from the
email domain. Entering the code calls `verifyOtp` with type `email`, Supabase
confirms the address, and a second trigger flips `edu_verified` to true.
Clients cannot change `edu_verified`, `university_id` or the rating/ride
counters (a trigger discards those changes). Verification only proves a campus
email; the app says so wherever the badge appears, and it is not a background
check.

Realtime: the second migration adds `messages` and `seat_requests` to the
`supabase_realtime` publication so chat updates live. Nothing else to enable.

#### Database tests

`supabase/tests/rls.test.sql` applies every migration to a throwaway local
Postgres and asserts the Row Level Security policies by impersonating users.
It uses a small stub of the `auth` and `storage` schemas
(`supabase/tests/00_supabase_stub.sql`) and never touches a hosted project.

```bash
PGURL=postgres://postgres:postgres@localhost:5432/postgres scripts/db-test.sh
```

### 2. Stripe Connect (ride payments, driver payouts)

1. Create a Stripe account at <https://dashboard.stripe.com>. Stay in **test mode**.
2. Developers → API keys: copy the **publishable key** to `.env` as
   `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and the **secret key** to
   `supabase/functions/.env` as `STRIPE_SECRET_KEY`.
3. Connect → Get started: complete the platform profile and enable **Express**
   accounts (United States). Drivers onboard through an Express account link
   from the Payments and earnings screen.
4. Developers → Webhooks: add an endpoint at
   `https://<project-ref>.supabase.co/functions/v1/stripe-webhook` for the
   events `setup_intent.succeeded`, `payment_method.detached`,
   `account.updated`, `payment_intent.payment_failed`, `charge.refunded`, and
   copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
5. Settings → Payment methods → Apple Pay: register the merchant id
   `merchant.app.beepme.mobile` when you are ready for Apple Pay.

How money moves (separate charges and transfers):

* Riders save a card once through Stripe's PaymentSheet (a SetupIntent on the
  rider's Stripe Customer). Nothing is charged at request time.
* When the driver accepts, the `accept-request` function charges the saved
  card off-session for seats × price plus a $1 booking fee (waived for Plus
  riders), records a `payments` row, then marks the request accepted. A
  declined card leaves the request pending with the reason.
* Cancelling before departure (`cancel-request`, `cancel-beep`) refunds in full.
* When the driver marks the ride complete (`complete-beep`), each payment is
  transferred to the driver's Express account for the seat subtotal less 15%,
  tied to the original charge so it clears when the charge settles. Beep Me
  keeps the 15% and the booking fee; Stripe's processing fees come out of
  that share.
* Fee math lives in `src/constants/fees.ts` (client preview) and
  `supabase/functions/_shared/fees.ts` (authoritative).

Deploy and configure the functions:

```bash
supabase secrets set --env-file supabase/functions/.env
supabase functions deploy payments connect connect-return accept-request cancel-request cancel-beep complete-beep stripe-webhook revenuecat-webhook
```

`supabase/config.toml` turns JWT verification off for the two webhooks and the
Connect return page; every other function requires the student's session.

### 3. RevenueCat (Beep Me Plus subscription)

1. Create a project at <https://app.revenuecat.com>.
2. Add an iOS app (bundle id `app.beepme.mobile`) and an Android app (package
   `app.beepme.mobile`). Copy each app's **public API key** to `.env` as
   `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
3. Create the products in App Store Connect and Google Play Console, then in
   RevenueCat create an entitlement named `plus`, an offering named `default`,
   and attach monthly and annual packages.
4. Integrations → Webhooks: point at
   `https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook` and set
   an Authorization header value; store the same value as
   `REVENUECAT_WEBHOOK_SECRET`. The webhook keeps `profiles.plus_active` in
   step so premium placement and the booking-fee waiver work server-side.
5. The app logs students into RevenueCat with their Supabase user id, so
   entitlements follow the account across devices.

### 4. PostHog (product analytics)

1. Create a project at <https://us.posthog.com> (or the EU cloud).
2. Project Settings: copy the **Project API key** to `.env` as
   `EXPO_PUBLIC_POSTHOG_KEY`. Set `EXPO_PUBLIC_POSTHOG_HOST` to
   `https://us.i.posthog.com` or `https://eu.i.posthog.com` to match.
3. Events tracked: `sign_up`, `verification_completed`, `beep_posted`,
   `beep_viewed`, `seat_requested`, `seat_accepted`, `booking_completed`,
   `paywall_viewed`, `subscription_started`.

### 5. Sentry (crashes and errors)

1. Create a React Native project at <https://sentry.io>.
2. Project → Settings → Client Keys: copy the **DSN** to `.env` as
   `EXPO_PUBLIC_SENTRY_DSN`. Without a DSN the SDK is initialised disabled.
3. For readable stack traces in release builds, set `SENTRY_ORG`,
   `SENTRY_PROJECT` and an auth token (`SENTRY_AUTH_TOKEN`, scopes
   `project:releases` and `org:read`) in `.env` locally and as EAS environment
   variables for cloud builds. The Expo config plugin uploads source maps.

### 6. Resend (transactional email)

1. Create an account at <https://resend.com>, add and verify your sending
   domain, and create an API key.
2. Put `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in `supabase/functions/.env`
   and push them with `supabase secrets set --env-file supabase/functions/.env`.
   The key is used only by the email Edge Function and never ships in the app.

### Share links and deep links

`shareBeep` opens the native share sheet with a link to the Beep. When
`EXPO_PUBLIC_APP_URL` is set the link is `https://<host>/beep/<id>` (needs the
domain's apple-app-site-association and assetlinks.json for universal links;
Phase 6). Until then it falls back to `beepme://beep/<id>`, which opens the
app directly on devices that have it installed.

### 7. EAS (builds and TestFlight)

```bash
npm i -g eas-cli
eas login
eas init                 # writes the project id; put it in .env as EAS_PROJECT_ID
eas build --profile development --platform ios
```

The TestFlight submission checklist lands in Phase 6.

## Legal and consent

`src/features/legal/content.ts` holds the Terms of Service, Privacy Policy and
Community Guidelines, written for a student cost-sharing marketplace (platform
only, not a carrier; assumption of risk; limitation of liability;
arbitration). They are drafts for attorney review, not legal advice. Students
accept them during onboarding; the version and time are stored on the profile
(`accepted_terms_version`, `accepted_terms_at`). Bump `TERMS_VERSION` when the
documents change and every signed-in student is asked to accept again before
using the app.

## Design system

Light mode follows the Beep Me reference: warm off-white background
(`#F7F8F4`), white surfaces with subtle borders, deep ink text (`#142522`) and
a restrained lime accent (`#C6EF68`). Tokens live in `src/constants/theme.ts`
(colors for light and dark, spacing, radius, type scale, 44pt touch target)
and every screen is built from `src/components/ui`: `Button` (ink primary,
lime accent, outlined secondary, ghost, danger), `TextField`, `Chip`,
`Segmented`, `Stepper`, `Card`, `ListRow`, `Pill` (status and the
"Student email verified" badge), `Avatar`, `Screen` with a pinned footer,
`Wordmark`, `ProgressSteps`, and the loading/empty/error states. Navigation is
four tabs (Explore, Trips, Inbox, Profile) with "Post a ride" reachable from
Explore and Trips.

## Build phases

1. **Scaffold** (done): Expo project, strict TypeScript, folder structure,
   env templates, README, Sentry initialised at startup.
2. **Auth and profiles** (done): full Supabase schema with RLS for every table,
   sign up / log in, .edu code verification, campus derived from the email
   domain, onboarding and profile editing with avatar upload, PostHog
   `sign_up` and `verification_completed` events.
3. **Beeps** (done): post a Beep (day/time chips, seats, price with the fee
   preview), campus feed with pull-to-refresh, search by destination, day,
   time of day and price, Beep detail with driver card, cancel, and native
   share sheet with a link back into the app. PostHog `beep_posted` and
   `beep_viewed` events.
4. **Requests and messaging** (done): request seats, driver accept/decline
   with capacity checks, rider cancel, seat counts and open/full status kept
   by triggers, cascade cancellation, per-booking chat with realtime inserts
   and inbox previews, Trips and Inbox tabs, report and block, public
   profiles with reviews. PostHog `seat_requested` and `seat_accepted`.
5. **Payments and trust** (done): Stripe Connect charge on accept, refunds
   on cancel, payouts on completion with the 15% fee, earnings screen,
   ratings and reviews both ways with profile aggregates, ride counters,
   RevenueCat paywall with Plus perks, Terms / Privacy / Community
   Guidelines with recorded consent and a re-acceptance gate.
6. Polish: PostHog verified, Resend emails live, loading/empty/error states,
   icon and splash, TestFlight checklist.
