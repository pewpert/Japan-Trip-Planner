import type { RouteResult } from "@/types/route";

export interface SampledRoutePoint {
  lat: number;
  lng: number;
  name: string;
}

/**
 * Picks n evenly-spaced points along a route's polyline (always includes
 * start and end). Points are labelled by approximate distance into the ride
 * so the weather strip reads naturally without reverse geocoding.
 */
export function sampleRoutePoints(route: RouteResult, n = 5): SampledRoutePoint[] {
  const path = route.polylinePath;
  if (path.length === 0) return [];

  const count = Math.max(2, Math.min(n, path.length));
  const points: SampledRoutePoint[] = [];

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const idx = Math.round(t * (path.length - 1));
    const name =
      i === 0
        ? "Start"
        : i === count - 1
          ? "End"
          : `~${Math.round(t * route.distanceKm)} km in`;
    points.push({ lat: path[idx].lat, lng: path[idx].lng, name });
  }

  return points;
}

/** Icon identifiers; the UI maps these to lucide icons. */
export type WeatherIconName =
  | "clear"
  | "mostly-clear"
  | "partly-cloudy"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm"
  | "unknown";

export interface WeatherCodeInfo {
  description: string;
  icon: WeatherIconName;
  isRideSafe: boolean;
}

// WMO codes where riding a motorcycle is a bad idea:
// heavy rain (65/67), heavy snow (75/77), violent showers (82),
// snow showers (85/86), thunderstorms (95/96/99)
const UNSAFE_RIDING_CODES = new Set([65, 67, 75, 77, 82, 85, 86, 95, 96, 99]);

const WMO_CODE_MAP: Record<number, { description: string; icon: WeatherIconName }> = {
  0: { description: "Clear sky", icon: "clear" },
  1: { description: "Mainly clear", icon: "mostly-clear" },
  2: { description: "Partly cloudy", icon: "partly-cloudy" },
  3: { description: "Overcast", icon: "cloud" },
  45: { description: "Fog", icon: "fog" },
  48: { description: "Depositing rime fog", icon: "fog" },
  51: { description: "Light drizzle", icon: "drizzle" },
  53: { description: "Moderate drizzle", icon: "drizzle" },
  55: { description: "Dense drizzle", icon: "rain" },
  56: { description: "Light freezing drizzle", icon: "rain" },
  57: { description: "Dense freezing drizzle", icon: "rain" },
  61: { description: "Slight rain", icon: "drizzle" },
  63: { description: "Moderate rain", icon: "rain" },
  65: { description: "Heavy rain", icon: "rain" },
  66: { description: "Light freezing rain", icon: "rain" },
  67: { description: "Heavy freezing rain", icon: "rain" },
  71: { description: "Slight snowfall", icon: "snow" },
  73: { description: "Moderate snowfall", icon: "snow" },
  75: { description: "Heavy snowfall", icon: "snow" },
  77: { description: "Snow grains", icon: "snow" },
  80: { description: "Slight rain showers", icon: "drizzle" },
  81: { description: "Moderate rain showers", icon: "rain" },
  82: { description: "Violent rain showers", icon: "rain" },
  85: { description: "Slight snow showers", icon: "snow" },
  86: { description: "Heavy snow showers", icon: "snow" },
  95: { description: "Thunderstorm", icon: "storm" },
  96: { description: "Thunderstorm with slight hail", icon: "storm" },
  99: { description: "Thunderstorm with heavy hail", icon: "storm" },
};

export function getWeatherCodeInfo(code: number): WeatherCodeInfo {
  const base = WMO_CODE_MAP[code] ?? { description: "Unknown conditions", icon: "unknown" };
  return { ...base, isRideSafe: !UNSAFE_RIDING_CODES.has(code) };
}
