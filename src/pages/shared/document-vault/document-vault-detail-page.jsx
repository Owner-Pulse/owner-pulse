import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import {
  useDeleteDocumentVault,
  useDocumentVaultCategories,
  useDocumentVaultDetail,
  useUpdateDocumentVault,
} from "@/hooks/document-vault.hook";
import { useGetUser } from "@/hooks/auth/user-details.hook";
import { formatDate } from "@/lib/datetime";
import { ExpiryBadge } from "./components/ExpiryBadge";
import ConfidentialStamp from "./components/ConfidentialStamp";
import { VaultFilePanel } from "./components/VaultFilePanel";
import { useVaultRole } from "./document-vault-list-page";
import { FieldError } from "@/pages/shared/weekly-reports/components/FormBits";

const DocumentVaultDetailPage = () => {
  const { id } = useParams();
  const role = useVaultRole();
  const base = role === "owner" ? "/owner" : "/director";
  const navigate = useNavigate();
  const { user } = useGetUser();

  const { document, isLoading, isError, refetch } = useDocumentVaultDetail(role, id);
  const { categories } = useDocumentVaultCategories(role);
  const { update, isPending, fieldErrors } = useUpdateDocumentVault(role);
  const { remove, isPending: isDeleting } = useDeleteDocumentVault(role);

  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (document) {
      setForm({
        category_id: String(document.category?.id || ""),
        title: document.title || "",
        expiry_date: document.expiry_date || "",
        notes: document.notes || "",
        access: document.is_confidential ? "confidential" : "public",
        file: null,
      });
    }
  }, [document]);

  const canEdit = user?.role === "owner" || document?.uploaded_by?.id === user?.id;
  const canDelete = canEdit;

  if (isLoading || !form) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !document) {
    return (
      <Card className="p-8 text-center text-sm text-red-600">
        Document not found.{" "}
        <button type="button" className="underline" onClick={() => refetch()}>
          Retry
        </button>
      </Card>
    );
  }

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("category_id", form.category_id);
    fd.append("title", form.title);
    fd.append("expiry_date", form.expiry_date || "");
    fd.append("notes", form.notes || "");
    if (role === "owner") fd.append("is_confidential", form.access === "confidential" ? "1" : "0");
    if (form.file) fd.append("file", form.file);
    try {
      await update({ id, formData: fd });
      setEditing(false);
    } catch {
      /* errors on fields */
    }
  };

  const onDelete = async () => {
    await remove(id);
    navigate(`${base}/document-vault`);
  };

  return (
    <div className="space-y-4 pb-10">
      <Link to={`${base}/document-vault`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A5F] hover:underline">
        <ArrowLeft size={14} /> Back to Document Vault
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{document.title}</h1>
            {document.is_confidential && <ConfidentialStamp />}
            <ExpiryBadge status={document.expiry_status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {document.category?.name}
            {document.expiry_date ? ` · Expires ${formatDate(document.expiry_date)}` : " · No expiry date"}
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
              <Pencil size={14} className="mr-1" /> {editing ? "Cancel edit" : "Edit"}
            </Button>
          )}
          {canDelete && (
            <Button variant="outline" size="sm" className="text-red-700 border-red-200" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={14} className="mr-1" /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card className="p-4 sm:p-5 space-y-4">
          {editing ? (
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldErrors.category_id} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <FieldError message={fieldErrors.title} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Expiry date</label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <FieldError message={fieldErrors.expiry_date} />
              </div>
              {role === "owner" && (
                <div>
                  <label className="text-xs font-semibold text-gray-600">Document access</label>
                  <select
                    value={form.access}
                    onChange={(e) => setForm((f) => ({ ...f, access: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="public">Public document</option>
                    <option value="confidential">Confidential document</option>
                  </select>
                  <p className="mt-1 text-[11px] text-gray-400">Confidential stays on the Owner portal only.</p>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-600">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <FieldError message={fieldErrors.notes} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Replace file (optional)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                  className="mt-1 w-full text-sm"
                />
                <FieldError message={fieldErrors.file} />
              </div>
              <Button type="submit" disabled={isPending} className="bg-[#1E3A5F]">
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </form>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-400">Document access</p>
                <p className="text-sm text-gray-700 mt-1">{document.is_confidential ? "Confidential — Owner only" : "Public"}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-400">Notes</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{document.notes || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-400">Uploaded by</p>
                <p className="text-sm text-gray-700 mt-1">{document.uploaded_by?.name || "—"}</p>
              </div>
              {document.compliance_item_id && (
                <div>
                  <p className="text-[10px] font-semibold uppercase text-gray-400">Compliance item</p>
                  <p className="text-sm text-gray-700 mt-1">Linked (ID {document.compliance_item_id}) — expiry feeds compliance pulse when set.</p>
                </div>
              )}
            </>
          )}
        </Card>

        <VaultFilePanel
          role={role}
          documentId={id}
          mimeType={document.mime_type}
          name={document.original_filename}
          className="min-h-[420px] lg:sticky lg:top-4"
        />
      </div>

      <DeleteConfirmationModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDelete}
        title="Delete document?"
        description="This removes the file from the vault. This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DocumentVaultDetailPage;
