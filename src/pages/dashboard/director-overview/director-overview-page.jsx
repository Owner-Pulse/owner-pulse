import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  UserCheck,
  ClipboardList,
  Wrench,
  Calendar,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const TODAY = new Date("2026-05-11");

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtRelative = (d) => {
  const diff = Math.ceil((new Date(d) - TODAY) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  return `${Math.abs(diff)} days ago`;
};

const daysUntil = (d) => Math.ceil((new Date(d) - TODAY) / 86400000);

// ─── Data ───────────────────────────────────────────────────────

const SEEDED_TASKS = [
  { id: 1, title: "Parent-teacher conference scheduling", priority: "high", status: "in_progress", due: "2026-05-14" },
  { id: 2, title: "Renew faculty CPR certifications", priority: "high", status: "open", due: "2026-05-20" },
  { id: 3, title: "Order Grade 5 yearbooks", priority: "medium", status: "open", due: "2026-05-25" },
  { id: 4, title: "Step Up Q4 attestation", priority: "high", status: "open", due: "2026-05-28" },
  { id: 5, title: "Scholarship renewal letters", priority: "low", status: "open", due: "2026-06-01" },
];

const SEEDED_INCIDENTS = [
  { id: 101, date: "2026-05-07", student: "Student A.", severity: "minor", classroom: "PreK3 — Caterpillars", area: "Playground", description: "Pushed another student on slide" },
  { id: 102, date: "2026-05-03", student: "Student C.", severity: "moderate", classroom: "1st — Redwood", area: "Classroom", description: "Refused to follow instructions, disruptive" },
  { id: 103, date: "2026-04-22", student: "Student D.", severity: "major", classroom: "2nd — Willow", area: "Playground", description: "Physical altercation with peer" },
];

const SEEDED_REMOVALS = [
  { id: 201, date: "2026-05-04", student: "Student B.", reason: "behavioral", classroom: "3rd — Oak", detail: "Repeated behavioral issues after interventions" },
  { id: 202, date: "2026-04-15", student: "Student E.", reason: "transferring", classroom: "5th — Pine", detail: "Family relocating out of state" },
];

const SEEDED_MAINTENANCE = [
  { id: 1, location: "K — Sequoia", issue: "AC unit not cooling", priority: "critical", status: "open" },
  { id: 2, location: "Playground", issue: "Swing chain snapped", priority: "high", status: "in_progress" },
  { id: 3, location: "Cafeteria", issue: "Refrigerator temp running warm", priority: "critical", status: "open" },
];

const SEEDED_PTO = [
  { staff: "Ms. Cohen", type: "personal", days: 1, date: "2026-05-06" },
  { staff: "Ms. Patel", type: "sick", days: 1, date: "2026-05-08" },
];

const CLASSROOMS = [
  "Age 1 — Bumblebees", "Age 2 — Ladybugs", "PreK3 — Caterpillars", "PreK4 — Butterflies",
  "VPK — Fireflies", "K — Sequoia", "1st — Redwood", "2nd — Willow", "3rd — Oak",
  "4th — Maple", "5th — Pine", "6th — Cedar", "7th — Birch", "8th — Aspen",
];

const DirectorOverviewPage = () => {
  const navigate = useNavigate();

  // KPIs
  const openTasks = SEEDED_TASKS.filter(t => t.status !== "done").length;
  const highPriorityTasks = SEEDED_TASKS.filter(t => t.priority === "high" && t.status !== "done").length;
  const recentIncidents = SEEDED_INCIDENTS.filter(i => {
    const diff = Math.ceil((TODAY - new Date(i.date)) / 86400000);
    return diff <= 14;
  }).length;
  const majorIncidents = SEEDED_INCIDENTS.filter(i => i.severity === "major").length;
  const openMaintenance = SEEDED_MAINTENANCE.filter(m => m.status !== "done").length;
  const criticalMaintenance = SEEDED_MAINTENANCE.filter(m => m.priority === "critical" && m.status !== "done").length;

  // Incident stats by classroom
  const incidentByClassroom = useMemo(() => {
    const map = {};
    SEEDED_INCIDENTS.forEach(i => {
      map[i.classroom] = (map[i.classroom] || 0) + 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, []);

  // Upcoming deadlines
  const urgentTasks = SEEDED_TASKS
    .filter(t => t.status !== "done" && daysUntil(t.due) <= 7)
    .sort((a, b) => daysUntil(a.due) - daysUntil(b.due));

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Director Dashboard
            {criticalMaintenance > 0 && (
              <span className="ml-3 inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                {criticalMaintenance} critical
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/dashboard/tasks")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Open Tasks</p>
                  <p className="text-2xl font-bold text-blue-600">{openTasks}</p>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ClipboardList size={18} /></div>
              </div>
              <p className="text-[10px] text-red-500 mt-1">{highPriorityTasks} high priority due soon</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/dashboard/director-students")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Incidents</p>
                  <p className="text-2xl font-bold text-red-600">{SEEDED_INCIDENTS.length}</p>
                </div>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={18} /></div>
              </div>
              <p className="text-[10px] text-red-500 mt-1">{recentIncidents} in last 14 days · {majorIncidents} major</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/dashboard/maintenance")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Maintenance</p>
                  <p className="text-2xl font-bold text-amber-600">{openMaintenance}</p>
                </div>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Wrench size={18} /></div>
              </div>
              <p className="text-[10px] text-red-500 mt-1">{criticalMaintenance} critical items</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/dashboard/director-staff")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{SEEDED_PTO.length} PTO</p>
                </div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><UserCheck size={18} /></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Active this week</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Urgent Tasks */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardList size={16} className="text-blue-500" />
                  Urgent Tasks (Due ≤ 7 days)
                </CardTitle>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => navigate("/dashboard/tasks")}>View all</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {urgentTasks.length > 0 ? urgentTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${t.priority === "high" ? "bg-red-500" : "bg-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="capitalize">{t.status.replace("_", " ")}</span>
                      <span>·</span>
                      <span className={daysUntil(t.due) <= 0 ? "text-red-500 font-medium" : ""}>
                        {daysUntil(t.due) <= 0 ? "Overdue!" : `Due ${fmtDate(t.due)} (${daysUntil(t.due)}d)`}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              )) : (
                <div className="text-center py-6">
                  <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No urgent tasks! Great job.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Incidents */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  Recent Incidents
                </CardTitle>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => navigate("/dashboard/director-students")}>View all</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {SEEDED_INCIDENTS.slice(0, 3).map((inc) => (
                <div key={inc.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                    inc.severity === "major" ? "bg-red-500" :
                    inc.severity === "moderate" ? "bg-orange-500" : "bg-amber-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{inc.student}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        inc.severity === "major" ? "bg-red-100 text-red-700" :
                        inc.severity === "moderate" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"
                      }`}>{inc.severity}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{inc.classroom} · {inc.area}</p>
                    <p className="text-[10px] text-gray-400">{fmtRelative(inc.date)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Second Row: Incidents by Classroom + Maintenance + Upcoming */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Incidents by Classroom */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp size={16} className="text-amber-500" />
                Incidents by Classroom
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {incidentByClassroom.length > 0 ? incidentByClassroom.map(([cls, count], i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 flex-1 truncate">{cls}</span>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      count >= 2 ? "bg-red-500" : count === 1 ? "bg-amber-500" : "bg-blue-500"
                    }`} style={{ width: `${(count / Math.max(...incidentByClassroom.map(([, c]) => c))) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-900 w-4 text-right">{count}</span>
                </div>
              )) : <p className="text-sm text-gray-400 text-center py-4">No incidents recorded</p>}
            </CardContent>
          </Card>
        </motion.div>

        {/* Open Maintenance */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wrench size={16} className="text-amber-500" />
                  Open Maintenance
                </CardTitle>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => navigate("/dashboard/maintenance")}>View all</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {SEEDED_MAINTENANCE.filter(m => m.status !== "done").slice(0, 3).map((m) => (
                <div key={m.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                    m.priority === "critical" ? "bg-red-500" :
                    m.priority === "high" ? "bg-orange-500" : "bg-amber-500"
                  }`} />
                  <div>
                    <p className="text-xs font-medium text-gray-900">{m.issue}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
                      <span>{m.location}</span>
                      <span>·</span>
                      <span className={`font-medium ${
                        m.priority === "critical" ? "text-red-500" : "text-amber-500"
                      }`}>{m.priority}</span>
                      <span>·</span>
                      <span className="capitalize">{m.status.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming & Payroll */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2.5 rounded-lg bg-blue-50">
                <p className="text-xs font-semibold text-gray-900">Next Payroll</p>
                <p className="text-[10px] text-blue-600">May 15 · 4 days away</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50">
                <p className="text-xs font-semibold text-gray-900">CPR Certification Renewal</p>
                <p className="text-[10px] text-amber-600">Due May 20 · 4 staff affected</p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-50">
                <p className="text-xs font-semibold text-gray-900">Step Up Q4 Attestation</p>
                <p className="text-[10px] text-purple-600">Due May 28 · Your signature needed</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50">
                <p className="text-xs font-semibold text-gray-900">End of Year Ceremony</p>
                <p className="text-[10px] text-emerald-600">June 5 · Plan logistics</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="flex items-center gap-2 h-auto py-3" onClick={() => navigate("/dashboard/director-students")}>
                <AlertTriangle size={16} className="text-red-500" /> Log Incident
              </Button>
              <Button variant="outline" className="flex items-center gap-2 h-auto py-3" onClick={() => navigate("/dashboard/director-staff")}>
                <UserCheck size={16} className="text-blue-500" /> Log PTO
              </Button>
              <Button variant="outline" className="flex items-center gap-2 h-auto py-3" onClick={() => navigate("/dashboard/maintenance")}>
                <Wrench size={16} className="text-amber-500" /> Report Issue
              </Button>
              <Button variant="outline" className="flex items-center gap-2 h-auto py-3" onClick={() => navigate("/dashboard/payroll")}>
                <Calendar size={16} className="text-purple-500" /> Run Payroll
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DirectorOverviewPage;
