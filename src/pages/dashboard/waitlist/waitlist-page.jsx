import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  UserPlus,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Building2,
  GraduationCap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TODAY = new Date("2026-05-11");

const PRESCHOOL_PROGRAMS = ["Age 1", "Age 2", "PreK3", "PreK4", "VPK", "Summer"];
const K8_PROGRAMS = ["K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const ALL_PROGRAMS = [...PRESCHOOL_PROGRAMS, ...K8_PROGRAMS];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const getCurrentUser = () =>
  JSON.parse(localStorage.getItem("user") || '{"role":"owner","name":"John Doe"}');

const INITIAL_WAITLIST = [
  { id: 1, child: "Emma R.", program: "PreK4", parent: "Sara R.", phone: "813-555-0142", email: "s.r@email.com", dateAdded: "2026-03-18", status: "toured", source: "referral" },
  { id: 2, child: "Noah K.", program: "K", parent: "James K.", phone: "813-555-0188", email: "j.k@email.com", dateAdded: "2026-04-02", status: "applied", source: "website" },
  { id: 3, child: "Liam M.", program: "2nd", parent: "Maria M.", phone: "813-555-0210", email: "m.m@email.com", dateAdded: "2026-04-11", status: "offered", source: "walk_in" },
  { id: 4, child: "Sophia D.", program: "PreK3", parent: "Anika D.", phone: "813-555-0301", email: "a.d@email.com", dateAdded: "2026-04-19", status: "inquiry", source: "event" },
  { id: 5, child: "Ethan C.", program: "5th", parent: "Lin C.", phone: "813-555-0277", email: "l.c@email.com", dateAdded: "2026-04-22", status: "toured", source: "referral" },
  { id: 6, child: "Ava B.", program: "K", parent: "Daniel B.", phone: "813-555-0344", email: "d.b@email.com", dateAdded: "2026-05-01", status: "applied", source: "website" },
  { id: 7, child: "Mason W.", program: "1st", parent: "Erin W.", phone: "813-555-0399", email: "e.w@email.com", dateAdded: "2026-05-06", status: "inquiry", source: "website" },
  { id: 8, child: "Zoe T.", program: "PreK4", parent: "Omar T.", phone: "813-555-0412", email: "o.t@email.com", dateAdded: "2026-05-08", status: "inquiry", source: "referral" },
  { id: 9, child: "Lucas P.", program: "3rd", parent: "Nina P.", phone: "813-555-0500", email: "n.p@email.com", dateAdded: "2026-04-15", status: "offered", source: "walk_in" },
  { id: 10, child: "Mia J.", program: "VPK", parent: "Chris J.", phone: "813-555-0611", email: "c.j@email.com", dateAdded: "2026-03-28", status: "enrolled", source: "referral" },
  { id: 11, child: "Oliver G.", program: "6th", parent: "Sarah G.", phone: "813-555-0722", email: "s.g@email.com", dateAdded: "2026-05-03", status: "toured", source: "website" },
  { id: 12, child: "Isla N.", program: "Age 2", parent: "Mike N.", phone: "813-555-0833", email: "m.n@email.com", dateAdded: "2026-04-28", status: "inquiry", source: "event" },
];

const STATUS_FLOW = ["inquiry", "applied", "toured", "offered", "enrolled"];

const daysSince = (d) => Math.floor((TODAY - new Date(d)) / 86400000);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const StatusPill = ({ status }) => {
  const colors = {
    inquiry: "bg-gray-100 text-gray-600",
    applied: "bg-blue-50 text-blue-700",
    toured: "bg-purple-50 text-purple-700",
    offered: "bg-amber-50 text-amber-700",
    enrolled: "bg-emerald-50 text-emerald-700",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[status] || colors.inquiry}`}>{status}</span>;
};

const SourceTag = ({ source }) => {
  const colors = {
    referral: "bg-green-50 text-green-700",
    website: "bg-blue-50 text-blue-700",
    walk_in: "bg-amber-50 text-amber-700",
    event: "bg-purple-50 text-purple-700",
  };
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${colors[source] || colors.website}`}>{source.replace("_", " ")}</span>;
};

