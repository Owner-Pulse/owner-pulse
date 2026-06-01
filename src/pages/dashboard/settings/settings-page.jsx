import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Users,
  KeyRound,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const getCurrentUser = () =>
  JSON.parse(localStorage.getItem("user") || '{"role":"owner","name":"John Doe","email":"john@hclc.com"}');

const SettingsPage = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const role = currentUser.role;

  // ─── Name Update ────────────────────────────────────────────────
  const [nameForm, setNameForm] = useState({ name: currentUser.name || "" });
  const [nameSaved, setNameSaved] = useState(false);

  const handleNameUpdate = (e) => {
    e.preventDefault();
    if (!nameForm.name.trim()) return;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.name = nameForm.name.trim();
    localStorage.setItem("user", JSON.stringify(user));
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  };

  // ─── Password Update ────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.newPass.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  // ─── (Director account creation moved to Director Management page) ──

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings and security
        </p>
      </div>

      {/* ─── Update Name ─────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <User size={16} /> Profile Name
            </CardTitle>
            <CardDescription>Update your display name across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNameUpdate} className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input
                  type="text" value={nameForm.name}
                  onChange={(e) => setNameForm({ name: e.target.value })}
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button type="submit" className="bg-[#0A0F1E] hover:bg-black text-white whitespace-nowrap">
                <Save size={14} className="mr-2" /> Update
              </Button>
            </form>
            {nameSaved && (
              <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 size={12} /> Name updated successfully
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Update Password ─────────────────────────────────── */}
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
                    type={showPasswords ? "text" : "password"} value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    placeholder="Enter current password" required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"} value={passwordForm.newPass}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                      placeholder="Min. 6 characters" required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"} value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      placeholder="Re-enter new password" required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowPasswords(!showPasswords)}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />} {showPasswords ? "Hide" : "Show"} passwords
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertTriangle size={12} /> {passwordError}
                </p>
              )}
              {passwordSaved && (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} /> Password updated successfully
                </p>
              )}
              <Button type="submit" className="bg-[#0A0F1E] hover:bg-black text-white">
                <KeyRound size={14} className="mr-2" /> Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
      {/* ─── Director Account Management ────────────────────── */}
      {role === "owner" && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><Users size={22} className="text-blue-600" /></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Director Account Management</p>
                  <p className="text-xs text-gray-500 mt-0.5">Create and manage director accounts from the dedicated management page.</p>
                </div>
                <Button className="bg-[#0A0F1E] hover:bg-black text-white shrink-0" onClick={() => navigate("/dashboard/director-management")}>
                  <Users size={14} className="mr-2" /> Go to Director Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SettingsPage;
