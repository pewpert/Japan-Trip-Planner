# Japan Trip Planner — CLAUDE.md

This file is the source of truth for all architectural decisions, conventions, and rules.
Always read this before generating or modifying code.

---

## Project Overview

A responsive web app for planning motorcycle trips in Japan.
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
| AI | Claude API (claude-sonnet-4-6) | Route suggestions, local tips, cost estimates |
| State | Zustand | Global app state (route, trip settings) |
| Data persistence | Browser localStorage (Phase 1), Supabase (Phase 3) |
| HTTP client | axios | For internal API routes and external APIs |
| Icons | lucide-react | Only use lucide icons |
| Hosting | Vercel | Deploy from GitHub main branch |

---

## Folder Structure

```
src/
  app/                        # Next.js App Router pages
    api/                      # Server-side API routes
      route/                  # Route calculation endpoint
      weather/                # Weather fetch endpoint
      ai-suggest/             # Claude AI suggestions endpoint
    page.tsx                  # Home / map page
    layout.tsx                # Root layout
    globals.css               # Global styles (minimal)
  components/
    map/                      # Map-related components
      TripMap.tsx             # Main Google Map component
      RouteLayer.tsx          # Draws route polyline on map
      MarkerCluster.tsx       # POI markers
    planner/                  # Trip planning UI
      PlannerSidebar.tsx      # Left sidebar: inputs, controls
      RouteInputs.tsx         # Start/end/waypoint inputs
      CostEstimator.tsx       # Fuel, toll, accommodation costs
      WeatherStrip.tsx        # Weather along route
      POIList.tsx             # Points of interest list
    ui/                       # Generic reusable UI components
      Button.tsx
      Card.tsx
      Input.tsx
      LoadingSpinner.tsx
  lib/
    googleMaps.ts             # Google Maps API helpers
    weather.ts                # Open-Meteo API helpers
    costCalc.ts               # Cost calculation logic
    storage.ts                # localStorage read/write helpers
    claudeAI.ts               # Claude API call helpers
  hooks/
    useRoute.ts               # Hook: fetch and manage route data
    useWeather.ts             # Hook: fetch weather for route
    useTripStore.ts           # Zustand store definition
  types/
    trip.ts                   # TypeScript types for trip data
    route.ts                  # Types for route/waypoint data
    weather.ts                # Types for weather data
```

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
