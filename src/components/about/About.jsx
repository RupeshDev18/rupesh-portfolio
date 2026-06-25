import React from "react";
import { motion } from "framer-motion";

const About = ({ darkMode }) => {
  const stats = [
    { number: "60K", label: "Issues Processed", suffix: "+" },
    { number: "87", label: "Branch Coverage", suffix: "%" },
    { number: "11", label: "Production POCs", suffix: "" },
    { number: "AWS", label: "Certified SAA", suffix: "" },
  ];

  return (
    <section id="about" className="py-24 px-6 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:bg-slate-950 dark:bg-gradient-to-br dark:from-slate-950 dark:via-teal-950/10 dark:to-slate-950 border-t border-gray-150 dark:border-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-[36px] font-bold mb-4 text-center text-gray-800 dark:text-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          About <span className="text-teal-600 dark:text-cyan-400">Me</span>
        </motion.h2>

        <motion.p
          className="text-center text-[16px] text-gray-650 dark:text-gray-300 mb-16 max-w-2xl mx-auto font-semibold"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          I'm a passionate full-stack developer with 3+ years of experience building scalable web applications.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          {/* macOS Terminal Bio Container */}
          <motion.div
            className="w-full max-w-md mx-auto rounded-xl overflow-hidden border border-gray-200 dark:border-teal-500/20 bg-slate-900 shadow-2xl font-mono text-sm text-gray-100"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            {/* Window Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 select-none">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
              </div>
              <span className="text-xs text-gray-400 font-semibold">rupesh@macbook-pro:~</span>
            </div>
            {/* Terminal Content */}
            <div className="p-5 space-y-4 text-left">
              <div>
                <span className="text-teal-400 font-bold">~</span> <span className="text-cyan-400">neofetch</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-300 border-t border-slate-800 pt-3">
                <div className="col-span-1 text-teal-400 font-extrabold flex flex-col justify-center leading-tight">
                  <span>  /\  </span>
                  <span> /  \ </span>
                  <span>/____\</span>
                  <span>AWS_SA</span>
                </div>
                <div className="col-span-2 space-y-1">
                  <p><span className="text-cyan-400 font-bold">OS</span>: macOS / Linux</p>
                  <p><span className="text-cyan-400 font-bold">Shell</span>: zsh / bash</p>
                  <p><span className="text-cyan-400 font-bold">Stack</span>: MERN / FastAPI / AWS</p>
                  <p><span className="text-cyan-400 font-bold">Focus</span>: Multi-Tenant SaaS</p>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <span className="text-teal-400 font-bold">~</span> <span className="text-cyan-400">cat core-values.json</span>
                <pre className="text-xs text-teal-300 mt-2 overflow-x-auto">
                  {`{
  "isolation": "Robust Row-Level Security",
  "scalability": "Event-Driven Microservices",
  "security": "JWT Rotation & Secure RBAC",
  "velocity": "Playwright E2E Automation"
}`}
                </pre>
              </div>
              <div className="border-t border-slate-800 pt-3 flex items-center gap-2">
                <span className="text-teal-400 font-bold">~</span>
                <span className="w-2 h-4 bg-teal-500 animate-[ping_1.5s_infinite] inline-block"></span>
              </div>
            </div>
          </motion.div>

          {/* Description paragraphs */}
          <motion.div
            className="space-y-6 flex flex-col justify-center h-full text-left"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-[22px] font-bold text-gray-800 dark:text-gray-100 mb-2">Who I Am</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-[16px] text-gray-700 dark:text-gray-300 font-bold">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span> Full Stack Engineer
              </li>
              <li className="flex items-center gap-3 text-[16px] text-gray-700 dark:text-gray-300 font-bold">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span> AWS Certified Solutions Architect
              </li>
              <li className="flex items-center gap-3 text-[16px] text-gray-700 dark:text-gray-300 font-bold">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span> React + Node.js
              </li>
              <li className="flex items-center gap-3 text-[16px] text-gray-700 dark:text-gray-300 font-bold">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span> Multi-Tenant SaaS Specialist
              </li>
              <li className="flex items-center gap-3 text-[16px] text-gray-700 dark:text-gray-300 font-bold">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span> PostgreSQL & AWS
              </li>
            </ul>
            <p className="text-[16px] text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
              I specialize in architecting scalable backend systems and high-performance frontends that process thousands of records efficiently and securely.
            </p>
          </motion.div>
        </div>

        {/* Glassmorphic Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/20 dark:border-teal-500/20 text-center shadow-lg hover:shadow-xl hover:border-teal-400 dark:hover:border-cyan-400/45 dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all"
              whileHover={{ y: -5, scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-4xl font-extrabold text-teal-600 dark:text-cyan-400 mb-2">
                {stat.number}{stat.suffix}
              </div>
              <div className="text-[13px] text-gray-800 dark:text-gray-200 font-extrabold tracking-wide uppercase">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;