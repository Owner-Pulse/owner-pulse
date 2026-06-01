import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  AlertTriangle,
  UserMinus,
  GraduationCap,
  TrendingUp,
  Calendar,
  Search,
  FileText,
  ShieldAlert,
  Plus,
  X,
  Send,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

// ─── Data ──────────────────────────────────────────────────────

const CLASSROOMS = [
  { name: "Age 1 — Bumblebees", program: "Age 1", capacity: 8, enrolled: 6 },
  { name: "Age 2 — Ladybugs", program: "Age 2", capacity: 12, enrolled: 10 },
  { name: "PreK3 — Caterpillars", program: "PreK3", capacity: 16, enrolled: 14 },
  { name: "PreK4 — Butterflies", program: "PreK4", capacity: 18, enrolled: 16 },
  { name: "VPK — Fireflies", program: "VPK", capacity: 12, enrolled: 11 },
  { name: "K — Sequoia", program: "K", capacity: 18, enrolled: 16 },
  { name: "1st — Redwood", program: "1st", capacity: 16, enrolled: 15 },
  { name: "2nd — Willow", program: "2nd", capacity: 16, enrolled: 14 },
  { name: "3rd — Oak", program: "3rd", capacity: 16, enrolled: 15 },
  { name: "4th — Maple", program: "4th", capacity: 16, enrolled: 14 },
  { name: "5th — Pine", program: "5th", capacity: 16, enrolled: 15 },
  { name: "6th — Cedar", program: "6th", capacity: 16, enrolled: 13 },
  { name: "7th — Birch", program: "7th", capacity: 16, enrolled: 11 },
  { name: "8th — Aspen", program: "8th", capacity: 14, enrolled: 10 },
];

const AT_RISK = [
  { student: "J. Martinez", grade: "5th", reason: "financial", detail: "Lost job · asking about payment plan", flagged: "2026-05-04", status: "intervening" },
  { student: "A. Choi", grade: "7th", reason: "transferring", detail: "Touring private school in Tampa", flagged: "2026-05-06", status: "intervening" },
  { student: "R. Hassan", grade: "3rd", reason: "financial", detail: "Asked about scholarship eligibility", flagged: "2026-05-08", status: "intervening" },
  { student: "M. Webb", grade: "8th", reason: "moving", detail: "Family relocating out of state", flagged: "2026-04-18", status: "lost" },
];

const INITIAL_INCIDENTS = [
  { id: 101, date: "2026-05-07", student: "Student A.", severity: "minor", classroom: "PreK3 — Caterpillars", area: "Playground", description: "Pushed another student on slide", loggedBy: "Director" },
  { id: 102, date: "2026-05-03", student: "Student C.", severity: "moderate", classroom: "1st — Redwood", area: "Classroom", description: "Refused to follow instructions, disruptive behavior", loggedBy: "Director" },
  { id: 103, date: "2026-04-22", student: "Student D.", severity: "major", classroom: "2nd — Willow", area: "Playground", description: "Physical altercation with peer", loggedBy: "Director" },
];

const INITIAL_REMOVALS = [
  { id: 201, date: "2026-05-04", student: "Student B.", reason: "behavioral", classroom: "3rd — Oak", detail: "Repeated behavioral issues after multiple interventions" },
  { id: 202, date: "2026-04-15", student: "Student E.", reason: "transferring", classroom: "5th — Pine", detail: "Family relocating out of state" },
];

// ─── Incident Form ────────────────────────────────────────────

