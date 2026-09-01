import { useInProgressTask, useCompleteTask, useDeleteTask, useUpdateTask } from "@/hooks/owner-hook/task-assign.hook";
import { useInProgressDirectorTask, useCompleteDirectorTask, useDeleteDirectorTask, useUpdateDirectorTask } from "@/hooks/director-hook/task-assign.hook";

/**
 * Returns the correct task action hooks based on the user's role.
 * Only the hooks for the active role will fire real API calls.
 */
export const useOwnerTaskActions = () => {
  const { inProgressTask, isPending: isInProgressPending } = useInProgressTask();
  const { completeTask, isPending: isCompleting } = useCompleteTask();
  const { deleteTask, isPending: isDeleting } = useDeleteTask();
  const { updateTask, isPending: isUpdating } = useUpdateTask();
  return { inProgressTask, isInProgressPending, completeTask, isCompleting, deleteTask, isDeleting, updateTask, isUpdating };
};

export const useDirectorTaskActions = () => {
  const { inProgressTask, isPending: isInProgressPending } = useInProgressDirectorTask();
  const { completeTask, isPending: isCompleting } = useCompleteDirectorTask();
  const { deleteTask, isPending: isDeleting } = useDeleteDirectorTask();
  const { updateTask, isPending: isUpdating } = useUpdateDirectorTask();
  return { inProgressTask, isInProgressPending, completeTask, isCompleting, deleteTask, isDeleting, updateTask, isUpdating };
};
