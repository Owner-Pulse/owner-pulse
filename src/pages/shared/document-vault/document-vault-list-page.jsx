import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { FileStack, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentVaultCategories, useDocumentVaultList } from "@/hooks/document-vault.hook";
import { formatDate } from "@/lib/datetime";
import { ExpiryBadge } from "./components/ExpiryBadge";
import DocumentVaultUploadModal from "./document-vault-upload-modal";

export const useVaultRole = () => (useLocation().pathname.startsWith("/owner") ? "owner" : "director");

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const DocumentVaultListPage = () => {
  const role = useVaultRole();
  const navigate = useNavigate();
  const base = role === "owner" ? "/owner" : "/director";

  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get("filter") === "expiring" ? "expiring" : "all");
  const [uploadOpen, setUploadOpen] = useState(false);

  const params = useMemo(() => {
    const p = {};
    if (categoryId) p.category_id = categoryId;
    if (search.trim()) p.search = search.trim();
    if (filter === "expired") p.expired = 1;
    if (filter === "expiring") p.expiring_within = 30;
    return p;
  }, [categoryId, search, filter]);

  const { categories, isLoading: catsLoading } = useDocumentVaultCategories(role);
  const { documents, isLoading, isError, refetch } = useDocumentVaultList(role, params);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileStack className="text-[#AE4A3E]" size={26} /> Document Vault
          </h1>
          <p className="text-sm text-gray-500 mt-1">Licenses, inspections, insurance, staff certifications, and policies.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-[#1E3A5F] hover:bg-[#162e4a]">
          <Plus size={16} className="mr-1.5" /> Upload document
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryId("")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${!categoryId ? "bg-[#1E3A5F] text-white ring-[#1E3A5F]" : "bg-white text-gray-600 ring-gray-200"}`}
        >
          All categories
        </button>
        {!catsLoading &&
          categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(String(c.id))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${String(categoryId) === String(c.id) ? "bg-[#1E3A5F] text-white ring-[#1E3A5F]" : "bg-white text-gray-600 ring-gray-200"}`}
            >
              {c.name}
            </button>
          ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or notes..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
          />
        </div>
        {[
          { id: "all", label: "All" },
          { id: "expiring", label: "Expiring ≤30d" },
          { id: "expired", label: "Expired" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === f.id ? "bg-[#AE4A3E]/10 text-[#8A362C]" : "text-gray-500 hover:bg-gray-50"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-6 text-center text-sm text-red-600">
          Could not load documents.{" "}
          <button type="button" onClick={() => refetch()} className="underline font-semibold">
            Retry
          </button>
        </Card>
      ) : documents.length === 0 ? (
        <Card className="p-10 text-center text-gray-500 text-sm">No documents match your filters.</Card>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`${base}/document-vault/${doc.id}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`${base}/document-vault/${doc.id}`)}
              className="p-4 flex flex-wrap items-center gap-3 cursor-pointer hover:ring-2 hover:ring-[#1E3A5F]/20 transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{doc.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {doc.category?.name || "—"}
                  {doc.expiry_date ? ` · Expires ${formatDate(doc.expiry_date)}` : ""}
                </p>
              </div>
              <ExpiryBadge status={doc.expiry_status} />
            </Card>
          ))}
        </div>
      )}

      <DocumentVaultUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        role={role}
        categories={categories}
        onSuccess={(id) => {
          setUploadOpen(false);
          navigate(`${base}/document-vault/${id}`);
        }}
      />
    </motion.div>
  );
};

export default DocumentVaultListPage;
