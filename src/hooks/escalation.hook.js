import { axiosPrivate } from "@/lib/axios.private";
import { escalationService } from "@/services/escalation.service";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const PER_PAGE = 20;

// The payload sits under `data` like the other endpoints; fall back to the body itself
const bodyOf = (page) => (page?.data && !Array.isArray(page.data) ? page.data : page) || {};

// escalation list for either role — status: pending | resolved | all
export const useGetEscalations = (role, status = "pending") => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["escalations", role, status],
        queryFn: ({ pageParam }) =>
            escalationService.get_escalations(axiosInstance, role, { status, page: pageParam, per_page: PER_PAGE }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.pagination || lastPage?.data?.pagination;
            if (!pagination) return undefined;
            const current = Number(pagination.current_page);
            const last = Number(pagination.last_page);
            return current < last ? current + 1 : undefined;
        },
        enabled: !!role,
    });

    const pages = data?.pages || [];
    const escalations = pages.flatMap((page) => bodyOf(page).escalations || []);
    const counts = bodyOf(pages[0]).counts || {};

    return {
        escalations,
        counts: {
            pending: counts.pending ?? 0,
            approved: counts.approved ?? 0,
            rejected: counts.rejected ?? 0,
            acknowledged: counts.acknowledged ?? 0,
        },
        isLoading,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    };
};

// pending count for the sidebar badge — one row is enough, the counts come with it
export const usePendingEscalationCount = (role, enabled = true) => {
    const axiosInstance = axiosPrivate();

    const { data } = useQuery({
        queryKey: ["escalations", role, "count"],
        queryFn: () => escalationService.get_escalations(axiosInstance, role, { status: "pending", page: 1, per_page: 1 }),
        enabled: enabled && !!role,
    });

    return bodyOf(data).counts?.pending ?? 0;
};

// director: standalone escalation. 422 field errors are shown by the form, so no error toast for those.
export const useCreateEscalation = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const { mutateAsync: createEscalation, isPending } = useMutation({
        mutationKey: ["create-escalation"],
        mutationFn: (payload) => escalationService.create_escalation(axiosInstance, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Sent to the Owner");
            queryClient.invalidateQueries({ queryKey: ["escalations"] });
            queryClient.invalidateQueries({ queryKey: ["director-overview"] });
        },
        onError: (error) => {
            if (error?.response?.status === 422 && error.response.data?.errors) return;
            toast.error(error?.response?.data?.message || "Failed to send to the Owner");
        },
    });

    return { createEscalation, isPending };
};

// owner: approve / reject / acknowledge with an optional note
export const useResolveEscalation = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["escalations"] });
        queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
        queryClient.invalidateQueries({ queryKey: ["owner-maintenance-list"] });
    };

    const { mutate: resolveEscalation, isPending, variables } = useMutation({
        mutationKey: ["resolve-escalation"],
        mutationFn: ({ id, status, owner_note }) =>
            escalationService.resolve_escalation(axiosInstance, id, owner_note ? { status, owner_note } : { status }),
        onSuccess: (data) => {
            toast.success(data?.message || "Decision saved");
            refresh();
        },
        // 422 = already resolved (e.g. from another device): show why and reload the list
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to save the decision");
            refresh();
        },
    });

    return { resolveEscalation, isPending, pendingId: isPending ? variables?.id : null };
};
