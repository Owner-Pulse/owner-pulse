import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import ProfileNameCard from "./components/ProfileNameCard";
import PasswordCard from "./components/PasswordCard";
import DirectorAccountCard from "./components/DirectorAccountCard";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const getCurrentUser = () =>
  JSON.parse(localStorage.getItem("user") || '{"role":"owner","name":"John Doe","email":"john@hclc.com"}');

const SettingsPage = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const role = currentUser.role;

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings and security
        </p>
      </div>

      {/* Profile Name */}
      <ProfileNameCard currentName={currentUser.name} />

      {/* Change Password */}
      <PasswordCard />

      {/* Director Account Management — owners only */}
      {role === "owner" && (
        <DirectorAccountCard onNavigate={() => navigate("/dashboard/director-management")} />
      )}
    </motion.div>
  );
};

export default SettingsPage;
