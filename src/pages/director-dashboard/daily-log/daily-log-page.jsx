import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogForm from "./components/LogForm";
import DailyLogStatsCard from "./components/DailyLogStatsCard";
import DailyLogSearchBar from "./components/DailyLogSearchBar";
import DailyLogGroupList from "./components/DailyLogGroupList";

const TODAY = new Date("2026-05-11");
const todayStr = TODAY.toISOString().split("T")[0];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const INITIAL_LOG = [
  // Incidents
  { id: 101, type: "incident", date: "2026-05-11", student: "Student A.", classroom: "PreK3", severity: "minor", area: "Playground", description: "Minor scrape on elbow during recess" },
  { id: 102, type: "incident", date: "2026-05-07", student: "Student C.", classroom: "1st/2nd Grade", severity: "moderate", area: "Classroom", description: "Disruptive behavior and refused instruction" },
  { id: 103, type: "incident", date: "2026-04-22", student: "Student D.", classroom: "Twos", severity: "major", area: "Playground", description: "Biting incident on playground" },

  // Removals
  { id: 201, type: "removal", date: "2026-05-04", student: "Student B.", classroom: "3rd/4th Grade", reason: "behavioral", detail: "Parent withdrew student following intervention plan" },
  { id: 202, type: "removal", date: "2026-04-15", student: "Student E.", classroom: "5th/6th Grade (Ms.Stinson)", reason: "transferring", detail: "Family relocated out of state" },

  // Staff PTO
  { id: 301, type: "pto", date: "2026-05-11", staffName: "Ms. Sarah Jenkins", role: "Lead Teacher", ptoType: "Sick Leave", startDate: "2026-05-11", endDate: "2026-05-11", notes: "Called in sick, coverage arranged" },
  { id: 302, type: "pto", date: "2026-05-09", staffName: "Mr. Robert Vance", role: "Assistant Teacher", ptoType: "Vacation", startDate: "2026-05-09", endDate: "2026-05-12", notes: "Pre-approved family trip" },

  // Substitutes
  { id: 401, type: "substitute", date: "2026-05-11", coveredStaff: "Ms. Sarah Jenkins", substituteName: "Amanda Clark", classroom: "VPK A", shiftDate: "2026-05-11", notes: "Full day sub coverage verified" },
  { id: 402, type: "substitute", date: "2026-05-08", coveredStaff: "Ms. Rebecca Cole", substituteName: "David Miller", classroom: "Threes", shiftDate: "2026-05-08", notes: "Morning shift sub coverage" },

  // Waitlist
  { id: 501, type: "waitlist", date: "2026-05-11", childName: "Leo Vance", parentName: "David Vance", classroom: "Ones", phone: "(863) 555-0192", source: "Referral", notes: "Tour completed, requested August start" },
  { id: 502, type: "waitlist", date: "2026-05-06", childName: "Sophie Miller", parentName: "Rachel Miller", classroom: "Kindergarten", phone: "(863) 555-0144", source: "Website", notes: "Inquired via online form" },

  // Maintenance
  { id: 601, type: "maintenance", date: "2026-05-11", title: "HVAC Unit Leaking Water", location: "Room 104 (VPK B)", priority: "High", category: "HVAC", details: "Maintenance team dispatched, bucket placed" },
  { id: 602, type: "maintenance", date: "2026-05-02", title: "Playground Latch Loose", location: "Outside Yard 2", priority: "Emergency", category: "Safety", details: "Latch re-secured and safety inspected" },

  // At-Risk
  { id: 701, type: "at_risk", date: "2026-05-10", student: "J. Martinez", classroom: "5th/6th Grade (Ms.Stinson)", riskCategory: "financial", detail: "Parent inquired about tuition payment plan" },
  { id: 702, type: "at_risk", date: "2026-05-05", student: "A. Choi", classroom: "7/8 Grade", riskCategory: "transferring", detail: "Family looking at alternative private school" }
];

const BUTTON_LABELS = {
  all: "New Entry",
  incident: "Log Incident",
  removal: "Record Removal",
  pto: "Log PTO Entry",
  substitute: "Log Substitute",
  waitlist: "Log Waitlist Inquiry",
  maintenance: "Log Maintenance",
  at_risk: "Flag At-Risk Student",
};

const DailyLogPage = () => {
  const [log, setLog] = useState(INITIAL_LOG);
  const [showForm, setShowForm] = useState(false);
  const [formInitialType, setFormInitialType] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAdd = (entry) => setLog((prev) => [entry, ...prev]);

  const openLogModal = (type = null) => {
    setFormInitialType(type || (filterType === "all" ? null : filterType));
    setShowForm(true);
  };

  const counts = useMemo(() => {
    const c = {
      all: log.length,
      incident: 0,
      removal: 0,
      pto: 0,
      substitute: 0,
      waitlist: 0,
      maintenance: 0,
      at_risk: 0,
    };
    log.forEach((e) => {
      if (c[e.type] !== undefined) c[e.type] += 1;
    });
    return c;
  }, [log]);

  const filtered = useMemo(() => {
    let result = log;
    if (filterType !== "all") {
      result = result.filter((e) => e.type === filterType);
    }
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

  const actionButtonText = BUTTON_LABELS[filterType] || "New Entry";

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Daily Log Operational Hub</h1>
          <p className="text-xs text-gray-500 mt-1">
            Centralized logging for incidents, removals, staff PTO, substitutes, waitlist inquiries, maintenance & student retention.
          </p>
        </div>
        <Button 
          className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-bold rounded-xl text-xs px-4 py-2 flex items-center gap-1.5 shrink-0" 
          onClick={() => openLogModal()}
        >
          <Plus size={16} /> {actionButtonText}
        </Button>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {["all", "incident", "removal", "pto", "substitute", "waitlist", "maintenance", "at_risk"].map((typeKey) => (
          <DailyLogStatsCard
            key={typeKey}
            type={typeKey}
            count={counts[typeKey] || 0}
            filterType={filterType}
            onFilter={setFilterType}
          />
        ))}
      </div>

      {/* Search & Filter Tabs */}
      <DailyLogSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
      />

      {/* Entries List grouped by date */}
      <DailyLogGroupList groupedByDate={groupedByDate} todayStr={todayStr} />

      {/* Dynamic Unified Log Form Modal */}
      {showForm && (
        <LogForm 
          defaultType={formInitialType}
          onAdd={handleAdd} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </motion.div>
  );
};

export default DailyLogPage;
