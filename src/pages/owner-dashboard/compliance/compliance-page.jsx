import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  FileText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import OverviewCard from "./components/OverviewCard";
import UrgencyTimelineCard from "./components/UrgencyTimelineCard";
import FilterBar from "./components/FilterBar";
import ComplianceItemCard from "./components/ComplianceItemCard";
import InsuranceShoppingCard from "./components/InsuranceShoppingCard";

// ─── Data ─────────────────────────────────────────────────────────

// TODO: Backend wiring — replace hardcoded data with API response
// Data model: each item carries ownerRole flag for role-based emphasis
const COMPLIANCE_ITEMS = [
  {
    id: 1,
    item: "DCF Annual Renewal",
    authority: "FL DCF",
    status: "compliant",
    expires: "2026-11-18",
    category: "regulatory",
    ownerRole: "director",
    docChecklist: [
      "Current liability insurance certificate",
      "Staff background screening results",
      "CPR/First Aid certificates on file",
      "Fire inspection report (current year)",
      "Health department inspection report (current year)",
    ],
  },
  {
    id: 2,
    item: "Quarterly DCF Inspections",
    authority: "FL DCF",
    status: "expiring",
    expires: "2026-06-01",
    category: "regulatory",
    ownerRole: "director",
    recurring: true,
  },
  {
    id: 3,
    item: "AUP (Step Up Audit)",
    authority: "Step Up FL",
    status: "expiring",
    expires: "2026-10-01",
    category: "regulatory",
    ownerRole: "owner",
    notes: "Start working April. Monthly reminders April through October.",
  },
  {
    id: 4,
    item: "Annual Survey (Step Up)",
    authority: "Step Up FL",
    status: "compliant",
    expires: "2026-12-01",
    category: "regulatory",
    ownerRole: "owner",
  },
  {
    id: 5,
    item: "Compliance Certificate (DOE)",
    authority: "FL Dept. of Education",
    status: "compliant",
    expires: "2027-02-01",
    category: "regulatory",
    ownerRole: "owner",
  },
  {
    id: 6,
    item: "NWEA Test Score Submission (K–8)",
    authority: "NWEA",
    status: "compliant",
    expires: "2026-08-01",
    category: "regulatory",
    ownerRole: "director",
  },
  {
    id: 7,
    item: "SR Contract",
    authority: "ELC",
    status: "expiring",
    expires: "2026-07-01",
    category: "regulatory",
    ownerRole: "director",
  },
  {
    id: 8,
    item: "VPK Contract",
    authority: "ELC",
    status: "expiring",
    expires: "2026-07-01",
    category: "regulatory",
    ownerRole: "director",
  },
  {
    id: 9,
    item: "Fire Inspection",
    authority: "County Fire",
    status: "compliant",
    expires: "2027-01-01",
    category: "regulatory",
    ownerRole: "director",
    notes: "Heads up needed",
  },
  {
    id: 10,
    item: "Health Dept. Inspection",
    authority: "FL DOH",
    status: "compliant",
    expires: "2027-01-01",
    category: "regulatory",
    ownerRole: "director",
    notes: "Heads up needed",
  },
  {
    id: 11,
    item: "Insurance (consolidated)",
    authority: "Multiple carriers",
    status: "expiring",
    expires: "2026-11-18",
    category: "regulatory",
    ownerRole: "owner",
    shopReminder: "2026-09-19",
    notes: "All policies in one item. 60-day shop reminder Sept 19.",
  },
  {
    id: 12,
    item: "Background Checks (Staff)",
    authority: "FL DCF",
    status: "expiring",
    expires: "2026-06-15",
    category: "regulatory",
    ownerRole: "director",
    notes: "Per-person rolling. Each staff member tracked individually.",
  },
  {
    id: 13,
    item: "Scoliosis Assessment",
    authority: "FL State Requirement",
    status: "compliant",
    expires: "2027-03-01",
    category: "regulatory",
    ownerRole: "director",
  },
  {
    id: 14,
    item: "CPR / First Aid (faculty)",
    authority: "Red Cross",
    status: "expired",
    expires: "2026-04-12",
    category: "regulatory",
    ownerRole: "director",
    notes: "Rolling renewal per staff member.",
  },
];

