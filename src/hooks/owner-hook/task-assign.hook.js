import { axiosPrivate } from "@/lib/axios.private";
import { ownerTaskAssignService } from "@/services/owner-service/task-assign.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// get all task list
export const useGetTaskList = () => {
    const axiosInstance = axiosPrivate();

    const {
        data, isLoading: isTaskListLoading, refetch: refetchTaskList
    } = useQuery({
        queryKey: ["task-list"],
        queryFn: () => ownerTaskAssignService.get_task_list(axiosInstance),
    });

    return {
        taskList: data?.data,
        isTaskListLoading,
        refetchTaskList
    };
};

// create task
export const useCreateTask = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: createTask,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["create-task-list"],
        mutationFn: (payload) => ownerTaskAssignService.create_task(axiosInstance, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Task created successfully");
            queryClient.invalidateQueries(["task-list"]);
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

// in progress task
export const useInProgressTask = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: inProgressTask,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["in-progress-task"],
        mutationFn: (id) => ownerTaskAssignService.in_progress_task(id, axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Task moved to in progress");
            queryClient.invalidateQueries(["task-list"]);
            queryClient.invalidateQueries(["single-task"]);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to update task status");
        }
    });

    return { inProgressTask, isPending, apiError, isSuccess, isError };
};

// complete task
export const useCompleteTask = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: completeTask,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["complete-task"],
        mutationFn: (id) => ownerTaskAssignService.complete_task(id, axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Task completed successfully");
            queryClient.invalidateQueries(["task-list"]);
            queryClient.invalidateQueries(["single-task"]);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to complete task");
        }
    });

    return { completeTask, isPending, apiError, isSuccess, isError };
};

// get single task
export const useGetSingleTask = (id) => {
    const axiosInstance = axiosPrivate();

    const {
        data, isLoading: isTaskLoading, refetch: refetchTask
    } = useQuery({
        queryKey: ["single-task", id],
        queryFn: () => ownerTaskAssignService.get_single_task(id, axiosInstance),
        enabled: !!id,
    });

    return {
        task: data?.data,
        isTaskLoading,
        refetchTask
    };
};

// update task
export const useUpdateTask = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: updateTask,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["update-task"],
        mutationFn: ({ id, payload }) => ownerTaskAssignService.update_task(id, payload, axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Task updated successfully");
            queryClient.invalidateQueries(["task-list"]);
            queryClient.invalidateQueries(["single-task"]);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to update task");
        }
    });

    return { updateTask, isPending, apiError, isSuccess, isError };
};

// delete task
export const useDeleteTask = () => {
    const axiosInstance = axiosPrivate();
    const queryClient = useQueryClient();

    const {
        mutateAsync: deleteTask,
        isPending,
        error: apiError,
        isSuccess,
        isError
    } = useMutation({
        mutationKey: ["delete-task"],
        mutationFn: (id) => ownerTaskAssignService.delete_task(id, axiosInstance),
        onSuccess: (data) => {
            toast.success(data?.message || "Task deleted successfully");
            queryClient.invalidateQueries(["task-list"]);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to delete task");
        }
    });

    return { deleteTask, isPending, apiError, isSuccess, isError };
};
