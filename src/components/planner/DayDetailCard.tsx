"use client";

import { useState, type ReactNode } from "react";
import { BedDouble, ChevronDown, MapPin, ParkingSquare, TriangleAlert } from "lucide-react";
import { formatDuration } from "@/lib/costCalc";
import { Pill } from "@/components/ui/Pill";
import type { ItineraryDay } from "@/types/trip";

const ACCOMMODATION_LABELS: Record<ItineraryDay["accommodation"]["type"], string> = {
  hotel: "Hotel",
  ryokan: "Ryokan 旅館",
  guesthouse: "Guesthouse",
  camping: "Camping",
};

interface DayDetailCardProps {
  day: ItineraryDay;
  /** Show the start → end route line under the header */
  showRoute?: boolean;
  /** Show the collapsible hourly schedule (if the day has one) */
  showSchedule?: boolean;
  /** Show the motorcycle-parking indicator on the accommodation block */
  showAccommodationParking?: boolean;
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
  children,
}: DayDetailCardProps) {
  const [scheduleExpanded, setScheduleExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Day header */}
      <div>
        <p className="eyebrow text-accent">Day {day.day}</p>
        <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-ink">{day.title}</h3>
      </div>

      {showRoute && (
        <div className="flex items-center gap-2 text-[13px] text-ink-2">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-3" aria-hidden />
          <span className="truncate">{day.startLocation}</span>
          <span className="shrink-0 text-ink-3" aria-hidden>→</span>
          <span className="truncate">{day.endLocation}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Pill className="num">{day.distanceKm} km</Pill>
        <Pill className="num">{formatDuration(day.ridingTimeMinutes)} riding</Pill>
      </div>

      {day.keyStops.length > 0 && (
        <div>
          <p className="eyebrow mb-1.5 text-ink-3">Key stops</p>
          <ul className="flex flex-col gap-1">
            {day.keyStops.map((stop, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-2">
                <MapPin className="mt-1 h-3 w-3 shrink-0 text-accent" aria-hidden />
                {stop}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accommodation */}
      <div className="flex items-start gap-3 rounded-xl bg-surface-2 px-3.5 py-3">
        <BedDouble className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink">{day.accommodation.name}</p>
          <p className="text-xs text-ink-3">{ACCOMMODATION_LABELS[day.accommodation.type]}</p>
          {showAccommodationParking ? (
            <div className="mt-1 flex items-start gap-1.5">
              <ParkingSquare
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                  day.accommodation.hasMotorcycleParking ? "text-go" : "text-ink-3"
                }`}
                aria-hidden
              />
              <p className="text-xs leading-relaxed text-ink-2">{day.accommodation.parkingNote}</p>
            </div>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-ink-2">{day.accommodation.parkingNote}</p>
          )}
        </div>
      </div>

      {day.seasonalWarning && (
        <div className="flex items-start gap-2.5 rounded-xl bg-warn-soft px-3.5 py-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden />
          <p className="text-[13px] leading-relaxed text-warn">{day.seasonalWarning}</p>
        </div>
      )}

      {/* Collapsible hourly schedule */}
      {showSchedule && day.schedule && day.schedule.length > 0 && (
        <div>
          <button
            onClick={() => setScheduleExpanded((prev) => !prev)}
            aria-expanded={scheduleExpanded}
            className="flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
          >
            {scheduleExpanded ? "Hide schedule" : "Show schedule"}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${scheduleExpanded ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          {scheduleExpanded && (
            <ol className="mt-3 flex flex-col">
              {day.schedule.map((entry, i) => (
                <li key={i} className="flex gap-3">
                  {/* Vertical line + dot connector */}
                  <div className="flex shrink-0 flex-col items-center">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {i < day.schedule!.length - 1 && <div className="my-0.5 w-px flex-1 bg-line" />}
                  </div>
                  <div className="flex min-w-0 gap-3 pb-2.5">
                    <span className="num w-11 shrink-0 text-xs font-medium text-ink-3">{entry.time}</span>
                    <span className="text-[13px] leading-relaxed text-ink-2">{entry.activity}</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
