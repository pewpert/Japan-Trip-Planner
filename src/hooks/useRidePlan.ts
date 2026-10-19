"use client";

import { useMemo, useState } from "react";
import { useTripStore } from "@/hooks/useTripStore";
import { computeFuelPlan, computeTimeline, getJstDay } from "@/lib/ridePlan";
import { buildAdvisories, computeVerdict, type RideContext } from "@/lib/advisories";
import type { Advisory, JstDay, Verdict } from "@/types/ride";

export interface RidePlan extends RideContext {
  verdict: Verdict | null;
  advisories: Advisory[];
  /** The next seven days, starting today (JST). */
  days: JstDay[];
}

/**
 * Everything the briefing needs for the current route, ride day and
 * departure time — computed once so every panel agrees with the others.
 * Returns null until a route exists.
 */
export function useRidePlan(): RidePlan | null {
  const { route, settings, weather, rideDayOffset, departureTime, suggestedBreaks } =
    useTripStore();
  // "Today" is fixed for the life of the page so renders stay consistent.
  const [now] = useState(() => new Date());

  return useMemo(() => {
    if (!route) return null;

    const days = Array.from({ length: 7 }, (_, i) => getJstDay(i, now));
    const day = days[Math.min(rideDayOffset, days.length - 1)];
    const timeline = computeTimeline({
      route,
      breakCount: suggestedBreaks.length,
      departure: departureTime,
      day,
    });
    const fuelPlan = computeFuelPlan(route, settings);
    const ctx: RideContext = { route, settings, weather, day, timeline, fuelPlan };

    return {
      ...ctx,
      verdict: computeVerdict(ctx),
      advisories: buildAdvisories(ctx),
      days,
    };
  }, [route, settings, weather, rideDayOffset, departureTime, suggestedBreaks, now]);
}
