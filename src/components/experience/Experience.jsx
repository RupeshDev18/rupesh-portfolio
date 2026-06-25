import React from "react";
import { motion } from "framer-motion";
import portfolioData from "../../data/data.json";

const Experience = ({ darkMode }) => {
  const experiences = portfolioData.experiences;

  return (
    <section id="experience" className="py-20 px-6 bg-gradient-to-b from-teal-50/10 via-white to-blue-50/10 dark:bg-slate-950 dark:bg-gradient-to-b dark:from-slate-950 dark:via-blue-950/15 dark:to-slate-950">
      <div className="max-w-4xl mx-auto">
        <motion.h2 className="text-[36px] font-bold mb-12 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          Work <span className="text-teal-600 dark:text-cyan-400">Experience</span>
        </motion.h2>

        <motion.div
          className="space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
        >
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              className="relative pl-8 border-l-2 border-teal-500 pb-8"
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6, type: "spring", stiffness: 50 } }
              }}
            >
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-teal-500 rounded-full border-4 border-white dark:border-slate-950"></div>

              <motion.div
                className="bg-white dark:bg-slate-900/60 dark:backdrop-blur-md p-6 rounded-lg shadow-md hover:shadow-xl border border-gray-100 dark:border-teal-500/20 dark:hover:border-cyan-400/40 dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300"
                whileHover={{ x: 5, scale: 1.01 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-[22px] font-bold text-gray-900 dark:text-white">{exp.title}</h3>
                    <p className="text-teal-600 dark:text-cyan-400 font-semibold text-[16px]">{exp.company}</p>
                  </div>
                  <span className="text-[13px] text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">{exp.period}</span>
                </div>

                <ul className="list-disc list-outside ml-5 text-[16px] text-gray-700 dark:text-gray-300 mb-6 space-y-2">
                  {exp.highlights?.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-3">
                  {exp.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 rounded text-[13px] font-bold uppercase tracking-wide border border-teal-200 dark:border-teal-500/30 shadow-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;