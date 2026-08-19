import React from "react";

const CashFlowHeader = ({ title, syncStatus, bannerSummary, metrics, netCashFlow }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
          {title || "Cash Flow"}
        </h1>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-xs font-semibold bg-[#3E7A54]/10 text-[#2F6042] border border-[#3E7A54]/25 whitespace-nowrap">
          <span className="w-1.5 h-1.5 bg-[#3E7A54] rounded-full" />
          {syncStatus}
        </span>
      </div>
      <p className="text-xs md:text-sm text-gray-500 mt-1">
        {bannerSummary ? (
          bannerSummary
        ) : (
          <>
            YTD {metrics.expenses_ytd?.amount} expenses · {metrics.revenue_ytd?.amount} revenue ·{" "}
            <span className={netCashFlow >= 0 ? "text-[#2F6042] font-medium" : "text-[#8A362C] font-medium"}>
              {metrics.net_cash_flow?.amount} net
            </span>
          </>
        )}
      </p>
    </div>
  </div>
);

export default CashFlowHeader;

