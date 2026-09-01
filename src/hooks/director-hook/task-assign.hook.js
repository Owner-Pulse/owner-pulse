import { axiosPrivate } from "@/lib/axios.private";
import { directorTaskAssignService } from "@/services/director-service/task-assign.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// get all director task list
export const useGetDirectorTaskList = () => {
    const axiosInstance = axiosPrivate();

    const {
        data, isLoading: isTaskListLoading, refetch: refetchTaskList
    } = useQuery({
        queryKey: ["director-task-list"],
        queryFn: () => directorTaskAssignService.get_task_list(axiosInstance),
    });

    const rawData = data?.data;
    const taskList = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData?.data : []);

    return {
        taskList,
        isTaskListLoading,
        refetchTaskList
    };
};

// create director task
export const useCreateDirectorTask = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: createTask,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["create-director-task"],
        mutationFn: (payload) => directorTaskAssignService.create_task(axiosInstance, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Task created successfully");
            queryClient.invalidateQueries(["director-task-list"]);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to create task");
        }
    });

    return {
        createTask,
        isPending,
        apiError,
        isSuccess,
        isError
    };
};

// in progress director task
export const useInProgressDirectorTask = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: inProgressTask,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["in-progress-director-task"],
        mutationFn: (id) => directorTaskAssignService.in_progress_task(id, axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Task moved to in progress");
            queryClient.invalidateQueries(["director-task-list"]);
            queryClient.invalidateQueries(["single-director-task"]);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to update task status");
        }
    });

    return { inProgressTask, isPending, apiError, isSuccess, isError };
};

// complete director task
export const useCompleteDirectorTask = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: completeTask,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["complete-director-task"],
        mutationFn: (id) => directorTaskAssignService.complete_task(id, axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Task completed successfully");
            queryClient.invalidateQueries(["director-task-list"]);
            queryClient.invalidateQueries(["single-director-task"]);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to complete task");
        }
    });

    return { completeTask, isPending, apiError, isSuccess, isError };
};

// get single director task
export const useGetSingleDirectorTask = (id) => {
    const axiosInstance = axiosPrivate();

    const {
        data, isLoading: isTaskLoading, refetch: refetchTask
    } = useQuery({
        queryKey: ["single-director-task", id],
        queryFn: () => directorTaskAssignService.get_single_task(id, axiosInstance),
        enabled: !!id,
    });

    return {
        task: data?.data,
        isTaskLoading,
        refetchTask
    };
};

// update director task
export const useUpdateDirectorTask = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: updateTask,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["update-director-task"],
        mutationFn: ({ id, payload }) => directorTaskAssignService.update_task(id, payload, axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Task updated successfully");
            queryClient.invalidateQueries(["director-task-list"]);
            queryClient.invalidateQueries(["single-director-task"]);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to update task");
        }
    });

    return { updateTask, isPending, apiError, isSuccess, isError };
};

// delete director task
export const useDeleteDirectorTask = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: deleteTask,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["delete-director-task"],
        mutationFn: (id) => directorTaskAssignService.delete_task(id, axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Task deleted successfully");
            queryClient.invalidateQueries(["director-task-list"]);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to delete task");
        }
    });

    return { deleteTask, isPending, apiError, isSuccess, isError };
};
