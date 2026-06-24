import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ProfileBioCard = ({ bio, editing, onFormChange }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">About</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => onFormChange((prev) => ({ ...prev, bio: e.target.value }))}
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileBioCard;
