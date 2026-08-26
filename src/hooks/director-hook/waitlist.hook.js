import { axiosPrivate } from "@/lib/axios.private";
import { directorWaitlistService } from "@/services/waitlist.service";
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
        refetch,
    } = useInfiniteQuery({
        queryKey: ["director-waitlist-list", params],
        queryFn: ({ pageParam }) =>
            directorWaitlistService.get_all_waitlist(axiosInstance, { ...params, page: pageParam, per_page: params?.per_page || 15 }),
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
        refetch,
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
        queryFn: () => directorWaitlistService.get_single_waitlist(axiosInstance, id), // Align with standard axiosInstance first signature
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
        mutationFn: ({ id, payload }) => directorWaitlistService.update_waitlist(axiosInstance, id, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Waitlist entry updated successfully");
            queryClient.invalidateQueries({ queryKey: ["director-waitlist-list"] });
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

// POST Log Tour
export const useLogTourDirectorWaitlist = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: logTour,
        isPending,
    } = useMutation({
        mutationKey: ["log-tour-director-waitlist"],
        mutationFn: ({ id, payload }) => directorWaitlistService.inquiryToTour(axiosInstance, id, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Tour logged successfully");
            queryClient.invalidateQueries({ queryKey: ["director-waitlist-list"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to log tour");
        },
    });

    return { logTour, isPending };
};

// POST Move to Applied
export const useMoveAppliedDirectorWaitlist = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: moveToApplied,
        isPending,
    } = useMutation({
        mutationKey: ["move-applied-director-waitlist"],
        mutationFn: ({ id, payload }) => directorWaitlistService.tourToAppled(axiosInstance, id, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Moved to applied successfully");
            queryClient.invalidateQueries({ queryKey: ["director-waitlist-list"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to move to applied");
        },
    });

    return { moveToApplied, isPending };
};

// POST Offer Spot
export const useOfferSpotDirectorWaitlist = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: offerSpot,
        isPending,
    } = useMutation({
        mutationKey: ["offer-spot-director-waitlist"],
        mutationFn: ({ id, payload }) => directorWaitlistService.appledToOffered(axiosInstance, id, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Spot offered successfully");
            queryClient.invalidateQueries({ queryKey: ["director-waitlist-list"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to offer spot");
        },
    });

    return { offerSpot, isPending };
};

// POST Confirm Enrollment
export const useConfirmEnrollmentDirectorWaitlist = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: confirmEnrollment,
        isPending,
    } = useMutation({
        mutationKey: ["confirm-enrollment-director-waitlist"],
        mutationFn: ({ id, payload }) => directorWaitlistService.offeredToEnrolled(axiosInstance, id, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Enrollment confirmed successfully");
            queryClient.invalidateQueries({ queryKey: ["director-waitlist-list"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to confirm enrollment");
        },
    });

    return { confirmEnrollment, isPending };
};

// POST Mark Lost
export const useMarkLostDirectorWaitlist = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: markLost,
        isPending,
    } = useMutation({
        mutationKey: ["mark-lost-director-waitlist"],
        mutationFn: ({ id, payload }) => directorWaitlistService.lostStudent(axiosInstance, id, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Waitlist entry marked as lost");
            queryClient.invalidateQueries({ queryKey: ["director-waitlist-list"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to mark as lost");
        },
    });

    return { markLost, isPending };
};

// DELETE Delete waitlist
export const useDeleteDirectorWaitlist = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: deleteEntry,
        isPending,
    } = useMutation({
        mutationKey: ["delete-director-waitlist"],
        mutationFn: (id) => directorWaitlistService.deletefromWaitlist(axiosInstance, id),
        onSuccess: (data) => {
            toast.success(data?.message || "Deleted from waitlist successfully");
            queryClient.invalidateQueries({ queryKey: ["director-waitlist-list"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to delete waitlist entry");
        },
    });

    return { deleteEntry, isPending };
};
