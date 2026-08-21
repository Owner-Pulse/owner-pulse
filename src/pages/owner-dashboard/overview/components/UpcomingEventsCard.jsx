import React from "react";
import { motion } from "framer-motion";
import { Calendar, ShieldCheck, GraduationCap, FileText, Clock, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const EVENTS = [
  { icon: ShieldCheck, color: "bg-[#B78A2F]/10 text-[#8F6A1F]", bgColor: "bg-[#B78A2F]/[0.06] border-[#B78A2F]/15",
    title: "General Liability Insurance", desc: "Shop rates by May 2 (60 days before renewal)" },
  { icon: GraduationCap, color: "bg-[#AE4A3E]/10 text-[#8A362C]", bgColor: "bg-[#AE4A3E]/[0.06] border-[#AE4A3E]/15",
    title: "CPR Certification Renewal", desc: "Due May 20 · 4 staff affected" },
  { icon: FileText, color: "bg-[#1E3A5F]/10 text-[#1E3A5F]", bgColor: "bg-[#1E3A5F]/[0.04] border-[#1E3A5F]/15",
    title: "Step Up Q4 Attestation", desc: "Due May 28 · Director's signature needed" },
  { icon: Clock, color: "bg-white/10", bgColor: "bg-gradient-to-r from-[#1E3A5F] to-[#15294A] text-white",
    title: "Next Payroll: May 15", desc: "7 days away · Director hasn't submitted yet", isDark: true },
  { icon: Building2, color: "bg-[#3E7A54]/10 text-[#2F6042]", bgColor: "bg-[#3E7A54]/[0.06] border-[#3E7A54]/15",
    title: "End of Year Ceremony", desc: "June 5 · 100+ attendees expected" },
];

const UpcomingEventsCard = () => (
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
        {EVENTS.map((evt, i) => {
          const Icon = evt.icon;
          return (
            <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg ${evt.bgColor}`}>
              <div className={`w-8 h-8 rounded-lg ${evt.isDark ? "bg-white/10" : evt.color} flex items-center justify-center shrink-0`}>
                <Icon size={14} className={evt.isDark ? "text-[#C89B3C]" : ""} />
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
