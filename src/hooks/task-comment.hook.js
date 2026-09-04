import { axiosPrivate } from "@/lib/axios.private";
import { taskCommentService } from "@/services/task-comment.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

/**
 * Fetch task comments from GET /task/comments/:id
 */
export const useGetTaskComments = (taskId, enabled = true) => {
  const axiosInstance = axiosPrivate();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["task-comments", taskId],
    queryFn: () => taskCommentService.getComments(axiosInstance, taskId),
    enabled: enabled && !!taskId,
    staleTime: 30 * 1000,
  });

  const rawData = data?.data;
  const commentsList = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);

  return {
    comments: commentsList,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

/**
 * Post task comment to POST /task/comments/:id
 */
export const usePostTaskComment = () => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  const { mutateAsync: postComment, isPending, isError, error } = useMutation({
    mutationKey: ["post-task-comment"],
    mutationFn: ({ taskId, commentText }) =>
      taskCommentService.postComment(axiosInstance, taskId, commentText),
    onSuccess: (data, variables) => {
      toast.success(data?.message || "Comment posted successfully");
      queryClient.invalidateQueries(["task-comments", variables.taskId]);
      queryClient.invalidateQueries(["task-list"]);
      queryClient.invalidateQueries(["director-task-list"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to post comment");
    },
  });

  return {
    postComment,
    isPending,
    isError,
    error,
  };
};
