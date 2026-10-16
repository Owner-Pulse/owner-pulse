import { axiosPrivate } from "@/lib/axios.private";
import { adpHoursService } from "@/services/adp-hours.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAdpHoursImports = (role, page = 1) => {
  const axiosInstance = axiosPrivate();

  const query = useQuery({
    queryKey: ["adp-hours-imports", role, page],
    queryFn: () => adpHoursService.listImports(axiosInstance, role, { page, per_page: 15 }),
    enabled: Boolean(role),
  });

  return {
    ...query,
    imports: query.data?.data ?? [],
    meta: query.data?.pagination,
  };
};

export const useAdpHoursPreview = (role) => {
  const axiosInstance = axiosPrivate();

  return useMutation({
    mutationFn: (formData) => adpHoursService.preview(axiosInstance, role, formData),
  });
};

export const useAdpHoursImport = (role) => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => adpHoursService.import(axiosInstance, role, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adp-hours-imports", role] });
    },
  });
};
