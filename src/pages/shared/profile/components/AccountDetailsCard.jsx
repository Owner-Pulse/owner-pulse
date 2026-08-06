import React from "react";
import { motion } from "framer-motion";
import { Shield, Calendar, Clock, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const DetailField = ({ icon: Icon, label, value, iconBg = "bg-purple-50", iconColor = "text-purple-600" }) => (
  <div className="flex items-center gap-3">
    <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}>
      <Icon size={16} className={iconColor} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

const AccountDetailsCard = ({ user:profile }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Shield size={16} /> Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailField
            icon={Calendar}
            label="Member Since"
            value={new Date(profile?.member_since).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
          <DetailField
            icon={Clock}
            label="Last Login"
            value={profile?.last_login || "-"}
          />
          <DetailField
            icon={Award}
            label="Licenses & Certifications"
            value={`${profile?.licenses_certifications|| "0"} active`}
          />
        </CardContent> 
      </Card>
    </motion.div>
  );
};

export default AccountDetailsCard;
