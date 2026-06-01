import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  AlertTriangle,
  UserMinus,
  Plus,
  X,
  Send,
  Search,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

const LOG_TYPES = [
  { id: "incident", label: "Incident", desc: "Student incident", icon: AlertTriangle, color: "bg-red-500", light: "bg-red-50 text-red-600" },
  { id: "removal", label: "Removal", desc: "Student removed", icon: UserMinus, color: "bg-orange-500", light: "bg-orange-50 text-orange-600" },
];

const INITIAL_LOG = [
  { id: 101, type: "incident", date: "2026-05-07", student: "Student A.", severity: "minor", area: "Playground" },
  { id: 102, type: "incident", date: "2026-05-03", student: "Student C.", severity: "moderate", area: "Classroom" },
  { id: 103, type: "incident", date: "2026-04-22", student: "Student D.", severity: "major", area: "Playground" },
  { id: 104, type: "removal", date: "2026-05-04", student: "Student B.", reason: "behavioral" },
  { id: 105, type: "removal", date: "2026-04-15", student: "Student E.", reason: "transferring" },
];

// ─── Log Entry Card ───────────────────────────────────────────────

const LogEntryCard = ({ entry, index }) => {
  const typeConfig = LOG_TYPES.find((t) => t.id === entry.type);
  const renderDetails = () => {
    if (entry.type === "incident") {
      return (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium text-gray-700">{entry.student}</span>
          <span className="text-gray-300">·</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
            entry.severity === "minor" ? "bg-amber-50 text-amber-600" :
            entry.severity === "moderate" ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
          }`}>{entry.severity}</span>
          <span className="text-gray-300">·</span>
          <span>{entry.area}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="font-medium text-gray-700">{entry.student}</span>
        <span className="text-gray-300">·</span>
        <span className="capitalize">{entry.reason.replace("_", " ")}</span>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
      className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
      <div className="flex flex-col items-center pt-1">
        <div className={`w-3 h-3 rounded-full ring-2 ring-white ${typeConfig?.color || "bg-gray-400"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900">{entry.type === "incident" ? `Incident: ${entry.student}` : `Removal: ${entry.student}`}</p>
          <span className="text-[10px] text-gray-400 whitespace-nowrap font-medium">{fmtRelative(entry.date)}</span>
        </div>
        <div className="mt-1">{renderDetails()}</div>
      </div>
    </motion.div>
  );
};

// ─── Log Form Modal ───────────────────────────────────────────────

const LogForm = ({ onAdd, onClose }) => {
  const [logType, setLogType] = useState("incident");
  const [form, setForm] = useState({});
  const [step, setStep] = useState(0);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const base = { id: Date.now(), date: new Date().toISOString().split("T")[0] };
    if (logType === "incident") {
      if (!form.student) return;
      onAdd({ ...base, type: "incident", student: form.student, severity: form.severity || "minor", area: form.area || "Classroom" });
    } else {
      if (!form.student) return;
      onAdd({ ...base, type: "removal", student: form.student, reason: form.reason || "other" });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Log Entry</h2>
              <p className="text-sm text-gray-500 mt-0.5">Record a student incident or removal</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} className="text-gray-400" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {LOG_TYPES.map((lt) => {
                  const Icon = lt.icon;
                  return (
                    <button key={lt.id} type="button" onClick={() => { setLogType(lt.id); setStep(1); }}
                      className="flex flex-col items-center gap-2 p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lt.light}`}><Icon size={24} /></div>
                      <p className="text-sm font-bold text-gray-900">{lt.label}</p>
                      <p className="text-xs text-gray-500">{lt.desc}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <button type="button" onClick={() => setStep(0)} className="text-xs text-blue-600 hover:underline font-medium">← Change type</button>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-500 font-medium capitalize">{logType} entry</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Student</label>
                  <input type="text" value={form.student || ""} onChange={(e) => update("student", e.target.value)} placeholder="Initials OK" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {logType === "incident" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Severity</label>
                      <div className="flex gap-2">
                        {["minor", "moderate", "major"].map((s) => (
                          <button key={s} type="button" onClick={() => update("severity", s)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                              (form.severity || "minor") === s
                                ? s === "minor" ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300"
                                  : s === "moderate" ? "bg-orange-100 text-orange-700 ring-2 ring-orange-300"
                                  : "bg-red-100 text-red-700 ring-2 ring-red-300"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                            }`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Area</label>
                      <select value={form.area || "Classroom"} onChange={(e) => update("area", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                        {["Classroom", "Playground", "Cafeteria", "Hallway", "Bathroom", "Outside"].map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {logType === "removal" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Reason</label>
                    <select value={form.reason || "other"} onChange={(e) => update("reason", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                      <option value="parent_pickup">Parent Pickup</option>
                      <option value="medical">Medical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="transferring">Transferring</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1 bg-[#0A0F1E] hover:bg-black text-white"><Send size={16} className="mr-2" /> Log Entry</Button>
                </div>
              </>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────

const DailyLogPage = () => {
  const [log, setLog] = useState(INITIAL_LOG);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAdd = (entry) => setLog((prev) => [entry, ...prev]);

  const todayStr = new Date().toISOString().split("T")[0];
  const stats = useMemo(() => ({
    today: log.filter((e) => e.date === todayStr).length,
    incidents: log.filter((e) => e.type === "incident").length,
    removals: log.filter((e) => e.type === "removal").length,
    major: log.filter((e) => e.type === "incident" && e.severity === "major").length,
  }), [log]);

  const filtered = useMemo(() => {
    let result = log;
    if (filterType !== "all") result = result.filter((e) => e.type === filterType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) => Object.values(e).join(" ").toLowerCase().includes(q));
    }
    return result;
  }, [log, filterType, searchQuery]);

  const groupedByDate = useMemo(() => {
    const groups = {};
    [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((e) => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a));
  }, [filtered]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Daily Log</h1>
          <p className="text-sm text-gray-500 mt-1">{stats.incidents} incidents · {stats.removals} removals · {stats.major > 0 && `${stats.major} major`}</p>
        </div>
        <Button className="bg-[#0A0F1E] hover:bg-black text-white shadow-sm" onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" /> New Entry
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {LOG_TYPES.map((t) => (
          <motion.div key={t.id} variants={itemVariants}>
            <Card className={`bg-white border-none shadow-sm hover:shadow-md transition-all cursor-pointer ${filterType === t.id ? "ring-2 ring-gray-300" : ""}`}
              onClick={() => setFilterType(t.id === filterType ? "all" : t.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">{t.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{t.id === "incident" ? stats.incidents : stats.removals}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.light}`}><t.icon size={20} /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 flex-1">
            <Search size={16} className="text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search entries..."
              className="text-sm bg-transparent border-none outline-none w-full" />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
          </div>
          <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
            {[{ id: "all", label: "All" }, ...LOG_TYPES].map((f) => (
              <button key={f.id} onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === f.id ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {groupedByDate.length > 0 ? (
          <div className="space-y-6">
            {groupedByDate.map(([date, entries]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-2 h-2 rounded-full ${date === todayStr ? "bg-blue-500" : "bg-gray-300"}`} />
                  <span className="text-sm font-bold text-gray-700">{date === todayStr ? "Today" : fmtDate(date)}</span>
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-[10px] text-gray-400 font-medium">{entries.length} entry{entries.length !== 1 ? "ies" : "y"}</span>
                </div>
                <div className="space-y-1">
                  {entries.map((entry, i) => <LogEntryCard key={entry.id} entry={entry} index={i} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><FileText size={28} className="text-gray-300" /></div>
            <p className="text-sm font-medium text-gray-500">No entries found</p>
          </div>
        )}
      </motion.div>

      {showForm && <LogForm onAdd={handleAdd} onClose={() => setShowForm(false)} />}
    </motion.div>
  );
};

export default DailyLogPage;
