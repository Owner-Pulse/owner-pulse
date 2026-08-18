import React from "react";
import { Search, X } from "lucide-react";

const FilterBar = ({ searchQuery, onSearchChange, statusFilter, onStatusChange }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 focus-within:ring-2 focus-within:ring-[#1E3A5F] flex-1 w-full sm:w-auto">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search directors by name, email, or role..."
          className="text-sm bg-transparent border-none outline-none w-full min-w-[200px]"
        />
        {searchQuery && (
          <button onClick={() => onSearchChange("")} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
        {[
          { id: "all", label: "All" },
          { id: "active", label: "Active" },
          { id: "pending", label: "Pending" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => onStatusChange(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === f.id ? "bg-[#1E3A5F] text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
