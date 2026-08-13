import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  itemName = "",
  confirmText = "Delete",
  isLoading = false,
}) => {
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setDeleteInput("");
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (deleteInput === confirmText) {
      await onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete <span className="font-semibold text-gray-700">"{itemName}"</span>? This action cannot be undone.
              </p>
              
              <div className="w-full mb-6 text-left">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Type "<strong>{confirmText}</strong>" to confirm
                </label>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                  placeholder={confirmText}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-10"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 rounded-xl h-10 text-white transition-colors ${
                    deleteInput === confirmText && !isLoading
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-red-300 cursor-not-allowed"
                  }`}
                  onClick={handleConfirm}
                  disabled={isLoading || deleteInput !== confirmText}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
