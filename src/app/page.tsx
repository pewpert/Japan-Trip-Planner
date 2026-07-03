import { PlannerSidebar } from "@/components/planner/PlannerSidebar";
import { MapPanel } from "@/components/map/MapPanel";

export default function HomePage() {
  return (
    <main className="flex h-screen w-screen overflow-hidden relative">
      <PlannerSidebar />
      <MapPanel />
    </main>
  );
}
