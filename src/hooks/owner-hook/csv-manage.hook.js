import { axiosPrivate } from "@/lib/axios.private";
import { csvManageService } from "@/services/csv-manage.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
 * Mutation to upload a single CSV file with option key
 */
export const useUploadCsv = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        data,
        mutateAsync: uploadCsv,
        isPending,
        isError,
        error,
        reset,
    } = useMutation({
        mutationKey: ["upload-single-csv"],
        mutationFn: (formData) => csvManageService.upload_csv(axiosInstance, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
        },
    });

    return {
        data,
        uploadCsv,
        isPending,
        isError,
        error,
        reset,
    };
};
