"use client";

import { useState, useRef } from "react";
import { MapPin, Navigation, Plus, X, Search, GripVertical } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { PlaceAutocompleteInput } from "@/components/ui/PlaceAutocompleteInput";
import { Button } from "@/components/ui/Button";
import { planRoute } from "@/lib/routeApi";

export function RouteInputs() {
  const {
    origin, destination, waypoints,
    setOrigin, setDestination, addWaypoint, removeWaypoint,
    setOriginCoords, setDestinationCoords, setWaypointCoords,
    setRoute, setCostBreakdown, setSuggestedBreaks, setLoadingRoute, clearRoute,
    reorderWaypoints,
    settings,
  } = useTripStore();

  const [newWaypoint, setNewWaypoint] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handlePlanRoute = async () => {
    if (!origin.trim() || !destination.trim()) {
      setError("Please enter both a start and destination.");
      return;
    }
    setError(null);

    await planRoute({
      origin,
      destination,
      waypoints,
      settings,
      onStart: () => setLoadingRoute(true),
      onSuccess: (route, cost, breaks) => {
        setRoute(route);
        setCostBreakdown(cost);
        setSuggestedBreaks(breaks);
      },
      onError: (msg) => setError(msg),
      onFinally: () => setLoadingRoute(false),
    });
  };

  const handleClear = () => {
    setOrigin("");
    setDestination("");
    clearRoute();
    setError(null);
  };

  // Drag handlers
  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === dropIndex) {
      dragIndex.current = null;
      setDragOverIndex(null);
      return;
    }
    const newOrder = [...waypoints];
    const [moved] = newOrder.splice(dragIndex.current, 1);
    newOrder.splice(dropIndex, 0, moved);
    reorderWaypoints(newOrder);
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Route</h2>

      <PlaceAutocompleteInput
        label="Start"
        placeholder="e.g. Matsumoto, Nagano"
        value={origin}
        onChange={setOrigin}
        onPlaceSelect={(name, coords) => {
          setOrigin(name);
          setOriginCoords(coords);
        }}
        leftIcon={<Navigation className="w-4 h-4" />}
      />

      {/* Waypoints — draggable */}
      {waypoints.map((wp, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={(e) => handleDrop(e, i)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-2 rounded-lg transition-colors ${
            dragOverIndex === i ? "bg-red-50 dark:bg-red-900/20" : ""
          }`}
        >
          {/* Drag handle */}
          <div className="text-gray-300 dark:text-gray-600 cursor-grab active:cursor-grabbing shrink-0 p-1">
            <GripVertical className="w-4 h-4" />
          </div>
          <PlaceAutocompleteInput
            placeholder={`Waypoint ${i + 1}`}
            value={wp}
            onChange={() => {}}
            onPlaceSelect={(name, coords) => {
              setWaypointCoords(i, coords);
              removeWaypoint(i);
              addWaypoint(name);
            }}
            leftIcon={<MapPin className="w-4 h-4" />}
            className="flex-1"
          />
          <button
            onClick={() => removeWaypoint(i)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
            aria-label="Remove waypoint"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Add waypoint — clears after selection, no double-add */}
      <div className="flex items-center gap-2">
        <PlaceAutocompleteInput
          placeholder="Add a stop (optional)"
          value={newWaypoint}
          onChange={setNewWaypoint}
          onPlaceSelect={(name) => {
            addWaypoint(name);
            setNewWaypoint("");
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="flex-1"
          clearAfterSelect
        />
        {newWaypoint.trim() && (
          <button
            onClick={() => {
              addWaypoint(newWaypoint.trim());
              setNewWaypoint("");
            }}
            className="text-red-600 hover:text-red-700 text-xs font-medium whitespace-nowrap"
          >
            Add
          </button>
        )}
      </div>

      <PlaceAutocompleteInput
        label="Destination"
        placeholder="e.g. Kanazawa, Ishikawa"
        value={destination}
        onChange={setDestination}
        onPlaceSelect={(name, coords) => {
          setDestination(name);
          setDestinationCoords(coords);
        }}
        leftIcon={<MapPin className="w-4 h-4" />}
      />

      {error && (
        <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-2">
        <Button onClick={handlePlanRoute} className="flex-1" size="md">
          <Search className="w-4 h-4" />
          Plan Route
        </Button>
        <Button variant="secondary" onClick={handleClear} size="md">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
