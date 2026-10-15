import { axiosPrivate } from "@/lib/axios.private";
import { weeklyReportService } from "@/services/weekly-report.service";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getFieldErrors, hasFieldErrors } from "@/lib/api-errors";

const PER_PAGE = 20; // the API allows up to 100
const EXTRACT_POLL_MS = 3000;
const NO_LIST = [];

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

// the report for the week containing `date` (?week= returns that week's report or an empty list)
export const useWeeklyReportForWeek = (role, date, enabled = true) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading } = useQuery({
        queryKey: ["weekly-reports", role, "week", date],
        queryFn: () => weeklyReportService.get_reports(axiosInstance, role, { week: date }),
        enabled: enabled && !!role && !!date,
    });

    const report = (Array.isArray(data?.data) ? data.data : NO_LIST)[0] || null;

    return { report, isLoading };
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

// the PDF at the report's file.url, as a blob (the viewer turns it into an object URL)
export const useWeeklyReportFile = (url, enabled = true) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["weekly-reports", "file", url],
        queryFn: () => weeklyReportService.get_file(axiosInstance, url),
        enabled: enabled && !!url,
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
            if (hasFieldErrors(error) || silent) return;
            toast.error(error?.response?.data?.message || "Failed to save the draft");
        },
    });

    return { saveDraft, isPending };
};

// Director: send the PDF to be read
export const useStartExtraction = () => {
    const axiosInstance = axiosPrivate();

    const { mutateAsync: startExtraction, isPending } = useMutation({
        mutationKey: ["start-weekly-report-extraction"],
        mutationFn: ({ file }) => weeklyReportService.start_extraction(axiosInstance, file),
    });

    return { startExtraction, isPending };
};

// polls every 3 seconds while the PDF is being read
export const useExtraction = (id, week, enabled = true) => {
    const axiosInstance = axiosPrivate();

    const { data, isError, error } = useQuery({
        queryKey: ["weekly-report-extraction", id, week],
        queryFn: () => weeklyReportService.get_extraction(axiosInstance, id, week),
        enabled: enabled && !!id,
        refetchInterval: (query) => (query.state.data?.data?.status === "pending" ? EXTRACT_POLL_MS : false),
        refetchIntervalInBackground: true,
        retry: 1,
    });

    return { extraction: data?.data, isError, error };
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
            (data?.data?.warnings || []).forEach((w) => toast(w, { icon: "⚠️", duration: 7000 }));
            refreshAll(queryClient);
        },
        onError: (error) => {
            // a 422 lists what is missing (e.g. the cash figures); show those, not just the headline
            const reasons = Object.values(getFieldErrors(error));
            toast.error(reasons.length ? reasons.join(" ") : error?.response?.data?.message || "Failed to confirm the report");
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
            if (hasFieldErrors(error)) return;
            toast.error(error?.response?.data?.message || "Failed to save the notes");
        },
    });

    return { updateNotes, isPending };
};

export const useRoomMappings = () => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["report-room-mappings"],
        queryFn: () => weeklyReportService.get_room_mappings(axiosInstance),
    });

    // { mappings: [{ room_label, classroom: { id, name } | null }], classrooms: [{ id, name }] }
    // stable empty lists while loading, so effects keyed on them don't loop
    const mappings = data?.data?.mappings || NO_LIST;
    const classrooms = data?.data?.classrooms || NO_LIST;

    return { mappings, classrooms, isLoading, isError };
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
            if (hasFieldErrors(error)) return;
            toast.error(error?.response?.data?.message || "Failed to save the room mapping");
        },
    });

    return { saveMappings, isPending };
};
