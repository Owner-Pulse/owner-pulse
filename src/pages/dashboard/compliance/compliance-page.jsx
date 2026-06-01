import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  FileCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ─── Data ─────────────────────────────────────────────────────────

const COMPLIANCE_ITEMS = [
  // Regulatory
  { id: 1, item: "Fire Inspection", authority: "County Fire", status: "compliant", expires: "2026-11-04", category: "regulatory" },
  { id: 2, item: "Health Dept. Inspection", authority: "FL DOH", status: "compliant", expires: "2026-08-22", category: "regulatory" },
  { id: 3, item: "Background Checks (Staff)", authority: "FL DCF", status: "expiring", expires: "2026-06-15", category: "regulatory" },
  { id: 4, item: "VPK Provider Cert.", authority: "ELC", status: "compliant", expires: "2027-01-30", category: "regulatory" },
  { id: 5, item: "Step Up Audit", authority: "Step Up FL", status: "expiring", expires: "2026-06-01", category: "regulatory" },
  { id: 6, item: "CPR / First Aid", authority: "Red Cross", status: "expired", expires: "2026-04-12", category: "regulatory" },
  { id: 7, item: "Playground Audit", authority: "NPPS", status: "compliant", expires: "2026-09-10", category: "regulatory" },
  // Insurance
  { id: 8, item: "General Liability Insurance", authority: "Travelers", status: "expiring", expires: "2026-07-01", category: "insurance", shopReminder: "2026-05-02" },
  { id: 9, item: "Property Insurance", authority: "Hartford", status: "compliant", expires: "2026-12-15", category: "insurance", shopReminder: "2026-10-16" },
  { id: 10, item: "Workers Comp Insurance", authority: "AmTrust", status: "compliant", expires: "2026-10-01", category: "insurance", shopReminder: "2026-08-02" },
  { id: 11, item: "Auto / Vehicle Insurance", authority: "Progressive", status: "compliant", expires: "2027-02-14", category: "insurance", shopReminder: "2026-12-16" },
  // Contracts
  { id: 12, item: "Building Lease", authority: "Lakeside Properties LLC", status: "compliant", expires: "2028-08-01", category: "contract" },
  { id: 13, item: "Food Service Contract", authority: "Sunshine Catering", status: "expiring", expires: "2026-07-31", category: "contract" },
  { id: 14, item: "Cleaning Service", authority: "BrightClean Co.", status: "compliant", expires: "2026-12-31", category: "contract" },
  { id: 15, item: "Accounting / CPA", authority: "Martinez & Co. CPA", status: "compliant", expires: "2027-04-01", category: "contract" },
  { id: 16, item: "IT / Internet", authority: "Spectrum Business", status: "compliant", expires: "2026-09-30", category: "contract" },
];

const TODAY = new Date("2026-05-11");

// ─── Helpers ──────────────────────────────────────────────────────

const daysUntil = (dateStr) => {
  const d = new Date(dateStr);
  return Math.ceil((d - TODAY) / 86400000);
};

const daysSince = (dateStr) => -daysUntil(dateStr);

const fmtDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── Status Pill ──────────────────────────────────────────────────

const StatusPill = ({ status, size = "sm" }) => {
  const config = {
    compliant: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Compliant" },
    expiring: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Expiring" },
    expired: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Expired" },
  };
  const c = config[status] || config.compliant;
  const padding = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 ${padding} rounded-full font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
      {status === "compliant" && <CheckCircle2 size={size === "xs" ? 10 : 12} />}
      {status === "expiring" && <Clock size={size === "xs" ? 10 : 12} />}
      {status === "expired" && <AlertCircle size={size === "xs" ? 10 : 12} />}
      {c.label}
    </span>
  );
};

// ─── Category Tag ─────────────────────────────────────────────────

