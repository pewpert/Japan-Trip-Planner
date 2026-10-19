"use client";

import { CheckCircle2, CloudOff, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { useRidePlan } from "@/hooks/useRidePlan";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TripExportButton } from "./TripExportButton";
import { formatClock, formatSpan, isWeekend } from "@/lib/ridePlan";
import { fieldClass } from "@/components/ui/Input";
import type { VerdictLevel } from "@/types/ride";

const VERDICT_STYLE: Record<VerdictLevel, { icon: LucideIcon; box: string; text: string }> = {
  go: { icon: CheckCircle2, box: "bg-go-soft", text: "text-go" },
  caution: { icon: TriangleAlert, box: "bg-warn-soft", text: "text-warn" },
  stop: { icon: OctagonAlert, box: "bg-stop-soft", text: "text-stop" },
};

/** "Ikebukuro, Tokyo" → "Ikebukuro" */
function shortPlace(place: string): string {
  return place.split(",")[0].trim();
}

export function RideBriefing() {
  const { origin, destination, waypoints, rideDayOffset, setRideDayOffset, departureTime, setDepartureTime, isLoadingWeather } =
    useTripStore();
  const plan = useRidePlan();

  if (!plan) return null;
  const { route, verdict, timeline, days } = plan;

  const from = shortPlace(origin);
  const to = shortPlace(destination);
  const title = from === to ? `${from} loop` : `${from} → ${to}`;

  const arrivalAfterDark = timeline.daylightBufferMinutes !== null && timeline.daylightBufferMinutes < 0;

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5">
        <div>
          <p className="eyebrow text-ink-3">Ride briefing</p>
          <h2 className="mt-1 text-xl font-semibold leading-snug tracking-tight text-ink text-balance">
            {title}
          </h2>
          {waypoints.length > 0 && (
            <p className="mt-0.5 text-[13px] text-ink-3">
              via {waypoints.length} {waypoints.length === 1 ? "stop" : "stops"}
            </p>
          )}
        </div>

        {/* Verdict — the answer first */}
        {verdict ? (
          <div className={`flex gap-3 rounded-xl p-3.5 ${VERDICT_STYLE[verdict.level].box}`}>
            {(() => {
              const Icon = VERDICT_STYLE[verdict.level].icon;
              return <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${VERDICT_STYLE[verdict.level].text}`} aria-hidden />;
            })()}
            <div className="min-w-0">
              <p className={`text-[15px] font-semibold ${VERDICT_STYLE[verdict.level].text}`}>
                {verdict.headline}
              </p>
              <ul className="mt-1 space-y-0.5">
                {verdict.reasons.map((reason) => (
                  <li key={reason} className="text-[13px] leading-relaxed text-ink-2">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : isLoadingWeather ? (
          <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3.5">
            <LoadingSpinner size="sm" />
            <p className="text-[13px] text-ink-2">Checking the forecast along the route…</p>
          </div>
        ) : (
          <div className="flex gap-3 rounded-xl bg-surface-2 p-3.5">
            <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-ink-3" aria-hidden />
            <div>
              <p className="text-[15px] font-semibold text-ink">Forecast unavailable</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">
                Check the weather and road status yourself before you go.
              </p>
            </div>
          </div>
        )}

        {/* When — day chips + departure */}
        <div className="flex flex-col gap-3">
          <div
            role="radiogroup"
            aria-label="Ride day"
            className="-mx-5 flex snap-x gap-1.5 overflow-x-auto px-5 pb-1"
          >
            {days.map((day) => {
              const selected = day.offset === rideDayOffset;
              const weekend = isWeekend(day);
              return (
                <button
                  key={day.iso}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setRideDayOffset(day.offset)}
                  className={`flex w-[52px] shrink-0 snap-start flex-col items-center rounded-xl border py-2 transition-colors ${
                    selected
                      ? "border-accent bg-accent text-on-accent"
                      : "border-line bg-surface hover:border-line-strong"
                  }`}
                >
                  <span
                    className={`eyebrow ${
                      selected ? "text-on-accent/80" : weekend ? "text-accent" : "text-ink-3"
                    }`}
                  >
                    {day.offset === 0 ? "Today" : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.weekday]}
                  </span>
                  <span className="num text-base font-semibold">{day.day}</span>
                </button>
              );
            })}
          </div>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink-2">Depart</span>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value || "08:00")}
              className={`${fieldClass} w-auto! num`}
            />
          </label>
        </div>
      </div>

      {/* Key figures */}
      <dl className="grid grid-cols-3 divide-x divide-line border-t border-line">
        <div className="p-4">
          <dt className="eyebrow text-ink-3">Distance</dt>
          <dd className="num mt-1 text-xl font-semibold text-ink">
            {route.distanceKm.toFixed(0)}
            <span className="ml-0.5 text-sm font-medium text-ink-3">km</span>
          </dd>
          <p className="num mt-0.5 text-xs text-ink-3">{formatSpan(timeline.movingMinutes)} riding</p>
        </div>
        <div className="p-4">
          <dt className="eyebrow text-ink-3">Door to door</dt>
          <dd className="num mt-1 text-xl font-semibold text-ink">{formatSpan(timeline.totalMinutes)}</dd>
          <p className="num mt-0.5 text-xs text-ink-3">
            {timeline.stopMinutes > 0 ? `incl. ${formatSpan(timeline.stopMinutes)} stops` : "no stops"}
          </p>
        </div>
        <div className="p-4">
          <dt className="eyebrow text-ink-3">Arrive</dt>
          <dd className={`num mt-1 text-xl font-semibold ${arrivalAfterDark ? "text-stop" : "text-ink"}`}>
            {formatClock(timeline.arrivalMinutes)}
          </dd>
          <p className={`num mt-0.5 text-xs ${arrivalAfterDark ? "text-stop" : "text-ink-3"}`}>
            {timeline.sunsetMinutes === null
              ? "—"
              : arrivalAfterDark
                ? `after dark (sunset ${formatClock(timeline.sunsetMinutes)})`
                : `sunset ${formatClock(timeline.sunsetMinutes)}`}
          </p>
        </div>
      </dl>

      <div className="border-t border-line p-4">
        <TripExportButton />
      </div>
    </Card>
  );
}
