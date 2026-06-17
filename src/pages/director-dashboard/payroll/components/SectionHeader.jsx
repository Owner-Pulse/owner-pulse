import React from "react";
import { Plus } from "lucide-react";

const SectionHeader = ({ number, title, description, onAdd, addLabel }) => (
  <div className="flex items-baseline justify-between mb-3">
    <div>
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
          {number}
        </span>
        {title}
      </h3>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    {onAdd && (
      <button
        onClick={onAdd}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <Plus size={12} /> {addLabel || "Add"}
      </button>
    )}
  </div>
);

export default SectionHeader;
