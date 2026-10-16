import React from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

// ─── Design tokens ───────────────────────────────────────────────
const NO_DATA_GREY = "#9CA3AF";
const TEXT_DIM = "#94A3B8";

// ─── Setup items by no_data key ──────────────────────────────────
// `to` is per role; a missing path renders the item as plain text.
// `anchor` scrolls to that element on the target page (e.g. the Collections card on the overview).
const DAILY_ACTIVITY = {
  id: "daily_activity",
  label: "Log daily activity",
  to: { director: "/director/daily-log" },
};

const SETUP_ITEMS = {
  compliance: {
    id: "compliance",
    label: "Add compliance items",
    to: { owner: "/owner/compliance", director: "/director/compliance" },
  },
  enrollment_health: {
    id: "enrollment_health",
    label: "Upload Procare data",
    to: { owner: "/director/data-import", director: "/director/data-import" },
  },
  late_payments_ar: {
    id: "late_payments_ar",
    label: "Enter this week's collections",
    to: { owner: "/owner/overview", director: "/director/overview" },
    anchor: "collections-card",
  },
  class_score: {
    id: "class_score",
    label: "Add CLASS scores to classrooms",
    to: { owner: "/owner/classrooms", director: "/director/students" },
  },
  petty_cash_pace: {
    id: "petty_cash_pace",
    label: "Set the Director budget limit in Settings",
    to: { owner: "/owner/settings" },
  },
  financial_health: {
    id: "financial_health",
    label: "Connect QuickBooks",
    to: {},
  },
  maintenance: DAILY_ACTIVITY,
  staff_callouts: DAILY_ACTIVITY,
  owner_dependence: DAILY_ACTIVITY,
};

/**
 * Reads the missing areas from the pulse API payload.
 * Uses `no_data` (array of keys or key map), falling back to null sub-scores.
 * Returns { noDataKeys, totalAreas }.
 */
export function getPulseCoverage(pulseApi) {
  const subScores = pulseApi?.sub_scores || {};
  const raw = pulseApi?.no_data;

  let noDataKeys;
  if (Array.isArray(raw)) {
    noDataKeys = raw.filter((k) => typeof k === "string");
  } else if (raw && typeof raw === "object") {
    noDataKeys = Object.keys(raw).filter((k) => raw[k]);
  } else {
    noDataKeys = Object.keys(subScores).filter((k) => subScores[k] == null);
  }

  const totalAreas = new Set([...Object.keys(subScores), ...noDataKeys]).size;
  return { noDataKeys, totalAreas };
}

/**
 * PulseSetup — shown in place of the BPM when the Pulse has no data
 *
 * Props:
 * - noDataKeys: string[] of missing areas from the API
 * - role: "owner" | "director" — picks the link for each item
 */
const PulseSetup = ({ noDataKeys = [], role = "owner", className = "" }) => {
  const items = [];
  noDataKeys.forEach((key) => {
    const item = SETUP_ITEMS[key];
    if (item && !items.some((i) => i.id === item.id)) items.push(item);
  });

  return (
    <div className={className}>
      <p className="text-sm md:text-base font-semibold leading-snug" style={{ color: NO_DATA_GREY }}>
        Your Pulse starts once data is added.
      </p>
      {items.length > 0 && (
        <ul className="mt-2 space-y-1">
          {items.map((item) => {
            const to = item.to[role];
            return (
              <li key={item.id} className="flex items-center gap-2 text-xs" style={{ color: TEXT_DIM }}>
                <span
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{ background: NO_DATA_GREY }}
                />
                {to ? (
                  <Link
                    to={to}
                    onClick={() =>
                      item.anchor &&
                      setTimeout(() => document.getElementById(item.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50)
                    }
                    className="inline-flex items-center gap-0.5 underline underline-offset-2 decoration-white/20 hover:text-white transition-colors"
                  >
                    {item.label}
                    <ChevronRight size={12} />
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

/**
 * PulsePartialNote — small line shown when only some sub-scores are missing
 */
export const PulsePartialNote = ({ noDataKeys = [], totalAreas = 0, className = "" }) => {
  const missing = noDataKeys.length;
  if (!missing || !totalAreas || missing >= totalAreas) return null;

  return (
    <p className={`text-[10px] ${className}`} style={{ color: TEXT_DIM }}>
      Based on {totalAreas - missing} of {totalAreas} areas. Add data to complete your Pulse.
    </p>
  );
};

export default PulseSetup;
