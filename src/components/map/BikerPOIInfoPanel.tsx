"use client";

import { X, MapPin, ExternalLink } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { POI_CATEGORY_BY_TYPE } from "@/data/poiCategories";
import { mapsSearchUrl } from "@/lib/ridePlan";

const REGION_LABELS: Record<string, string> = {
  kanto: "Kantō",
  chubu: "Chūbu",
  kyushu: "Kyūshū",
  tohoku: "Tōhoku",
  hokkaido: "Hokkaidō",
  kansai: "Kansai",
  shikoku: "Shikoku",
};

export function BikerPOIInfoPanel() {
  const { selectedBikerPOI, setSelectedBikerPOI } = useTripStore();

  if (!selectedBikerPOI) return null;

  const poi = selectedBikerPOI;
  const category = POI_CATEGORY_BY_TYPE[poi.type];

  return (
    <aside
      aria-label={poi.name}
      className="absolute inset-x-0 bottom-0 z-30 rounded-t-2xl border border-line bg-surface shadow-float md:inset-x-auto md:bottom-5 md:right-[232px] md:w-80 md:rounded-2xl"
    >
      <div className="flex items-start gap-3 border-b border-line p-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {category && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-2">
                <span className={`h-2 w-2 rounded-full ${category.swatch}`} aria-hidden />
                {category.label}
              </span>
            )}
            <span className="text-xs text-ink-3">{REGION_LABELS[poi.region] ?? poi.region}</span>
          </div>
          <h3 className="text-[15px] font-semibold leading-snug text-ink">{poi.name}</h3>
        </div>
        <button
          onClick={() => setSelectedBikerPOI(null)}
          className="shrink-0 rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <p className="text-[13px] leading-relaxed text-ink-2">{poi.description}</p>

        <div className="flex items-start gap-2 text-xs text-ink-3">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{poi.address}</span>
        </div>

        {poi.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {poi.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-ink-2">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <a
            href={mapsSearchUrl("バイク駐車場", poi.coordinates)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
          >
            Moto parking nearby <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
          {poi.url && (
            <a
              href={poi.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
            >
              Website <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
