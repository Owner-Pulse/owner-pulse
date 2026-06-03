import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Plus,
  Flag,
  X,
  Send,
  ListTodo,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ─── Data ─────────────────────────────────────────────────────────

const INITIAL_TASKS = [
  { id: 1, title: "Parent-teacher conference scheduling", assignee: "director", assignedBy: "owner", priority: "high", status: "in_progress", due: "2026-05-14", createdAt: "2026-05-01" },
  { id: 2, title: "Renew faculty CPR certifications", assignee: "director", assignedBy: "owner", priority: "high", status: "open", due: "2026-05-20", createdAt: "2026-05-02" },
  { id: 3, title: "Order Grade 5 yearbooks", assignee: "director", assignedBy: "owner", priority: "medium", status: "open", due: "2026-05-25", createdAt: "2026-05-03" },
  { id: 4, title: "Submit Step Up reconciliation", assignee: "director", assignedBy: "owner", priority: "high", status: "open", due: "2026-05-30", createdAt: "2026-05-04" },
  { id: 5, title: "Spring carnival vendor confirmation", assignee: "director", assignedBy: "owner", priority: "low", status: "in_progress", due: "2026-06-02", createdAt: "2026-05-05" },
  { id: 6, title: "Final report card review", assignee: "director", assignedBy: "owner", priority: "medium", status: "open", due: "2026-06-05", createdAt: "2026-05-06" },
  { id: 7, title: "HVAC vendor decision sign-off", assignee: "owner", assignedBy: "director", priority: "high", status: "open", due: "2026-05-12", createdAt: "2026-05-07" },
  { id: 8, title: "Approve PO — Playground equipment", assignee: "owner", assignedBy: "director", priority: "high", status: "open", due: "2026-05-14", createdAt: "2026-05-08" },
  { id: 9, title: "Review 5th grade teacher performance", assignee: "owner", assignedBy: "director", priority: "medium", status: "in_progress", due: "2026-05-22", createdAt: "2026-05-09" },
  { id: 10, title: "Sign Step Up Q4 attestation", assignee: "owner", assignedBy: "director", priority: "medium", status: "open", due: "2026-05-28", createdAt: "2026-05-10" },
];

const TODAY = new Date("2026-05-11");

const getCurrentUser = () => JSON.parse(localStorage.getItem('user') || '{"role":"owner","name":"School Owner","email":"owner@school.com"}');

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const daysUntil = (d) => Math.ceil((new Date(d) - TODAY) / 86400000);

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const PriorityTag = ({ priority }) => {
  const c = {
    high: { bg: "bg-red-50", text: "text-red-700" },
    medium: { bg: "bg-amber-50", text: "text-amber-700" },
    low: { bg: "bg-gray-50", text: "text-gray-600" },
  }[priority] || { bg: "bg-amber-50", text: "text-amber-700" };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}><Flag size={10} />{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>;
};

