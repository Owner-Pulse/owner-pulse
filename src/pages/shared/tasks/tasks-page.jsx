import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
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
import MyEscalations from "./components/MyEscalations";
import { usePendingEscalationCount } from "@/hooks/escalation.hook";
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
  const [activeTab, setActiveTab] = useState("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState("all");

  const isDirector = currentRole === "director";
  const pendingEscalations = usePendingEscalationCount("director", isDirector);
  const showEscalations = isDirector && activeTab === "escalations";

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
    (t) => sameId(t.assignedToId, user?.id) || (isDirector && t.assignedToId === null && !sameId(t.creatorId, user?.id)),
    [user?.id, isDirector]
  );

  const createdByMe = useCallback((t) => sameId(t.creatorId, user?.id), [user?.id]);

  const groups = useMemo(() => {
    const toSelf = tasks.filter((t) => createdByMe(t) && sameId(t.assignedToId, user?.id));
    const sentToOther = tasks.filter((t) => createdByMe(t) && !sameId(t.assignedToId, user?.id));
    const fromOther = tasks.filter((t) => !createdByMe(t) && isAssignedToMe(t));
    if (isDirector) {
      return [
        { id: "from_owner", label: "Assigned by Owner", tasks: fromOther },
        { id: "to_self", label: "Assigned to myself", tasks: toSelf },
        { id: "to_owner", label: "Sent to Owner", tasks: sentToOther },
      ];
    }
    return [
      { id: "to_director", label: "Assigned to Director", tasks: sentToOther },
      { id: "from_director", label: "Assigned by Director", tasks: fromOther },
      { id: "to_self", label: "Assigned to myself", tasks: toSelf },
    ];
  }, [tasks, isDirector, createdByMe, isAssignedToMe, user?.id]);

  const stats = useMemo(() => {
    const isOpen = (t) => !isDone(taskStatuses[t.id] || t.status);
    const counts = Object.fromEntries(groups.map((group) => [group.id, group.tasks.filter(isOpen).length]));
    const overdue = tasks.filter((t) => daysUntil(t.due) < 0 && isOpen(t)).length;
    return { counts, overdue };
  }, [tasks, taskStatuses, groups]);

  const filterTabs = [
    ...groups.map((group) => ({ id: group.id, label: group.label })),
    { id: "all", label: "All" },
    ...(isDirector ? [{ id: "escalations", label: "My escalations", count: pendingEscalations, extra: true }] : []),
  ];

  const visibleGroups = activeTab === "all" ? groups : groups.filter((group) => group.id === activeTab);
  const priorityOf = (task) => filterPriority === "all" || task.priority === filterPriority;
  const byPriority = (list) => {
    const order = { high: 0, medium: 1, low: 2 };
    return list.filter(priorityOf).sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
  };

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">Tasks</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {groups.map((group) => `${stats.counts[group.id] || 0} ${group.label.toLowerCase()}`).join(" · ")}
            {stats.overdue > 0 && <span className="text-[#8A362C] font-medium"> · {stats.overdue} overdue</span>}
          </p>
        </div>
        <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm px-3 shrink-0" onClick={() => setShowAssignModal(true)}>
          <Plus size={14} className="mr-1.5" /> Assign
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {groups.map((group) => (
          <KpiCard
            key={group.id}
            icon={group.id.includes("self") ? ListTodo : Send}
            label={group.label}
            value={stats.counts[group.id] || 0}
            sub="Open tasks you can track"
            iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
          />
        ))}
        <KpiCard icon={AlertTriangle} label="Overdue" value={stats.overdue} sub={stats.overdue > 0 ? "Needs a look" : "All on track"} iconBg={stats.overdue > 0 ? "bg-[#AE4A3E]/10 text-[#8A362C]" : "bg-[#3E7A54]/10 text-[#2F6042]"} />
      </div>

      {/* Filters */}
      <TaskFilters
        tabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filterPriority={filterPriority}
        onFilterChange={setFilterPriority}
        totalCount={visibleGroups.reduce((sum, group) => sum + byPriority(group.tasks).length, 0)}
      />

      {/* Director: everything sent to the Owner, with status and the Owner's note */}
      {showEscalations && <MyEscalations />}

      {/* Task Cards */}
      {!showEscalations && (
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
        ) : (
          <div className="space-y-5">
            {visibleGroups.map((group) => {
              const rows = byPriority(group.tasks);
              return (
                <div key={group.id} className="space-y-2">
                  <h2 className="text-sm font-bold text-gray-900">{group.label}</h2>
                  {rows.length > 0 ? rows.map((task) => {
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
                    <p className="text-sm text-gray-500 py-3">
                      {filterPriority !== "all" ? "No tasks match this priority." : `Nothing in ${group.label.toLowerCase()}.`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

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
