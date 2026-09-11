import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, AlertTriangle, UserX, Calendar, UserCheck, UserPlus, Wrench, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

// Daily Log Hook
import { useGetDailyLogs } from "@/hooks/director-hook/dailyLog.hook";

// Sub-components for Daily Log page
import DailyLogStatsCard from "./components/DailyLogStatsCard";
import DailyLogSearchBar from "./components/DailyLogSearchBar";
import DailyLogGroupList from "./components/DailyLogGroupList";

// Category Forms & Modals
import IncidentForm from "@/pages/director-dashboard/students/components/IncidentForm";
import RemovalForm from "@/pages/director-dashboard/students/components/RemovalForm";
import AtRiskForm from "@/pages/director-dashboard/students/components/AtRiskForm";
import PTOForm from "@/pages/director-dashboard/staff/components/PTOForm";
import SubstituteForm from "@/pages/director-dashboard/staff/components/SubstituteForm";
import AddWaitlistModal from "@/pages/shared/waitlist/components/AddWaitlistModal";
import AddMaintenanceForm from "@/pages/shared/maintenance/components/AddMaintenanceForm";

// Mutations for forms requiring parent callbacks
import {
  useLogIncident,
  useAddRemovalStudent,
  useAddAtRiskStudent,
} from "@/hooks/director-hook/student-manage.hook";
import { useAddDirectorWaitlist } from "@/hooks/director-hook/waitlist.hook";
import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";

