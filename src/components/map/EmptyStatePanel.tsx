"use client";

import { useState } from "react";
import { SEED_ROUTES, type SeedRoute } from "@/data/seedRoutes";
import { SeedRouteCards } from "@/components/map/SeedRouteCards";
import { RegionPicker } from "@/components/map/RegionPicker";

type Region = SeedRoute["region"] | "all";

export function EmptyStatePanel() {
  const [selectedRegion, setSelectedRegion] = useState<Region>("all");

  const filteredRoutes =
    selectedRegion === "all"
      ? SEED_ROUTES
      : SEED_ROUTES.filter((r) => r.region === selectedRegion);

  return (
    <>
      {/* Desktop: hero + region picker sits above the cards */}
      <div className="absolute top-4 left-4 hidden md:flex flex-col gap-2 z-10 max-w-sm pointer-events-none">
        <p className="font-display text-lg font-bold text-white pointer-events-none"
           style={{ textShadow: "0 1px 6px rgba(0,0,0,0.65)" }}>
          🏍️ Where in Japan do you want to ride?
        </p>
        <div className="pointer-events-auto">
          <RegionPicker selected={selectedRegion} onSelect={setSelectedRegion} />
        </div>
      </div>

      {/* Cards — desktop grid uses top-20 to clear the hero text above */}
      <SeedRouteCards routes={filteredRoutes} desktopClassName="top-20 left-4" />

      {/* Mobile: region picker above the card scroll strip */}
      <div className="absolute md:hidden z-10 bottom-36 left-4 right-4">
        <RegionPicker selected={selectedRegion} onSelect={setSelectedRegion} />
      </div>
    </>
  );
}
