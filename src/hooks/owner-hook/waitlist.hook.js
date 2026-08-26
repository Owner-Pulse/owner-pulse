import { axiosPrivate } from "@/lib/axios.private";
import { ownerWaitlistService } from "@/services/owner-service/waitlist.service";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

// GET All Owner Waitlist (infinite scroll)
export const useGetOwnerWaitlistList = (params) => {
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
        queryKey: ["owner-waitlist-list", params],
        queryFn: ({ pageParam }) =>
            ownerWaitlistService.get_all_waitlist(axiosInstance, { ...params, page: pageParam, per_page: 50 }),
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

    // Flatten pages — API returns data.waitlists & data.summary
    const firstPage = data?.pages?.[0]?.data;
    const allWaitlists = data?.pages?.flatMap((page) => page?.data?.waitlists || []) || [];
    const waitlistData = firstPage
        ? { ...firstPage, waitlists: allWaitlists }
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

// GET Owner Waitlist Show
export const useGetSingleOwnerWaitlist = (id) => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        isLoading: isWaitlistLoading,
        isError,
        error,
        refetch: refetchWaitlist,
    } = useQuery({
        queryKey: ["single-owner-waitlist", id],
        queryFn: () => ownerWaitlistService.get_single_waitlist(id, axiosInstance),
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
