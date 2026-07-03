"use client";

import { memo } from "react";
import { Droplets, Wind } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { WeatherPoint } from "@/types/weather";

export function WeatherStrip() {
  const { weather, isLoadingWeather } = useTripStore();

  // Nothing to show and nothing in flight — render no card at all
  if (!isLoadingWeather && weather.length === 0) return null;

  return (
    <Card padding="md" className="flex flex-col gap-3">
      <SectionHeading>Weather Along Route</SectionHeading>

      {isLoadingWeather ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" label="Fetching forecast…" />
        </div>
      ) : (
        <>
          {/* Horizontal scroll strip — one card per sampled route point */}
          <div className="flex gap-2 overflow-x-auto snap-x -mx-1 px-1 pb-1">
            {weather.map((point, i) => (
              <WeatherPointCard key={`${point.coordinates.lat}-${point.coordinates.lng}-${i}`} point={point} />
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Current conditions + today&apos;s range · Open-Meteo
          </p>
        </>
      )}
    </Card>
  );
}

const WeatherPointCard = memo(function WeatherPointCard({ point }: { point: WeatherPoint }) {
  const { current } = point;

  return (
    <div className="shrink-0 w-36 snap-start flex flex-col gap-1.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 p-3">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">
        {point.locationName}
      </p>

      <div className="flex items-center gap-1.5">
        <span className="text-xl leading-none">{current.icon}</span>
        <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
          {Math.round(current.temp ?? current.tempMax)}°
        </span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={current.description}>
        {current.description}
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
        H {Math.round(current.tempMax)}° · L {Math.round(current.tempMin)}°
      </p>

      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 tabular-nums">
        <span className="flex items-center gap-0.5">
          <Droplets className="w-3 h-3 shrink-0" />
          {current.precipitationMm.toFixed(1)}mm
        </span>
        <span className="flex items-center gap-0.5">
          <Wind className="w-3 h-3 shrink-0" />
          {Math.round(current.windSpeedKmh)}km/h
        </span>
      </div>

      <span
        className={`self-start text-xs font-medium px-2 py-0.5 rounded-full
          ${current.isRideSafe
            ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          }`}
      >
        {current.isRideSafe ? "🏍️ Ride OK" : "⚠️ Caution"}
      </span>
    </div>
  );
});
