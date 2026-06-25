import React from "react";
import { motion } from "framer-motion";
import resumePDF from "../../assets/Resume.pdf";

const ResumeModal = ({ isResumeModalOpen, setIsResumeModalOpen }) => {
  if (!isResumeModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={() => setIsResumeModalOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="relative max-w-5xl w-full h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsResumeModalOpen(false)}
          className="absolute -top-12 right-0 text-white hover:text-teal-400 text-4xl font-black p-2 drop-shadow-md z-[110]"
          aria-label="Close Resume"
        >
          &times;
        </button>
        <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-700">
          <iframe
            src={resumePDF}
            title="Resume PDF"
            className="w-full h-full"
            frameBorder="0"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ResumeModal;
