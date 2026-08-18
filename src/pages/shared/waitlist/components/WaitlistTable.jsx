import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Phone, Mail, CheckCircle2, UserPlus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusPill from "./StatusPill";
import SourceTag from "./SourceTag";
import ProgramBadge from "./ProgramBadge";
import { useChangeDirectorWaitlistStatus } from "@/hooks";
import AddWaitlistModal from "./AddWaitlistModal";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const STATUS_FLOW = ["inquiry", "applied", "toured", "offered", "enrolled"];

const STATUS_LABEL = {
  inquiry: "Inquiry",
  applied: "Applied",
  toured: "Toured",
  offered: "Offered",
  enrolled: "Enrolled",
};
// Color scheme for each "advance to" button
const STATUS_COLORS = {
  applied:  "bg-blue-50 text-blue-700 hover:bg-blue-100",
  toured:   "bg-violet-50 text-violet-700 hover:bg-violet-100",
  offered:  "bg-amber-50 text-amber-700 hover:bg-amber-100",
  enrolled: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
};

// ─── Skeleton row
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="py-3 px-4">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

// ─── Status Action Cell
const StatusAction = ({ entry }) => {
  const { changeStatus, isPending } = useChangeDirectorWaitlistStatus();
  const currentIdx = STATUS_FLOW.indexOf(entry.status);
  const nextStatus = STATUS_FLOW[currentIdx + 1] ?? null;

  if (entry.status === "enrolled") {
    return (
      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 justify-end">
        <CheckCircle2 size={12} /> Enrolled
      </span>
    );
  }

  return (
    <button
      disabled={isPending}
      onClick={() =>
        changeStatus({ id: entry.id, payload: { status: nextStatus } })
      }
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 ${
        STATUS_COLORS[nextStatus] ?? "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {isPending ? (
        <>
          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Updating…
        </>
      ) : (
        <>Move to {STATUS_LABEL[nextStatus]}</>
      )}
    </button>
  );
};

const WaitlistTable = ({ entries, role, isLoading, onShowAdd }) => {
  const [editEntry, setEditEntry] = useState(null);
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Child</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Program</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Parent</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Source</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Added</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Wait</th>
                  {role === "director" && (
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : entries.length > 0 ? (
                  entries.map((w) => {
                    const waitDays = w.wait_time_days ?? 0;
                    const isStale = waitDays >= 30 && w.status !== "enrolled";
                    return (
                      <tr
                        key={w.id}
                        className={`hover:bg-gray-50 transition-colors ${isStale ? "bg-red-50/30" : ""}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{w.child_name}</span>
                            {role === "director" && (
                              <button
                                onClick={() => setEditEntry(w)}
                                className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit entry"
                              >
                                <Pencil size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4"><ProgramBadge program={w.program} /></td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="text-gray-900">{w.parent_name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {w.phone && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                  <Phone size={9} /> {w.phone}
                                </span>
                              )}
                              {w.email && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                  <Mail size={9} /> {w.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4"><StatusPill status={w.status} /></td>
                        <td className="py-3 px-4"><SourceTag source={w.source} /></td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{fmtDate(w.added_date)}</td>
                        <td className={`py-3 px-4 text-xs font-medium ${isStale ? "text-red-600" : waitDays >= 14 ? "text-amber-600" : "text-gray-500"}`}>
                          {waitDays}d
                        </td>
                        {role === "director" && (
                          <td className="py-3 px-4 text-right">
                            <StatusAction entry={w} />
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={role === "director" ? 8 : 7}>
                      <div className="py-12 text-center">
                        <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No families match the current filters.</p>
                        {role === "director" && (
                          <Button variant="outline" className="mt-3 border-gray-200" onClick={onShowAdd}>
                            <UserPlus size={14} className="mr-2" /> Add a Family
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit modal — local to the table */}
      <AddWaitlistModal
        isOpen={Boolean(editEntry)}
        editItem={editEntry}
        onClose={() => setEditEntry(null)}
      />
    </motion.div>
  );
};
export default WaitlistTable;