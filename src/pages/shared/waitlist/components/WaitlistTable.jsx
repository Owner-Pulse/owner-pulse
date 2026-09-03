import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Phone, Mail, CheckCircle2, Pencil, Trash2, ChevronRight, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusPill from "./StatusPill";
import SourceTag from "./SourceTag";
import ProgramBadge from "./ProgramBadge";
import { daysSince } from "@/hooks/waitlist/useWaitlistStore";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const SkeletonRow = ({ role }) => (
  <tr className="animate-pulse">
    <td className="py-4 px-4">
      <div className="space-y-1.5">
        <div className="h-3.5 w-32 bg-gray-200 rounded" />
        <div className="h-2.5 w-16 bg-gray-100 rounded" />
      </div>
    </td>
    <td className="py-4 px-4">
      <div className="h-5 w-16 bg-gray-100 rounded-full" />
    </td>
    <td className="py-4 px-4">
      <div className="space-y-1">
        <div className="h-3.5 w-24 bg-gray-200 rounded" />
        <div className="h-2.5 w-28 bg-gray-100 rounded" />
      </div>
    </td>
    <td className="py-4 px-4">
      <div className="h-4.5 w-14 bg-gray-100 rounded" />
    </td>
    <td className="py-4 px-4">
      <div className="space-y-1">
        <div className="h-3 w-40 bg-gray-100 rounded" />
        <div className="h-2.5 w-12 bg-gray-100 rounded" />
      </div>
    </td>
    <td className="py-4 px-4">
      <div className="h-3 w-6 bg-gray-200 rounded" />
    </td>
    {role === "director" && (
      <td className="py-4 px-4 text-right">
        <div className="flex justify-end gap-1.5">
          <div className="h-7 w-20 bg-gray-200 rounded" />
          <div className="h-7 w-6 bg-gray-100 rounded" />
        </div>
      </td>
    )}
  </tr>
);

