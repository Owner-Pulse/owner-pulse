import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  AlertCircle,
  Search,
  X,
  Plus,
  Users,
  Clock,
  CheckCircle,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PTOForm from "@/pages/director-dashboard/staff/components/PTOForm";
import { useGetPtoStaff, useAddPto } from "@/hooks/director-hook/staff.hook";
import { useGetUser } from "@/hooks/auth/user-details.hook";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const PtoPage = () => {
  const { user } = useGetUser();
  const isDirector = user?.role === "director";

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("highest_usage"); // "highest_usage" | "lowest_usage" | "name"
  const [showPtoModal, setShowPtoModal] = useState(false);

  const { data: ptoData, staffList = [], isLoading } = useGetPtoStaff({ per_page: 1000 });
  const { addPto, isPending: isAddingPto } = useAddPto();

  const ptoSummary = ptoData?.summary || ptoData?.pto_summary || {};
  const overallPct = ptoSummary?.overall_pto_percentage ?? 0;
  const totalUsed = ptoSummary?.total_pto_used_days ?? 0;
  const totalAllowance = ptoSummary?.total_pto_allowance_days ?? 0;
  const highUsageCount = ptoSummary?.high_usage_count ?? 0;

  // Process & Sort Staff PTO Records
  const processedStaff = useMemo(() => {
    const list = (Array.isArray(staffList) ? staffList : []).map((s) => {
      const used = Number(s.used_days ?? s.ptoUsed ?? s.used ?? 0);
      const allowance = Number(s.allowance_days ?? s.ptoAllowance ?? s.allowance ?? 10);
      const remaining = Number(s.remaining_days ?? s.remaining ?? (allowance - used));
      const usagePct = s.usage_percentage ?? (allowance > 0 ? Math.round((used / allowance) * 100) : 0);
      const isHighUsage = s.is_warning || usagePct >= 70;

      return {
        ...s,
        used,
        allowance,
        remaining,
        usagePct,
        isHighUsage,
        displayName: s.name || s.employee_name || "Staff Member",
        employeeId: s.employee_id || s.procare_employee_id || s.id || "N/A",
      };
    });

    // Filtering
    let filtered = list;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (s) =>
          s.displayName.toLowerCase().includes(q) ||
          String(s.employeeId).toLowerCase().includes(q)
      );
    }

    // Sorting — Default: Highest Usage First (as per B-03 requirement)
    return filtered.sort((a, b) => {
      if (sortOrder === "highest_usage") {
        return b.usagePct - a.usagePct || b.used - a.used;
      }
      if (sortOrder === "lowest_usage") {
        return a.usagePct - b.usagePct || a.used - b.used;
      }
      if (sortOrder === "name") {
        return a.displayName.localeCompare(b.displayName);
      }
      return 0;
    });
  }, [staffList, search, sortOrder]);

  const handleAddPtoSubmit = async (formData) => {
    await addPto(formData);
    setShowPtoModal(false);
  };

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight flex items-center gap-2.5">
            <Calendar className="text-[#B78A2F]" size={28} /> Paid Time Off (PTO) Balances
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Dedicated per-employee balance tracking — allocated, used, and remaining PTO
          </p>
        </div>

        {isDirector && (
          <Button
            onClick={() => setShowPtoModal(true)}
            className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm"
          >
            <Plus size={16} className="mr-2" /> Log PTO Request
          </Button>
        )}
      </div>

      {/* ── KPI Summary Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center shrink-0">
              <Users size={20} className="text-[#1E3A5F]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Total Staff</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{processedStaff.length}</p>
              <p className="text-[10px] text-gray-400">Active roster</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-purple-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Total Allowance</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{totalAllowance} Days</p>
              <p className="text-[10px] text-gray-400">Allocated across staff</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Calendar size={20} className="text-amber-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">PTO Used YTD</p>
              <p className="text-2xl font-extrabold text-amber-700 mt-0.5">{totalUsed} Days</p>
              <p className="text-[10px] text-gray-400">{overallPct}% of allowance used</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${highUsageCount > 0 ? "bg-red-100" : "bg-emerald-100"}`}>
              <AlertCircle size={20} className={highUsageCount > 0 ? "text-red-600" : "text-emerald-700"} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">High Usage Alert</p>
              <p className={`text-2xl font-extrabold mt-0.5 ${highUsageCount > 0 ? "text-red-600" : "text-emerald-700"}`}>
                {highUsageCount} Staff
              </p>
              <p className="text-[10px] text-gray-400">&ge; 70% PTO consumed</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Main Per-Employee PTO Table / Cards ──────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Filter size={16} className="text-[#1E3A5F]" /> Employee PTO Balance Table
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs text-gray-500">
                  Sorted by highest PTO usage first. Indicates allocated, used, and remaining balance.
                </CardDescription>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search staff name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Sort Order Selector */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setSortOrder("highest_usage")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      sortOrder === "highest_usage" ? "bg-[#1E3A5F] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Highest Usage First
                  </button>
                  <button
                    onClick={() => setSortOrder("lowest_usage")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      sortOrder === "lowest_usage" ? "bg-[#1E3A5F] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Lowest Usage
                  </button>
                  <button
                    onClick={() => setSortOrder("name")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      sortOrder === "name" ? "bg-[#1E3A5F] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Name (A-Z)
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {isLoading ? (
              <div className="py-12 text-center text-sm text-gray-400 space-y-2">
                <div className="w-6 h-6 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading employee PTO balances...</p>
              </div>
            ) : processedStaff.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4 text-center">Allocated PTO</th>
                      <th className="py-3.5 px-4 text-center">Used PTO</th>
                      <th className="py-3.5 px-4 text-center">Remaining Balance</th>
                      <th className="py-3.5 px-4 text-right">Usage Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {processedStaff.map((staff, idx) => {
                      const initials = staff.displayName
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr
                          key={staff.id || idx}
                          className={`hover:bg-gray-50/80 transition-colors ${
                            staff.isHighUsage ? "bg-red-50/40" : ""
                          }`}
                        >
                          {/* Employee Name & ID */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  staff.isHighUsage ? "bg-red-500 text-white" : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {initials}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">{staff.displayName}</span>
                                  {staff.isHighUsage && (
                                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-red-100 text-red-600 uppercase">
                                      High Usage
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-gray-400">ID: {staff.employeeId}</span>
                              </div>
                            </div>
                          </td>

                          {/* Allocated */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                              {staff.allowance} Days
                            </span>
                          </td>

                          {/* Used */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`font-bold px-2.5 py-1 rounded-md ${
                                staff.isHighUsage
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-50 text-amber-800"
                              }`}
                            >
                              {staff.used} Days
                            </span>
                          </td>

                          {/* Remaining */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`font-bold px-2.5 py-1 rounded-md ${
                                staff.remaining <= 2
                                  ? "bg-red-50 text-red-600"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {staff.remaining} Days
                            </span>
                          </td>

                          {/* Usage Progress */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="w-48 ml-auto space-y-1">
                              <div className="flex justify-between text-[11px] font-semibold">
                                <span className={staff.isHighUsage ? "text-red-600" : "text-gray-600"}>
                                  {staff.used} / {staff.allowance} Days
                                </span>
                                <span className={staff.isHighUsage ? "text-red-600 font-bold" : "text-gray-900"}>
                                  {staff.usagePct}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    staff.isHighUsage ? "bg-red-500" : "bg-[#1E3A5F]"
                                  }`}
                                  style={{ width: `${Math.min(staff.usagePct, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-gray-500">
                {search ? `No staff PTO records match "${search}"` : "No PTO staff records found."}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* PTO Log Modal */}
      {showPtoModal && (
        <PTOForm
          onClose={() => setShowPtoModal(false)}
          onSubmit={handleAddPtoSubmit}
          isPending={isAddingPto}
        />
      )}
    </motion.div>
  );
};

export default PtoPage;