const ProgramBadge = ({ program }) => {
  const isPreschool = PRESCHOOL_PROGRAMS.includes(program);
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${isPreschool ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>{program}</span>;
};

const KpiCard = ({ icon: Icon, label, value, sub, iconBg, valueColor }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className={`text-2xl font-bold ${valueColor || "text-gray-900"}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${iconBg || "bg-blue-50 text-blue-600"}`}><Icon size={18} /></div>
      </div>
      {sub && <div className="mt-2 text-xs text-gray-500">{sub}</div>}
    </CardContent>
  </Card>
);

// ─── Add to Waitlist Modal ──────────────────────────────────────────

const AddWaitlistModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    child: "", program: "PreK3", parent: "", phone: "", email: "", source: "referral",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.child.trim() || !form.parent.trim()) return;
    onAdd({
      id: Date.now(),
      child: form.child.trim(),
      program: form.program,
      parent: form.parent.trim(),
      phone: form.phone,
      email: form.email,
      dateAdded: new Date().toISOString().split("T")[0],
      status: "inquiry",
      source: form.source,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add to Waitlist</h2>
              <p className="text-sm text-gray-500 mt-0.5">Register a new family for enrollment</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} className="text-gray-400" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Child's Name</label>
                <input type="text" value={form.child} onChange={(e) => setForm({ ...form, child: e.target.value })} placeholder="e.g. Emma R." required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Program</label>
                <select value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                  {PRESCHOOL_PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  <option disabled>──────────</option>
                  {K8_PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Parent/Guardian</label>
              <input type="text" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} placeholder="e.g. Sara R." required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="813-555-0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="parent@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Source</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                <option value="referral">Referral</option>
                <option value="website">Website</option>
                <option value="walk_in">Walk-in</option>
                <option value="event">Event</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#0A0F1E] hover:bg-black text-white">
                <UserPlus size={16} className="mr-2" /> Add to Waitlist
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────

const WaitlistPage = () => {
  const [waitlist, setWaitlist] = useState(INITIAL_WAITLIST);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = getCurrentUser();
  const role = currentUser.role;

  const handleAdd = (entry) => {
    setWaitlist((prev) => [...prev, entry]);
  };

  const advanceStatus = (id) => {
    setWaitlist((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const idx = STATUS_FLOW.indexOf(w.status);
        if (idx >= STATUS_FLOW.length - 1) return { ...w, status: "inquiry" };
        return { ...w, status: STATUS_FLOW[idx + 1] };
      })
    );
  };

  const preschoolCount = useMemo(() => waitlist.filter((w) => PRESCHOOL_PROGRAMS.includes(w.program)).length, [waitlist]);
  const k8Count = useMemo(() => waitlist.filter((w) => K8_PROGRAMS.includes(w.program)).length, [waitlist]);

  const bySource = useMemo(() => {
    const src = {};
    waitlist.forEach((w) => { src[w.source] = (src[w.source] || 0) + 1; });
    return src;
  }, [waitlist]);

  const byProgram = useMemo(() => {
    return ALL_PROGRAMS.map((p) => {
      const items = waitlist.filter((w) => w.program === p);
      const days = items.map((w) => daysSince(w.dateAdded));
      const avg = days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
      return { program: p, count: items.length, avgWait: avg };
    }).filter((p) => p.count > 0);
  }, [waitlist]);

  const filtered = useMemo(() => {
    let result = waitlist;
    if (statusFilter !== "all") result = result.filter((w) => w.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((w) =>
        w.child.toLowerCase().includes(q) ||
        w.parent.toLowerCase().includes(q) ||
        w.program.toLowerCase().includes(q)
      );
    }
    return result;
  }, [waitlist, statusFilter, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const order = { inquiry: 0, applied: 1, toured: 2, offered: 3, enrolled: 4 };
      return order[a.status] - order[b.status];
    });
  }, [filtered]);

  const staleEntries = useMemo(() => waitlist.filter((w) => daysSince(w.dateAdded) >= 30 && w.status !== "enrolled"), [waitlist]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Waitlist</h1>
          <p className="text-sm text-gray-500 mt-1">
            {waitlist.length} families · {preschoolCount} preschool · {k8Count} K–8
            {role === "director" && " · Manage inquiries and add new families"}
          </p>
        </div>
        {role === "director" && (
          <Button className="bg-[#0A0F1E] hover:bg-black text-white" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} className="mr-2" /> Add to Waitlist
          </Button>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={Calendar} label="Total Families" value={waitlist.length} sub={`${waitlist.filter((w) => w.status === "enrolled").length} enrolled`} iconBg="bg-blue-50 text-blue-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Users} label="Preschool" value={preschoolCount} sub={`${Math.round(preschoolCount / waitlist.length * 100)}% of waitlist`} iconBg="bg-purple-50 text-purple-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={GraduationCap} label="K–8" value={k8Count} sub={`${Math.round(k8Count / waitlist.length * 100)}% of waitlist`} iconBg="bg-amber-50 text-amber-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={AlertTriangle} label="Stale (30d+)" value={staleEntries.length} sub={staleEntries.length > 0 ? "Need follow-up" : "All recent"} iconBg={staleEntries.length > 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"} valueColor={staleEntries.length > 0 ? "text-red-600" : "text-gray-900"} />
        </motion.div>
      </div>

      {/* Owner: High-level program breakdown */}
      {role === "owner" && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2"><Building2 size={16} /> Waitlist by Program</CardTitle>
              <CardDescription>Average wait time and demand per program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {byProgram.map((p) => (
                  <div key={p.program} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <ProgramBadge program={p.program} />
                      <span className="text-xs text-gray-400">{p.count} {p.count === 1 ? "family" : "families"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">Avg {p.avgWait}d waiting</span>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (p.count / Math.max(...byProgram.map((x) => x.count))) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                {byProgram.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No families on the waitlist yet.</p>
                )}
              </div>

              {/* Source breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">By Source</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(bySource).map(([source, count]) => (
                    <span key={source} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-full text-xs font-medium text-gray-700">
                      <SourceTag source={source} /> {count}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters & Search (Director: detailed view) */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status:</span>
          {["all", "inquiry", "applied", "toured", "offered", "enrolled"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-all ${statusFilter === s ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search child, parent, program..."
            className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </motion.div>

      {/* Waitlist Table (both roles) */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-0">
            {sorted.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Child</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Program</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Parent</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Source</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Added</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Wait</th>
                      {role === "director" && <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sorted.map((w) => {
                      const waitDays = daysSince(w.dateAdded);
                      const isStale = waitDays >= 30 && w.status !== "enrolled";
                      return (
                        <tr key={w.id} className={`hover:bg-gray-50 transition-colors ${isStale ? "bg-red-50/30" : ""}`}>
                          <td className="py-3 px-4 font-medium text-gray-900">{w.child}</td>
                          <td className="py-3 px-4"><ProgramBadge program={w.program} /></td>
                          <td className="py-3 px-4">
                            <div>
                              <span className="text-gray-900">{w.parent}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {w.phone && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Phone size={9} /> {w.phone}</span>}
                                {w.email && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Mail size={9} /> {w.email}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4"><StatusPill status={w.status} /></td>
                          <td className="py-3 px-4"><SourceTag source={w.source} /></td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{fmtDate(w.dateAdded)}</td>
                          <td className={`py-3 px-4 text-xs font-medium ${isStale ? "text-red-600" : waitDays >= 14 ? "text-amber-600" : "text-gray-500"}`}>{waitDays}d</td>
                          {role === "director" && (
                            <td className="py-3 px-4 text-right">
                              {w.status !== "enrolled" ? (
                                <button onClick={() => advanceStatus(w.id)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                  {STATUS_FLOW[STATUS_FLOW.indexOf(w.status) + 1] ? `Move to ${STATUS_FLOW[STATUS_FLOW.indexOf(w.status) + 1]}` : "Reset"}
                                </button>
                              ) : (
                                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 justify-end"><CheckCircle2 size={12} /> Enrolled</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No families match the current filters.</p>
                {role === "director" && (
                  <Button variant="outline" className="mt-3 border-gray-200" onClick={() => setShowAddModal(true)}>
                    <UserPlus size={14} className="mr-2" /> Add a Family
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Waitlist Modal */}
      {showAddModal && <AddWaitlistModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />}
    </motion.div>
  );
};

export default WaitlistPage;
