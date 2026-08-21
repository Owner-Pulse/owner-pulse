import React from "react";

const FilterBar = ({ categoryFilter, statusFilter, onCategoryChange, onStatusChange, totalCount }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">Role:</span>
        {[
          { id: "all", label: "All" },
          { id: "owner", label: "Owner" },
          { id: "director", label: "Director" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => onCategoryChange(f.id)}
            className={`px-2.5 md:px-3 py-1.5 rounded-full text-[11px] md:text-xs font-semibold transition-all ${
              categoryFilter === f.id
                ? "bg-[#1E3A5F] text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">Status:</span>
        {[
          { id: "all", label: "All" },
          { id: "compliant", label: "Compliant" },
          { id: "expiring", label: "Expiring" },
          { id: "expired", label: "Expired" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => onStatusChange(f.id)}
            className={`px-2.5 md:px-3 py-1.5 rounded-full text-[11px] md:text-xs font-semibold transition-all ${
              statusFilter === f.id
                ? "bg-[#1E3A5F] text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="sm:hidden">
              {f.label === "Compliant" ? "OK" : f.label === "Expiring" ? "⚠" : f.label === "Expired" ? "✕" : f.label}
            </span>
            <span className="hidden sm:inline">{f.label}</span>
          </button>
        ))}
      </div>
      <span className="text-[10px] md:text-xs text-gray-400 ml-auto">{totalCount} items</span>
    </div>
  );
};

export default FilterBar;
