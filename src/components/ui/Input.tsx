"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-lg border border-gray-200 dark:border-gray-600
              bg-white dark:bg-gray-800
              px-3 py-2.5 text-sm
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
              disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
              ${leftIcon ? "pl-9" : ""}
              ${error ? "border-red-400 focus:ring-red-400" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
