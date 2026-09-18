import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Calendar,
  RefreshCw,
  Building2,
  ClipboardList,
  MessageSquare,
  Edit,
  Trash2,
  UserCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { daysUntil, daysSince } from "@/hooks/compliance/useCompliance";
import StatusPill from "@/pages/owner-dashboard/compliance/components/StatusPill";
import CategoryTag from "@/pages/owner-dashboard/compliance/components/CategoryTag";
import RoleBadge from "@/pages/owner-dashboard/compliance/components/RoleBadge";
import { itemVariants, clamp } from "./variants";

const DirectorComplianceCard = ({
  item,
  completingId,
  isCompleting,
  togglingChecklistId,
  isToggling,
  onEdit,
  onDelete,
  onComplete,
  onLog,
  onToggleChecklist,
}) => {
  const d = item.is_completed
    ? 0
    : item.status === "expired"
    ? (item.days_overdue ?? daysSince(item.expires))
    : (item.days_left ?? daysUntil(item.expires));

  const isExpired =
    !item.is_completed &&
    (item.status === "expired" || (item.days_left !== undefined && item.days_left <= 0));
  const isUrgent = !item.is_completed && !isExpired && d <= 30;

  let computedTimePct = 100;
  if (item.is_completed) {
    computedTimePct = 100;
  } else if (item.time_progress_percentage !== undefined && item.time_progress_percentage !== null) {
    computedTimePct = Math.min(100, Math.max(0, Math.round(item.time_progress_percentage)));
  } else if (isExpired) {
    computedTimePct = 100;
  } else {
    computedTimePct = Math.min(100, Math.max(0, Math.round((d / 60) * 100)));
  }
  const pct = clamp(computedTimePct, 0, 100);

  return (
    <motion.div variants={itemVariants}>
      <Card
        className={`bg-white border-none shadow-sm hover:shadow-md transition-shadow border-l-4 ${
          item.is_completed
            ? "border-l-[#3E7A54]"
            : isExpired
            ? "border-l-[#AE4A3E]"
            : isUrgent
            ? "border-l-[#B78A2F]"
            : "border-l-[#1E3A5F]"
        }`}
      >
        <CardContent className="p-4 md:p-5">
          {/* ── Top Row: Title + Actions ── */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{item.item}</h3>
                <CategoryTag category={item.category} />
                <RoleBadge role={item.ownerRole} />
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={12} className="text-[#1E3A5F]/40 shrink-0" />
                <span className="text-xs text-gray-500">{item.authority}</span>
              </div>
              {item.is_completed && item.completed_at && (
                <div className="mt-1 text-[11px] text-[#3E7A54] font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Completed on{" "}
                  {new Date(item.completed_at).toLocaleDateString()}
                </div>
              )}
              {item.notes && (
                <div className="mt-1 text-[11px] text-gray-500 italic">{item.notes}</div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <StatusPill
                status={item.status}
                statusColor={item.status_color}
                statusBadge={item.status_badge}
              />
              <div className="flex items-center gap-1 flex-wrap justify-end">
                {(isExpired || isUrgent || item.is_completed) && (
                  <Button
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="h-7 px-2.5 text-[11px] font-bold bg-[#B78A2F] hover:bg-[#8F6A1F] text-white cursor-pointer"
                  >
                    <RefreshCw size={12} className="mr-1" /> Renew
                  </Button>
                )}
                {item.is_completed ? (
                  <span className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] font-bold bg-[#3E7A54]/15 text-[#2F6042] rounded-md border border-[#3E7A54]/30">
                    <CheckCircle2 size={12} /> Completed
                  </span>
                ) : (
                  <Button
                    size="sm"
                    disabled={completingId === item.id || isCompleting}
                    onClick={() => onComplete(item)}
                    className="h-7 px-2.5 text-[11px] font-bold bg-[#3E7A54] hover:bg-[#2F6042] text-white cursor-pointer disabled:opacity-60 transition-all flex items-center gap-1"
                  >
                    {completingId === item.id ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={12} /> Mark Complete
                      </>
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onLog(item)}
                  className="h-7 px-2 text-[11px] text-[#1E3A5F] hover:bg-[#1E3A5F]/10 cursor-pointer"
                >
                  <MessageSquare size={12} className="mr-1" /> Log Action
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(item)}
                  className="h-7 px-2 text-[11px] text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <Edit size={12} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(item)}
                  className="h-7 px-2 text-[11px] text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          </div>

          {/* ── Expiration Progress Bar ── */}
          <div className="mt-4 pt-1 border-t border-gray-100/70">
            <div className="flex items-center justify-between text-xs mb-2 gap-2 flex-wrap">
              <span className="text-gray-500 font-semibold flex items-center gap-1">
                <Calendar size={12} className="text-[#1E3A5F]" /> Expires {item.expires}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black tracking-tight px-2 py-0.5 rounded-full ${
                    isExpired
                      ? "bg-[#AE4A3E]/10 text-[#8A362C]"
                      : isUrgent
                      ? "bg-[#B78A2F]/10 text-[#8F6A1F]"
                      : "bg-[#3E7A54]/10 text-[#2F6042]"
                  }`}
                >
                  {isExpired ? "100% Expired" : `${pct}% Time Remaining`}
                </span>
                <span
                  className={`font-bold ${
                    isExpired ? "text-[#8A362C]" : isUrgent ? "text-[#8F6A1F]" : "text-gray-600"
                  }`}
                >
                  {item.status_badge || (isExpired ? `${d}d overdue` : `${d} days left`)}
                </span>
              </div>
            </div>

            <div className="relative h-3 bg-gray-100 ring-1 ring-inset ring-gray-200/80 rounded-full my-1">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out ${
                  isExpired
                    ? "bg-gradient-to-r from-red-600 to-[#AE4A3E]"
                    : isUrgent
                    ? "bg-gradient-to-r from-[#B78A2F] to-[#AE4A3E]"
                    : "bg-gradient-to-r from-[#3E7A54] via-[#5B7FA6] to-[#1E3A5F]"
                }`}
                style={{ width: `${isExpired ? 100 : clamp(pct, 2, 100)}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-[left] duration-700 ease-out"
                style={{ left: `${isExpired ? 97 : clamp(pct, 3, 97)}%` }}
              >
                <img
                  src="/world.png"
                  alt="World"
                  className="w-6 h-6 rounded-full object-cover shadow-md ring-2 ring-white"
                />
              </div>
            </div>
          </div>

          {/* ── Document Checklist ── */}
          {item.docChecklist && item.docChecklist.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-[#1E3A5F]/[0.04] border border-[#1E3A5F]/15">
              <p className="text-[10px] font-bold text-[#1E3A5F] uppercase tracking-wider mb-2 flex items-center gap-1">
                <ClipboardList size={12} /> Pre-Inspection Document Checklist
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {item.docChecklist.map((docObj, idx) => {
                  const docText = typeof docObj === "string" ? docObj : docObj.text;
                  const isChecked = typeof docObj === "string" ? true : !!docObj.checked;
                  const isThisToggling = docObj && docObj.id && togglingChecklistId === docObj.id;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isThisToggling || isToggling}
                      onClick={() => onToggleChecklist(item.id, docObj)}
                      className={`flex items-center gap-2 text-[11px] p-1.5 rounded text-left transition-colors ${
                        isChecked
                          ? "bg-white text-emerald-800 font-medium shadow-2xs border border-emerald-200"
                          : "bg-white/60 text-gray-600 hover:bg-white border border-gray-100"
                      } disabled:opacity-60 cursor-pointer`}
                    >
                      {isThisToggling ? (
                        <Loader2 size={14} className="animate-spin text-[#1E3A5F] shrink-0" />
                      ) : (
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isChecked
                              ? "bg-emerald-600 text-white"
                              : "border border-gray-300 bg-white"
                          }`}
                        >
                          {isChecked && "✓"}
                        </span>
                      )}
                      <span className="truncate">{docText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Latest Log ── */}
          {item.logs && item.logs.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <UserCheck size={12} className="text-[#1E3A5F]" /> Latest Log: {item.logs[0].text}
              </span>
              <span className="text-[10px] text-gray-400">
                {item.logs[0].date} ({item.logs[0].author})
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DirectorComplianceCard;
