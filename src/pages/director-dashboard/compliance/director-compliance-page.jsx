import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  FileText,
  RefreshCw,
  Plus,
  Building2,
  ClipboardList,
  AlertTriangle,
  MessageSquare,
  Edit,
  Trash2,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCompliance, daysUntil, daysSince } from "@/hooks/compliance/useCompliance";
import AddEditComplianceModal from "@/pages/owner-dashboard/compliance/components/AddEditComplianceModal";
import LogActionModal from "@/pages/owner-dashboard/compliance/components/LogActionModal";
import PulseImpactModal from "@/pages/owner-dashboard/compliance/components/PulseImpactModal";
import StatusPill from "@/pages/owner-dashboard/compliance/components/StatusPill";
import CategoryTag from "@/pages/owner-dashboard/compliance/components/CategoryTag";
import RoleBadge from "@/pages/owner-dashboard/compliance/components/RoleBadge";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const DirectorCompliancePage = () => {
  const {
    items,
    addItem,
    updateItem,
    deleteItem,
    toggleChecklistItem,
    addProgressLog,
    stats,
  } = useCompliance();

  const [categoryFilter, setCategoryFilter] = useState("director"); // default to director items
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [logModalItem, setLogModalItem] = useState(null);
  const [isPulseModalOpen, setIsPulseModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (categoryFilter === "director" && c.ownerRole !== "director") return false;
      if (categoryFilter === "owner" && c.ownerRole !== "owner") return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          c.item.toLowerCase().includes(query) ||
          c.authority.toLowerCase().includes(query) ||
          (c.notes && c.notes.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [items, categoryFilter, statusFilter, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const urgencyA = a.status === "expired" ? -999 : daysUntil(a.expires);
      const urgencyB = b.status === "expired" ? -999 : daysUntil(b.expires);
      return urgencyA - urgencyB;
    });
  }, [filtered]);

  const expiredDirectorItems = useMemo(() => {
    return items.filter((i) => i.status === "expired" && i.ownerRole === "director");
  }, [items]);

  const expiringDirectorItems = useMemo(() => {
    return items.filter((i) => i.status === "expiring" && i.ownerRole === "director");
  }, [items]);

  const handleSaveItem = (formData) => {
    if (editItem) {
      updateItem(editItem.id, formData, "Director");
      setEditItem(null);
    } else {
      addItem({ ...formData, author: "Director" });
    }
  };

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
              Director Compliance Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-[#1E3A5F]/[0.05] border-[#1E3A5F]/15">
              <span className="bg-gradient-to-r from-[#1E3A5F] via-[#5B7FA6] to-[#9DB8D9] bg-clip-text text-transparent">
                {stats.complianceScore}% Compliant
              </span>
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Daily Monitoring Workflow & Regulatory Readiness · {stats.compliant}/{stats.total} items active
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            onClick={() => setIsPulseModalOpen(true)}
            variant="outline"
            className="bg-white text-xs md:text-sm px-3 border-gray-200"
          >
            <ShieldAlert size={14} className="mr-1.5 text-[#AE4A3E]" /> Pulse Impact
          </Button>
          <Button
            onClick={() => {
              setEditItem(null);
              setIsAddModalOpen(true);
            }}
            className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm px-3"
          >
            <Plus size={14} className="mr-1.5" /> Add Compliance Item
          </Button>
        </div>
      </div>

      {/* ── Daily Compliance Monitoring Workflow Banner (compliance.html) ── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm overflow-hidden border-l-4 border-l-[#1E3A5F]">
          <CardHeader className="pb-3 bg-[#1E3A5F]/[0.03]">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#1E3A5F]">
                <RefreshCw size={16} /> Daily Compliance Monitoring Workflow
              </span>
              <span className="text-xs text-gray-500 font-normal">Step-by-Step Action Guide</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Box 1: Expired Items Alert */}
              <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                expiredDirectorItems.length > 0
                  ? "bg-[#AE4A3E]/[0.08] border-[#AE4A3E]/30 text-[#8A362C]"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
                      🔴 1. Expired Items ({expiredDirectorItems.length})
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#AE4A3E]/10">URGENT</span>
                  </div>
                  <p className="text-xs mt-1">
                    {expiredDirectorItems.length > 0
                      ? `Immediate renewal required: ${expiredDirectorItems.map((i) => i.item).join(", ")}`
                      : "No expired items pending."}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-semibold">
                  <span>Action: Call owner & start renewal</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Box 2: Expiring <60 Days Alert */}
              <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                expiringDirectorItems.length > 0
                  ? "bg-[#B78A2F]/[0.10] border-[#B78A2F]/30 text-[#8F6A1F]"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
                      ⏱️ 2. Expiring &lt;60 Days ({expiringDirectorItems.length})
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#B78A2F]/10">PREPARE</span>
                  </div>
                  <p className="text-xs mt-1">
                    {expiringDirectorItems.length > 0
                      ? `Upcoming deadlines: ${expiringDirectorItems.map((i) => i.item).slice(0, 2).join(", ")}`
                      : "No items expiring within 60 days."}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-semibold">
                  <span>Action: Contact vendor & schedule</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Box 3: All Compliant */}
              <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
                      ✅ 3. All Current Items ({stats.compliant})
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      COMPLIANT
                    </span>
                  </div>
                  <p className="text-xs mt-1">
                    All other regulatory & operational requirements monitored with green status.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px] font-semibold">
                  <span>Action: Routine monthly check</span>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Director KPI Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-xl bg-white shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Director Items</span>
              <div className="p-2 rounded-lg bg-[#1E3A5F]/10 text-[#1E3A5F]">
                <UserCheck size={16} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">{stats.directorCount}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Primary operational responsibility</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-xl bg-white shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Expiring Soon</span>
              <div className="p-2 rounded-lg bg-[#B78A2F]/10 text-[#8F6A1F]">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#8F6A1F] mt-2">{stats.expiring}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Under 60-day renewal window</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-xl bg-white shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Urgent Expired</span>
              <div className={`p-2 rounded-lg ${stats.expired > 0 ? "bg-[#AE4A3E]/10 text-[#8A362C]" : "bg-gray-100 text-gray-400"}`}>
                <AlertCircle size={16} />
              </div>
            </div>
            <p className={`text-2xl font-extrabold mt-2 ${stats.expired > 0 ? "text-[#8A362C]" : "text-gray-900"}`}>
              {stats.expired}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Immediate action required</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-xl bg-white shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Next Deadline</span>
              <div className="p-2 rounded-lg bg-[#1E3A5F]/10 text-[#1E3A5F]">
                <Calendar size={16} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#1E3A5F] mt-2">
              {stats.nextDeadline > 0 ? `${stats.nextDeadline}d` : "—"}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 truncate">
              {stats.nextDeadlineItem ? stats.nextDeadlineItem.item : "All up to date"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Filters & Search ───────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category / Role Filter */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setCategoryFilter("director")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  categoryFilter === "director"
                    ? "bg-[#1E3A5F] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Director Responsible ({stats.directorCount})
              </button>
              <button
                onClick={() => setCategoryFilter("owner")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  categoryFilter === "owner"
                    ? "bg-[#1E3A5F] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Owner Responsible ({stats.ownerCount})
              </button>
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  categoryFilter === "all"
                    ? "bg-[#1E3A5F] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All ({stats.total})
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
            >
              <option value="all">All Statuses</option>
              <option value="expired">🔴 Expired</option>
              <option value="expiring">🟠 Expiring Soon</option>
              <option value="compliant">🟢 Compliant</option>
            </select>
          </div>

          <div className="w-full md:w-64">
            <Input
              type="text"
              placeholder="Search items or authority..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Compliance Items List ──────────────────────────────── */}
      <div className="space-y-3">
        {sorted.map((item) => {
          const d = item.status === "expired" ? daysSince(item.expires) : daysUntil(item.expires);
          const isExpired = item.status === "expired";
          const isUrgent = !isExpired && d <= 30;
          const progressPct = isExpired ? 100 : Math.min(100, Math.round((1 - d / 365) * 100));
          const pct = clamp(progressPct, 0, 100);

          return (
            <motion.div key={item.id} variants={itemVariants}>
              <Card className={`bg-white border-none shadow-sm hover:shadow-md transition-shadow border-l-4 ${
                isExpired ? "border-l-[#AE4A3E]" : isUrgent ? "border-l-[#B78A2F]" : "border-l-[#1E3A5F]"
              }`}>
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">{item.item}</h3>
                        <CategoryTag category={item.category} />
                        <RoleBadge role={item.ownerRole} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 size={12} className="text-[#1E3A5F]/40 shrink-0" />
                        <span className="text-xs text-gray-500">{item.authority}</span>
                      </div>
                      {item.notes && <div className="mt-1 text-[11px] text-gray-500 italic">{item.notes}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusPill status={item.status} />
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setLogModalItem(item)}
                          className="h-7 px-2 text-[11px] text-[#1E3A5F] hover:bg-[#1E3A5F]/10"
                        >
                          <MessageSquare size={12} className="mr-1" /> Log Action
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditItem(item);
                            setIsAddModalOpen(true);
                          }}
                          className="h-7 px-2 text-[11px] text-gray-600 hover:bg-gray-100"
                        >
                          <Edit size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar with globe marker */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-400">Expires {item.expires}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-[#1E3A5F] via-[#5B7FA6] to-[#9DB8D9] bg-clip-text text-transparent">
                          {pct}%
                        </span>
                        <span className={`font-semibold ${isExpired ? "text-[#8A362C]" : isUrgent ? "text-[#8F6A1F]" : "text-gray-500"}`}>
                          {isExpired ? `${d}d overdue` : `${d} days left`}
                        </span>
                      </span>
                    </div>
                    <div className="relative h-2.5 bg-[#1E3A5F]/10 ring-1 ring-inset ring-[#1E3A5F]/10 rounded-full">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#1E3A5F] via-[#5B7FA6] to-[#9DB8D9] transition-[width] duration-700 ease-out"
                        style={{ width: `${clamp(pct, 2, 100)}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-[left] duration-700 ease-out"
                        style={{ left: `${clamp(pct, 4, 96)}%` }}
                      >
                        <img
                          src="/world.png"
                          alt="World"
                          className="w-7 h-7 rounded-full object-cover shadow-sm ring-1 ring-[#1E3A5F]/30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Document Checklist with Toggles */}
                  {item.docChecklist && item.docChecklist.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-[#1E3A5F]/[0.04] border border-[#1E3A5F]/15">
                      <p className="text-[10px] font-bold text-[#1E3A5F] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ClipboardList size={12} /> Director Pre-Inspection Document Checklist
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {item.docChecklist.map((docObj, idx) => {
                          const docText = typeof docObj === "string" ? docObj : docObj.text;
                          const isChecked = typeof docObj === "string" ? true : !!docObj.checked;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => toggleChecklistItem(item.id, idx)}
                              className={`flex items-center gap-2 text-[11px] p-1.5 rounded text-left transition-colors ${
                                isChecked
                                  ? "bg-white text-emerald-800 font-medium shadow-2xs border border-emerald-200"
                                  : "bg-white/60 text-gray-600 hover:bg-white border border-gray-100"
                              }`}
                            >
                              <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isChecked ? "bg-emerald-600 text-white" : "border border-gray-300 bg-white"
                              }`}>
                                {isChecked && "✓"}
                              </span>
                              <span className="truncate">{docText}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Logs Activity History */}
                  {item.logs && item.logs.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span className="font-semibold text-gray-700 flex items-center gap-1">
                        <UserCheck size={12} className="text-[#1E3A5F]" /> Latest Log: {item.logs[0].text}
                      </span>
                      <span className="text-[10px] text-gray-400">{item.logs[0].date} ({item.logs[0].author})</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {sorted.length === 0 && (
          <div className="py-12 text-center bg-white rounded-xl border border-gray-100">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-gray-800">No matching compliance items.</p>
            <p className="text-xs text-gray-400 mt-0.5">Try adjusting filters or search query.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddEditComplianceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditItem(null);
        }}
        onSave={handleSaveItem}
        editItem={editItem}
        userRole="director"
      />

      <LogActionModal
        isOpen={!!logModalItem}
        onClose={() => setLogModalItem(null)}
        item={logModalItem}
        onAddLog={addProgressLog}
        userRole="director"
      />

      <PulseImpactModal
        isOpen={isPulseModalOpen}
        onClose={() => setIsPulseModalOpen(false)}
        stats={stats}
      />
    </motion.div>
  );
};

export default DirectorCompliancePage;
