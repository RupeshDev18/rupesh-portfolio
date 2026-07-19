import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiCheckCircle } from "react-icons/fi";
import { FaStar, FaUserTie, FaUserCheck, FaQuoteRight, FaBuilding } from "react-icons/fa";
import portfolioData from "../../data/data.json";

const Recommendations = () => {
  const { testimonials } = portfolioData;
  const [activeTab, setActiveTab] = useState("all");

  const filteredTestimonials = activeTab === "all" 
    ? testimonials 
    : testimonials.filter(t => t.badge.toLowerCase().includes(activeTab));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section id="recommendations" className="py-24 px-4 sm:px-6 bg-[#E5E5E5]/40 dark:bg-[#14213D] text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#FCA311]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14213D]/10 dark:bg-[#FCA311]/10 border border-[#14213D]/20 dark:border-[#FCA311]/30 text-[#14213D] dark:text-[#FCA311] text-xs font-bold uppercase tracking-wider mb-4">
            <FiMessageSquare className="w-3.5 h-3.5" /> Endorsements & Feedback
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#14213D] dark:text-white mb-4">
            Executive <span className="text-[#FCA311]">Recommendations</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Direct endorsements from Engineering Managers & Technical Leads validating code quality, ownership, and problem-solving impact.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {[
              { id: "all", label: "All Endorsements" },
              { id: "manager", label: "Management" },
              { id: "lead", label: "Tech Leads" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-[#14213D] dark:bg-[#FCA311] text-[#FCA311] dark:text-[#14213D] font-bold shadow-md scale-105"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <AnimatePresence mode="popLayout">
            {filteredTestimonials.map((test) => (
              <motion.div
                key={test.id || test.name}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -6 }}
                className="group relative bg-white dark:bg-slate-900 border-t-4 border-t-[#14213D] dark:border-t-[#FCA311] border-x border-b border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                {/* Decorative Quote Watermark */}
                <div className="absolute top-4 right-6 text-6xl text-[#14213D]/10 dark:text-[#FCA311]/15 pointer-events-none select-none">
                  <FaQuoteRight />
                </div>

                <div>
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#14213D]/10 dark:bg-[#FCA311]/10 border border-[#14213D]/20 dark:border-[#FCA311]/20 text-[#14213D] dark:text-[#FCA311] text-xs font-bold tracking-wide">
                      {test.badge.includes("Manager") ? <FaUserTie className="w-3.5 h-3.5" /> : <FaUserCheck className="w-3.5 h-3.5" />}
                      {test.badge}
                    </span>

                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800/80">
                      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">Verified Endorsement</span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-4 text-[#FCA311] text-xs">
                    {[...Array(test.rating || 5)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed italic mb-8 relative z-10 font-normal">
                    "{test.text}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/80 relative z-10 mt-auto">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-[#14213D] dark:bg-[#FCA311] text-white dark:text-[#14213D] font-bold flex items-center justify-center text-lg shadow-md">
                      {test.name.charAt(0)}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                      {test.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate font-medium">
                      {test.role}
                    </p>
                    {test.company && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#14213D] dark:text-[#FCA311] font-bold mt-0.5">
                        <FaBuilding className="w-3 h-3" /> {test.company}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Recommendations;
