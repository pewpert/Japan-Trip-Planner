"use client";

import { useState, useRef } from "react";
import { MapPin, Navigation, Plus, X, Route, GripVertical } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { PlaceAutocompleteInput } from "@/components/ui/PlaceAutocompleteInput";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { planRoute } from "@/lib/routeApi";
import { DayView } from "./DayView";

export function RouteInputs() {
  const {
    itinerary,
    isDayViewActive,
    setDayViewActive,
    origin, destination, waypoints,
    setOrigin, setDestination, addWaypoint, removeWaypoint,
    setOriginCoords, setDestinationCoords, setWaypointCoords,
    setRoute, setCostBreakdown, setSuggestedBreaks, setLoadingRoute, clearRoute,
    reorderWaypoints,
    isLoadingRoute,
    route,
    settings,
  } = useTripStore();

  const [newWaypoint, setNewWaypoint] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Once a route exists the form collapses so the briefing stays in view
  const [editing, setEditing] = useState(false);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handlePlanRoute = async () => {
    if (!origin.trim() || !destination.trim()) {
      setError("Enter both a start and a destination to plan the route.");
      return;
    }
    setError(null);

    await planRoute({
      origin,
      destination,
      waypoints,
      settings,
      onStart: () => setLoadingRoute(true),
      onSuccess: (planned, cost, breaks) => {
        setRoute(planned);
        setCostBreakdown(cost);
        setSuggestedBreaks(breaks);
        setEditing(false);
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
    setEditing(false);
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

  if (itinerary && isDayViewActive) {
    return (
      <Card>
        <DayView />
      </Card>
    );
  }

  if (route && !editing) {
    return (
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="eyebrow text-ink-3">
          {itinerary ? (
            <button
              onClick={() => setDayViewActive(true)}
              className="font-semibold text-accent hover:underline"
            >
              Back to {itinerary.length}-day itinerary
            </button>
          ) : (
            "Route planned"
          )}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Edit route
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <SectionHeading
        action={
          route ? (
            <button
              onClick={() => setEditing(false)}
              className="shrink-0 text-[13px] font-medium text-accent hover:underline"
            >
              Cancel
            </button>
          ) : undefined
        }
      >
        Route
      </SectionHeading>

      <PlaceAutocompleteInput
        label="Start"
        placeholder="e.g. Ikebukuro, Tokyo"
        value={origin}
        onChange={setOrigin}
        onPlaceSelect={(name, coords) => {
          setOrigin(name);
          setOriginCoords(coords);
        }}
        leftIcon={<Navigation className="h-4 w-4" />}
      />

      {/* Waypoints — draggable */}
      {waypoints.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="eyebrow text-ink-3">Stops</span>
          {waypoints.map((wp, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-1 rounded-xl transition-colors ${
                dragOverIndex === i ? "bg-accent-soft" : ""
              }`}
            >
              <div className="shrink-0 cursor-grab p-1 text-ink-3 active:cursor-grabbing" aria-hidden>
                <GripVertical className="h-4 w-4" />
              </div>
              <PlaceAutocompleteInput
                placeholder={`Stop ${i + 1}`}
                value={wp}
                onChange={() => {}}
                onPlaceSelect={(name, coords) => {
                  setWaypointCoords(i, coords);
                  removeWaypoint(i);
                  addWaypoint(name);
                }}
                leftIcon={<MapPin className="h-4 w-4" />}
                className="flex-1"
              />
              <button
                onClick={() => removeWaypoint(i)}
                className="shrink-0 rounded-lg p-2 text-ink-3 transition-colors hover:bg-surface-2 hover:text-stop"
                aria-label={`Remove stop ${i + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

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
          leftIcon={<Plus className="h-4 w-4" />}
          className="flex-1"
          clearAfterSelect
        />
        {newWaypoint.trim() && (
          <button
            onClick={() => {
              addWaypoint(newWaypoint.trim());
              setNewWaypoint("");
            }}
            className="whitespace-nowrap px-1 text-[13px] font-medium text-accent hover:underline"
          >
            Add
          </button>
        )}
      </div>

      <PlaceAutocompleteInput
        label="Destination"
        placeholder="e.g. Nikko, Tochigi"
        value={destination}
        onChange={setDestination}
        onPlaceSelect={(name, coords) => {
          setDestination(name);
          setDestinationCoords(coords);
        }}
        leftIcon={<MapPin className="h-4 w-4" />}
      />

      {error && (
        <p role="alert" className="rounded-xl bg-stop-soft px-3.5 py-2.5 text-[13px] text-stop">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button onClick={handlePlanRoute} className="flex-1" loading={isLoadingRoute}>
          <Route className="h-4 w-4" aria-hidden />
          Plan route
        </Button>
        <Button variant="secondary" onClick={handleClear} aria-label="Clear route">
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </Card>
  );
}
