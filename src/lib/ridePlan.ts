import type { RouteResult } from "@/types/route";
import type { TripSettings } from "@/types/trip";
import type { FuelPlan, FuelStop, JstDay, RideTimeline } from "@/types/ride";

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const BREAK_MINUTES = 15;
export const LUNCH_MINUTES = 45;
/** Rides with at least this much saddle time are assumed to include lunch. */
const LUNCH_THRESHOLD_MINUTES = 240;
/** Keep this fraction of the tank in reserve when spacing fuel stops. */
const FUEL_RESERVE_FRACTION = 0.2;

// ---------------------------------------------------------------------------
// Dates (Japan Standard Time)
// ---------------------------------------------------------------------------

/** The calendar day `offset` days from `now`, in JST. */
export function getJstDay(offset: number, now: Date = new Date()): JstDay {
  const shifted = new Date(now.getTime() + JST_OFFSET_MS + offset * 86_400_000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { offset, year, month, day, weekday: shifted.getUTCDay(), iso };
}

export function isWeekend(day: JstDay): boolean {
  return day.weekday === 0 || day.weekday === 6;
}

/** "Sat 24 Oct" */
export function formatJstDay(day: JstDay): string {
  const monthName = new Date(Date.UTC(2000, day.month - 1, 1)).toLocaleString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
  return `${WEEKDAYS[day.weekday]} ${day.day} ${monthName}`;
}

// ---------------------------------------------------------------------------
// Clock helpers
// ---------------------------------------------------------------------------

/** "08:30" → 510. Falls back to 08:00 on malformed input. */
export function parseClock(value: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return 8 * 60;
  const h = Math.min(23, Number(match[1]));
  const m = Math.min(59, Number(match[2]));
  return h * 60 + m;
}

/** 510 → "08:30". Minutes past 1440 wrap to the next day. */
export function formatClock(minutes: number): string {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** 465 → "7h 45m" */
export function formatSpan(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ---------------------------------------------------------------------------
// Sunrise / sunset (NOAA "sunrise equation"; accurate to a minute or two)
// ---------------------------------------------------------------------------

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/**
 * Sunrise and sunset for a JST calendar day at (lat, lng), as minutes after
 * midnight JST. `lng` is positive east. Returns null where the sun does not
 * rise or set (not a concern in Japan, but the maths can fail at the poles).
 */
export function getSunTimes(
  day: Pick<JstDay, "year" | "month" | "day">,
  lat: number,
  lng: number
): { sunriseMinutes: number; sunsetMinutes: number } | null {
  // Julian date of 12:00 UTC on the calendar date
  const jdNoon = Date.UTC(day.year, day.month - 1, day.day, 12) / 86_400_000 + 2440587.5;
  const n = Math.round(jdNoon - 2451545.0 + 0.0008);

  const meanSolarTime = n - lng / 360;
  const M = (357.5291 + 0.98560028 * meanSolarTime) % 360;
  const C =
    1.9148 * Math.sin(rad(M)) + 0.02 * Math.sin(rad(2 * M)) + 0.0003 * Math.sin(rad(3 * M));
  const lambda = (M + C + 180 + 102.9372) % 360;
  const transit =
    2451545.0 +
    meanSolarTime +
    0.0053 * Math.sin(rad(M)) -
    0.0069 * Math.sin(rad(2 * lambda));

  const sinDec = Math.sin(rad(lambda)) * Math.sin(rad(23.4397));
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosHourAngle =
    (Math.sin(rad(-0.833)) - Math.sin(rad(lat)) * sinDec) / (Math.cos(rad(lat)) * cosDec);
  if (cosHourAngle < -1 || cosHourAngle > 1) return null;

  const hourAngle = deg(Math.acos(cosHourAngle));
  const toJstMinutes = (jd: number) => {
    const utcMs = (jd - 2440587.5) * 86_400_000;
    const minutes = (utcMs + JST_OFFSET_MS) / 60_000;
    return ((minutes % 1440) + 1440) % 1440;
  };

  return {
    sunriseMinutes: toJstMinutes(transit - hourAngle / 360),
    sunsetMinutes: toJstMinutes(transit + hourAngle / 360),
  };
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export function computeTimeline(params: {
  route: RouteResult;
  breakCount: number;
  departure: string;
  day: JstDay;
}): RideTimeline {
  const { route, breakCount, departure, day } = params;

  const movingMinutes = route.durationMinutes;
  const lunchIncluded = movingMinutes >= LUNCH_THRESHOLD_MINUTES;
  const stopMinutes = breakCount * BREAK_MINUTES + (lunchIncluded ? LUNCH_MINUTES : 0);
  const totalMinutes = movingMinutes + stopMinutes;
  const departureMinutes = parseClock(departure);
  const arrivalMinutes = departureMinutes + totalMinutes;

  // Sunset at the destination — the end of the polyline
  const end = route.polylinePath[route.polylinePath.length - 1];
  const sun = end ? getSunTimes(day, end.lat, end.lng) : null;
  const sunsetMinutes = sun ? sun.sunsetMinutes : null;

  return {
    departureMinutes,
    movingMinutes,
    stopMinutes,
    totalMinutes,
    breakCount,
    lunchIncluded,
    arrivalMinutes,
    sunsetMinutes,
    daylightBufferMinutes: sunsetMinutes === null ? null : sunsetMinutes - arrivalMinutes,
  };
}

// ---------------------------------------------------------------------------
// Fuel range
// ---------------------------------------------------------------------------

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Points on the polyline at the given distances (km), scaled to route.distanceKm. */
function pointsAtDistances(route: RouteResult, targetsKm: number[]): FuelStop[] {
  const path = route.polylinePath;
  if (path.length < 2) return [];

  const cumulative: number[] = [0];
  for (let i = 1; i < path.length; i++) {
    cumulative.push(cumulative[i - 1] + haversineKm(path[i - 1], path[i]));
  }
  const pathLength = cumulative[cumulative.length - 1];
  if (pathLength === 0) return [];
  const scale = route.distanceKm / pathLength;

  return targetsKm.map((target, index) => {
    const wanted = target / scale;
    let i = 1;
    while (i < cumulative.length - 1 && cumulative[i] < wanted) i++;
    const span = cumulative[i] - cumulative[i - 1];
    const t = span > 0 ? (wanted - cumulative[i - 1]) / span : 0;
    return {
      id: `fuel-${index + 1}`,
      distanceKm: Math.round(target),
      coordinates: {
        lat: path[i - 1].lat + (path[i].lat - path[i - 1].lat) * t,
        lng: path[i - 1].lng + (path[i].lng - path[i - 1].lng) * t,
      },
    };
  });
}

/**
 * Where to top up. Stops are spaced at 80% of a full tank's range so the
 * bike never reaches the last 20% between stations — rural fuel stations are
 * disappearing, so a missed one must not strand the rider.
 */
export function computeFuelPlan(route: RouteResult, settings: TripSettings): FuelPlan {
  const rangeKm = Math.round((settings.tankCapacityL ?? 14) * settings.fuelEfficiency);
  const legKm = Math.max(40, Math.round(rangeKm * (1 - FUEL_RESERVE_FRACTION)));

  const targets: number[] = [];
  // No stop needed in the final stretch — the rider arrives and refuels later
  for (let km = legKm; km < route.distanceKm - legKm * 0.25; km += legKm) {
    targets.push(km);
  }

  return { rangeKm, legKm, stops: pointsAtDistances(route, targets) };
}

/** A Google Maps search for `query` centred on a coordinate. */
export function mapsSearchUrl(query: string, at: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${at.lat.toFixed(5)},${at.lng.toFixed(5)},14z`;
}
