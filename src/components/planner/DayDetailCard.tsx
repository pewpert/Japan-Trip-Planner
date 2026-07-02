"use client";

import { useState, type ReactNode } from "react";
import { Bike, MapPin, AlertTriangle, ParkingSquare } from "lucide-react";
import { formatDuration } from "@/lib/costCalc";
import type { ItineraryDay } from "@/types/trip";

export const ACCOMMODATION_ICONS: Record<ItineraryDay["accommodation"]["type"], string> = {
  hotel: "🏨",
  ryokan: "🎎",
  guesthouse: "🏠",
  camping: "⛺",
};

interface DayDetailCardProps {
  day: ItineraryDay;
  /** Show the start → end route line under the header */
  showRoute?: boolean;
  /** Show the collapsible hourly schedule (if the day has one) */
  showSchedule?: boolean;
  /** Show the motorcycle-parking indicator on the accommodation block */
  showAccommodationParking?: boolean;
  /** Add print-friendly color overrides (used by Summary / print views) */
  print?: boolean;
  /** Screen-specific extras rendered at the bottom of the card */
  children?: ReactNode;
}

/**
 * Shared presentational card for a single itinerary day.
 * Used by ItineraryPlanner, SummaryTab, and DayView — each wraps it in its
 * own container chrome (Card, bordered div, day pills, etc).
 */
export function DayDetailCard({
  day,
  showRoute = false,
  showSchedule = false,
  showAccommodationParking = false,
  print = false,
  children,
}: DayDetailCardProps) {
  const [scheduleExpanded, setScheduleExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Day header */}
      <div className="flex items-start gap-2">
        <div className={`p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg shrink-0 ${print ? "print:bg-red-50" : ""}`}>
          <Bike className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Day {day.day}</p>
          <p className={`text-sm font-semibold text-gray-900 dark:text-white leading-tight ${print ? "print:text-black" : ""}`}>
            {day.title}
          </p>
        </div>
      </div>

      {/* Route line */}
      {showRoute && (
        <div className={`flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 ${print ? "print:text-gray-600" : ""}`}>
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{day.startLocation}</span>
          <span className="text-gray-400 shrink-0">→</span>
          <span className="truncate">{day.endLocation}</span>
        </div>
      )}

      {/* Distance + riding time badges */}
      <div className="flex gap-2 flex-wrap">
        <span className={`text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium ${print ? "print:bg-gray-100 print:text-gray-700" : ""}`}>
          {day.distanceKm} km
        </span>
        <span className={`text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium ${print ? "print:bg-gray-100 print:text-gray-700" : ""}`}>
          {formatDuration(day.ridingTimeMinutes)} riding
        </span>
      </div>

      {/* Key stops */}
      {day.keyStops.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Key Stops</p>
          <ul className="flex flex-col gap-0.5">
            {day.keyStops.map((stop, i) => (
              <li key={i} className={`flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300 ${print ? "print:text-gray-700" : ""}`}>
                <MapPin className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                {stop}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accommodation */}
      <div className={`flex items-start gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 ${print ? "print:bg-gray-50" : ""}`}>
        <span className="text-base leading-none mt-0.5">
          {ACCOMMODATION_ICONS[day.accommodation.type] ?? "🏨"}
        </span>
        <div>
          <p className={`text-xs font-medium text-gray-900 dark:text-white ${print ? "print:text-black" : ""}`}>
            {day.accommodation.name}
          </p>
          {showAccommodationParking ? (
            <div className="flex items-center gap-1 mt-0.5">
              <ParkingSquare className={`w-3 h-3 shrink-0 ${day.accommodation.hasMotorcycleParking ? "text-green-600" : "text-gray-400"}`} />
              <p className="text-xs text-gray-500 dark:text-gray-400">{day.accommodation.parkingNote}</p>
            </div>
          ) : (
            <p className={`text-xs text-gray-500 dark:text-gray-400 ${print ? "print:text-gray-600" : ""}`}>
              {day.accommodation.parkingNote}
            </p>
          )}
        </div>
      </div>

      {/* Seasonal warning */}
      {day.seasonalWarning && (
        <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
          <p className={`text-xs text-orange-700 dark:text-orange-400 ${print ? "print:text-orange-700" : ""}`}>
            {day.seasonalWarning}
          </p>
        </div>
      )}

      {/* Collapsible hourly schedule */}
      {showSchedule && day.schedule && day.schedule.length > 0 && (
        <div>
          <button
            onClick={() => setScheduleExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {scheduleExpanded ? "Hide schedule ▲" : "Show schedule ▼"}
          </button>
          {scheduleExpanded && (
            <div className="mt-2 flex flex-col">
              {day.schedule.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  {/* Vertical line + dot connector */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500 mt-1 shrink-0" />
                    {i < day.schedule!.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 dark:bg-gray-600 my-0.5" />
                    )}
                  </div>
                  <div className="flex gap-2 pb-2 min-w-0">
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500 shrink-0 tabular-nums">
                      {entry.time}
                    </span>
                    <span className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {entry.activity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
