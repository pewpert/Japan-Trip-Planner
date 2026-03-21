"use client";

import { useTripStore } from "@/hooks/useTripStore";
import { formatDuration, formatJPY, calculateTripCostRange } from "@/lib/costCalc";
import { MapPin, Bike, AlertTriangle, Coffee } from "lucide-react";

const ACCOMMODATION_ICONS: Record<string, string> = {
  hotel: "🏨",
  ryokan: "🎎",
  guesthouse: "🏠",
  camping: "⛺",
};

export function SummaryTab() {
  const { itinerary, route, costBreakdown, settings, suggestedBreaks, origin, destination } = useTripStore();

  // Empty state — no itinerary yet
  if (!itinerary) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="text-4xl">🏍️</div>
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">No itinerary yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] mx-auto">
            Generate an itinerary in the Itinerary tab to see your full trip summary here.
          </p>
        </div>
      </div>
    );
  }

  const totalDays = itinerary.length;
  const totalDistanceKm = itinerary.reduce((sum, d) => sum + d.distanceKm, 0);
  const totalRidingMinutes = itinerary.reduce((sum, d) => sum + d.ridingTimeMinutes, 0);
  const range = route && costBreakdown
    ? calculateTripCostRange(route.distanceKm, route.durationMinutes, settings)
    : null;

  return (
    <div className="flex flex-col gap-6 print:gap-4">

      {/* Print hint — hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          Trip Summary
        </h2>
        <button
          onClick={() => window.print()}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* Trip header */}
      <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-100 dark:border-gray-700 print:border-gray-300 print:bg-white">
        <h1 className="text-base font-bold text-gray-900 dark:text-white print:text-black mb-2">
          🏍️ Japan バイク Trip Planner
        </h1>
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-300 print:text-gray-700">
            <span className="font-medium w-20 shrink-0">From</span>
            <span>{itinerary[0]?.startLocation ?? origin}</span>
          </div>
          <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-300 print:text-gray-700">
            <span className="font-medium w-20 shrink-0">To</span>
            <span>{itinerary[itinerary.length - 1]?.endLocation ?? destination}</span>
          </div>
          <div className="flex gap-4 mt-2 flex-wrap">
            <span className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium print:border-gray-300">
              {totalDays} days
            </span>
            <span className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium print:border-gray-300">
              ~{totalDistanceKm} km
            </span>
            <span className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium print:border-gray-300">
              {formatDuration(totalRidingMinutes)} riding
            </span>
          </div>
        </div>
      </div>

      {/* Cost range */}
      {range && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Estimated Cost (per day)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Fuel", low: range.low.fuel, high: range.high.fuel },
              { label: "Tolls", low: range.low.tolls, high: range.high.tolls },
              { label: "Accommodation", low: range.low.accommodation, high: range.high.accommodation },
              { label: "Total", low: range.low.total, high: range.high.total, bold: true },
            ].map(({ label, low, high, bold }) => (
              <div key={label} className={`flex flex-col gap-0.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2 print:bg-white print:border print:border-gray-200 ${bold ? "col-span-2 border border-red-100 dark:border-red-900/40" : ""}`}>
                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                <span className={`text-sm tabular-nums ${bold ? "font-bold text-red-600" : "font-semibold text-gray-900 dark:text-white print:text-black"}`}>
                  {formatJPY(low)} – {formatJPY(high)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested breaks */}
      {suggestedBreaks.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Suggested Breaks
          </h3>
          {suggestedBreaks.map((brk) => (
            <div key={brk.id} className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-100 dark:border-amber-800/40">
              <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{brk.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">after {formatDuration(brk.timeIntoRideMinutes)} · {brk.distanceIntoRouteKm} km in</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{brk.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Day-by-day itinerary */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Day-by-Day
        </h3>
        {itinerary.map((day) => (
          <div
            key={day.day}
            className="flex flex-col gap-3 border border-gray-100 dark:border-gray-700 rounded-xl p-4 print:break-inside-avoid print:border-gray-300"
          >
            {/* Day header */}
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg shrink-0 print:bg-red-50">
                <Bike className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Day {day.day}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white print:text-black leading-tight">{day.title}</p>
              </div>
            </div>

            {/* Route + badges */}
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 print:text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{day.startLocation}</span>
              <span className="text-gray-400">→</span>
              <span>{day.endLocation}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full print:bg-gray-100 print:text-gray-700">
                {day.distanceKm} km
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full print:bg-gray-100 print:text-gray-700">
                {formatDuration(day.ridingTimeMinutes)} riding
              </span>
            </div>

            {/* Key stops */}
            {day.keyStops.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Key Stops</p>
                <ul className="flex flex-col gap-0.5">
                  {day.keyStops.map((stop, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300 print:text-gray-700">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                      {stop}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Accommodation */}
            <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 print:bg-gray-50">
              <span className="text-base leading-none mt-0.5">{ACCOMMODATION_ICONS[day.accommodation.type] ?? "🏨"}</span>
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-white print:text-black">{day.accommodation.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">{day.accommodation.parkingNote}</p>
              </div>
            </div>

            {/* Seasonal warning */}
            {day.seasonalWarning && (
              <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-700 dark:text-orange-400 print:text-orange-700">{day.seasonalWarning}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Print footer */}
      <div className="hidden print:block text-xs text-gray-400 text-center border-t border-gray-200 pt-4 mt-2">
        Generated by Japan バイク Trip Planner
      </div>
    </div>
  );
}
