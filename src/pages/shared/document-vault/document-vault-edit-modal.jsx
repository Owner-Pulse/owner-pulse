import React from "react";
import { useUpdateDocumentVault } from "@/hooks/document-vault.hook";
import VaultDocumentForm, { isReviewNote, REVIEW_CYCLES } from "./vault-document-form";

const monthsFromNotes = (notes) => {
  if (/^review yearly$/i.test(notes || "")) return "12";
  const match = String(notes || "").match(/^review every (\d+) months$/i);
  const months = match?.[1];
  return REVIEW_CYCLES.some((c) => c.months === months) ? months : "12";
};

const initialFromDocument = (document) => {
  const notes = document?.notes || "";
  if (isReviewNote(notes)) {
    return {
      category_id: String(document.category?.id || ""),
      title: document.title || "",
      intent: "track",
      trackBy: "review",
      expiry_date: "",
      reviewMonths: monthsFromNotes(notes),
      keptNotes: notes,
      access: document?.is_confidential ? "confidential" : "public",
    };
  }
  if (document?.expiry_date) {
    return {
      category_id: String(document.category?.id || ""),
      title: document.title || "",
      intent: "track",
      trackBy: "expiry",
      expiry_date: document.expiry_date,
      reviewMonths: "12",
      keptNotes: notes,
      access: document?.is_confidential ? "confidential" : "public",
    };
  }
  return {
    category_id: String(document?.category?.id || ""),
    title: document?.title || "",
    intent: "store",
    trackBy: "expiry",
    expiry_date: "",
    reviewMonths: "12",
    keptNotes: notes,
    access: document?.is_confidential ? "confidential" : "public",
  };
};

const DocumentVaultEditModal = ({ isOpen, onClose, role, categories, document }) => {
  const { update, isPending, fieldErrors } = useUpdateDocumentVault(role);

  if (!isOpen || !document) return null;

  const submit = async (values) => {
    const fd = new FormData();
    fd.append("category_id", values.category_id);
    fd.append("title", values.title);
    fd.append("expiry_date", values.expiry_date || "");
    fd.append("notes", values.notes || "");
    if (values.file) fd.append("file", values.file);
    if (role === "owner") fd.append("is_confidential", values.is_confidential ? "1" : "0");
    try {
      await update({ id: document.id, formData: fd });
      onClose();
    } catch {
      /* field errors */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <VaultDocumentForm
          heading="Edit document"
          categories={categories}
          requireFile={false}
          isPending={isPending}
          fieldErrors={fieldErrors}
          onCancel={onClose}
          showAccess={role === "owner"}
          onSubmit={submit}
          initial={initialFromDocument(document)}
        />
      </div>
    </div>
  );
};

export default DocumentVaultEditModal;
