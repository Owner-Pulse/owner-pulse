import { useEffect, useState } from "react";
import mammoth from "mammoth";
import { Download, ExternalLink, FileText } from "lucide-react";
import { useDocumentVaultFile } from "../../../../hooks/document-vault.hook";

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

const isDocx = (mimeType, name) => {
  const mime = (mimeType || "").toLowerCase();
  const file = (name || "").toLowerCase();
  return mime.includes("wordprocessingml") || file.endsWith(".docx");
};

const isLegacyDoc = (mimeType, name) => {
  const mime = (mimeType || "").toLowerCase();
  const file = (name || "").toLowerCase();
  return !file.endsWith(".docx") && (mime === "application/msword" || file.endsWith(".doc"));
};

const sanitizeDocxHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, iframe, object, embed, link, meta").forEach((node) => node.remove());
  doc.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || name === "srcdoc") node.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        node.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
};

export const VaultFilePanel = ({ role, documentId, mimeType, name, className = "" }) => {
  const { data: blob, isLoading, isError } = useDocumentVaultFile(role, documentId);
  const url = useObjectUrl(blob);
  const [docxHtml, setDocxHtml] = useState("");
  const [docxError, setDocxError] = useState("");

  const docx = isDocx(mimeType, name);
  const legacyDoc = isLegacyDoc(mimeType, name);

  useEffect(() => {
    if (!blob || !docx) {
      setDocxHtml("");
      setDocxError("");
      return undefined;
    }

    let cancelled = false;
    setDocxHtml("");
    setDocxError("");

    blob
      .arrayBuffer()
      .then((arrayBuffer) => mammoth.convertToHtml({ arrayBuffer }))
      .then((result) => {
        if (cancelled) return;
        const html = (result.value || "").trim();
        setDocxHtml(
          sanitizeDocxHtml(html || "<p>This Word document has no visible text.</p>")
        );
      })
      .catch(() => {
        if (!cancelled) setDocxError("Could not preview this Word document.");
      });

    return () => {
      cancelled = true;
    };
  }, [blob, docx]);

  const isPdf = (mimeType || "").includes("pdf");
  const isImage = (mimeType || "").startsWith("image/");

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
        {url && isPdf && (
          <iframe title={name || "PDF preview"} src={url} className="w-full h-[70vh] rounded-lg border border-gray-200 bg-white" />
        )}
        {url && isImage && (
          <img src={url} alt={name || "Document"} className="max-h-[70vh] max-w-full rounded-lg border border-gray-200 bg-white object-contain" />
        )}
        {url && docx && !docxHtml && !docxError && (
          <p className="text-sm text-gray-500">Preparing Word preview…</p>
        )}
        {url && docx && docxError && (
          <div className="text-center">
            <p className="text-sm text-gray-600">{docxError}</p>
            <a href={url} download={name || "document"} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
              <Download className="w-4 h-4" /> Download file
            </a>
          </div>
        )}
        {url && docx && docxHtml && (
          <div className="w-full self-stretch">
            <div
              className="max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-white px-6 py-5 text-sm leading-relaxed text-gray-800 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:mb-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-gray-200 [&_th]:px-2 [&_th]:py-1 [&_img]:my-3 [&_img]:max-w-full"
              dangerouslySetInnerHTML={{ __html: docxHtml }}
            />
            <p className="mt-2 text-center text-[11px] text-gray-400">
              Text preview of the Word file. Download it for the original layout.
            </p>
          </div>
        )}
        {url && legacyDoc && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              On-page preview is available for .docx files. Download this older .doc file to open it in Word.
            </p>
            <a href={url} download={name || "document"} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
              <Download className="w-4 h-4" /> Download file
            </a>
          </div>
        )}
        {url && !isPdf && !isImage && !docx && !legacyDoc && (
          <div className="text-center">
            <p className="text-sm text-gray-600">Preview not available for this file type.</p>
            <a href={url} download={name || "document"} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
              <Download className="w-4 h-4" /> Download file
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
