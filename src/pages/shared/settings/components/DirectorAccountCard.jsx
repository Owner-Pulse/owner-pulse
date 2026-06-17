import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const DirectorAccountCard = ({ onNavigate }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users size={22} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">Director Account Management</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Create and manage director accounts from the dedicated management page.
              </p>
            </div>
            <Button
              className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shrink-0"
              onClick={onNavigate}
            >
              <Users size={14} className="mr-2" /> Go to Director Management
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DirectorAccountCard;
