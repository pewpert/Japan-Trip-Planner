"use client";

import { ExternalLink } from "lucide-react";
import { useRidePlan } from "@/hooks/useRidePlan";
import { Disclosure } from "@/components/ui/Disclosure";
import { mapsSearchUrl } from "@/lib/ridePlan";
import { useTripStore } from "@/hooks/useTripStore";

export function FuelPlan() {
  const plan = useRidePlan();
  const { settings } = useTripStore();
  if (!plan) return null;

  const { fuelPlan } = plan;
  const stopCount = fuelPlan.stops.length;

  return (
    <Disclosure
      title="Fuel & range"
      summary={`${fuelPlan.rangeKm} km range · ${stopCount === 0 ? "no stop needed" : `${stopCount} ${stopCount === 1 ? "stop" : "stops"}`}`}
    >
      <div className="flex flex-col gap-4">
        <p className="text-[13px] leading-relaxed text-ink-2">
          {settings.tankCapacityL} L tank × {settings.fuelEfficiency} km/L ={" "}
          <span className="num font-medium text-ink">{fuelPlan.rangeKm} km</span> on a full tank.
          Stops are spaced every {fuelPlan.legKm} km so you never run into the last fifth of the tank
          — rural stations are closing, and one that&apos;s gone can mean a long push.
        </p>

        {stopCount === 0 ? (
          <p className="rounded-xl bg-surface-2 px-3.5 py-3 text-[13px] text-ink-2">
            This ride is within one tank. Leave with it full.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {fuelPlan.stops.map((stop, index) => (
              <li
                key={stop.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">Fuel stop {index + 1}</p>
                  <p className="num text-xs text-ink-3">around km {stop.distanceKm}</p>
                </div>
                <a
                  href={mapsSearchUrl("ガソリンスタンド", stop.coordinates)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
                >
                  Find stations <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Disclosure>
  );
}
