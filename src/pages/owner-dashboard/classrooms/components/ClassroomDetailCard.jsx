import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, AlertTriangle, TrendingDown, Baby } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

// ── API shape from classrooms_list ──────────────────────────────
// {
//   id, name, category_group, teacher,
//   net_monthly_profit, profit_change,
//   enrollment: { current, capacity, fill_rate_percentage, empty_seats, is_low_enrollment, change },
//   revenue: { total, per_seat },
//   cost: { total, per_seat },
//   margin: { percentage, status },
//   nwea_map: { score, benchmark },
//   incidents: { count }
// }

const ClassroomDetailCard = ({ classroom }) => {
  const profit = classroom.net_monthly_profit ?? 0;
  const isProfit = profit >= 0;

  const enrollment = classroom.enrollment ?? {};
  const revenue = classroom.revenue ?? {};
  const cost = classroom.cost ?? {};
  const margin = classroom.margin ?? {};
  const nweaMap = classroom.nwea_map;
  const incidents = classroom.incidents ?? {};

  const fillRate = enrollment.fill_rate_percentage ?? 0;
  const isFull = enrollment.current >= enrollment.capacity;
  const isLowFill = enrollment.is_low_enrollment ?? fillRate < 70;

  const isPreschool = (classroom.category_group ?? "").toLowerCase() === "preschool";

  const marginStatus = margin.status ?? (
    (margin.percentage ?? 0) >= 30 ? "Healthy"
    : (margin.percentage ?? 0) >= 15 ? "Monitoring"
    : "Critical"
  );
  const marginColor =
    marginStatus === "Healthy" ? "text-emerald-600"
    : marginStatus === "Monitoring" ? "text-amber-600"
    : "text-red-500";

  const nweaVsBenchmark = nweaMap
    ? (nweaMap.score ?? 0) >= (nweaMap.benchmark ?? 0)
      ? "text-emerald-600"
      : "text-amber-600"
    : "text-gray-900";

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          {/* Row 1: Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isProfit ? "bg-emerald-50" : "bg-red-50"}`}>
                {isPreschool
                  ? <Baby size={18} className={isProfit ? "text-emerald-600" : "text-red-500"} />
                  : <GraduationCap size={18} className={isProfit ? "text-emerald-600" : "text-red-500"} />
                }
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">{classroom.name}</h3>
                  {classroom.category_group && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${isPreschool ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
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
              <span className={`text-lg font-extrabold ${isProfit ? "text-emerald-600" : "text-red-500"}`}>
                {fmtMoneyShort(profit)}/mo
              </span>
              {(classroom.profit_change ?? 0) !== 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${classroom.profit_change > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                  {classroom.profit_change > 0 ? "▲" : "▼"} {fmtMoneyShort(Math.abs(classroom.profit_change))}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
            {/* Enrollment */}
            <div className="p-2.5 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Enrollment</span>
                {(enrollment.change ?? 0) !== 0 && (
                  <span className={`text-[9px] font-bold ${enrollment.change > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {enrollment.change > 0 ? "▲" : "▼"}{Math.abs(enrollment.change)}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold text-gray-900">{enrollment.current ?? 0}</span>
                <span className="text-xs text-gray-400">/ {enrollment.capacity ?? 0}</span>
              </div>
              <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isFull ? "bg-amber-500" : isLowFill ? "bg-red-400" : "bg-emerald-400"}`}
                  style={{ width: `${Math.min(fillRate, 100)}%` }}
                />
              </div>
            </div>

            {/* Revenue */}
            <div className="p-2.5 rounded-lg bg-gray-50">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Revenue</span>
              <span className="text-base font-extrabold text-gray-900">{fmtMoneyShort(revenue.total ?? 0)}</span>
              <p className="text-[10px] text-gray-400 mt-0.5">{fmtMoney(revenue.per_seat ?? 0)}/seat</p>
            </div>

            {/* Cost */}
            <div className="p-2.5 rounded-lg bg-gray-50">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Cost</span>
              <span className="text-base font-extrabold text-gray-900">{fmtMoneyShort(cost.total ?? 0)}</span>
              <p className="text-[10px] text-gray-400 mt-0.5">{fmtMoney(Math.round(cost.per_seat ?? 0))}/seat</p>
            </div>

            {/* Margin */}
            <div className="p-2.5 rounded-lg bg-gray-50">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Margin</span>
              <span className={`text-base font-extrabold ${marginColor}`}>
                {margin.percentage ?? 0}%
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
                <span className={`text-base font-extrabold ${(incidents.count ?? 0) > 3 ? "text-red-500" : (incidents.count ?? 0) > 1 ? "text-amber-600" : "text-gray-900"}`}>
                  {incidents.count ?? 0}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">YTD</p>
              </div>
            )}

            {/* Fill Rate (Preschool) */}
            {isPreschool && (
              <div className="p-2.5 rounded-lg bg-gray-50">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Fill Rate</span>
                <span className={`text-base font-extrabold ${isFull ? "text-amber-600" : isLowFill ? "text-red-500" : "text-emerald-600"}`}>
                  {fillRate}%
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {isFull ? "At capacity" : `${enrollment.empty_seats ?? 0} open`}
                </p>
              </div>
            )}
          </div>

          {/* Row 3: Warnings */}
          {!isProfit && (
            <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-700">
                <span className="font-bold">Loss-making classroom.</span>{" "}
                Operating costs of {fmtMoneyShort(cost.total ?? 0)} exceed revenue of {fmtMoneyShort(revenue.total ?? 0)}. Review pricing or enrollment strategy.
              </p>
            </div>
          )}
          {isLowFill && isProfit && (
            <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
              <TrendingDown size={14} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">
                <span className="font-bold">Low enrollment.</span>{" "}
                {enrollment.current}/{enrollment.capacity} enrolled ({fillRate}% fill rate). {enrollment.empty_seats ?? 0} empty seat{(enrollment.empty_seats ?? 0) !== 1 ? "s" : ""}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClassroomDetailCard;
