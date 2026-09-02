import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, AlertTriangle, TrendingDown, Baby, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtMoneyShort = (n) => {
  const abs = Math.abs(n ?? 0);
  const fmt = abs >= 1_000_000
    ? "$" + (abs / 1_000_000).toFixed(1) + "M"
    : abs >= 1000
    ? "$" + (abs / 1000).toFixed(1) + "K"
    : "$" + Math.round(abs);
  return (n ?? 0) < 0 ? `-${fmt}` : fmt;
};

const fmtMoney = (n) => "$" + Math.round(n ?? 0).toLocaleString();

const ClassroomDetailCard = ({ classroom, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const profit = classroom.net_monthly_profit ?? 0;
  const isProfit = profit >= 0;

  const enrollment = classroom.enrollment ?? {};
  const revenue = classroom.revenue ?? {};
  const cost = classroom.cost ?? {};
  const margin = classroom.margin ?? {};
  const nweaMap = classroom.nwea_map;
  const incidents = classroom.incidents ?? {};

  const capacity = enrollment.capacity ?? 0;
  const hasCapacity = capacity > 0;
  const fillRate = enrollment.fill_rate_percentage ?? 0;
  const isFull = hasCapacity && enrollment.current >= capacity;
  const isLowFill = hasCapacity && (enrollment.is_low_enrollment ?? fillRate < 70);

  const isPreschool = (classroom.category_group ?? "").toLowerCase() === "preschool";

  const marginStatus = margin.status ?? (
    (margin.percentage ?? 0) >= 30 ? "Healthy"
    : (margin.percentage ?? 0) >= 15 ? "Monitoring"
    : "Critical"
  );
  const marginColor =
    marginStatus === "Healthy" ? "text-[#2F6042]"
    : marginStatus === "Monitoring" ? "text-[#8F6A1F]"
    : "text-[#8A362C]";

  const nweaVsBenchmark = nweaMap
    ? (nweaMap.score ?? 0) >= (nweaMap.benchmark ?? 0)
      ? "text-[#2F6042]"
      : "text-[#8F6A1F]"
    : "text-gray-900";

  const profitDisplay = classroom.formatted_net_monthly_profit || `${fmtMoneyShort(profit)}/mo`;
  const revTotalDisplay = revenue.formatted_total || fmtMoneyShort(revenue.total ?? 0);
  const revPerSeatDisplay = revenue.formatted_per_seat || `${fmtMoney(revenue.per_seat ?? 0)} per seat / week`;
  const costTotalDisplay = cost.formatted_total || fmtMoneyShort(cost.total ?? 0);
  const costPerSeatDisplay = cost.formatted_per_seat || `${fmtMoney(cost.per_seat ?? 0)}/seat`;

  return (
    <motion.div variants={itemVariants}>
      <Card 
        onClick={() => navigate(`/owner/classrooms/${classroom.id}`)}
        className="bg-white border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <CardContent className="p-5">
          {/* Row 1: Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isProfit ? "bg-[#3E7A54]/10" : "bg-[#AE4A3E]/10"}`}>
                {isPreschool
                  ? <Baby size={18} className={isProfit ? "text-[#2F6042]" : "text-[#8A362C]"} />
                  : <GraduationCap size={18} className={isProfit ? "text-[#2F6042]" : "text-[#8A362C]"} />
                }
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">{classroom.name}</h3>
                  {classroom.category_group && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${isPreschool ? "bg-[#1E3A5F]/10 text-[#1E3A5F]" : "bg-[#2A4C7E]/10 text-[#2A4C7E]"}`}>
                      {classroom.category_group}
                    </span>
                  )}
                  {classroom.teacher && (
                    <span className="text-xs text-gray-400">{classroom.teacher}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-lg font-extrabold ${isProfit ? "text-[#2F6042]" : "text-[#8A362C]"}`}>
                {profitDisplay}
              </span>
              {(classroom.profit_change ?? 0) !== 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${classroom.profit_change > 0 ? "bg-[#3E7A54]/10 text-[#2F6042]" : "bg-[#AE4A3E]/10 text-[#8A362C]"}`}>
                  {classroom.profit_change > 0 ? "▲" : "▼"} {fmtMoneyShort(Math.abs(classroom.profit_change))}
                </span>
              )}
              <div className="flex items-center gap-1.5 border-l border-slate-100 pl-2 ml-1 shrink-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(classroom);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit Classroom"
                >
                  <Edit2 size={13} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(classroom.id);
                  }}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-650 transition-colors"
                  title="Remove Classroom"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
            {/* Enrollment */}
            <div className="p-2.5 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Enrollment</span>
                {(enrollment.change ?? 0) !== 0 && (
                  <span className={`text-[9px] font-bold ${enrollment.change > 0 ? "text-[#2F6042]" : "text-[#8A362C]"}`}>
                    {enrollment.change > 0 ? "▲" : "▼"}{Math.abs(enrollment.change)}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold text-gray-900">{enrollment.current ?? 0}</span>
                <span className="text-xs text-gray-400">
                  {hasCapacity ? `/ ${capacity}` : "students"}
                </span>
              </div>
              <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${!hasCapacity ? "bg-[#1E3A5F]" : isFull ? "bg-[#B78A2F]" : isLowFill ? "bg-[#AE4A3E]" : "bg-[#3E7A54]"}`}
                  style={{ width: hasCapacity ? `${Math.min(fillRate, 100)}%` : "100%" }}
                />
              </div>
            </div>

            {/* Revenue */}
            <div className="p-2.5 rounded-lg bg-gray-50">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Revenue</span>
              <span className="text-base font-extrabold text-gray-900">{revTotalDisplay}</span>
              <p className="text-[10px] text-gray-400 mt-0.5">{revPerSeatDisplay}</p>
            </div>

            {/* Cost */}
            <div className="p-2.5 rounded-lg bg-gray-50">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Cost</span>
              <span className="text-base font-extrabold text-gray-900">{costTotalDisplay}</span>
              <p className="text-[10px] text-gray-400 mt-0.5">{costPerSeatDisplay}</p>
            </div>

            {/* Margin */}
            <div className="p-2.5 rounded-lg bg-gray-50">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Margin</span>
              <span className={`text-base font-extrabold ${marginColor}`}>
                {margin.formatted_percentage || `${margin.percentage ?? 0}%`}
              </span>
              <p className="text-[10px] text-gray-400 mt-0.5">{marginStatus}</p>
            </div>

            {/* NWEA MAP (if available) */}
            {nweaMap && (
              <div className="p-2.5 rounded-lg bg-gray-50">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">NWEA MAP</span>
                <span className={`text-base font-extrabold ${nweaVsBenchmark}`}>
                  {nweaMap.score ?? "—"}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">Benchmark: {nweaMap.benchmark ?? "—"}</p>
              </div>
            )}

            {/* Incidents (if available) */}
            {incidents.count !== undefined && (
              <div className="p-2.5 rounded-lg bg-gray-50">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Incidents</span>
                <span className={`text-base font-extrabold ${(incidents.count ?? 0) > 3 ? "text-[#8A362C]" : (incidents.count ?? 0) > 1 ? "text-[#8F6A1F]" : "text-gray-900"}`}>
                  {incidents.count ?? 0}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">YTD</p>
              </div>
            )}

            {/* Fill Rate (Preschool with capacity > 0) */}
            {isPreschool && (
              <div className="p-2.5 rounded-lg bg-gray-50">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Fill Rate</span>
                <span className={`text-base font-extrabold ${!hasCapacity ? "text-gray-700" : isFull ? "text-[#8F6A1F]" : isLowFill ? "text-[#8A362C]" : "text-[#2F6042]"}`}>
                  {hasCapacity ? `${fillRate}%` : "100%"}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {!hasCapacity ? "Active" : isFull ? "At capacity" : `${enrollment.empty_seats ?? 0} open`}
                </p>
              </div>
            )}
          </div>

          {/* Row 3: Warnings */}
          {!isProfit && (
            <div className="mt-3 p-2.5 rounded-lg bg-[#AE4A3E]/10 border border-[#AE4A3E]/25 flex items-center gap-2">
              <AlertTriangle size={14} className="text-[#8A362C] shrink-0" />
              <p className="text-xs text-[#8A362C]">
                <span className="font-bold">Loss-making classroom.</span>{" "}
                Operating costs of {costTotalDisplay} exceed revenue of {revTotalDisplay}. Review pricing or enrollment strategy.
              </p>
            </div>
          )}
          {isLowFill && isProfit && (
            <div className="mt-3 p-2.5 rounded-lg bg-[#B78A2F]/10 border border-[#B78A2F]/25 flex items-center gap-2">
              <TrendingDown size={14} className="text-[#8F6A1F] shrink-0" />
              <p className="text-xs text-[#8F6A1F]">
                <span className="font-bold">Low enrollment.</span>{" "}
                {enrollment.current}/{capacity} enrolled ({fillRate}% fill rate). {enrollment.empty_seats ?? 0} empty seat{(enrollment.empty_seats ?? 0) !== 1 ? "s" : ""}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClassroomDetailCard;
