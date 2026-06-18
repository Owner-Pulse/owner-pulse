import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Calendar,
  AlertTriangle,
  Award,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const KpiCard = ({ icon: Icon, label, value, sub, accent, trend }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow h-full">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${accent}`}>
          <Icon size={18} />
        </div>
      </div>
      {sub && (
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">{sub}</span>
        </div>
      )}
      {trend && (
        <div className="mt-2 flex items-center text-xs">
          <span className="flex items-center text-emerald-600 font-medium">
            <ArrowUpRight size={12} className="mr-1" />
            {trend}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

const EnrollmentKpiGrid = ({
  stats,
  itemVariants,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <motion.div variants={itemVariants}>
        <KpiCard
          icon={Users}
          label="Total Enrolled"
          value={stats.totalEnrolled}
          sub={`out of ${stats.totalCapacity} capacity`}
          accent="bg-blue-50 text-blue-600"
          trend="+9% YoY"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <KpiCard
          icon={Building2}
          label="Open Seats"
          value={stats.openSeats}
          sub={`${Math.round((stats.openSeats / stats.totalCapacity) * 100)}% availability`}
          accent="bg-emerald-50 text-emerald-600"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <KpiCard
          icon={Calendar}
          label="Waitlist"
          value={stats.totalWaitlist}
          sub={`${stats.waitlistCount} families waiting`}
          accent="bg-purple-50 text-purple-600"
          trend="+33% this month"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <KpiCard
          icon={AlertTriangle}
          label="At-Risk"
          value={stats.activeRiskCount}
          sub={`${stats.staleCasesCount} stale · ${stats.lostRiskCount} lost`}
          accent="bg-red-50 text-red-600"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <KpiCard
          icon={Award}
          label="Discounts"
          value={stats.discountsCount}
          sub={`${stats.discountPct}% of students · ${stats.discountTotalShort}/mo`}
          accent="bg-cyan-50 text-cyan-600"
        />
      </motion.div>
    </div>
  );
};

export default EnrollmentKpiGrid;
