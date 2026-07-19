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

  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.mermaid) {
      setTimeout(() => {
        window.mermaid.init(undefined, document.querySelectorAll('.mermaid'));
      }, 100);
    }
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#14213D] text-slate-900 dark:text-slate-100 pt-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-6xl mb-6 block">🔍</span>
          <h2 className="text-3xl font-extrabold mb-4 text-[#14213D] dark:text-white">Project Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            The project you are looking for does not exist.
          </p>
          <RouterLink
            to="/#projects"
            className="px-6 py-3 bg-[#FCA311] hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg inline-flex items-center gap-2"
          >
            <FiArrowLeft /> Back to Projects
          </RouterLink>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#14213D] text-slate-900 dark:text-slate-100 pt-28 pb-20 px-6 transition-colors duration-300">
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
            className="inline-flex items-center gap-2 text-[#14213D] dark:text-[#FCA311] font-bold transition-colors hover:text-amber-500"
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
            className="h-64 md:h-96 rounded-2xl bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-8xl md:text-9xl shadow-2xl mb-12 overflow-hidden relative group cursor-pointer p-2"
            onClick={() => imageSrc && setIsModalOpen(true)}
          >
            {imageSrc ? (
              <img src={imageSrc} alt={project.title} className="w-full h-full object-contain z-10 transform group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <span className="z-10 filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500">{project.image}</span>
            )}
            <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors duration-300 z-20 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100">
              {imageSrc && <span className="bg-slate-950/80 text-white text-xs px-4 py-2 rounded-full backdrop-blur-md font-bold shadow-xl border border-white/20">Click to Enlarge</span>}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-[#14213D] dark:text-white">
            {project.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-12">
            {project.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1.5 bg-[#FCA311]/15 text-[#14213D] dark:text-[#FCA311] rounded-lg text-sm font-bold uppercase tracking-wide border border-[#FCA311]/30">
                {tag}
              </span>
            ))}
          </div>

          {/* Deep Dive Content */}
          <div className="space-y-16">
            
            {/* The Challenge */}
            <section>
              <h2 className="text-3xl font-extrabold mb-6 text-[#14213D] dark:text-white border-b pb-2 border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <span className="text-[#FCA311]">01.</span> The Challenge
              </h2>
              <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {project.challenge || project.description}
              </p>
            </section>

            {/* The Solution */}
            {project.solution && (
              <section>
                <h2 className="text-3xl font-extrabold mb-6 text-[#14213D] dark:text-white border-b pb-2 border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <span className="text-[#FCA311]">02.</span> The Solution
                </h2>
                <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {project.solution}
                </p>
              </section>
            )}

            {/* Architecture Diagram */}
            {project.architecture && (
              <section>
                <h2 className="text-3xl font-extrabold mb-6 text-[#14213D] dark:text-white border-b pb-2 border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <span className="text-[#FCA311]">03.</span> Architecture
                </h2>
                <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-inner flex justify-center">
                  <pre className="mermaid text-center w-full">
                    {project.architecture}
                  </pre>
                </div>
              </section>
            )}

            {/* Results & Impact */}
            {project.results && (
              <section>
                <h2 className="text-3xl font-extrabold mb-6 text-[#14213D] dark:text-white border-b pb-2 border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <span className="text-[#FCA311]">04.</span> Results & Impact
                </h2>
                <ul className="space-y-4">
                  {project.results.map((result, i) => (
                    <li key={i} className="flex items-start gap-4 text-lg md:text-xl text-slate-800 dark:text-slate-200 font-bold bg-[#FCA311]/10 p-4 rounded-xl border border-[#FCA311]/30">
                      <FiCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                      <span>{result}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Links / CTAs */}
            <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
              {project.github && project.github !== "#" && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#14213D] hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  <FiGithub /> View Source Code
                </a>
              )}
              {project.live && project.live !== "#" && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#FCA311] hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
                >
                  <FiExternalLink /> Live System Demo
                </a>
              )}
            </div>
          </div>
        </motion.article>
      </div>

      {/* Image Modal */}
      {isModalOpen && imageSrc && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white font-extrabold text-2xl"
            >
              ✕ Close
            </button>
            <img src={imageSrc} alt={project.title} className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
