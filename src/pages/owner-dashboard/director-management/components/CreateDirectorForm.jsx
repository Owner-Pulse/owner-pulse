import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, AlertTriangle, CheckCircle2, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CreateDirectorForm = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "Director" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    onAdd({
      id: Date.now(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || "(813) 555-0000",
      status: "pending",
      created: new Date().toISOString().split("T")[0],
      lastLogin: null,
      role: form.role,
      department: "Administration",
      bio: "",
      tasksCompleted: 0,
      logEntries: 0,
      avatar: null,
    });

    setSuccess(true);
    setTimeout(() => onClose(), 1500);
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Director Account</h2>
              <p className="text-sm text-gray-500 mt-0.5">Add a new director to manage school operations</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {success ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-gray-900">Director Created!</p>
              <p className="text-sm text-gray-500 mt-1">{form.name} has been added. They'll need to log in to activate.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
                  <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Jane Smith" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                    placeholder="director@hclc.com" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone (optional)</label>
                  <input type="text" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                    placeholder="(813) 555-0000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Role</label>
                  <select value={form.role} onChange={(e) => update("role", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                    <option value="Director">Director</option>
                    <option value="Assistant Director">Assistant Director</option>
                    <option value="Operations Manager">Operations Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Min. 6 characters" required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-xs text-red-600 font-medium">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
                  <UserPlus size={16} className="mr-2" /> Create Account
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CreateDirectorForm;
