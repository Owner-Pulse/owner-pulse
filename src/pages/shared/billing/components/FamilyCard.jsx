import React from "react";
import { motion } from "framer-motion";
import { DollarSign, Send, CheckCircle2, ArrowUpRight, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TODAY = new Date("2026-05-11");
const daysSince = (d) => Math.floor((TODAY - new Date(d)) / 86400000);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();

const AGING_BUCKETS = [
  { key: "1-7", label: "1–7 days", min: 1, max: 7 },
  { key: "8-14", label: "8–14 days", min: 8, max: 14 },
  { key: "15-30", label: "15–30 days", min: 15, max: 30 },
  { key: "31-60", label: "31–60 days", min: 31, max: 60 },
  { key: "60+", label: "60+ days", min: 61, max: Infinity },
];

const BUCKET_COLORS = {
  "1-7": "#16A34A",
  "8-14": "#D97706",
  "15-30": "#F97316",
  "31-60": "#DC2626",
  "60+": "#7F1D1D",
};

const getAgingBucket = (dueDate) => {
  const diff = daysSince(dueDate);
  const bucket = AGING_BUCKETS.find((b) => diff >= b.min && diff <= b.max);
  return bucket || AGING_BUCKETS[AGING_BUCKETS.length - 1];
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const FamilyCard = ({ family, isOwner, followedUp, onMarkFollowUp, onEscalate }) => {
  const bucket = getAgingBucket(family.dueDate);
  const daysLate = daysSince(family.dueDate);
  const color = BUCKET_COLORS[bucket.key] || "#6B7280";
  const hasFollowedUp = followedUp[family.id];

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: color }}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-gray-900">
                  {isOwner ? `Family #${family.id}` : family.name}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                  {daysLate}d late
                </span>
                <span className="text-[10px] text-gray-400">{family.student} · {family.grade}</span>
              </div>

              {!isOwner && (
                <>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><Phone size={10} /> {family.phone}</span>
                    <span className="flex items-center gap-1"><Mail size={10} /> {family.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-gray-400">Due: {fmtDate(family.dueDate)}</span>
                    {family.lastFollowUp && (
                      <span className="text-[10px] text-blue-500">Last follow-up: {fmtDate(family.lastFollowUp)}</span>
                    )}
                  </div>
                  {family.notes && (
                    <p className="text-[10px] text-amber-600 mt-1 italic">{family.notes}</p>
                  )}
                </>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="text-lg font-extrabold text-gray-900">{fmtMoney(family.amount)}</p>
              <p className="text-[10px] text-gray-400">{bucket.label}</p>
            </div>
          </div>

          {!isOwner && (
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => onMarkFollowUp(family.id)}
                disabled={hasFollowedUp}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  hasFollowedUp
                    ? "bg-emerald-50 text-emerald-600 cursor-default"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                {hasFollowedUp ? <CheckCircle2 size={12} /> : <Send size={12} />}
                {hasFollowedUp ? "Follow-up Sent" : "Mark Follow-up Sent"}
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all">
                <DollarSign size={12} /> Log Payment
              </button>
              <button
                onClick={() => onEscalate(family)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
              >
                <ArrowUpRight size={12} /> Escalate to Owner
              </button>
            </div>
          )}

          {isOwner && (
            <div className="mt-2 pt-1 text-[9px] text-gray-400">
              Due {fmtDate(family.dueDate)} · Director handles follow-up
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FamilyCard;
