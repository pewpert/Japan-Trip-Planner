interface BrandMarkProps {
  className?: string;
}

/**
 * Tōge mark: a switchback climbing to a summit — the mountain pass (峠)
 * that the product is named for.
 */
export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 26h13a4.5 4.5 0 0 0 0-9H13a4.5 4.5 0 0 1 0-9h10" />
      <circle cx="26" cy="8" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
