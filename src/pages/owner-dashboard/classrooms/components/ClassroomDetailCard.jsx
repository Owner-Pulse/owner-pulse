import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, AlertTriangle, TrendingDown, Baby } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import YoYBadge from "./YoYBadge";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const classroomEconomics = (c) => {
  const monthlyRevenue = c.tuitionPerSeat * c.enrolled;
  const monthlyProfit = monthlyRevenue - c.monthlyCost;
  const margin = monthlyRevenue > 0 ? Math.round((monthlyProfit / monthlyRevenue) * 100) : 0;
  return { monthlyRevenue, monthlyProfit, margin };
};

const yoyDelta = (current, lastYear, goodWhenUp = true) => {
  if (current === null || current === undefined || lastYear === null || lastYear === undefined) return null;
  const delta = current - lastYear;
  if (delta === 0) return { arrow: "→", color: "text-gray-400", text: "flat" };
  const isImprovement = goodWhenUp ? delta > 0 : delta < 0;
  return { arrow: delta > 0 ? "▲" : "▼", color: isImprovement ? "text-emerald-600" : "text-red-500", text: `${delta > 0 ? "+" : ""}${delta}` };
};

const fmtMoneyShort = (n) => (n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + n);
const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();

const NWEA_BENCHMARK = {
  K: 159, "1st": 177, "2nd": 188, "3rd": 199,
  "4th": 208, "5th": 215, "6th": 220, "7th": 224, "8th": 228,
};

