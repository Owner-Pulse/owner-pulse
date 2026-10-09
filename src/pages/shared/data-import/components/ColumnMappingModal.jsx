import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

const MATCHED = "border-[#3E7A54]/40 bg-[#3E7A54]/10 text-[#2C5E3F]";
const UNMATCHED = "border-[#AE4A3E]/40 bg-[#AE4A3E]/10 text-[#8A362C]";
const CELL = "w-full min-h-10 px-3 py-2 rounded-xl border text-sm font-medium flex items-center";

const headerLabel = (headers, idx) => headers[idx] || `Column ${idx + 1}`;

const ColumnMappingModal = ({ fileName, fileTypeLabel, existingColumns, mandatoryColumns, importHeaders, initialMapping, errorMessage, onDismissError, onConfirm, onClose }) => {
  const [mapping, setMapping] = useState(initialMapping);

  const usedIndexes = new Set(Object.values(mapping).filter((idx) => idx >= 0));
  const matchedCount = usedIndexes.size;
  const missingCount = existingColumns.length - matchedCount;

  // Confirm is blocked until every mandatory column is mapped
  const missingMandatory = mandatoryColumns.filter((column) => (mapping[column] ?? -1) < 0);
  const blockers = missingMandatory.length > 0
    ? [`Map the mandatory column${missingMandatory.length > 1 ? "s" : ""}: ${missingMandatory.join(", ")}.`]
    : [];

  // An import sheet column can be matched to one existing column only
  const handleSelect = (column, value) => {
    const idx = Number(value);
    setMapping((prev) => {
      const next = { ...prev };
      if (idx >= 0) {
        Object.keys(next).forEach((key) => {
          if (next[key] === idx) next[key] = -1;
        });
      }
      next[column] = idx;
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-gray-50 rounded-2xl shadow-2xl border border-gray-100 p-5 md:p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Column Comparison</h2>
            <p className="text-sm text-gray-500 mt-1 break-words">
              {fileTypeLabel} · {fileName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 cursor-pointer flex items-center gap-1.5 px-3.5 h-9 rounded-xl border border-[#AE4A3E]/30 bg-[#AE4A3E]/10 text-[#8A362C] text-sm font-semibold hover:bg-[#AE4A3E]/15 transition-colors"
          >
            <X size={15} /> Close
          </button>
        </div>

        {/* Failed import notification */}
        {errorMessage && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 shrink-0">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p className="flex-1 min-w-0 break-words">
              <span className="font-semibold">Import failed.</span> {errorMessage}
            </p>
            <button
              onClick={onDismissError}
              aria-label="Dismiss"
              className="shrink-0 cursor-pointer p-1 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-gray-100 shrink-0">
          <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${MATCHED}`}>
            Matched ({matchedCount})
          </span>
          <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${UNMATCHED}`}>
            Missing in import sheet ({missingCount})
          </span>
          <span className="ml-auto text-xs text-gray-500">
            <span className="text-red-500 font-bold">*</span> Mandatory · {existingColumns.length} columns
          </span>
        </div>

        {/* Column list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">Existing Columns</p>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">Import Sheet Columns</p>

            {existingColumns.map((column) => {
              const idx = mapping[column] ?? -1;
              const tone = idx >= 0 ? MATCHED : UNMATCHED;
              return (
                <React.Fragment key={column}>
                  <div className={`${CELL} ${tone}`}>
                    {column}
                    {mandatoryColumns.includes(column) && <span className="text-red-500 font-bold ml-1">*</span>}
                  </div>
                  <select
                    value={idx}
                    onChange={(e) => handleSelect(column, e.target.value)}
                    className={`${CELL} ${tone} cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]`}
                  >
                    <option value={-1}>— Not in import sheet —</option>
                    {importHeaders.map((_, i) => (
                      <option key={i} value={i}>
                        {headerLabel(importHeaders, i)}
                      </option>
                    ))}
                  </select>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
          {blockers.length > 0 && (
            <div className="mr-auto text-xs text-[#8A362C] space-y-0.5">
              {blockers.map((msg) => (
                <p key={msg}>{msg}</p>
              ))}
            </div>
          )}
          <button
            onClick={onClose}
            className="shrink-0 cursor-pointer px-4 h-9 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(mapping)}
            disabled={blockers.length > 0}
            className="shrink-0 cursor-pointer px-6 h-9 rounded-xl bg-[#1E3A5F] hover:bg-[#15294A] text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnMappingModal;
