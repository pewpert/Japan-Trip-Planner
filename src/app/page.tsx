import { PlannerSidebar } from "@/components/planner/PlannerSidebar";
import { TripMap } from "@/components/map/TripMap";

export default function HomePage() {
  return (
    <main className="flex h-screen w-screen overflow-hidden relative">
      <PlannerSidebar />
      <TripMap />
    </main>
  );
}
