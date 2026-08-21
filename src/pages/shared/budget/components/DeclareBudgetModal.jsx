import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const DeclareBudgetModal = ({ isOpen, onClose, categories, onSave, title, subtitle }) => {
  const [localCategories, setLocalCategories] = useState([]);

  useEffect(() => {
    if (categories) {
      setLocalCategories(categories.map(c => ({ ...c })));
    }
  }, [categories, isOpen]);

  const handleChange = (index, value) => {
    const numericVal = parseFloat(value) || 0;
    setLocalCategories(prev => {
      const updated = [...prev];
      updated[index].budget = numericVal;
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(localCategories);
    onClose();
  };

  const totalBudget = localCategories.reduce((acc, curr) => acc + (curr.budget || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{title || "Declare Budget"}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{subtitle || "Set the allocated limits for each category"}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {localCategories.map((cat, idx) => (
                    <div key={cat.name} className="flex flex-col space-y-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-700">{cat.name}</span>
                        {cat.spent !== undefined && (
                          <span className="text-[10px] text-gray-500 font-medium">
                            Spent YTD: ${Math.round(cat.spent).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                        <input
                          type="number"
                          value={cat.budget || ""}
                          onChange={(e) => handleChange(idx, e.target.value)}
                          placeholder="0.00"
                          className="w-full h-10 pl-7 pr-3 rounded-xl border border-gray-250 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">Total Allocated</p>
                    <p className="text-base font-bold text-[#1E3A5F]">${Math.round(totalBudget).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl flex items-center gap-1">
                      <Save size={15} /> Save Budget
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeclareBudgetModal;
