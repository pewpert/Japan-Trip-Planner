"use client";

import { useEffect } from "react";
import { useTripStore } from "@/hooks/useTripStore";
import { sampleRoutePoints } from "@/lib/weather";
import type { WeatherPoint } from "@/types/weather";

/**
 * Fetches the Open-Meteo forecast for points sampled along the current route
 * and keeps `weather` / `isLoadingWeather` in the trip store up to date.
 * Mount once (PlannerSidebar) — WeatherStrip just reads from the store.
 */
export function useWeather(): void {
  const { route, setWeather, setLoadingWeather } = useTripStore();

  useEffect(() => {
    if (!route) {
      setWeather([]);
      return;
    }

    const points = sampleRoutePoints(route, 5);
    if (points.length === 0) {
      setWeather([]);
      return;
    }

    let cancelled = false;
    setLoadingWeather(true);

    fetch("/api/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data: { error?: string } | null = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Failed to fetch weather");
        }
        return res.json() as Promise<{ weather: WeatherPoint[] }>;
      })
      .then((data) => {
        if (!cancelled) setWeather(data.weather);
      })
      .catch(() => {
        // Weather is a nice-to-have — fail quietly and hide the strip
        if (!cancelled) setWeather([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingWeather(false);
      });

    return () => {
      cancelled = true;
    };
  }, [route, setWeather, setLoadingWeather]);
}
