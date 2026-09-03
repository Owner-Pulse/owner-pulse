import React from "react";
import { FileSpreadsheet, Users } from "lucide-react";

const ClassroomWaitlistSpreadsheet = ({ classroomWaitlist = [], totalWaitlist = 0 }) => {
  const totalCount = classroomWaitlist.reduce(
    (acc, item) => acc + (Number(item.waitlist_count) || 0),
    0
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50/60 via-white to-white flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              Classroom Waitlist Spreadsheet Tally
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Primary Tracker View
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              High-level count of children waiting per room (spreadsheet breakdown)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
          <Users size={14} className="text-emerald-700" />
          <span>Total Waitlist Tally: <strong className="text-gray-900 font-extrabold">{totalCount || totalWaitlist}</strong></span>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-100/80 border-b border-gray-200 text-gray-700 font-extrabold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Classroom / Program Name</th>
              <th className="py-3.5 px-4 text-center">Classroom ID</th>
              <th className="py-3.5 px-4 text-center">Procare ID</th>
              <th className="py-3.5 px-4 text-center">Room Capacity</th>
              <th className="py-3.5 px-4 text-center">Waitlist Count</th>
              <th className="py-3.5 px-4 text-right">Demand Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {classroomWaitlist.length > 0 ? (
              classroomWaitlist.map((item, idx) => {
                const count = Number(item.waitlist_count) || 0;
                const isHighDemand = count >= 3;
                const isModerateDemand = count > 0 && count < 3;

                return (
                  <tr key={item.classroom_id || idx} className="hover:bg-emerald-50/30 transition-colors">
                    {/* Classroom Name */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 text-sm">
                        {item.classroom_name || `Classroom #${item.classroom_id}`}
                      </span>
                    </td>

                    {/* Classroom ID */}
                    <td className="py-3.5 px-4 text-center text-gray-500 font-mono">
                      #{item.classroom_id || "N/A"}
                    </td>

                    {/* Procare ID */}
                    <td className="py-3.5 px-4 text-center text-gray-500 font-mono">
                      {item.procare_classroom_id ? `#${item.procare_classroom_id}` : "—"}
                    </td>

                    {/* Capacity */}
                    <td className="py-3.5 px-4 text-center text-gray-600">
                      {item.capacity ? `${item.capacity} seats` : "Standard"}
                    </td>

                    {/* Waitlist Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-8 h-7 px-2.5 rounded-lg text-xs font-black shadow-xs ${
                          isHighDemand
                            ? "bg-red-500 text-white"
                            : isModerateDemand
                            ? "bg-amber-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {count}
                      </span>
                    </td>

                    {/* Demand Status */}
                    <td className="py-3.5 px-4 text-right">
                      {isHighDemand ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                          High Demand ({count} waiting)
                        </span>
                      ) : isModerateDemand ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          Moderate ({count} waiting)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                          No Waitlist
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No classroom waitlist data available.
                </td>
              </tr>
            )}
          </tbody>

          {/* Spreadsheet Total Footer */}
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr>
              <td className="py-3.5 px-4 font-black text-gray-900 text-sm">
                Total All Classrooms
              </td>
              <td className="py-3.5 px-4 text-center text-gray-400 font-mono">—</td>
              <td className="py-3.5 px-4 text-center text-gray-400 font-mono">—</td>
              <td className="py-3.5 px-4 text-center text-gray-400 font-mono">—</td>
              <td className="py-3.5 px-4 text-center">
                <span className="inline-flex items-center justify-center px-3 py-1 bg-[#1E3A5F] text-white font-extrabold text-sm rounded-lg">
                  {totalCount || totalWaitlist} Waiting
                </span>
              </td>
              <td className="py-3.5 px-4 text-right text-xs font-bold text-gray-700">
                Primary Tracker Tally
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ClassroomWaitlistSpreadsheet;
