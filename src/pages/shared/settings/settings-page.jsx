import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import PasswordCard from "./components/PasswordCard";
import DirectorAccountCard from "./components/DirectorAccountCard";
import { useGetUser } from "@/hooks/auth/user-details.hook";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const SettingsPage = () => {
  const { user, refetch } = useGetUser();
  const navigate = useNavigate();
  const role = user?.role || "owner";

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings and security
        </p>
      </div>

      {/* Change Password */}
      <PasswordCard />

      {/* Director Account Management — owners only */}
      {role === "owner" && (
        <DirectorAccountCard onNavigate={() => navigate("/owner/director-management")} />
      )}
    </motion.div>
  );
};

export default SettingsPage;
