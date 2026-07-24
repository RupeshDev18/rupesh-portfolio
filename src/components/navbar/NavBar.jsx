import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiMoon, FiSun } from "react-icons/fi";
import { Link } from "react-scroll";
import { useLocation, Link as RouterLink } from "react-router-dom";
import portfolioData from "../../data/data.json";
import { useTheme } from "../../context/ThemeContext";

const NavBar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Skills", to: "skills" },
    { name: "Experience", to: "experience" },
    { name: "Projects", to: "projects" },
    { name: "Blog", to: "blog" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollPosition > 0
          ? "bg-white/90 dark:bg-[#14213D]/90 backdrop-blur-lg shadow-sm py-4 border-b border-slate-200 dark:border-slate-800"
          : "bg-transparent py-6"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <RouterLink 
          to="/"
          onClick={() => {
            if (isHome) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <motion.div
            className="text-3xl font-extrabold text-[#14213D] dark:text-white cursor-pointer select-none tracking-tight"
            whileHover={{ scale: 1.05 }}
          >
            {portfolioData.name.split(' ')[0]}
          </motion.div>
        </RouterLink>

        <div className="hidden md:flex items-center space-x-8 ml-auto mr-8">
          {navLinks.map((link) => {
            const linkName = link.name.toUpperCase();
            return isHome ? (
              <Link
                key={link.to}
                to={link.to}
                spy={true}
                activeClass="text-[#14213D] dark:text-[#FCA311] border-b-2 border-[#14213D] dark:border-[#FCA311]"
                smooth={true}
                duration={500}
                offset={-80}
                className="cursor-pointer text-slate-600 dark:text-slate-300 hover:text-[#FCA311] font-bold text-sm tracking-wider transition-all duration-300 pb-1"
              >
                {linkName}
              </Link>
            ) : (
              <RouterLink
                key={link.to}
                to={`/#${link.to}`}
                className="cursor-pointer text-slate-900 dark:text-white hover:text-[#FCA311] font-extrabold text-sm tracking-wider transition-colors duration-300"
              >
                {linkName}
              </RouterLink>
            );
          })}
          <RouterLink
            to="/handbook"
            className={`cursor-pointer font-bold text-sm tracking-wider transition-all duration-300 pb-1 ${
              location.pathname.startsWith("/handbook")
                ? "text-[#14213D] dark:text-[#FCA311] border-b-2 border-[#14213D] dark:border-[#FCA311]"
                : "text-slate-600 dark:text-slate-300 hover:text-[#FCA311]"
            }`}
          >
            HANDBOOK
          </RouterLink>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {darkMode ? (
              <FiSun className="text-[#FCA311] text-lg" />
            ) : (
              <FiMoon className="text-[#14213D] text-lg" />
            )}
          </motion.button>

          {/* HIRE ME CTA */}
          <div className="hidden sm:block">
            {isHome ? (
              <Link
                to="contact"
                smooth={true}
                duration={500}
                offset={-80}
                className="cursor-pointer bg-[#FCA311] hover:bg-amber-400 text-slate-950 transition-colors px-6 py-2 rounded-xl font-bold text-sm tracking-wider uppercase inline-block shadow-md shadow-amber-500/20"
              >
                HIRE ME
              </Link>
            ) : (
              <RouterLink
                to="/#contact"
                className="cursor-pointer bg-[#FCA311] hover:bg-amber-400 text-slate-950 transition-colors px-6 py-2 rounded-xl font-bold text-sm tracking-wider uppercase inline-block shadow-md shadow-amber-500/20"
              >
                HIRE ME
              </RouterLink>
            )}
          </div>

          <button className="md:hidden text-slate-900 dark:text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-white/95 dark:bg-[#14213D]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-6 py-4 flex flex-col space-y-4">
              {navLinks.map((link) => {
                const linkName = link.name.toUpperCase();
                return isHome ? (
                  <Link
                    key={link.to}
                    to={link.to}
                    spy={true}
                    activeClass="text-[#FCA311] pl-4 border-l-4 border-[#FCA311]"
                    smooth={true}
                    duration={500}
                    offset={-80}
                    className="cursor-pointer text-slate-600 dark:text-slate-300 hover:text-[#FCA311] font-bold text-sm tracking-wider transition-all duration-300 py-1"
                    onClick={() => setIsOpen(false)}
                  >
                    {linkName}
                  </Link>
                ) : (
                  <RouterLink
                    key={link.to}
                    to={`/#${link.to}`}
                    className="cursor-pointer text-slate-900 dark:text-white hover:text-[#FCA311] font-extrabold text-sm tracking-wider transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    {linkName}
                  </RouterLink>
                );
              })}
              <RouterLink
                to="/handbook"
                className={`cursor-pointer font-extrabold text-sm tracking-wider transition-colors duration-300 py-1 ${
                  location.pathname.startsWith("/handbook")
                    ? "text-[#FCA311] pl-4 border-l-4 border-[#FCA311]"
                    : "text-slate-900 dark:text-white hover:text-[#FCA311]"
                }`}
                onClick={() => setIsOpen(false)}
              >
                HANDBOOK
              </RouterLink>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                {isHome ? (
                  <Link
                    to="contact"
                    smooth={true}
                    duration={500}
                    offset={-80}
                    className="cursor-pointer bg-[#FCA311] hover:bg-amber-400 text-slate-950 transition-colors px-6 py-2 rounded-xl font-bold text-sm tracking-wider uppercase text-center block w-full shadow-md"
                    onClick={() => setIsOpen(false)}
                  >
                    HIRE ME
                  </Link>
                ) : (
                  <RouterLink
                    to="/#contact"
                    className="cursor-pointer bg-[#FCA311] hover:bg-amber-400 text-slate-950 transition-colors px-6 py-2 rounded-xl font-bold text-sm tracking-wider uppercase text-center block w-full shadow-md"
                    onClick={() => setIsOpen(false)}
                  >
                    HIRE ME
                  </RouterLink>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;