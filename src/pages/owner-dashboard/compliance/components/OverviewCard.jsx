import React from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const OverviewCard = ({ complianceScore, totalItems, ownerCount, directorCount }) => {
  const categories = [
    { label: "All Items", count: totalItems, dot: "bg-[#1E3A5F]" },
    { label: "Owner-owned", count: ownerCount, dot: "bg-[#2A4C7E]" },
    { label: "Director-owned", count: directorCount, dot: "bg-[#1E3A5F]/25" },
  ];

  // Tip of the ring arc, measured clockwise from 12 o'clock (matches the -rotate-90 dash)
  const angle = (complianceScore / 100) * 2 * Math.PI;
  const markerX = 50 + 42 * Math.sin(angle);
  const markerY = 50 - 42 * Math.cos(angle);

  return (
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#1E3A5F]" />
          Overview
        </CardTitle>
        <CardDescription>Status breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Visual progress ring — globe marks the peak of the arc */}
        <div className="flex justify-center mb-4">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="complianceScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E3A5F" />
                  <stop offset="100%" stopColor="#9DB8D9" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1E3A5F" strokeOpacity="0.08" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#complianceScoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(complianceScore / 100) * 264} 264`}
              />
            </svg>
            <div
              className="absolute"
              style={{ left: `${markerX}%`, top: `${markerY}%`, transform: "translate(-50%, -50%)" }}
            >
              <img
                src="/world.png"
                alt="World"
                draggable={false}
                className="w-7 h-7 rounded-full object-cover shadow-[0_1px_5px_rgba(30,58,95,0.35)]"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#1E3A5F] via-[#5B7FA6] to-[#9DB8D9] bg-clip-text text-transparent">
                {complianceScore}%
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E3A5F]/[0.04]">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${cat.dot}`} />
                <span className="text-sm text-gray-600">{cat.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{cat.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewCard;
