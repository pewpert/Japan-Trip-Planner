"use client";

import { Loader2 } from "lucide-react";
import { SEED_ROUTES, type SeedRoute } from "@/data/seedRoutes";
import { useSeedRoute } from "@/hooks/useSeedRoute";
import { Tooltip } from "@/components/ui/Tooltip";

const DIFFICULTY = {
  beginner: { dot: "bg-go", label: "Beginner" },
  intermediate: { dot: "bg-warn", label: "Intermediate" },
  advanced: { dot: "bg-stop", label: "Advanced" },
} as const;

interface SeedRouteListProps {
  routes?: SeedRoute[];
  /** "list": hairline-separated rows. "strip": separate cards for a horizontal scroller. */
  layout?: "list" | "strip";
}

export function SeedRouteList({ routes = SEED_ROUTES, layout = "list" }: SeedRouteListProps) {
  const { load, loadingId } = useSeedRoute();

  return (
    <ul
      className={
        layout === "strip"
          ? "flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
          : "flex flex-col divide-y divide-line"
      }
    >
      {routes.map((seed) => (
        <li key={seed.id} className={layout === "strip" ? "w-[268px] shrink-0 snap-start" : ""}>
          <SeedRow
            seed={seed}
            card={layout === "strip"}
            loading={loadingId === seed.id}
            disabled={loadingId !== null}
            onLoad={() => load(seed)}
          />
        </li>
      ))}
    </ul>
  );
}

interface SeedRowProps {
  seed: SeedRoute;
  card: boolean;
  loading: boolean;
  disabled: boolean;
  onLoad: () => void;
}

function SeedRow({ seed, card, loading, disabled, onLoad }: SeedRowProps) {
  const difficulty = DIFFICULTY[seed.difficulty];

  return (
    <Tooltip text={seed.tooltipDescription} position="bottom" wide>
      <button
        onClick={onLoad}
        disabled={disabled}
        className={`group w-full text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          card
            ? "rounded-2xl border border-line bg-surface/95 p-4 shadow-float backdrop-blur-xl"
            : "px-1 py-4 hover:bg-surface-2/60"
        }`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-medium text-ink-3">{seed.nameJa}</span>
          <span className="num shrink-0 text-xs text-ink-3">
            {seed.durationDays} days · ~{seed.distanceKm} km
          </span>
        </div>
        <p className="mt-0.5 text-[15px] font-semibold leading-snug text-ink">{seed.name}</p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-2">{seed.tagline}</p>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-xs text-ink-3">
            <span className={`h-2 w-2 rounded-full ${difficulty.dot}`} aria-hidden />
            {difficulty.label}
          </span>
          {loading ? (
            <span className="flex items-center gap-1.5 text-xs text-ink-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" aria-hidden />
              Planning route…
            </span>
          ) : (
            <span className="text-[13px] font-medium text-accent group-hover:underline">
              Plan this ride →
            </span>
          )}
        </div>
      </button>
    </Tooltip>
  );
}
