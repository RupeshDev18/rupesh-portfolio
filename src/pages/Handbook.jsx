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
        return <FiCode className="text-3xl text-[#38bdf8]" />;
      case "node":
        return <FiTerminal className="text-3xl text-green-500" />;
      case "python":
        return <FiDatabase className="text-3xl text-blue-500" />;
      case "postgres":
        return <FiDatabase className="text-3xl text-[#4169e1]" />;
      case "playwright":
        return <FiCheckSquare className="text-3xl text-orange-500" />;
      case "aws":
        return <FiCloud className="text-3xl text-[#FCA311]" />;
      default:
        return <FiBookOpen className="text-3xl text-[#FCA311]" />;
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#14213D] text-slate-900 dark:text-slate-100 pt-28 pb-20 px-6 transition-colors duration-300">
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCA311]/15 text-[#14213D] dark:text-[#FCA311] border border-[#FCA311]/30 text-xs font-bold uppercase tracking-wider mb-4">
            Knowledge Repository
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-[#14213D] dark:text-white">
            Handbooks & <span className="text-[#FCA311]">Cheatsheets</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Compiled learning notes, architecture reference guides, and interview cheatsheets for modern software engineering stacks.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FiSearch className="text-slate-400 dark:text-slate-500 text-lg" />
            </span>
            <input
              type="text"
              placeholder="Search handbooks (e.g. Spring, React)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FCA311] text-slate-900 dark:text-white transition-all shadow-xs"
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
                    ? "bg-[#14213D] dark:bg-[#FCA311] text-[#FCA311] dark:text-[#14213D] shadow-md scale-105"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
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
                  className="p-8 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 relative flex flex-col h-full opacity-60 overflow-hidden select-none"
                >
                  <div className="absolute top-4 right-6 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Coming Soon
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {getIcon(sheet.icon)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500">{sheet.title}</h3>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{sheet.category}</span>
                    </div>
                  </div>
                  <p className="text-slate-400 dark:text-slate-500 leading-relaxed font-medium flex-grow text-sm md:text-[15px]">
                    {sheet.description}
                  </p>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={sheet.id}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                className="group p-8 bg-white dark:bg-slate-900 border-t-4 border-t-[#14213D] dark:border-t-[#FCA311] border-x border-b border-slate-200 dark:border-slate-800 rounded-2xl relative flex flex-col h-full transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-xs">
                    {getIcon(sheet.icon)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#FCA311] transition-colors">
                      {sheet.title}
                    </h3>
                    <span className="text-xs text-[#14213D] dark:text-[#FCA311] font-bold">{sheet.category}</span>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-8 flex-grow text-sm md:text-[15px]">
                  {sheet.description}
                </p>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {sheet.sections ? `${sheet.sections.length} Topic Sections` : "Comprehensive Guide"}
                  </span>

                  <Link
                    to={`/handbook/${sheet.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FCA311] hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md group/btn"
                  >
                    Open Handbook <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
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
