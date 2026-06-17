import React from "react";
import { motion } from "framer-motion";
import { Camera, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ProfileHeader = ({ profile, form, editing, onFormChange }) => {
  return (
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
                  type="text"
                  value={form.name}
                  onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                  className="text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{form.name}</h2>
              )}
              <p className="text-sm text-gray-500">{profile.title}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold capitalize">
                  {profile.role || "owner"}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={11} />{profile.location}
                </span>
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
  );
};

export default ProfileHeader;
