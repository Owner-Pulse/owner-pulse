import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetUser, useChangeOwnerPassword, useChangeDirectorPassword } from "@/hooks";
import toast from "react-hot-toast";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const PasswordCard = () => {
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const { user } = useGetUser();
  const role = user?.role || "owner";
  
  const { changeOwnerPassword, isPending: ownerIsPending } = useChangeOwnerPassword();
  const { changeDirectorPassword, isPending: directorIsPending } = useChangeDirectorPassword();
  
  const submitChangePassword = role === "director" ? changeDirectorPassword : changeOwnerPassword;
  const isPending = role === "director" ? directorIsPending : ownerIsPending;

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.new_password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New passwords do not match.");
      return;
    }

    const formData = new FormData();
    formData.append("current_password", passwordForm.current_password);
    formData.append("new_password", passwordForm.new_password);
    formData.append("confirm_password", passwordForm.confirm_password);

    submitChangePassword(formData, {
      onSuccess: (data) => {
        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
        setPasswordSaved(true);
        toast.success(data?.message || "Password updated successfully");
      },
      onError: (error) => {
        const errorMsg = error?.response?.data?.message || "Failed to update password";
        setPasswordError(errorMsg);
        toast.error(errorMsg);
      }
    });
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Lock size={16} /> Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  placeholder="Enter current password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    placeholder="Re-enter new password"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />} {showPasswords ? "Hide" : "Show"} passwords
              </button>
            </div>
            {passwordError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-600 font-medium flex items-center gap-1"
              >
                <AlertTriangle size={12} /> {passwordError}
              </motion.p>
            )}
            {passwordSaved && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-emerald-600 font-medium flex items-center gap-1"
              >
                <CheckCircle2 size={12} /> Password updated successfully
              </motion.p>
            )}
            <Button type="submit" disabled={isPending} className="bg-[#1E3A5F] hover:bg-[#15294A] text-white">
              <KeyRound size={14} className="mr-2" /> {isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PasswordCard;
