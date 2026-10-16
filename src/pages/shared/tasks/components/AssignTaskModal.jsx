import React, { useState } from "react";
import { X, Send, ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetAllDirector } from "@/hooks/owner-hook/create-director.hook";
import { useCreateTask } from "@/hooks/owner-hook/task-assign.hook";
import { useCreateDirectorTask } from "@/hooks/director-hook/task-assign.hook";
import { EscalationQuestions, escalationModal } from "@/components/EscalationPrompt";
import {
  EMPTY_ESCALATION,
  cleanEscalation,
  clearEditedErrors,
  hasEscalationError,
  isEscalationValid,
  parseValidationErrors,
} from "@/lib/escalation";
import { todayYmd } from "@/lib/datetime";
import { useGetUser } from "@/hooks/auth/user-details.hook";

const TASK_FIELDS = ["title", "priority", "due_date", "assigned_to", "description"];

const FieldError = ({ message }) =>
  message ? <p className="mt-1 text-[11px] font-medium text-[#8A362C] break-words">{message}</p> : null;

const AssignTaskModal = ({ onClose, onAssign, currentRole }) => {
  const isDirector = currentRole === "director";
  const { user } = useGetUser();
  const currentUserId = user?.id ? String(user.id) : "";
  const { allDirector } = useGetAllDirector();
  const { createTask: ownerCreateTask, isPending: ownerPending } = useCreateTask();
  const { createTask: directorCreateTask, isPending: directorPending } = useCreateDirectorTask();

  const createTask = isDirector ? directorCreateTask : ownerCreateTask;
  const isPending = isDirector ? directorPending : ownerPending;

  const directorsList = React.useMemo(() => {
    return Array.isArray(allDirector) ? allDirector : [];
  }, [allDirector]);

  const [title, setTitle] = useState("");
  const defaultTargetDirectorId = directorsList?.[0]?.id ? String(directorsList[0].id) : "1";
  const [assignee, setAssignee] = useState(currentRole === "owner" ? defaultTargetDirectorId : "owner");

  React.useEffect(() => {
    if (currentRole === "owner" && directorsList && directorsList.length > 0) {
      const exists = directorsList.some((d) => String(d.id) === String(assignee));
      if (!assignee || !exists) {
        setAssignee(String(directorsList[0].id));
      }
    }
  }, [directorsList, currentRole]);

  const [priority, setPriority] = useState("medium");
  const [due, setDue] = useState("");
  const [description, setDescription] = useState("");

  // Director → Owner: the task fields are step 1, the two escalation questions are step 2
  const [step, setStep] = useState(1);
  const [escalation, setEscalation] = useState(EMPTY_ESCALATION);
  const [errors, setErrors] = useState({});

  const fieldsFilled = !!title.trim() && !!due && !!assignee && !!description.trim();
  const onQuestions = isDirector && step === 2;
  const canSend = !isPending && (!onQuestions || isEscalationValid(escalation));
  const taskFieldErrors = TASK_FIELDS.filter((f) => errors[f]);
  // Messages for anything that has no field of its own on screen
  const otherErrors = Object.keys(errors).filter((f) => !TASK_FIELDS.includes(f) && !(f in EMPTY_ESCALATION));
  const boxErrors = onQuestions ? [...taskFieldErrors, ...otherErrors] : otherErrors;

  const changeEscalation = (next) => {
    setErrors((prev) => clearEditedErrors(prev, escalation, next));
    setEscalation(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fieldsFilled) return;
    const assignToSelf = isDirector && currentUserId && String(assignee) === currentUserId;

    if (isDirector && step === 1 && !assignToSelf) {
      setStep(2);
      return;
    }
    if (!canSend) return;
    setErrors({});

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("priority", priority);
    formData.append("due_date", due);
    formData.append("assigned_to", assignee);
    formData.append("description", description.trim());
    if (isDirector) {
      Object.entries(cleanEscalation(escalation)).forEach(([key, value]) => {
        formData.append(`escalation[${key}]`, value);
      });
    }

    try {
      await createTask(formData);
    } catch (err) {
      // Put each 422 error under its field (the hook shows a toast for anything else)
      const fieldErrors = parseValidationErrors(err);
      setErrors(fieldErrors);
      // Nothing wrong with the answers: go back to the fields that need fixing
      if (isDirector && TASK_FIELDS.some((f) => fieldErrors[f]) && !hasEscalationError(fieldErrors)) setStep(1);
      return;
    }

    if (onAssign) {
      // Keep optimistic update for instant UI feedback if needed, but the refetch will replace it anyway
      onAssign({
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        assignee: currentRole === "owner" ? "director" : "owner",
        assignedBy: currentRole,
        priority,
        status: "open",
        due,
        createdAt: todayYmd(),
      });
    }
    onClose();
  };

  // The questions step opens up to the wide two-column layout on desktop
  const modal = escalationModal(onQuestions);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={modal.panel} onClick={(e) => e.stopPropagation()}>
          <div className={`flex items-center justify-between ${modal.header}`}>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isDirector ? "Send Task to Owner" : "Assign Task"}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isDirector
                  ? `Step ${step} of 2 · ${step === 1 ? "Task details" : "Two questions for the Owner"}`
                  : "Create a task for your team"}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={modal.form}>
            <div className={modal.body}>
            {!onQuestions && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Task Title</label>
                  <input
                    type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Order classroom supplies"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
                  />
                  <FieldError message={errors.title} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Assign To</label>
                    <select value={assignee} onChange={(e) => setAssignee(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent appearance-none bg-white font-medium cursor-pointer">
                      {currentRole === "owner" ? (
                        <>
                          {currentUserId && (
                            <option value={currentUserId}>Myself</option>
                          )}
                          {directorsList && directorsList.length > 0 ? (
                            directorsList.map((dir) => (
                              <option key={dir.id} value={dir.id}>
                                {dir.name || `Director #${dir.id}`}
                              </option>
                            ))
                          ) : (
                            <option value="1">Director</option>
                          )}
                        </>
                      ) : (
                        <>
                          <option value="owner">Owner</option>
                          {currentUserId && (
                            <option value={currentUserId}>Myself</option>
                          )}
                        </>
                      )}
                    </select>
                    <FieldError message={errors.assigned_to} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent appearance-none bg-white cursor-pointer">
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <FieldError message={errors.priority} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date" value={due} onChange={(e) => setDue(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
                  />
                  <FieldError message={errors.due_date} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Please ensure all forms are signed..."
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent resize-none"
                  />
                  <FieldError message={errors.description} />
                </div>
              </>
            )}

            {onQuestions && (
              <EscalationQuestions
                value={escalation}
                onChange={changeEscalation}
                errors={errors}
                disabled={isPending}
                leading={
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 break-words">
                    <span className="font-bold text-gray-900">{title.trim()}</span> · due {due}
                  </div>
                }
              />
            )}

            {boxErrors.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-[#AE4A3E]/10 rounded-xl text-xs text-[#8A362C] font-medium">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span className="min-w-0 break-words">{boxErrors.map((f) => errors[f]).join(" ")}</span>
              </div>
            )}
            </div>

            <div className={modal.footer}>
              {onQuestions ? (
                <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isPending} className="flex-1">
                  <ArrowLeft size={16} className="mr-2" /> Back
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              )}
              {isDirector && step === 1 ? (
                <Button type="submit" className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
                  Continue <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={!canSend} className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Send size={16} className="mr-2" />
                  )}
                  {isDirector ? (isPending ? "Sending..." : "Send to Owner") : isPending ? "Assigning..." : "Assign Task"}
                </Button>
              )}
            </div>
          </form>
      </div>
    </div>
  );
};

export default AssignTaskModal;
