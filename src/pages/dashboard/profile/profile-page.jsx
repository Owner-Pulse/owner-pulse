import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Phone,
  Edit3,
  Save,
  X,
  Camera,
  MapPin,
  CheckCircle2,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const profile = PROFILE_DATA[role] || PROFILE_DATA.owner;

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
            <Button className="bg-[#0A0F1E] hover:bg-black text-white" onClick={handleSave}>
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

      {/* Profile Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-500 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="relative group">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl font-bold text-blue-600 border-2 border-white">
                  {profile.initials}
                </div>
                {editing && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={20} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <CardContent className="pt-16 pb-6 px-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-1">
                {editing ? (
                  <input
                    type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{form.name}</h2>
                )}
                <p className="text-sm text-gray-500">{profile.title}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold capitalize">{role}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={11} />{profile.location}</span>
                </div>
              </div>
              <div className="flex gap-4">
                {profile.achievements.map((ach, i) => (
                  <div key={i} className="text-center bg-gray-50 rounded-xl px-4 py-3 min-w-[80px]">
                    <p className="text-lg font-bold text-gray-900">{ach.value}</p>
                    <p className="text-[10px] text-gray-500">{ach.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bio */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader><CardTitle className="text-base font-semibold text-gray-900">About</CardTitle></CardHeader>
          <CardContent>
            {editing ? (
              <textarea
                value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3} maxLength={300}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">{form.bio}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact & Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader><CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2"><User size={16} /> Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center"><Mail size={16} className="text-blue-600" /></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Email</p>
                  {editing ? (
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{form.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center"><Phone size={16} className="text-blue-600" /></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Phone</p>
                  {editing ? (
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{form.phone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center"><MapPin size={16} className="text-blue-600" /></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-sm font-medium text-gray-900">{profile.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader><CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2"><Shield size={16} /> Account Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center"><Calendar size={16} className="text-purple-600" /></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(profile.memberSince).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center"><Clock size={16} className="text-purple-600" /></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Last Login</p>
                  <p className="text-sm font-medium text-gray-900">{profile.lastLogin}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center"><Award size={16} className="text-purple-600" /></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Licenses & Certifications</p>
                  <p className="text-sm font-medium text-gray-900">{profile.achievements[1].value} active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
