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
    <section id="experience" className="py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-50 via-teal-50/10 to-slate-50 dark:from-slate-950 dark:via-blue-950/15 dark:to-slate-950 text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Ambient Radial Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <FiBriefcase className="w-3.5 h-3.5" /> Career Journey
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Work <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 dark:from-teal-400 dark:via-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">Experience</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            A chronological timeline of engineering roles, production impact, and cross-functional leadership.
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Central Vertical Spine (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 bg-gradient-to-b from-teal-500 via-cyan-500 to-teal-600 dark:from-teal-400 dark:via-cyan-400 dark:to-emerald-400 rounded-full shadow-[0_0_12px_rgba(20,184,166,0.3)]" />

          {/* Left Vertical Line (Mobile Fallback) */}
          <div className="md:hidden absolute left-5 top-4 bottom-4 w-1 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full" />

          {/* Timeline Items */}
          <div className="space-y-12 md:space-y-16">
            {experiences.map((exp, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div key={idx} className="relative flex flex-col md:flex-row items-center">
                  
                  {/* Central Glow Node */}
                  <div className="absolute left-5 md:left-1/2 -translate-x-1/2 top-6 md:top-1/2 md:-translate-y-1/2 z-20">
                    <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-4 border-teal-500 dark:border-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/30 dark:shadow-cyan-400/40">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500 dark:bg-cyan-400 animate-pulse" />
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
                        className="group relative bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/40 rounded-2xl p-6 sm:p-8 transition-all duration-300 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(20,184,166,0.12)] text-left"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                            {exp.title}
                          </h3>
                          <span className="md:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/20 text-xs font-semibold">
                            <FiCalendar className="w-3 h-3" /> {exp.period}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-teal-600 dark:text-cyan-400 mb-4">
                          <span className="flex items-center gap-1">
                            <FiBriefcase className="w-4 h-4 text-teal-500" /> {exp.company}
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
                              <FiCheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                          {exp.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 text-[11px] font-bold uppercase tracking-wide"
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-teal-600 dark:text-cyan-400 font-bold text-sm shadow-sm">
                          <FiCalendar className="w-4 h-4 text-teal-500" />
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
                        className="group relative bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/40 rounded-2xl p-6 sm:p-8 transition-all duration-300 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(20,184,166,0.12)] text-left"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                            {exp.title}
                          </h3>
                          <span className="md:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/20 text-xs font-semibold">
                            <FiCalendar className="w-3 h-3" /> {exp.period}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-teal-600 dark:text-cyan-400 mb-4">
                          <span className="flex items-center gap-1">
                            <FiBriefcase className="w-4 h-4 text-teal-500" /> {exp.company}
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
                              <FiCheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                          {exp.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 text-[11px] font-bold uppercase tracking-wide"
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-teal-600 dark:text-cyan-400 font-bold text-sm shadow-sm">
                          <FiCalendar className="w-4 h-4 text-teal-500" />
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