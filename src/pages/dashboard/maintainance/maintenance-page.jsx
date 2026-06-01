import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  DollarSign,
  MapPin,
  Plus,
  X,
  Send,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ─── Data ─────────────────────────────────────────────────────────

const INITIAL_REQUESTS = [
  { id: 1, location: "K — Sequoia", issue: "AC unit not cooling", priority: "critical", status: "open", logged: "2026-05-09", estCost: 1200, submittedBy: "Director Sarah Kim" },
  { id: 2, location: "Cafeteria", issue: "Plumbing — sink backup", priority: "high", status: "in_progress", logged: "2026-05-07", estCost: 450, submittedBy: "Director Sarah Kim" },
  { id: 3, location: "Playground", issue: "Swing chain replacement", priority: "high", status: "open", logged: "2026-05-10", estCost: 180, submittedBy: "Director Marcus Webb" },
  { id: 4, location: "2nd — Willow", issue: "Light fixture flickering", priority: "low", status: "open", logged: "2026-05-05", estCost: 75, submittedBy: "Owner" },
  { id: 5, location: "Front office", issue: "Door lock sticky", priority: "medium", status: "done", logged: "2026-05-02", estCost: 110, submittedBy: "Director Sarah Kim" },
  { id: 6, location: "Boiler room", issue: "Water heater making noise", priority: "medium", status: "open", logged: "2026-05-11", estCost: 350, submittedBy: "Director Sarah Kim" },
];

const TODAY = new Date("2026-05-11");
const getCurrentUser = () =>
  JSON.parse(localStorage.getItem("user") || '{"role":"owner","name":"School Owner"}');

// ─── Helpers ──────────────────────────────────────────────────────

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const fmtDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const daysSince = (dateStr) => Math.floor((TODAY - new Date(dateStr)) / 86400000);

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── Priority Tag ─────────────────────────────────────────────────

const PriorityTag = ({ priority }) => {
  const config = {
    critical: { bg: "bg-red-50", text: "text-red-700", label: "Critical" },
    high: { bg: "bg-orange-50", text: "text-orange-700", label: "High" },
    medium: { bg: "bg-amber-50", text: "text-amber-700", label: "Medium" },
    low: { bg: "bg-gray-50", text: "text-gray-600", label: "Low" },
  };
  const c = config[priority] || config.medium;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>
      {priority === "critical" && <AlertTriangle size={10} />}
      {c.label}
    </span>
  );
};

// ─── Status Tag ───────────────────────────────────────────────────

const StatusTag = ({ status }) => {
  const config = {
    open: { bg: "bg-gray-100", text: "text-gray-600", label: "Open" },
    in_progress: { bg: "bg-blue-50", text: "text-blue-700", label: "In Progress" },
    done: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Done" },
  };
  const c = config[status] || config.open;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>
      {status === "done" ? <CheckCircle2 size={10} /> : status === "in_progress" ? <Clock size={10} /> : <Wrench size={10} />}
      {c.label}
    </span>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, iconBg, valueColor }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className={`text-2xl font-bold ${valueColor || "text-gray-900"}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${iconBg || "bg-blue-50 text-blue-600"}`}><Icon size={18} /></div>
      </div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </CardContent>
  </Card>
);

// ─── Add Maintenance Form Modal ───────────────────────────────────

