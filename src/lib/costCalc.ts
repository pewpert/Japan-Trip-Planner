import type { TripSettings, CostBreakdown } from "@/types/trip";

/**
 * Estimates fuel cost for a route.
 * Japan fuel prices vary but ~165-185 JPY/L for regular (レギュラー) is typical.
 */
export function calculateFuelCost(
  distanceKm: number,
  settings: TripSettings
): number {
  const litersNeeded = distanceKm / settings.fuelEfficiency;
  return Math.round(litersNeeded * settings.fuelPricePerLiter);
}

/**
 * Rough toll estimate based on distance.
 * Japan expressway tolls average ~25-30 JPY/km for regular vehicles.
 * Motorcycles (under 125cc) are often cheaper; 125cc+ pay regular car rates.
 * This is an approximation — actual tolls vary by route.
 */
export function estimateTollCost(
  distanceKm: number,
  settings: TripSettings
): number {
  // Assume ~40% of route uses expressways (adjustable)
  const expresswayKm = distanceKm * 0.4;
  const ratePerKm = settings.bikeEngineCC >= 125 ? 27 : 15; // JPY/km
  return Math.round(expresswayKm * ratePerKm);
}

/**
 * Nightly accommodation estimate ranges by budget level.
 */
export function estimateAccommodationCost(
  budget: TripSettings["budget"]
): number {
  const ranges: Record<TripSettings["budget"], number> = {
    budget: 3500, // capsule hotels, hostels, cheap guesthouses
    mid: 8000, // business hotels, standard guesthouses
    luxury: 20000, // ryokan, quality hotels
  };
  return ranges[budget];
}

/**
 * Full trip cost breakdown.
 */
export function calculateTripCost(
  distanceKm: number,
  durationMinutes: number,
  settings: TripSettings
): CostBreakdown {
  const fuel = calculateFuelCost(distanceKm, settings);
  const tolls = estimateTollCost(distanceKm, settings);
  const accommodation = estimateAccommodationCost(settings.budget);

  return {
    fuel,
    tolls,
    accommodation,
    total: fuel + tolls + accommodation,
    distanceKm,
    durationMinutes,
  };
}

/**
 * Format JPY amount for display (e.g. ¥12,500)
 */
export function formatJPY(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/**
 * Format duration in minutes to human-readable (e.g. "3h 25m")
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
