import type { RouteResult, SuggestedBreak } from "@/types/route";
import type { CostBreakdown, ItineraryDay } from "@/types/trip";
import { formatDuration } from "@/lib/costCalc";
import { BRAND } from "@/lib/brand";

function formatJPYPlain(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/** The ride-day details worth sharing alongside the route. */
export interface BriefingExport {
  dayLabel: string; // "Sat 24 Oct"
  departure: string; // "07:00"
  arrival: string; // "13:15"
  sunset: string | null;
  verdict: string | null; // "Good to ride"
  fuelRangeKm: number;
  fuelStops: number;
  notes: string[]; // advisory titles
}

/** Plain-text summary — pastes cleanly into LINE, Slack or email. */
export function buildTripSummaryText(params: {
  origin: string;
  destination: string;
  waypoints: string[];
  route: RouteResult;
  costBreakdown: CostBreakdown;
  suggestedBreaks: SuggestedBreak[];
  itinerary?: ItineraryDay[];
  briefing?: BriefingExport;
}): string {
  const { origin, destination, waypoints, route, costBreakdown, suggestedBreaks, itinerary, briefing } =
    params;

  const lines: string[] = [];

  lines.push(`${BRAND.name} ${BRAND.kanji} — ride plan`);
  lines.push("");

  lines.push(`${origin} → ${destination}`);
  if (waypoints.length > 0) {
    lines.push(`via ${waypoints.join(" → ")}`);
  }
  lines.push(`${route.distanceKm.toFixed(0)} km · ${formatDuration(route.durationMinutes)} riding`);

  if (briefing) {
    lines.push("");
    lines.push(`${briefing.dayLabel}${briefing.verdict ? ` — ${briefing.verdict}` : ""}`);
    lines.push(
      `Depart ${briefing.departure} · arrive ${briefing.arrival}` +
        (briefing.sunset ? ` · sunset ${briefing.sunset}` : "")
    );
    lines.push(
      `Tank range ~${briefing.fuelRangeKm} km` +
        (briefing.fuelStops > 0
          ? ` · ${briefing.fuelStops} fuel stop${briefing.fuelStops > 1 ? "s" : ""} planned`
          : " · no fuel stop needed")
    );
    if (briefing.notes.length > 0) {
      lines.push("");
      lines.push("Heads-up:");
      briefing.notes.forEach((note) => lines.push(`- ${note}`));
    }
  }

  lines.push("");
  lines.push(
    `Estimated cost: fuel ${formatJPYPlain(costBreakdown.fuel)} + tolls ${formatJPYPlain(costBreakdown.tolls)}` +
      ` = ${formatJPYPlain(costBreakdown.fuel + costBreakdown.tolls)}`
  );

  if (suggestedBreaks.length > 0) {
    lines.push("");
    lines.push("Breaks:");
    suggestedBreaks.forEach((brk, i) => {
      lines.push(
        `${i + 1}. after ${formatDuration(brk.timeIntoRideMinutes)} (${brk.distanceIntoRouteKm} km in)`
      );
    });
  }

  if (itinerary && itinerary.length > 0) {
    lines.push("");
    lines.push("Itinerary:");
    itinerary.forEach((day) => {
      lines.push(`Day ${day.day} — ${day.title}`);
      lines.push(
        `  ${day.startLocation} → ${day.endLocation} · ${day.distanceKm} km · ${formatDuration(day.ridingTimeMinutes)}`
      );
      if (day.keyStops.length > 0) {
        lines.push(`  Stops: ${day.keyStops.join(", ")}`);
      }
      lines.push(`  Stay: ${day.accommodation.name} (${day.accommodation.type})`);
      if (day.seasonalWarning) {
        lines.push(`  Note: ${day.seasonalWarning}`);
      }
    });
  }

  return lines.join("\n");
}
