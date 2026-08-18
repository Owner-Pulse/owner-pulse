import React from "react";
import { motion } from "framer-motion";
import { Send, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const SubmitSection = ({ itemCount, payrollDays, onSubmit }) => {
  const isDisabled = itemCount === 0;

  return (
    <motion.div variants={itemVariants}>
      <Card className={`bg-white border-none shadow-sm ${payrollDays <= 3 ? "ring-2 ring-[#AE4A3E]/25" : ""}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Ready to Submit</h3>
              <p className="text-xs text-gray-500 mt-0.5">{itemCount} items to process</p>
            </div>
            <Button
              onClick={onSubmit}
              className={`px-6 py-3 rounded-xl text-sm font-bold shadow-sm ${
                isDisabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#1E3A5F] hover:bg-[#15294A] text-white"
              }`}
              disabled={isDisabled}
            >
              <Send size={16} className="mr-2" /> Submit to Owner
            </Button>
          </div>
          {payrollDays <= 3 && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-[#AE4A3E]/10 rounded-xl text-xs text-[#AE4A3E] font-medium">
              <AlertTriangle size={14} /> Payroll is due soon — please submit promptly.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubmitSection;
