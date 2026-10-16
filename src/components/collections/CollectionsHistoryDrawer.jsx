import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, History, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCollectionsHistory } from "@/hooks/collections.hook";
import { DIRECTION_META, fmtMoney, fmtSignedMoney, fmtUpdatedAt, fmtWeek } from "@/lib/collections";
import CollectionsEntryModal from "./CollectionsEntryModal";

// change vs the next older row in the list
const RowChange = ({ entry, older }) => {
  if (!older) return null;
  const diff = Number(entry.balance) - Number(older.balance);
  if (!Number.isFinite(diff)) return null;
  const dir = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  const meta = DIRECTION_META[dir];
  const Arrow = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : null;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${meta.bg} ${meta.text}`}>
      {Arrow && <Arrow size={11} />}
      {fmtSignedMoney(diff)}
    </span>
  );
};

const RowSkeleton = () => (
  <div className="p-3 rounded-xl border border-gray-100 animate-pulse">
    <div className="h-3 w-24 bg-gray-100 rounded" />
    <div className="h-5 w-32 bg-gray-100 rounded mt-2" />
    <div className="h-3 w-40 bg-gray-100 rounded mt-2" />
  </div>
);

/**
 * All past Collections weeks, newest first — each row opens the entry modal (PUT).
 */
const CollectionsHistoryDrawer = ({ isOpen, onClose, role }) => {
  const { entries, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetCollectionsHistory(role, isOpen);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="relative h-full w-full sm:max-w-md bg-white shadow-2xl flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="collections-history-title"
            >
              <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
                <div className="min-w-0">
                  <h2 id="collections-history-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <History size={18} className="text-[#1E3A5F]" /> Collections history
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Every week entered, newest first. Tap a week to edit it.</p>
                </div>
                <button type="button" onClick={onClose} aria-label="Close" className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer shrink-0">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-2">
                {isLoading ? (
                  <>
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                  </>
                ) : isError ? (
                  <div className="text-center py-10">
                    <p className="text-sm text-gray-500">Could not load the history.</p>
                    <Button variant="outline" onClick={() => refetch()} className="mt-3 h-9">Try again</Button>
                  </div>
                ) : entries.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-10">No collections entered yet.</p>
                ) : (
                  entries.map((entry, i) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setEditing(entry)}
                      className="group w-full text-left p-3 rounded-xl border border-gray-100 bg-white hover:border-[#1E3A5F]/30 hover:bg-[#1E3A5F]/[0.03] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                            Week of {fmtWeek(entry.week_start, { year: true })}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            <span className="text-lg font-bold text-gray-900 tabular-nums">{fmtMoney(entry.balance)}</span>
                            <RowChange entry={entry} older={entries[i + 1]} />
                          </div>
                        </div>
                        <span className="p-1.5 rounded-lg text-gray-300 group-hover:text-[#1E3A5F] group-hover:bg-[#1E3A5F]/10 transition-colors shrink-0">
                          <Pencil size={14} />
                        </span>
                      </div>
                      {entry.families_count != null && (
                        <p className="text-xs text-gray-600 mt-1">{entry.families_count} {entry.families_count === 1 ? "family" : "families"}</p>
                      )}
                      {entry.notes && <p className="text-xs text-gray-500 mt-1 break-words line-clamp-2">{entry.notes}</p>}
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        {entry.entered_by?.name ? `Entered by ${entry.entered_by.name}` : "Entered"}
                        {fmtUpdatedAt(entry.updated_at) ? ` · ${fmtUpdatedAt(entry.updated_at)}` : ""}
                      </p>
                    </button>
                  ))
                )}

                {hasNextPage && (
                  <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="w-full h-9 mt-2">
                    {isFetchingNextPage ? "Loading..." : "Load older weeks"}
                  </Button>
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                <Button onClick={() => setAdding(true)} className="w-full h-10 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
                  <Plus size={16} className="mr-1.5" /> Enter a week
                </Button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <CollectionsEntryModal isOpen={!!editing} entry={editing} role={role} onClose={() => setEditing(null)} />
      <CollectionsEntryModal isOpen={adding} role={role} onClose={() => setAdding(false)} />
    </>
  );
};

export default CollectionsHistoryDrawer;
