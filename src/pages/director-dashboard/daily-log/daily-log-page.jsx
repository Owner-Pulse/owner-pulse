import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EscalationPrompt from "@/components/EscalationPrompt";
import { addEscalation } from "@/lib/escalation-store";
import LogForm from "./components/LogForm";
import DailyLogStatsCard from "./components/DailyLogStatsCard";
import DailyLogSearchBar from "./components/DailyLogSearchBar";
import DailyLogGroupList from "./components/DailyLogGroupList";

const TODAY = new Date("2026-05-11");

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const INITIAL_LOG = [
  { id: 101, type: "incident", date: "2026-05-07", student: "Student A.", severity: "minor", area: "Playground" },
  { id: 102, type: "incident", date: "2026-05-03", student: "Student C.", severity: "moderate", area: "Classroom" },
  { id: 103, type: "incident", date: "2026-04-22", student: "Student D.", severity: "major", area: "Playground" },
  { id: 104, type: "removal", date: "2026-05-04", student: "Student B.", reason: "behavioral" },
  { id: 105, type: "removal", date: "2026-04-15", student: "Student E.", reason: "transferring" },
];

const DailyLogPage = () => {
  const [log, setLog] = useState(INITIAL_LOG);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [escalationOpen, setEscalationOpen] = useState(false);

  const handleAdd = (entry) => setLog((prev) => [entry, ...prev]);

  const todayStr = new Date().toISOString().split("T")[0];
  const stats = useMemo(() => ({
    today: log.filter((e) => e.date === todayStr).length,
    incidents: log.filter((e) => e.type === "incident").length,
    removals: log.filter((e) => e.type === "removal").length,
    major: log.filter((e) => e.type === "incident" && e.severity === "major").length,
  }), [log]);

  const filtered = useMemo(() => {
    let result = log;
    if (filterType !== "all") result = result.filter((e) => e.type === filterType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) => Object.values(e).join(" ").toLowerCase().includes(q));
    }
    return result;
  }, [log, filterType, searchQuery]);

  const groupedByDate = useMemo(() => {
    const groups = {};
    [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((e) => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a));
  }, [filtered]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Daily Log</h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.incidents} incidents · {stats.removals} removals · {stats.major > 0 && `${stats.major} major`}
          </p>
        </div>
        <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm" onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" /> New Entry
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <DailyLogStatsCard type="incident" stats={stats} filterType={filterType} onFilter={setFilterType} />
        <DailyLogStatsCard type="removal" stats={stats} filterType={filterType} onFilter={setFilterType} />
      </div>

      {/* Search & Filter */}
      <DailyLogSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
      />

      {/* Entries */}
      <DailyLogGroupList groupedByDate={groupedByDate} todayStr={todayStr} />

      {/* Form Modal */}
      {showForm && <LogForm onAdd={handleAdd} onClose={() => setShowForm(false)} />}

      {/* Escalate to Owner */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-700">Need the Owner involved?</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Escalate any item for approval or decision</p>
              </div>
              <Button onClick={() => setEscalationOpen(true)} className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs">
                <ArrowUpRight size={14} className="mr-1.5" /> Escalate to Owner
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Escalation Prompt Modal */}
      <EscalationPrompt
        isOpen={escalationOpen}
        onClose={() => setEscalationOpen(false)}
        onSubmit={(data) => {
          // Save to shared escalation store so Owner can review in Pending Decisions page
          addEscalation(data);
          // Also log locally
          setLog((prev) => [{
            id: Date.now(),
            type: "escalation",
            date: new Date().toISOString().split("T")[0],
            escalation: data,
          }, ...prev]);
          setEscalationOpen(false);
        }}
        itemDescription="Route a decision or approval item from the Daily Log"
      />
    </motion.div>
  );
};

export default DailyLogPage;
