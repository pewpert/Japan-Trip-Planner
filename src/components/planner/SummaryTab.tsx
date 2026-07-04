"use client";

import { useTripStore } from "@/hooks/useTripStore";
import { formatDuration, formatJPY, calculateItineraryCostRange } from "@/lib/costCalc";
import { Coffee, Printer } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DayDetailCard } from "./DayDetailCard";
import type { PrintData } from "@/components/print/PrintLayout";

export function SummaryTab() {
  const { itinerary, costBreakdown, settings, suggestedBreaks, origin, destination, waypoints } = useTripStore();

  const handleOpenPrintView = () => {
    if (!itinerary) return;
    const printData: PrintData = {
      itinerary,
      origin,
      destination,
      waypoints,
      settings,
      costBreakdown,
      suggestedBreaks,
      generatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem("japan-bike-print-data", JSON.stringify(printData));
    window.open("/print", "_blank");
  };

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
  const totalNights = itinerary.length;
  const totalDistanceKm = itinerary.reduce((sum, d) => sum + d.distanceKm, 0);
  const totalRidingMinutes = itinerary.reduce((sum, d) => sum + d.ridingTimeMinutes, 0);
  const range = calculateItineraryCostRange(itinerary, settings);

  return (
    <div className="flex flex-col gap-6 print:gap-4">

      {/* Header */}
      <SectionHeading
        action={
          <button
            onClick={handleOpenPrintView}
            className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            Export / Print
          </button>
        }
      >
        Trip Summary
      </SectionHeading>

      {/* Trip header */}
      <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-100 dark:border-gray-700 print:border-gray-300 print:bg-white">
        <h1 className="font-display text-base font-bold text-gray-900 dark:text-white print:text-black mb-2">
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

      {/* Whole-trip cost range */}
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.14em]">
          Estimated Trip Total ({totalDays} {totalDays === 1 ? "day" : "days"} · {totalNights} {totalNights === 1 ? "night" : "nights"})
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Fuel", sub: "whole trip", low: range.low.fuel, high: range.high.fuel },
            { label: "Tolls", sub: "whole trip", low: range.low.tolls, high: range.high.tolls },
            { label: "Accommodation", sub: `${totalNights} ${totalNights === 1 ? "night" : "nights"}`, low: range.low.accommodation, high: range.high.accommodation },
            { label: "Trip Total", sub: "fuel + tolls + accommodation", low: range.low.total, high: range.high.total, bold: true },
          ].map(({ label, sub, low, high, bold }) => (
            <div key={label} className={`flex flex-col gap-0.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2 print:bg-white print:border print:border-gray-200 ${bold ? "col-span-2 border border-red-100 dark:border-red-900/40" : ""}`}>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {label} <span className="text-gray-400 dark:text-gray-500">· {sub}</span>
              </span>
              <span className={`text-sm tabular-nums ${bold ? "font-bold text-red-600" : "font-semibold text-gray-900 dark:text-white print:text-black"}`}>
                {formatJPY(low)} – {formatJPY(high)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested breaks */}
      {suggestedBreaks.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.14em]">
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
        <h3 className="font-display text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.14em]">
          Day-by-Day
        </h3>
        {itinerary.map((day) => (
          <div
            key={day.day}
            className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 print:break-inside-avoid print:border-gray-300"
          >
            <DayDetailCard day={day} showRoute print />
          </div>
        ))}
      </div>

    </div>
  );
}
