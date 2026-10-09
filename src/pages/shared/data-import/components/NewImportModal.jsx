import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Info,
  Columns3,
} from "lucide-react";
import toast from "react-hot-toast";
import { useGetCsvFileTypes, useUploadCsv } from "@/hooks/owner-hook/csv-manage.hook";
import { DEFAULT_FILE_TYPES, formatFileSize } from "@/pages/owner-dashboard/overview/components/CsvUploadModal";
import { analyzeCsv, rewriteHeaderRow, removeColumns } from "../analyze-csv";
import { EXPECTED_COLUMNS, MANDATORY_COLUMNS, autoMapColumns } from "../expected-columns";
import ColumnMappingModal from "./ColumnMappingModal";

const PREVIEW_LIMIT = 100;
const SUCCESS_CLOSE_DELAY = 2500;

// The backend reports a column it could not find in the uploaded file like this
const MISSING_COLUMN_PATTERN = /undefined (?:array key|index):? "?([^"]+?)"?$/i;

const TAB_HINTS = {
  ready: "These rows passed the file check and are ready to import.",
  duplicate: "These rows are exact copies of an earlier row in the same file.",
  errors: "File problems, import errors, and rows that do not match the header row. Fix them in the file, then choose it again.",
};

const StatTile = ({ label, value }) => (
  <div className="flex-1 min-w-32 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-base font-bold text-gray-900 mt-0.5">{value}</p>
  </div>
);

const HIDDEN_FILE_TYPE_KEYS = ["billing", "timeclock"];

