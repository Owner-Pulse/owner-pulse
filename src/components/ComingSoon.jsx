import React from "react";
import { motion } from "framer-motion";
import { Construction, Clock, ArrowRight, Sparkles } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export const ComingSoon = ({ title, description, icon: Icon, estimatedDate }) => {
  return (
    <motion.div
      className="flex items-center justify-center min-h-[60vh] px-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="text-center max-w-md">
        {/* Animated icon */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center border border-blue-100 shadow-sm">
              {Icon ? (
                <Icon size={44} className="text-blue-500" />
              ) : (
                <Construction size={44} className="text-blue-500" />
              )}
            </div>
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200">
                <Sparkles size={16} className="text-amber-500" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          variants={itemVariants}
          className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3"
        >
          {title || "Coming Soon"}
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-sm md:text-base text-gray-500 leading-relaxed mb-6"
        >
          {description ||
            "This feature is currently under development. We're working hard to bring you an amazing experience. Stay tuned for updates!"}
        </motion.p>

        {/* Status badge */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-200">
            <Clock size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-700">
              {estimatedDate
                ? `Expected: ${estimatedDate}`
                : "Under Development"}
            </span>
          </div>
        </motion.div>

        {/* Feature list */}
        <motion.div
          variants={itemVariants}
          className="mt-8 space-y-3 text-left"
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-3">
            What's coming
          </p>
          {[
            "Interactive dashboards and visualizations",
            "Real-time data synchronization",
            "Advanced filtering and search capabilities",
            "Export and reporting tools",
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 text-sm text-gray-600"
            >
              <ArrowRight size={14} className="text-blue-400 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ComingSoon;
