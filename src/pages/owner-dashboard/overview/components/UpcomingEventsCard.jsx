import React from "react";
import { motion } from "framer-motion";
import { Calendar, ShieldCheck, GraduationCap, FileText, Clock, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate } from "@/lib/datetime";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const TYPE_CONFIG = {
  payroll: { icon: Clock, accent: ACCENTS.finance },
  compliance: { icon: ShieldCheck, accent: ACCENTS.operations },
  enrollment: { icon: GraduationCap, accent: ACCENTS.students },
  certification: { icon: FileText, accent: ACCENTS.staff },
  event: { icon: Building2, accent: ACCENTS.collections },
};

const DEFAULT_CONFIG = { icon: Calendar, accent: null };

const fmtDateShort = (d) => formatDate(d, { month: "short", day: "numeric" });

const UpcomingEventsCard = ({ events = [], noData = false }) => (
  <motion.div variants={itemVariants}>
    <Card className="relative bg-white border-none shadow-sm h-full">
      <CardAccent group={noData ? "none" : "operations"} />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar size={15} className={noData ? STATUS.none.text : ACCENTS.operations.text} />
          Upcoming Events
        </CardTitle>
        <CardDescription className="text-[10px]">Key dates &amp; deadlines</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {events.map((evt) => {
          const config = TYPE_CONFIG[evt.type] || DEFAULT_CONFIG;
          const Icon = config.icon;
          const isUrgent = evt.urgency === "high" || (evt.days_left != null && evt.days_left <= 3);
          const rowClass = isUrgent ? `${STATUS.watch.soft} ${STATUS.watch.border}` : config.accent ? `${config.accent.soft} ${config.accent.border}` : "bg-gray-50 border-gray-200";
          const iconClass = isUrgent ? `${STATUS.watch.soft} ${STATUS.watch.text}` : config.accent ? config.accent.icon : "bg-gray-100 text-gray-600";
          const descParts = [];
          if (evt.days_left != null) descParts.push(`${evt.days_left} day${evt.days_left === 1 ? "" : "s"} left`);
          if (evt.date) descParts.push(fmtDateShort(evt.date));
          return (
            <div key={evt.id} className={`flex items-start gap-3 p-2.5 rounded-lg border ${rowClass}`}>
              <div className={`w-8 h-8 rounded-lg ${iconClass} flex items-center justify-center shrink-0`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">{evt.title}</p>
                <p className={`text-[10px] mt-0.5 ${isUrgent ? STATUS.watch.text : "text-gray-600"}`}>{descParts.join(" · ")}</p>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <p className={`text-[10px] text-center py-2 ${noData ? STATUS.none.text : "text-gray-600"}`}>{noData ? "No event data" : "No upcoming events"}</p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default UpcomingEventsCard;
