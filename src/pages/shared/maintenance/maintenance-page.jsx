import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Wrench, AlertTriangle, Clock, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetUser, useGetDirectorMaintenanceList, useGetOwnerMaintenanceList, useUpdateOwnerMaintenanceStatus, useDeleteDirectorMaintenance } from "@/hooks";
import KpiCard from "./components/KpiCard";
import RequestCard from "./components/RequestCard";
import AddMaintenanceForm from "./components/AddMaintenanceForm";
import FilterBar from "./components/FilterBar";
import CostSummaryCard from "./components/CostSummaryCard";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";


const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── Main Component

const MaintenancePage = () => {
  const { user } = useGetUser();
  const isOwner = user?.role === "owner";

  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const params = useMemo(() => {
    const p = {};
    if (filterPriority !== "all") p.priority = filterPriority;
    if (filterStatus !== "all") p.status = filterStatus;
    return p;
  }, [filterPriority, filterStatus]);

  // Role-based data fetching — only the relevant hook fires
  const directorQuery = useGetDirectorMaintenanceList(isOwner ? undefined : params);
  const ownerQuery = useGetOwnerMaintenanceList(isOwner ? params : undefined);

  const activeQuery = isOwner ? ownerQuery : directorQuery;
  const { maintenanceData, isMaintenanceListLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = activeQuery;
  const { deleteMaintenance, isPending: isDeleting } = useDeleteDirectorMaintenance();
  const { updateOwnerMaintenanceStatus } = useUpdateOwnerMaintenanceStatus();

  const updateStatus = async (id, status) => {
    try {
      await updateOwnerMaintenanceStatus({ maintenance_id: id, data: { status } });
    } catch (err) {
      console.error("Failed to update maintenance status:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteMaintenance(deleteItem.id);
      setDeleteItem(null);
    } catch (err) {
      console.error("Failed to delete maintenance request:", err);
    }
  };

  // Infinite-scroll observer
  const sentinelRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const mappedRequests = useMemo(() => {
    if (!maintenanceData?.requests) return [];
    return maintenanceData.requests.map((r) => ({
      id: r.id,
      location: r.location,
      issue: r.description || "No description provided",
      priority: r.priority,
      status: r.status,
      logged: r.created_at || new Date().toISOString(),
      estCost: Number(r.cost) || 0,
      submittedBy: r.director?.name || "Director",
      assignedTo: r.assign_to,
      assignedLabel: r.assign_to,
    }));
  }, [maintenanceData]);

  const sorted = useMemo(() => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...mappedRequests].sort((a, b) => order[a.priority] - order[b.priority]);
  }, [mappedRequests]);

  const stats = useMemo(() => {
    const summary = maintenanceData?.summary || {};
    const rawCost = summary.estimated_cost_open || "0";
    const totalEstCost = Number(rawCost.replace(/[^0-9.-]+/g, "")) || 0;

    return {
      open: summary.open || 0,
      critical: summary.critical || 0,
      inProgress: summary.in_progress || 0,
      done: summary.done || 0,
      totalEstCost: totalEstCost,
      total: summary.total || 0,
      directorSubmitted: summary.total || 0,
    };
  }, [maintenanceData]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.open} open · {stats.critical} critical · {stats.done} completed
            {!isOwner && <span> · {stats.directorSubmitted} requests submitted</span>}
            {isOwner && <span> · {stats.directorSubmitted} from directors</span>}
          </p>
        </div>
        {!isOwner ? (
          <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm" onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" /> Report Issue
          </Button>
        ) : stats.critical > 0 ? (
          <>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-600">
              <AlertTriangle size={12} /> {stats.critical} critical need attention
            </span>
          </>
        ) : null}
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={Wrench} label="Total Requests" value={stats.total} sub={`${stats.open} open`} iconBg="bg-blue-50 text-blue-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={AlertTriangle} label="Critical" value={stats.critical}
            sub={stats.critical > 0 ? "Needs attention" : "All clear"}
            iconBg={stats.critical > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}
            valueColor={stats.critical > 0 ? "text-red-600" : "text-gray-900"} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Clock} label="In Progress" value={stats.inProgress} sub="Being worked on" iconBg="bg-amber-50 text-amber-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={CheckCircle2} label="Completed" value={stats.done}
            sub={`${stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}% resolved`} iconBg="bg-emerald-50 text-emerald-600" />
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <FilterBar
          filterPriority={filterPriority}
          filterStatus={filterStatus}
          onPriorityChange={setFilterPriority}
          onStatusChange={setFilterStatus}
          filteredCount={sorted.length}
          totalCount={stats.total}
        />
      </motion.div>

      {/* Maintenance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {isMaintenanceListLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 animate-pulse h-32">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-150 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-150 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))
        ) : sorted.length > 0 ? (
          sorted.map((req) => {
            const status = req.status;
            return (
              <RequestCard
                key={req.id}
                req={req}
                status={status}
                onUpdateStatus={updateStatus}
                onDelete={!isOwner ? setDeleteItem : undefined}
                onEdit={!isOwner ? setEditItem : undefined}
                isOwner={isOwner}
              />
            );
          })
        ) : (
          <div className="col-span-2 py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wrench size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No maintenance requests found</p>
            <p className="text-xs text-gray-400 mt-1">
              {!isOwner ? 'Click "Report Issue" to submit a new maintenance request' : "Adjust filters to see more results"}
            </p>
          </div>
        )}
      </div>

      {/* Infinite-scroll sentinel */}
      <div ref={sentinelRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Loading more…
          </div>
        )}
      </div>

      {/* Cost Summary */}
      {stats.totalEstCost > 0 && (
        <motion.div variants={itemVariants}>
          <CostSummaryCard totalEstCost={stats.totalEstCost} openCount={stats.open} />
        </motion.div>
      )}

      {/* Add/Edit Form Modal */}
      {(showForm || editItem) && (
        <AddMaintenanceForm
          editItem={editItem}
          onClose={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Maintenance Request"
        itemName={deleteItem?.issue || ""}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </motion.div>
  );
};

export default MaintenancePage;
