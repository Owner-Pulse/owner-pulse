import React, { useState } from "react";
import { MessageSquare } from "lucide-react";

const ComplianceComments = ({ logs = [] }) => {
  const [open, setOpen] = useState(false);
  if (!logs.length) return null;

  const visible = open ? logs : logs.slice(0, 2);

  return (
    <div className="mt-3 pt-2 border-t border-gray-100">
      <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-1.5">
        <MessageSquare size={13} className="text-[#1E3A5F]" />
        Comments
      </p>
      <div className="space-y-1.5">
        {visible.map((log) => (
          <div key={log.id || `${log.author}-${log.date}-${log.text}`} className="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-2">
            <p className="text-[11px] text-gray-500">
              <span className="font-semibold text-[#1E3A5F]">{log.author}</span>
              {log.date ? ` · ${log.date}` : ""}
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{log.text}</p>
          </div>
        ))}
      </div>
      {logs.length > 2 && (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mt-1.5 text-xs font-semibold text-[#1E3A5F] hover:underline"
        >
          {open ? "Show latest" : "View all comments"}
        </button>
      )}
    </div>
  );
};

export default ComplianceComments;
