import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Building2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const DirectorDetailModal = ({ director, isLoading, onClose, onUpdateStatus }) => {
  console.log("director", director)
  if (!director) return null;
  const name = director?.name || "Unknown";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const isActive = director?.status === "active";
  const daysSinceJoined = Math.abs(Math.ceil((new Date("2026-05-11") - new Date(director?.created_at || new Date().toISOString())) / 86400000));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-[#1E3A5F] to-[#2A4C7E] text-white relative overflow-hidden">
          {/* Subtle overlay effect */}
          <div className="absolute inset-0 bg-white/5 opacity-50" />
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
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold border border-white/10 shadow-sm">
                    {initials}
                  </div>
                )}
                {/* Online indicator */}
                <div className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 border-2 border-white/50 rounded-full ${director?.is_online ? 'bg-[#3E7A54]' : 'bg-gray-400'}`} title={director?.is_online ? "Online" : "Offline"} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold capitalize">{name}</h2>
                </div>
                <p className="text-sm text-white/80 capitalize">
                  {director?.roles?.length > 0 
                    ? director.roles.map(r => r.name).join(", ") 
                    : (director?.role || "Director")}
                </p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-white/30 text-white"
                  }`}>
                  {isActive ? "Active" : "Pending Invitation"}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
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
                <p className="text-lg font-bold text-gray-900">{director?.tasksCompleted || 0}</p>
                <p className="text-[10px] text-gray-400">Tasks Done</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center flex flex-col justify-center">
                <p className="text-lg font-bold text-gray-900">{director?.logEntries || 0}</p>
                <p className="text-[10px] text-gray-400">Log Entries</p>
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
                <span className="text-gray-500">Last Login</span>
                <span className="font-medium text-gray-900">
                  {director?.last_activity_at ? formatDate(director.last_activity_at) : "Never"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${isActive ? "text-[#2F6042]" : "text-[#8F6A1F]"}`}>
                  {isActive ? "Active" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Balance</span>
                <span className="font-medium text-gray-900">${director?.balance?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
            {director.status === "pending" && (
              <Button className="flex-1 bg-[#3E7A54] hover:bg-[#2F6042] text-white" onClick={() => onUpdateStatus(director.id, "active")}>
                <CheckCircle2 size={14} className="mr-2" /> Activate Account
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DirectorDetailModal;
