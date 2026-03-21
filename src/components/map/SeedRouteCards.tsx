"use client";

import { useState } from "react";
import { SEED_ROUTES, type SeedRoute } from "@/data/seedRoutes";
import { SEED_ITINERARIES } from "@/data/seedItineraries";
import { useTripStore } from "@/hooks/useTripStore";
import { planRoute } from "@/lib/routeApi";
import { Tooltip } from "@/components/ui/Tooltip";

const DIFFICULTY_STYLES = {
  beginner: { dot: "bg-green-400", label: "Beginner" },
  intermediate: { dot: "bg-yellow-400", label: "Intermediate" },
  advanced: { dot: "bg-red-400", label: "Advanced" },
};

interface SeedRouteCardsProps {
  routes?: SeedRoute[];
  desktopClassName?: string;
}

export function SeedRouteCards({ routes = SEED_ROUTES, desktopClassName = "top-4 left-4" }: SeedRouteCardsProps) {
  const {
    setOrigin,
    setDestination,
    addWaypoint,
    clearRoute,
    setRoute,
    setCostBreakdown,
    setSuggestedBreaks,
    setLoadingRoute,
    setItinerary,
    settings,
  } = useTripStore();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleLoadRoute = async (seed: SeedRoute) => {
    if (loadingId) return;

    // Populate store inputs
    clearRoute();
    setOrigin(seed.origin);
    setDestination(seed.destination);
    seed.waypoints.forEach((wp) => addWaypoint(wp));

    setLoadingId(seed.id);

    await planRoute({
      origin: seed.origin,
      destination: seed.destination,
      waypoints: seed.waypoints,
      settings,
      onStart: () => setLoadingRoute(true),
      onSuccess: (route, cost, breaks) => {
        setRoute(route);
        setCostBreakdown(cost);
        setSuggestedBreaks(breaks);
        // Load the static seed itinerary so Summary tab is immediately populated
        const seedItinerary = SEED_ITINERARIES[seed.id];
        if (seedItinerary) setItinerary(seedItinerary);
      },
      onError: (msg) => {
        console.error("[SeedRouteCards]", msg);
      },
      onFinally: () => {
        setLoadingRoute(false);
        setLoadingId(null);
      },
    });
  };

  return (
    <>
      {/* Desktop: 2×2 grid top-left */}
      <div className={`absolute ${desktopClassName} hidden md:grid grid-cols-2 gap-3 max-w-sm z-10`}>
        {routes.map((seed) => (
          <SeedCard
            key={seed.id}
            seed={seed}
            loading={loadingId === seed.id}
            disabled={loadingId !== null}
            onLoad={() => handleLoadRoute(seed)}
          />
        ))}
      </div>

      {/* Mobile: horizontal scroll row at bottom */}
      <div className="absolute bottom-16 left-0 right-0 flex gap-3 overflow-x-auto px-4 snap-x snap-mandatory z-10 md:hidden pb-1">
        {routes.map((seed) => (
          <div key={seed.id} className="shrink-0 w-56 snap-start">
            <SeedCard
              seed={seed}
              loading={loadingId === seed.id}
              disabled={loadingId !== null}
              onLoad={() => handleLoadRoute(seed)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

interface SeedCardProps {
  seed: SeedRoute;
  loading: boolean;
  disabled: boolean;
  onLoad: () => void;
}

function SeedCard({ seed, loading, disabled, onLoad }: SeedCardProps) {
  const diff = DIFFICULTY_STYLES[seed.difficulty];

  return (
    <Tooltip text={seed.tooltipDescription} position="bottom" wide>
      <button
        onClick={onLoad}
        disabled={disabled}
        className={`
          w-full text-left
          bg-gray-900/85 dark:bg-gray-950/90
          backdrop-blur-sm border border-white/10
          rounded-xl p-3 shadow-lg
          transition-all duration-150
          ${disabled
            ? "opacity-60 cursor-not-allowed"
            : "hover:bg-gray-900/95 hover:border-white/20 cursor-pointer"
          }
        `}
      >
        {/* Top row: difficulty + badges */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className={`w-2 h-2 rounded-full shrink-0 ${diff.dot}`} />
          <span className="text-xs text-white/50">{diff.label}</span>
          <span className="ml-auto flex gap-1.5">
            <span className="bg-white/15 text-white text-xs rounded-full px-2 py-0.5 whitespace-nowrap">
              {seed.durationDays}d
            </span>
            <span className="bg-white/15 text-white text-xs rounded-full px-2 py-0.5 whitespace-nowrap">
              ~{seed.distanceKm} km
            </span>
          </span>
        </div>

        {/* Route name */}
        <p className="text-sm font-semibold text-white leading-tight mb-1">
          {seed.name}
        </p>

        {/* Tagline */}
        <p className="text-xs text-white/65 line-clamp-2 leading-relaxed">
          {seed.tagline}
        </p>

        {/* CTA */}
        <div className="mt-2.5 flex items-center gap-1.5">
          {loading ? (
            <span className="text-xs text-white/50 flex items-center gap-1.5">
              <svg className="animate-spin w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Planning route…
            </span>
          ) : (
            <span className="text-xs text-red-400 hover:text-red-300 font-medium">
              Plan this route →
            </span>
          )}
        </div>
      </button>
    </Tooltip>
  );
}
