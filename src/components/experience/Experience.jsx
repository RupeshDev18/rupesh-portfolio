import React from "react";
import { motion } from "framer-motion";
import portfolioData from "../../data/data.json";

const Experience = ({ darkMode }) => {
  const experiences = portfolioData.experiences;

  return (
    <section id="experience" className="py-20 px-6 bg-gradient-to-b from-teal-50/10 via-white to-blue-50/10 dark:bg-slate-950 dark:bg-gradient-to-b dark:from-slate-950 dark:via-blue-950/15 dark:to-slate-950 border-t border-gray-150 dark:border-slate-900">
      <div className="max-w-4xl mx-auto">
        <motion.h2 className="text-4xl md:text-5xl font-bold mb-12 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          Work <span className="text-teal-600 dark:text-cyan-400">Experience</span>
        </motion.h2>

        <div className="space-y-8">
          {experiences.map((exp, idx) => (
            <motion.div key={idx} className="relative pl-8 border-l-2 border-teal-500 pb-8" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: idx * 0.1 }} viewport={{ once: true }}>
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-teal-500 rounded-full border-4 border-white dark:border-slate-950"></div>

              <div className="bg-white dark:bg-slate-900/60 dark:backdrop-blur-md p-6 rounded-lg shadow-md hover:shadow-xl border border-gray-100 dark:border-teal-500/20 dark:hover:border-cyan-400/40 dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{exp.title}</h3>
                    <p className="text-teal-600 dark:text-cyan-400 font-semibold">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">{exp.period}</span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">{exp.description}</p>

                <div className="flex flex-wrap gap-2">
                  {exp.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 rounded-full text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;