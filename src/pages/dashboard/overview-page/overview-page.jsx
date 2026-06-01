import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  FileText,
  ClipboardList,
  Wrench,
  UserCheck,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ─── Data from App.jsx ──────────────────────────────────────────────

const revenueData = [
  { name: "Jan", revenue: 145000, expenses: 95000, tuition: 125000, scholarships: 20000 },
  { name: "Feb", revenue: 152000, expenses: 98000, tuition: 130000, scholarships: 22000 },
  { name: "Mar", revenue: 158000, expenses: 94000, tuition: 135000, scholarships: 23000 },
  { name: "Apr", revenue: 165000, expenses: 102000, tuition: 140000, scholarships: 25000 },
  { name: "May", revenue: 172000, expenses: 99000, tuition: 145000, scholarships: 27000 },
  { name: "Jun", revenue: 184200, expenses: 105000, tuition: 155000, scholarships: 29200 },
];

const enrollmentData = [
  { name: "PreK3", students: 34, capacity: 40, waitlist: 12 },
  { name: "PreK4", students: 42, capacity: 45, waitlist: 8 },
  { name: "Kinder", students: 38, capacity: 40, waitlist: 15 },
  { name: "1st Grade", students: 35, capacity: 35, waitlist: 5 },
  { name: "2nd Grade", students: 30, capacity: 35, waitlist: 7 },
];

const complianceItems = [
  { id: 1, name: "Fire Inspection", status: "compliant", expires: "2026-11-04", daysLeft: 162, authority: "County Fire" },
  { id: 2, name: "Health Dept. Inspection", status: "compliant", expires: "2026-08-22", daysLeft: 88, authority: "FL DOH" },
  { id: 3, name: "Background Checks", status: "expiring", expires: "2026-06-15", daysLeft: 20, authority: "FL DCF" },
  { id: 4, name: "CPR / First Aid", status: "expired", expires: "2026-04-12", daysLeft: -29, authority: "Red Cross" },
  { id: 5, name: "General Liability", status: "expiring", expires: "2026-07-01", daysLeft: 36, authority: "Travelers" },
  { id: 6, name: "VPK Provider Cert.", status: "compliant", expires: "2027-01-30", daysLeft: 249, authority: "ELC" },
];

const scholarshipData = [
  { program: "FES-EO", students: 38, awarded: 342000, pending: 12 },
  { program: "FES-UA", students: 14, awarded: 168000, pending: 4 },
  { program: "FTC", students: 22, awarded: 198000, pending: 8 },
  { program: "VPK", students: 27, awarded: 67500, pending: 3 },
];

const stepUpApprovals = [
  { parent: "R. Garcia", student: "M. Garcia", amount: 2850, daysPending: 18, status: "pending" },
  { parent: "L. Singh", student: "A. Singh", amount: 2850, daysPending: 12, status: "pending" },
  { parent: "D. Kim", student: "J. Kim", amount: 3100, daysPending: 22, status: "redflag" },
  { parent: "M. Owens", student: "T. Owens", amount: 2900, daysPending: 8, status: "pending" },
];

const budgetData = {
  total: 1850000,
  spent: 1240000,
  categories: [
    { name: "Payroll & Benefits", spent: 920000, budget: 1200000, percent: 77 },
    { name: "Facilities & Rent", spent: 142000, budget: 180000, percent: 79 },
    { name: "Curriculum & Books", spent: 58000, budget: 75000, percent: 77 },
    { name: "Insurance", spent: 38000, budget: 45000, percent: 84 },
    { name: "Director Discretionary", spent: 7200, budget: 9000, percent: 80 },
  ],
};

// ─── Richer data from App.jsx ────────────────────────────────────────

