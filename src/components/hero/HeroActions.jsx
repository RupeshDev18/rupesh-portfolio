import React from "react";
import { motion } from "framer-motion";
import { FiEye } from "react-icons/fi";

const HeroActions = ({ setIsResumeModalOpen, itemVariants }) => {
  return (
    <motion.div className="flex flex-wrap items-center gap-3" variants={itemVariants}>
      <motion.button
        onClick={() => setIsResumeModalOpen(true)}
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transition-all flex items-center gap-2"
      >
        View Resume <FiEye />
      </motion.button>
      <motion.a
        href="#contact"
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-teal-500/50 text-gray-900 dark:text-white rounded-lg font-bold text-sm hover:bg-gray-50 dark:hover:bg-teal-900/20 transition-all flex items-center gap-2"
      >
        Contact Me
      </motion.a>
    </motion.div>
  );
};

export default HeroActions;
