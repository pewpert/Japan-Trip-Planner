"use client";

import { useState } from "react";
import { SEED_ROUTES, type SeedRoute } from "@/data/seedRoutes";
import { SeedRouteList } from "@/components/map/SeedRouteCards";
import { Segmented } from "@/components/ui/Segmented";

type Region = SeedRoute["region"] | "all";

const REGION_OPTIONS: { value: Region; label: string }[] = [
  { value: "all", label: "All" },
  { value: "kanto", label: "Kantō 関東" },
  { value: "chubu", label: "Chūbu 中部" },
  { value: "kyushu", label: "Kyūshū 九州" },
];

/** Shown over the map until a route is loaded — the way in for riders without a plan yet. */
export function EmptyStatePanel() {
  const [selectedRegion, setSelectedRegion] = useState<Region>("all");

  const filteredRoutes =
    selectedRegion === "all"
      ? SEED_ROUTES
      : SEED_ROUTES.filter((r) => r.region === selectedRegion);

  return (
    <>
      {/* Desktop: a frosted panel at the top-left of the map */}
      <section
        aria-label="Classic rides"
        className="absolute left-5 top-5 z-10 hidden max-h-[calc(100%-2.5rem)] w-[380px] flex-col gap-3 overflow-y-auto rounded-2xl border border-line bg-surface/90 p-4 shadow-float backdrop-blur-xl md:flex"
      >
        <div>
          <p className="eyebrow text-ink-3">Classic rides 定番ルート</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">
            Start from a proven road
          </h2>
        </div>
        <Segmented
          ariaLabel="Region"
          options={REGION_OPTIONS}
          value={selectedRegion}
          onChange={setSelectedRegion}
        />
        <SeedRouteList routes={filteredRoutes} />
      </section>

      {/* Mobile: a swipeable strip above the Planner / Map control */}
      <div className="absolute inset-x-0 bottom-20 z-10 md:hidden">
        <SeedRouteList routes={filteredRoutes} layout="strip" />
      </div>
    </>
  );
}
