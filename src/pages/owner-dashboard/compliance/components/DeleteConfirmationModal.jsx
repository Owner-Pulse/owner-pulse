import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemTitle = "",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden my-8 border border-gray-100 p-6"
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg disabled:opacity-50"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 text-red-600 mb-4">
            <div className="p-2.5 rounded-full bg-red-50 border border-red-100">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Requirement</h3>
              <p className="text-xs text-gray-500">This action cannot be undone.</p>
            </div>
          </div>

          <p className="text-xs md:text-sm text-gray-600 mb-6">
            Are you sure you want to delete{" "}
            <span className="font-bold text-gray-900">"{itemTitle}"</span> from the compliance registry?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-semibold gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Confirm Delete
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
