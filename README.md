# Japan バイク Trip Planner 🏍️

A motorcycle trip planning web app for exploring rural Japan. Plan routes, estimate costs, get AI-generated itineraries, and discover biker-friendly stops.

## Features

- **Route Planning** — Google Maps Directions with drag-to-reorder waypoints and suggested rest stops every ~2 hours
- **Cost Estimation** — Fuel, tolls, and accommodation costs calculated by distance and settings
- **AI Itinerary Generator** — Day-by-day itineraries powered by Claude AI with curated biker POI dataset
- **Seed Routes** — 4 curated trips: Nikko Ridge, Izu Peninsula, Japanese Alps, Kyushu Aso Caldera
- **Dark Mode** — Full dark/light mode with preference saved across sessions
- **Mobile Responsive** — Works on phone and desktop

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Google Maps API** — Directions, Places Autocomplete
- **Claude API** (claude-sonnet) — AI itinerary generation
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

- [ ] Biker POI map layer (cafes, famous roads, Michi-no-Eki, fuel gaps)
- [ ] Weather integration
- [ ] Google login + saved itineraries (Supabase)
- [ ] Hourly schedule breakdown
