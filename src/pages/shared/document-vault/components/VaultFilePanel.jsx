import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Download, ExternalLink, FileText, X } from "lucide-react";
import { useDocumentVaultFile } from "../../../../hooks/document-vault.hook";
import { loadRichPreview, previewKind } from "./filePreview";

const useObjectUrl = (blob) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return undefined;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
};

const RICH = new Set(["docx", "sheet", "text", "slides", "doc", "ppt"]);

export const VaultFilePanel = ({ role, documentId, mimeType, name, className = "" }) => {
  const { blob, isLoading, isError } = useDocumentVaultFile(role, documentId);
  const [rich, setRich] = useState(null);
  const [richError, setRichError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const kind = previewKind(mimeType, name);
  const isPdf = kind === "pdf";
  const isImage = kind === "image";
  const isVideo = kind === "video";
  const isAudio = kind === "audio";

  const previewBlob = useMemo(() => {
    if (!blob) return null;
    if (isPdf && blob.type !== "application/pdf") return new Blob([blob], { type: "application/pdf" });
    if (isImage && mimeType && blob.type !== mimeType) return new Blob([blob], { type: mimeType });
    if (isVideo && mimeType && blob.type !== mimeType) return new Blob([blob], { type: mimeType });
    if (isAudio && mimeType && blob.type !== mimeType) return new Blob([blob], { type: mimeType });
    return blob;
  }, [blob, isPdf, isImage, isVideo, isAudio, mimeType]);
  const url = useObjectUrl(previewBlob);

  useEffect(() => {
    if (!blob || !RICH.has(kind)) {
      setRich(null);
      setRichError("");
      return undefined;
    }

    let cancelled = false;
    setRich(null);
    setRichError("");
    loadRichPreview(blob, kind)
      .then((next) => {
        if (!cancelled) setRich(next);
      })
      .catch(() => {
        if (!cancelled) setRichError("Could not preview this file.");
      });

    return () => {
      cancelled = true;
    };
  }, [blob, kind]);

  const canExpand = Boolean(url && (isPdf || isImage || isVideo || isAudio || kind === "file" || rich?.html || rich?.text));

  useEffect(() => {
    if (!expanded) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const richClass = "max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-white px-6 py-5 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:mb-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-gray-200 [&_th]:px-2 [&_th]:py-1 [&_img]:my-3 [&_img]:max-w-full";

  const preview = (
    <>
      {url && isPdf && (
        <iframe title={name || "PDF preview"} src={`${url}#navpanes=0&view=FitH`} className="pointer-events-none w-full h-[70vh] rounded-lg border border-gray-200 bg-white" />
      )}
      {url && isImage && (
        <img src={url} alt={name || "Document"} className="pointer-events-none max-h-[70vh] max-w-full rounded-lg border border-gray-200 bg-white object-contain" />
      )}
      {url && isVideo && (
        <video src={url} className="pointer-events-none max-h-[70vh] max-w-full rounded-lg bg-black" />
      )}
      {url && isAudio && (
        <audio src={url} className="pointer-events-none w-full" />
      )}
      {url && kind === "file" && (
        <iframe title={name || "File preview"} src={url} sandbox="" className="pointer-events-none h-[70vh] w-full rounded-lg border border-gray-200 bg-white" />
      )}
      {rich?.html && (
        <div className="w-full self-stretch">
          <div className={richClass} dangerouslySetInnerHTML={{ __html: rich.html }} />
          {rich.note && <p className="mt-2 text-center text-[11px] text-gray-400">{rich.note}</p>}
        </div>
      )}
      {rich?.text && (
        <div className="w-full self-stretch">
          <div className={richClass}>{rich.text}</div>
          {rich.note && <p className="mt-2 text-center text-[11px] text-gray-400">{rich.note}</p>}
        </div>
      )}
    </>
  );

  return (
    <div className={`rounded-xl border border-gray-200 bg-white overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
          <p className="text-sm font-medium text-gray-800 truncate">{name || "File"}</p>
        </div>
        {url && (
          <div className="flex items-center gap-2 shrink-0">
            <a href={url} download={name || "document"} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
            <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
              <ExternalLink className="w-3.5 h-3.5" /> New tab
            </a>
          </div>
        )}
      </div>
      <div className="p-4 min-h-[280px] bg-gray-50 flex items-center justify-center">
        {isLoading && <p className="text-sm text-gray-500">Loading preview…</p>}
        {isError && <p className="text-sm text-red-600">Could not load this file.</p>}
        {canExpand ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full cursor-zoom-in text-left"
            aria-label="Open full screen preview"
          >
            {preview}
          </button>
        ) : (
          preview
        )}
        {url && RICH.has(kind) && !rich && !richError && (
          <p className="text-sm text-gray-500">Preparing preview…</p>
        )}
        {url && richError && (
          <div className="text-center">
            <p className="text-sm text-gray-600">{richError}</p>
            <a href={url} download={name || "document"} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
              <Download className="w-4 h-4" /> Download file
            </a>
          </div>
        )}
      </div>

      {expanded && url && createPortal(
        <div className="fixed inset-0 z-[80] flex flex-col bg-black/90" role="dialog" aria-modal="true" aria-label="Full screen preview">
          <div className="flex items-center justify-end px-4 py-3">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow"
              aria-label="Close full screen preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 px-4 pb-4">
            {isPdf && (
              <iframe title={name || "PDF preview"} src={`${url}#navpanes=0&view=FitH`} className="h-full w-full rounded-lg bg-white" />
            )}
            {isImage && (
              <img src={url} alt={name || "Document"} className="mx-auto max-h-full max-w-full object-contain" />
            )}
            {isVideo && (
              <video src={url} controls className="mx-auto max-h-full max-w-full" />
            )}
            {isAudio && (
              <audio src={url} controls className="mx-auto w-full max-w-xl" />
            )}
            {rich?.html && (
              <div className="mx-auto h-full max-w-3xl overflow-auto rounded-lg bg-white px-8 py-6 text-sm leading-relaxed text-gray-800 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-1" dangerouslySetInnerHTML={{ __html: rich.html }} />
            )}
            {rich?.text && (
              <div className="mx-auto h-full max-w-3xl overflow-auto whitespace-pre-wrap rounded-lg bg-white px-8 py-6 text-sm leading-relaxed text-gray-800">{rich.text}</div>
            )}
            {kind === "file" && (
              <iframe title={name || "File preview"} src={url} sandbox="" className="h-full w-full rounded-lg bg-white" />
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
