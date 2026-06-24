import React from "react";
import { Search, X } from "lucide-react";

const AGING_BUCKETS = [
  { key: "1-7", label: "1–7 days" },
  { key: "8-14", label: "8–14 days" },
  { key: "15-30", label: "15–30 days" },
  { key: "31-60", label: "31–60 days" },
  { key: "60+", label: "60+ days" },
];

const FilterBar = ({ filterBucket, onBucketChange, searchQuery, onSearchChange, isOwner }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aging:</span>
      {[{ key: "all", label: "All" }, ...AGING_BUCKETS].map((f) => (
        <button
          key={f.key}
          onClick={() => onBucketChange(f.key)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filterBucket === f.key
              ? "bg-[#1E3A5F] text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 flex-1 max-w-xs">
      <Search size={16} className="text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={isOwner ? "Search by name..." : "Search families..."}
        className="text-sm bg-transparent border-none outline-none w-full"
      />
      {searchQuery && (
        <button onClick={() => onSearchChange("")} className="text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      )}
    </div>
  </div>
);

export default FilterBar;