const TODAY = new Date().toISOString().split("T")[0];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export const LOG_TYPES = [
  { 
    id: "incident", 
    label: "Incident", 
    desc: "Safety, behavior or medical event", 
    icon: AlertTriangle, 
    color: "bg-[#AE4A3E]", 
    light: "bg-[#AE4A3E]/10 text-[#8A362C] border-[#AE4A3E]/20" 
  },
  { 
    id: "removal", 
    label: "Removal", 
    desc: "Student withdrawal or drop", 
    icon: UserX, 
    color: "bg-[#8A362C]", 
    light: "bg-[#8A362C]/10 text-[#8A362C] border-[#8A362C]/20" 
  },
  { 
    id: "pto", 
    label: "PTO Entry", 
    desc: "Staff vacation or sick leave", 
    icon: Calendar, 
    color: "bg-blue-600", 
    light: "bg-blue-50 text-blue-700 border-blue-200" 
  },
  { 
    id: "substitute", 
    label: "Substitute Entry", 
    desc: "Covering classroom shift", 
    icon: UserCheck, 
    color: "bg-teal-600", 
    light: "bg-teal-50 text-teal-700 border-teal-200" 
  },
  { 
    id: "waitlist", 
    label: "Waitlist Entry", 
    desc: "Inquiry or prospective child", 
    icon: UserPlus, 
    color: "bg-purple-600", 
    light: "bg-purple-50 text-purple-700 border-purple-200" 
  },
  { 
    id: "maintenance", 
    label: "Maintenance Entry", 
    desc: "Facility repair or ticket", 
    icon: Wrench, 
    color: "bg-amber-600", 
    light: "bg-amber-50 text-amber-700 border-amber-200" 
  },
  { 
    id: "at_risk", 
    label: "At-Risk Entry", 
    desc: "Early retention intervention", 
    icon: ShieldAlert, 
    color: "bg-rose-600", 
    light: "bg-rose-50 text-rose-700 border-rose-200" 
  },
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
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalType, setActiveModalType] = useState(null); // 'picker' or category string ('incident', 'pto', etc.)

  // Classrooms hook
  const { classrooms } = useGetAllClassrooms();

  // Fetch backend daily log data using custom TanStack Query hook
  const {
    summary,
    groupedTimeline,
    isLoading,
    refetch
  } = useGetDailyLogs({
    type: filterType === "this_week" ? "all" : filterType,
    search: searchQuery,
  });

  // API Mutation hooks
  const incidentMutation = useLogIncident();
  const removalMutation = useAddRemovalStudent();
  const atRiskMutation = useAddAtRiskStudent();
  const waitlistMutation = useAddDirectorWaitlist();

  // Stats Card counts mapped from API summary
  const counts = {
    all: summary.total_daily_logs ?? summary.total_logs_today ?? 0,
    incident: summary.incidents || 0,
    removal: summary.removals || 0,
    pto: summary.pto_entries || 0,
    substitute: summary.substitutes || 0,
    waitlist: summary.waitlist_inquiries || 0,
    maintenance: summary.maintenance || 0,
    at_risk: summary.at_risk_flags || 0,
  };

  const openModalForCurrentFilter = () => {
    if (filterType === "all") {
      setActiveModalType("picker");
    } else {
      setActiveModalType(filterType);
    }
  };

  const closeModal = () => {
    setActiveModalType(null);
    refetch();
  };

  // Handler for Incident modal submit
  const handleAddIncident = (record) => {
    const matchedClassroom = classrooms.find((c) => (c.classroom_name || c.name) === record.classroom);
    incidentMutation.mutate(
      {
        procare_child_id: Number(record.procare_child_id || record.childId || 1),
        severity: record.severity,
        procare_classroom_id: Number(record.procare_classroom_id || record.classroomId || matchedClassroom?.procare_classroom_id || matchedClassroom?.id || 1),
        area: record.area,
        type: record.incidentType || "Behavior",
        description: record.description,
      },
      {
        onSuccess: () => {
          toast.success("Incident logged successfully");
          closeModal();
        },
        onError: () => {
          toast.error("Failed to log incident");
        },
      }
    );
  };

  // Handler for Removal modal submit
  const handleAddRemoval = (record) => {
    const matchedClassroom = classrooms.find((c) => (c.classroom_name || c.name) === record.classroom);
    removalMutation.mutate(
      {
        procare_child_id: Number(record.procare_child_id || record.childId || 1),
        reason: record.reason,
        effective_date: record.date,
        parent_notification_received: record.parentNotified === "Yes" ? 1 : 0,
        procare_classroom_id: Number(record.procare_classroom_id || record.classroomId || matchedClassroom?.procare_classroom_id || matchedClassroom?.id || 1),
        details: record.detail,
      },
      {
        onSuccess: () => {
          toast.success("Removal recorded successfully");
          closeModal();
        },
        onError: () => {
          toast.error("Failed to record removal");
        },
      }
    );
  };

  // Handler for At-Risk modal submit
  const handleAddAtRisk = (record) => {
    const matchedClassroom = classrooms.find((c) => (c.classroom_name || c.name) === record.grade);
    atRiskMutation.mutate(
      {
        procare_child_id: Number(record.procare_child_id || record.childId || 1),
        risk_category: record.reason,
        flag_date: record.flagged,
        procare_classroom_id: Number(record.procare_classroom_id || record.classroomId || matchedClassroom?.procare_classroom_id || matchedClassroom?.id || 1),
        risk_details: record.detail,
      },
      {
        onSuccess: () => {
          toast.success("At-Risk student flagged successfully");
          closeModal();
        },
        onError: () => {
          toast.error("Failed to flag at-risk student");
        },
      }
    );
  };

  // Handler for Waitlist modal submit
  const handleSaveWaitlist = async (formData) => {
    const matchedClassroom = classrooms.find((c) => (c.classroom_name || c.name) === formData.program);
    await waitlistMutation.addWaitlist({
      child_name: formData.childName,
      date_of_birth: formData.dob,
      procare_classroom_id: matchedClassroom?.procare_classroom_id || matchedClassroom?.id || 1,
      parent_name: formData.parentName,
      phone: formData.phone,
      email: formData.email,
      lead_source: formData.source,
      notes: formData.notes,
    });
    closeModal();
  };

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
          onClick={openModalForCurrentFilter}
        >
          <Plus size={16} /> {actionButtonText}
        </Button>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-8 gap-3">
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

      {/* Grouped Timeline Entries */}
      <DailyLogGroupList
        groupedTimeline={groupedTimeline}
        filterType={filterType}
        searchQuery={searchQuery}
        isLoading={isLoading}
        todayStr={TODAY}
      />

      {/* ─── MODAL CONTROLLER ─── */}
      <AnimatePresence>
        {/* Category Picker Modal when clicked from 'all' */}
        {activeModalType === "picker" && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Select Log Category</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Choose the operational event type to record</p>
                </div>
                <button onClick={closeModal} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
                {LOG_TYPES.map((lt) => {
                  const Icon = lt.icon;
                  return (
                    <button
                      key={lt.id}
                      type="button"
                      onClick={() => setActiveModalType(lt.id)}
                      className="flex items-start gap-3.5 p-4 rounded-2xl border border-gray-100 hover:border-[#1E3A5F]/30 hover:bg-slate-50/80 transition-all text-left group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${lt.light} shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 group-hover:text-[#1E3A5F]">{lt.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{lt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* 1. Incident Form Modal */}
        {activeModalType === "incident" && (
          <IncidentForm
            onAdd={handleAddIncident}
            onClose={closeModal}
            isLoading={incidentMutation.isPending}
          />
        )}

        {/* 2. Removal Form Modal */}
        {activeModalType === "removal" && (
          <RemovalForm
            onAdd={handleAddRemoval}
            onClose={closeModal}
            isLoading={removalMutation.isPending}
          />
        )}

        {/* 3. At-Risk Form Modal */}
        {activeModalType === "at_risk" && (
          <AtRiskForm
            onAdd={handleAddAtRisk}
            onClose={closeModal}
            isLoading={atRiskMutation.isPending}
          />
        )}

        {/* 4. Staff PTO Form Modal */}
        {activeModalType === "pto" && (
          <PTOForm
            onClose={closeModal}
          />
        )}

        {/* 5. Substitute Form Modal */}
        {activeModalType === "substitute" && (
          <SubstituteForm
            onClose={closeModal}
          />
        )}

        {/* 6. Waitlist Inquiry Modal */}
        {activeModalType === "waitlist" && (
          <AddWaitlistModal
            isOpen={true}
            onClose={closeModal}
            onSave={handleSaveWaitlist}
            isPending={waitlistMutation.isPending}
          />
        )}

        {/* 7. Maintenance Request Modal */}
        {activeModalType === "maintenance" && (
          <AddMaintenanceForm
            onClose={closeModal}
            onAdd={() => closeModal()}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DailyLogPage;
