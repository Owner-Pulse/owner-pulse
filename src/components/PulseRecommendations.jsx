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

// ─── Default icon mapping by issue key ─────────────────────────────
const DEFAULT_ICON_MAP = {
  late_payments_ar: "DollarSign",
  latePayments: "DollarSign",
  compliance: "ShieldCheck",
  class_score: "Star",
  classScore: "Star",
  maintenance: "Wrench",
  enrollment_health: "Users",
  enrollment: "Users",
  enrollmentHealth: "Users",
  petty_cash_pace: "CreditCard",
  petty_cash: "CreditCard",
  discretionaryBudget: "CreditCard",
  staff_callouts: "Users",
  staffCallouts: "Users",
  incidentTrend: "FileText",
};

/**
 * PulseRecommendations — Top 3 ranked recommendations from the pipeline
 *
 * Props:
 * - recommendations: array of recommendations from API or local engine
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
        const itemKey = rec.issue_key || rec.key || `rec-${i}`;
        const title = rec.title || "Recommendation";
        const actionText = rec.action || rec.description || "";
        const fromBPM = rec.fromBPM ?? rec.current_bpm;
        const toBPM = rec.toBPM ?? rec.projected_bpm;
        const delta = rec.delta ?? rec.bpm_delta ?? (fromBPM != null && toBPM != null ? fromBPM - toBPM : 0);
        const isHigh = rec.priority === "high" || delta >= 4;

        const iconName = rec.icon || DEFAULT_ICON_MAP[rec.issue_key] || DEFAULT_ICON_MAP[rec.key] || "Lightbulb";
        const RecIcon = ICON_MAP[iconName] || Lightbulb;

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
            key={itemKey}
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
                <RecIcon
                  size={14}
                  style={{
                    color: isHigh ? "#EF4444" : MONITOR_GREEN,
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#E2E8F0" }}
                  >
                    {title}
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
                {actionText && (
                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{ color: TEXT_DIM }}
                  >
                    {actionText}
                  </p>
                )}

                {/* BPM impact visualization */}
                {delta > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    {fromBPM != null && toBPM != null && (
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        <span style={{ color: "#F87171" }}>
                          {fromBPM}
                        </span>
                        <ArrowRight size={10} style={{ color: "#64748B" }} />
                        <span style={{ color: MONITOR_GREEN }}>
                          {toBPM}
                        </span>
                        <span
                          className="text-[10px] ml-0.5"
                          style={{ color: "#64748B" }}
                        >
                          bpm
                        </span>
                      </div>
                    )}
                    <div
                      className="flex items-center gap-1 text-[10px] font-bold"
                      style={{ color: MONITOR_GREEN }}
                    >
                      <TrendingDown size={10} />
                      -{delta} bpm
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
