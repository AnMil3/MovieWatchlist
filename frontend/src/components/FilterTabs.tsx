"use client";

import type { WatchedFilter } from "@/types/movie";

const FILTERS: { value: WatchedFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "watched", label: "Watched" },
  { value: "unwatched", label: "Unwatched" },
];

interface FilterTabsProps {
  active: WatchedFilter;
  onChange: (filter: WatchedFilter) => void;
}

export default function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            active === value
              ? "bg-indigo-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
