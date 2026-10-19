"use client";

import { Marker } from "@react-google-maps/api";
import { BIKER_POIS } from "@/data/bikerPOIs";
import { POI_CATEGORY_BY_TYPE } from "@/data/poiCategories";
import { useTripStore } from "@/hooks/useTripStore";

const FALLBACK_COLOR = "#64748B";

/** A flat dot with a white ring — quiet at country scale, still tappable. */
function makeDotIcon(color: string, selected: boolean): { url: string; size: number } {
  const size = selected ? 30 : 20;
  const r = selected ? 10 : 6.5;
  const ring = selected ? 3 : 2;
  const c = size / 2;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    (selected ? `<circle cx="${c}" cy="${c}" r="${c - 0.5}" fill="${color}" fill-opacity="0.25"/>` : "") +
    `<circle cx="${c}" cy="${c}" r="${r}" fill="${color}" stroke="#ffffff" stroke-width="${ring}"/>` +
    `</svg>`;
  return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, size };
}

export function BikerPOILayer() {
  const { activeBikerCategories, selectedBikerPOI, setSelectedBikerPOI } = useTripStore();

  const filtered = BIKER_POIS.filter((poi) => activeBikerCategories.includes(poi.type));

  return (
    <>
      {filtered.map((poi) => {
        const isSelected = selectedBikerPOI?.id === poi.id;
        const color = POI_CATEGORY_BY_TYPE[poi.type]?.color ?? FALLBACK_COLOR;
        const { url, size } = makeDotIcon(color, isSelected);
        return (
          <Marker
            key={poi.id}
            position={poi.coordinates}
            title={poi.name}
            zIndex={isSelected ? 20 : 10}
            icon={{
              url,
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
