import { axiosPrivate } from "@/lib/axios.private";
import { ownerTaskAssignService } from "@/services";
import { useQuery } from "@tanstack/react-query";


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
}