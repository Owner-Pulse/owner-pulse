import { axiosPrivate } from "@/lib/axios.private"
import { getUserService } from "@/services"
import { useQuery } from "@tanstack/react-query";

export const useGetUser = () => {
    const axiosInstance = axiosPrivate();
    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ["user"],
        queryFn: () => getUserService(axiosInstance),
    })

    return {
        user: data?.data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch
    };
};