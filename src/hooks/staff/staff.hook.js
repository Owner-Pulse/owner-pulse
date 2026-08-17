import { axiosPrivate } from "@/lib/axios.private";
import { staffService } from "@/services/staff";
import { useQuery } from "@tanstack/react-query";

// Data from the dashboard staff API ( roster and pto lists )
export const useGetStaff = () => {
    const axiosInstance = axiosPrivate();

    const {
        data,
        isError,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["staff"],
        queryFn: () => staffService.getStaff(axiosInstance),
        // enabled: params !== undefined,
    });

    return {
        data,
        isLoading,
        isError,
        error
    };
};