const WaitlistTable = ({
  entries,
  role,
  onOpenAdd,
  onOpenEdit,
  onOpenTour,
  onOpenApplied,
  onOpenOffer,
  onOpenEnroll,
  onOpenLost,
  onDelete,
  isLoading = false,
}) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Child</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tour Date & Time</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes & History</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Wait Time</th>
                  {role === "director" && (
                    <th className="text-right py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pipeline Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <SkeletonRow key={idx} role={role} />
                  ))
                ) : entries.length > 0 ? (
                  (() => {
                    const activeEntries = entries.filter((w) => w.status?.toLowerCase() !== "lost");
                    const lostEntries = entries.filter((w) => w.status?.toLowerCase() === "lost");

                    const renderRow = (w, isLost = false) => {
                      const waitDays = daysSince(w.addedDate);
                      const statusLower = w.status?.toLowerCase() || "";
                      const isStale = waitDays >= 30 && !["enrolled", "lost"].includes(statusLower);

                      return (
                        <tr
                          key={w.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            isLost ? "bg-red-50/40" : isStale ? "bg-[#AE4A3E]/[0.05]" : ""
                          }`}
                        >
                          {/* Child info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <span className={`font-bold ${isLost ? "line-through text-gray-400" : "text-gray-900"}`}>
                                  {w.childName}
                                </span>
                                <div className="text-[11px] text-gray-400">{w.age}</div>
                              </div>
                              {role === "director" && !isLost && (
                                <button
                                  onClick={() => onOpenEdit(w)}
                                  className="p-1 rounded-md text-gray-400 hover:text-[#1E3A5F] hover:bg-[#1E3A5F]/10 transition-colors"
                                  title="Edit family entry"
                                >
                                  <Pencil size={12} />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Program */}
                          <td className="py-3.5 px-4">
                            <ProgramBadge program={w.program} />
                          </td>

                          {/* Parent */}
                          <td className="py-3.5 px-4">
                            <div>
                              <span className={`font-semibold ${isLost ? "line-through text-gray-400" : "text-gray-900"}`}>
                                {w.parentName}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {w.phone && (
                                  <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                    <Phone size={9} /> {w.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <StatusPill status={w.status} />
                              {isStale && !isLost && (
                                <span className="text-[10px] font-bold text-[#8A362C] bg-[#AE4A3E]/15 px-1.5 py-0.5 rounded">
                                  Needs Follow-Up
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Tour Date & Time */}
                          <td className="py-3.5 px-4 text-xs">
                            {(w.tourDate || w.tour_date) ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 font-semibold text-purple-900 text-xs shrink-0">
                                  <Calendar size={11} className="text-purple-600 shrink-0" />
                                  <span>{fmtDate(w.tourDate || w.tour_date)}</span>
                                </div>
                                {(w.tourTime || w.tour_time) && (
                                  <div className="text-[10px] text-gray-500 font-medium pl-3.5">
                                    ⏰ {w.tourTime || w.tour_time}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>

                          {/* Notes */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className={`text-xs line-clamp-2 ${isLost ? "line-through text-gray-400" : "text-gray-600"}`}>
                              {w.notes || "No notes logged."}
                            </p>
                            <SourceTag source={w.source} />
                          </td>

                          {/* Wait Time */}
                          <td className="py-3.5 px-4 text-xs font-semibold">
                            <span className={isStale && !isLost ? "text-[#8A362C] font-extrabold" : "text-gray-700"}>
                              {waitDays}d
                            </span>
                          </td>

                          {/* Actions for Director */}
                          {role === "director" && (
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {statusLower === "inquiry" && (
                                  <Button
                                    size="sm"
                                    onClick={() => onOpenTour(w)}
                                    className="h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold"
                                  >
                                    Log Tour
                                  </Button>
                                )}

                                {statusLower === "toured" && (
                                  <Button
                                    size="sm"
                                    onClick={() => onOpenApplied(w)}
                                    className="h-7 px-2.5 bg-[#1E3A5F] hover:bg-[#15294A] text-white text-[11px] font-semibold"
                                  >
                                    Move to Applied
                                  </Button>
                                )}

                                {(statusLower === "applied" || statusLower === "offered") && (
                                  <Button
                                    size="sm"
                                    onClick={() => onOpenEnroll(w)}
                                    className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold"
                                  >
                                    Confirm Enroll
                                  </Button>
                                )}

                                {statusLower === "enrolled" && (
                                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                                    <CheckCircle2 size={13} /> Enrolled
                                  </span>
                                )}

                                {!["enrolled", "lost"].includes(statusLower) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onOpenLost(w)}
                                    className="h-7 px-2 text-[11px] text-red-600 hover:bg-red-50 hover:text-red-700"
                                  >
                                    Mark Lost
                                  </Button>
                                )}

                                {onDelete && (
                                  <button
                                    onClick={() => onDelete(w)}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                                    title="Delete family"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    };

                    return (
                      <>
                        {activeEntries.map((w) => renderRow(w, false))}

                        {/* Separate Losses Section Header & Rows */}
                        {lostEntries.length > 0 && (
                          <>
                            <tr className="bg-red-50 border-t-2 border-b border-red-200">
                              <td colSpan={role === "director" ? 8 : 7} className="py-2.5 px-4 text-xs font-bold text-[#8A362C]">
                                <div className="flex items-center gap-2">
                                  <UserX size={15} className="text-[#8A362C]" />
                                  <span>Losses Section ({lostEntries.length} Lost Families)</span>
                                </div>
                              </td>
                            </tr>
                            {lostEntries.map((w) => renderRow(w, true))}
                          </>
                        )}
                      </>
                    );
                  })()
                ) : (
                  <tr>
                    <td colSpan={role === "director" ? 8 : 7}>
                      <div className="py-12 text-center">
                        <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No families match the selected filters.</p>
                        {role === "director" && (
                          <Button onClick={onOpenAdd} className="mt-3 bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs">
                            + Add to Waitlist
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
    </motion.div>
  );
};

export default WaitlistTable;