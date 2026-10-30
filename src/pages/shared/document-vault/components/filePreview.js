const EXT = (name) => {
  const file = (name || "").toLowerCase();
  const dot = file.lastIndexOf(".");
  return dot >= 0 ? file.slice(dot) : "";
};

export const previewKind = (mimeType, name) => {
  const mime = (mimeType || "").toLowerCase();
  const ext = EXT(name);
  if (mime.includes("pdf") || ext === ".pdf") return "pdf";
  if (mime.startsWith("image/") || [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".tif", ".tiff", ".avif", ".heic"].includes(ext)) return "image";
  if (mime.startsWith("video/") || [".mp4", ".webm", ".mov", ".m4v", ".ogv"].includes(ext)) return "video";
  if (mime.startsWith("audio/") || [".mp3", ".wav", ".m4a", ".aac", ".ogg"].includes(ext)) return "audio";
  if (mime.includes("wordprocessingml") || ext === ".docx") return "docx";
  if (ext === ".doc" || mime === "application/msword") return "doc";
  if (mime.includes("presentationml") || ext === ".pptx") return "slides";
  if (ext === ".ppt" || mime === "application/vnd.ms-powerpoint") return "ppt";
  if (mime.includes("sheet") || mime.includes("excel") || mime === "text/csv" || [".xls", ".xlsx", ".csv", ".ods"].includes(ext)) return "sheet";
  if (mime.startsWith("text/") || [".txt", ".md", ".json", ".xml", ".log", ".rtf", ".html", ".htm", ".css", ".js"].includes(ext)) return "text";
  return "file";
};

const sanitizeHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, iframe, object, embed, link, meta").forEach((node) => node.remove());
  doc.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const attrName = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (attrName.startsWith("on") || attrName === "srcdoc") node.removeAttribute(attr.name);
      if ((attrName === "href" || attrName === "src") && value.startsWith("javascript:")) node.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
};

const tableHtml = (rows) => {
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${String(cell ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</td>`).join("")}</tr>`)
    .join("");
  return `<table>${body}</table>`;
};

async function sheetPreview(blob) {
  const XLSX = await import("xlsx");
  const book = XLSX.read(await blob.arrayBuffer(), { type: "array" });
  const name = book.SheetNames[0];
  if (!name) return { text: "This spreadsheet has no sheets." };
  const rows = XLSX.utils.sheet_to_json(book.Sheets[name], { header: 1, raw: false, defval: "" }).slice(0, 80);
  if (!rows.length) return { text: "This spreadsheet has no visible cells." };
  const extra = book.SheetNames.length > 1 ? `Showing ${name}. ${book.SheetNames.length - 1} more sheet${book.SheetNames.length - 1 === 1 ? "" : "s"} are in the file.` : "";
  return { html: sanitizeHtml(tableHtml(rows)), note: extra };
}

async function readZip(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let eocd = -1;
  const start = Math.max(0, bytes.length - 22 - 65536);
  for (let i = bytes.length - 22; i >= start; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return [];
  const count = view.getUint16(eocd + 10, true);
  let ptr = view.getUint32(eocd + 16, true);
  const entries = [];
  for (let n = 0; n < count && ptr + 46 <= bytes.length; n += 1) {
    if (view.getUint32(ptr, true) !== 0x02014b50) break;
    const method = view.getUint16(ptr + 10, true);
    const compSize = view.getUint32(ptr + 20, true);
    const nameLen = view.getUint16(ptr + 28, true);
    const extraLen = view.getUint16(ptr + 30, true);
    const commentLen = view.getUint16(ptr + 32, true);
    const localOffset = view.getUint32(ptr + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(ptr + 46, ptr + 46 + nameLen));
    if (localOffset + 30 <= bytes.length) {
      const localNameLen = view.getUint16(localOffset + 26, true);
      const localExtraLen = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + localNameLen + localExtraLen;
      entries.push({ name, method, compressed: bytes.subarray(dataStart, dataStart + compSize) });
    }
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

async function inflate(entry) {
  if (entry.method === 0) return entry.compressed;
  if (entry.method !== 8 || typeof DecompressionStream === "undefined") return null;
  const stream = new Blob([entry.compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const slideText = (xml) => xml
  .replace(/<a:t[^>]*>/g, "")
  .replace(/<\/a:t>/g, "\n")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/[ \t]+\n/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

async function slidesPreview(blob) {
  const entries = await readZip(await blob.arrayBuffer());
  const slides = entries
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  const parts = [];
  for (let i = 0; i < slides.length && i < 30; i += 1) {
    const bytes = await inflate(slides[i]);
    if (!bytes) continue;
    const text = slideText(new TextDecoder().decode(bytes));
    if (text) parts.push(`Slide ${i + 1}\n${text}`);
  }
  return { text: parts.join("\n\n") || "This presentation has no visible text." };
}

const readableText = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let current = "";
  const runs = [];
  const push = () => {
    const trimmed = current.replace(/\s+/g, " ").trim();
    if (trimmed.length > 12) runs.push(trimmed);
    current = "";
  };
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const code = bytes[i] | (bytes[i + 1] << 8);
    if (code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126)) {
      current += code === 10 || code === 13 ? " " : String.fromCharCode(code);
    } else {
      push();
    }
  }
  push();
  return [...new Set(runs)].slice(0, 40).join("\n");
};

export async function loadRichPreview(blob, kind) {
  if (kind === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.convertToHtml({ arrayBuffer: await blob.arrayBuffer() });
    const html = sanitizeHtml((result.value || "").trim() || "<p>This Word document has no visible text.</p>");
    return { html, note: "Text preview of the Word file. Download it for the original layout." };
  }
  if (kind === "sheet") return sheetPreview(blob);
  if (kind === "text") {
    const text = await blob.text();
    return { text: text.slice(0, 200000) || "This file has no visible text." };
  }
  if (kind === "slides") return slidesPreview(blob);
  if (kind === "doc" || kind === "ppt") {
    const text = readableText(await blob.arrayBuffer());
    return { text: text || "This file has no visible text. Download it to open the original." };
  }
  return null;
}
