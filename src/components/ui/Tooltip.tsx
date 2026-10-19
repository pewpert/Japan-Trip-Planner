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
        role="tooltip"
        className={`
          absolute ${isTop ? "bottom-full mb-2" : "top-full mt-2"}
          left-1/2 -translate-x-1/2
          px-3 py-2 text-xs leading-relaxed text-canvas bg-ink
          rounded-[10px] shadow-float
          opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
          transition-opacity duration-150
          pointer-events-none z-50
          ${wide ? "w-64 whitespace-normal text-left" : "whitespace-nowrap"}
        `}
      >
        {text}
      </span>
    </div>
  );
}
