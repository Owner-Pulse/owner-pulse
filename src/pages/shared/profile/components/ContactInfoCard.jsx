import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ContactField = ({ icon: Icon, label, value, editing, field, onFormChange, iconBg = "bg-blue-50", iconColor = "text-blue-600", type = "text" }) => (
  <div className="flex items-center gap-3">
    <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}>
      <Icon size={16} className={iconColor} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-400">{label}</p>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onFormChange((prev) => ({ ...prev, [field]: e.target.value }))}
          className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <p className="text-sm font-medium text-gray-900">{value}</p>
      )}
    </div>
  </div>
);

const ContactInfoCard = ({ form, editing, onFormChange, location }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <User size={16} /> Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ContactField
            icon={Mail}
            label="Email"
            value={form.email}
            editing={editing}
            field="email"
            onFormChange={onFormChange}
            type="email"
          />
          <ContactField
            icon={Phone}
            label="Phone"
            value={form.phone}
            editing={editing}
            field="phone"
            onFormChange={onFormChange}
            type="tel"
          />
          <ContactField
            icon={MapPin}
            label="Location"
            value={location}
            editing={false}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContactInfoCard;
