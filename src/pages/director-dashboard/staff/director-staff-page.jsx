import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Users, 
  CheckCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "./components/StatCard";
import TabBar from "./components/TabBar";
import PTOHistoryCard from "./components/PTOHistoryCard";
import SubstituteHistoryCard from "./components/SubstituteHistoryCard";
import PTOForm from "./components/PTOForm";
import SubstituteForm from "./components/SubstituteForm";
import StaffRosterTable from "../../owner-dashboard/staff/components/StaffRosterTable";
import StaffFormModal from "../../owner-dashboard/staff/components/StaffFormModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useGetPtoStaff } from "@/hooks";

const TODAY = new Date("2026-05-11");

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const INITIAL_PTO_LOG = [
  { id: 1, staffId: 1, dayType: "sick", days: 1, date: "2026-05-08" },
  { id: 2, staffId: 7, dayType: "personal", days: 1, date: "2026-05-06" },
  { id: 3, staffId: 7, dayType: "personal", days: 1, date: "2026-05-02" },
  { id: 4, staffId: 8, dayType: "vacation", days: 2, date: "2026-04-25" },
];

const INITIAL_SUBSTITUTES = [
  { id: 1, date: "2026-05-11", coveringFor: "Ms. Cohen", subName: "Ms. Hart", calledBy: "Director" },
  { id: 2, date: "2026-05-05", coveringFor: "Mr. Levine", subName: "Mr. Owens", calledBy: "Director" },
  { id: 3, date: "2026-04-28", coveringFor: "Ms. Diaz", subName: "Ms. Hart", calledBy: "Director" },
];

