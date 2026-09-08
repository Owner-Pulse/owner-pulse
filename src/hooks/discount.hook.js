import { axiosPrivate } from "@/lib/axios.private";
import { DiscountService } from "@/services/discount.service";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── GET Discount Categories (Director or Owner) ───
export const useGetDiscountCategories = ({ isOwner = false } = {}) => {
  const axiosInstance = axiosPrivate();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["discount-categories", isOwner],
    queryFn: () =>
      isOwner
        ? DiscountService.discountCategoryList(axiosInstance)
        : DiscountService.discountCategory(axiosInstance),
    placeholderData: keepPreviousData,
  });

  return {
    data,
    categories: data?.data?.categories || [],
    totalCategories: data?.data?.total_categories || 0,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
};

// ─── GET Tuition Discounts List (Director or Owner) ───
export const useGetDiscounts = ({ isOwner = false, params = {} } = {}) => {
  const axiosInstance = axiosPrivate();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["tuition-discounts", isOwner, params],
    queryFn: () =>
      isOwner
        ? DiscountService.discountedStudentList(axiosInstance, params)
        : DiscountService.discountList(axiosInstance, params),
    placeholderData: keepPreviousData,
  });

  return {
    data,
    summary: data?.data?.summary || {},
    applications: data?.data?.applications || [],
    pagination: {
      currentPage: data?.data?.current_page || 1,
      lastPage: data?.data?.last_page || 1,
      from: data?.data?.from || 0,
      to: data?.data?.to || 0,
      total: data?.data?.total || 0,
    },
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
};

// ─── Form Options Hook (Deprecated: options endpoint disabled) ───
export const useGetDiscountOptions = () => {
  return {
    data: null,
    options: {},
    categories: [],
    students: [],
    classrooms: [],
    discountModes: [],
    types: [],
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: () => {},
  };
};

// ─── GET Owner Analytics (Revenue Impact & Category Metrics) ───
export const useGetDiscountAnalytics = () => {
  const axiosInstance = axiosPrivate();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["discount-analytics"],
    queryFn: () => DiscountService.analytics(axiosInstance),
    placeholderData: keepPreviousData,
  });

  return {
    data,
    analytics: data?.data || {},
    revenueImpact: data?.data?.annual_revenue_impact || {},
    categoryAnalytics: data?.data?.categories || [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
};

// ─── GET Single Category by ID ───
export const useGetSingleCategory = (id) => {
  const axiosInstance = axiosPrivate();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["discount-single-category", id],
    queryFn: () => DiscountService.showSingleCategory(axiosInstance, id),
    enabled: !!id,
  });

  return {
    data,
    category: data?.data?.category || data?.data || null,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
};

// ─── GET Single Discount Application by ID ───
export const useGetSingleDiscount = (id) => {
  const axiosInstance = axiosPrivate();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["discount-single-application", id],
    queryFn: () => DiscountService.showSingleDiscount(axiosInstance, id),
    enabled: !!id,
  });

  return {
    data,
    discount: data?.data?.application || data?.data || null,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
};

// ─── MUTATION: Add Student Discount (Director application or Owner direct) ───
export const useAddDiscountStudent = ({ isOwner = false } = {}) => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const { mutateAsync: addDiscountStudent, isPending, isError, error } = useMutation({
    mutationKey: ["add-discount-student", isOwner],
    mutationFn: (payload) =>
      isOwner
        ? DiscountService.ownerAddDiscountStudent(axiosInstance, payload)
        : DiscountService.directorAddDiscountStudent(axiosInstance, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tuition-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discount-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["discount-categories"] });
      toast.success(data?.message ?? "Tuition discount submitted successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to submit tuition discount");
    },
  });

  return { addDiscountStudent, isPending, isError, error };
};

