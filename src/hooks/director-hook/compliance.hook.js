import { axiosPrivate } from "@/lib/axios.private";
import { compliancesService } from "@/services/compliances.service";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── Director Compliance Overview Hook ───
export const useGetDirectorComplianceOverview = (params) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ["director-compliance-overview", params],
        queryFn: () => compliancesService.overview_director(axiosInstance, params),
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    return {
        overviewData: data?.data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    };
};

// ─── Director Compliance Items List Hook ───
export const useGetDirectorComplianceItems = (params) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ["director-compliance-items", params],
        queryFn: () => compliancesService.compliance_items_director(axiosInstance, params),
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    return {
        complianceItems: data?.data || [],
        pagination: data?.pagination,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    };
};

// ─── Add Compliance Item Mutation for Director ───
export const useAddDirectorComplianceItem = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: addComplianceItem, isPending, isError, error } = useMutation({
        mutationKey: ["add-director-compliance-item"],
        mutationFn: (body) => compliancesService.add_compliance_item(axiosInstance, body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["director-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-items"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            toast.success(data?.message ?? "Compliance item created successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to create compliance item");
        },
    });

    return { addComplianceItem, isPending, isError, error };
};

// ─── Update Compliance Item Mutation for Director ───
export const useUpdateDirectorComplianceItem = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: updateComplianceItem, isPending, isError, error } = useMutation({
        mutationKey: ["update-director-compliance-item"],
        mutationFn: ({ id, data }) => compliancesService.update_compliance_item(axiosInstance, id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["director-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-items"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            toast.success(data?.message ?? "Compliance item updated successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to update compliance item");
        },
    });

    return { updateComplianceItem, isPending, isError, error };
};

// ─── Delete Compliance Item Mutation for Director ───
export const useDeleteDirectorComplianceItem = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: deleteComplianceItem, isPending, isError, error } = useMutation({
        mutationKey: ["delete-director-compliance-item"],
        mutationFn: (id) => compliancesService.delete_compliance_item(axiosInstance, id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["director-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-items"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            toast.success(data?.message ?? "Compliance item deleted successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to delete compliance item");
        },
    });

    return { deleteComplianceItem, isPending, isError, error };
};

// ─── Add Log Note Mutation for Director ───
export const useAddDirectorComplianceLogNote = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: addLogNote, isPending, isError, error } = useMutation({
        mutationKey: ["add-director-compliance-log"],
        mutationFn: ({ item_id, note }) =>
            compliancesService.log_note(axiosInstance, item_id, typeof note === "string" ? { note } : note),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["director-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-items"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            toast.success(data?.message ?? "Operational log note added successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to add log note");
        },
    });

    return { addLogNote, isPending, isError, error };
};

// ─── Toggle Checklist Mutation for Director ───
export const useToggleDirectorComplianceChecklist = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: toggleChecklist, isPending, isError, error } = useMutation({
        mutationKey: ["toggle-director-compliance-checklist"],
        mutationFn: ({ checklist_id, data }) =>
            compliancesService.checklist_toggle(axiosInstance, checklist_id, data || {}),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["director-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-items"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            toast.success(data?.message ?? "Checklist item status updated successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to update checklist item");
        },
    });

    return { toggleChecklist, isPending, isError, error };
};
