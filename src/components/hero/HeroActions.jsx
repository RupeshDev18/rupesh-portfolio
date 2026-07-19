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
        className="px-6 py-2.5 bg-[#FCA311] hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center gap-2"
      >
        View Resume <FiEye />
      </motion.button>
      <motion.a
        href="#contact"
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[#14213D] dark:text-white rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xs"
      >
        Contact Me
      </motion.a>
    </motion.div>
  );
};

export default HeroActions;
