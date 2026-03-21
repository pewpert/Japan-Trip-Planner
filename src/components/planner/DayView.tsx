"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, Bike } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { planRoute } from "@/lib/routeApi";
import { formatDuration } from "@/lib/costCalc";

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
    settings,
    isLoadingRoute,
  } = useTripStore();

  if (!itinerary || itinerary.length === 0) return null;

  const day = itinerary.find((d) => d.day === activeDay) ?? itinerary[0];
  const totalDays = itinerary.length;

  // Auto-load this day's route into the map whenever activeDay changes
  useEffect(() => {
    if (!day) return;
    setOrigin(day.startLocation);
    setDestination(day.endLocation);

    planRoute({
      origin: day.startLocation,
      destination: day.endLocation,
      waypoints: [],
      settings,
      onStart: () => setLoadingRoute(true),
      onSuccess: (route, cost, breaks) => {
        setRoute(route);
        setCostBreakdown(cost);
        setSuggestedBreaks(breaks);
      },
      onError: () => {},
      onFinally: () => setLoadingRoute(false),
    });
  }, [activeDay]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToPrev = () => { if (activeDay > 1) setActiveDay(activeDay - 1); };
  const goToNext = () => { if (activeDay < totalDays) setActiveDay(activeDay + 1); };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          Day View
        </h2>
        <button
          onClick={() => setItinerary(null)}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          ✕ Exit day view
        </button>
      </div>

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
      <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        {/* Day title */}
        <div className="flex items-start gap-2">
          <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg shrink-0">
            <Bike className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Day {day.day}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{day.title}</p>
          </div>
        </div>

        {/* Route line */}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{day.startLocation}</span>
          <span className="text-gray-400 shrink-0">→</span>
          <span className="truncate">{day.endLocation}</span>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full font-medium">
            {day.distanceKm} km
          </span>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full font-medium">
            {formatDuration(day.ridingTimeMinutes)} riding
          </span>
        </div>

        {/* Key stops */}
        {day.keyStops.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Key Stops</p>
            <ul className="flex flex-col gap-0.5">
              {day.keyStops.map((stop, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <MapPin className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                  {stop}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Accommodation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-600">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tonight&apos;s Stay</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{day.accommodation.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{day.accommodation.parkingNote}</p>
        </div>

        {/* Seasonal warning */}
        {day.seasonalWarning && (
          <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2">
            <span className="text-orange-500 text-sm shrink-0">⚠️</span>
            <p className="text-xs text-orange-700 dark:text-orange-400">{day.seasonalWarning}</p>
          </div>
        )}
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
