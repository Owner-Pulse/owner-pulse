import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  ArrowRight,
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

// ─── Icon map — resolves icon string name to Lucide component ──
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

// ─── Design tokens ───────────────────────────────────────────────
const MONITOR_GREEN = "#22C55E";
const TEXT_DIM = "#94A3B8";

/**
 * PulseRecommendations — Top 3 ranked recommendations from the pipeline
 *
 * Props:
 * - recommendations: array of { key, title, action, icon, impact, delta, fromBPM, toBPM, priority }
 *   where `icon` is a Lucide icon name string (e.g. "DollarSign")
 */
const PulseRecommendations = ({ recommendations = [] }) => {
  if (!recommendations.length) {
    return (
      <div
        className="p-4 rounded-xl text-center"
        style={{
          background: "rgba(34,197,94,0.06)",
          border: "1px solid rgba(34,197,94,0.15)",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <TrendingUp size={16} style={{ color: MONITOR_GREEN }} />
          <span
            className="text-sm font-bold"
            style={{ color: MONITOR_GREEN }}
          >
            All Clear
          </span>
        </div>
        <p className="text-xs" style={{ color: TEXT_DIM }}>
          No issues detected. Your pulse is in good shape.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Lightbulb size={14} style={{ color: MONITOR_GREEN }} />
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: TEXT_DIM }}
        >
          Top Recommendations
        </span>
        <span
          className="text-[9px] font-mono px-1.5 py-0.5 rounded"
          style={{
            background: "rgba(34,197,94,0.1)",
            color: MONITOR_GREEN,
          }}
        >
          {recommendations.length}
        </span>
      </div>

      {recommendations.map((rec, i) => {
        const isHigh = rec.priority === "high";
        const RecIcon = ICON_MAP[rec.icon];

        // Dark-theme colors
        const borderColor = isHigh
          ? "rgba(239,68,68,0.3)"
          : "rgba(34,197,94,0.2)";
        const bgColor = isHigh
          ? "rgba(239,68,68,0.06)"
          : "rgba(255,255,255,0.03)";
        const leftAccent = isHigh
          ? "rgba(239,68,68,0.5)"
          : "rgba(34,197,94,0.4)";

        return (
          <motion.div
            key={rec.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 rounded-xl transition-all hover:brightness-125"
            style={{
              background: bgColor,
              border: `1px solid ${borderColor}`,
              borderLeft: `3px solid ${leftAccent}`,
            }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg"
                style={{
                  background: isHigh
                    ? "rgba(239,68,68,0.1)"
                    : "rgba(34,197,94,0.1)",
                }}
              >
                {RecIcon ? (
                  <RecIcon
                    size={14}
                    style={{
                      color: isHigh ? "#EF4444" : MONITOR_GREEN,
                    }}
                  />
                ) : (
                  <span className="text-sm">{rec.icon}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#E2E8F0" }}
                  >
                    {rec.title}
                  </span>
                  {isHigh && (
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(239,68,68,0.12)",
                        color: "#EF4444",
                      }}
                    >
                      HIGH IMPACT
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-1 leading-relaxed"
                  style={{ color: TEXT_DIM }}
                >
                  {rec.action}
                </p>

                {/* BPM impact visualization */}
                {rec.delta > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-xs font-semibold">
                      <span style={{ color: "#F87171" }}>
                        {rec.fromBPM}
                      </span>
                      <ArrowRight size={10} style={{ color: "#64748B" }} />
                      <span style={{ color: MONITOR_GREEN }}>
                        {rec.toBPM}
                      </span>
                      <span
                        className="text-[10px] ml-0.5"
                        style={{ color: "#64748B" }}
                      >
                        bpm
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1 text-[10px] font-bold"
                      style={{ color: MONITOR_GREEN }}
                    >
                      <TrendingDown size={10} />
                      -{rec.delta} bpm
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PulseRecommendations;
