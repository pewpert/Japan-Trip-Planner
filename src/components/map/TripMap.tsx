"use client";

import { useEffect, useRef, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Polyline, Marker } from "@react-google-maps/api";
import { AlertTriangle, X } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyStatePanel } from "@/components/map/EmptyStatePanel";
import { BikerPOILayer } from "@/components/map/BikerPOILayer";
import { BikerPOIInfoPanel } from "@/components/map/BikerPOIInfoPanel";
import { POILayerToggle } from "@/components/map/POILayerToggle";
import type { POI } from "@/types/route";

const JAPAN_CENTER = { lat: 36.5, lng: 137.0 };
const DEFAULT_ZOOM = 6;

const LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const POI_ICONS: Record<POI["type"], string> = {
  "michi-no-eki": "🏪",
  scenic: "🏔️",
  fuel: "⛽",
  food: "🍜",
  accommodation: "🏨",
  festival: "🎌",
};

// Light mode map style
const lightMapStyles: google.maps.MapTypeStyle[] = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d4edda" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#fde68a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#bfdbfe" }] },
];

// Dark mode map style
const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#a8a8a8" }] },
];

export function TripMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const { route, pois, suggestedBreaks, isLoadingRoute, isDarkMode, setSelectedBikerPOI, routeError, setRouteError } = useTripStore();

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Fit map to the bounds returned by /api/route — no second Directions call needed
  useEffect(() => {
    if (!mapRef.current || !route) return;
    mapRef.current.fitBounds(route.bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [route]);

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-6">
          <p className="text-red-600 font-medium">Failed to load Google Maps</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Check your API key in .env.local</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner size="lg" label="Loading map..." />
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={JAPAN_CENTER}
        zoom={DEFAULT_ZOOM}
        onLoad={onMapLoad}
        onClick={() => setSelectedBikerPOI(null)}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: "greedy",
          styles: isDarkMode ? darkMapStyles : lightMapStyles,
        }}
      >
        {/* Route overlay — drawn from the polyline already returned by /api/route */}
        {route && route.polylinePath.length > 0 && (
          <>
            <Polyline
              path={route.polylinePath}
              options={{
                strokeColor: "#dc2626",
                strokeWeight: 4,
                strokeOpacity: 0.85,
              }}
            />
            <Marker position={route.polylinePath[0]} label="A" title="Start" />
            <Marker
              position={route.polylinePath[route.polylinePath.length - 1]}
              label="B"
              title="End"
            />
          </>
        )}

        {/* POI markers */}
        {pois.map((poi) => (
          <Marker
            key={poi.id}
            position={poi.coordinates}
            title={poi.name}
            label={{
              text: POI_ICONS[poi.type],
              fontSize: "18px",
            }}
          />
        ))}

        {/* Suggested break markers — amber circle pins */}
        {suggestedBreaks.map((brk) => (
          <Marker
            key={brk.id}
            position={brk.coordinates}
            title={`${brk.label} — ${brk.note}`}
            zIndex={5}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">' +
                '<circle cx="18" cy="18" r="16" fill="#f59e0b" stroke="#ffffff" stroke-width="2.5"/>' +
                '<text x="18" y="23" text-anchor="middle" font-size="15">☕</text>' +
                "</svg>"
              )}`,
              scaledSize: new google.maps.Size(36, 36),
              anchor: new google.maps.Point(18, 18),
            }}
          />
        ))}

        {/* Biker POI markers */}
        <BikerPOILayer />
      </GoogleMap>

      {/* Route error banner */}
      {routeError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-md flex items-start gap-2 bg-red-600 text-white rounded-lg shadow-lg px-4 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-sm flex-1 min-w-0">{routeError}</p>
          <button
            onClick={() => setRouteError(null)}
            className="p-0.5 rounded hover:bg-red-700 transition-colors shrink-0"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Biker POI info panel */}
      <BikerPOIInfoPanel />
      {/* POI layer toggles */}
      <POILayerToggle />

      {/* Loading overlay */}
      {isLoadingRoute && (
        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center">
          <LoadingSpinner size="lg" label="Calculating route..." />
        </div>
      )}

      {/* Empty state — shown when no route is loaded */}
      {!route && !isLoadingRoute && <EmptyStatePanel />}
    </div>
  );
}
