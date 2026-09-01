import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetAllDirector } from "@/hooks/owner-hook/create-director.hook";

const EditTaskModal = ({ task, onClose, currentRole, updateTask, isUpdating }) => {
  const { allDirector } = useGetAllDirector();

  const formattedDueDate = task.due ? task.due.slice(0, 10) : "";

  const [title, setTitle] = useState(task.title || "");
  const [assignee, setAssignee] = useState(task.raw?.assigned_to || (currentRole === "owner" ? "" : "1"));
  const [priority, setPriority] = useState(task.priority || "medium");
  const [status, setStatus] = useState(task.raw?.status || task.status || "pending");
  const [due, setDue] = useState(formattedDueDate);
  const [description, setDescription] = useState(task.description || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !due || !description.trim()) return;

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("priority", priority);
    formData.append("due_date", due);
    if (assignee) formData.append("assigned_to", assignee);
    formData.append("description", description.trim());
    formData.append("status", status);

    updateTask(
      { id: task.id, payload: formData },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
              <p className="text-sm text-gray-500 mt-0.5">Update task details and status</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent appearance-none bg-white font-medium"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="delayed">Delayed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent appearance-none bg-white font-medium"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assign To</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent appearance-none bg-white font-medium"
                >
                  {currentRole === "owner" ? (
                    <>
                      <option value="" disabled>Select a director</option>
                      {allDirector?.map((director) => (
                        <option key={director?.id} value={director?.id} className="capitalize">
                          {director?.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="1">Owner</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description..."
                required
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
