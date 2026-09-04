import React from "react";
import { motion } from "framer-motion";
import { DollarSign, BookOpen, Users, Target, GraduationCap, School } from "lucide-react";
import KpiCard from "./KpiCard";
import { KpiSkeleton } from "./Skeleton";
import { fmtMoneyShort } from "./format";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ClassroomKpis = ({ isLoading, metrics, enrollmentSummary }) => {
  const netProfitValue = metrics?.formatted_net_monthly_profit || fmtMoneyShort(metrics?.net_monthly_profit ?? 0);
  const netProfitSub = metrics?.formatted_overall_margin || `${metrics?.overall_margin_percentage ?? 0}% margin overall`;
  const classroomSub = metrics?.classrooms_summary || `${metrics?.profitable_classrooms ?? 0} profitable · ${metrics?.losing_classrooms ?? 0} losing`;

  const totalCurrent = enrollmentSummary?.current_enrollment?.total ?? metrics?.total_students ?? 0;
  const totalTarget = enrollmentSummary?.targets?.total ?? 1000;

  const psCurrent = enrollmentSummary?.current_enrollment?.preschool ?? 0;
  const psTarget = enrollmentSummary?.targets?.preschool ?? 0;
  const psCapacity = enrollmentSummary?.capacity?.preschool ?? 0;

  const k8Current = enrollmentSummary?.current_enrollment?.k8 ?? 0;
  const k8Target = enrollmentSummary?.targets?.k8 ?? 0;

  const psFillPercentage = psTarget > 0 ? Math.round((psCurrent / psTarget) * 100) : 0;
  const k8FillPercentage = k8Target > 0 ? Math.round((k8Current / k8Target) * 100) : 0;
  const overallFillPercentage = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)
      ) : (
        <>
          <motion.div variants={itemVariants}>
            <KpiCard
              icon={DollarSign}
              label="Net Monthly Profit"
              value={netProfitValue}
              sub={netProfitSub}
              iconBg={(metrics?.net_monthly_profit ?? 0) >= 0 ? "bg-[#3E7A54]/10 text-[#2F6042]" : "bg-[#AE4A3E]/10 text-[#8A362C]"}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KpiCard
              icon={BookOpen}
              label="Classrooms"
              value={`${metrics?.profitable_classrooms ?? 0}/${metrics?.total_classrooms ?? 0}`}
              sub={classroomSub}
              iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KpiCard
              icon={Users}
              label="Total Enrolled"
              value={`${totalCurrent} / ${totalTarget}`}
              sub={`${overallFillPercentage}% of total target`}
              iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KpiCard
              icon={GraduationCap}
              label="Preschool Enrolled"
              value={`${psCurrent} / ${psTarget}`}
              sub={`Cap: ${psCapacity} · ${psFillPercentage}% of target`}
              iconBg="bg-amber-50 text-amber-700"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KpiCard
              icon={School}
              label="K–8 Enrolled"
              value={`${k8Current} / ${k8Target}`}
              sub={`${k8FillPercentage}% of target goal`}
              iconBg="bg-indigo-50 text-indigo-700"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KpiCard
              icon={Target}
              label="Overall Fill Rate"
              value={`${overallFillPercentage}%`}
              sub={`${totalCurrent} of ${totalTarget} seats filled`}
              iconBg="bg-[#3E7A54]/10 text-[#2F6042]"
            />
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ClassroomKpis;
