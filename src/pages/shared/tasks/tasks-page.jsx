import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Flag,
  AlertTriangle,
  ListTodo,
  Plus,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import TaskCard from "./components/TaskCard";
import TaskFilters from "./components/TaskFilters";
import AssignTaskModal from "./components/AssignTaskModal";
import { useGetTaskList } from "@/hooks/owner-hook/task-assign.hook";
import { useGetDirectorTaskList } from "@/hooks/director-hook/task-assign.hook";
import { useGetUser } from "@/hooks/auth/user-details.hook";
import { daysFromToday } from "@/lib/datetime";

const daysUntil = (d) => daysFromToday(d) || 0;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

// Wrapper: loads owner tasks
const OwnerTasksLoader = (props) => {
  const { taskList, isTaskListLoading } = useGetTaskList();
  return <TasksPageInner {...props} taskList={taskList} isTaskListLoading={isTaskListLoading} />;
};

// Wrapper: loads director tasks
const DirectorTasksLoader = (props) => {
  const { taskList, isTaskListLoading } = useGetDirectorTaskList();
  return <TasksPageInner {...props} taskList={taskList} isTaskListLoading={isTaskListLoading} />;
};

const TasksPage = () => {
  const { user } = useGetUser();
  const currentRole = user?.role;

  if (currentRole === "director") return <DirectorTasksLoader currentRole={currentRole} user={user} />;
  return <OwnerTasksLoader currentRole={currentRole} user={user} />;
};

const isDone = (status) => status === "done" || status === "completed" || status === "cancelled";
const sameId = (a, b) => a != null && b != null && Number(a) === Number(b);

