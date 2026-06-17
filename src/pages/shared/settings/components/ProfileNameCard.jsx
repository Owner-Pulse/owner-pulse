import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Save, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ProfileNameCard = ({ currentName }) => {
  const [nameForm, setNameForm] = useState({ name: currentName || "" });
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

  return (
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
                type="text"
                value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" className="bg-[#1E3A5F] hover:bg-[#15294A] text-white whitespace-nowrap">
              <Save size={14} className="mr-2" /> Update
            </Button>
          </form>
          {nameSaved && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1"
            >
              <CheckCircle2 size={12} /> Name updated successfully
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileNameCard;
