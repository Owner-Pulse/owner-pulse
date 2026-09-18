import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { daysUntil, daysSince } from "@/hooks/compliance/useCompliance";
import {
  useGetDirectorComplianceOverview,
  useGetDirectorComplianceItems,
  useAddDirectorComplianceItem,
  useUpdateDirectorComplianceItem,
  useDeleteDirectorComplianceItem,
  useCompleteDirectorComplianceItem,
  useAddDirectorComplianceLogNote,
  useToggleDirectorComplianceChecklist,
} from "@/hooks/director-hook/compliance.hook";
import AddEditComplianceModal from "@/pages/owner-dashboard/compliance/components/AddEditComplianceModal";
import LogActionModal from "@/pages/owner-dashboard/compliance/components/LogActionModal";
import PulseImpactModal from "@/pages/owner-dashboard/compliance/components/PulseImpactModal";
import DeleteConfirmationModal from "@/pages/owner-dashboard/compliance/components/DeleteConfirmationModal";
import CompleteComplianceModal from "@/pages/owner-dashboard/compliance/components/CompleteComplianceModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// Local components
import { containerVariants } from "./components/variants";
import DirectorComplianceHeader from "./components/DirectorComplianceHeader";
import DirectorWorkflowBanner from "./components/DirectorWorkflowBanner";
import DirectorKpiCards from "./components/DirectorKpiCards";
import DirectorComplianceFilters from "./components/DirectorComplianceFilters";
import { OwnerColumn, DirectorColumn } from "./components/DirectorComplianceColumn";

// ─────────────────────────────────────────────────────────────────────────────

