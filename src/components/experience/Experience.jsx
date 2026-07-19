import React from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiMapPin, FiBriefcase, FiCheckCircle } from "react-icons/fi";
import portfolioData from "../../data/data.json";

const Experience = () => {
  const experiences = portfolioData.experiences;

  const cardVariantsLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const cardVariantsRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="experience" className="py-24 px-4 sm:px-6 bg-[#E5E5E5]/40 dark:bg-[#14213D] text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#FCA311]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14213D]/10 dark:bg-[#FCA311]/10 border border-[#14213D]/20 dark:border-[#FCA311]/30 text-[#14213D] dark:text-[#FCA311] text-xs font-bold uppercase tracking-wider mb-4">
            <FiBriefcase className="w-3.5 h-3.5" /> Career Journey
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#14213D] dark:text-white mb-4">
            Work <span className="text-[#FCA311]">Experience</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            A chronological timeline of engineering roles, production impact, and cross-functional leadership.
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Central Vertical Spine (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 bg-gradient-to-b from-[#14213D] via-[#FCA311] to-[#14213D] rounded-full shadow-[0_0_12px_rgba(252,163,17,0.3)]" />

          {/* Left Vertical Line (Mobile Fallback) */}
          <div className="md:hidden absolute left-5 top-4 bottom-4 w-1 bg-gradient-to-b from-[#14213D] to-[#FCA311] rounded-full" />

          {/* Timeline Items */}
          <div className="space-y-12 md:space-y-16">
            {experiences.map((exp, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div key={idx} className="relative flex flex-col md:flex-row items-center">
                  
                  {/* Central Glow Node */}
                  <div className="absolute left-5 md:left-1/2 -translate-x-1/2 top-6 md:top-1/2 md:-translate-y-1/2 z-20">
                    <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-4 border-[#FCA311] flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#14213D] dark:bg-[#FCA311] animate-pulse" />
                    </div>
                  </div>

                  {/* LEFT HALF (Desktop: 50% width) */}
                  <div className="w-full md:w-1/2 pl-14 md:pl-0 md:pr-12">
                    {isEven ? (
                      /* Item 0, 2: Experience Card on Left */
                      <motion.div
                        variants={cardVariantsLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="group relative bg-white dark:bg-slate-900 border-t-4 border-t-[#14213D] dark:border-t-[#FCA311] border-x border-b border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 transition-all duration-300 shadow-sm hover:shadow-xl text-left"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[#FCA311] transition-colors">
                            {exp.title}
                          </h3>
                          <span className="md:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14213D]/10 dark:bg-[#FCA311]/10 text-[#14213D] dark:text-[#FCA311] border border-[#14213D]/20 dark:border-[#FCA311]/20 text-xs font-semibold">
                            <FiCalendar className="w-3 h-3" /> {exp.period}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-[#14213D] dark:text-[#FCA311] mb-4">
                          <span className="flex items-center gap-1">
                            <FiBriefcase className="w-4 h-4 text-[#FCA311]" /> {exp.company}
                          </span>
                          {exp.location && (
                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
                              <FiMapPin className="w-3.5 h-3.5" /> {exp.location}
                            </span>
                          )}
                        </div>

                        <ul className="space-y-2.5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                          {exp.highlights?.map((point, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <FiCheckCircle className="w-4 h-4 text-[#FCA311] shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                          {exp.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-md bg-[#FCA311]/15 text-[#14213D] dark:text-[#FCA311] border border-[#FCA311]/30 text-[11px] font-bold uppercase tracking-wide"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      /* Item 1, 3: Date Badge on Left */
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="hidden md:flex flex-col items-end justify-center h-full pr-4"
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#14213D] dark:text-[#FCA311] font-bold text-sm shadow-sm">
                          <FiCalendar className="w-4 h-4 text-[#FCA311]" />
                          <span>{exp.period}</span>
                        </div>
                        {exp.location && (
                          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
                            <FiMapPin className="w-3.5 h-3.5" />
                            <span>{exp.location}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* RIGHT HALF (Desktop: 50% width) */}
                  <div className="w-full md:w-1/2 pl-14 md:pl-12">
                    {!isEven ? (
                      /* Item 1, 3: Experience Card on Right */
                      <motion.div
                        variants={cardVariantsRight}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="group relative bg-white dark:bg-slate-900 border-t-4 border-t-[#14213D] dark:border-t-[#FCA311] border-x border-b border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 transition-all duration-300 shadow-sm hover:shadow-xl text-left"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[#FCA311] transition-colors">
                            {exp.title}
                          </h3>
                          <span className="md:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14213D]/10 dark:bg-[#FCA311]/10 text-[#14213D] dark:text-[#FCA311] border border-[#14213D]/20 dark:border-[#FCA311]/20 text-xs font-semibold">
                            <FiCalendar className="w-3 h-3" /> {exp.period}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-[#14213D] dark:text-[#FCA311] mb-4">
                          <span className="flex items-center gap-1">
                            <FiBriefcase className="w-4 h-4 text-[#FCA311]" /> {exp.company}
                          </span>
                          {exp.location && (
                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
                              <FiMapPin className="w-3.5 h-3.5" /> {exp.location}
                            </span>
                          )}
                        </div>

                        <ul className="space-y-2.5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                          {exp.highlights?.map((point, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <FiCheckCircle className="w-4 h-4 text-[#FCA311] shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                          {exp.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-md bg-[#FCA311]/15 text-[#14213D] dark:text-[#FCA311] border border-[#FCA311]/30 text-[11px] font-bold uppercase tracking-wide"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      /* Item 0, 2: Date Badge on Right */
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="hidden md:flex flex-col items-start justify-center h-full pl-4"
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#14213D] dark:text-[#FCA311] font-bold text-sm shadow-sm">
                          <FiCalendar className="w-4 h-4 text-[#FCA311]" />
                          <span>{exp.period}</span>
                        </div>
                        {exp.location && (
                          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
                            <FiMapPin className="w-3.5 h-3.5" />
                            <span>{exp.location}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;