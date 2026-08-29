import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Calendar, Save, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSetBudgetLimit, useGetBudgetLimit } from "@/hooks/owner-hook/budget.hook";
import toast from "react-hot-toast";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const BudgetSettingsCard = () => {
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
        refetch();
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || "Failed to update budget limits.";
        setErrorMsg(msg);
        toast.error(msg);
      },
    });
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign size={18} className="text-[#1E3A5F]" /> Budget Limits & Period Settings
          </CardTitle>
          <CardDescription>
            Declare and manage the financial limits for School, Payroll, and Director discretionary funds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 max-w-2xl py-4 animate-pulse">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
              <div className="h-4 w-40 bg-gray-200 rounded pt-2" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {/* School Budget Limits Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <ShieldCheck size={16} className="text-[#1E3A5F]" />
                <h3 className="text-sm font-bold text-gray-900">School Budget Limits</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Overall School Budget Limit ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      name="school_budget_limit"
                      value={formData.school_budget_limit}
                      onChange={handleChange}
                      placeholder="110000"
                      required
                      className="w-full h-10 pl-8 pr-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Total annual cap for school operations</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Payroll Budget Limit ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      name="payroll_budget_limit"
                      value={formData.payroll_budget_limit}
                      onChange={handleChange}
                      placeholder="2200000.00"
                      required
                      className="w-full h-10 pl-8 pr-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Sub-limit inside overall school budget</p>
                </div>
              </div>
            </div>

            {/* Director Budget Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <UserCheck size={16} className="text-[#1E3A5F]" />
                <h3 className="text-sm font-bold text-gray-900">Director Budget & Period</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Director Budget Limit ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      name="director_budget_limit"
                      value={formData.director_budget_limit}
                      onChange={handleChange}
                      placeholder="9900.00"
                      required
                      className="w-full h-10 pl-8 pr-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Discretionary cap per period</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Period Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="director_budget_start_date"
                      value={formData.director_budget_start_date}
                      onChange={handleChange}
                      required
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">e.g. August 1</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Period End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="director_budget_end_date"
                      value={formData.director_budget_end_date}
                      onChange={handleChange}
                      required
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">e.g. May 31</p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-600 font-medium flex items-center gap-1 p-3 rounded-xl bg-red-50 border border-red-200"
              >
                <AlertTriangle size={14} /> {errorMsg}
              </motion.p>
            )}

            {successMsg && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-emerald-700 font-medium flex items-center gap-1 p-3 rounded-xl bg-emerald-50 border border-emerald-200"
              >
                <CheckCircle2 size={14} /> Budget settings updated successfully!
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#1E3A5F] hover:bg-[#15294A] text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Save size={16} className="mr-2" />
              {isPending ? "Saving Settings..." : "Save Budget Limits"}
            </Button>
          </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BudgetSettingsCard;
