import { axiosPrivate } from "@/lib/axios.private";
import { directorWaitlistService } from "@/services";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// GET All Waitlist (infinite scroll)
export const useGetDirectorWaitlistList = (params) => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        isLoading: isWaitlistLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isError,
        error,
    } = useInfiniteQuery({
        queryKey: ["director-waitlist-list", params],
        queryFn: ({ pageParam }) =>
            directorWaitlistService.get_all_waitlist(axiosInstance, { ...params, page: pageParam, per_page: 10 }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.pagination;
            if (!pagination) return undefined;
            const current = Number(pagination.current_page);
            const last = Number(pagination.last_page);
            return current < last ? current + 1 : undefined;
        },
        enabled: params !== undefined,
    });

    // Flatten pages — API returns data.waitlists & data.summary
    const firstPage = data?.pages?.[0]?.data;
    const allWaitlists = data?.pages?.flatMap((page) => page?.data?.waitlists || []) || [];
    const waitlistData = firstPage
        ? { summary: firstPage.summary, waitlists: allWaitlists }
        : undefined;

    return {
        waitlistData,
        isWaitlistLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isError,
        error,
    };
};

// GET Waitlist Show
export const useGetSingleDirectorWaitlist = (id) => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        isLoading: isWaitlistLoading,
        isError,
        error,
        refetch: refetchWaitlist,
    } = useQuery({
        queryKey: ["single-director-waitlist", id],
        queryFn: () => directorWaitlistService.get_single_waitlist(id, axiosInstance),
        enabled: !!id,
    });

    return {
        waitlistData: data?.data,
        isWaitlistLoading,
        isError,
        error,
        refetchWaitlist,
    };
};

// POST Add Waitlist
export const useAddDirectorWaitlist = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: addWaitlist,
        isPending,
        error: apiError,
        isSuccess,
        isError,
    } = useMutation({
        mutationKey: ["add-director-waitlist"],
        mutationFn: (payload) => directorWaitlistService.add_waitlist(axiosInstance, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Successfully added to waitlist");
            queryClient.invalidateQueries({ queryKey: ["director-waitlist-list"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to add to waitlist");
        },
    });

    return {
        addWaitlist,
        isPending,
        apiError,
        isSuccess,
        isError,
    };
};

// POST Update Waitlist
export const useUpdateDirectorWaitlist = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: updateWaitlist,
        isPending,
        error: apiError,
        isSuccess,
        isError,
    } = useMutation({
        mutationKey: ["update-director-waitlist"],
        mutationFn: ({ id, payload }) => directorWaitlistService.update_waitlist(id, payload, axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Waitlist entry updated successfully");
            queryClient.invalidateQueries({ queryKey: ["director-waitlist-list"] });
            queryClient.invalidateQueries({ queryKey: ["single-director-waitlist"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to update waitlist entry");
        },
    });

    return {
        updateWaitlist,
        isPending,
        apiError,
        isSuccess,
        isError,
    };
};

// POST Status Change
export const useChangeDirectorWaitlistStatus = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: changeStatus,
        isPending,
        error: apiError,
        isSuccess,
        isError,
    } = useMutation({
        mutationKey: ["change-director-waitlist-status"],
        mutationFn: ({ id, payload }) => directorWaitlistService.change_status(id, payload, axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Waitlist status changed successfully");
            queryClient.invalidateQueries({ queryKey: ["director-waitlist-list"] });
            queryClient.invalidateQueries({ queryKey: ["single-director-waitlist"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to change status");
        },
    });

    return {
        changeStatus,
        isPending,
        apiError,
        isSuccess,
        isError,
    };
};
