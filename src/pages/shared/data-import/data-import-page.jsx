import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import { useGetCsvImports } from "@/hooks/owner-hook/csv-manage.hook";
import NewImportModal from "./components/NewImportModal";

const fmtNumber = (n) => Number(n || 0).toLocaleString();

const fmtDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(String(value).replace(" ", "T"));
  if (isNaN(d)) return value;
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
};

const STATUS_STYLES = {
  completed: "bg-[#3E7A54]/10 text-[#3E7A54]",
  processing: "bg-[#1E3A5F]/10 text-[#1E3A5F]",
  failed: "bg-[#AE4A3E]/10 text-[#8A362C]",
};

const StatCard = ({ label, value, hint }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 border-b-4 border-b-[#1E3A5F]">
    <span className="inline-block px-2.5 py-1 rounded-lg bg-[#1E3A5F] text-white text-[11px] font-bold">
      {label}
    </span>
    <p className="text-xl font-bold text-gray-900 mt-2 break-words">{value}</p>
    <p className="text-xs text-gray-400 mt-0.5 break-words">{hint}</p>
  </div>
);

const DataImportPage = () => {
  const [page, setPage] = useState(1);
  const [newImportOpen, setNewImportOpen] = useState(false);
  const [importError, setImportError] = useState(null);
  const { imports, meta, isLoading, isFetching, isError, error, refetch } = useGetCsvImports(page);

  const totalImports = meta?.total ?? imports.length;
  const lastPage = meta?.last_page ?? 1;
  const rowsImported = imports.reduce((sum, i) => sum + Number(i["Imported Rows"] || 0), 0);
  const rowsSkipped = imports.reduce((sum, i) => sum + Number(i["Skipped Rows"] || 0), 0);
  const scopeHint = lastPage > 1 ? "Across the imports on this page" : "Across all imports";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Data Import</h1>
        <button
          onClick={() => setNewImportOpen(true)}
          className="cursor-pointer flex items-center gap-2 px-5 h-11 rounded-xl bg-[#1E3A5F] hover:bg-[#15294A] text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <UploadCloud size={18} /> New Import
        </button>
      </div>

      {/* Failed import notification */}
      {importError && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p className="flex-1 min-w-0 break-words">
            <span className="font-semibold">Import failed.</span> {importError}
          </p>
          <button
            onClick={() => setImportError(null)}
            aria-label="Dismiss"
            className="shrink-0 cursor-pointer p-1 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Imports" value={fmtNumber(totalImports)} hint="Import runs recorded so far" />
        <StatCard label="Rows Imported" value={fmtNumber(rowsImported)} hint={scopeHint} />
        <StatCard label="Rows Skipped" value={fmtNumber(rowsSkipped)} hint={scopeHint} />
        <StatCard
          label="Last Import"
          value={page === 1 && imports[0] ? fmtDateTime(imports[0]["Imported At"]) : "—"}
          hint={page === 1 && imports[0] ? imports[0]["File Name"] : "No imports yet"}
        />
      </div>

      {/* Import History */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Import History</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              One row per import, with the file, where it went, how many rows were imported or skipped, and when.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="shrink-0 cursor-pointer flex items-center gap-2 px-4 h-9 rounded-xl bg-[#1E3A5F] hover:bg-[#15294A] text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-70"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Loading imports...
          </div>
        ) : isError ? (
          <div className="flex items-start gap-2 p-4 bg-[#AE4A3E]/[0.06] border border-[#AE4A3E]/25 rounded-xl text-xs text-[#8A362C]">
            <AlertTriangle size={14} className="shrink-0 mt-px" />
            {error?.response?.data?.message || error?.message || "Could not load the import history."}
          </div>
        ) : imports.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto w-11 h-11 bg-[#1E3A5F]/10 rounded-full flex items-center justify-center mb-2">
              <FileSpreadsheet size={20} className="text-[#1E3A5F]" />
            </div>
            <p className="text-sm font-medium text-gray-900">No imports yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Use New Import to upload your first CSV file.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-left font-semibold">File</th>
                  <th className="px-4 py-3 text-left font-semibold">Target Table</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Rows</th>
                  <th className="px-4 py-3 text-right font-semibold">Imported</th>
                  <th className="px-4 py-3 text-right font-semibold">Skipped</th>
                  <th className="px-4 py-3 text-left font-semibold">Imported At</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {imports.map((item) => {
                  const status = String(item["Status"] || "unknown").toLowerCase();
                  const skipped = Number(item["Skipped Rows"] || 0);
                  return (
                    <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 max-w-96">
                        <p className="font-semibold text-gray-900 break-words">
                          {item["File Name"] || "—"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Import #{item.id}</p>
                        {item["Error Log"] && (
                          <p className="text-xs text-[#8A362C] mt-0.5 break-words">
                            {item["Error Log"]}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{item["Target Table"] || "—"}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmtNumber(item["Total Rows"])}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtNumber(item["Imported Rows"])}</td>
                      <td className={`px-4 py-3 text-right ${skipped > 0 ? "font-semibold text-[#8A362C]" : "text-gray-700"}`}>
                        {fmtNumber(skipped)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmtDateTime(item["Imported At"])}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {lastPage > 1 && (
          <div className="flex items-center justify-between gap-3 pt-4 mt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Page {meta?.current_page ?? page} of {lastPage} · {fmtNumber(totalImports)} imports
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                className="cursor-pointer flex items-center gap-1 px-3 h-8 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage || isFetching}
                className="cursor-pointer flex items-center gap-1 px-3 h-8 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Import Popup */}
      {newImportOpen && (
        <NewImportModal
          onClose={(error) => {
            setNewImportOpen(false);
            setImportError(typeof error === "string" ? error : null);
          }}
        />
      )}
    </div>
  );
};

export default DataImportPage;
