"use client";

import { Settings2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTripStore } from "@/hooks/useTripStore";

const BUDGET_LABELS = {
  budget: "Budget (hostels, ~¥3,500/night)",
  mid: "Mid-range (business hotel, ~¥8,000/night)",
  luxury: "Luxury (ryokan, ~¥20,000/night)",
};

const inputClass =
  "w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500";

export function TripSettings() {
  const { settings, updateSettings } = useTripStore();
  const [open, setOpen] = useState(false);

  // String states so the fields can be fully cleared before typing a new number
  const [fuelEfficiency, setFuelEfficiency] = useState(String(settings.fuelEfficiency));
  const [fuelPrice, setFuelPrice] = useState(String(settings.fuelPricePerLiter));

  // Keep local strings in sync if settings change externally (e.g. store rehydration)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local input state from the persisted store after rehydration
  useEffect(() => { setFuelEfficiency(String(settings.fuelEfficiency)); }, [settings.fuelEfficiency]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local input state from the persisted store after rehydration
  useEffect(() => { setFuelPrice(String(settings.fuelPricePerLiter)); }, [settings.fuelPricePerLiter]);

  const handleFuelEfficiencyBlur = () => {
    const n = parseFloat(fuelEfficiency);
    if (isNaN(n) || n < 5) {
      setFuelEfficiency("5");
      updateSettings({ fuelEfficiency: 5 });
    } else if (n > 50) {
      setFuelEfficiency("50");
      updateSettings({ fuelEfficiency: 50 });
    } else {
      setFuelEfficiency(String(n));
      updateSettings({ fuelEfficiency: n });
    }
  };

  const handleFuelPriceBlur = () => {
    const n = parseFloat(fuelPrice);
    if (isNaN(n) || n < 100) {
      setFuelPrice("100");
      updateSettings({ fuelPricePerLiter: 100 });
    } else if (n > 300) {
      setFuelPrice("300");
      updateSettings({ fuelPricePerLiter: 300 });
    } else {
      setFuelPrice(String(n));
      updateSettings({ fuelPricePerLiter: n });
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors w-full"
      >
        <Settings2 className="w-4 h-4" />
        <span>Trip Settings</span>
        <span className="ml-auto text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-4 border-t border-gray-100 dark:border-gray-700 pt-3">
          {/* Fuel efficiency */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Fuel Efficiency (km/L)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={fuelEfficiency}
              onChange={(e) => setFuelEfficiency(e.target.value.replace(/[^0-9.]/g, ""))}
              onBlur={handleFuelEfficiencyBlur}
              className={inputClass}
              placeholder="22"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">Typical: 20–30 km/L for 250–600cc bikes</p>
          </div>

          {/* Fuel price */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Fuel Price (¥/L)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              onBlur={handleFuelPriceBlur}
              className={inputClass}
              placeholder="175"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">Current Japan average ~¥170–185/L</p>
          </div>

          {/* Engine CC */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Engine Size (cc)
            </label>
            <select
              value={settings.bikeEngineCC}
              onChange={(e) =>
                updateSettings({ bikeEngineCC: Number(e.target.value) })
              }
              className={inputClass}
            >
              <option value={50}>Under 125cc (cheap tolls)</option>
              <option value={250}>250–400cc</option>
              <option value={400}>401–750cc</option>
              <option value={750}>750cc+</option>
            </select>
          </div>

          {/* Budget */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Accommodation Budget
            </label>
            <select
              value={settings.budget}
              onChange={(e) =>
                updateSettings({
                  budget: e.target.value as "budget" | "mid" | "luxury",
                })
              }
              className={inputClass}
            >
              {Object.entries(BUDGET_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
