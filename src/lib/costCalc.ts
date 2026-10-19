import type { TripSettings, CostBreakdown, ItineraryDay, RoadMix } from "@/types/trip";

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

// ---------------------------------------------------------------------------
// Expressway tolls (高速道路料金)
//
// Motorcycles are in the 軽自動車等 vehicle class, charged at 0.8× the
// standard-car rate (the class ratio has been fixed since 1989). Bikes of
// 125cc or less are not allowed on expressways at all. The ¥/km and terminal
// figures below are NEXCO's standard-car base rates and are estimates — city
// expressways (首都高, 阪神高速) use flat fees and are not modelled.
// ---------------------------------------------------------------------------

/** Expressways are closed to motorcycles of 125cc and under. */
export const MIN_EXPRESSWAY_CC = 126;
export const MOTORCYCLE_TOLL_RATIO = 0.8;
const STANDARD_CAR_YEN_PER_KM = 24.6;
const STANDARD_CAR_TERMINAL_YEN = 150;

/** NEXCO 二輪車定率割引: 37.5% off single runs longer than 80 km on pre-registered weekend days. */
export const ETC_WEEKEND_DISCOUNT_RATE = 0.375;
export const ETC_DISCOUNT_MIN_RUN_KM = 80;

/** Share of the route assumed to be on expressways for each road mix. */
export const ROAD_MIX_SHARE: Record<RoadMix, number> = {
  backroads: 0.05,
  mixed: 0.4,
  expressway: 0.7,
};

export const ROAD_MIX_LABEL: Record<RoadMix, string> = {
  backroads: "Back roads",
  mixed: "Mixed",
  expressway: "Expressway",
};

export function canUseExpressways(engineCC: number): boolean {
  return engineCC >= MIN_EXPRESSWAY_CC;
}

/** True when the route should steer clear of expressways. */
export function shouldAvoidExpressways(settings: TripSettings): boolean {
  return !canUseExpressways(settings.bikeEngineCC) || settings.roadMix === "backroads";
}

export function expresswayShare(settings: TripSettings): number {
  if (!canUseExpressways(settings.bikeEngineCC)) return 0;
  return ROAD_MIX_SHARE[settings.roadMix ?? "mixed"];
}

/** Estimated toll for a single leg of `distanceKm`. */
export function estimateTollCost(
  distanceKm: number,
  settings: TripSettings
): number {
  const expresswayKm = distanceKm * expresswayShare(settings);
  if (expresswayKm < 1) return 0;

  const standardCarToll =
    expresswayKm * STANDARD_CAR_YEN_PER_KM + STANDARD_CAR_TERMINAL_YEN;
  let toll = standardCarToll * MOTORCYCLE_TOLL_RATIO;

  // The discount only applies to a single run over 80 km, so a short
  // expressway stretch earns nothing.
  if (settings.etcWeekendDiscount && expresswayKm >= ETC_DISCOUNT_MIN_RUN_KM) {
    toll *= 1 - ETC_WEEKEND_DISCOUNT_RATE;
  }
  return Math.round(toll);
}

/** One-line description of the assumptions behind the toll estimate. */
export function describeTollAssumptions(settings: TripSettings): string {
  if (!canUseExpressways(settings.bikeEngineCC)) {
    return "No expressways — 125cc and under are not permitted";
  }
  const pct = Math.round(expresswayShare(settings) * 100);
  const parts = [`~${pct}% expressway`, "motorcycle class (0.8× car rate)"];
  if (settings.etcWeekendDiscount) parts.push("weekend ETC discount −37.5%");
  return parts.join(" · ");
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
 * Low/high cost range for a trip.
 * Low: better fuel efficiency, avoiding some tolls, budget accommodation floor
 * High: worse efficiency, more expressway use, premium accommodation ceiling
 */
export function calculateTripCostRange(
  distanceKm: number,
  durationMinutes: number,
  settings: TripSettings
): { low: CostBreakdown; high: CostBreakdown } {
  const baseFuel = calculateFuelCost(distanceKm, settings);
  const baseTolls = estimateTollCost(distanceKm, settings);
  const baseAccommodation = estimateAccommodationCost(settings.budget);

  const lowFuel = Math.round(baseFuel * 0.9);
  const lowTolls = Math.round(baseTolls * 0.8);
  const lowAccommodation = Math.round(baseAccommodation * 0.85);

  const highFuel = Math.round(baseFuel * 1.15);
  const highTolls = Math.round(baseTolls * 1.2);
  const highAccommodation = Math.round(baseAccommodation * 1.2);

  return {
    low: {
      fuel: lowFuel,
      tolls: lowTolls,
      accommodation: lowAccommodation,
      total: lowFuel + lowTolls + lowAccommodation,
      distanceKm,
      durationMinutes,
    },
    high: {
      fuel: highFuel,
      tolls: highTolls,
      accommodation: highAccommodation,
      total: highFuel + highTolls + highAccommodation,
      distanceKm,
      durationMinutes,
    },
  };
}

/**
 * Low/high cost range for a full multi-day itinerary.
 * Fuel and tolls are summed across every day's distance; accommodation is
 * one night per itinerary day. Uses the same low/high multipliers as
 * calculateTripCostRange so single-leg and whole-trip estimates stay consistent.
 */
export function calculateItineraryCostRange(
  itinerary: ItineraryDay[],
  settings: TripSettings
): { low: CostBreakdown; high: CostBreakdown } {
  const totalDistanceKm = itinerary.reduce((sum, d) => sum + d.distanceKm, 0);
  const totalRidingMinutes = itinerary.reduce(
    (sum, d) => sum + d.ridingTimeMinutes,
    0
  );
  const nights = itinerary.length;

  const baseFuel = itinerary.reduce(
    (sum, d) => sum + calculateFuelCost(d.distanceKm, settings),
    0
  );
  const baseTolls = itinerary.reduce(
    (sum, d) => sum + estimateTollCost(d.distanceKm, settings),
    0
  );
  const baseAccommodation = estimateAccommodationCost(settings.budget) * nights;

  const lowFuel = Math.round(baseFuel * 0.9);
  const lowTolls = Math.round(baseTolls * 0.8);
  const lowAccommodation = Math.round(baseAccommodation * 0.85);

  const highFuel = Math.round(baseFuel * 1.15);
  const highTolls = Math.round(baseTolls * 1.2);
  const highAccommodation = Math.round(baseAccommodation * 1.2);

  return {
    low: {
      fuel: lowFuel,
      tolls: lowTolls,
      accommodation: lowAccommodation,
      total: lowFuel + lowTolls + lowAccommodation,
      distanceKm: totalDistanceKm,
      durationMinutes: totalRidingMinutes,
    },
    high: {
      fuel: highFuel,
      tolls: highTolls,
      accommodation: highAccommodation,
      total: highFuel + highTolls + highAccommodation,
      distanceKm: totalDistanceKm,
      durationMinutes: totalRidingMinutes,
    },
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
