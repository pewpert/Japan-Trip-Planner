"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface DisclosureProps {
  title: string;
  /** Shown on the header line even when collapsed — the summary before the detail. */
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** A card whose body expands on demand; the header always carries the gist. */
export function Disclosure({ title, summary, defaultOpen = false, children }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left"
      >
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {summary && (
          <span className="num ml-auto min-w-0 truncate text-[13px] text-ink-3">{summary}</span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 ${
            summary ? "" : "ml-auto"
          } ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && <div className="border-t border-line px-5 py-4">{children}</div>}
    </section>
  );
}
