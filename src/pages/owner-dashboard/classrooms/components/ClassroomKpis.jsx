import React from "react";
import { motion } from "framer-motion";
import { DollarSign, BookOpen, Users, Target, TrendingUp } from "lucide-react";
import KpiCard from "./KpiCard";
import { KpiSkeleton } from "./Skeleton";
import { fmtMoneyShort } from "./format";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ClassroomKpis = ({ isLoading, metrics }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {isLoading ? (
      Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
    ) : (
      <>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={DollarSign}
            label="Net Monthly Profit"
            value={fmtMoneyShort(metrics?.net_monthly_profit ?? 0)}
            sub={`${metrics?.overall_margin_percentage ?? 0}% margin overall`}
            iconBg={(metrics?.net_monthly_profit ?? 0) >= 0 ? "bg-[#3E7A54]/10 text-[#2F6042]" : "bg-[#AE4A3E]/10 text-[#8A362C]"}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={BookOpen}
            label="Classrooms"
            value={`${metrics?.profitable_classrooms ?? 0}/${metrics?.total_classrooms ?? 0}`}
            sub={`${metrics?.profitable_classrooms ?? 0} profitable · ${metrics?.losing_classrooms ?? 0} losing`}
            iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Users}
            label="Total Students"
            value={metrics?.total_students ?? 0}
            sub={`out of ${metrics?.total_capacity ?? 0} capacity`}
            iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Target}
            label="Avg Fill Rate"
            value={`${metrics?.avg_fill_rate_percentage ?? 0}%`}
            sub={`${metrics?.open_seats ?? 0} open seats`}
            iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={TrendingUp}
            label="Monthly Revenue"
            value={fmtMoneyShort(metrics?.total_monthly_revenue ?? 0)}
            sub={`vs ${fmtMoneyShort(metrics?.total_monthly_costs ?? 0)} costs`}
            iconBg="bg-[#3E7A54]/10 text-[#2F6042]"
          />
        </motion.div>
      </>
    )}
  </div>
);

export default ClassroomKpis;
