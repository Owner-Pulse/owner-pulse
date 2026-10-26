import { axiosPrivate } from "@/lib/axios.private";
import { taskCommentService } from "@/services/task-comment.service";
import { maintenanceCommentService } from "@/services/maintenance-comment.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getFieldErrors } from "@/lib/api-errors";

const commentList = (data) => {
  const rawData = data?.data;
  return Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
};

const commentError = (err, fallback) => {
  const fields = getFieldErrors(err);
  return fields.comment || err?.response?.data?.message || fallback;
};

export const useItemComments = (kind, itemId, enabled = true) => {
  const axiosInstance = axiosPrivate();
  const isMaintenance = kind === "maintenance";

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [isMaintenance ? "maintenance-comments" : "task-comments", itemId],
    queryFn: () => isMaintenance
      ? maintenanceCommentService.getComments(axiosInstance, itemId)
      : taskCommentService.getComments(axiosInstance, itemId),
    enabled: enabled && !!itemId,
    staleTime: 30 * 1000,
  });

  return {
    comments: commentList(data),
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

export const useGetTaskComments = (taskId, enabled = true) => useItemComments("task", taskId, enabled);

export const useGetMaintenanceComments = (requestId, enabled = true) => useItemComments("maintenance", requestId, enabled);

export const usePostItemComment = (kind = "task") => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();
  const isMaintenance = kind === "maintenance";

  const { mutateAsync: postComment, isPending, isError, error } = useMutation({
    mutationKey: [isMaintenance ? "post-maintenance-comment" : "post-task-comment"],
    mutationFn: ({ taskId, itemId, commentText }) => {
      const id = itemId ?? taskId;
      return isMaintenance
        ? maintenanceCommentService.postComment(axiosInstance, id, commentText)
        : taskCommentService.postComment(axiosInstance, id, commentText);
    },
    onSuccess: (data, variables) => {
      const id = variables.itemId ?? variables.taskId;
      toast.success(data?.message || "Comment posted successfully");
      queryClient.invalidateQueries({ queryKey: [isMaintenance ? "maintenance-comments" : "task-comments", id] });
      queryClient.invalidateQueries({ queryKey: ["task-list"] });
      queryClient.invalidateQueries({ queryKey: ["director-task-list"] });
      queryClient.invalidateQueries({ queryKey: ["owner-maintenance-list"] });
      queryClient.invalidateQueries({ queryKey: ["director-maintenance-list"] });
      queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
      queryClient.invalidateQueries({ queryKey: ["director-overview"] });
    },
    onError: (err) => {
      toast.error(commentError(err, "Failed to post comment"));
    },
  });

  return { postComment, isPending, isError, error };
};

export const usePostTaskComment = () => usePostItemComment("task");

export const usePostMaintenanceComment = () => usePostItemComment("maintenance");
