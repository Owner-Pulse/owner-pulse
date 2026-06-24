import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";

// ─── Color map ───────────────────────────────────────────────────
const STATE_COLORS = {
  thriving: { ring: "#16A34A", bg: "#DCFCE7", text: "#166534", light: "#BBF7D0" },
  healthy: { ring: "#65A30D", bg: "#ECFCCB", text: "#3F6212", light: "#D9F99D" },
  elevated: { ring: "#D97706", bg: "#FEF3C7", text: "#92400E", light: "#FDE68A" },
  stressed: { ring: "#EA580C", bg: "#FFEDD5", text: "#9A3412", light: "#FED7AA" },
  critical: { ring: "#DC2626", bg: "#FEE2E2", text: "#991B1B", light: "#FECACA" },
};

// ─── Heartbeat SVG path ──────────────────────────────────────────
const heartbeatPath = "M0,15 Q5,5 10,15 Q15,25 20,15 Q25,5 30,15 Q35,25 40,15 Q45,5 50,15 Q55,25 60,15";

/**
 * PulseGauge — animated BPM ring with heartbeat visual
 *
 * Props:
 * - bpm: number (55–160)
 * - composite: number (0–100)
 * - state: { state: string, color: string }
 * - size: "lg" | "md" — controls display size
 * - showSubtitle: boolean
 * - className: string
 */
const PulseGauge = ({
  bpm,
  composite,
  state,
  size = "lg",
  showSubtitle = true,
  showOwnerBadge = false,
  ownerBpm = null,
  className = "",
}) => {
  const colors = STATE_COLORS[state?.state?.toLowerCase()] || STATE_COLORS.healthy;

  const isLarge = size === "lg";
  const ringSize = isLarge ? 200 : 140;
  const innerRadius = isLarge ? 75 : 70;
  const outerRadius = isLarge ? 100 : 95;
  const barSize = isLarge ? 18 : 14;
  const fontSize = isLarge ? "text-5xl" : "text-3xl";
  const subtitleSize = isLarge ? "text-base" : "text-xs";

  // Heartbeat speed: beats at displayed BPM rate
  // One beat cycle = 60 / bpm seconds
  const beatDuration = 60 / Math.max(bpm, 55);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Ring + BPM */}
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius={`${innerRadius}%`}
            outerRadius={`${outerRadius}%`}
            barSize={barSize}
            data={[{ value: composite, fill: colors.ring }]}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background={{ fill: colors.light }}
              dataKey="value"
              cornerRadius={barSize / 2}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Heartbeat icon */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1, 1.25, 1],
              opacity: [0.8, 1, 0.8, 1, 0.8],
            }}
            transition={{
              duration: beatDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-0.5"
          >
            <HeartPulse
              size={isLarge ? 28 : 20}
              color={colors.ring}
              fill={colors.light}
              strokeWidth={2}
            />
          </motion.div>

          {/* BPM number */}
          <motion.div
            className={`${fontSize} font-black leading-none tracking-tighter`}
            style={{ color: colors.ring }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {bpm}
          </motion.div>

          {/* BPM label */}
          <span
            className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
            style={{ color: colors.ring }}
          >
            BPM
          </span>
        </div>
      </div>

      {/* State subtitle */}
      {showSubtitle && (
        <div className="text-center mt-2">
          <motion.div
            className={`font-extrabold tracking-tight ${isLarge ? "text-xl" : "text-sm"}`}
            style={{ color: colors.text }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {state?.state || "Healthy"}
          </motion.div>
          <div
            className={`${subtitleSize} font-medium mt-0.5`}
            style={{ color: colors.ring }}
          >
            Composite: {composite}/100
          </div>
        </div>
      )}

      {/* Owner pulse badge (shown on Director view) */}
      {showOwnerBadge && ownerBpm !== null && (
        <div
          className="mt-2 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold"
          style={{
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.light}`,
          }}
        >
          <HeartPulse size={14} />
          Owner's pulse: {ownerBpm} BPM
        </div>
      )}
    </div>
  );
};

export default PulseGauge;
