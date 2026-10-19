"use client";

import { useState } from "react";
import { MapPin, Sparkles } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Segmented } from "@/components/ui/Segmented";
import { fieldClass } from "@/components/ui/Input";
import { DayDetailCard } from "./DayDetailCard";
import { canUseExpressways } from "@/lib/costCalc";
import type { ItineraryDay } from "@/types/trip";

type RidingStyle = "mountain passes" | "coastal roads" | "rural backroads";
type Interest = "nature" | "history & temples" | "food" | "onsen" | "festivals";
type Season = "spring" | "summer" | "autumn" | "winter";
type TripShape = "round" | "oneway";

const RIDING_STYLE_OPTIONS: { value: RidingStyle; label: string }[] = [
  { value: "mountain passes", label: "Mountain passes 峠" },
  { value: "coastal roads", label: "Coastal roads 海沿い" },
  { value: "rural backroads", label: "Rural backroads 田舎道" },
];

const INTEREST_OPTIONS: { value: Interest; label: string }[] = [
  { value: "nature", label: "Nature 自然" },
  { value: "history & temples", label: "History & temples 歴史" },
  { value: "food", label: "Local food グルメ" },
  { value: "onsen", label: "Onsen 温泉" },
  { value: "festivals", label: "Festivals 祭り" },
];

const SEASON_OPTIONS: { value: Season; label: string }[] = [
  { value: "spring", label: "Spring (Mar–May)" },
  { value: "summer", label: "Summer (Jun–Aug)" },
  { value: "autumn", label: "Autumn (Sep–Nov)" },
  { value: "winter", label: "Winter (Dec–Feb)" },
];

