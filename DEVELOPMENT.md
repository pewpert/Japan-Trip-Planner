# Local Development Guide

Everything you need to run and iterate on this app on your own machine.

## Prerequisites

- **Node.js 20.9 or newer** — check with `node -v`; install the LTS from [nodejs.org](https://nodejs.org) if missing.
- **git** — ships with macOS (`git --version` to confirm).

## First-time setup

```bash
# 1. Get the code (skip if you already have the folder)
git clone https://github.com/pewpert/Japan-Trip-Planner.git
cd Japan-Trip-Planner

# 2. Install dependencies
npm install

# 3. Create your local settings file
cp .env.local.example .env.local
```

Open `.env.local` and paste your Google Maps key if you have one. Leave
`ANTHROPIC_MOCK=true` while developing — the AI itinerary generator returns a
built-in sample trip, so you don't need an Anthropic key or credits.

## Everyday development

```bash
cd Japan-Trip-Planner   # always work from inside the project folder
npm run dev:mock        # start the dev server with mock AI (no keys needed)
```

Open <http://localhost:3000>. The page hot-reloads as files change.
Stop the server with `Ctrl+C`. Use `npm run dev` instead once you have a real
`ANTHROPIC_API_KEY` and want live AI itineraries.

### Pulling the latest changes

```bash
git pull
npm install    # picks up any new dependencies
```

Then restart the dev server — a running server keeps using the code it
started with.

## Iterating with Claude Code locally

For the fastest loop, run Claude Code on your machine so it edits files
directly on disk while the dev server hot-reloads:

```bash
npm install -g @anthropic-ai/claude-code   # once
cd Japan-Trip-Planner
claude
```

Keep `npm run dev:mock` running in a second terminal window. Ask for changes
in plain English; they appear at localhost:3000 within seconds. Commit and
push from inside Claude Code (just ask it to) so GitHub stays the backup.

## Quality checks

```bash
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript
npm run build       # production build — catches what dev mode tolerates
```

## Troubleshooting

**"fatal: not a git repository" or npm ENOENT about package.json**
You're not inside the project folder. Run `cd ~/Japan-Trip-Planner` first —
every git/npm command must run from inside it.

**Dev server eats memory / "Can't resolve 'tailwindcss' in /Users/…"**
A stray `package.json` / `package-lock.json` / `node_modules` in your home
folder (from running `npm install` in the wrong place) makes Next.js treat
your whole home directory as the project. Delete the strays:

```bash
rm -f ~/package.json ~/package-lock.json && rm -rf ~/node_modules
```

The project also pins `turbopack.root` in `next.config.ts` as a guard, but
the strays are worth removing regardless.

**Weird build errors after switching branches**
Clean reinstall fixes most of it:

```bash
rm -rf node_modules .next
npm ci
```

**Two copies of the project?**
If you ever see both `~/japan-trip-planner` and `~/Japan-Trip-Planner`,
you're at risk of editing one and running the other. Keep one, rename the
other out of the way (`mv ~/japan-trip-planner ~/japan-trip-planner-OLD`).

**Map shows "This page can't load Google Maps correctly"**
Your Maps key is missing or has no billing account linked. In
[Google Cloud Console](https://console.cloud.google.com): link billing, and
enable **Maps JavaScript API**, **Directions API**, and **Places API**.
Everything except the map and route planning works without the key.
