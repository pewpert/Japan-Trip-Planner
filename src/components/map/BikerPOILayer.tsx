"use client";

import { Marker } from "@react-google-maps/api";
import { BIKER_POIS } from "@/data/bikerPOIs";
import { useTripStore } from "@/hooks/useTripStore";

const BIKER_POI_COLORS: Record<string, string> = {
  "biker-cafe": "#ef4444",
  "famous-road": "#f59e0b",
  "michi-no-eki": "#10b981",
  "bike-rental": "#3b82f6",
  "scenic": "#8b5cf6",
  "accommodation": "#f97316",
};

const BIKER_POI_EMOJIS: Record<string, string> = {
  "biker-cafe": "🏍",
  "famous-road": "🏆",
  "michi-no-eki": "🏪",
  "bike-rental": "🔧",
  "scenic": "🏔",
  "accommodation": "🏨",
};

function makeSVGIcon(type: string, selected: boolean): string {
  const color = BIKER_POI_COLORS[type] ?? "#6b7280";
  const emoji = BIKER_POI_EMOJIS[type] ?? "📍";
  const size = selected ? 40 : 34;
  const r = size / 2 - 2;
  const strokeWidth = selected ? "3" : "2";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${color}" stroke="#ffffff" stroke-width="${strokeWidth}"/>` +
    `<text x="${size / 2}" y="${size / 2 + 5}" text-anchor="middle" font-size="14">${emoji}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function BikerPOILayer() {
  const { activeBikerCategories, selectedBikerPOI, setSelectedBikerPOI } = useTripStore();

  const filtered = BIKER_POIS.filter((poi) => activeBikerCategories.includes(poi.type));

  return (
    <>
      {filtered.map((poi) => {
        const isSelected = selectedBikerPOI?.id === poi.id;
        const size = isSelected ? 40 : 34;
        return (
          <Marker
            key={poi.id}
            position={poi.coordinates}
            title={poi.name}
            zIndex={isSelected ? 20 : 10}
            icon={{
              url: makeSVGIcon(poi.type, isSelected),
              scaledSize: new google.maps.Size(size, size),
              anchor: new google.maps.Point(size / 2, size / 2),
            }}
            onClick={() => setSelectedBikerPOI(isSelected ? null : poi)}
          />
        );
      })}
    </>
  );
}
