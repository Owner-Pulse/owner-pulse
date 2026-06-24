import React from "react";
import { motion } from "framer-motion";
import { Calendar, Phone, Mail, CheckCircle2, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusPill from "./StatusPill";
import SourceTag from "./SourceTag";
import ProgramBadge from "./ProgramBadge";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const STATUS_FLOW = ["inquiry", "applied", "toured", "offered", "enrolled"];

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const WaitlistTable = ({ entries, role, onAdvanceStatus, onShowAdd }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-0">
          {entries.length > 0 ? (
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
                    {role === "director" && <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {entries.map((w) => {
                    const waitDays = Math.floor((new Date("2026-05-11") - new Date(w.dateAdded)) / 86400000);
                    const isStale = waitDays >= 30 && w.status !== "enrolled";
                    return (
                      <tr key={w.id} className={`hover:bg-gray-50 transition-colors ${isStale ? "bg-red-50/30" : ""}`}>
                        <td className="py-3 px-4 font-medium text-gray-900">{w.child}</td>
                        <td className="py-3 px-4"><ProgramBadge program={w.program} /></td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="text-gray-900">{w.parent}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {w.phone && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Phone size={9} /> {w.phone}</span>}
                              {w.email && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Mail size={9} /> {w.email}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4"><StatusPill status={w.status} /></td>
                        <td className="py-3 px-4"><SourceTag source={w.source} /></td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{fmtDate(w.dateAdded)}</td>
                        <td className={`py-3 px-4 text-xs font-medium ${isStale ? "text-red-600" : waitDays >= 14 ? "text-amber-600" : "text-gray-500"}`}>{waitDays}d</td>
                        {role === "director" && (
                          <td className="py-3 px-4 text-right">
                            {w.status !== "enrolled" ? (
                              <button
                                onClick={() => onAdvanceStatus(w.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                {STATUS_FLOW[STATUS_FLOW.indexOf(w.status) + 1]
                                  ? `Move to ${STATUS_FLOW[STATUS_FLOW.indexOf(w.status) + 1]}`
                                  : "Reset"}
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                                <CheckCircle2 size={12} /> Enrolled
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No families match the current filters.</p>
              {role === "director" && (
                <Button variant="outline" className="mt-3 border-gray-200" onClick={onShowAdd}>
                  <UserPlus size={14} className="mr-2" /> Add a Family
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WaitlistTable;
