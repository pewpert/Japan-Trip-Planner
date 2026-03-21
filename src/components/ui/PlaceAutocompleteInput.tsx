"use client";

import { useRef } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

const LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

interface PlaceAutocompleteInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (name: string, coords: { lat: number; lng: number }) => void;
  leftIcon?: React.ReactNode;
  className?: string;
  /** After a place is selected via autocomplete, clear the input value */
  clearAfterSelect?: boolean;
}

export function PlaceAutocompleteInput({
  label,
  placeholder,
  value,
  onChange,
  onPlaceSelect,
  leftIcon,
  className = "",
  clearAfterSelect = false,
}: PlaceAutocompleteInputProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: LIBRARIES,
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  // Track whether a place was already handled via onPlaceChanged to prevent
  // the Enter key from triggering a second add through the parent's keydown handler.
  const placeJustSelected = useRef(false);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place) return;

    const name = place.formatted_address ?? place.name ?? "";
    const location = place.geometry?.location;

    if (location) {
      placeJustSelected.current = true;
      onPlaceSelect(name, { lat: location.lat(), lng: location.lng() });
      if (clearAfterSelect) {
        onChange("");
      } else {
        onChange(name);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // If autocomplete dropdown just fired onPlaceChanged, suppress
      // any parent Enter handler so the item isn't added a second time.
      if (placeJustSelected.current) {
        placeJustSelected.current = false;
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  const inputClass = `
    w-full rounded-lg border border-gray-200 dark:border-gray-600
    bg-white dark:bg-gray-800
    py-2.5 text-sm
    text-gray-900 dark:text-white
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
    ${leftIcon ? "pl-9 pr-3" : "px-3"}
  `;

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      {isLoaded ? (
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: "jp" },
            fields: ["formatted_address", "geometry", "name"],
          }}
        >
          <div className="relative">
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                {leftIcon}
              </div>
            )}
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={inputClass}
            />
          </div>
        </Autocomplete>
      ) : (
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        </div>
      )}
    </div>
  );
}
