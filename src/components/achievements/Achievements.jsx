import React from "react";
import { motion } from "framer-motion";
import { FiMessageSquare } from "react-icons/fi";
import { FaAws, FaTrophy } from "react-icons/fa";
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
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.icon === 'aws' ? 'bg-[#ff9900]' : 'bg-teal-500'}`}></div>
              
              <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-800 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 text-4xl ${item.icon === 'aws' ? 'text-[#ff9900]' : 'text-teal-500'}`}>
                {item.icon === "aws" ? <FaAws /> : <FaTrophy />}
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight whitespace-pre-line">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed text-sm md:text-base">
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
                className="p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 relative flex flex-col h-full"
              >
                <div className="absolute top-4 right-6 text-6xl text-teal-100 dark:text-teal-900/30 font-serif leading-none select-none">
                  "
                </div>
                {test.badge && (
                  <div className="inline-block px-3 py-1 mb-4 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wide self-start">
                    {test.badge}
                  </div>
                )}
                <p className="text-gray-700 dark:text-gray-300 italic mb-6 relative z-10 leading-relaxed flex-grow">
                  "{test.text}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{test.name}</h4>
                    <span className="text-sm font-semibold text-teal-600 dark:text-cyan-400 block">
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
