import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Building2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const DirectorDetailModal = ({ director, onClose, onUpdateStatus }) => {
  if (!director) return null;
  const initials = director.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const isActive = director.status === "active";
  const daysSinceJoined = Math.abs(Math.ceil((new Date("2026-05-11") - new Date(director.created)) / 86400000));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 ${isActive ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-amber-400 to-amber-500"} text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold">{director.name}</h2>
                <p className="text-sm text-white/80">{director.role}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-white/30 text-white"
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
                  <p className="text-sm font-medium text-gray-900">{director.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{director.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Building2 size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm font-medium text-gray-900">{director.department}</p>
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
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{daysSinceJoined}d</p>
                <p className="text-[10px] text-gray-400">Since Joined</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{director.tasksCompleted}</p>
                <p className="text-[10px] text-gray-400">Tasks Done</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{director.logEntries}</p>
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
                <span className="font-medium text-gray-900">{formatDate(director.created)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Login</span>
                <span className="font-medium text-gray-900">
                  {director.lastLogin ? formatDate(director.lastLogin) : "Never"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${isActive ? "text-emerald-600" : "text-amber-600"}`}>
                  {isActive ? "Active" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
            {director.status === "pending" && (
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onUpdateStatus(director.id, "active")}>
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
