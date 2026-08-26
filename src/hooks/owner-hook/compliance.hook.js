import { axiosPrivate } from "@/lib/axios.private";
import { compliancesService } from "@/services/compliances.service";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── Owner Compliance Overview Hook ───
export const useGetOwnerComplianceOverview = (params) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ["owner-compliance-overview", params],
        queryFn: () => compliancesService.overview_owner(axiosInstance, params),
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

// ─── Owner Compliance Items List Hook ───
export const useGetOwnerComplianceItems = (params) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ["owner-compliance-items", params],
        queryFn: () => compliancesService.compliance_items(axiosInstance, params),
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

// ─── Owner Pulse Impact Hook ───
export const useGetOwnerPulseImpact = (params) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ["owner-compliance-pulse-impact", params],
        queryFn: () => compliancesService.pulse_impact(axiosInstance, params),
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    return {
        pulseImpactData: data?.data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    };
};

// ─── Add Compliance Item Mutation ───
export const useAddOwnerComplianceItem = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: addComplianceItem, isPending, isError, error } = useMutation({
        mutationKey: ["add-compliance-item"],
        mutationFn: (body) => compliancesService.add_compliance_item(axiosInstance, body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-pulse-impact"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-items"] });
            toast.success(data?.message ?? "Compliance item created successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to create compliance item");
        },
    });

    return { addComplianceItem, isPending, isError, error };
};

// ─── Update Compliance Item Mutation ───
export const useUpdateOwnerComplianceItem = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: updateComplianceItem, isPending, isError, error } = useMutation({
        mutationKey: ["update-compliance-item"],
        mutationFn: ({ id, data }) => compliancesService.update_compliance_item(axiosInstance, id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-pulse-impact"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-items"] });
            toast.success(data?.message ?? "Compliance item updated successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to update compliance item");
        },
    });

    return { updateComplianceItem, isPending, isError, error };
};

// ─── Delete Compliance Item Mutation ───
export const useDeleteOwnerComplianceItem = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: deleteComplianceItem, isPending, isError, error } = useMutation({
        mutationKey: ["delete-compliance-item"],
        mutationFn: (id) => compliancesService.delete_compliance_item(axiosInstance, id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-pulse-impact"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-items"] });
            toast.success(data?.message ?? "Compliance item deleted successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to delete compliance item");
        },
    });

    return { deleteComplianceItem, isPending, isError, error };
};

// ─── Add Log Note Mutation ───
export const useAddOwnerComplianceLogNote = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: addLogNote, isPending, isError, error } = useMutation({
        mutationKey: ["add-compliance-log"],
        mutationFn: ({ item_id, note }) =>
            compliancesService.log_note(axiosInstance, item_id, typeof note === "string" ? { note } : note),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-items"] });
            toast.success(data?.message ?? "Operational log note added successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to add log note");
        },
    });

    return { addLogNote, isPending, isError, error };
};

// ─── Toggle Checklist Mutation ───
export const useToggleOwnerComplianceChecklist = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: toggleChecklist, isPending, isError, error } = useMutation({
        mutationKey: ["toggle-compliance-checklist"],
        mutationFn: ({ checklist_id, data }) =>
            compliancesService.checklist_toggle(axiosInstance, checklist_id, data || {}),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-pulse-impact"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-overview"] });
            queryClient.invalidateQueries({ queryKey: ["director-compliance-items"] });
            toast.success(data?.message ?? "Checklist item status updated successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to update checklist item");
        },
    });

    return { toggleChecklist, isPending, isError, error };
};

// ─── Insurance Shopping Hooks ───
export const useGetInsuranceShopping = () => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ["owner-insurance-shopping"],
        queryFn: () => compliancesService.insurance_Shopping(axiosInstance),
        staleTime: 5 * 60 * 1000,
    });

    return {
        insuranceData: data?.data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    };
};

export const useAddInsuranceQuote = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: addQuote, isPending, isError, error } = useMutation({
        mutationKey: ["add-insurance-quote"],
        mutationFn: (body) => compliancesService.add_quotes(axiosInstance, body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["owner-insurance-shopping"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            toast.success(data?.message ?? "Insurance quote added successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to add insurance quote");
        },
    });

    return { addQuote, isPending, isError, error };
};

export const useSelectInsuranceQuote = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: selectQuote, isPending, isError, error } = useMutation({
        mutationKey: ["select-insurance-quote"],
        mutationFn: (quoteId) => compliancesService.select_quotes(axiosInstance, quoteId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["owner-insurance-shopping"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            toast.success(data?.message ?? "Quote selected successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to select quote");
        },
    });

    return { selectQuote, isPending, isError, error };
};

export const useCompleteInsuranceShopping = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: completeInsuranceShopping, isPending, isError, error } = useMutation({
        mutationKey: ["complete-insurance-shopping"],
        mutationFn: (body) => compliancesService.complete_insurance_shopping(axiosInstance, body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["owner-insurance-shopping"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-items"] });
            queryClient.invalidateQueries({ queryKey: ["owner-compliance-overview"] });
            toast.success(data?.message ?? "Insurance shopping process completed");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to complete insurance shopping");
        },
    });

    return { completeInsuranceShopping, isPending, isError, error };
};
