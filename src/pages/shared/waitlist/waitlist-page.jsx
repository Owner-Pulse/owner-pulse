import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  UserPlus,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import ProgramBreakdownCard from "./components/ProgramBreakdownCard";
import WaitlistFilters from "./components/WaitlistFilters";
import WaitlistTable from "./components/WaitlistTable";
import AddWaitlistModal from "./components/AddWaitlistModal";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── Data ─────────────────────────────────────────────────────────

const TODAY = new Date("2026-05-11");

const PRESCHOOL_PROGRAMS = ["Age 1", "Age 2", "PreK3", "PreK4", "VPK", "Summer"];
const K8_PROGRAMS = ["K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const ALL_PROGRAMS = [...PRESCHOOL_PROGRAMS, ...K8_PROGRAMS];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const getCurrentUser = () =>
  JSON.parse(localStorage.getItem("user") || '{"role":"owner","name":"John Doe"}');

const INITIAL_WAITLIST = [
  { id: 1, child: "Emma R.", program: "PreK4", parent: "Sara R.", phone: "813-555-0142", email: "s.r@email.com", dateAdded: "2026-03-18", status: "toured", source: "referral" },
  { id: 2, child: "Noah K.", program: "K", parent: "James K.", phone: "813-555-0188", email: "j.k@email.com", dateAdded: "2026-04-02", status: "applied", source: "website" },
  { id: 3, child: "Liam M.", program: "2nd", parent: "Maria M.", phone: "813-555-0210", email: "m.m@email.com", dateAdded: "2026-04-11", status: "offered", source: "walk_in" },
  { id: 4, child: "Sophia D.", program: "PreK3", parent: "Anika D.", phone: "813-555-0301", email: "a.d@email.com", dateAdded: "2026-04-19", status: "inquiry", source: "event" },
  { id: 5, child: "Ethan C.", program: "5th", parent: "Lin C.", phone: "813-555-0277", email: "l.c@email.com", dateAdded: "2026-04-22", status: "toured", source: "referral" },
  { id: 6, child: "Ava B.", program: "K", parent: "Daniel B.", phone: "813-555-0344", email: "d.b@email.com", dateAdded: "2026-05-01", status: "applied", source: "website" },
  { id: 7, child: "Mason W.", program: "1st", parent: "Erin W.", phone: "813-555-0399", email: "e.w@email.com", dateAdded: "2026-05-06", status: "inquiry", source: "website" },
  { id: 8, child: "Zoe T.", program: "PreK4", parent: "Omar T.", phone: "813-555-0412", email: "o.t@email.com", dateAdded: "2026-05-08", status: "inquiry", source: "referral" },
  { id: 9, child: "Lucas P.", program: "3rd", parent: "Nina P.", phone: "813-555-0500", email: "n.p@email.com", dateAdded: "2026-04-15", status: "offered", source: "walk_in" },
  { id: 10, child: "Mia J.", program: "VPK", parent: "Chris J.", phone: "813-555-0611", email: "c.j@email.com", dateAdded: "2026-03-28", status: "enrolled", source: "referral" },
  { id: 11, child: "Oliver G.", program: "6th", parent: "Sarah G.", phone: "813-555-0722", email: "s.g@email.com", dateAdded: "2026-05-03", status: "toured", source: "website" },
  { id: 12, child: "Isla N.", program: "Age 2", parent: "Mike N.", phone: "813-555-0833", email: "m.n@email.com", dateAdded: "2026-04-28", status: "inquiry", source: "event" },
];

const STATUS_FLOW = ["inquiry", "applied", "toured", "offered", "enrolled"];

const daysSince = (d) => Math.floor((TODAY - new Date(d)) / 86400000);

const WaitlistPage = () => {
  const [waitlist, setWaitlist] = useState(INITIAL_WAITLIST);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = getCurrentUser();
  const role = currentUser.role;

  const handleAdd = (entry) => {
    setWaitlist((prev) => [...prev, entry]);
  };

  const advanceStatus = (id) => {
    setWaitlist((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const idx = STATUS_FLOW.indexOf(w.status);
        if (idx >= STATUS_FLOW.length - 1) return { ...w, status: "inquiry" };
        return { ...w, status: STATUS_FLOW[idx + 1] };
      })
    );
  };

  const preschoolCount = useMemo(() => waitlist.filter((w) => PRESCHOOL_PROGRAMS.includes(w.program)).length, [waitlist]);
  const k8Count = useMemo(() => waitlist.filter((w) => K8_PROGRAMS.includes(w.program)).length, [waitlist]);

  const bySource = useMemo(() => {
    const src = {};
    waitlist.forEach((w) => { src[w.source] = (src[w.source] || 0) + 1; });
    return src;
  }, [waitlist]);

  const byProgram = useMemo(() => {
    return ALL_PROGRAMS.map((p) => {
      const items = waitlist.filter((w) => w.program === p);
      const days = items.map((w) => daysSince(w.dateAdded));
      const avg = days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
      return { program: p, count: items.length, avgWait: avg };
    }).filter((p) => p.count > 0);
  }, [waitlist]);

  const filtered = useMemo(() => {
    let result = waitlist;
    if (statusFilter !== "all") result = result.filter((w) => w.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((w) =>
        w.child.toLowerCase().includes(q) ||
        w.parent.toLowerCase().includes(q) ||
        w.program.toLowerCase().includes(q)
      );
    }
    return result;
  }, [waitlist, statusFilter, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const order = { inquiry: 0, applied: 1, toured: 2, offered: 3, enrolled: 4 };
      return order[a.status] - order[b.status];
    });
  }, [filtered]);

  const staleEntries = useMemo(() => waitlist.filter((w) => daysSince(w.dateAdded) >= 30 && w.status !== "enrolled"), [waitlist]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Waitlist</h1>
          <p className="text-sm text-gray-500 mt-1">
            {waitlist.length} families · {preschoolCount} preschool · {k8Count} K–8
            {role === "director" && " · Manage inquiries and add new families"}
          </p>
        </div>
        {role === "director" && (
          <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} className="mr-2" /> Add to Waitlist
          </Button>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={Calendar} label="Total Families" value={waitlist.length} sub={`${waitlist.filter((w) => w.status === "enrolled").length} enrolled`} iconBg="bg-blue-50 text-blue-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Users} label="Preschool" value={preschoolCount} sub={`${Math.round(preschoolCount / waitlist.length * 100)}% of waitlist`} iconBg="bg-purple-50 text-purple-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={GraduationCap} label="K–8" value={k8Count} sub={`${Math.round(k8Count / waitlist.length * 100)}% of waitlist`} iconBg="bg-amber-50 text-amber-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={AlertTriangle} label="Stale (30d+)" value={staleEntries.length} sub={staleEntries.length > 0 ? "Need follow-up" : "All recent"} iconBg={staleEntries.length > 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"} valueColor={staleEntries.length > 0 ? "text-red-600" : "text-gray-900"} />
        </motion.div>
      </div>

      {/* Owner: High-level program breakdown */}
      {role === "owner" && <ProgramBreakdownCard byProgram={byProgram} bySource={bySource} />}

      {/* Filters & Search */}
      <WaitlistFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Waitlist Table */}
      <WaitlistTable
        entries={sorted}
        role={role}
        onAdvanceStatus={advanceStatus}
        onShowAdd={() => setShowAddModal(true)}
      />

      {/* Add Waitlist Modal */}
      {showAddModal && <AddWaitlistModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />}
    </motion.div>
  );
};

export default WaitlistPage;
