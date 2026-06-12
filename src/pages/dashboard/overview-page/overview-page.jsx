import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  FileText,
  ClipboardList,
  Wrench,
  UserCheck,
  DollarSign,
  Users,
  Clock,
  Wallet,
  Landmark,
  Building2,
  GraduationCap,
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
  PieChart,
  Pie,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import PulseDisplay from "@/components/PulseDisplay";
import {
  calculatePulse,
  generateRecommendations,
  getSnapshotHistory,
  saveSnapshot,
  getExpectedBudgetBurn,
} from "@/lib/pulse-engine";

// ─── Color palette ─────────────────────────────────────────────────
const COLORS = {
  blue: "#2563EB",
  indigo: "#4F46E5",
  emerald: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  purple: "#8B5CF6",
  teal: "#14B8A6",
  orange: "#F97316",
  pink: "#EC4899",
  slate: "#64748B",
};

const EXPENSE_REASON_COLORS = {
  "Classroom Supplies": "#2563EB",
  "Events & Food": "#F97316",
  "Staff Appreciation": "#EC4899",
  "Cleaning Supplies": "#16A34A",
  "Office Supplies": "#0EA5E9",
  "Teacher Appreciation": "#8B5CF6",
  "Professional Dev.": "#D97706",
  "Tech & Software": "#7C3AED",
  "Facilities": "#64748B",
  "Other": "#94A0B5",
};

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
    { name: "Payroll & Benefits", spent: 920000, budget: 1200000, percent: 77, color: "#4F46E5" },
    { name: "Facilities & Rent", spent: 142000, budget: 180000, percent: 79, color: "#2563EB" },
    { name: "Curriculum & Books", spent: 58000, budget: 75000, percent: 77, color: "#10B981" },
    { name: "Insurance", spent: 38000, budget: 45000, percent: 84, color: "#F59E0B" },
    { name: "Director Discretionary", spent: 7200, budget: 9000, percent: 80, color: "#EC4899" },
  ],
};

// ─── Default director expenses (for fallback) ─────────────────────
const DEFAULT_EXPENSES = [
  { id: 1, amount: 47.50, reason: "Events & Food", description: "Pizza for parent meeting", date: "2026-04-12" },
  { id: 2, amount: 124.00, reason: "Classroom Supplies", description: "Crayons and markers — PreK3", date: "2026-04-15" },
  { id: 3, amount: 38.00, reason: "Staff Appreciation", description: "Coffee and donuts for staff PD", date: "2026-04-22" },
  { id: 4, amount: 89.00, reason: "Cleaning Supplies", description: "Cleaning wipes restock", date: "2026-04-28" },
  { id: 5, amount: 215.00, reason: "Classroom Supplies", description: "Construction paper bulk order", date: "2026-05-01" },
  { id: 6, amount: 65.00, reason: "Staff Appreciation", description: "Birthday cake for office party", date: "2026-05-04" },
  { id: 7, amount: 180.00, reason: "Office Supplies", description: "Printer ink cartridges", date: "2026-05-06" },
  { id: 8, amount: 42.00, reason: "Teacher Appreciation", description: "Gift cards for teacher appreciation", date: "2026-05-08" },
];

const DIRECTOR_BUDGET_TOTAL = 9000;

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
const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

const OverviewPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  // ─── Load director expenses from localStorage ───
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem("directorExpenses");
      return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
    } catch {
      return DEFAULT_EXPENSES;
    }
  });

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "directorExpenses") {
        try {
          setExpenses(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const directorSpent = useMemo(() => expenses.reduce((a, e) => a + e.amount, 0), [expenses]);
  const directorRemaining = DIRECTOR_BUDGET_TOTAL - directorSpent;
  const pettyCashPercent = Math.round((directorSpent / DIRECTOR_BUDGET_TOTAL) * 100);

  const expenseByReason = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const reason = e.reason || "Other";
      map[reason] = (map[reason] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const recentExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [expenses]);

  const complianceStats = {
    compliant: complianceItems.filter((c) => c.status === "compliant").length,
    expiring: complianceItems.filter((c) => c.status === "expiring").length,
    expired: complianceItems.filter((c) => c.status === "expired").length,
  };
  const totalScholarshipValue = scholarshipData.reduce((sum, s) => sum + s.awarded, 0);
  const totalScholarshipStudents = scholarshipData.reduce((sum, s) => sum + s.students, 0);
  const stepUpRedFlags = stepUpApprovals.filter((s) => s.daysPending >= 20).length;
  const budgetPercent = Math.round((budgetData.spent / budgetData.total) * 100);
  const schoolBudgetRemaining = budgetData.total - budgetData.spent;
  const totalEnrolled = 245;
  const totalCapacity = 292;
  const enrollPercent = Math.round((totalEnrolled / totalCapacity) * 100);
  const totalWaitlist = enrollmentData.reduce((sum, e) => sum + e.waitlist, 0);
  const openSeats = 47;
  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const totalTasks = tasks.length;
  const tasksDone = tasks.filter((t) => t.status === "done").length;
  const tasksPct = Math.round((tasksDone / totalTasks) * 100);
  const highPriorityTasks = tasks.filter((t) => t.priority === "high" && t.status !== "done").length;
  const criticalMaintenance = maintenanceRequests.filter((m) => m.priority === "critical" && m.status !== "done").length;
  const openMaintenance = maintenanceRequests.filter((m) => m.status !== "done").length;
  const maintenanceDone = maintenanceRequests.filter((m) => m.status === "done").length;
  const maintenancePct = Math.round((maintenanceDone / maintenanceRequests.length) * 100);
  const DISCOUNTED_COUNT = 64;
  const discountedPct = Math.round((DISCOUNTED_COUNT / totalEnrolled) * 100);
  // Estimated annual waived value at ~$612/mo avg per discounted student
  const annualWaivedEstimate = DISCOUNTED_COUNT * 612 * 10;
  const activeAtRisk = atRiskStudents.filter(r => r.status !== "lost").length;
  const atRiskPct = Math.round((activeAtRisk / atRiskStudents.length) * 100);
  const revenuePct = Math.round((184200 / 220000) * 100);
  const waitlistPct = Math.round((totalWaitlist / totalEnrolled) * 100);
  const totalPTOUsed = staffPTO.reduce((sum, s) => sum + s.used, 0);
  const totalPTOAllowance = staffPTO.reduce((sum, s) => sum + s.allowance, 0);
  const ptoPct = Math.round((totalPTOUsed / totalPTOAllowance) * 100);
  const totalCheckins = procareData.dailyCheckIns + procareData.absentToday;
  const checkinPct = Math.round((procareData.dailyCheckIns / totalCheckins) * 100);

  const kpiIcons = {
    Users, DollarSign, ClipboardList, CheckCircle2,
    Wrench, AlertTriangle, Calendar, UserCheck, Wallet,
  };

  // ── Pulse Engine Integration ──────────────────────────────────
  const pulseInputs = useMemo(() => {
    // Calculate capacity % across all classrooms
    // Note: overview-page has hardcoded totalEnrolled=245, totalCapacity=292
    const capacityPct = Math.round((245 / 292) * 100);
    const totalWaitlistCount = enrollmentData.reduce((sum, e) => sum + e.waitlist, 0);
    
    // Count critical and old-high maintenance
    const criticalMaint = maintenanceRequests.filter(
      m => m.priority === 'critical' && m.status !== 'done'
    ).length;
    const oldHighMaint = maintenanceRequests.filter(
      m => m.priority === 'high' && m.status !== 'done'
    ).length;
    
    // Count incidents in last 30 days vs trailing avg
    const now = new Date();
    const last30Incidents = maintenanceRequests.filter(m => {
      // Use the items themselves as rough incident proxies
      return m.priority === 'critical' || m.priority === 'high';
    }).length;
    
    return {
      enrollment: {
        capacityPct,
        yoyGrowth: 12, // +12% y/y from the KPI sub text
        waitlistConversionPct: 25,
        waitlistCount: totalWaitlistCount,
      },
      discretionary: {
        actualBurnPct: pettyCashPercent,
        expectedBurnPct: getExpectedBudgetBurn(),
      },
      callouts: {
        calloutRatePct: 6, // Sample: slightly below threshold
      },
      latePayments: {
        pastDuePct: 3.5, // Sample: slightly elevated
        source: 'manual',
      },
      compliance: {
        items: complianceItems.map(c => ({
          status: c.status,
          expires: c.expires,
          item: c.name,
        })),
      },
      maintenance: {
        criticalCount: criticalMaint,
        oldHighCount: oldHighMaint,
      },
      incidents: {
        last30Count: last30Incidents,
        trailing90Avg: Math.max(1, last30Incidents - 1),
      },
      classScore: {
        currentScore: 5.8, // Sample: decent but room to improve
      },
      bigFinancial: {
        actualBurnPct: budgetPercent,
        expectedBurnPct: getExpectedBudgetBurn(),
        marginTrend: 2.5,
      },
    };
  }, [pettyCashPercent, budgetPercent]);

  const ownerPulse = useMemo(
    () => calculatePulse(pulseInputs, 'owner'),
    [pulseInputs]
  );
  const directorPulse = useMemo(
    () => calculatePulse(pulseInputs, 'director'),
    [pulseInputs]
  );

  const ownerRecommendations = useMemo(
    () => generateRecommendations(pulseInputs, ownerPulse, 'owner'),
    [pulseInputs, ownerPulse]
  );

  const pulseHistory = useMemo(() => getSnapshotHistory(90), []);

  // Save snapshot when pulse values change (stable key comparison)
  const snapshotKey = useMemo(
    () => `${ownerPulse?.bpm ?? ''}-${directorPulse?.bpm ?? ''}`,
    [ownerPulse?.bpm, directorPulse?.bpm]
  );

  useEffect(() => {
    if (ownerPulse && directorPulse) {
      saveSnapshot({
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        owner: {
          composite: ownerPulse.composite,
          bpm: ownerPulse.bpm,
          state: ownerPulse.state,
          subScores: ownerPulse.subScores,
        },
        director: {
          composite: directorPulse.composite,
          bpm: directorPulse.bpm,
          state: directorPulse.state,
          subScores: directorPulse.subScores,
        },
      });
    }
  }, [snapshotKey]);

  const handleSubScoreClick = (subKey) => {
    // Navigate to relevant tab based on sub-score key
    const tabMap = {
      enrollmentHealth: '/dashboard/enrollment',
      discretionaryBudget: '/dashboard/budget',
      staffCallouts: '/dashboard/staff',
      latePayments: '/dashboard/staff',
      compliance: '/dashboard/compliance',
      maintenance: '/dashboard/maintenance',
      incidentTrend: '/dashboard/classrooms',
      classScore: '/dashboard/enrollment',
      bigFinancialHealth: '/dashboard/budget',
    };
    const path = tabMap[subKey] || '/dashboard';
    navigate(path);
  };

  return (
    <motion.div className="space-y-6 pb-8 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Dashboard Overview
            {criticalMaintenance > 0 && (
              <span className="ml-2 md:ml-3 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] md:text-xs font-bold rounded-full align-middle">
                {criticalMaintenance} critical
              </span>
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs md:text-sm text-gray-500">Integrated:</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-md">
              <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center text-[8px] font-bold text-blue-600">P</div>
              <span className="text-[10px] md:text-xs font-medium text-gray-600">Procare</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-md">
              <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center text-[8px] font-bold text-green-600">QB</div>
              <span className="text-[10px] md:text-xs font-medium text-gray-600">QuickBooks</span>
            </div>
            {quickbooksStatus.reconciled && (
              <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 bg-green-100 text-green-700 text-[9px] md:text-xs rounded-full whitespace-nowrap">
                <CheckCircle2 size={10} /> Synced
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Button variant="outline" className="bg-white text-xs md:text-sm px-2.5 md:px-3 h-9">
            <FileText size={14} className="mr-1.5" /> Export
          </Button>
          <Button className="bg-[#0A0F1E] hover:bg-black text-white text-xs md:text-sm px-2.5 md:px-3 h-9">
            <Receipt size={14} className="mr-1.5" /> Run Payroll
          </Button>
        </div>
      </motion.div>

      {/* Owner Pulse Display */}
      <motion.div variants={itemVariants}>
        <PulseDisplay
          pulse={ownerPulse}
          recommendations={ownerRecommendations}
          pulseHistory={pulseHistory}
          role="owner"
          onSubScoreClick={handleSubScoreClick}
        />
      </motion.div>

      {/* KPI Row 1 — Donut Chart Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Enrolled", value: totalEnrolled, pct: enrollPercent, color: "#2563EB", sub: "+12% y/y", subColor: "text-emerald-600", icon: "Users" },
          { label: "Revenue", value: "$184.2k", pct: revenuePct, color: "#10B981", sub: "+8.4% MoM", subColor: "text-emerald-600", icon: "DollarSign" },
          { label: "Waitlist", value: totalWaitlist, pct: waitlistPct, color: "#F59E0B", sub: `${openSeats} open seats`, subColor: "text-gray-400", icon: "ClipboardList" },
          { label: "Tasks Done", value: `${tasksDone}/${totalTasks}`, pct: tasksPct, color: "#4F46E5", sub: `${highPriorityTasks} high priority`, subColor: "text-red-500", icon: "CheckCircle2" },
          { label: "Maintenance", value: `${maintenanceDone}/${maintenanceRequests.length}`, pct: maintenancePct, color: "#EF4444", sub: `${criticalMaintenance} critical`, subColor: "text-red-500", icon: "Wrench" },
        ].map((kpi, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {React.createElement(kpiIcons[kpi.icon], { size: 15, className: "text-gray-500", strokeWidth: 2 })}
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                </div>
                <div className="relative flex items-center justify-center h-[110px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { value: kpi.pct, fill: kpi.color },
                          { value: 100 - kpi.pct, fill: "#F1F5F9" },
                        ]}
                        dataKey="value"
                        innerRadius="65%"
                        outerRadius="100%"
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-2xl font-black" style={{ color: kpi.color }}>
                    {kpi.pct}%
                  </div>
                </div>
                <p className="text-base font-bold text-gray-900 text-center mt-2">{kpi.value}</p>
                <p className={`text-xs ${kpi.subColor} text-center mt-0.5`}>{kpi.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* KPI Row 2 — Donut Chart Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "At-Risk", value: `${activeAtRisk}/${atRiskStudents.length}`, pct: atRiskPct, color: "#8B5CF6", sub: "intervening", subColor: "text-gray-400", icon: "AlertTriangle" },
          { label: "Discounted", value: `${DISCOUNTED_COUNT}/${totalEnrolled}`, pct: discountedPct, color: "#EC4899", sub: `$${annualWaivedEstimate.toLocaleString()}/yr waived`, subColor: "text-pink-600", icon: "Wallet" },
          { label: "Petty Cash", value: `${directorSpent}/${DIRECTOR_BUDGET_TOTAL}`, pct: pettyCashPercent, color: "#F97316", sub: `${fmtMoney(directorRemaining)} remaining`, subColor: directorRemaining > 0 ? "text-emerald-600" : "text-red-500", icon: "DollarSign" },
          { label: "PTO Used", value: `${totalPTOUsed}/${totalPTOAllowance}`, pct: ptoPct, color: "#14B8A6", sub: `${substitutes.length} subs this mo`, subColor: "text-gray-400", icon: "Calendar" },
          { label: "Check-ins", value: procareData.dailyCheckIns, pct: checkinPct, color: "#F97316", sub: `${procareData.absentToday} absent`, subColor: "text-amber-600", icon: "UserCheck" },
        ].map((kpi, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {React.createElement(kpiIcons[kpi.icon], { size: 15, className: "text-gray-500", strokeWidth: 2 })}
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                </div>
                <div className="relative flex items-center justify-center h-[110px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { value: kpi.pct, fill: kpi.color },
                          { value: 100 - kpi.pct, fill: "#F1F5F9" },
                        ]}
                        dataKey="value"
                        innerRadius="65%"
                        outerRadius="100%"
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-2xl font-black" style={{ color: kpi.color }}>
                    {kpi.pct}%
                  </div>
                </div>
                <p className="text-base font-bold text-gray-900 text-center mt-2">{kpi.value}</p>
                <p className={`text-xs ${kpi.subColor} text-center mt-0.5`}>{kpi.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Row — Financial Chart + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Financial Performance</CardTitle>
                  <CardDescription className="text-xs">Revenue vs Expenses with Scholarship impact</CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600" /><span className="text-gray-600">Tuition</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-gray-600">Scholarships</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="text-gray-600">Expenses</span></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] md:h-[260px] w-full">
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

        {/* Right Sidebar — QuickBooks + Procare */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center text-[9px] font-bold text-green-700">QB</div>
                  QuickBooks Sync
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">Bank Balance</span>
                <span className="text-base font-bold text-gray-900">${quickbooksStatus.bankBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">Pending Transactions</span>
                <span className="text-amber-600 font-medium text-xs">{quickbooksStatus.pendingTransactions} to review</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Last Sync</span>
                <span className="text-xs text-gray-400">{quickbooksStatus.lastSync}</span>
              </div>
              <Button variant="outline" className="w-full mt-1 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 h-8">
                Sync Now
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center text-[9px] font-bold text-blue-600">P</div>
                Procare Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded-lg"><p className="text-base font-bold text-gray-900">{procareData.parentMessages}</p><p className="text-[10px] text-gray-400">Messages</p></div>
                <div className="p-2 bg-gray-50 rounded-lg"><p className="text-base font-bold text-gray-900">{procareData.medicationGiven}</p><p className="text-[10px] text-gray-400">Medications</p></div>
                <div className="p-2 bg-amber-50 rounded-lg"><p className="text-base font-bold text-amber-600">{procareData.illnesses}</p><p className="text-[10px] text-gray-400">Illnesses</p></div>
                <div className="p-2 bg-emerald-50 rounded-lg"><p className="text-base font-bold text-emerald-600">{procareData.incidents}</p><p className="text-[10px] text-gray-400">Incidents</p></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Middle Row — At-Risk + Maintenance + Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* At-Risk Students */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle size={16} className="text-red-500" />
                  At-Risk Students
                </CardTitle>
                <span className="text-[10px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{activeAtRisk} active</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {atRiskStudents.map((r, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${r.status === "lost" ? "bg-gray-50 opacity-60" : "bg-red-50"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${r.status === "lost" ? "bg-gray-400" : "bg-red-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-semibold text-gray-900">{r.name} · {r.grade}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${r.status === "lost" ? "bg-gray-200 text-gray-500" : "bg-red-100 text-red-700"}`}>{r.status}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{r.detail}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{r.reason} · Flagged {fmtDate(r.flagged)}</p>
                  </div>
                  {r.status !== "lost" && (
                    <span className="text-[9px] font-semibold text-blue-600 hover:underline cursor-pointer shrink-0">Intervene</span>
                  )}
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-blue-600 h-7 mt-1" onClick={() => navigate("/dashboard/enrollment")}>View all at-risk →</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Open Maintenance */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Wrench size={16} className="text-amber-500" />
                  Open Maintenance
                </CardTitle>
                <div className="flex items-center gap-2">
                  {criticalMaintenance > 0 && <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">{criticalMaintenance} critical</span>}
                  <span className="text-[10px] text-gray-400">{openMaintenance} total</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {maintenanceRequests.filter(m => m.status !== "done").slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    m.priority === "critical" ? "bg-red-500" :
                    m.priority === "high" ? "bg-orange-500" :
                    m.priority === "medium" ? "bg-amber-500" : "bg-gray-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{m.issue}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-0.5 flex-wrap">
                      <span>{m.location}</span>
                      <span>·</span>
                      <span className={`px-1 py-0.5 rounded-full font-medium ${
                        m.priority === "critical" ? "bg-red-100 text-red-600" :
                        m.priority === "high" ? "bg-orange-100 text-orange-600" :
                        m.priority === "medium" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"
                      }`}>{m.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-blue-600 h-7 mt-1" onClick={() => navigate("/dashboard/maintenance")}>View all maintenance →</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Tasks */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ClipboardList size={16} className="text-blue-500" />
                  Active Tasks
                </CardTitle>
                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{highPriorityTasks} high priority</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {tasks.filter(t => t.status !== "done").slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    t.priority === "high" ? "bg-red-500" :
                    t.priority === "medium" ? "bg-amber-500" : "bg-gray-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-medium text-gray-900 truncate">{t.title}</p>
                      <span className={`text-[9px] font-semibold shrink-0 ml-1 ${
                        daysUntil(t.due) <= 3 ? "text-red-500" :
                        daysUntil(t.due) <= 7 ? "text-amber-500" : "text-gray-400"
                      }`}>{daysUntil(t.due) <= 0 ? "Overdue" : `${daysUntil(t.due)}d`}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-0.5">
                      <span className="capitalize">{t.assignee}</span>
                      <span>·</span>
                      <span className="capitalize">{t.status.replace("_", " ")}</span>
                      <span>·</span>
                      <span>Due {fmtDate(t.due)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-blue-600 h-7 mt-1" onClick={() => navigate("/dashboard/tasks")}>View all tasks →</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section — Budget + Enrollment + Events (3 columns with better balance) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Budget Overview — Combined School + Director */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Landmark size={16} className="text-amber-500" />
                Budget Overview
              </CardTitle>
              <CardDescription className="text-[10px]">School budget &amp; Director's discretionary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* School Budget */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Landmark size={14} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-800">School Budget</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600">${(budgetData.total / 1000000).toFixed(1)}M</span>
                </div>
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${budgetPercent}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">{budgetPercent}% used</span>
                  <span className="text-emerald-600 font-medium">${schoolBudgetRemaining.toLocaleString()} left</span>
                </div>
              </div>

              {/* Director's Petty Cash */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <Wallet size={14} className="text-pink-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-800">Director's Petty Cash</span>
                  </div>
                  <span className="text-xs font-bold text-pink-600">${DIRECTOR_BUDGET_TOTAL.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-pink-100 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: `${pettyCashPercent}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">{pettyCashPercent}% used</span>
                  <span className={`font-medium ${directorRemaining > 0 ? "text-pink-600" : "text-red-500"}`}>
                    {fmtMoney(directorRemaining)} left
                  </span>
                </div>

                {/* Recent Expenses */}
                {recentExpenses.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-pink-200/50">
                    <p className="text-[9px] font-semibold text-pink-700 uppercase tracking-wider mb-1.5">Recent Expenses</p>
                    <div className="space-y-1.5">
                      {recentExpenses.slice(0, 3).map((exp) => (
                        <div key={exp.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_REASON_COLORS[exp.reason] || "#94A0B5" }} />
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-700 truncate">{exp.description}</p>
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] font-medium text-gray-400">{exp.reason}</span>
                                <span className="text-[8px] text-gray-400">· {fmtDate(exp.date)}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-800 shrink-0 ml-2">{fmtMoney(exp.amount)}</span>
                        </div>
                      ))}
                    </div>
                    {expenseByReason.length > 0 && (
                      <div className="mt-2 pt-1">
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Spending by Reason</p>
                        <div className="flex flex-wrap gap-2">
                          {expenseByReason.slice(0, 3).map((cat) => (
                            <div key={cat.name} className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: EXPENSE_REASON_COLORS[cat.name] || "#94A0B5" }} />
                              <span className="text-[9px] text-gray-600">{cat.name}</span>
                              <span className="text-[9px] font-medium text-gray-700">{fmtMoney(Math.round(cat.total))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button variant="ghost" className="w-full text-xs text-blue-600 h-8 hover:bg-blue-50" onClick={() => navigate("/dashboard/budget")}>
                View full budget →
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enrollment Chart */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users size={15} className="text-blue-500" />
                Enrollment by Grade
              </CardTitle>
              <CardDescription className="text-[10px]">Students vs Capacity with Waitlist demand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "11px" }} />
                    <Bar dataKey="capacity" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={16} name="Capacity" />
                    <Bar dataKey="students" radius={[4, 4, 0, 0]} barSize={16} name="Enrolled">
                      {enrollmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.students >= entry.capacity ? "#F59E0B" : "#4F46E5"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3 pt-2 border-t border-gray-100">
                <div className="text-center p-2 bg-indigo-50 rounded-lg">
                  <p className="text-lg font-bold text-indigo-600">{totalEnrolled}</p>
                  <p className="text-[10px] text-gray-500">Total</p>
                </div>
                <div className="text-center p-2 bg-amber-50 rounded-lg">
                  <p className="text-lg font-bold text-amber-600">{totalWaitlist}</p>
                  <p className="text-[10px] text-gray-500">Waitlist</p>
                </div>
                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                  <p className="text-lg font-bold text-emerald-600">{openSeats}</p>
                  <p className="text-[10px] text-gray-500">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events — Clean and organized */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar size={15} className="text-purple-500" />
                Upcoming Events
              </CardTitle>
              <CardDescription className="text-[10px]">Key dates &amp; deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <ShieldCheck size={14} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">General Liability Insurance</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">Shop rates by May 2 (60 days before renewal)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-red-50 border border-red-100">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <GraduationCap size={14} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">CPR Certification Renewal</p>
                  <p className="text-[10px] text-red-600 mt-0.5">Due May 20 · 4 staff affected</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">Step Up Q4 Attestation</p>
                  <p className="text-[10px] text-blue-600 mt-0.5">Due May 28 · Director's signature needed</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Next Payroll: May 15</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">7 days away · Director hasn't submitted yet</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Building2 size={14} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">End of Year Ceremony</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">June 5 · 100+ attendees expected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OverviewPage;