import React from "react";
import { useNavigate } from "react-router";
import { FileStack } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentVaultExpiringSummary } from "@/hooks/document-vault.hook";
import { formatDate } from "@/lib/datetime";

const DocumentVaultExpiringCard = () => {
  const navigate = useNavigate();
  const { summary, isLoading } = useDocumentVaultExpiringSummary();

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;

  const count = summary?.expiring_soon_count ?? 0;
  const preview = summary?.preview || [];

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => navigate("/owner/document-vault?filter=expiring")}
      onKeyDown={(e) => e.key === "Enter" && navigate("/owner/document-vault?filter=expiring")}
      className="p-4 cursor-pointer hover:ring-2 hover:ring-[#1E3A5F]/20 transition-shadow border-none shadow-sm"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
            <FileStack size={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Expiring soon</h3>
            <p className="text-[11px] text-gray-500">Document Vault · next 30 days</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-amber-800 tabular-nums">{count}</span>
      </div>
      {preview.length === 0 ? (
        <p className="text-xs text-gray-500">No documents expiring in the next 30 days.</p>
      ) : (
        <ul className="space-y-2">
          {preview.map((doc) => (
            <li key={doc.id}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (doc.compliance_item_id) {
                    navigate(`/owner/compliance#compliance-item-${doc.compliance_item_id}`);
                  } else {
                    navigate(`/owner/document-vault/${doc.id}`);
                  }
                }}
                className="flex w-full items-center justify-between gap-2 text-left text-xs hover:text-[#1E3A5F]"
              >
                <span className="truncate font-medium text-gray-800">{doc.title}</span>
                <span className="shrink-0 text-gray-500">{doc.expiry_date ? formatDate(doc.expiry_date) : "—"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {(summary?.expired_count ?? 0) > 0 && (
        <p className="mt-3 text-[11px] font-semibold text-red-700">{summary.expired_count} expired document(s) need attention.</p>
      )}
    </Card>
  );
};

export default DocumentVaultExpiringCard;