const DirectorStaffManagement = () => {
  const [activeTab, setActiveTab] = useState("roster");
  const [ptoLog, setPtoLog] = useState(INITIAL_PTO_LOG);
  const [substitutes, setSubstitutes] = useState(INITIAL_SUBSTITUTES);
  const [showForm, setShowForm] = useState(false);

  // Local state for staff roster list
  const [allStaffRoster, setAllStaffRoster] = useState([]);
  const [sortBy, setSortBy] = useState("name");

  // Modal and action states for staff management
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const { staffList = [] } = useGetPtoStaff({ per_page: 1000 });

  // Sync API staff list with local state
  useEffect(() => {
    if (staffList && staffList.length > 0 && allStaffRoster.length === 0) {
      // Map initial API shape to what RosterTable expects
      const formatted = staffList.map((s) => ({
        ...s,
        employee_id: s.employee_id || s.procare_employee_id || s.id,
        name: s.name,
        role: s.role || "Lead Teacher",
        ptoAllowance: s.total_allowance_days || 10,
        pto_used: s.pto_used ?? s.ptoUsed ?? 0,
        remaining: (s.total_allowance_days || 10) - (s.pto_used ?? s.ptoUsed ?? 0),
        usage_percentage: Math.round(((s.pto_used ?? s.ptoUsed ?? 0) / (s.total_allowance_days || 10)) * 100)
      }));
      setAllStaffRoster(formatted);
    }
  }, [staffList]);

  const ptoStats = useMemo(() => ({
    totalDays: ptoLog.reduce((a, r) => a + r.days, 0),
    sickDays: ptoLog.filter((r) => r.dayType === "sick").reduce((a, r) => a + r.days, 0),
    personalDays: ptoLog.filter((r) => r.dayType === "personal").reduce((a, r) => a + r.days, 0),
    uniqueStaff: [...new Set(ptoLog.map((r) => r.staffId))].length,
  }), [ptoLog]);

  const subStats = useMemo(() => ({
    total: substitutes.length,
    thisWeek: substitutes.filter((r) => {
      const diff = Math.ceil((TODAY - new Date(r.date)) / 86400000);
      return diff >= 0 && diff <= 7;
    }).length,
    uniqueSubs: [...new Set(substitutes.map((r) => r.subName))].length,
  }), [substitutes]);

  const rosterStats = useMemo(() => ({
    total: allStaffRoster.length,
    leadTeachers: allStaffRoster.filter(s => s.role === "Lead Teacher").length,
    assistants: allStaffRoster.filter(s => s.role === "Assistant Teacher").length,
    support: allStaffRoster.filter(s => !["Lead Teacher", "Assistant Teacher"].includes(s.role)).length,
  }), [allStaffRoster]);

  const handleAddPTO = (entry) => setPtoLog((prev) => [entry, ...prev]);
  const handleAddSub = (entry) => setSubstitutes((prev) => [entry, ...prev]);

  // CRUD events
  const handleAddStaffClick = () => {
    setEditingStaff(null);
    setIsStaffModalOpen(true);
  };

  const handleEditStaffClick = (staff) => {
    setEditingStaff(staff);
    setIsStaffModalOpen(true);
  };

  const handleDeleteStaffClick = (employeeId) => {
    setPendingDeleteId(employeeId);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteStaff = () => {
    setAllStaffRoster((prev) => prev.filter((s) => (s.employee_id || s.id) !== pendingDeleteId));
    setIsConfirmDeleteOpen(false);
    setPendingDeleteId(null);
  };

  const handleSaveStaff = (form) => {
    if (editingStaff) {
      setAllStaffRoster((prev) =>
        prev.map((s) =>
          (s.employee_id || s.id) === (editingStaff.employee_id || editingStaff.id)
            ? {
                ...s,
                name: form.name,
                role: form.role,
                classroom: form.classroom,
                status: form.status,
                ptoAllowance: form.ptoAllowance,
                pto_used: form.pto_used,
                hireDate: form.hireDate,
                phone: form.phone,
                email: form.email,
                remaining: form.ptoAllowance - form.pto_used,
                usage_percentage: Math.round((form.pto_used / form.ptoAllowance) * 100)
              }
            : s
        )
      );
    } else {
      const newStaff = {
        id: Math.floor(Math.random() * 1000) + 100,
        employee_id: form.employee_id,
        name: form.name,
        role: form.role,
        classroom: form.classroom,
        status: form.status,
        ptoAllowance: form.ptoAllowance,
        pto_used: form.pto_used,
        hireDate: form.hireDate,
        phone: form.phone,
        email: form.email,
        remaining: form.ptoAllowance - form.pto_used,
        usage_percentage: Math.round((form.pto_used / form.ptoAllowance) * 100)
      };
      setAllStaffRoster((prev) => [newStaff, ...prev]);
    }
  };

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {allStaffRoster.length > 0 ? allStaffRoster.length : staffList.length} staff members · Track PTO & substitutes
          </p>
        </div>
        {activeTab === "roster" ? (
          <Button 
            className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-bold transition-all px-4 py-2.5 rounded-xl text-xs md:text-sm flex items-center gap-1.5"
            onClick={handleAddStaffClick}
          >
            <Plus size={16} /> Add Staff Member
          </Button>
        ) : (
          <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-bold transition-all px-4 py-2 rounded-xl text-xs md:text-sm flex items-center gap-1.5" onClick={() => setShowForm(true)}>
            <Plus size={16} /> {activeTab === "pto" ? "Log PTO" : "Log Substitute"}
          </Button>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <TabBar activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); setShowForm(false); }} />
      </motion.div>

      {/* ─── ROSTER TAB ─── */}
      {activeTab === "roster" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Total Roster" 
                value={rosterStats.total} 
                sub="Active staff" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Lead Teachers" 
                value={rosterStats.leadTeachers} 
                valueColor="text-[#2F6042]" 
                sub="Classroom leads" 
                iconBg="bg-[#3E7A54]/10 text-[#2F6042]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Assistants" 
                value={rosterStats.assistants} 
                valueColor="text-[#1E3A5F]" 
                sub="Co-teachers & helpers" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Other Staff" 
                value={rosterStats.support} 
                sub="Chef, admins & floaters" 
                iconBg="bg-gray-50 text-gray-600" 
              />
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-6">
            <StaffRosterTable
              staffRoster={allStaffRoster}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onEdit={handleEditStaffClick}
              onDelete={handleDeleteStaffClick}
            />
          </motion.div>
        </>
      )}

      {/* ─── PTO TAB ─── */}
      {activeTab === "pto" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Calendar} 
                label="Total PTO Days" 
                value={ptoStats.totalDays} 
                sub="Logged requests" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={AlertTriangle} 
                label="Sick Days" 
                value={ptoStats.sickDays} 
                valueColor="text-[#8F6A1F]" 
                sub="Medical call-outs" 
                iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Clock} 
                label="Personal Days" 
                value={ptoStats.personalDays} 
                valueColor="text-[#1E3A5F]" 
                sub="Personal leave" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Staff Affected" 
                value={ptoStats.uniqueStaff} 
                sub="Distinct members" 
                iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]" 
              />
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-6">
            <PTOHistoryCard ptoLog={ptoLog} staff={allStaffRoster.length > 0 ? allStaffRoster : staffList} />
          </motion.div>
        </>
      )}

      {/* ─── SUBSTITUTES TAB ─── */}
      {activeTab === "substitute" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Total Substitutes" 
                value={subStats.total} 
                sub="Coverages filled" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Calendar} 
                label="This Week" 
                value={subStats.thisWeek} 
                valueColor="text-[#1E3A5F]" 
                sub="Active substitute needs" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Unique Subs" 
                value={subStats.uniqueSubs} 
                sub="Sub Pool size" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={CheckCircle} 
                label="Coverage" 
                value={subStats.thisWeek > 0 ? `${Math.round((subStats.thisWeek / subStats.total) * 100)}%` : "100%"} 
                valueColor="text-[#2F6042]" 
                sub="Fill rate percentage" 
                iconBg="bg-[#3E7A54]/10 text-[#2F6042]" 
              />
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-6">
            <SubstituteHistoryCard substitutes={substitutes} />
          </motion.div>
        </>
      )}

      {/* Forms and modals */}
      {showForm && activeTab === "pto" && (
        <PTOForm onClose={() => setShowForm(false)} />
      )}
      {showForm && activeTab === "substitute" && (
        <SubstituteForm onClose={() => setShowForm(false)} />
      )}

      {/* Staff Form Modal */}
      <StaffFormModal
        isOpen={isStaffModalOpen}
        staff={editingStaff}
        onSave={handleSaveStaff}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
      />

      {/* Confirmation Modal for Staff Deletion */}
      <ConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={confirmDeleteStaff}
        title="Remove Staff Member"
        message="Are you sure you want to remove this employee? This will immediately disable their roster assignment and archive their Procare profile history."
        confirmText="Remove Staff"
        cancelText="Cancel"
        type="danger"
      />
    </motion.div>
  );
};

export default DirectorStaffManagement;
