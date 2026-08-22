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
            queryClient.invalidateQueries(["director-maintenance-list"]);
            queryClient.invalidateQueries(["owner-maintenance-list"]);
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
