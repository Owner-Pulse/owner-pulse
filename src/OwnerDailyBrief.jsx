/* ─────────────────────────────────────────────────────────────────
   OWNER DAILY BRIEF — drop-in news feed

   PURPOSE
     A passive news feed for the Owner Overview. Surfaces daily intel
     cards connecting dots across school data — spending deltas,
     capacity pressure, revenue trends, maintenance recurrence, etc.
     No action buttons. No interaction needed. Glanceable intel only.

   INTEGRATION (for the developer)
     1. Drop this file in your components folder, e.g.
        src/components/OwnerDailyBrief.jsx
     2. Import on the Owner Overview tab:
        import OwnerDailyBrief from './components/OwnerDailyBrief';
        <OwnerDailyBrief />
     3. No props required. No backend wired yet — sample insights are
        hardcoded in the INSIGHTS array below.
     4. Dependencies: react, lucide-react (already in v3).

   WIRING TO REAL DATA (later, when ready)
     The INSIGHTS array is the only thing that needs to change. Either
     - replace it with a prop the parent passes in, or
     - compute the array inside the component from real enrollment,
       budget, maintenance, payroll, and waitlist data.
     Each insight is shape:
       { id, category, headline, detail, delta, trend, time }
     See the type comments above the INSIGHTS array for what each
     field should contain.

   IMPORTANT
     The numbers below are realistic-looking SAMPLES, not real data
     from v3. They're meant to show the visual language and prove out
     the card pattern. Do not use these as actual school metrics.
   ───────────────────────────────────────────────────────────────── */

import React, { useState, useMemo } from 'react';
import {
  Newspaper, TrendingUp, TrendingDown, Minus,
  DollarSign, Users, Wrench, GraduationCap, ShieldCheck,
  UserMinus, Clock,
} from 'lucide-react';

/* ═══ COLORS ══════════════════════════════════════════════════════ */
const COLORS = {
  card:    '#FFFFFF',
  ink:     '#0F1729',
  ink2:    '#3A4254',
  ink3:    '#6B7385',
  line:    '#E5E8F0',
  bgSoft:  '#F9FAFC',

  // category accents
  money:      '#F97316', moneyBg:      '#FFEDD5',
  capacity:   '#7C3AED', capacityBg:   '#EDE9FE',
  revenue:    '#16A34A', revenueBg:    '#DCFCE7',
  maintenance:'#DC2626', maintenanceBg:'#FEE2E2',
  compliance: '#2563EB', complianceBg: '#DBEAFE',
  staff:      '#D97706', staffBg:      '#FEF3C7',
  scholarship:'#0EA5E9', scholarshipBg:'#E0F2FE',
};

/* Category metadata — icon + accent color + label */
const CATEGORY_META = {
  money:       { icon: DollarSign,    color: COLORS.money,       bg: COLORS.moneyBg,       label: 'Spending'    },
  capacity:    { icon: Users,         color: COLORS.capacity,    bg: COLORS.capacityBg,    label: 'Capacity'    },
  revenue:     { icon: TrendingUp,    color: COLORS.revenue,     bg: COLORS.revenueBg,     label: 'Revenue'     },
  maintenance: { icon: Wrench,        color: COLORS.maintenance, bg: COLORS.maintenanceBg, label: 'Maintenance' },
  compliance:  { icon: ShieldCheck,   color: COLORS.compliance,  bg: COLORS.complianceBg,  label: 'Compliance'  },
  staff:       { icon: UserMinus,     color: COLORS.staff,       bg: COLORS.staffBg,       label: 'Staff'       },
  scholarship: { icon: GraduationCap, color: COLORS.scholarship, bg: COLORS.scholarshipBg, label: 'Scholarship' },
};

/* ═══ INSIGHTS  (SAMPLE DATA — replace with real backend output) ═══
   Each insight shape:
     id        unique key
     category  one of CATEGORY_META keys
     headline  bold one-liner (the takeaway)
     detail    sub-text giving the comparison / context
     delta     short pill text (e.g. "+4.2%", "−3 seats")
     trend     "up" | "down" | "flat"
     tone      "good" | "bad" | "neutral"  (colors the delta pill)
     time      ISO datetime — controls "Xm ago / Xh ago" display
   ════════════════════════════════════════════════════════════════ */

