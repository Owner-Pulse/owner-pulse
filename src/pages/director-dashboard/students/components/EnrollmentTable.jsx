import React from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, GraduationCap, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const EnrollmentTable = ({ classrooms = [], incidents = [], searchQuery = "", onSearchChange = () => {} }) => {
  const navigate = useNavigate();
  const filteredClassrooms = (classrooms || []).filter((c) => {
    if (!searchQuery || typeof searchQuery !== "string" || !searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameStr = String(c?.name || c?.classroom_name || "").toLowerCase();
    const progStr = String(c?.program || "").toLowerCase();
    return nameStr.includes(q) || progStr.includes(q);
  });

  return (
    <motion.div variants={itemVariants}>          <Card className="bg-white border-none shadow-sm overflow-hidden border-l-3 border-l-[#1E3A5F]">
            <CardHeader className="pb-3 border-b border-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap size={18} className="text-[#1E3A5F]" /> Classroom Roster & Operations
                </CardTitle>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-gray-200 px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#1E3A5F]/20 transition-all">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search classrooms..."
                className="text-xs bg-transparent border-none outline-none w-full sm:w-36 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
          <CardDescription className="text-xs text-gray-400 mt-1">
            Select any classroom to view active check-ins, medical alerts, and manage student rosters.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Card View for Mobile Screens */}
          <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
            {filteredClassrooms.length > 0 ? (
              filteredClassrooms.map((c, i) => {
                const cap = c.capacity || 0;
                const enr = c.enrolled || 0;
                const open = c.open_seats !== undefined ? c.open_seats : Math.max(0, cap - enr);
                const pct = c.fill_percentage !== undefined ? c.fill_percentage : (cap > 0 ? Math.round((enr / cap) * 100) : 0);
                const pctLabel = c.fill_percentage_label || `${pct}%`;
                const incCount = c.incidents_count !== undefined ? c.incidents_count : (incidents || []).filter((inc) => inc && (inc.classroom === c.name || inc.procare_classroom_id === c.procare_classroom_id)).length;
                return (
                  <div 
                    key={i} 
                    onClick={() => navigate(`/director/students/${c.id}`)}
                    className="bg-white hover:bg-gray-50/80 active:bg-gray-100 rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md cursor-pointer flex flex-col gap-3 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{c.name}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">{c.program}</p>
                      </div>                          <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-[10px] font-extrabold text-[#1E3A5F] bg-[#1E3A5F]/5 hover:bg-[#1E3A5F] hover:text-white flex items-center gap-1 rounded-lg transition-all shadow-sm"
                      >
                        Open <ChevronRight size={10} />
                      </Button>
                    </div>
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50/80 p-2 rounded-xl border border-gray-100 text-center">
                        <span className="text-[8px] font-bold text-gray-400 block uppercase">Enrolled</span>
                        <span className="text-xs font-black text-gray-900">
                          {c.enrolled} <span className="text-[10px] font-medium text-gray-400">/ {c.capacity}</span>
                        </span>
                      </div>
                      <div className="bg-gray-50/80 p-2 rounded-xl border border-gray-100 text-center">
                        <span className="text-[8px] font-bold text-gray-400 block uppercase">Open Seats</span>
                        <span className={`text-xs font-black ${open === 0 ? "text-[#8A362C]" : open <= 2 ? "text-[#8F6A1F]" : "text-[#2F6042]"}`}>
                          {open}
                        </span>
                      </div>
                      <div className="bg-gray-50/80 p-2 rounded-xl border border-gray-100 text-center flex flex-col items-center justify-center">
                        <span className="text-[8px] font-bold text-gray-400 block uppercase mb-0.5">Incidents</span>
                        {incCount > 0 ? (
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                            incCount >= 2 ? "bg-[#AE4A3E]/10 text-[#8A362C] border border-[#AE4A3E]/20" : "bg-[#B78A2F]/10 text-[#8F6A1F] border border-[#B78A2F]/20"
                          }`}>
                            <AlertTriangle size={9} /> {incCount}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-gray-300">—</span>
                        )}
                      </div>
                    </div>

                    {/* Progress Fill bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-[#AE4A3E]" : pct >= 85 ? "bg-[#B78A2F]" : "bg-[#1E3A5F]"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-gray-500">{pctLabel}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">No classrooms found</p>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/50">
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Classroom Name</th>
                  <th className="text-center py-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enrolled</th>
                  <th className="text-center py-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Capacity</th>
                  <th className="text-center py-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Open Seats</th>
                  <th className="text-center py-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fill %</th>
                  <th className="text-center py-3 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Incidents</th>
                  <th className="text-right py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClassrooms.length > 0 ? (
                  filteredClassrooms.map((c, i) => {
                    const cap = c.capacity || 0;
                    const enr = c.enrolled || 0;
                    const open = c.open_seats !== undefined ? c.open_seats : Math.max(0, cap - enr);
                    const pct = c.fill_percentage !== undefined ? c.fill_percentage : (cap > 0 ? Math.round((enr / cap) * 100) : 0);
                    const pctLabel = c.fill_percentage_label || `${pct}%`;
                    const incCount = c.incidents_count !== undefined ? c.incidents_count : (incidents || []).filter((inc) => inc && (inc.classroom === c.name || inc.procare_classroom_id === c.procare_classroom_id)).length;
                    return (
                      <tr 
                        key={i} 
                        onClick={() => navigate(`/director/students/${c.id}`)}
                        className="hover:bg-slate-50/70 active:bg-slate-100/50 transition-all cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-semibold text-gray-900 group-hover:text-[#1E3A5F] transition-colors">
                          {c.name}
                        </td>
                        <td className="py-3.5 px-2 text-center font-bold text-gray-900">{c.enrolled}</td>
                        <td className="py-3.5 px-2 text-center text-gray-500 font-medium">{c.capacity}</td>
                        <td className={`py-3.5 px-2 text-center font-semibold ${open === 0 ? "text-[#8A362C]" : open <= 2 ? "text-[#8F6A1F]" : "text-[#2F6042]"}`}>
                          {open}
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-gray-200/50">
                              <div
                                className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-[#AE4A3E]" : pct >= 85 ? "bg-[#B78A2F]" : "bg-[#1E3A5F]"}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500">{pctLabel}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-center">
                          {incCount > 0 ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              incCount >= 2 ? "bg-[#AE4A3E]/10 text-[#8A362C] border border-[#AE4A3E]/20" : "bg-[#B78A2F]/10 text-[#8F6A1F] border border-[#B78A2F]/20"
                            }`}>
                              <AlertTriangle size={10} /> {incCount}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-[10px] font-extrabold text-[#1E3A5F] bg-[#1E3A5F]/5 group-hover:bg-[#1E3A5F] group-hover:text-white flex items-center gap-1 ml-auto rounded-lg transition-all"
                          >
                            Open Class <ChevronRight size={10} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-xs text-gray-400">
                      No classrooms found matching search query.
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

export default EnrollmentTable;
