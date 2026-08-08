import { axiosPrivate } from "@/lib/axios.private";
import { createDirectorService } from "@/services/create-director";
import { useMutation, useQuery } from "@tanstack/react-query";

const axiosInstance = axiosPrivate();
export const useCreateDirector = () => {
    const {
        data,
        mutateAsync: createDirector,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationKey: ["create-director"],
        mutationFn: (payload) => createDirectorService.createDirector(payload, axiosInstance),
    });

    return {
        data,
        createDirector,
        isPending,
        isError,
        error,
    };
};

export const useGetAllDirector = () => {
    const {
        data,
        isLoading: isDirectorLoading,
        isError,
        error,
        isSuccess,
    } = useQuery({
        queryKey: ["get-all-director"],
        queryFn: () => createDirectorService.getAllDirector(axiosInstance),
        enabled: true,
    });

    return {
        allDirector: data?.data,
        isLoading: isDirectorLoading,
        isError,
        error,
        isSuccess,
    };
};

export const useGetSingleDirector = (id) => {
    const {
        data,
        isLoading: isDirectorLoading,
        isError,
        error,
        isSuccess,
    } = useQuery({
        queryKey: ["get-single-director", id],
        queryFn: () => createDirectorService.getSingleDirector(id, axiosInstance),
        enabled: !!id,
    });

    return {
        singleDirector: data?.data,
        isLoading: isDirectorLoading,
        isError,
        error,
        isSuccess,
    };
};