const INSIGHTS = [
  {
    id: 'payroll-month',
    category: 'money',
    headline: 'Payroll up 4.2% vs last month',
    detail:   '$920K this month · $883K April. Driven by 2 new hires + spring bonus accrual.',
    delta:    '+4.2%',
    trend:    'up',
    tone:     'neutral',
    time:     dailyAgo(0, 7),
  },
  {
    id: 'seats-yoy',
    category: 'capacity',
    headline: '3 open seats — 4 fewer than this week last year',
    detail:   'May 2026: 3 open · May 2025: 7 open. Tightest May enrollment in 3 years.',
    delta:    '−4 seats',
    trend:    'down',
    tone:     'good',
    time:     dailyAgo(0, 9),
  },
  {
    id: 'maintenance-volume',
    category: 'maintenance',
    headline: 'Maintenance requests up 40% this month',
    detail:   '7 open vs 5 same point in April. Two are HVAC-related — pattern from last summer.',
    delta:    '+40%',
    trend:    'up',
    tone:     'bad',
    time:     dailyAgo(0, 11),
  },
  {
    id: 'revenue-yoy',
    category: 'revenue',
    headline: 'May revenue +6% vs May last year',
    detail:   '$175K MTD · $165K May 2025. Scholarship volume + 2 mid-year enrollments.',
    delta:    '+6%',
    trend:    'up',
    tone:     'good',
    time:     dailyAgo(1, 8),
  },
  {
    id: 'waitlist-surge',
    category: 'capacity',
    headline: 'Waitlist doubled in 3 weeks',
    detail:   '18 families today · 9 on April 22. PreK4 + Kindergarten driving most of it.',
    delta:    '×2',
    trend:    'up',
    tone:     'good',
    time:     dailyAgo(1, 10),
  },
  {
    id: 'cpr-expiring',
    category: 'compliance',
    headline: 'CPR certs expiring — same week as last year',
    detail:   '4 staff certs expire in the next 10 days. Renewals slipped to last minute in 2025 too.',
    delta:    '4 staff',
    trend:    'flat',
    tone:     'bad',
    time:     dailyAgo(2, 8),
  },
  {
    id: 'recurring-ac',
    category: 'maintenance',
    headline: 'AC unit in K–Sequoia: 3rd repair this year',
    detail:   'Same unit serviced Feb 14, Mar 28, May 9. Replacement quote may beat repair cost by now.',
    delta:    '3 repairs',
    trend:    'flat',
    tone:     'bad',
    time:     dailyAgo(2, 14),
  },
  {
    id: 'stepup-apps',
    category: 'scholarship',
    headline: 'Step Up applications up 18% YTD',
    detail:   '74 applications received this fiscal year vs 63 same point in 2024–25.',
    delta:    '+18%',
    trend:    'up',
    tone:     'good',
    time:     dailyAgo(3, 9),
  },
  {
    id: 'callouts-aides',
    category: 'staff',
    headline: '2 callouts today — both aides',
    detail:   'Coverage held but no float for ratio cushion in PreK3 + 2nd grade.',
    delta:    '2 today',
    trend:    'flat',
    tone:     'bad',
    time:     dailyAgo(0, 13),
  },
];

/* ─── Filter chips ──────────────────────────────────────────────── */
const FILTERS = [
  { id: 'all',         label: 'All'         },
  { id: 'money',       label: 'Spending'    },
  { id: 'revenue',     label: 'Revenue'     },
  { id: 'capacity',    label: 'Capacity'    },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'compliance',  label: 'Compliance'  },
  { id: 'staff',       label: 'Staff'       },
];


/* ═════════════════════════════════════════════════════════════════
   COMPONENT
   ═════════════════════════════════════════════════════════════════ */

export default function OwnerDailyBrief() {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () => filter === 'all' ? INSIGHTS : INSIGHTS.filter(i => i.category === filter),
    [filter]
  );

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  return (
    <div className="rounded-2xl w-full" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, borderTopWidth: '3px', borderTopColor: COLORS.compliance }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Newspaper size={18} color={COLORS.compliance} />
              <h3 className="text-base md:text-lg font-bold" style={{ color: COLORS.ink }}>Daily Brief</h3>
            </div>
            <p className="text-xs" style={{ color: COLORS.ink3 }}>
              {dateLabel} · {filtered.length} {filtered.length === 1 ? 'insight' : 'insights'}
            </p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 overflow-x-auto mt-3 -mx-1 px-1 pb-1">
          {FILTERS.map(f => {
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0"
                style={{
                  background: on ? COLORS.ink : COLORS.bgSoft,
                  color:      on ? '#FFFFFF' : COLORS.ink2,
                  border:     `1px solid ${on ? COLORS.ink : COLORS.line}`,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Feed ─────────────────────────────────────────────── */}
      <div className="px-3 pb-3 space-y-2">
        {filtered.map(item => <InsightCard key={item.id} item={item} />)}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm" style={{ color: COLORS.ink3 }}>
            No insights in this category right now.
          </div>
        )}
      </div>
    </div>
  );
}


/* ─── Insight card ──────────────────────────────────────────────── */

function InsightCard({ item }) {
  const meta = CATEGORY_META[item.category] || CATEGORY_META.compliance;
  const Icon = meta.icon;

  const tonePill = {
    good:    { bg: COLORS.revenueBg,     fg: COLORS.revenue     },
    bad:     { bg: COLORS.maintenanceBg, fg: COLORS.maintenance },
    neutral: { bg: COLORS.bgSoft,        fg: COLORS.ink2        },
  }[item.tone] || { bg: COLORS.bgSoft, fg: COLORS.ink2 };

  const TrendIcon = item.trend === 'up' ? TrendingUp
                  : item.trend === 'down' ? TrendingDown
                  : Minus;

  return (
    <div
      className="p-4 rounded-xl flex gap-3 items-start"
      style={{ background: COLORS.bgSoft, border: `1px solid ${COLORS.line}` }}
    >
      {/* Category icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: meta.bg }}
      >
        <Icon size={18} color={meta.color} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] uppercase tracking-wider font-bold"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
          <span className="text-[10px]" style={{ color: COLORS.ink3 }}>
            · {fmtAgo(item.time)}
          </span>
        </div>

        <div className="font-bold text-sm md:text-[15px] mt-1" style={{ color: COLORS.ink }}>
          {item.headline}
        </div>

        {item.detail && (
          <div className="text-xs mt-1.5 leading-relaxed" style={{ color: COLORS.ink2 }}>
            {item.detail}
          </div>
        )}

        {item.delta && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
               style={{ background: tonePill.bg, color: tonePill.fg }}>
            <TrendIcon size={11} />
            {item.delta}
          </div>
        )}
      </div>
    </div>
  );
}


/* ═══ helpers ════════════════════════════════════════════════════ */

// Builds an ISO timestamp N days + H hours ago, for sample data only.
function dailyAgo(daysAgo, hourOfDay) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hourOfDay, 0, 0, 0);
  return d.toISOString();
}

// "5m ago" / "3h ago" / "2d ago"
function fmtAgo(iso) {
  const then = new Date(iso);
  const ms = Date.now() - then.getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