const DirectorCompliancePage = () => {
  // ── API Hooks ──────────────────────────────────────────────────────────────
  const { overviewData, isLoading: isOverviewLoading } = useGetDirectorComplianceOverview();
  const { complianceItems, isLoading: isItemsLoading } = useGetDirectorComplianceItems();

  const { addComplianceItem, isPending: isAdding } = useAddDirectorComplianceItem();
  const { updateComplianceItem, isPending: isUpdating } = useUpdateDirectorComplianceItem();
  const { deleteComplianceItem, isPending: isDeleting } = useDeleteDirectorComplianceItem();
  const { completeComplianceItem, isPending: isCompleting } = useCompleteDirectorComplianceItem();
  const { addLogNote, isPending: isAddingLog } = useAddDirectorComplianceLogNote();
  const { toggleChecklist, isPending: isToggling } = useToggleDirectorComplianceChecklist();

  // ── UI State ───────────────────────────────────────────────────────────────
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [completeModalItem, setCompleteModalItem] = useState(null);
  const [confirmCompleteItem, setConfirmCompleteItem] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [logModalItem, setLogModalItem] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [togglingChecklistId, setTogglingChecklistId] = useState(null);
  const [isPulseModalOpen, setIsPulseModalOpen] = useState(false);

  // ── Data Normalization ─────────────────────────────────────────────────────
  const items = useMemo(() => {
    // Director items come from the dedicated items API or urgency_timeline
    const directorRaw =
      complianceItems && complianceItems.length > 0
        ? [...complianceItems]
        : [...(overviewData?.urgency_timeline || [])];

    // Owner items come from overviewData.owner_items (separate field in overview API)
    const ownerRaw = overviewData?.owner_items || [];

    // Also include next_deadlines / upcoming_deadlines (in case some director items
    // don't appear in the items API yet, e.g. only exist in the overview snapshot)
    const nextDeadlines = overviewData?.next_deadlines || overviewData?.upcoming_deadlines || [];

    const completedItems = overviewData?.completed_items || [];

    const map = new Map();

    // Seed from all sources – order matters: last write wins for duplicates
    [...directorRaw, ...ownerRaw, ...nextDeadlines].forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });

    // Merge completed items (mark is_completed = true, but don't overwrite fresh data)
    completedItems.forEach((cItem) => {
      if (cItem && cItem.id) {
        if (map.has(cItem.id)) {
          map.set(cItem.id, { ...map.get(cItem.id), ...cItem, is_completed: true });
        } else {
          map.set(cItem.id, { ...cItem, is_completed: true });
        }
      }
    });

    return Array.from(map.values()).map((c) => {
      const exp = c.expiration_date ? c.expiration_date.slice(0, 10) : c.expires || "";
      const dLeft =
        c.days_left !== undefined && c.days_left !== null ? c.days_left : daysUntil(exp);
      const dOverdue =
        c.days_overdue !== undefined && c.days_overdue !== null
          ? c.days_overdue
          : daysSince(exp);
      const isCompleted =
        !!c.is_completed || c.status === "completed" || c.status_badge === "Completed";

      return {
        id: c.id,
        item: c.name || c.item || "",
        authority: c.authority_agency || c.authority || "",
        expires: exp,
        category: c.category || "regulatory",
        ownerRole: c.responsible_role || c.ownerRole || "director",
        notes: c.renewal_notes || c.notes || "",
        status: isCompleted ? "completed" : c.status || "compliant",
        status_color: c.status_color || (isCompleted ? "success" : null),
        status_badge: c.status_badge || (isCompleted ? "Completed" : null),
        is_completed: isCompleted,
        completed_at: c.completed_at || null,
        completed_by: c.completed_by || null,
        card_color: c.card_color || (isCompleted ? "#3E7A54" : null),
        days_left: dLeft,
        days_overdue: dOverdue,
        progress_percentage: c.progress_percentage ?? (isCompleted ? 100 : null),
        time_progress_percentage: c.time_progress_percentage ?? null,
        docChecklist: (c.checklists || c.docChecklist || []).map((ch) => ({
          id: ch.id,
          text: ch.title || ch.text || "",
          checked: ch.is_completed ?? ch.checked ?? isCompleted,
        })),
        logs: (
          c.activity_logs ||
          (c.latest_activity_log ? [c.latest_activity_log] : c.logs) ||
          []
        ).map((l) => ({
          id: l.id,
          date: l.created_at ? l.created_at.slice(0, 10) : l.date || "",
          author: l.user_name || l.author || "User",
          text: l.note || l.text || "",
        })),
        raw: c,
      };
    });
  }, [complianceItems, overviewData]);

  // ── Derived Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const pulse = overviewData?.pulse_health || {};
    const directorCount =
      overviewData?.director_assigned_count ??
      items.filter((i) => i.ownerRole === "director").length;
    const completedCount =
      overviewData?.completed_count ?? items.filter((i) => i.is_completed).length;

    return {
      compliant: Math.max(
        0,
        items.length -
          (overviewData?.expiring_soon_count ?? 0) -
          (overviewData?.urgent_expired_count ?? 0) -
          completedCount
      ),
      completed: completedCount,
      expiring: overviewData?.expiring_soon_count ?? 0,
      expired: overviewData?.urgent_expired_count ?? 0,
      total: overviewData?.total_count ?? items.length,
      nextDeadline: overviewData?.next_deadline?.days_left ?? 0,
      nextDeadlineItem: overviewData?.next_deadline,
      complianceScore: pulse.score ?? 100,
      directorCount,
    };
  }, [overviewData, items]);

  // ── Filtered + Sorted ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (categoryFilter === "director" && c.ownerRole !== "director") return false;
      if (categoryFilter === "owner" && c.ownerRole !== "owner") return false;
      if (statusFilter !== "all") {
        if (statusFilter === "completed") {
          if (!c.is_completed && c.status !== "completed") return false;
        } else if (statusFilter === "compliant") {
          if (c.status !== "compliant" && !c.is_completed && c.status !== "completed")
            return false;
        } else {
          if (c.status !== statusFilter) return false;
        }
      }
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
      const ua = a.is_completed ? 999 : a.status === "expired" ? -999 : (a.days_left ?? daysUntil(a.expires));
      const ub = b.is_completed ? 999 : b.status === "expired" ? -999 : (b.days_left ?? daysUntil(b.expires));
      return ua - ub;
    });
  }, [filtered]);

  const ownerItems = useMemo(
    () => sorted.filter((c) => (c.ownerRole || "").toLowerCase() === "owner"),
    [sorted]
  );
  const directorItems = useMemo(
    () => sorted.filter((c) => (c.ownerRole || "").toLowerCase() !== "owner"),
    [sorted]
  );

  // ── Workflow Alert Items ───────────────────────────────────────────────────
  const expiredDirectorItems = useMemo(
    () => items.filter((i) => i.status === "expired" && i.ownerRole === "director" && !i.is_completed),
    [items]
  );
  const expiringDirectorItems = useMemo(
    () => items.filter((i) => i.status === "expiring" && i.ownerRole === "director" && !i.is_completed),
    [items]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveItem = async (formData) => {
    const payload = {
      name: formData.item,
      authority_agency: formData.authority,
      category: formData.category,
      responsible_role: formData.ownerRole,
      expiration_date: formData.expires,
      reminder_window_date: formData.shopReminder || formData.expires,
      renewal_notes: formData.notes,
      checklist_items: (formData.docChecklist || []).map((c) =>
        typeof c === "string" ? c : c.text
      ),
    };
    if (editItem) {
      await updateComplianceItem({ id: editItem.id, data: payload });
      setEditItem(null);
    } else {
      await addComplianceItem(payload);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;
    await deleteComplianceItem(deleteModalItem.id);
    setDeleteModalItem(null);
  };

  const handleConfirmComplete = async () => {
    if (!confirmCompleteItem) return;
    setCompletingId(confirmCompleteItem.id);
    try {
      await completeComplianceItem({ id: confirmCompleteItem.id, data: {} });
      setConfirmCompleteItem(null);
    } finally {
      setCompletingId(null);
    }
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

  // Shared card props passed down to both columns
  const sharedCardProps = {
    completingId,
    isCompleting,
    togglingChecklistId,
    isToggling,
    onEdit: (item) => {
      setEditItem(item);
      setIsAddModalOpen(true);
    },
    onDelete: setDeleteModalItem,
    onComplete: setConfirmCompleteItem,
    onLog: setLogModalItem,
    onToggleChecklist: handleToggleChecklist,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <DirectorComplianceHeader
        stats={stats}
        onPulseClick={() => setIsPulseModalOpen(true)}
        onAddClick={() => {
          setEditItem(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Workflow Banner */}
      <DirectorWorkflowBanner
        expiredDirectorItems={expiredDirectorItems}
        expiringDirectorItems={expiringDirectorItems}
        stats={stats}
      />

      {/* KPI Cards */}
      <DirectorKpiCards stats={stats} />

      {/* Filters */}
      <DirectorComplianceFilters
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalItems={items.length}
        ownerCount={ownerItems.length}
        directorCount={directorItems.length}
        completedCount={stats.completed}
      />

      {/* Compliance Item Columns */}
      {sorted.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-gray-100 shadow-xs">
          <ShieldCheck size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">
            No items match the selected filters or search query.
          </p>
        </div>
      ) : (
        <div
          className={
            categoryFilter === "all"
              ? "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
              : "w-full space-y-6"
          }
        >
          {(categoryFilter === "all" || categoryFilter === "owner") && (
            <OwnerColumn items={ownerItems} cardProps={sharedCardProps} />
          )}
          {(categoryFilter === "all" || categoryFilter === "director") && (
            <DirectorColumn items={directorItems} cardProps={sharedCardProps} />
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <AddEditComplianceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditItem(null);
        }}
        onSave={handleSaveItem}
        editItem={editItem}
        userRole="director"
        isLoading={isAdding || isUpdating}
      />

      <LogActionModal
        isOpen={!!logModalItem}
        onClose={() => setLogModalItem(null)}
        item={logModalItem}
        onAddLog={handleAddLog}
        userRole="director"
        isLoading={isAddingLog}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteModalItem}
        onClose={() => setDeleteModalItem(null)}
        onConfirm={handleDeleteConfirm}
        itemTitle={deleteModalItem?.item || deleteModalItem?.name || ""}
        isLoading={isDeleting}
      />

      <PulseImpactModal
        isOpen={isPulseModalOpen}
        onClose={() => setIsPulseModalOpen(false)}
        stats={stats}
      />

      <CompleteComplianceModal
        isOpen={!!completeModalItem}
        onClose={() => setCompleteModalItem(null)}
        item={completeModalItem}
        onComplete={async (id) => completeComplianceItem({ id, data: {} })}
        isLoading={isCompleting}
      />

      <ConfirmationModal
        isOpen={!!confirmCompleteItem}
        onClose={() => setConfirmCompleteItem(null)}
        onConfirm={handleConfirmComplete}
        title="Complete Compliance Item"
        message={`Are you sure you want to mark "${
          confirmCompleteItem?.item || confirmCompleteItem?.name
        }" as completed? This will mark all checklists completed and recalculate the compliance score.`}
        confirmText="Yes, Mark Complete"
        cancelText="Cancel"
        type="success"
        isLoading={isCompleting}
      />
    </motion.div>
  );
};

export default DirectorCompliancePage;
