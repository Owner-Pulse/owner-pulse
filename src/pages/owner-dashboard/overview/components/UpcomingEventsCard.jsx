import React from "react";
import { motion } from "framer-motion";
import { Calendar, ShieldCheck, GraduationCap, FileText, Clock, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const TYPE_CONFIG = {
  payroll: { icon: Clock, color: "bg-[#1E3A5F]/10 text-[#1E3A5F]", bgColor: "bg-[#1E3A5F]/[0.04] border-[#1E3A5F]/15" },
  compliance: { icon: ShieldCheck, color: "bg-[#B78A2F]/10 text-[#8F6A1F]", bgColor: "bg-[#B78A2F]/[0.06] border-[#B78A2F]/15" },
  enrollment: { icon: GraduationCap, color: "bg-[#AE4A3E]/10 text-[#8A362C]", bgColor: "bg-[#AE4A3E]/[0.06] border-[#AE4A3E]/15" },
  certification: { icon: FileText, color: "bg-[#3E7A54]/10 text-[#2F6042]", bgColor: "bg-[#3E7A54]/[0.06] border-[#3E7A54]/15" },
  event: { icon: Building2, color: "bg-[#3E7A54]/10 text-[#2F6042]", bgColor: "bg-[#3E7A54]/[0.06] border-[#3E7A54]/15" },
};

const DEFAULT_CONFIG = { icon: Calendar, color: "bg-gray-100 text-gray-500", bgColor: "bg-gray-50" };

const URGENT_BG = "bg-gradient-to-r from-[#1E3A5F] to-[#15294A] text-white";

const fmtDateShort = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const UpcomingEventsCard = ({ events = [] }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar size={15} className="text-[#1E3A5F]" />
          Upcoming Events
        </CardTitle>
        <CardDescription className="text-[10px]">Key dates &amp; deadlines</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {events.map((evt) => {
          const config = TYPE_CONFIG[evt.type] || DEFAULT_CONFIG;
          const Icon = config.icon;
          const isUrgent = evt.urgency === "high" || (evt.days_left != null && evt.days_left <= 3);
          const descParts = [];
          if (evt.days_left != null) descParts.push(`${evt.days_left} day${evt.days_left === 1 ? "" : "s"} left`);
          if (evt.date) descParts.push(fmtDateShort(evt.date));
          return (
            <div key={evt.id} className={`flex items-start gap-3 p-2.5 rounded-lg ${isUrgent ? URGENT_BG : config.bgColor}`}>
              <div className={`w-8 h-8 rounded-lg ${isUrgent ? "bg-white/10" : config.color} flex items-center justify-center shrink-0`}>
                <Icon size={14} className={isUrgent ? "text-[#C89B3C]" : ""} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${isUrgent ? "text-white" : "text-gray-900"}`}>{evt.title}</p>
                <p className={`text-[10px] mt-0.5 ${isUrgent ? "text-gray-400" : "text-gray-500"}`}>{descParts.join(" · ")}</p>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <p className="text-[10px] text-gray-400 text-center py-2">No upcoming events</p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default UpcomingEventsCard;
