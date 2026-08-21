import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  ChevronDown,
  Activity,
  DollarSign,
  ShieldCheck,
  FileText,
  Users,
  Star,
  Wrench,
  Phone,
  Timer,
  CreditCard,
} from "lucide-react";

// ─── Icon map — resolves icon string to Lucide component ──
const ICON_MAP = {
  DollarSign,
  ShieldCheck,
  FileText,
  Users,
  Star,
  Wrench,
  Phone,
  Timer,
  CreditCard,
};
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import PulseGauge from "@/components/PulseGauge";
import PulseRecommendations from "@/components/PulseRecommendations";

// ─── Design tokens ───────────────────────────────────────────────
const DARK_NAVY = "#0A0F1E";
const MONITOR_GREEN = "#3E9B67";
const TEXT_DIM = "#94A3B8";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const PulseSection = ({ directorPulse, ownerPulseSnapshot }) => {
  const [expanded, setExpanded] = useState(false);

  const beatDuration = 60 / Math.max(directorPulse.bpm, 55);

  return (
    <motion.div variants={itemVariants}>
      <Card
        className="relative border-none shadow-2xl overflow-hidden"
        style={{
          background: DARK_NAVY,
          border: "1px solid rgba(62, 155, 103, 0.15)",
        }}
      >
        {/* Scan line effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            )`,
          }}
        />

        {/* ═══════ HOSPITAL MONITOR HEADER ═══════ */}
        <div className="relative px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="relative">
                <HeartPulse size={18} color={MONITOR_GREEN} />
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                  transition={{ duration: beatDuration, repeat: Infinity, ease: "easeOut" }}
                >
                  <HeartPulse size={18} color={MONITOR_GREEN} />
                </motion.div>
              </div>
              <span
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: MONITOR_GREEN }}
              >
                Pulse Monitor
              </span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: "rgba(62,155,103,0.1)", color: MONITOR_GREEN }}
              >
                ● LIVE
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Owner pulse badge */}
              {ownerPulseSnapshot?.bpm && (
                <div
                  className="text-[10px] font-mono flex items-center gap-1"
                  style={{ color: TEXT_DIM }}
                >
                  <HeartPulse size={10} color={MONITOR_GREEN} />
                  Owner: {ownerPulseSnapshot.bpm}
                </div>
              )}
              <span className="text-[10px] font-mono" style={{ color: TEXT_DIM }}>
                {directorPulse.state.state?.toUpperCase() || "HEALTHY"}
              </span>
            </div>
          </div>

          {/* ═══════ BPM DISPLAY ═══════ */}
          <div className="flex flex-col items-center justify-center py-2 relative z-10">
            <motion.div
              className="flex items-baseline gap-1"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: beatDuration, repeat: Infinity, ease: "easeInOut" }}
            >
              <span
                className="text-7xl md:text-8xl font-black leading-none tracking-tighter tabular-nums"
                style={{ color: MONITOR_GREEN }}
              >
                {directorPulse.bpm}
              </span>
              <span
                className="text-sm font-bold uppercase tracking-widest ml-1"
                style={{ color: TEXT_DIM }}
              >
                BPM
              </span>
            </motion.div>

            {/* Composite bar */}
            <div className="flex items-center gap-2 mt-1">
              <div
                className="h-1 rounded-full"
                style={{
                  width: 80,
                  background: `linear-gradient(to right, 
                    ${directorPulse.composite >= 80 ? MONITOR_GREEN : directorPulse.composite >= 60 ? "#C89B3C" : "#C33B2E"} 
                    ${directorPulse.composite}%, 
                    rgba(255,255,255,0.08) ${directorPulse.composite}%)`,
                }}
              />
              <span className="text-[10px] font-mono" style={{ color: TEXT_DIM }}>
                {directorPulse.composite}/100
              </span>
            </div>
          </div>

          {/* ═══════ SPARKLINE / ECG CHART ═══════ */}
          <div className="relative mt-2 mb-1 z-10">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="border-t" style={{ borderColor: "rgba(148,163,184,0.06)", height: 0 }} />
              ))}
            </div>

            <div className="h-20 md:h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { date: "Aug", bpm: 72 },
                    { date: "Sep", bpm: 78 },
                    { date: "Oct", bpm: 82 },
                    { date: "Nov", bpm: 76 },
                    { date: "Dec", bpm: 70 },
                    { date: "Jan", bpm: 65 },
                    { date: "Feb", bpm: 71 },
                    { date: "Mar", bpm: 68 },
                    { date: "Apr", bpm: 74 },
                    { date: "May", bpm: directorPulse.bpm },
                  ]}
                  margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="dirEcgGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={MONITOR_GREEN} stopOpacity={0.35} />
                      <stop offset="60%" stopColor={MONITOR_GREEN} stopOpacity={0.08} />
                      <stop offset="100%" stopColor={MONITOR_GREEN} stopOpacity={0} />
                    </linearGradient>
                    <filter id="dirEcgFilter">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="bpm"
                    stroke={MONITOR_GREEN}
                    strokeWidth={2.5}
                    fill="url(#dirEcgGlow)"
                    dot={false}
                    activeDot={{
                      r: 3,
                      fill: MONITOR_GREEN,
                      stroke: DARK_NAVY,
                      strokeWidth: 2,
                    }}
                    filter="url(#dirEcgFilter)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1E293B",
                      borderRadius: "8px",
                      border: "1px solid rgba(62,155,103,0.2)",
                      fontSize: "11px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                      color: "#E2E8F0",
                    }}
                    formatter={(value) => [`${value} BPM`, "Pulse"]}
                    labelStyle={{ color: "#94A3B8" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ═══════ VIEW DETAIL TOGGLE ═══════ */}
          <div className="flex justify-center mt-2 relative z-10">
            <motion.button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer"
              style={{
                background: expanded
                  ? "rgba(62,155,103,0.12)"
                  : "rgba(148,163,184,0.08)",
                color: expanded ? MONITOR_GREEN : TEXT_DIM,
                border: `1px solid ${
                  expanded
                    ? "rgba(62,155,103,0.25)"
                    : "rgba(148,163,184,0.15)"
                }`,
              }}
              whileHover={{
                background: "rgba(62,155,103,0.15)",
                color: MONITOR_GREEN,
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Activity size={12} />
              {expanded ? "Hide Details" : "View Details"}
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={12} />
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* ═══════ EXPANDED CONTENT ═══════ */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div
                className="px-5 pb-5 md:px-6 md:pb-6"
                style={{ borderTop: "1px solid rgba(62,155,103,0.1)" }}
              >
                <div className="pt-4">
                  {/* Gauge + Subscores side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center justify-center">
                      <PulseGauge
                        bpm={directorPulse.bpm}
                        composite={directorPulse.composite}
                        state={directorPulse.state}
                        size="md"
                        showOwnerBadge
                        ownerBpm={ownerPulseSnapshot?.bpm}
                      />
                    </div>

                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: TEXT_DIM }}
                      >
                        Sub-scores
                      </span>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {directorPulse.subscores.map((sub) => {
                          const scoreColor =
                            sub.score >= 80
                              ? MONITOR_GREEN
                              : sub.score >= 60
                              ? "#C89B3C"
                              : "#C33B2E";
                          return (
                            <div
                              key={sub.key}
                              className="flex flex-col items-center justify-center p-2 rounded-lg"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.06)",
                              }}
                              title={`${sub.label}: ${sub.score}/100 (${Math.round(
                                sub.weight * 100
                              )}% weight)`}
                            >
                              <div
                              className="mb-0.5 p-1.5 rounded-lg"
                              style={{
                                background: "rgba(62,155,103,0.08)",
                              }}
                            >
                              {(() => {
                                const SubIcon = ICON_MAP[sub.icon];
                                return SubIcon ? (
                                  <SubIcon
                                    size={14}
                                    style={{ color: MONITOR_GREEN }}
                                  />
                                ) : null;
                              })()}
                            </div>
                              <div
                                className="text-sm font-black tabular-nums"
                                style={{ color: scoreColor }}
                              >
                                {sub.score}
                              </div>
                              <div
                                className="text-[7px] font-bold uppercase tracking-wider text-center leading-tight"
                                style={{ color: TEXT_DIM }}
                              >
                                {sub.label.split(" ")[0]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div
                    className="rounded-lg p-3"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <PulseRecommendations
                      recommendations={directorPulse.recommendations}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default PulseSection;
