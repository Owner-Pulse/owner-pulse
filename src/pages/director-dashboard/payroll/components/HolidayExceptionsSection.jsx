import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";
import EmptyRow from "./EmptyRow";

const TEACHER_LIST = [
  { id: 1, name: "Ms. Alvarez" }, { id: 2, name: "Ms. Soto" }, { id: 3, name: "Ms. Patel" },
  { id: 4, name: "Ms. Rivera" }, { id: 5, name: "Ms. Brooks" }, { id: 6, name: "Mr. Nguyen" },
  { id: 7, name: "Ms. Cohen" }, { id: 8, name: "Ms. Diaz" }, { id: 9, name: "Mr. Park" },
  { id: 10, name: "Mr. O'Brien" }, { id: 11, name: "Ms. Hassan" },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const HolidayExceptionsSection = ({ holidays, exceptions, onToggleExclusion }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5">
          <SectionHeader number={6} title="Holiday Exceptions"
            description="Staff who worked during the holiday and should be paid." />
          <div className="space-y-3">
            {holidays.length === 0 && <EmptyRow text="No holidays this period." />}
            {holidays.map((h) => {
              const excluded = exceptions[h.id] || [];
              return (
                <div key={h.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">{h.name}</span>
                    <span className="text-xs text-gray-400">{h.date}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TEACHER_LIST.map((s) => {
                      const isExcluded = excluded.includes(s.id);
                      return (
                        <button key={s.id} onClick={() => onToggleExclusion(h.id, s.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                            isExcluded ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                          }`}>
                          {isExcluded ? "✓ " : ""}{s.name.split(" ").slice(-1)[0]}
                        </button>
                      );
                    })}
                  </div>
                  {excluded.length > 0 && (
                    <p className="text-[10px] text-emerald-600 mt-1 font-medium">
                      {excluded.length} staff marked for pay exception
                    </p>
                  )}
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