const tasks = [
  { id: 1, title: "Parent-teacher conference scheduling", assignee: "director", priority: "high", status: "in_progress", due: "2026-05-14" },
  { id: 2, title: "Renew faculty CPR certifications", assignee: "director", priority: "high", status: "open", due: "2026-05-20" },
  { id: 3, title: "Order Grade 5 yearbooks", assignee: "director", priority: "medium", status: "open", due: "2026-05-25" },
  { id: 4, title: "Step Up Q4 attestation", assignee: "director", priority: "high", status: "open", due: "2026-05-28" },
  { id: 5, title: "HVAC replacement quotes", assignee: "owner", priority: "medium", status: "in_progress", due: "2026-05-18" },
  { id: 6, title: "Scholarship renewal letters", assignee: "director", priority: "low", status: "open", due: "2026-06-01" },
];

const atRiskStudents = [
  { name: "J. Martinez", grade: "5th", reason: "financial", detail: "Lost job · asking about payment plan", flagged: "2026-05-04", status: "intervening" },
  { name: "A. Choi", grade: "7th", reason: "transferring", detail: "Touring private school in Tampa", flagged: "2026-05-06", status: "intervening" },
  { name: "R. Hassan", grade: "3rd", reason: "financial", detail: "Asked about scholarship eligibility", flagged: "2026-05-08", status: "intervening" },
  { name: "M. Webb", grade: "8th", reason: "moving", detail: "Family relocating out of state", flagged: "2026-04-18", status: "lost" },
];

const maintenanceRequests = [
  { id: 1, location: "K — Sequoia", issue: "AC unit not cooling", priority: "critical", status: "open", submittedBy: "Director" },
  { id: 2, location: "Playground", issue: "Swing chain snapped", priority: "high", status: "in_progress", submittedBy: "Director" },
  { id: 3, location: "PreK3 — Caterpillars", issue: "Sink faucet dripping", priority: "low", status: "open", submittedBy: "Director" },
  { id: 4, location: "Front Office", issue: "Printer not connecting to network", priority: "medium", status: "done", submittedBy: "Owner" },
  { id: 5, location: "1st — Redwood", issue: "Ceiling light flickering", priority: "low", status: "open", submittedBy: "Director" },
  { id: 6, location: "Cafeteria", issue: "Refrigerator temp running warm", priority: "critical", status: "open", submittedBy: "Director" },
];

const discounts = [
  { student: "E. Foster", grade: "K", type: "staff_child", monthlyValue: 850 },
  { student: "N. Patel", grade: "2nd", type: "sibling", monthlyValue: 225 },
  { student: "C. Patel", grade: "K", type: "sibling", monthlyValue: 213 },
  { student: "D. Alvarez", grade: "3rd", type: "staff_child", monthlyValue: 925 },
  { student: "S. Tran", grade: "5th", type: "staff_child", monthlyValue: 850 },
];

const substitutes = [
  { id: 1, date: "2026-05-11", coveringFor: "Ms. Cohen", subName: "Ms. Hart" },
  { id: 2, date: "2026-05-05", coveringFor: "Mr. Levine", subName: "Mr. Owens" },
  { id: 3, date: "2026-04-28", coveringFor: "Ms. Diaz", subName: "Ms. Hart" },
];

const staffPTO = [
  { name: "Ms. Cohen", used: 7, allowance: 10, recent: "Personal (May 2, May 6)" },
  { name: "Ms. Hassan", used: 8, allowance: 10, recent: "Sick (Apr 28)" },
  { name: "Mr. Nguyen", used: 6, allowance: 10, recent: "Vacation (Apr 22)" },
  { name: "Ms. Patel", used: 5, allowance: 10, recent: "Personal (Apr 15)" },
  { name: "Ms. Brooks", used: 4, allowance: 10, recent: "Sick (Apr 10)" },
];

const procareData = {
  dailyCheckIns: 42, absentToday: 4, illnesses: 2, medicationGiven: 1, incidents: 0, parentMessages: 8,
};

