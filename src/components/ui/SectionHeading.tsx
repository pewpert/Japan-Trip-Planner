import type { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  /** Optional right-aligned control (button, link) on the heading row */
  action?: ReactNode;
}

/**
 * Shared section label: serif small-caps title with a hairline rule.
 * Part of the Tōge Ink design system — use for every sidebar section.
 */
export function SectionHeading({ children, action }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.16em] text-gray-700 dark:text-gray-200 shrink-0">
        {children}
      </h2>
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" aria-hidden />
      {action}
    </div>
  );
}
