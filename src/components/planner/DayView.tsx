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
    setItinerary,
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

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <SectionHeading
        action={
          <button
            onClick={() => setItinerary(null)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
          >
            ✕ Exit day view
          </button>
        }
      >
        Day View
      </SectionHeading>

      {/* Day pills */}
      <div className="flex gap-1.5 flex-wrap">
        {itinerary.map((d) => (
          <button
            key={d.day}
            onClick={() => setActiveDay(d.day)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150
              ${activeDay === d.day
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-400"
              }`}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrev}
          disabled={activeDay === 1}
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {activeDay} of {totalDays}
        </span>
        <button
          onClick={goToNext}
          disabled={activeDay === totalDays}
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day card */}
      <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <DayDetailCard day={day} showRoute />
      </div>

      {/* Loading indicator */}
      {isLoadingRoute && (
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 animate-pulse">
          Loading day {activeDay} route…
        </p>
      )}
    </div>
  );
}
