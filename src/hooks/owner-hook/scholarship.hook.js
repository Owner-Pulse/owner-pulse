import { axiosPrivate } from "@/lib/axios.private";
import { ownerScholarshipService } from "@/services/owner-service/scolarship.service";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── GET All Owner Scholarships (Single Dashboard Data) ───
export const useGetOwnerScholarships = (params = { pending_page: 1, pending_per_page: 10, approved_page: 1, approved_per_page: 10 }) => {
  const axiosInstance = axiosPrivate();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["owner-scholarships", params],
    queryFn: () => ownerScholarshipService.get_all_scholarships(axiosInstance, params),
    placeholderData: keepPreviousData,
  });

  return {
    data,
    scholarshipData: data?.data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
};

// ─── GET Infinite Pending Scholarships ───
export const useGetInfinitePendingScholarships = (params = { pending_per_page: 10 }) => {
  const axiosInstance = axiosPrivate();

  return useInfiniteQuery({
    queryKey: ["owner-pending-scholarships-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      ownerScholarshipService.get_all_scholarships(axiosInstance, {
        ...params,
        pending_page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pendingList = lastPage?.data?.step_up_payment_approvals?.pending_list;
      if (!pendingList) return undefined;
      const current = Number(pendingList.current_page);
      const last = Number(pendingList.last_page);
      return current < last ? current + 1 : undefined;
    },
  });
};

// ─── GET Infinite Approved Scholarships ───
export const useGetInfiniteApprovedScholarships = (params = { approved_per_page: 10 }) => {
  const axiosInstance = axiosPrivate();

  return useInfiniteQuery({
    queryKey: ["owner-approved-scholarships-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      ownerScholarshipService.get_all_scholarships(axiosInstance, {
        ...params,
        approved_page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const approvedList = lastPage?.data?.step_up_payment_approvals?.approved_list;
      if (!approvedList) return undefined;
      const current = Number(approvedList.current_page);
      const last = Number(approvedList.last_page);
      return current < last ? current + 1 : undefined;
    },
  });
};

// ─── GET Scholarship Programs ───
export const useGetScholarshipPrograms = () => {
  const axiosInstance = axiosPrivate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["scholarship-programs"],
    queryFn: () => ownerScholarshipService.get_scholarship_program(axiosInstance),
  });

  return {
    programsData: data?.data || [],
    isLoading,
    isError,
    error,
  };
};

// ─── POST Add Scholarship Payment ───
export const useAddScholarship = () => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const { mutateAsync: addScholarship, isPending, isError, error } = useMutation({
    mutationKey: ["add-scholarship"],
    mutationFn: (payload) => ownerScholarshipService.add_scholarship(axiosInstance, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["owner-scholarships"] });
      queryClient.invalidateQueries({ queryKey: ["owner-pending-scholarships-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["owner-approved-scholarships-infinite"] });
      toast.success(data?.message ?? "Scholarship payment added successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to add scholarship payment");
    },
  });

  return { addScholarship, isPending, isError, error };
};

// ─── POST Update Scholarship Status ───
export const useUpdateScholarshipStatus = () => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const { mutateAsync: updateStatus, isPending, isError, error } = useMutation({
    mutationKey: ["update-scholarship-status"],
    mutationFn: ({ scholarship_id, payload }) =>
      ownerScholarshipService.update_status(axiosInstance, payload, scholarship_id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["owner-scholarships"] });
      queryClient.invalidateQueries({ queryKey: ["owner-pending-scholarships-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["owner-approved-scholarships-infinite"] });
      toast.success(data?.message ?? "Scholarship status updated successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to update scholarship status");
    },
  });

  return { updateStatus, isPending, isError, error };
};