const TasksPageInner = ({ currentRole, user, taskList, isTaskListLoading }) => {
  const [tasks, setTasks] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState({});
  const [activeTab, setActiveTab] = useState("assigned");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState("all");

  const isDirector = currentRole === "director";
  const sentTarget = isDirector ? "Owner" : "Director";
  const sentLabel = `Sent to ${sentTarget}`;

  useEffect(() => {
    const rawList = Array.isArray(taskList)
      ? taskList
      : (Array.isArray(taskList?.data) ? taskList.data : []);

    if (rawList && rawList.length > 0) {
      const mappedTasks = rawList.map((t) => {
        // created_by / assigned_to arrive as an id or as a { id, role } object
        const creator = t.creator || (t.created_by && typeof t.created_by === "object" ? t.created_by : null);
        const assignee = t.assignee || (t.assigned_to && typeof t.assigned_to === "object" ? t.assigned_to : null);
        const creatorId = creator?.id ?? (typeof t.created_by === "object" ? null : t.created_by);
        const assignedToId = assignee?.id ?? (typeof t.assigned_to === "object" ? null : t.assigned_to) ?? null;
        const creatorRole = (creator?.role || "").toLowerCase();
        // No assignee means the task is for all directors
        const assigneeRole = (assignee?.role || (assignedToId == null ? "director" : "")).toLowerCase();

        return {
          id: t.id,
          title: t.title,
          description: t.description,
          assignee: assigneeRole,
          assignedToId,
          creatorId,
          creatorRole,
          assignedBy: creatorRole,
          priority: t.priority || "medium",
          status: t.status === "pending" ? "open" : t.status,
          due: t.due_date,
          createdAt: t.created_at,
          raw: t,
        };
      });
      setTasks(mappedTasks);
    } else {
      setTasks([]);
    }
  }, [taskList]);

  const updateStatus = (id, newStatus) => {
    setTaskStatuses((prev) => ({ ...prev, [id]: newStatus }));
  };

  const handleAssign = (newTask) => {
    // Shown until the refetch replaces it; a task you just assigned is one you sent
    setTasks((prev) => [...prev, { ...newTask, creatorId: user?.id, creatorRole: currentRole }]);
  };

  const isAssignedToMe = useCallback(
    (t) => sameId(t.assignedToId, user?.id) || (isDirector && t.assignedToId === null),
    [user?.id, isDirector]
  );

  const myTasks = useMemo(() => tasks.filter(isAssignedToMe), [tasks, isAssignedToMe]);

  const sentTasks = useMemo(
    () => tasks.filter((t) => sameId(t.creatorId, user?.id) && !isAssignedToMe(t)),
    [tasks, user?.id, isAssignedToMe]
  );

  const visibleTasks = activeTab === "assigned" ? myTasks : activeTab === "sent" ? sentTasks : tasks;

  const filtered = useMemo(() => {
    return visibleTasks.filter((t) => filterPriority === "all" || t.priority === filterPriority);
  }, [visibleTasks, filterPriority]);

  const sorted = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 };
    return [...filtered].sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
  }, [filtered]);

  const stats = useMemo(() => {
    const isOpen = (t) => !isDone(taskStatuses[t.id] || t.status);
    const open = tasks.filter(isOpen).length;
    const high = tasks.filter((t) => t.priority === "high" && isOpen(t)).length;
    const myOpen = myTasks.filter(isOpen).length;
    const sentOpen = sentTasks.filter(isOpen).length;
    const overdue = tasks.filter((t) => daysUntil(t.due) < 0 && isOpen(t)).length;
    const myOverdue = myTasks.filter((t) => daysUntil(t.due) < 0 && isOpen(t)).length;
    return { open, high, myOpen, sentOpen, overdue, myOverdue, total: tasks.length };
  }, [tasks, taskStatuses, myTasks, sentTasks]);

  const emptyMessage =
    filterPriority !== "all"
      ? "No tasks match the selected filters."
      : activeTab === "assigned"
        ? "No tasks assigned to you yet."
        : activeTab === "sent"
          ? `No tasks sent to the ${sentTarget} yet.`
          : "No tasks yet.";

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">Tasks</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {stats.myOpen} assigned to you · {stats.sentOpen} sent · {stats.open} open
            {stats.overdue > 0 && <span className="text-[#8A362C] font-medium"> · {stats.overdue} overdue</span>}
          </p>
        </div>
        <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm px-3 shrink-0" onClick={() => setShowAssignModal(true)}>
          <Plus size={14} className="mr-1.5" /> Assign
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={ListTodo} label="My Tasks" value={stats.myOpen} sub="Open, assigned to you" iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
        <KpiCard icon={Send} label="Sent by me" value={stats.sentOpen} sub={`Open, sent to ${sentTarget}`} iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
        <KpiCard icon={Flag} label="High Priority" value={stats.high} sub={stats.high === 1 ? "1 urgent item" : `${stats.high} urgent`} iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]" />
        <KpiCard icon={AlertTriangle} label="Overdue" value={stats.overdue} sub={stats.myOverdue > 0 ? `${stats.myOverdue} on you` : "All on track"} iconBg={stats.overdue > 0 ? "bg-[#AE4A3E]/10 text-[#8A362C]" : "bg-[#3E7A54]/10 text-[#2F6042]"} />
      </div>

      {/* Filters */}
      <TaskFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filterPriority={filterPriority}
        onFilterChange={setFilterPriority}
        sentLabel={sentLabel}
        totalCount={sorted.length}
      />

      {/* Task Cards */}
      <div className="space-y-2">
        {isTaskListLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-100 rounded w-16"></div>
                      <div className="h-4 bg-gray-100 rounded w-16"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 bg-gray-100 rounded w-24"></div>
                      <div className="h-3 bg-gray-100 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="shrink-0 hidden sm:flex gap-2">
                    <div className="h-7 w-16 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : sorted.length > 0 ? sorted.map((task) => {
          const status = taskStatuses[task.id] || task.status;
          return (
            <TaskCard
              key={task.id}
              task={task}
              isForMe={isAssignedToMe(task)}
              canManage={sameId(task.creatorId, user?.id)}
              status={status}
              currentRole={currentRole}
              daysUntil={daysUntil}
              onUpdateStatus={(newStatus) => updateStatus(task.id, newStatus)}
            />
          );
        }) : (
          <div className="py-12 text-center">
            <ClipboardList size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">{emptyMessage}</p>
            {activeTab === "assigned" && sentTasks.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                You have {sentTasks.length} {sentTasks.length === 1 ? "task" : "tasks"} sent to the {sentTarget}.{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("sent")}
                  className="font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
                >
                  View them
                </button>
              </p>
            )}
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
