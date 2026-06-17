import React from "react";
import { motion } from "framer-motion";
import { Calendar, ShieldCheck, GraduationCap, FileText, Clock, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const EVENTS = [
  { icon: ShieldCheck, color: "bg-amber-100 text-amber-600", bgColor: "bg-amber-50 border-amber-100",
    title: "General Liability Insurance", desc: "Shop rates by May 2 (60 days before renewal)" },
  { icon: GraduationCap, color: "bg-red-100 text-red-600", bgColor: "bg-red-50 border-red-100",
    title: "CPR Certification Renewal", desc: "Due May 20 · 4 staff affected" },
  { icon: FileText, color: "bg-blue-100 text-blue-600", bgColor: "bg-blue-50 border-blue-100",
    title: "Step Up Q4 Attestation", desc: "Due May 28 · Director's signature needed" },
  { icon: Clock, color: "bg-amber-400", bgColor: "bg-gradient-to-r from-gray-800 to-gray-900 text-white",
    title: "Next Payroll: May 15", desc: "7 days away · Director hasn't submitted yet", isDark: true },
  { icon: Building2, color: "bg-emerald-100 text-emerald-600", bgColor: "bg-emerald-50 border-emerald-100",
    title: "End of Year Ceremony", desc: "June 5 · 100+ attendees expected" },
];

const UpcomingEventsCard = () => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar size={15} className="text-purple-500" />
          Upcoming Events
        </CardTitle>
        <CardDescription className="text-[10px]">Key dates &amp; deadlines</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {EVENTS.map((evt, i) => {
          const Icon = evt.icon;
          return (
            <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg ${evt.bgColor}`}>
              <div className={`w-8 h-8 rounded-lg ${evt.isDark ? "bg-white/10" : evt.color} flex items-center justify-center shrink-0`}>
                <Icon size={14} className={evt.isDark ? "text-amber-400" : ""} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${evt.isDark ? "text-white" : "text-gray-900"}`}>{evt.title}</p>
                <p className={`text-[10px] ${evt.isDark ? "text-gray-400" : `${evt.color.split(" ").pop()}`} mt-0.5`}>{evt.desc}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  </motion.div>
);

export default UpcomingEventsCard;
