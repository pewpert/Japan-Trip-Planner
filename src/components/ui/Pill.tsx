import type { ReactNode } from "react";

export type PillTone = "neutral" | "accent" | "go" | "warn" | "stop";

interface PillProps {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
}

const TONES: Record<PillTone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  accent: "bg-accent-soft text-accent",
  go: "bg-go-soft text-go",
  warn: "bg-warn-soft text-warn",
  stop: "bg-stop-soft text-stop",
};

/** Small status chip. Tone carries meaning (go / warn / stop), not decoration. */
export function Pill({ tone = "neutral", children, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
