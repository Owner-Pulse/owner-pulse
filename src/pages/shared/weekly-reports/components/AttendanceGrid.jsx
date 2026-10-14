import React from "react";
import { REPORT_ROOMS, cellKey, gridTotals } from "@/lib/weekly-report";
import { parseDay } from "@/lib/collections";

const dayLabel = (d) => {
  const date = parseDay(d.date);
  return date ? `${d.name} ${date.getMonth() + 1}/${date.getDate()}` : d.name;
};

/**
 * Attendance (headcount) grid — rows Mon–Fri, columns the report rooms, live totals.
 * Editable when `onChange` is given; `errors` is keyed "headcount|<room>|<date>".
 */
const AttendanceGrid = ({ days, cells, onChange, errors = {}, disabled = false }) => {
  const { rowTotals, colTotals, total } = gridTotals(cells, days);
  const editable = !!onChange;

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[560px] border-separate border-spacing-0 text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white text-left font-semibold text-gray-400 uppercase text-[10px] tracking-wide py-2 pr-2">Day</th>
            {REPORT_ROOMS.map((room) => (
              <th key={room} className="font-semibold text-gray-600 text-center py-2 px-1 whitespace-nowrap">{room}</th>
            ))}
            <th className="font-bold text-[#1E3A5F] text-center py-2 pl-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <td className="sticky left-0 z-10 bg-white py-1 pr-2 font-semibold text-gray-700 whitespace-nowrap">{dayLabel(d)}</td>
              {REPORT_ROOMS.map((room) => {
                const key = cellKey(room, d.date);
                const hasError = !!errors[`headcount|${key}`];
                return (
                  <td key={room} className="py-1 px-1 text-center">
                    {editable ? (
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={cells[key] ?? ""}
                        onChange={(e) => onChange(key, e.target.value)}
                        disabled={disabled}
                        aria-label={`${room} on ${dayLabel(d)}`}
                        title={errors[`headcount|${key}`]}
                        className={`w-full min-w-12 h-9 rounded-lg border text-center text-sm tabular-nums bg-white focus:outline-none focus:ring-2 focus:ring-[#B78A2F] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                          hasError ? "border-[#AE4A3E] bg-[#AE4A3E]/5" : "border-gray-200"
                        }`}
                      />
                    ) : (
                      <span className="inline-block w-full min-w-10 py-1.5 rounded-lg bg-gray-50 tabular-nums text-gray-800">
                        {cells[key] === undefined || cells[key] === "" ? "—" : cells[key]}
                      </span>
                    )}
                  </td>
                );
              })}
              <td className="py-1 pl-2 text-center">
                <span className="inline-block w-full min-w-10 py-1.5 rounded-lg bg-[#1E3A5F]/[0.06] font-bold text-[#1E3A5F] tabular-nums">{rowTotals[d.date]}</span>
              </td>
            </tr>
          ))}
          <tr>
            <td className="sticky left-0 z-10 bg-white pt-2 pr-2 font-bold text-[#1E3A5F] uppercase text-[10px] tracking-wide">Total</td>
            {REPORT_ROOMS.map((room) => (
              <td key={room} className="pt-2 px-1 text-center">
                <span className="inline-block w-full py-1.5 rounded-lg bg-[#B78A2F]/10 font-bold text-[#8F6A1F] tabular-nums">{colTotals[room]}</span>
              </td>
            ))}
            <td className="pt-2 pl-2 text-center">
              <span className="inline-block w-full py-1.5 rounded-lg bg-[#1E3A5F] font-bold text-white tabular-nums">{total}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceGrid;
