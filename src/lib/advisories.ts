import type { RouteResult } from "@/types/route";
import type { TripSettings } from "@/types/trip";
import type { WeatherCondition, WeatherPoint } from "@/types/weather";
import type {
  Advisory,
  AdvisorySeverity,
  FuelPlan,
  JstDay,
  RideTimeline,
  Verdict,
} from "@/types/ride";
import { canUseExpressways, expresswayShare } from "@/lib/costCalc";
import { formatClock, formatSpan, isWeekend } from "@/lib/ridePlan";

export interface RideContext {
  route: RouteResult;
  settings: TripSettings;
  weather: WeatherPoint[];
  day: JstDay;
  timeline: RideTimeline;
  fuelPlan: FuelPlan;
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

/**
 * NEXCO's weekend motorcycle discount (二輪車定率割引) is announced yearly.
 * Add each year's window here once published.
 */
const ETC_MOTORCYCLE_WINDOWS: Record<number, { start: string; end: string; hokkaidoEnd: string }> = {
  2026: { start: "2026-04-04", end: "2026-11-29", hokkaidoEnd: "2026-10-31" },
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Dec–Apr plus November: mountain roads above ~800 m commonly close. */
const WINTER_CLOSURE_MONTHS = new Set([11, 12, 1, 2, 3, 4]);
/** Bear activity peaks: dispersal (May), breeding (Jun–Jul), pre-hibernation (Oct–Dec). */
const BEAR_ACTIVE_MONTHS = new Set([5, 6, 7, 10, 11, 12]);

const JMA_RAIN_RADAR = "https://www.jma.go.jp/bosai/nowc/";
const JARTIC_ROAD_INFO = "https://www.jartic.or.jp/";
const DRIVE_PLAZA = "https://www.driveplaza.com/";

// Heuristic thresholds
const RAIN_CAUTION_MM = 1;
const RAIN_ALERT_MM = 10;
const WIND_CAUTION_KMH = 40;
const FREEZE_CAUTION_C = 3;
const LONG_DAY_MOVING_MINUTES = 8 * 60;
const HIGH_ROAD_ELEVATION_M = 800;
const LAPSE_RATE_C_PER_M = 0.006;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** The forecast for the chosen ride day at a sampled point. */
export function conditionForDay(point: WeatherPoint, offset: number): WeatherCondition | undefined {
  return point.forecast[offset] ?? (offset === 0 ? point.current : undefined);
}

interface WeatherSummary {
  maxPrecipMm: number;
  maxWindKmh: number;
  minTempC: number;
  maxTempC: number;
  unsafeAt: string | null;
  unsafeDescription: string | null;
  maxElevationM: number | null;
  startElevationM: number | null;
}

function summarizeWeather(weather: WeatherPoint[], offset: number): WeatherSummary {
  let maxPrecipMm = 0;
  let maxWindKmh = 0;
  let minTempC = Infinity;
  let maxTempC = -Infinity;
  let unsafeAt: string | null = null;
  let unsafeDescription: string | null = null;
  let maxElevationM: number | null = null;

  for (const point of weather) {
    const c = conditionForDay(point, offset);
    if (c) {
      maxPrecipMm = Math.max(maxPrecipMm, c.precipitationMm);
      maxWindKmh = Math.max(maxWindKmh, c.windSpeedKmh);
      minTempC = Math.min(minTempC, c.tempMin);
      maxTempC = Math.max(maxTempC, c.tempMax);
      if (!c.isRideSafe && unsafeAt === null) {
        unsafeAt = point.locationName;
        unsafeDescription = c.description.toLowerCase();
      }
    }
    if (point.elevationM !== undefined) {
      maxElevationM = Math.max(maxElevationM ?? -Infinity, point.elevationM);
    }
  }

  return {
    maxPrecipMm,
    maxWindKmh,
    minTempC: minTempC === Infinity ? 0 : minTempC,
    maxTempC: maxTempC === -Infinity ? 0 : maxTempC,
    unsafeAt,
    unsafeDescription,
    maxElevationM,
    startElevationM: weather[0]?.elevationM ?? null,
  };
}

const SEVERITY_ORDER: Record<AdvisorySeverity, number> = { alert: 0, caution: 1, info: 2 };

function maxLatitude(route: RouteResult): number {
  return route.polylinePath.reduce((max, p) => Math.max(max, p.lat), -90);
}

function etcWindowFor(day: JstDay) {
  return ETC_MOTORCYCLE_WINDOWS[day.year];
}

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

/** One-glance answer for the chosen day. Returns null until a forecast exists. */
export function computeVerdict(ctx: RideContext): Verdict | null {
  if (ctx.weather.length === 0) return null;

  const w = summarizeWeather(ctx.weather, ctx.day.offset);
  const stop: string[] = [];
  const caution: string[] = [];

  if (w.unsafeAt) {
    stop.push(`${capitalize(w.unsafeDescription ?? "Severe weather")} forecast at ${w.unsafeAt}`);
  }
  if (w.maxPrecipMm >= RAIN_ALERT_MM) {
    stop.push(`Heavy rain — up to ${Math.round(w.maxPrecipMm)} mm along the route`);
  } else if (w.maxPrecipMm >= RAIN_CAUTION_MM) {
    caution.push(`Rain on the route — up to ${w.maxPrecipMm.toFixed(1)} mm`);
  }
  if (w.maxWindKmh >= WIND_CAUTION_KMH) {
    caution.push(`Strong wind — up to ${Math.round(w.maxWindKmh)} km/h`);
  }
  if (w.minTempC <= FREEZE_CAUTION_C) {
    caution.push(`Near-freezing — low of ${Math.round(w.minTempC)}°C, watch shaded corners`);
  }
  if (ctx.timeline.daylightBufferMinutes !== null && ctx.timeline.daylightBufferMinutes < 0) {
    caution.push(
      `Arrive ${formatSpan(-ctx.timeline.daylightBufferMinutes)} after sunset — plan to leave earlier`
    );
  }
  if (ctx.timeline.movingMinutes >= LONG_DAY_MOVING_MINUTES) {
    caution.push(`Long day — ${formatSpan(ctx.timeline.movingMinutes)} in the saddle`);
  }
  if (
    WINTER_CLOSURE_MONTHS.has(ctx.day.month) &&
    w.maxElevationM !== null &&
    w.maxElevationM >= HIGH_ROAD_ELEVATION_M
  ) {
    caution.push("High roads may be closed for winter (冬季閉鎖)");
  }

  if (stop.length > 0) {
    return { level: "stop", headline: "Not recommended", reasons: [...stop, ...caution].slice(0, 3) };
  }
  if (caution.length > 0) {
    return { level: "caution", headline: "Ride with care", reasons: caution.slice(0, 3) };
  }
  return {
    level: "go",
    headline: "Good to ride",
    reasons: [
      `${Math.round(w.minTempC)}–${Math.round(w.maxTempC)}°C, dry, light wind`,
      ctx.timeline.daylightBufferMinutes !== null
        ? `Home ${formatSpan(ctx.timeline.daylightBufferMinutes)} before sunset`
        : "Daylight arrival",
    ],
  };
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---------------------------------------------------------------------------
// Advisories
// ---------------------------------------------------------------------------

export function buildAdvisories(ctx: RideContext): Advisory[] {
  const { route, settings, weather, day, timeline, fuelPlan } = ctx;
  const items: Advisory[] = [];
  const w = summarizeWeather(weather, day.offset);
  const hasForecast = weather.length > 0;

  // --- Bike & road rules -------------------------------------------------
  if (!canUseExpressways(settings.bikeEngineCC)) {
    items.push({
      id: "expressway-ban",
      severity: "alert",
      title: "Expressways are closed to your bike",
      body: "125cc and under may not use expressways or most toll roads. The route avoids them, so expect a slower day on national routes.",
    });
  }

  // --- Weather -----------------------------------------------------------
  if (hasForecast && w.maxPrecipMm >= RAIN_CAUTION_MM) {
    items.push({
      id: "rain",
      severity: w.maxPrecipMm >= RAIN_ALERT_MM ? "alert" : "caution",
      title: "Rain on the route",
      body: `Up to ${w.maxPrecipMm.toFixed(1)} mm forecast. Pack rain gear and check the live radar before you leave — painted lines, manholes and bridge joints are slick.`,
      href: JMA_RAIN_RADAR,
      hrefLabel: "JMA rain radar 雨雲の動き",
    });
  }
  if (hasForecast && w.maxWindKmh >= WIND_CAUTION_KMH) {
    items.push({
      id: "wind",
      severity: "caution",
      title: "Strong wind",
      body: `Gusts to ${Math.round(w.maxWindKmh)} km/h are likely on exposed ridges, bridges and coastal sections.`,
    });
  }
  if (hasForecast && w.minTempC <= FREEZE_CAUTION_C) {
    items.push({
      id: "freeze",
      severity: "caution",
      title: "Near-freezing temperatures",
      body: `Lows of ${Math.round(w.minTempC)}°C — frost and ice can linger on shaded mountain corners and tunnel exits well after sunrise.`,
    });
  }

  // --- Altitude ----------------------------------------------------------
  if (w.maxElevationM !== null && w.startElevationM !== null) {
    const climb = w.maxElevationM - w.startElevationM;
    if (climb >= 400) {
      const colder = Math.round(climb * LAPSE_RATE_C_PER_M);
      items.push({
        id: "altitude",
        severity: "info",
        title: `High point ${Math.round(w.maxElevationM).toLocaleString()} m`,
        body: `Roughly ${colder}°C colder than the start (about 0.6°C per 100 m), and windier. Keep a windproof layer within reach — you cool fast the moment you stop.`,
      });
    }
  }

  // --- Seasonal hazards --------------------------------------------------
  const highRoads = w.maxElevationM !== null && w.maxElevationM >= HIGH_ROAD_ELEVATION_M;
  if (WINTER_CLOSURE_MONTHS.has(day.month) && highRoads) {
    items.push({
      id: "winter-closure",
      severity: "caution",
      title: "Mountain roads may be closed for winter",
      body: `Many high passes close from around November and reopen between April and late May — reopening dates shift with snowfall each year. Confirm this route is open before committing.`,
      href: JARTIC_ROAD_INFO,
      hrefLabel: "JARTIC road info",
    });
  } else if (day.month === 10 && day.day >= 15 && highRoads) {
    items.push({
      id: "closure-soon",
      severity: "info",
      title: "Closure season is close",
      body: "The first high mountain roads close around November and snow can arrive on summits in late October. Check road status before you go.",
      href: JARTIC_ROAD_INFO,
      hrefLabel: "JARTIC road info",
    });
  }

  const northLat = maxLatitude(route);
  if (BEAR_ACTIVE_MONTHS.has(day.month) && northLat >= 36) {
    const autumn = day.month >= 10;
    items.push({
      id: "bears",
      severity: autumn && northLat >= 37 ? "caution" : "info",
      title: "Bear season",
      body: autumn
        ? "Bears are feeding up before hibernation (Oct–Dec), and 2025 was the worst year on record for bear injuries in Tohoku. Dawn and dusk are riskiest: slow down into blind corners, use high beam at night, and report any collision."
        : "Bears are active in the mountains this month, most often at dawn and dusk. Slow down into blind corners on forest roads.",
    });
  }

  // --- Time of day -------------------------------------------------------
  const buffer = timeline.daylightBufferMinutes;
  if (buffer !== null && timeline.sunsetMinutes !== null) {
    if (buffer < 0) {
      items.push({
        id: "after-dark",
        severity: "caution",
        title: `Arrive ${formatSpan(-buffer)} after sunset`,
        body: `Sunset is ${formatClock(timeline.sunsetMinutes)}. Night riding on mountain roads adds wildlife and cold. Leave earlier, shorten the route, or split it over two days.`,
      });
    } else if (buffer < 45) {
      items.push({
        id: "tight-daylight",
        severity: "info",
        title: `Only ${formatSpan(buffer)} of daylight to spare`,
        body: `Sunset is ${formatClock(timeline.sunsetMinutes)}. Any delay — traffic, a longer lunch — puts the last stretch in the dark.`,
      });
    }
  }
  if (timeline.movingMinutes >= LONG_DAY_MOVING_MINUTES) {
    items.push({
      id: "long-day",
      severity: "caution",
      title: `${formatSpan(timeline.movingMinutes)} in the saddle`,
      body: "That is a long day, and fatigue is when mistakes happen. Consider splitting it with an overnight stop.",
    });
  }

  // --- Fuel --------------------------------------------------------------
  if (route.distanceKm > fuelPlan.legKm) {
    const gaps = canUseExpressways(settings.bikeEngineCC) && expresswayShare(settings) > 0;
    items.push({
      id: "fuel",
      severity: "info",
      title: `Plan ${fuelPlan.stops.length} fuel ${fuelPlan.stops.length === 1 ? "stop" : "stops"}`,
      body:
        `About every ${fuelPlan.legKm} km. Rural stations are closing for good, so check that your planned one is still open and don't wait for the last bar.` +
        (gaps
          ? " Some expressway stretches run 100–150 km or more between fuel stops."
          : ""),
    });
  }

  // --- Weekend ETC discount ---------------------------------------------
  if (
    canUseExpressways(settings.bikeEngineCC) &&
    expresswayShare(settings) > 0 &&
    isWeekend(day)
  ) {
    const window = etcWindowFor(day);
    const iso = day.iso;
    if (window && iso >= window.start && iso <= window.end) {
      items.push({
        id: "etc-discount",
        severity: "info",
        title: settings.etcWeekendDiscount ? "Weekend ETC discount applied" : "Weekend ETC discount available",
        body: settings.etcWeekendDiscount
          ? "37.5% off single expressway runs over 80 km, on the days you registered in advance with your ETC card and on-board reader."
          : "NEXCO takes 37.5% off single expressway runs over 80 km for ETC motorcycles on pre-registered weekend days. Register ahead, then switch it on in Trip settings.",
        href: DRIVE_PLAZA,
        hrefLabel: "ドラぷら Drive Plaza",
      });
    } else if (window) {
      items.push({
        id: "etc-discount-closed",
        severity: "info",
        title: "Weekend ETC discount is off-season",
        body: `This year's motorcycle discount runs ${formatWindow(window.start)} – ${formatWindow(window.end)}. Tolls are at full price on this date.`,
      });
    } else {
      items.push({
        id: "etc-discount-unknown",
        severity: "info",
        title: "Check this year's weekend ETC discount",
        body: "NEXCO usually runs a weekend discount for ETC motorcycles from spring to late autumn. Confirm the dates before you ride.",
        href: DRIVE_PLAZA,
        hrefLabel: "ドラぷら Drive Plaza",
      });
    }
  }

  return items.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

function formatWindow(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}`;
}
