import React from "react";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ProgramDetailTable = ({ programs }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Building2 size={18} className="text-[#1E3A5F]" />
        Program Detail
      </CardTitle>
      <CardDescription>Full breakdown by program with capacity and waitlist</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Program</th>
              <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Enrolled</th>
              <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Capacity</th>
              <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Open Seats</th>
              <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Waitlist</th>
              <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Fill %</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => {
              const hasCapacity = p.capacity > 0;
              const fillPct = p.fillPercentage ?? (hasCapacity ? Math.round((p.enrolled / p.capacity) * 100) : 0);
              const openSeats = p.openSeats ?? (hasCapacity ? p.capacity - p.enrolled : 0);
              const isOverCapacity = hasCapacity && p.enrolled > p.capacity;
              const isFull = hasCapacity && p.enrolled >= p.capacity;
              const nearFull = hasCapacity && fillPct >= 90 && !isFull;

              return (
                <tr key={p.id || p.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.programCategory && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F]">
                          {p.programCategory}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-semibold text-gray-900">{p.enrolled}</td>
                  <td className="py-2.5 text-right text-gray-500">{hasCapacity ? p.capacity : <span className="text-gray-300">—</span>}</td>
                  <td className="py-2.5 text-right">
                    {!hasCapacity ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      <span className={`font-semibold ${isOverCapacity ? "text-[#8A362C]" : openSeats === 0 ? "text-[#8F6A1F]" : "text-[#2F6042]"}`}>
                        {openSeats}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-right text-gray-500 hidden md:table-cell">
                    {p.waitlist > 0 ? <span className="font-semibold text-[#1E3A5F]">{p.waitlist}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-2.5 text-right hidden md:table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            fillPct > 100 ? "bg-[#B78A2F]" : isFull ? "bg-[#B78A2F]" : nearFull ? "bg-[#3E7A54]" : fillPct > 0 ? "bg-[#1E3A5F]" : "bg-gray-200"
                          }`} 
                          style={{ width: `${Math.min(fillPct, 100)}%` }} 
                        />
                      </div>
                      <span className={`text-xs font-semibold ${fillPct > 100 ? "text-[#8F6A1F]" : hasCapacity && isFull ? "text-[#8F6A1F]" : fillPct > 0 ? "text-gray-700" : "text-gray-400"}`}>
                        {hasCapacity || fillPct > 0 ? `${fillPct}%` : "—"}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A5F]" /><span>Preschool</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2A4C7E]" /><span>Elementary (K–5th)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4A6B96]" /><span>Middle School (6th–8th)</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProgramDetailTable;
