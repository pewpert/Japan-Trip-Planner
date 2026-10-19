"use client";

import { memo } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { useRidePlan } from "@/hooks/useRidePlan";
import { conditionForDay } from "@/lib/advisories";
import { formatJstDay } from "@/lib/ridePlan";
import { Disclosure } from "@/components/ui/Disclosure";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Pill } from "@/components/ui/Pill";
import type { WeatherCondition, WeatherPoint } from "@/types/weather";

const ICONS: Record<string, LucideIcon> = {
  clear: Sun,
  "mostly-clear": Sun,
  "partly-cloudy": CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
  unknown: Thermometer,
};

function summarize(weather: WeatherPoint[], offset: number): string | null {
  const conditions = weather
    .map((p) => conditionForDay(p, offset))
    .filter((c): c is WeatherCondition => c !== undefined);
  if (conditions.length === 0) return null;
  const low = Math.round(Math.min(...conditions.map((c) => c.tempMin)));
  const high = Math.round(Math.max(...conditions.map((c) => c.tempMax)));
  const rain = Math.max(...conditions.map((c) => c.precipitationMm));
  return `${low}–${high}°C · ${rain >= 1 ? `rain ${rain.toFixed(0)} mm` : "dry"}`;
}

export function WeatherStrip() {
  const { weather, isLoadingWeather, rideDayOffset } = useTripStore();
  const plan = useRidePlan();

  // Nothing to show and nothing in flight — render nothing at all
  if (!isLoadingWeather && weather.length === 0) return null;

  const dayLabel = plan ? formatJstDay(plan.day) : "";

  return (
    <Disclosure
      title="Conditions along the route"
      summary={isLoadingWeather ? "Loading…" : summarize(weather, rideDayOffset)}
      defaultOpen
    >
      {isLoadingWeather ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" label="Fetching forecast…" />
        </div>
      ) : (
        <>
          <div className="-mx-5 flex snap-x gap-2.5 overflow-x-auto px-5 pb-1">
            {weather.map((point, i) => (
              <ConditionCard
                key={`${point.coordinates.lat}-${point.coordinates.lng}-${i}`}
                point={point}
                offset={rideDayOffset}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-3">
            Forecast for {dayLabel} · Open-Meteo. Sampled at {weather.length} points along the
            route; mountain passes can be colder and wetter than the nearest point.
          </p>
        </>
      )}
    </Disclosure>
  );
}

const ConditionCard = memo(function ConditionCard({
  point,
  offset,
}: {
  point: WeatherPoint;
  offset: number;
}) {
  const c = conditionForDay(point, offset);
  if (!c) return null;
  const Icon = ICONS[c.icon] ?? Thermometer;

  return (
    <div className="flex w-[136px] shrink-0 snap-start flex-col gap-2 rounded-xl border border-line bg-surface-2/60 p-3">
      <p className="eyebrow truncate text-ink-3">{point.locationName}</p>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 shrink-0 text-ink-2" aria-hidden />
        <span className="num text-lg font-semibold text-ink">
          {Math.round(c.tempMin)}–{Math.round(c.tempMax)}°
        </span>
      </div>
      <p className="truncate text-xs text-ink-2" title={c.description}>
        {c.description}
      </p>
      <dl className="num space-y-0.5 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-ink-3">Rain</dt>
          <dd className="text-ink">{c.precipitationMm.toFixed(1)} mm</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-ink-3">Wind</dt>
          <dd className="text-ink">{Math.round(c.windSpeedKmh)} km/h</dd>
        </div>
        {point.elevationM !== undefined && (
          <div className="flex justify-between gap-2">
            <dt className="text-ink-3">Elev.</dt>
            <dd className="text-ink">{Math.round(point.elevationM).toLocaleString()} m</dd>
          </div>
        )}
      </dl>
      <Pill tone={c.isRideSafe ? "go" : "stop"} className="self-start">
        {c.isRideSafe ? "Rideable" : "Avoid"}
      </Pill>
    </div>
  );
});
