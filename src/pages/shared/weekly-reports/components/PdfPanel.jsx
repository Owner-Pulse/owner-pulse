import React, { useEffect, useState } from "react";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWeeklyReportFile } from "@/hooks/weekly-report.hook";

// blob → object URL for the lifetime of the blob
export const useObjectUrl = (blob) => {
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

// the report's PDF from the server at file.url (auth header → blob), or a local file picked in the form
export const useReportPdfUrl = ({ fileUrl, localFile }) => {
  const { blob, isLoading, isError } = useWeeklyReportFile(fileUrl, !localFile);
  const url = useObjectUrl(localFile || blob || null);
  return { url, isLoading: !localFile && !!fileUrl && isLoading, isError: !localFile && isError };
};

export const openPdf = (url) => {
  if (url) window.open(url, "_blank", "noopener");
};

/**
 * PDF side panel (desktop split view). Fills its parent's height.
 */
export const PdfFrame = ({ url, isLoading, isError, name, className = "" }) => (
  <div className={`flex flex-col bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden ${className}`}>
    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100 shrink-0">
      <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 min-w-0">
        <FileText size={14} className="text-[#AE4A3E] shrink-0" />
        <span className="truncate">{name || "Weekly report PDF"}</span>
      </p>
      {url && (
        <button
          type="button"
          onClick={() => openPdf(url)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E3A5F] hover:underline cursor-pointer shrink-0"
        >
          <ExternalLink size={12} /> New tab
        </button>
      )}
    </div>
    <div className="flex-1 min-h-0 bg-gray-100">
      {isLoading ? (
        <div className="h-full flex items-center justify-center text-gray-400 text-xs gap-2">
          <Loader2 size={16} className="animate-spin" /> Loading PDF...
        </div>
      ) : isError || !url ? (
        <div className="h-full flex items-center justify-center text-gray-400 text-xs px-4 text-center">
          {isError ? "Could not load the PDF." : "No PDF attached."}
        </div>
      ) : (
        <iframe title="Weekly report PDF" src={url} className="w-full h-full block" />
      )}
    </div>
  </div>
);

// phone: a button instead of the side panel
export const OpenPdfButton = ({ url, isLoading, className = "" }) => (
  <Button
    type="button"
    variant="outline"
    disabled={!url || isLoading}
    onClick={() => openPdf(url)}
    className={`h-9 border-[#AE4A3E]/30 text-[#8A362C] hover:bg-[#AE4A3E]/5 ${className}`}
  >
    {isLoading ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : <FileText size={15} className="mr-1.5" />}
    Open PDF
  </Button>
);
