import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Flag,
  AlertTriangle,
  ListTodo,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import TaskCard from "./components/TaskCard";
import TaskFilters from "./components/TaskFilters";
import AssignTaskModal from "./components/AssignTaskModal";
import { useGetTaskList } from "@/hooks/owner-task-assign";
import { useGetUser } from "@/hooks";

const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const TasksPage = () => {
  const { user, refetch } = useGetUser();
  const { taskList, isTaskListLoading, refetchTaskList } = useGetTaskList();
  console.log("Task list", taskList);


  const [tasks, setTasks] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState({});
  const [activeTab, setActiveTab] = useState("my");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    if (Array.isArray(taskList)) {
      const mappedTasks = taskList.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        assignee: t.assignee?.role || "unassigned",
        assignedBy: t.creator?.role || "unknown",
        priority: t.priority || "medium",
        status: t.status === "pending" ? "open" : t.status,
        due: t.due_date,
        createdAt: t.created_at,
      }));
      setTasks(mappedTasks);
    }
  }, [taskList]);

  const currentRole = user?.role;

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

  const myTasks = useMemo(() => tasks.filter((t) => t.assignee === currentRole), [tasks, currentRole]);
  const visibleTasks = activeTab === "my" ? myTasks : tasks;

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
        <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm px-3 shrink-0" onClick={() => setShowAssignModal(true)}>
          <Plus size={14} className="mr-1.5" /> Assign
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={ListTodo} label="My Tasks" value={stats.myOpen} sub={`Assigned to ${currentRole}`} iconBg="bg-blue-50 text-blue-600" />
        <KpiCard icon={ClipboardList} label="Total Open" value={stats.open} sub={`${stats.total} total tasks`} iconBg="bg-purple-50 text-purple-600" />
        <KpiCard icon={Flag} label="High Priority" value={stats.high} sub={stats.high === 1 ? "1 urgent item" : `${stats.high} urgent`} iconBg="bg-red-50 text-red-500" />
        <KpiCard icon={AlertTriangle} label="Overdue" value={stats.overdue} sub={stats.myOverdue > 0 ? `${stats.myOverdue} on you` : "All on track"} iconBg={stats.overdue > 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"} />
      </div>

      {/* Filters */}
      <TaskFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filterPriority={filterPriority}
        onFilterChange={setFilterPriority}
        totalCount={sorted.length}
      />

      {/* Task Cards */}
      <div className="space-y-2">
        {isTaskListLoading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">Loading tasks...</p>
          </div>
        ) : sorted.length > 0 ? sorted.map((task) => {
          const status = taskStatuses[task.id] || task.status;
          return (
            <TaskCard
              key={task.id}
              task={task}
              status={status}
              currentRole={currentRole}
              daysUntil={daysUntil}
              onToggle={() => toggleStatus(task.id)}
            />
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
