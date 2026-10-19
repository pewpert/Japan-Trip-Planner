"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

/** Shared field styling — 16px on phones so iOS doesn't zoom on focus. */
export const fieldClass =
  "w-full rounded-[10px] border border-line-strong bg-surface text-base md:text-sm text-ink placeholder:text-ink-3 px-3 py-2.5 transition-colors hover:border-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:bg-surface-2 disabled:cursor-not-allowed";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="eyebrow text-ink-3">{label}</label>}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`${fieldClass} ${leftIcon ? "pl-9" : ""} ${error ? "border-stop" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-stop">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
