import type { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  /** Optional right-aligned control (button, link) on the heading row */
  action?: ReactNode;
}

/** Section title: a small caps label with a hairline rule. */
export function SectionHeading({ children, action }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="eyebrow text-ink-2 shrink-0">{children}</h2>
      <div className="h-px flex-1 bg-line" aria-hidden />
      {action}
    </div>
  );
}
