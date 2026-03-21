"use client";

import type { SeedRoute } from "@/data/seedRoutes";

type Region = SeedRoute["region"] | "all";

const REGIONS: { value: Region; label: string; emoji: string }[] = [
  { value: "all",    label: "All Japan", emoji: "🗾" },
  { value: "kanto",  label: "Kanto",     emoji: "🗼" },
  { value: "chubu",  label: "Chubu",     emoji: "🏔️" },
  { value: "kyushu", label: "Kyushu",    emoji: "🌋" },
];

interface RegionPickerProps {
  selected: Region;
  onSelect: (region: Region) => void;
}

export function RegionPicker({ selected, onSelect }: RegionPickerProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {REGIONS.map(({ value, label, emoji }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`
            flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
            backdrop-blur-sm border transition-all duration-150
            ${selected === value
              ? "bg-red-600 border-red-500 text-white"
              : "bg-gray-900/70 border-white/10 text-white/70 hover:bg-gray-900/90 hover:text-white"
            }
          `}
        >
          <span>{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
