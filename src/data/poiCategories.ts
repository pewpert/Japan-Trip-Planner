import { BedDouble, Coffee, Milestone, Mountain, Store, Wrench, type LucideIcon } from "lucide-react";
import type { BikerPOI } from "@/types/route";

export interface PoiCategory {
  type: BikerPOI["type"];
  label: string;
  /** Marker color — mid-tone so it reads on both the light and dark map. */
  color: string;
  /** The same color as a static Tailwind class (kept literal so Tailwind generates it). */
  swatch: string;
  Icon: LucideIcon;
}

export const POI_CATEGORIES: PoiCategory[] = [
  { type: "biker-cafe", label: "Rider cafés", color: "#E0572F", swatch: "bg-[#E0572F]", Icon: Coffee },
  { type: "famous-road", label: "Famous roads", color: "#C98A0B", swatch: "bg-[#C98A0B]", Icon: Milestone },
  { type: "michi-no-eki", label: "道の駅", color: "#2E9E6B", swatch: "bg-[#2E9E6B]", Icon: Store },
  { type: "bike-rental", label: "Bike shops", color: "#3B7DDD", swatch: "bg-[#3B7DDD]", Icon: Wrench },
  { type: "scenic", label: "Viewpoints", color: "#8B5CF6", swatch: "bg-[#8B5CF6]", Icon: Mountain },
  { type: "accommodation", label: "Rider-friendly stays", color: "#64748B", swatch: "bg-[#64748B]", Icon: BedDouble },
];

export const POI_CATEGORY_BY_TYPE: Record<string, PoiCategory> = Object.fromEntries(
  POI_CATEGORIES.map((c) => [c.type, c])
);
