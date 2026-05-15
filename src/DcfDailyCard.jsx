/* ─────────────────────────────────────────────────────────────────
   DCF DAILY CHECKLIST — drop-in card

   PURPOSE
     Single self-contained React component. Surfaces today's recurring
     FL DCF compliance items for the Director / Asst. Principal.
     One card. Tap to check off. Progress + upcoming reminders.

   INTEGRATION (for the developer)
     1. Drop this file anywhere in your project, e.g.
        src/components/DcfDailyCard.jsx
     2. Import where you want it on the Director side:
        import DcfDailyCard from './components/DcfDailyCard';
        <DcfDailyCard />
     3. No props required. No external state needed. No backend.
        State is local. (To persist across reloads later, see
        "PERSISTENCE" comment near useState below.)
     4. Dependencies: react, lucide-react. Tailwind classes used for
        layout; inline styles for color so it works without your
        design tokens. If your project already has matching tokens,
        feel free to swap the COLORS const for your imports.

   SOURCE
     All daily / weekly / monthly items below are drawn from the
     Florida DCF Child Care Facility Handbook (October 2021),
     incorporated by reference in rule 65C-22.001, F.A.C. Section
     citations are in each item's `cite` field so you can verify
     against the source PDF.

     IMPORTANT — local variations
     Five FL counties (Broward, Hillsborough, Palm Beach, Pinellas,
     Sarasota) have their own local licensing authorities and may
     impose ADDITIONAL or STRICTER requirements than the state
     handbook. Before treating this list as authoritative for your
     school, verify with whichever licensing authority inspects you.

     The arrays below are intentionally editable. Add, remove, or
     reword items to match your inspector's interpretation. Each
     item's section citation is preserved so anyone auditing the
     list can trace it back.
   ───────────────────────────────────────────────────────────────── */

import React, { useState, useMemo } from 'react';
import { CheckCircle2, Circle, ShieldCheck, CalendarClock } from 'lucide-react';

/* ═══ COLORS (inline so the file has zero v3 dependencies) ═══ */
const COLORS = {
  card:    '#FFFFFF',
  ink:     '#0F1729',
  ink2:    '#3A4254',
  ink3:    '#6B7385',
  line:    '#E5E8F0',
  blue:    '#2563EB',
  blueBg:  '#DBEAFE',
  green:   '#16A34A',
  greenBg: '#DCFCE7',
  amber:   '#D97706',
  amberBg: '#FEF3C7',
  bgSoft:  '#F9FAFC',
};

/* ═══ DAILY ITEMS  (FL DCF Handbook, Oct 2021) ═══════════════════
   Shown every day. Edit freely. */
