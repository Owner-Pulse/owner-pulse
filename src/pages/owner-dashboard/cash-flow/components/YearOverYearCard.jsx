import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, BarChart3, Calendar, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Check } from "lucide-react";
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
  const [chipSearch, setChipSearch] = useState("");
  const [expandedChips, setExpandedChips] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const tableRowsPerPage = 5;

  // O(1) lookups instead of scanning the array per category
  const dataByCategory = useMemo(
    () => new Map(individualData.map((d) => [d.category, d.data])),
    [individualData]
  );

  // Top 5 categories sorted by current year spent
  const top5Categories = useMemo(() => {
    return [...availableCategories]
      .sort((a, b) => (dataByCategory.get(b)?.[currentYear] || 0) - (dataByCategory.get(a)?.[currentYear] || 0))
      .slice(0, 5);
  }, [availableCategories, dataByCategory, currentYear]);

  const activeSelected = selectedCategories.length > 0 ? selectedCategories : top5Categories;
  const isStacked = viewMode === "stacked";
  const prevYear = currentYear - 1;

  // Filter available categories for chip display
  const filteredCategories = useMemo(() => {
    if (!chipSearch.trim()) return availableCategories;
    return availableCategories.filter((cat) =>
      cat.toLowerCase().includes(chipSearch.toLowerCase())
    );
  }, [availableCategories, chipSearch]);

  const visibleChips = expandedChips || chipSearch ? filteredCategories : filteredCategories.slice(0, 10);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) => {
      const current = prev.length > 0 ? prev : top5Categories;
      return current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
    });
  };

  const selectTop5 = () => {
    setSelectedCategories(top5Categories);
  };

  const selectAllFiltered = () => {
    setSelectedCategories(filteredCategories);
  };

  const clearAll = () => {
    setSelectedCategories([]);
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

  const totalTablePages = Math.ceil(selectedCompareData.length / tableRowsPerPage) || 1;
  const paginatedTableData = useMemo(() => {
    const start = (tablePage - 1) * tableRowsPerPage;
    return selectedCompareData.slice(start, start + tableRowsPerPage);
  }, [selectedCompareData, tablePage]);

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
          {/* Controls row for category chips */}
          <div className="space-y-2 mb-4 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter categories..."
                  value={chipSearch}
                  onChange={(e) => setChipSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]"
                />
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  onClick={selectTop5}
                  className="px-2 py-1 bg-white border border-gray-200 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Top 5
                </button>
                <button
                  onClick={selectAllFiltered}
                  className="px-2 py-1 bg-white border border-gray-200 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Select Filtered
                </button>

                <span className="text-gray-300">|</span>
                <span className="text-gray-500 font-semibold">
                  {activeSelected.length} of {availableCategories.length} selected
                </span>
              </div>
            </div>

            {/* Category selector chips */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {visibleChips.map((cat) => {
                const on = activeSelected.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      on
                        ? "bg-[#1E3A5F] text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {on && <Check size={10} className="stroke-[3]" />}
                    <span className="truncate max-w-[200px]">{cat}</span>
                  </button>
                );
              })}
            </div>

            {!chipSearch && availableCategories.length > 10 && (
              <button
                onClick={() => setExpandedChips(!expandedChips)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E3A5F] hover:underline pt-1"
              >
                {expandedChips ? (
                  <>Show Less <ChevronUp size={12} /></>
                ) : (
                  <>View All ({availableCategories.length}) <ChevronDown size={12} /></>
                )}
              </button>
            )}
          </div>

          {activeSelected.length > 0 ? (
            <div className="h-56 md:h-72 w-full overflow-x-auto">
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
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {currentYear} vs {prevYear} comparison
                  </span>
                </div>
                {totalTablePages > 1 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>
                      Page {tablePage} of {totalTablePages}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                        disabled={tablePage === 1}
                        className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                      >
                        <ChevronLeft size={12} />
                      </button>
                      <button
                        onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                        disabled={tablePage === totalTablePages}
                        className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                      >
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                )}
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
                    {paginatedTableData.map(({ category, prevVal, currVal }) => {
                      const hasPrev = prevVal > 0;
                      const change = hasPrev ? ((currVal - prevVal) / prevVal) * 100 : 0;
                      const isNew = !hasPrev && currVal > 0;
                      const isUp = change > 0;
                      const isDown = change < 0;
                      return (
                        <tr key={category} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-2 font-medium text-gray-700 truncate max-w-xs">{category}</td>
                          <td className="py-2 text-right text-gray-500">{fmtMoneyShort(prevVal)}</td>
                          <td className="py-2 text-right font-semibold text-gray-900">{fmtMoneyShort(currVal)}</td>
                          <td className="py-2 text-right">
                            {isNew ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1E3A5F]/10 text-[#1E3A5F]">
                                New in {currentYear}
                              </span>
                            ) : (
                              <span className={`font-semibold ${isUp ? "text-[#8A362C]" : isDown ? "text-[#2F6042]" : "text-gray-400"}`}>
                                {isUp ? "↑" : isDown ? "↓" : "→"} {Math.abs(change).toFixed(1)}%
                              </span>
                            )}
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
