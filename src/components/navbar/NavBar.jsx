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
    { name: "Home", to: "home" },
    { name: "About", to: "about" },
    { name: "Experience", to: "experience" },
    { name: "Projects", to: "projects" },
    { name: "Skills", to: "skills" },
    { name: "Blog", to: "blog" },
    { name: "Contact", to: "contact" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollPosition > 0
          ? "bg-white/70 dark:bg-slate-950/70 backdrop-blur-lg shadow-sm py-4 border-b border-gray-100 dark:border-slate-800"
          : "bg-transparent py-6"
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <RouterLink to="/">
          <motion.div
            className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 cursor-pointer select-none"
            whileHover={{ scale: 1.05 }}
          >
            {portfolioData.name.split(' ')[0]}
          </motion.div>
        </RouterLink>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const linkName = link.name.toUpperCase();
            return isHome ? (
              <Link
                key={link.to}
                to={link.to}
                spy={true}
                activeClass="text-teal-600 dark:text-cyan-400 border-b-2 border-teal-600 dark:border-cyan-400"
                smooth={true}
                duration={500}
                offset={-80}
                className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-cyan-400 font-bold text-sm tracking-wider transition-all duration-300 pb-1"
              >
                {linkName}
              </Link>
            ) : (
              <RouterLink
                key={link.to}
                to={`/#${link.to}`}
                className="cursor-pointer text-black dark:text-white hover:text-teal-600 dark:hover:text-cyan-400 font-extrabold text-sm tracking-wider transition-colors duration-300"
              >
                {linkName}
              </RouterLink>
            );
          })}
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {darkMode ? (
              <FiSun className="text-teal-500 text-lg" />
            ) : (
              <FiMoon className="text-gray-800 text-lg" />
            )}
          </motion.button>

          {/* Solid HIRE ME CTA */}
          <div className="hidden sm:block">
            {isHome ? (
              <Link
                to="contact"
                smooth={true}
                duration={500}
                offset={-80}
                className="cursor-pointer bg-black dark:bg-white text-white dark:text-black hover:bg-teal-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-black transition-colors px-6 py-2 rounded-lg font-bold text-sm tracking-wider uppercase inline-block"
              >
                HIRE ME
              </Link>
            ) : (
              <RouterLink
                to="/#contact"
                className="cursor-pointer bg-black dark:bg-white text-white dark:text-black hover:bg-teal-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-black transition-colors px-6 py-2 rounded-lg font-bold text-sm tracking-wider uppercase inline-block"
              >
                HIRE ME
              </RouterLink>
            )}
          </div>

          <button className="md:hidden text-black dark:text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-gray-50/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-200 dark:border-slate-800"
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
                    activeClass="text-teal-600 dark:text-cyan-400 pl-4 border-l-4 border-teal-600 dark:border-cyan-400"
                    smooth={true}
                    duration={500}
                    offset={-80}
                    className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-cyan-400 font-bold text-sm tracking-wider transition-all duration-300 py-1"
                    onClick={() => setIsOpen(false)}
                  >
                    {linkName}
                  </Link>
                ) : (
                  <RouterLink
                    key={link.to}
                    to={`/#${link.to}`}
                    className="cursor-pointer text-black dark:text-white hover:text-teal-600 dark:hover:text-cyan-400 font-extrabold text-sm tracking-wider transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    {linkName}
                  </RouterLink>
                );
              })}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                {isHome ? (
                  <Link
                    to="contact"
                    smooth={true}
                    duration={500}
                    offset={-80}
                    className="cursor-pointer bg-black dark:bg-white text-white dark:text-black hover:bg-teal-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-black transition-colors px-6 py-2 rounded-lg font-bold text-sm tracking-wider uppercase text-center block w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    HIRE ME
                  </Link>
                ) : (
                  <RouterLink
                    to="/#contact"
                    className="cursor-pointer bg-black dark:bg-white text-white dark:text-black hover:bg-teal-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-black transition-colors px-6 py-2 rounded-lg font-bold text-sm tracking-wider uppercase text-center block w-full"
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