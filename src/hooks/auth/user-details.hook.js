import { axiosPrivate } from "@/lib/axios.private"
import { getUserService } from "@/services";
import { useMutation, useQuery } from "@tanstack/react-query";

const axiosInstance = axiosPrivate();
export const useGetUser = () => {
    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ["user"],
        queryFn: () => getUserService.userDetail(axiosInstance),
    });

    return {
        user: data?.data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch
    };
};


// use update user details hook
export const useUpdateOwnerUserDetails = () => {
    const { 
        data, 
        isLoading, 
        error, 
        isError, 
        isSuccess, 
        isPending,
        mutateAsync: updateOwnerUserDetails,
        reset
    } = useMutation({
        mutationFn: (payload) => getUserService.updateOwnerUserDetails(axiosInstance, payload),
    });

    return {
        data,
        isLoading,
        error,
        isError,
        isSuccess,
        updateOwnerUserDetails,
        reset,
        isPending,
    };
};

// use update director details hook
export const useUpdateDirectorUserDetails = () => {
    const { 
        data, 
        isLoading, 
        error, 
        isError, 
        isSuccess, 
        isPending,
        mutateAsync: updateDirectorUserDetails,
        reset
    } = useMutation({
        mutationFn: (payload) => getUserService.updateDirectorUserDetails(axiosInstance, payload),
    });

    return {
        data,
        isLoading,
        error,
        isError,
        isSuccess,
        updateDirectorUserDetails,
        reset,
        isPending,
    };
};

// use change owner password hook
export const useChangeOwnerPassword = () => {
    const { 
        data, 
        isLoading, 
        error, 
        isError, 
        isSuccess, 
        isPending,
        mutateAsync: changeOwnerPassword,
        reset
    } = useMutation({
        mutationFn: (payload) => getUserService.changeOwnerPassword(axiosInstance, payload),
    });

    return {
        data,
        isLoading,
        error,
        isError,
        isSuccess,
        changeOwnerPassword,
        reset,
        isPending,
    };
};

// use change director password hook
export const useChangeDirectorPassword = () => {
    const { 
        data, 
        isLoading, 
        error, 
        isError, 
        isSuccess, 
        isPending,
        mutateAsync: changeDirectorPassword,
        reset
    } = useMutation({
        mutationFn: (payload) => getUserService.changeDirectorPassword(axiosInstance, payload),
    });

    return {
        data,
        isLoading,
        error,
        isError,
        isSuccess,
        changeDirectorPassword,
        reset,
        isPending,
    };
};
