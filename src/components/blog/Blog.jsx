import React from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiClock, FiArrowRight, FiBookOpen, FiZap } from "react-icons/fi";
import { Link } from "react-router-dom";
import { blogPosts } from "../../data/blogData";

const Blog = () => {
  const featuredPost = blogPosts[0];
  const secondaryPosts = blogPosts.slice(1);

  return (
    <section id="blog" className="py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-50 via-indigo-50/10 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Background Radial Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-500/10 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <FiBookOpen className="w-3.5 h-3.5" /> Insights & Thought Leadership
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Latest <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 dark:from-indigo-400 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">Technical Writings</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Deep dives into modern frontend frameworks, cloud system architectures, database optimization, and software craftsmanship.
          </p>
        </motion.div>

        {/* 1. Featured Article Spotlight Card */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <div className="group relative bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 rounded-3xl p-6 sm:p-10 transition-all duration-300 shadow-xl hover:shadow-[0_0_35px_rgba(99,102,241,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                    <FiZap className="w-3.5 h-3.5 text-indigo-500" /> Featured Article
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    {featuredPost.category}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><FiCalendar className="text-indigo-500" /> {featuredPost.date}</span>
                  <span className="flex items-center gap-1.5"><FiClock className="text-indigo-500" /> {featuredPost.readTime}</span>
                </div>
              </div>

              <Link to={`/blog/${featuredPost.id}`}>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-snug">
                  {featuredPost.title}
                </h3>
              </Link>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    R
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rupesh Yadav</span>
                </div>

                <Link
                  to={`/blog/${featuredPost.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-md group/btn"
                >
                  Read Full Article <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Secondary Articles Grid */}
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
          {secondaryPosts.map((post) => (
            <motion.article
              key={post.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -6 }}
              className="group relative bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.12)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 rounded-md text-xs font-semibold border border-indigo-200 dark:border-indigo-500/20">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <FiClock className="text-indigo-500" /> {post.readTime}
                  </span>
                </div>

                <Link to={`/blog/${post.id}`}>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors mb-3 leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <FiCalendar className="text-indigo-500" /> {post.date}
                </span>

                <Link
                  to={`/blog/${post.id}`}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-sky-600 transition-colors"
                >
                  Read Post <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;