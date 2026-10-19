"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Sun, Moon, Map as MapIcon, ClipboardList } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { useWeather } from "@/hooks/useWeather";
import { BRAND } from "@/lib/brand";
import { BrandMark } from "@/components/ui/BrandMark";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SeedRouteList } from "@/components/map/SeedRouteCards";
import { RouteInputs } from "./RouteInputs";
import { RideBriefing } from "./RideBriefing";
import { WeatherStrip } from "./WeatherStrip";
import { RideIntel } from "./RideIntel";
import { FuelPlan } from "./FuelPlan";
import { CostEstimator } from "./CostEstimator";
import { StopsPanel } from "./StopsPanel";
import { TripSettings } from "./TripSettings";
import { PreRideCheck } from "./PreRideCheck";
import { ItineraryPlanner } from "./ItineraryPlanner";
import { SummaryTab } from "./SummaryTab";

type Tab = "route" | "itinerary" | "summary";

const TABS: { id: Tab; label: string }[] = [
  { id: "route", label: "Plan" },
  { id: "itinerary", label: "Itinerary" },
  { id: "summary", label: "Summary" },
];

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative flex-1 pb-3 text-sm font-medium transition-colors ${
        active ? "text-ink" : "text-ink-3 hover:text-ink-2"
      }`}
    >
      {label}
      <span
        aria-hidden
        className={`absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-accent transition-opacity duration-200 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
    </button>
  );
}

export function PlannerSidebar() {
  const { isSidebarOpen, toggleSidebar, route, itinerary, isDarkMode, toggleDarkMode } = useTripStore();
  const [activeTab, setActiveTab] = useState<Tab>("route");

  // Keep weather in sync with the current route (fetches once per route change)
  useWeather();

  const openSidebar = () => {
    if (!isSidebarOpen) toggleSidebar();
  };
  const closeSidebar = () => {
    if (isSidebarOpen) toggleSidebar();
  };

  return (
    <>
      {/* Sidebar panel */}
      <div
        className={`relative flex flex-col overflow-hidden border-r border-line bg-canvas transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-full min-w-0 md:w-[420px] md:min-w-[420px]" : "w-0 md:w-0"
        }`}
      >
        {/* shrink-0 on children: in a scrolling flex column, overflow-hidden cards would otherwise collapse */}
        <div className="flex h-full flex-col gap-5 overflow-y-auto p-5 pb-24 md:pb-6 [&>*]:shrink-0">
          {/* Header */}
          <header className="flex items-center gap-3">
            <BrandMark className="h-9 w-9 shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold leading-none tracking-tight text-ink">
                {BRAND.name} <span className="font-normal text-ink-3">{BRAND.kanji}</span>
              </h1>
              <p className="mt-1 text-xs text-ink-3">{BRAND.descriptor}</p>
            </div>
            {/* Mobile: jump to the map */}
            <button
              onClick={closeSidebar}
              className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-2 text-[13px] font-medium text-accent transition-colors hover:bg-surface-2 md:hidden"
            >
              Map
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </button>
            <button
              onClick={toggleDarkMode}
              className="shrink-0 rounded-lg p-2 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
          </header>

          {/* Tab bar */}
          <div role="tablist" className="-mx-5 flex border-b border-line px-5">
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {/* Plan tab */}
          {activeTab === "route" && (
            <>
              {!route && !itinerary && (
                <p className="text-[13px] leading-relaxed text-ink-3">
                  Plan a route below, or build a multi-day trip in{" "}
                  <button
                    onClick={() => setActiveTab("itinerary")}
                    className="font-medium text-accent hover:underline"
                  >
                    Itinerary
                  </button>
                  , review it in Summary, then print it.
                </p>
              )}

              <RouteInputs />

              {route && (
                <>
                  <RideBriefing />
                  <WeatherStrip />
                  <RideIntel />
                  <FuelPlan />
                  <CostEstimator />
                  <StopsPanel />
                </>
              )}

              {/* Phones can't see the map's classic rides until they switch views, so offer them here */}
              {!route && (
                <Card className="flex flex-col gap-1 md:hidden">
                  <SectionHeading>Classic rides · 定番ルート</SectionHeading>
                  <SeedRouteList />
                </Card>
              )}

              <TripSettings />

              {!route && <PreRideCheck />}
            </>
          )}

          {activeTab === "itinerary" && (
            <ItineraryPlanner onSwitchToRoute={() => setActiveTab("route")} />
          )}

          {activeTab === "summary" && <SummaryTab />}
        </div>
      </div>

      {/* Desktop sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className={`absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-r-lg border border-l-0 border-line bg-surface p-1.5 text-ink-2 shadow-sm transition-[left,colors] duration-300 hover:bg-surface-2 md:flex ${
          isSidebarOpen ? "md:left-[420px]" : "md:left-0"
        }`}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Mobile: Planner / Map segmented control */}
      <div
        role="tablist"
        aria-label="Switch between planner and map"
        className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 overflow-hidden rounded-full border border-line bg-surface/90 shadow-float backdrop-blur-xl md:hidden"
      >
        <button
          role="tab"
          aria-selected={isSidebarOpen}
          onClick={openSidebar}
          className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium transition-colors ${
            isSidebarOpen ? "bg-accent text-on-accent" : "text-ink-2 hover:bg-surface-2"
          }`}
        >
          <ClipboardList className="h-4 w-4" aria-hidden />
          Planner
        </button>
        <button
          role="tab"
          aria-selected={!isSidebarOpen}
          onClick={closeSidebar}
          className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium transition-colors ${
            !isSidebarOpen ? "bg-accent text-on-accent" : "text-ink-2 hover:bg-surface-2"
          }`}
        >
          <MapIcon className="h-4 w-4" aria-hidden />
          Map
        </button>
      </div>
    </>
  );
}
