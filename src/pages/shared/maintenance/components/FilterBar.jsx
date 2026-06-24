import React from "react";

const PRIORITY_FILTERS = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

const FilterBar = ({ filterPriority, filterStatus, onPriorityChange, onStatusChange, filteredCount, totalCount }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority:</span>
      {PRIORITY_FILTERS.map((f) => (
        <button key={f.id} onClick={() => onPriorityChange(f.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterPriority === f.id ? "bg-[#1E3A5F] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          {f.label}
        </button>
      ))}
      <span className="text-gray-200 mx-1">|</span>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status:</span>
      {STATUS_FILTERS.map((f) => (
        <button key={f.id} onClick={() => onStatusChange(f.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === f.id ? "bg-gray-900 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          {f.label}
        </button>
      ))}
    </div>
    <span className="text-xs text-gray-400">{filteredCount} of {totalCount} requests</span>
  </div>
);

export default FilterBar;
