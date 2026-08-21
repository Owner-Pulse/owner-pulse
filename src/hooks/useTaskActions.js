import { useInProgressTask, useCompleteTask, useDeleteTask } from "@/hooks/owner-hook/task-assign.hook";
import { useInProgressDirectorTask, useCompleteDirectorTask, useDeleteDirectorTask } from "@/hooks/director-hook/task-assign.hook";

/**
 * Returns the correct task action hooks based on the user's role.
 * Only the hooks for the active role will fire real API calls.
 */
export const useOwnerTaskActions = () => {
  const { inProgressTask, isPending: isInProgressPending } = useInProgressTask();
  const { completeTask, isPending: isCompleting } = useCompleteTask();
  const { deleteTask, isPending: isDeleting } = useDeleteTask();
  return { inProgressTask, isInProgressPending, completeTask, isCompleting, deleteTask, isDeleting };
};

export const useDirectorTaskActions = () => {
  const { inProgressTask, isPending: isInProgressPending } = useInProgressDirectorTask();
  const { completeTask, isPending: isCompleting } = useCompleteDirectorTask();
  const { deleteTask, isPending: isDeleting } = useDeleteDirectorTask();
  return { inProgressTask, isInProgressPending, completeTask, isCompleting, deleteTask, isDeleting };
};
