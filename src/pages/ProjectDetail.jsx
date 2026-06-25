import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiGithub, FiExternalLink, FiCheckCircle } from "react-icons/fi";
import portfolioData from "../data/data.json";
import SEO from "../components/seo/SEO";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const project = portfolioData.projects.find((p) => p.id === id);
  const imageSrc = project?.imagePath ? new URL(`../assets/projects/${project.imagePath}`, import.meta.url).href : null;

  // Scroll to top and re-render mermaid diagram
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.mermaid) {
      // Small timeout to ensure DOM is ready for mermaid
      setTimeout(() => {
        window.mermaid.init(undefined, document.querySelectorAll('.mermaid'));
      }, 100);
    }
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 pt-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-6xl mb-6 block">🔍</span>
          <h2 className="text-3xl font-extrabold mb-4">Project Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The project you are looking for does not exist.
          </p>
          <RouterLink
            to="/#projects"
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg inline-flex items-center gap-2"
          >
            <FiArrowLeft /> Back to Projects
          </RouterLink>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 pt-28 pb-20 px-6">
      <SEO 
        title={project.title} 
        description={project.description || project.challenge}
      />
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <RouterLink
            to="/#projects"
            className="inline-flex items-center gap-2 text-teal-600 dark:text-cyan-400 font-bold transition-colors hover:text-blue-500"
          >
            <FiArrowLeft /> Back to Projects
          </RouterLink>
        </motion.div>

        {/* Project Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div 
            className="h-64 md:h-96 rounded-2xl bg-gradient-to-br from-teal-500 via-blue-500 to-purple-600 flex items-center justify-center text-8xl md:text-9xl shadow-2xl mb-12 overflow-hidden relative group cursor-pointer"
            onClick={() => imageSrc && setIsModalOpen(true)}
          >
            {imageSrc ? (
              <img src={imageSrc} alt={project.title} className="w-full h-full object-cover object-top z-10 transform group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <span className="z-10 filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500">{project.image}</span>
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 z-20 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100">
              {imageSrc && <span className="bg-black/50 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm font-bold shadow-lg">Click to Enlarge</span>}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900 dark:text-white">
            {project.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-12">
            {project.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 rounded text-sm font-bold uppercase tracking-wide border border-teal-200 dark:border-teal-500/30">
                {tag}
              </span>
            ))}
          </div>

          {/* Deep Dive Content */}
          <div className="space-y-16">
            
            {/* The Challenge */}
            <section>
              <h2 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-slate-800 flex items-center gap-3">
                <span className="text-teal-500">01.</span> The Challenge
              </h2>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {project.challenge || project.description}
              </p>
            </section>

            {/* The Solution */}
            {project.solution && (
              <section>
                <h2 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-slate-800 flex items-center gap-3">
                  <span className="text-teal-500">02.</span> The Solution
                </h2>
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  {project.solution}
                </p>
              </section>
            )}

            {/* Architecture Diagram */}
            {project.architecture && (
              <section>
                <h2 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-slate-800 flex items-center gap-3">
                  <span className="text-teal-500">03.</span> Architecture
                </h2>
                <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-inner flex justify-center">
                  <pre className="mermaid text-center w-full">
                    {project.architecture}
                  </pre>
                </div>
              </section>
            )}

            {/* Results & Impact */}
            {project.results && (
              <section>
                <h2 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-slate-800 flex items-center gap-3">
                  <span className="text-teal-500">04.</span> Results & Impact
                </h2>
                <ul className="space-y-4">
                  {project.results.map((result, i) => (
                    <li key={i} className="flex items-start gap-4 text-lg md:text-xl text-gray-700 dark:text-gray-300 font-bold bg-teal-50/50 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-100 dark:border-teal-500/20">
                      <FiCheckCircle className="text-teal-500 text-2xl flex-shrink-0 mt-1" />
                      {result}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
          </div>
        </motion.article>
      </div>

      {/* Image Modal */}
      {isModalOpen && imageSrc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
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
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-teal-400 text-4xl font-black p-2 drop-shadow-md z-[60]"
            >
              &times;
            </button>
            <div className="w-full h-[85vh] rounded-xl overflow-hidden shadow-2xl bg-black">
              <img src={imageSrc} alt={project.title} className="w-full h-full object-contain" />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
