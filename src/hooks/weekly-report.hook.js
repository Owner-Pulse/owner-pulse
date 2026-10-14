import { axiosPrivate } from "@/lib/axios.private";
import { weeklyReportService } from "@/services/weekly-report.service";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { hasValidationErrors } from "@/lib/escalation";

const PER_PAGE = 20;
const NO_MAPPINGS = [];

const refreshAll = (queryClient) => {
    queryClient.invalidateQueries({ queryKey: ["weekly-reports"] });
    queryClient.invalidateQueries({ queryKey: ["collections"] });
    queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
    queryClient.invalidateQueries({ queryKey: ["director-overview"] });
};

// one card per week, newest first
export const useGetWeeklyReports = (role) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["weekly-reports", role, "list"],
        queryFn: ({ pageParam }) => weeklyReportService.get_reports(axiosInstance, role, { page: pageParam, per_page: PER_PAGE }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.pagination;
            if (!pagination) return undefined;
            const current = Number(pagination.current_page);
            const last = Number(pagination.last_page);
            return current < last ? current + 1 : undefined;
        },
        enabled: !!role,
    });

    const reports = (data?.pages || []).flatMap((page) => (Array.isArray(page?.data) ? page.data : []));

    return { reports, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage };
};

export const useGetWeeklyReport = (role, id) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["weekly-reports", role, "detail", String(id)],
        queryFn: () => weeklyReportService.get_report(axiosInstance, role, id),
        enabled: !!role && !!id,
    });

    return { report: data?.data, isLoading, isError, refetch };
};

// the PDF as a blob (the viewer turns it into an object URL)
export const useWeeklyReportFile = (role, id, enabled = true) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["weekly-reports", role, "file", String(id)],
        queryFn: () => weeklyReportService.get_file(axiosInstance, role, id),
        enabled: enabled && !!role && !!id,
        staleTime: 10 * 60 * 1000,
    });

    return { blob: data, isLoading, isError };
};

// Director: create / update the draft for a week. 422 field errors are shown by the form.
export const useSaveWeeklyReport = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const { mutateAsync: saveDraft, isPending } = useMutation({
        mutationKey: ["save-weekly-report"],
        mutationFn: ({ payload }) => weeklyReportService.save_draft(axiosInstance, payload),
        onSuccess: (data, { silent }) => {
            if (!silent) toast.success(data?.message || "Draft saved");
            refreshAll(queryClient);
        },
        onError: (error, { silent }) => {
            if (hasValidationErrors(error) || silent) return;
            toast.error(error?.response?.data?.message || "Failed to save the draft");
        },
    });

    return { saveDraft, isPending };
};

// confirm — warnings[] come back as toasts
export const useConfirmWeeklyReport = (role) => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const { mutateAsync: confirmReport, isPending } = useMutation({
        mutationKey: ["confirm-weekly-report", role],
        mutationFn: (id) => weeklyReportService.confirm(axiosInstance, role, id),
        onSuccess: (data) => {
            toast.success(data?.message || "Weekly report confirmed");
            const warnings = data?.warnings ?? data?.data?.warnings ?? [];
            warnings.forEach((w) =>
                toast(typeof w === "string" ? w : w?.message || String(w), { icon: "⚠️", duration: 7000 })
            );
            refreshAll(queryClient);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to confirm the report");
        },
    });

    return { confirmReport, isPending };
};

export const useReopenWeeklyReport = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const { mutate: reopenReport, isPending } = useMutation({
        mutationKey: ["reopen-weekly-report"],
        mutationFn: (id) => weeklyReportService.reopen(axiosInstance, id),
        onSuccess: (data) => {
            toast.success(data?.message || "Report reopened for the Director");
            refreshAll(queryClient);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to reopen the report");
        },
    });

    return { reopenReport, isPending };
};

export const useUpdateWeeklyReportNotes = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const { mutateAsync: updateNotes, isPending } = useMutation({
        mutationKey: ["weekly-report-notes"],
        mutationFn: ({ id, notes }) => weeklyReportService.update_notes(axiosInstance, id, notes),
        onSuccess: (data) => {
            toast.success(data?.message || "Notes saved");
            queryClient.invalidateQueries({ queryKey: ["weekly-reports"] });
        },
        onError: (error) => {
            if (hasValidationErrors(error)) return;
            toast.error(error?.response?.data?.message || "Failed to save the notes");
        },
    });

    return { updateNotes, isPending };
};

export const useGetHeadcount = (role, weeks = 12, enabled = true) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading } = useQuery({
        queryKey: ["weekly-reports", role, "headcount", weeks],
        queryFn: () => weeklyReportService.get_headcount(axiosInstance, role, weeks),
        enabled: enabled && !!role,
    });

    return { headcount: data?.data, isLoading };
};

export const useRoomMappings = () => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["report-room-mappings"],
        queryFn: () => weeklyReportService.get_room_mappings(axiosInstance),
    });

    const payload = data?.data;
    // stable empty list while loading, so effects keyed on it don't loop
    const mappings = Array.isArray(payload) ? payload : payload?.mappings || NO_MAPPINGS;

    return { mappings, classrooms: payload?.classrooms, isLoading, isError };
};

export const useSaveRoomMappings = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const { mutateAsync: saveMappings, isPending } = useMutation({
        mutationKey: ["save-report-room-mappings"],
        mutationFn: (mappings) => weeklyReportService.save_room_mappings(axiosInstance, mappings),
        onSuccess: (data) => {
            toast.success(data?.message || "Room mapping saved");
            queryClient.invalidateQueries({ queryKey: ["report-room-mappings"] });
            queryClient.invalidateQueries({ queryKey: ["weekly-reports"] });
        },
        onError: (error) => {
            if (hasValidationErrors(error)) return;
            toast.error(error?.response?.data?.message || "Failed to save the room mapping");
        },
    });

    return { saveMappings, isPending };
};
