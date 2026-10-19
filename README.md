# Tōge 峠 — motorcycle ride planner

A ride planner for motorcycle trips in Japan, designed around how Japanese riders actually
plan a touring day: set off early, stay off the expressways when it pays, watch the
weather and the fuel gauge, and be off the mountain before dark. Written in English for
riders who live in Japan.

## Features

- **Ride briefing** — a go / ride-with-care / don't-go verdict for the chosen day, built from
  the forecast along the route, with a per-day selector and departure time. Shows door-to-door
  time, arrival time and sunset.
- **Honest costs** — motorcycle toll class (0.8x the car rate), a road-mix assumption you
  can change, the NEXCO weekend motorcycle discount, and fuel at your bike's real range.
  Bikes of 125cc and under are routed off expressways.
- **Fuel and range** — fuel stops planned at 80% of tank range so you are never gambling on
  the last station.
- **Ride intel** — rain, wind, near-freezing, long-day, high-altitude, winter-closure and bear-season
  notes, each with a link to the source (JMA radar, JARTIC and so on).
- **Weather along the route** — Open-Meteo forecast sampled along the route, including
  elevation-adjusted temperature (no API key needed).
- **Classic rides** — curated seed routes with Japanese names, loaded in one tap.
- **AI itinerary generator** — day-by-day plans from Claude, written for local riders.
- **Plain-text share summary and a printable ride document** — for the group chat or the tank bag.
- **Dark mode, mobile layout** — Planner/Map toggle on phones.

See [docs/rider-insights.md](./docs/rider-insights.md) for the research behind these choices and
which numbers are verified and which are estimates.

## Tech Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Google Maps API** — Directions, Places Autocomplete
- **Claude API** (claude-sonnet-5) — AI itinerary generation
- **Open-Meteo** — Weather forecasts (free, no API key)
- **Zustand** — State management with localStorage persistence

## Getting Started

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and fill in your keys
   (keep `ANTHROPIC_MOCK=true` to develop without an Anthropic key)
4. Run the dev server:
   ```bash
   npm run dev:mock   # or `npm run dev` with a real ANTHROPIC_API_KEY
   ```
5. Open [http://localhost:3000](http://localhost:3000)

See [DEVELOPMENT.md](./DEVELOPMENT.md) for the full local-development guide
and troubleshooting.

## Roadmap

- [x] Biker POI map layer (cafes, famous roads, Michi-no-Eki, fuel gaps)
- [x] Weather integration
- [x] Hourly schedule breakdown
- [ ] Google login + saved itineraries (Supabase)
