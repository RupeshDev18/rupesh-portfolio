import React from "react";
import { motion } from "framer-motion";
import { FiMessageSquare } from "react-icons/fi";
import portfolioData from "../../data/data.json";

const Recommendations = () => {
  const { testimonials } = portfolioData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, type: "spring", stiffness: 50 }
    }
  };

  return (
    <section id="recommendations" className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white dark:bg-slate-900 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[36px] font-bold mb-10 text-center text-gray-800 dark:text-gray-100 flex items-center justify-center gap-3">
            <FiMessageSquare className="text-teal-500" /> Recommendations
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((test, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 25px -5px rgba(20, 184, 166, 0.1), 0 10px 10px -5px rgba(20, 184, 166, 0.04)" }}
                className="p-8 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 relative flex flex-col h-full transition-all duration-300 group"
              >
                <div className="absolute top-4 right-6 text-6xl text-teal-100 dark:text-teal-900/30 font-serif leading-none select-none group-hover:text-teal-200 dark:group-hover:text-teal-800/40 transition-colors duration-300">
                  "
                </div>
                {test.badge && (
                  <div className="inline-block px-3 py-1 mb-4 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[13px] font-bold uppercase tracking-wide self-start">
                    {test.badge}
                  </div>
                )}
                <p className="text-gray-700 dark:text-gray-300 italic mb-6 relative z-10 text-[16px] leading-relaxed flex-grow">
                  "{test.text}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-[22px] font-bold text-gray-900 dark:text-white">{test.name}</h4>
                    <span className="text-[13px] font-semibold text-teal-600 dark:text-cyan-400 block">
                      {test.role}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Recommendations;
