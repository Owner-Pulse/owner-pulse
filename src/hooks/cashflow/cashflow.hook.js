import { axiosPrivate } from "@/lib/axios.private";
import { useQuery } from "@tanstack/react-query";

export const useGetCashflow = () => {

    const axiosInstance = axiosPrivate();

    const {
        data,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["cashflow"],
        queryFn: () => cashFlowService.getCashFlow(axiosInstance),
    });


    return {
        data,
        isLoading,
        isError,
        error
    }
}