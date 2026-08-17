import { axiosPrivate } from "@/lib/axios.private";
import { staffService } from "@/services/staff";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── Staff Dashboard 
export const useGetStaff = () => {
    const axiosInstance = axiosPrivate();

    const { data, isError, isLoading, error } = useQuery({
        queryKey: ["staff"],
        queryFn: () => staffService.getStaff(axiosInstance),
    });

    return { data, isLoading, isError, error };
};

// ─── PTO 
export const useGetPtoStaff = (params) => {
    const { data, isError, isLoading, isFetching, error } = useQuery({
        queryKey: ["pto-staff", params],
        queryFn: ({ queryKey }) => {
            const [, qParams] = queryKey;
            const axiosInstance = axiosPrivate();
            return staffService.getPtoStaff(axiosInstance, qParams);
        },
        staleTime: 5 * 60 * 1000,
    });

    return { data, isLoading, isFetching, isError, error };
};

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
            toast.success(data.message ?? "PTO added successfully")
        },
        onError: (err) => {
            toast.error(err.message ?? "Failed to add PTO")
        },
    });

    return {
        addPto,
        isPending,
        isError,
        error
    };
};

// ─── Substitutes
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

export const useAddSubstitution = () => {
    const queryClient = useQueryClient();

    const { mutate, mutateAsync, isPending, isError, error } = useMutation({
        mutationFn: (body) => {
            const axiosInstance = axiosPrivate();
            return staffService.addSubstitution(axiosInstance, body);
        },
        onSuccess: () => {
            // Invalidate substitutes list so it refetches with the new entry
            queryClient.invalidateQueries({ queryKey: ["substitutes"] });
        },
        onError: (err) => {
            console.error("Failed to add substitution:", err);
        },
    });

    return { mutate, mutateAsync, isPending, isError, error };
};