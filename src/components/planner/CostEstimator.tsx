"use client";

import { Fuel, CreditCard, Building2, TrendingUp } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatJPY, formatDuration, calculateTripCostRange } from "@/lib/costCalc";

export function CostEstimator() {
  const { costBreakdown, route, settings } = useTripStore();

  if (!costBreakdown || !route) return null;

  const range = calculateTripCostRange(route.distanceKm, route.durationMinutes, settings);

  const items = [
    {
      icon: <Fuel className="w-4 h-4" />,
      label: "Fuel",
      low: range.low.fuel,
      high: range.high.fuel,
      sub: `~${(route.distanceKm / settings.fuelEfficiency).toFixed(1)}L`,
      color: "text-orange-600 bg-orange-50 dark:bg-orange-900/30",
    },
    {
      icon: <CreditCard className="w-4 h-4" />,
      label: "Tolls (est.)",
      low: range.low.tolls,
      high: range.high.tolls,
      sub: "expressway approx.",
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30",
    },
    {
      icon: <Building2 className="w-4 h-4" />,
      label: "Accommodation",
      low: range.low.accommodation,
      high: range.high.accommodation,
      sub: "1 night stay",
      color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading>Cost Estimate</SectionHeading>

      {/* Route summary */}
      <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
        <span className="font-medium">{route.distanceKm.toFixed(0)} km</span>
        <span>·</span>
        <span>{formatDuration(route.durationMinutes)}</span>
      </div>

      {/* Cost rows */}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${item.color}`}>{item.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{item.sub}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
              {formatJPY(item.low)} – {formatJPY(item.high)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-900/30">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Per-leg estimate</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">fuel + tolls for this leg · 1 night stay</p>
          </div>
        </div>
        <span className="text-base font-bold text-red-600 tabular-nums">
          {formatJPY(range.low.total)} – {formatJPY(range.high.total)}
        </span>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        * Estimates only. Actual costs vary by route and availability.
      </p>
    </div>
  );
}
