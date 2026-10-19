"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { useRidePlan } from "@/hooks/useRidePlan";
import { Button } from "@/components/ui/Button";
import { buildTripSummaryText } from "@/lib/tripExport";
import { formatClock, formatJstDay } from "@/lib/ridePlan";
import type { ItineraryDay } from "@/types/trip";

interface TripExportButtonProps {
  itinerary?: ItineraryDay[];
}

export function TripExportButton({ itinerary }: TripExportButtonProps) {
  const { origin, destination, waypoints, route, costBreakdown, suggestedBreaks } = useTripStore();
  const plan = useRidePlan();
  const [copied, setCopied] = useState(false);

  if (!route || !costBreakdown) return null;

  const handleCopy = async () => {
    const text = buildTripSummaryText({
      origin,
      destination,
      waypoints,
      route,
      costBreakdown,
      suggestedBreaks,
      itinerary,
      briefing: plan
        ? {
            dayLabel: formatJstDay(plan.day),
            departure: formatClock(plan.timeline.departureMinutes),
            arrival: formatClock(plan.timeline.arrivalMinutes),
            sunset:
              plan.timeline.sunsetMinutes !== null ? formatClock(plan.timeline.sunsetMinutes) : null,
            verdict: plan.verdict?.headline ?? null,
            fuelRangeKm: plan.fuelPlan.rangeKm,
            fuelStops: plan.fuelPlan.stops.length,
            notes: plan.advisories
              .filter((a) => a.severity !== "info")
              .map((a) => a.title),
          }
        : undefined,
    });
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fall back to a hidden textarea
      const el = document.createElement("textarea");
      el.value = text;
      el.className = "fixed opacity-0 pointer-events-none";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy} className="w-full">
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {copied ? "Copied" : "Copy plan to share"}
    </Button>
  );
}
