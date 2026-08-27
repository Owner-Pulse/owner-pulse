import React from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusPill from "./StatusPill";

const WaitlistCard = ({ entries }) => {
  const activeCount = entries.filter((e) => e.status === "inquiry" || e.status === "applied").length;
  const touredCount = entries.filter((e) => e.status === "toured" || e.status === "offered").length;
  const offeredCount = entries.filter((e) => e.status === "offered").length;

  return (
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={18} className="text-[#1E3A5F]" />
          Waitlist
        </CardTitle>
        <CardDescription>{entries.length} families waiting for spots</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="py-8 text-center border-b border-gray-100">
            <p className="text-xs text-gray-400">No active waitlist records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Child</th>
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Program</th>
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Parent</th>
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Source</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 font-medium text-gray-900">{entry.child}</td>
                    <td className="py-2.5 text-gray-600">{entry.program}</td>
                    <td className="py-2.5 text-gray-500 hidden md:table-cell">{entry.parent}</td>
                    <td className="py-2.5"><StatusPill status={entry.status}>{entry.status}</StatusPill></td>
                    <td className="py-2.5 hidden md:table-cell"><StatusPill status={entry.source}>{entry.source}</StatusPill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-[#1E3A5F]">{activeCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Active</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#2F6042]">{touredCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Toured</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{offeredCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Offered</p>
          </div>
        </div>

        <Button variant="ghost" className="w-full mt-3 text-sm text-[#1E3A5F]">
          View full waitlist →
        </Button>
      </CardContent>
    </Card>
  );
};

export default WaitlistCard;
