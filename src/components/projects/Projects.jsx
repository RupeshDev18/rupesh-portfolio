import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiGithub, FiExternalLink, FiArrowRight } from "react-icons/fi";
import portfolioData from "../../data/data.json";

const Projects = ({ darkMode }) => {
  const projects = portfolioData.projects;

  return (
    <section id="projects" className="py-20 px-6 bg-white dark:bg-slate-950 dark:bg-gradient-to-br dark:from-slate-950 dark:via-teal-950/10 dark:to-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.h2 className="text-4xl md:text-5xl font-bold mb-12 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          Featured <span className="text-teal-600 dark:text-cyan-400">Projects</span>
        </motion.h2>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {projects.map((project, idx) => (
            <motion.div key={idx} className="group bg-gray-50/50 dark:bg-slate-900/60 dark:backdrop-blur-md rounded-lg overflow-hidden border border-gray-100 dark:border-teal-500/20 dark:hover:border-cyan-400/40 hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300" whileHover={{ y: -10 }}>
              <div className="h-48 bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-6xl">
                {project.image}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-teal-50 dark:bg-teal-950/20 text-teal-800 dark:text-teal-300 rounded text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  {project.challenge ? (
                    <Link to={`/project/${project.id}`} className="flex items-center gap-2 px-6 py-2 w-full justify-center bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-bold transition-all shadow-md hover:shadow-lg">
                      View Case Study <FiArrowRight />
                    </Link>
                  ) : (
                    <>
                      {project.github !== "#" && (
                        <motion.a href={project.github} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-800 rounded hover:bg-teal-500 hover:text-white dark:hover:bg-teal-500 text-sm font-semibold transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <FiGithub /> Code
                        </motion.a>
                      )}
                      {project.live !== "#" && (
                        <motion.a href={project.live} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-semibold transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <FiExternalLink /> Live
                        </motion.a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;