import React from "react";
import { useNavigate } from "react-router";
import { FileText, Upload } from "lucide-react";

const PROOF = {
  expired: { label: "Expired", className: "bg-red-50 text-red-700" },
  expiring_soon: { label: "Expiring", className: "bg-amber-50 text-amber-800" },
  valid: { label: "Current", className: "bg-emerald-50 text-emerald-700" },
  no_expiry: { label: "On file", className: "bg-violet-50 text-violet-700" },
  missing_file: { label: "No file", className: "bg-red-50 text-red-700" },
};

const docStatus = (doc) => {
  if (!doc?.has_file) return PROOF.missing_file;
  return PROOF[doc.expiry_status] || PROOF.no_expiry;
};

const ComplianceVaultDocuments = ({ item, role = "owner", onAttach }) => {
  const navigate = useNavigate();
  const docs = item.documents || [];
  const base = role === "owner" ? "/owner" : "/director";
  const proofNeedsAttention = ["expired", "missing_file", "expiring"].includes(item.document_proof);

  return (
    <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#1E3A5F]">Documents</p>
        <button
          type="button"
          onClick={() => onAttach?.(item)}
          className="inline-flex items-center gap-1 rounded-lg bg-[#1E3A5F] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#15294A]"
        >
          <Upload size={12} /> Upload
        </button>
      </div>

      {docs.length === 0 ? (
        <p className="mt-2 text-xs text-gray-500">No vault file linked. Upload the certificate or policy for this item.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {docs.map((doc) => {
            const status = docStatus(doc);
            return (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => navigate(`${base}/document-vault/${doc.id}`)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-left hover:bg-gray-50"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText size={14} className="shrink-0 text-[#1E3A5F]" />
                    <span className="truncate text-xs font-medium text-gray-800">{doc.title}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {proofNeedsAttention && (
        <p className="mt-2 text-[11px] font-semibold text-red-700">This file needs attention, even if the checklist is complete.</p>
      )}
    </div>
  );
};

export default ComplianceVaultDocuments;
