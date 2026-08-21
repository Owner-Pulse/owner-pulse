import { useQuery } from "@tanstack/react-query";
import { axiosPrivate } from "@/lib/axios.private";
import { enrollmentsService } from "@/services/owner-service/enrollments.service";

export const useGetOwnerEnrollments = () => {
  const axiosInstance = axiosPrivate();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["owner-enrollments-overview"],
    queryFn: () => enrollmentsService.getEnrollments(axiosInstance),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    enrollmentData: data?.data || null,
    isLoading,
    isError,
    error,
    refetch,
  };
};
