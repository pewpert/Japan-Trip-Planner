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
      <div className="absolute top-5 left-5 hidden md:flex flex-col gap-3 z-10 max-w-md pointer-events-none">
        <div className="pointer-events-none">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-400"
             style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
            峠 · Tōge — the mountain pass
          </p>
          <p className="text-3xl font-bold tracking-tight text-white leading-snug"
             style={{ textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>
            Where in Japan do you<br />want to ride?
          </p>
        </div>
        <div className="pointer-events-auto">
          <RegionPicker selected={selectedRegion} onSelect={setSelectedRegion} />
        </div>
      </div>

      {/* Cards — desktop grid uses top-44 to clear the hero text above */}
      <SeedRouteCards routes={filteredRoutes} desktopClassName="top-44 left-5" />

      {/* Mobile: region picker above the card scroll strip */}
      <div className="absolute md:hidden z-10 bottom-36 left-4 right-4">
        <RegionPicker selected={selectedRegion} onSelect={setSelectedRegion} />
      </div>
    </>
  );
}
