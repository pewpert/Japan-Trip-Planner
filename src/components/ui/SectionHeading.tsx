import type { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  /** Optional right-aligned control (button, link) on the heading row */
  action?: ReactNode;
}

/**
 * Shared section label with a hairline rule.
 * Tōge Ink type rules: the serif display face is reserved for real headings
 * (15px+); small uppercase labels like this stay in the sans face with only
 * a touch of tracking so they remain readable.
 */
export function SectionHeading({ children, action }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 shrink-0">
        {children}
      </h2>
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" aria-hidden />
      {action}
    </div>
  );
}
