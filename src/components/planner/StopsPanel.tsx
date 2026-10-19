"use client";

import { ExternalLink } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { useRidePlan } from "@/hooks/useRidePlan";
import { Disclosure } from "@/components/ui/Disclosure";
import { BREAK_MINUTES, formatClock, formatSpan, mapsSearchUrl } from "@/lib/ridePlan";

interface Coordinates {
  lat: number;
  lng: number;
}

function QuickLink({ label, query, at }: { label: string; query: string; at: Coordinates }) {
  return (
    <a
      href={mapsSearchUrl(query, at)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
    >
      {label} <ExternalLink className="h-3 w-3" aria-hidden />
    </a>
  );
}

export function StopsPanel() {
  const { suggestedBreaks } = useTripStore();
  const plan = useRidePlan();
  if (!plan) return null;

  const { route, timeline } = plan;
  const destination = route.polylinePath[route.polylinePath.length - 1];

  return (
    <Disclosure
      title="Stops"
      summary={
        suggestedBreaks.length === 0
          ? "no breaks needed"
          : `${suggestedBreaks.length} ${suggestedBreaks.length === 1 ? "break" : "breaks"}`
      }
    >
      <div className="flex flex-col gap-5">
        {suggestedBreaks.length === 0 ? (
          <p className="text-[13px] text-ink-2">
            Under two hours in the saddle — no scheduled breaks. Stop whenever you like.
          </p>
        ) : (
          <ol className="flex flex-col gap-4">
            {suggestedBreaks.map((brk, index) => {
              const clock =
                timeline.departureMinutes + brk.timeIntoRideMinutes + index * BREAK_MINUTES;
              return (
                <li key={brk.id} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{brk.label}</p>
                    <p className="num text-[13px] text-ink-3">
                      ≈ {formatClock(clock)} · {brk.distanceIntoRouteKm} km in ·{" "}
                      {formatSpan(brk.timeIntoRideMinutes)} riding
                    </p>
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink-2">{brk.note}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <QuickLink label="Fuel" query="ガソリンスタンド" at={brk.coordinates} />
                    <QuickLink label="道の駅" query="道の駅" at={brk.coordinates} />
                    <QuickLink label="Moto parking" query="バイク駐車場" at={brk.coordinates} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {destination && (
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <p className="text-sm font-semibold text-ink">At the destination</p>
            <p className="text-[13px] leading-relaxed text-ink-2">
              Sort the bike&apos;s parking before you arrive — many tourist towns have only a handful
              of motorcycle spaces.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <QuickLink label="Moto parking" query="バイク駐車場" at={destination} />
              <QuickLink label="Day-use onsen 日帰り温泉" query="日帰り温泉" at={destination} />
              <QuickLink label="Fuel for the ride home" query="ガソリンスタンド" at={destination} />
            </div>
          </div>
        )}
      </div>
    </Disclosure>
  );
}
