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
  Plus,
  Heart,
  MessageSquare,
  Edit,
  Trash2,
  ClipboardList,
  Building2,
  UserCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import OverviewCard from "./components/OverviewCard";
import UrgencyTimelineCard from "./components/UrgencyTimelineCard";
import FilterBar from "./components/FilterBar";
import CategoryTag from "./components/CategoryTag";
import RoleBadge from "./components/RoleBadge";
import StatusPill from "./components/StatusPill";
import InsuranceShoppingCard from "./components/InsuranceShoppingCard";

import { daysUntil, daysSince } from "@/hooks/compliance/useCompliance";
import {
  useGetOwnerComplianceOverview,
  useGetOwnerComplianceItems,
  useGetOwnerPulseImpact,
  useAddOwnerComplianceItem,
  useUpdateOwnerComplianceItem,
  useDeleteOwnerComplianceItem,
  useAddOwnerComplianceLogNote,
  useToggleOwnerComplianceChecklist,
} from "@/hooks/owner-hook/compliance.hook";
import AddEditComplianceModal from "./components/AddEditComplianceModal";
import LogActionModal from "./components/LogActionModal";
import PulseImpactModal from "./components/PulseImpactModal";
import InsuranceWorkflowModal from "./components/InsuranceWorkflowModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const CompliancePage = () => {
  // API Hooks
  const { overviewData, isLoading: isOverviewLoading } = useGetOwnerComplianceOverview();
  const { complianceItems, isLoading: isItemsLoading } = useGetOwnerComplianceItems();
  const { pulseImpactData } = useGetOwnerPulseImpact();

  const { addComplianceItem, isPending: isAdding } = useAddOwnerComplianceItem();
  const { updateComplianceItem, isPending: isUpdating } = useUpdateOwnerComplianceItem();
  const { deleteComplianceItem, isPending: isDeleting } = useDeleteOwnerComplianceItem();
  const { addLogNote, isPending: isAddingLog } = useAddOwnerComplianceLogNote();
  const { toggleChecklist, isPending: isToggling } = useToggleOwnerComplianceChecklist();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [logModalItem, setLogModalItem] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [togglingChecklistId, setTogglingChecklistId] = useState(null);
  const [isPulseModalOpen, setIsPulseModalOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);

  // Normalize API compliance items
  const items = useMemo(() => {
    const rawItems = (complianceItems && complianceItems.length > 0)
      ? complianceItems
      : (overviewData?.urgency_timeline || []);
    return rawItems.map((c) => {
      const exp = c.expiration_date ? c.expiration_date.slice(0, 10) : c.expires || "";
      const dLeft = c.days_left !== undefined && c.days_left !== null ? c.days_left : daysUntil(exp);
      const dOverdue = c.days_overdue !== undefined && c.days_overdue !== null ? c.days_overdue : daysSince(exp);
      return {
        id: c.id,
        item: c.name || c.item || "",
        authority: c.authority_agency || c.authority || "",
        expires: exp,
        category: c.category || "regulatory",
        ownerRole: c.responsible_role || c.ownerRole || "owner",
        notes: c.renewal_notes || c.notes || "",
        status: c.status || "compliant",
        days_left: dLeft,
        days_overdue: dOverdue,
        progress_percentage: c.progress_percentage ?? null,
        docChecklist: (c.checklists || c.docChecklist || []).map((ch) => ({
          id: ch.id,
          text: ch.title || ch.text || "",
          checked: ch.is_completed ?? ch.checked ?? false,
        })),
        logs: (c.activity_logs || (c.latest_activity_log ? [c.latest_activity_log] : c.logs) || []).map((l) => ({
          id: l.id,
          date: l.created_at ? l.created_at.slice(0, 10) : l.date || "",
          author: l.user_name || l.author || "User",
          text: l.note || l.text || "",
        })),
        raw: c,
      };
    });
  }, [complianceItems, overviewData]);

  // Compute stats from Overview API
  const stats = useMemo(() => {
    const pulse = overviewData?.pulse_health || {};
    return {
      compliant: overviewData?.compliant_count ?? 0,
      expiring: overviewData?.expiring_count ?? 0,
      expired: overviewData?.expired_count ?? 0,
      total: overviewData?.total_count ?? items.length,
      nextDeadline: overviewData?.next_deadline?.days_left ?? 0,
      nextDeadlineItem: overviewData?.next_deadline,
      complianceScore: pulse.score ?? pulseImpactData?.current_score ?? 100,
      pulseBpmPenalty: pulse.bpm_penalty ?? pulseImpactData?.bpm_penalty ?? 0,
      scoreReason: pulse.status_label
        ? `Status: ${pulse.status_label}`
        : "Compliance requirements status ok",
      ownerCount: overviewData?.owner_owned_count ?? 0,
      directorCount: overviewData?.director_owned_count ?? 0,
    };
  }, [overviewData, pulseImpactData, items]);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (categoryFilter !== "all" && c.ownerRole !== categoryFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      return true;
    });
  }, [items, categoryFilter, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const urgencyA = a.status === "expired" ? -999 : (a.days_left ?? daysUntil(a.expires));
      const urgencyB = b.status === "expired" ? -999 : (b.days_left ?? daysUntil(b.expires));
      return urgencyA - urgencyB;
    });
  }, [filtered]);

  const insuranceItem = useMemo(() => {
    return items.find((i) => (i.item || "").toLowerCase().includes("insurance")) || items[0];
  }, [items]);

  const handleSaveItem = async (formData) => {
    const payload = {
      name: formData.item,
      authority_agency: formData.authority,
      category: formData.category,
      responsible_role: formData.ownerRole,
      expiration_date: formData.expires,
      reminder_window_date: formData.shopReminder || formData.expires,
      renewal_notes: formData.notes,
      checklist_items: (formData.docChecklist || []).map((c) => (typeof c === "string" ? c : c.text)),
    };

    if (editItem) {
      await updateComplianceItem({ id: editItem.id, data: payload });
      setEditItem(null);
      setIsAddModalOpen(false);
    } else {
      await addComplianceItem(payload);
      setIsAddModalOpen(false);
    }
  };

  const confirmDeleteItem = async () => {
    if (!deleteModalItem) return;
    await deleteComplianceItem(deleteModalItem.id);
    setDeleteModalItem(null);
  };

  const handleToggleChecklist = async (itemId, checkObj) => {
    if (checkObj && checkObj.id) {
      setTogglingChecklistId(checkObj.id);
      try {
        await toggleChecklist({ checklist_id: checkObj.id });
      } finally {
        setTogglingChecklistId(null);
      }
    }
  };

  const handleAddLog = async (itemId, text) => {
    await addLogNote({ item_id: itemId, note: text });
    setLogModalItem(null);
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
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
              Compliance Overview
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap bg-[#1E3A5F]/[0.05] border-[#1E3A5F]/15">
              <span className="bg-gradient-to-r from-[#1E3A5F] via-[#5B7FA6] to-[#9DB8D9] bg-clip-text text-transparent">
                {stats.complianceScore}% Score
              </span>
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {stats.compliant}/{stats.total} compliant ·{" "}
            {stats.expiring + stats.expired > 0 ? (
              <span className="text-[#8A362C] font-semibold">
                {stats.expiring + stats.expired} items need attention
              </span>
            ) : (
              <span className="text-[#2F6042] font-semibold">all clear</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            onClick={() => setIsPulseModalOpen(true)}
            variant="outline"
            className="bg-white text-xs md:text-sm px-3 border-gray-200"
          >
            <Heart size={14} className="mr-1.5 text-[#AE4A3E] fill-[#AE4A3E]" /> Pulse Score Impact
          </Button>
          <Button
            onClick={() => {
              setEditItem(null);
              setIsAddModalOpen(true);
            }}
            className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm px-3"
          >
            <Plus size={14} className="mr-1.5" /> Add Item
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
            iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Clock}
            label="Expiring Soon"
            value={stats.expiring}
            sub={stats.expiring > 0 ? `Next: ${stats.nextDeadline} days` : "No pending items"}
            iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={AlertCircle}
            label="Expired"
            value={stats.expired}
            sub={stats.expired > 0 ? "Action required" : "All current"}
            iconBg={stats.expired > 0 ? "bg-[#AE4A3E]/10 text-[#8A362C]" : "bg-gray-50 text-gray-400"}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Calendar}
            label="Next Deadline"
            value={stats.nextDeadline > 0 ? `${stats.nextDeadline}d` : "—"}
            sub={stats.nextDeadline > 0 ? "until nearest expiration" : "No upcoming deadlines"}
            iconBg={stats.nextDeadline <= 14 && stats.nextDeadline > 0 ? "bg-[#AE4A3E]/10 text-[#8A362C]" : "bg-[#1E3A5F]/10 text-[#1E3A5F]"}
          />
        </motion.div>
      </div>

      {/* ── Score Ring + Urgency Timeline ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <div className="h-full flex flex-col justify-between">
            <OverviewCard
              complianceScore={stats.complianceScore}
              totalItems={stats.total}
              ownerCount={stats.ownerCount}
              directorCount={stats.directorCount}
            />
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <UrgencyTimelineCard items={items} />
        </motion.div>
      </div>

      {/* ── Pulse Score Impact Banner ────────────────────────────── */}
      {stats.pulseBpmPenalty > 0 && (
        <motion.div variants={itemVariants}>
          <div
            onClick={() => setIsPulseModalOpen(true)}
            className="p-4 rounded-xl bg-[#AE4A3E]/[0.08] border border-[#AE4A3E]/30 flex items-center justify-between cursor-pointer hover:bg-[#AE4A3E]/[0.12] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Heart size={20} className="text-[#8A362C] fill-[#8A362C] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#8A362C]">
                  Compliance Penalty Active: +{stats.pulseBpmPenalty} BPM added to Owner Health Pulse
                </p>
                <p className="text-[11px] text-[#8A362C]/80">{stats.scoreReason}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-xs border-[#AE4A3E]/40 text-[#8A362C] bg-white">
              View Breakdown
            </Button>
          </div>
        </motion.div>
      )}

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

      {/* ── Compliance Items List ───────────────────────────────── */}
      <div className="space-y-3">
        {sorted.map((item) => {
          const d = item.status === "expired"
            ? (item.days_overdue ?? daysSince(item.expires))
            : (item.days_left ?? daysUntil(item.expires));
          const isExpired = item.status === "expired";
          const isUrgent = !isExpired && d <= 30;
          const progressPct = item.progress_percentage !== undefined && item.progress_percentage !== null
            ? item.progress_percentage
            : (isExpired ? 100 : Math.min(100, Math.round((1 - d / 365) * 100)));
          const pct = clamp(progressPct, 0, 100);

          return (
            <motion.div key={item.id} variants={itemVariants}>
              <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 p-4 md:p-5 ${
                isExpired ? "border-l-[#AE4A3E]" : isUrgent ? "border-l-[#B78A2F]" : "border-l-[#1E3A5F]"
              }`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">{item.item}</h3>
                      <CategoryTag category={item.category} />
                      <RoleBadge role={item.ownerRole} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 size={12} className="text-[#1E3A5F]/40 flex-shrink-0" />
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteModalItem(item)}
                        className="h-7 px-2 text-[11px] text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expiration progress with globe */}
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
                    <p className="text-[10px] font-bold text-[#1E3A5F] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <ClipboardList size={12} /> Document Checklist
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      {item.docChecklist.map((docObj, idx) => {
                        const docText = typeof docObj === "string" ? docObj : docObj.text;
                        const isChecked = typeof docObj === "string" ? true : !!docObj.checked;
                        const isThisToggling = docObj && docObj.id && togglingChecklistId === docObj.id;
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isThisToggling || isToggling}
                            onClick={() => handleToggleChecklist(item.id, docObj, idx)}
                            className={`flex items-center gap-2 text-[11px] p-1.5 rounded text-left transition-colors ${
                              isChecked
                                ? "bg-white text-emerald-800 font-medium border border-emerald-200"
                                : "bg-white/60 text-gray-600 hover:bg-white border border-gray-100"
                            } disabled:opacity-60`}
                          >
                            {isThisToggling ? (
                              <Loader2 size={14} className="animate-spin text-[#1E3A5F] shrink-0" />
                            ) : (
                              <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isChecked ? "bg-emerald-600 text-white" : "border border-gray-300 bg-white"
                              }`}>
                                {isChecked && "✓"}
                              </span>
                            )}
                            <span className="truncate">{docText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Logs History */}
                {item.logs && item.logs.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-700 flex items-center gap-1">
                      <UserCheck size={12} className="text-[#1E3A5F]" /> Latest Log: {item.logs[0].text}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.logs[0].date} ({item.logs[0].author})</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {sorted.length === 0 && (
          <div className="py-12 text-center bg-white rounded-xl">
            <ShieldCheck size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No items match the selected filters.</p>
          </div>
        )}
      </div>

      {/* ── Insurance Shopping Workflow Card ─────────────────────── */}
      <motion.div variants={itemVariants}>
        <InsuranceShoppingCard onOpenWorkflow={() => setIsInsuranceModalOpen(true)} />
      </motion.div>

      {/* Modals */}
      <AddEditComplianceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditItem(null);
        }}
        onSave={handleSaveItem}
        editItem={editItem}
        userRole="owner"
        isLoading={isAdding || isUpdating}
      />

      <LogActionModal
        isOpen={!!logModalItem}
        onClose={() => setLogModalItem(null)}
        item={logModalItem}
        onAddLog={handleAddLog}
        userRole="owner"
        isLoading={isAddingLog}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteModalItem}
        onClose={() => setDeleteModalItem(null)}
        onConfirm={confirmDeleteItem}
        itemTitle={deleteModalItem?.item || deleteModalItem?.name || ""}
        isLoading={isDeleting}
      />

      <PulseImpactModal
        isOpen={isPulseModalOpen}
        onClose={() => setIsPulseModalOpen(false)}
        stats={stats}
      />

      <InsuranceWorkflowModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        insuranceItem={insuranceItem}
        onUpdateWorkflow={() => {}}
      />
    </motion.div>
  );
};

export default CompliancePage;
