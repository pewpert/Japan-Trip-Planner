export type AdvisorySeverity = "info" | "caution" | "alert";

/** A contextual heads-up shown in the Ride Intel list. */
export interface Advisory {
  id: string;
  severity: AdvisorySeverity;
  title: string;
  body: string;
  href?: string;
  hrefLabel?: string;
}

export type VerdictLevel = "go" | "caution" | "stop";

/** The one-glance answer to "should I ride this route on that day?" */
export interface Verdict {
  level: VerdictLevel;
  headline: string;
  reasons: string[];
}

export interface FuelStop {
  id: string;
  distanceKm: number;
  coordinates: { lat: number; lng: number };
}

export interface FuelPlan {
  /** Full-tank range in km (tank × efficiency). */
  rangeKm: number;
  /** Distance between planned fuel stops, keeping a safety reserve. */
  legKm: number;
  stops: FuelStop[];
}

export interface RideTimeline {
  departureMinutes: number; // minutes after midnight, JST
  movingMinutes: number;
  stopMinutes: number;
  totalMinutes: number;
  breakCount: number;
  lunchIncluded: boolean;
  arrivalMinutes: number; // minutes after midnight (can exceed 1440)
  sunsetMinutes: number | null;
  /** Positive = arrives this many minutes before sunset; negative = after dark. */
  daylightBufferMinutes: number | null;
}

/** A calendar day in Japan Standard Time. */
export interface JstDay {
  offset: number; // days from today
  year: number;
  month: number; // 1–12
  day: number;
  weekday: number; // 0 = Sunday
  iso: string; // YYYY-MM-DD
}
