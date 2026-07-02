"use client";

/**
 * /print — Dedicated print/export page
 *
 * Opens in a new tab. Reads trip data from sessionStorage key "japan-bike-print-data".
 * This sidesteps the overflow-hidden/scroll-clip issue that truncates multi-day itineraries
 * when printing directly from the sidebar.
 */

import { useEffect, useState } from "react";
import { PrintLayout } from "@/components/print/PrintLayout";
import type { PrintData } from "@/components/print/PrintLayout";

export default function PrintPage() {
  const [data, setData] = useState<PrintData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("japan-bike-print-data");
      if (!raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from sessionStorage (external system, unavailable during SSR)
        setError(true);
        return;
      }
      const parsed = JSON.parse(raw) as PrintData;
      setData(parsed);

      // Auto-trigger print dialog after a short delay for fonts/images to load
      const timer = setTimeout(() => window.print(), 800);
      return () => clearTimeout(timer);
    } catch {
      setError(true);
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center p-8">
        <div>
          <p className="text-2xl mb-2">🏍️</p>
          <p className="font-semibold text-gray-700">No trip data found.</p>
          <p className="text-sm text-gray-500 mt-1">
            Open this page from the Summary tab in the planner.
          </p>
          <button
            onClick={() => window.close()}
            className="mt-4 text-sm text-red-600 hover:underline"
          >
            Close tab
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-400 animate-pulse">Preparing your trip document…</p>
      </div>
    );
  }

  return <PrintLayout data={data} />;
}
