import type { RouteResult } from "@/types/route";
import type { TripSettings, CostBreakdown } from "@/types/trip";
import type { SuggestedBreak } from "@/types/route";
import { calculateTripCost } from "@/lib/costCalc";
import { computeSuggestedBreaks } from "@/lib/breakInterpolation";

interface PlanRouteParams {
  origin: string;
  destination: string;
  waypoints: string[];
  settings: TripSettings;
  onStart: () => void;
  onSuccess: (route: RouteResult, cost: CostBreakdown, breaks: SuggestedBreak[]) => void;
  onError: (msg: string) => void;
  onFinally: () => void;
}

export async function planRoute({
  origin,
  destination,
  waypoints,
  settings,
  onStart,
  onSuccess,
  onError,
  onFinally,
}: PlanRouteParams): Promise<void> {
  onStart();
  try {
    const res = await fetch("/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination, waypoints }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Failed to calculate route");
    }

    const route: RouteResult = await res.json();
    const cost = calculateTripCost(route.distanceKm, route.durationMinutes, settings);
    const breaks = computeSuggestedBreaks(route);

    onSuccess(route, cost, breaks);
  } catch (err) {
    onError(err instanceof Error ? err.message : "Something went wrong");
  } finally {
    onFinally();
  }
}
