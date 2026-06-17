import React from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const EnrollmentTable = ({ classrooms, incidents, searchQuery, onSearchChange }) => {
  const filteredClassrooms = classrooms.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.program.toLowerCase().includes(q);
  });

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <GraduationCap size={16} /> Classroom Enrollment & Incidents
            </CardTitle>
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="text-xs bg-transparent border-none outline-none w-28"
              />
            </div>
          </div>
          <CardDescription>Incident count shown per classroom — click a row to manage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Classroom</th>
                  <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Enrolled</th>
                  <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Capacity</th>
                  <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Open</th>
                  <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Fill %</th>
                  <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Incidents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClassrooms.map((c, i) => {
                  const open = c.capacity - c.enrolled;
                  const pct = Math.round((c.enrolled / c.capacity) * 100);
                  const incCount = incidents.filter((inc) => inc.classroom === c.name).length;
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-2 font-medium text-gray-900">{c.name}</td>
                      <td className="py-2.5 px-2 text-center font-semibold text-gray-900">{c.enrolled}</td>
                      <td className="py-2.5 px-2 text-center text-gray-500">{c.capacity}</td>
                      <td className={`py-2.5 px-2 text-center font-medium ${open === 0 ? "text-red-500" : open <= 2 ? "text-amber-500" : "text-emerald-500"}`}>{open}</td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 85 ? "bg-amber-500" : "bg-blue-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {incCount > 0 ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            incCount >= 2 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            <AlertTriangle size={10} /> {incCount}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnrollmentTable;
