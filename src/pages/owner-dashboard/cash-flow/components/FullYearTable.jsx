import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { itemVariants, fmtMoneyShort } from "../cashflow.utils";

const FullYearTable = ({ data = [], years = [], currentYear }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const filteredData = useMemo(() => {
    return data.filter((cat) =>
      cat.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 size={16} className="text-[#1E3A5F]" />
                Full Year Comparison
              </CardTitle>
              <CardDescription>All expense categories · 5-year trend ({data.length} total categories)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Filter and Pagination bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search 5-year trend categories..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]"
              />
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 self-end sm:self-center">
                <span>
                  Showing {paginatedData.length} of {filteredData.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-white bg-white shadow-2xs"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <span className="px-1.5 py-0.5 font-semibold text-gray-700">
                    {page}/{totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-white bg-white shadow-2xs"
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
                  <th className="text-left pb-2.5 font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  {years.map((y) => (
                    <th key={y} className={`text-right pb-2.5 font-semibold uppercase tracking-wider ${y === currentYear ? "text-[#1E3A5F]" : "text-gray-400"}`}>
                      {y}{y === currentYear ? " · YTD" : ""}
                    </th>
                  ))}
                  <th className="text-right pb-2.5 font-semibold text-gray-400 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((cat) => {
                    const values = years.map((y) => cat.values?.[y] || 0);
                    const prevYearValsSum = values.slice(0, values.length - 1).reduce((a, b) => a + b, 0);
                    const currentVal = values[values.length - 1];
                    const isNewInCurrentYear = prevYearValsSum === 0 && currentVal > 0;

                    const trendStr = cat.trend || (() => {
                      const first = values[0];
                      const last = values[values.length - 1];
                      const totalGrowth = first > 0 ? ((last - first) / first) * 100 : 0;
                      const isUp = totalGrowth > 2;
                      const isDown = totalGrowth < -2;
                      return `${isUp ? "↑" : isDown ? "↓" : "→"} ${Math.abs(totalGrowth).toFixed(0)}%`;
                    })();

                    const isUp = trendStr.startsWith("↑");
                    const isDown = trendStr.startsWith("↓");

                    return (
                      <tr key={cat.category} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="py-2.5 font-medium text-gray-800 max-w-xs truncate">{cat.category}</td>
                        {values.map((v, i) => (
                          <td key={i} className={`py-2.5 text-right font-medium ${years[i] === currentYear ? "text-gray-900 font-semibold" : "text-gray-500"}`}>
                            {fmtMoneyShort(v)}
                          </td>
                        ))}
                        <td className="py-2.5 text-right font-semibold">
                          {isNewInCurrentYear ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1E3A5F]/10 text-[#1E3A5F]">
                              New
                            </span>
                          ) : (
                            <span className={isUp ? "text-[#8A362C]" : isDown ? "text-[#2F6042]" : "text-gray-400"}>
                              {trendStr}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={years.length + 2} className="py-8 text-center text-xs text-gray-400">
                      No categories matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FullYearTable;

