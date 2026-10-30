import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useDeleteDocumentVault, useDocumentVaultCategories, useDocumentVaultList } from "@/hooks/document-vault.hook";
import { daysBetween, formatExpiryDate, formatExpiryDuration, todayYmd } from "@/lib/datetime";
import DocumentVaultUploadModal from "./document-vault-upload-modal";
import DocumentVaultEditModal from "./document-vault-edit-modal";
import ConfidentialStamp from "./components/ConfidentialStamp";
import { isReviewNote } from "./vault-document-form";

export const useVaultRole = () => (useLocation().pathname.startsWith("/owner") ? "owner" : "director");

const EXPIRING_WINDOW = 60;

const TONES = {
  green: {
    bar: "border-t-emerald-500",
    label: "text-emerald-600",
    days: "text-emerald-700",
    dot: "bg-emerald-500",
    stroke: "#10b981",
  },
  orange: {
    bar: "border-t-orange-500",
    label: "text-orange-600",
    days: "text-orange-600",
    dot: "bg-orange-500",
    stroke: "#f97316",
  },
  amber: {
    bar: "border-t-amber-500",
    label: "text-amber-600",
    days: "text-amber-600",
    dot: "bg-amber-500",
    stroke: "#f59e0b",
  },
  red: {
    bar: "border-t-red-500",
    label: "text-red-600",
    days: "text-red-600",
    dot: "bg-red-500",
    stroke: "#ef4444",
  },
  purple: {
    bar: "border-t-violet-500",
    label: "text-violet-600",
    days: "text-violet-700",
    dot: "bg-violet-500",
    stroke: "#8b5cf6",
  },
};

const fileKind = (doc) => {
  const name = (doc.original_filename || "").toLowerCase();
  const mime = (doc.mime_type || "").toLowerCase();
  if (mime.includes("pdf") || name.endsWith(".pdf")) return { label: "PDF", chip: "bg-red-600" };
  if (mime.includes("jpeg") || name.endsWith(".jpg") || name.endsWith(".jpeg")) return { label: "JPG", chip: "bg-violet-600" };
  if (mime.includes("png") || name.endsWith(".png")) return { label: "PNG", chip: "bg-orange-600" };
  if (mime.includes("word") || name.endsWith(".doc") || name.endsWith(".docx")) return { label: "DOC", chip: "bg-blue-700" };
  if (mime.includes("sheet") || mime.includes("excel") || name.endsWith(".xls") || name.endsWith(".xlsx")) return { label: "XLS", chip: "bg-emerald-700" };
  if (!doc.original_filename && !doc.file_size_bytes) return null;
  return { label: "FILE", chip: "bg-gray-600" };
};

const classify = (doc) => {
  const hasFile = Boolean(doc.original_filename || doc.file_size_bytes);
  if (!hasFile) return { key: "no_file", label: "NO FILE", tone: "red", days: null };
  if (!doc.expiry_date) return { key: "on_file", label: "ON FILE", tone: "purple", days: null };
  const days = daysBetween(todayYmd(), doc.expiry_date);
  if (days == null) return { key: "on_file", label: "ON FILE", tone: "purple", days: null };
  if (days < 0) return { key: "expired", label: "EXPIRED", tone: "red", days };
  const due = /\b(due|monthly)\b/i.test(`${doc.notes || ""}`);
  if (days <= EXPIRING_WINDOW && due) return { key: "due", label: "DUE", tone: "amber", days };
  if (days <= EXPIRING_WINDOW) return { key: "expiring", label: "EXPIRING", tone: "orange", days };
  return { key: "current", label: "CURRENT", tone: "green", days };
};

const detailLine = (doc, status) => {
  if (status.key === "on_file") {
    if (isReviewNote(doc.notes)) return doc.notes;
    return doc.notes ? "Current version" : "On file";
  }
  return doc.notes || doc.original_filename || "";
};

const Donut = ({ segments, total }) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const parts = segments.filter((s) => s.value > 0 && total > 0);
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
      <circle cx="38" cy="38" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
      {parts.map((s) => {
        const len = (s.value / total) * c;
        const node = (
          <circle
            key={s.key}
            cx="38"
            cy="38"
            r={r}
            fill="none"
            stroke={s.stroke}
            strokeWidth="9"
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 38 38)"
          />
        );
        offset += len;
        return node;
      })}
      <text x="38" y="43" textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">
        {total}
      </text>
    </svg>
  );
};

