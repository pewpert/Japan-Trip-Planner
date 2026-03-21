export interface Waypoint {
  id: string;
  label: string;
  coordinates: { lat: number; lng: number };
  address: string;
}

export interface RouteResult {
  polylinePath: Array<{ lat: number; lng: number }>;
  distanceKm: number;
  durationMinutes: number;
  steps: RouteStep[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface RouteStep {
  instruction: string;
  distanceKm: number;
  durationMinutes: number;
  coordinates: { lat: number; lng: number };
}

export interface POI {
  id: string;
  name: string;
  type: "michi-no-eki" | "scenic" | "fuel" | "food" | "accommodation" | "festival";
  coordinates: { lat: number; lng: number };
  address: string;
  description?: string;
  url?: string;
}

export interface SuggestedBreak {
  id: string;
  coordinates: { lat: number; lng: number };
  timeIntoRideMinutes: number;
  distanceIntoRouteKm: number;
  label: string;
  note: string;
}

export interface BikerPOI {
  id: string;
  name: string;
  type: "biker-cafe" | "famous-road" | "michi-no-eki" | "accommodation" | "bike-rental" | "scenic";
  coordinates: { lat: number; lng: number };
  address: string;
  description: string;
  region: "kanto" | "chubu" | "kyushu" | "tohoku" | "hokkaido" | "kansai" | "shikoku";
  tags: string[];
  url?: string;
}
