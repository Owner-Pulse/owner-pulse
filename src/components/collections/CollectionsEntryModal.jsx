import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCollectionsHistory, useSaveCollections } from "@/hooks/collections.hook";
import { fmtWeek, normalizeWeek, parseFieldErrors, thisMonday, toYmd } from "@/lib/collections";

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1 flex items-start gap-1 text-[11px] font-medium text-[#8A362C]">
      <AlertTriangle size={11} className="shrink-0 mt-0.5" /> <span className="break-words min-w-0">{message}</span>
    </p>
  ) : null;

const inputClass = (hasError) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] disabled:bg-gray-50 disabled:text-gray-500 ${
    hasError ? "border-[#AE4A3E]" : "border-gray-200"
  }`;

const formFromEntry = (entry, week) => ({
  week_start: entry?.week_start ? normalizeWeek(entry.week_start) : week,
  balance: entry?.balance != null ? String(entry.balance) : "",
  families_count: entry?.families_count != null ? String(entry.families_count) : "",
  notes: entry?.notes || "",
});

/**
 * "Update collections" — POST a week (new or existing) or, with `entry`, PUT that entry.
 *
 * Props:
 * - isOpen, onClose
 * - role: "owner" | "director"
 * - entry: an existing entry to edit (its week is fixed)
 */
const CollectionsEntryModal = ({ isOpen, onClose, role, entry = null }) => {
  const { saveCollections, isPending } = useSaveCollections(role);
  const { entries } = useGetCollectionsHistory(role, isOpen && !entry);
  const [form, setForm] = useState(() => formFromEntry(entry, thisMonday()));
  const [errors, setErrors] = useState({});
  const isEdit = !!entry?.id;
  const today = toYmd(new Date());

  const findWeek = (week) => entries.find((e) => normalizeWeek(e.week_start) === week) || null;

  useEffect(() => {
    if (!isOpen) return;
    const week = thisMonday();
    setForm(formFromEntry(entry || findWeek(week), week));
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, entry]);

  // picking a week that already has an entry: prefill it, saving updates that week
  const existing = useMemo(
    () => (isEdit ? null : findWeek(form.week_start)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, form.week_start, isEdit]
  );

  const existingId = existing?.id ?? null;
  useEffect(() => {
    if (!existing) return;
    setForm((prev) => formFromEntry(existing, prev.week_start));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingId]);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const rest = { ...prev };
      delete rest[key];
      return rest;
    });
  };

  const pickWeek = (e) => {
    const value = normalizeWeek(e.target.value);
    if (!value) return;
    setErrors((prev) => ({ ...prev, week_start: undefined }));
    // a week without an entry starts blank
    setForm((prev) => (value === prev.week_start ? prev : formFromEntry(null, value)));
  };

  const validate = () => {
    const next = {};
    const balance = form.balance.trim();
    if (balance === "") next.balance = "Enter the balance in collections.";
    else if (!Number.isFinite(Number(balance)) || Number(balance) < 0) next.balance = "The balance must be 0 or more.";
    const families = form.families_count.trim();
    if (families !== "" && !/^\d+$/.test(families)) next.families_count = "Use a whole number of families.";
    if (!isEdit && form.week_start > thisMonday()) next.week_start = "The week cannot be in the future.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPending) return;
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});

    const payload = {
      balance: Number(form.balance),
      families_count: form.families_count.trim() === "" ? null : Number(form.families_count),
      notes: form.notes.trim() || null,
    };
    if (!isEdit) payload.week_start = form.week_start;

    try {
      await saveCollections({ id: isEdit ? entry.id : null, payload });
      onClose();
    } catch (err) {
      setErrors(parseFieldErrors(err));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="collections-modal-title"
          >
            <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
              <div className="min-w-0">
                <h2 id="collections-modal-title" className="text-xl font-bold text-gray-900">Update collections</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {isEdit ? `Week of ${fmtWeek(form.week_start, { year: true })}` : "The balance in collections at the end of the week."}
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer shrink-0">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="px-6 space-y-4">
                {!isEdit && (
                  <div>
                    <label htmlFor="collections-week" className="block text-xs font-semibold text-gray-500 mb-1.5">Week *</label>
                    <input
                      id="collections-week"
                      type="date"
                      value={form.week_start}
                      max={today}
                      onChange={pickWeek}
                      disabled={isPending}
                      className={inputClass(errors.week_start)}
                    />
                    <p className="mt-1 text-[11px] text-gray-400">
                      Week of {fmtWeek(form.week_start, { year: true })}
                      {form.week_start === thisMonday() ? " (this week)" : ""}
                    </p>
                    {existing && (
                      <p className="mt-2 flex items-start gap-1.5 p-2.5 rounded-xl bg-[#1E3A5F]/[0.06] border border-[#1E3A5F]/15 text-[11px] text-[#1E3A5F]">
                        <Info size={12} className="shrink-0 mt-0.5" />
                        This week is already entered. Saving updates it.
                      </p>
                    )}
                    <FieldError message={errors.week_start} />
                  </div>
                )}

                <div>
                  <label htmlFor="collections-balance" className="block text-xs font-semibold text-gray-500 mb-1.5">Balance in collections *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">$</span>
                    <input
                      id="collections-balance"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={form.balance}
                      onChange={set("balance")}
                      placeholder="0.00"
                      disabled={isPending}
                      autoFocus
                      className={`${inputClass(errors.balance)} pl-8 tabular-nums`}
                    />
                  </div>
                  <FieldError message={errors.balance} />
                </div>

                <div>
                  <label htmlFor="collections-families" className="block text-xs font-semibold text-gray-500 mb-1.5">Number of families (optional)</label>
                  <input
                    id="collections-families"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={form.families_count}
                    onChange={set("families_count")}
                    placeholder="e.g. 12"
                    disabled={isPending}
                    className={`${inputClass(errors.families_count)} tabular-nums`}
                  />
                  <FieldError message={errors.families_count} />
                </div>

                <div>
                  <label htmlFor="collections-notes" className="block text-xs font-semibold text-gray-500 mb-1.5">Notes (optional)</label>
                  <textarea
                    id="collections-notes"
                    value={form.notes}
                    onChange={set("notes")}
                    placeholder="e.g. Two families on payment plans"
                    rows={3}
                    disabled={isPending}
                    className={`${inputClass(errors.notes)} resize-none`}
                  />
                  <FieldError message={errors.notes} />
                </div>
              </div>

              <div className="flex gap-3 px-6 pt-6 pb-6">
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1 h-10">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1 h-10 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CollectionsEntryModal;
