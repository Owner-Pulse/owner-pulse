import React from "react";
import { useUploadDocumentVault } from "@/hooks/document-vault.hook";
import VaultDocumentForm from "./vault-document-form";

const DocumentVaultUploadModal = ({ isOpen, onClose, role, categories, onSuccess, initialCategoryId = "" }) => {
  const { upload, isPending, fieldErrors } = useUploadDocumentVault(role);

  if (!isOpen) return null;

  const submit = async (values) => {
    const fd = new FormData();
    fd.append("category_id", values.category_id);
    fd.append("title", values.title);
    if (values.expiry_date) fd.append("expiry_date", values.expiry_date);
    if (values.notes) fd.append("notes", values.notes);
    if (values.file) fd.append("file", values.file);
    try {
      const res = await upload(fd);
      onSuccess?.(res?.data?.id);
    } catch {
      /* field errors */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <VaultDocumentForm
          categories={categories}
          requireFile
          isPending={isPending}
          fieldErrors={fieldErrors}
          onCancel={onClose}
          onSubmit={submit}
          initial={{
            category_id: initialCategoryId ? String(initialCategoryId) : "",
            title: "",
            intent: "track",
            trackBy: "expiry",
            expiry_date: "",
            reviewMonths: "12",
            keptNotes: "",
          }}
        />
      </div>
    </div>
  );
};

export default DocumentVaultUploadModal;
