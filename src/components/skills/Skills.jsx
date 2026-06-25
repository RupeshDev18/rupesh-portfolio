import React from "react";
import { motion } from "framer-motion";
import portfolioData from "../../data/data.json";

const Skills = ({ darkMode }) => {
  const skillCategories = portfolioData.skillCategories;

  return (
    <section id="skills" className="py-20 px-6 bg-white dark:bg-slate-950 dark:bg-gradient-to-br dark:from-slate-950 dark:via-teal-950/10 dark:to-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.h2 className="text-[36px] font-bold mb-12 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          My <span className="text-teal-600 dark:text-cyan-400">Skills</span>
        </motion.h2>

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
          {skillCategories.map((category, catIdx) => (
            <motion.div 
              key={catIdx} 
              className="p-6 bg-gray-50/50 dark:bg-slate-900/60 dark:backdrop-blur-md rounded-lg border border-gray-200 dark:border-teal-500/20 hover:border-teal-400 dark:hover:border-cyan-400/40 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", stiffness: 50 } }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <h3 className="text-[22px] font-bold mb-6 text-teal-600 dark:text-cyan-400">{category.category}</h3>
              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill, idx) => {
                  const isExpert = skill.level >= 90;
                  const isAdvanced = skill.level >= 85 && skill.level < 90;
                  const tag = isExpert ? "Core" : isAdvanced ? "Advanced" : "Specialist";
                  
                  return (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-950 rounded-lg border border-gray-150 dark:border-teal-950/40 shadow-sm text-gray-850 dark:text-gray-200 cursor-default"
                      whileHover={{ scale: 1.05, y: -2, borderColor: "#0d9488" }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <span className={`w-2 h-2 rounded-full inline-block ${
                        isExpert ? "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                      }`}></span>
                      <span className="font-semibold text-[16px]">{skill.name}</span>
                      <span className="text-[13px] uppercase font-bold text-gray-450 dark:text-slate-500 bg-gray-100 dark:bg-slate-900 px-1.5 py-0.5 rounded ml-1">
                        {tag}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;