import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ItineraryDay } from "@/types/trip";
import { getRelevantPOIs } from "@/lib/poiFilter";

const VALID_SEASONS = ["spring", "summer", "autumn", "winter"] as const;
const VALID_BUDGETS = ["budget", "mid", "luxury"] as const;

const SYSTEM_PROMPT = `You are an expert motorcycle trip planner for Japan, specialising in rural and regional routes away from major cities like Tokyo, Osaka, and Kyoto.

You plan safe, enjoyable itineraries that respect seasonal road conditions, Japanese traffic laws, and local culture.
Focus on scenic backroads, mountain passes, coastal highways, and authentic rural Japan experiences.
Always include practical motorcycle-specific notes (parking, road conditions, seasonal closures).

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

    const userMessage = `Plan a ${days}-day motorcycle trip in Japan.

Riding style preference: ${Array.isArray(ridingStyles) && ridingStyles.length > 0 ? ridingStyles.join(", ") : "no strong preference"}.
Interests: ${Array.isArray(interests) && interests.length > 0 ? interests.join(", ") : "general sightseeing"}.
Season: ${season}.
Budget: ${budgetDescriptions[budget as keyof typeof budgetDescriptions]}.
Regions to include: ${regionsToInclude?.trim() || "no preference — suggest the best for the preferences above"}.
Regions to avoid: ${regionsToAvoid?.trim() || "none specified"}.

Always avoid major city centers (Tokyo, Osaka, Kyoto) unless they are unavoidable transit points.
Choose routes that reward motorcycle riding — twisty mountain roads, scenic coastal stretches, and quiet rural roads.
Start from a practical gateway city that has good transport links (shinkansen or airport) for arriving foreign visitors.${commentsSection}${poisContext}`;

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
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
