import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#1E3A5F", "#B78A2F", "#3E7A54", "#AE4A3E", "#5B7C99", "#8F6A1F", "#6B7280", "#7C6A9A"];

const money = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DirectorSpendingPie = ({ slices = [] }) => {
  const rows = slices
    .map((item) => ({
      name: item.name || item.reason || "Discretionary",
      value: Number(item.numeric_amount ?? item.spent_numeric ?? 0),
    }))
    .filter((row) => row.value > 0);

  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const chart = rows.length > 0 ? rows : [{ name: "No spending", value: 1, fill: "#E6EEF2" }];

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm md:text-base font-bold text-gray-900">Director spending</CardTitle>
        <CardDescription className="text-xs">
          Each slice is a saved director expense, grouped by the reason. The ceiling is the director discretionary limit. These amounts are not QuickBooks and not the Procare ledger.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-center">
          <div className="relative mx-auto h-52 w-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chart} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
                  {chart.map((slice, index) => (
                    <Cell key={slice.name} fill={slice.fill || COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                {rows.length > 0 && <Tooltip formatter={(value, name) => [money(value), name]} />}
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-lg font-bold tabular-nums text-gray-900">{rows.length > 0 ? money(total) : "$0.00"}</p>
            </div>
          </div>
          <div className="space-y-2">
            {rows.length === 0 && <p className="text-sm text-gray-500">No director expenses recorded yet.</p>}
            {rows.map((row, index) => (
              <div key={row.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 min-w-0 text-gray-700">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate">{row.name}</span>
                </span>
                <span className="font-semibold tabular-nums text-gray-900">{money(row.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectorSpendingPie;