const StatusTag = ({ status }) => {
  const c = {
    open: { bg: "bg-gray-100", text: "text-gray-600", icon: ClipboardList },
    in_progress: { bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
    done: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  }[status] || { bg: "bg-gray-100", text: "text-gray-600", icon: ClipboardList };
  const Icon = c.icon;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}><Icon size={10} />{status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const AssigneeTag = ({ assignee }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${assignee === "owner" ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700"}`}>
    <Users size={10} /> {assignee === "owner" ? "Owner" : "Director"}
  </span>
);

const KpiCard = ({ icon: Icon, label, value, sub, iconBg }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${iconBg || "bg-blue-50 text-blue-600"}`}><Icon size={18} /></div>
      </div>
      {sub && <div className="mt-2 text-xs text-gray-500">{sub}</div>}
    </CardContent>
  </Card>
);

// ─── Assign Task Modal ────────────────────────────────────────────

const AssignTaskModal = ({ onClose, onAssign, currentRole }) => {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(currentRole === "owner" ? "director" : "owner");
  const [priority, setPriority] = useState("medium");
  const [due, setDue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !due) return;
    onAssign({
      id: Date.now(),
      title: title.trim(),
      assignee,
      assignedBy: currentRole,
      priority,
      status: "open",
      due,
      createdAt: new Date().toISOString().split("T")[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign Task</h2>
              <p className="text-sm text-gray-500 mt-0.5">Create a task for your team</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} className="text-gray-400" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Task Title</label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Order classroom supplies"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assign To</label>
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                  {currentRole === "owner" ? (
                    <option value="director">Director</option>
                  ) : (
                    <option value="owner">Owner</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
              <input
                type="date" value={due} onChange={(e) => setDue(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#0A0F1E] hover:bg-black text-white">
                <Send size={16} className="mr-2" /> Assign Task
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────

const TasksPage = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [taskStatuses, setTaskStatuses] = useState({});
  const [activeTab, setActiveTab] = useState("my");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState("all");

  const currentUser = getCurrentUser();
  const currentRole = currentUser.role;

  const toggleStatus = (id) => {
    setTaskStatuses((prev) => {
      const current = prev[id] || tasks.find((t) => t.id === id).status;
      const next = current === "open" ? "in_progress" : current === "in_progress" ? "done" : "open";
      return { ...prev, [id]: next };
    });
  };

  const handleAssign = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  // My tasks = assigned to current user
  const myTasks = useMemo(() => tasks.filter((t) => t.assignee === currentRole), [tasks, currentRole]);
  const allTasks = tasks;

  const visibleTasks = activeTab === "my" ? myTasks : allTasks;

  const filtered = useMemo(() => {
    return visibleTasks.filter((t) => {
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      return true;
    });
  }, [visibleTasks, filterPriority]);

  const sorted = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 };
    return [...filtered].sort((a, b) => order[a.priority] - order[b.priority]);
  }, [filtered]);

  const stats = useMemo(() => {
    const getStatus = (t) => taskStatuses[t.id] || t.status;
    const open = tasks.filter((t) => getStatus(t) !== "done").length;
    const high = tasks.filter((t) => t.priority === "high" && getStatus(t) !== "done").length;
    const myOpen = myTasks.filter((t) => getStatus(t) !== "done").length;
    const overdue = tasks.filter((t) => daysUntil(t.due) < 0 && getStatus(t) !== "done").length;
    const myOverdue = myTasks.filter((t) => daysUntil(t.due) < 0 && getStatus(t) !== "done").length;
    return { open, high, myOpen, overdue, myOverdue, total: tasks.length };
  }, [tasks, taskStatuses, myTasks]);

  const assigneeLabel = currentRole === "owner" ? "Director" : "Owner";

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">Tasks</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {stats.myOpen} assigned · {stats.open} open · {stats.overdue > 0 && <span className="text-red-500 font-medium">{stats.overdue} overdue</span>}
          </p>
        </div>
        <Button className="bg-[#0A0F1E] hover:bg-black text-white text-xs md:text-sm px-3 shrink-0" onClick={() => setShowAssignModal(true)}>
          <Plus size={14} className="mr-1.5" /> Assign
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={ListTodo} label="My Tasks" value={stats.myOpen} sub={`Assigned to ${currentRole}`} iconBg="bg-blue-50 text-blue-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={ClipboardList} label="Total Open" value={stats.open} sub={`${stats.total} total tasks`} iconBg="bg-purple-50 text-purple-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Flag} label="High Priority" value={stats.high} sub={stats.high === 1 ? "1 urgent item" : `${stats.high} urgent`} iconBg="bg-red-50 text-red-500" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={AlertTriangle} label="Overdue" value={stats.overdue} sub={stats.myOverdue > 0 ? `${stats.myOverdue} on you` : "All on track"} iconBg={stats.overdue > 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"} />
        </motion.div>
      </div>

      {/* Tabs: My Tasks / All Tasks + Priority filter */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 md:gap-3">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setActiveTab("my")}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-xs font-semibold transition-all ${activeTab === "my" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            My Tasks
          </button>
          <button onClick={() => setActiveTab("all")}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-xs font-semibold transition-all ${activeTab === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            All Tasks
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority:</span>
          {["all", "high", "medium", "low"].map((p) => (
            <button key={p} onClick={() => setFilterPriority(p)}
              className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold transition-all ${filterPriority === p ? "bg-gray-900 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
              {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-[10px] md:text-xs text-gray-400 ml-auto">{sorted.length} tasks</span>
      </motion.div>

      {/* Task Cards */}
      <div className="space-y-2">
        {sorted.length > 0 ? sorted.map((task) => {
          const status = taskStatuses[task.id] || task.status;
          const days = daysUntil(task.due);
          const isOverdue = days < 0 && status !== "done";
          const isDueSoon = days >= 0 && days <= 3 && status !== "done";
          const isDone = status === "done";
          const isForMe = task.assignee === currentRole;

          return (
            <motion.div key={task.id} variants={itemVariants}>
              <Card className={`bg-white border-none shadow-sm hover:shadow-md transition-all cursor-pointer ${isDone ? "opacity-60" : ""} ${isForMe ? "border-l-4 border-l-blue-400" : ""}`} onClick={() => toggleStatus(task.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Status checkbox */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isDone ? "bg-emerald-500 border-emerald-500" : isOverdue ? "border-red-400" : isDueSoon ? "border-amber-400" : "border-gray-300"}`}>
                      {isDone && <CheckCircle2 size={14} className="text-white" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-1.5 flex-wrap">
                        <span className={`text-xs md:text-sm font-semibold leading-snug ${isDone ? "text-gray-400 line-through" : "text-gray-900"}`}>{task.title}</span>
                        <div className="flex flex-wrap items-center gap-1">
                          <PriorityTag priority={task.priority} />
                          <StatusTag status={status} />
                          <AssigneeTag assignee={task.assignee} />
                          {isForMe && <span className="text-[9px] md:text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Mine</span>}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-500 font-semibold" : isDueSoon ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
                          <Calendar size={10} /> Due {fmtDate(task.due)}
                          {isOverdue && ` · ${Math.abs(days)}d overdue`}
                          {isDueSoon && ` · ${days}d left`}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">By {task.assignedBy}</span>
                      </div>
                    </div>
                    <div className="text-[9px] md:text-[10px] text-gray-300 flex-shrink-0 hidden sm:block">{!isDone ? "Click to progress" : "↺"}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        }) : (
          <div className="py-12 text-center">
            <ClipboardList size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">
              {activeTab === "my" ? "No tasks assigned to you yet." : "No tasks match the selected filters."}
            </p>
          </div>
        )}
      </div>

      {/* Assign Task Modal */}
      {showAssignModal && (
        <AssignTaskModal
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssign}
          currentRole={currentRole}
        />
      )}
    </motion.div>
  );
};

export default TasksPage;