const DAILY_ITEMS = [
  {
    id: 'indoor_inspect',
    label: 'Indoor play areas — basic health & safety inspection',
    hint:  'Document on daily inspection log. Keep records 12 months.',
    cite:  '§3.1.A',
  },
  {
    id: 'outdoor_inspect',
    label: 'Outdoor play areas — inspection & fall-zone surfacing',
    hint:  'Correct any hazards BEFORE children use the area.',
    cite:  '§3.1.A',
  },
  {
    id: 'attendance',
    label: 'Sign-in / sign-out attendance verified',
    hint:  'Time in and time out recorded for every child, every classroom.',
    cite:  '§2.5.2 / §7.5',
  },
  {
    id: 'fridge_freezer',
    label: 'Refrigerator & freezer temps logged',
    hint:  'Fridge ≤ 41°F · Freezer ≤ 0°F. Thermometer in each unit.',
    cite:  '§3.9.2.F.1',
  },
  {
    id: 'indoor_temp',
    label: 'Indoor temperature check (65 – 82°F)',
    hint:  'Must be maintained at all times in occupied rooms.',
    cite:  '§3.3.3.A',
  },
  {
    id: 'toilets_sinks',
    label: 'Toilets & sinks cleaned and sanitized',
    hint:  'At least once per day. Tooth-brushing sinks sanitized BEFORE use.',
    cite:  '§3.7.I',
  },
  {
    id: 'food_waste',
    label: 'Food-waste containers emptied, cleaned, sanitized',
    hint:  'Daily. Tight-fitting lids on indoor containers.',
    cite:  '§3.9.1.A.8',
  },
  {
    id: 'food_temps',
    label: 'Meal-service food temps verified',
    hint:  'Hot ≥ 135°F · Cold ≤ 41°F at service.',
    cite:  '§3.9.3.D.7',
  },
  {
    id: 'diaper_station',
    label: 'Diaper-changing stations sanitized between every use',
    hint:  'Required after each diaper change.',
    cite:  '§3.10.2',
  },
  {
    id: 'first_aid',
    label: 'First-aid kits stocked and sealed',
    hint:  'Office + each classroom. Emergency numbers posted.',
    cite:  '§6.2 / §6.3',
  },
  {
    id: 'exits_clear',
    label: 'Emergency exits clearly marked & unobstructed',
    hint:  'Posted evacuation plan in each room.',
    cite:  '§3.8.3 / §3.8.5.E',
  },
  {
    id: 'medication_log',
    label: 'Medication log signed for any administration',
    hint:  'Locked storage verified. Only if meds given today.',
    cite:  '§6.5',
  },
];

/* ═══ WEEKLY ITEMS  ════════════════════════════════════════════════
   Appear only on the assigned dayOfWeek (0=Sun … 6=Sat). */
const WEEKLY_ITEMS = [
  {
    id: 'linens_wash',
    label: 'Linens washed (or more often if soiled)',
    hint:  'Between users always. Weekly minimum otherwise.',
    cite:  '§3.6.1.F',
    dayOfWeek: 1, // Monday
  },
  {
    id: 'bedding_sanitize',
    label: 'All bedding cleaned & sanitized',
    hint:  'And before reuse by a different child.',
    cite:  '§3.6.1.G',
    dayOfWeek: 1, // Monday
  },
];

/* ═══ MONTHLY ITEMS  ═══════════════════════════════════════════════
   Appear only on the assigned dayOfMonth (1–28). */
const MONTHLY_ITEMS = [
  {
    id: 'fire_drill',
    label: 'Monthly fire drill (varies date & time each month)',
    hint:  'Log date, # children, # staff, route used, evac time. Keep 12 mo. Rotate alternate routes / nap-time variant.',
    cite:  '§3.8.4',
    dayOfMonth: 15,
  },
];

/* ═══ STATIC UPCOMING (annual / per-event reminders) ══════════════
   Surfaced as visibility-only reminders, NOT checkable items.
   Edit dates or remove. */
const ANNUAL_REMINDERS = [
  { label: 'Lockdown drill (1× per operating year)',         cite: '§3.8.5.B' },
  { label: 'Inclement-weather drill (1× per operating year)', cite: '§3.8.5.B' },
  { label: 'Annual fire inspection — certified inspector',    cite: '§3.8.2.A' },
];


/* ═════════════════════════════════════════════════════════════════
   COMPONENT
   ═════════════════════════════════════════════════════════════════ */

