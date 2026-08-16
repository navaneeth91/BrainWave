# BrainWave LMS — Mobile App (React Native / Expo)

A production-quality **Android** application for the existing BrainWave LMS. It
reuses the **existing Express/MongoDB backend** and **Clerk authentication** —
no new backend, database, or auth system was created.

```
React Web ──┐
            ├──► Existing Express Backend ──► MongoDB
React Native┘            │
                         └── Clerk (same users, courses, enrollments, exams, certificates)
```

## Stack

Expo (SDK 57) + Expo Router · React Native · Clerk (`@clerk/clerk-expo`) ·
Axios · `expo-secure-store` (Clerk token cache) · `expo-image` ·
`react-native-webview` (YouTube player) · `@expo/vector-icons`.

## Project structure

```
mobile/
├── app/                       # Expo Router routes
│   ├── _layout.jsx            # ClerkProvider + tokenCache + auth gate
│   ├── index.jsx              # Auth-aware entry redirect
│   ├── (auth)/                # sign-in / sign-up
│   ├── (tabs)/                # Home, Courses, My Learning, Profile
│   ├── course/[id].jsx        # Course details + enrollment
│   ├── learning/[id].jsx      # Video lessons + progress
│   ├── exam/[id].jsx          # Take exam (timer + answers)
│   ├── exam-result/[id].jsx   # Score, pass/fail, certificate
│   └── certificates/          # Certificates list + details
├── src/
│   ├── services/api.js        # Reusable Axios + every endpoint
│   ├── context/AppContext.jsx # Global state + Clerk/API bridge
│   ├── components/            # Reusable UI
│   ├── hooks/useProgressMap.js
│   ├── constants/theme.js     # BrainWave design tokens
│   └── utils/                 # format.js, clerk.js
├── assets/
├── .env                       # local environment (ignored by git)
└── app.json                   # name: BrainWave, package: com.brainwave.lms
```

## Setup

```bash
cd mobile
npm install
```

`mobile/node_modules` may already be installed. After changing native deps,
restart Metro.

### Environment variables

Create `mobile/.env` (a `.env.example` is provided):

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:5000
```

> Only `EXPO_PUBLIC_`-prefixed variables are exposed to the app bundle. Never
> put secret keys here. The Clerk publishable key is public by design.

## Backend URL (important for Android)

`localhost` inside an Android emulator refers to the emulator itself, **not your
PC**. Use one of these in `EXPO_PUBLIC_BACKEND_URL`:

| Target                | URL                        |
| --------------------- | -------------------------- |
| Android emulator      | `http://10.0.2.2:5000`     |
| Physical phone (LAN)  | `http://192.168.x.x:5000`  |
| Hosted backend        | `https://your-backend.com` |

For a physical phone find your PC's local IP: `ipconfig` → the active adapter's
**IPv4 Address** (e.g. `192.168.1.23`) and use `http://192.168.1.23:5000`.
Ensure the phone and PC are on the **same Wi-Fi** and any firewall allows port
`5000`. Start the backend from `server/` with `npm run server`.

## Running

```bash
npx expo start
```

Then press `a` for the Android emulator, scan the QR with Expo Go on a device,
or use `npx expo run:android` for a native development build.

**Requirements:** Node 18+ (tested on Node 22), an Android emulator (Android
Studio) or Expo Go, and the backend running and reachable.

## Authentication

Clerk handles everything. On sign-in/sign-up the app gets a short-lived session
token via `getToken()` and sends it as `Authorization: Bearer <token>`, matching
the backend's `clerkMiddleware()` (see `server/server.js`). A 401 triggers a
graceful sign out (see the `src/services/api.js` response interceptor).

**Google sign-in (OAuth):** wired via `useOAuth({ strategy: 'oauth_google' })`
and the app scheme. For it to work, enable the **Google** provider in your Clerk
dashboard and add an **OAuth redirect URL** of `brainwave://oauth-native-callback`
(matching the `scheme` in `app.json`).

## API endpoints used

All endpoints come from the existing backend (source of truth in `server/`):

| Purpose             | Endpoint                                          |
| ------------------- | ------------------------------------------------- |
| All courses         | `GET /api/course/all`                             |
| Course details      | `GET /api/course/:id`                             |
| User profile        | `GET /api/user/data`                              |
| Enrolled courses    | `GET /api/user/data/enrolled-courses`             |
| Enroll / purchase   | `POST /api/user/purchase`                         |
| Course progress     | `GET /api/user/course-progress/:courseId`         |
| Update progress     | `POST /api/user/update-course-progress`           |
| Rate course         | `POST /api/user/add-user-rating`                  |
| Exam for a course   | `GET /api/exam/course/:courseId`                  |
| Start exam attempt  | `POST /api/exam/:examId/start`                    |
| Get exam (student)  | `GET /api/exam/:examId`                           |
| Submit exam         | `POST /api/exam/:examId/submit`                   |
| Exam result         | `GET /api/exam/attempt/:attemptId`                |
| Generate certificate| `POST /api/user/generate-certificate/:courseId`   |
| My certificates     | `GET /api/user/certificates`                      |
| Certificate by id   | `GET /api/user/certificate/:certificateId`        |
| Educator courses    | `GET /api/educator/courses` (role-protected)      |

See `src/services/api.js` for the full, up-to-date map.

## Notes

- The video player embeds **YouTube** (lectures are YouTube links) inside a
  WebView — the same content the web player uses.
- Enrollment uses the backend's existing logic; in `FREE_COURSES_MODE` (the
  server default) it completes instantly, otherwise the Stripe checkout session
  opens in the system browser.
- The app never creates fake/mock data — everything comes from the real APIs.
- Students cannot access educator routes; educator-only endpoints stay protected
  by the backend's `protectEducator` middleware.