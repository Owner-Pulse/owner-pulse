import React from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const ProgramDetail = ({ programs, itemVariants }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={18} className="text-gray-500" />
            Program Detail
          </CardTitle>
          <CardDescription>
            Full breakdown by program with capacity and waitlist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Enrolled
                  </th>
                  <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Open Seats
                  </th>
                  <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Waitlist
                  </th>
                  <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Fill %
                  </th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => {
                  const fillPct = Math.round((p.enrolled / p.capacity) * 100);
                  const isFull = p.enrolled >= p.capacity;
                  const nearFull = fillPct >= 90 && !isFull;

                  return (
                    <tr
                      key={p.name}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2.5 font-medium text-gray-900">
                        {p.name}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">
                        {p.enrolled}
                      </td>
                      <td className="py-2.5 text-right text-gray-500">
                        {p.capacity}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`font-semibold ${
                            p.capacity - p.enrolled === 0
                              ? "text-red-500"
                              : nearFull
                                ? "text-amber-500"
                                : "text-emerald-600"
                          }`}
                        >
                          {p.capacity - p.enrolled}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-gray-500 hidden md:table-cell">
                        {p.waitlist > 0 ? (
                          <span className="font-semibold text-purple-600">
                            {p.waitlist}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right hidden md:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isFull
                                  ? "bg-amber-500"
                                  : nearFull
                                    ? "bg-emerald-400"
                                    : "bg-blue-500"
                              }`}
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold ${
                              isFull
                                ? "text-amber-600"
                                : "text-gray-500"
                            }`}
                          >
                            {fillPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Preschool</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Elementary (K–5th)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Middle School (6th–8th)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgramDetail;
