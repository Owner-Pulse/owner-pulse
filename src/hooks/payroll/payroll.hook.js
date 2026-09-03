import { axiosPrivate } from "@/lib/axios.private";
import { payrollService } from "@/services/payroll.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── Owner Hooks ───

export const useGetOwnerPayrollOverview = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["owner-payroll-overview"],
    queryFn: () => {
      const axiosInstance = axiosPrivate();
      return payrollService.getOwnerOverview(axiosInstance);
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    data: data?.data ?? null,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export const useGetOwnerPayrollSchedules = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["owner-payroll-schedules"],
    queryFn: () => {
      const axiosInstance = axiosPrivate();
      return payrollService.owner_schedule_list(axiosInstance);
    },
    staleTime: 2 * 60 * 1000,
  });

  const schedules = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

  return {
    schedules,
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export const useGetOwnerPayrollSubmissions = (params = {}) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["owner-payroll-submissions", params],
    queryFn: () => {
      const axiosInstance = axiosPrivate();
      return payrollService.payroll_submission_list_owner(axiosInstance, params);
    },
    staleTime: 2 * 60 * 1000,
  });

  const submissions = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination ?? null;

  return {
    submissions,
    pagination,
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export const useGetOwnerPayrollSubmissionAudit = (payrollId) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["owner-payroll-audit", payrollId],
    queryFn: () => {
      const axiosInstance = axiosPrivate();
      return payrollService.payroll_submission_details(axiosInstance, payrollId);
    },
    enabled: !!payrollId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    auditData: data?.data ?? null,
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// ─── Director Hooks ───

export const useGetDirectorPayrollOverview = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["director-payroll-overview"],
    queryFn: () => {
      const axiosInstance = axiosPrivate();
      return payrollService.getDirectorOverview(axiosInstance);
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    data: data?.data ?? null,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export const useGetDirectorPayrollSchedules = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["director-payroll-schedules"],
    queryFn: () => {
      const axiosInstance = axiosPrivate();
      return payrollService.director_schedule_list(axiosInstance);
    },
    staleTime: 2 * 60 * 1000,
  });

  const schedules = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

  return {
    schedules,
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export const useGetDirectorPayrollHistory = (params = {}) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["director-payroll-history", params],
    queryFn: () => {
      const axiosInstance = axiosPrivate();
      return payrollService.payroll_history_list_director(axiosInstance, params);
    },
    staleTime: 2 * 60 * 1000,
  });

  const history = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination ?? null;

  return {
    history,
    pagination,
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export const useGetDirectorPayrollHistoryDetails = (payrollId) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["director-payroll-history-details", payrollId],
    queryFn: () => {
      const axiosInstance = axiosPrivate();
      return payrollService.payroll_history_details_director(axiosInstance, payrollId);
    },
    enabled: !!payrollId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    historyDetails: data?.data ?? null,
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// ─── Shared Mutations ───

export const useGeneratePayrollSchedule = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: generateSchedule, isPending, isError, error } = useMutation({
    mutationKey: ["generate-payroll-schedule"],
    mutationFn: (body) => {
      const axiosInstance = axiosPrivate();
      return payrollService.generateSchedule(axiosInstance, body);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["owner-payroll-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["director-payroll-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["owner-payroll-overview"] });
      queryClient.invalidateQueries({ queryKey: ["director-payroll-overview"] });
      toast.success(res?.message ?? "Payroll schedule created successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to generate payroll schedule.");
    },
  });

  return { generateSchedule, isPending, isError, error };
};

export const useDeletePayrollSchedule = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteSchedule, isPending, isError, error } = useMutation({
    mutationKey: ["delete-payroll-schedule"],
    mutationFn: (id) => {
      const axiosInstance = axiosPrivate();
      return payrollService.deleteSchedule(axiosInstance, id);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["owner-payroll-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["director-payroll-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["owner-payroll-overview"] });
      queryClient.invalidateQueries({ queryKey: ["director-payroll-overview"] });
      toast.success(res?.message ?? "Payroll schedule deleted successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to delete payroll schedule.");
    },
  });

  return { deleteSchedule, isPending, isError, error };
};

export const useUpdatePayrollSchedule = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateSchedule, isPending, isError, error } = useMutation({
    mutationKey: ["update-payroll-schedule"],
    mutationFn: ({ id, data }) => {
      const axiosInstance = axiosPrivate();
      return payrollService.updateSchedule(axiosInstance, id, data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["owner-payroll-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["director-payroll-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["owner-payroll-overview"] });
      queryClient.invalidateQueries({ queryKey: ["director-payroll-overview"] });
      toast.success(res?.message ?? "Payroll schedule updated successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to update payroll schedule.");
    },
  });

  return { updateSchedule, isPending, isError, error };
};

export const useSubmitPayroll = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: submitPayroll, isPending, isError, error } = useMutation({
    mutationKey: ["submit-payroll"],
    mutationFn: (body) => {
      const axiosInstance = axiosPrivate();
      return payrollService.submitPayroll(axiosInstance, body);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["director-payroll-history"] });
      queryClient.invalidateQueries({ queryKey: ["director-payroll-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["director-payroll-overview"] });
      queryClient.invalidateQueries({ queryKey: ["owner-payroll-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["owner-payroll-overview"] });
      toast.success(res?.message ?? "Payroll submitted successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to submit payroll.");
    },
  });

  return { submitPayroll, isPending, isError, error };
};
