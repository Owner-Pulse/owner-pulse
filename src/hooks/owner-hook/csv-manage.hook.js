import { axiosPrivate } from "@/lib/axios.private";
import { csvManageService } from "@/services/csv-manage.service";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const POLL_INTERVAL = 2000;
const HISTORY_POLL_INTERVAL = 3000;
const MAX_POLL_FAILURES = 5;
const MAX_POLL_DURATION = 30 * 60 * 1000;
const IN_PROGRESS_STATUSES = ["queued", "pending", "processing"];

const normalizeStatus = (status) => String(status || "").toLowerCase();

export const isImportInProgress = (status) => IN_PROGRESS_STATUSES.includes(normalizeStatus(status));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls a queued import until it completes or fails. Resolves with the same
 * response shape the upload used to return, so callers need no changes.
 */
const waitForImport = async (axiosInstance, uploadResponse, onProgress) => {
    const queued = uploadResponse?.data;
    const importId = queued?.import_id ?? queued?.id;
    // A response without a queued import is already the final result
    if (!importId || !isImportInProgress(queued?.status)) return uploadResponse;

    onProgress(queued);
    const startedAt = Date.now();
    let failures = 0;

    while (Date.now() - startedAt < MAX_POLL_DURATION) {
        await sleep(POLL_INTERVAL);

        let response;
        try {
            response = await csvManageService.getImport(axiosInstance, importId);
            failures = 0;
        } catch (err) {
            // A dropped connection or a busy server does not mean the import failed
            const status = err?.response?.status;
            const isTransient = !status || status >= 500;
            if (!isTransient || ++failures >= MAX_POLL_FAILURES) throw err;
            continue;
        }

        const item = response?.data;
        const status = normalizeStatus(item?.status);
        if (status === "completed") return { ...response, status: true, data: item };
        if (status === "failed") throw new Error(item?.error_log || response?.message || "The import failed.");
        onProgress(item);
    }

    throw new Error("The import is still running on the server. Check the Import History for the result.");
};

/**
 * Fetch available CSV import select options
 */
export const useGetCsvFileTypes = () => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["csv-file-types"],
        queryFn: () => csvManageService.getFileType(axiosInstance),
        staleTime: 10 * 60 * 1000,
    });

    return {
        fileTypesData: data,
        fileTypes: data?.data || [],
        isLoading,
        isError,
        error,
        refetch,
    };
};

/**
 * Fetch the CSV import history (one entry per import run)
 */
export const useGetCsvImports = (page = 1) => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ["csv-imports", page],
        queryFn: () => csvManageService.getImports(axiosInstance, page),
        placeholderData: (prev) => prev,
        // Keep the list fresh while an import is still queued or processing
        refetchInterval: (query) =>
            query.state.data?.data?.some((item) => isImportInProgress(item?.["Status"])) ? HISTORY_POLL_INTERVAL : false,
    });

    return {
        imports: data?.data || [],
        meta: data?.meta || null,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    };
};

/**
 * Mutation to upload a single CSV file with option key. The server queues the
 * import, so this stays pending until the queued import completes or fails.
 */
export const useUploadCsv = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();
    // Latest state of the import being processed: { status, total_rows, processed_rows, ... }
    const [progress, setProgress] = useState(null);

    const {
        data,
        mutateAsync: uploadCsv,
        isPending,
        isError,
        error,
        reset,
    } = useMutation({
        mutationKey: ["upload-single-csv"],
        mutationFn: async (formData) => {
            setProgress(null);
            const uploadResponse = await csvManageService.upload_csv(axiosInstance, formData);
            // Show the queued import in the history while it is processed
            queryClient.invalidateQueries({ queryKey: ["csv-imports"] });
            return waitForImport(axiosInstance, uploadResponse, setProgress);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["csv-imports"] });
        },
    });

    return {
        data,
        uploadCsv,
        progress,
        isPending,
        isError,
        error,
        reset,
    };
};