const VaultCard = ({ doc, onOpen, onEdit, onDelete, canManage }) => {
  const status = classify(doc);
  const tone = TONES[status.tone];
  const kind = fileKind(doc);
  return (
    <article className={`flex flex-col rounded-xl border border-gray-200 border-t-4 ${tone.bar} bg-white shadow-sm min-h-[210px]`}>
      <button type="button" onClick={onOpen} className="flex-1 text-left px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-[11px] font-bold tracking-wide ${tone.label}`}>{status.label}</span>
          <span className="flex items-center gap-2 shrink-0">
            {doc.is_confidential && <ConfidentialStamp />}
            <Copy size={14} className="text-gray-300" />
          </span>
        </div>
        <h3 className="mt-1 text-[15px] font-semibold leading-snug text-gray-900">{doc.title}</h3>
        {doc.category?.name && (
          <p className="mt-0.5 text-[10px] font-semibold tracking-[0.08em] text-gray-400 uppercase">{doc.category.name}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">Expiry</p>
        <p className={`mt-0.5 text-xl font-bold leading-tight ${doc.expiry_date ? tone.days : "text-gray-400"}`}>
          {doc.expiry_date ? formatExpiryDate(doc.expiry_date) : "No expiry date"}
        </p>
        {doc.expiry_date && (
          <>
            <p className="mt-2 text-xs text-gray-500">Duration</p>
            <p className="text-sm font-semibold text-gray-800">{formatExpiryDuration(doc.expiry_date, doc.created_at)}</p>
          </>
        )}
        {status.key === "on_file" && <p className="mt-1 text-sm font-semibold text-violet-700">{detailLine(doc, status)}</p>}
        <div className="mt-3 flex items-center gap-2 min-w-0">
          {kind && (
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${kind.chip}`}>{kind.label}</span>
          )}
          {status.key !== "on_file" && (
            <span className="truncate text-xs text-gray-500">{detailLine(doc, status)}</span>
          )}
        </div>
      </button>
      {canManage && (
        <div className="flex items-center gap-2 px-4 pb-3">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Pencil size={12} className="inline mr-1 -mt-0.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 size={12} className="inline mr-1 -mt-0.5" />
            Delete
          </button>
        </div>
      )}
    </article>
  );
};

const DocumentVaultListPage = () => {
  const role = useVaultRole();
  const navigate = useNavigate();
  const base = role === "owner" ? "/owner" : "/director";

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadCategoryId, setUploadCategoryId] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [shelvesOpen, setShelvesOpen] = useState(false);
  const [shelfId, setShelfId] = useState("");
  const [accessFilter, setAccessFilter] = useState("all");

  const { categories, isLoading: catsLoading } = useDocumentVaultCategories(role);
  const { documents, pagination, isLoading, isError, refetch } = useDocumentVaultList(role, { per_page: 100 });
  const { remove, isPending: isDeleting } = useDeleteDocumentVault(role);

  const orderedDocuments = useMemo(() => {
    const rank = (doc) => {
      const status = classify(doc);
      const title = (doc.title || "").toLowerCase();
      if (status.key === "expired") return [0, status.days ?? 0, title];
      if (status.days != null) return [1, status.days, title];
      if (status.key === "no_file") return [2, 0, title];
      return [3, 0, title];
    };
    const compare = (a, b) => {
      const left = rank(a);
      const right = rank(b);
      for (let i = 0; i < left.length; i += 1) {
        if (left[i] < right[i]) return -1;
        if (left[i] > right[i]) return 1;
      }
      return 0;
    };
    const visible = documents.filter((doc) => {
      if (shelfId && String(doc.category?.id || "") !== String(shelfId)) return false;
      if (role === "owner" && accessFilter === "confidential" && !doc.is_confidential) return false;
      if (role === "owner" && accessFilter === "public" && doc.is_confidential) return false;
      return true;
    });
    return [...visible].sort(compare);
  }, [documents, shelfId, accessFilter, role]);

  const counts = useMemo(() => {
    const tally = { current: 0, expiring: 0, expired: 0, no_file: 0, on_file: 0, total: documents.length };
    documents.forEach((doc) => {
      const key = classify(doc).key;
      if (key === "due") tally.expiring += 1;
      else if (tally[key] != null) tally[key] += 1;
    });
    return tally;
  }, [documents]);

  const legendParts = [
    { key: "current", value: counts.current, stroke: TONES.green.stroke },
    { key: "expiring", value: counts.expiring, stroke: TONES.orange.stroke },
    { key: "expired", value: counts.expired + counts.no_file, stroke: TONES.red.stroke },
    { key: "on_file", value: counts.on_file, stroke: TONES.purple.stroke },
  ];

  const attention = [counts.expired ? `${counts.expired} expired` : null, counts.no_file ? `${counts.no_file} no file` : null]
    .filter(Boolean)
    .join(" · ");

  const openUpload = (categoryId = "") => {
    setUploadCategoryId(categoryId ? String(categoryId) : "");
    setUploadOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">
            OwnerPulse · Document Vault · The Shelf
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">File, delete, and the tracking rule</h1>
          <p className="mt-1 text-sm text-gray-500">What has a date on one shelf — and what’s about to run out.</p>
        </div>
        <button
          type="button"
          onClick={() => setShelvesOpen((v) => !v)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Manage shelves
        </button>
      </div>

      {shelvesOpen && (
        <Card className="p-4">
          <p className="text-sm font-semibold text-gray-900">Shelves</p>
          <p className="mt-1 text-xs text-gray-500">The list stays in expiry order. Pick a shelf to narrow it, or add a document.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {catsLoading && <Skeleton className="h-8 w-40" />}
            <button
              type="button"
              onClick={() => setShelfId("")}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${!shelfId ? "border-[#1E3A5F] bg-[#1E3A5F] text-white" : "border-gray-200 bg-white text-gray-700"}`}
            >
              All shelves
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setShelfId(String(c.id))}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${String(shelfId) === String(c.id) ? "border-[#1E3A5F] bg-[#1E3A5F] text-white" : "border-gray-200 bg-white text-gray-700"}`}
              >
                {c.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => openUpload()}
              className="rounded-full bg-[#1E3A5F] px-3 py-1 text-xs font-semibold text-white"
            >
              Add document
            </button>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Donut segments={legendParts} total={counts.total} />
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${TONES.green.dot}`} />
            <span><strong>{counts.current}</strong> current</span>
          </li>
          <li className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${TONES.orange.dot}`} />
            <span><strong>{counts.expiring}</strong> expiring ≤{EXPIRING_WINDOW}d</span>
          </li>
          <li className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${TONES.red.dot}`} />
            <span><strong>{attention || "0 expired"}</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${TONES.purple.dot}`} />
            <span><strong>{counts.on_file}</strong> stored only</span>
          </li>
        </ul>
      </div>

      {role === "owner" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">Show</span>
          {[
            { id: "all", label: "All" },
            { id: "confidential", label: "Confidential only" },
            { id: "public", label: "Public only" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setAccessFilter(option.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${accessFilter === option.id ? "border-red-700 bg-red-700 text-white" : "border-gray-200 bg-white text-gray-700"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-6 text-center text-sm text-red-600">
          Could not load documents.{" "}
          <button type="button" onClick={() => refetch()} className="underline font-semibold">
            Retry
          </button>
        </Card>
      ) : orderedDocuments.length === 0 ? (
        <Card className="p-10 text-center text-sm text-gray-500">
          Nothing on this shelf yet.{" "}
          <button type="button" onClick={() => openUpload(shelfId)} className="font-semibold text-[#1E3A5F] underline">
            Add a document
          </button>
        </Card>
      ) : (
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.08em] text-gray-400 uppercase">
            Soonest expiry first
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {orderedDocuments.map((doc) => (
              <VaultCard
                key={doc.id}
                doc={doc}
                canManage
                onOpen={() => navigate(`${base}/document-vault/${doc.id}`)}
                onEdit={() => setEditing(doc)}
                onDelete={() => setDeleting(doc)}
              />
            ))}
          </div>
          {pagination?.total > documents.length && (
            <p className="mt-3 text-xs text-gray-400">Showing {documents.length} of {pagination.total} documents.</p>
          )}
        </div>
      )}

      <div className="grid gap-4 border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-500 md:grid-cols-3">
        <p className="md:border-r md:border-gray-200 md:pr-4">
          <span className="font-semibold text-gray-700">Edit / Delete on every card you can change.</span> Edit changes the title, shelf, file, and expiry. Delete asks you to confirm, then removes the file.
        </p>
        <p className="md:border-r md:border-gray-200 md:pr-4">
          <span className="font-semibold text-violet-700">Purple “On file” cards</span> have no expiry date. Every card shows the expiry as month/day/year, or “No expiry date”. Duration is that same month/day/year span, from the day the file was added through the expiry.
        </p>
        <p>
          <span className="font-semibold text-gray-700">Shelves are the categories.</span> Use Manage shelves to show one shelf. The cards stay in expiry order.
        </p>
      </div>

      <DocumentVaultUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        role={role}
        categories={categories}
        initialCategoryId={uploadCategoryId}
        onSuccess={() => setUploadOpen(false)}
      />
      <DocumentVaultEditModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        role={role}
        categories={categories}
        document={editing}
      />
      <DeleteConfirmationModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          await remove(deleting.id);
          setDeleting(null);
        }}
        title="Delete document"
        itemName={deleting?.title}
        isLoading={isDeleting}
      />
    </motion.div>
  );
};

export default DocumentVaultListPage;
