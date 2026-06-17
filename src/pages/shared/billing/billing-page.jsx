import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, AlertTriangle, Clock, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EscalationPrompt from "@/components/EscalationPrompt";
import AgingKpiCard from "./components/AgingKpiCard";
import AgingChartCard from "./components/AgingChartCard";
import AgingSummaryCard from "./components/AgingSummaryCard";
import FilterBar from "./components/FilterBar";
import FamilyCard from "./components/FamilyCard";

const TODAY = new Date("2026-05-11");
const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const daysSince = (d) => Math.floor((TODAY - new Date(d)) / 86400000);

const AGING_BUCKETS = [
  { key: "1-7", label: "1–7 days", min: 1, max: 7 },
  { key: "8-14", label: "8–14 days", min: 8, max: 14 },
  { key: "15-30", label: "15–30 days", min: 15, max: 30 },
  { key: "31-60", label: "31–60 days", min: 31, max: 60 },
  { key: "60+", label: "60+ days", min: 61, max: Infinity },
];

// TODO: Backend wiring — replace hardcoded data with ProCare API response
// Billing data comes from ProCare when integrated; manual entry fallback for now.
const LATE_FAMILIES = [
  { id: 1, name: "Garcia, R.", student: "M. Garcia", grade: "K", amount: 850, dueDate: "2026-04-03", lastFollowUp: null, phone: "(813) 555-0142", email: "r.garcia@email.com", notes: "Asked about payment plan" },
  { id: 2, name: "Singh, L.", student: "A. Singh", grade: "2nd", amount: 450, dueDate: "2026-04-11", lastFollowUp: "2026-05-01", phone: "(813) 555-0187", email: "l.singh@email.com", notes: "Will pay next week" },
  { id: 3, name: "Kim, D.", student: "J. Kim", grade: "3rd", amount: 3100, dueDate: "2026-03-15", lastFollowUp: "2026-04-20", phone: "(813) 555-0234", email: "d.kim@email.com", notes: "Red flag — 22 days pending" },
  { id: 4, name: "Owens, M.", student: "T. Owens", grade: "5th", amount: 650, dueDate: "2026-04-20", lastFollowUp: null, phone: "(813) 555-0312", email: "m.owens@email.com", notes: "" },
  { id: 5, name: "Martinez, J.", student: "L. Martinez", grade: "K", amount: 1200, dueDate: "2026-02-28", lastFollowUp: "2026-04-30", phone: "(813) 555-0456", email: "j.martinez@email.com", notes: "Lost job — on payment plan" },
  { id: 6, name: "Tran, S.", student: "M. Tran", grade: "1st", amount: 280, dueDate: "2026-05-02", lastFollowUp: null, phone: "(813) 555-0612", email: "s.tran@email.com", notes: "" },
  { id: 7, name: "Foster, E.", student: "R. Foster", grade: "7th", amount: 1800, dueDate: "2026-04-05", lastFollowUp: "2026-05-05", phone: "(813) 555-0789", email: "e.foster@email.com", notes: "Repeated late payments" },
];

const getAgingBucket = (dueDate) => {
  const diff = daysSince(dueDate);
  const bucket = AGING_BUCKETS.find((b) => diff >= b.min && diff <= b.max);
  return bucket || AGING_BUCKETS[AGING_BUCKETS.length - 1];
};