const NewImportModal = ({ onClose }) => {
  const fileInputRef = useRef(null);
  const { fileTypes: apiFileTypes, isLoading: isLoadingTypes } = useGetCsvFileTypes();
  const { uploadCsv, progress, isPending, reset: resetMutation } = useUploadCsv();

  // Combine API options with fallback list if needed
  // Billing Activities and Children Live Time Clock are not offered here
  const sourceFileTypes = ((apiFileTypes && apiFileTypes.length > 0) ? apiFileTypes : DEFAULT_FILE_TYPES)
    .filter((item) => !HIDDEN_FILE_TYPE_KEYS.includes(item.key));
  // Employee / Staff Info is listed first
  const fileTypesList = [
    ...sourceFileTypes.filter((item) => item.key === "employees"),
    ...sourceFileTypes.filter((item) => item.key !== "employees"),
  ];

  const [selectedType, setSelectedType] = useState("employees");
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("ready");
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [mappingOpen, setMappingOpen] = useState(false);
  const [mappingConfirmed, setMappingConfirmed] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  // { message, missingColumn } when the import failed; missingColumn is set for column mapping errors
  const [importFailure, setImportFailure] = useState(null);
  // Import error shown on the column comparison popup after returning to it
  const [mappingError, setMappingError] = useState(null);

  const failImport = (message) => {
    setImportError(message);
    setActiveTab("errors");
    setImportFailure({ message, missingColumn: message.trim().match(MISSING_COLUMN_PATTERN)?.[1] || null });
  };

  // Mapping errors go back to the column comparison; anything else closes the
  // popups and shows the error on the Data Import page
  const handleFailureReturn = () => {
    if (importFailure?.missingColumn) {
      setMappingError(importFailure.message);
      setImportFailure(null);
      setMappingOpen(true);
    } else {
      onClose(importFailure?.message);
    }
  };

  // After a successful import, show the success popup briefly, then close every popup
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!successOpen) return;
    const timer = setTimeout(() => onCloseRef.current(), SUCCESS_CLOSE_DELAY);
    return () => clearTimeout(timer);
  }, [successOpen]);

  const currentOption = fileTypesList.find((item) => item.key === selectedType) || fileTypesList[0];
  const existingColumns = EXPECTED_COLUMNS[selectedType] || [];

  // Import sheet headers, with matched columns shown under their existing column name
  const displayHeaders = (analysis?.headers || []).map((header, idx) => {
    const matched = existingColumns.find((column) => columnMapping[column] === idx);
    return matched || header;
  });

  // Import sheet columns not mapped to an existing column are left out of the preview and the import
  const discardedColumns = new Set(
    existingColumns.length === 0
      ? []
      : (analysis?.headers || [])
        .map((_, idx) => idx)
        .filter((idx) => !existingColumns.some((column) => columnMapping[column] === idx))
  );
  const visibleCells = (cells) => cells.filter((_, idx) => !discardedColumns.has(idx));

  const clearImport = () => {
    setImportResult(null);
    setImportError(null);
    resetMutation();
  };

  // Opens the column comparison popup; the preview popup opens once it is confirmed
  const startColumnMapping = (headers, typeKey) => {
    setColumnMapping(autoMapColumns(EXPECTED_COLUMNS[typeKey] || [], headers));
    setMappingConfirmed(headers.length === 0);
    setMappingOpen(headers.length > 0);
    setPreviewOpen(headers.length === 0);
  };

  const validateFile = async (file) => {
    setIsValidating(true);
    try {
      const result = analyzeCsv(await file.text());
      setAnalysis(result);
      setActiveTab(result.ready.length > 0 ? "ready" : "errors");
      startColumnMapping(result.headers, selectedType);
    } catch (err) {
      setAnalysis({ headers: [], ready: [], duplicate: [], issues: [], total: 0, errors: [err?.message || "The file could not be read."] });
      setActiveTab("errors");
      setMappingConfirmed(true);
      setPreviewOpen(true);
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv" && file.type !== "application/vnd.ms-excel") {
      toast.error("Invalid file format. Please select a valid CSV (.csv) file.");
      return;
    }
    setSelectedFile(file);
    setAnalysis(null);
    setMappingConfirmed(false);
    clearImport();
    validateFile(file);
  };

  // Closing the popup without confirming discards the chosen file
  const handleMappingClose = () => {
    setMappingOpen(false);
    setMappingError(null);
    if (!mappingConfirmed) {
      setSelectedFile(null);
      setAnalysis(null);
    }
  };

  // Back to the first popup with the upload box empty
  const handleChangeFile = () => {
    setPreviewOpen(false);
    setSelectedFile(null);
    setAnalysis(null);
    setMappingConfirmed(false);
    clearImport();
  };

  const handleMappingConfirm = (mapping) => {
    setColumnMapping(mapping);
    setMappingConfirmed(true);
    setMappingOpen(false);
    setMappingError(null);
    setPreviewOpen(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedType) {
      toast.error("Please select a CSV file type.");
      return;
    }
    if (!selectedFile) {
      toast.error("Please choose a CSV file to upload.");
      return;
    }

    setImportError(null);
    setIsImporting(true);
    try {
      // Import sheet columns matched to a differently named existing column are renamed in the header row
      const isRenamed = displayHeaders.some((h, idx) => h !== analysis.headers[idx]);
      const file = discardedColumns.size > 0
        ? await removeColumns(selectedFile, displayHeaders, discardedColumns)
        : isRenamed ? await rewriteHeaderRow(selectedFile, displayHeaders) : selectedFile;

      const formData = new FormData();
      formData.append("type", selectedType);
      formData.append("file", file);

      const response = await uploadCsv(formData);
      if (response?.status || response?.code === 200) {
        setImportResult(response?.data || response);
        setSuccessOpen(true);
      } else {
        failImport(response?.message || "Failed to process CSV file.");
      }
    } catch (err) {
      failImport(err?.response?.data?.message || err?.message || "An error occurred while uploading the CSV.");
    } finally {
      setIsImporting(false);
    }
  };

  const errorList = [...(analysis?.errors || []), ...(importError ? [importError] : [])];
  const issueRows = analysis?.issues || [];
  const counts = {
    ready: analysis?.ready.length ?? 0,
    duplicate: analysis?.duplicate.length ?? 0,
    issues: issueRows.length,
    errors: errorList.length + issueRows.length,
  };
  const tabs = [
    { key: "ready", label: "Ready" },
    { key: "duplicate", label: "Duplicate" },
    { key: "errors", label: "Errors" },
  ];
  const busy = isPending || isValidating || isImporting;
  const canImport = !!selectedFile && !!analysis && analysis.total > 0 && mappingConfirmed && !busy && !importResult;
  const tabRows = activeTab === "errors" ? issueRows : (analysis?.[activeTab] || []);

  const statTiles = (
    <>
          <StatTile label="Total rows" value={analysis?.total ?? 0} />
          <StatTile label="Duplicate rows" value={counts.duplicate} />
          <StatTile label="Valid rows" value={counts.ready} />
          <StatTile label="Invalid rows" value={counts.issues} />
          <StatTile label="Imported rows" value={importResult?.imported_rows ?? 0} />
    </>
  );

  const previewBody = (
          <>
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.key
                    ? "bg-[#1E3A5F] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {tab.label} ({counts[tab.key]})
                </button>
              ))}
            </div>

            <p className="mt-2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-600">
              {TAB_HINTS[activeTab]}
            </p>

            <div className="mt-2">
              {isValidating ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" /> Validating file...
                </div>
              ) : activeTab === "errors" && counts.errors === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No errors found.</p>
              ) : activeTab !== "errors" && tabRows.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No rows to show.</p>
              ) : (
                <>
                  {activeTab === "errors" && errorList.length > 0 && (
                    <div className="p-4 mb-2 bg-[#AE4A3E]/[0.06] border border-[#AE4A3E]/25 rounded-xl space-y-2">
                      {errorList.map((msg, idx) => (
                        <p key={idx} className="flex items-start gap-2 text-xs text-[#8A362C]">
                          <AlertTriangle size={14} className="shrink-0 mt-px" />
                          {msg}
                        </p>
                      ))}
                    </div>
                  )}
                  {tabRows.length > 0 && (
                  <div className="max-h-96 overflow-auto border border-gray-200 rounded-xl">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-500 whitespace-nowrap">Row</th>
                          {activeTab === "errors" && (
                            <th className="px-3 py-2 text-left font-semibold text-gray-500 whitespace-nowrap">Issue</th>
                          )}
                          {visibleCells(displayHeaders.map((h, idx) => h || `Column ${idx + 1}`)).map((h, idx) => (
                            <th key={idx} className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                              {h || `Column ${idx + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tabRows.slice(0, PREVIEW_LIMIT).map((row) => (
                          <tr key={row.line} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{row.line}</td>
                            {activeTab === "errors" && (
                              <td className="px-3 py-2 text-[#8A362C] whitespace-nowrap">{row.reason}</td>
                            )}
                            {visibleCells(activeTab === "errors" ? row.cells : analysis.headers.map((_, idx) => row.cells[idx])).map((cell, idx) => (
                              <td key={idx} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-64 truncate" title={cell}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  )}
                  {tabRows.length > PREVIEW_LIMIT && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                      <FileSpreadsheet size={13} /> Showing the first {PREVIEW_LIMIT} of {tabRows.length} rows.
                    </p>
                  )}
                </>
              )}
            </div>
          </>
  );

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="w-full max-w-6xl h-[90vh] overflow-y-auto bg-gray-50 rounded-2xl shadow-2xl border border-gray-100 p-5 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">New Import</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-3xl">
            Choose the CSV file type, upload the Procare export, compare its columns with the existing ones, and review the preview before import.
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 cursor-pointer flex items-center gap-1.5 px-3.5 h-9 rounded-xl border border-[#AE4A3E]/30 bg-[#AE4A3E]/10 text-[#8A362C] text-sm font-semibold hover:bg-[#AE4A3E]/15 transition-colors"
        >
          <X size={15} /> Close
        </button>
      </div>

      {/* File Type Selection */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <label className="flex items-center justify-between text-xs font-bold text-gray-800 mb-1.5">
          <span>
            CSV File Type <span className="text-red-500">*</span>
          </span>
          {isLoadingTypes && (
            <span className="text-[10px] font-normal text-gray-400 flex items-center gap-1">
              <Loader2 size={10} className="animate-spin" /> Loading options...
            </span>
          )}
        </label>
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            clearImport();
            if (selectedFile && analysis) startColumnMapping(analysis.headers, e.target.value);
          }}
          disabled={isPending}
          className="w-full h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:bg-white transition-all"
        >
          {fileTypesList.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
        {currentOption?.description && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
            <Info size={14} className="text-[#1E3A5F] shrink-0 mt-px" />
            {currentOption.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div>
        <div className="flex flex-wrap items-stretch gap-3">
          {statTiles}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="cursor-pointer px-5 rounded-xl bg-[#1E3A5F] hover:bg-[#15294A] text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 min-h-12"
          >
            {selectedFile ? "Change File" : "Choose File"}
          </button>
        </div>
        {selectedFile && (
          <p className="text-xs text-gray-500 mt-2">
            Selected file: {selectedFile.name} ({formatFileSize(selectedFile.size)})
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,application/vnd.ms-excel"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {/* Preview */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>

        {!selectedFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer p-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all ${isDragging
              ? "border-[#1E3A5F] bg-[#1E3A5F]/5"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
              }`}
          >
            <div className="p-3 bg-white rounded-full border border-gray-100 mb-3 text-[#1E3A5F]">
              <UploadCloud size={28} />
            </div>
            <p className="text-sm font-semibold text-gray-700">Click to browse or drag & drop CSV file</p>
            <p className="text-xs text-gray-400 mt-1">
              Only <span className="font-medium text-gray-600">.csv</span> files are supported
            </p>
          </div>
        ) : !mappingConfirmed ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
            {isValidating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Validating file...
              </>
            ) : (
              "Confirm the column comparison to see the preview."
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-sm text-gray-600">
              {importResult
                ? "Import finished. Open the preview to see the result."
                : "Columns confirmed. Open the preview to review the rows and import the file."}
            </p>
            <button
              onClick={() => setPreviewOpen(true)}
              className="cursor-pointer px-4 h-9 rounded-xl bg-[#1E3A5F] hover:bg-[#15294A] text-white text-sm font-semibold shadow-sm transition-colors"
            >
              Open Preview
            </button>
          </div>
        )}
      </div>

      {/* Preview Popup */}
      {previewOpen && selectedFile && mappingConfirmed && (
        <div className="fixed inset-0 z-95 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh] overflow-y-auto bg-gray-50 rounded-2xl shadow-2xl border border-gray-100 p-5 md:p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Import Preview</h2>
                <p className="text-sm text-gray-500 mt-1">{currentOption?.label}</p>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="shrink-0 cursor-pointer flex items-center gap-1.5 px-3.5 h-9 rounded-xl border border-[#AE4A3E]/30 bg-[#AE4A3E]/10 text-[#8A362C] text-sm font-semibold hover:bg-[#AE4A3E]/15 transition-colors"
              >
                <X size={15} /> Close
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-stretch gap-3">{statTiles}</div>
              <p className="text-xs text-gray-500 mt-2 break-words">
                Selected file: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Preview</h2>
          <div className="flex items-center gap-2">
            {selectedFile && mappingConfirmed && analysis?.headers.length > 0 && !importResult && (
              <button
                onClick={() => setMappingOpen(true)}
                disabled={busy}
                className="cursor-pointer flex items-center gap-1.5 px-4 h-9 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Columns3 size={14} /> Columns
              </button>
            )}
          </div>
        </div>

        {importResult && (
          <div className="flex items-start gap-3 p-4 mb-4 bg-[#3E7A54]/10 border border-[#3E7A54]/30 rounded-xl">
            <CheckCircle2 size={22} className="text-[#3E7A54] shrink-0" />
            <div className="text-xs text-gray-700 space-y-0.5">
              <p className="text-sm font-bold text-gray-900">Import processed successfully</p>
              <p>
                {importResult?.imported_rows ?? 0} of {importResult?.total_rows ?? analysis?.total ?? 0} rows imported
                {" · "}{importResult?.skipped_rows ?? 0} skipped
                {importResult?.target_table ? ` · Target table: ${importResult.target_table}` : ""}
              </p>
              {importResult?.processed_at && <p className="text-gray-500">Processed at: {importResult.processed_at}</p>}
            </div>
          </div>
        )}
        {previewBody}
            </div>

            {/* Change file / import actions */}
            <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleChangeFile}
              disabled={busy}
              className="cursor-pointer px-4 h-9 rounded-xl bg-[#1E3A5F] hover:bg-[#15294A] text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              Change File
            </button>
            <button
              onClick={handleImport}
              disabled={!canImport}
              className="cursor-pointer flex items-center gap-1.5 px-4 h-9 rounded-xl bg-[#1E3A5F] hover:bg-[#15294A] text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Importing...
                </>
              ) : (
                `Import File (${analysis?.total ?? 0} rows)`
              )}
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Progress Popup: loading animation, then the success tick or the error cross */}
      {(isImporting || successOpen || importFailure) && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`w-full ${importFailure ? "max-w-md pt-10 pb-5" : "max-w-sm py-10"} bg-gray-50 rounded-2xl shadow-2xl border border-gray-100 px-6 flex flex-col items-center text-center`}
          >
            {importFailure ? (
              <>
                <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                  <motion.circle
                    cx="44"
                    cy="44"
                    r="40"
                    stroke="#DC2626"
                    strokeWidth="5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  <motion.path
                    d="M31 31L57 57"
                    stroke="#DC2626"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.45, ease: "easeOut" }}
                  />
                  <motion.path
                    d="M57 31L31 57"
                    stroke="#DC2626"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.65, ease: "easeOut" }}
                  />
                </svg>
                <h2 className="text-xl font-bold text-red-600 mt-5">Import failed</h2>
                <p className="text-sm text-gray-700 mt-1 break-words max-w-full">{importFailure.message}</p>
                {importFailure.missingColumn && (
                  <p className="text-xs text-gray-500 mt-2">
                    The column "{importFailure.missingColumn}" is not mapped. Return to the column comparison to map it.
                  </p>
                )}
                <button
                  onClick={handleFailureReturn}
                  className="self-end mt-6 cursor-pointer px-6 h-9 rounded-xl bg-[#1E3A5F] hover:bg-[#15294A] text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  Return
                </button>
              </>
            ) : !successOpen ? (
              <>
                <motion.svg
                  width="88"
                  height="88"
                  viewBox="0 0 88 88"
                  fill="none"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
                >
                  <circle cx="44" cy="44" r="40" stroke="#1E3A5F" strokeOpacity="0.15" strokeWidth="5" />
                  <path d="M44 4a40 40 0 0 1 40 40" stroke="#1E3A5F" strokeWidth="5" strokeLinecap="round" />
                </motion.svg>
                <h2 className="text-xl font-bold text-[#1E3A5F] mt-5">Importing file</h2>
                <p className="text-sm text-[#1E3A5F]/70 mt-1">
                  {Number(progress?.total_rows) > 0
                    ? `${Number(progress?.processed_rows || 0).toLocaleString()} of ${Number(progress.total_rows).toLocaleString()} rows processed…`
                    : "Please wait while the rows are imported…"}
                </p>
              </>
            ) : (
              <>
            <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
              <motion.circle
                cx="44"
                cy="44"
                r="40"
                stroke="#1E3A5F"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.path
                d="M27 45.5L38.5 57L61 33"
                stroke="#1E3A5F"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
              />
            </svg>
            <h2 className="text-xl font-bold text-[#1E3A5F] mt-5">Successfully imported</h2>
            <p className="text-sm text-[#1E3A5F]/70 mt-1">
              {importResult?.imported_rows ?? 0} of {importResult?.total_rows ?? analysis?.total ?? 0} rows imported
            </p>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Column Comparison Popup */}
      {mappingOpen && analysis && (
        <ColumnMappingModal
          fileName={selectedFile?.name}
          fileTypeLabel={currentOption?.label}
          existingColumns={existingColumns}
          mandatoryColumns={MANDATORY_COLUMNS[selectedType] || []}
          errorMessage={mappingError}
          onDismissError={() => setMappingError(null)}
          importHeaders={analysis.headers}
          initialMapping={columnMapping}
          onConfirm={handleMappingConfirm}
          onClose={handleMappingClose}
        />
      )}
    </div>
    </div>
  );
};

export default NewImportModal;
