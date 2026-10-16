import React, { useEffect, useState } from "react";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { useDocumentVaultFile } from "@/hooks/document-vault.hook";

const useObjectUrl = (blob) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
};

export const VaultFilePanel = ({ role, documentId, mimeType, name, className = "" }) => {
  const { blob, isLoading, isError } = useDocumentVaultFile(role, documentId, !!documentId);
  const url = useObjectUrl(blob);
  const isPdf = (mimeType || "").includes("pdf");
  const isImage = (mimeType || "").startsWith("image/");

  return (
    <div className={`flex flex-col bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100 shrink-0">
        <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 min-w-0">
          <FileText size={14} className="text-[#AE4A3E] shrink-0" />
          <span className="truncate">{name || "Document"}</span>
        </p>
        {url && (
          <button
            type="button"
            onClick={() => window.open(url, "_blank", "noopener")}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E3A5F] hover:underline cursor-pointer shrink-0"
          >
            <ExternalLink size={12} /> New tab
          </button>
        )}
      </div>
      <div className="flex-1 min-h-[320px] bg-gray-100">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading file...
          </div>
        ) : isError || !url ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs px-4 text-center">
            {isError ? "Could not load the file." : "No file attached."}
          </div>
        ) : isPdf ? (
          <iframe title="Document preview" src={url} className="w-full h-full min-h-[320px] block" />
        ) : isImage ? (
          <img src={url} alt={name || "Document"} className="max-h-full max-w-full mx-auto object-contain p-4" />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-500 text-sm p-6 text-center">
            <FileText size={32} className="text-[#AE4A3E]" />
            <p>Preview not available for this file type.</p>
            <a href={url} download={name} className="text-[#1E3A5F] font-semibold text-xs hover:underline">
              Download file
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
