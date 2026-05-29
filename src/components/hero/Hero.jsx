import React from "react";
import { motion } from "framer-motion";
import { AiFillTwitterCircle, AiFillGithub, AiFillInstagram } from "react-icons/ai";
import { FaFacebook, FaLinkedinIn, FaPlay } from "react-icons/fa";
import { FiDownload, FiArrowDown } from "react-icons/fi";
import { Link } from "react-scroll";
import Typewriter from "typewriter-effect";
import resumePDF from "../../assets/Resume.pdf";
import profileImg from "../../assets/profilepic2.webp";
import circleImg from "../../assets/Full Stack Developer2.png";
import { GitHub, LinkedIn, Instagram, Twitter, Facebook } from "../../data/data";
import portfolioData from "../../data/data.json";

const Hero = ({ darkMode }) => {
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
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-200 to-blue-200 dark:from-slate-950 dark:via-teal-950/20 dark:to-blue-950/30 relative overflow-hidden pt-24 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center z-10 pt-10 md:pt-0">
        {/* Left Column (Details & Typography) */}
        <motion.div
          className="md:col-span-7 flex flex-col justify-center gap-6 text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-5xl md:text-6xl font-black text-black dark:text-white leading-tight"
            variants={itemVariants}
          >
            Hello, I'm {portfolioData.name}
          </motion.h2>

          {/* Typewriter Effect */}
          <motion.div className="h-12" variants={itemVariants}>
            <Typewriter
              options={{
                strings: portfolioData.typewriterKeywords,
                autoStart: true,
                loop: true,
                wrapperClassName: "text-teal-600 dark:text-cyan-400 text-4xl font-extrabold sm:text-3xl",
                cursorClassName: "text-teal-600 dark:text-cyan-400 text-4xl font-extrabold sm:text-3xl",
              }}
            />
          </motion.div>

          <motion.p
            className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed"
            variants={itemVariants}
          >
            {portfolioData.summary}
          </motion.p>

          {/* Action Buttons */}
          <motion.div className="flex flex-wrap gap-4 mt-2" variants={itemVariants}>
            <a
              href="#contact"
              className="bg-black dark:bg-white text-white dark:text-black px-10 py-3 rounded-lg font-bold hover:bg-teal-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-black transition-all shadow-md text-center inline-block"
            >
              Hire Me
            </a>
            <a
              href={resumePDF}
              className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-black dark:border-gray-700 text-black dark:text-white px-8 py-3 rounded-lg font-bold hover:bg-teal-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-black transition-all shadow-sm"
              download
            >
              Resume <FiDownload className="text-lg" />
            </a>
          </motion.div>

          {/* Outline Circular Social Links */}
          <motion.div className="flex items-center gap-4 mt-4" variants={itemVariants}>
            <ul className="flex gap-4">
              <li>
                <a
                  href={GitHub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-black dark:border-gray-700 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white transition-all text-xl hover:scale-110"
                >
                  <AiFillGithub />
                </a>
              </li>
              <li>
                <a
                  href={LinkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-black dark:border-gray-700 flex items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-black dark:text-white transition-all text-xl hover:scale-110"
                >
                  <FaLinkedinIn />
                </a>
              </li>
              <li>
                <a
                  href={Instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-black dark:border-gray-700 flex items-center justify-center hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 text-black dark:text-white transition-all text-xl hover:scale-110"
                >
                  <AiFillInstagram />
                </a>
              </li>
              <li>
                <a
                  href={Facebook}
                  className="w-10 h-10 rounded-full border border-black dark:border-gray-700 flex items-center justify-center hover:bg-blue-800 hover:text-white dark:hover:bg-blue-800 text-black dark:text-white transition-all text-xl hover:scale-110"
                >
                  <FaFacebook />
                </a>
              </li>
              <li>
                <a
                  href={Twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-black dark:border-gray-700 flex items-center justify-center hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 text-black dark:text-white transition-all text-xl hover:scale-110"
                >
                  <AiFillTwitterCircle />
                </a>
              </li>
            </ul>
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
              className="h-[350px] md:h-[480px] w-auto object-contain select-none pointer-events-none z-10"
            />
            {/* Dark Mode Gradient overlay directly on top of the image to blend it */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent dark:from-slate-950 dark:via-slate-950/70 dark:to-transparent z-20 pointer-events-none"></div>

            {/* Rotating Badge */}
            <div className="absolute bottom-6 right-0 md:right-[-20px] z-20 cursor-pointer">
              <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
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

      {/* Down Bouncy Arrow */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 hidden md:block">
        <Link to="skills" smooth={true} duration={500} offset={-80}>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="cursor-pointer"
          >
            <FiArrowDown className="text-3xl text-teal-600 dark:text-cyan-400 hover:text-black dark:hover:text-white transition-colors" />
          </motion.div>
        </Link>
      </div>
    </section>
  );
};

export default Hero;