const getUser = () =>
  JSON.parse(localStorage.getItem("user") || '{"role":"owner","name":"School Owner"}');

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const BillingPage = () => {
  const user = getUser();
  const isOwner = user.role === "owner";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBucket, setFilterBucket] = useState("all");
  const [followedUp, setFollowedUp] = useState({});
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [escalationItem, setEscalationItem] = useState(null);

  const totalPastDue = useMemo(() => LATE_FAMILIES.reduce((a, f) => a + f.amount, 0), []);
  const pastDueCount = LATE_FAMILIES.length;

  const agingData = useMemo(() =>
    AGING_BUCKETS.map((bucket) => {
      const families = LATE_FAMILIES.filter((f) => getAgingBucket(f.dueDate).key === bucket.key);
      return { name: bucket.label, amount: families.reduce((a, f) => a + f.amount, 0), count: families.length };
    }), []);

  const filtered = useMemo(() => {
    let result = LATE_FAMILIES;
    if (filterBucket !== "all") {
      result = result.filter((f) => getAgingBucket(f.dueDate).key === filterBucket);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) =>
        f.name.toLowerCase().includes(q) ||
        f.student.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filterBucket, searchQuery]);

  const markFollowUp = (id) => setFollowedUp((prev) => ({ ...prev, [id]: true }));

  const avgDaysLate = Math.round(LATE_FAMILIES.reduce((a, f) => a + daysSince(f.dueDate), 0) / LATE_FAMILIES.length);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            {isOwner ? "Billing / AR Aging" : "Billing & Late Payments"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isOwner
              ? `${fmtMoney(totalPastDue)} past due across ${pastDueCount} families`
              : `${fmtMoney(totalPastDue)} total late — ${pastDueCount} families need follow-up`
            }
          </p>
        </div>
        <Button variant="outline" className="bg-white">
          <DollarSign size={16} className="mr-2" /> Export Report
        </Button>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div variants={itemVariants}>
          <AgingKpiCard icon={DollarSign} label="Total Past Due" value={fmtMoney(totalPastDue)} sub={`Across ${pastDueCount} families`} iconBg="bg-red-50 text-red-500" valueColor="text-red-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AgingKpiCard icon={AlertTriangle} label="60+ Days" value={fmtMoney(agingData.find((a) => a.name === "60+ days")?.amount || 0)}
            sub={`${agingData.find((a) => a.name === "60+ days")?.count || 0} families at risk`} iconBg="bg-red-100 text-red-600" valueColor="text-red-700" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AgingKpiCard icon={Clock} label="30–60 Days" value={fmtMoney(agingData.find((a) => a.name === "31–60 days")?.amount || 0)}
            sub={`${agingData.find((a) => a.name === "31–60 days")?.count || 0} families`} iconBg="bg-orange-50 text-orange-500" valueColor="text-orange-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AgingKpiCard icon={Users} label="Avg Days Late" value={`${avgDaysLate}d`} sub="Across all overdue accounts" iconBg="bg-gray-50 text-gray-500" valueColor="text-gray-900" />
        </motion.div>
      </div>

      {/* Aging Chart + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <AgingChartCard agingData={agingData} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AgingSummaryCard isOwner={isOwner} totalPastDue={totalPastDue} pastDueCount={pastDueCount} agingData={agingData} />
        </motion.div>
      </div>

      {/* Filters — hidden for Owner since aggregate view doesn't use filters */}
      {!isOwner && (
        <motion.div variants={itemVariants}>
          <FilterBar
            filterBucket={filterBucket}
            onBucketChange={setFilterBucket}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isOwner={isOwner}
          />
        </motion.div>
      )}

      {/* Family List — Owner sees aggregate only (Section 11.2) */}
      <motion.div variants={itemVariants} className="space-y-2">
        {isOwner ? (
          /* ── Owner View: aggregate aging buckets only, no family names ── */
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={16} className="text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">Aging Summary</p>
              </div>
              <div className="space-y-3">
                {AGING_BUCKETS.map((bucket) => {
                  const bucketData = agingData.find((a) => a.name === bucket.label);
                  const amount = bucketData?.amount || 0;
                  const count = bucketData?.count || 0;
                  const pct = totalPastDue > 0 ? Math.round((amount / totalPastDue) * 100) : 0;
                  const isStale = bucket.min >= 31;
                  return (
                    <div key={bucket.key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isStale ? "bg-red-400" : "bg-amber-400"}`} />
                          <span className="text-xs font-medium text-gray-700">{bucket.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isStale ? "text-red-600" : "text-amber-600"}`}>
                            {fmtMoney(amount)}
                          </span>
                          <span className="text-[10px] text-gray-400">({count} families)</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isStale ? "bg-red-400" : "bg-amber-400"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <p className="text-xs text-gray-500">
                    Contact the Director for individual family details.
                    The Director manages follow-up and payment collection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* ── Director View: drillable family list ── */
          filtered.map((family) => (
            <FamilyCard
              key={family.id}
              family={family}
              isOwner={isOwner}
              followedUp={followedUp}
              onMarkFollowUp={markFollowUp}
              onEscalate={(item) => { setEscalationItem(item); setEscalationOpen(true); }}
            />
          ))
        )}
        {!isOwner && filtered.length === 0 && (
          <div className="py-12 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-sm text-gray-500">No late payments match the current filters.</p>
          </div>
        )}
      </motion.div>

      {/* Escalation Prompt */}
      <EscalationPrompt
        isOpen={escalationOpen}
        onClose={() => { setEscalationOpen(false); setEscalationItem(null); }}
        onSubmit={(data) => { setEscalationOpen(false); setEscalationItem(null); }}
        itemDescription={escalationItem ? `${escalationItem.name} · ${escalationItem.student} · $${escalationItem.amount} past due (${escalationItem.notes || "No notes"})` : ""}
      />
    </motion.div>
  );
};

export default BillingPage;
