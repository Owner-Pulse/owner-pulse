import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Users,
  Calendar,
  Clock,
  Plus,
  X,
  Send,
  AlertTriangle,
  CheckCircle2,
  Percent,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TODAY = new Date("2026-05-11");

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtRelative = (d) => {
  const diff = Math.ceil((new Date(d) - TODAY) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  return `${Math.abs(diff)} days ago`;
};

const STAFF_LIST = [
  { id: 1, name: "Ms. Alvarez", role: "Teacher", ptoAllowance: 10, ptoUsed: 3 },
  { id: 2, name: "Ms. Soto", role: "Teacher", ptoAllowance: 10, ptoUsed: 2 },
  { id: 3, name: "Ms. Patel", role: "Teacher", ptoAllowance: 10, ptoUsed: 5 },
  { id: 4, name: "Ms. Rivera", role: "Teacher", ptoAllowance: 10, ptoUsed: 1 },
  { id: 5, name: "Ms. Brooks", role: "Teacher", ptoAllowance: 10, ptoUsed: 4 },
  { id: 6, name: "Mr. Nguyen", role: "Teacher", ptoAllowance: 10, ptoUsed: 6 },
  { id: 7, name: "Ms. Cohen", role: "Teacher", ptoAllowance: 10, ptoUsed: 7 },
  { id: 8, name: "Ms. Diaz", role: "Teacher", ptoAllowance: 10, ptoUsed: 0 },
  { id: 9, name: "Mr. Park", role: "Teacher", ptoAllowance: 10, ptoUsed: 3 },
  { id: 10, name: "Mr. O'Brien", role: "Teacher", ptoAllowance: 10, ptoUsed: 2 },
  { id: 11, name: "Ms. Hassan", role: "Teacher", ptoAllowance: 10, ptoUsed: 8 },
];

const INITIAL_PTO_LOG = [
  { id: 1, staffId: 1, dayType: "sick", days: 1, date: "2026-05-08" },
  { id: 2, staffId: 7, dayType: "personal", days: 1, date: "2026-05-06" },
  { id: 3, staffId: 7, dayType: "personal", days: 1, date: "2026-05-02" },
  { id: 4, staffId: 8, dayType: "vacation", days: 2, date: "2026-04-25" },
];

const INITIAL_SUBSTITUTES = [
  { id: 1, date: "2026-05-11", coveringFor: "Ms. Cohen", subName: "Ms. Hart", calledBy: "Director" },
  { id: 2, date: "2026-05-05", coveringFor: "Mr. Levine", subName: "Mr. Owens", calledBy: "Director" },
  { id: 3, date: "2026-04-28", coveringFor: "Ms. Diaz", subName: "Ms. Hart", calledBy: "Director" },
];

const DirectorStaffManagement = () => {
  const [activeTab, setActiveTab] = useState("pto");
  const [ptoLog, setPtoLog] = useState(INITIAL_PTO_LOG);
  const [substitutes, setSubstitutes] = useState(INITIAL_SUBSTITUTES);
  const [showForm, setShowForm] = useState(false);

  // PTO stats
  const ptoStats = useMemo(() => ({
    totalDays: ptoLog.reduce((a, r) => a + r.days, 0),
    sickDays: ptoLog.filter((r) => r.dayType === "sick").reduce((a, r) => a + r.days, 0),
    personalDays: ptoLog.filter((r) => r.dayType === "personal").reduce((a, r) => a + r.days, 0),
    uniqueStaff: [...new Set(ptoLog.map((r) => r.staffId))].length,
  }), [ptoLog]);

  const subStats = useMemo(() => ({
    total: substitutes.length,
    thisWeek: substitutes.filter((r) => {
      const diff = Math.ceil((TODAY - new Date(r.date)) / 86400000);
      return diff >= 0 && diff <= 7;
    }).length,
    uniqueSubs: [...new Set(substitutes.map((r) => r.subName))].length,
  }), [substitutes]);

  const handleAddPTO = (entry) => setPtoLog((prev) => [entry, ...prev]);
  const handleAddSub = (entry) => setSubstitutes((prev) => [entry, ...prev]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">{STAFF_LIST.length} staff · Track PTO and substitutes</p>
        </div>
        <Button className="bg-[#0A0F1E] hover:bg-black text-white shadow-sm" onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" /> {activeTab === "pto" ? "Log PTO" : "Log Substitute"}
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 w-fit">
          {[
            { id: "pto", label: "PTO Management", icon: UserCheck },
            { id: "substitute", label: "Substitutes", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowForm(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
                }`}>
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {activeTab === "pto" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Total PTO Days</p>
                <p className="text-2xl font-bold text-gray-900">{ptoStats.totalDays}</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Sick Days</p>
                <p className="text-2xl font-bold text-amber-600">{ptoStats.sickDays}</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Personal Days</p>
                <p className="text-2xl font-bold text-blue-600">{ptoStats.personalDays}</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Staff Affected</p>
                <p className="text-2xl font-bold text-gray-900">{ptoStats.uniqueStaff}</p>
              </CardContent></Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardHeader><CardTitle className="text-base font-semibold">PTO History</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ptoLog.length > 0 ? ptoLog.map((entry) => {
                    const staff = STAFF_LIST.find((s) => s.id === entry.staffId);
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">{staff?.name.split(" ").slice(-1)[0] || "?"}</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{staff?.name || "Unknown"} · {entry.days}d {entry.dayType}</p>
                            <p className="text-xs text-gray-400">{fmtRelative(entry.date)}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{fmtDate(entry.date)}</span>
                      </div>
                    );
                  }) : <p className="text-sm text-gray-400 text-center py-4">No PTO logged yet</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {activeTab === "substitute" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Total Substitutes</p>
                <p className="text-2xl font-bold text-gray-900">{subStats.total}</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">This Week</p>
                <p className="text-2xl font-bold text-blue-600">{subStats.thisWeek}</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Unique Subs</p>
                <p className="text-2xl font-bold text-gray-900">{subStats.uniqueSubs}</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Coverage</p>
                <p className="text-2xl font-bold text-emerald-600">{subStats.thisWeek > 0 ? `${Math.round((subStats.thisWeek / subStats.total) * 100)}%` : "0%"}</p>
              </CardContent></Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardHeader><CardTitle className="text-base font-semibold">Substitute History</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {substitutes.length > 0 ? substitutes.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-xs font-bold text-purple-600">{entry.subName.split(" ").slice(-1)[0]}</div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{entry.subName} → {entry.coveringFor}</p>
                          <p className="text-xs text-gray-400">{fmtRelative(entry.date)}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{fmtDate(entry.date)}</span>
                    </div>
                  )) : <p className="text-sm text-gray-400 text-center py-4">No substitutes logged yet</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <AddStaffForm
          activeTab={activeTab}
          onAddPTO={handleAddPTO}
          onAddSub={handleAddSub}
          onClose={() => setShowForm(false)}
          staff={STAFF_LIST}
        />
      )}
    </motion.div>
  );
};

const AddStaffForm = ({ activeTab, onAddPTO, onAddSub, onClose, staff }) => {
  if (activeTab === "pto") {
    return <PTOForm onAdd={onAddPTO} onClose={onClose} staff={staff} />;
  }
  return <SubstituteForm onAdd={onAddSub} onClose={onClose} staff={staff} />;
};

const PTOForm = ({ onAdd, onClose, staff }) => {
  const [form, setForm] = useState({ staffId: "", dayType: "sick", days: 1 });
  const [error, setError] = useState("");
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.staffId) { setError("Please select a staff member."); return; }
    onAdd({ id: Date.now(), staffId: Number(form.staffId), dayType: form.dayType, days: Number(form.days), date: new Date().toISOString().split("T")[0] });
    onClose();
  };

  const selected = staff.find((s) => s.id === Number(form.staffId));
  const remaining = selected ? selected.ptoAllowance - selected.ptoUsed : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-xl font-bold text-gray-900">Log PTO</h2><p className="text-sm text-gray-500 mt-0.5">Record time off for a staff member</p></div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} className="text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Staff Member</label>
              <select value={form.staffId} onChange={(e) => update("staffId", e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                <option value="">Select staff...</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} · {s.ptoAllowance - s.ptoUsed}d remaining</option>
                ))}
              </select>
              {remaining !== null && (
                <p className={`text-xs mt-1 ${remaining <= 2 ? "text-red-500" : "text-gray-400"}`}>
                  {remaining} PTO days remaining
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Day Type</label>
                <select value={form.dayType} onChange={(e) => update("dayType", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                  <option value="sick">Sick</option>
                  <option value="personal">Personal</option>
                  <option value="vacation">Vacation</option>
                  <option value="jury">Jury Duty</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Days</label>
                <input type="number" value={form.days} onChange={(e) => update("days", e.target.value)} min={0.5} max={5} step={0.5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#0A0F1E] hover:bg-black text-white"><Send size={16} className="mr-2" /> Log PTO</Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const SubstituteForm = ({ onAdd, onClose, staff }) => {
  const [form, setForm] = useState({ coveringFor: "", subName: "" });
  const [error, setError] = useState("");
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.coveringFor || !form.subName.trim()) { setError("All fields are required."); return; }
    onAdd({ id: Date.now(), date: new Date().toISOString().split("T")[0], coveringFor: form.coveringFor, subName: form.subName.trim(), calledBy: "Director" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-xl font-bold text-gray-900">Log Substitute</h2><p className="text-sm text-gray-500 mt-0.5">Record a substitute covering for staff</p></div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} className="text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Covering For</label>
              <select value={form.coveringFor} onChange={(e) => update("coveringFor", e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                <option value="">Select staff member...</option>
                {staff.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Substitute Name</label>
              <input type="text" value={form.subName} onChange={(e) => update("subName", e.target.value)} placeholder="e.g. Ms. Hart" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#0A0F1E] hover:bg-black text-white"><Send size={16} className="mr-2" /> Log Substitute</Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DirectorStaffManagement;
