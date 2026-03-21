"use client";

import { Coffee } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { formatDuration } from "@/lib/costCalc";
import { TripExportButton } from "./TripExportButton";

export function RouteOverviewPanel() {
  const { route, suggestedBreaks } = useTripStore();

  if (!route) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
        Route Overview
      </h2>

      {/* Summary row */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
        <span className="font-medium">{route.distanceKm.toFixed(0)} km</span>
        <span className="text-gray-400">·</span>
        <span>{formatDuration(route.durationMinutes)} riding</span>
        <span className="text-gray-400">·</span>
        <span>
          {suggestedBreaks.length === 0
            ? "No breaks needed"
            : `${suggestedBreaks.length} suggested break${suggestedBreaks.length > 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Break list */}
      {suggestedBreaks.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          This route is under 2 hours — no rest stops needed.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Suggested Breaks
          </p>
          {suggestedBreaks.map((brk) => (
            <div
              key={brk.id}
              className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {brk.label}
                </span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  after {formatDuration(brk.timeIntoRideMinutes)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  · {brk.distanceIntoRouteKm} km
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 pl-5 leading-relaxed">
                {brk.note}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Export */}
      <TripExportButton />
    </div>
  );
}
