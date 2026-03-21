"use client";

import { X, MapPin, ExternalLink } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";

const TYPE_LABELS: Record<string, string> = {
  "biker-cafe": "Biker Cafe",
  "famous-road": "Famous Road",
  "michi-no-eki": "Michi-no-Eki",
  "bike-rental": "Bike Rental",
  "scenic": "Scenic Spot",
  "accommodation": "Accommodation",
};

const TYPE_COLORS: Record<string, string> = {
  "biker-cafe": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  "famous-road": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "michi-no-eki": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bike-rental": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "scenic": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "accommodation": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

export function BikerPOIInfoPanel() {
  const { selectedBikerPOI, setSelectedBikerPOI } = useTripStore();

  if (!selectedBikerPOI) return null;

  const poi = selectedBikerPOI;

  return (
    <div className="
      absolute z-30
      bottom-0 left-0 right-0
      md:bottom-4 md:right-36 md:left-auto md:w-72
      bg-white dark:bg-gray-800
      rounded-t-xl md:rounded-xl
      shadow-2xl border border-gray-200 dark:border-gray-700
    ">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[poi.type] ?? "bg-gray-100 text-gray-600"}`}>
              {TYPE_LABELS[poi.type] ?? poi.type}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{poi.region}</span>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{poi.name}</h3>
        </div>
        <button
          onClick={() => setSelectedBikerPOI(null)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0 p-1"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{poi.description}</p>

        <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{poi.address}</span>
        </div>

        {poi.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {poi.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {poi.url && (
          <a
            href={poi.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Visit Website
          </a>
        )}
      </div>
    </div>
  );
}
