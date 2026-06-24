import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import PnLSummaryCard from "./components/PnLSummaryCard";
import ProfitChart from "./components/ProfitChart";
import TierFilter from "./components/TierFilter";
import ClassroomDetailCard from "./components/ClassroomDetailCard";
import AddClassroomModal from "./components/AddClassroomModal";

// ─── Data Models ──────────────────────────────────────────────────
// TODO: Backend wiring — replace hardcoded data with API response
// TODO (Section 7.3): After Care and Wrap Care must be modeled as separate enrollment records,
// not as flags on a student record. A K student who stays for After Care = two enrollment records
// (one in K under DOE, one in After Care under DCF/ELC SR contract). Update schema when backend is wired.
const DEFAULT_CLASSROOMS = [
  { id: 1, name: "Age 1 — Bumblebees", program: "Age 1", tier: "preschool", capacity: 8, enrolled: 6, teacher: "Ms. Alvarez", tuitionPerSeat: 1100, monthlyCost: 6800, withdrawals: 3, nweaMap: null, lastYear: { enrolled: 7, monthlyProfit: -350, withdrawals: 2, nweaMap: null } },
  { id: 2, name: "Age 2 — Ladybugs", program: "Age 2", tier: "preschool", capacity: 10, enrolled: 9, teacher: "Ms. Soto", tuitionPerSeat: 1050, monthlyCost: 7200, withdrawals: 1, nweaMap: null, lastYear: { enrolled: 8, monthlyProfit: 1200, withdrawals: 2, nweaMap: null } },
  { id: 3, name: "Younger 3s — Sunflower", program: "Younger 3s", tier: "preschool", capacity: 12, enrolled: 11, teacher: "Ms. Patel", tuitionPerSeat: 1000, monthlyCost: 7400, withdrawals: 0, nweaMap: null, lastYear: { enrolled: 10, monthlyProfit: 2600, withdrawals: 0, nweaMap: null } },
  { id: 4, name: "Older 3s — Oak", program: "Older 3s", tier: "preschool", capacity: 16, enrolled: 16, teacher: "Ms. Rivera", tuitionPerSeat: 950, monthlyCost: 8200, withdrawals: 0, nweaMap: null, lastYear: { enrolled: 15, monthlyProfit: 6050, withdrawals: 1, nweaMap: null } },
  { id: 5, name: "VPK A — Maple", program: "VPK A", tier: "preschool", capacity: 10, enrolled: 9, teacher: "Ms. Brooks", tuitionPerSeat: 425, monthlyCost: 3800, withdrawals: 0, nweaMap: null, lastYear: { enrolled: 9, monthlyProfit: 25, withdrawals: 0, nweaMap: null } },
  { id: 6, name: "VPK B — Pine", program: "VPK B", tier: "preschool", capacity: 10, enrolled: 8, teacher: "Ms. Chen", tuitionPerSeat: 425, monthlyCost: 3800, withdrawals: 1, nweaMap: null, lastYear: { enrolled: 9, monthlyProfit: 25, withdrawals: 0, nweaMap: null } },
  { id: 7, name: "K — Sequoia", program: "K", tier: "k8", capacity: 20, enrolled: 19, teacher: "Mr. Nguyen", tuitionPerSeat: 850, monthlyCost: 9100, incidents: 1, nweaMap: 152, lastYear: { enrolled: 18, monthlyProfit: 6200, incidents: 2, nweaMap: 148 } },
  { id: 8, name: "1st — Cypress", program: "1st", tier: "k8", capacity: 20, enrolled: 18, teacher: "Ms. Cohen", tuitionPerSeat: 875, monthlyCost: 9200, incidents: 0, nweaMap: 168, lastYear: { enrolled: 19, monthlyProfit: 7425, incidents: 1, nweaMap: 165 } },
  { id: 9, name: "2nd — Willow", program: "2nd", tier: "k8", capacity: 22, enrolled: 21, teacher: "Ms. Diaz", tuitionPerSeat: 900, monthlyCost: 9400, incidents: 2, nweaMap: 184, lastYear: { enrolled: 20, monthlyProfit: 8600, incidents: 1, nweaMap: 182 } },
  { id: 10, name: "3rd — Birch", program: "3rd", tier: "k8", capacity: 22, enrolled: 20, teacher: "Mr. Park", tuitionPerSeat: 925, monthlyCost: 9600, incidents: 1, nweaMap: 195, lastYear: { enrolled: 21, monthlyProfit: 9825, incidents: 0, nweaMap: 192 } },
  { id: 11, name: "4th — Magnolia", program: "4th", tier: "k8", capacity: 24, enrolled: 22, teacher: "Mr. O'Brien", tuitionPerSeat: 950, monthlyCost: 9800, incidents: 0, nweaMap: 204, lastYear: { enrolled: 20, monthlyProfit: 9200, incidents: 1, nweaMap: 199 } },
  { id: 12, name: "5th — Cedar", program: "5th", tier: "k8", capacity: 24, enrolled: 19, teacher: "Ms. Hassan", tuitionPerSeat: 975, monthlyCost: 10000, incidents: 5, nweaMap: 198, lastYear: { enrolled: 22, monthlyProfit: 11450, incidents: 2, nweaMap: 207 } },
  { id: 13, name: "6th — Palm", program: "6th", tier: "k8", capacity: 24, enrolled: 17, teacher: "Mr. Levine", tuitionPerSeat: 1000, monthlyCost: 10200, incidents: 3, nweaMap: 209, lastYear: { enrolled: 19, monthlyProfit: 8800, incidents: 4, nweaMap: 208 } },
  { id: 14, name: "7th — Live Oak", program: "7th", tier: "k8", capacity: 24, enrolled: 14, teacher: "Ms. Foster", tuitionPerSeat: 1025, monthlyCost: 10400, incidents: 2, nweaMap: 215, lastYear: { enrolled: 16, monthlyProfit: 6000, incidents: 1, nweaMap: 213 } },
  { id: 15, name: "8th — Banyan", program: "8th", tier: "k8", capacity: 24, enrolled: 13, teacher: "Mr. Tate", tuitionPerSeat: 1050, monthlyCost: 10600, incidents: 4, nweaMap: 218, lastYear: { enrolled: 18, monthlyProfit: 8300, incidents: 2, nweaMap: 220 } },
];

