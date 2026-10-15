import { axiosPrivate } from "@/lib/axios.private";
import { collectionsService } from "@/services/collections.service";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { hasFieldErrors } from "@/lib/api-errors";

const HISTORY_PER_PAGE = 20;

// Collections card — only fetched when the overview did not carry it
export const useGetCollections = (role, { weeks = 12, enabled = true } = {}) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["collections", role, "card", weeks],
        queryFn: () => collectionsService.get_collections(axiosInstance, role, weeks),
        enabled: enabled && !!role,
    });

    return { collections: data?.data, isLoading, isError, refetch };
};

// every past week, newest first
export const useGetCollectionsHistory = (role, enabled = true) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["collections", role, "history"],
        queryFn: ({ pageParam }) =>
            collectionsService.get_history(axiosInstance, role, { page: pageParam, per_page: HISTORY_PER_PAGE }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.pagination;
            if (!pagination) return undefined;
            const current = Number(pagination.current_page);
            const last = Number(pagination.last_page);
            return current < last ? current + 1 : undefined;
        },
        enabled: enabled && !!role,
    });

    const entries = (data?.pages || []).flatMap((page) => (Array.isArray(page?.data) ? page.data : []));

    return { entries, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage };
};

// POST a week (new or existing) or PUT an entry by id. 422 field errors are shown by the form.
export const useSaveCollections = (role) => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const { mutateAsync: saveCollections, isPending } = useMutation({
        mutationKey: ["save-collections", role],
        mutationFn: ({ id, payload }) =>
            id
                ? collectionsService.update_entry(axiosInstance, role, id, payload)
                : collectionsService.save_week(axiosInstance, role, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Collections saved");
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
            queryClient.invalidateQueries({ queryKey: ["director-overview"] });
        },
        onError: (error) => {
            if (hasFieldErrors(error)) return;
            toast.error(error?.response?.data?.message || "Failed to save collections");
        },
    });

    return { saveCollections, isPending };
};
