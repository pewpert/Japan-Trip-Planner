# Tōge 峠 (Japan motorcycle ride planner) — CLAUDE.md

This file is the source of truth for all architectural decisions, conventions, and rules.
Always read this before generating or modifying code.

---

## Project Overview

A responsive web app for planning motorcycle rides in Japan, written in English for riders who live in Japan (not a tourist guide).
Built by Daniel (product owner, non-technical) with Claude as architect/engineer.

**Current phase: Phase 1 MVP**

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | Use server components where possible |
| Language | TypeScript | Strict mode on |
| Styling | Tailwind CSS v4 | Mobile-first, no custom CSS files unless necessary |
| Maps | Google Maps JS API via `@react-google-maps/api` | Directions, Places, Roads APIs |
| Weather | Open-Meteo (free, no key) | Forecast along route waypoints |
| AI | Claude API (claude-sonnet-5) | Route suggestions, local tips, cost estimates |
| State | Zustand | Global app state (route, trip settings) |
| Data persistence | Browser localStorage (Phase 1), Supabase (Phase 3) |
| HTTP client | axios | For internal API routes and external APIs |
| Icons | lucide-react | Only use lucide icons |
| Hosting | Vercel | Deploy from GitHub main branch |

---

## Folder Structure

```
src/
  app/                        # App Router pages
    api/route/                # Directions proxy (supports avoidHighways)
    api/weather/              # Open-Meteo proxy (with elevation)
    api/ai-suggest/           # Claude itinerary endpoint (ANTHROPIC_MOCK=true for a sample)
    print/page.tsx            # Printable ride document
  components/
    map/                      # TripMap, EmptyStatePanel, SeedRouteCards, POI layer + toggle + info panel
    planner/                  # PlannerSidebar, RouteInputs, RideBriefing, WeatherStrip, RideIntel,
                              # FuelPlan, CostEstimator, StopsPanel, TripSettings, PreRideCheck,
                              # ItineraryPlanner, DayView, DayDetailCard, SummaryTab, TripExportButton
    print/                    # PrintLayout
    ui/                       # Button, Card, Input, Pill, Segmented, Disclosure, Tooltip, ...
  lib/
    costCalc.ts               # fuel + toll model (motorcycle class, road mix, ETC discount)
    ridePlan.ts               # JST day helpers, sunset, timeline, fuel plan
    advisories.ts             # verdict + ride-intel rules (the "ride briefing" brain)
    brand.ts                  # product name in one place
    weather.ts, routeApi.ts, tripExport.ts, breakInterpolation.ts, poiFilter.ts
  hooks/                      # useTripStore (Zustand), useRidePlan, useSeedRoute, useWeather
  data/                       # seedRoutes, seedItineraries, bikerPOIs, poiCategories
  types/                      # trip, route, weather, ride
```

Design tokens live in `globals.css` (semantic names such as `bg-surface`, `text-ink-2`,
`bg-accent`, `text-warn`); components should not use per-component `dark:` pairs.
Single typeface (Instrument Sans) with system Japanese fallbacks.

---

## Environment Variables

All secrets go in `.env.local` (never committed to git).
See `.env.local.example` for required keys.

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=   # Google Maps JS API key
ANTHROPIC_API_KEY=                  # Claude API key (server-side only)
```

`NEXT_PUBLIC_` prefix = safe to use in browser.
No prefix = server-side only (never exposed to browser).

---

## Key Conventions

1. **Mobile-first**: All components must look good on a 375px wide screen first, then scale up.
2. **No inline styles**: Use Tailwind classes only.
3. **Server components by default**: Add `"use client"` only when component needs interactivity or browser APIs.
4. **API routes for secrets**: Never call Claude API or use secret keys in client components. Always go through `src/app/api/`.
5. **Types first**: Define TypeScript types in `src/types/` before implementing features that use them.
6. **Zustand for shared state**: Don't prop-drill. Use the trip store for anything shared between sidebar and map.
7. **Error boundaries**: Wrap map and AI components in error boundaries — these are the most likely to fail.
8. **Loading states**: Every async operation must show a loading indicator.

---

## Japan-Specific Notes

- **Traffic side**: Japan drives on the LEFT. Route instructions should reflect this.
- **Toll roads**: Japan has extensive expressway toll system (ETC). Always surface toll costs.
- **Fuel**: Most motorcycles use regular (レギュラー). Average consumption ~20-25km/L for mid-size bikes.
- **Seasonal closures**: Many mountain passes (e.g., Skyline routes) close November–April due to snow.
- **Rest stops**: "Michi-no-Eki" (道の駅) are official roadside stations — excellent for breaks, local food, free parking.
- **Laws**: International Driving Permit (IDP) required for foreign riders. Helmets mandatory. No lane splitting.
- **Avoid**: Tokyo, Osaka, Kyoto city centers — focus on rural/regional routes.
- **Bikes ≤125cc**: not allowed on expressways; routing must avoid highways. Motorcycles pay the 軽自動車等 toll class (0.8× car).
- **Audience**: residents who already hold a Japanese licence. Do not add tourist content (IDP, rental, insurance walkthroughs).

---

## Phased Roadmap

### Phase 1 — MVP (current)
- [x] Project setup
- [ ] Map view with route planning (start → end)
- [ ] Basic POI display (Michi-no-Eki, scenic spots)
- [ ] Fuel cost estimator
- [ ] Mobile responsive layout
- [ ] Save itinerary to localStorage

### Phase 2 — Core Features
- [ ] Weather overlay (current + 7-day forecast along route)
- [ ] Accommodation suggestions with parking info
- [ ] Toll cost integration
- [ ] Seasonal info (festivals, pass closures)
- [ ] AI-powered route suggestions via Claude

### Phase 3 — Accounts & Public Launch
- [ ] Google login via Supabase Auth
- [ ] Save/load itineraries to Supabase DB
- [ ] Share itinerary via public link
- [ ] Portfolio-ready UI polish

---

## What NOT to do

- Do not use `pages/` directory — we use App Router only.
- Do not hardcode API keys anywhere in source files.
- Do not add features outside the current phase without discussing first.
- Do not use any icon library other than lucide-react.
- Do not create CSS modules or styled-components — Tailwind only.
- Do not use `any` TypeScript type — always type properly.
