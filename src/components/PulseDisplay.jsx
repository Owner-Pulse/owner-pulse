  import React, { useEffect, useRef, useState, useMemo } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import {
    HeartPulse,
    TrendingDown,
    TrendingUp,
    Users,
    Wallet,
    UserCheck,
    DollarSign,
    ShieldCheck,
    Wrench,
    AlertTriangle,
    GraduationCap,
    BarChart3,
    ChevronRight,
    Sparkles,
    Activity,
    ArrowRight,
  } from "lucide-react";
  import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
  } from "recharts";

  // ─── Sub-score metadata ────────────────────────────────────────
  const SUB_SCORE_META = {
    enrollmentHealth:    { icon: Users,         label: "Enrollment",    color: "#2563EB" },
    discretionaryBudget: { icon: Wallet,        label: "Discretionary", color: "#EC4899" },
    staffCallouts:       { icon: UserCheck,     label: "Callouts",      color: "#F97316" },
    latePayments:        { icon: DollarSign,    label: "AR Aging",      color: "#8B5CF6" },
    compliance:          { icon: ShieldCheck,   label: "Compliance",    color: "#10B981" },
    maintenance:         { icon: Wrench,        label: "Maintenance",   color: "#F59E0B" },
    incidentTrend:       { icon: AlertTriangle, label: "Incidents",     color: "#EF4444" },
    classScore:          { icon: GraduationCap, label: "CLASS",         color: "#14B8A6" },
    bigFinancialHealth:  { icon: BarChart3,     label: "Finances",      color: "#4F46E5" },
  };

  const SEVERITY_STYLES = {
    critical: { bg: "#FEE2E2", border: "#FCA5A5", text: "#991B1B", dot: "#DC2626", label: "Critical" },
    high:     { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E", dot: "#F59E0B", label: "High" },
    medium:   { bg: "#DBEAFE", border: "#93C5FD", text: "#1E40AF", dot: "#2563EB", label: "Medium" },
    low:      { bg: "#F1F5F9", border: "#E2E8F0", text: "#475569", dot: "#64748B", label: "Low" },
  };

  // ─── Zone gradient backgrounds ──────────────────────────────────
  const ZONE_GRADIENTS = {
    green:       "from-emerald-500/5 via-emerald-500/[0.08] to-transparent",
    greenYellow: "from-lime-500/5 via-lime-500/[0.08] to-transparent",
    amber:       "from-amber-500/5 via-amber-500/[0.08] to-transparent",
    orange:      "from-orange-500/5 via-orange-500/[0.08] to-transparent",
    red:         "from-red-500/5 via-red-500/[0.08] to-transparent",
  };

  // ─── Healthy zone reference for history chart ──────────────────
  const HEALTHY_BPM_MAX = 85;

  export default function PulseDisplay({
    pulse,
    recommendations = [],
    pulseHistory = [],
    role = "director",
    ownerPulseBpm = null,
    onSubScoreClick = () => {},
  }) {
    const [isPulsing, setIsPulsing] = useState(false);
    const [historyRange, setHistoryRange] = useState(30);
    const [hoveredSub, setHoveredSub] = useState(null);
    const demoRef = useRef(null);

    const bpm = pulse?.bpm ?? 85;
    const composite = pulse?.composite ?? 75;
    const stateInfo = pulse?.state ?? { state: "Healthy", color: "#84CC16", zone: "greenYellow" };
    const subScores = pulse?.subScores ?? {};
    const weightValues = pulse?.weights ?? {};
    const isThriving = bpm <= 70;

    // ── Stable demo seed (generated once) ───────────────────────
    if (!demoRef.current) {
      demoRef.current = generateDemoHistory(bpm, 90);
    }

    // ── Heartbeat animation — smoother CSS-based approach ───────
    const beatDuration = Math.max(0.375, 2.0 - (bpm - 55) * 0.015);
    const pulseScale = isPulsing ? 1.18 : 1;

    useEffect(() => {
      let pulseTimer = null;
      const interval = setInterval(() => {
        setIsPulsing(true);
        clearTimeout(pulseTimer);
        pulseTimer = setTimeout(() => setIsPulsing(false), beatDuration * 400);
      }, beatDuration * 1000);
      return () => {
        clearInterval(interval);
        clearTimeout(pulseTimer);
      };
    }, [beatDuration]);

    // ── History chart data ──────────────────────────────────────
    const chartData = useMemo(() => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - historyRange);
      const parseDate = (d) => {
        // Handle both "MM-DD" (demo) and "YYYY-MM-DD" (real snapshots)
        if (d.length === 5) return new Date(`${new Date().getFullYear()}-${d}`);
        return new Date(d);
      };
      const filtered = pulseHistory.filter((d) => parseDate(d.date) >= cutoff);
      if (filtered.length > 0) return filtered;
      // Fall back to stable demo data
      return (demoRef.current || []).filter((d) => parseDate(d.date) >= cutoff);
    }, [pulseHistory, historyRange]);

    // ── Sub-score cards sorted by weight ─────────────────────────
    const sortedSubScores = useMemo(() => {
      return Object.entries(SUB_SCORE_META)
        .filter(([key]) => subScores[key] !== undefined && subScores[key] !== null)
        .map(([key, meta]) => ({
          key, ...meta,
          score: subScores[key],
          weight: weightValues[key] || 0,
        }))
        .sort((a, b) => b.weight - a.weight);
    }, [subScores, weightValues]);

    // ── Recommendations filtered by pulse state ──────────────────
    const displayedRecs = isThriving && recommendations.length === 0
      ? []
      : recommendations;

    return (
      <div className="space-y-4">
        {/* ──────── MAIN PULSE CARD ──────── */}
        <div
          className={`relative overflow-hidden rounded-2xl border shadow-lg transition-shadow duration-500 hover:shadow-xl bg-gradient-to-br ${ZONE_GRADIENTS[stateInfo.zone] || "from-gray-50 to-white"}`}
          style={{ borderColor: `${stateInfo.color}30` }}
        >
        

          <div className="p-5 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* ── LEFT: BPM GAUGE ── */}
              <div className="flex flex-col items-center shrink-0">
                {/* Heart icon */}
                <motion.div
                  className="relative mb-1"
                  animate={{ scale: pulseScale }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <HeartPulse
                    size={32}
                    style={{ color: stateInfo.color, filter: isPulsing ? `drop-shadow(0 0 12px ${stateInfo.color}50)` : "none" }}
                  />
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: stateInfo.color, animation: `pulse-beat ${beatDuration}s infinite` }}
                  />
                </motion.div>

                {/* Ring + BPM */}
                <div className="relative flex items-center justify-center my-1">
                  <svg className="absolute w-[132px] h-[132px] md:w-[140px] md:h-[140px]" viewBox="0 0 120 120">
                    {/* Background ring */}
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                    {/* Score arc */}
                    <circle
                      cx="60" cy="60" r="52"
                      fill="none"
                      stroke={stateInfo.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${(composite / 100) * 326.7} 326.7`}
                      transform="rotate(-90 60 60)"
                      style={{ transition: "stroke-dasharray 0.6s ease" }}
                    />
                  </svg>
                  <div className="flex flex-col items-center z-10 w-[132px] h-[132px] md:w-[140px] md:h-[140px] justify-center">
                    <motion.span
                      key={bpm}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-5xl md:text-5xl font-black leading-none tabular-nums tracking-tight"
                      style={{ color: stateInfo.color }}
                    >
                      {bpm}
                    </motion.span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5" style={{ color: stateInfo.color, opacity: 0.6 }}>
                      BPM
                    </span>
                  </div>
                </div>

                {/* State pill */}
                <span
                  className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                  style={{ backgroundColor: `${stateInfo.color}18`, color: stateInfo.color }}
                >
                  {stateInfo.state}
                </span>

                {/* Composite */}
                <span className="text-[10px] font-medium mt-1.5 text-gray-400">
                  Composite: {composite}/100
                </span>

                {/* Owner badge (Director view) */}
                {role === "director" && ownerPulseBpm && (
                  <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border text-[10px] font-medium text-gray-500 shadow-sm">
                    <HeartPulse size={10} className="text-blue-500" />
                    Owner's pulse: <span className="font-bold text-gray-800">{ownerPulseBpm}</span> bpm
                  </div>
                )}
              </div>

              {/* ── RIGHT: SUB-SCORES + RECOMMENDATIONS ── */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Section label */}
                <div className="flex items-center gap-2">
                  <Activity size={13} className="text-gray-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Pulse Drivers</span>
                </div>

                {/* Sub-score grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {sortedSubScores.map((sub) => {
                    const isHovered = hoveredSub === sub.key;
                    return (
                      <button
                        key={sub.key}
                        onClick={() => onSubScoreClick(sub.key)}
                        onMouseEnter={() => setHoveredSub(sub.key)}
                        onMouseLeave={() => setHoveredSub(null)}
                        className="group relative flex items-start gap-2.5 p-3 rounded-xl text-left transition-all duration-200 hover:shadow-md active:scale-[0.97]"
                        style={{ backgroundColor: `${sub.color}08` }}
                      >
                        {/* Hover accent bar */}
                        <span
                          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-all duration-200"
                          style={{ backgroundColor: sub.color, opacity: isHovered ? 1 : 0 }}
                        />
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110"
                          style={{ backgroundColor: `${sub.color}15` }}
                        >
                          <sub.icon size={14} style={{ color: sub.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 truncate">
                            {sub.label}
                          </div>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-lg font-black tabular-nums" style={{ color: sub.color }}>
                              {sub.score}
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium">/ {sub.weight}%</span>
                          </div>
                          {/* Mini progress bar */}
                          <div className="mt-1.5 h-1 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${sub.score}%`, backgroundColor: sub.color, opacity: 0.5 }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ── RECOMMENDATIONS ── */}
                {(displayedRecs.length > 0 || isThriving) && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      {isThriving ? (
                        <Sparkles size={13} className="text-emerald-500" />
                      ) : (
                        <TrendingDown size={13} className="text-red-500" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                        {isThriving ? "Proactive Tips" : `Top moves to lower your pulse`}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <AnimatePresence>
                        {isThriving && displayedRecs.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-start gap-3"
                          >
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                              <Sparkles size={13} className="text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-emerald-800">Business is thriving</p>
                              <p className="text-[10px] text-emerald-600 mt-0.5 leading-relaxed">
                                Your pulse is in the healthy zone. The engine is scanning for forward-looking opportunities —
                                upcoming renewals, capacity planning, and compliance prep.
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          displayedRecs.slice(0, 3).map((rec, i) => {
                            const sev = SEVERITY_STYLES[rec.severity] || SEVERITY_STYLES.medium;
                            return (
                              <motion.div
                                key={`${rec.type}-${i}`}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-sm"
                                style={{ backgroundColor: sev.bg, borderColor: sev.border, borderWidth: 1 }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: sev.dot }} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-semibold leading-snug" style={{ color: sev.text }}>
                                      {rec.title}
                                    </p>
                                    {rec.impactBpm > 0 && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/80 shadow-sm" style={{ color: sev.dot }}>
                                        −{Math.round(Math.abs(rec.impactBpm))} bpm
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: sev.text, opacity: 0.75 }}>
                                    {rec.description}
                                  </p>
                                </div>
                                <ChevronRight size={13} className="text-gray-300 mt-1.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                              </motion.div>
                            );
                          })
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ──────── HISTORY CHART ──────── */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Pulse History</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-100/80 rounded-lg p-0.5">
              {[7, 30, 90].map((range) => (
                <button
                  key={range}
                  onClick={() => setHistoryRange(range)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all duration-200 ${
                    historyRange === range
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {range}d
                </button>
              ))}
            </div>
          </div>

          {/* Chart area */}
          <div className="px-2 pb-3">
            <div className="h-[110px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={stateInfo.color} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={stateInfo.color} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  {/* Healthy zone reference band */}
                  <defs>
                    <pattern id="healthyDots" patternUnits="userSpaceOnUse" width="6" height="6">
                      <circle cx="3" cy="3" r="0.8" fill="#10B981" opacity="0.15" />
                    </pattern>
                  </defs>

                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A0B5", fontSize: 9, fontWeight: 500 }}
                    dy={6}
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <YAxis
                    domain={[55, 160]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A0B5", fontSize: 9 }}
                    width={28}
                    tickFormatter={(v) => `${v}`}
                  />

                  {/* Healthy zone overlay */}
                  <Area
                    type="monotone"
                    dataKey={() => HEALTHY_BPM_MAX}
                    stroke="none"
                    fill="#10B981"
                    fillOpacity={0.04}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #E2E8F0",
                      fontSize: "11px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      padding: "6px 10px",
                    }}
                    formatter={(value) => [`${value} bpm`, "Pulse"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />

                  <Area
                    type="monotone"
                    dataKey="bpm"
                    stroke={stateInfo.color}
                    strokeWidth={2.5}
                    fill="url(#pulseGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: stateInfo.color, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-1 px-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm bg-[#10B981]" style={{ opacity: 0.3 }} />
                <span className="text-[8px] text-gray-400">Healthy ≤85 BPM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-[2px] rounded-full" style={{ backgroundColor: stateInfo.color }} />
                <span className="text-[8px] text-gray-400">Pulse</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Generate deterministic demo history (stable across renders via ref) ──
  function generateDemoHistory(currentBpm, days) {
    const data = [];
    const now = new Date();
    // Start further back from the current BPM for a natural-looking trend
    let bpm = currentBpm + (Math.random() - 0.5) * 10;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      // Random walk with mean reversion toward currentBpm
      const reversion = (currentBpm - bpm) * 0.03;
      const noise = (Math.random() - 0.5) * 4;
      bpm = Math.max(60, Math.min(150, bpm + reversion + noise));
      // Recent days pin closer to current
      if (days - i < 3) {
        bpm = bpm * 0.4 + currentBpm * 0.6;
      }
      data.push({
        date: date.toISOString().split("T")[0].slice(5),
        bpm: Math.round(bpm),
      });
    }
    return data;
  }
