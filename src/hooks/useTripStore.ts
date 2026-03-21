"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TripSettings, CostBreakdown, SavedItinerary } from "@/types/trip";
import type { RouteResult, POI, SuggestedBreak } from "@/types/route";
import type { WeatherPoint } from "@/types/weather";

interface TripStore {
  // Route inputs
  origin: string;
  destination: string;
  waypoints: string[];

  // Coordinates from Places autocomplete (session only, not persisted)
  originCoords: { lat: number; lng: number } | null;
  destinationCoords: { lat: number; lng: number } | null;
  waypointCoords: Array<{ lat: number; lng: number } | null>;

  // Computed data
  route: RouteResult | null;
  pois: POI[];
  weather: WeatherPoint[];
  costBreakdown: CostBreakdown | null;

  // UI state
  isLoadingRoute: boolean;
  isLoadingWeather: boolean;
  isSidebarOpen: boolean;
  isDarkMode: boolean;

  // Suggested breaks (computed from route, session-only)
  suggestedBreaks: SuggestedBreak[];
  setSuggestedBreaks: (breaks: SuggestedBreak[]) => void;

  // Trip settings
  settings: TripSettings;

  // Saved itineraries
  savedItineraries: SavedItinerary[];

  // Actions
  setOrigin: (origin: string) => void;
  setDestination: (destination: string) => void;
  addWaypoint: (waypoint: string) => void;
  removeWaypoint: (index: number) => void;
  reorderWaypoints: (newOrder: string[]) => void;
  setRoute: (route: RouteResult | null) => void;
  setPOIs: (pois: POI[]) => void;
  setWeather: (weather: WeatherPoint[]) => void;
  setCostBreakdown: (cost: CostBreakdown | null) => void;
  setLoadingRoute: (loading: boolean) => void;
  setLoadingWeather: (loading: boolean) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  updateSettings: (settings: Partial<TripSettings>) => void;
  setOriginCoords: (coords: { lat: number; lng: number } | null) => void;
  setDestinationCoords: (coords: { lat: number; lng: number } | null) => void;
  setWaypointCoords: (index: number, coords: { lat: number; lng: number } | null) => void;
  saveItinerary: (name: string, notes: string) => void;
  deleteItinerary: (id: string) => void;
  clearRoute: () => void;
}

const defaultSettings: TripSettings = {
  mode: "motorcycle",
  fuelEfficiency: 22, // km/L — conservative estimate for mid-size bike
  fuelPricePerLiter: 175, // JPY — approximate Japan average
  bikeEngineCC: 400,
  budget: "mid",
};

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      origin: "",
      destination: "",
      waypoints: [],
      originCoords: null,
      destinationCoords: null,
      waypointCoords: [],
      route: null,
      pois: [],
      weather: [],
      costBreakdown: null,
      isLoadingRoute: false,
      isLoadingWeather: false,
      isSidebarOpen: true,
      isDarkMode: false,
      suggestedBreaks: [],
      settings: defaultSettings,
      savedItineraries: [],

      setOrigin: (origin) => set({ origin }),
      setDestination: (destination) => set({ destination }),
      addWaypoint: (waypoint) =>
        set((state) => ({
          waypoints: [...state.waypoints, waypoint],
          waypointCoords: [...state.waypointCoords, null],
        })),
      removeWaypoint: (index) =>
        set((state) => ({
          waypoints: state.waypoints.filter((_, i) => i !== index),
          waypointCoords: state.waypointCoords.filter((_, i) => i !== index),
        })),
      reorderWaypoints: (newOrder) =>
        set({ waypoints: newOrder, waypointCoords: newOrder.map(() => null) }),
      setRoute: (route) => set({ route }),
      setPOIs: (pois) => set({ pois }),
      setWeather: (weather) => set({ weather }),
      setCostBreakdown: (costBreakdown) => set({ costBreakdown }),
      setLoadingRoute: (isLoadingRoute) => set({ isLoadingRoute }),
      setLoadingWeather: (isLoadingWeather) => set({ isLoadingWeather }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSuggestedBreaks: (suggestedBreaks) => set({ suggestedBreaks }),

      toggleDarkMode: () =>
        set((state) => {
          const next = !state.isDarkMode;
          try {
            localStorage.setItem("japan-trip-dark-mode", String(next));
          } catch {}
          if (next) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { isDarkMode: next };
        }),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      saveItinerary: (name, notes) => {
        const state = get();
        if (!state.route || !state.costBreakdown) return;
        const itinerary: SavedItinerary = {
          id: crypto.randomUUID(),
          name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          origin: state.origin,
          destination: state.destination,
          waypoints: state.waypoints,
          settings: state.settings,
          estimatedCost: state.costBreakdown,
          notes,
        };
        set((s) => ({
          savedItineraries: [...s.savedItineraries, itinerary],
        }));
      },

      deleteItinerary: (id) =>
        set((state) => ({
          savedItineraries: state.savedItineraries.filter((i) => i.id !== id),
        })),

      setOriginCoords: (originCoords) => set({ originCoords }),
      setDestinationCoords: (destinationCoords) => set({ destinationCoords }),
      setWaypointCoords: (index, coords) =>
        set((state) => {
          const updated = [...state.waypointCoords];
          updated[index] = coords;
          return { waypointCoords: updated };
        }),

      clearRoute: () =>
        set({
          route: null,
          pois: [],
          weather: [],
          costBreakdown: null,
          originCoords: null,
          destinationCoords: null,
          waypointCoords: [],
          suggestedBreaks: [],
        }),
    }),
    {
      name: "japan-trip-planner-store",
      partialize: (state) => ({
        settings: state.settings,
        savedItineraries: state.savedItineraries,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
