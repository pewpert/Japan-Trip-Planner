"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";

const CATEGORIES: { type: string; emoji: string; label: string }[] = [
  { type: "biker-cafe",     emoji: "🏍",  label: "Biker Cafes"  },
  { type: "famous-road",   emoji: "🏆",  label: "Famous Roads" },
  { type: "michi-no-eki",  emoji: "🏪",  label: "Michi-no-Eki" },
  { type: "bike-rental",   emoji: "🔧",  label: "Bike Rentals" },
  { type: "scenic",        emoji: "🏔",  label: "Scenic"       },
  { type: "accommodation", emoji: "🏨",  label: "Stay"         },
];

export function POILayerToggle() {
  const { activeBikerCategories, toggleBikerCategory } = useTripStore();
  const [expanded, setExpanded] = useState(false);

  const pillClass = (active: boolean) => `
    flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
    backdrop-blur-sm border transition-all duration-150 shadow-sm cursor-pointer
    ${active
      ? "bg-gray-900/90 border-white/20 text-white"
      : "bg-gray-900/50 border-white/10 text-white/40 hover:text-white/70"
    }
  `;

  return (
    <>
      {/* Desktop: always-visible vertical stack, bottom-right above Google controls */}
      <div className="absolute bottom-24 right-3 z-20 hidden md:flex flex-col gap-1.5">
        {CATEGORIES.map(({ type, emoji, label }) => (
          <button
            key={type}
            onClick={() => toggleBikerCategory(type)}
            title={label}
            className={pillClass(activeBikerCategories.includes(type))}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Mobile: collapsed "Layers" button top-right */}
      <div className="absolute top-16 right-3 z-20 md:hidden flex flex-col items-end gap-1.5">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 bg-gray-900/85 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-medium shadow-lg"
        >
          <Layers className="w-3.5 h-3.5" />
          Layers
        </button>
        {expanded && (
          <div className="flex flex-col gap-1.5">
            {CATEGORIES.map(({ type, emoji, label }) => (
              <button
                key={type}
                onClick={() => toggleBikerCategory(type)}
                className={pillClass(activeBikerCategories.includes(type))}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