const ClassroomDetailCard = ({ classroom }) => {
  const econ = classroomEconomics(classroom);
  const isPreschool = classroom.tier === "preschool";
  const isK8 = classroom.tier === "k8";
  const fillRate = Math.round((classroom.enrolled / classroom.capacity) * 100);
  const isFull = classroom.enrolled >= classroom.capacity;
  const isLowFill = fillRate < 70;
  const nweaBench = isK8 ? NWEA_BENCHMARK[classroom.program] : null;
  const nweaDelta = isK8 && classroom.nweaMap && nweaBench ? yoyDelta(classroom.nweaMap, nweaBench) : null;
  const nweaYoY = isK8 && classroom.nweaMap && classroom.lastYear.nweaMap ? yoyDelta(classroom.nweaMap, classroom.lastYear.nweaMap) : null;
  const profitYoY = yoyDelta(econ.monthlyProfit, classroom.lastYear.monthlyProfit);
  const enrolledYoY = yoyDelta(classroom.enrolled, classroom.lastYear.enrolled);
  const incidentsYoY = isK8 ? yoyDelta(classroom.incidents || 0, classroom.lastYear.incidents, false) : null;
  const withdrawalsYoY = isPreschool ? yoyDelta(classroom.withdrawals || 0, classroom.lastYear.withdrawals, false) : null;

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          {/* Row 1: Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${econ.monthlyProfit > 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                {isPreschool ? <Baby size={18} className={econ.monthlyProfit > 0 ? "text-emerald-600" : "text-red-500"} /> : <GraduationCap size={18} className={econ.monthlyProfit > 0 ? "text-emerald-600" : "text-red-500"} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">{classroom.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${isPreschool ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                    {isPreschool ? "Preschool" : "K–8"}
                  </span>
                  <span className="text-xs text-gray-400">{classroom.teacher}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-lg font-extrabold ${econ.monthlyProfit > 0 ? "text-emerald-600" : "text-red-500"}`}>
                {econ.monthlyProfit < 0 ? "-" : ""}{fmtMoneyShort(Math.abs(econ.monthlyProfit))}/mo
              </span>
              <YoYBadge delta={profitYoY} />
            </div>
          </div>

          {/* Row 2: Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
            {/* Enrollment */}
            <div className="p-2.5 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Enrollment</span>
                <YoYBadge delta={enrolledYoY} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold text-gray-900">{classroom.enrolled}</span>
                <span className="text-xs text-gray-400">/ {classroom.capacity}</span>
              </div>
              <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${isFull ? "bg-amber-500" : isLowFill ? "bg-red-400" : "bg-emerald-400"}`} style={{ width: `${fillRate}%` }} />
              </div>
            </div>

            {/* Revenue */}
            <div className="p-2.5 rounded-lg bg-gray-50">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Revenue</span>
              <span className="text-base font-extrabold text-gray-900">{fmtMoneyShort(econ.monthlyRevenue)}</span>
              <p className="text-[10px] text-gray-400 mt-0.5">${classroom.tuitionPerSeat}/seat</p>
            </div>

            {/* Cost */}
            <div className="p-2.5 rounded-lg bg-gray-50">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Cost</span>
              <span className="text-base font-extrabold text-gray-900">{fmtMoneyShort(classroom.monthlyCost)}</span>
              <p className="text-[10px] text-gray-400 mt-0.5">{fmtMoneyShort(Math.round(classroom.monthlyCost / classroom.capacity))}/seat</p>
            </div>

            {/* Margin */}
            <div className="p-2.5 rounded-lg bg-gray-50">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Margin</span>
              <span className={`text-base font-extrabold ${econ.margin >= 30 ? "text-emerald-600" : econ.margin >= 15 ? "text-amber-600" : "text-red-500"}`}>
                {econ.margin}%
              </span>
              <p className="text-[10px] text-gray-400 mt-0.5">{econ.margin >= 30 ? "Healthy" : econ.margin >= 15 ? "Monitoring" : "Critical"}</p>
            </div>

            {/* K-8: NWEA MAP */}
            {isK8 && (
              <div className="p-2.5 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">NWEA MAP</span>
                  {nweaYoY && <YoYBadge delta={nweaYoY} />}
                </div>
                <span className={`text-base font-extrabold ${nweaDelta && nweaDelta.color.includes("emerald") ? "text-emerald-600" : nweaDelta && nweaDelta.color.includes("red") ? "text-amber-600" : "text-gray-900"}`}>
                  {classroom.nweaMap || "—"}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">Benchmark: {nweaBench || "—"}</p>
              </div>
            )}

            {/* K-8: Incidents YTD */}
            {isK8 && (
              <div className="p-2.5 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Incidents</span>
                  {incidentsYoY && <YoYBadge delta={incidentsYoY} />}
                </div>
                <span className={`text-base font-extrabold ${(classroom.incidents || 0) > 3 ? "text-red-500" : (classroom.incidents || 0) > 1 ? "text-amber-600" : "text-gray-900"}`}>
                  {classroom.incidents || 0}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">YTD</p>
              </div>
            )}

            {/* Preschool: Withdrawals YTD */}
            {isPreschool && (
              <div className="p-2.5 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Withdrawals</span>
                  {withdrawalsYoY && <YoYBadge delta={withdrawalsYoY} />}
                </div>
                <span className={`text-base font-extrabold ${(classroom.withdrawals || 0) > 2 ? "text-red-500" : (classroom.withdrawals || 0) > 0 ? "text-amber-600" : "text-gray-900"}`}>
                  {classroom.withdrawals || 0}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">YTD</p>
              </div>
            )}

            {/* Preschool: Fill Rate */}
            {isPreschool && (
              <div className="p-2.5 rounded-lg bg-gray-50">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Fill Rate</span>
                <span className={`text-base font-extrabold ${isFull ? "text-amber-600" : isLowFill ? "text-red-500" : "text-emerald-600"}`}>{fillRate}%</span>
                <p className="text-[10px] text-gray-400 mt-0.5">{isFull ? "At capacity" : `${classroom.capacity - classroom.enrolled} open`}</p>
              </div>
            )}
          </div>

          {/* Row 3: Warnings */}
          {econ.monthlyProfit <= 0 && (
            <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">
                <span className="font-bold">Loss-making classroom.</span>{" "}
                Operating costs of {fmtMoneyShort(classroom.monthlyCost)} exceed revenue of {fmtMoneyShort(econ.monthlyRevenue)}. Review pricing or enrollment strategy.
              </p>
            </div>
          )}
          {isLowFill && econ.monthlyProfit > 0 && (
            <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
              <TrendingDown size={14} className="text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                <span className="font-bold">Low enrollment.</span>{" "}
                {classroom.enrolled}/{classroom.capacity} enrolled ({fillRate}% fill rate). {classroom.capacity - classroom.enrolled} empty seat{classroom.capacity - classroom.enrolled > 1 ? "s" : ""}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClassroomDetailCard;
