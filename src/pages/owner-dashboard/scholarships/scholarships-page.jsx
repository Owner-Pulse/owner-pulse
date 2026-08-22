import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, Users, Clock, TrendingUp, Plus, Loader2 } from "lucide-react";
import KpiCard from "./components/KpiCard";
import ScholarshipProgramsChart from "./components/ScholarshipProgramsChart";
import ApprovalPipelineCard from "./components/ApprovalPipelineCard";
import AddScholarshipModal from "./components/AddScholarshipModal";
import ScholarshipsPageSkeleton from "./components/ScholarshipsSkeleton";
import { useGetOwnerScholarships, useUpdateScholarshipStatus } from "@/hooks/owner-hook/scholarship.hook";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtMoney = (v) => "$" + (Number(v) || 0).toLocaleString("en-US", { minimumFractionDigits: 0 });

const ScholarshipsPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { scholarshipData, isLoading, isFetching } = useGetOwnerScholarships();

  const { updateStatus, isPending: isUpdatingStatus } = useUpdateScholarshipStatus();

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateStatus({ scholarship_id: id, payload: { status: newStatus } });
    } catch (err) {
      // Toast handles error
    }
  };

  if (isLoading) {
    return <ScholarshipsPageSkeleton />;
  }

  const metrics = scholarshipData?.metrics || {};
  const programsData = scholarshipData?.scholarship_programs?.programs || [];
  const stepUpData = scholarshipData?.step_up_payment_approvals || {};

  const totalAwarded = metrics.total_awarded?.formatted_amount || fmtMoney(metrics.total_awarded?.amount || 0);
  const totalStudents = metrics.scholarship_students?.count || 0;

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            Scholarships
            {isFetching && <Loader2 size={18} className="animate-spin text-[#1E3A5F]" />}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalStudents} students · {totalAwarded} awarded YTD
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#152A45] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Scholarship
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Award}
            label="Total Awarded"
            value={totalAwarded}
            sub={`Across ${metrics.total_awarded?.programs_count || programsData.length || 0} programs`}
            iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Users}
            label="Scholarship Students"
            value={totalStudents}
            sub={`${metrics.scholarship_students?.formatted_percentage || "0%"} of enrollment`}
            iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Clock}
            label="Pending Approvals"
            value={metrics.pending_approvals?.count || 0}
            sub={`Avg ${metrics.pending_approvals?.formatted_avg_turnaround || "0d"} turnaround`}
            iconBg={
              (stepUpData?.pipeline_summary?.red_flag_20d_plus || 0) > 0
                ? "bg-[#AE4A3E]/10 text-[#8A362C]"
                : "bg-[#1E3A5F]/10 text-[#1E3A5F]"
            }
            valueColor={
              (stepUpData?.pipeline_summary?.red_flag_20d_plus || 0) > 0 ? "text-[#8A362C]" : "text-gray-900"
            }
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={TrendingUp}
            label="Approval Rate"
            value={metrics.approval_rate?.formatted_percentage || "0%"}
            sub={`${metrics.approval_rate?.approved_count || 0} approved`}
            iconBg="bg-[#3E7A54]/10 text-[#2F6042]"
          />
        </motion.div>
      </div>

      {/* Scholarship Programs Chart */}
      <motion.div variants={itemVariants}>
        <ScholarshipProgramsChart programs={programsData} />
      </motion.div>

      {/* Step Up Approval Pipeline (with Infinite Scroll) */}
      <motion.div variants={itemVariants}>
        <ApprovalPipelineCard
          stepUpData={stepUpData}
          onUpdateStatus={handleUpdateStatus}
          isUpdatingStatus={isUpdatingStatus}
        />
      </motion.div>

      {/* Add Scholarship Modal */}
      <AddScholarshipModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </motion.div>
  );
};

export default ScholarshipsPage;
