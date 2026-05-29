import React, { useState, useEffect } from "react";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BlogPost from "./pages/BlogPost";
import NavBar from "./components/navbar/NavBar";
import Footer from "./components/footer/Footer";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-slate-950">
          <motion.div
            className="flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-teal-500 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        </div>
      }
    >
      {loading ? (
        <motion.div
          className="h-screen w-full flex items-center justify-center bg-white dark:bg-slate-950"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-teal-500 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      ) : (
        <div className="bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-50 min-h-screen transition-colors duration-300 flex flex-col justify-between">
          <NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home darkMode={darkMode} />} />
              <Route path="/blog/:id" element={<BlogPost darkMode={darkMode} />} />
            </Routes>
          </div>
          <Footer darkMode={darkMode} />
        </div>
      )}
    </Suspense>
  );
};

export default App;