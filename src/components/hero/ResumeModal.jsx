import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import resumePDF from "../../assets/RupeshYadav.pdf";

const ResumeModal = ({ isOpen, onClose, isResumeModalOpen, setIsResumeModalOpen }) => {
  const active = isOpen !== undefined ? isOpen : isResumeModalOpen;
  const handleClose = onClose || (() => setIsResumeModalOpen && setIsResumeModalOpen(false));

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-5xl w-full h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl z-50 transition-colors shadow-lg"
            aria-label="Close Resume"
          >
            <FiX className="w-5 h-5" />
          </button>
          <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-slate-950 border border-slate-800">
            <iframe
              src={resumePDF}
              title="Resume PDF"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResumeModal;
