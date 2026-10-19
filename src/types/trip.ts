export type TripMode = "motorcycle" | "car" | "hiking" | "train";

/** How much of the route the rider expects to spend on expressways (高速道路). */
export type RoadMix = "backroads" | "mixed" | "expressway";

export interface TripSettings {
  mode: TripMode;
  fuelEfficiency: number; // km per liter
  fuelPricePerLiter: number; // JPY
  bikeEngineCC: number; // engine size — 125cc and under may not use expressways
  tankCapacityL: number; // fuel tank capacity in liters
  roadMix: RoadMix; // expressway share; "backroads" also asks Google to avoid highways
  etcWeekendDiscount: boolean; // rider is registered for NEXCO's weekend 二輪車定率割引
  budget: "budget" | "mid" | "luxury";
}

export interface Accommodation {
  name: string;
  type: "hotel" | "ryokan" | "guesthouse" | "camping";
  pricePerNight: number; // JPY
  hasParking: boolean;
  parkingCost: number; // JPY per night, 0 = free
  coordinates: { lat: number; lng: number };
  address: string;
  url?: string;
}

export interface SavedItinerary {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  updatedAt: string;
  origin: string;
  destination: string;
  waypoints: string[];
  settings: TripSettings;
  estimatedCost: CostBreakdown;
  notes: string;
}

export interface CostBreakdown {
  fuel: number; // JPY
  tolls: number; // JPY
  accommodation: number; // JPY per night
  total: number; // JPY
  distanceKm: number;
  durationMinutes: number;
}

export interface ItineraryAccommodation {
  name: string;
  type: "hotel" | "ryokan" | "guesthouse" | "camping";
  hasMotorcycleParking: boolean;
  parkingNote: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  ridingTimeMinutes: number;
  keyStops: string[];
  accommodation: ItineraryAccommodation;
  pois: string[];
  seasonalWarning: string | null;
  schedule?: { time: string; activity: string }[];
}
