"use client";

import { useState } from "react";
import { Bike, MapPin, AlertTriangle, ArrowLeft, Sparkles, ParkingSquare } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tooltip } from "@/components/ui/Tooltip";
import { formatDuration } from "@/lib/costCalc";
import type { ItineraryDay } from "@/types/trip";

type RidingStyle = "mountain passes" | "coastal roads" | "rural backroads";
type Interest = "nature" | "history & temples" | "food" | "onsen" | "festivals";
type Season = "spring" | "summer" | "autumn" | "winter";

const RIDING_STYLE_OPTIONS: { value: RidingStyle; label: string; emoji: string; tooltip: string }[] = [
  {
    value: "mountain passes",
    label: "Mountain Passes",
    emoji: "🏔️",
    tooltip: "Winding roads through Japan's mountain ranges — expect hairpin turns and dramatic elevation changes",
  },
  {
    value: "coastal roads",
    label: "Coastal Roads",
    emoji: "🌊",
    tooltip: "Scenic routes along Japan's coastline — great ocean views with a mix of open straights and curves",
  },
  {
    value: "rural backroads",
    label: "Rural Backroads",
    emoji: "🌾",
    tooltip: "Quiet countryside roads through rice fields and small towns — the least-touristy riding experience",
  },
];

const INTEREST_OPTIONS: { value: Interest; label: string; emoji: string; tooltip: string }[] = [
  {
    value: "nature",
    label: "Nature",
    emoji: "🌿",
    tooltip: "Prioritises national parks, forests, mountain scenery and rural landscapes",
  },
  {
    value: "history & temples",
    label: "History & Temples",
    emoji: "⛩️",
    tooltip: "Routes past shrines, temples, castle towns and historic post towns",
  },
  {
    value: "food",
    label: "Food",
    emoji: "🍜",
    tooltip: "Includes stops at local restaurants, ramen shops, and regional specialties along the way",
  },
  {
    value: "onsen",
    label: "Onsen",
    emoji: "♨️",
    tooltip: "Suggests accommodation and stops near hot spring areas — great for end-of-day recovery",
  },
  {
    value: "festivals",
    label: "Festivals",
    emoji: "🎌",
    tooltip: "Highlights seasonal matsuri and local events happening along your route",
  },
];

const SEASON_OPTIONS: { value: Season; label: string }[] = [
  { value: "spring", label: "Spring (Mar–May)" },
  { value: "summer", label: "Summer (Jun–Aug)" },
  { value: "autumn", label: "Autumn (Sep–Nov)" },
  { value: "winter", label: "Winter (Dec–Feb)" },
];

const ACCOMMODATION_ICONS: Record<ItineraryDay["accommodation"]["type"], string> = {
  hotel: "🏨",
  ryokan: "🎎",
  guesthouse: "🏠",
  camping: "⛺",
};

interface ItineraryPlannerProps {
  onSwitchToRoute: () => void;
}

