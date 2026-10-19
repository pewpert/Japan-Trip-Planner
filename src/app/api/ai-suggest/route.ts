import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ItineraryDay } from "@/types/trip";
import { getRelevantPOIs } from "@/lib/poiFilter";

const VALID_SEASONS = ["spring", "summer", "autumn", "winter"] as const;
const VALID_BUDGETS = ["budget", "mid", "luxury"] as const;

const SYSTEM_PROMPT = `You are an expert touring planner for motorcyclists who live in Japan. The rider is a local: fluent in Japanese culture and road rules, reading this in English. Never explain basics a resident already knows (licences, helmets, how ETC or konbini work) and never write for a tourist.

Plan like an experienced Japanese touring rider:
- Rural and regional roads, passes (峠), coastal routes and quiet backroads over big-city centres (Tokyo, Osaka, Kyoto).
- Build days around the rider's range and the real world of fuel: stations in rural areas are closing, so place a fuel stop before long mountain or coastal stretches and never plan more than ~80% of the stated tank range between stops.
- Use 道の駅 and well-known SA/PA for meals and breaks, and finish most days early enough to reach the inn and soak in an onsen before dark. Avoid riding mountain roads after sunset.
- Respect the calendar: high passes close for winter (around November to April), bears are most active at dawn and dusk (especially October to December in Tohoku), and altitude is much colder than the valley. Put these in seasonalWarning.
- Keep daily riding to a realistic 5–7 hours including stops. Prefer rider-friendly lodging with covered or lockable motorcycle parking, and say so in parkingNote.
- Add practical local touches — good regional lunches, day-use onsen, a viewpoint that riders actually stop at.
- Where the rider's bike is 125cc or smaller, use no expressways at all.
- Use Japanese names with romaji where helpful, e.g. "Venus Line (ビーナスライン)".

When curated POI data is provided in the user message, prefer those verified real locations over inventing new ones.
Use curated POIs as anchors for your itinerary — build riding days around them. Only invent accommodation names when no curated option fits.

Return ONLY valid JSON with no markdown fences, no explanation, no extra text. The JSON must match this exact schema:
{
  "itinerary": [
    {
      "day": 1,
      "title": "string — e.g. Matsumoto to Takayama via Norikura Skyline",
      "startLocation": "string — city or town name",
      "endLocation": "string — city or town name",
      "distanceKm": number,
      "ridingTimeMinutes": number,
      "keyStops": ["string — place name or attraction"],
      "accommodation": {
        "name": "string — specific hotel/ryokan/guesthouse name",
        "type": "hotel | ryokan | guesthouse | camping",
        "hasMotorcycleParking": true | false,
        "parkingNote": "string — e.g. Free dedicated motorcycle parking, or Paid parking ¥500/night"
      },
      "pois": ["string — brief POI description"],
      "seasonalWarning": "string or null — e.g. Norikura Skyline closes November to May",
      "schedule": [
        { "time": "HH:MM", "activity": "string — brief activity description" }
      ]
    }
  ]
}

For each day include 6–10 schedule entries covering: morning departure, key riding segments, rest/fuel stops, lunch, afternoon riding, arrival at destination, and accommodation check-in.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      days,
      ridingStyles,
      interests,
      season,
      budget,
      regionsToInclude,
      regionsToAvoid,
      additionalComments,
      startLocation,
      roundTrip,
      bikeEngineCC,
      rangeKm,
    } = body;

    // Input validation
    if (typeof days !== "number" || days < 1 || days > 21) {
      return NextResponse.json({ error: "days must be a number between 1 and 21" }, { status: 400 });
    }
    if (!VALID_SEASONS.includes(season)) {
      return NextResponse.json({ error: "Invalid season" }, { status: 400 });
    }
    if (!VALID_BUDGETS.includes(budget)) {
      return NextResponse.json({ error: "Invalid budget" }, { status: 400 });
    }
    if (additionalComments && typeof additionalComments === "string" && additionalComments.length > 1000) {
      return NextResponse.json({ error: "Additional comments must be under 1000 characters" }, { status: 400 });
    }

    // Normalised rider context (all optional)
    const start: string =
      typeof startLocation === "string" ? startLocation.trim().slice(0, 120) : "";
    const returnToStart = roundTrip === true;
    const cc: number | null = typeof bikeEngineCC === "number" ? bikeEngineCC : null;
    const tankRangeKm: number | null =
      typeof rangeKm === "number" && rangeKm > 0 && rangeKm < 2000 ? Math.round(rangeKm) : null;

    // -------------------------------------------------------------------------
    // MOCK MODE — set ANTHROPIC_MOCK=true in .env.local to skip API calls
    // (checked before the API key so mock mode works without a live key)
    // Remove this block (and the flag) when credits are available
    // -------------------------------------------------------------------------
    if (process.env.ANTHROPIC_MOCK === "true") {
      const mockItinerary: ItineraryDay[] = Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        title: `Day ${i + 1} — Sample Riding Day (Mock)`,
        startLocation: i === 0 ? start || "Matsumoto, Nagano" : `Town ${i}`,
        endLocation: i === days - 1 ? (returnToStart && start ? start : "Kanazawa, Ishikawa") : `Town ${i + 1}`,
        distanceKm: 120 + i * 20,
        ridingTimeMinutes: 180 + i * 15,
        keyStops: ["Norikura Skyline", "Takayama Old Town", "Shirakawa-go"],
        accommodation: {
          name: "Hida Takayama Guesthouse",
          type: "guesthouse",
          hasMotorcycleParking: true,
          parkingNote: "Free dedicated motorcycle parking in rear lot",
        },
        pois: ["Norikura Skyline — famous mountain road", "Shirakawa-go — UNESCO village"],
        seasonalWarning: i === 0 ? "Norikura Skyline closes November to May" : null,
        schedule: [
          { time: "08:00", activity: "Depart — fuel up at local stand" },
          { time: "09:30", activity: "Ride Norikura Skyline — 2,700m summit road" },
          { time: "11:00", activity: "Coffee stop at Michi-no-Eki Norikura" },
          { time: "12:30", activity: "Lunch in Takayama old town — local ramen" },
          { time: "14:00", activity: "Explore Sanmachi Suji historic streets" },
          { time: "16:00", activity: "Ride to Shirakawa-go via Hida route" },
          { time: "17:30", activity: "Arrive accommodation — check in" },
          { time: "19:00", activity: "Dinner at guesthouse or local izakaya" },
        ],
      }));
      return NextResponse.json({ itinerary: mockItinerary });
    }
    // -------------------------------------------------------------------------

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
    }

    const budgetDescriptions = {
      budget: "budget traveller (hostels, guesthouses ~¥3,500/night)",
      mid: "mid-range (business hotels, guesthouses ~¥8,000/night)",
      luxury: "luxury (ryokan, quality hotels ~¥20,000+/night)",
    };

    // Get relevant curated POIs to inject as context — cuts hallucinations and token cost
    const relevantPOIs = getRelevantPOIs(
      regionsToInclude?.trim() || undefined,
      season,
      Array.isArray(interests) ? interests : [],
      20
    );

    const poisContext =
      relevantPOIs.length > 0
        ? `\n\nCurated verified locations for this region/season (use these as your primary reference):\n${relevantPOIs
            .map((p) => `- ${p.name} (${p.type}) — ${p.description} [${p.address}]`)
            .join("\n")}`
        : "";

    const commentsSection =
      additionalComments?.trim()
        ? `\n\nRider's special requests: ${additionalComments.trim()}`
        : "";

    const bikeLine =
      cc === null
        ? ""
        : cc <= 125
          ? "\nBike: 125cc or smaller — expressways are not allowed, so plan national routes and prefectural roads only."
          : `\nBike: roughly ${cc >= 750 ? "401cc or larger" : cc >= 400 ? "251–400cc" : "126–250cc"}, expressways allowed.`;
    const rangeLine = tankRangeKm
      ? `\nTank range: about ${tankRangeKm} km on a full tank — keep fuel stops within ${Math.round(tankRangeKm * 0.8)} km of each other.`
      : "";
    const startLine = start
      ? `The rider starts from ${start}${returnToStart ? " and wants to return there at the end (a loop)" : " and finishes somewhere new (one way)"}.`
      : "No start location was given — choose a sensible starting point in a region that suits the preferences.";

    const userMessage = `Plan a ${days}-day motorcycle trip in Japan for a local rider.

${startLine}${bikeLine}${rangeLine}
Riding style preference: ${Array.isArray(ridingStyles) && ridingStyles.length > 0 ? ridingStyles.join(", ") : "no strong preference"}.
Interests: ${Array.isArray(interests) && interests.length > 0 ? interests.join(", ") : "general sightseeing"}.
Season: ${season}.
Budget: ${budgetDescriptions[budget as keyof typeof budgetDescriptions]}.
Regions to include: ${regionsToInclude?.trim() || "no preference — suggest the best for the preferences above"}.
Regions to avoid: ${regionsToAvoid?.trim() || "none specified"}.

Choose routes that reward motorcycle riding — twisty mountain roads, scenic coastal stretches, and quiet rural roads — and avoid big-city centres unless they are unavoidable.${commentsSection}${poisContext}`;

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-5",
      // 8192 gives headroom for up-to-21-day itineraries without JSON truncation
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawContent = message.content[0];
    if (rawContent.type !== "text") {
      return NextResponse.json({ error: "Unexpected response format from AI" }, { status: 500 });
    }

    // Strip any accidental markdown fences before parsing
    const cleaned = rawContent.text
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();

    let parsed: { itinerary: ItineraryDay[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("[/api/ai-suggest] Failed to parse JSON:", cleaned.slice(0, 200));
      return NextResponse.json({ error: "AI returned invalid JSON — please try again" }, { status: 500 });
    }

    if (!Array.isArray(parsed.itinerary) || parsed.itinerary.length === 0) {
      return NextResponse.json({ error: "AI returned an empty itinerary — please try again" }, { status: 500 });
    }

    return NextResponse.json({ itinerary: parsed.itinerary });
  } catch (err) {
    console.error("[/api/ai-suggest]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
