import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FiGithub, FiExternalLink, FiArrowRight, FiFolder, FiCheckCircle, FiZap, FiMaximize2, FiX } from "react-icons/fi";
import portfolioData from "../../data/data.json";

const Projects = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const projects = portfolioData.projects;

  const flagshipProject = projects.find(p => p.id === "cleardays") || projects[0];
  const secondaryProjects = projects.filter(p => p.id !== flagshipProject.id);

  const filteredProjects = secondaryProjects.filter(p => {
    if (activeCategory === "all") return true;
    if (activeCategory === "saas") return p.tags.some(t => t.toLowerCase().includes("tenant") || t.toLowerCase().includes("rbac") || t.toLowerCase().includes("postgresql"));
    if (activeCategory === "ai") return p.tags.some(t => t.toLowerCase().includes("ai") || t.toLowerCase().includes("scraping") || t.toLowerCase().includes("speech") || t.toLowerCase().includes("python"));
    if (activeCategory === "fullstack") return p.tags.some(t => t.toLowerCase().includes("react") || t.toLowerCase().includes("next.js") || t.toLowerCase().includes("node.js"));
    return true;
  });

  const getImagePath = (imagePath) => {
    try {
      return new URL(`../../assets/projects/${imagePath}`, import.meta.url).href;
    } catch {
      return null;
    }
  };

  return (
    <section id="projects" className="py-24 px-4 sm:px-6 bg-[#E5E5E5]/40 dark:bg-[#14213D] text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#FCA311]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14213D]/10 dark:bg-[#FCA311]/10 border border-[#14213D]/20 dark:border-[#FCA311]/30 text-[#14213D] dark:text-[#FCA311] text-xs font-bold uppercase tracking-wider mb-4">
            <FiFolder className="w-3.5 h-3.5" /> Engineering Portfolio
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#14213D] dark:text-white mb-4">
            Featured <span className="text-[#FCA311]">Showcase</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Full-stack platforms, multi-tenant SaaS architectures, distributed scrapers, and AI systems built for production scale.
          </p>
        </motion.div>

        {/* 1. Flagship Spotlight Hero Card (SiloamHR) */}
        {flagshipProject && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="group relative bg-white dark:bg-slate-900 border-t-4 border-t-[#FCA311] border-x border-b border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 transition-all duration-300 shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Spotlight Details */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div>
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCA311]/15 border border-[#FCA311]/30 text-[#14213D] dark:text-[#FCA311] text-xs font-bold uppercase tracking-wider">
                        <FiZap className="w-3.5 h-3.5 text-[#FCA311]" /> Flagship Spotlight
                      </span>
                      {flagshipProject.isClient && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Enterprise Client Solution
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 group-hover:text-[#FCA311] transition-colors">
                      {flagshipProject.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                      {flagshipProject.description}
                    </p>

                    {/* Impact Benchmarks */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                      <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-lg font-bold text-[#14213D] dark:text-[#FCA311]">200+</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Multi-Tenant Orgs</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-lg font-bold text-[#14213D] dark:text-[#FCA311]">&lt;100ms</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">P99 RBAC Latency</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Row Security</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">PostgreSQL RLS</div>
                      </div>
                    </div>

                    {/* Tech Pills */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {flagshipProject.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-[#FCA311]/15 text-[#14213D] dark:text-[#FCA311] border border-[#FCA311]/30 text-[11px] font-bold uppercase tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      to={`/project/${flagshipProject.id}`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FCA311] hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 group/btn"
                    >
                      View Full Case Study <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>

                    {flagshipProject.live && flagshipProject.live !== "#" && (
                      <a
                        href={flagshipProject.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors"
                      >
                        Live System <FiExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Screenshot Preview */}
                <div className="lg:col-span-5">
                  <div
                    className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 group/img cursor-pointer shadow-lg p-1"
                    onClick={() => flagshipProject.imagePath && setSelectedImage(getImagePath(flagshipProject.imagePath))}
                  >
                    {flagshipProject.imagePath ? (
                      <>
                        <img
                          src={getImagePath(flagshipProject.imagePath)}
                          alt={flagshipProject.title}
                          className="w-full h-64 sm:h-80 object-contain rounded-xl group-hover/img:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-950/30 group-hover/img:bg-slate-950/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover/img:opacity-100 rounded-xl">
                          <span className="inline-flex items-center gap-2 bg-slate-950/80 text-white text-xs px-4 py-2 rounded-full backdrop-blur-md font-bold shadow-xl border border-white/20">
                            <FiMaximize2 className="w-3.5 h-3.5" /> Enlarge Screenshot
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-64 bg-[#14213D] flex items-center justify-center text-white font-bold">
                        {flagshipProject.title}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Secondary Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiCheckCircle className="text-[#FCA311]" /> Additional Engineering Solutions
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: "all", label: "All Projects" },
              { id: "saas", label: "Enterprise SaaS" },
              { id: "ai", label: "AI & Scraping" },
              { id: "fullstack", label: "Fullstack" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-[#14213D] dark:bg-[#FCA311] text-[#FCA311] dark:text-[#14213D] shadow-md"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Secondary Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -8 }}
                className="group flex flex-col h-full bg-white dark:bg-slate-900 border-t-4 border-t-[#14213D] dark:border-t-[#FCA311] border-x border-b border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Screenshot Header */}
                <div
                  className={`h-48 bg-slate-950 p-1 overflow-hidden relative ${project.imagePath ? 'cursor-pointer group/img' : ''}`}
                  onClick={() => project.imagePath && setSelectedImage(getImagePath(project.imagePath))}
                >
                  {project.isClient && (
                    <div className="absolute top-3 right-3 z-30 bg-slate-950/70 backdrop-blur-md border border-slate-800 text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Client Work
                    </div>
                  )}

                  {project.imagePath ? (
                    <>
                      <img
                        src={getImagePath(project.imagePath)}
                        alt={project.title}
                        className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-950/30 group-hover/img:bg-slate-950/10 transition-colors duration-300 z-20 pointer-events-none flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                        <span className="bg-slate-950/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-bold shadow-lg flex items-center gap-1 border border-white/20">
                          <FiMaximize2 className="w-3 h-3" /> Enlarge
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-[#14213D] flex items-center justify-center text-white font-bold p-4 text-center">
                      {project.title}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-[#FCA311] transition-colors leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>

                    {/* Tech Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-[#FCA311]/15 text-[#14213D] dark:text-[#FCA311] rounded text-[11px] font-semibold border border-[#FCA311]/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 mt-auto">
                    <Link
                      to={`/project/${project.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FCA311] hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                    >
                      Case Study <FiArrowRight />
                    </Link>

                    {project.github && project.github !== "#" && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        title="GitHub Repository"
                      >
                        <FiGithub className="w-4 h-4" />
                      </a>
                    )}

                    {project.live && project.live !== "#" && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        title="Live Demo"
                      >
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Screenshot Enlarge Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl z-50 transition-colors shadow-lg"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="w-full h-[80vh] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2">
                <img src={selectedImage} alt="Project Screenshot" className="max-w-full max-h-full object-contain" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;