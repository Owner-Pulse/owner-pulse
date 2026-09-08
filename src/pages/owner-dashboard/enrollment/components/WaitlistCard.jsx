import React from "react";
import { Calendar, Eye, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatusPill from "./StatusPill";
import { Link } from "react-router";

const WaitlistCard = ({ entries = [], totalWaitlist = 0, waitlistObj = {}, classrooms = [] }) => {
  const familiesWaiting =
    waitlistObj.families_waiting ??
    (entries.length || totalWaitlist || waitlistObj.count || 0);
  const activeCount =
    waitlistObj.active ??
    entries.filter((e) => e.status === "inquiry" || e.status === "applied").length;
  const touredCount =
    waitlistObj.toured ??
    entries.filter((e) => e.status === "toured").length;
  const offeredCount =
    waitlistObj.offered ??
    entries.filter((e) => e.status === "offered").length;

  const totalPipeline =
    activeCount + touredCount + offeredCount || familiesWaiting || 1;
  const activePct = Math.round((activeCount / totalPipeline) * 100);
  const touredPct = Math.round((touredCount / totalPipeline) * 100);
  const offeredPct = Math.round((offeredCount / totalPipeline) * 100);

  // Classrooms with waitlist > 0
  const waitlistRooms = classrooms.filter((c) => (c.waitlist || 0) > 0);

  return (
    <Card className="bg-white border-none shadow-sm h-full flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F]">
                <Calendar size={18} />
              </div>
              Waitlist Pipeline
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-gray-500">
              {familiesWaiting} {familiesWaiting === 1 ? "family" : "families"} waiting for enrollment spots
            </CardDescription>
          </div>
          <Link
            to="/owner/waitlist"
            className="text-xs font-semibold text-[#1E3A5F] hover:text-[#15294A] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View full waitlist</span>
            <ChevronRight size={14} />
          </Link>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {/* Pipeline Stage Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100/80 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-0.5">
                <Clock size={13} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-blue-950">{activeCount}</p>
              <p className="text-[10px] text-blue-700/80 mt-0.5 font-medium">Inquiry / Applied</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100/80 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-600 mb-0.5">
                <Eye size={13} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Toured</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-950">{touredCount}</p>
              <p className="text-[10px] text-emerald-700/80 mt-0.5 font-medium">Completed Tour</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100/80 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-600 mb-0.5">
                <CheckCircle2 size={13} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Offered</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-950">{offeredCount}</p>
              <p className="text-[10px] text-amber-700/80 mt-0.5 font-medium">Admission Offered</p>
            </div>
          </div>

          {/* Progress / Pipeline Distribution Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500">
              <span>Pipeline Distribution</span>
              <span className="text-gray-400 font-normal">
                {activeCount + touredCount + offeredCount} Total Actions
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
              {activeCount > 0 && (
                <div
                  style={{ width: `${activePct}%` }}
                  className="bg-blue-600 rounded-l-full h-full transition-all"
                  title={`Active: ${activeCount} (${activePct}%)`}
                />
              )}
              {touredCount > 0 && (
                <div
                  style={{ width: `${touredPct}%` }}
                  className="bg-emerald-600 h-full transition-all"
                  title={`Toured: ${touredCount} (${touredPct}%)`}
                />
              )}
              {offeredCount > 0 && (
                <div
                  style={{ width: `${offeredPct}%` }}
                  className="bg-amber-500 rounded-r-full h-full transition-all"
                  title={`Offered: ${offeredCount} (${offeredPct}%)`}
                />
              )}
            </div>
          </div>

          {/* Classrooms with Waitlists or Entries Table */}
          {entries.length > 0 ? (
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Child</th>
                    <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Program</th>
                    <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 4).map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2 font-medium text-gray-900">{entry.child}</td>
                      <td className="py-2 text-gray-600">{entry.program}</td>
                      <td className="py-2"><StatusPill status={entry.status}>{entry.status}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : waitlistRooms.length > 0 ? (
            <div className="pt-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Classroom Demand Breakdown
              </p>
              <div className="space-y-1.5">
                {waitlistRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                  >
                    <span className="font-semibold text-gray-800">
                      {room.program || room.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] font-bold text-[11px]">
                      {room.waitlist} {room.waitlist === 1 ? "student" : "students"} waiting
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center border-t border-gray-100">
              <p className="text-xs text-gray-400">No active waitlist records found.</p>
            </div>
          )}
        </CardContent>
      </div>

      <div className="p-4 pt-2">
        <Link
          to="/owner/waitlist"
          className="flex items-center justify-center gap-1.5 w-full text-center py-2.5 px-3 text-xs font-bold text-[#1E3A5F] bg-[#1E3A5F]/5 hover:bg-[#1E3A5F]/10 rounded-xl transition-colors"
        >
          <span>Manage Full Waitlist Roster</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </Card>
  );
};

export default WaitlistCard;
