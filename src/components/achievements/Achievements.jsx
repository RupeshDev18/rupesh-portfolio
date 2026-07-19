import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaAws, FaTrophy, FaExternalLinkAlt, FaAward, FaShieldAlt } from "react-icons/fa";
import { FiAward, FiCheck, FiX, FiActivity, FiLayers, FiCpu, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import portfolioData from "../../data/data.json";

const Achievements = () => {
  const { achievements, engineeringMetrics } = portfolioData;
  const [selectedCredential, setSelectedCredential] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedCredential(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getMetricIcon = (index) => {
    switch (index) {
      case 0: return <FiCpu className="w-5 h-5 text-[#FCA311]" />;
      case 1: return <FaShieldAlt className="w-5 h-5 text-[#14213D] dark:text-[#FCA311]" />;
      case 2: return <FiTrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 3: return <FiLayers className="w-5 h-5 text-amber-500" />;
      default: return <FiActivity className="w-5 h-5 text-[#FCA311]" />;
    }
  };

  return (
    <section id="achievements" className="py-24 px-4 sm:px-6 bg-white dark:bg-[#14213D] text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#FCA311]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCA311]/15 border border-[#FCA311]/40 text-[#14213D] dark:text-[#FCA311] text-xs font-bold uppercase tracking-wider mb-4">
            <FiAward className="w-3.5 h-3.5" /> Proof of Excellence
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#14213D] dark:text-white mb-4">
            Certifications & <span className="text-[#FCA311]">Engineering Impact</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Quantifiable production engineering metrics, verified cloud architecture credentials, and national academic merit.
          </p>
        </motion.div>

        {/* 1. Engineering Impact Metrics Benchmarks */}
        {engineeringMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <FiActivity className="text-[#FCA311]" /> Key Impact Benchmarks
              </h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {engineeringMetrics.map((metric, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-[#E5E5E5]/30 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden group shadow-sm hover:shadow-md"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity duration-300">
                    {getMetricIcon(idx)}
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#14213D] dark:text-[#FCA311] mb-1 tracking-tight">
                    {metric.value}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">
                    {metric.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {metric.context}
                  </div>
                  <div className="mt-3 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FCA311]/20 text-[#14213D] dark:text-[#FCA311]">
                    {metric.metricType}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 2. Verified Credentials & Certifications Grid */}
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FaAward className="text-[#FCA311]" /> Verified Credentials & Merits
          </h3>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
        >
          {achievements.map((item) => {
            const isAws = item.icon === "aws" || item.id === "aws-saa";

            return (
              <motion.div
                key={item.id || item.title}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedCredential(item)}
                className="group cursor-pointer relative bg-white dark:bg-slate-900 border-t-4 border-t-[#FCA311] border-x border-b border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FCA311]/15 text-[#14213D] dark:text-[#FCA311] border border-[#FCA311]/30">
                      {isAws ? <FaAws className="w-4 h-4 text-[#FCA311]" /> : <FaTrophy className="w-3.5 h-3.5 text-[#FCA311]" />}
                      {item.status || "Credential"}
                    </span>

                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                      {item.subtitle || item.issueDate}
                    </span>
                  </div>

                  {/* Title & Issuer */}
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[#FCA311] transition-colors mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#14213D] dark:text-[#FCA311] font-bold mb-4">
                    Issued by: {item.issuer || "Official Exam Board"}
                  </p>

                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>

                  {/* Verified Skills Chips */}
                  {item.skillsVerified && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {item.skillsVerified.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Drawer Trigger */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-[#FCA311] transition-colors">
                  <span className="flex items-center gap-1.5">
                    <FiCheckCircle className="text-emerald-600 dark:text-emerald-400" /> Click to view verification proof
                  </span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Inspect <FaExternalLinkAlt className="w-2.5 h-2.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 3. Interactive Credential Proof Modal */}
      <AnimatePresence>
        {selectedCredential && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-800 dark:text-slate-100"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCredential(null)}
                className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-xl transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FCA311]/15 text-[#14213D] dark:text-[#FCA311] border border-[#FCA311]/30 flex items-center justify-center text-2xl font-bold">
                  {selectedCredential.icon === "aws" ? <FaAws /> : <FaTrophy />}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#FCA311] uppercase tracking-wider block">
                    Official Verification Drawer
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedCredential.title}
                  </h3>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-4 my-6 bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Issuer Authority:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedCredential.issuer || "Official Body"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Credential ID:</span>
                  <span className="font-mono text-[#FCA311] font-bold">{selectedCredential.credentialId || "VERIFIED-RECORD"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Status & Validity:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedCredential.subtitle || selectedCredential.status}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={selectedCredential.verificationUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FCA311] hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-amber-500/20"
                >
                  Verify Official Credential <FaExternalLinkAlt className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setSelectedCredential(null)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Achievements;
