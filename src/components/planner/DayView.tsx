"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { planRoute } from "@/lib/routeApi";
import { DayDetailCard } from "./DayDetailCard";

export function DayView() {
  const {
    itinerary,
    activeDay,
    setActiveDay,
    setOrigin,
    setDestination,
    setRoute,
    setCostBreakdown,
    setSuggestedBreaks,
    setLoadingRoute,
    setDayViewActive,
    setRouteError,
    settings,
    isLoadingRoute,
  } = useTripStore();

  // Derive these before the early return so hooks are never called conditionally
  const day = itinerary?.find((d) => d.day === activeDay) ?? itinerary?.[0] ?? null;
  const totalDays = itinerary?.length ?? 0;

  // Auto-load this day's route into the map whenever activeDay changes.
  // Must be above the early return to satisfy Rules of Hooks.
  useEffect(() => {
    if (!day) return;
    setOrigin(day.startLocation);
    setDestination(day.endLocation);
    setRouteError(null);

    planRoute({
      origin: day.startLocation,
      destination: day.endLocation,
      waypoints: day.keyStops ?? [],
      settings,
      onStart: () => setLoadingRoute(true),
      onSuccess: (route, cost, breaks) => {
        setRoute(route);
        setCostBreakdown(cost);
        setSuggestedBreaks(breaks);
      },
      onError: (msg) => {
        setRouteError(`Couldn't load the Day ${day.day} route: ${msg}`);
      },
      onFinally: () => setLoadingRoute(false),
    });
  }, [activeDay]); // eslint-disable-line react-hooks/exhaustive-deps -- intentionally fires on day change only

  if (!itinerary || itinerary.length === 0 || !day) return null;

  const goToPrev = () => { if (activeDay > 1) setActiveDay(activeDay - 1); };
  const goToNext = () => { if (activeDay < totalDays) setActiveDay(activeDay + 1); };

  const stepClass =
    "flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        action={
          <button
            onClick={() => setDayViewActive(false)}
            className="shrink-0 text-[13px] font-medium text-accent hover:underline"
          >
            Plan another route
          </button>
        }
      >
        Itinerary
      </SectionHeading>

      {/* Day pills */}
      <div role="tablist" aria-label="Itinerary days" className="flex flex-wrap gap-1.5">
        {itinerary.map((d) => (
          <button
            key={d.day}
            role="tab"
            aria-selected={activeDay === d.day}
            onClick={() => setActiveDay(d.day)}
            className={`num rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              activeDay === d.day
                ? "border-accent bg-accent text-on-accent"
                : "border-line bg-surface text-ink-2 hover:border-line-strong"
            }`}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goToPrev} disabled={activeDay === 1} className={stepClass}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
        </button>
        <span className="num text-[13px] text-ink-3">
          {activeDay} of {totalDays}
        </span>
        <button onClick={goToNext} disabled={activeDay === totalDays} className={stepClass}>
          Next <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4">
        <DayDetailCard day={day} showRoute />
      </div>

      {isLoadingRoute && (
        <p role="status" className="animate-pulse text-center text-xs text-ink-3">
          Loading the Day {activeDay} route…
        </p>
      )}
    </div>
  );
}
