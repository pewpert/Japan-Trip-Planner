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
3. Create `.env.local` with your API keys:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ANTHROPIC_API_KEY=your_anthropic_key
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Roadmap

- [x] Biker POI map layer (cafes, famous roads, Michi-no-Eki, fuel gaps)
- [x] Weather integration
- [x] Hourly schedule breakdown
- [ ] Google login + saved itineraries (Supabase)
