import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadDocumentVault } from "@/hooks/document-vault.hook";
import { FieldError } from "@/pages/shared/weekly-reports/components/FormBits";

const empty = {
  category_id: "",
  title: "",
  expiry_date: "",
  notes: "",
  file: null,
};

const DocumentVaultUploadModal = ({ isOpen, onClose, role, categories, onSuccess }) => {
  const [form, setForm] = useState(empty);
  const { upload, isPending, fieldErrors } = useUploadDocumentVault(role);

  useEffect(() => {
    if (isOpen) setForm(empty);
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("category_id", form.category_id);
    fd.append("title", form.title);
    if (form.expiry_date) fd.append("expiry_date", form.expiry_date);
    if (form.notes) fd.append("notes", form.notes);
    if (form.file) fd.append("file", form.file);

    try {
      const res = await upload(fd);
      onSuccess?.(res?.data?.id);
    } catch {
      /* field errors handled in hook */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Upload document</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
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
              onChange={(e) => set("title", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <FieldError message={fieldErrors.title} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Expiry date (optional)</label>
            <input
              type="date"
              value={form.expiry_date}
              onChange={(e) => set("expiry_date", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <FieldError message={fieldErrors.expiry_date} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <FieldError message={fieldErrors.notes} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">File (PDF, image, Word, Excel — max 20 MB)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
              onChange={(e) => set("file", e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm"
            />
            <FieldError message={fieldErrors.file} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-[#1E3A5F] hover:bg-[#162e4a]">
              {isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentVaultUploadModal;
