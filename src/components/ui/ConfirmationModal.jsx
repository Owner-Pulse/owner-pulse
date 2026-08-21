import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // 'danger' | 'warning' | 'info' | 'success'
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle size={24} className="text-red-600" />;
      case "warning":
        return <AlertTriangle size={24} className="text-amber-600" />;
      case "success":
        return <CheckCircle size={24} className="text-emerald-600" />;
      case "info":
      default:
        return <Info size={24} className="text-blue-600" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case "danger":
        return "bg-red-50";
      case "warning":
        return "bg-amber-50";
      case "success":
        return "bg-emerald-50";
      case "info":
      default:
        return "bg-blue-50";
    }
  };

  const getConfirmBtnClass = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white";
      case "info":
      default:
        return "bg-[#1E3A5F] hover:bg-[#15294A] text-white";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100"
          >
            <div className="p-6 flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${getIconBg()}`}>
                {getIcon()}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                {message}
              </p>
              
              <div className="flex items-center gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-10 text-xs border-slate-200 text-gray-550 hover:bg-slate-50"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                <Button
                  className={`flex-1 rounded-xl h-10 text-xs font-bold ${getConfirmBtnClass()}`}
                  onClick={onConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