export default function DcfDailyCard() {
  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  // Compose today's list: daily + any weekly/monthly that hit today.
  const todaysItems = useMemo(() => {
    const dow = today.getDay();
    const dom = today.getDate();
    return [
      ...DAILY_ITEMS.map(i => ({ ...i, frequency: 'daily' })),
      ...WEEKLY_ITEMS.filter(i => i.dayOfWeek === dow).map(i => ({ ...i, frequency: 'weekly' })),
      ...MONTHLY_ITEMS.filter(i => i.dayOfMonth === dom).map(i => ({ ...i, frequency: 'monthly' })),
    ];
  // recompute only when the calendar day changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today.toDateString()]);

  // PERSISTENCE: in-memory only for now. To persist across reloads,
  // either (a) lift state to a parent that saves to your backend, or
  // (b) replace useState with a custom hook that hydrates from your
  // store on mount and writes on change. Don't use localStorage in
  // artifacts; in your real project it's fine.
  const [checked, setChecked] = useState({});
  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const resetAll = () => setChecked({});

  const doneCount = todaysItems.filter(i => checked[i.id]).length;
  const total = todaysItems.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const allDone = total > 0 && doneCount === total;
  const headerAccent = allDone ? COLORS.green : COLORS.blue;

  return (
    <div
      className="rounded-2xl w-full"
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.line}`,
        borderTopWidth: '3px',
        borderTopColor: headerAccent,
      }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <ShieldCheck size={18} color={COLORS.blue} />
              <h3 className="text-base md:text-lg font-bold" style={{ color: COLORS.ink }}>
                DCF Daily Checklist
              </h3>
            </div>
            <p className="text-xs" style={{ color: COLORS.ink3 }}>
              {dateLabel} · FL DCF Handbook (Oct 2021)
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-extrabold leading-none" style={{ color: allDone ? COLORS.green : COLORS.ink }}>
              {doneCount}
              <span className="text-base" style={{ color: COLORS.ink3 }}>/{total}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider mt-0.5 font-bold" style={{ color: COLORS.ink3 }}>
              done today
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 mt-4 rounded-full overflow-hidden" style={{ background: COLORS.line }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: headerAccent }}
          />
        </div>
      </div>

      {/* ── Checklist ────────────────────────────────────────── */}
      <div className="px-2 pb-2">
        {todaysItems.map(item => {
          const isChecked = !!checked[item.id];
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="w-full text-left p-3 rounded-xl flex items-start gap-3 transition-colors"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.background = COLORS.bgSoft}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isChecked ? (
                  <CheckCircle2 size={20} color={COLORS.green} />
                ) : (
                  <Circle size={20} color={COLORS.ink3} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: isChecked ? COLORS.ink3 : COLORS.ink,
                      textDecoration: isChecked ? 'line-through' : 'none',
                    }}
                  >
                    {item.label}
                  </span>
                  {item.frequency === 'weekly' && (
                    <FrequencyTag bg={COLORS.blueBg} fg={COLORS.blue}>Weekly</FrequencyTag>
                  )}
                  {item.frequency === 'monthly' && (
                    <FrequencyTag bg={COLORS.amberBg} fg={COLORS.amber}>Monthly</FrequencyTag>
                  )}
                </div>
                {item.hint && (
                  <div
                    className="text-xs mt-1"
                    style={{
                      color: COLORS.ink3,
                      textDecoration: isChecked ? 'line-through' : 'none',
                    }}
                  >
                    {item.hint}
                  </div>
                )}
                <div className="text-[10px] uppercase tracking-wider mt-1 font-bold" style={{ color: COLORS.ink3 }}>
                  Handbook {item.cite}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Footer: annual reminders + reset ─────────────────── */}
      <div className="border-t px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ borderColor: COLORS.line }}>
        <div className="flex items-start gap-2 min-w-0">
          <CalendarClock size={14} color={COLORS.ink3} className="mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: COLORS.ink3 }}>
              Annual reminders
            </div>
            <div className="text-xs mt-0.5" style={{ color: COLORS.ink2 }}>
              {ANNUAL_REMINDERS.map((r, i) => (
                <span key={i}>
                  {r.label}
                  {i < ANNUAL_REMINDERS.length - 1 && <span style={{ color: COLORS.ink3 }}> · </span>}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={resetAll}
          className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{ color: COLORS.ink2, background: COLORS.bgSoft, border: `1px solid ${COLORS.line}` }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/* ── Tiny helper ──────────────────────────────────────────────── */
function FrequencyTag({ children, bg, fg }) {
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  );
}