const IncidentForm = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({
    student: "", severity: "minor", classroom: "", area: "Classroom", description: "",
  });
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.student || !form.classroom) { setError("Student and classroom are required."); return; }
    onAdd({
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      student: form.student,
      severity: form.severity,
      classroom: form.classroom,
      area: form.area,
      description: form.description,
      loggedBy: "Director",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-xl font-bold text-gray-900">Log Incident</h2><p className="text-sm text-gray-500 mt-0.5">Record a safety, behavior, or medical event</p></div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} className="text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Student *</label>
                <input type="text" value={form.student} onChange={(e) => update("student", e.target.value)} placeholder="e.g. J. Martinez"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Severity</label>
                <div className="flex gap-2">
                  {["minor", "moderate", "major"].map((s) => (
                    <button key={s} type="button" onClick={() => update("severity", s)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        form.severity === s
                          ? s === "minor" ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300"
                            : s === "moderate" ? "bg-orange-100 text-orange-700 ring-2 ring-orange-300"
                            : "bg-red-100 text-red-700 ring-2 ring-red-300"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Classroom *</label>
              <select value={form.classroom} onChange={(e) => update("classroom", e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                <option value="">Select classroom...</option>
                {CLASSROOMS.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Area</label>
                <select value={form.area} onChange={(e) => update("area", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                  {["Classroom", "Playground", "Cafeteria", "Hallway", "Bathroom", "Outside", "Pickup/Dropoff"].map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type</label>
                <select value={form.incidentType || "behavior"} onChange={(e) => update("incidentType", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                  <option value="behavior">Behavior</option>
                  <option value="safety">Safety</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Brief description of what happened..." rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#0A0F1E] hover:bg-black text-white"><Send size={16} className="mr-2" /> Log Incident</Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Removal Form ─────────────────────────────────────────────

const RemovalForm = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({ student: "", reason: "transferring", classroom: "", detail: "" });
  const [error, setError] = useState("");
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.student || !form.classroom) { setError("Student and classroom are required."); return; }
    onAdd({
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      student: form.student,
      reason: form.reason,
      classroom: form.classroom,
      detail: form.detail,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-xl font-bold text-gray-900">Remove Student</h2><p className="text-sm text-gray-500 mt-0.5">Record a student withdrawal from the school</p></div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} className="text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Student *</label>
                <input type="text" value={form.student} onChange={(e) => update("student", e.target.value)} placeholder="e.g. M. Webb"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Reason</label>
                <select value={form.reason} onChange={(e) => update("reason", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                  <option value="transferring">Transferring</option>
                  <option value="moving">Moving</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="financial">Financial</option>
                  <option value="graduated">Graduated</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Classroom *</label>
              <select value={form.classroom} onChange={(e) => update("classroom", e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                <option value="">Select classroom...</option>
                {CLASSROOMS.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Details</label>
              <textarea value={form.detail} onChange={(e) => update("detail", e.target.value)} placeholder="Reason for removal..." rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white"><Send size={16} className="mr-2" /> Record Removal</Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────

const StudentManagementPage = () => {
  const [activeTab, setActiveTab] = useState("enrollment");
  const [searchQuery, setSearchQuery] = useState("");
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [removals, setRemovals] = useState(INITIAL_REMOVALS);
  const [showForm, setShowForm] = useState(null); // "incident" | "removal" | null

  const totalEnrolled = CLASSROOMS.reduce((a, c) => a + c.enrolled, 0);
  const totalCapacity = CLASSROOMS.reduce((a, c) => a + c.capacity, 0);
  const openSeats = totalCapacity - totalEnrolled;
  const enrollPct = Math.round((totalEnrolled / totalCapacity) * 100);
  const preEnrolled = CLASSROOMS.filter((c) => ["Age 1", "Age 2", "PreK3", "PreK4", "VPK"].includes(c.program)).reduce((a, c) => a + c.enrolled, 0);
  const k8Enrolled = CLASSROOMS.filter((c) => !["Age 1", "Age 2", "PreK3", "PreK4", "VPK"].includes(c.program)).reduce((a, c) => a + c.enrolled, 0);
  const activeRisk = AT_RISK.filter((r) => r.status === "intervening");
  const lostCount = AT_RISK.filter((r) => r.status === "lost").length;

  // Incident stats
  const majorIncidents = incidents.filter(i => i.severity === "major").length;
  const incidentByClassroom = useMemo(() => {
    const map = {};
    incidents.forEach(i => {
      const cls = i.classroom || "Unknown";
      map[cls] = (map[cls] || 0) + 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, [incidents]);

  const filteredClassrooms = CLASSROOMS.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.program.toLowerCase().includes(q);
  });

  const filteredIncidents = incidents.filter(i => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(i).join(" ").toLowerCase().includes(q);
  });

  const filteredRemovals = removals.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(r).join(" ").toLowerCase().includes(q);
  });

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalEnrolled} enrolled · {incidents.length} incidents · {removals.length} removals
          </p>
        </div>
        {activeTab !== "enrollment" && (
          <Button className="bg-[#0A0F1E] hover:bg-black text-white shadow-sm" onClick={() => setShowForm(activeTab === "incidents" ? "incident" : "removal")}>
            <Plus size={16} className="mr-2" /> {activeTab === "incidents" ? "Log Incident" : "Record Removal"}
          </Button>
        )}
      </motion.div>

      {/* Tab Bar */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 w-fit">
          {[
            { id: "enrollment", label: "Enrollment", icon: GraduationCap },
            { id: "incidents", label: "Incidents", icon: AlertTriangle },
            { id: "removals", label: "Removals", icon: UserMinus },
            { id: "at-risk", label: "At-Risk", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowForm(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
                }`}>
                <Icon size={16} /> {tab.label} {tab.id === "incidents" && incidents.length > 0 && `(${incidents.length})`}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ─── ENROLLMENT TAB ─── */}
      {activeTab === "enrollment" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div><p className="text-xs font-medium text-gray-500">Total Enrollment</p><p className="text-2xl font-bold text-gray-900">{totalEnrolled}</p></div>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={18} /></div>
                </div>
                <p className="mt-1 text-xs text-gray-400">{enrollPct}% of capacity</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div><p className="text-xs font-medium text-gray-500">Open Seats</p><p className="text-2xl font-bold text-emerald-600">{openSeats}</p></div>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={18} /></div>
                </div>
                <p className="mt-1 text-xs text-gray-400">{preEnrolled} preschool · {k8Enrolled} K-8</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div><p className="text-xs font-medium text-gray-500">Classrooms</p><p className="text-2xl font-bold text-gray-900">{CLASSROOMS.length}</p></div>
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><GraduationCap size={18} /></div>
                </div>
                <p className="mt-1 text-xs text-gray-400">{CLASSROOMS.filter((c) => c.enrolled >= c.capacity).length} at capacity</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div><p className="text-xs font-medium text-gray-500">High Incidents</p><p className="text-2xl font-bold text-red-600">{incidentByClassroom.filter(([, c]) => c >= 2).length}</p></div>
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg"><BookOpen size={18} /></div>
                </div>
                <p className="mt-1 text-xs text-red-500">{majorIncidents} major · {incidents.length} total</p>
              </CardContent></Card>
            </motion.div>
          </div>

          {/* Classroom Enrollment Table with Incident Counts */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <GraduationCap size={16} /> Classroom Enrollment &amp; Incidents
                  </CardTitle>
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
                    <Search size={14} className="text-gray-400" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..."
                      className="text-xs bg-transparent border-none outline-none w-28" />
                  </div>
                </div>
                <CardDescription>Incident count shown per classroom — click a row to manage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Classroom</th>
                        <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Enrolled</th>
                        <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Capacity</th>
                        <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Open</th>
                        <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Fill %</th>
                        <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Incidents</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredClassrooms.map((c, i) => {
                        const open = c.capacity - c.enrolled;
                        const pct = Math.round((c.enrolled / c.capacity) * 100);
                        const incCount = incidents.filter(inc => inc.classroom === c.name).length;
                        return (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="py-2.5 px-2 font-medium text-gray-900">{c.name}</td>
                            <td className="py-2.5 px-2 text-center font-semibold text-gray-900">{c.enrolled}</td>
                            <td className="py-2.5 px-2 text-center text-gray-500">{c.capacity}</td>
                            <td className={`py-2.5 px-2 text-center font-medium ${open === 0 ? "text-red-500" : open <= 2 ? "text-amber-500" : "text-emerald-500"}`}>{open}</td>
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-2 justify-center">
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 85 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">{pct}%</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              {incCount > 0 ? (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  incCount >= 2 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                }`}>
                                  <AlertTriangle size={10} /> {incCount}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* ─── INCIDENTS TAB ─── */}
      {activeTab === "incidents" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Total Incidents</p><p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Major</p><p className="text-2xl font-bold text-red-600">{majorIncidents}</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Moderate</p><p className="text-2xl font-bold text-orange-600">{incidents.filter(i => i.severity === "moderate").length}</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Classrooms Affected</p><p className="text-2xl font-bold text-gray-900">{incidentByClassroom.length}</p>
              </CardContent></Card>
            </motion.div>
          </div>

          {/* Incidents by Classroom */}
          {incidentByClassroom.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm">
                <CardHeader><CardTitle className="text-sm">Incidents by Classroom</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {incidentByClassroom.map(([cls, count], i) => (
                      <div key={i} className="p-3 rounded-xl bg-gray-50">
                        <p className="text-xs font-medium text-gray-900 truncate">{cls}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${count >= 2 ? "bg-red-500" : "bg-amber-500"}`}
                              style={{ width: `${(count / Math.max(...incidentByClassroom.map(([, c]) => c))) * 100}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${count >= 2 ? "text-red-600" : "text-amber-600"}`}>{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Incidents List */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Incident Log</CardTitle>
                  <Button size="sm" className="bg-[#0A0F1E] hover:bg-black text-white h-8" onClick={() => setShowForm("incident")}>
                    <Plus size={14} className="mr-1" /> Add Incident
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredIncidents.length > 0 ? [...filteredIncidents].sort((a, b) => new Date(b.date) - new Date(a.date)).map((inc) => (
                  <div key={inc.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      inc.severity === "major" ? "bg-red-500" :
                      inc.severity === "moderate" ? "bg-orange-500" : "bg-amber-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{inc.student}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          inc.severity === "major" ? "bg-red-100 text-red-700" :
                          inc.severity === "moderate" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"
                        }`}>{inc.severity}</span>
                        <span className="text-[9px] text-gray-400 ml-auto">{fmtRelative(inc.date)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{inc.classroom} · {inc.area}</p>
                      {inc.description && <p className="text-[10px] text-gray-400 mt-0.5">{inc.description}</p>}
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-400 text-center py-4">No incidents recorded</p>}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* ─── REMOVALS TAB ─── */}
      {activeTab === "removals" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Total Removals</p><p className="text-2xl font-bold text-gray-900">{removals.length}</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">This Month</p><p className="text-2xl font-bold text-blue-600">{removals.filter(r => {
                  const diff = Math.ceil((TODAY - new Date(r.date)) / 86400000);
                  return diff >= 0 && diff <= 30;
                }).length}</p>
              </CardContent></Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm"><CardContent className="p-4">
                <p className="text-xs font-medium text-gray-500">Transferring</p><p className="text-2xl font-bold text-amber-600">{removals.filter(r => r.reason === "transferring").length}</p>
              </CardContent></Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Removal History</CardTitle>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white h-8" onClick={() => setShowForm("removal")}>
                    <Plus size={14} className="mr-1" /> Record Removal
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredRemovals.length > 0 ? [...filteredRemovals].sort((a, b) => new Date(b.date) - new Date(a.date)).map((r) => (
                  <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-red-50">
                    <UserMinus size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{r.student}</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 capitalize">{r.reason}</span>
                        <span className="text-[9px] text-gray-400 ml-auto">{fmtRelative(r.date)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{r.classroom}</p>
                      {r.detail && <p className="text-[10px] text-gray-400 mt-0.5">{r.detail}</p>}
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-400 text-center py-4">No removals recorded</p>}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* ─── AT-RISK TAB ─── */}
      {activeTab === "at-risk" && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldAlert size={16} className="text-red-500" /> At-Risk Students
              </CardTitle>
              <CardDescription>{activeRisk.length} active cases · {lostCount} lost this year</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {AT_RISK.length > 0 ? AT_RISK.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${r.status === "lost" ? "bg-gray-50 opacity-60" : "bg-red-50"}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${r.status === "lost" ? "bg-gray-400" : "bg-red-500"}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{r.student} · {r.grade}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === "lost" ? "bg-gray-200 text-gray-600" : "bg-red-100 text-red-700"}`}>
                        {r.status === "lost" ? "Lost" : "Intervening"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{r.detail}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Flagged {fmtRelative(r.flagged)}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-gray-400 text-center py-4">No at-risk students</p>}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modal Forms */}
      {showForm === "incident" && <IncidentForm onAdd={(inc) => setIncidents(prev => [inc, ...prev])} onClose={() => setShowForm(null)} />}
      {showForm === "removal" && <RemovalForm onAdd={(rem) => setRemovals(prev => [rem, ...prev])} onClose={() => setShowForm(null)} />}
    </motion.div>
  );
};

export default StudentManagementPage;