const AddMaintenanceForm = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({ location: "", issue: "", priority: "medium", estCost: "" });
  const [error, setError] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.location.trim()) { setError("Location is required."); return; }
    if (!form.issue.trim()) { setError("Issue description is required."); return; }

    const user = getCurrentUser();

    onAdd({
      id: Date.now(),
      location: form.location.trim(),
      issue: form.issue.trim(),
      priority: form.priority,
      status: "open",
      logged: new Date().toISOString().split("T")[0],
      estCost: Number(form.estCost) || 0,
      submittedBy: user.name || "Director",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Maintenance Request</h2>
              <p className="text-sm text-gray-500 mt-0.5">Report a facility issue for the owner to review</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Location *</label>
              <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. K — Sequoia, Cafeteria, Playground"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Issue */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Issue Description *</label>
              <textarea value={form.issue} onChange={(e) => update("issue", e.target.value)}
                placeholder="Describe the problem clearly…"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            {/* Priority + Est Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Priority</label>
                <select value={form.priority} onChange={(e) => update("priority", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Est. Cost ($)</label>
                <input type="number" value={form.estCost} onChange={(e) => update("estCost", e.target.value)}
                  placeholder="0.00" min={0}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-xs text-red-600 font-medium">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#0A0F1E] hover:bg-black text-white">
                <Send size={16} className="mr-2" /> Submit Request
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Maintenance Request Card ─────────────────────────────────────

const RequestCard = ({ req, status, onUpdateStatus, isOwner }) => {
  const days = daysSince(req.logged);
  const isDone = status === "done";
  const borderColor = isDone ? "border-l-emerald-500"
    : req.priority === "critical" ? "border-l-red-500"
    : req.priority === "high" ? "border-l-orange-500"
    : req.priority === "medium" ? "border-l-amber-500"
    : "border-l-gray-400";

  return (
    <motion.div variants={itemVariants}>
      <Card className={`bg-white border-none shadow-sm hover:shadow-md transition-all border-l-4 ${borderColor} ${isDone ? "opacity-60" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">{req.issue}</h3>
                <PriorityTag priority={req.priority} />
                <StatusTag status={status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={10} /> {req.location}</span>
                <span className="flex items-center gap-1"><Calendar size={10} /> {fmtDate(req.logged)} ({days}d ago)</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                <User size={10} /> Submitted by {req.submittedBy}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {req.estCost > 0 && (
                <>
                  <span className="text-sm font-bold text-gray-900">{fmtMoney(req.estCost)}</span>
                  <p className="text-[10px] text-gray-400">estimated</p>
                </>
              )}
            </div>
          </div>

          {/* Status actions - Owner can mark complete, Director can see status */}
          {isOwner && !isDone && (
            <div className="mt-3 flex gap-1.5">
              {["open", "in_progress", "done"].map((s) => (
                <button key={s} onClick={() => onUpdateStatus(req.id, s)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                    status === s
                      ? s === "done" ? "bg-emerald-500 text-white"
                        : s === "in_progress" ? "bg-blue-500 text-white"
                        : "bg-gray-500 text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                  }`}>
                  {s === "done" ? "✓ Complete" : s === "in_progress" ? "⟳ In Progress" : "○ Open"}
                </button>
              ))}
            </div>
          )}
          {isDone && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle2 size={12} />
              <span className="font-medium">Completed</span>
              {isOwner && (
                <button onClick={() => onUpdateStatus(req.id, "open")} className="text-gray-400 hover:text-gray-600 ml-auto">Reopen</button>
              )}
            </div>
          )}
          {/* Director sees a status note */}
          {!isOwner && status === "open" && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-400">
              <Clock size={10} /> Awaiting owner review
            </div>
          )}
          {!isOwner && status === "in_progress" && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-500 font-medium">
              <Clock size={10} /> Being worked on
            </div>
          )}
          {!isOwner && status === "done" && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium">
              <CheckCircle2 size={10} /> Resolved by owner
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
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
            {!isOwner && <span className="ml-2">· {stats.directorSubmitted} requests submitted</span>}
            {isOwner && <span className="ml-2">· {stats.directorSubmitted} from directors</span>}
          </p>
        </div>
        {/* Director: Add button / Owner: no add but sees count */}
        {!isOwner && (
          <Button className="bg-[#0A0F1E] hover:bg-black text-white shadow-sm" onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" /> Report Issue
          </Button>
        )}
        {isOwner && stats.critical > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-600">
            <AlertTriangle size={12} /> {stats.critical} critical need attention
          </span>
        )}
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
          <KpiCard icon={CheckCircle2} label="Completed" value={stats.done} sub={`${stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}% resolved`} iconBg="bg-emerald-50 text-emerald-600" />
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority:</span>
          {[{ id: "all", label: "All" }, { id: "critical", label: "Critical" }, { id: "high", label: "High" }, { id: "medium", label: "Medium" }, { id: "low", label: "Low" }].map((f) => (
            <button key={f.id} onClick={() => setFilterPriority(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterPriority === f.id ? "bg-[#0A0F1E] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
              {f.label}
            </button>
          ))}
          <span className="text-gray-200 mx-1">|</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status:</span>
          {[{ id: "all", label: "All" }, { id: "open", label: "Open" }, { id: "in_progress", label: "In Progress" }, { id: "done", label: "Done" }].map((f) => (
            <button key={f.id} onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === f.id ? "bg-gray-900 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{sorted.length} of {requests.length} requests</span>
      </motion.div>

      {/* Maintenance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sorted.length > 0 ? (
          sorted.map((req) => {
            const status = statusUpdates[req.id] || req.status;
            return (
              <RequestCard
                key={req.id}
                req={req}
                status={status}
                onUpdateStatus={updateStatus}
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
              {!isOwner ? "Click \"Report Issue\" to submit a new maintenance request" : "Adjust filters to see more results"}
            </p>
          </div>
        )}
      </div>

      {/* Cost Summary */}
      {stats.totalEstCost > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg"><DollarSign size={18} className="text-purple-600" /></div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Estimated Cost for Open Items</p>
                    <p className="text-lg font-bold text-gray-900">{fmtMoney(stats.totalEstCost)}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {stats.open} open {stats.open === 1 ? "request" : "requests"}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add Form Modal */}
      {showForm && <AddMaintenanceForm onAdd={handleAddRequest} onClose={() => setShowForm(false)} />}
    </motion.div>
  );
};

export default MaintenancePage;