export function ItineraryPlanner({ onSwitchToRoute }: ItineraryPlannerProps) {
  const { settings, updateSettings, setOrigin, setDestination } = useTripStore();

  // Use string state so the field can be fully cleared before typing a new number
  const [days, setDays] = useState<string>("3");
  const [ridingStyles, setRidingStyles] = useState<RidingStyle[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [season, setSeason] = useState<Season>("spring");
  const [regionsToInclude, setRegionsToInclude] = useState("");
  const [regionsToAvoid, setRegionsToAvoid] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");

  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedScheduleDays, setExpandedScheduleDays] = useState<Set<number>>(new Set());

  const toggleSchedule = (dayNumber: number) => {
    setExpandedScheduleDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNumber)) {
        next.delete(dayNumber);
      } else {
        next.add(dayNumber);
      }
      return next;
    });
  };

  const toggleRidingStyle = (style: RidingStyle) => {
    setRidingStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const toggleInterest = (interest: Interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
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
          ridingStyles,
          interests,
          season,
          budget: settings.budget,
          regionsToInclude,
          regionsToAvoid,
          additionalComments: additionalComments.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to generate itinerary");
      }
      const data = await res.json();
      setItinerary(data.itinerary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDay = (day: ItineraryDay) => {
    setOrigin(day.startLocation);
    setDestination(day.endLocation);
    onSwitchToRoute();
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500";

  if (itinerary) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setItinerary(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to form
        </button>

        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          Your {itinerary.length}-Day Itinerary
        </h2>

        {itinerary.map((day) => (
          <Card key={day.day} padding="md">
            <div className="flex flex-col gap-3">
              {/* Day header */}
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg shrink-0">
                  <Bike className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Day {day.day}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{day.title}</p>
                </div>
              </div>

              {/* Distance + time badges */}
              <div className="flex gap-2">
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full font-medium">
                  {day.distanceKm} km
                </span>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full font-medium">
                  {formatDuration(day.ridingTimeMinutes)} riding
                </span>
              </div>

              {/* Seasonal warning */}
              {day.seasonalWarning && (
                <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700 dark:text-orange-400">{day.seasonalWarning}</p>
                </div>
              )}

              {/* Key stops */}
              {day.keyStops.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Key Stops</p>
                  <ul className="flex flex-col gap-1">
                    {day.keyStops.map((stop, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                        {stop}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Accommodation */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex flex-col gap-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Accommodation</p>
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none">{ACCOMMODATION_ICONS[day.accommodation.type]}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{day.accommodation.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ParkingSquare className={`w-3 h-3 ${day.accommodation.hasMotorcycleParking ? "text-green-600" : "text-gray-400"}`} />
                      <p className="text-xs text-gray-500 dark:text-gray-400">{day.accommodation.parkingNote}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* POIs */}
              {day.pois.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Points of Interest</p>
                  <ul className="flex flex-col gap-0.5">
                    {day.pois.map((poi, i) => (
                      <li key={i} className="text-xs text-gray-600 dark:text-gray-400">• {poi}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Daily Schedule */}
              {day.schedule && day.schedule.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSchedule(day.day)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    {expandedScheduleDays.has(day.day) ? "Hide schedule ▲" : "Show schedule ▼"}
                  </button>
                  {expandedScheduleDays.has(day.day) && (
                    <div className="mt-2 flex flex-col">
                      {day.schedule.map((entry, i) => (
                        <div key={i} className="flex gap-3">
                          {/* Vertical line + dot connector */}
                          <div className="flex flex-col items-center shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500 mt-1 shrink-0" />
                            {i < day.schedule!.length - 1 && (
                              <div className="w-px flex-1 bg-gray-200 dark:bg-gray-600 my-0.5" />
                            )}
                          </div>
                          <div className="flex gap-2 pb-2 min-w-0">
                            <span className="text-xs font-mono text-gray-400 dark:text-gray-500 shrink-0 tabular-nums">
                              {entry.time}
                            </span>
                            <span className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                              {entry.activity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Load into route planner */}
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-1"
                onClick={() => handleLoadDay(day)}
              >
                <MapPin className="w-3 h-3" />
                Load Day {day.day} into Route Planner
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Plan Your Trip</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tell us about your ideal journey and we'll build an itinerary</p>
      </div>

      {/* Days */}
      <div className="flex flex-col gap-1">
        <Tooltip text="How many days is your trip? Itinerary will be planned day-by-day (max 21)" wide>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide cursor-help">
            Number of Days
          </label>
        </Tooltip>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={days}
          onChange={(e) => setDays(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={handleDaysBlur}
          className={inputClass}
          placeholder="3"
        />
      </div>

      {/* Riding style */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Riding Style
        </label>
        <div className="flex flex-wrap gap-2">
          {RIDING_STYLE_OPTIONS.map((opt) => (
            <Tooltip key={opt.value} text={opt.tooltip} wide>
              <button
                onClick={() => toggleRidingStyle(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                  ${ridingStyles.includes(opt.value)
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-red-400"
                  }`}
              >
                {opt.emoji} {opt.label}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Interests
        </label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((opt) => (
            <Tooltip key={opt.value} text={opt.tooltip} wide>
              <button
                onClick={() => toggleInterest(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                  ${interests.includes(opt.value)
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-red-400"
                  }`}
              >
                {opt.emoji} {opt.label}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Season */}
      <div className="flex flex-col gap-1">
        <Tooltip text="Season affects road conditions, mountain pass closures, weather, and which festivals are active" wide>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide cursor-help">
            Season
          </label>
        </Tooltip>
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value as Season)}
          className={inputClass}
        >
          {SEASON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Regions */}
      <div className="flex flex-col gap-1">
        <Tooltip text="Name specific prefectures or areas you definitely want to visit, e.g. 'Hokkaido, Nikko'" wide>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide cursor-help">
            Regions to Include <span className="text-gray-400 normal-case font-normal">(optional)</span>
          </label>
        </Tooltip>
        <input
          type="text"
          placeholder="e.g. Tohoku, Kyushu, Hokkaido"
          value={regionsToInclude}
          onChange={(e) => setRegionsToInclude(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Tooltip text="Areas to skip — useful if you've already ridden somewhere or want to avoid tourist-heavy zones" wide>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide cursor-help">
            Regions to Avoid <span className="text-gray-400 normal-case font-normal">(optional)</span>
          </label>
        </Tooltip>
        <input
          type="text"
          placeholder="e.g. Tokyo, Osaka"
          value={regionsToAvoid}
          onChange={(e) => setRegionsToAvoid(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Additional Comments */}
      <div className="flex flex-col gap-1">
        <Tooltip text="Add special needs — e.g. travelling with a pillion, avoiding highways, looking for biker cafes, accessibility requirements" wide>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide cursor-help">
            Additional Comments <span className="text-gray-400 normal-case font-normal">(optional)</span>
          </label>
        </Tooltip>
        <textarea
          rows={3}
          placeholder="e.g. I'm travelling with a pillion, prefer coastal roads, interested in biker cafes..."
          value={additionalComments}
          onChange={(e) => setAdditionalComments(e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Budget — inline editable, synced with Trip Settings */}
      <div className="flex flex-col gap-1">
        <Tooltip text="Affects accommodation suggestions in the itinerary. Also syncs with Route Planner → Trip Settings" wide>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide cursor-help">
            Accommodation Budget
          </label>
        </Tooltip>
        <select
          value={settings.budget}
          onChange={(e) => updateSettings({ budget: e.target.value as "budget" | "mid" | "luxury" })}
          className={inputClass}
        >
          <option value="budget">Budget (hostels, ~¥3,500/night)</option>
          <option value="mid">Mid-range (business hotel, ~¥8,000/night)</option>
          <option value="luxury">Luxury (ryokan, ~¥20,000/night)</option>
        </select>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2">{error}</p>
      )}

      <Tooltip text="Uses AI to build a day-by-day motorcycle itinerary based on your preferences" wide position="top">
        <Button onClick={handleGenerate} loading={loading} size="md" className="w-full">
          <Sparkles className="w-4 h-4" />
          {loading ? "Generating itinerary..." : "Generate Itinerary"}
        </Button>
      </Tooltip>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
        Powered by Claude AI · Takes ~10 seconds
      </p>
    </div>
  );
}
