import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaAws, FaTrophy, FaExternalLinkAlt, FaAward, FaShieldAlt } from "react-icons/fa";
import { FiAward, FiCheck, FiX, FiActivity, FiLayers, FiCpu, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import portfolioData from "../../data/data.json";

const Achievements = () => {
  const { achievements, engineeringMetrics } = portfolioData;
  const [selectedCredential, setSelectedCredential] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedCredential(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getMetricIcon = (index) => {
    switch (index) {
      case 0: return <FiCpu className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 1: return <FaShieldAlt className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 2: return <FiTrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 3: return <FiLayers className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default: return <FiActivity className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
    }
  };

  return (
    <section id="achievements" className="py-24 px-4 sm:px-6 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Background Radial Lights */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <FiAward className="w-3.5 h-3.5" /> Proof of Excellence
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Certifications & <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 dark:from-teal-400 dark:via-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">Engineering Impact</span>
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
                <FiActivity className="text-teal-600 dark:text-teal-400" /> Key Impact Benchmarks
              </h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {engineeringMetrics.map((metric, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/40 rounded-2xl p-5 relative overflow-hidden group shadow-sm hover:shadow-md"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity duration-300">
                    {getMetricIcon(idx)}
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-300 bg-clip-text mb-1 tracking-tight">
                    {metric.value}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1">
                    {metric.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {metric.context}
                  </div>
                  <div className="mt-3 inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-teal-700 dark:text-teal-400">
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
            <FaAward className="text-amber-500 dark:text-amber-400" /> Verified Credentials & Merits
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
                className="group cursor-pointer relative bg-slate-50/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(13,148,136,0.15)]"
              >
                {/* Colored Highlight Strip */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl ${isAws ? "bg-amber-500" : "bg-teal-500"}`} />

                <div>
                  {/* Top Bar: Category Pill & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      isAws ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20" : "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20"
                    }`}>
                      {isAws ? <FaAws className="w-4 h-4 text-[#ff9900]" /> : <FaTrophy className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                      {item.status || "Credential"}
                    </span>

                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                      {item.subtitle || item.issueDate}
                    </span>
                  </div>

                  {/* Title & Issuer */}
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold mb-4">
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
                          className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Drawer Trigger */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
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
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  selectedCredential.icon === "aws" ? "bg-amber-50 dark:bg-amber-500/10 text-[#ff9900] border border-amber-200 dark:border-amber-500/20" : "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20"
                }`}>
                  {selectedCredential.icon === "aws" ? <FaAws /> : <FaTrophy />}
                </div>
                <div>
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
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
                  <span className="font-mono text-teal-700 dark:text-teal-300 font-semibold">{selectedCredential.credentialId || "VERIFIED-RECORD"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Status & Validity:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedCredential.subtitle || selectedCredential.status}</span>
                </div>
                {selectedCredential.percentile && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400">National Percentile:</span>
                    <span className="font-semibold text-cyan-600 dark:text-cyan-300">{selectedCredential.percentile}</span>
                  </div>
                )}
              </div>

              {/* Verified Competencies */}
              {selectedCredential.skillsVerified && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Verified Technical Competencies
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCredential.skillsVerified.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800/60">
                        <FiCheck className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Verification CTA */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={selectedCredential.verificationUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-teal-600/20"
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
