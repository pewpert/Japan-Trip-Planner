"use client";

import { useState } from "react";
import { useTripStore } from "@/hooks/useTripStore";
import { Disclosure } from "@/components/ui/Disclosure";
import { Segmented } from "@/components/ui/Segmented";
import { fieldClass } from "@/components/ui/Input";
import { ROAD_MIX_LABEL, canUseExpressways } from "@/lib/costCalc";
import type { RoadMix, TripSettings as TripSettingsType } from "@/types/trip";

const BUDGET_LABELS: Record<TripSettingsType["budget"], string> = {
  budget: "Budget — hostel, ~¥3,500",
  mid: "Mid-range — business hotel, ~¥8,000",
  luxury: "Luxury — ryokan, ~¥20,000",
};

const BIKE_CLASSES = [
  { value: 125, label: "125cc and under · no expressways" },
  { value: 250, label: "126–250cc" },
  { value: 400, label: "251–400cc · 普通二輪" },
  { value: 750, label: "401cc and over · 大型二輪" },
];

const ROAD_MIX_OPTIONS = (Object.keys(ROAD_MIX_LABEL) as RoadMix[]).map((value) => ({
  value,
  label: ROAD_MIX_LABEL[value],
}));

interface NumberFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
}

/**
 * Numeric text field that can be fully cleared while typing. It commits a
 * clamped value on blur; the parent re-keys it by value so an external change
 * (such as the saved settings loading) resets what's shown.
 */
function NumberField({ label, value, min, max, onCommit }: NumberFieldProps) {
  const [text, setText] = useState(String(value));

  const commit = () => {
    const parsed = parseFloat(text);
    const next = Number.isNaN(parsed) ? min : Math.min(max, Math.max(min, parsed));
    setText(String(next));
    onCommit(next);
  };

  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="eyebrow text-ink-3">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value.replace(/[^0-9.]/g, ""))}
        onBlur={commit}
        className={`${fieldClass} num`}
      />
    </label>
  );
}

export function TripSettings() {
  const { settings, updateSettings } = useTripStore();
  const bikeClass = BIKE_CLASSES.find((c) => c.value === settings.bikeEngineCC) ?? BIKE_CLASSES[2];
  const expresswayAllowed = canUseExpressways(settings.bikeEngineCC);

  return (
    <Disclosure
      title="Bike & trip settings"
      summary={`${bikeClass.value >= 750 ? "401cc+" : bikeClass.value === 125 ? "≤125cc" : `${bikeClass.value}cc`} · ${settings.tankCapacityL} L · ${ROAD_MIX_LABEL[settings.roadMix]}`}
    >
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-ink-3">Bike</span>
          <select
            value={bikeClass.value}
            onChange={(e) => updateSettings({ bikeEngineCC: Number(e.target.value) })}
            className={fieldClass}
          >
            {BIKE_CLASSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-3 gap-3">
          <NumberField
            key={`tank-${settings.tankCapacityL}`}
            label="Tank (L)"
            value={settings.tankCapacityL}
            min={3}
            max={40}
            onCommit={(tankCapacityL) => updateSettings({ tankCapacityL })}
          />
          <NumberField
            key={`eff-${settings.fuelEfficiency}`}
            label="km / L"
            value={settings.fuelEfficiency}
            min={5}
            max={50}
            onCommit={(fuelEfficiency) => updateSettings({ fuelEfficiency })}
          />
          <NumberField
            key={`price-${settings.fuelPricePerLiter}`}
            label="¥ / L"
            value={settings.fuelPricePerLiter}
            min={100}
            max={300}
            onCommit={(fuelPricePerLiter) => updateSettings({ fuelPricePerLiter })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="eyebrow text-ink-3">Roads</span>
          <Segmented
            ariaLabel="Road mix"
            options={ROAD_MIX_OPTIONS}
            value={settings.roadMix}
            onChange={(roadMix) => updateSettings({ roadMix })}
          />
          <p className="text-xs leading-relaxed text-ink-3">
            Sets the share of expressway used for the toll estimate. Back roads also asks Google to
            avoid expressways — re-plan the route to apply it.
          </p>
        </div>

        <label
          className={`flex items-start gap-3 rounded-xl border border-line p-3.5 ${
            expresswayAllowed ? "cursor-pointer" : "cursor-not-allowed opacity-60"
          }`}
        >
          <input
            type="checkbox"
            checked={settings.etcWeekendDiscount}
            disabled={!expresswayAllowed}
            onChange={(e) => updateSettings({ etcWeekendDiscount: e.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
          />
          <span>
            <span className="block text-sm font-medium text-ink">Weekend ETC discount</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-ink-3">
              I&apos;ve registered for NEXCO&apos;s 二輪車定率割引 — 37.5% off single runs over 80 km on
              registered weekend days.
            </span>
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-ink-3">Lodging when staying over</span>
          <select
            value={settings.budget}
            onChange={(e) => updateSettings({ budget: e.target.value as TripSettingsType["budget"] })}
            className={fieldClass}
          >
            {Object.entries(BUDGET_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Disclosure>
  );
}
