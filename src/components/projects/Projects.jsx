import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiGithub, FiExternalLink, FiArrowRight } from "react-icons/fi";
import portfolioData from "../../data/data.json";

const Projects = ({ darkMode }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const projects = portfolioData.projects;

  return (
    <section id="projects" className="py-20 px-6 bg-white dark:bg-slate-950 dark:bg-gradient-to-br dark:from-slate-950 dark:via-teal-950/10 dark:to-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.h2 className="text-[36px] font-bold mb-12 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          Featured <span className="text-teal-600 dark:text-cyan-400">Projects</span>
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
        >
          {projects.map((project, idx) => (
            <motion.div
              key={idx}
              className="group flex flex-col h-full bg-gray-50/50 dark:bg-slate-900/60 dark:backdrop-blur-md rounded-lg overflow-hidden border border-gray-100 dark:border-teal-500/20 dark:hover:border-cyan-400/40 hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", stiffness: 50 } }
              }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div
                className={`h-48 bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center overflow-hidden relative ${project.imagePath ? 'cursor-pointer group/img' : ''}`}
                onClick={() => project.imagePath && setSelectedImage(new URL(`../../assets/projects/${project.imagePath}`, import.meta.url).href)}
              >
                {/* Client Project Badge */}
                <div className="absolute top-3 right-3 z-30 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[13px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Client Project
                </div>

                {project.imagePath && (
                  <>
                    <img src={new URL(`../../assets/projects/${project.imagePath}`, import.meta.url).href} alt={project.title} className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/10 transition-colors duration-300 z-20 pointer-events-none flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                      <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm font-bold shadow-lg">Enlarge</span>
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-[22px] font-bold mb-2 text-gray-900 dark:text-white">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-[16px] mb-4">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-teal-50 dark:bg-teal-950/20 text-teal-800 dark:text-teal-300 rounded text-[13px] font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4 mt-auto pt-2">
                  <Link to={`/project/${project.id}`} className="flex items-center gap-2 px-6 py-2 w-full justify-center bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-bold transition-all shadow-md hover:shadow-lg">
                    View Case Study <FiArrowRight />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-6xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-teal-400 text-4xl font-black p-2 drop-shadow-md z-[110]"
            >
              &times;
            </button>
            <div className="w-full h-[85vh] rounded-xl overflow-hidden shadow-2xl bg-black">
              <img src={selectedImage} alt="Project Preview" className="w-full h-full object-contain" />
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default Projects;