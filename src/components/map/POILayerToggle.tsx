"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { POI_CATEGORIES } from "@/data/poiCategories";

/** Map layers — doubles as the legend for the marker colors. */
export function POILayerToggle() {
  const { activeBikerCategories, toggleBikerCategory } = useTripStore();
  const [expanded, setExpanded] = useState(false);

  const list = (
    <ul className="flex flex-col gap-0.5">
      {POI_CATEGORIES.map(({ type, label, swatch, Icon }) => {
        const active = activeBikerCategories.includes(type);
        return (
          <li key={type}>
            <button
              onClick={() => toggleBikerCategory(type)}
              aria-pressed={active}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-surface-2"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-opacity ${swatch} ${
                  active ? "opacity-100" : "opacity-30"
                }`}
              >
                <Icon className="h-3 w-3 text-white" aria-hidden />
              </span>
              <span className={active ? "text-ink" : "text-ink-3"}>{label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop: always-visible panel, bottom-right above the Google controls */}
      <div className="absolute bottom-28 right-3 z-20 hidden w-[204px] rounded-2xl border border-line bg-surface/90 p-2 shadow-float backdrop-blur-xl md:block">
        <p className="eyebrow px-2.5 pb-1.5 pt-1 text-ink-3">Map layers</p>
        {list}
      </div>

      {/* Mobile: collapsed button, top-right */}
      <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-2 md:hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-3.5 py-2 text-[13px] font-medium text-ink shadow-float backdrop-blur-xl"
        >
          <Layers className="h-4 w-4" aria-hidden />
          Layers
        </button>
        {expanded && (
          <div className="w-[204px] rounded-2xl border border-line bg-surface/95 p-2 shadow-float backdrop-blur-xl">
            {list}
          </div>
        )}
      </div>
    </>
  );
}
