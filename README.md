# Japan バイク Trip Planner 🏍️

A motorcycle trip planning web app for exploring rural Japan by motorcycle. Plan routes, estimate costs, get AI-generated itineraries, and discover biker-friendly stops.

## Features

- **Route Planning** — Google Maps Directions with drag-to-reorder waypoints and suggested rest stops every ~2 hours
- **Cost Estimation** — Per-leg and whole-trip fuel, toll, and accommodation cost ranges calculated by distance and settings
- **AI Itinerary Generator** — Day-by-day itineraries with hourly schedules, powered by Claude AI with curated biker POI dataset
- **Weather Along Route** — Current conditions and today's forecast at points sampled along the route (Open-Meteo, ride-safety indicator)
- **Biker POI Layer** — Cafes, famous roads, Michi-no-Eki, rentals, and scenic spots on the map
- **Seed Routes** — 4 curated trips: Nikko Ridge, Izu Peninsula, Japanese Alps, Kyushu Aso Caldera
- **Dark Mode** — Full dark/light mode with preference saved across sessions
- **Mobile Responsive** — Planner/Map toggle on phones; works on phone and desktop

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
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
