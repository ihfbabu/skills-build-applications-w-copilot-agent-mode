# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep route-specific pages thin and use the shared `CapabilityCard` to fetch through `src/api/client.ts`. Each page supplies its endpoint, response key, empty message, and item renderer. The shared component provides accessible loading, success, empty, and error states.
- Logic tier decision: Keep request handling in Express routes and business rules in explicit service functions. Validate request bodies and identifiers before database writes, and return deliberate 4xx responses for invalid or missing records.
- Data tier decision: Enforce required domain fields in Mongoose schemas. Keep seed data idempotent and non-destructive; when a seeded user changes teams, remove the old membership before adding the new one.
- Activity tracking approach: Require valid IDs for an existing user and team, a non-empty activity type, and positive minutes. Store points equal to minutes and set `occurredAt` when creating the activity.
- Team management approach: Require a name and mascot, default members to an empty array, and verify any submitted member IDs refer to existing users.
- Leaderboard approach: Aggregate activity points by team, sort totals descending with a stable team-ID tie break, look up team names, and assign one-based ranks.
- Workout suggestions approach: Look up the user by decoded email and return `404` when no user exists. Prefer workouts matching the user's fitness goal, fall back to all available workouts if none match, and explain the recommendation using the goal and most recent activity when available.

## Test plan

- Data tier: `npm run test:data --prefix octofit-tracker/backend` checks required model fields, defaults, and idempotent seeding. Result: 5/5 passed. Failures indicate a schema or seed-data contract regression.
- API behavior: `npm run test:api --prefix octofit-tracker/backend` checks activity/team creation and validation, leaderboard ordering, and personalized workout suggestions. Result: 4/4 passed. Failures indicate service behavior or HTTP contract regressions. The suite uses `mongodb-memory-server`; MongoDB was also confirmed running locally before the integration checks.
- Backend regression suite: `npm test --prefix octofit-tracker/backend` runs both backend contract files. Result: 9/9 passed.
- Presentation behavior: `npm test --prefix octofit-tracker/frontend` checks API-backed rendering, the Mona workout request, and loading, empty, and accessible error states for all four pages. Result: 15/15 passed. Failures indicate API wiring, rendering, or accessibility regressions.
- Backend type check: `npm run build --prefix octofit-tracker/backend` runs `tsc --noEmit`. Result: passed. Failures indicate backend TypeScript errors.
- Frontend production build: `npm run build --prefix octofit-tracker/frontend` runs TypeScript checking and `vite build`. Result: passed. Failures indicate frontend type errors or production bundling issues.
