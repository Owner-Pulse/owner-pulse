import { axiosPrivate } from "@/lib/axios.private";
import { classroomService } from "@/services/classroom/classroom.service";
import { GetAllClassroom } from "@/services/all-classroom.service";
import { allStaffsService } from "@/services/all-stuffs.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const DEFAULT_CLASSROOMS = [
    { id: 1, classroom_name: "Ones", capacity: 20 },
    { id: 2, classroom_name: "VPK A", capacity: 20 },
    { id: 3, classroom_name: "7/8 Grade", capacity: 20 },
    { id: 4, classroom_name: "Twos", capacity: 20 },
    { id: 5, classroom_name: "Kindergarten", capacity: 20 },
    { id: 6, classroom_name: "1st/2nd Grade", capacity: 20 },
    { id: 7, classroom_name: "VPK B (Mrs.Johnson)", capacity: 20 },
    { id: 8, classroom_name: "Threes", capacity: 20 },
    { id: 9, classroom_name: "3rd/4th Grade", capacity: 20 },
    { id: 10, classroom_name: "5th/6th Grade (Ms.Stinson)", capacity: 20 }
];

// Fetch all staff / employees to assign as classroom teachers
export const useGetAllStaffs = (params = {}) => {
    const {
        data,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["all-staffs-list", params],
        queryFn: () => {
            const axiosInstance = axiosPrivate();
            return allStaffsService.get_all_staffs(axiosInstance, params);
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const staffsList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

    return {
        staffs: staffsList,
        isLoading,
        isError,
        error
    };
};

// Fetch all classrooms from procare endpoint
export const useGetAllClassrooms = () => {
    const {
        data,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["all-procare-classrooms"],
        queryFn: () => {
            const axiosInstance = axiosPrivate();
            return GetAllClassroom.getAllClassroom(axiosInstance);
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const classroomsList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : DEFAULT_CLASSROOMS;

    return {
        classrooms: classroomsList,
        isLoading,
        isError,
        error
    };
};

// Data from the dashboard classroom API ( pnl lists )
export const useGetClassroom = ({ filter = "All Classrooms", per_page = 50, page = 1 } = {}) => {

    const {
        data,
        isError,
        isLoading,
        isFetching,
        error,
    } = useQuery({
        queryKey: ["classroom", filter, per_page, page],
        queryFn: ({ queryKey }) => {
            const [, qFilter, qPerPage, qPage] = queryKey;
            const axiosInstance = axiosPrivate();
            return classroomService.getClassroom(axiosInstance, {
                filter: qFilter,
                per_page: qPerPage,
                page: qPage,
            });
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: (previousData) => previousData,
    });

    return {
        data,
        isLoading,
        isFetching,
        isError,
        error,
    };
};

// Fetch single classroom economics / detail data
export const useGetSingleClassroom = (id) => {
    const {
        data,
        isLoading,
        isFetching,
        isError,
        error
    } = useQuery({
        queryKey: ["single-classroom", id],
        queryFn: () => {
            const axiosInstance = axiosPrivate();
            return classroomService.getSingleClassroom(axiosInstance, id);
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const classroomData = data?.data ?? data;

    return {
        data: classroomData,
        isLoading,
        isFetching,
        isError,
        error
    };
};

// ─── Classroom Mutations ───

export const useAddClassroom = () => {
    const queryClient = useQueryClient();

    const { mutateAsync: addClassroom, isPending, isError, error } = useMutation({
        mutationKey: ["add-classroom"],
        mutationFn: (body) => {
            const axiosInstance = axiosPrivate();
            return classroomService.addClassroom(axiosInstance, body);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["classroom"] });
            queryClient.invalidateQueries({ queryKey: ["all-procare-classrooms"] });
            toast.success(data?.message ?? "Classroom created successfully.");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to create classroom.");
        },
    });

    return { addClassroom, isPending, isError, error };
};

export const useUpdateClassroom = () => {
    const queryClient = useQueryClient();

    const { mutateAsync: updateClassroom, isPending, isError, error } = useMutation({
        mutationKey: ["update-classroom"],
        mutationFn: ({ data, id }) => {
            const axiosInstance = axiosPrivate();
            return classroomService.updateClassroom(axiosInstance, data, id);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["classroom"] });
            queryClient.invalidateQueries({ queryKey: ["all-procare-classrooms"] });
            toast.success(data?.message ?? "Classroom updated successfully.");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to update classroom.");
        },
    });

    return { updateClassroom, isPending, isError, error };
};

export const useDeleteClassroom = () => {
    const queryClient = useQueryClient();

    const { mutateAsync: deleteClassroom, isPending, isError, error } = useMutation({
        mutationKey: ["delete-classroom"],
        mutationFn: (id) => {
            const axiosInstance = axiosPrivate();
            return classroomService.deleteClassroom(axiosInstance, id);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["classroom"] });
            queryClient.invalidateQueries({ queryKey: ["all-procare-classrooms"] });
            toast.success(data?.message ?? "Classroom deleted successfully.");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to delete classroom.");
        },
    });

    return { deleteClassroom, isPending, isError, error };
};
