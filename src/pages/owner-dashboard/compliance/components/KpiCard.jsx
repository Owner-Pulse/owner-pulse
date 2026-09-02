import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const KpiCard = ({
  icon: Icon,
  label,
  value,
  sub,
  pct = 100,
  iconBg,
  color = "#1E3A5F",
  items = [],
  onItemClick,
  onMoreClick,
}) => {
  const displayItems = items.slice(0, 3);
  const remainingCount = items.length > 3 ? items.length - 3 : 0;

  return (
    <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-semibold text-gray-500">{label}</p>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
          </div>
          {/* Mini Donut Chart SVG per D-04 */}
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.5"
                strokeDasharray={`${Math.min(100, Math.max(0, pct))}, 100`}
                strokeLinecap="round"
                stroke={color}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className={`absolute p-1 rounded-full ${iconBg || "text-[#1E3A5F]"}`}>
              <Icon size={14} />
            </div>
          </div>
        </div>

        {/* Item list under count per D-06 */}
        {displayItems.length > 0 ? (
          <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1">
            {displayItems.map((it, idx) => {
              const name = it.item || it.name || "Item";
              const days = it.days_left !== undefined ? `${it.days_left}d` : it.expires ? it.expires : "";
              return (
                <div
                  key={it.id || idx}
                  onClick={() => onItemClick && onItemClick(it)}
                  className="flex items-center justify-between text-[11px] hover:bg-gray-50 p-1 rounded transition-colors cursor-pointer"
                  title={`View ${name}`}
                >
                  <span className="font-semibold text-gray-800 truncate max-w-[130px]">{name}</span>
                  {days && <span className="text-gray-500 font-medium shrink-0 ml-1">{days}</span>}
                </div>
              );
            })}
            {remainingCount > 0 && (
              <div
                onClick={() => onMoreClick && onMoreClick()}
                className="text-[10px] font-bold text-[#1E3A5F] hover:underline cursor-pointer pt-0.5"
              >
                +{remainingCount} more →
              </div>
            )}
          </div>
        ) : (
          sub && (
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <span>{sub}</span>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
