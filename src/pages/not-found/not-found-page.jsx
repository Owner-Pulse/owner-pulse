import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center max-w-md"
      >
        {/* Large 404 graphic */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="text-[120px] md:text-[160px] font-bold leading-none tracking-tighter text-gray-200 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center -rotate-6">
                <Search size={40} className="text-gray-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            Check the URL or head back to a known page.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="border-gray-200 w-full sm:w-auto"
            >
              <ArrowLeft size={16} className="mr-2" /> Go Back
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="bg-[#1E3A5F] hover:bg-[#15294A] text-white w-full sm:w-auto"
            >
              <Home size={16} className="mr-2" /> Back to Login
            </Button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-[10px] text-gray-300"
        >
          OwnerPulse
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
