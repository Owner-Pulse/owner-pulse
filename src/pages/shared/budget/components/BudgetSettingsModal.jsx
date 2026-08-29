import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, ShieldCheck, UserCheck, Save, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useGetBudgetLimit, useSetBudgetLimit } from "@/hooks/owner-hook/budget.hook";
import toast from "react-hot-toast";

const BudgetSettingsModal = ({ isOpen, onClose, onSuccessRefetch }) => {
  const { data: budgetLimitResponse, isLoading, refetch } = useGetBudgetLimit();
  const { setBudgetLimit, isPending } = useSetBudgetLimit();

  const [formData, setFormData] = useState({
    school_budget_limit: "110000",
    payroll_budget_limit: "2200000.00",
    director_budget_limit: "9900.00",
    director_budget_start_date: "2026-08-01",
    director_budget_end_date: "2027-05-31",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  useEffect(() => {
    const limitObj = budgetLimitResponse?.data || budgetLimitResponse;
    if (limitObj && typeof limitObj === "object") {
      setFormData({
        school_budget_limit: limitObj.school_budget_limit ?? "110000",
        payroll_budget_limit: limitObj.payroll_budget_limit ?? "2200000.00",
        director_budget_limit: limitObj.director_budget_limit ?? "9900.00",
        director_budget_start_date: limitObj.director_budget_start_date ?? "2026-08-01",
        director_budget_end_date: limitObj.director_budget_end_date ?? "2027-05-31",
      });
    }
  }, [budgetLimitResponse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg(false);

    const schoolBudget = parseFloat(formData.school_budget_limit);
    const payrollBudget = parseFloat(formData.payroll_budget_limit);
    const directorBudget = parseFloat(formData.director_budget_limit);

    if (isNaN(schoolBudget) || schoolBudget < 0) {
      setErrorMsg("Please enter a valid school budget limit.");
      return;
    }
    if (isNaN(payrollBudget) || payrollBudget < 0) {
      setErrorMsg("Please enter a valid payroll budget limit.");
      return;
    }
    if (isNaN(directorBudget) || directorBudget < 0) {
      setErrorMsg("Please enter a valid director budget limit.");
      return;
    }
    if (!formData.director_budget_start_date || !formData.director_budget_end_date) {
      setErrorMsg("Please provide both start and end dates for director budget period.");
      return;
    }

    const payload = {
      school_budget_limit: schoolBudget,
      payroll_budget_limit: payrollBudget,
      director_budget_limit: directorBudget,
      director_budget_start_date: formData.director_budget_start_date,
      director_budget_end_date: formData.director_budget_end_date,
    };

    setBudgetLimit(payload, {
      onSuccess: (res) => {
        setSuccessMsg(true);
        toast.success(res?.message || "Budget limits saved successfully!");
        if (onSuccessRefetch) onSuccessRefetch();
        setTimeout(() => {
          setSuccessMsg(false);
          onClose();
        }, 600);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || "Failed to update budget limits.";
        setErrorMsg(msg);
        toast.error(msg);
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F]">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Budget Settings</h2>
                  <p className="text-xs text-gray-500">Declare financial limits & period dates for school and directors</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 overflow-y-auto flex-1 space-y-5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
                  <Loader2 className="w-7 h-7 animate-spin text-[#1E3A5F]" />
                  <p className="text-xs font-medium">Fetching current budget limits...</p>
                </div>
              ) : (
                <form id="budget-settings-form" onSubmit={handleSubmit} className="space-y-5">
                  {/* School Budget Limits Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                      <ShieldCheck size={16} className="text-[#1E3A5F]" />
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">School Budget Limits</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Overall School Budget Limit ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                          <input
                            type="number"
                            step="0.01"
                            name="school_budget_limit"
                            value={formData.school_budget_limit}
                            onChange={handleChange}
                            placeholder="110000"
                            required
                            className="w-full h-10 pl-7 pr-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">Total annual cap for school operations</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Payroll Budget Limit ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                          <input
                            type="number"
                            step="0.01"
                            name="payroll_budget_limit"
                            value={formData.payroll_budget_limit}
                            onChange={handleChange}
                            placeholder="2200000.00"
                            required
                            className="w-full h-10 pl-7 pr-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">Sub-limit inside overall budget</p>
                      </div>
                    </div>
                  </div>

                  {/* Director Budget Section */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                      <UserCheck size={16} className="text-[#1E3A5F]" />
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Director Budget & Period</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Director Limit ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                          <input
                            type="number"
                            step="0.01"
                            name="director_budget_limit"
                            value={formData.director_budget_limit}
                            onChange={handleChange}
                            placeholder="9900.00"
                            required
                            className="w-full h-10 pl-7 pr-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">Discretionary cap</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="director_budget_start_date"
                          value={formData.director_budget_start_date}
                          onChange={handleChange}
                          required
                          className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Period start</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="director_budget_end_date"
                          value={formData.director_budget_end_date}
                          onChange={handleChange}
                          required
                          className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Period end</p>
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600 font-medium">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 size={14} className="shrink-0" />
                      <span>Budget settings updated successfully!</span>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-gray-100 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="budget-settings-form"
                disabled={isPending || isLoading}
                className="flex-1 h-10 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#15294A] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Save size={16} />
                {isPending ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BudgetSettingsModal;
