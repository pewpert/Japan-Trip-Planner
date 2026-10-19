"use client";

import { useTripStore } from "@/hooks/useTripStore";
import {
  formatDuration,
  formatJPY,
  calculateItineraryCostRange,
  describeTollAssumptions,
} from "@/lib/costCalc";
import { FileText, Printer } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
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
      <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2">
          <FileText className="h-5 w-5 text-ink-3" aria-hidden />
        </span>
        <p className="text-[15px] font-semibold text-ink">No itinerary yet</p>
        <p className="max-w-[260px] text-[13px] leading-relaxed text-ink-3">
          Generate a multi-day plan in the Itinerary tab, or load one of the classic rides from the
          map. The full trip summary — costs, days, stays — appears here.
        </p>
      </div>
    );
  }

  const totalDays = itinerary.length;
  const totalNights = itinerary.length;
  const totalDistanceKm = itinerary.reduce((sum, d) => sum + d.distanceKm, 0);
  const totalRidingMinutes = itinerary.reduce((sum, d) => sum + d.ridingTimeMinutes, 0);
  const range = calculateItineraryCostRange(itinerary, settings);
  const nightsLabel = `${totalNights} ${totalNights === 1 ? "night" : "nights"}`;

  const lines = [
    { label: "Fuel", detail: "whole trip", low: range.low.fuel, high: range.high.fuel },
    { label: "Expressway tolls", detail: describeTollAssumptions(settings), low: range.low.tolls, high: range.high.tolls },
    { label: "Lodging", detail: nightsLabel, low: range.low.accommodation, high: range.high.accommodation },
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        action={
          <Button size="sm" onClick={handleOpenPrintView} className="shrink-0">
            <Printer className="h-3.5 w-3.5" aria-hidden />
            Export / Print
          </Button>
        }
      >
        Trip summary
      </SectionHeading>

      {/* Trip header */}
      <Card>
        <dl className="flex flex-col gap-2 text-[13px]">
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 text-ink-3">From</dt>
            <dd className="font-medium text-ink">{itinerary[0]?.startLocation ?? origin}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 text-ink-3">To</dt>
            <dd className="font-medium text-ink">
              {itinerary[itinerary.length - 1]?.endLocation ?? destination}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill className="num">{totalDays} days</Pill>
          <Pill className="num">~{totalDistanceKm} km</Pill>
          <Pill className="num">{formatDuration(totalRidingMinutes)} riding</Pill>
        </div>
      </Card>

      {/* Whole-trip cost range */}
      <Card>
        <p className="eyebrow text-ink-3">
          Estimated trip total · {totalDays} {totalDays === 1 ? "day" : "days"} · {nightsLabel}
        </p>
        <p className="num mt-1.5 text-2xl font-semibold tracking-tight text-accent">
          {formatJPY(range.low.total)} – {formatJPY(range.high.total)}
        </p>
        <ul className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
          {lines.map((line) => (
            <li key={line.label} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink">{line.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{line.detail}</p>
              </div>
              <p className="num shrink-0 text-[13px] font-medium text-ink">
                {formatJPY(line.low)} – {formatJPY(line.high)}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      {/* Day-by-day itinerary */}
      <div className="flex flex-col gap-4">
        <SectionHeading>Day by day</SectionHeading>
        {itinerary.map((day) => (
          <Card key={day.day}>
            <DayDetailCard day={day} showRoute />
          </Card>
        ))}
      </div>
    </div>
  );
}
