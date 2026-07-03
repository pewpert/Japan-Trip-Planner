import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ padding = "md", className = "", children, ...props }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-900/[0.04] dark:shadow-black/20 border border-gray-200/70 dark:border-gray-700/70 ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
