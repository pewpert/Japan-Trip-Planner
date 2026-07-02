# Task: Japan Bike Trip Planner — UX + Engineering Improvement Pass

You are a senior engineer picking up an approved plan. Implement all of it.

## Repo & workflow
- Repo: `pewpert/japan-trip-planner` (Next.js 15 App Router + TypeScript strict + Tailwind v4 + Zustand).
- Work on branch `claude/ponytail-audit-improvements-6hah6j` (create from latest `main` if it doesn't exist). Commit with clear messages; push with `git push -u origin <branch>`. Do NOT open a PR unless asked.
- Verify before committing: `npm run lint`, `npx tsc --noEmit`, `npm run build` must all pass.

## Project rules (from CLAUDE.md — do not violate)
- Mobile-first: every component must work at 375px first, then scale up.
- Tailwind classes only — no inline styles, no CSS modules/styled-components.
- Server components by default; add `"use client"` only when interactivity/browser APIs are needed.
- Secrets only in `src/app/api/*` routes, never in client components.
- Define types in `src/types/` before using them. Never use the `any` type.
- Zustand store (`src/hooks/useTripStore.ts`) for shared state — no prop-drilling.
- Icons: lucide-react only. Every async op shows a loading state.

---

## Tier 1 — High-impact UX & efficiency

### 1.1 Make the app usable on mobile
Problem: sidebar defaults open at `w-full` on mobile and the only collapse control is `hidden md:flex` (`src/components/planner/PlannerSidebar.tsx:136`), so the map (and all its `md:hidden` overlays) is unreachable on a phone.
- In `PlannerSidebar.tsx`, add a `md:hidden` fixed bottom **segmented control** (`z-30`) with two buttons — **Planner** / **Map** — that drive `toggleSidebar` (`useTripStore.ts:130`). "Map" collapses the sidebar (`isSidebarOpen=false` → `w-0`) revealing the map; "Planner" reopens it.
- Add a `md:hidden` "View map →" affordance in the sidebar header. Leave the desktop chevron toggle unchanged.

### 1.2 Honest cost math
Problem: `CostEstimator` labels a mixed figure "Total (1 night)" and `SummaryTab` labels the same single-leg range "Estimated Cost (per day)"; multi-day trips never show a real total and nights are never multiplied.
- `src/lib/costCalc.ts`: add `calculateItineraryCostRange(itinerary, settings)` — sum each day's `distanceKm` for fuel + tolls across the whole trip, multiply nightly accommodation by `itinerary.length` nights. Reuse existing `calculateFuelCost`, `estimateTollCost`, `estimateAccommodationCost`, and the same low/high multipliers (0.9/0.8/0.85 and 1.15/1.2/1.2) already in `calculateTripCostRange`.
- `src/components/planner/SummaryTab.tsx`: use `calculateItineraryCostRange(itinerary, settings)` instead of the single-leg `calculateTripCostRange(route…)`; relabel "Estimated Cost (per day)" → **"Estimated Trip Total (N days · N nights)"** with a per-line breakdown.
- `src/components/planner/CostEstimator.tsx`: relabel "Total (1 night)" → **"Per-leg estimate"** with explicit sublabels ("fuel + tolls for this leg", "1 night stay").

### 1.3 One Directions request per route
Problem: `/api/route` returns a decoded `polylinePath` server-side, then `TripMap.tsx:66-89` fires a *second* client-side `DirectionsService.route()` just to feed `DirectionsRenderer` — two billed Directions calls per plan.
- `src/components/map/TripMap.tsx`: delete the `directions` state and the client-side `DirectionsService` `useEffect`. Draw the route with `<Polyline path={route.polylinePath}>` (style `#dc2626`, weight 4, opacity 0.85) plus explicit start/end `<Marker>`s from `route.polylinePath[0]` and the last point. Fit the map with `route.bounds` (already returned by `/api/route`).

### 1.4 Surface silent errors
Problem: seed-route load errors (`SeedRouteCards.tsx:62`) and day-route load errors (`DayView.tsx:47`) only `console.error` / no-op.
- `useTripStore.ts`: add transient `routeError: string | null` + `setRouteError` (do not persist it).
- `SeedRouteCards.tsx` and `DayView.tsx`: on failure call `setRouteError(msg)`.
- `TripMap.tsx`: render a dismissible top-center error banner when `routeError` is set.

---

## Tier 2 — Streamline & polish

### 2.1 Extract shared "day card"
The day-card block is hand-rolled 3× (`ItineraryPlanner.tsx`, `SummaryTab.tsx`, `DayView.tsx`).
- New `src/components/planner/DayDetailCard.tsx`: presentational, takes an `ItineraryDay` + flags (`showRoute`, `showSchedule`, `showAccommodationParking`, `print`). Renders the shared header (Bike icon + "Day N" + title), km/riding badges, key stops, accommodation, seasonal warning. Reuse the existing `ACCOMMODATION_ICONS` maps and `formatDuration`.
- Refactor the three screens to use it, keeping each one's unique chrome (print styles, "Load into route" button, day pills/nav, collapsible schedule).

### 2.2 De-duplicate sidebar tabs
- `PlannerSidebar.tsx`: replace the three copy-pasted tab `<button>`s (lines ~53-82) with a `map` over a `[{id,label}]` array + a small inline `TabButton`.

### 2.3 Small polish
- `src/app/globals.css`: remove the `font-family: Arial…` override (line ~35) so the Geist font from `layout.tsx` applies.
- Add a one-line onboarding nudge under the tab bar pointing new users at the Itinerary → Summary → Print flow.

---

## Tier 3 — Weather strip (Open-Meteo, no API key)
Scaffolding already exists: `WeatherPoint`/`WeatherCondition` in `src/types/weather.ts` and store fields `weather`, `isLoadingWeather`, `setWeather`, `setLoadingWeather`. Fill the gaps per the CLAUDE.md folder plan:
- `src/lib/weather.ts`: `sampleRoutePoints(route, n=5)` picks evenly-spaced points from `route.polylinePath`; add a WMO `weathercode → { description, icon(emoji), isRideSafe }` map (`isRideSafe=false` for heavy rain/snow/thunder codes: 65/67/75/77/82/85/86/95/96/99).
- `src/app/api/weather/route.ts`: accept `{ points:[{lat,lng,name?}] }`; call Open-Meteo once with comma-separated `latitude`/`longitude`: `daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max&current_weather=true&timezone=Asia/Tokyo&forecast_days=7`. Map to `WeatherPoint[]`. Mirror the existing `/api/route` structure.
- `src/hooks/useWeather.ts`: on `route` change, sample points, POST `/api/weather`, set `weather` + `isLoadingWeather` (mirror the callback style in `src/lib/routeApi.ts`).
- `src/components/planner/WeatherStrip.tsx`: mobile-first horizontal-scroll strip of point cards (location, current temp, today hi/lo, precip, wind, ride-safe pill). Use `LoadingSpinner` while loading. Mount in the Route tab under `RouteOverviewPanel` (inside the `route &&` block in `PlannerSidebar.tsx`).

---

## Tier 4 — Config housekeeping
- In `src/app/api/ai-suggest/route.ts` **and** `CLAUDE.md` (Tech-Stack table): update the pinned model `claude-sonnet-4-6` → `claude-sonnet-5` so code and source-of-truth stay in sync.
- In `ai-suggest/route.ts`: raise `max_tokens` 4096 → 8192 (avoids JSON truncation on up-to-21-day itineraries).
- `README.md`: mark the weather roadmap item done and keep feature claims aligned with what now ships.

## Out of scope
- Supabase accounts / shared links (Phase 3).
- Making existing-waypoint text editable (`RouteInputs.tsx` `onChange={() => {}}`) — leave as a noted follow-up.

## Verification
- `npm run lint` + `npx tsc --noEmit` clean; `npm run build` succeeds.
- AI: set `ANTHROPIC_MOCK=true` and confirm itinerary generation + Summary render without a live key.
- Weather: Open-Meteo needs no key — POST a couple of Japan coords to `/api/weather` and confirm a valid `WeatherPoint[]`; confirm `WeatherStrip` renders a ride-safe pill.
- Cost: load a multi-day seed route and confirm Summary total = Σ day fuel/tolls + (nights × nightly), labelled with day/night counts.
- Mobile: at 375px, confirm the Planner/Map segmented control toggles sidebar↔map and map overlays become reachable. (Google Maps tiles need `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; if absent, verify toggle/DOM + polyline/marker code paths logically.)
- Directions dedupe: confirm only the `/api/route` request fires on plan (no second client `DirectionsService`) and the polyline still fits bounds.
