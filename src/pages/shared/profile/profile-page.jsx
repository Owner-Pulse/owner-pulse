"use client"
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Save, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileHeader from "./components/ProfileHeader";
import ProfileBioCard from "./components/ProfileBioCard";
import ContactInfoCard from "./components/ContactInfoCard";
import AccountDetailsCard from "./components/AccountDetailsCard";
import { useGetUser, useUpdateOwnerUserDetails, useUpdateDirectorUserDetails } from "@/hooks";
import toast from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const ProfilePage = () => {
  const { user, refetch } = useGetUser();
  const {
    updateOwnerUserDetails,
    isPending: updateOwnerIsPending,
  } = useUpdateOwnerUserDetails();

  const {
    updateDirectorUserDetails,
    isPending: updateDirectorIsPending,
  } = useUpdateDirectorUserDetails();

  const role = user?.role || "owner";
  const updateIsPending = role === "director" ? updateDirectorIsPending : updateOwnerIsPending;
  const submitUpdate = role === "director" ? updateDirectorUserDetails : updateOwnerUserDetails;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john@hclc.com",
    phone: user?.phone || "",
    bio: user?.about || "",
    location: user?.location || "",
    avatar: null,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user && !editing) {
      setForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        bio: user.about || prev.bio,
        location: user.location || prev.location,
        avatar: null,
      }));
    }
  }, [user, editing]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("phone", form.phone);
    formData.append("about", form.bio);
    formData.append("location", form.location);
    if (form.avatar) {
      formData.append("avatar", form.avatar);
    }
    submitUpdate(formData, {
      onSuccess: (data) => {
        setEditing(false);
        refetch();
        toast.success(data?.message || "Profile updated successfully");
      },
      onError: (error) => {
        setEditing(false);
        refetch();
        toast.error(error?.response?.data?.message || "Failed to update profile");
      }
    });
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || "John Doe",
      email: user?.email || "john@hclc.com",
      phone: user?.phone || "",
      bio: user?.about || "",
      location: user?.location || "",
      avatar: null,
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
            <Button 
              className="bg-[#1E3A5F] hover:bg-[#15294A] text-white" 
              onClick={handleSave}
              disabled={updateIsPending}
            >
              <Save size={14} className="mr-2" /> {updateIsPending ? "Saving..." : "Save Changes"}
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
        user={user}
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
          location={user.location}
        />
        <AccountDetailsCard user={user} />
      </div>
    </motion.div>
  );
};
export default ProfilePage;