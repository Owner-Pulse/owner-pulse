import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Building2, CheckCircle2, X, Activity, UserCheck, Clock, MessageSquare, ClipboardList, ShieldAlert, Wrench, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetDirectorActivity } from "@/hooks/owner-hook/create-director.hook";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const ACTIVITY_ICONS = {
  task_comment: { icon: MessageSquare, bg: "bg-blue-50 text-blue-600" },
  task: { icon: ClipboardList, bg: "bg-emerald-50 text-emerald-600" },
  incident: { icon: ShieldAlert, bg: "bg-red-50 text-red-600" },
  maintenance: { icon: Wrench, bg: "bg-amber-50 text-amber-600" },
  waitlist: { icon: Calendar, bg: "bg-indigo-50 text-indigo-600" },
  default: { icon: Activity, bg: "bg-gray-50 text-gray-600" },
};

const DirectorDetailModal = ({ director, isLoading, onClose, onUpdateStatus }) => {
  const [modalTab, setModalTab] = useState("overview"); // "overview" | "activities"
  const [period, setPeriod] = useState("all");

  const directorId = director?.id;
  const { activities, isLoading: isActivityLoading } = useGetDirectorActivity(
    directorId,
    period
  );

  if (!director) return null;
  const name = director?.name || "Unknown";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const isActive = director?.status === "active";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#1E3A5F] to-[#2A4C7E] text-white relative shrink-0">
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                {director?.avatar ? (
                  <img
                    src={director.avatar}
                    alt={name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold border border-white/10 shadow-xs">
                    {initials}
                  </div>
                )}
                <div
                  className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 border-2 border-white rounded-full ${
                    director?.is_online ? "bg-[#3E7A54]" : "bg-gray-400"
                  }`}
                  title={director?.is_online ? "Online" : "Offline"}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold capitalize">{name}</h2>
                <p className="text-sm text-white/80 capitalize">
                  {director?.roles?.length > 0
                    ? director.roles.map((r) => r.name).join(", ")
                    : director?.role || "Director"}
                </p>
                <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  {isActive ? "Active" : "Pending Invitation"}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Inner Modal Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => setModalTab("overview")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                modalTab === "overview" ? "bg-white text-[#1E3A5F]" : "text-white/80 hover:bg-white/10"
              }`}
            >
              Overview & Details
            </button>
            <button
              onClick={() => setModalTab("activities")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                modalTab === "activities" ? "bg-white text-[#1E3A5F]" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Activity size={13} /> Activity Audit Log ({activities.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {modalTab === "overview" ? (
            <>
              {/* Contact Info */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{director?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{director?.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {director.bio && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{director.bio}</p>
                </div>
              )}

              {/* Activity Stats */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity Overview</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-gray-900">{formatDate(director?.created_at || new Date())}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Since Joined</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center flex flex-col justify-center">
                    <p className="text-lg font-bold text-gray-900">{activities.length}</p>
                    <p className="text-[10px] text-gray-400">Audit Logs</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center flex flex-col justify-center">
                    <p className="text-lg font-bold text-gray-900">{director?.tasksCompleted || 0}</p>
                    <p className="text-[10px] text-gray-400">Tasks Done</p>
                  </div>
                </div>
              </div>

              {/* Account details */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Account Details</p>
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Account Created</span>
                    <span className="font-medium text-gray-900">{formatDate(director?.created_at || new Date())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${isActive ? "text-[#2F6042]" : "text-[#8F6A1F]"}`}>
                      {isActive ? "Active" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Activities Audit Log View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Recent Audit Feed</p>
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-[10px]">
                  {["all", "7_days", "30_days"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-2 py-0.5 rounded font-bold capitalize cursor-pointer ${
                        period === p ? "bg-[#1E3A5F] text-white" : "text-gray-600"
                      }`}
                    >
                      {p.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {isActivityLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <Loader2 size={24} className="animate-spin text-[#1E3A5F]" />
                  <p className="text-xs text-gray-400">Loading audit feed...</p>
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-2.5">
                  {activities.map((act, idx) => {
                    const cfg = ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.default;
                    const IconComp = cfg.icon;
                    return (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${cfg.bg}`}>
                          <IconComp size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="text-xs font-bold text-gray-900 truncate">{act.title}</h5>
                            <span className="text-[9px] text-gray-400 shrink-0">{act.display_date}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{act.description}</p>
                          <p className="text-[9px] text-gray-400 mt-1">{act.timestamp ? new Date(act.timestamp).toLocaleString() : ""}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-400">
                  No activity log entries found for this director.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          {director.status === "pending" && (
            <Button
              className="flex-1 bg-[#3E7A54] hover:bg-[#2F6042] text-white"
              onClick={() => onUpdateStatus(director.id, "active")}
            >
              <CheckCircle2 size={14} className="mr-2" /> Activate Account
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DirectorDetailModal;
