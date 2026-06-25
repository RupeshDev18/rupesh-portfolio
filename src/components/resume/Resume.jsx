import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { experiences, educations } from "../../data/data";
import { FiBriefcase, FiBookOpen } from "react-icons/fi";

const Resume = () => {
  const [activeTab, setActiveTab] = useState("experience"); // 'experience' or 'education'

  const activeData = activeTab === "experience" ? experiences : educations;

  return (
    <div id="resume" className="max-w-5xl mx-auto py-24 px-6">
      {/* Header */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-[36px] font-bold text-gray-900 dark:text-white mb-4">
          My <span className="text-teal-600 dark:text-cyan-400">Resume</span>
        </h2>
        <p className="text-[16px] text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Here is a detailed breakdown of my professional experience and educational background.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center mb-16 relative z-20">
        <div className="flex p-1.5 bg-gray-100/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-inner border border-gray-200/50 dark:border-slate-800/50">
          <button
            onClick={() => setActiveTab("experience")}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[16px] font-bold transition-all duration-300 ${
              activeTab === "experience" 
                ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-cyan-400 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] scale-105" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <FiBriefcase className="text-xl" /> Experience
          </button>
          <button
            onClick={() => setActiveTab("education")}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[16px] font-bold transition-all duration-300 ${
              activeTab === "education" 
                ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-cyan-400 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] scale-105" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <FiBookOpen className="text-xl" /> Education
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative pl-8 md:pl-0">
        {/* Vertical Line for Desktop (Centered) */}
        <div className="absolute left-[31px] md:left-1/2 md:-ml-[1px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-teal-500/30 to-transparent hidden md:block"></div>
        {/* Vertical Line for Mobile (Left) */}
        <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-teal-500/30 to-transparent md:hidden"></div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-12"
          >
            {activeData.map((item, index) => (
              <div 
                key={index} 
                className={`relative flex flex-col md:flex-row items-center justify-between w-full group ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline Dot (Desktop) */}
                <div className="hidden md:block absolute left-1/2 -ml-3 top-1/2 -mt-3 w-6 h-6 rounded-full bg-teal-50 dark:bg-slate-900 border-4 border-teal-500 shadow-lg z-10 group-hover:scale-125 group-hover:bg-teal-500 transition-all duration-300"></div>
                {/* Timeline Dot (Mobile) */}
                <div className="md:hidden absolute left-[-24px] top-8 w-6 h-6 rounded-full bg-teal-50 dark:bg-slate-900 border-4 border-teal-500 shadow-lg z-10 group-hover:scale-125 group-hover:bg-teal-500 transition-all duration-300"></div>

                {/* Content Card */}
                <div className="w-full md:w-[45%]">
                  <motion.div 
                    className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-2xl hover:border-teal-400/50 transition-all duration-500 relative overflow-hidden"
                    whileHover={{ y: -5 }}
                  >
                    {/* Subtle gradient glow inside card */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-400/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-400/20 transition-all duration-500"></div>

                    <div className="flex flex-wrap items-center justify-between gap-2 mb-6 relative z-10">
                      <span className="text-[13px] font-bold text-teal-700 dark:text-cyan-300 bg-teal-50 dark:bg-teal-900/40 px-4 py-1.5 rounded-full border border-teal-100 dark:border-teal-800/50 shadow-sm flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                        {item.period}
                      </span>
                      {item.location && (
                        <span className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                          {item.location}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-[22px] font-bold text-gray-900 dark:text-white mb-2 relative z-10">
                      {item.title}
                    </h3>
                    <h4 className="text-[16px] font-bold text-teal-600 dark:text-cyan-400 mb-5 relative z-10 flex items-center gap-2">
                      {activeTab === "experience" ? <FiBriefcase className="text-sm" /> : <FiBookOpen className="text-sm" />}
                      {item.company || item.school}
                    </h4>
                    
                    <p className="text-[16px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium relative z-10">
                      {item.description}
                    </p>

                    {item.highlights && item.highlights.length > 0 && (
                      <ul className="mt-6 space-y-3 list-none relative z-10">
                        {item.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-[16px] text-gray-700 dark:text-gray-300 font-medium bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100/50 dark:border-slate-700/50">
                            <span className="text-teal-500 mt-1.5 w-2 h-2 rounded-full shrink-0 bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                </div>

                {/* Empty Space for the other side */}
                <div className="hidden md:block w-[45%]"></div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Resume;