const TODAY = new Date("2026-05-11");
const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - TODAY) / 86400000);

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── Main Component ───────────────────────────────────────────────

const CompliancePage = () => {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => {
    const compliant = COMPLIANCE_ITEMS.filter((c) => c.status === "compliant").length;
    const expiring = COMPLIANCE_ITEMS.filter((c) => c.status === "expiring").length;
    const expired = COMPLIANCE_ITEMS.filter((c) => c.status === "expired").length;
    const nextDeadline = COMPLIANCE_ITEMS
      .filter((c) => c.status !== "compliant")
      .map((c) => daysUntil(c.expires))
      .sort((a, b) => a - b)[0] || 0;
    return { compliant, expiring, expired, total: COMPLIANCE_ITEMS.length, nextDeadline };
  }, []);

  const complianceScore = Math.round((stats.compliant / stats.total) * 100);

  const filtered = useMemo(() => {
    return COMPLIANCE_ITEMS.filter((c) => {
      if (categoryFilter !== "all" && c.ownerRole !== categoryFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      return true;
    });
  }, [categoryFilter, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const urgencyA = a.status === "expired" ? -999 : daysUntil(a.expires);
      const urgencyB = b.status === "expired" ? -999 : daysUntil(b.expires);
      return urgencyA - urgencyB;
    });
  }, [filtered]);

  const ownerCount = COMPLIANCE_ITEMS.filter((c) => c.ownerRole === "owner").length;
  const directorCount = COMPLIANCE_ITEMS.filter((c) => c.ownerRole === "director").length;

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
              Compliance
            </h1>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-xs font-semibold border whitespace-nowrap ${
              complianceScore >= 80
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : complianceScore >= 50
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-red-50 text-red-700 border-red-200"
            }`}>
              {complianceScore}%
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {stats.compliant}/{stats.total} compliant ·{" "}
            {stats.expiring + stats.expired > 0 ? (
              <span className="text-red-500 font-medium">
                {stats.expiring + stats.expired} need attention
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">all clear</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" className="bg-white text-xs md:text-sm px-2.5 md:px-3">
            <FileText size={14} className="mr-1.5" /> Reports
          </Button>
          <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm px-2.5 md:px-3">
            <RefreshCw size={14} className="mr-1.5" /> Check
          </Button>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={CheckCircle2}
            label="Compliant"
            value={stats.compliant}
            sub={`${Math.round((stats.compliant / stats.total) * 100)}% of all items`}
            iconBg="bg-emerald-50 text-emerald-600"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Clock}
            label="Expiring Soon"
            value={stats.expiring}
            sub={`${stats.expiring > 0 ? `Next: ${stats.nextDeadline} days` : "No pending items"}`}
            iconBg="bg-amber-50 text-amber-600"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={AlertCircle}
            label="Expired"
            value={stats.expired}
            sub={stats.expired > 0 ? "Action required" : "All current"}
            iconBg={stats.expired > 0 ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Calendar}
            label="Next Deadline"
            value={stats.nextDeadline > 0 ? `${stats.nextDeadline}d` : "—"}
            sub={stats.nextDeadline > 0 ? "until nearest expiration" : "No upcoming deadlines"}
            iconBg={stats.nextDeadline <= 14 && stats.nextDeadline > 0 ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"}
          />
        </motion.div>
      </div>

      {/* ── Score Ring + Urgency Timeline ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <OverviewCard
            complianceScore={complianceScore}
            totalItems={stats.total}
            ownerCount={ownerCount}
            directorCount={directorCount}
          />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <UrgencyTimelineCard items={COMPLIANCE_ITEMS} />
        </motion.div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <FilterBar
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          onCategoryChange={setCategoryFilter}
          onStatusChange={setStatusFilter}
          totalCount={sorted.length}
        />
      </motion.div>

      {/* ── Compliance Items Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sorted.map((item) => (
          <ComplianceItemCard key={item.id} item={item} />
        ))}

        {sorted.length === 0 && (
          <div className="col-span-2 py-12 text-center">
            <ShieldCheck size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No items match the selected filters.</p>
          </div>
        )}
      </div>

      {/* ── Insurance Shopping ───────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <InsuranceShoppingCard />
      </motion.div>
    </motion.div>
  );
};

export default CompliancePage;