// ─── MUTATION: Update Student Discount ───
export const useUpdateDiscountStudent = ({ isOwner = false } = {}) => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const { mutateAsync: updateDiscountStudent, isPending, isError, error } = useMutation({
    mutationKey: ["update-discount-student", isOwner],
    mutationFn: ({ id, data }) =>
      isOwner
        ? DiscountService.ownerUpdateDiscountedStudent(axiosInstance, data, id)
        : DiscountService.directorUpdateDiscountedStudent(axiosInstance, data, id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tuition-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discount-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["discount-single-application"] });
      toast.success(data?.message ?? "Tuition discount updated successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to update tuition discount");
    },
  });

  return { updateDiscountStudent, isPending, isError, error };
};

// ─── MUTATION: Delete Student Discount ───
export const useDeleteDiscountStudent = ({ isOwner = false } = {}) => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const { mutateAsync: deleteDiscountStudent, isPending, isError, error } = useMutation({
    mutationKey: ["delete-discount-student", isOwner],
    mutationFn: (id) =>
      isOwner
        ? DiscountService.ownerDeleteDiscountStudent(axiosInstance, id)
        : DiscountService.directorDeleteDiscountStudent(axiosInstance, id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tuition-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discount-analytics"] });
      toast.success(data?.message ?? "Tuition discount deleted successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to delete tuition discount");
    },
  });

  return { deleteDiscountStudent, isPending, isError, error };
};

// ─── MUTATION: Create Category (Owner only) ───
export const useCreateDiscountCategory = () => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const { mutateAsync: createCategory, isPending, isError, error } = useMutation({
    mutationKey: ["create-discount-category"],
    mutationFn: (payload) => DiscountService.createCategory(axiosInstance, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["discount-categories"] });
      queryClient.invalidateQueries({ queryKey: ["discount-analytics"] });
      toast.success(data?.message ?? "Discount category created successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to create discount category");
    },
  });

  return { createCategory, isPending, isError, error };
};

// ─── MUTATION: Update Category (Owner only) ───
export const useUpdateDiscountCategory = () => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const { mutateAsync: updateCategory, isPending, isError, error } = useMutation({
    mutationKey: ["update-discount-category"],
    mutationFn: ({ id, data }) => DiscountService.updateCategory(axiosInstance, data, id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["discount-categories"] });
      queryClient.invalidateQueries({ queryKey: ["discount-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["discount-single-category"] });
      toast.success(data?.message ?? "Discount category updated successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to update discount category");
    },
  });

  return { updateCategory, isPending, isError, error };
};

// ─── MUTATION: Delete Category (Owner only) ───
export const useDeleteDiscountCategory = () => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const { mutateAsync: deleteCategory, isPending, isError, error } = useMutation({
    mutationKey: ["delete-discount-category"],
    mutationFn: (id) => DiscountService.deleteCategory(axiosInstance, id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["discount-categories"] });
      queryClient.invalidateQueries({ queryKey: ["discount-analytics"] });
      toast.success(data?.message ?? "Discount category deleted successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to delete discount category");
    },
  });

  return { deleteCategory, isPending, isError, error };
};

// ─── MUTATION: Approve Discount Application (Owner only) ───
export const useApproveDiscountRequest = () => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const { mutateAsync: approveDiscount, isPending, isError, error } = useMutation({
    mutationKey: ["approve-discount-request"],
    mutationFn: ({ id, data = {} }) =>
      DiscountService.approveDiscountRequest(axiosInstance, data, id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tuition-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discount-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["discount-single-application"] });
      toast.success(data?.message ?? "Discount application approved successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to approve discount application");
    },
  });

  return { approveDiscount, isPending, isError, error };
};

// ─── MUTATION: Reject Discount Application (Owner only) ───
export const useRejectDiscountRequest = () => {
  const queryClient = useQueryClient();
  const axiosInstance = axiosPrivate();

  const { mutateAsync: rejectDiscount, isPending, isError, error } = useMutation({
    mutationKey: ["reject-discount-request"],
    mutationFn: ({ id, data }) =>
      DiscountService.rejectDiscountRequest(axiosInstance, data, id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tuition-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discount-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["discount-single-application"] });
      toast.success(data?.message ?? "Discount application rejected");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to reject discount application");
    },
  });

  return { rejectDiscount, isPending, isError, error };
};
