import React, { useRef, useState } from "react";
import { FileText } from "lucide-react";
import { FieldError } from "@/pages/shared/weekly-reports/components/FormBits";

export const REVIEW_CYCLES = [
  { months: "6", label: "Every 6 months", note: "Review every 6 months" },
  { months: "12", label: "Every 12 months", note: "Review yearly" },
  { months: "24", label: "Every 24 months", note: "Review every 24 months" },
];

export const reviewNote = (months) => REVIEW_CYCLES.find((c) => c.months === String(months))?.note || "Review yearly";

export const isReviewNote = (notes) => /^review\b/i.test(notes || "");

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
};

const titleFromFile = (file) =>
  file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const Choice = ({ selected, title, body, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 rounded-xl border px-3 py-3 text-left ${selected ? "border-2 border-gray-900" : "border-gray-200 hover:border-gray-300"}`}
  >
    <span className="flex items-start gap-2">
      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? "border-gray-900" : "border-gray-300"}`}>
        {selected && <span className="h-2 w-2 rounded-full bg-gray-900" />}
      </span>
      <span>
        <span className="block text-sm font-semibold text-gray-900">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-gray-500">{body}</span>
      </span>
    </span>
  </button>
);

const labelClass = "text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase";
const fieldClass = "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10";

const VaultDocumentForm = ({
  categories,
  initial,
  requireFile,
  isPending,
  fieldErrors = {},
  onCancel,
  onSubmit,
  heading = "Upload document",
}) => {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState("");
  const [form, setForm] = useState(() => ({
    category_id: initial.category_id || (categories[0] ? String(categories[0].id) : ""),
    title: initial.title || "",
    intent: initial.intent || "track",
    trackBy: initial.trackBy || "expiry",
    expiry_date: initial.expiry_date || "",
    reviewMonths: initial.reviewMonths || "12",
    keptNotes: initial.keptNotes || "",
    file: null,
  }));

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const takeFile = (file) => {
    if (!file) return;
    setForm((f) => ({
      ...f,
      file,
      title: f.title.trim() ? f.title : titleFromFile(file),
    }));
    setLocalError("");
  };

  const submit = (e) => {
    e.preventDefault();
    if (requireFile && !form.file) {
      setLocalError("Choose a file to put on the shelf.");
      return;
    }
    if (!form.title.trim()) {
      setLocalError("Add a title.");
      return;
    }
    if (!form.category_id) {
      setLocalError("Choose a shelf.");
      return;
    }
    if (form.intent === "track" && form.trackBy === "expiry" && !form.expiry_date) {
      setLocalError("Add an expiry date, or switch to a review cycle.");
      return;
    }
    setLocalError("");

    const kept = isReviewNote(form.keptNotes) ? "" : form.keptNotes;
    let expiry = "";
    let notes = kept;
    if (form.intent === "track" && form.trackBy === "expiry") {
      expiry = form.expiry_date;
    }
    if (form.intent === "track" && form.trackBy === "review") {
      notes = reviewNote(form.reviewMonths);
    }

    onSubmit({
      category_id: form.category_id,
      title: form.title.trim(),
      expiry_date: expiry,
      notes,
      file: form.file,
    });
  };

  return (
    <form onSubmit={submit}>
      <p className="text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">
        OwnerPulse · Document Vault · The Shelf
      </p>
      <h2 className="mt-2 text-xl font-bold text-gray-900">The rule: “Just store it” or “Track it”</h2>
      <p className="mt-1 text-sm text-gray-500">
        One switch on upload decides whether a document feeds Compliance. Everything else follows.
      </p>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900">{heading}</h3>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            takeFile(e.dataTransfer.files?.[0]);
          }}
          className={`mt-3 flex w-full flex-col items-center rounded-xl border border-dashed px-4 py-6 text-center ${dragOver ? "border-gray-900 bg-gray-50" : "border-gray-300 bg-gray-50/60"}`}
        >
          <FileText size={18} className="text-gray-400" />
          {form.file ? (
            <p className="mt-2 text-sm text-gray-800">
              <span className="font-medium text-[#1E3A5F]">{form.file.name}</span>
              <span className="text-gray-500"> · {formatBytes(form.file.size)}</span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">{requireFile ? "Drop a file or take a photo" : "Drop a file or take a photo. A file is optional."}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">Drop another file or take a photo</p>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,image/*"
          className="hidden"
          onChange={(e) => takeFile(e.target.files?.[0])}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => takeFile(e.target.files?.[0])}
        />
        <div className="mt-2 text-center">
          <button type="button" onClick={() => cameraRef.current?.click()} className="text-xs font-semibold text-[#1E3A5F] hover:underline">
            Take a photo
          </button>
        </div>
        <FieldError message={Array.isArray(fieldErrors.file) ? fieldErrors.file[0] : fieldErrors.file} />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Title</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} className={fieldClass} />
            <FieldError message={Array.isArray(fieldErrors.title) ? fieldErrors.title[0] : fieldErrors.title} />
          </div>
          <div>
            <label className={labelClass}>Shelf</label>
            <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className={fieldClass}>
              <option value="">Select shelf</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <FieldError message={Array.isArray(fieldErrors.category_id) ? fieldErrors.category_id[0] : fieldErrors.category_id} />
          </div>
        </div>

        <p className={`${labelClass} mt-5`}>What should OwnerPulse do with it?</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Choice
            selected={form.intent === "store"}
            title="Just store it"
            body="Keep it on the shelf. No dates, no reminders, never affects Compliance or Pulse."
            onClick={() => set("intent", "store")}
          />
          <Choice
            selected={form.intent === "track"}
            title="Track it"
            body="Feeds Compliance. Shows up in expiring / expired, alerts the Director, counts in Pulse."
            onClick={() => set("intent", "track")}
          />
        </div>

        {form.intent === "track" && (
          <div className="mt-4">
            <p className={labelClass}>Track by</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <div className={`flex-1 rounded-xl border p-3 ${form.trackBy === "expiry" ? "border-2 border-gray-900" : "border-gray-200"}`}>
                <button type="button" onClick={() => set("trackBy", "expiry")} className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${form.trackBy === "expiry" ? "border-gray-900" : "border-gray-300"}`}>
                    {form.trackBy === "expiry" && <span className="h-2 w-2 rounded-full bg-gray-900" />}
                  </span>
                  Expiry date
                </button>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => {
                    set("trackBy", "expiry");
                    set("expiry_date", e.target.value);
                  }}
                  className={`${fieldClass} mt-2`}
                />
                <p className="mt-1 text-[11px] text-gray-400">Alerts at 60 / 30 / 7 days (from settings)</p>
                <FieldError message={Array.isArray(fieldErrors.expiry_date) ? fieldErrors.expiry_date[0] : fieldErrors.expiry_date} />
              </div>
              <div className={`flex-1 rounded-xl border p-3 ${form.trackBy === "review" ? "border-2 border-gray-900" : "border-gray-200"}`}>
                <button type="button" onClick={() => set("trackBy", "review")} className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${form.trackBy === "review" ? "border-gray-900" : "border-gray-300"}`}>
                    {form.trackBy === "review" && <span className="h-2 w-2 rounded-full bg-gray-900" />}
                  </span>
                  Review cycle
                </button>
                <select
                  value={form.reviewMonths}
                  onChange={(e) => {
                    set("trackBy", "review");
                    set("reviewMonths", e.target.value);
                  }}
                  className={fieldClass}
                >
                  {REVIEW_CYCLES.map((c) => (
                    <option key={c.months} value={c.months}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-gray-400">For handbooks, plans, policies with no legal expiry</p>
              </div>
            </div>
          </div>
        )}

        {localError && <p className="mt-3 text-xs font-medium text-red-600">{localError}</p>}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-3 py-2 text-sm font-semibold text-gray-700">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save to vault"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default VaultDocumentForm;
