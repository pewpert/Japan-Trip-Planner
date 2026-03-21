import type { RouteResult, SuggestedBreak } from "@/types/route";

const BREAK_INTERVAL_MINUTES = 120;
const MAX_BREAKS = 4;

function buildBreakNote(distanceKm: number, totalKm: number): string {
  const fraction = distanceKm / totalKm;
  if (fraction < 0.25) {
    return "Early rest stop — good point to refuel and stretch before the road ahead";
  } else if (fraction < 0.6) {
    return "Midpoint break — look for a Michi-no-Eki (道の駅) for food, coffee, and rest facilities";
  } else {
    return "Late-ride rest — convenience stores (コンビニ) are plentiful on most Japanese roads";
  }
}

export function computeSuggestedBreaks(route: RouteResult): SuggestedBreak[] {
  // No breaks needed for rides under 2 hours
  if (route.durationMinutes < BREAK_INTERVAL_MINUTES) return [];
  // Need at least some steps and a starting polyline point
  if (route.steps.length === 0 || route.polylinePath.length === 0) return [];

  const breaks: SuggestedBreak[] = [];
  let cumulativeDuration = 0;
  let cumulativeDistance = 0;
  let nextBreakAt = BREAK_INTERVAL_MINUTES;
  let prevCoords = route.polylinePath[0];

  for (const step of route.steps) {
    const prevDuration = cumulativeDuration;
    const prevDistance = cumulativeDistance;

    cumulativeDuration += step.durationMinutes;
    cumulativeDistance += step.distanceKm;

    // Check if one or more break thresholds fall within this step
    while (
      nextBreakAt <= cumulativeDuration &&
      nextBreakAt < route.durationMinutes - 30 &&
      breaks.length < MAX_BREAKS
    ) {
      const stepDuration = step.durationMinutes;
      const fraction = stepDuration > 0
        ? (nextBreakAt - prevDuration) / stepDuration
        : 1;

      // Linearly interpolate position along this step
      const lat = prevCoords.lat + (step.coordinates.lat - prevCoords.lat) * fraction;
      const lng = prevCoords.lng + (step.coordinates.lng - prevCoords.lng) * fraction;
      const distanceAtBreak = prevDistance + step.distanceKm * fraction;

      const breakIndex = breaks.length + 1;
      breaks.push({
        id: `break-${breakIndex}`,
        coordinates: { lat, lng },
        timeIntoRideMinutes: nextBreakAt,
        distanceIntoRouteKm: Math.round(distanceAtBreak * 10) / 10,
        label: `Break ${breakIndex}`,
        note: buildBreakNote(distanceAtBreak, route.distanceKm),
      });

      nextBreakAt += BREAK_INTERVAL_MINUTES;
    }

    prevCoords = step.coordinates;
  }

  return breaks;
}
