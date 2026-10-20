import React, { useMemo, useState } from "react";
import { useLocation } from "react-router";
import { AlertTriangle, CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { formatDateTime } from "@/lib/datetime";
import { useAdpHoursImport, useAdpHoursImports, useAdpHoursPreview } from "@/hooks/adp-hours.hook";
import { FileUploadField } from "@/components/ui/FileUploadButton";

const useImportRole = () => (useLocation().pathname.startsWith("/owner") ? "owner" : "director");

const AdpHoursImportPanel = () => {
  const role = useImportRole();
  const [file, setFile] = useState(null);
  const [payPeriodStart, setPayPeriodStart] = useState("");
  const [payPeriodEnd, setPayPeriodEnd] = useState("");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const previewMutation = useAdpHoursPreview(role);
  const importMutation = useAdpHoursImport(role);
  const { imports, meta, isLoading, refetch, isFetching } = useAdpHoursImports(role, page);

  const busy = previewMutation.isPending || importMutation.isPending;

  const formData = useMemo(() => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    if (payPeriodStart) fd.append("pay_period_start", payPeriodStart);
    if (payPeriodEnd) fd.append("pay_period_end", payPeriodEnd);
    return fd;
  }, [file, payPeriodStart, payPeriodEnd]);

  const runPreview = async () => {
    setError(null);
    setPreview(null);
    if (!formData) {
      setError("Choose a CSV file first.");
      return;
    }
    try {
      const res = await previewMutation.mutateAsync(formData);
      setPreview(res?.data ?? null);
      if (res?.data?.pay_period_start && !payPeriodStart) setPayPeriodStart(res.data.pay_period_start);
      if (res?.data?.pay_period_end && !payPeriodEnd) setPayPeriodEnd(res.data.pay_period_end);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Preview failed.");
    }
  };

  const runImport = async () => {
    setError(null);
    if (!formData) {
      setError("Choose a CSV file first.");
      return;
    }
    try {
      await importMutation.mutateAsync(formData);
      setPreview(null);
      setFile(null);
      await refetch();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Import failed.");
    }
  };

  const lastPage = meta?.last_page ?? 1;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ADP staff hours (CSV)</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload an ADP time-card export. Staff are matched by employee ID, then by name. Unmatched rows are listed and not saved.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="block text-sm">
            <span className="font-semibold text-gray-700">Pay period start</span>
            <input
              type="date"
              value={payPeriodStart}
              onChange={(e) => setPayPeriodStart(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-gray-200"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-gray-700">Pay period end</span>
            <input
              type="date"
              value={payPeriodEnd}
              onChange={(e) => setPayPeriodEnd(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-gray-200"
            />
          </label>
          <div className="text-sm">
            <FileUploadField
              label="CSV file"
              accept=".csv,text/csv"
              disabled={busy}
              resetOnSelect={false}
              onFileSelect={(selected) => setFile(selected)}
              fileName={file?.name ?? null}
              labelClassName="text-sm font-semibold text-gray-700"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !file}
            onClick={runPreview}
            className="cursor-pointer flex items-center gap-2 px-4 h-10 rounded-xl border border-[#1E3A5F] text-[#1E3A5F] text-sm font-semibold disabled:opacity-50"
          >
            {previewMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
            Preview
          </button>
          <button
            type="button"
            disabled={busy || !file}
            onClick={runImport}
            className="cursor-pointer flex items-center gap-2 px-4 h-10 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold disabled:opacity-50"
          >
            {importMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            Import
          </button>
        </div>

        {preview && (
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 text-sm space-y-2">
            <p className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#3E7A54]" /> Preview
            </p>
            <p>
              Rows: {preview.total_rows} · Matched: {preview.matched_count} · Unmatched: {preview.unmatched_count}
            </p>
            {preview.unmatched_rows?.length > 0 && (
              <ul className="text-xs text-[#8A362C] list-disc pl-5 max-h-32 overflow-y-auto">
                {preview.unmatched_rows.map((row, idx) => (
                  <li key={idx}>
                    Line {row.line}: {row.employee_name || "—"} (ID {row.adp_employee_id || "—"})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-3">ADP import history</h3>
        {isLoading ? (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </p>
        ) : imports.length === 0 ? (
          <p className="text-sm text-gray-500">No ADP imports yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-[11px] uppercase text-gray-500">
                  <th className="px-3 py-2 text-left">File</th>
                  <th className="px-3 py-2 text-left">Period</th>
                  <th className="px-3 py-2 text-right">Imported</th>
                  <th className="px-3 py-2 text-right">Unmatched</th>
                  <th className="px-3 py-2 text-left">When</th>
                </tr>
              </thead>
              <tbody>
                {imports.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">{row.file_name}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {row.pay_period_start} → {row.pay_period_end}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">{row.imported_rows}</td>
                    <td className="px-3 py-2 text-right">{row.unmatched_count}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(row.imported_at) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {lastPage > 1 && (
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 h-8 rounded-lg border text-xs font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= lastPage || isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 h-8 rounded-lg border text-xs font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdpHoursImportPanel;
