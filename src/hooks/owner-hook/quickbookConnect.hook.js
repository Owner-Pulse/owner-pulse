import { axiosPrivate } from "@/lib/axios.private";
import { quickbookConnectService } from "@/services/owner-service/quickbookConnect.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useGetQuickbookStatus = () => {
    const axiosInstance = axiosPrivate();

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["quickbook-status"],
        queryFn: () => quickbookConnectService.get_connection_status(axiosInstance),
    });

    const isConnected = data?.connected ?? data?.data?.connected ?? false;

    return {
        quickbookStatus: data,
        isConnected,
        isLoading,
        isError,
        error,
        refetch,
    };
};

export const useGetQuickbookConnectUrl = () => {
    const axiosInstance = axiosPrivate();

    return useQuery({
        queryKey: ["quickbook-connect-url"],
        queryFn: () => quickbookConnectService.get_connection_url(axiosInstance),
    });
};

export const useConnectQuickBooks = () => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        mutateAsync: getConnectUrl,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationKey: ["quickbook-connect"],
        mutationFn: () => quickbookConnectService.get_connection_url(axiosInstance),
        onSuccess: (responseData) => {
            const connectUrl = responseData?.connect_url || responseData?.data?.connect_url;
            if (connectUrl) {
                window.location.href = connectUrl;
            } else if (responseData?.message) {
                toast.success(responseData.message);
            }
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || "Failed to connect QuickBooks";
            toast.error(msg);
        },
    });

    return {
        data,
        getConnectUrl,
        isPending,
        isError,
        error,
    };
};
