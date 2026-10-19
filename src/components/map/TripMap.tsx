"use client";

import { useEffect, useRef, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Polyline, Marker } from "@react-google-maps/api";
import { TriangleAlert, X } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { useRidePlan } from "@/hooks/useRidePlan";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyStatePanel } from "@/components/map/EmptyStatePanel";
import { BikerPOILayer } from "@/components/map/BikerPOILayer";
import { BikerPOIInfoPanel } from "@/components/map/BikerPOIInfoPanel";
import { POILayerToggle } from "@/components/map/POILayerToggle";

const JAPAN_CENTER = { lat: 36.5, lng: 137.0 };
const DEFAULT_ZOOM = 6;

const LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

// Route colors mirror the --accent token for each theme (the map can't read CSS variables)
const ROUTE_COLOR = { light: "#2a3b94", dark: "#98aaff" };
const ROUTE_CASING = { light: "#ffffff", dark: "#0a0e17" };

// Light map: cool paper tones that keep the route and markers in front
const lightMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#edeff4" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5c6679" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f7f8fb" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#dfe8df" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dde2ef" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#c9d0e3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c8d5e6" }] },
];

// Dark map: deep indigo, low-contrast roads
const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0f1523" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8590a8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f1523" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#122027" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1c2438" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2a3450" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9aa3ba" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#070a12" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#a0a8bd" }] },
];

function svgIcon(svg: string, size: number) {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  };
}

function endpointIcon(kind: "start" | "end", accent: string) {
  const fill = kind === "end" ? accent : "#ffffff";
  const stroke = kind === "end" ? "#ffffff" : accent;
  const dot = kind === "end" ? "#ffffff" : accent;
  return svgIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">` +
      `<circle cx="14" cy="14" r="10" fill="${fill}" stroke="${stroke}" stroke-width="3.5"/>` +
      `<circle cx="14" cy="14" r="3.5" fill="${dot}"/></svg>`,
    28
  );
}

function stopIcon(kind: "break" | "fuel") {
  const color = kind === "fuel" ? "#0e1424" : "#c98a0b";
  const glyph =
    kind === "fuel"
      ? `<text x="11" y="15" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#ffffff">F</text>`
      : `<rect x="8" y="8" width="6" height="6" rx="1.5" fill="#ffffff"/>`;
  return svgIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">` +
      `<circle cx="11" cy="11" r="9" fill="${color}" stroke="#ffffff" stroke-width="2"/>${glyph}</svg>`,
    22
  );
}

export function TripMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const { route, suggestedBreaks, isLoadingRoute, isDarkMode, setSelectedBikerPOI, routeError, setRouteError } =
    useTripStore();
  const plan = useRidePlan();

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
      <div className="flex flex-1 items-center justify-center bg-surface-2">
        <div className="p-6 text-center">
          <p className="font-medium text-stop">Google Maps didn&apos;t load</p>
          <p className="mt-1 text-sm text-ink-3">Check the API key in .env.local, then restart the dev server.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center bg-surface-2">
        <LoadingSpinner size="lg" label="Loading map…" />
      </div>
    );
  }

  const theme = isDarkMode ? "dark" : "light";
  const routePath = route?.polylinePath ?? [];

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
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
          clickableIcons: false,
          gestureHandling: "greedy",
          styles: isDarkMode ? darkMapStyles : lightMapStyles,
        }}
      >
        {/* Route — cased so it holds its own against any basemap */}
        {route && routePath.length > 0 && (
          <>
            <Polyline
              path={routePath}
              options={{ strokeColor: ROUTE_CASING[theme], strokeWeight: 9, strokeOpacity: 0.9, zIndex: 1 }}
            />
            <Polyline
              path={routePath}
              options={{ strokeColor: ROUTE_COLOR[theme], strokeWeight: 5, strokeOpacity: 1, zIndex: 2 }}
            />
            <Marker
              position={routePath[0]}
              title="Start"
              zIndex={30}
              icon={endpointIcon("start", ROUTE_COLOR[theme])}
            />
            <Marker
              position={routePath[routePath.length - 1]}
              title="Destination"
              zIndex={30}
              icon={endpointIcon("end", ROUTE_COLOR[theme])}
            />
          </>
        )}

        {/* Suggested breaks and planned fuel stops */}
        {suggestedBreaks.map((brk) => (
          <Marker
            key={brk.id}
            position={brk.coordinates}
            title={`${brk.label} — ${brk.note}`}
            zIndex={5}
            icon={stopIcon("break")}
          />
        ))}
        {plan?.fuelPlan.stops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={stop.coordinates}
            title={`Fuel stop ${index + 1} — around km ${stop.distanceKm}`}
            zIndex={6}
            icon={stopIcon("fuel")}
          />
        ))}

        <BikerPOILayer />
      </GoogleMap>

      <BikerPOIInfoPanel />
      <POILayerToggle />

      {/* Route error banner */}
      {routeError && (
        <div
          role="alert"
          className="absolute left-1/2 top-4 z-20 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-2xl border border-stop/40 bg-surface px-4 py-3 shadow-float"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-stop" aria-hidden />
          <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-ink">{routeError}</p>
          <button
            onClick={() => setRouteError(null)}
            className="shrink-0 rounded-lg p-1 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {isLoadingRoute && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-canvas/70 backdrop-blur-sm">
          <LoadingSpinner size="lg" label="Planning the route…" />
        </div>
      )}

      {/* Empty state — shown when no route is loaded */}
      {!route && !isLoadingRoute && <EmptyStatePanel />}
    </div>
  );
}
