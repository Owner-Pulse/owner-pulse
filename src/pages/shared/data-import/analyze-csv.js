// Client-side structural check of a CSV before it is sent to the server.
// The first non-empty row is treated as the header.

// Splits CSV text into records of cells, honouring quoted fields.
export const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
};

const isBlank = (row) => row.every((c) => c.trim() === "");

export const analyzeCsv = (text) => {
  const records = parseCsv(text);
  const headerIndex = records.findIndex((r) => !isBlank(r));
  const errors = [];

  if (headerIndex === -1) {
    return { headers: [], ready: [], duplicate: [], issues: [], total: 0, errors: ["The file is empty."] };
  }

  const headers = records[headerIndex].map((h) => h.trim());
  const ready = [];
  const duplicate = [];
  const issues = [];
  const seen = new Set();

  for (let i = headerIndex + 1; i < records.length; i++) {
    const cells = records[i];
    if (isBlank(cells)) continue;
    const entry = { line: i + 1, cells };

    if (cells.length !== headers.length) {
      issues.push({ ...entry, reason: `Expected ${headers.length} columns, found ${cells.length}` });
      continue;
    }
    const key = cells.join("\u0001");
    if (seen.has(key)) {
      duplicate.push(entry);
      continue;
    }
    seen.add(key);
    ready.push(entry);
  }

  const total = ready.length + duplicate.length + issues.length;
  if (total === 0) errors.push("The file has a header row but no data rows.");

  const emptyHeaders = headers.filter((h) => h === "").length;
  if (emptyHeaders > 0) errors.push(`${emptyHeaders} column${emptyHeaders > 1 ? "s have" : " has"} no header name.`);

  const repeated = [...new Set(headers.filter((h, idx) => h !== "" && headers.indexOf(h) !== idx))];
  if (repeated.length > 0) errors.push(`Repeated column names: ${repeated.join(", ")}`);

  return { headers, ready, duplicate, issues, total, errors };
};

const HEADER_SCAN_BYTES = 1024 * 1024;
const csvCell = (value) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

// Returns a copy of the file whose header row is replaced by `headers`.
// Everything after the header row is kept byte-for-byte.
export const rewriteHeaderRow = async (file, headers) => {
  const bytes = new Uint8Array(await file.slice(0, HEADER_SCAN_BYTES).arrayBuffer());
  const bomLength = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? 3 : 0;
  let pos = bomLength;

  while (pos < bytes.length) {
    let end = pos;
    let inQuotes = false;
    let blank = true;
    for (; end < bytes.length; end++) {
      const b = bytes[end];
      if (b === 0x22) inQuotes = !inQuotes;
      else if (!inQuotes && (b === 0x0a || b === 0x0d)) break;
      else if (b !== 0x20 && b !== 0x09 && b !== 0x2c) blank = false;
    }
    if (!blank) {
      if (end === bytes.length && file.size > bytes.length) break;
      return new File([file.slice(0, bomLength), headers.map(csvCell).join(","), file.slice(end)], file.name, { type: file.type });
    }
    pos = end + (bytes[end] === 0x0d && bytes[end + 1] === 0x0a ? 2 : 1);
  }
  throw new Error("Could not find the header row in the file.");
};

const decodeCsv = (buffer) => {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
};

// Returns a copy of the file without the columns in `dropIndexes`, using
// `headers` (one per original column) for the header row.
export const removeColumns = async (file, headers, dropIndexes) => {
  const records = parseCsv(decodeCsv(await file.arrayBuffer()));
  const headerIndex = records.findIndex((r) => !isBlank(r));
  if (headerIndex === -1) throw new Error("Could not find the header row in the file.");

  const keep = (cells) => cells.filter((_, idx) => !dropIndexes.has(idx));
  const lines = [keep(headers), ...records.slice(headerIndex + 1).map(keep)].map((cells) => cells.map(csvCell).join(","));
  return new File([lines.join("\r\n") + "\r\n"], file.name, { type: file.type });
};
