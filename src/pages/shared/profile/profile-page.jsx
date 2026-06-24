import React, { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Save, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileHeader from "./components/ProfileHeader";
import ProfileBioCard from "./components/ProfileBioCard";
import ContactInfoCard from "./components/ContactInfoCard";
import AccountDetailsCard from "./components/AccountDetailsCard";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const getCurrentUser = () =>
  JSON.parse(localStorage.getItem("user") || '{"role":"owner","name":"John Doe","email":"john@hclc.com"}');

const PROFILE_DATA = {
  owner: {
    initials: "JD",
    memberSince: "2019-08-01",
    lastLogin: "2026-05-11 08:23 AM",
    phone: "(555) 123-4567",
    location: "Orlando, FL",
    title: "School Owner & Director",
    bio: "Leading HCLC with a passion for early childhood education and operational excellence.",
    achievements: [
      { label: "Years of Service", value: "7" },
      { label: "Licenses Held", value: "3" },
      { label: "Workshops Completed", value: "12" },
    ],
  },
  director: {
    initials: "SK",
    memberSince: "2023-01-15",
    lastLogin: "2026-05-11 07:54 AM",
    phone: "(555) 987-6543",
    location: "Orlando, FL",
    title: "School Director",
    bio: "Dedicated to fostering a positive learning environment for students and staff.",
    achievements: [
      { label: "Years of Service", value: "3" },
      { label: "Licenses Held", value: "2" },
      { label: "Workshops Completed", value: "8" },
    ],
  },
};

const ProfilePage = () => {
  const currentUser = getCurrentUser();
  const role = currentUser.role;
  const profile = { ...PROFILE_DATA[role] || PROFILE_DATA.owner, role };

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: currentUser.name || "John Doe",
    email: currentUser.email || "john@hclc.com",
    phone: profile.phone,
    bio: profile.bio,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.name = form.name;
    user.email = form.email;
    user.phone = form.phone;
    user.bio = form.bio;
    localStorage.setItem("user", JSON.stringify(user));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setForm({
      name: currentUser.name || "John Doe",
      email: currentUser.email || "john@hclc.com",
      phone: profile.phone,
      bio: profile.bio,
    });
    setEditing(false);
  };

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information and account details</p>
        </div>
        {!editing ? (
          <Button variant="outline" className="border-gray-200" onClick={() => setEditing(true)}>
            <Edit3 size={14} className="mr-2" /> Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-gray-200" onClick={handleCancel}>
              <X size={14} className="mr-2" /> Cancel
            </Button>
            <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white" onClick={handleSave}>
              <Save size={14} className="mr-2" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Success toast */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium"
        >
          <CheckCircle2 size={16} /> Profile updated successfully
        </motion.div>
      )}

      {/* Profile Card with Avatar */}
      <ProfileHeader
        profile={profile}
        form={form}
        editing={editing}
        onFormChange={setForm}
      />

      {/* Bio */}
      <ProfileBioCard
        bio={form.bio}
        editing={editing}
        onFormChange={setForm}
      />

      {/* Contact & Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContactInfoCard
          form={form}
          editing={editing}
          onFormChange={setForm}
          location={profile.location}
        />
        <AccountDetailsCard profile={profile} />
      </div>
    </motion.div>
  );
};

export default ProfilePage;
