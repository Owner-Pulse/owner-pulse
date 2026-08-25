import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Send, Clock, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const LogActionModal = ({ isOpen, onClose, item, onAddLog, userRole = "Director", isLoading = false }) => {
  const [logText, setLogText] = useState("");

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!logText.trim()) return;
    await onAddLog(item.id, logText.trim(), userRole === "owner" ? "Owner" : "Director");
    setLogText("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden my-8 border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#1E3A5F] text-white">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-[#9DB8D9]" />
              <h2 className="text-base font-bold truncate">Log Progress: {item.item}</h2>
            </div>
            <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Item Quick Info */}
            <div className="p-3 rounded-lg bg-[#1E3A5F]/[0.04] border border-[#1E3A5F]/10">
              <p className="text-xs font-semibold text-gray-900">{item.item}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Authority: {item.authority} · Expiration: {item.expires}
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Log Renewal Activity / Operational Note
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={
                    userRole === "owner"
                      ? "e.g. Approved vendor quote for insurance renewal."
                      : "e.g. Contacted inspector for appointment; scheduled for May 20."
                  }
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white p-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs">
                  {isLoading ? (
                    <>
                      <Loader2 size={12} className="mr-1.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={12} className="mr-1.5" /> Submit Log
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* History Logs Timeline */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-[#1E3A5F]" /> Activity Log History
              </p>

              {item.logs && item.logs.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {item.logs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                        <span className="font-bold text-[#1E3A5F] flex items-center gap-1">
                          <UserCheck size={10} /> {log.author}
                        </span>
                        <span>{log.date}</span>
                      </div>
                      <p className="text-gray-700 text-xs">{log.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 italic text-center py-3">No activity logged yet.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LogActionModal;
