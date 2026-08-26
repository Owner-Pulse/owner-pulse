import { axiosPrivate } from "@/lib/axios.private";
import { staffService } from "@/services/staff.service";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── Owner Staff Dashboard ───
export const useGetOwnerStaff = (params) => {
    const axiosInstance = axiosPrivate();

    const { data, isError, isLoading, isFetching, error } = useQuery({
        queryKey: ["owner-staff", params],
        queryFn: () => staffService.getStaffOnOwnerDashboard(axiosInstance, params),
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    return { data, isLoading, isFetching, isError, error };
};

// Alias for backwards compatibility
export const useGetStaff = useGetOwnerStaff;

// ─── Staff CRUD Mutations for Owner ───
export const useAddStaff = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const { mutateAsync: addStaff, isPending, isError, error } = useMutation({
        mutationKey: ["add-staff"],
        mutationFn: (body) => staffService.addStaff(axiosInstance, body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["owner-staff"] });
            queryClient.invalidateQueries({ queryKey: ["director-staff"] });
            queryClient.invalidateQueries({ queryKey: ["staff"] });
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
            queryClient.invalidateQueries({ queryKey: ["owner-staff"] });
            queryClient.invalidateQueries({ queryKey: ["director-staff"] });
            queryClient.invalidateQueries({ queryKey: ["staff"] });
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
            queryClient.invalidateQueries({ queryKey: ["owner-staff"] });
            queryClient.invalidateQueries({ queryKey: ["director-staff"] });
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            toast.success(data?.message ?? "Staff member removed successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to delete staff member");
        },
    });

    return { deleteStaff, isPending, isError, error };
};
