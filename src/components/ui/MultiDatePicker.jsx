import React, { useState } from "react";
import { Calendar, Plus, X, AlertCircle } from "lucide-react";

export const formatDateLabel = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const MultiDatePicker = ({
  dates = [],
  onChange,
  label = "Select Dates",
  placeholder = "YYYY-MM-DD",
  className = "",
  compact = false,
}) => {
  const [tempDate, setTempDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddDate = (e) => {
    if (e) e.preventDefault();
    if (!tempDate) {
      setErrorMsg("Please select or type a date first.");
      return;
    }
    if (dates.includes(tempDate)) {
      setErrorMsg("This date is already added.");
      return;
    }

    const updated = [...dates, tempDate].sort();
    onChange(updated);
    setTempDate("");
    setErrorMsg("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddDate();
    }
  };

  const handleRemoveDate = (dateToRemove) => {
    const updated = dates.filter((d) => d !== dateToRemove);
    onChange(updated);
    setErrorMsg("");
  };

  const handleClearAll = () => {
    onChange([]);
    setErrorMsg("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-gray-700">
            {label}
            {dates.length > 0 && (
              <span className="ml-2 font-normal text-gray-500">
                ({dates.length} date{dates.length > 1 ? "s" : ""} selected)
              </span>
            )}
          </label>
          {dates.length > 1 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Input Row with explicit "+ Add Date" button */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="date"
            value={tempDate}
            onChange={(e) => {
              setTempDate(e.target.value);
              setErrorMsg("");
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full px-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white text-gray-900 ${
              compact ? "py-1.5 h-9" : "py-2.5 h-10"
            }`}
          />
        </div>

        <button
          type="button"
          onClick={handleAddDate}
          disabled={!tempDate}
          className={`px-3 flex items-center gap-1.5 rounded-xl text-xs font-semibold transition-all ${
            compact ? "h-9" : "h-10"
          } ${
            tempDate
              ? "bg-[#1E3A5F] text-white hover:bg-[#15294A] shadow-xs cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Plus size={14} />
          <span>Add Date</span>
        </button>
      </div>

      {errorMsg && (
        <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
          <AlertCircle size={12} /> {errorMsg}
        </p>
      )}

      {/* Selected Chips List */}
      {dates.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {dates.map((dateStr) => (
            <span
              key={dateStr}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1E3A5F]/10 text-[#1E3A5F] border border-[#1E3A5F]/20 shadow-2xs"
            >
              <Calendar size={12} className="text-[#1E3A5F]" />
              {formatDateLabel(dateStr)}
              <button
                type="button"
                onClick={() => handleRemoveDate(dateStr)}
                className="hover:bg-[#1E3A5F]/20 p-0.5 rounded-full text-[#1E3A5F] transition-colors"
                title="Remove date"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 italic">
          No dates added yet. Pick a date and click <strong>"+ Add Date"</strong>.
        </p>
      )}
    </div>
  );
};

export default MultiDatePicker;
