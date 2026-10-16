import { axiosPrivate } from "@/lib/axios.private";
import { documentVaultService } from "@/services/document-vault.service";
import { getFieldErrors, hasFieldErrors } from "@/lib/api-errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const invalidate = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["document-vault"] });
  queryClient.invalidateQueries({ queryKey: ["document-vault-expiring-summary"] });
};

export const useDocumentVaultCategories = (role) => {
  const axiosInstance = axiosPrivate();
  const { data, isLoading } = useQuery({
    queryKey: ["document-vault", role, "categories"],
    queryFn: () => documentVaultService.getCategories(axiosInstance, role),
    enabled: !!role,
  });
  return { categories: data?.data || [], isLoading };
};

export const useDocumentVaultExpiringSummary = (enabled = true) => {
  const axiosInstance = axiosPrivate();
  const { data, isLoading } = useQuery({
    queryKey: ["document-vault-expiring-summary"],
    queryFn: () => documentVaultService.getExpiringSummary(axiosInstance),
    enabled,
  });
  return { summary: data?.data, isLoading };
};

export const useDocumentVaultList = (role, params) => {
  const axiosInstance = axiosPrivate();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["document-vault", role, "list", params],
    queryFn: () => documentVaultService.list(axiosInstance, role, params),
    enabled: !!role,
  });
  return {
    documents: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError,
    refetch,
  };
};

export const useDocumentVaultDetail = (role, id) => {
  const axiosInstance = axiosPrivate();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["document-vault", role, "detail", String(id)],
    queryFn: () => documentVaultService.show(axiosInstance, role, id),
    enabled: !!role && !!id,
  });
  return { document: data?.data, isLoading, isError, refetch };
};

export const useDocumentVaultFile = (role, id, enabled = true) => {
  const axiosInstance = axiosPrivate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["document-vault", role, "file", String(id)],
    queryFn: () => documentVaultService.getFile(axiosInstance, role, id),
    enabled: enabled && !!role && !!id,
    staleTime: 5 * 60 * 1000,
  });
  return { blob: data, isLoading, isError };
};

export const useUploadDocumentVault = (role) => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const mutation = useMutation({
    mutationFn: (formData) => documentVaultService.upload(axiosInstance, role, formData),
    onSuccess: () => {
      toast.success("Document uploaded.");
      invalidate(queryClient);
    },
    onError: (error) => {
      if (!hasFieldErrors(error)) toast.error(error?.response?.data?.message || "Upload failed.");
    },
  });

  return {
    upload: mutation.mutateAsync,
    isPending: mutation.isPending,
    fieldErrors: getFieldErrors(mutation.error),
  };
};

export const useUpdateDocumentVault = (role) => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const mutation = useMutation({
    mutationFn: ({ id, formData }) => documentVaultService.update(axiosInstance, role, id, formData),
    onSuccess: () => {
      toast.success("Document updated.");
      invalidate(queryClient);
    },
    onError: (error) => {
      if (!hasFieldErrors(error)) toast.error(error?.response?.data?.message || "Update failed.");
    },
  });

  return {
    update: mutation.mutateAsync,
    isPending: mutation.isPending,
    fieldErrors: getFieldErrors(mutation.error),
  };
};

export const useDeleteDocumentVault = (role) => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const mutation = useMutation({
    mutationFn: (id) => documentVaultService.remove(axiosInstance, role, id),
    onSuccess: () => {
      toast.success("Document deleted.");
      invalidate(queryClient);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Delete failed.");
    },
  });

  return { remove: mutation.mutateAsync, isPending: mutation.isPending };
};
