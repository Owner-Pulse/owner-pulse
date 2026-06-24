import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Wrench, AlertTriangle, Clock, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PriorityTag from "./components/PriorityTag";
import StatusTag from "./components/StatusTag";
import KpiCard from "./components/KpiCard";
import RequestCard from "./components/RequestCard";
import AddMaintenanceForm from "./components/AddMaintenanceForm";
import FilterBar from "./components/FilterBar";
import CostSummaryCard from "./components/CostSummaryCard";

// ─── Data ─────────────────────────────────────────────────────────

const INITIAL_REQUESTS = [
  { id: 1, location: "K — Sequoia", issue: "AC unit not cooling", priority: "critical", status: "open", logged: "2026-05-09", estCost: 1200, submittedBy: "Director Sarah Kim", assignedTo: "ac", assignedLabel: "AC Person" },
  { id: 2, location: "Cafeteria", issue: "Plumbing — sink backup", priority: "high", status: "in_progress", logged: "2026-05-07", estCost: 450, submittedBy: "Director Sarah Kim", assignedTo: "handyman", assignedLabel: "Handyman" },
  { id: 3, location: "Playground", issue: "Swing chain replacement", priority: "high", status: "open", logged: "2026-05-10", estCost: 180, submittedBy: "Director Marcus Webb", assignedTo: "handyman", assignedLabel: "Handyman" },
  { id: 4, location: "2nd — Willow", issue: "Light fixture flickering", priority: "low", status: "open", logged: "2026-05-05", estCost: 75, submittedBy: "Owner", assignedTo: "owner", assignedLabel: "Owner" },
  { id: 5, location: "Front office", issue: "Door lock sticky", priority: "medium", status: "done", logged: "2026-05-02", estCost: 110, submittedBy: "Director Sarah Kim", assignedTo: "handyman", assignedLabel: "Handyman" },
  { id: 6, location: "Boiler room", issue: "Water heater making noise", priority: "medium", status: "open", logged: "2026-05-11", estCost: 350, submittedBy: "Director Sarah Kim", assignedTo: "ac", assignedLabel: "AC Person" },
];

const getCurrentUser = () =>
  JSON.parse(localStorage.getItem("user") || '{"role":"owner","name":"School Owner"}');

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── Main Component ───────────────────────────────────────────────

const MaintenancePage = () => {
  const user = getCurrentUser();
  const isOwner = user.role === "owner";

  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState({});

  const updateStatus = (id, status) => {
    setStatusUpdates((prev) => ({ ...prev, [id]: status }));
  };

  const handleAddRequest = (req) => {
    setRequests((prev) => [req, ...prev]);
  };

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const s = statusUpdates[r.id] || r.status;
      if (filterPriority !== "all" && r.priority !== filterPriority) return false;
      if (filterStatus !== "all" && s !== filterStatus) return false;
      return true;
    });
  }, [requests, filterPriority, filterStatus, statusUpdates]);

  const sorted = useMemo(() => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...filtered].sort((a, b) => order[a.priority] - order[b.priority]);
  }, [filtered]);

  const stats = useMemo(() => {
    const open = requests.filter((r) => (statusUpdates[r.id] || r.status) !== "done").length;
    const critical = requests.filter((r) => r.priority === "critical" && (statusUpdates[r.id] || r.status) !== "done").length;
    const inProgress = requests.filter((r) => (statusUpdates[r.id] || r.status) === "in_progress").length;
    const done = requests.filter((r) => (statusUpdates[r.id] || r.status) === "done").length;
    const totalEstCost = requests.filter((r) => (statusUpdates[r.id] || r.status) !== "done").reduce((a, r) => a + r.estCost, 0);
    const directorSubmitted = requests.filter((r) => r.submittedBy !== "Owner").length;
    return { open, critical, inProgress, done, totalEstCost, total: requests.length, directorSubmitted };
  }, [requests, statusUpdates]);

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
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-600">
            <AlertTriangle size={12} /> {stats.critical} critical need attention
          </span>
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
          totalCount={requests.length}
        />
      </motion.div>

      {/* Maintenance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sorted.length > 0 ? (
          sorted.map((req) => {
            const status = statusUpdates[req.id] || req.status;
            return <RequestCard key={req.id} req={req} status={status} onUpdateStatus={updateStatus} isOwner={isOwner} />;
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

      {/* Cost Summary */}
      {stats.totalEstCost > 0 && (
        <motion.div variants={itemVariants}>
          <CostSummaryCard totalEstCost={stats.totalEstCost} openCount={stats.open} />
        </motion.div>
      )}

      {/* Add Form Modal */}
      {showForm && <AddMaintenanceForm onAdd={handleAddRequest} onClose={() => setShowForm(false)} />}
    </motion.div>
  );
};

export default MaintenancePage;
