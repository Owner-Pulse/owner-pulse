import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, AlertTriangle, CheckCircle2, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateDirector } from "@/hooks/create-director/create-director.hook";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const CreateDirectorForm = ({ onClose }) => {
  const {
    createDirector,
    isLoading,
    isPending,
    error: apiError,
    isSuccess,
    isError
  } = useCreateDirector();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm();

  const onSubmit = (data) => {
    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      role: "director",
      password: data.password,
    };

    if (data.phone?.trim()) {
      payload.phone = data.phone.trim();
    }

    createDirector(payload, {
      onSuccess: () => {
        toast.success(data?.message || "Director created successfully!");
        onClose();
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to create director!");
      }
    });
  };

  const errorMessage = apiError?.response?.data?.message || apiError?.message || (isError ? "Failed to create director." : "");

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

          {isSuccess ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-gray-900">Director Created!</p>
              <p className="text-sm text-gray-500 mt-1">{getValues("name")} has been added. They'll need to log in to activate.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
                  <input type="text"
                    {...register("name", { required: "Name is required" })}
                    placeholder="e.g. Jane Smith"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                  <input type="email"
                    {...register("email", { 
                        required: "Email is required",
                        pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Please enter a valid email address"
                        }
                    })}
                    placeholder="director@hclc.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone (optional)</label>
                  <input type="text"
                    {...register("phone")}
                    placeholder="(813) 555-0000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"}
                      {...register("password", { 
                          required: "Password is required",
                          minLength: { value: 6, message: "Password must be at least 6 characters" }
                      })}
                      placeholder="Min. 6 characters"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-xs text-red-600 font-medium">
                  <AlertTriangle size={14} /> {errorMessage}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={isPending} className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 inline-block align-middle" />
                  ) : (
                    <UserPlus size={16} className="mr-2 inline-block align-middle" /> 
                  )}
                  {isPending ? "Creating..." : "Create Account"}
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