// ─── Helpers ──────────────────────────────────────────────────────

const classroomEconomics = (c) => {
  const monthlyRevenue = c.tuitionPerSeat * c.enrolled;
  const monthlyProfit = monthlyRevenue - c.monthlyCost;
  const margin = monthlyRevenue > 0 ? Math.round((monthlyProfit / monthlyRevenue) * 100) : 0;
  return { monthlyRevenue, monthlyProfit, margin };
};

const fmtMoneyShort = (n) => (n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + n);

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState(DEFAULT_CLASSROOMS);
  const [tierFilter, setTierFilter] = useState("all");
  const [sortBy, setSortBy] = useState("profit");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClassroom, setNewClassroom] = useState({ name: "", program: "", tier: "preschool", capacity: "", teacher: "", tuitionPerSeat: "", monthlyCost: "" });

  const addClassroom = () => {
    if (!newClassroom.name.trim() || !newClassroom.capacity) return;
    const id = Math.max(...classrooms.map((c) => c.id)) + 1;
    setClassrooms((prev) => [...prev, {
      id, name: newClassroom.name, program: newClassroom.program || newClassroom.name.split(" — ")[0], tier: newClassroom.tier,
      capacity: Number(newClassroom.capacity), enrolled: 0, teacher: newClassroom.teacher || "TBD",
      tuitionPerSeat: Number(newClassroom.tuitionPerSeat) || 0, monthlyCost: Number(newClassroom.monthlyCost) || 0,
      withdrawals: 0, nweaMap: null, lastYear: { enrolled: 0, monthlyProfit: 0, withdrawals: 0, nweaMap: null },
    }]);
    setNewClassroom({ name: "", program: "", tier: "preschool", capacity: "", teacher: "", tuitionPerSeat: "", monthlyCost: "" });
    setShowAddForm(false);
  };

  const filtered = tierFilter === "all" ? classrooms : classrooms.filter((c) => c.tier === tierFilter);
  const sorted = [...filtered].sort((a, b) => {
    const aEcon = classroomEconomics(a), bEcon = classroomEconomics(b);
    if (sortBy === "profit") return bEcon.monthlyProfit - aEcon.monthlyProfit;
    if (sortBy === "margin") return bEcon.margin - aEcon.margin;
    return b.enrolled - a.enrolled;
  });

  const totalEnrolled = classrooms.reduce((a, c) => a + c.enrolled, 0);
  const totalCapacity = classrooms.reduce((a, c) => a + c.capacity, 0);
  const totalRevenue = classrooms.reduce((a, c) => a + classroomEconomics(c).monthlyRevenue, 0);
  const totalCost = classrooms.reduce((a, c) => a + c.monthlyCost, 0);
  const totalProfit = classrooms.reduce((a, c) => a + classroomEconomics(c).monthlyProfit, 0);
  const profitable = classrooms.filter((c) => classroomEconomics(c).monthlyProfit > 0).length;
  const losing = classrooms.length - profitable;
  const overallMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
  const avgFillRate = Math.round((totalEnrolled / totalCapacity) * 100);

  const profitChartData = classrooms.map((c) => {
    const econ = classroomEconomics(c);
    return { name: c.program, profit: econ.monthlyProfit, revenue: econ.monthlyRevenue };
  });

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Classrooms <span className="text-sm md:text-base font-normal text-gray-500 hidden sm:inline">— P&amp;L + Performance</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {classrooms.length} classrooms · {totalEnrolled} students · {fmtMoneyShort(totalProfit)}/mo
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" className="bg-white text-xs md:text-sm px-2.5 md:px-3">
            <BarChart3 size={14} className="mr-1.5" /> Reports
          </Button>
          <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm px-2.5 md:px-3" onClick={() => setShowAddForm(!showAddForm)}>
            <School size={14} className="mr-1.5" /> {showAddForm ? "Cancel" : "Add Classroom"}
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={DollarSign} label="Net Monthly Profit" value={totalProfit >= 0 ? fmtMoneyShort(totalProfit) : `-${fmtMoneyShort(Math.abs(totalProfit))}`} sub={`${overallMargin}% margin overall`} iconBg={totalProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={BookOpen} label="Classrooms" value={`${profitable}/${classrooms.length}`} sub={`${profitable} profitable · ${losing} losing`} iconBg="bg-blue-50 text-blue-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Users} label="Total Students" value={totalEnrolled} sub={`out of ${totalCapacity} capacity`} iconBg="bg-purple-50 text-purple-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Target} label="Avg Fill Rate" value={`${avgFillRate}%`} sub={`${totalCapacity - totalEnrolled} open seats`} iconBg="bg-amber-50 text-amber-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={TrendingUp} label="Monthly Revenue" value={fmtMoneyShort(totalRevenue)} sub={`vs ${fmtMoneyShort(totalCost)} costs`} iconBg="bg-emerald-50 text-emerald-600" />
        </motion.div>
      </div>

      {/* P&L + Profit Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PnLSummaryCard totalRevenue={totalRevenue} totalCost={totalCost} totalProfit={totalProfit} overallMargin={overallMargin} />
        <ProfitChart data={profitChartData} sortBy={sortBy} onSortChange={setSortBy} />
      </div>

      {/* Tier Filter */}
      <TierFilter tierFilter={tierFilter} onTierChange={setTierFilter} count={sorted.length} />

      {/* Classroom Cards */}
      <div className="space-y-3">
        {sorted.map((classroom) => (
          <ClassroomDetailCard key={classroom.id} classroom={classroom} />
        ))}
        {sorted.length === 0 && (
          <div className="py-12 text-center">
            <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No classrooms match this filter.</p>
          </div>
        )}
      </div>

      {/* Add Classroom Modal */}
      <AddClassroomModal isOpen={showAddForm} form={newClassroom}
        onFormChange={(key, value) => setNewClassroom((p) => ({ ...p, [key]: value }))}
        onSave={addClassroom} onClose={() => setShowAddForm(false)} />
    </motion.div>
  );
};

export default ClassroomsPage;
