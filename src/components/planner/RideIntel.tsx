"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, Info, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";
import { useRidePlan } from "@/hooks/useRidePlan";
import { Disclosure } from "@/components/ui/Disclosure";
import type { AdvisorySeverity } from "@/types/ride";

const SEVERITY: Record<AdvisorySeverity, { icon: LucideIcon; color: string; bg: string }> = {
  alert: { icon: OctagonAlert, color: "text-stop", bg: "bg-stop-soft" },
  caution: { icon: TriangleAlert, color: "text-warn", bg: "bg-warn-soft" },
  info: { icon: Info, color: "text-accent", bg: "bg-accent-soft" },
};

const INFO_NOTES_SHOWN = 2;

export function RideIntel() {
  const plan = useRidePlan();
  const [expanded, setExpanded] = useState(false);
  if (!plan || plan.advisories.length === 0) return null;

  const { advisories } = plan;
  const warnings = advisories.filter((a) => a.severity !== "info").length;

  // Alerts and cautions always show; routine info notes collapse after the first couple.
  let infoSeen = 0;
  const visible = expanded
    ? advisories
    : advisories.filter((a) => a.severity !== "info" || ++infoSeen <= INFO_NOTES_SHOWN);
  const hidden = advisories.length - visible.length;

  return (
    <Disclosure
      title="Ride intel"
      summary={warnings > 0 ? `${warnings} to watch · ${advisories.length} notes` : `${advisories.length} notes`}
      defaultOpen
    >
      <ul className="flex flex-col gap-4">
        {visible.map((a) => {
          const { icon: Icon, color, bg } = SEVERITY[a.severity];
          return (
            <li key={a.id} className="flex gap-3">
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{a.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{a.body}</p>
                {a.href && (
                  <a
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
                  >
                    {a.hrefLabel ?? "Learn more"} <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {hidden > 0 || expanded ? (
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
        >
          {expanded ? "Show fewer" : `Show ${hidden} more`}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
        </button>
      ) : null}
    </Disclosure>
  );
}
