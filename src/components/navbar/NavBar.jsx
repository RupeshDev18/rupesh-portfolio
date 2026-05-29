import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiMenu, FiX, FiMoon, FiSun } from "react-icons/fi";
import { Link } from "react-scroll";
import { useLocation, Link as RouterLink } from "react-router-dom";

const NavBar = ({ darkMode, toggleDarkMode }) => {
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
    { name: "Skills", to: "skills" },
    { name: "Experience", to: "experience" },
    { name: "Projects", to: "projects" },
    { name: "Blog", to: "blog" },
    { name: "Contact", to: "contact" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollPosition > 0
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-md py-4 border-b border-gray-150 dark:border-slate-900"
          : "bg-transparent py-6"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <RouterLink to="/">
          <motion.div
            className="text-3xl font-extrabold text-black dark:text-white cursor-pointer select-none"
            whileHover={{ scale: 1.05 }}
          >
            Rupesh
          </motion.div>
        </RouterLink>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const linkName = link.name.toUpperCase();
            return isHome ? (
              <Link
                key={link.to}
                to={link.to}
                smooth={true}
                duration={500}
                offset={-80}
                className="cursor-pointer text-black dark:text-white hover:text-teal-600 dark:hover:text-cyan-400 font-extrabold text-sm tracking-wider transition-colors duration-300"
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

      {isOpen && (
        <motion.div
          className="md:hidden bg-gray-50/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-200 dark:border-slate-850"
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
                  smooth={true}
                  duration={500}
                  offset={-80}
                  className="cursor-pointer text-black dark:text-white hover:text-teal-600 dark:hover:text-cyan-400 font-extrabold text-sm tracking-wider transition-colors duration-300"
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
    </motion.nav>
  );
};

export default NavBar;