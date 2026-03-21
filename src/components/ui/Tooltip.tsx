import { ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  text: string;
  position?: "top" | "bottom";
  wide?: boolean;
}

export function Tooltip({ children, text, position = "top", wide = false }: TooltipProps) {
  const isTop = position === "top";

  return (
    <div className="relative group inline-flex">
      {children}
      <span
        className={`
          absolute ${isTop ? "bottom-full mb-2" : "top-full mt-2"}
          left-1/2 -translate-x-1/2
          px-2.5 py-1.5 text-xs text-white bg-gray-800 dark:bg-gray-700
          rounded-lg shadow-lg
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
          pointer-events-none z-50
          ${wide ? "w-64 whitespace-normal text-center" : "whitespace-nowrap"}
        `}
      >
        {text}
        {/* Arrow */}
        <span
          className={`
            absolute left-1/2 -translate-x-1/2
            border-4 border-transparent
            ${isTop
              ? "top-full border-t-gray-800 dark:border-t-gray-700"
              : "bottom-full border-b-gray-800 dark:border-b-gray-700"
            }
          `}
        />
      </span>
    </div>
  );
}
