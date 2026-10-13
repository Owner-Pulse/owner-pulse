import { axiosPrivate } from "@/lib/axios.private";
import { ownerTaskAssignService } from "@/services/owner-service/task-assign.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchAllPages } from "@/lib/fetch-all-pages";
import { hasValidationErrors } from "@/lib/escalation";

// get all task list
export const useGetTaskList = () => {
    const axiosInstance = axiosPrivate();

    const {
        data, isLoading: isTaskListLoading, refetch: refetchTaskList
    } = useQuery({
        queryKey: ["task-list"],
        // The page works on the whole list (tabs, counts), so load every page
        queryFn: () => fetchAllPages((page) => ownerTaskAssignService.get_task_list(axiosInstance, { page, per_page: 100 })),
    });

    const taskList = Array.isArray(data) ? data : [];

    return {
        taskList,
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
            // 422 field errors are shown under their fields by the form
            if (hasValidationErrors(error)) return;
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
