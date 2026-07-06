import React, { useState, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar/NavBar";
import Footer from "./components/footer/Footer";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load page components
const Home = lazy(() => import("./pages/Home"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Handbook = lazy(() => import("./pages/Handbook"));
const HandbookDetail = lazy(() => import("./pages/HandbookDetail"));

const LoadingSpinner = () => (
  <motion.div
    key="loading"
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
);

const App = () => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-50 min-h-screen transition-colors duration-300 flex flex-col justify-between"
      >
        <NavBar />
        <div className="flex-grow">
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/handbook" element={<Handbook />} />
                <Route path="/handbook/:id" element={<HandbookDetail />} />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </div>
        <Footer />
      </motion.div>
    </AnimatePresence>
  );
};

export default App;