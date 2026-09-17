import { axiosPrivate } from "@/lib/axios.private";
import { ownerMaintenanceService } from "@/services/owner-service/maintenance.service";
import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// get all owner maintenance list — infinite scroll
export const useGetOwnerMaintenanceList = (params) => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        isLoading: isMaintenanceListLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["owner-maintenance-list", params],
        queryFn: ({ pageParam }) =>
            ownerMaintenanceService.get_maintenance_list(axiosInstance, { ...params, page: pageParam, per_page: 50 }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.pagination || lastPage?.data?.pagination;
            if (!pagination) return undefined;
            const current = Number(pagination.current_page);
            const last = Number(pagination.last_page);
            return current < last ? current + 1 : undefined;
        },
        enabled: params !== undefined,
    });

    // Flatten pages into unified shape consumed by the page component
    const firstPage = data?.pages?.[0]?.data;
    const allRequests = data?.pages?.flatMap((page) => page?.data?.requests || []) || [];
    const maintenanceData = firstPage
        ? { summary: firstPage.summary, requests: allRequests }
        : undefined;

    return {
        maintenanceData,
        isMaintenanceListLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    };
};

// update owner maintenance status
export const useUpdateOwnerMaintenanceStatus = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: updateOwnerMaintenanceStatus,
        isPending: isUpdateOwnerMaintenanceStatusPending,
        isSuccess: isUpdateOwnerMaintenanceStatusSuccess,
        isError: isUpdateOwnerMaintenanceStatusError,
    } = useMutation({
        mutationKey: ["owner-maintenance-status-change"],
        mutationFn: ({ maintenance_id, data }) => ownerMaintenanceService.status_change(axiosInstance, maintenance_id, data),
        onSuccess: (data) => {
            toast.success(data?.message || "Maintenance status updated successfully");
            queryClient.invalidateQueries({ queryKey: ["director-maintenance-list"] });
            queryClient.invalidateQueries({ queryKey: ["owner-maintenance-list"] });
            queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update maintenance status");
        }
    });

    return {
        updateOwnerMaintenanceStatus,
        isUpdateOwnerMaintenanceStatusPending,
        isUpdateOwnerMaintenanceStatusSuccess,
        isUpdateOwnerMaintenanceStatusError,
    };
};

// Mark maintenance as complete
export const useCompleteOwnerMaintenance = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: completeMaintenance,
        isPending,
    } = useMutation({
        mutationKey: ["owner-maintenance-complete"],
        mutationFn: ({ id, data }) => ownerMaintenanceService.mark_complete(axiosInstance, id, data),
        onSuccess: (data) => {
            toast.success(data?.message || "Maintenance request marked as completed.");
            queryClient.invalidateQueries({ queryKey: ["director-maintenance-list"] });
            queryClient.invalidateQueries({ queryKey: ["owner-maintenance-list"] });
            queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to complete maintenance request");
        }
    });

    return { completeMaintenance, isPending };
};

// Update maintenance details
export const useUpdateOwnerMaintenance = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: updateMaintenance,
        isPending,
    } = useMutation({
        mutationKey: ["owner-maintenance-update"],
        mutationFn: ({ id, data }) => ownerMaintenanceService.update_maintenance(axiosInstance, id, data),
        onSuccess: (data) => {
            toast.success(data?.message || "Maintenance request updated successfully.");
            queryClient.invalidateQueries({ queryKey: ["director-maintenance-list"] });
            queryClient.invalidateQueries({ queryKey: ["owner-maintenance-list"] });
            queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update maintenance request");
        }
    });

    return { updateMaintenance, isPending };
};

// Delete maintenance ticket
export const useDeleteOwnerMaintenance = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: deleteMaintenance,
        isPending,
    } = useMutation({
        mutationKey: ["owner-maintenance-delete"],
        mutationFn: (id) => ownerMaintenanceService.delete_maintenance(axiosInstance, id),
        onSuccess: (data) => {
            toast.success(data?.message || "Maintenance request deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["director-maintenance-list"] });
            queryClient.invalidateQueries({ queryKey: ["owner-maintenance-list"] });
            queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete maintenance request");
        }
    });

    return { deleteMaintenance, isPending };
};
