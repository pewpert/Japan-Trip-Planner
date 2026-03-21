"use client";

import { useState } from "react";
import { useTripStore } from "@/hooks/useTripStore";
import { Button } from "@/components/ui/Button";
import { buildTripSummaryText } from "@/lib/tripExport";
import type { ItineraryDay } from "@/types/trip";

interface TripExportButtonProps {
  itinerary?: ItineraryDay[];
}

export function TripExportButton({ itinerary }: TripExportButtonProps) {
  const { origin, destination, waypoints, route, costBreakdown, suggestedBreaks } = useTripStore();
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
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments where clipboard API is unavailable
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={handleCopy} className="flex-1">
        {copied ? "Copied! ✓" : "📋 Copy Summary"}
      </Button>
      <Button variant="secondary" size="sm" onClick={handlePrint} className="flex-1">
        🖨️ Print
      </Button>
    </div>
  );
}
