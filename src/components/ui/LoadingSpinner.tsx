interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-7 w-7 border-2",
    lg: "h-10 w-10 border-[3px]",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2.5" role="status">
      <div
        className={`${sizes[size]} rounded-full border-line-strong border-t-accent animate-spin`}
      />
      {label && <p className="text-sm text-ink-3">{label}</p>}
    </div>
  );
}
