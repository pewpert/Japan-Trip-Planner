"use client";

import { useState } from "react";
import { SEED_ITINERARIES } from "@/data/seedItineraries";
import type { SeedRoute } from "@/data/seedRoutes";
import { useTripStore } from "@/hooks/useTripStore";
import { planRoute } from "@/lib/routeApi";

/** Loads one of the curated classic rides: fills the inputs, plans the route, attaches its itinerary. */
export function useSeedRoute() {
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
    setRouteError,
    settings,
  } = useTripStore();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const load = async (seed: SeedRoute) => {
    if (loadingId) return;

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
        // Load the static seed itinerary so the Summary tab is immediately populated
        const seedItinerary = SEED_ITINERARIES[seed.id];
        if (seedItinerary) setItinerary(seedItinerary);
      },
      onError: (msg) => {
        setRouteError(`Couldn't plan "${seed.name}": ${msg}`);
      },
      onFinally: () => {
        setLoadingRoute(false);
        setLoadingId(null);
      },
    });
  };

  return { load, loadingId };
}
