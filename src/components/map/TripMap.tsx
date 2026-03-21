"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from "@react-google-maps/api";
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
  const { route, pois, suggestedBreaks, isLoadingRoute, origin, destination, waypoints, isDarkMode, setSelectedBikerPOI } = useTripStore();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // When route data arrives, fire a client-side DirectionsService call to get
  // a real DirectionsResult that the renderer can draw correctly.
  useEffect(() => {
    if (!isLoaded) return;

    if (!route || !origin || !destination) {
      setDirections(null);
      return;
    }

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin,
        destination,
        waypoints: waypoints.map((w) => ({ location: w, stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING,
        region: "jp",
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        }
      }
    );
  }, [route, isLoaded, origin, destination, waypoints]);

  // Fit map to route bounds when directions arrive
  useEffect(() => {
    if (!mapRef.current || !directions) return;
    const bounds = directions.routes[0].bounds;
    mapRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [directions]);

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
        {/* Route overlay — uses real DirectionsResult from client-side service */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: "#dc2626",
                strokeWeight: 4,
                strokeOpacity: 0.85,
              },
            }}
          />
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
