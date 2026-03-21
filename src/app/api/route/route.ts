import { NextRequest, NextResponse } from "next/server";
import type { RouteResult } from "@/types/route";

export async function POST(req: NextRequest) {
  try {
    const { origin, destination, waypoints = [] } = await req.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin and destination are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Build waypoints string for Directions API
    const waypointsParam =
      waypoints.length > 0
        ? `&waypoints=${waypoints.map((w: string) => encodeURIComponent(w)).join("|")}`
        : "";

    const url =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${encodeURIComponent(origin)}` +
      `&destination=${encodeURIComponent(destination)}` +
      `${waypointsParam}` +
      `&region=jp` +
      `&language=en` +
      `&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        { error: `Google Maps error: ${data.status}` },
        { status: 400 }
      );
    }

    const googleRoute = data.routes[0];
    // The Directions REST API returns plain JSON objects (not class instances)
    type GStep = { html_instructions: string; distance: { value: number }; duration: { value: number }; end_location: { lat: number; lng: number } };
    type GLeg = { steps: GStep[]; distance: { value: number }; duration: { value: number } };

    const legs: GLeg[] = googleRoute.legs;

    // Flatten all steps across all legs
    const steps = legs.flatMap((leg) =>
      leg.steps.map((step) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ""), // strip HTML tags
        distanceKm: (step.distance?.value ?? 0) / 1000,
        durationMinutes: Math.round((step.duration?.value ?? 0) / 60),
        coordinates: {
          lat: step.end_location.lat,
          lng: step.end_location.lng,
        },
      }))
    );

    // Total distance and duration
    const distanceKm = legs.reduce(
      (acc, leg) => acc + (leg.distance?.value ?? 0) / 1000,
      0
    );
    const durationMinutes = Math.round(
      legs.reduce((acc, leg) => acc + (leg.duration?.value ?? 0), 0) / 60
    );

    // Decode overview polyline
    const polylinePath = decodePolyline(googleRoute.overview_polyline.points);

    // Bounds
    const bounds = googleRoute.bounds;

    const result: RouteResult = {
      polylinePath,
      distanceKm: Math.round(distanceKm * 10) / 10,
      durationMinutes,
      steps,
      bounds: {
        north: bounds.northeast.lat,
        south: bounds.southwest.lat,
        east: bounds.northeast.lng,
        west: bounds.southwest.lng,
      },
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/route]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Decodes a Google Maps encoded polyline string into lat/lng pairs.
 * https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}