const quickbooksStatus = {
  lastSync: "2026-05-11 02:34 AM", pendingTransactions: 3, reconciled: true, bankBalance: 487200,
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

const OverviewPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const complianceStats = {
    compliant: complianceItems.filter((c) => c.status === "compliant").length,
    expiring: complianceItems.filter((c) => c.status === "expiring").length,
    expired: complianceItems.filter((c) => c.status === "expired").length,
  };
  const totalScholarshipValue = scholarshipData.reduce((sum, s) => sum + s.awarded, 0);
  const totalScholarshipStudents = scholarshipData.reduce((sum, s) => sum + s.students, 0);
  const stepUpRedFlags = stepUpApprovals.filter((s) => s.daysPending >= 20).length;
  const budgetPercent = Math.round((budgetData.spent / budgetData.total) * 100);
  const totalEnrolled = 245;
  const totalWaitlist = enrollmentData.reduce((sum, e) => sum + e.waitlist, 0);
  const openSeats = 47;
  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const highPriorityTasks = tasks.filter((t) => t.priority === "high" && t.status !== "done").length;
  const criticalMaintenance = maintenanceRequests.filter((m) => m.priority === "critical" && m.status !== "done").length;
  const openMaintenance = maintenanceRequests.filter((m) => m.status !== "done").length;
  const totalDiscountValue = discounts.reduce((sum, d) => sum + d.monthlyValue, 0);
  const totalPTOUsed = staffPTO.reduce((sum, s) => sum + s.used, 0);
  const totalPTOAllowance = staffPTO.reduce((sum, s) => sum + s.allowance, 0);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard Overview
            {criticalMaintenance > 0 && (
              <span className="ml-3 inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                {criticalMaintenance} critical {criticalMaintenance === 1 ? "issue" : "issues"}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-gray-500">Integrated with:</span>
            <div className="flex items-center gap-2">
              <img src="/procare-logo.png" alt="Procare" className="h-5" />
              <span className="text-xs font-medium text-gray-600">Procare</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/quickbooks-logo.png" alt="QuickBooks" className="h-5" />
              <span className="text-xs font-medium text-gray-600">QuickBooks</span>
            </div>
            {quickbooksStatus.reconciled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                <CheckCircle2 size={12} /> Synced {quickbooksStatus.lastSync}
              </span>
            )}
            {criticalMaintenance > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                <Wrench size={12} /> {criticalMaintenance} critical
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">
            <FileText size={16} className="mr-2" /> Export
          </Button>
          <Button className="bg-[#0A0F1E] hover:bg-black text-white">
            <Receipt size={16} className="mr-2" /> Run Payroll
          </Button>
        </div>
      </motion.div>

      {/* KPI Row — more contextual KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow"><CardContent className="p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">Enrolled</p>
            <p className="text-xl font-bold text-gray-900">{totalEnrolled}</p>
            <p className="text-[10px] text-emerald-600 flex items-center mt-0.5"><ArrowUpRight size={10} className="mr-0.5" />+12% y/y</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow"><CardContent className="p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">Revenue</p>
            <p className="text-xl font-bold text-gray-900">$184.2k</p>
            <p className="text-[10px] text-emerald-600 flex items-center mt-0.5"><ArrowUpRight size={10} className="mr-0.5" />+8.4% MoM</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow"><CardContent className="p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">Waitlist</p>
            <p className="text-xl font-bold text-amber-600">{totalWaitlist}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{openSeats} open seats</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow"><CardContent className="p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">Open Tasks</p>
            <p className="text-xl font-bold text-blue-600">{activeTasks}</p>
            <p className="text-[10px] text-red-500 mt-0.5">{highPriorityTasks} high priority</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow"><CardContent className="p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">Maintenance</p>
            <p className="text-xl font-bold text-red-600">{openMaintenance}</p>
            <p className="text-[10px] text-red-500 mt-0.5">{criticalMaintenance} critical</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow"><CardContent className="p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">At-Risk</p>
            <p className="text-xl font-bold text-red-600">{atRiskStudents.filter(r => r.status !== "lost").length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{atRiskStudents.filter(r => r.status === "lost").length} lost</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow"><CardContent className="p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">PTO Used</p>
            <p className="text-xl font-bold text-gray-900">{totalPTOUsed}/{totalPTOAllowance}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{substitutes.length} subs this month</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-[#0A0F1E] border-none shadow-sm text-white"><CardContent className="p-3">
            <p className="text-[10px] font-semibold text-white/50 uppercase">Check-ins</p>
            <p className="text-xl font-bold text-white">{procareData.dailyCheckIns}</p>
            <p className="text-[10px] text-amber-400 mt-0.5">{procareData.absentToday} absent</p>
          </CardContent></Card>
        </motion.div>
      </div>

      {/* First Row — Financial Chart + QuickBooks + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Financial Performance</CardTitle>
                  <CardDescription>Revenue vs Expenses with Scholarship impact</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600" /><span className="text-gray-600">Tuition</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-gray-600">Scholarships</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="text-gray-600">Expenses</span></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTuition" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                    <Area type="monotone" dataKey="tuition" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTuition)" />
                    <Area type="monotone" dataKey="scholarships" stroke="#10B981" strokeWidth={2.5} fillOpacity={0} strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="expenses" stroke="#F87171" strokeWidth={2.5} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          {/* QuickBooks */}
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>QuickBooks Sync</span>
                <img src="/quickbooks-logo.png" alt="QuickBooks" className="h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center pb-1.5 border-b border-gray-100">
                <span className="text-xs text-gray-500">Bank Balance</span>
                <span className="text-base font-bold text-gray-900">${quickbooksStatus.bankBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-gray-100">
                <span className="text-xs text-gray-500">Pending</span>
                <span className="text-amber-600 font-medium text-xs">{quickbooksStatus.pendingTransactions} to review</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Last Sync</span>
                <span className="text-xs text-gray-400">{quickbooksStatus.lastSync}</span>
              </div>
              <Button variant="outline" className="w-full mt-1 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 h-8">Sync Now</Button>
            </CardContent>
          </Card>

          {/* Procare Today */}
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <img src="/procare-logo.png" alt="Procare" className="h-4" />
                Procare Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div><p className="text-lg font-bold text-gray-900">{procareData.parentMessages}</p><p className="text-[10px] text-gray-400">Messages</p></div>
                <div><p className="text-lg font-bold text-gray-900">{procareData.medicationGiven}</p><p className="text-[10px] text-gray-400">Medications</p></div>
                <div><p className="text-lg font-bold text-amber-600">{procareData.illnesses}</p><p className="text-[10px] text-gray-400">Illnesses</p></div>
                <div><p className="text-lg font-bold text-emerald-600">{procareData.incidents}</p><p className="text-[10px] text-gray-400">Incidents</p></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Second Row — At-Risk + Staff Coverage + Discounts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* At-Risk Students */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle size={16} className="text-red-500" />
                At-Risk Students
                <span className="ml-auto text-[10px] font-normal text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{atRiskStudents.filter(r => r.status !== "lost").length} active</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {atRiskStudents.map((r, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${r.status === "lost" ? "bg-gray-50 opacity-60" : "bg-red-50"}`}>
                  <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${r.status === "lost" ? "bg-gray-400" : "bg-red-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{r.name} · {r.grade} <span className={`ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${r.status === "lost" ? "bg-gray-200 text-gray-500" : "bg-red-100 text-red-700"}`}>{r.status}</span></p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{r.detail}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{r.reason} · Flagged {fmtDate(r.flagged)}</p>
                  </div>
                  {r.status !== "lost" && (
                    <span className="text-[9px] font-semibold text-blue-600 hover:underline cursor-pointer shrink-0">Intervene</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Staff Coverage & PTO */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <UserCheck size={16} className="text-blue-500" />
                Staff Coverage
                <span className="ml-auto text-[10px] font-normal text-blue-600">{substitutes.length} subs this month</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* PTO high usage alert */}
              {staffPTO.filter(s => s.used >= 6).length > 0 && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 mb-1">
                  <p className="text-[10px] font-semibold text-amber-700">{staffPTO.filter(s => s.used >= 6).length} staff at risk of PTO shortage</p>
                </div>
              )}
              {staffPTO.slice(0, 4).map((s, i) => {
                const pct = Math.round((s.used / s.allowance) * 100);
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">
                      {s.name.split(" ").slice(-1)[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-900">{s.name}</p>
                        <span className="text-[10px] font-semibold text-gray-500">{s.used}/{s.allowance}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-0.5">
                        <div className={`h-full rounded-full ${pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[9px] text-gray-400 mt-0.5 truncate">{s.recent}</p>
                    </div>
                  </div>
                );
              })}
              {substitutes.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Recent Subs</p>
                  {substitutes.slice(0, 2).map((s) => (
                    <div key={s.id} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span>{s.subName} → {s.coveringFor} <span className="text-gray-400">({fmtDate(s.date)})</span></span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Discounts & Scholarships */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <DollarSign size={16} className="text-emerald-500" />
                Discounts & Scholarships
                <span className="ml-auto text-[10px] font-normal text-emerald-600">${(totalDiscountValue / 1000).toFixed(1)}K/mo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Scholarships summary */}
              <div className="p-2.5 rounded-lg bg-purple-50">
                <p className="text-[10px] font-semibold text-purple-600 uppercase">Scholarships YTD</p>
                <p className="text-lg font-bold text-gray-900">${(totalScholarshipValue / 1000).toFixed(0)}K</p>
                <p className="text-[10px] text-gray-500">{totalScholarshipStudents} students enrolled</p>
              </div>

              {/* Discounts list */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase">Active Discounts</p>
                {discounts.slice(0, 4).map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs text-gray-700">{d.student} · {d.grade}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">${d.monthlyValue}</span>
                  </div>
                ))}
              </div>

              {/* Step Up Alert */}
              {stepUpRedFlags > 0 && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-100 mt-1">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-red-500" />
                    <span className="text-[10px] font-semibold text-red-700">{stepUpRedFlags} stuck Step Up approvals</span>
                  </div>
                  {stepUpApprovals.filter(s => s.daysPending >= 20).map((s, i) => (
                    <p key={i} className="text-[9px] text-red-600 ml-5">{s.parent} · {s.student} · ${s.amount} ({s.daysPending}d)</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Third Row — Maintenance + Tasks + Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Maintenance Overview */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Wrench size={16} className="text-amber-500" />
                Open Maintenance
                <span className="ml-auto text-[10px] font-normal flex items-center gap-2">
                  <span className="text-red-500">{criticalMaintenance} critical</span>
                  <span className="text-gray-400">· {openMaintenance} total</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {maintenanceRequests.filter(m => m.status !== "done").slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    m.priority === "critical" ? "bg-red-500" :
                    m.priority === "high" ? "bg-orange-500" :
                    m.priority === "medium" ? "bg-amber-500" : "bg-gray-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{m.issue}</p>
                    <div className="flex items-center gap-2 text-[9px] text-gray-400">
                      <span>{m.location}</span>
                      <span>·</span>
                      <span className={`px-1 py-0.5 rounded-full font-medium ${
                        m.priority === "critical" ? "bg-red-100 text-red-600" :
                        m.priority === "high" ? "bg-orange-100 text-orange-600" :
                        m.priority === "medium" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"
                      }`}>{m.priority}</span>
                      <span>·</span>
                      <span>{m.submittedBy}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-blue-600 h-7">View all maintenance →</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Tasks */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ClipboardList size={16} className="text-blue-500" />
                Active Tasks
                <span className="ml-auto text-[10px] font-normal text-blue-600">{highPriorityTasks} high priority</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.filter(t => t.status !== "done").slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    t.priority === "high" ? "bg-red-500" :
                    t.priority === "medium" ? "bg-amber-500" : "bg-gray-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-900 truncate">{t.title}</p>
                      <span className={`text-[9px] font-semibold ml-1 shrink-0 ${
                        daysUntil(t.due) <= 3 ? "text-red-500" :
                        daysUntil(t.due) <= 7 ? "text-amber-500" : "text-gray-400"
                      }`}>{daysUntil(t.due) <= 0 ? "Overdue" : `${daysUntil(t.due)}d`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-gray-400">
                      <span className="capitalize">{t.assignee}</span>
                      <span>·</span>
                      <span className="capitalize">{t.status.replace("_", " ")}</span>
                      <span>·</span>
                      <span>Due {fmtDate(t.due)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-blue-600 h-7">View all tasks →</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compliance */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck size={16} className="text-red-500" />
                Compliance
                <span className="ml-auto text-[10px] font-normal flex items-center gap-2">
                  <span className="text-red-500">{complianceStats.expired} expired</span>
                  <span className="text-amber-500">· {complianceStats.expiring} expiring</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {complianceItems.filter(c => c.status !== "compliant").slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-xs font-medium text-gray-900">{item.name}</p>
                    <p className="text-[9px] text-gray-500">{item.authority}</p>
                  </div>
                  <span className={`text-[10px] font-semibold ml-2 shrink-0 ${
                    item.status === "expired" ? "text-red-600" : "text-amber-600"
                  }`}>
                    {item.status === "expired" ? "Expired" : `${item.daysLeft}d left`}
                  </span>
                </div>
              ))}
              {complianceStats.compliant > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-green-600">
                  <CheckCircle2 size={12} />
                  <span>{complianceStats.compliant} items compliant</span>
                </div>
              )}
              <Button variant="ghost" className="w-full text-xs text-blue-600 h-7">View compliance →</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Fourth Row — Budget + Enrollment + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Budget */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <PiggyBank size={16} className="text-amber-500" />
                Budget Consumption
              </CardTitle>
              <CardDescription className="text-[10px]">{budgetPercent}% used · ${(budgetData.total - budgetData.spent).toLocaleString()} remaining</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${budgetPercent}%` }} />
              </div>
              <div className="space-y-2">
                {budgetData.categories.slice(0, 4).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-600">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cat.percent}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500 w-7 text-right">${(cat.spent / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-2 text-xs text-blue-600 h-7">View budget →</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enrollment */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Enrollment by Grade</CardTitle>
              <CardDescription className="text-[10px]">Students vs Capacity with Waitlist demand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 9 }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 9 }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "12px" }} />
                    <Bar dataKey="capacity" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={14} name="Capacity" />
                    <Bar dataKey="students" radius={[4, 4, 0, 0]} barSize={14} name="Enrolled">
                      {enrollmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.students >= entry.capacity ? "#F59E0B" : "#0F172A"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around mt-2 pt-2 border-t border-gray-100">
                <div className="text-center"><p className="text-lg font-bold text-gray-900">{totalEnrolled}</p><p className="text-[9px] text-gray-500">Total</p></div>
                <div className="text-center"><p className="text-lg font-bold text-amber-600">{totalWaitlist}</p><p className="text-[9px] text-gray-500">Waitlist</p></div>
                <div className="text-center"><p className="text-lg font-bold text-emerald-600">{openSeats}</p><p className="text-[9px] text-gray-500">Open</p></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events & Payroll */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-gray-500" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2.5 rounded-lg bg-amber-50">
                <p className="text-xs font-semibold text-gray-900">General Liability Insurance</p>
                <p className="text-[10px] text-amber-600">Shop rates by May 2 (60 days before renewal)</p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-50">
                <p className="text-xs font-semibold text-gray-900">CPR Certification Renewal</p>
                <p className="text-[10px] text-red-600">Due May 20 · 4 staff affected</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50">
                <p className="text-xs font-semibold text-gray-900">Step Up Q4 Attestation</p>
                <p className="text-[10px] text-blue-600">Due May 28 · Director's signature needed</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0A0F1E] text-white">
                <p className="text-xs font-semibold">Next Payroll: May 15</p>
                <p className="text-[10px] text-white/70">7 days away · Director hasn't submitted yet</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50">
                <p className="text-xs font-semibold text-gray-900">End of Year Ceremony</p>
                <p className="text-[10px] text-emerald-600">June 5 · 100+ attendees expected</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OverviewPage;
