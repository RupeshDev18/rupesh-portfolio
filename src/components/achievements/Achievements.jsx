import React from "react";
import { motion } from "framer-motion";
import { FiMessageSquare } from "react-icons/fi";
import { FaAws, FaTrophy } from "react-icons/fa";
import portfolioData from "../../data/data.json";

const Achievements = () => {
  const { achievements } = portfolioData;

  return (
    <section id="achievements" className="py-24 px-6 bg-white dark:bg-slate-950 border-t border-gray-150 dark:border-slate-900">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-[36px] font-bold mb-16 text-center text-gray-800 dark:text-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Proof of <span className="text-teal-600 dark:text-cyan-400">Excellence</span>
        </motion.h2>

        {/* Achievements Grid */}
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
          {achievements.map((item, idx) => (
            <motion.div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6, type: "spring", stiffness: 50 } }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.icon === 'aws' ? 'bg-[#ff9900]' : 'bg-teal-500'}`}></div>
              
              <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-800 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 text-4xl ${item.icon === 'aws' ? 'text-[#ff9900]' : 'text-teal-500'}`}>
                {item.icon === "aws" ? <FaAws /> : <FaTrophy />}
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-gray-800 dark:text-gray-100 mb-2 leading-tight whitespace-pre-line">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed text-[16px]">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Achievements;
