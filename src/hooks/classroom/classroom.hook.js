import { axiosPrivate } from "@/lib/axios.private";
import { classroomService } from "@/services/classroom/classroom.service";
import { GetAllClassroom } from "@/services/all-classroom.service";
import { useQuery } from "@tanstack/react-query";

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
export const useGetClassroom = ({ filter = "All Classrooms", per_page = 10, page = 1 } = {}) => {

    const {
        data,
        isError,
        isLoading,
        isFetching,
        error,
    } = useQuery({
        queryKey: ["classroom", filter, per_page, page],
        queryFn: ({ queryKey }) => {
            // Destructure directly from queryKey to avoid stale closure issues
            const [, qFilter, qPerPage, qPage] = queryKey;
            // Create a fresh axios instance at fetch time (axiosPrivate is a plain fn, not a hook)
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
