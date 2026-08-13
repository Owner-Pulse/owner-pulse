import { axiosPrivate } from "@/lib/axios.private";
import { directorMaintenanceService } from "@/services";
import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// get all director maintenance list (using) — infinite scroll
export const useGetDirectorMaintenanceList = (params) => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        isLoading: isMaintenanceListLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["director-maintenance-list", params],
        queryFn: ({ pageParam }) =>
            directorMaintenanceService.get_maintenance_list(axiosInstance, { ...params, page: pageParam, per_page: 10 }),
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
}

// create director maintenance (using)
export const useCreateDirectorMaintenance = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: createMaintenance,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["create-director-maintenance"],
        mutationFn: (payload) => directorMaintenanceService.create_maintenance(axiosInstance, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Maintenance request created successfully");
            queryClient.invalidateQueries(["director-maintenance-list"]);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to create maintenance request");
        }
    });

    return {
        createMaintenance,
        isPending,
        apiError,
        isSuccess,
        isError
    };
}

// get single director maintenance (not using)
export const useGetSingleDirectorMaintenance = (id) => {
    const axiosInstance = axiosPrivate();

    const {
        data, isLoading: isMaintenanceLoading, refetch: refetchMaintenance
    } = useQuery({
        queryKey: ["single-director-maintenance", id],
        queryFn: () => directorMaintenanceService.get_single_maintenance(id, axiosInstance),
        enabled: !!id,
    });

    return {
        maintenanceData: data?.data,
        isMaintenanceLoading,
        refetchMaintenance
    };
}

// update director maintenance (using)
export const useUpdateDirectorMaintenance = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: updateMaintenance,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["update-director-maintenance"],
        mutationFn: ({ id, payload }) => directorMaintenanceService.update_maintenance(id, payload, axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Maintenance request updated successfully");
            queryClient.invalidateQueries(["director-maintenance-list"]);
            queryClient.invalidateQueries(["single-director-maintenance"]);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to update maintenance request");
        }
    });

    return { updateMaintenance, isPending, apiError, isSuccess, isError };
}

// delete director maintenance (using)
export const useDeleteDirectorMaintenance = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: deleteMaintenance,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["delete-director-maintenance"],
        mutationFn: (id) => directorMaintenanceService.delete_maintenance(id, axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Maintenance request deleted successfully");
            queryClient.invalidateQueries(["director-maintenance-list"]);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to delete maintenance request");
        }
    });

    return { deleteMaintenance, isPending, apiError, isSuccess, isError };
}
