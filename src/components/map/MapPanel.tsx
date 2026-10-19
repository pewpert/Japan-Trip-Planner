"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Load the Google Maps stack client-side only, off the critical path —
// trims the initial bundle and skips SSR of the maps loader entirely.
const TripMap = dynamic(
  () => import("@/components/map/TripMap").then((m) => m.TripMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center bg-surface-2">
        <LoadingSpinner size="lg" label="Loading map…" />
      </div>
    ),
  }
);

export function MapPanel() {
  return <TripMap />;
}
