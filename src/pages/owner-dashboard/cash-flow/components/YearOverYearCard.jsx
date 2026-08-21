import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, BarChart3, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { itemVariants, ACTIVE_COLORS, fmtMoney, fmtMoneyShort } from "../cashflow.utils";

const VIEW_MODES = [
  { key: "individual", label: "Individual" },
  { key: "stacked", label: "Stacked" },
];

const YearOverYearCard = ({ title, subtitle, availableCategories, individualData, years, currentYear }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [viewMode, setViewMode] = useState("individual");

  // O(1) lookups instead of scanning the array per category
  const dataByCategory = useMemo(
    () => new Map(individualData.map((d) => [d.category, d.data])),
    [individualData]
  );

  const defaultSelected = availableCategories.slice(0, 5);
  const activeSelected = selectedCategories.length > 0 ? selectedCategories : defaultSelected;
  const isStacked = viewMode === "stacked";
  const prevYear = currentYear - 1;

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Chart data: for each year, show values for selected categories
  const chartData = useMemo(
    () =>
      years.map((year) => {
        const entry = { year: String(year) };
        activeSelected.forEach((cat) => {
          entry[cat] = dataByCategory.get(cat)?.[year] || 0;
        });
        return entry;
      }),
    [years, activeSelected, dataByCategory]
  );

  // Comparison table: selected categories vs previous year
  const selectedCompareData = useMemo(
    () =>
      activeSelected.map((cat) => {
        const data = dataByCategory.get(cat) || {};
        return {
          category: cat,
          prevVal: data[prevYear] || 0,
          currVal: data[currentYear] || 0,
        };
      }),
    [activeSelected, dataByCategory, prevYear, currentYear]
  );

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LineChart size={18} className="text-[#1E3A5F]" />
                {title || "Year-over-Year Comparison"}
              </CardTitle>
              <CardDescription>
                {subtitle || `Select categories to compare across ${years[0]}–${currentYear}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {VIEW_MODES.map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setViewMode(mode.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      viewMode === mode.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Category selector chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {availableCategories.map((cat) => {
              const on = activeSelected.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    on
                      ? "bg-[#1E3A5F] text-white shadow-sm"
                      : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {activeSelected.length > 0 ? (
            <div className="h-50 md:h-70 w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  stackOffset={isStacked ? "sign" : undefined}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 10 }}
                    tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: 12,
                    }}
                    formatter={(value) => [fmtMoney(value), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
                  {activeSelected.map((cat, i) => (
                    <Bar
                      key={cat}
                      dataKey={cat}
                      fill={ACTIVE_COLORS[i % ACTIVE_COLORS.length]}
                      radius={isStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                      stackId={isStacked ? "a" : undefined}
                      barSize={18}
                      name={cat}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-10 text-center">
              <BarChart3 size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Select categories above to view comparison</p>
            </div>
          )}

          {/* Comparison table */}
          {selectedCompareData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {currentYear} vs {prevYear} comparison
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-2 font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                      <th className="text-right pb-2 font-semibold text-gray-400 uppercase tracking-wider">{prevYear}</th>
                      <th className="text-right pb-2 font-semibold text-gray-400 uppercase tracking-wider">{currentYear}</th>
                      <th className="text-right pb-2 font-semibold text-gray-400 uppercase tracking-wider">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCompareData.map(({ category, prevVal, currVal }) => {
                      const change = prevVal > 0 ? ((currVal - prevVal) / prevVal) * 100 : currVal > 0 ? 100 : 0;
                      const isUp = change > 0;
                      const isDown = change < 0;
                      return (
                        <tr key={category} className="border-b border-gray-50">
                          <td className="py-2 font-medium text-gray-700 truncate max-w-40">{category}</td>
                          <td className="py-2 text-right text-gray-500">{fmtMoneyShort(prevVal)}</td>
                          <td className="py-2 text-right font-medium text-gray-900">{fmtMoneyShort(currVal)}</td>
                          <td className={`py-2 text-right font-semibold ${isUp ? "text-[#8A362C]" : isDown ? "text-[#2F6042]" : "text-gray-400"}`}>
                            {isUp ? "↑" : isDown ? "↓" : "→"} {Math.abs(change).toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default YearOverYearCard;
