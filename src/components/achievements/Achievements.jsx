import React from "react";
import { motion } from "framer-motion";
import { FiAward, FiCloud, FiMessageSquare } from "react-icons/fi";
import portfolioData from "../../data/data.json";

const Achievements = () => {
  const { achievements, testimonials } = portfolioData;

  return (
    <section id="achievements" className="py-24 px-6 bg-white dark:bg-slate-950 border-t border-gray-150 dark:border-slate-900">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-black mb-16 text-center text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Proof of <span className="text-teal-600 dark:text-cyan-400">Excellence</span>
        </motion.h2>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {achievements.map((item, idx) => (
            <motion.div
              key={idx}
              className="flex items-start gap-6 p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 dark:from-slate-900/80 dark:to-teal-950/20 border border-teal-100 dark:border-teal-500/20 shadow-lg hover:shadow-xl transition-all"
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-full bg-white dark:bg-slate-950 shadow-md text-teal-600 dark:text-cyan-400 text-3xl">
                {item.icon === "aws" ? <FiCloud /> : <FiAward />}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold mb-10 text-center text-gray-900 dark:text-white flex items-center justify-center gap-3">
            <FiMessageSquare className="text-teal-500" /> Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, idx) => (
              <div
                key={idx}
                className="p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 relative"
              >
                <div className="absolute top-4 right-6 text-6xl text-teal-100 dark:text-teal-900/30 font-serif leading-none select-none">
                  "
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-6 relative z-10 leading-relaxed">
                  "{test.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{test.name}</h4>
                    <span className="text-sm font-semibold text-teal-600 dark:text-cyan-400">
                      {test.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Achievements;
