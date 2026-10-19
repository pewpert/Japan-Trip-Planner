"use client";

import { ExternalLink } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { Disclosure } from "@/components/ui/Disclosure";
import {
  calculateTripCostRange,
  describeTollAssumptions,
  formatJPY,
} from "@/lib/costCalc";

const DRIVE_PLAZA = "https://www.driveplaza.com/";

export function CostEstimator() {
  const { costBreakdown, route, settings } = useTripStore();

  if (!costBreakdown || !route) return null;

  const range = calculateTripCostRange(route.distanceKm, route.durationMinutes, settings);
  const rideLow = range.low.fuel + range.low.tolls;
  const rideHigh = range.high.fuel + range.high.tolls;
  const liters = route.distanceKm / settings.fuelEfficiency;

  const rows = [
    {
      label: "Fuel",
      detail: `≈ ${liters.toFixed(1)} L at ¥${settings.fuelPricePerLiter}/L`,
      low: range.low.fuel,
      high: range.high.fuel,
    },
    {
      label: "Expressway tolls",
      detail: describeTollAssumptions(settings),
      low: range.low.tolls,
      high: range.high.tolls,
    },
  ];

  return (
    <Disclosure
      title="Cost estimate"
      summary={`${formatJPY(rideLow)} – ${formatJPY(rideHigh)}`}
    >
      <div className="flex flex-col gap-4">
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.label} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{row.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{row.detail}</p>
              </div>
              <p className="num shrink-0 text-sm font-medium text-ink">
                {formatJPY(row.low)} – {formatJPY(row.high)}
              </p>
            </li>
          ))}
        </ul>

        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
          <p className="text-sm font-semibold text-ink">Ride cost</p>
          <p className="num text-base font-semibold text-accent">
            {formatJPY(rideLow)} – {formatJPY(rideHigh)}
          </p>
        </div>

        <div className="flex items-baseline justify-between gap-4 rounded-xl bg-surface-2 px-3.5 py-3">
          <div>
            <p className="text-[13px] font-medium text-ink-2">If you stay over</p>
            <p className="text-xs text-ink-3">1 night, {settings.budget} budget</p>
          </div>
          <p className="num text-[13px] font-medium text-ink-2">
            + {formatJPY(range.low.accommodation)} – {formatJPY(range.high.accommodation)}
          </p>
        </div>

        <p className="text-xs leading-relaxed text-ink-3">
          Estimates only. City expressways (首都高, 阪神高速) use flat fees that aren&apos;t modelled —
          check the exact toll on{" "}
          <a
            href={DRIVE_PLAZA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-medium text-accent hover:underline"
          >
            ドラぷら <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
          .
        </p>
      </div>
    </Disclosure>
  );
}
