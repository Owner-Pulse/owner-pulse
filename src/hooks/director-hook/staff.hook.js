import { axiosPrivate } from "@/lib/axios.private";
import { staffService } from "@/services/staff.service";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── Director Staff Dashboard ───
export const useGetDirectorStaff = (params) => {
    const axiosInstance = axiosPrivate();

    const { data, isError, isLoading, isFetching, error } = useQuery({
        queryKey: ["director-staff", params],
        queryFn: () => staffService.getStaffOnDirectorDashboard(axiosInstance, params),
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    return { data, isLoading, isFetching, isError, error };
};

// Alias for backwards compatibility
export const useGetStaff = useGetDirectorStaff;

// ─── Staff CRUD Mutations ───
export const useAddStaff = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: addStaff, isPending, isError, error } = useMutation({
        mutationKey: ["add-staff"],
        mutationFn: (body) => staffService.addStaff(axiosInstance, body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["director-staff"] });
            queryClient.invalidateQueries({ queryKey: ["owner-staff"] });
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            queryClient.invalidateQueries({ queryKey: ["pto-staff"] });
            toast.success(data?.message ?? "Staff member added successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to add staff member");
        },
    });

    return { addStaff, isPending, isError, error };
};

export const useUpdateStaff = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: updateStaff, isPending, isError, error } = useMutation({
        mutationKey: ["update-staff"],
        mutationFn: ({ staffId, body }) => staffService.updateStaff(axiosInstance, staffId, body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["director-staff"] });
            queryClient.invalidateQueries({ queryKey: ["owner-staff"] });
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            queryClient.invalidateQueries({ queryKey: ["pto-staff"] });
            toast.success(data?.message ?? "Staff member updated successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to update staff member");
        },
    });

    return { updateStaff, isPending, isError, error };
};

export const useDeleteStaff = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: deleteStaff, isPending, isError, error } = useMutation({
        mutationKey: ["delete-staff"],
        mutationFn: (staffId) => staffService.deleteStaff(axiosInstance, staffId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["director-staff"] });
            queryClient.invalidateQueries({ queryKey: ["owner-staff"] });
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            queryClient.invalidateQueries({ queryKey: ["pto-staff"] });
            toast.success(data?.message ?? "Staff member removed successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to delete staff member");
        },
    });

    return { deleteStaff, isPending, isError, error };
};

// ─── PTO staff list ───
export const useGetPtoStaff = (params = { per_page: 1000 }) => {
    const axiosInstance = axiosPrivate();

    const { data, isError, isLoading, isFetching, error } = useQuery({
        queryKey: ["pto-staff", params],
        queryFn: () => staffService.getPtoStaff(axiosInstance, params),
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    const staffList = data?.staff_list?.data ?? (Array.isArray(data?.staff_list) ? data.staff_list : []);

    return { data, staffList, isLoading, isFetching, isError, error };
};

// Note: Director add PTO request
export const useAddPto = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const {
        mutateAsync: addPto,
        isPending,
        isError,
        error
    } = useMutation({
        mutationKey: ["add-pto"],
        mutationFn: (body) => staffService.addPto(axiosInstance, body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["pto-staff"] });
            queryClient.invalidateQueries({ queryKey: ["director-staff"] });
            toast.success(data.message ?? "PTO added successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to add PTO");
        },
    });

    return {
        addPto,
        isPending,
        isError,
        error
    };
};

// Note: Director Substitutes get list
export const useGetSubstitutes = (params) => {
    const { data, isError, isLoading, isFetching, error } = useQuery({
        queryKey: ["substitutes", params],
        queryFn: ({ queryKey }) => {
            const [, qParams] = queryKey;
            const axiosInstance = axiosPrivate();
            return staffService.getSubstitutes(axiosInstance, qParams);
        },
        staleTime: 5 * 60 * 1000,
    });

    return { data, isLoading, isFetching, isError, error };
};

// Note: Director add substitute entry request
export const useAddSubstitution = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const {
        mutateAsync: addSubstitution,
        isPending,
        isError,
        error
    } = useMutation({
        mutationKey: ["add-substitution"],
        mutationFn: (body) => staffService.addSubstitution(axiosInstance, body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["substitutes"] });
            queryClient.invalidateQueries({ queryKey: ["director-staff"] });
            toast.success(data.message ?? "Substitution added successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to add substitution");
        },
    });

    return {
        addSubstitution,
        isPending,
        isError,
        error
    };
};
