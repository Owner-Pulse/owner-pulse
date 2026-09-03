import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, ArrowUpRight, MessageSquare, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const TasksCard = ({ data, onNavigate }) => {
  const fromOwner = data?.from_owner || [];
  const escalatedToOwner = data?.escalated_to_owner || [];
  const directorOwned = data?.director_owned || [];

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList size={16} className="text-[#1E3A5F]" />
              Task &amp; Maintenance Operations Hub
            </CardTitle>
            <span
              className="text-xs font-semibold text-[#1E3A5F] cursor-pointer hover:underline"
              onClick={() => onNavigate("/director/tasks")}
            >
              View all tasks →
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEFT COLUMN: Open Items Director Owns / Follows (Navy Blue Theme) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#1E3A5F]/[0.04] to-[#1E3A5F]/[0.01] border border-[#1E3A5F]/15 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E3A5F]/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A5F]" />
                  <span className="text-xs font-extrabold text-[#1E3A5F] uppercase tracking-wider">
                    Director Owned &amp; Followed Items
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#1E3A5F] bg-[#1E3A5F]/10 px-2 py-0.5 rounded-full">
                  {directorOwned.length + (fromOwner.length > 0 ? fromOwner.length : 0)} items
                </span>
              </div>

              <div className="space-y-2">
                {directorOwned.length > 0 ? (
                  directorOwned.map((t, idx) => (
                    <div key={t.id || idx} className="p-2.5 rounded-xl bg-white border border-[#1E3A5F]/10 shadow-2xs flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 size={13} className="text-[#1E3A5F] shrink-0" />
                        <p className="text-xs font-semibold text-gray-900 truncate">{t.title}</p>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium shrink-0 ml-1">{t.priority || "Normal"}</span>
                    </div>
                  ))
                ) : fromOwner.length > 0 ? (
                  fromOwner.map((t, idx) => (
                    <div key={t.id || idx} className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-2xs flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[8px] font-extrabold text-[#1E3A5F] bg-[#1E3A5F]/10 px-1.5 py-0.5 rounded uppercase shrink-0">
                          DIRECTOR ACTION
                        </span>
                        <p className="text-xs font-semibold text-gray-900 truncate" title={t.title}>{t.title}</p>
                      </div>
                      <span className="text-[9px] font-bold text-[#1E3A5F] shrink-0 ml-1">Active</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic py-3 text-center">No open items currently owned by Director.</p>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Items Assigned to / Handled by Owner (Gold/Amber Theme) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#B78A2F]/[0.06] to-[#B78A2F]/[0.01] border border-[#B78A2F]/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#B78A2F]/15">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B78A2F]" />
                  <span className="text-xs font-extrabold text-[#8F6A1F] uppercase tracking-wider">
                    Owner Assigned &amp; Comments
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#8F6A1F] bg-[#B78A2F]/15 px-2 py-0.5 rounded-full">
                  {escalatedToOwner.length} items
                </span>
              </div>

              <div className="space-y-2">
                {escalatedToOwner.length > 0 ? (
                  escalatedToOwner.map((t, idx) => (
                    <div key={t.id || idx} className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ArrowUpRight size={12} className="text-[#8F6A1F] shrink-0" />
                          <p className="text-xs font-bold text-gray-900 truncate">{t.title}</p>
                        </div>
                        <span className="text-[9px] font-bold text-[#8F6A1F] bg-[#B78A2F]/15 px-1.5 py-0.5 rounded shrink-0 ml-1">
                          Owner Review
                        </span>
                      </div>
                      {t.owner_comment && (
                        <div className="flex items-start gap-1 text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded-md">
                          <MessageSquare size={10} className="text-[#8F6A1F] shrink-0 mt-0.5" />
                          <span className="italic">Owner: "{t.owner_comment}"</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-white border border-amber-100 text-center">
                    <p className="text-xs font-medium text-gray-700">No items currently awaiting Owner comments.</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Escalated items will display here with Owner feedback.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TasksCard;
