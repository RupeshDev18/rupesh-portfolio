import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiSearch, FiBookOpen, FiTerminal, FiDatabase, FiCpu, FiCode, FiArrowRight, FiCheckSquare, FiCloud } from "react-icons/fi";
import { cheatsheets } from "../data/cheatsheetsData";
import SEO from "../components/seo/SEO";

const Handbook = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Backend Development", "Frontend Development", "Testing & DevOps"];

  const filteredCheatsheets = cheatsheets.filter((sheet) => {
    const matchesSearch =
      sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sheet.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || sheet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (iconName) => {
    switch (iconName) {
      case "spring":
        return <FiCpu className="text-3xl text-emerald-500" />;
      case "react":
        return <FiCode className="text-3xl text-cyan-400" />;
      case "node":
        return <FiTerminal className="text-3xl text-green-500" />;
      case "python":
        return <FiDatabase className="text-3xl text-blue-500" />;
      case "playwright":
        return <FiCheckSquare className="text-3xl text-orange-500" />;
      case "aws":
        return <FiCloud className="text-3xl text-[#ff9900]" />;
      default:
        return <FiBookOpen className="text-3xl text-teal-500" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, type: "spring", stiffness: 50 },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 pt-28 pb-20 px-6">
      <SEO 
        title="Developer Handbooks & Cheatsheets" 
        description="Comprehensive developer handbooks and cheatsheets for interviews and daily reference. Covering Spring Boot, React, Node.js, and more."
      />
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Handbooks & Cheatsheets
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Compiled learning notes, architecture reference guides, and interview cheatsheets for modern frameworks.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FiSearch className="text-gray-450 dark:text-slate-500 text-lg" />
            </span>
            <input
              type="text"
              placeholder="Search handbooks (e.g. Spring, React)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-cyan-400/50 focus:border-teal-500 dark:focus:border-cyan-400 text-gray-900 dark:text-white transition-all shadow-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-teal-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md shadow-teal-500/10 dark:shadow-cyan-400/10 scale-105"
                    : "bg-gray-100 dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cheatsheet Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredCheatsheets.map((sheet) => {
            if (sheet.isComingSoon) {
              return (
                <motion.div
                  key={sheet.id}
                  variants={cardVariants}
                  className="p-8 bg-gray-50/30 dark:bg-slate-900/30 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-slate-800/40 relative flex flex-col h-full opacity-60 overflow-hidden select-none"
                >
                  <div className="absolute top-4 right-6 bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Coming Soon
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-center border border-gray-200/50 dark:border-slate-700/50">
                      {getIcon(sheet.icon)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-400 dark:text-slate-500">{sheet.title}</h3>
                      <span className="text-xs text-gray-400 dark:text-slate-650 font-semibold">{sheet.category}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 dark:text-slate-550 leading-relaxed font-medium flex-grow text-sm md:text-[15px]">
                    {sheet.description}
                  </p>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={sheet.id}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.015 }}
                className="group p-8 bg-white dark:bg-slate-900/60 dark:backdrop-blur-md rounded-2xl border border-gray-100 dark:border-teal-500/20 hover:border-teal-400 dark:hover:border-cyan-400/40 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col h-full transition-all duration-300 relative"
              >
                {/* Active Badge */}
                <div className="absolute top-4 right-6 bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-teal-100 dark:border-teal-900/50">
                  {sheet.yoe}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-teal-50 dark:bg-teal-950/40 rounded-xl flex items-center justify-center border border-teal-100 dark:border-teal-900/50 group-hover:scale-110 transition-transform duration-300">
                    {getIcon(sheet.icon)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-cyan-400 transition-colors">
                      {sheet.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                      {sheet.category}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-semibold flex-grow text-sm md:text-[15px] mb-8">
                  {sheet.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-slate-800/80">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">{sheet.readTime}</span>
                  <Link
                    to={`/handbook/${sheet.id}`}
                    className="inline-flex items-center gap-2 text-sm font-black text-teal-600 dark:text-cyan-400 group-hover:translate-x-1.5 transition-transform"
                  >
                    Open Handbook <FiArrowRight />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default Handbook;
