import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";
import EmptyRow from "./EmptyRow";
import StaffSelect from "./StaffSelect";
import { useGetAllStaffs } from "@/hooks/classroom/classroom.hook";
import { getStaffName, getStaffId } from "@/pages/owner-dashboard/classrooms/components/SearchableStaffSelect";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const HolidayExceptionsSection = ({ holidays, exceptions, onToggleExclusion }) => {
  const { staffs } = useGetAllStaffs();
  const [selectedStaffToAdd, setSelectedStaffToAdd] = useState({});

  const handleAddStaffToHoliday = (holidayId, staffId) => {
    if (!staffId) return;
    const currentExcluded = exceptions[holidayId] || [];
    if (!currentExcluded.includes(staffId)) {
      onToggleExclusion(holidayId, staffId);
    }
    setSelectedStaffToAdd((prev) => ({ ...prev, [holidayId]: "" }));
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm overflow-visible">
        <CardContent className="p-5 overflow-visible">
          <SectionHeader
            number={6}
            title="Holiday Exceptions"
            description="Staff who worked during the holiday and should be paid."
          />
          <div className="space-y-4 overflow-visible">
            {holidays.length === 0 && <EmptyRow text="No holidays scheduled for this pay period." />}
            {holidays.map((h) => {
              const excludedIds = exceptions[h.id] || [];

              return (
                <div key={h.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3 relative z-20 overflow-visible">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#1E3A5F]" />
                      <span className="text-sm font-bold text-gray-800">{h.name}</span>
                      <span className="text-xs text-gray-400 font-medium">({h.date})</span>
                    </div>
                    {excludedIds.length > 0 && (
                      <span className="text-[10px] text-[#3E7A54] bg-[#3E7A54]/10 px-2.5 py-1 rounded-full font-bold">
                        {excludedIds.length} staff marked for exception
                      </span>
                    )}
                  </div>

                  {/* Searchable Staff Selection Dropdown */}
                  <div className="max-w-md relative z-30">
                    <StaffSelect
                      value={selectedStaffToAdd[h.id] || ""}
                      onChange={(staffId) => handleAddStaffToHoliday(h.id, staffId)}
                      placeholder="Add staff member who worked..."
                    />
                  </div>

                  {/* List of Selected Exception Badges */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {excludedIds.map((sid) => {
                      const staffObj = staffs.find(
                        (s) => String(getStaffId(s)) === String(sid)
                      );
                      const name = staffObj ? getStaffName(staffObj) : `Staff #${sid}`;

                      return (
                        <div
                          key={sid}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 shadow-sm text-xs font-semibold text-gray-800"
                        >
                          <span>{name}</span>
                          <button
                            type="button"
                            onClick={() => onToggleExclusion(h.id, sid)}
                            className="p-0.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-[#AE4A3E]"
                            title="Remove exception"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}

                    {excludedIds.length === 0 && (
                      <p className="text-xs text-gray-400 italic">No staff selected for this holiday exception.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HolidayExceptionsSection;