const CategoryTag = ({ category }) => {
  const config = {
    regulatory: { bg: "bg-blue-50", text: "text-blue-700", label: "Regulatory" },
    insurance: { bg: "bg-purple-50", text: "text-purple-700", label: "Insurance" },
    contract: { bg: "bg-cyan-50", text: "text-cyan-700", label: "Contract" },
  };
  const c = config[category] || config.regulatory;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, accent, iconBg }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${iconBg || "bg-blue-50 text-blue-600"}`}>
          <Icon size={18} />
        </div>
      </div>
      {sub && (
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">{sub}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

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
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      return true;
    });
  }, [categoryFilter, statusFilter]);

  // Sort by urgency: expired first, then expiring by nearest
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const urgencyA = a.status === "expired" ? -999 : daysUntil(a.expires);
      const urgencyB = b.status === "expired" ? -999 : daysUntil(b.expires);
      return urgencyA - urgencyB;
    });
  }, [filtered]);

  // Insurance items with shopping reminders
  const insuranceShopping = COMPLIANCE_ITEMS.filter((c) => c.shopReminder);


  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Compliance & Insurance
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              complianceScore >= 80
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : complianceScore >= 50
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-red-50 text-red-700 border-red-200"
            }`}>
              {complianceScore}% compliant
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {stats.compliant} of {stats.total} items in good standing ·{" "}
            {stats.expiring + stats.expired > 0 ? (
              <span className="text-red-500 font-medium">
                {stats.expiring + stats.expired} need attention
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">all clear</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">
            <FileText size={16} className="mr-2" /> View Reports
          </Button>
          <Button className="bg-[#0A0F1E] hover:bg-black text-white">
            <RefreshCw size={16} className="mr-2" /> Check Status
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

      {/* ── Compliance Score Ring + Category Breakdown ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score overview */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-500" />
                Overview
              </CardTitle>
              <CardDescription>Status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Visual progress ring */}
              <div className="flex justify-center mb-4">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={complianceScore >= 80 ? "#16A34A" : complianceScore >= 50 ? "#D97706" : "#DC2626"}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(complianceScore / 100) * 264} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-extrabold ${
                      complianceScore >= 80 ? "text-emerald-600" : complianceScore >= 50 ? "text-amber-600" : "text-red-500"
                    }`}>
                      {complianceScore}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Regulatory", count: COMPLIANCE_ITEMS.filter((c) => c.category === "regulatory").length, color: "bg-blue-500" },
                  { label: "Insurance", count: COMPLIANCE_ITEMS.filter((c) => c.category === "insurance").length, color: "bg-purple-500" },
                  { label: "Contracts", count: COMPLIANCE_ITEMS.filter((c) => c.category === "contract").length, color: "bg-cyan-500" },
                ].map((cat) => (
                  <div key={cat.label} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                      <span className="text-sm text-gray-600">{cat.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{cat.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Urgency Timeline */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                Urgency Timeline
              </CardTitle>
              <CardDescription>
                Items that need attention, sorted by deadline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {COMPLIANCE_ITEMS.filter((c) => c.status !== "compliant").length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                  <div className="space-y-0">
                    {COMPLIANCE_ITEMS
                      .filter((c) => c.status !== "compliant")
                      .sort((a, b) => {
                        const aDays = a.status === "expired" ? -999 : daysUntil(a.expires);
                        const bDays = b.status === "expired" ? -999 : daysUntil(b.expires);
                        return aDays - bDays;
                      })
                      .map((item) => {
                        const d = item.status === "expired" ? daysSince(item.expires) : daysUntil(item.expires);
                        const isExpired = item.status === "expired";
                        const isUrgent = !isExpired && d <= 30;
                        const dotColor = isExpired ? "bg-red-500" : isUrgent ? "bg-amber-500" : "bg-blue-500";
                        const borderColor = isExpired ? "border-red-200" : isUrgent ? "border-amber-200" : "border-gray-100";

                        return (
                          <div key={item.id} className="relative flex items-start gap-4 pb-4 last:pb-0">
                            {/* Timeline dot */}
                            <div className="relative z-10 flex-shrink-0 mt-1">
                              <div className={`w-3 h-3 rounded-full ${dotColor} ring-2 ring-white`} />
                            </div>

                            {/* Card */}
                            <div className={`flex-1 p-3 rounded-xl border ${borderColor} ${
                              isExpired ? "bg-red-50" : isUrgent ? "bg-amber-50" : "bg-gray-50"
                            }`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-gray-900">{item.item}</span>
                                    <CategoryTag category={item.category} />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">{item.authority}</p>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                  <span className={`text-xs font-bold whitespace-nowrap ${
                                    isExpired ? "text-red-600" : isUrgent ? "text-amber-600" : "text-gray-500"
                                  }`}>
                                    {isExpired ? `${d}d overdue` : `${d}d left`}
                                  </span>
                                </div>
                              </div>
                              {item.shopReminder && (
                                <div className="mt-2 text-[10px] text-purple-600 font-medium">
                                  🛒 Shopping reminder: {fmtDate(item.shopReminder)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm text-gray-500">All compliance items are up to date.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category:</span>
          {[
            { id: "all", label: "All" },
            { id: "regulatory", label: "Regulatory" },
            { id: "insurance", label: "Insurance" },
            { id: "contract", label: "Contracts" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setCategoryFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                categoryFilter === f.id
                  ? "bg-[#0A0F1E] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status:</span>
          {[
            { id: "all", label: "All" },
            { id: "compliant", label: "Compliant" },
            { id: "expiring", label: "Expiring" },
            { id: "expired", label: "Expired" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === f.id
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{sorted.length} items</span>
      </motion.div>

      {/* ── Compliance Items Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sorted.map((item) => {
          const d = item.status === "expired" ? daysSince(item.expires) : daysUntil(item.expires);
          const isExpired = item.status === "expired";
          const isUrgent = !isExpired && d <= 30;
          const progressPct = item.status === "expired"
            ? 100
            : item.status === "expiring"
              ? Math.min(100, Math.round((1 - d / 365) * 100))
              : Math.round((1 - d / 365) * 100);
          const barColor = isExpired ? "bg-red-400" : isUrgent ? "bg-amber-400" : "bg-emerald-400";

          return (
            <motion.div key={item.id} variants={itemVariants}>
              <Card className={`bg-white border-none shadow-sm hover:shadow-md transition-shadow border-l-4 ${
                isExpired ? "border-l-red-500" : isUrgent ? "border-l-amber-500" : "border-l-emerald-500"
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{item.item}</h3>
                        <CategoryTag category={item.category} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500">{item.authority}</span>
                      </div>
                    </div>
                    <StatusPill status={item.status} />
                  </div>

                  {/* Expiration progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Expires: {fmtDate(item.expires)}</span>
                      <span className={`font-semibold ${
                        isExpired ? "text-red-600" : isUrgent ? "text-amber-600" : "text-gray-500"
                      }`}>
                        {isExpired ? `${d}d overdue` : `${d} days`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${Math.min(progressPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Insurance shopping reminder */}
                  {item.shopReminder && (
                    <div className="mt-3 p-2 rounded-lg bg-purple-50 border border-purple-100 flex items-center gap-2">
                      <RefreshCw size={12} className="text-purple-500 flex-shrink-0" />
                      <p className="text-[10px] text-purple-700">
                        <span className="font-bold">Shop reminder:</span>{" "}
                        {daysUntil(item.shopReminder) > 0
                          ? `Quote renewal rates by ${fmtDate(item.shopReminder)}`
                          : `Rates should have been quoted by ${fmtDate(item.shopReminder)}`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {sorted.length === 0 && (
          <div className="col-span-2 py-12 text-center">
            <ShieldCheck size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No items match the selected filters.</p>
          </div>
        )}
      </div>

      {/* ── Insurance Shopping Schedule ───────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw size={16} className="text-purple-500" />
              Insurance Shopping Schedule
            </CardTitle>
            <CardDescription>
              Best practice: shop rates ~60 days before renewal. Current year's reminders below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-2.5 font-semibold text-gray-400 uppercase tracking-wider text-xs">Policy</th>
                    <th className="text-left pb-2.5 font-semibold text-gray-400 uppercase tracking-wider text-xs">Provider</th>
                    <th className="text-right pb-2.5 font-semibold text-gray-400 uppercase tracking-wider text-xs">Renewal</th>
                    <th className="text-right pb-2.5 font-semibold text-gray-400 uppercase tracking-wider text-xs">Shop By</th>
                    <th className="text-right pb-2.5 font-semibold text-gray-400 uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {insuranceShopping.map((item) => {
                    const renewalDays = daysUntil(item.expires);
                    const shopDays = daysUntil(item.shopReminder);
                    const shopPast = shopDays < 0;
                    const renewalUrgent = renewalDays <= 60;
                    return (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 font-medium text-gray-900">{item.item}</td>
                        <td className="py-3 text-gray-500">{item.authority}</td>
                        <td className={`py-3 text-right font-semibold ${
                          renewalUrgent ? "text-amber-600" : "text-gray-700"
                        }`}>
                          {fmtDate(item.expires)}
                        </td>
                        <td className={`py-3 text-right font-semibold ${
                          shopPast ? "text-red-500" : shopDays <= 14 ? "text-amber-600" : "text-gray-700"
                        }`}>
                          {fmtDate(item.shopReminder)}
                        </td>
                        <td className="py-3 text-right">
                          {shopPast ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <AlertCircle size={10} /> Past due
                            </span>
                          ) : shopDays <= 14 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock size={10} /> {shopDays}d left
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={10} /> On track
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800">                    <span className="font-bold">💡 Tip:</span> Insurance rates have been rising 8-12% YoY in this market.{" "}
                Starting the shopping process 60 days before renewal gives you leverage — carriers need time to quote, and
                you need time to negotiate.{" "}
                <span className="font-medium">General Liability renews July 1 — shopping window opened May 2.</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── DCF Compliance Reference ──────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck size={16} className="text-blue-500" />
              DCF Daily Compliance
            </CardTitle>
            <CardDescription>
              Florida DCF Child Care Facility Handbook (October 2021) · daily requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">Daily Checks</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  12 daily items: indoor/outdoor inspections, attendance verification, 
                  fridge/freezer temps, indoor temp, sanitation, food temps, 
                  diaper stations, first aid kits, exits, medication logs.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <RefreshCw size={16} className="text-amber-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">Weekly Checks</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  2 weekly items (Mondays): linens washed, all bedding cleaned 
                  & sanitized. Also when soiled or between users.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-purple-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">Monthly + Annual</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Monthly fire drill (vary date/time). Annual: lockdown drill, 
                  inclement-weather drill, fire inspection by certified inspector.
                </p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Button variant="ghost" className="text-blue-600 text-sm">
                Open DCF Checklist <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CompliancePage;