function currentSeason(): Season {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

interface ItineraryPlannerProps {
  onSwitchToRoute: () => void;
}

const labelClass = "eyebrow text-ink-3";

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
        selected
          ? "border-accent bg-accent-soft text-accent"
          : "border-line bg-surface text-ink-2 hover:border-line-strong"
      }`}
    >
      {children}
    </button>
  );
}

export function ItineraryPlanner({ onSwitchToRoute }: ItineraryPlannerProps) {
  const {
    settings,
    updateSettings,
    setOrigin,
    setDestination,
    itinerary,
    setItinerary,
    setActiveDay,
    setDayViewActive,
  } = useTripStore();

  // Use string state so the field can be fully cleared before typing a new number
  const [days, setDays] = useState<string>("3");
  const [startLocation, setStartLocation] = useState("");
  const [tripShape, setTripShape] = useState<TripShape>("round");
  const [ridingStyles, setRidingStyles] = useState<RidingStyle[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [season, setSeason] = useState<Season>(currentSeason);
  const [regionsToInclude, setRegionsToInclude] = useState("");
  const [regionsToAvoid, setRegionsToAvoid] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Showing the form while an itinerary exists keeps the old one until a new one arrives
  const [showForm, setShowForm] = useState(false);

  const toggle = <T extends string>(list: T[], value: T, set: (next: T[]) => void) => {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const handleDaysBlur = () => {
    const n = parseInt(days, 10);
    if (isNaN(n) || n < 1) setDays("1");
    else if (n > 21) setDays("21");
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: parseInt(days, 10) || 3,
          startLocation: startLocation.trim() || undefined,
          roundTrip: tripShape === "round",
          ridingStyles,
          interests,
          season,
          budget: settings.budget,
          bikeEngineCC: settings.bikeEngineCC,
          rangeKm: Math.round(settings.tankCapacityL * settings.fuelEfficiency),
          regionsToInclude,
          regionsToAvoid,
          additionalComments: additionalComments.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Couldn't generate the itinerary. Try again.");
      }
      const data = await res.json();
      setItinerary(data.itinerary);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDay = (day: ItineraryDay) => {
    setOrigin(day.startLocation);
    setDestination(day.endLocation);
    setActiveDay(day.day);
    setDayViewActive(true);
    onSwitchToRoute();
  };

  if (itinerary && !showForm) {
    return (
      <div className="flex flex-col gap-4">
        <SectionHeading
          action={
            <button
              onClick={() => setShowForm(true)}
              className="shrink-0 text-[13px] font-medium text-accent hover:underline"
            >
              Plan a new trip
            </button>
          }
        >
          {itinerary.length}-day itinerary
        </SectionHeading>

        {itinerary.map((day) => (
          <Card key={day.day}>
            <DayDetailCard day={day} showSchedule showAccommodationParking>
              {day.pois.length > 0 && (
                <div>
                  <p className="eyebrow mb-1.5 text-ink-3">Worth a stop</p>
                  <ul className="flex flex-col gap-1">
                    {day.pois.map((poi, i) => (
                      <li key={i} className="text-[13px] leading-relaxed text-ink-2">
                        {poi}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button variant="secondary" size="sm" className="w-full" onClick={() => handleLoadDay(day)}>
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                Show Day {day.day} on the map
              </Button>
            </DayDetailCard>
          </Card>
        ))}
      </div>
    );
  }

  const expressways = canUseExpressways(settings.bikeEngineCC);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <SectionHeading
          action={
            itinerary ? (
              <button
                onClick={() => setShowForm(false)}
                className="shrink-0 text-[13px] font-medium text-accent hover:underline"
              >
                Back to current trip
              </button>
            ) : undefined
          }
        >
          Plan a trip
        </SectionHeading>
        <p className="text-[13px] leading-relaxed text-ink-3">
          Tell us where you ride from and what you like. We&apos;ll build a day-by-day plan sized to
          your bike&apos;s range
          {expressways ? "" : " — kept off expressways, since your bike can't use them"}.
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Start from</span>
        <input
          type="text"
          placeholder="e.g. Ikebukuro, Tokyo — leave blank to let us choose"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          className={fieldClass}
        />
      </label>

      <div className="grid grid-cols-[96px_1fr] gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Days</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={days}
            onChange={(e) => setDays(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={handleDaysBlur}
            className={`${fieldClass} num`}
            placeholder="3"
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>Shape</span>
          <Segmented
            ariaLabel="Trip shape"
            value={tripShape}
            onChange={setTripShape}
            options={[
              { value: "round", label: "Back to start" },
              { value: "oneway", label: "One way" },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Riding style</span>
        <div className="flex flex-wrap gap-2">
          {RIDING_STYLE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={ridingStyles.includes(opt.value)}
              onClick={() => toggle(ridingStyles, opt.value, setRidingStyles)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Interests</span>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={interests.includes(opt.value)}
              onClick={() => toggle(interests, opt.value, setInterests)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Season</span>
        <select value={season} onChange={(e) => setSeason(e.target.value as Season)} className={fieldClass}>
          {SEASON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-ink-3">
          Season shapes pass closures, weather and which roads are worth riding.
        </span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Include</span>
          <input
            type="text"
            placeholder="e.g. Tohoku, Shikoku"
            value={regionsToInclude}
            onChange={(e) => setRegionsToInclude(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Avoid</span>
          <input
            type="text"
            placeholder="e.g. Tokyo, Osaka"
            value={regionsToAvoid}
            onChange={(e) => setRegionsToAvoid(e.target.value)}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Anything else</span>
        <textarea
          rows={3}
          placeholder="e.g. riding two-up, prefer twisties over expressways, want a rider-friendly inn each night"
          value={additionalComments}
          onChange={(e) => setAdditionalComments(e.target.value)}
          className={`${fieldClass} resize-none`}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Lodging budget</span>
        <select
          value={settings.budget}
          onChange={(e) => updateSettings({ budget: e.target.value as "budget" | "mid" | "luxury" })}
          className={fieldClass}
        >
          <option value="budget">Budget — hostel or guesthouse, ~¥3,500/night</option>
          <option value="mid">Mid-range — business hotel, ~¥8,000/night</option>
          <option value="luxury">Luxury — ryokan, ~¥20,000+/night</option>
        </select>
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-stop-soft px-3.5 py-2.5 text-[13px] text-stop">
          {error}
        </p>
      )}

      <Button onClick={handleGenerate} loading={loading} size="md" className="w-full">
        <Sparkles className="h-4 w-4" aria-hidden />
        {loading ? "Building your itinerary…" : "Generate itinerary"}
      </Button>

      <p className="text-center text-xs text-ink-3">Powered by Claude · takes about ten seconds</p>
    </div>
  );
}
