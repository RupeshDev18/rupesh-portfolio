import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaAws } from "react-icons/fa";
import Typewriter from "typewriter-effect";
import profileImg from "../../assets/profile.png";
import circleImg from "../../assets/Full Stack Developer2.png";
import portfolioData from "../../data/data.json";
import SocialLinks from "./SocialLinks";
import HeroActions from "./HeroActions";
import ResumeModal from "./ResumeModal";

const Hero = () => {
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const stats = [
    { number: "60K+", label: "Issues Processed" },
    { number: "87%", label: "Branch Coverage" },
    { number: "11", label: "Production POCs" },
    { number: "AWS", label: "Certified SAA", isAws: true },
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#14213D] text-slate-900 dark:text-slate-100 relative overflow-hidden pt-24 px-6 md:px-12 transition-colors duration-300"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#FCA311]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#14213D]/20 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center z-10 pt-10 md:pt-0">
        {/* Left Column */}
        <motion.div
          className="md:col-span-7 flex flex-col justify-center gap-6 text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-[-1rem]">
            <span className="px-3.5 py-1.5 bg-[#FCA311]/15 text-[#14213D] dark:text-[#FCA311] border border-[#FCA311]/40 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 bg-[#FCA311] rounded-full animate-pulse"></span>
              AWS Certified Solutions Architect
            </span>
          </motion.div>

          <motion.h2
            className="text-[40px] md:text-[56px] font-extrabold text-[#14213D] dark:text-white leading-tight"
            variants={itemVariants}
          >
            Hi, I'm {portfolioData.name.split(' ')[0]}
          </motion.h2>

          {/* Typewriter Effect */}
          <motion.div className="min-h-[4.5rem] sm:min-h-[3rem] md:h-12 flex items-center mb-2" variants={itemVariants}>
            <Typewriter
              options={{
                strings: portfolioData.typewriterKeywords,
                autoStart: true,
                loop: true,
                wrapperClassName: "text-[#14213D] dark:text-[#FCA311] text-[28px] md:text-[40px] font-extrabold leading-tight",
                cursorClassName: "text-[#14213D] dark:text-[#FCA311] text-[28px] md:text-[40px] font-extrabold leading-tight",
              }}
            />
          </motion.div>

          <motion.p
            className="text-[16px] font-medium text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed"
            variants={itemVariants}
          >
            {portfolioData.summary}
          </motion.p>

          {/* Action Buttons */}
          <HeroActions setIsResumeModalOpen={setIsResumeModalOpen} itemVariants={itemVariants} />

          {/* Social Links */}
          <motion.div className="flex items-center gap-4 mt-4" variants={itemVariants}>
            <SocialLinks />
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 border-t border-slate-200 dark:border-slate-800/80 pt-6 w-full"
            variants={itemVariants}
          >
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col text-left">
                {stat.isAws ? (
                  <FaAws className="text-3xl md:text-4xl text-[#FCA311] mb-1.5" />
                ) : (
                  <span className="text-2xl md:text-3xl font-extrabold text-[#14213D] dark:text-[#FCA311]">
                    {stat.number}
                  </span>
                )}
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column Profile Graphic */}
        <motion.div 
          className="md:col-span-5 flex justify-center items-center relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex justify-center items-center">
            <img 
              src={circleImg} 
              alt="Full Stack Developer" 
              className="absolute w-full h-full object-contain animate-spin-slow opacity-80"
            />
            <img 
              src={profileImg} 
              alt={portfolioData.name} 
              className="w-48 h-48 sm:w-64 sm:h-64 rounded-full object-cover object-bottom z-10 border-4 border-white dark:border-slate-800 shadow-2xl bg-[#FCA311]" 
            />
          </div>
        </motion.div>
      </div>

      {/* Resume Modal */}
      <ResumeModal isOpen={isResumeModalOpen} onClose={() => setIsResumeModalOpen(false)} isResumeModalOpen={isResumeModalOpen} setIsResumeModalOpen={setIsResumeModalOpen} />
    </section>
  );
};

export default Hero;