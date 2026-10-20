import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BellRing, History, DollarSign, Plus, Pencil } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";
import { useGetCollections } from "@/hooks/collections.hook";
import {
  DIRECTION_META,
  changeComparedTo,
  fmtMoney,
  fmtSignedMoney,
  fmtSignedPct,
  fmtWeek,
  trendDirection,
  trendPoints,
} from "@/lib/collections";
import CollectionsEntryModal from "./CollectionsEntryModal";
import CollectionsHistoryDrawer from "./CollectionsHistoryDrawer";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const TREND_LABEL = { up: "Rising over 12 weeks", down: "Falling over 12 weeks", flat: "Flat over 12 weeks" };

const ChangeLine = ({ data }) => {
  const dir = data?.direction;
  if (!dir || !DIRECTION_META[dir]) {
    return <p className="text-xs text-gray-400">No earlier week to compare yet.</p>;
  }
  const meta = DIRECTION_META[dir];
  const Arrow = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : ArrowRight;
  const pct = fmtSignedPct(data.change_pct);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold tabular-nums ${meta.bg} ${meta.text}`}>
        <Arrow size={14} strokeWidth={2.5} />
        {fmtSignedMoney(data.change_amount)}
        {pct && <span className="font-semibold opacity-80">({pct})</span>}
      </span>
      <span className="text-xs text-gray-500">{changeComparedTo(data)}</span>
    </div>
  );
};

const TrendTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-white border border-gray-100 shadow-md rounded-lg px-2.5 py-1.5 text-[11px]">
      <p className="text-gray-400">Week of {fmtWeek(point.week_start)}</p>
      <p className="font-bold text-gray-900 tabular-nums">{point.balance === null ? "Not entered" : fmtMoney(point.balance, { cents: false })}</p>
    </div>
  );
};

const TrendChart = ({ points, color }) => {
  // dots only where a line cannot show the value: the latest entered week and weeks with gaps on both sides
  const lastIndex = points.reduce((last, p, i) => (p.balance !== null ? i : last), -1);
  const renderDot = ({ cx, cy, index, payload }) => {
    if (payload.balance === null || cx == null || cy == null) return <g key={index} />;
    const prev = points[index - 1]?.balance ?? null;
    const next = points[index + 1]?.balance ?? null;
    const isLast = index === lastIndex;
    if (!isLast && (prev !== null || next !== null)) return <g key={index} />;
    return <circle key={index} cx={cx} cy={cy} r={isLast ? 3.5 : 2.5} fill={color} stroke="#fff" strokeWidth={1.5} />;
  };

  return (
    <div className="h-28 w-full" role="img" aria-label="Collections balance over the last 12 weeks">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
          />
          <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#E5E7EB" }} />
          <Line
            type="monotone"
            dataKey="balance"
            stroke={color}
            strokeWidth={2}
            connectNulls={false}
            dot={renderDot}
            activeDot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 1.5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const CardSkeleton = () => (
  <Card className="relative bg-white border-none shadow-sm p-5">
    <CardAccent group="none" />
    <Skeleton className="h-4 w-28" />
    <div className="grid md:grid-cols-2 gap-6 mt-4">
      <div className="space-y-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-28 w-full" />
    </div>
  </Card>
);

/**
 * Weekly Collections balance — Owner and Director overviews.
 *
 * Props:
 * - role: "owner" | "director"
 * - data: the overview's `collections` object; fetched from /{role}/collections when absent
 */
const CollectionsCard = ({ role, data }) => {
  const { collections: fetched, isLoading } = useGetCollections(role, { enabled: data === undefined });
  const collections = data === undefined ? fetched : data;
  const [entryOpen, setEntryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const points = useMemo(() => trendPoints(collections?.trend), [collections?.trend]);
  const trendDir = trendDirection(points);
  const lineColor = trendDir === "up"
    ? STATUS.problem.hex
    : trendDir === "down"
    ? STATUS.good.hex
    : ACCENTS.collections.hex;
  const hasTrend = points.filter((p) => p.balance !== null).length > 0;

  if (data === undefined && isLoading) return <CardSkeleton />;

  const current = collections?.current || null;
  const isEmpty = !current;
  const needsThisWeek = !isEmpty && collections?.this_week_entered === false;
  const families = current?.families_count;

  return (
    <motion.div variants={itemVariants} id="collections-card" className="scroll-mt-20">
      <Card className="relative bg-white border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden py-0 gap-0">
        <CardAccent group={isEmpty ? "none" : "collections"} />
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 min-w-0">
            <span className={`p-1.5 rounded-lg shrink-0 ${isEmpty ? "bg-gray-100 text-gray-600" : ACCENTS.collections.icon}`}>
              <DollarSign size={16} />
            </span>
            Collections
          </h3>
          {!isEmpty && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold ${ACCENTS.collections.text} ${ACCENTS.collections.hover} transition-colors cursor-pointer`}
              >
                <History size={13} /> History
              </button>
              <button
                type="button"
                onClick={() => setEntryOpen(true)}
                className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold ${ACCENTS.collections.text} ${ACCENTS.collections.hover} transition-colors cursor-pointer`}
              >
                <Pencil size={13} /> Update
              </button>
            </div>
          )}
        </div>

        {isEmpty ? (
          /* Empty state */
          <div className="px-5 py-8 flex flex-col items-center text-center">
            <div className={`p-3 rounded-2xl ${STATUS.none.soft} ${STATUS.none.text}`}>
              <DollarSign size={26} />
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-3">No collections entered yet</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Enter the balance in collections once a week to track how much is still owed.
            </p>
            <Button onClick={() => setEntryOpen(true)} className={`mt-4 h-9 ${ACCENTS.collections.bar} hover:brightness-90 text-white`}>
              <Plus size={15} className="mr-1.5" /> Enter this week
            </Button>
          </div>
        ) : (
          <>
            {/* Director reminder */}
            {needsThisWeek && role === "director" && (
              <div className={`mx-4 sm:mx-5 mt-3 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ${STATUS.watch.soft} ${STATUS.watch.border}`}>
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <BellRing size={16} className={`${STATUS.watch.text} shrink-0 mt-0.5`} />
                  <div className="min-w-0">
                      <p className={`text-sm font-bold ${STATUS.watch.text}`}>Enter this week's collections</p>
                      <p className={`text-[11px] ${STATUS.watch.text}`}>The latest balance is from the week of {fmtWeek(current.week_start)}.</p>
                  </div>
                </div>
                  <Button onClick={() => setEntryOpen(true)} className={`h-8 px-3 text-xs border shrink-0 self-start sm:self-auto ${STATUS.watch.badge}`}>
                  <Plus size={14} className="mr-1" /> Enter this week
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 sm:px-5 pt-3 pb-4">
              {/* Balance + change */}
              <div className="min-w-0 space-y-2">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Balance in collections</p>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 tabular-nums leading-tight">{fmtMoney(current.balance)}</p>
                  {families != null && (
                    <p className="text-xs text-gray-500">{families} {families === 1 ? "family" : "families"}</p>
                  )}
                </div>
                <ChangeLine data={collections} />
                <p className="text-[11px] text-gray-400">Down is good: we are collecting.</p>
              </div>

              {/* 12-week trend */}
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">12-week trend</p>
                  {trendDir && (
                    <span className="text-[10px] font-semibold" style={{ color: lineColor }}>
                      {TREND_LABEL[trendDir]}
                    </span>
                  )}
                </div>
                {hasTrend ? (
                  <TrendChart points={points} color={lineColor} />
                ) : (
                  <p className="h-28 flex items-center justify-center text-xs text-gray-400 italic">No trend yet</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-5 py-2.5 bg-gray-50/80 border-t border-gray-100 text-[11px] text-gray-500 flex flex-wrap gap-x-2 gap-y-0.5">
              <span className="font-semibold text-gray-600">Week of {fmtWeek(current.week_start, { year: true })}</span>
              {current.entered_by?.name && <span>· Entered by {current.entered_by.name}</span>}
              {needsThisWeek && role !== "director" && <span className={`${STATUS.watch.text} font-medium`}>· This week not entered yet</span>}
            </div>
          </>
        )}
      </Card>

      <CollectionsEntryModal isOpen={entryOpen} role={role} onClose={() => setEntryOpen(false)} />
      <CollectionsHistoryDrawer isOpen={historyOpen} role={role} onClose={() => setHistoryOpen(false)} />
    </motion.div>
  );
};

export default CollectionsCard;
