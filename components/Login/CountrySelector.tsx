"use client";

import type React from "react";

import { useState, useEffect, useRef, useMemo } from "react";

interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  theme: "light" | "dark";
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function CountrySelector({
  value,
  onChange,
  error,
  theme,
  buttonRef,
}: CountrySelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm)
  );

  useEffect(() => {
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => {
        setCountries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch countries:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (open) {
      const initialIndex = filteredCountries.findIndex(
        (country) => country.dialCode === value
      );
      setHighlightedIndex(initialIndex !== -1 ? initialIndex : 0);
      setTimeout(() => searchInputRef.current?.focus(), 0);
    } else {
      setHighlightedIndex(null);
    }
  }, [open, value]);

  const selectedCountry = countries.find(
    (country) => country.dialCode === value
  );

  const activeDescendantId = useMemo(() => {
    if (highlightedIndex !== null && filteredCountries[highlightedIndex]) {
      return `country-option-${filteredCountries[highlightedIndex].code}`;
    }
    return undefined;
  }, [highlightedIndex, filteredCountries]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <button
          type="button"
          ref={buttonRef}
          className={`w-full flex items-center justify-between px-3 py-2 text-base border rounded-md shadow-sm hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary ${
            error
              ? "border-destructive"
              : theme === "dark"
              ? "border-border-dark"
              : "border-border-light"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""} ${
            theme === "dark"
              ? "bg-brand-secondary-dark text-text-primary-dark hover:bg-gray-700"
              : "bg-card-light text-text-primary"
          }`}
          onClick={() => !loading && setOpen(!open)}
          disabled={loading}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="country-listbox"
          aria-activedescendant={activeDescendantId}
          onKeyDown={(e) => {
            if (loading) return;
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              if (!open) {
                setOpen(true);
              }
            } else if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(!open);
            }
          }}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.dialCode}</span>
              <span
                className={`${
                  theme === "dark"
                    ? "text-text-secondary-dark"
                    : "text-text-secondary"
                }`}
              >
                {selectedCountry.name}
              </span>
            </span>
          ) : (
            "Select country..."
          )}
          <svg
            className="ml-2 h-4 w-4 shrink-0 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && (
          <div
            className={`absolute z-50 w-full mt-1 rounded-md shadow-lg ${
              theme === "dark"
                ? "bg-card-dark border border-border-dark"
                : "bg-card-light border border-border-light"
            }`}
            role="listbox"
            id="country-listbox"
            ref={listboxRef}
          >
            <div className="p-2">
              <input
                type="text"
                placeholder="Search country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchInputRef}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                  theme === "dark"
                    ? "bg-brand-secondary-dark border-border-dark text-text-primary-dark"
                    : "bg-card-light border-border-light text-text-primary"
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                    buttonRef?.current?.focus();
                    e.stopPropagation();
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlightedIndex((prev) =>
                      prev === null || prev === filteredCountries.length - 1
                        ? 0
                        : prev + 1
                    );
                    setTimeout(
                      () =>
                        optionRefs.current
                          .get(filteredCountries[highlightedIndex || 0]?.code)
                          ?.focus(),
                      0
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightedIndex((prev) =>
                      prev === null || prev === 0
                        ? filteredCountries.length - 1
                        : prev - 1
                    );
                    setTimeout(
                      () =>
                        optionRefs.current
                          .get(filteredCountries[highlightedIndex || 0]?.code)
                          ?.focus(),
                      0
                    );
                  }
                }}
              />
            </div>
            <div className="max-h-60 overflow-auto">
              {filteredCountries.length === 0 ? (
                <div
                  className={`px-3 py-2 text-sm ${
                    theme === "dark"
                      ? "text-text-secondary-dark"
                      : "text-text-secondary"
                  }`}
                >
                  No country found.
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    id={`country-option-${country.code}`}
                    type="button"
                    role="option"
                    aria-selected={value === country.dialCode}
                    ref={(el) => {
                      if (el) optionRefs.current.set(country.code, el);
                      else optionRefs.current.delete(country.code);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm ${
                      theme === "dark"
                        ? "hover:bg-brand-secondary-dark text-text-primary-dark"
                        : "hover:bg-brand-secondary text-text-primary"
                    } ${
                      highlightedIndex !== null &&
                      filteredCountries[highlightedIndex]?.code === country.code
                        ? theme === "dark"
                          ? "bg-brand-secondary-dark"
                          : "bg-brand-secondary"
                        : ""
                    } focus:bg-brand-secondary outline-none`}
                    onClick={() => {
                      onChange(country.dialCode);
                      setOpen(false);
                      setSearchTerm("");
                      buttonRef?.current?.focus();
                    }}
                    onMouseEnter={() =>
                      setHighlightedIndex(filteredCountries.indexOf(country))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChange(country.dialCode);
                        setOpen(false);
                        setSearchTerm("");
                        buttonRef?.current?.focus();
                      } else if (e.key === "Escape") {
                        setOpen(false);
                        buttonRef?.current?.focus();
                        e.stopPropagation();
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHighlightedIndex((prev) =>
                          prev === null || prev === filteredCountries.length - 1
                            ? 0
                            : prev + 1
                        );
                        setTimeout(
                          () =>
                            optionRefs.current
                              .get(
                                filteredCountries[highlightedIndex || 0]?.code
                              )
                              ?.focus(),
                          0
                        );
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHighlightedIndex((prev) =>
                          prev === null || prev === 0
                            ? filteredCountries.length - 1
                            : prev - 1
                        );
                        setTimeout(
                          () =>
                            optionRefs.current
                              .get(
                                filteredCountries[highlightedIndex || 0]?.code
                              )
                              ?.focus(),
                          0
                        );
                      }
                    }}
                  >
                    <svg
                      className={`mr-2 h-4 w-4 ${
                        value === country.dialCode ? "opacity-100" : "opacity-0"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="mr-2">{country.flag}</span>
                    <span className="mr-2 font-mono">{country.dialCode}</span>
                    <span>{country.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
