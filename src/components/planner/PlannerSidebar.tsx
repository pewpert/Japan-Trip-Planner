"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Bike, Sun, Moon, Map as MapIcon, ClipboardList } from "lucide-react";
import { useTripStore } from "@/hooks/useTripStore";
import { useWeather } from "@/hooks/useWeather";
import { RouteInputs } from "./RouteInputs";
import { WeatherStrip } from "./WeatherStrip";
import { CostEstimator } from "./CostEstimator";
import { TripSettings } from "./TripSettings";
import { ItineraryPlanner } from "./ItineraryPlanner";
import { RouteOverviewPanel } from "./RouteOverviewPanel";
import { SummaryTab } from "./SummaryTab";
import { Card } from "@/components/ui/Card";

type Tab = "route" | "itinerary" | "summary";

const TABS: { id: Tab; label: string }[] = [
  { id: "route", label: "Route Planner" },
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
      onClick={onClick}
      className={`flex-1 pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
        ${active
          ? "border-red-600 text-red-600"
          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
    >
      {label}
    </button>
  );
}

export function PlannerSidebar() {
  const { isSidebarOpen, toggleSidebar, route, isDarkMode, toggleDarkMode } = useTripStore();
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
        className={`
          relative flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out overflow-hidden
          ${isSidebarOpen ? "w-full md:w-96 min-w-0 md:min-w-96" : "w-0 md:w-0"}
        `}
      >
        <div className="flex flex-col gap-4 p-4 pb-20 md:pb-4 overflow-y-auto h-full">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-600 rounded-lg shrink-0">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-gray-900 dark:text-white">Japan バイク Trip Planner</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Discover rural Japan by motorcycle</p>
            </div>
            {/* Mobile: jump to the map */}
            <button
              onClick={closeSidebar}
              className="md:hidden flex items-center gap-0.5 text-xs font-medium text-red-600 shrink-0 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              View map
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 -mx-4 px-4">
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {/* Onboarding nudge */}
          <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">
            New here? Generate a trip in <span className="font-medium text-gray-500 dark:text-gray-400">Itinerary</span>, review it in <span className="font-medium text-gray-500 dark:text-gray-400">Summary</span>, then export or print.
          </p>

          {/* Route tab content */}
          {activeTab === "route" && (
            <>
              <Card padding="md">
                <RouteInputs />
              </Card>

              {route && (
                <>
                  <Card padding="md">
                    <RouteOverviewPanel />
                  </Card>
                  <WeatherStrip />
                  <Card padding="md">
                    <CostEstimator />
                  </Card>
                </>
              )}

              <Card padding="md">
                <TripSettings />
              </Card>

              <Card padding="sm">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Quick Tips</p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                    <li>Look for 道の駅 (Michi-no-Eki) for free rest stops</li>
                    <li>Mountain passes may close Nov–Apr due to snow</li>
                    <li>You need an IDP to ride as a foreign visitor</li>
                    <li>Helmets are mandatory by law</li>
                  </ul>
                </div>
              </Card>
            </>
          )}

          {/* Itinerary tab content */}
          {activeTab === "itinerary" && (
            <ItineraryPlanner onSwitchToRoute={() => setActiveTab("route")} />
          )}

          {/* Summary tab content */}
          {activeTab === "summary" && (
            <SummaryTab />
          )}
        </div>
      </div>

      {/* Desktop sidebar toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-r-lg p-1.5 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors hidden md:flex"
        style={{ left: isSidebarOpen ? "384px" : "0px" }}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile: Planner / Map segmented control */}
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-lg overflow-hidden">
        <button
          onClick={openSidebar}
          aria-pressed={isSidebarOpen}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors
            ${isSidebarOpen
              ? "bg-red-600 text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
        >
          <ClipboardList className="w-4 h-4" />
          Planner
        </button>
        <button
          onClick={closeSidebar}
          aria-pressed={!isSidebarOpen}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors
            ${!isSidebarOpen
              ? "bg-red-600 text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
        >
          <MapIcon className="w-4 h-4" />
          Map
        </button>
      </div>
    </>
  );
}
