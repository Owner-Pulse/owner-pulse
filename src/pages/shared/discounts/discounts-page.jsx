import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Percent,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Calendar,
  ShieldCheck,
  Building,
  Loader2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useGetUser } from "@/hooks/auth/user-details.hook";
import {
  useGetDiscounts,
  useGetDiscountCategories,
  useGetDiscountAnalytics,
  useDeleteDiscountStudent,
  useDeleteDiscountCategory,
} from "@/hooks/discount.hook";

// Modals
import AddDiscountStudentModal from "./components/AddDiscountStudentModal";
import ApproveDiscountModal from "./components/ApproveDiscountModal";
import RejectDiscountModal from "./components/RejectDiscountModal";
import CategoryManageModal from "./components/CategoryManageModal";
import DiscountDetailsModal from "./components/DiscountDetailsModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import DiscountsSkeleton from "./components/DiscountsSkeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const DiscountsPage = () => {
  const { user } = useGetUser();
  const isOwner = user?.role === "owner";
  const isDirector = user?.role === "director";

  // Data queries
  const {
    summary,
    applications = [],
    isLoading: isDiscountsLoading,
    isFetching: isDiscountsFetching,
    refetch: refetchDiscounts,
  } = useGetDiscounts({ isOwner });

  const {
    categories = [],
    isLoading: isCatsLoading,
    refetch: refetchCats,
  } = useGetDiscountCategories({ isOwner });

  const {
    analytics = {},
    revenueImpact = {},
    categoryAnalytics = [],
    isLoading: isAnalyticsLoading,
  } = useGetDiscountAnalytics();

  // Mutations for deletion
  const { deleteDiscountStudent, isPending: isDeletingDiscount } = useDeleteDiscountStudent({ isOwner });
  const { deleteCategory, isPending: isDeletingCategory } = useDeleteDiscountCategory();

  // Active View Tab
  // Options: "applications" | "pending_queue" | "categories" | "analytics"
  const [activeTab, setActiveTab] = useState("applications");

  // Filters (Discounts)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | approved | rejected
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); // all | discount | waiver

  // Filters (Categories)
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [categoryTypeFilter, setCategoryTypeFilter] = useState("all"); // all | discount | waiver
  const [categoryStatusFilter, setCategoryStatusFilter] = useState("all"); // all | active | inactive

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [approvingApplication, setApprovingApplication] = useState(null);
  const [rejectingApplication, setRejectingApplication] = useState(null);
  const [viewingDiscount, setViewingDiscount] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Delete modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    type: null, // "discount" | "category"
    item: null,
  });

  // Filtered categories list
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (categoryTypeFilter !== "all" && cat.type !== categoryTypeFilter) {
        return false;
      }
      if (categoryStatusFilter === "active" && cat.is_active === false) {
        return false;
      }
      if (categoryStatusFilter === "inactive" && cat.is_active !== false) {
        return false;
      }
      if (categorySearchQuery.trim()) {
        const q = categorySearchQuery.toLowerCase().trim();
        const name = (cat.name || "").toLowerCase();
        const desc = (cat.description || "").toLowerCase();
        if (!name.includes(q) && !desc.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [categories, categorySearchQuery, categoryTypeFilter, categoryStatusFilter]);

  // Filtered applications list
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Pending Queue tab overrides status filter
      if (activeTab === "pending_queue" && app.status !== "pending") {
        return false;
      }

      // Status filter
      if (activeTab !== "pending_queue" && statusFilter !== "all" && app.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && String(app.category_id) !== String(categoryFilter)) {
        return false;
      }

      // Type filter (discount vs waiver)
      if (typeFilter !== "all") {
        const catType = app.category?.type || (app.discount_mode === "full_waiver" ? "waiver" : "discount");
        if (catType !== typeFilter) return false;
      }

      // Search query (student name, classroom name, procare ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const student = (app.student_name || "").toLowerCase();
        const classroom = (app.classroom_name || app.classroom?.name || "").toLowerCase();
        const procare = String(app.procare_child_id || "");
        const category = (app.category?.name || "").toLowerCase();
        if (!student.includes(q) && !classroom.includes(q) && !procare.includes(q) && !category.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [applications, activeTab, statusFilter, categoryFilter, typeFilter, searchQuery]);

  // Handle delete execution
  const handleConfirmDelete = async () => {
    if (!deleteModalState.item) return;

    try {
      if (deleteModalState.type === "discount") {
        await deleteDiscountStudent(deleteModalState.item.id);
      } else if (deleteModalState.type === "category") {
        await deleteCategory(deleteModalState.item.id);
      }
      setDeleteModalState({ isOpen: false, type: null, item: null });
    } catch (err) {
      // Handled by toast in hook
    }
  };

  if (isDiscountsLoading && isCatsLoading) {
    return <DiscountsSkeleton />;
  }

  const pendingCount = summary.pending || 0;
  const totalApproved = summary.approved || 0;
  const weeklyApproved = summary.formatted_approved_weekly || `$${(summary.approved_weekly_total || 0).toFixed(2)}/wk`;
  const monthlyApproved = summary.formatted_approved_monthly || `$${(summary.approved_monthly_total || 0).toFixed(2)}/mo`;
  const annualApproved = summary.formatted_approved_annual || `$${(summary.approved_annual_total || 0).toFixed(2)}`;

  return (
    <motion.div className="space-y-4 sm:space-y-6 pb-12" variants={containerVariants} initial="hidden" animate="show">
      {/* ─── Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2 sm:gap-2.5">
              {isOwner ? "Tuition Discounts & Waivers" : "Tuition Discounts"}
              {isDiscountsFetching && <Loader2 size={18} className="animate-spin text-[#1E3A5F]" />}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            {isOwner
              ? `${summary.total || 0} applications on record · ${summary.approved || 0} active recipients · ${annualApproved} annual impact`
              : `${summary.total || 0} discount applications submitted · ${pendingCount} awaiting owner decision`}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => {
              refetchDiscounts();
              refetchCats();
            }}
            title="Refresh records"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          >
            <RefreshCw size={16} className={isDiscountsFetching ? "animate-spin" : ""} />
          </button>

          {isOwner && (
            <>
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap ${activeTab === "categories"
                    ? "bg-[#B78A2F]/15 text-[#8F6A1F] border border-[#B78A2F]/40 font-bold"
                    : "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                title="View, edit, or delete discount categories"
              >
                <Layers size={15} className="text-[#B78A2F] shrink-0" />
                <span>Manage Categories</span>
                <span className="px-1.5 py-0.2 rounded-full bg-gray-100 text-[10px] font-bold text-gray-700">
                  {categories.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="px-3 sm:px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
                title="Create a new discount category"
              >
                <Plus size={15} className="text-amber-700 shrink-0" />
                <span>Add Category</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              setEditingDiscount(null);
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-initial justify-center px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#152A45] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus size={16} className="shrink-0" />
            <span>{isOwner ? "Add Discount Record" : "Request Student Discount"}</span>
          </button>
        </div>
      </div>

      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {isDirector ? (
          <>
            <motion.div variants={itemVariants} className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">Total Applications</span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Tag size={16} />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1.5 sm:mt-2 truncate" title={String(summary.total || 0)}>{summary.total || 0}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">Submitted for authorization</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">Pending Review</span>
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${pendingCount > 0 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500"
                    }`}
                >
                  <Clock size={16} />
                </div>
              </div>
              <p className={`text-lg sm:text-2xl font-bold mt-1.5 sm:mt-2 truncate ${pendingCount > 0 ? "text-amber-700" : "text-gray-900"}`} title={String(pendingCount)}>
                {pendingCount}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">Awaiting Owner verification</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">Approved Discounts</span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1.5 sm:mt-2 truncate" title={String(totalApproved)}>{totalApproved}</p>
              <p className="text-[10px] sm:text-xs text-emerald-700 font-medium mt-0.5 sm:mt-1 truncate">{weeklyApproved} authorized</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">Monthly Relief</span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center shrink-0">
                  <DollarSign size={16} />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1.5 sm:mt-2 truncate" title={monthlyApproved}>{monthlyApproved}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{annualApproved} across school year</p>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div variants={itemVariants} className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">Recipients</span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center shrink-0">
                  <Users size={16} />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1.5 sm:mt-2 truncate" title={String(analytics.students_count !== undefined ? analytics.students_count : totalApproved)}>
                {analytics.students_count !== undefined ? analytics.students_count : totalApproved}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">
                {analytics.student_percentage ? `${analytics.student_percentage}% of total enrollment` : `${totalApproved} active students`}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">Pending Decisions</span>
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${pendingCount > 0 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500"
                    }`}
                >
                  <Clock size={16} />
                </div>
              </div>
              <p className={`text-lg sm:text-2xl font-bold mt-1.5 sm:mt-2 truncate ${pendingCount > 0 ? "text-amber-700" : "text-gray-900"}`} title={String(pendingCount)}>
                {pendingCount}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">
                {pendingCount > 0 ? "Requires your approval" : "All requests resolved"}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">Weekly Giveaway</span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <DollarSign size={16} />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1.5 sm:mt-2 truncate" title={analytics.formatted_weekly_amount || weeklyApproved}>
                {analytics.formatted_weekly_amount || weeklyApproved}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">
                {analytics.formatted_monthly_amount || monthlyApproved} monthly
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">Annual Revenue Impact</span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#AE4A3E]/10 text-[#8A362C] flex items-center justify-center shrink-0">
                  <TrendingDown size={16} />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-[#8A362C] mt-1.5 sm:mt-2 truncate" title={analytics.formatted_annualized_amount || annualApproved}>
                {analytics.formatted_annualized_amount || annualApproved}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">Across 10-month school year</p>
            </motion.div>
          </>
        )}
      </div>

      {/* ─── Owner Revenue Impact Callout Banner ─── */}
      {isOwner && revenueImpact?.amount > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-[#1E3A5F]/5 via-amber-500/5 to-transparent border border-[#1E3A5F]/15 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4"
        >
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1E3A5F] text-white flex items-center justify-center shrink-0 shadow-sm">
              <DollarSign size={18} className="sm:size-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                Annual Revenue Impact: {revenueImpact.formatted_impact || `$${Math.round(revenueImpact.amount).toLocaleString()}`}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5 leading-relaxed">
                {revenueImpact.message ||
                  `Tuition discounts given away across ${revenueImpact.school_weeks || 43} weeks (${revenueImpact.school_months || 10}-month academic schedule).`}
              </p>
            </div>
          </div>

          {/* Quick category badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full md:w-auto">
            {categoryAnalytics.slice(0, 3).map((cat) => (
              <span
                key={cat.category_id}
                className="px-2 sm:px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] sm:text-xs font-medium text-gray-700 shadow-2xs"
              >
                <strong>{cat.category}:</strong> {cat.formatted_amount || cat.formatted_monthly_amount} ({cat.students_count} st.)
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Navigation Tabs & Filters ─── */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100 space-y-3.5 sm:space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          {/* Main Tabs Strip with Smooth Horizontal Scroll on Mobile */}
          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar -mx-1 px-1 py-0.5">
            <div className="inline-flex items-center gap-1 sm:gap-1.5 p-1 bg-gray-100/80 rounded-xl text-xs font-semibold shrink-0">
              <button
                onClick={() => setActiveTab("applications")}
                className={`px-3 sm:px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === "applications"
                    ? "bg-white text-[#1E3A5F] shadow-sm font-bold"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Tag size={14} className="shrink-0" />
                <span>{isOwner ? "Discounts & Waivers" : "All Applications"}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-gray-200/70 text-[10px]">
                  {applications.length}
                </span>
              </button>

              {isOwner && (
                <button
                  onClick={() => setActiveTab("pending_queue")}
                  className={`px-3 sm:px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === "pending_queue"
                      ? "bg-white text-[#1E3A5F] shadow-sm font-bold"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <Clock size={14} className="shrink-0" />
                  <span>Pending Review</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveTab("categories")}
                className={`px-3 sm:px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === "categories"
                    ? "bg-white text-[#1E3A5F] shadow-sm font-bold"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Layers size={14} className="shrink-0" />
                <span>{isOwner ? "Manage Categories" : "Policy Categories"}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-gray-200/70 text-[10px]">
                  {categories.length}
                </span>
              </button>

              {isOwner && (
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-3 sm:px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === "analytics"
                      ? "bg-white text-[#1E3A5F] shadow-sm font-bold"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <TrendingDown size={14} className="shrink-0" />
                  <span>Revenue Analytics</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick status pill filter for applications tab */}
          {activeTab === "applications" && (
            <div className="w-full lg:w-auto overflow-x-auto no-scrollbar py-0.5">
              <div className="inline-flex items-center gap-1 text-xs shrink-0">
                <span className="text-[11px] font-medium text-gray-400 mr-1 hidden sm:inline">Status:</span>
                {["all", "pending", "approved", "rejected"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg capitalize transition-colors font-medium whitespace-nowrap text-xs ${statusFilter === st
                        ? "bg-[#1E3A5F] text-white shadow-2xs"
                        : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters bar for tables */}
        {(activeTab === "applications" || activeTab === "pending_queue") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search size={15} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, classroom, or procare ID..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 text-gray-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-1 rounded-full"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 text-gray-800 font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setActiveTab("categories")}
                  className="text-[11px] text-[#B78A2F] hover:text-[#8F6A1F] font-semibold flex items-center gap-1 mt-1 transition-colors"
                >
                  <Layers size={11} /> Manage categories ({categories.length}) →
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 text-gray-800 font-medium"
              >
                <option value="all">All Types</option>
                <option value="discount">Tuition Discount</option>
                <option value="waiver">Hardship / Waiver</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ─── TAB 1 & 2: Applications & Pending Queue ─── */}
      {(activeTab === "applications" || activeTab === "pending_queue") && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="p-8 sm:p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Tag size={24} />
              </div>
              <h3 className="text-base font-bold text-gray-800">No discount records found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                  ? "Try clearing your filters or changing your search terms."
                  : activeTab === "pending_queue"
                    ? "There are currently no discount applications waiting for Owner authorization."
                    : "Get started by submitting a student tuition assistance application."}
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#1E3A5F] text-white text-xs font-semibold shadow-sm inline-flex items-center gap-2 mt-2"
              >
                <Plus size={15} />
                {isOwner ? "Add Record" : "Apply Student"}
              </button>
            </div>
          ) : (
            <>
              {/* ── Mobile Cards View (< md) ── */}
              <div className="block md:hidden divide-y divide-gray-100">
                {filteredApplications.map((app) => {
                  const status = app.status || "pending";
                  const categoryName = app.category?.name || "Tuition Discount";
                  const isWaiver = app.category?.type === "waiver" || app.discount_mode === "full_waiver";
                  const studentInitials = (app.student_name || "ST")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div key={app.id} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                      {/* Top: Avatar, Student info & Status */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center font-bold text-xs shrink-0">
                            {studentInitials}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{app.student_name}</h4>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                              <Building size={11} className="text-gray-400 shrink-0" />
                              <span className="truncate">{app.classroom_name || app.classroom?.name || "Unassigned"}</span>
                              {app.procare_child_id && <span className="shrink-0">· #{app.procare_child_id}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {status === "approved" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 size={12} />
                              Approved
                            </span>
                          )}
                          {status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              <Clock size={12} />
                              Pending
                            </span>
                          )}
                          {status === "rejected" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              <XCircle size={12} />
                              Declined
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Key details grid */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Policy</span>
                          <span className="font-semibold text-gray-900 block truncate mt-0.5">{categoryName}</span>
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold mt-0.5 ${
                              isWaiver ? "bg-purple-100 text-purple-800" : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {isWaiver ? "Waiver" : "Discount"}
                            {app.discount_percentage ? ` · ${app.discount_percentage}%` : ""}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Tuition Break</span>
                          <span className="font-bold text-gray-900 block mt-0.5">
                            {app.formatted_weekly_amount || `$${app.weekly_amount}/wk`}
                          </span>
                          <span className="text-[11px] text-gray-500 block">
                            {app.formatted_monthly_amount || `$${app.monthly_amount}/mo`}
                          </span>
                        </div>

                        <div className="col-span-2 pt-1.5 border-t border-gray-200/50 flex items-center justify-between text-[11px] text-gray-500">
                          <span>Academic: <strong className="text-gray-700">{app.academic_year || "2025-2026"}</strong></span>
                          <span>{app.school_weeks || 43} wks / {app.school_months || 10} mos</span>
                        </div>
                      </div>

                      {/* Action Row */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        {/* Owner Quick Decision buttons if pending */}
                        {isOwner && status === "pending" ? (
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              onClick={() => setApprovingApplication(app)}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all"
                            >
                              <CheckCircle2 size={13} />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingApplication(app)}
                              className="flex-1 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 active:scale-95 rounded-xl font-semibold text-xs transition-all text-center"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-gray-400">ID #{app.id}</div>
                        )}

                        {/* Details, Edit, Delete icon buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewingDiscount(app)}
                            title="View Application Details"
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95 rounded-lg border border-gray-200/60 transition-all"
                          >
                            <Eye size={15} />
                          </button>

                          {(status === "pending" || isOwner) && (
                            <button
                              onClick={() => {
                                setEditingDiscount(app);
                                setIsAddModalOpen(true);
                              }}
                              title="Edit Application"
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95 rounded-lg border border-gray-200/60 transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}

                          {(status === "pending" || isOwner) && (
                            <button
                              onClick={() =>
                                setDeleteModalState({
                                  isOpen: true,
                                  type: "discount",
                                  item: app,
                                })
                              }
                              title="Delete Record"
                              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 rounded-lg border border-gray-200/60 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Desktop Table View (≥ md) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[760px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">Student & Classroom</th>
                      <th className="py-3.5 px-4">Category & Type</th>
                      <th className="py-3.5 px-4">Tuition Break Rate</th>
                      <th className="py-3.5 px-4">Academic Year</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {filteredApplications.map((app) => {
                      const status = app.status || "pending";
                      const categoryName = app.category?.name || "Tuition Discount";
                      const isWaiver = app.category?.type === "waiver" || app.discount_mode === "full_waiver";
                      const studentInitials = (app.student_name || "ST")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={app.id} className="hover:bg-gray-50/60 transition-colors">
                          {/* Student info */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center font-bold text-xs shrink-0">
                                {studentInitials}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 block">{app.student_name}</span>
                                <span className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                                  <Building size={11} className="text-gray-400" />
                                  {app.classroom_name || app.classroom?.name || "Unassigned"}
                                  {app.procare_child_id && <span>· ID #{app.procare_child_id}</span>}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-semibold text-gray-900 block">{categoryName}</span>
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${isWaiver ? "bg-purple-100 text-purple-800" : "bg-blue-50 text-blue-700"
                                  }`}
                              >
                                {isWaiver ? "Hardship Waiver" : "Discount"}
                                {app.discount_percentage ? ` · ${app.discount_percentage}%` : ""}
                              </span>
                            </div>
                          </td>

                          {/* Rate */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-gray-900 block">
                              {app.formatted_weekly_amount || `$${app.weekly_amount}/wk`}
                            </span>
                            <span className="text-[11px] text-gray-500 block">
                              {app.formatted_monthly_amount || `$${app.monthly_amount}/mo`}
                            </span>
                          </td>

                          {/* Academic Year */}
                          <td className="py-3.5 px-4 text-gray-600">
                            <span className="font-medium text-gray-800 block">{app.academic_year || "2025-2026"}</span>
                            <span className="text-[11px] text-gray-400">
                              {app.school_weeks || 43} wks / {app.school_months || 10} mos
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {status === "approved" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 size={13} />
                                Approved
                              </span>
                            )}
                            {status === "pending" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                <Clock size={13} />
                                Pending Review
                              </span>
                            )}
                            {status === "rejected" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                                <XCircle size={13} />
                                Declined
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Owner quick decision actions if pending */}
                              {isOwner && status === "pending" && (
                                <>
                                  <button
                                    onClick={() => setApprovingApplication(app)}
                                    title="Approve Discount"
                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1 transition-colors"
                                  >
                                    <CheckCircle2 size={13} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => setRejectingApplication(app)}
                                    title="Decline Discount"
                                    className="px-2.5 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg font-semibold text-xs transition-colors"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}

                              {/* View details */}
                              <button
                                onClick={() => setViewingDiscount(app)}
                                title="View Application Details"
                                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Eye size={16} />
                              </button>

                              {/* Edit (if pending or owner) */}
                              {(status === "pending" || isOwner) && (
                                <button
                                  onClick={() => {
                                    setEditingDiscount(app);
                                    setIsAddModalOpen(true);
                                  }}
                                  title="Edit Application"
                                  className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Edit2 size={15} />
                                </button>
                              )}

                              {/* Delete */}
                              {(status === "pending" || isOwner) && (
                                <button
                                  onClick={() =>
                                    setDeleteModalState({
                                      isOpen: true,
                                      type: "discount",
                                      item: app,
                                    })
                                  }
                                  title="Delete Record"
                                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── TAB 3: Discount Categories Management / Reference ─── */}
      {activeTab === "categories" && (
        <div className="space-y-3.5 sm:space-y-4">
          {/* Owner Info & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#B78A2F]/10 flex items-center justify-center text-[#8F6A1F] shrink-0">
                <Layers size={18} className="sm:size-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {isOwner ? "Tuition Discount & Waiver Categories" : "Tuition Policy Categories"}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {isOwner
                    ? "Create, update weekly rates, toggle active status, or delete discount categories."
                    : "Reference guidelines for tuition assistance policies approved by school ownership."}
                </p>
              </div>
            </div>

            {isOwner && (
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#152A45] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Plus size={16} />
                Create New Category
              </button>
            )}
          </div>

          {/* Quick Metrics Bar for Categories */}
          {isOwner && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider block truncate">Total Policies</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5 block truncate">{categories.length}</span>
              </div>
              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider block truncate">Active Policies</span>
                <span className="text-lg sm:text-xl font-bold text-emerald-700 mt-0.5 block truncate">
                  {categories.filter((c) => c.is_active !== false).length}
                </span>
              </div>
              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider block truncate">Hardship Waivers</span>
                <span className="text-lg sm:text-xl font-bold text-purple-700 mt-0.5 block truncate">
                  {categories.filter((c) => c.type === "waiver").length}
                </span>
              </div>
              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider block truncate">Beneficiaries</span>
                <span className="text-lg sm:text-xl font-bold text-[#1E3A5F] mt-0.5 block truncate">
                  {summary.approved || 0} students
                </span>
              </div>
            </div>
          )}

          {/* Search & Filter Bar for Categories */}
          <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="relative flex-1 min-w-0">
              <Search size={15} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="Search categories by name or description..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 text-gray-800"
              />
              {categorySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCategorySearchQuery("")}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 p-1 rounded-full"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs flex-wrap sm:flex-nowrap">
              <select
                value={categoryTypeFilter}
                onChange={(e) => setCategoryTypeFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
              >
                <option value="all">All Policy Types</option>
                <option value="discount">Tuition Discounts</option>
                <option value="waiver">Hardship Waivers</option>
              </select>

              <select
                value={categoryStatusFilter}
                onChange={(e) => setCategoryStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Categories Display */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredCategories.length === 0 ? (
              <div className="p-8 sm:p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <Layers size={24} />
                </div>
                <h3 className="text-base font-bold text-gray-800">No categories match your criteria</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {categorySearchQuery || categoryTypeFilter !== "all" || categoryStatusFilter !== "all"
                    ? "Try resetting your search or status filters."
                    : "No discount categories have been set up yet."}
                </p>
                {isOwner && (
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setIsCategoryModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1E3A5F] text-white text-xs font-semibold shadow-sm inline-flex items-center gap-2 mt-2"
                  >
                    <Plus size={15} />
                    Create First Category
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* ── Mobile Cards View (< md) ── */}
                <div className="block md:hidden divide-y divide-gray-100">
                  {filteredCategories.map((cat) => (
                    <div key={cat.id} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{cat.name}</h4>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                            {cat.description || "No policy description specified."}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            cat.is_active !== false
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.is_active !== false ? "bg-emerald-500" : "bg-gray-400"}`} />
                          {cat.is_active !== false ? "Active" : "Disabled"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Policy</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize inline-block mt-0.5 ${
                              cat.type === "waiver" ? "bg-purple-100 text-purple-800" : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {cat.type === "waiver" ? "Waiver" : "Discount"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Rate</span>
                          <span className="font-semibold text-gray-900 block mt-0.5">
                            {cat.formatted_weekly_amount || `$${cat.weekly_amount}/wk`}
                          </span>
                          {cat.discount_percentage > 0 && (
                            <span className="text-[10px] text-gray-500 font-normal">({cat.discount_percentage}%)</span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Recipients</span>
                          <span className="inline-flex items-center gap-1 font-bold text-gray-800 mt-0.5">
                            <Users size={11} className="text-gray-500" />
                            {cat.active_students_count !== undefined ? cat.active_students_count : "—"}
                          </span>
                        </div>
                      </div>

                      {isOwner && (
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="text-xs">
                            <span className="text-gray-400 text-[11px] mr-1">Annual:</span>
                            <span className="font-bold text-[#8A362C]">
                              {cat.formatted_total_annual_discounts ||
                                cat.formatted_total_weekly_discounts ||
                                `$${cat.total_weekly_discounts || 0}/wk`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingCategory(cat);
                                setIsCategoryModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E3A5F] border border-blue-200/70 font-semibold text-xs flex items-center gap-1 transition-colors"
                            >
                              <Edit2 size={12} />
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                setDeleteModalState({
                                  isOpen: true,
                                  type: "category",
                                  item: cat,
                                })
                              }
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 font-semibold text-xs flex items-center gap-1 transition-colors"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── Desktop Table View (≥ md) ── */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4 sm:px-6">Category Details</th>
                        <th className="py-3.5 px-4">Policy Type</th>
                        <th className="py-3.5 px-4">Standard Rate / %</th>
                        <th className="py-3.5 px-4">Monthly Rate</th>
                        <th className="py-3.5 px-4">Active Recipients</th>
                        {isOwner && <th className="py-3.5 px-4">Total Impact</th>}
                        <th className="py-3.5 px-4">Status</th>
                        {isOwner && <th className="py-3.5 px-4 sm:px-6 text-right">Management Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredCategories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4 sm:px-6">
                            <div>
                              <span className="font-bold text-gray-900 block text-sm">{cat.name}</span>
                              <span className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                {cat.description || "No policy description specified."}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize inline-block ${cat.type === "waiver" ? "bg-purple-100 text-purple-800 border border-purple-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}
                            >
                              {cat.type === "waiver" ? "Hardship Waiver" : "Tuition Discount"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-gray-900">
                            {cat.formatted_weekly_amount || `$${cat.weekly_amount}/wk`}
                            {cat.discount_percentage > 0 && (
                              <span className="text-[11px] text-gray-500 ml-1 font-normal">({cat.discount_percentage}%)</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-gray-600">
                            {cat.formatted_monthly_amount || `$${cat.monthly_amount}/mo`}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 font-bold text-gray-800">
                              <Users size={12} className="text-gray-500" />
                              {cat.active_students_count !== undefined ? cat.active_students_count : "—"}
                            </span>
                          </td>

                          {isOwner && (
                            <td className="py-3.5 px-4 font-semibold text-[#8A362C]">
                              {cat.formatted_total_annual_discounts ||
                                cat.formatted_total_weekly_discounts ||
                                `$${cat.total_weekly_discounts || 0}/wk`}
                            </td>
                          )}

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${cat.is_active !== false
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-gray-100 text-gray-500 border border-gray-200"
                                }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${cat.is_active !== false ? "bg-emerald-500" : "bg-gray-400"}`} />
                              {cat.is_active !== false ? "Active" : "Disabled"}
                            </span>
                          </td>

                          {isOwner && (
                            <td className="py-3.5 px-4 sm:px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingCategory(cat);
                                    setIsCategoryModalOpen(true);
                                  }}
                                  title="Edit Category policy, amounts, and status"
                                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E3A5F] border border-blue-200/70 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                                >
                                  <Edit2 size={13} />
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteModalState({
                                      isOpen: true,
                                      type: "category",
                                      item: cat,
                                    })
                                  }
                                  title="Permanently delete category"
                                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                                >
                                  <Trash2 size={13} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: Owner Revenue Analytics ─── */}
      {isOwner && activeTab === "analytics" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {categoryAnalytics.map((c) => (
              <div
                key={c.category_id}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block truncate">
                      {c.type === "waiver" ? "Hardship Waiver" : "Discount Category"}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 mt-0.5 truncate">{c.category}</h4>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1">
                    <Users size={12} /> {c.students_count} students
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-500 text-[11px] block">Weekly Relief</span>
                    <span className="font-bold text-gray-900">
                      {c.formatted_weekly_amount || `$${c.weekly_amount}/wk`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px] block">Monthly Rate</span>
                    <span className="font-bold text-gray-900">
                      {c.formatted_monthly_amount || c.formatted_amount || `$${c.monthly_amount}/mo`}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/15">
                  <span className="text-[10px] sm:text-[11px] text-gray-600 block">Annualized Revenue Impact</span>
                  <span className="text-sm sm:text-base font-bold text-[#8A362C]">
                    {c.formatted_annualized_amount || `$${c.annualized_amount}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MODALS ─── */}

      {/* Add / Edit Student Discount Modal */}
      <AddDiscountStudentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingDiscount(null);
        }}
        isOwner={isOwner}
        editingDiscount={editingDiscount}
      />

      {/* Approve Application Modal (Owner) */}
      <ApproveDiscountModal
        isOpen={!!approvingApplication}
        onClose={() => setApprovingApplication(null)}
        application={approvingApplication}
      />

      {/* Reject Application Modal (Owner) */}
      <RejectDiscountModal
        isOpen={!!rejectingApplication}
        onClose={() => setRejectingApplication(null)}
        application={rejectingApplication}
      />

      {/* Create / Edit Category Modal (Owner) */}
      <CategoryManageModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
      />

      {/* Full Discount Details Modal */}
      <DiscountDetailsModal
        isOpen={!!viewingDiscount}
        onClose={() => setViewingDiscount(null)}
        discount={viewingDiscount}
        discountId={viewingDiscount?.id}
        isOwner={isOwner}
        onApprove={(disc) => setApprovingApplication(disc)}
        onReject={(disc) => setRejectingApplication(disc)}
        onEdit={(disc) => {
          setEditingDiscount(disc);
          setIsAddModalOpen(true);
        }}
        onDelete={(disc) =>
          setDeleteModalState({
            isOpen: true,
            type: "discount",
            item: disc,
          })
        }
      />

      {/* Deletion Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, type: null, item: null })}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingDiscount || isDeletingCategory}
        title={
          deleteModalState.type === "discount"
            ? "Delete Tuition Discount Record"
            : "Delete Discount Category"
        }
        message={
          deleteModalState.type === "discount"
            ? `Are you sure you want to delete the tuition discount for ${deleteModalState.item?.student_name || "this student"
            }? This action cannot be undone.`
            : `Are you sure you want to delete the category "${deleteModalState.item?.name || ""
            }"? Any historical discounts will remain recorded.`
        }
      />
    </motion.div>
  );
};

export default DiscountsPage;
