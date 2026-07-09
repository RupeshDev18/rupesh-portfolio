import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaAws } from "react-icons/fa";
import Typewriter from "typewriter-effect";
import profileImg from "../../assets/profilepic2.webp";
import circleImg from "../../assets/Full Stack Developer2.png";
import portfolioData from "../../data/data.json";
import SocialLinks from "./SocialLinks";
import HeroActions from "./HeroActions";
import ResumeModal from "./ResumeModal";

const Hero = ({ darkMode }) => {
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
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-200 to-blue-200 dark:bg-slate-950 dark:bg-gradient-to-r dark:from-slate-950 dark:via-teal-950/20 dark:to-blue-950/30 relative overflow-hidden pt-24 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center z-10 pt-10 md:pt-0">
        {/* Left Column (Details & Typography) */}
        <motion.div
          className="md:col-span-7 flex flex-col justify-center gap-6 text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-[-1rem]">
            <span className="px-3 py-1.5 bg-teal-100 dark:bg-[#ff9900]/10 text-teal-800 dark:text-[#ff9900] border border-teal-300 dark:border-[#ff9900]/50 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-sm dark:shadow-none">
              <span className="w-2 h-2 bg-teal-600 dark:bg-[#ff9900] rounded-full animate-pulse"></span>
              AWS Certified Solutions Architect
            </span>
          </motion.div>
          <motion.h2
            className="text-[40px] md:text-[56px] font-bold text-gray-800 dark:text-gray-100 leading-tight"
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
                wrapperClassName: "text-teal-600 dark:text-cyan-400 text-[28px] md:text-[40px] font-extrabold leading-tight",
                cursorClassName: "text-teal-600 dark:text-cyan-400 text-[28px] md:text-[40px] font-extrabold leading-tight",
              }}
            />
          </motion.div>

          <motion.p
            className="text-[16px] font-medium text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed"
            variants={itemVariants}
          >
            {portfolioData.summary}
          </motion.p>

          {/* Action Buttons */}
          <HeroActions setIsResumeModalOpen={setIsResumeModalOpen} itemVariants={itemVariants} />

          {/* Outline Circular Social Links */}
          <motion.div className="flex items-center gap-4 mt-4" variants={itemVariants}>
            <SocialLinks />
          </motion.div>

          {/* Unified Responsive Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 border-t border-gray-200/30 dark:border-slate-800/30 pt-6 w-full"
            variants={itemVariants}
          >
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col text-left">
                {stat.isAws ? (
                  <FaAws className="text-3xl md:text-4xl text-[#ff9900] mb-1.5" />
                ) : (
                  <span className="text-2xl md:text-3xl font-black text-teal-600 dark:text-cyan-400 mb-0.5">
                    {stat.number}
                  </span>
                )}
                <span className="text-[10px] md:text-[11px] uppercase font-bold tracking-wider text-gray-500 dark:text-slate-400 leading-tight">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column (Cutout profile photo & spinning play badge) */}
        <motion.div
          className="md:col-span-5 flex justify-center items-center relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative w-fit max-w-full flex items-end justify-center">
            {/* Cut-out Photo overlapping background circle */}
            <img
              src={profileImg}
              alt="Rupesh Yadav"
              className="h-[400px] md:h-[570px] w-auto object-contain select-none pointer-events-none z-10 dark:mix-blend-screen"
            />
            {/* Smooth bottom fade to blend the image into the background */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-transparent dark:from-slate-950 dark:to-transparent z-20 pointer-events-none"></div>

            {/* Rotating Badge */}
            <div className="absolute bottom-6 right-0 md:right-[-20px] z-20 cursor-pointer">
              <div className="relative  bottom-[-25px] w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                <img
                  src={circleImg}
                  alt="Full Stack Developer Badge"
                  className="w-full h-full animate-[spin_15s_linear_infinite] select-none pointer-events-none filter dark:invert"
                />
                <FaPlay className="text-black dark:text-cyan-400 absolute text-lg md:text-xl transform translate-x-[2px]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isResumeModalOpen && (
          <ResumeModal isResumeModalOpen={isResumeModalOpen} setIsResumeModalOpen={setIsResumeModalOpen} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Hero;